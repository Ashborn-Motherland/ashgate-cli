"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithKeycloak = loginWithKeycloak;
exports.refreshTokenIfNeeded = refreshTokenIfNeeded;
exports.requireAuth = requireAuth;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const crypto_1 = __importDefault(require("crypto"));
const url_1 = require("url");
const axios_1 = __importDefault(require("axios"));
const open_1 = __importDefault(require("open"));
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../config/config");
const KEYCLOAK_URL = process.env.WALLET_KEYCLOAK_URL ?? 'http://localhost:8080';
const REALM = process.env.WALLET_KEYCLOAK_REALM ?? 'ash';
const CLIENT_ID = process.env.WALLET_KEYCLOAK_CLIENT_ID ?? 'wallet_cli';
const CALLBACK_PORT = 7357;
const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;
function base64url(buf) {
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function generatePKCE() {
    const verifier = base64url(crypto_1.default.randomBytes(32));
    const challenge = base64url(crypto_1.default.createHash('sha256').update(verifier).digest());
    return { verifier, challenge };
}
/**
 * Lance le flux OAuth2 PKCE pour s'authentifier avec Keycloak.
 * 1. Génère code_verifier + code_challenge
 * 2. Ouvre le navigateur sur l'URL d'authorization Keycloak
 * 3. Lance un serveur local pour capturer le callback
 * 4. Échange le code contre des tokens
 */
async function loginWithKeycloak() {
    const { verifier, challenge } = generatePKCE();
    const state = base64url(crypto_1.default.randomBytes(16));
    const authUrl = new url_1.URL(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', CALLBACK_URL);
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    console.log(chalk_1.default.cyan('\n→ Ouverture du navigateur pour l\'authentification...'));
    console.log(chalk_1.default.dim(`  Si rien ne s'ouvre, visitez:\n  ${authUrl.toString()}\n`));
    await (0, open_1.default)(authUrl.toString());
    // Serveur local pour capturer le code OAuth
    const code = await new Promise((resolve, reject) => {
        const server = http_1.default.createServer((req, res) => {
            const url = new url_1.URL(req.url, `http://localhost:${CALLBACK_PORT}`);
            const returnedCode = url.searchParams.get('code');
            const returnedState = url.searchParams.get('state');
            if (returnedState !== state) {
                res.end('<h2>❌ State mismatch — sécurité compromise</h2>');
                clearTimeout(timeout);
                server.close();
                reject(new Error('OAuth state mismatch'));
                return;
            }
            if (!returnedCode) {
                res.end('<h2>❌ Code manquant dans le callback</h2>');
                clearTimeout(timeout);
                server.close();
                reject(new Error('No code in callback'));
                return;
            }
            res.end(`
        <html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h2>✅ Authentification réussie !</h2>
        <p>Vous pouvez fermer cette fenêtre et revenir au terminal.</p>
        </body></html>
      `);
            clearTimeout(timeout);
            server.close();
            resolve(returnedCode);
        });
        server.listen(CALLBACK_PORT);
        server.on('error', reject);
        // Timeout après 3 minutes
        const timeout = setTimeout(() => {
            server.close();
            reject(new Error('Authentication timeout (3 minutes)'));
        }, 180000);
    });
    // Échange du code contre les tokens
    const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code,
        redirect_uri: CALLBACK_URL,
        code_verifier: verifier,
    });
    const response = await axios_1.default.post(tokenUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        // keepAlive: false → le process quitte naturellement après la requête
        httpAgent: new http_1.default.Agent({ keepAlive: false }),
        httpsAgent: new https_1.default.Agent({ keepAlive: false }),
    });
    const { access_token, refresh_token, expires_in, refresh_expires_in } = response.data;
    // Decode le payload JWT pour extraire email/sub
    const payloadB64 = access_token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    const tokenStore = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: Date.now() + expires_in * 1000,
        // refresh_expires_in=0 = lié à la session SSO → on applique 3j par défaut
        refreshExpiresAt: Date.now() + ((refresh_expires_in > 0 ? refresh_expires_in : 259200)) * 1000,
        keycloakId: payload.sub,
        email: payload.email,
    };
    config_1.walletConfig.setTokens(tokenStore);
    console.log(chalk_1.default.green(`\n✓ Connecté en tant que ${payload.email ?? payload.sub}`));
}
async function refreshTokenIfNeeded() {
    const tokens = config_1.walletConfig.getTokens();
    if (!tokens.refreshToken)
        return;
    if (tokens.expiresAt > Date.now() + 60000)
        return; // toujours valide
    const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        refresh_token: tokens.refreshToken,
    });
    try {
        const response = await axios_1.default.post(tokenUrl, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const { access_token, refresh_token, expires_in } = response.data;
        config_1.walletConfig.setTokens({
            ...tokens,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: Date.now() + expires_in * 1000,
        });
    }
    catch {
        config_1.walletConfig.clearTokens();
        throw new Error('Session expirée. Veuillez vous reconnecter : wallet auth login');
    }
}
function requireAuth() {
    if (!config_1.walletConfig.isAuthenticated()) {
        console.error(chalk_1.default.red('✗ Non authentifié. Lancez : wallet auth login'));
        process.exit(1);
    }
}
