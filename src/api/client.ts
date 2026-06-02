import axios from 'axios';
import { walletConfig } from '../config/config';
import { refreshTokenIfNeeded } from '../auth/keycloak';

export const apiClient = axios.create();

// Intercepteur pour injecter automatiquement le token d'accès Keycloak
apiClient.interceptors.request.use(
    async (config) => {
        // Récupérer la config à jour (cloudUrl)
        const cfg = walletConfig.get();
        config.baseURL = cfg.cloudUrl;

        // Rafraîchir le token si nécessaire avant la requête
        try {
            await refreshTokenIfNeeded();
        } catch (err) {
            // Si la session a expiré, le refresh échoue
            console.error('\nSession expirée ou invalide. Veuillez vous reconnecter.');
            process.exit(1);
        }

        const tokens = walletConfig.getTokens();
        if (tokens.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
