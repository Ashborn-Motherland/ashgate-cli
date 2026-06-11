#!/usr/bin/env bash
set -e

# Se positionner dans le dossier parent du script
CDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$CDIR/.." && pwd )"
cd "$PROJECT_DIR"

echo "=== 1. Compilation du projet TypeScript ==="
pnpm run build

echo "=== 2. Préparation du dossier de staging ==="
STAGING_DIR="deb-staging"
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR/DEBIAN"
mkdir -p "$STAGING_DIR/usr/bin"
mkdir -p "$STAGING_DIR/usr/lib/ashgate"

# Métadonnées du paquet Debian
VERSION=$(node -p "require('./package.json').version")

cat <<EOF > "$STAGING_DIR/DEBIAN/control"
Package: ashgate
Version: ${VERSION}
Section: utils
Priority: optional
Architecture: all
Depends: nodejs (>= 18)
Maintainer: Alexis <contact@ashborn.com>
Description: CLI pour la plateforme de paiement Ashgate
 Interface en ligne de commande pour configurer et installer les passerelles de paiement.
EOF

echo "=== 3. Copie des fichiers et installation des dépendances de production ==="
cp -r dist "$STAGING_DIR/usr/lib/ashgate/dist"
cp package.json "$STAGING_DIR/usr/lib/ashgate/package.json"
cp pnpm-lock.yaml "$STAGING_DIR/usr/lib/ashgate/pnpm-lock.yaml"

# Installer uniquement les dépendances de production dans le staging
pnpm install --prod --dir "$STAGING_DIR/usr/lib/ashgate"

# Rendre le point d'entrée exécutable
chmod +x "$STAGING_DIR/usr/lib/ashgate/dist/index.js"

# Créer le lien symbolique dans /usr/bin
ln -s /usr/lib/ashgate/dist/index.js "$STAGING_DIR/usr/bin/ashgate"

echo "=== 4. Construction du paquet .deb ==="
dpkg-deb --root-owner-group --build "$STAGING_DIR" "ashgate_${VERSION}_all.deb"

echo "=== 5. Nettoyage ==="
rm -rf "$STAGING_DIR"

echo "✓ Paquet Debian construit avec succès : ashgate_${VERSION}_all.deb"
