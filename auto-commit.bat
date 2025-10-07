@echo off
REM 自動git追加・コミットスクリプト
cd /d "%~dp0"

echo ====================================
echo Git Auto Commit Script
echo ====================================
echo.

REM 変更されたファイルを確認
git status --short
echo.

REM 全てのファイルをステージング
echo Adding all files...
git add -A

REM 変更があるかチェック
git diff --staged --quiet
if %errorlevel% equ 0 (
    echo No changes to commit.
    pause
    exit /b 0
)

REM コミット(タイムスタンプ付き)
echo.
echo Committing changes...
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (set mydate=%%a-%%b-%%c)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a:%%b)
set commitMsg=Auto-commit: %mydate% %mytime%

git commit -m "%commitMsg%"

REM プッシュするか確認
echo.
set /p pushChoice="Push to GitHub? (y/n): "
if /i "%pushChoice%"=="y" (
    echo Pushing to origin/main...
    git push origin main
    echo.
    echo Push completed!
) else (
    echo Skipped push.
)

echo.
echo ====================================
echo Done!
echo ====================================
pause
