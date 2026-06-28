@echo off
set PGBIN=C:\Program Files\PostgreSQL\16\bin
set PGPASSWORD=postgres
"%PGBIN%\psql.exe" -U postgres -c "CREATE DATABASE c_major;" 2>&1
echo DB creation done (ignore error if already exists)
