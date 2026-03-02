import { useState, useEffect } from 'react'

function App() {
  const [temperature, setTemperature] = useState(0)

  useEffect(() => {
    // 🌟 建立 WebSocket 連線 (注意這裡開頭是 ws:// 而不是 http://)
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/temperature')

    ws.onopen = () => {
      console.log("✅ WebSocket 連線成功！專屬水管已接通！")
    }

    // 🌟 當收到後端「主動」沖過來的新資料時，立刻更新畫面！
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setTemperature(data.temp)
    }

    // 網頁關閉時，把水管拔掉的好習慣
    return () => ws.close() 
  }, [])

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>🔋 虛擬電池溫度監控系統</h1>
      <h2 style={{ fontSize: '6rem', color: temperature > 35 ? 'red' : 'green' }}>
        {temperature} °C
      </h2>
    </div>
  )
}

export default App