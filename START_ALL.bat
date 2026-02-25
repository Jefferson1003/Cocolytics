@echo off
REM Cocolytics Full Stack Startup Script
REM Starts Database, Backend, ML Service, and Frontend

echo.
echo ========================================
echo 🌴 COCOLYTICS FULL STACK STARTUP 🌴
echo ========================================
echo.

REM Check if running in correct directory
if not exist "backend" (
    echo ❌ Error: Run this script from C:\COCOLYTICS\Cocolytics directory
    pause
    exit /b 1
)

echo Starting all services...
echo.

REM Terminal 1: Backend Server
echo 📡 Starting Backend Server (Port 3000)...
start "Cocolytics Backend" cmd /k "cd backend && npm install > nul 2>&1 && echo. && echo Backend running on http://localhost:3000 && node server.js"
timeout /t 3 > nul

REM Terminal 2: ML Service  
echo 🔍 Starting ML Detection Service (Port 5000)...
start "Cocolytics ML Service" cmd /k "cd ml-service && python -m pip install -r requirements.txt > nul 2>&1 && echo. && echo ML Service running on http://localhost:5000 && python app.py"
timeout /t 3 > nul

REM Terminal 3: Frontend
echo 🎨 Starting Frontend Dev Server (Port 5173)...
start "Cocolytics Frontend" cmd /k "cd frontend && npm install > nul 2>&1 && echo. && echo Frontend running on http://localhost:5173 && npm run dev"
timeout /t 2 > nul

echo.
echo ✅ All Services Starting!
echo.
echo Wait 10-15 seconds for all services to fully start, then:
echo 🌐 Open http://localhost:5173 in your browser
echo.
echo Services Running:
echo   📡 Backend:    http://localhost:3000
echo   🔍 ML Service: http://localhost:5000 (for detection)
echo   🎨 Frontend:   http://localhost:5173
echo.
echo 📸 Ready to use Camera Scanner!
echo.
pause
