# Talkie - 메신저 앱 클론 (카카오톡/라인 스타일)

React + Firebase(Auth, Firestore)로 만든 실시간 1:1 메신저 클론입니다.

## 핵심 기능 3가지

1. **실시간 1:1 채팅** — Firestore 실시간 구독(onSnapshot)으로 메시지를 주고받으면 새로고침 없이 즉시 화면에 반영됩니다.
2. **채팅방 목록 + 최근 메시지 미리보기** — 내가 참여 중인 채팅방을 최근 대화순으로 보여주고, 마지막 메시지와 시간을 미리보기로 표시합니다.
3. **메시지 읽음/안읽음 표시** — 상대가 내 메시지를 읽었는지 여부를 말풍선 옆에 표시하고, 채팅 목록에서는 안읽은 대화에 빨간 배지를 띄웁니다.

추가로 회원가입/로그인(Firebase Auth)을 구현해서 **본인 계정을 코드에 하드코딩하지 않고도** 누구나 가입해서 사용할 수 있습니다.

---

## 1. 로컬에서 실행하기

### 1) 이 프로젝트 압축 풀고 패키지 설치

```bash
npm install
```

### 2) Firebase 프로젝트 만들기

1. https://console.firebase.google.com 접속 → **프로젝트 추가**
2. 프로젝트 이름 입력 (예: talkie-clone) → 애널리틱스는 꺼도 됨 → 만들기
3. 왼쪽 메뉴에서 **Authentication** 클릭 → 시작하기 → **로그인 방법** 탭 → **이메일/비밀번호** 사용 설정
4. 왼쪽 메뉴에서 **Firestore Database** 클릭 → 데이터베이스 만들기 → (위치는 asia-northeast3 등 아무거나) → **테스트 모드** 또는 프로덕션 모드로 시작 (규칙은 3번에서 따로 설정합니다)
5. 왼쪽 메뉴 **프로젝트 설정(톱니바퀴)** → 일반 탭 아래로 스크롤 → **내 앱** → 웹 아이콘(`</>`) 클릭 → 앱 닉네임 입력 → 앱 등록
6. 화면에 나오는 `firebaseConfig` 객체의 값들을 복사

### 3) 환경 변수 설정

`.env.example` 파일을 복사해서 `.env` 파일을 만들고, 위에서 복사한 값을 채워 넣으세요.

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=여기에_붙여넣기
VITE_FIREBASE_AUTH_DOMAIN=여기에_붙여넣기
VITE_FIREBASE_PROJECT_ID=여기에_붙여넣기
VITE_FIREBASE_STORAGE_BUCKET=여기에_붙여넣기
VITE_FIREBASE_MESSAGING_SENDER_ID=여기에_붙여넣기
VITE_FIREBASE_APP_ID=여기에_붙여넣기
```

### 4) Firestore 보안 규칙 적용

Firebase 콘솔 → Firestore Database → **규칙(Rules)** 탭 → 이 프로젝트의 `firestore.rules` 파일 내용을 복사해서 붙여넣고 **게시(Publish)**.

> 이 단계를 건너뛰면 "Missing or insufficient permissions" 에러가 나면서 앱이 동작하지 않습니다. (트러블슈팅 기록으로 남기기 좋은 케이스예요.)

### 5) 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속. 회원가입 화면에서 계정을 2개 만들어서 (예: 시크릿 창 하나 더 열기) 서로 채팅해보면 실시간 반영을 확인할 수 있어요.

### 6) (선택) 더미 데이터 채우기

```bash
npm run seed
```

테스트 계정 3개와 대화 내용 10건 이상을 자동으로 만들어줍니다. `dummy1@talkie.test` / `test1234` 로 로그인해서 확인해보세요.

---

## 2. GitHub Pages로 배포하기

### 1) GitHub 저장소 만들고 코드 올리기

```bash
git init
git add .
git commit -m "메신저 클론 초기 커밋"
git branch -M main
git remote add origin https://github.com/내아이디/저장소이름.git
git push -u origin main
```

### 2) base 경로 맞추기 ⚠️ 가장 많이 실수하는 부분

`vite.config.js` 파일의 `base` 값을 **저장소 이름과 똑같이** 맞춰주세요.

```js
base: '/저장소이름/',
```

이 값이 실제 저장소 이름과 다르면 배포는 되지만 화면이 새하얗게 뜨고, 개발자 도구 콘솔에 JS/CSS 파일 404 에러가 뜹니다. (역시 트러블슈팅 기록으로 좋은 소재입니다.)

### 3) 배포

```bash
npm run deploy
```

`gh-pages` 브랜치가 자동으로 만들어지고 배포됩니다. GitHub 저장소 → Settings → Pages 에서 소스가 `gh-pages` 브랜치로 설정되어 있는지 확인하세요.

몇 분 뒤 `https://내아이디.github.io/저장소이름/` 로 접속하면 앱이 보입니다.

### 4) Firebase에 배포 도메인 등록

Firebase 콘솔 → Authentication → Settings → **승인된 도메인(Authorized domains)** 에 `내아이디.github.io` 를 추가해야 배포된 사이트에서 로그인/회원가입이 동작합니다. (안 하면 `auth/unauthorized-domain` 에러가 납니다.)

---

## 3. 과제 필수 요건 체크리스트

- [x] 배포된 URL이 살아있을 것 → 위 2번 과정으로 GitHub Pages 배포
- [x] 핵심 기능 3개가 처음부터 끝까지 동작 → 실시간 채팅 / 채팅방 목록 / 읽음 표시
- [x] 본인이 아닌 사람이 가입해서 쓸 수 있을 것 → Firebase Auth 회원가입, 계정 하드코딩 없음
- [ ] 트러블슈팅 기록 5건 이상 → 아래 템플릿 활용
- [x] 더미 데이터 최소 10건 → `npm run seed` 실행 시 대화 메시지 10건 이상 생성

## 4. 트러블슈팅 기록 템플릿 (권장 요건: 5건 이상)

이 프로젝트를 만들면서 실제로 마주치기 쉬운 이슈들을 아래에 미리 정리해두었습니다.
직접 겪은 순서대로 스크린샷과 함께 기록해보세요.

1. **Firestore 색인(index) 에러**
   - 증상: 채팅방 목록이 안 뜨고 콘솔에 `The query requires an index` 에러
   - 원인: `where` + `orderBy`를 함께 쓰면 복합 색인이 필요함
   - 해결: 에러 메시지 속 링크 클릭 → 자동 생성 → 1~2분 대기

2. **Missing or insufficient permissions**
   - 증상: 로그인은 되는데 채팅방 목록/메시지가 안 불러와짐
   - 원인: Firestore 보안 규칙을 기본값(모두 차단)으로 둔 상태
   - 해결: `firestore.rules` 내용을 콘솔에 게시

3. **GitHub Pages 배포 후 흰 화면**
   - 증상: 배포 URL 접속 시 빈 화면, 콘솔에 css/js 404
   - 원인: `vite.config.js`의 `base` 값이 저장소 이름과 다름
   - 해결: `base: '/저장소이름/'` 으로 정확히 수정 후 재배포

4. **배포 사이트에서 로그인이 안 됨 (auth/unauthorized-domain)**
   - 원인: Firebase Authentication에 GitHub Pages 도메인이 등록 안 됨
   - 해결: 승인된 도메인에 `아이디.github.io` 추가

5. **새로고침하면 로그인 페이지로 튕김**
   - 원인: `onAuthStateChanged`가 로그인 상태를 확인하기 전에 "로그인 안 됨"으로 잘못 판단
   - 해결: `authLoading` 상태로 확인이 끝날 때까지 로딩 화면을 보여주도록 처리 (이미 반영됨)

> 실제로 겪은 에러 메시지 스크린샷과 "어떻게 알아챘는지 → 원인 파악 → 해결 방법"을 자신의 말로 다시 정리하면 좋은 트러블슈팅 기록이 됩니다.

## 5. 폴더 구조

```
src/
  firebase.js            Firebase 초기화
  context/AuthContext.jsx 로그인 상태 전역 관리
  components/
    ProtectedRoute.jsx   비로그인 접근 차단
    ChatListItem.jsx     채팅 목록 한 줄
    MessageBubble.jsx    말풍선 하나
  pages/
    LoginPage.jsx
    SignupPage.jsx
    ChatListPage.jsx     핵심기능2
    NewChatPage.jsx       대화 상대 찾기
    ChatRoomPage.jsx      핵심기능1, 3
  utils/
    chat.js               채팅방 id 생성/생성 로직
    time.js               시간 포맷
scripts/seed.mjs          더미 데이터 생성 스크립트
firestore.rules           Firestore 보안 규칙
```
