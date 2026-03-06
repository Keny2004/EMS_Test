import { StrictMode } from 'react' // StrictMode (嚴格模式)：用來在開發階段幫我們找出程式中潛在的問題，會在開發環境自動執行兩次檢查
import { createRoot } from 'react-dom/client' // 從 React DOM 引入 createRoot：這是 React 18 以後將程式畫到網頁上的新方法
import './index.css' // 引入全域的 CSS 樣式檔案 (這裡面的樣式套用到整個網頁)
import App from './App.jsx' // 引入我們自己寫的 App 元件 (應用程式的主要內容)

// document.getElementById('root') 
// => 去 index.html 檔案中找到 id 為 "root" 的那個空的 <div> 標籤
// createRoot(...) 
// => 在這個空的 div 裡面建立一個 React 的「根節點」，代表 React 要接管這個區塊了
createRoot(document.getElementById('root')).render(
  // 在 StrictMode 的保護下，開始繪製我們的 <App /> 元件
  <StrictMode>
    <App />
  </StrictMode>,
)
