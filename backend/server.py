from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import sqlite3
import json
import csv
import io
from typing import List, Dict, Any

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

connected_clients = [] # 新增一個清單，用來記住有哪些網頁開啟了專屬水管 (WebSocket)

# 初始化資料庫
def init_db():
    conn = sqlite3.connect("battery_data.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS battery_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER,
            battery_id INTEGER,
            soc REAL,
            soh REAL,
            temp REAL,
            voltage REAL,
            current REAL,
            health TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# 提供給感測器的 API
@app.post("/api/temperature")
async def add_temperature(data: List[Dict[str, Any]]):
    # data is expected to be a list of 16 battery objects
    conn = sqlite3.connect("battery_data.db")
    cursor = conn.cursor()
    
    for item in data:
        cursor.execute('''
            INSERT INTO battery_data (timestamp, battery_id, soc, soh, temp, voltage, current, health)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            item['timestamp'],
            item['battery_id'],
            item['soc'],
            item['soh'],
            item['temp'],
            item['voltage'],
            item['current'],
            item['health']
        ))
    conn.commit()
    conn.close()
    
    # 推播給所有連線中的網頁客戶端
    for client in connected_clients:
        try:
            await client.send_json({"type": "update", "data": data})
        except Exception:
            pass
        
    return {"message": "資料已成功記錄並推播！"}

# 新增資料匯出 API
@app.get("/api/export")
async def export_data(start_time: int = Query(...), end_time: int = Query(...)):
    conn = sqlite3.connect("battery_data.db")
    cursor = conn.cursor()
    cursor.execute('''
        SELECT timestamp, battery_id, soc, soh, temp, voltage, current, health
        FROM battery_data
        WHERE timestamp >= ? AND timestamp <= ?
        ORDER BY timestamp ASC, battery_id ASC
    ''', (start_time, end_time))
    rows = cursor.fetchall()
    conn.close()

    # 產生 CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['timestamp', 'battery_id', 'soc', 'soh', 'temp', 'voltage', 'current', 'health'])
    writer.writerows(rows)
    
    csv_data = output.getvalue()
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=battery_data_export.csv"}
    )

# 新增 WebSocket 通道給 React 網頁連線
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
