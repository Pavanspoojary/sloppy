#!/usr/bin/env bash
set -e

# Detect if running from an existing repository clone
if [ -z "$SLOPPY_DIR" ]; then
  if [ -f "./package.json" ] && grep -q '"name": "sloppy-monorepo"' "./package.json" 2>/dev/null; then
    INSTALL_DIR="$(pwd)"
  else
    INSTALL_DIR="$HOME/.sloppy"
  fi
else
  INSTALL_DIR="$SLOPPY_DIR"
fi

BIN_DIR="${SLOPPY_BIN_DIR:-$HOME/.local/bin}"

printf "[1/4] Preparing Sloppy environment in %s...\n" "$INSTALL_DIR"
if [ "$INSTALL_DIR" != "$(pwd)" ]; then
  if [ -d "$INSTALL_DIR/.git" ]; then
    cd "$INSTALL_DIR"
    git fetch origin main --quiet
    git reset --hard origin/main --quiet
  else
    rm -rf "$INSTALL_DIR"
    git clone --depth 1 https://github.com/Pavanspoojary/sloppy.git "$INSTALL_DIR" --quiet
    cd "$INSTALL_DIR"
  fi
else
  cd "$INSTALL_DIR"
fi

printf "[2/4] Building packages locally in %s...\n" "$INSTALL_DIR"
npm install --quiet --no-audit --no-fund
npm run build --quiet

printf "[3/4] Installing standalone executable into %s...\n" "$BIN_DIR"
mkdir -p "$BIN_DIR"

cat << EOF > "$BIN_DIR/sloppy"
#!/usr/bin/env bash
SLOPPY_DIR="\${SLOPPY_DIR:-$INSTALL_DIR}"
exec node "\$SLOPPY_DIR/packages/cli/bin/sloppy.js" "\$@"
EOF
chmod +x "$BIN_DIR/sloppy"

# Also symlink into /usr/local/bin if writable
if [ -w "/usr/local/bin" ] && [ ! -e "/usr/local/bin/sloppy" ]; then
  ln -sf "$BIN_DIR/sloppy" "/usr/local/bin/sloppy" 2>/dev/null || true
fi

printf "[4/4] Configuring MCP servers and Agent Skills...\n"
"$BIN_DIR/sloppy" setup --write

printf "\n[INSTALLATION COMPLETE] Sloppy installed successfully.\n"
printf "Executable: %s/sloppy\n" "$BIN_DIR"
if [[ ":$PATH:" != *":$BIN_DIR:"* ]] && [[ ":$PATH:" != *":/usr/local/bin:"* ]]; then
  printf "\nNote: Add %s to your PATH if not already present:\n" "$BIN_DIR"
  printf "  export PATH=\"\$PATH:%s\"\n" "$BIN_DIR"
fi
