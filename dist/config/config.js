"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletConfig = void 0;
const configstore_1 = __importDefault(require("configstore"));
const store = new configstore_1.default('wallet-cli', {
    wallet: { cloudUrl: 'http://localhost:3005', environment: 'sandbox' },
    tokens: { accessToken: '', refreshToken: '', expiresAt: 0, refreshExpiresAt: 0 },
});
exports.walletConfig = {
    get() {
        return store.get('wallet');
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
