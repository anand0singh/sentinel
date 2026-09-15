@echo off
echo [*] Running SENTINEL Automated Verification Suite...
cd /d "%~dp0"
call .venv\Scripts\activate
python -m pytest tests/ -v
pause
