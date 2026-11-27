#!/usr/bin/env bash
set -e

# Prerequisite verification
if ! command -v git >/dev/null 2>&1; then
  printf "Error: git is required but not installed. Please install git and re-run.\n" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  printf "Error: Node.js is required but not found in PATH. Please install Node.js >= 18.0.0.\n" >&2
  exit 1
fi

NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
  printf "Error: Node.js version 18.0.0 or higher is required (found %s).\n" "$(node -v)" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  printf "Error: npm is required but not found in PATH. Please install npm >= 9.0.0.\n" >&2
  exit 1
fi

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
SLOPPY_REF="${SLOPPY_REF:-main}"

printf "[1/4] Preparing Sloppy environment in %s...\n" "$INSTALL_DIR"
if [ "$INSTALL_DIR" != "$(pwd)" ]; then
  if [ -d "$INSTALL_DIR/.git" ]; then
    cd "$INSTALL_DIR"
    git fetch origin --tags --quiet
    git checkout "$SLOPPY_REF" --quiet 2>/dev/null || git checkout main --quiet
  else
    rm -rf "$INSTALL_DIR"
    git clone --depth 1 --branch "$SLOPPY_REF" https://github.com/Pavanspoojary/sloppy.git "$INSTALL_DIR" --quiet 2>/dev/null || \
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
ln -sf "$BIN_DIR/sloppy" "$BIN_DIR/sloppy-ai" 2>/dev/null || cp "$BIN_DIR/sloppy" "$BIN_DIR/sloppy-ai"

printf "[4/4] Configuring MCP servers and Agent Skills...\n"
"$BIN_DIR/sloppy" setup --write

printf "\n[INSTALLATION COMPLETE] Sloppy installed successfully.\n"
printf "Executable: %s/sloppy (and %s/sloppy-ai)\n" "$BIN_DIR" "$BIN_DIR"
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  printf "\nNote: Add %s to your PATH if not already present:\n" "$BIN_DIR"
  printf "  export PATH=\"\$PATH:%s\"\n" "$BIN_DIR"
fi
