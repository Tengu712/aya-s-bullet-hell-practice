#!/bin/bash -e

(

cd orge

./vcpkg/bootstrap-vcpkg.sh

./vcpkg/vcpkg install --overlay-triplets=./triplets --triplet=custom-arm64-osx

meson setup build \
  -Dbuildtype=release \
  --prefix=$(pwd)/build/installed \
  --cmake-prefix-path=$(pwd)/vcpkg_installed/custom-arm64-osx \
  --default-library=shared

meson install -C build

cp $(pwd)/build/installed/lib/*.dylib ..

)
