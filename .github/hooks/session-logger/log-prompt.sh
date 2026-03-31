#!/usr/bin/env bash
# session-logger/log-prompt.sh
# Reads a Copilot hook JSON payload from stdin and logs the prompt metadata
# (not the full text) to logs/copilot/prompts.log.

set -euo pipefail

LOG_DIR="${LOG_DIR:-logs/copilot}"
PROMPTS_LOG="$LOG_DIR/prompts.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$LOG_DIR"

PAYLOAD=$(cat)
MSG_LENGTH=$(echo "$PAYLOAD" | python3 -c "
import sys, json
d = json.load(sys.stdin)
msg = d.get('userMessage', '')
print(len(msg))
" 2>/dev/null || echo "0")

python3 -c "
import json
entry = {
    'timestamp': '$TIMESTAMP',
    'event': 'userPromptSubmitted',
    'message_length': $MSG_LENGTH
}
print(json.dumps(entry))
" >> "$PROMPTS_LOG"

exit 0
