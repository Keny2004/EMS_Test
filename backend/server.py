from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

sensor_data_history = []
MAX_HISTORY = 50 # 儲存最近50筆紀錄供圖表使用
connected_clients = [] # 新增一個清單，用來記住有哪些網頁開啟了專屬水管 (WebSocket)

# 提供給感測器的 API (這部分邏輯不變)
@app.post("/api/temperature")
async def add_temperature(data: dict):
    sensor_data_history.append(data)
    if len(sensor_data_history) > MAX_HISTORY:
        sensor_data_history.pop(0)
    
    # 🌟 魔法在這裡：當收到感測器的新溫度時，主動推播給所有連線中的網頁客戶端！
    for client in connected_clients:
        await client.send_json({"type": "update", "data": data})
        
    return {"message": "資料已成功記錄並推播！"}

# 🌟 新增 WebSocket 通道給 React 網頁連線
@app.websocket("/ws/temperature")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()          # 接受網頁的連線請求
    connected_clients.append(websocket) # 把這個網頁加入名單
    
    # 連線成功時，先發送歷史資料給前端畫圖
    await websocket.send_json({"type": "history", "data": sensor_data_history})
    
    try:
        while True:
            # 讓這條專屬水管保持暢通不中斷
            await websocket.receive_text()
    except WebSocketDisconnect:
        # 如果網頁關閉了，就把它從名單中移除
        connected_clients.remove(websocket)