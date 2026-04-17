"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerListenCommands = registerListenCommands;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
function registerListenCommands(program) {
    program
        .command('listen')
        .description('Écouter localement les Webhooks FedaPay (Bêta)')
        .option('-f, --forward-to <url>', 'URL locale de redirection', 'http://localhost:3005/fedapay/webhook')
        .action(async (options) => {
        console.log(chalk_1.default.blue('Écoute des webhooks FedaPay 🚀'));
        console.log(chalk_1.default.dim(`Redirection vers : ${options.forwardTo}`));
        console.log(chalk_1.default.dim(`\n(Bientôt disponible : Le tunnel Node.JS complet vers ash-bwallet sera implémenté dans la prochaine mise à jour.)`));
        const spinner = (0, ora_1.default)('Connexion au proxy de webhooks...').start();
        setTimeout(() => {
            spinner.text = 'En attente d\'événements (Appuyez sur Ctrl+C pour quitter)...';
        }, 1000);
    });
}
