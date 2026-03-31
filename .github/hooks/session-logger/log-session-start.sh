#!/usr/bin/env bash
# session-logger/log-session-start.sh
# Logs the start of a Copilot session to logs/copilot/session.log.

set -euo pipefail

LOG_DIR="${LOG_DIR:-logs/copilot}"
SESSION_LOG="$LOG_DIR/session.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$LOG_DIR"

python3 -c "
import json
entry = {
    'timestamp': '$TIMESTAMP',
    'event': 'sessionStart',
    'cwd': '$(pwd)'
}
print(json.dumps(entry))
" >> "$SESSION_LOG"

exit 0
