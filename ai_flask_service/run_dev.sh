#!/usr/bin/env bash
# Simple dev script to start Flask (in venv) and optionally a Nest.js backend.
# Usage: ./run_dev.sh [path-to-nest-project]
set -euo pipefail
NEST_PATH=${1:-../nest-backend}   # default expected location; override by passing a path
LOGS_DIR=./logs
mkdir -p $LOGS_DIR

echo 'Starting Flask in background (venv)...'
if [ ! -d .venv ]; then
  echo 'Creating virtualenv .venv'
  python3 -m venv .venv
  source .venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt
  deactivate
fi

# Start flask in its own venv-backed shell
nohup bash -lc "source .venv/bin/activate && python app.py" > $LOGS_DIR/flask.log 2>&1 &
FLASK_PID=$!
echo "Flask started (pid=$FLASK_PID). Logs: $LOGS_DIR/flask.log"

# Optionally start Nest if present
if [ -d "$NEST_PATH" ]; then
  echo "Attempting to start Nest at: $NEST_PATH"
  cd "$NEST_PATH"
  if [ -f package.json ]; then
    # prefer pnpm/yarn/npm if available
    if command -v pnpm >/dev/null 2>&1; then
      nohup pnpm run start:dev > ../$LOGS_DIR/nest.log 2>&1 &
    elif command -v yarn >/dev/null 2>&1; then
      nohup yarn start:dev > ../$LOGS_DIR/nest.log 2>&1 &
    else
      nohup npm run start:dev > ../$LOGS_DIR/nest.log 2>&1 &
    fi
    NEST_PID=$!
    echo "Nest started (pid=$NEST_PID). Logs: $LOGS_DIR/nest.log"
  else
    echo "No package.json in $NEST_PATH — skipping Nest start"
  fi
  cd - >/dev/null 2>&1
else
  echo "Nest path not found ($NEST_PATH). To start Nest, pass its path as the first arg."
fi

echo "Done. Use 'ps -ef | grep python' or 'kill <pid>' to manage processes."
