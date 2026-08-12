# Ashgate CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Release](https://img.shields.io/github/v/release/Ashborn-Motherland/ashgate-cli)](https://github.com/Ashborn-Motherland/ashgate-cli/releases/latest)
[![Build Status](https://github.com/Ashborn-Motherland/ashgate-cli/actions/workflows/release.yml/badge.svg)](https://github.com/Ashborn-Motherland/ashgate-cli/actions)

> Interface en ligne de commande officielle et Open Source pour l'écosystème AshGateway.

---

## ⚡ Installation Rapide (One-Liner)

```bash
curl -fsSL https://ashgateway.com/install.sh | bash
```

---

## 🚀 Commandes Principales

```bash
# Bilan de santé système et connectivité des API
ashgate doctor

# Connexion sécurisée SSO Keycloak
ashgate auth login

# Tester ou générer un paiement direct avec QR Code dans le terminal
ashgate pay --amount 5000 --currency XOF --email client@example.com --provider fedapay

# Détecter le projet local (Nuxt 3, Vue 3, Next.js, React, Flutter) et générer le code de paiement
ashgate init

# Désinstaller la CLI et supprimer les données locales
ashgate uninstall
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

---

## 🔒 Security

For vulnerability disclosures, please review our [SECURITY.md](SECURITY.md) policy.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.
