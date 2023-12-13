call git stash save -m "run-windows stashed your changes before pulling from remote"
call git pull
cd backend
if not exist venv python -m venv venv
call venv\Scripts\pip.exe install -r requirements.txt
del .env
rem Saved in .\.env
@echo off
echo ALLOWED_ORIGINS = ["http://localhost", "http://localhost:4173","http://localhost:5173", "http://localhost:5174"]> .\.env
echo IS_LOG_SQLALCHEMY_ENABLED = True >> .\.env
start cmd.exe @cmd /k "venv\Scripts\python -m uvicorn main:app --reload --port 8080"
cd ..
cd frontend
call npm i
call npm run open-api:generate:windows
call npm run build
call npm run preview
pause