#!/bin/bash
# Stejný styl jako BX nástěnka: build + push na GitHub Pages (docs/).
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TOKEN_FILE="/Users/jakubvernoch/BX EXPO/03_AUTOMATIZACE/.local-secrets/.github-token"
MESSAGE="${1:-Aktualizace DateDay webu}"

if [[ ! -f "$TOKEN_FILE" ]]; then
  echo "CHYBA: Chybí GitHub token — $TOKEN_FILE"
  exit 1
fi

TOKEN="$(tr -d '[:space:]' < "$TOKEN_FILE")"
cd "$REPO_DIR"

npm run build
rm -rf docs
mkdir -p docs
cp -R dist/* docs/
touch docs/.nojekyll

git add docs
if git diff --cached --quiet; then
  echo "Žádné změny v docs/."
else
  git commit -m "$MESSAGE"
fi

git push "https://x-access-token:${TOKEN}@github.com/vernoch/dateday-web.git" HEAD:main
echo "Live: https://vernoch.github.io/dateday-web/"
