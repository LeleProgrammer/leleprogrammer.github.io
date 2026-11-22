@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js was not found. Please install Node.js 20 or newer:
  echo   https://nodejs.org/
  echo.
  pause
  exit /b 1
)

echo.
echo [1/2] Installing dependencies...
call npm install
if errorlevel 1 (
  echo.
  echo npm install failed. Check the error above.
  pause
  exit /b 1
)

echo.
echo [2/2] Starting the local preview...
echo     http://localhost:4321
echo     Press Ctrl+C to stop.
echo.
call npm run dev
pause
