@echo off
REM Allow Vite Dev Server through Windows Firewall
REM Run this as Administrator if you can't access from mobile

echo.
echo ==========================================
echo  ALLOW VITE PORT 5173 IN FIREWALL
echo ==========================================
echo.
echo This script will allow port 5173 through Windows Firewall
echo so your mobile device can access the dev server.
echo.
echo If prompted, click "Yes" to allow administrator access.
echo.
pause

echo.
echo Creating firewall rule...
echo.

netsh advfirewall firewall add rule name="Vite Dev Server Port 5173" dir=in action=allow protocol=TCP localport=5173

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo  SUCCESS! Port 5173 is now allowed.
    echo ==========================================
    echo.
    echo Now restart your dev server:
    echo   npm run dev
    echo.
    echo Then visit this on your mobile:
    echo   http://YOUR_IP:5173/login
    echo.
    echo Find YOUR_IP by running: ipconfig
    echo Look for IPv4 Address: 192.168.x.x
    echo.
) else (
    echo.
    echo ==========================================
    echo  ERROR: Could not add firewall rule.
    echo ==========================================
    echo.
    echo Please run this script as Administrator:
    echo   1. Right-click this file
    echo   2. Select "Run as administrator"
    echo.
)

pause
