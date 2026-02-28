@echo off
title Cocolytics Brown Detection System
color 0A

echo.
echo ========================================
echo    COCOLYTICS BROWN DETECTION SYSTEM
echo ========================================
echo.
echo Starting all services...
echo.

echo [1/3] Starting ML Service (Port 5000)...
start "ML Service" cmd /k "cd ml-service && python app.py"
timeout /t 3 /nobreak > nul

echo [2/3] Starting Backend (Port 3000)...
start "Backend Server" cmd /k "cd backend && node server.js"
timeout /t 2 /nobreak > nul

echo [3/3] Starting Frontend (Port 5173)...
start "Frontend Dev Server" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo    ALL SERVICES STARTED!
echo ========================================
echo.
echo Phone Access: http://192.168.68.101:5173/staff/camera-scanner
echo.
echo Computer Access: http://localhost:5173/staff/camera-scanner
echo.
echo Services:
echo   - Frontend:   http://localhost:5173
echo   - Backend:    http://localhost:3000
echo   - ML Service: http://localhost:5000
echo.
echo Press any key to open the complete guide...
pause > nul

start notepad BROWN_DETECTION_COMPLETE_GUIDE.md

echo.
echo Guide opened! You can close this window.
echo.
timeout /t 5
