import { Link } from 'react-router-dom'
import { formatTimeShort } from '../utils/time'

// 채팅방 하나를 나타내는 목록 아이템. 상대방 닉네임, 마지막 메시지, 시간, 안읽음 표시를 보여준다.
export default function ChatListItem({ chat, myUid }) {
  const otherUid = chat.participants.find((uid) => uid !== myUid)
  const otherName = chat.participantInfo?.[otherUid]?.nickname || '알 수 없음'

  const myLastRead = chat.lastRead?.[myUid]
  const hasUnread =
    chat.lastSenderId &&
    chat.lastSenderId !== myUid &&
    (!myLastRead || (chat.lastMessageAt && chat.lastMessageAt.toMillis() > myLastRead.toMillis()))

  return (
    <Link to={`/chats/${chat.id}`} className="chat-list-item">
      <div className="avatar">{otherName.charAt(0)}</div>
      <div className="chat-list-item-body">
        <div className="chat-list-item-top">
          <span className="chat-name">{otherName}</span>
          <span className="chat-time">{formatTimeShort(chat.lastMessageAt)}</span>
        </div>
        <div className="chat-list-item-bottom">
          <span className="chat-preview">{chat.lastMessage || '대화를 시작해보세요'}</span>
          {hasUnread && <span className="unread-badge">1</span>}
        </div>
      </div>
    </Link>
  )
}
