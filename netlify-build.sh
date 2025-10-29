#!/usr/bin/env bash
set -euo pipefail

echo "[netlify] Building site into docs/ and mdBook into docs/playground/"

# 1) Prepare docs folder with main site
rm -rf docs
mkdir -p docs

# Core pages (copy if present)
for item in index.html launch-website.html game-launcher.html game-preview-info.html warhammer-details.html; do
  if [ -e "$item" ]; then cp -f "$item" docs/; fi
done

# Static assets
for d in styles.css hackmit-style.css script.js assets favicon.png favicon.svg warhammer40k_game2; do
  if [ -e "$d" ]; then cp -R "$d" docs/; fi
done

# 2) Build mdBook playground under /playground
if [ -d mini-rust-playground ]; then
  MDBOOK_VERSION="0.4.40"
  echo "[netlify] Fetching mdBook v${MDBOOK_VERSION} binary"
  curl -sSL "https://github.com/rust-lang/mdBook/releases/download/v${MDBOOK_VERSION}/mdbook-v${MDBOOK_VERSION}-x86_64-unknown-linux-gnu.tar.gz" -o /tmp/mdbook.tgz
  mkdir -p .tools
  tar -xzf /tmp/mdbook.tgz -C .tools
  export PATH="$PWD/.tools:$PATH"
  echo "[netlify] mdbook version: $(mdbook --version)"

  mdbook build mini-rust-playground
  mkdir -p docs/playground
  cp -R mini-rust-playground/book/* docs/playground/
else
  echo "[netlify] mini-rust-playground not found; skipping mdBook build"
fi

echo "[netlify] Build complete. Publishing docs/"


