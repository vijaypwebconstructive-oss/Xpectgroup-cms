@echo off
echo ====================================
echo   Xpect Portal Backend Server
echo ====================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo.
    echo Please create a .env file with:
    echo   PORT=5000
    echo   NODE_ENV=development
    echo   MONGODB_URI=your_mongodb_connection_string
    echo   FRONTEND_URL=http://localhost:5173
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting backend server...
echo.
npm run dev
