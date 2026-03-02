import requests
import time
import random

URL = "http://127.0.0.1:8000/api/temperature"

print("啟動虛擬感測器...")

while True:
    fake_temp = round(random.uniform(20.0, 50.0), 1)
    fake_soc = round(random.uniform(10.0, 100.0), 1)
    fake_soh = round(random.uniform(80.0, 100.0), 1)
    fake_voltage = round(random.uniform(380.0, 420.0), 1)
    fake_current = round(random.uniform(-50.0, 100.0), 1)
    
    health_status = "Good"
    if fake_soc < 20 or fake_temp > 45:
        health_status = "Warning"
    if fake_temp > 48:
        health_status = "Critical"

    data = {
        "temp": fake_temp,
        "soc": fake_soc,
        "soh": fake_soh,
        "voltage": fake_voltage,
        "current": fake_current,
        "health": health_status,
        "timestamp": int(time.time())
    }

    try:
        response = requests.post(URL, json=data)
        print(f"送出資料: {data}, 伺服器回應: {response.json()}")
    except Exception as e:
        print("連線失敗，請檢查 FastAPI 伺服器是否已經開啟！")

    time.sleep(2)