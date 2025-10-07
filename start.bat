@echo off
c:\Users\PC_User\Desktop\Atashinchi-study\node-v20.17.0-win-x64\npm.cmd run build
if %errorlevel% neq 0 exit /b %errorlevel%
c:\Users\PC_User\Desktop\Atashinchi-study\node-v20.17.0-win-x64\node.exe server.js