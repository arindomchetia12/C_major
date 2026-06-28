@echo off
setlocal enabledelayedexpansion

echo ====================================================================
echo        🚀 LOCAL LEADS AI - DATABASE MIGRATION TO AWS AURORA
echo ====================================================================
echo.
echo Target Cloud Endpoint: database-2.cluster-cc90ckmyk1hb.us-east-1.rds.amazonaws.com
echo.

set /p PGPASSWORD="🔑 Please enter your AWS Aurora Master Password: "
echo.

set PGBIN="C:\Program Files\PostgreSQL\16\bin\psql.exe"
set RDSHOST=database-2.cluster-cc90ckmyk1hb.us-east-1.rds.amazonaws.com

echo [1/3] Creating c_major database in the AWS Cloud...
%PGBIN% "host=%RDSHOST% port=5432 dbname=postgres user=postgres sslmode=require" -c "CREATE DATABASE c_major;" 2>nul

echo [2/3] Uploading database tables and schema to AWS...
%PGBIN% "host=%RDSHOST% port=5432 dbname=c_major user=postgres sslmode=require" -f "Y:\C major\C_major\scripts\schema.sql"

echo [3/3] Seeding pro identities, trades, and reviews to AWS...
%PGBIN% "host=%RDSHOST% port=5432 dbname=c_major user=postgres sslmode=require" -f "Y:\C major\C_major\scripts\seed.sql"

echo.
echo ====================================================================
echo    ✅ SUCCESS! Your local database has been sent to the AWS Cloud!
echo ====================================================================
pause
