# Contributing to Ashgate CLI

First off, thank you for considering contributing to **Ashgate CLI**! It's contributions like yours that make Ashgate a great tool for developers across the world.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **pnpm**: v11+ (`npm install -g pnpm`)

### Getting Started

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/Ashborn-Motherland/ashgate-cli.git
   cd ashgate-cli
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Build the CLI**
   ```bash
   pnpm build
   ```

4. **Run Locally during Development**
   ```bash
   pnpm dev doctor
   # Or link locally
   pnpm start doctor
   ```

---

## 🧪 Testing Commands & Binaries

- **Diagnostic test**: `pnpm dev doctor`
- **Build TypeScript**: `pnpm build`
- **Build Standalone Binaries**: `pnpm build:binaries`

---

## 📥 Submitting Pull Requests

1. Create a feature branch (`git checkout -b feature/my-amazing-feature`).
2. Make sure code compiles cleanly (`pnpm build`).
3. Commit your changes (`git commit -m 'feat: add awesome new payment provider'`).
4. Push to your branch (`git push origin feature/my-amazing-feature`).
5. Open a Pull Request on GitHub.

Thank you for helping build the future of payments! 💳✨
