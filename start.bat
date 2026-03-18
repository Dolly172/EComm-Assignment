@echo off
echo ========================================
echo  E-commerce Dynamic Product System
echo  Starting Development Servers
echo ========================================
echo.

REM Check if node_modules exists in backend
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Check if node_modules exists in frontend
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

REM Check if database is seeded
if not exist "backend\.seeded" (
    echo.
    echo Seeding sample data to database...
    cd backend
    call npm run seed
    type nul > .seeded
    cd ..
)

echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  Servers Starting...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
