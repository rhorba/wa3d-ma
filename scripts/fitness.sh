#!/usr/bin/env sh
# Architecture §8 fitness checks that ESLint cannot express. Run in CI (quality job).
set -eu
status=0

# SDR-2: the filter island is the only client component.
client=$(grep -rlE "^['\"]use client['\"]" app components lib 2>/dev/null | grep -v '^components/filters/' || true)
if [ -n "$client" ]; then
  echo "✗ 'use client' outside components/filters/ (SDR-2):"; echo "$client"; status=1
fi

# ADR-8: data is rendered as text, never as HTML.
danger=$(grep -rln "dangerouslySetInnerHTML" app components lib 2>/dev/null || true)
if [ -n "$danger" ]; then
  echo "✗ dangerouslySetInnerHTML found (ADR-8):"; echo "$danger"; status=1
fi

# SDR-1: no middleware, route handlers or server actions.
server=$(
  find app \( -name 'route.ts' -o -name 'route.tsx' \) 2>/dev/null || true
  if [ -f middleware.ts ] || [ -f middleware.js ]; then echo middleware.ts; fi
  grep -rlE "^['\"]use server['\"]" app components lib 2>/dev/null || true
)
if [ -n "$server" ]; then
  echo "✗ server runtime code found (SDR-1):"; echo "$server"; status=1
fi

[ "$status" -eq 0 ] && echo "✓ fitness checks passed"
exit "$status"
