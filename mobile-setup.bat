@echo off
REM Mobile Device Access Setup for Windows
REM Run this file directly or from command line

cls
echo.
echo ==========================================
echo  COCOLYTICS - MOBILE ACCESS SETUP
echo ==========================================
echo.
echo Step 1: Start Dev Server
echo ---
echo npm run dev
echo.
echo Step 2: Start Ngrok (in another terminal)
echo ---
echo npx ngrok@latest http 5173
echo.
echo Step 3: Access on Mobile
echo ---
echo Local Network (same WiFi):
echo   http://YOUR_IP:5173/login
echo.
echo Public Link (ngrok):
echo   https://ngrok-url/login
echo.
echo ==========================================
echo.
echo Finding your computer IP...
echo.
ipconfig | findstr IPv4
echo.
echo ==========================================
echo.
echo Look for "IPv4 Address: 192.168.x.x"
echo Use that IP on mobile: http://192.168.x.x:5173/login
echo.
echo A mobile button (📱) appears on login page to help!
echo.
pause
