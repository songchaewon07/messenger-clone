import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { createGroupChat, ensureChat } from '../utils/chat'

export default function NewChatPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUids, setSelectedUids] = useState([])
  const [groupName, setGroupName] = useState('')
  const [starting, setStarting] = useState(false)

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

  function toggleUser(uid) {
    setSelectedUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    )
  }

  async function handleStart() {
    const selectedUsers = users.filter((user) => selectedUids.includes(user.uid))
    if (selectedUsers.length === 0) return

    setStarting(true)
    try {
      const chatId =
        selectedUsers.length === 1
          ? await ensureChat(currentUser, selectedUsers[0])
          : await createGroupChat(currentUser, selectedUsers, groupName.trim())
      navigate(`/chats/${chatId}`)
    } finally {
      setStarting(false)
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

      {selectedUids.length >= 2 && (
        <div style={{ padding: '12px 16px 0' }}>
          <input
            type="text"
            placeholder="그룹 이름 (선택사항)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
          />
        </div>
      )}

      <ul className="user-list">
        {users.map((user) => (
          <li key={user.uid}>
            <button
              className={`user-list-item${selectedUids.includes(user.uid) ? ' selected' : ''}`}
              onClick={() => toggleUser(user.uid)}
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

      {selectedUids.length > 0 && (
        <form
          className="message-input-bar"
          onSubmit={(e) => {
            e.preventDefault()
            handleStart()
          }}
        >
          <button type="submit" disabled={starting} style={{ flex: 1 }}>
            {starting
              ? '만드는 중...'
              : selectedUids.length === 1
                ? '대화 시작하기'
                : `그룹 채팅 시작하기 (${selectedUids.length}명)`}
          </button>
        </form>
      )}
    </div>
  )
}
