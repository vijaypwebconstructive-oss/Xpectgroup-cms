@echo off
echo ============================================
echo   Starting Xpect Portal Backend Server
echo ============================================
echo.

cd /d "%~dp0backend"

echo Checking setup...
if not exist .env (
    echo.
    echo [ERROR] .env file not found!
    echo.
    echo Please create backend/.env with:
    echo   PORT=5000
    echo   NODE_ENV=development
    echo   MONGODB_URI=mongodb://localhost:27017/xpect-portal
    echo   FRONTEND_URL=http://localhost:5173
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo.
echo Starting backend server...
echo.
echo Keep this window open!
echo.
echo Once you see "Server is running on port 5000",
echo you can submit the onboarding form.
echo.
echo ============================================
echo.

npm run dev

pause
