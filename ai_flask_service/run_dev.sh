#!/usr/bin/env bash
# Simple dev script to start Flask (in venv) only.
set -euo pipefail

LOGS_DIR=./logs
mkdir -p "$LOGS_DIR"

echo "Starting Flask in background (venv)..."

# Create venv if missing
if [ ! -d .venv ]; then
  echo "Creating virtualenv .venv"
  python3 -m venv .venv
  source .venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt
  deactivate
fi

# Kill any existing Flask app.py processes to avoid duplicates
pkill -f "python .*app.py" >/dev/null 2>&1 || true

# Start Flask in background using venv
nohup bash -lc "source .venv/bin/activate && python app.py" \
  > "$LOGS_DIR/flask.log" 2>&1 &

FLASK_PID=$!
echo "Flask started (pid=$FLASK_PID). Logs: $LOGS_DIR/flask.log"

echo "Done. Use 'tail -f $LOGS_DIR/flask.log' to watch logs."
