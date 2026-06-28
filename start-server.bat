@echo off
echo Starting API server...
set NODE_ENV=development
set PORT=5000
set "EMAIL_PASSWORD=wvdfcqgendxtugsx"

set "DATABASE_URL=postgresql://postgres:IphoneXr20@database-2.cluster-cc90ckmyk1hb.us-east-1.rds.amazonaws.com:5432/c_major?uselibpqcompat=true&sslmode=require"

cd /d "Y:\C major\C_major"
cmd /c "pnpm --filter @workspace/api-server run build 2>&1"
echo Build done. Starting server on http://localhost:5000 ...
pnpm --filter @workspace/api-server run start
set "EMAIL_PASSWORD=IphoneXr78@"
