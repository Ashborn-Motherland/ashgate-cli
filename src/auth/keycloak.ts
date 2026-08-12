import http from 'http';
import https from 'https';
import crypto from 'crypto';
import { URL } from 'url';
import axios from 'axios';
import open from 'open';
import chalk from 'chalk';
import { walletConfig, TokenStore } from '../config/config';

const KEYCLOAK_URL = process.env.WALLET_KEYCLOAK_URL ?? 'https://accounts.ashgateway.com';

const REALM = process.env.WALLET_KEYCLOAK_REALM ?? 'ash';
const CLIENT_ID = process.env.WALLET_KEYCLOAK_CLIENT_ID ?? 'ash-wallet-cli';

const CALLBACK_PORT = 7357;
const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;

function base64url(buf: Buffer): string {
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function generatePKCE(): { verifier: string; challenge: string } {
    const verifier = base64url(crypto.randomBytes(32));
    const challenge = base64url(
        crypto.createHash('sha256').update(verifier).digest(),
    );
    return { verifier, challenge };
}

/**
 * Lance le flux OAuth2 PKCE pour s'authentifier avec Keycloak.
 * 1. Génère code_verifier + code_challenge
 * 2. Ouvre le navigateur sur l'URL d'authorization Keycloak
 * 3. Lance un serveur local pour capturer le callback
 * 4. Échange le code contre des tokens
 */
export async function loginWithKeycloak(): Promise<void> {
    const { verifier, challenge } = generatePKCE();
    const state = base64url(crypto.randomBytes(16));

    const authUrl = new URL(
        `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`,
    );
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', CALLBACK_URL);
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    console.log(chalk.cyan('\n→ Ouverture du navigateur pour l\'authentification...'));
    console.log(chalk.dim(`  Si rien ne s'ouvre, visitez:\n  ${authUrl.toString()}\n`));

    await open(authUrl.toString());

    // Serveur local pour capturer le code OAuth
    const code = await new Promise<string>((resolve, reject) => {
        const server = http.createServer((req, res) => {
            const url = new URL(req.url!, `http://localhost:${CALLBACK_PORT}`);
            const returnedCode = url.searchParams.get('code');
            const returnedState = url.searchParams.get('state');

            if (returnedState !== state) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h2>State mismatch — sécurité compromise</h2>');
                clearTimeout(timeout);
                server.close();
                reject(new Error('OAuth state mismatch'));
                return;
            }

            if (!returnedCode) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h2>Code manquant dans le callback</h2>');
                clearTimeout(timeout);
                server.close();
                reject(new Error('No code in callback'));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
    <div style="text-align: center; font-family: sans-serif; margin-top: 50px;">
      <h1>Authentification réussie !</h1>
      <p>Vous pouvez fermer cette fenêtre et revenir au terminal.</p>
    </div>
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
        }, 180_000);
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

    const response = await axios.post(tokenUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        // keepAlive: false → le process quitte naturellement après la requête
        httpAgent: new http.Agent({ keepAlive: false }),
        httpsAgent: new https.Agent({ keepAlive: false }),
    });

    const { access_token, refresh_token, expires_in, refresh_expires_in } = response.data as {
        access_token: string; refresh_token: string;
        expires_in: number; refresh_expires_in: number;
    };


    // Decode le payload JWT pour extraire email/sub
    const payloadB64 = access_token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

    const tokenStore: TokenStore = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: Date.now() + expires_in * 1000,
        // refresh_expires_in=0 = lié à la session SSO → on applique 3j par défaut
        refreshExpiresAt: Date.now() + ((refresh_expires_in > 0 ? refresh_expires_in : 259200)) * 1000,
        keycloakId: payload.sub,
        email: payload.email,
    };

    walletConfig.setTokens(tokenStore);
    console.log(chalk.green(`\n✓ Connecté en tant que ${payload.email ?? payload.sub}`));
}

export async function refreshTokenIfNeeded(): Promise<void> {
    const tokens = walletConfig.getTokens();
    if (!tokens.refreshToken) return;
    if (tokens.expiresAt > Date.now() + 60_000) return; // toujours valide

    const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        refresh_token: tokens.refreshToken,
    });

    try {
        const response = await axios.post(tokenUrl, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const { access_token, refresh_token, expires_in } = response.data;
        walletConfig.setTokens({
            ...tokens,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: Date.now() + expires_in * 1000,
        });
    } catch {
        walletConfig.clearTokens();
        throw new Error('Session expirée. Veuillez vous reconnecter : ashgate auth login');
    }
}

export function requireAuth(): void {
    if (!walletConfig.isAuthenticated()) {
        console.error(chalk.red('✗ Non authentifié. Lancez : ashgate auth login'));
        process.exit(1);
    }
}
