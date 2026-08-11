#!/bin/sh
set -e

# =======================================================
# Script d'installation automatique pour Ashgate CLI
# Usage: curl -fsSL https://raw.githubusercontent.com/Ashborn-Motherland/ashgate-cli/main/scripts/install.sh | sh
# =======================================================

REPO="Ashborn-Motherland/ashgate-cli"

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS" in
  linux*)   
    PLATFORM="linux-x64" 
    BINARY_FILE="ashgate-linux-x64"
    ;;
  darwin*)
    if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
      PLATFORM="macos-arm64"
      BINARY_FILE="ashgate-macos-arm64"
    else
      PLATFORM="macos-x64"
      BINARY_FILE="ashgate-macos-x64"
    fi
    ;;
  msys*|mingw*|cygwin*) 
    PLATFORM="win-x64"
    BINARY_FILE="ashgate-win-x64.exe"
    ;;
  *)
    echo "❌ Système d'exploitation non supporté : $OS ($ARCH)"
    exit 1
    ;;
esac

DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/${BINARY_FILE}"

echo "🚀 Téléchargement de Ashgate CLI (${PLATFORM})..."

DEST_DIR="/usr/local/bin"
USE_SUDO=0

if [ ! -w "$DEST_DIR" ]; then
  if command -v sudo >/dev/null 2>&1; then
    USE_SUDO=1
  else
    DEST_DIR="$HOME/.local/bin"
    mkdir -p "$DEST_DIR"
  fi
fi

TARGET_PATH="${DEST_DIR}/ashgate"
TMP_FILE="/tmp/ashgate_binary_download"

curl -fsSL "$DOWNLOAD_URL" -o "$TMP_FILE"
chmod +x "$TMP_FILE"

if [ "$USE_SUDO" -eq 1 ]; then
  sudo mv "$TMP_FILE" "$TARGET_PATH"
else
  mv "$TMP_FILE" "$TARGET_PATH"
fi

echo "===================================================="
echo "✅ Ashgate CLI installé avec succès dans ${TARGET_PATH} !"
echo "===================================================="
echo "Exécutez 'ashgate doctor' pour vérifier votre installation."
