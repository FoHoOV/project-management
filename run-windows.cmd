REM pulling the new changes
call git stash save -m "run-windows stashed your changes before pulling from remote"
call git pull

REM moving to backend folder
cd backend

REM installing python dependencies
python -m pip install pipenv --user
python -m pipenv install 

REM creating the .env file
del .env
@echo off
echo ALLOWED_ORIGINS = ["http://localhost", "http://localhost:4173","http://localhost:5173", "http://localhost:5174"] > .\.env
echo IS_SQLALCHEMY_LOG_ENABLED  = True >> .\.env
echo SQLALCHEMY_DATABASE_URL = "sqlite:///./todos.db" >> .\.env
echo SECRET_KEY = "933bd8fa378e6e90ed4841d81986906b8d3eaa72fcc4fc8b0c452b3139164126" >> .\.env

REM creating the .env.integration file
del .env.integration
@echo off
echo SQLALCHEMY_DATABASE_URL = "sqlite:///./todos_test.db" >> .\.env.integration

REM starting the backend server on port 8080
start cmd.exe @cmd /k ".venv\Scripts\python -m uvicorn main:app --reload --port 8080"

REM moving to frontend folder
cd ..
cd frontend

REM creating the .env file
del .env
@echo off
echo PUBLIC_API_URL = http://127.0.0.1:8080 > .\.env
echo PUBLIC_API_REQUEST_TIMEOUT_MS = 10000 >> .\.env
echo PUBLIC_COOKIES_EXPIRATION_SPAN_SECONDS = 5184000 >> .\.env

REM creating the .env.integration file
del .env.integration
@echo off
echo PUBLIC_API_URL = http://127.0.0.1:8090 > .\.env.integration

REM installing dependencies
call npm i --legacy-peer-deps
call npm run open-api:generate:windows
call npm run build
call npm run preview

REM prevent closing the current cmd
pause
