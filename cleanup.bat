@echo off
echo ==================================================
echo PPS PADJADJARAN - PROJECT CLEANUP SCRIPT
echo ==================================================
echo.

echo Deleting unused frontend files...
if exist "client\src\pages\public\PlaceholderPage.tsx" (
    del /f /q "client\src\pages\public\PlaceholderPage.tsx"
    echo   [DELETED] client\src\pages\public\PlaceholderPage.tsx
)
if exist "client\src\pages\admin-pusat\payments\Payments.tsx" (
    del /f /q "client\src\pages\admin-pusat\payments\Payments.tsx"
    echo   [DELETED] client\src\pages\admin-pusat\payments\Payments.tsx
)
if exist "client\src\pages\admin-pusat\members\MemberAdd.tsx" (
    del /f /q "client\src\pages\admin-pusat\members\MemberAdd.tsx"
    echo   [DELETED] client\src\pages\admin-pusat\members\MemberAdd.tsx
)
if exist "client\src\pages\admin-pusat\members\MemberEdit.tsx" (
    del /f /q "client\src\pages\admin-pusat\members\MemberEdit.tsx"
    echo   [DELETED] client\src\pages\admin-pusat\members\MemberEdit.tsx
)
if exist "client\src\components\common\GridShape.tsx" (
    del /f /q "client\src\components\common\GridShape.tsx"
    echo   [DELETED] client\src\components\common\GridShape.tsx
)

echo.
echo Deleting empty/unused frontend folders...
if exist "client\src\shared" (
    rmdir /s /q "client\src\shared"
    echo   [DELETED] client\src\shared\ (and all contents)
)
if exist "client\src\features\announcements" (
    rmdir /s /q "client\src\features\announcements"
    echo   [DELETED] client\src\features\announcements\ (and all contents)
)
if exist "client\src\features\auth\hooks" (
    rmdir /s /q "client\src\features\auth\hooks"
    echo   [DELETED] client\src\features\auth\hooks\ (and all contents)
)

echo.
echo Deleting unused backend scripts in root...
set scripts=check_perms.ts check_settings.ts check_sliders.ts check_stats.ts find_duplicates.ts fix_data.ts fix_duplicates.ts inspect_duplicates.ts patch_matrix.ts seed_pageviews.js temp_check_otp.js temp_clear_tokens.ts temp_fix_perms.ts test_neon.js

for %%s in (%scripts%) do (
    if exist "backend\%%s" (
        del /f /q "backend\%%s"
        echo   [DELETED] backend\%%s
    )
)

echo.
echo ==================================================
echo Cleanup completed successfully!
echo ==================================================
pause
