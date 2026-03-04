import requests
import time
import random

# 剛剛 FastAPI 伺服器的網址
URL = "http://127.0.0.1:8000/api/temperature"

print("啟動虛擬感測器...")

while True:
    # 模擬產生 20.0 ~ 45.0 度的假資料
    fake_temp = round(random.uniform(20.0, 45.0), 1)
    data = {"temp": fake_temp}

    try:
        # 發送 POST 請求給 FastAPI
        response = requests.post(URL, json=data)
        print(f"送出溫度: {fake_temp}°C, 伺服器回應: {response.json()}")
    except Exception as e:
        print("連線失敗，請檢查 FastAPI 伺服器是否已經開啟！")

    # 每 2 秒送一次資料
    time.sleep(2)