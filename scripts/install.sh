#!/usr/bin/env bash
# install.sh — Script d'installation de ashgate-cli
# Usage : bash scripts/install.sh

set -euo pipefail

REPO="Blasterx7/ash-wallet"
BINARY_NAME="ashgate"
INSTALL_DIR="/usr/local/bin"
VERSION="${WALLET_CLI_VERSION:-latest}"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

info() { echo -e "${CYAN}→${RESET} $1"; }
success() { echo -e "${GREEN}✓${RESET} $1"; }
warn() { echo -e "${YELLOW}⚠${RESET} $1"; }
error() { echo -e "${RED}✗${RESET} $1"; exit 1; }

# Détection OS/Architecture
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux*)  PLATFORM="linux" ;;
  Darwin*) PLATFORM="macos" ;;
  *)       error "Système non supporté: $OS. Installez manuellement via pnpm: pnpm install -g ashgate-cli" ;;
esac

case "$ARCH" in
  x86_64)  ARCH_LABEL="x64" ;;
  arm64|aarch64) ARCH_LABEL="arm64" ;;
  *)       ARCH_LABEL="x64" ;;
esac

info "Détection : ${PLATFORM}/${ARCH_LABEL}"

# Récupération de la dernière version si non spécifiée
if [ "$VERSION" = "latest" ]; then
  info "Récupération de la dernière version..."
  VERSION=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | \
    grep '"tag_name"' | sed 's/.*"tag_name": *"\([^"]*\)".*/\1/')
  [ -z "$VERSION" ] && error "Impossible de récupérer la version. Vérifiez votre connexion internet."
fi

BINARY_URL="https://github.com/${REPO}/releases/download/${VERSION}/wallet-${PLATFORM}-${ARCH_LABEL}"

info "Téléchargement de ashgate-cli ${VERSION} (${PLATFORM}/${ARCH_LABEL})..."
TMP_FILE=$(mktemp)
curl -fsSL --progress-bar "$BINARY_URL" -o "$TMP_FILE" || error "Téléchargement échoué. Vérifiez que la release ${VERSION} existe."

chmod +x "$TMP_FILE"

# Installation
if [ -w "$INSTALL_DIR" ]; then
  mv "$TMP_FILE" "${INSTALL_DIR}/${BINARY_NAME}"
else
  warn "Permissions insuffisantes pour ${INSTALL_DIR}, utilisation de sudo..."
  sudo mv "$TMP_FILE" "${INSTALL_DIR}/${BINARY_NAME}"
fi

success "ashgate-cli ${VERSION} installé dans ${INSTALL_DIR}/${BINARY_NAME}"
echo ""
echo "  Commencez par vous connecter :"
echo -e "  ${CYAN}ashgate auth login${RESET}"
echo ""
