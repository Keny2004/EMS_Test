from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 允許前端網頁跨域請求 (很重要，不然 React 會抓不到資料)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 暫存溫度的記憶體 (第一版先不用資料庫，降低初期難度)
temperature_data = []

# 提供給「樹莓派(邊緣端)」把資料傳進來的 API
@app.post("/api/temperature")
def add_temperature(data: dict):
    temperature_data.append(data)
    return {"message": "溫度已成功記錄！"}

# 提供給「React(前端網頁)」來讀取最新溫度的 API
@app.get("/api/temperature")
def get_temperature():
    if len(temperature_data) == 0:
        return {"temp": 0} # 沒資料時先回傳 0
    return temperature_data[-1] # 回傳陣列中最後一筆 (最新) 的資料