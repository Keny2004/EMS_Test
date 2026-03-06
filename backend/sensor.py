import requests # 引入 requests 模組，專門用來發送 HTTP 請求 (像是模擬網頁瀏覽器去連線)
import time # 引入 time 模組，用來控制程式暫停的時間 (例如: 每隔幾秒執行一次)
import random # 引入 random 模組，用來產生隨機亂數 (模擬不固定的溫度資料)

# 設定我們要將資料傳送到哪個網址
# 這是剛剛 FastAPI 伺服器啟動後接收資料的 API 端點
URL = "http://127.0.0.1:8000/api/temperature"

print("啟動虛擬感測器...") # 在命令提示字元印出提示訊息

# 使用 while True 建立一個無窮迴圈，讓這個腳本可以永遠跑下去，不斷送資料
while True:
    # random.uniform(20.0, 45.0) 會產生一個 20.0 到 45.0 之間的隨機小數
    # round(..., 1) 會把這個小數四捨五入到小數點第一位，代表我們模擬的溫度
    fake_temp = round(random.uniform(20.0, 45.0), 1)
    
    # 建立一個 Python 字典，這是準備要傳送給伺服器的資料結構
    # 鍵 (Key) 是 "temp"，對應的值 (Value) 是剛剛產生的隨機溫度
    data = {"temp": fake_temp}

    # 使用 try-except 區塊來做錯誤處理
    # 當網路斷線或伺服器沒開時，程式才不會直接崩潰當掉
    try:
        # 發送一個 POST 請求給目標網址，並把 data 轉換成 JSON 格式附在請求主體 (Body) 中
        response = requests.post(URL, json=data)
        
        # 如果有成功連上伺服器，印出送出的溫度以及伺服器回傳的確認訊息
        print(f"送出溫度: {fake_temp}°C, 伺服器回應: {response.json()}")
    except Exception as e:
        # 如果連線失敗 (例如 FastAPI 根本沒啟動)，就會執行到這行，印出錯誤提示
        print("連線失敗，請檢查 FastAPI 伺服器是否已經開啟！")

    # 為了不要瞬間發送太多要求把伺服器塞爆，我們讓程式在這裡暫停 2 秒鐘
    # 也就是「每 2 秒感測一次並送出資料」的概念
    time.sleep(2)