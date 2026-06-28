@echo off
set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -d c_major -f "Y:\C major\C_major\scripts\seed.sql" 2>&1
echo Seed data applied successfully!
