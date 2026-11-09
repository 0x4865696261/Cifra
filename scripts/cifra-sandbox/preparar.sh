#!/usr/bin/env bash
set -euo pipefail

node_exe="$1"
npm_exe="$2"
raiz=/opt/cifra
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
  gcc g++ golang-go rustc default-jdk-headless python3 ruby php-cli dotnet-sdk-10.0
id cifra-runner >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin cifra-runner
install -d -m 0755 "$raiz" "$raiz/bin"
install -d -o cifra-runner -g cifra-runner -m 0700 "$raiz/go-cache"
ln -sfn "$node_exe" "$raiz/bin/node"
export PATH="$raiz/bin:$(dirname "$npm_exe"):$PATH"
"$npm_exe" install --prefix "$raiz" --no-audit --no-fund --omit=dev \
  typescript@5.9.3 @types/node@24 jsdom@27.4.0

for archivo in runner.py sql.py web.cjs; do
  install -o root -g root -m 0644 "/tmp/cifra-$archivo" "$raiz/$archivo"
  rm "/tmp/cifra-$archivo"
done
(
  cd /tmp
  GOCACHE="$raiz/go-cache" sudo --preserve-env=GOCACHE -u cifra-runner /usr/bin/go list -export fmt os strconv strings >/dev/null
)
apt-get clean
"$raiz/bin/node" --version
dotnet --version
rustc --version
go version
gcc --version | head -n 1
javac -version
python3 --version
ruby --version
php --version | head -n 1
