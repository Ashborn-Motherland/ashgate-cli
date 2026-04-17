export interface WalletConfig {
    activeProject?: string;
    cloudUrl: string;
    environment: 'sandbox' | 'live';
}
export interface TokenStore {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    refreshExpiresAt: number;
    keycloakId?: string;
    email?: string;
}
export declare const walletConfig: {
    get(): WalletConfig;
    set(updates: Partial<WalletConfig>): void;
    getTokens(): TokenStore;
    setTokens(tokens: TokenStore): void;
    clearTokens(): void;
    isAuthenticated(): boolean;
    getConfigPath(): string;
};
