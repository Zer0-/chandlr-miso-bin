#!/run/current-system/sw/bin/bash

set -e

# Get absolute path to this script's directory
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
pushd "$SCRIPT_DIR" >/dev/null

# Ensure chandlr-miso exists
if [[ ! -d ../chandlr-miso ]]; then
  echo "Error: ../chandlr-miso not found" >&2
  exit 1
fi

# Get the commit hash from chandlr-miso
COMMIT_HASH=$(git -C ../chandlr-miso rev-parse HEAD)
if [[ -z "$COMMIT_HASH" ]]; then
  echo "Error: Could not get commit hash from ../chandlr-miso" >&2
  exit 1
fi

echo "Upstream commit: $COMMIT_HASH"

# Clean and recreate static directory
rm -rf static
mkdir -p static

# Copy assets
cp -rv ../chandlr-miso/static/img static/
cp -rv ../chandlr-miso/static/*.css static/
cp -rv ../chandlr-miso/static/*.js static/
cp -rv ../chandlr-miso/static/chandlr.wasm static/
cp -rv ../chandlr-miso/static/index.html static/
cp -rv ../browser_wasi_shim/dist static/browser_wasi_shim

# Minify WASM
echo "Minifying chandlr.wasm..."
wasm-opt -Oz --strip-debug static/chandlr.wasm -o static/chandlr.wasm.min
mv static/chandlr.wasm.min static/chandlr.wasm

# Minify JavaScript using Bun
echo "Minifying all.js with Bun..."
bunx swc static/all.js -o static/all.js

# Stage changes
git add static/
git add build.sh

# Prepare commit message
COMMIT_MSG="Deploy static assets from chandlr-miso@$COMMIT_HASH"

# Open editor for the user to review/edit and confirm commit
git commit --edit -m "$COMMIT_MSG"
