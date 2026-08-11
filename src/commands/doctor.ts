import { Command } from 'commander';
import chalk from 'chalk';
import axios from 'axios';
import { walletConfig } from '../config/config';

interface DiagnosticResult {
    category: string;
    title: string;
    status: 'ok' | 'warn' | 'fail';
    message: string;
    durationMs?: number;
}

async function checkEndpoint(url: string, name: string): Promise<DiagnosticResult> {
    const start = Date.now();
    try {
        const response = await axios.get(url, { timeout: 5000 });
        const durationMs = Date.now() - start;
        if (response.status >= 200 && response.status < 400) {
            return {
                category: 'Services Ashgate Wallet',
                title: name,
                status: 'ok',
                message: `En ligne (${response.status} OK)`,
                durationMs,
            };
        } else {
            return {
                category: 'Services Ashgate Wallet',
                title: name,
                status: 'warn',
                message: `Réponse inattendue (HTTP ${response.status})`,
                durationMs,
            };
        }
    } catch (err: any) {
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

export function registerDoctorCommands(program: Command): void {
    program
        .command('doctor')
        .description('Diagnostiquer le système, la connexion et les services Ashgate Wallet')
        .action(async () => {
            console.log(chalk.bold('\nDiagnostic Ashgate Wallet'));
            console.log(chalk.dim('----------------------------------------------------\n'));

            const results: DiagnosticResult[] = [];

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
            } else {
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
                const configPath = walletConfig.getConfigPath();
                results.push({
                    category: 'Environnement Système',
                    title: 'Fichier de configuration',
                    status: 'ok',
                    message: configPath,
                });
            } catch {
                results.push({
                    category: 'Environnement Système',
                    title: 'Fichier de configuration',
                    status: 'warn',
                    message: 'Impossible de lire la configuration locale',
                });
            }

            // 2. VÉRIFICATION DE L'AUTHENTIFICATION & SESSION WALLET
            const tokens = walletConfig.getTokens();
            if (walletConfig.isAuthenticated()) {
                const msLeft = tokens.refreshExpiresAt - Date.now();
                const daysLeft = Math.floor(msLeft / 86_400_000);
                const hoursLeft = Math.floor((msLeft % 86_400_000) / 3_600_000);
                const minutesLeft = Math.floor((msLeft % 3_600_000) / 60_000);
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
            } else if (tokens.refreshToken) {
                results.push({
                    category: 'Authentification Wallet',
                    title: 'Session Keycloak SSO',
                    status: 'warn',
                    message: 'Session expirée. Reconnexion requise (ashgate auth login)',
                });
            } else {
                results.push({
                    category: 'Authentification Wallet',
                    title: 'Session Keycloak SSO',
                    status: 'warn',
                    message: 'Non connecté (ashgate auth login)',
                });
            }

            // 3. VÉRIFICATION DES ENDPOINTS WALLET (SANS AFFICHER L'URL)
            const rawUrl = walletConfig.get().cloudUrl;
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
                console.log(`\n${chalk.bold(cat)} :`);
                const catResults = results.filter(r => r.category === cat);
                for (const r of catResults) {
                    let badge = chalk.green('[OK]  ');
                    if (r.status === 'warn') {
                        badge = chalk.yellow('[WARN]');
                        totalWarn++;
                    } else if (r.status === 'fail') {
                        badge = chalk.red('[FAIL]');
                        totalFail++;
                    } else {
                        totalOk++;
                    }

                    const durationStr = r.durationMs !== undefined ? chalk.dim(` (${r.durationMs}ms)`) : '';
                    console.log(`  ${badge} ${chalk.bold(r.title.padEnd(30))} : ${r.message}${durationStr}`);
                }
            }

            // 5. RÉSUMÉ
            console.log(chalk.dim('\n----------------------------------------------------'));
            if (totalFail === 0 && totalWarn === 0) {
                console.log(chalk.green('Diagnostic terminé avec succès. Tous les services sont opérationnels.\n'));
            } else if (totalFail === 0) {
                console.log(chalk.yellow(`Diagnostic terminé avec ${totalWarn} avertissement(s).\n`));
            } else {
                console.log(chalk.red(`Diagnostic terminé avec ${totalFail} erreur(s) et ${totalWarn} avertissement(s).\n`));
            }
        });
}
