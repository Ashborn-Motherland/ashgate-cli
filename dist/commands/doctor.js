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
                category: 'Service Cloud',
                title: name,
                status: 'ok',
                message: `En ligne (${response.status} OK)`,
                durationMs,
            };
        }
        else {
            return {
                category: 'Service Cloud',
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
            // Même avec un code d'erreur HTTP (ex: 401/404), le serveur réseau est joignable
            return {
                category: 'Service Cloud',
                title: name,
                status: 'ok',
                message: `Joignable (HTTP ${err.response.status})`,
                durationMs,
            };
        }
        return {
            category: 'Service Cloud',
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
        .description('Diagnostiquer le système, la connexion, l\'authentification et la disponibilité des services Cloud')
        .action(async () => {
        console.log(chalk_1.default.bold.cyan('\n🩺 Diagnostic complet Ashgate Doctor...'));
        console.log(chalk_1.default.dim('====================================================\n'));
        const results = [];
        // 1. VÉRIFICATION DU SYSTÈME LOCAL
        const nodeVersion = process.version;
        const majorNode = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
        if (majorNode >= 18) {
            results.push({
                category: 'Environnement Système',
                title: 'Node.js Runtime',
                status: 'ok',
                message: `${nodeVersion} (>= v18.0.0 requis)`,
            });
        }
        else {
            results.push({
                category: 'Environnement Système',
                title: 'Node.js Runtime',
                status: 'fail',
                message: `${nodeVersion} (Node.js 18+ requis. Veuillez mettre à jour Node)`,
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
                title: 'Fichier de configuration local',
                status: 'ok',
                message: configPath,
            });
        }
        catch {
            results.push({
                category: 'Environnement Système',
                title: 'Fichier de configuration local',
                status: 'warn',
                message: 'Impossible de lire le stockage de configuration local',
            });
        }
        // 2. VÉRIFICATION DE L'AUTHENTIFICATION & SESSION
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
                category: 'Authentification',
                title: 'Session Keycloak SSO',
                status: 'ok',
                message: `Connecté (${tokens.email || 'Utilisateur'}, session encore valide ${timeStr})`,
            });
        }
        else if (tokens.refreshToken) {
            results.push({
                category: 'Authentification',
                title: 'Session Keycloak SSO',
                status: 'warn',
                message: 'Session expirée. Reconnexion requise (ashgate auth login)',
            });
        }
        else {
            results.push({
                category: 'Authentification',
                title: 'Session Keycloak SSO',
                status: 'warn',
                message: 'Non connecté. Exécutez : ashgate auth login',
            });
        }
        // 3. VÉRIFICATION DES SERVICES CLOUD & INFRASTRUCTURE
        const cloudServices = [
            { name: 'Keycloak SSO Server', url: 'https://accounts.ashgateway.com/realms/ash/.well-known/openid-configuration' },
            { name: 'Ashgate Wallet API', url: 'https://api.ashgateway.com' },
            { name: 'Ash Location / Coin Branché API', url: 'https://location-api.coinbranche.com/health' },
            { name: 'Meilisearch Search Engine', url: 'https://search.coinbranche.com/health' },
            { name: 'Spark Parking API', url: 'https://spark-api.ashgateway.com' },
        ];
        console.log(chalk_1.default.bold('🔍 Test de connectivité des services Cloud :'));
        for (const service of cloudServices) {
            const res = await checkEndpoint(service.url, service.name);
            results.push(res);
        }
        // 4. AFFICHAGE DU RAPPORT PAR CATÉGORIE
        console.log('\n' + chalk_1.default.bold('📊 Rapport de Diagnostic :'));
        const categories = Array.from(new Set(results.map(r => r.category)));
        let totalOk = 0;
        let totalWarn = 0;
        let totalFail = 0;
        for (const cat of categories) {
            console.log(`\n  ${chalk_1.default.underline.bold(cat)} :`);
            const catResults = results.filter(r => r.category === cat);
            for (const r of catResults) {
                let icon = chalk_1.default.green('  ✓');
                if (r.status === 'warn') {
                    icon = chalk_1.default.yellow('  ⚠️');
                    totalWarn++;
                }
                else if (r.status === 'fail') {
                    icon = chalk_1.default.red('  ✗');
                    totalFail++;
                }
                else {
                    totalOk++;
                }
                const durationStr = r.durationMs !== undefined ? chalk_1.default.dim(` (${r.durationMs}ms)`) : '';
                console.log(`${icon} ${chalk_1.default.bold(r.title.padEnd(35))} : ${r.message}${durationStr}`);
            }
        }
        // 5. RÉSUMÉ ET RECOMMANDATIONS
        console.log(chalk_1.default.dim('\n===================================================='));
        if (totalFail === 0 && totalWarn === 0) {
            console.log(chalk_1.default.bold.green('🎉 Diagnostic parfait ! Tout le système et les services Cloud sont 100% opérationnels.\n'));
        }
        else if (totalFail === 0) {
            console.log(chalk_1.default.bold.yellow(`⚠️  Système opérationnel avec ${totalWarn} avertissement(s).\n`));
        }
        else {
            console.log(chalk_1.default.bold.red(`❌ Diagnostic avec ${totalFail} échec(s) et ${totalWarn} avertissement(s). Veuillez vérifier vos services.\n`));
        }
    });
}
