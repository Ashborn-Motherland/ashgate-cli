#!/bin/sh
set -e

# =======================================================
# Script d'installation automatique ultra-rapide pour Ashgate CLI
# Usage: curl -fsSL https://ashgateway.com/install.sh | bash
# =======================================================

REPO="Ashborn-Motherland/ashgate-cli"
SERVER_URL="https://api.ashgateway.com/cli"

echo "[INFO] Installation de Ashgate CLI..."

# 1. Vérification / Installation de Node.js si nécessaire
if ! command -v node >/dev/null 2>&1; then
  echo "[INFO] Node.js non détecté. Installation de Node.js..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -qq && sudo apt-get install -y nodejs
  elif command -v brew >/dev/null 2>&1; then
    brew install node
  else
    echo "[FAIL] Veuillez installer Node.js v18+ pour continuer (https://nodejs.org)."
    exit 1
  fi
fi

# 2. Emplacements Cibles
LIB_DIR="/usr/local/lib/ashgate"
BIN_DIR="/usr/local/bin"
USE_SUDO=0

if [ ! -w "$BIN_DIR" ] || [ ! -w "/usr/local/lib" ]; then
  if command -v sudo >/dev/null 2>&1; then
    USE_SUDO=1
  else
    LIB_DIR="$HOME/.local/lib/ashgate"
    BIN_DIR="$HOME/.local/bin"
    mkdir -p "$LIB_DIR" "$BIN_DIR"
  fi
fi

TMP_JS="/tmp/ashgate.js"
PRIMARY_URL="${SERVER_URL}/ashgate.js"
RAW_URL="https://raw.githubusercontent.com/${REPO}/main/bundle/index.js"
FALLBACK_URL="https://github.com/${REPO}/releases/latest/download/ashgate.js"

# 3. Téléchargement du bundle JS optimisé
if ! curl -fsSL "$PRIMARY_URL" -o "$TMP_JS" 2>/dev/null; then
  if ! curl -fsSL "$RAW_URL" -o "$TMP_JS" 2>/dev/null; then
    echo "[INFO] Téléchargement du bundle via le miroir GitHub..."
    curl -fsSL "$FALLBACK_URL" -o "$TMP_JS"
  fi
fi

TMP_LAUNCHER="/tmp/ashgate_launcher"
cat << 'EOF' > "$TMP_LAUNCHER"
#!/bin/sh
exec node /usr/local/lib/ashgate/ashgate.js "$@"
EOF

if [ "$USE_SUDO" -eq 1 ]; then
  sudo mkdir -p "$LIB_DIR" "$BIN_DIR"
  sudo mv "$TMP_JS" "$LIB_DIR/ashgate.js"
  sudo mv "$TMP_LAUNCHER" "$BIN_DIR/ashgate"
  sudo chmod +x "$BIN_DIR/ashgate"
else
  mkdir -p "$LIB_DIR" "$BIN_DIR"
  sed -i "s|/usr/local/lib/ashgate|$LIB_DIR|g" "$TMP_LAUNCHER" 2>/dev/null || true
  mv "$TMP_JS" "$LIB_DIR/ashgate.js"
  mv "$TMP_LAUNCHER" "$BIN_DIR/ashgate"
  chmod +x "$BIN_DIR/ashgate"
fi

echo "===================================================="
echo "[OK] Ashgate CLI installé avec succès dans ${BIN_DIR}/ashgate !"
echo "===================================================="
echo "Exécutez 'ashgate doctor' pour vérifier votre installation."
