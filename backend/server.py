from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

temperature_data = []
connected_clients = [] # 新增一個清單，用來記住有哪些網頁開啟了專屬水管 (WebSocket)

# 提供給感測器的 API (這部分邏輯不變)
@app.post("/api/temperature")
async def add_temperature(data: dict):
    temperature_data.append(data)
    
    # 🌟 魔法在這裡：當收到感測器的新溫度時，主動推播給所有連線中的網頁客戶端！
    for client in connected_clients:
        await client.send_json(data)
        
    return {"message": "溫度已成功記錄並推播！"}

# 🌟 新增 WebSocket 通道給 React 網頁連線
@app.websocket("/ws/temperature")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()          # 接受網頁的連線請求
    connected_clients.append(websocket) # 把這個網頁加入名單
    try:
        while True:
            # 讓這條專屬水管保持暢通不中斷
            await websocket.receive_text()
    except WebSocketDisconnect:
        # 如果網頁關閉了，就把它從名單中移除
        connected_clients.remove(websocket)