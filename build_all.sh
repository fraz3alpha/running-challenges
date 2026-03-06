#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# shellcheck source=build/version.sh
source build/version.sh
export EXTENSION_BUILD_VERSION EXTENSION_BUILD_ID

pnpm --filter running-challenges-extension run build:extension
