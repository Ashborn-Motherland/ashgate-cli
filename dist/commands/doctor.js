"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDoctorCommands = registerDoctorCommands;
const chalk_1 = __importDefault(require("chalk"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
async function checkEndpoint(url, name) {
    const start = Date.now();
    try {
        const response = await axios_1.default.get(url, { timeout: 5000 });
        const durationMs = Date.now() - start;
        if (response.status >= 200 && response.status < 400) {
            return {
                category: 'Services Ashgate Wallet',
                title: name,
                status: 'ok',
                message: `En ligne (${response.status} OK)`,
                durationMs,
            };
        }
        else {
            return {
                category: 'Services Ashgate Wallet',
                title: name,
                status: 'warn',
                message: `Réponse inattendue (HTTP ${response.status})`,
                durationMs,
            };
        }
    }
    catch (err) {
        const durationMs = Date.now() - start;
        if (err.response) {
            return {
                category: 'Services Ashgate Wallet',
                title: name,
                status: 'ok',
                message: `Joignable (HTTP ${err.response.status})`,
                durationMs,
            };
        }
        return {
            category: 'Services Ashgate Wallet',
            title: name,
            status: 'fail',
            message: `Injoignable (${err.code || err.message || 'Timeout'})`,
            durationMs,
        };
    }
}
function registerDoctorCommands(program) {
    program
        .command('doctor')
        .description('Diagnostiquer le système, la connexion et les services Ashgate Wallet')
        .action(async () => {
        console.log(chalk_1.default.bold('\nDiagnostic Ashgate Wallet'));
        console.log(chalk_1.default.dim('----------------------------------------------------\n'));
        const results = [];
        // 1. VÉRIFICATION DU SYSTÈME LOCAL
        const nodeVersion = process.version;
        const majorNode = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
        if (majorNode >= 18) {
            results.push({
                category: 'Environnement Système',
                title: 'Node.js Runtime',
                status: 'ok',
                message: `${nodeVersion}`,
            });
        }
        else {
            results.push({
                category: 'Environnement Système',
                title: 'Node.js Runtime',
                status: 'fail',
                message: `${nodeVersion} (Node.js 18+ requis)`,
            });
        }
        results.push({
            category: 'Environnement Système',
            title: 'Version ashgate-cli',
            status: 'ok',
            message: 'v3.0.0',
        });
        try {
            const configPath = config_1.walletConfig.getConfigPath();
            results.push({
                category: 'Environnement Système',
                title: 'Fichier de configuration',
                status: 'ok',
                message: configPath,
            });
        }
        catch {
            results.push({
                category: 'Environnement Système',
                title: 'Fichier de configuration',
                status: 'warn',
                message: 'Impossible de lire la configuration locale',
            });
        }
        // 2. VÉRIFICATION DE L'AUTHENTIFICATION & SESSION WALLET
        const tokens = config_1.walletConfig.getTokens();
        if (config_1.walletConfig.isAuthenticated()) {
            const msLeft = tokens.refreshExpiresAt - Date.now();
            const daysLeft = Math.floor(msLeft / 86400000);
            const hoursLeft = Math.floor((msLeft % 86400000) / 3600000);
            const minutesLeft = Math.floor((msLeft % 3600000) / 60000);
            const timeStr = daysLeft > 0
                ? `${daysLeft}j ${hoursLeft}h`
                : hoursLeft > 0
                    ? `${hoursLeft}h ${minutesLeft}min`
                    : `${minutesLeft}min`;
            results.push({
                category: 'Authentification Wallet',
                title: 'Session Keycloak SSO',
                status: 'ok',
                message: `Connecté (${tokens.email || 'Utilisateur'}, valide encore ${timeStr})`,
            });
        }
        else if (tokens.refreshToken) {
            results.push({
                category: 'Authentification Wallet',
                title: 'Session Keycloak SSO',
                status: 'warn',
                message: 'Session expirée. Reconnexion requise (ashgate auth login)',
            });
        }
        else {
            results.push({
                category: 'Authentification Wallet',
                title: 'Session Keycloak SSO',
                status: 'warn',
                message: 'Non connecté (ashgate auth login)',
            });
        }
        // 3. VÉRIFICATION DES ENDPOINTS WALLET (SANS AFFICHER L'URL)
        const rawUrl = config_1.walletConfig.get().cloudUrl;
        const cloudUrl = (rawUrl && !rawUrl.includes('localhost') && rawUrl !== 'https://app.ashgateway.com')
            ? rawUrl
            : 'https://api.ashgateway.com';
        const cloudServices = [
            { name: 'Keycloak SSO Server', url: 'https://accounts.ashgateway.com/realms/ash/.well-known/openid-configuration' },
            { name: 'Ashgate Wallet API', url: cloudUrl },
        ];
        for (const service of cloudServices) {
            const res = await checkEndpoint(service.url, service.name);
            results.push(res);
        }
        // 4. AFFICHAGE DU RAPPORT PAR CATÉGORIE
        const categories = Array.from(new Set(results.map(r => r.category)));
        let totalOk = 0;
        let totalWarn = 0;
        let totalFail = 0;
        for (const cat of categories) {
            console.log(`\n${chalk_1.default.bold(cat)} :`);
            const catResults = results.filter(r => r.category === cat);
            for (const r of catResults) {
                let badge = chalk_1.default.green('[OK]  ');
                if (r.status === 'warn') {
                    badge = chalk_1.default.yellow('[WARN]');
                    totalWarn++;
                }
                else if (r.status === 'fail') {
                    badge = chalk_1.default.red('[FAIL]');
                    totalFail++;
                }
                else {
                    totalOk++;
                }
                const durationStr = r.durationMs !== undefined ? chalk_1.default.dim(` (${r.durationMs}ms)`) : '';
                console.log(`  ${badge} ${chalk_1.default.bold(r.title.padEnd(30))} : ${r.message}${durationStr}`);
            }
        }
        // 5. RÉSUMÉ
        console.log(chalk_1.default.dim('\n----------------------------------------------------'));
        if (totalFail === 0 && totalWarn === 0) {
            console.log(chalk_1.default.green('Diagnostic terminé avec succès. Tous les services sont opérationnels.\n'));
        }
        else if (totalFail === 0) {
            console.log(chalk_1.default.yellow(`Diagnostic terminé avec ${totalWarn} avertissement(s).\n`));
        }
        else {
            console.log(chalk_1.default.red(`Diagnostic terminé avec ${totalFail} erreur(s) et ${totalWarn} avertissement(s).\n`));
        }
    });
}
