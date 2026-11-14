import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

// 두 사용자의 uid로 항상 같은 채팅방 id를 만들어낸다.
// (A->B로 만들든 B->A로 만들든 같은 방을 가리키게 해서 중복 생성을 막기 위함)
export function getChatId(uidA, uidB) {
  return [uidA, uidB].sort().join('_')
}

// 두 사용자 사이의 채팅방이 없으면 새로 만들고, 있으면 그대로 반환한다.
export async function ensureChat(me, otherUser) {
  const chatId = getChatId(me.uid, otherUser.uid)
  const chatRef = doc(db, 'chats', chatId)
  const snapshot = await getDoc(chatRef)

  if (!snapshot.exists()) {
    await setDoc(chatRef, {
      participants: [me.uid, otherUser.uid],
      participantInfo: {
        [me.uid]: { nickname: me.displayName || me.email },
        [otherUser.uid]: { nickname: otherUser.nickname || otherUser.email },
      },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      lastSenderId: '',
      lastRead: {
        [me.uid]: serverTimestamp(),
        [otherUser.uid]: null,
      },
      createdAt: serverTimestamp(),
    })
  }

  return chatId
}

// 3명 이상이 참여하는 그룹 채팅방을 새로 만든다.
export async function createGroupChat(me, otherUsers, groupName) {
  const participantInfo = {
    [me.uid]: { nickname: me.displayName || me.email },
  }
  const lastRead = { [me.uid]: serverTimestamp() }
  for (const user of otherUsers) {
    participantInfo[user.uid] = { nickname: user.nickname || user.email }
    lastRead[user.uid] = null
  }

  const docRef = await addDoc(collection(db, 'chats'), {
    participants: [me.uid, ...otherUsers.map((user) => user.uid)],
    participantInfo,
    groupName: groupName || null,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    lastSenderId: '',
    lastRead,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}
