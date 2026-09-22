import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { ensureChat } from '../utils/chat'

export default function NewChatPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [startingWith, setStartingWith] = useState(null)

  useEffect(() => {
    async function loadUsers() {
      const snapshot = await getDocs(collection(db, 'users'))
      const list = snapshot.docs
        .map((doc) => doc.data())
        .filter((user) => user.uid !== currentUser.uid)
      setUsers(list)
      setLoading(false)
    }
    loadUsers()
  }, [currentUser.uid])

  async function handleStartChat(otherUser) {
    setStartingWith(otherUser.uid)
    try {
      const chatId = await ensureChat(currentUser, otherUser)
      navigate(`/chats/${chatId}`)
    } finally {
      setStartingWith(null)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <Link to="/chats" className="icon-button" title="뒤로">
          ←
        </Link>
        <h1>새 대화</h1>
        <span style={{ width: 32 }} />
      </header>

      {loading && <div className="center-message">불러오는 중...</div>}

      {!loading && users.length === 0 && (
        <div className="center-message">
          아직 다른 가입자가 없어요.
          <br />
          다른 계정으로 회원가입하면 여기 목록에 나타나요.
        </div>
      )}

      <ul className="user-list">
        {users.map((user) => (
          <li key={user.uid}>
            <button
              className="user-list-item"
              onClick={() => handleStartChat(user)}
              disabled={startingWith === user.uid}
            >
              <div className="avatar">{(user.nickname || user.email).charAt(0)}</div>
              <div>
                <div className="chat-name">{user.nickname}</div>
                <div className="chat-preview">{user.email}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
