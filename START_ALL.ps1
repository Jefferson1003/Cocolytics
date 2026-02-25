# Cocolytics Full Stack Startup - PowerShell Version
# Run: powershell -ExecutionPolicy Bypass -File "START_ALL.ps1"

Write-Host ""
Write-Host "========================================"
Write-Host "🌴 COCOLYTICS FULL STACK STARTUP 🌴"
Write-Host "========================================"
Write-Host ""

# Check if running in correct directory
if ((Test-Path "backend") -eq $false) {
    Write-Host "❌ Error: Run this from C:\COCOLYTICS\Cocolytics directory" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting all services..." -ForegroundColor Green
Write-Host ""

# Terminal 1: Backend Server
Write-Host "📡 Starting Backend Server (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", {
    Set-Location $args[0]
    Write-Host "Installing dependencies..." -ForegroundColor Gray
    npm install 2>&1 | Out-Null
    Write-Host ""
    Write-Host "✅ Backend running on http://localhost:3000" -ForegroundColor Green
    node server.js
} -ArgumentList (Get-Location)

Start-Sleep -Seconds 3

# Terminal 2: ML Service
Write-Host "🔍 Starting ML Detection Service (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", {
    Set-Location (Join-Path $args[0] "ml-service")
    Write-Host "Installing Python dependencies..." -ForegroundColor Gray
    python -m pip install -r requirements.txt 2>&1 | Out-Null
    Write-Host ""
    Write-Host "✅ ML Service running on http://localhost:5000" -ForegroundColor Green
    python app.py
} -ArgumentList (Get-Location)

Start-Sleep -Seconds 3

# Terminal 3: Frontend
Write-Host "🎨 Starting Frontend Dev Server (Port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", {
    Set-Location (Join-Path $args[0] "frontend")
    Write-Host "Installing dependencies..." -ForegroundColor Gray
    npm install 2>&1 | Out-Null
    Write-Host ""
    Write-Host "✅ Frontend running on http://localhost:5173" -ForegroundColor Green
    npm run dev
} -ArgumentList (Get-Location)

Write-Host ""
Write-Host "✅ All Services Starting!" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Wait 15-20 seconds for all services to fully start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Then open in your browser:" -ForegroundColor Cyan
Write-Host "  🌐 http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services Running:" -ForegroundColor Green
Write-Host "  📡 Backend:    http://localhost:3000" -ForegroundColor Green
Write-Host "  🔍 ML Service: http://localhost:5000" -ForegroundColor Green
Write-Host "  🎨 Frontend:   http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "📸 Ready to use Camera Scanner!" -ForegroundColor Green
Write-Host ""
Write-Host "⌛ Press Ctrl+C to stop all services (may need to stop each window separately)" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to keep this window open"
