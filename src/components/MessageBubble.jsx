import { formatTimeFull } from '../utils/time'

export default function MessageBubble({ message, isMine, unreadCount, senderName }) {
  return (
    <div className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
      {isMine && (
        <div className="message-meta">
          {unreadCount > 0 && <span className="unread-mark">{unreadCount}</span>}
          <span className="message-time">{formatTimeFull(message.createdAt)}</span>
        </div>
      )}
      <div>
        {senderName && <p className="sender-name">{senderName}</p>}
        <div className="message-bubble">{message.text}</div>
      </div>
      {!isMine && (
        <div className="message-meta">
          <span className="message-time">{formatTimeFull(message.createdAt)}</span>
        </div>
      )}
    </div>
  )
}
