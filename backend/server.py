from fastapi import FastAPI # 引入 FastAPI 框架，這是用來建立網站後端伺服器的強大工具
from fastapi.middleware.cors import CORSMiddleware # 引入 CORS 中介軟體，用來處理跨域請求的問題

# 建立一個 FastAPI 應用程式的實例，我們之後所有的 API 路由都會綁定在這個 app 上
app = FastAPI()

# 設定 CORS (跨來源資源共用)
# 因為前端 (React, 跑在 port 5173) 和後端 (FastAPI, 跑在 port 8000) 網址不同
# 瀏覽器基於安全性會阻擋這種請求，所以必須明確允許前端來存取我們的資料
app.add_middleware( 
    CORSMiddleware,
    allow_origins=["*"], # 允許所有來源的請求 (實務上應設定為前端的真實網址，例如 localhost:5173)
    allow_methods=["*"], # 允許所有 HTTP 請求方法 (GET, POST, PUT, DELETE 等)
    allow_headers=["*"], # 允許所有 HTTP 標頭
)

# 這是一個暫存溫度的全域變數 (記憶體)，用來儲存感測器傳來的資料。
# 因為是初學，所以我們先不接資料庫 (如 MySQL 或 MongoDB)，直接存在記憶體中。
# 注意：只要伺服器重新啟動，這個陣列裡的資料就會全部消失。
temperature_data = []

# 定義一個 POST 請求的 API 路由，路徑是 "/api/temperature"
# 提供給「邊緣端 (如樹莓派上的感測器 Python 腳本)」呼叫，用來把溫度資料「傳送」給伺服器
@app.post("/api/temperature")
def add_temperature(data: dict): # data: dict 意思是我們預期收到的資料格式會轉換成 Python 的字典 (Dictionary)
    temperature_data.append(data) # 將收到的資料加到剛剛宣告的溫度陣列最後面
    return {"message": "溫度已成功記錄！"} # 回傳一個 JSON 格式的成功訊息給傳送者

# 定義一個 GET 請求的 API 路由，路徑一樣是 "/api/temperature"
# 提供給「前端網頁 (React)」呼叫，用來「讀取」最新的溫度資料以顯示在畫面上
@app.get("/api/temperature")
def get_temperature():
    if len(temperature_data) == 0: # 檢查陣列裡有沒有資料
        return {"temp": 0} # 如果還沒有任何感測器資料進來，就先回傳一個預設的 0 度
    return temperature_data[-1] # Python 陣列索引 -1 代表取出最後一筆資料 (也就是最新傳進來的那筆)