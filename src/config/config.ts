import Configstore from 'configstore';

export interface WalletConfig {
    cloudUrl: string;
    realm?: string;
}

export interface TokenStore {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;        // expiry du access token (ms)
    refreshExpiresAt: number; // expiry du refresh token (ms)
    keycloakId?: string;
    email?: string;
}

const store = new Configstore('ashgate-cli', {
    wallet: { cloudUrl: 'https://api.ash-pay.com' } as WalletConfig,
    tokens: { accessToken: '', refreshToken: '', expiresAt: 0, refreshExpiresAt: 0 } as TokenStore,
});

export const walletConfig = {
    get(): WalletConfig {
        return store.get('wallet') as WalletConfig;
    },
    set(updates: Partial<WalletConfig>): void {
        store.set('wallet', { ...this.get(), ...updates });
    },
    getTokens(): TokenStore {
        return store.get('tokens') as TokenStore;
    },
    setTokens(tokens: TokenStore): void {
        store.set('tokens', tokens);
    },
    clearTokens(): void {
        store.set('tokens', { accessToken: '', refreshToken: '', expiresAt: 0, refreshExpiresAt: 0 });
    },
    isAuthenticated(): boolean {
        const t = this.getTokens();
        // On considère l'utilisateur connecté tant que son refresh token est valide
        return Boolean(t.refreshToken && t.refreshExpiresAt > Date.now());
    },
    getConfigPath(): string {
        return store.path;
    },
};
