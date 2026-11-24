@echo off
title ScrollCheck - Backend + Frontend
echo Starting ScrollCheck Backend (FastAPI on :8000) and Frontend (Vite on :5173)...
start "ScrollCheck API" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --host 127.0.0.1 --port 8000"
start "ScrollCheck UI" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1 --port 5173"
timeout /t 3 >nul
start http://localhost:5173
