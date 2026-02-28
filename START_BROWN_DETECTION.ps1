# 🚀 Quick Start - Brown Detection System
# Starts all three services: Backend, Frontend, ML Service

Write-Host "🌴 Starting Cocolytics Brown Detection System..." -ForegroundColor Green
Write-Host ""

# Check if ports are available
Write-Host "🔍 Checking ports..." -ForegroundColor Yellow

$portsInUse = @()

# Check port 3000 (Backend)
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "⚠️  Port 3000 already in use (Backend may be running)" -ForegroundColor Yellow
    $portsInUse += 3000
}

# Check port 5173 (Frontend)
$port5173 = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "⚠️  Port 5173 already in use (Frontend may be running)" -ForegroundColor Yellow
    $portsInUse += 5173
}

# Check port 5000 (ML Service)
$port5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Host "⚠️  Port 5000 already in use (ML Service may be running)" -ForegroundColor Yellow
    $portsInUse += 5000
}

if ($portsInUse.Count -gt 0) {
    Write-Host ""
    $response = Read-Host "Some services may already be running. Continue anyway? (y/n)"
    if ($response -ne 'y') {
        Write-Host "❌ Startup cancelled" -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "✅ Starting services..." -ForegroundColor Green
Write-Host ""

# Start ML Service
Write-Host "🤖 Starting ML Detection Service (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\ml-service'; python app.py"
Start-Sleep -Seconds 3

# Start Backend
Write-Host "⚙️  Starting Backend Server (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; node server.js"
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "🎨 Starting Frontend Dev Server (Port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎉 All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access from your phone:" -ForegroundColor Yellow
Write-Host "   http://192.168.68.101:5173/staff/camera-scanner" -ForegroundColor White
Write-Host ""
Write-Host "💻 Access from this computer:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173/staff/camera-scanner" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Service URLs:" -ForegroundColor Yellow
Write-Host "   Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:    http://localhost:3000" -ForegroundColor White
Write-Host "   ML Service: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📖 Press any key to open the complete guide..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open guide
Start-Process notepad "$PSScriptRoot\BROWN_DETECTION_COMPLETE_GUIDE.md"

Write-Host ""
Write-Host "✨ Happy scanning! Point your camera at brown cocolumber objects." -ForegroundColor Green
