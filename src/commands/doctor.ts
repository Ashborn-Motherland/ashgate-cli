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
            console.log(chalk.bold.cyan('\n🩺 Diagnostic Ashgate Wallet Doctor...'));
            console.log(chalk.dim('====================================================\n'));

            const results: DiagnosticResult[] = [];

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
            } else {
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
                const configPath = walletConfig.getConfigPath();
                results.push({
                    category: 'Environnement Système',
                    title: 'Stockage de configuration',
                    status: 'ok',
                    message: configPath,
                });
            } catch {
                results.push({
                    category: 'Environnement Système',
                    title: 'Stockage de configuration',
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
                    message: `Connecté (${tokens.email || 'Utilisateur'}, session encore valide ${timeStr})`,
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
                    message: 'Non connecté. Exécutez : ashgate auth login',
                });
            }

            // 3. VÉRIFICATION DES ENDPOINTS UNIQUEMENT WALLET
            const cloudUrl = walletConfig.get().cloudUrl || 'https://app.ashgateway.com';
            const cloudServices = [
                { name: 'Keycloak SSO Server', url: 'https://accounts.ashgateway.com/realms/ash/.well-known/openid-configuration' },
                { name: 'Ashgate Wallet API', url: cloudUrl },
            ];

            console.log(chalk.bold('🔍 Test de connectivité des services Ashgate Wallet :'));
            for (const service of cloudServices) {
                const res = await checkEndpoint(service.url, service.name);
                results.push(res);
            }

            // 4. AFFICHAGE DU RAPPORT PAR CATÉGORIE
            console.log('\n' + chalk.bold('📊 Rapport de Diagnostic :'));

            const categories = Array.from(new Set(results.map(r => r.category)));

            let totalOk = 0;
            let totalWarn = 0;
            let totalFail = 0;

            for (const cat of categories) {
                console.log(`\n  ${chalk.underline.bold(cat)} :`);
                const catResults = results.filter(r => r.category === cat);
                for (const r of catResults) {
                    let icon = chalk.green('  ✓');
                    if (r.status === 'warn') {
                        icon = chalk.yellow('  ⚠️');
                        totalWarn++;
                    } else if (r.status === 'fail') {
                        icon = chalk.red('  ✗');
                        totalFail++;
                    } else {
                        totalOk++;
                    }

                    const durationStr = r.durationMs !== undefined ? chalk.dim(` (${r.durationMs}ms)`) : '';
                    console.log(`${icon} ${chalk.bold(r.title.padEnd(35))} : ${r.message}${durationStr}`);
                }
            }

            // 5. RÉSUMÉ ET RECOMMANDATIONS
            console.log(chalk.dim('\n===================================================='));
            if (totalFail === 0 && totalWarn === 0) {
                console.log(chalk.bold.green('🎉 Diagnostic Ashgate Wallet réussi ! Tout est opérationnel.\n'));
            } else if (totalFail === 0) {
                console.log(chalk.bold.yellow(`⚠️  Système opérationnel avec ${totalWarn} avertissement(s).\n`));
            } else {
                console.log(chalk.bold.red(`❌ Diagnostic avec ${totalFail} échec(s) et ${totalWarn} avertissement(s). Veuillez vérifier la connexion.\n`));
            }
        });
}
