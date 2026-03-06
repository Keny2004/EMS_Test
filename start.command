#!/bin/bash
# MacOS 一鍵啟動腳本 (start.command)
# 雙擊此檔案，即可透過 Terminal 自動開啟三個分頁/視窗來執行專案的所有元件

# 取得目前這個腳本所在的目錄 (絕對路徑)
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "正在啟動 EMS 能源管理系統全端專案..."

# --- 第一個視窗：啟動 FastAPI 後端伺服器 ---
# 告訴 Terminal 打開一個新視窗，切換到 backend 目錄並啟動 uvicorn
osascript -e "tell application \"Terminal\" to do script \"cd '$DIR/backend' && source venv/bin/activate 2>/dev/null || true && echo '=== 啟動 FastAPI 伺服器 ===' && uvicorn server:app --reload\""

# 暫停兩秒，確保後端伺服器已經成功啟動，再啟動感測器跟前端
sleep 2

# --- 第二個視窗：啟動 Python 虛擬感測器 ---
# 告訴 Terminal 在新的視窗切換到 backend 目錄並執行 sensor.py
osascript -e "tell application \"Terminal\" to do script \"cd '$DIR/backend' && source venv/bin/activate 2>/dev/null || true && echo '=== 啟動虛擬感測器 ===' && python3 sensor.py\""

# --- 第三個視窗：啟動 React 前端開發伺服器 ---
# 告訴 Terminal 在新的視窗切換到 frontend/frontend 目錄並執行 npm run dev
osascript -e "tell application \"Terminal\" to do script \"cd '$DIR/frontend/frontend' && echo '=== 啟動 React 前端 ===' && npm run dev\""

echo "系統已全部啟動完畢，請查看各個終端機視窗的執行狀況。"
echo "您可以隨時按下 Ctrl+C 來個別關閉它們。"
