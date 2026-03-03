import requests
import time
import random

URL = "http://127.0.0.1:8000/api/temperature"

print("啟動虛擬感測器 (16顆電池)...")

while True:
    payload = []
    current_time = int(time.time())
    
    for i in range(1, 17):
        base_temp = 25.0 + (i % 4) * 2.0  # 使不同電池有不同的基準溫度
        fake_temp = round(random.uniform(base_temp - 5.0, base_temp + 20.0), 1)
        fake_soc = round(random.uniform(10.0, 100.0), 1)
        fake_soh = round(random.uniform(80.0, 100.0), 1)
        fake_voltage = round(random.uniform(380.0, 420.0), 1)
        fake_current = round(random.uniform(-50.0, 100.0), 1)
        
        health_status = "Good"
        if fake_soc < 20 or fake_temp > 45:
            health_status = "Warning"
        if fake_temp > 48:
            health_status = "Critical"

        payload.append({
            "battery_id": i,
            "temp": fake_temp,
            "soc": fake_soc,
            "soh": fake_soh,
            "voltage": fake_voltage,
            "current": fake_current,
            "health": health_status,
            "timestamp": current_time
        })

    try:
        response = requests.post(URL, json=payload)
        print(f"[{current_time}] 送出 16 筆資料, 伺服器回應: {response.json()}")
    except Exception as e:
        print("連線失敗，請檢查 FastAPI 伺服器是否已經開啟！")

    time.sleep(2)
