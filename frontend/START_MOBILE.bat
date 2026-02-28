@echo off
cls
echo.
echo ==========================================
echo   STARTING SERVER FOR MOBILE ACCESS
echo ==========================================
echo.
echo Finding your computer's IP address...
echo.

REM Get the WiFi IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" ^| findstr /v "127.0.0.1"') do (
    set IP=%%a
    set IP=!IP: =!
    goto :found
)

:found
echo Your computer's IP address: %IP%
echo.
echo ==========================================
echo   INSTRUCTIONS FOR YOUR PHONE:
echo ==========================================
echo.
echo 1. Make sure your phone is on the SAME WiFi
echo 2. Open phone browser
echo 3. Type this URL:
echo.
echo    http://%IP%:5173/login
echo.
echo ==========================================
echo.
echo Starting dev server...
echo When you see "Network:" URL, use that on your phone!
echo.
echo Press Ctrl+C to stop the server
echo.
pause

npm run dev
