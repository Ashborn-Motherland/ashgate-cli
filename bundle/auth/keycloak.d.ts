/**
 * Lance le flux OAuth2 PKCE pour s'authentifier avec Keycloak.
 * 1. Génère code_verifier + code_challenge
 * 2. Ouvre le navigateur sur l'URL d'authorization Keycloak
 * 3. Lance un serveur local pour capturer le callback
 * 4. Échange le code contre des tokens
 */
export declare function loginWithKeycloak(): Promise<void>;
export declare function refreshTokenIfNeeded(): Promise<void>;
export declare function requireAuth(): void;
