import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// .env 파일의 값을 읽어옵니다. (.env.example 참고해서 .env 파일을 만드세요)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey) {
  // .env 설정을 깜빡했을 때 콘솔에서 바로 원인을 알 수 있도록 안내
  console.error(
    '[Firebase 설정 오류] .env 파일이 없거나 비어 있습니다. .env.example을 복사해 .env로 만들고 Firebase 콘솔 값을 채워주세요.'
  )
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
