@echo off
title CodeSentinel local
cd /d "%~dp0"

echo.
echo === CodeSentinel local start ===
echo.

REM MySQL (XAMPP) with skip-grant for local only
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I "mysqld.exe" >NUL
if errorlevel 1 (
  echo Starting MySQL...
  start "" /MIN "C:\xampp\mysql\bin\mysqld.exe" --defaults-file=C:\xampp\mysql\bin\my.ini --skip-grant-tables --console
  timeout /t 4 /nobreak >NUL
) else (
  echo MySQL already running.
)

REM API
echo Starting API on :3000 ...
start "CodeSentinel API" cmd /k "cd /d %~dp0server && node src/server.js"

timeout /t 2 /nobreak >NUL

REM Frontend
echo Starting frontend on :5173 ...
start "CodeSentinel UI" cmd /k "cd /d %~dp0client && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 4 /nobreak >NUL
start "" "http://127.0.0.1:5173/login"

echo.
echo Opened http://127.0.0.1:5173/login
echo Demo login: demo@codesentinel.local / Demo1234!
echo Keep the two black windows open while testing.
echo.
pause
