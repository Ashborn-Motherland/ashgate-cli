# ashgate-cli

> Interface en ligne de commande officielle pour l'écosystème AshGateway.

---

## ⚡ Installation Rapide

### 1. Script d'installation automatique (Linux / macOS)

```bash
curl -fsSL https://raw.githubusercontent.com/Ashborn-Motherland/ashgate-cli/main/scripts/install.sh | sh
```

### 2. Téléchargement des Binaires précompilés (Sans Node.js)

Téléchargez l'exécutable adapté à votre système d'exploitation depuis la dernière version :

👉 **[Télécharger Ashgate CLI sur GitHub Releases](https://github.com/Ashborn-Motherland/ashgate-cli/releases/latest)**

- **Linux x64** : `ashgate-linux-x64`
- **Windows x64** : `ashgate-win-x64.exe`
- **macOS (Apple Silicon M1/M2/M3)** : `ashgate-macos-arm64`
- **macOS (Intel)** : `ashgate-macos-x64`

### 3. Via NPM

```bash
# Installation globale
npm install -g ashgate-cli

# Ou exécution directe sans installation
npx ashgate-cli doctor
```

---

## 🚀 Commandes Principales

```bash
# Diagnostic complet de la CLI et des services distants
ashgate doctor

# Connexion sécurisée SSO Keycloak
ashgate auth login

# Tester ou générer un paiement direct avec QR Code dans le terminal
ashgate pay --amount 5000 --currency XOF --email client@example.com --provider fedapay

# Détecter le projet local (Nuxt, Vue, Next, React, Flutter) et générer le code de paiement
ashgate init

# Désinstaller la CLI et supprimer les données locales
ashgate uninstall
```

---

## 📄 Licence

Propriété exclusive de la plateforme Ashborn / AshGateway. Tous droits réservés.
