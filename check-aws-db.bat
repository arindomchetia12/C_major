@echo off
set PGPASSWORD=IphoneXr20
set PGBIN="C:\Program Files\PostgreSQL\16\bin\psql.exe"
set RDSHOST=database-2.cluster-cc90ckmyk1hb.us-east-1.rds.amazonaws.com

echo ====================================================================
echo        🚀 AWS AURORA CLOUD DATABASE - LIVE SQL OUTPUT
echo ====================================================================
echo.
echo [1/3] Fetching live output of PROVIDERS table from AWS...
%PGBIN% -h %RDSHOST% -p 5432 -U postgres -d c_major -c "SELECT id, name, trade, city, hourly_rate, is_verified FROM providers;"

echo.
echo [2/3] Fetching live output of REVIEWS table from AWS...
%PGBIN% -h %RDSHOST% -p 5432 -U postgres -d c_major -c "SELECT id, provider_id, reviewer_name, rating, comment FROM reviews;"

echo.
echo [3/3] Fetching live output of PORTFOLIO_ITEMS table from AWS...
%PGBIN% -h %RDSHOST% -p 5432 -U postgres -d c_major -c "SELECT id, provider_id, image_url, caption FROM portfolio_items;"

echo.
echo ====================================================================
echo    ✅ SUCCESS! Live database output fetched directly from AWS!
echo ====================================================================
pause
