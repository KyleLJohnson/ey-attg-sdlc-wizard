#!/usr/bin/env bash
# governance-audit/audit-session-start.sh
# Logs the start of a Copilot session to the governance audit log.

set -euo pipefail

[ "${SKIP_GOVERNANCE_AUDIT:-}" = "true" ] && exit 0

LOG_DIR="${LOG_DIR:-logs/copilot/governance}"
LOG_FILE="$LOG_DIR/audit.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GOVERNANCE_LEVEL="${GOVERNANCE_LEVEL:-standard}"

mkdir -p "$LOG_DIR"

python3 -c "
import json
entry = {
    'timestamp': '$TIMESTAMP',
    'event': 'sessionStart',
    'governance_level': '$GOVERNANCE_LEVEL',
    'cwd': '$(pwd)'
}
print(json.dumps(entry))
" >> "$LOG_FILE"

exit 0
