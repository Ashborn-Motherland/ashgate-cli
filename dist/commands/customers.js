"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCustomerCommands = registerCustomerCommands;
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
function registerCustomerCommands(program) {
    const custCmd = program.command('customers').description('Gérer les clients FedaPay pour le projet actif');
    custCmd
        .command('list')
        .description('Lister les clients')
        .action(async () => {
        try {
            const cfg = config_1.walletConfig.get();
            if (!cfg.activeProject) {
                return console.error(chalk_1.default.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
            }
            const pKey = await getProjectKey(cfg.activeProject);
            const data = await client_1.fedapayApi.customers.list(pKey, cfg.environment);
            console.log(chalk_1.default.green('✓ Clients récupérés :'));
            if (data.customers && data.customers.length > 0) {
                data.customers.forEach((c) => {
                    console.log(`- ID: ${c.id} | Nom: ${c.firstname} ${c.lastname} | Email: ${c.email || 'N/A'}`);
                });
            }
            else {
                console.log(chalk_1.default.dim('Aucun client trouvé.'));
            }
        }
        catch (err) {
            // Interceptor handles error
        }
    });
    custCmd
        .command('create')
        .description('Créer un nouveau client FedaPay')
        .requiredOption('-f, --firstname <firstname>', 'Prénom')
        .requiredOption('-l, --lastname <lastname>', 'Nom de famille')
        .option('-e, --email <email>', 'Adresse email')
        .action(async (options) => {
        try {
            const cfg = config_1.walletConfig.get();
            if (!cfg.activeProject) {
                return console.error(chalk_1.default.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
            }
            const pKey = await getProjectKey(cfg.activeProject);
            const payload = {
                firstname: options.firstname,
                lastname: options.lastname,
                email: options.email,
            };
            const data = await client_1.fedapayApi.customers.create(payload, pKey, cfg.environment);
            console.log(chalk_1.default.green('✓ Client créé :'));
            console.log(`ID: ${data.customer?.id ?? data.id}`);
        }
        catch (err) {
            // Interceptor handles error
        }
    });
}
