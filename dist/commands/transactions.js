"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTransactionCommands = registerTransactionCommands;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../config/config");
const client_1 = require("../api/client");
async function getProjectKey(slug) {
    const project = await client_1.projectsApi.get(slug);
    if (!project || !project.publicKey) {
        throw new Error(`Public key non trouvée pour le projet ${slug}.`);
    }
    return project.publicKey;
}
function registerTransactionCommands(program) {
    const transactionsCmd = program.command('transactions').description('Gérer les transactions FedaPay pour le projet actif');
    transactionsCmd
        .command('list')
        .description('Lister les transactions')
        .action(async () => {
        try {
            const cfg = config_1.walletConfig.get();
            if (!cfg.activeProject) {
                return console.error(chalk_1.default.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
            }
            const pKey = await getProjectKey(cfg.activeProject);
            const data = await client_1.fedapayApi.transactions.list(pKey, cfg.environment);
            console.log(chalk_1.default.green('✓ Transactions récupérées :'));
            if (data.transactions && data.transactions.length > 0) {
                data.transactions.forEach((t) => {
                    console.log(`- ID: ${t.id} | Status: ${t.status} | Montant: ${t.amount} ${t.currency?.iso || 'XOF'} | Ref: ${t.reference}`);
                });
            }
            else {
                console.log(chalk_1.default.dim('Aucune transaction trouvée.'));
            }
        }
        catch (err) {
            // Erreur déjà affichée par l'interceptor
        }
    });
    transactionsCmd
        .command('get <id>')
        .description('Récupérer les détails d\'une transaction')
        .action(async (id) => {
        try {
            const cfg = config_1.walletConfig.get();
            if (!cfg.activeProject) {
                return console.error(chalk_1.default.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
            }
            const pKey = await getProjectKey(cfg.activeProject);
            const data = await client_1.fedapayApi.transactions.get(id, pKey, cfg.environment);
            console.log(chalk_1.default.green('✓ Détails de la transaction :'));
            console.log(JSON.stringify(data.transaction || data, null, 2));
        }
        catch (err) {
            // Erreur déjà affichée par l'interceptor
        }
    });
    transactionsCmd
        .command('create')
        .description('Créer une nouvelle transaction FedaPay (sandbox utile)')
        .requiredOption('-a, --amount <amount>', 'Montant de la transaction')
        .requiredOption('-d, --desc <description>', 'Description de la transaction')
        .option('-e, --email <email>', 'Email du client')
        .action(async (options) => {
        try {
            const cfg = config_1.walletConfig.get();
            if (!cfg.activeProject) {
                return console.error(chalk_1.default.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
            }
            const pKey = await getProjectKey(cfg.activeProject);
            const payload = {
                amount: parseInt(options.amount),
                description: options.desc,
                currency: { iso: 'XOF' },
            };
            if (options.email) {
                payload.customer = { email: options.email, firstname: 'Test', lastname: 'Client' };
            }
            const data = await client_1.fedapayApi.transactions.create(payload, pKey, cfg.environment);
            console.log(chalk_1.default.green('✓ Transaction créée :'));
            console.log(`ID: ${data.transaction?.id ?? data.id}`);
        }
        catch (err) {
            // Erreur déjà affichée par l'interceptor
        }
    });
}
