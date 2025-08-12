@echo off
echo ========================================
echo    Kanban Board API Setup & Start
echo ========================================
echo.

echo [1/3] Checking if MongoDB is required...
echo If using local MongoDB, make sure it's running:
echo   - Windows Service: net start MongoDB
echo   - Manual: mongod --dbpath "C:\data\db"
echo.

echo [2/3] Seeding database with sample data...
call npm run seed
echo.

echo [3/3] Starting the API server...
echo Server will be available at: http://localhost:3000
echo.
echo Available endpoints:
echo   GET  http://localhost:3000/health
echo   GET  http://localhost:3000/api/tasks
echo   POST http://localhost:3000/api/tasks
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm start
