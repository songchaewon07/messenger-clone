import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요. (Firebase 기본 정책)')
      return
    }

    setSubmitting(true)
    try {
      await signup(email, password, nickname)
      navigate('/chats')
    } catch (err) {
      setError(toFriendlyMessage(err.code))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Talkie 회원가입</h1>
        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? '가입 중...' : '회원가입'}
        </button>
        <p className="auth-switch">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </form>
    </div>
  )
}

function toFriendlyMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return '이미 가입된 이메일이에요.'
    case 'auth/invalid-email':
      return '이메일 형식이 올바르지 않아요.'
    case 'auth/weak-password':
      return '비밀번호가 너무 약해요. 6자 이상 입력해주세요.'
    default:
      return `회원가입에 실패했어요. (${code || '알 수 없는 오류'})`
  }
}
