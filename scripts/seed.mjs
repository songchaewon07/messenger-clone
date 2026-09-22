// 더미 데이터 생성 스크립트
// 사용법: .env 파일을 먼저 채운 뒤 터미널에서  npm run seed  실행
//
// 테스트 계정 3개 + 계정 간 채팅방 + 채팅방마다 메시지 여러 건을 만들어서
// "더미 데이터 최소 10건" 권장 요건을 채워준다.
// (이 계정들은 하드코딩된 "내 계정"이 아니라 테스트용 더미 계정이라
//  과제 필수 요건인 "본인 계정 하드코딩 금지"와는 별개입니다.)

import { initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { addDoc, collection, doc, getFirestore, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey) {
  console.error('❌ .env 파일이 없거나 비어 있어요. .env.example을 복사해서 .env를 먼저 채워주세요.')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const DUMMY_USERS = [
  { email: 'dummy1@talkie.test', password: 'test1234', nickname: '테스트유저1' },
  { email: 'dummy2@talkie.test', password: 'test1234', nickname: '테스트유저2' },
  { email: 'dummy3@talkie.test', password: 'test1234', nickname: '테스트유저3' },
]

const DUMMY_MESSAGES = [
  '안녕! 잘 지냈어?',
  '오랜만이다 ㅎㅎ',
  '이번 주말에 시간 돼?',
  '좋아 몇 시에 볼까',
  '2시 어때',
  '콜! 거기서 보자',
  '오는 길이야?',
  '거의 다 왔어 5분만',
  'ㅇㅋ 기다릴게',
  '도착!',
]

async function getOrCreateUser({ email, password, nickname }) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: nickname })
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      email,
      nickname,
      photoURL: '',
      createdAt: serverTimestamp(),
    })
    console.log(`✅ 계정 생성: ${email}`)
    return credential.user
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      console.log(`ℹ️  이미 존재하는 계정이라 로그인만 함: ${email}`)
      return credential.user
    }
    throw err
  }
}

function chatIdOf(uidA, uidB) {
  return [uidA, uidB].sort().join('_')
}

async function createChatWithMessages(userA, userB, messages) {
  const chatId = chatIdOf(userA.uid, userB.uid)
  const chatRef = doc(db, 'chats', chatId)

  await setDoc(chatRef, {
    participants: [userA.uid, userB.uid],
    participantInfo: {
      [userA.uid]: { nickname: userA.displayName },
      [userB.uid]: { nickname: userB.displayName },
    },
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    lastSenderId: '',
    lastRead: { [userA.uid]: serverTimestamp(), [userB.uid]: serverTimestamp() },
    createdAt: serverTimestamp(),
  })

  let lastSender = userA
  for (let i = 0; i < messages.length; i++) {
    const sender = i % 2 === 0 ? userA : userB
    lastSender = sender
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: sender.uid,
      text: messages[i],
      createdAt: serverTimestamp(),
    })
  }

  await updateDoc(chatRef, {
    lastMessage: messages[messages.length - 1],
    lastMessageAt: serverTimestamp(),
    lastSenderId: lastSender.uid,
  })

  console.log(`✅ 채팅방 생성 (${userA.displayName} ↔ ${userB.displayName}), 메시지 ${messages.length}건`)
}

async function main() {
  console.log('더미 데이터 생성을 시작합니다...\n')

  const users = []
  for (const u of DUMMY_USERS) {
    users.push(await getOrCreateUser(u))
  }

  await createChatWithMessages(users[0], users[1], DUMMY_MESSAGES)
  await createChatWithMessages(users[0], users[2], DUMMY_MESSAGES.slice(0, 5))

  console.log('\n🎉 완료! Talkie 앱에 dummy1@talkie.test / test1234 로 로그인해서 확인해보세요.')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ 시드 스크립트 실행 중 오류:', err)
  process.exit(1)
})
