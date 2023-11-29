This is the backend app for my simple todos app.

## Building the project
First you will need to install the packages from requirements.txt
for instance if you want to use venv then run:
```bash
# create venv
python -m venv venv
# activate the venv
... depends on os
pip install -r requirements.txt
```

## Running the project
If you are using vscode you can simply use the run&debug to run the backend app after doing the mentioned steps. 
You can also run the app manually with:
```bash
python -m uvicorn main:app --reload --port 8080
```
After running the project goto 
http://127.0.0.1:8080/docs 
for a web based swagger docs.

## Known bugs
1. Ordering doesn't work when TodoItem/TodoCategory order value is the same but ids are different
2. Updating the order of TodoCategory in a project affects other projects where this TodoCategory is linked to