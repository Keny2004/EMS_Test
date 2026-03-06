import { useState, useEffect } from 'react' // 從 React 函式庫引入 useState (用來儲存狀態) 和 useEffect (用來處理副作用，如網路請求)
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css' // 引入 CSS 樣式檔來幫網頁排版

// App 是一個 React 元件 (Component)，它本質上就是一個回傳 HTML 的 JavaScript 函式
function App() {
  // useState(0) 會回傳一個陣列，包含：
  // 1. temp: 目前的溫度數值 (初始值我們設定為 0)
  // 2. setTemp: 一個用來更新溫度數值的函式
  // 當我們呼叫 setTemp(新數值) 時，React 就會自動幫我們重新渲染畫面，讓畫面的數字改變
  const [temp, setTemp] = useState(0)

  // useEffect 的功能是：當這個元件被放到網頁上 (Mount) 後，要額外執行什麼事情。
  // 我們通常在這裡呼叫後端 API 取得資料。
  useEffect(() => {
    // 定義一個非同步函式 (async function)，負責去後端拿溫度的數字
    const fetchTemperature = async () => {
      try {
        // 使用 fetch 發送 HTTP GET 請求到我們的 FastAPI 伺服器
        const response = await fetch('http://127.0.0.1:8000/api/temperature')
        
        // 將伺服器回傳的資料轉換成 JSON 格式
        // 後端回傳的格式會像是這樣： {"temp": 25.4}
        const data = await response.json()
        
        // 呼叫 setTemp 將我們獲得的溫度設定到狀態裡面，React 就會把新溫度畫到畫面上！
        setTemp(data.temp)
      } catch (error) {
        // 如果後端沒開或是網路有問題，就在這裡印出錯誤
        console.error("無法取得溫度資料，請檢查後端伺服器:", error)
      }
    }

    // 第一時間先去抓一次資料
    fetchTemperature()

    // 接著透過 setInterval 設定一個「計時器」，每經過 2 秒鐘 (2000毫秒) 就會自動執行一次 fetchTemperature
    // 這樣畫面上的溫度就會即時跳動更新！
    const interval = setInterval(fetchTemperature, 2000)

    // return 特殊語法：當這個元件被從網面上移除 (Unmount) 時，要把計時器清掉，避免浪費效能
    return () => clearInterval(interval)
  }, []) // 結尾這個空的 [] 代表這個 useEffect 裡面的設定「只會在元件第一次顯示時執行一次」

  // return () 裡面的語法叫做 JSX，它可以讓我們在 JavaScript 程式碼裡面寫 HTML 標籤
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>EMS 能源管理系統 前端實作</h1>
      
      {/* className="card" 會套用 App.css 內定義的樣式 */}
      <div className="card">
        {/* 用大括號 {} 包起來的部分，可以讓我們在 HTML 中執行 JavaScript 變數 */}
        <h2>目前感測器溫度: {temp} °C</h2>
        
        <p>
          此數值每兩秒會自動與後端 FastAPI 伺服器同步一次
        </p>
      </div>
      <p className="read-the-docs">
        修改 <code>src/App.jsx</code> 並存檔，畫面即會自動熱更新 (HMR)
      </p>
    </>
  )
}

// 匯出這個 App 元件，讓 main.jsx 能夠將它渲染到畫面上
export default App
