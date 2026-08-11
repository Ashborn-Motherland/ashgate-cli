"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletConfig = void 0;
require("dotenv/config");
const configstore_1 = __importDefault(require("configstore"));
const store = new configstore_1.default('ashgate-cli', {
    wallet: { cloudUrl: process.env.WALLET_CLOUD_URL ?? 'https://api.ashgateway.com' },
    tokens: { accessToken: '', refreshToken: '', expiresAt: 0, refreshExpiresAt: 0 },
});
exports.walletConfig = {
    get() {
        const stored = store.get('wallet');
        const defaultUrl = process.env.WALLET_CLOUD_URL ?? 'https://api.ashgateway.com';
        if (!stored?.cloudUrl || stored.cloudUrl === 'https://app.ashgateway.com' || stored.cloudUrl.includes('localhost')) {
            store.set('wallet', { cloudUrl: defaultUrl });
            return { cloudUrl: defaultUrl };
        }
        return {
            cloudUrl: process.env.WALLET_CLOUD_URL ?? stored.cloudUrl,
        };
    },
    set(updates) {
        store.set('wallet', { ...this.get(), ...updates });
    },
    getTokens() {
        return store.get('tokens');
    },
    setTokens(tokens) {
        store.set('tokens', tokens);
    },
    clearTokens() {
        store.set('tokens', { accessToken: '', refreshToken: '', expiresAt: 0, refreshExpiresAt: 0 });
    },
    isAuthenticated() {
        const t = this.getTokens();
        // On considère l'utilisateur connecté tant que son refresh token est valide
        return Boolean(t.refreshToken && t.refreshExpiresAt > Date.now());
    },
    getConfigPath() {
        return store.path;
    },
};
