import { Command } from 'commander';
import chalk from 'chalk';
import { apiClient } from '../api/client';
import { requireAuth } from '../auth/keycloak';

export function registerProjectCommands(program: Command): void {
    const project = program.command('project').description('Gestion des projets de paiement');

    // 1. LIST PROJECTS
    project
        .command('list')
        .description('Lister tous vos projets')
        .action(async () => {
            requireAuth();
            try {
                const response = await apiClient.get('/projects');
                const projects = response.data;

                if (!Array.isArray(projects) || projects.length === 0) {
                    console.log(chalk.yellow('\nℹ Aucun projet trouvé. Créez-en un avec : ashgate project create'));
                    return;
                }

                console.log(chalk.bold('\nVos projets :'));
                console.log(
                    chalk.underline(
                        `${'Nom'.padEnd(25)} ${'Slug'.padEnd(25)} ${'Billing Mode'.padEnd(15)} ${'Statut'.padEnd(10)}`
                    )
                );
                for (const p of projects) {
                    const statusStr = p.isActive !== false ? chalk.green('actif') : chalk.red('inactif');
                    console.log(
                        `${(p.name || '').padEnd(25)} ` +
                        `${(p.slug || '').padEnd(25)} ` +
                        `${(p.billingMode || 'none').padEnd(15)} ` +
                        `${statusStr}`
                    );
                }
                console.log('');
            } catch (err: any) {
                console.error(chalk.red('✗ Erreur lors de la récupération des projets :'), err.response?.data?.message || err.message);
                process.exit(1);
            }
        });

    // 2. CREATE PROJECT
    project
        .command('create')
        .description('Créer un nouveau projet')
        .requiredOption('-n, --name <name>', 'Nom du projet')
        .requiredOption('-s, --slug <slug>', 'Slug unique (URL-safe)')
        .option('-b, --billing-mode <billingMode>', 'Mode de facturation (none, subscription, commission)', 'none')
        .option('-c, --commission-rate <rate>', 'Taux de commission (%)', parseFloat)
        .option('-w, --webhook-url <webhookUrl>', 'URL de notification (webhook) de destination')
        .option('--sandbox-key <sandboxApiKey>', 'Clé API FedaPay Sandbox')
        .option('--live-key <liveApiKey>', 'Clé API FedaPay Live')
        .option('--feexpay-key <feexpayApiKey>', 'Clé API Feexpay')
        .option('--feexpay-shop <feexpayShopId>', 'ID Boutique Feexpay')
        .option('--webhook-secret <webhookSecret>', 'Secret du Webhook FedaPay')
        .option('--send-invoices <sendInvoices>', 'Envoyer les factures par email automatiquement (true/false)', (v) => v === 'true')
        .action(async (options) => {
            requireAuth();
            try {
                const response = await apiClient.post('/projects', options);
                console.log(chalk.green(`\n✓ Projet créé avec succès !`));
                console.log(`  Nom  : ${response.data.name}`);
                console.log(`  Slug : ${response.data.slug}`);
                console.log(`  Clé Publique  : ${response.data.publicKey}`);
                console.log(`  Clé Secrète   : ${response.data.secretKey}\n`);
            } catch (err: any) {
                console.error(chalk.red('✗ Échec de la création du projet :'), err.response?.data?.message || err.message);
                process.exit(1);
            }
        });

    // 3. SHOW PROJECT
    project
        .command('show <slug>')
        .description('Afficher les détails d\'un projet')
        .action(async (slug) => {
            requireAuth();
            try {
                const response = await apiClient.get(`/projects/${slug}`);
                const p = response.data;

                console.log(chalk.bold(`\nDétails du projet [${p.name}] :`));
                console.log(`  ID            : ${p._id || p.id}`);
                console.log(`  Slug          : ${p.slug}`);
                console.log(`  Billing Mode  : ${p.billingMode || 'none'}`);
                if (p.billingMode === 'commission') {
                    console.log(`  Commission    : ${p.commissionRate || 0}%`);
                }
                console.log(`  Statut        : ${p.isActive !== false ? chalk.green('Actif') : chalk.red('Inactif')}`);
                console.log(`  Webhook URL   : ${p.webhookUrl || chalk.dim('non configuré')}`);
                console.log(`  Priorité Pmt  : ${p.paymentProviderPriority?.join(' -> ') || 'non configuré'}`);
                console.log(`  Clé Publique  : ${p.publicKey || 'non configurée'}`);
                console.log(`  Clé Secrète   : ${p.secretKey || 'non configurée'}`);

                console.log(chalk.bold('\nConfiguration des API keys :'));
                console.log(`  FedaPay Sandbox API Key : ${p.sandboxApiKey ? chalk.green('Configurée') : chalk.dim('Non configurée')}`);
                console.log(`  FedaPay Live API Key    : ${p.liveApiKey ? chalk.green('Configurée') : chalk.dim('Non configurée')}`);
                console.log(`  FedaPay Webhook Secret  : ${p.webhookSecret ? chalk.green('Configurée') : chalk.dim('Non configurée')}`);
                console.log(`  FeexPay API Key         : ${p.feexpayApiKey ? chalk.green('Configurée') : chalk.dim('Non configurée')}`);
                console.log(`  FeexPay Shop ID         : ${p.feexpayShopId ? chalk.green('Configuré') : chalk.dim('Non configuré')}\n`);
            } catch (err: any) {
                console.error(chalk.red('✗ Impossible d\'afficher le projet :'), err.response?.data?.message || err.message);
                process.exit(1);
            }
        });

    // 4. UPDATE PROJECT
    project
        .command('update <slug>')
        .description('Mettre à jour la configuration d\'un projet')
        .option('-n, --name <name>', 'Nom du projet')
        .option('-b, --billing-mode <billingMode>', 'Mode de facturation (none, subscription, commission)')
        .option('-c, --commission-rate <rate>', 'Taux de commission (%)', parseFloat)
        .option('-w, --webhook-url <webhookUrl>', 'URL de notification (webhook)')
        .option('--sandbox-key <sandboxApiKey>', 'Clé API FedaPay Sandbox')
        .option('--live-key <liveApiKey>', 'Clé API FedaPay Live')
        .option('--feexpay-key <feexpayApiKey>', 'Clé API Feexpay')
        .option('--feexpay-shop <feexpayShopId>', 'ID Boutique Feexpay')
        .option('--webhook-secret <webhookSecret>', 'Secret du Webhook FedaPay')
        .option('--send-invoices <sendInvoices>', 'Envoyer les factures (true/false)', (v) => v === 'true')
        .action(async (slug, options) => {
            requireAuth();
            try {
                // remove undefined values
                const body = Object.fromEntries(Object.entries(options).filter(([_, v]) => v !== undefined));
                const response = await apiClient.patch(`/projects/${slug}`, body);
                console.log(chalk.green(`\n✓ Projet "${response.data.name}" mis à jour avec succès !\n`));
            } catch (err: any) {
                console.error(chalk.red('✗ Échec de la mise à jour :'), err.response?.data?.message || err.message);
                process.exit(1);
            }
        });

    // 5. DELETE PROJECT
    project
        .command('delete <slug>')
        .description('Supprimer (désactiver) un projet')
        .action(async (slug) => {
            requireAuth();
            try {
                await apiClient.delete(`/projects/${slug}`);
                console.log(chalk.green(`\n✓ Projet "${slug}" désactivé/supprimé avec succès.\n`));
            } catch (err: any) {
                console.error(chalk.red('✗ Échec de la suppression :'), err.response?.data?.message || err.message);
                process.exit(1);
            }
        });

    // 6. SHOW USAGE
    project
        .command('usage <slug>')
        .description('Afficher les quotas et l\'utilisation du mois en cours')
        .action(async (slug) => {
            requireAuth();
            try {
                const response = await apiClient.get(`/projects/${slug}/usage`);
                const usage = response.data;

                console.log(chalk.bold(`\nQuotas et utilisation pour "${slug}" (${usage.month}) :`));
                console.log(`  Plan SaaS Actif : ${chalk.blue(usage.planName)}`);
                
                const sbUsage = usage.sandboxCallsCount;
                const sbLimit = usage.sandboxLimit;
                const sbPercent = sbLimit > 0 ? ((sbUsage / sbLimit) * 100).toFixed(1) : '0';
                console.log(`  Appels Sandbox  : ${sbUsage} / ${sbLimit} (${sbPercent}%)`);

                const liveUsage = usage.liveTransactionsCount;
                const liveLimit = usage.liveLimit;
                const livePercent = liveLimit > 0 ? ((liveUsage / liveLimit) * 100).toFixed(1) : '0';
                console.log(`  Paiements Live  : ${liveUsage} / ${liveLimit} (${livePercent}%)\n`);
            } catch (err: any) {
                console.error(chalk.red('✗ Erreur lors de la récupération des quotas :'), err.response?.data?.message || err.message);
                process.exit(1);
            }
        });

    // 7. STREAM LOGS
    project
        .command('logs <slug>')
        .description('Streamer les logs de requêtes du proxy en temps réel')
        .action(async (slug) => {
            requireAuth();
            console.log(chalk.cyan(`\nConnecting to logs stream for "${slug}"... Press Ctrl+C to stop.\n`));
            try {
                const response = await apiClient.get(`/projects/${slug}/logs/stream`, {
                    responseType: 'stream',
                });
                
                const stream = response.data;
                let buffer = '';

                stream.on('data', (chunk: Buffer) => {
                    buffer += chunk.toString();
                    const events = buffer.split('\n\n');
                    buffer = events.pop() || ''; // Keep incomplete part in buffer

                    for (const event of events) {
                        const lines = event.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const logObj = JSON.parse(line.substring(6));
                                    const statusColor = logObj.status >= 500 ? chalk.red 
                                                      : logObj.status >= 400 ? chalk.yellow 
                                                      : chalk.green;
                                    const methodColor = logObj.method === 'POST' ? chalk.magenta 
                                                      : logObj.method === 'DELETE' ? chalk.red 
                                                      : logObj.method === 'PATCH' ? chalk.blue 
                                                      : chalk.cyan;
                                    
                                    console.log(
                                        `[${chalk.dim(logObj.timestamp)}] ` +
                                        `${methodColor(logObj.method.padEnd(6))} ` +
                                        `${chalk.white(logObj.path.padEnd(30))} ` +
                                        `Status: ${statusColor(logObj.status)} ` +
                                        `Duration: ${chalk.yellow(logObj.duration + 'ms')} ` +
                                        `Env: ${chalk.blue(logObj.env)}`
                                    );
                                } catch (e) {
                                    // ignore invalid json
                                }
                            }
                        }
                    }
                });

                stream.on('error', (err: any) => {
                    console.error(chalk.red('✗ Erreur de flux :'), err.message);
                    process.exit(1);
                });

                stream.on('end', () => {
                    console.log(chalk.yellow('\nℹ Flux de logs fermé par le serveur.\n'));
                });

            } catch (err: any) {
                console.error(chalk.red('✗ Impossible d\'établir la connexion de streaming :'), err.response?.data?.message || err.message);
                process.exit(1);
            }
        });
}
