#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npx firebase-tools@15.24.0 deploy --only firestore:rules,storage --project dateday-f8549 "$@"
