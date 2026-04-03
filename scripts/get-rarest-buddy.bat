@echo off
echo ============================================================
echo   Claude Code Buddy - Get RAREST Shiny Legendary!
echo ============================================================
echo.

cd /d "%~dp0"

echo Step 1: Finding Legendary Shiny userID...
node find-legendary-shiny.js find 5000000 > temp_results.txt

echo.
echo Step 2: Reading results...
findstr "FOUND" temp_results.txt
findstr "user_" temp_results.txt

echo.
echo ============================================================
echo FOUND! Now update your config:
echo ============================================================
echo 1. Open: %USERPROFILE%\.claude.json
echo 2. Change "userID" to the ID found above
echo 3. DELETE the entire "companion" block
echo 4. Save the file
echo 5. Right-click file ^> Properties ^> Check "Read-only"
echo 6. Run Claude Code and type /buddy
echo ============================================================

del temp_results.txt
pause
