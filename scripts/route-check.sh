#!/usr/bin/env sh
# SDR-1 fitness check: every route must be prerendered (○ static or ● SSG). A ƒ (dynamic) route means
# some page reads request data at runtime, which the architecture forbids.
# Usage: pnpm build | tee build.log && sh scripts/route-check.sh build.log
set -eu
log="${1:-build.log}"

if ! grep -q "Route (app)" "$log"; then
  echo "✗ no route table found in $log (did the build run?)"
  exit 1
fi

dynamic=$(grep -E "^[[:space:]┌├└│]*ƒ[[:space:]]" "$log" || true)
if [ -n "$dynamic" ]; then
  echo "✗ dynamic (ƒ) routes found; every route must be static (SDR-1):"
  echo "$dynamic"
  exit 1
fi

echo "✓ all routes are static"
