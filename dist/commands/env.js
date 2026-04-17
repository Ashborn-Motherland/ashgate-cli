"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEnvCommands = registerEnvCommands;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../config/config");
function registerEnvCommands(program) {
    const env = program.command('env').description('Gestion de l\'environnement (sandbox/live)');
    env
        .command('sandbox')
        .description('Basculer en mode Sandbox (développement/test)')
        .action(() => {
        config_1.walletConfig.set({ environment: 'sandbox' });
        console.log(chalk_1.default.cyan('✓ Environnement basculé sur ') + chalk_1.default.bold('SANDBOX'));
        console.log(chalk_1.default.dim('  Les requêtes proxy utiliseront votre clé FedaPay Sandbox.'));
        console.log(chalk_1.default.dim('  Aucune transaction réelle ne sera effectuée.'));
    });
    env
        .command('live')
        .description('Basculer en mode Live (production)')
        .action(() => {
        config_1.walletConfig.set({ environment: 'live' });
        console.log(chalk_1.default.yellow('⚠  Environnement basculé sur ') + chalk_1.default.bold.red('LIVE'));
        console.log(chalk_1.default.dim('  Les requêtes proxy utiliseront votre clé FedaPay Live.'));
        console.log(chalk_1.default.dim('  Assurez-vous que la clé Live est configurée dans le dashboard.'));
    });
    env
        .command('status')
        .description('Afficher l\'environnement actif')
        .action(() => {
        const cfg = config_1.walletConfig.get();
        const envLabel = cfg.environment === 'live'
            ? chalk_1.default.bold.red('LIVE')
            : chalk_1.default.bold.cyan('SANDBOX');
        console.log(`Environnement : ${envLabel}`);
        console.log(`Cloud         : ${cfg.cloudUrl}`);
        if (cfg.activeProject) {
            console.log(`Projet actif  : ${chalk_1.default.bold(cfg.activeProject)}`);
        }
    });
}
