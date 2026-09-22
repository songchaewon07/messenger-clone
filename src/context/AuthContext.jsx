import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  // authLoading: Firebase가 로그인 상태를 아직 확인 중인지 여부.
  // 이 값이 true인 동안은 "로그인 안 됨"으로 섣불리 판단해서 로그인 페이지로
  // 튕기면 안 되기 때문에 화면단에서 반드시 체크해야 함 (트러블슈팅 포인트 중 하나)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  // 회원가입: 이메일/비밀번호/닉네임을 받아 Auth 계정 생성 + Firestore users 문서 생성
  async function signup(email, password, nickname) {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: nickname })

    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      email,
      nickname,
      photoURL: '',
      createdAt: serverTimestamp(),
    })

    return credential.user
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout() {
    return signOut(auth)
  }

  const value = { currentUser, authLoading, signup, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.')
  }
  return context
}
