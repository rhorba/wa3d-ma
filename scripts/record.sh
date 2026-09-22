#!/usr/bin/env sh
# CLAUDE.md rule 9 / runbook R5: records the critical journeys and keeps the video as
# .recordings/v<version>-<YYYY-MM-DD>.webm. Needs a production fixture build with the archive on:
#   WA3D_DATA_DIR=tests/fixtures/catalogue/valid NEXT_PUBLIC_ARCHIVE_ENABLED=true pnpm build
# Usage: pnpm e2e:record <version>   (e.g. pnpm e2e:record 0.2)
set -eu

version="${1:?usage: pnpm e2e:record <version>}"
rm -rf test-results/record
pnpm exec playwright test --config playwright.record.config.ts

video=$(find test-results/record -name '*.webm' | head -n 1)
[ -n "$video" ] || { echo "no video recorded" >&2; exit 1; }
mkdir -p .recordings
target=".recordings/v${version}-$(date +%Y-%m-%d).webm"
cp "$video" "$target"
echo "recorded $target"
