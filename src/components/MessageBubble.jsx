import { formatTimeFull } from '../utils/time'

export default function MessageBubble({ message, isMine, isRead }) {
  return (
    <div className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
      {isMine && (
        <div className="message-meta">
          {!isRead && <span className="unread-mark">1</span>}
          <span className="message-time">{formatTimeFull(message.createdAt)}</span>
        </div>
      )}
      <div className="message-bubble">{message.text}</div>
      {!isMine && (
        <div className="message-meta">
          <span className="message-time">{formatTimeFull(message.createdAt)}</span>
        </div>
      )}
    </div>
  )
}
