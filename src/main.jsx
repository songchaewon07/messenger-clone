import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// GitHub Pages는 새로고침 시 서버 라우팅을 지원하지 않아서 BrowserRouter를 쓰면
// /chats 같은 주소를 새로고침했을 때 404가 뜨는 문제가 생긴다.
// HashRouter(/#/chats 형태)를 쓰면 이 문제를 별도 설정 없이 피할 수 있다.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)
