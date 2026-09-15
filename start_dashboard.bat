@echo off
echo [*] Starting SENTINEL SOC Dashboard on http://localhost:3000 ...
cd /d "%~dp0\dashboard"
npm run dev
pause
