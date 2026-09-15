@echo off
echo [*] Starting SENTINEL FastAPI Backend on http://localhost:8000 ...
cd /d "%~dp0"
call .venv\Scripts\activate
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
pause
