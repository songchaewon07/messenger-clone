import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ChatListPage from './pages/ChatListPage'
import NewChatPage from './pages/NewChatPage'
import ChatRoomPage from './pages/ChatRoomPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/chats" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <ChatListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new"
          element={
            <ProtectedRoute>
              <NewChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats/:chatId"
          element={
            <ProtectedRoute>
              <ChatRoomPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/chats" replace />} />
      </Routes>
    </AuthProvider>
  )
}
