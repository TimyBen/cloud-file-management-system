# helper: creates venv if needed and runs flask in foreground (macOS friendly)
if [ ! -d .venv ]; then
  python3 -m venv .venv
  source .venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt
else
  source .venv/bin/activate
fi
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --host=${FLASK_HOST:-127.0.0.1} --port=${FLASK_PORT:-5000}
