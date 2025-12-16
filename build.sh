#!/run/current-system/sw/bin/bash

set -e

pushd $( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
mkdir -p static
cp -rv ../chandlr-miso/static/img static/
cp -rv ../chandlr-miso/static/*css static/
cp -rv ../chandlr-miso/static/*js static/
cp -rv ../chandlr-miso/static/chandlr.wasm static/
cp -rv ../browser_wasi_shim/dist static/browser_wasi_shim
