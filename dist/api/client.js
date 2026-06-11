"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const keycloak_1 = require("../auth/keycloak");
exports.apiClient = axios_1.default.create();
// Intercepteur pour injecter automatiquement le token d'accès Keycloak
exports.apiClient.interceptors.request.use(async (config) => {
    // Récupérer la config à jour (cloudUrl)
    const cfg = config_1.walletConfig.get();
    config.baseURL = cfg.cloudUrl;
    // Rafraîchir le token si nécessaire avant la requête
    try {
        await (0, keycloak_1.refreshTokenIfNeeded)();
    }
    catch (err) {
        // Si la session a expiré, le refresh échoue
        console.error('\nSession expirée ou invalide. Veuillez vous reconnecter.');
        process.exit(1);
    }
    const tokens = config_1.walletConfig.getTokens();
    if (tokens.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
