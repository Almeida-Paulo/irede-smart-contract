#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/var/www/irede-smart-contract"

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "Repositorio nao encontrado em $REPO_DIR"
  exit 1
fi

cd "$REPO_DIR"
git fetch --all --prune
git pull --ff-only

nginx -t
systemctl reload nginx

echo "Deploy concluido com sucesso."
