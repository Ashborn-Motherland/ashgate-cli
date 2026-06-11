"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProjectCommands = registerProjectCommands;
const chalk_1 = __importDefault(require("chalk"));
const client_1 = require("../api/client");
const keycloak_1 = require("../auth/keycloak");
function mapOptionsToDto(options) {
    const { sandboxKey, sandboxApiKey, liveKey, liveApiKey, feexpayKey, feexpayApiKey, feexpayShop, feexpayShopId, stripeKey, stripeSecretKey, stripePub, stripePublishableKey, stripeWebhook, stripeWebhookSecret, ...rest } = options;
    const dto = { ...rest };
    const valOrUndefined = (val1, val2) => {
        if (val1 !== undefined)
            return val1;
        if (val2 !== undefined)
            return val2;
        return undefined;
    };
    const sandboxVal = valOrUndefined(sandboxApiKey, sandboxKey);
    if (sandboxVal !== undefined)
        dto.sandboxApiKey = sandboxVal;
    const liveVal = valOrUndefined(liveApiKey, liveKey);
    if (liveVal !== undefined)
        dto.liveApiKey = liveVal;
    const feexpayVal = valOrUndefined(feexpayApiKey, feexpayKey);
    if (feexpayVal !== undefined)
        dto.feexpayApiKey = feexpayVal;
    const feexpayShopVal = valOrUndefined(feexpayShopId, feexpayShop);
    if (feexpayShopVal !== undefined)
        dto.feexpayShopId = feexpayShopVal;
    const stripeKeyVal = valOrUndefined(stripeSecretKey, stripeKey);
    if (stripeKeyVal !== undefined)
        dto.stripeSecretKey = stripeKeyVal;
    const stripePubVal = valOrUndefined(stripePublishableKey, stripePub);
    if (stripePubVal !== undefined)
        dto.stripePublishableKey = stripePubVal;
    const stripeWebhookVal = valOrUndefined(stripeWebhookSecret, stripeWebhook);
    if (stripeWebhookVal !== undefined)
        dto.stripeWebhookSecret = stripeWebhookVal;
    return dto;
}
function registerProjectCommands(program) {
    const project = program.command('project').description('Gestion des projets de paiement');
    // 1. LIST PROJECTS
    project
        .command('list')
        .description('Lister tous vos projets')
        .action(async () => {
        (0, keycloak_1.requireAuth)();
        try {
            const response = await client_1.apiClient.get('/projects');
            const projects = response.data;
            if (!Array.isArray(projects) || projects.length === 0) {
                console.log(chalk_1.default.yellow('\nℹ Aucun projet trouvé. Créez-en un avec : ashgate project create'));
                return;
            }
            console.log(chalk_1.default.bold('\nVos projets :'));
            console.log(chalk_1.default.underline(`${'Nom'.padEnd(25)} ${'Slug'.padEnd(25)} ${'Billing Mode'.padEnd(15)} ${'Statut'.padEnd(10)}`));
            for (const p of projects) {
                const statusStr = p.isActive !== false ? chalk_1.default.green('actif') : chalk_1.default.red('inactif');
                console.log(`${(p.name || '').padEnd(25)} ` +
                    `${(p.slug || '').padEnd(25)} ` +
                    `${(p.billingMode || 'none').padEnd(15)} ` +
                    `${statusStr}`);
            }
            console.log('');
        }
        catch (err) {
            console.error(chalk_1.default.red('✗ Erreur lors de la récupération des projets :'), err.response?.data?.message || err.message);
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
        .option('--stripe-key <stripeSecretKey>', 'Clé API Stripe Secrète (Secret Key)')
        .option('--stripe-pub <stripePublishableKey>', 'Clé API Stripe Publique (Publishable Key)')
        .option('--stripe-webhook <stripeWebhookSecret>', 'Secret du Webhook Stripe')
        .option('--send-invoices <sendInvoices>', 'Envoyer les factures par email automatiquement (true/false)', (v) => v === 'true')
        .action(async (options) => {
        (0, keycloak_1.requireAuth)();
        try {
            const dto = mapOptionsToDto(options);
            const response = await client_1.apiClient.post('/projects', dto);
            console.log(chalk_1.default.green(`\n✓ Projet créé avec succès !`));
            console.log(`  Nom  : ${response.data.name}`);
            console.log(`  Slug : ${response.data.slug}`);
            console.log(`  Clé Publique  : ${response.data.publicKey}`);
            console.log(`  Clé Secrète   : ${response.data.secretKey}\n`);
        }
        catch (err) {
            console.error(chalk_1.default.red('✗ Échec de la création du projet :'), err.response?.data?.message || err.message);
            process.exit(1);
        }
    });
    // 3. SHOW PROJECT
    project
        .command('show <slug>')
        .description('Afficher les détails d\'un projet')
        .action(async (slug) => {
        (0, keycloak_1.requireAuth)();
        try {
            const response = await client_1.apiClient.get(`/projects/${slug}`);
            const p = response.data;
            console.log(chalk_1.default.bold(`\nDétails du projet [${p.name}] :`));
            console.log(`  ID            : ${p._id || p.id}`);
            console.log(`  Slug          : ${p.slug}`);
            console.log(`  Billing Mode  : ${p.billingMode || 'none'}`);
            if (p.billingMode === 'commission') {
                console.log(`  Commission    : ${p.commissionRate || 0}%`);
            }
            console.log(`  Statut        : ${p.isActive !== false ? chalk_1.default.green('Actif') : chalk_1.default.red('Inactif')}`);
            console.log(`  Webhook URL   : ${p.webhookUrl || chalk_1.default.dim('non configuré')}`);
            console.log(`  Priorité Pmt  : ${p.paymentProviderPriority?.join(' -> ') || 'non configuré'}`);
            console.log(`  Clé Publique  : ${p.publicKey || 'non configurée'}`);
            console.log(`  Clé Secrète   : ${p.secretKey || 'non configurée'}`);
            console.log(chalk_1.default.bold('\nConfiguration des API keys :'));
            console.log(`  FedaPay Sandbox API Key : ${p.sandboxApiKey ? chalk_1.default.green('Configurée') : chalk_1.default.dim('Non configurée')}`);
            console.log(`  FedaPay Live API Key    : ${p.liveApiKey ? chalk_1.default.green('Configurée') : chalk_1.default.dim('Non configurée')}`);
            console.log(`  FedaPay Webhook Secret  : ${p.webhookSecret ? chalk_1.default.green('Configurée') : chalk_1.default.dim('Non configurée')}`);
            console.log(`  FeexPay API Key         : ${p.feexpayApiKey ? chalk_1.default.green('Configurée') : chalk_1.default.dim('Non configurée')}`);
            console.log(`  FeexPay Shop ID         : ${p.feexpayShopId ? chalk_1.default.green('Configuré') : chalk_1.default.dim('Non configuré')}`);
            console.log(`  Stripe Secret Key       : ${p.stripeSecretKey ? chalk_1.default.green('Configurée') : chalk_1.default.dim('Non configurée')}`);
            console.log(`  Stripe Publishable Key  : ${p.stripePublishableKey ? chalk_1.default.green('Configurée') : chalk_1.default.dim('Non configurée')}`);
            console.log(`  Stripe Webhook Secret   : ${p.stripeWebhookSecret ? chalk_1.default.green('Configuré') : chalk_1.default.dim('Non configuré')}\n`);
        }
        catch (err) {
            console.error(chalk_1.default.red('✗ Impossible d\'afficher le projet :'), err.response?.data?.message || err.message);
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
        .option('--stripe-key <stripeSecretKey>', 'Clé API Stripe Secrète (Secret Key)')
        .option('--stripe-pub <stripePublishableKey>', 'Clé API Stripe Publique (Publishable Key)')
        .option('--stripe-webhook <stripeWebhookSecret>', 'Secret du Webhook Stripe')
        .option('--send-invoices <sendInvoices>', 'Envoyer les factures (true/false)', (v) => v === 'true')
        .action(async (slug, options) => {
        (0, keycloak_1.requireAuth)();
        try {
            const dto = mapOptionsToDto(options);
            // remove undefined values
            const body = Object.fromEntries(Object.entries(dto).filter(([_, v]) => v !== undefined));
            const response = await client_1.apiClient.patch(`/projects/${slug}`, body);
            console.log(chalk_1.default.green(`\n✓ Projet "${response.data.name}" mis à jour avec succès !\n`));
        }
        catch (err) {
            console.error(chalk_1.default.red('✗ Échec de la mise à jour :'), err.response?.data?.message || err.message);
            process.exit(1);
        }
    });
    // 5. DELETE PROJECT
    project
        .command('delete <slug>')
        .description('Supprimer (désactiver) un projet')
        .action(async (slug) => {
        (0, keycloak_1.requireAuth)();
        try {
            await client_1.apiClient.delete(`/projects/${slug}`);
            console.log(chalk_1.default.green(`\n✓ Projet "${slug}" désactivé/supprimé avec succès.\n`));
        }
        catch (err) {
            console.error(chalk_1.default.red('✗ Échec de la suppression :'), err.response?.data?.message || err.message);
            process.exit(1);
        }
    });
    // 6. SHOW USAGE
    project
        .command('usage <slug>')
        .description('Afficher les quotas et l\'utilisation du mois en cours')
        .action(async (slug) => {
        (0, keycloak_1.requireAuth)();
        try {
            const response = await client_1.apiClient.get(`/projects/${slug}/usage`);
            const usage = response.data;
            console.log(chalk_1.default.bold(`\nQuotas et utilisation pour "${slug}" (${usage.month}) :`));
            console.log(`  Plan SaaS Actif : ${chalk_1.default.blue(usage.planName)}`);
            const sbUsage = usage.sandboxCallsCount;
            const sbLimit = usage.sandboxLimit;
            const sbPercent = sbLimit > 0 ? ((sbUsage / sbLimit) * 100).toFixed(1) : '0';
            console.log(`  Appels Sandbox  : ${sbUsage} / ${sbLimit} (${sbPercent}%)`);
            const liveUsage = usage.liveTransactionsCount;
            const liveLimit = usage.liveLimit;
            const livePercent = liveLimit > 0 ? ((liveUsage / liveLimit) * 100).toFixed(1) : '0';
            console.log(`  Paiements Live  : ${liveUsage} / ${liveLimit} (${livePercent}%)\n`);
        }
        catch (err) {
            console.error(chalk_1.default.red('✗ Erreur lors de la récupération des quotas :'), err.response?.data?.message || err.message);
            process.exit(1);
        }
    });
    // 7. STREAM LOGS
    project
        .command('logs <slug>')
        .description('Streamer les logs de requêtes du proxy en temps réel')
        .action(async (slug) => {
        (0, keycloak_1.requireAuth)();
        console.log(chalk_1.default.cyan(`\nConnecting to logs stream for "${slug}"... Press Ctrl+C to stop.\n`));
        try {
            const response = await client_1.apiClient.get(`/projects/${slug}/logs/stream`, {
                responseType: 'stream',
            });
            const stream = response.data;
            let buffer = '';
            stream.on('data', (chunk) => {
                buffer += chunk.toString();
                const events = buffer.split('\n\n');
                buffer = events.pop() || ''; // Keep incomplete part in buffer
                for (const event of events) {
                    const lines = event.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const logObj = JSON.parse(line.substring(6));
                                const statusColor = logObj.status >= 500 ? chalk_1.default.red
                                    : logObj.status >= 400 ? chalk_1.default.yellow
                                        : chalk_1.default.green;
                                const methodColor = logObj.method === 'POST' ? chalk_1.default.magenta
                                    : logObj.method === 'DELETE' ? chalk_1.default.red
                                        : logObj.method === 'PATCH' ? chalk_1.default.blue
                                            : chalk_1.default.cyan;
                                console.log(`[${chalk_1.default.dim(logObj.timestamp)}] ` +
                                    `${methodColor(logObj.method.padEnd(6))} ` +
                                    `${chalk_1.default.white(logObj.path.padEnd(30))} ` +
                                    `Status: ${statusColor(logObj.status)} ` +
                                    `Duration: ${chalk_1.default.yellow(logObj.duration + 'ms')} ` +
                                    `Env: ${chalk_1.default.blue(logObj.env)}`);
                            }
                            catch (e) {
                                // ignore invalid json
                            }
                        }
                    }
                }
            });
            stream.on('error', (err) => {
                console.error(chalk_1.default.red('✗ Erreur de flux :'), err.message);
                process.exit(1);
            });
            stream.on('end', () => {
                console.log(chalk_1.default.yellow('\nℹ Flux de logs fermé par le serveur.\n'));
            });
        }
        catch (err) {
            console.error(chalk_1.default.red('✗ Impossible d\'établir la connexion de streaming :'), err.response?.data?.message || err.message);
            process.exit(1);
        }
    });
}
