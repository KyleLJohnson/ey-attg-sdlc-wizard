#!/usr/bin/env bash
# governance-audit/audit-session-end.sh
# Logs the end of a Copilot session and outputs a threat summary.

set -euo pipefail

[ "${SKIP_GOVERNANCE_AUDIT:-}" = "true" ] && exit 0

LOG_DIR="${LOG_DIR:-logs/copilot/governance}"
LOG_FILE="$LOG_DIR/audit.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GOVERNANCE_LEVEL="${GOVERNANCE_LEVEL:-standard}"

mkdir -p "$LOG_DIR"

# Count threats in this session (approximate: last 1000 lines)
THREAT_COUNT=$(tail -1000 "$LOG_FILE" 2>/dev/null | grep '"threat_found": true' | wc -l | tr -d ' ')

python3 -c "
import json
entry = {
    'timestamp': '$TIMESTAMP',
    'event': 'sessionEnd',
    'governance_level': '$GOVERNANCE_LEVEL',
    'threats_this_session': $THREAT_COUNT
}
print(json.dumps(entry))
" >> "$LOG_FILE"

if [ "$THREAT_COUNT" -gt 0 ]; then
  echo "GOVERNANCE AUDIT: $THREAT_COUNT potential threat(s) logged this session. Review $LOG_FILE." >&2
fi

exit 0
