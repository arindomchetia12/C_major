@echo off
echo Starting Local Leads frontend client on http://localhost:3000 ...
set PORT=3000
set BASE_PATH=/
cd /d "Y:\C major\C_major"
pnpm --filter @workspace/local-leads run dev
