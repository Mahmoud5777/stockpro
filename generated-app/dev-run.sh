#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
( cd "$DIR/"'server' && mvn spring-boot:run ) &
( cd "$DIR/"'client' && npm install && npm run dev ) &
wait
