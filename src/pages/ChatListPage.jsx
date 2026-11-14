import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import ChatListItem from '../components/ChatListItem'

// 내가 보낸 게 아닌 새 메시지가 왔고, 탭이 백그라운드일 때만 브라우저 알림을 띄운다.
function notifyIfNeeded(chat, myUid) {
  if (!chat.lastSenderId || chat.lastSenderId === myUid) return
  if (Notification.permission !== 'granted') return
  if (!document.hidden) return

  const senderName = chat.participantInfo?.[chat.lastSenderId]?.nickname || 'Talkie'
  const title = chat.participants.length > 2 ? chat.groupName || senderName : senderName
  new Notification(title, { body: chat.lastMessage })
}

export default function ChatListPage() {
  const { currentUser, logout } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [indexError, setIndexError] = useState(null)
  const isFirstSnapshot = useRef(true)

  // 브라우저 알림 권한 요청 (탭이 켜져 있을 때만 동작하는 알림이라 서비스워커/서버 불필요)
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    // 내가 참여 중인 채팅방만, 최근 대화순으로 실시간 구독
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // 처음 구독 시작할 때는 기존 채팅방이 전부 "변경"으로 잡혀서 알림이 쏟아지므로 건너뜀
        if (!isFirstSnapshot.current) {
          snapshot.docChanges().forEach((change) => {
            const chat = { id: change.doc.id, ...change.doc.data() }
            notifyIfNeeded(chat, currentUser.uid)
          })
        }
        isFirstSnapshot.current = false
        setChats(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        setLoading(false)
      },
      (err) => {
        // [트러블슈팅 포인트] where + orderBy를 같이 쓰면 Firestore가 복합 색인(index)을
        // 요구할 때가 있다. 콘솔에 뜨는 에러 메시지 속 링크로 들어가면 자동으로
        // 색인을 만들 수 있다. 처음 겪으면 당황하기 쉬운 트러블슈팅 단골 소재라
        // 여기서는 에러를 숨기지 않고 화면에 그대로 보여주도록 했다.
        console.error(err)
        setIndexError(err.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [currentUser.uid])

  return (
    <div className="page">
      <header className="page-header">
        <h1>Talkie</h1>
        <div className="header-actions">
          <Link to="/new" className="icon-button" title="새 대화">
            ＋
          </Link>
          <button className="icon-button" onClick={logout} title="로그아웃">
            ⎋
          </button>
        </div>
      </header>

      {indexError && (
        <div className="banner-error">
          <p>Firestore 색인이 아직 없어서 목록을 불러오지 못했어요.</p>
          <p className="banner-error-detail">{indexError}</p>
          <p>
            위 에러 메시지 안에 있는 <b>https://console.firebase.google.com/...</b> 링크를 눌러서
            색인을 생성하면 1~2분 뒤 정상 동작해요. (이 과정을 트러블슈팅 기록으로 남기기 좋아요!)
          </p>
        </div>
      )}

      {loading && !indexError && <div className="center-message">불러오는 중...</div>}

      {!loading && !indexError && chats.length === 0 && (
        <div className="center-message">
          아직 대화가 없어요.
          <br />
          <Link to="/new">＋ 새 대화 시작하기</Link>
        </div>
      )}

      <ul className="chat-list">
        {chats.map((chat) => (
          <li key={chat.id}>
            <ChatListItem chat={chat} myUid={currentUser.uid} />
          </li>
        ))}
      </ul>
    </div>
  )
}
