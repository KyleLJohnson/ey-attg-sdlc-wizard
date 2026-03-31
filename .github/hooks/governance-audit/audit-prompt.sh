#!/usr/bin/env bash
# governance-audit/audit-prompt.sh
# Reads a Copilot hook JSON payload from stdin, extracts the user message,
# checks for governance threat patterns, and logs findings.
#
# Environment variables:
#   GOVERNANCE_LEVEL      open | standard | strict | locked  (default: standard)
#   BLOCK_ON_THREAT       true | false                        (default: false)
#   SKIP_GOVERNANCE_AUDIT true                                (skip all checks)

set -euo pipefail

[ "${SKIP_GOVERNANCE_AUDIT:-}" = "true" ] && exit 0

GOVERNANCE_LEVEL="${GOVERNANCE_LEVEL:-standard}"
BLOCK_ON_THREAT="${BLOCK_ON_THREAT:-false}"
LOG_DIR="${LOG_DIR:-logs/copilot/governance}"
LOG_FILE="$LOG_DIR/audit.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$LOG_DIR"

# Read payload from stdin
PAYLOAD=$(cat)
USER_MESSAGE=$(echo "$PAYLOAD" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('userMessage',''))" 2>/dev/null || echo "")

if [ -z "$USER_MESSAGE" ]; then
  exit 0
fi

# Threat detection patterns and scores
declare -A PATTERNS
PATTERNS["data_exfiltration"]="exfiltrate|steal.*data|dump.*database|export.*credentials|send.*secrets.*to"
PATTERNS["privilege_escalation"]="sudo|chmod 777|run as root|bypass.*auth|disable.*security|override.*policy"
PATTERNS["system_destruction"]="delete.*all|drop.*table|rm -rf|format.*disk|wipe.*data|destroy.*env"
PATTERNS["prompt_injection"]="ignore.*previous.*instructions|disregard.*rules|pretend.*you are|act as if|new.*persona"
PATTERNS["credential_exposure"]="password|api.key|secret.key|access.token|private.key|\.env file"

declare -A SCORES
SCORES["data_exfiltration"]="0.80"
SCORES["privilege_escalation"]="0.85"
SCORES["system_destruction"]="0.92"
SCORES["prompt_injection"]="0.75"
SCORES["credential_exposure"]="0.90"

THREAT_FOUND=false
THREAT_CATEGORY=""
THREAT_SCORE="0.0"

for CATEGORY in "${!PATTERNS[@]}"; do
  PATTERN="${PATTERNS[$CATEGORY]}"
  if echo "$USER_MESSAGE" | grep -qiE "$PATTERN"; then
    THREAT_FOUND=true
    THREAT_CATEGORY="$CATEGORY"
    THREAT_SCORE="${SCORES[$CATEGORY]}"
    break
  fi
done

# Build log entry
LOG_ENTRY=$(python3 -c "
import json, sys
entry = {
    'timestamp': '$TIMESTAMP',
    'event': 'userPromptSubmitted',
    'governance_level': '$GOVERNANCE_LEVEL',
    'threat_found': $THREAT_FOUND,
    'threat_category': '$THREAT_CATEGORY',
    'threat_score': $THREAT_SCORE,
    'message_length': len('$USER_MESSAGE'),
    'action': 'blocked' if ('$BLOCK_ON_THREAT' == 'true' and $THREAT_FOUND) else 'logged'
}
print(json.dumps(entry))
")

echo "$LOG_ENTRY" >> "$LOG_FILE"

# Block if configured
if [ "$BLOCK_ON_THREAT" = "true" ] && [ "$THREAT_FOUND" = "true" ]; then
  echo "GOVERNANCE BLOCK: Threat category '$THREAT_CATEGORY' detected (score: $THREAT_SCORE). Prompt blocked per GOVERNANCE_LEVEL=$GOVERNANCE_LEVEL." >&2
  exit 1
fi

exit 0
