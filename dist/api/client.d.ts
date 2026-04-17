import { AxiosInstance } from 'axios';
export declare const api: AxiosInstance;
/** Helpers typés pour les endpoints ash-bwallet */
export declare const projectsApi: {
    list: () => Promise<any>;
    get: (slug: string) => Promise<any>;
    create: (data: Record<string, unknown>) => Promise<any>;
    update: (slug: string, data: Record<string, unknown>) => Promise<any>;
    delete: (slug: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    usage: (slug: string) => Promise<any>;
};
export declare const fedapayApi: {
    transactions: {
        list: (projectKey: string, env: "sandbox" | "live") => Promise<any>;
        get: (id: string, projectKey: string, env: "sandbox" | "live") => Promise<any>;
        create: (data: any, projectKey: string, env: "sandbox" | "live") => Promise<any>;
    };
    customers: {
        list: (projectKey: string, env: "sandbox" | "live") => Promise<any>;
        create: (data: any, projectKey: string, env: "sandbox" | "live") => Promise<any>;
    };
    payouts: {
        list: (projectKey: string, env: "sandbox" | "live") => Promise<any>;
        create: (data: any, projectKey: string, env: "sandbox" | "live") => Promise<any>;
    };
};
export declare const saasApi: {
    getSubscription: () => Promise<any>;
    upgrade: () => Promise<any>;
};
export declare const billingPlansApi: {
    list: (projectId: string) => Promise<any>;
    create: (projectId: string, data: any) => Promise<any>;
    seed: (projectId: string) => Promise<any>;
    delete: (projectId: string, planId: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const subscriptionsApi: {
    list: (projectId: string) => Promise<any>;
};
