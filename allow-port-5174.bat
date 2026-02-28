@echo off
REM Allow Vite Dev Server Port 5174
REM Run this as Administrator

echo.
echo ==========================================
echo  ALLOW PORT 5174 IN FIREWALL
echo ==========================================
echo.
echo This will allow your phone to connect to the dev server.
echo.
pause

netsh advfirewall firewall add rule name="Vite Dev Server Port 5174" dir=in action=allow protocol=TCP localport=5174

if %errorlevel% equ 0 (
    echo.
    echo SUCCESS! Port 5174 is now allowed.
    echo.
    echo Now try these URLs on your phone:
    echo   http://192.168.68.101:5174/login
    echo   http://192.168.25.35:5174/login
    echo   http://192.168.25.36:5174/login
    echo.
) else (
    echo.
    echo ERROR: Run this script as Administrator
    echo Right-click and select "Run as administrator"
    echo.
)

pause
