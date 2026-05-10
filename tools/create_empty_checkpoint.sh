#!/usr/bin/env bash
set -euo pipefail

# create_empty_checkpoint.sh
# Safely creates an empty git commit with a timestamped maintenance message.
# Usage: ./create_empty_checkpoint.sh "optional custom commit message"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)
MSG=${1:-"chore(maint): automated checkpoint $(date -u +'%Y-%m-%d %H:%M:%SZ')"}

echo "Creating empty commit on branch: ${BRANCH:-unknown}"
# Create an empty commit so repo history records the maintenance checkpoint.
# This is non-destructive and does not change any files.

git commit --allow-empty -m "$MSG"

echo "Created empty commit: $MSG"
