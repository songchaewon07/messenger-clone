import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// 로그인 안 한 사람이 채팅 목록/채팅방 주소로 바로 접근하는 걸 막는 컴포넌트
export default function ProtectedRoute({ children }) {
  const { currentUser, authLoading } = useAuth()

  if (authLoading) {
    return <div className="center-message">로딩 중...</div>
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}
