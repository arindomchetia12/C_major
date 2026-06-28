$ErrorActionPreference = "Stop"

$RDSHOST = "database-2.cluster-cc90ckmyk1hb.us-east-1.rds.amazonaws.com"
$PGBIN = "C:\Program Files\PostgreSQL\16\bin"

Write-Host "Generating AWS RDS IAM Auth Token..." -ForegroundColor Cyan
$TOKEN = (aws rds generate-db-auth-token --hostname $RDSHOST --port 5432 --username postgres --region us-east-1)

if (-not $TOKEN) {
    Write-Host "Failed to generate auth token. Please verify AWS CLI is configured." -ForegroundColor Red
    exit 1
}

Write-Host "Token generated successfully!" -ForegroundColor Green

# 1. Create c_major database
Write-Host "Creating c_major database in Aurora..." -ForegroundColor Cyan
$CONN_STR_POSTGRES = "host=$RDSHOST port=5432 dbname=postgres user=postgres sslmode=require password=$TOKEN"
& "$PGBIN\psql.exe" $CONN_STR_POSTGRES -c "CREATE DATABASE c_major;" 2>&1

# 2. Apply schema
Write-Host "Applying schema to c_major..." -ForegroundColor Cyan
$CONN_STR_CMAJOR = "host=$RDSHOST port=5432 dbname=c_major user=postgres sslmode=require password=$TOKEN"
& "$PGBIN\psql.exe" $CONN_STR_CMAJOR -f "Y:\C major\C_major\scripts\schema.sql" 2>&1

# 3. Apply seed data
Write-Host "Seeding pro identities and reviews to Aurora..." -ForegroundColor Cyan
& "$PGBIN\psql.exe" $CONN_STR_CMAJOR -f "Y:\C major\C_major\scripts\seed.sql" 2>&1

Write-Host "Aurora Database seeded successfully!" -ForegroundColor Green
