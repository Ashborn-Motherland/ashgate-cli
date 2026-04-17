"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPayoutCommands = registerPayoutCommands;
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
function registerPayoutCommands(program) {
    const payoutCmd = program.command('payouts').description('Gérer les reversements (payouts) FedaPay pour le projet actif');
    payoutCmd
        .command('list')
        .description('Lister les paiements ou reversements')
        .action(async () => {
        try {
            const cfg = config_1.walletConfig.get();
            if (!cfg.activeProject) {
                return console.error(chalk_1.default.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
            }
            const pKey = await getProjectKey(cfg.activeProject);
            const data = await client_1.fedapayApi.payouts.list(pKey, cfg.environment);
            console.log(chalk_1.default.green('✓ Reversements récupérés :'));
            if (data.payouts && data.payouts.length > 0) {
                data.payouts.forEach((p) => {
                    console.log(`- ID: ${p.id} | Status: ${p.status} | Montant: ${p.amount} ${p.currency?.iso || 'XOF'}`);
                });
            }
            else {
                console.log(chalk_1.default.dim('Aucun reversement trouvé.'));
            }
        }
        catch (err) {
            // Interceptor handles error
        }
    });
    payoutCmd
        .command('create')
        .description('Créer un nouveau reversement (payout)')
        .requiredOption('-a, --amount <amount>', 'Montant du reversement')
        .requiredOption('-c, --customer <customerId>', 'ID du client destinataire')
        .action(async (options) => {
        try {
            const cfg = config_1.walletConfig.get();
            if (!cfg.activeProject) {
                return console.error(chalk_1.default.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
            }
            const pKey = await getProjectKey(cfg.activeProject);
            const payload = {
                amount: parseInt(options.amount),
                customer: { id: parseInt(options.customer) },
                currency: { iso: 'XOF' },
            };
            const data = await client_1.fedapayApi.payouts.create(payload, pKey, cfg.environment);
            console.log(chalk_1.default.green('✓ Reversement créé :'));
            console.log(`ID: ${data.payout?.id ?? data.id}`);
        }
        catch (err) {
            // Interceptor handles error
        }
    });
}
