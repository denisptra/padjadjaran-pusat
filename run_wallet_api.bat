@echo off
echo ==================================================
echo WALLET & TRANSACTION API SETUP & RUNNER
echo ==================================================
echo.

echo [*] Installing dependencies (express, @prisma/client, prisma)...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [!] Failed to install dependencies. Please run 'npm install' manually.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [*] Setting up database (SQLite) and generating Prisma Client...
call npx prisma db push
if %ERRORLEVEL% neq 0 (
    echo [!] Prisma database sync failed. Please check your schema.prisma or run 'npx prisma db push' manually.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [✓] Setup completed successfully!
echo [*] Starting server (index.js)...
echo.
node index.js
pause
