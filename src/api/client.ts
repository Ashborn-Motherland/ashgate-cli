import axios, { AxiosInstance } from 'axios';
import { walletConfig } from '../config/config';
import chalk from 'chalk';

function createApiClient(): AxiosInstance {
    const client = axios.create({
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
    });

    // Interceptor : injecte l'URL de base et les headers d'auth dynamiquement
    client.interceptors.request.use((config) => {
        const cfg = walletConfig.get();
        const tokens = walletConfig.getTokens();
        config.baseURL = cfg.cloudUrl;

        if (tokens.accessToken) {
            config.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
        }
        return config;
    });

    // Interceptor de réponse : affiche les erreurs API de façon lisible
    client.interceptors.response.use(
        (res) => res,
        (err) => {
            if (err.response) {
                const status = err.response.status;
                const msg = err.response.data?.message ?? err.message;
                if (status === 401) {
                    console.error(chalk.red('✗ Non authentifié. Lancez : wallet auth login'));
                } else if (status === 429) {
                    console.error(chalk.yellow('⚠ Quota dépassé :'), msg);
                } else {
                    console.error(chalk.red(`✗ Erreur ${status}:`), msg);
                }
            } else {
                console.error(chalk.red('✗ Erreur réseau :'), err.message);
                console.error(chalk.dim(`  (Vérifiez que le cloud est accessible : ${walletConfig.get().cloudUrl})`));
            }
            return Promise.reject(err);
        },
    );

    return client;
}

export const api = createApiClient();

/** Helpers typés pour les endpoints ash-bwallet */
export const projectsApi = {
    list: () => api.get('/projects').then((r) => r.data),
    get: (slug: string) => api.get(`/projects/${slug}`).then((r) => r.data),
    create: (data: Record<string, unknown>) => api.post('/projects', data).then((r) => r.data),
    update: (slug: string, data: Record<string, unknown>) =>
        api.patch(`/projects/${slug}`, data).then((r) => r.data),
    delete: (slug: string) => api.delete(`/projects/${slug}`),
    usage: (slug: string) => api.get(`/projects/${slug}/usage`).then((r) => r.data),
};

export const fedapayApi = {
    transactions: {
        list: (projectKey: string, env: 'sandbox' | 'live') =>
            api.get('/fedapay/transactions', {
                headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
            }).then((r) => r.data),
        get: (id: string, projectKey: string, env: 'sandbox' | 'live') =>
            api.get(`/fedapay/transaction/${id}`, {
                headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
            }).then((r) => r.data),
        create: (data: any, projectKey: string, env: 'sandbox' | 'live') =>
            api.post('/fedapay/transaction', data, {
                headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
            }).then((r) => r.data),
    },
    customers: {
        list: (projectKey: string, env: 'sandbox' | 'live') =>
            api.get('/fedapay/customers', {
                headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
            }).then((r) => r.data),
        create: (data: any, projectKey: string, env: 'sandbox' | 'live') =>
            api.post('/fedapay/client', data, {
                headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
            }).then((r) => r.data),
    },
    payouts: {
        list: (projectKey: string, env: 'sandbox' | 'live') =>
            api.get('/fedapay/payouts', {
                headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
            }).then((r) => r.data),
        create: (data: any, projectKey: string, env: 'sandbox' | 'live') =>
            api.post('/fedapay/payouts', data, {
                headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
            }).then((r) => r.data),
    },
};

export const saasApi = {
    getSubscription: () => api.get('/saas/subscription').then((r) => r.data),
    upgrade: () => api.post('/saas/upgrade').then((r) => r.data),
};

export const billingPlansApi = {
    list: (projectId: string) => api.get(`/tenant/projects/${projectId}/billing-plans`).then((r) => r.data),
    create: (projectId: string, data: any) => api.post(`/tenant/projects/${projectId}/billing-plans`, data).then((r) => r.data),
    seed: (projectId: string) => api.post(`/tenant/projects/${projectId}/billing-plans/seed`).then((r) => r.data),
    delete: (projectId: string, planId: string) => api.delete(`/tenant/projects/${projectId}/billing-plans/${planId}`),
};

export const subscriptionsApi = {
    list: (projectId: string) => api.get(`/tenant/projects/${projectId}/subscriptions`).then((r) => r.data),
};
