import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/chats')
    } catch (err) {
      // Firebase 에러 코드를 사람이 읽을 수 있는 한국어 메시지로 변환
      setError(toFriendlyMessage(err.code))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Talkie 로그인</h1>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? '로그인 중...' : '로그인'}
        </button>
        <p className="auth-switch">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </form>
    </div>
  )
}

function toFriendlyMessage(code) {
  switch (code) {
    case 'auth/invalid-email':
      return '이메일 형식이 올바르지 않아요.'
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return '가입되지 않은 계정이거나 비밀번호가 틀렸어요.'
    case 'auth/wrong-password':
      return '비밀번호가 틀렸어요.'
    case 'auth/too-many-requests':
      return '잠시 후 다시 시도해주세요.'
    default:
      return `로그인에 실패했어요. (${code || '알 수 없는 오류'})`
  }
}
