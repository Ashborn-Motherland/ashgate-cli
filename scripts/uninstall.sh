#!/usr/bin/env bash
# uninstall.sh — Script de désinstallation de wallet-cli
# Usage : bash scripts/uninstall.sh

set -euo pipefail

BINARY_NAME="wallet"
INSTALL_DIR="/usr/local/bin"
CONFIG_DIR="${HOME}/.wallet-cli"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

info()    { echo -e "${CYAN}→${RESET} $1"; }
success() { echo -e "${GREEN}✓${RESET} $1"; }
warn()    { echo -e "${YELLOW}⚠${RESET} $1"; }
error()   { echo -e "${RED}✗${RESET} $1"; exit 1; }

BINARY_PATH="${INSTALL_DIR}/${BINARY_NAME}"

echo ""
echo -e "${RED}wallet-cli — Désinstallation${RESET}"
echo ""

# Vérifier que le binaire existe
if [ ! -f "$BINARY_PATH" ]; then
  warn "Le binaire ${BINARY_PATH} n'existe pas. wallet-cli n'est peut-être pas installé."
else
  info "Suppression du binaire ${BINARY_PATH}..."
  if [ -w "$INSTALL_DIR" ]; then
    rm -f "$BINARY_PATH"
  else
    sudo rm -f "$BINARY_PATH"
  fi
  success "Binaire supprimé."
fi

# Suppression de la configuration
if [ -d "$CONFIG_DIR" ]; then
  echo ""
  read -r -p "$(echo -e "${YELLOW}⚠${RESET} Supprimer également la configuration et les tokens stockés dans ${CONFIG_DIR} ? [o/N] ")" CONFIRM
  if [[ "$CONFIRM" =~ ^[oOyY]$ ]]; then
    rm -rf "$CONFIG_DIR"
    success "Configuration supprimée (${CONFIG_DIR})."
  else
    warn "Configuration conservée dans ${CONFIG_DIR}."
  fi
else
  info "Aucune configuration trouvée dans ${CONFIG_DIR}."
fi

echo ""
success "wallet-cli a été désinstallé."
echo ""
echo "  Pour réinstaller, relancez le script d'installation :"
echo -e "  ${CYAN}bash scripts/install.sh${RESET}"
echo ""
