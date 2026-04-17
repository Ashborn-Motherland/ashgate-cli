"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionsApi = exports.billingPlansApi = exports.saasApi = exports.fedapayApi = exports.projectsApi = exports.api = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const chalk_1 = __importDefault(require("chalk"));
function createApiClient() {
    const client = axios_1.default.create({
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
    });
    // Interceptor : injecte l'URL de base et les headers d'auth dynamiquement
    client.interceptors.request.use((config) => {
        const cfg = config_1.walletConfig.get();
        const tokens = config_1.walletConfig.getTokens();
        config.baseURL = cfg.cloudUrl;
        if (tokens.accessToken) {
            config.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
        }
        return config;
    });
    // Interceptor de réponse : affiche les erreurs API de façon lisible
    client.interceptors.response.use((res) => res, (err) => {
        if (err.response) {
            const status = err.response.status;
            const msg = err.response.data?.message ?? err.message;
            if (status === 401) {
                console.error(chalk_1.default.red('✗ Non authentifié. Lancez : wallet auth login'));
            }
            else if (status === 429) {
                console.error(chalk_1.default.yellow('⚠ Quota dépassé :'), msg);
            }
            else {
                console.error(chalk_1.default.red(`✗ Erreur ${status}:`), msg);
            }
        }
        else {
            console.error(chalk_1.default.red('✗ Erreur réseau :'), err.message);
            console.error(chalk_1.default.dim(`  (Vérifiez que le cloud est accessible : ${config_1.walletConfig.get().cloudUrl})`));
        }
        return Promise.reject(err);
    });
    return client;
}
exports.api = createApiClient();
/** Helpers typés pour les endpoints ash-bwallet */
exports.projectsApi = {
    list: () => exports.api.get('/projects').then((r) => r.data),
    get: (slug) => exports.api.get(`/projects/${slug}`).then((r) => r.data),
    create: (data) => exports.api.post('/projects', data).then((r) => r.data),
    update: (slug, data) => exports.api.patch(`/projects/${slug}`, data).then((r) => r.data),
    delete: (slug) => exports.api.delete(`/projects/${slug}`),
    usage: (slug) => exports.api.get(`/projects/${slug}/usage`).then((r) => r.data),
};
exports.fedapayApi = {
    transactions: {
        list: (projectKey, env) => exports.api.get('/fedapay/transactions', {
            headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
        }).then((r) => r.data),
        get: (id, projectKey, env) => exports.api.get(`/fedapay/transaction/${id}`, {
            headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
        }).then((r) => r.data),
        create: (data, projectKey, env) => exports.api.post('/fedapay/transaction', data, {
            headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
        }).then((r) => r.data),
    },
    customers: {
        list: (projectKey, env) => exports.api.get('/fedapay/customers', {
            headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
        }).then((r) => r.data),
        create: (data, projectKey, env) => exports.api.post('/fedapay/client', data, {
            headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
        }).then((r) => r.data),
    },
    payouts: {
        list: (projectKey, env) => exports.api.get('/fedapay/payouts', {
            headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
        }).then((r) => r.data),
        create: (data, projectKey, env) => exports.api.post('/fedapay/payouts', data, {
            headers: { 'x-feda-project-key': projectKey, 'x-feda-env': env },
        }).then((r) => r.data),
    },
};
exports.saasApi = {
    getSubscription: () => exports.api.get('/saas/subscription').then((r) => r.data),
    upgrade: () => exports.api.post('/saas/upgrade').then((r) => r.data),
};
exports.billingPlansApi = {
    list: (projectId) => exports.api.get(`/tenant/projects/${projectId}/billing-plans`).then((r) => r.data),
    create: (projectId, data) => exports.api.post(`/tenant/projects/${projectId}/billing-plans`, data).then((r) => r.data),
    seed: (projectId) => exports.api.post(`/tenant/projects/${projectId}/billing-plans/seed`).then((r) => r.data),
    delete: (projectId, planId) => exports.api.delete(`/tenant/projects/${projectId}/billing-plans/${planId}`),
};
exports.subscriptionsApi = {
    list: (projectId) => exports.api.get(`/tenant/projects/${projectId}/subscriptions`).then((r) => r.data),
};
