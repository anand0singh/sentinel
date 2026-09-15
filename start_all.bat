@echo off
title SENTINEL Master Orchestrator
color 0A
cls
echo ==============================================================================
echo       SENTINEL: AUTONOMOUS CYBER DEFENSE PLATFORM (CYBER BRUTALISM)
echo ==============================================================================
echo.
echo [*] Checking and freeing ports 8000 and 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [*] Launching SENTINEL FastAPI Core Backend (Port 8000)...
start "SENTINEL API Engine" cmd /k "cd /d "%~dp0" && call .venv\Scripts\activate && uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload"

echo [*] Launching Next.js Cyber Brutalism SOC Dashboard (Port 3000)...
start "SENTINEL Dashboard" cmd /k "cd /d "%~dp0\dashboard" && npm run dev"

echo.
echo [+] Services launched successfully!
echo [+] Backend API: http://localhost:8000 (API Docs: http://localhost:8000/docs)
echo [+] SOC Dashboard: http://localhost:3000
echo.
echo Press any key to open the dashboard in your default browser...
pause >nul
start http://localhost:3000
