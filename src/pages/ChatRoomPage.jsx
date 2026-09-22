import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import MessageBubble from '../components/MessageBubble'

export default function ChatRoomPage() {
  const { chatId } = useParams()
  const { currentUser } = useAuth()
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  // 채팅방 메타데이터(참여자 정보, 읽음 상태) 구독
  useEffect(() => {
    const chatRef = doc(db, 'chats', chatId)
    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        setChat({ id: snapshot.id, ...snapshot.data() })
      }
    })
    return unsubscribe
  }, [chatId])

  // 메시지 목록 실시간 구독
  useEffect(() => {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return unsubscribe
  }, [chatId])

  // 새 메시지가 오면 맨 아래로 스크롤 + 내가 읽음 처리
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    markAsRead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

  async function markAsRead() {
    if (!currentUser) return
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        [`lastRead.${currentUser.uid}`]: serverTimestamp(),
      })
    } catch (err) {
      console.error('읽음 처리 실패:', err)
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    setText('')

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: currentUser.uid,
      text: trimmed,
      createdAt: serverTimestamp(),
    })

    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: trimmed,
      lastMessageAt: serverTimestamp(),
      lastSenderId: currentUser.uid,
      [`lastRead.${currentUser.uid}`]: serverTimestamp(),
    })
  }

  if (!chat) {
    return <div className="center-message">불러오는 중...</div>
  }

  const otherUid = chat.participants.find((uid) => uid !== currentUser.uid)
  const otherName = chat.participantInfo?.[otherUid]?.nickname || '알 수 없음'
  const otherLastRead = chat.lastRead?.[otherUid]

  return (
    <div className="page chat-room">
      <header className="page-header">
        <Link to="/chats" className="icon-button" title="뒤로">
          ←
        </Link>
        <h1>{otherName}</h1>
        <span style={{ width: 32 }} />
      </header>

      <div className="message-list">
        {messages.map((message) => {
          const isMine = message.senderId === currentUser.uid
          const isRead =
            !!otherLastRead &&
            !!message.createdAt &&
            otherLastRead.toMillis() >= message.createdAt.toMillis()
          return (
            <MessageBubble key={message.id} message={message} isMine={isMine} isRead={isRead} />
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form className="message-input-bar" onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button type="submit" disabled={!text.trim()}>
          전송
        </button>
      </form>
    </div>
  )
}
