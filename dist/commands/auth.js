"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthCommands = registerAuthCommands;
const chalk_1 = __importDefault(require("chalk"));
const keycloak_1 = require("../auth/keycloak");
const config_1 = require("../config/config");
function registerAuthCommands(program) {
    const auth = program.command('auth').description('Gestion de l\'authentification');
    auth
        .command('login')
        .description('Se connecter à la plateforme ash-wallet via Keycloak')
        .action(async () => {
        try {
            await (0, keycloak_1.loginWithKeycloak)();
        }
        catch (err) {
            console.error(chalk_1.default.red('✗ Échec de la connexion :'), err.message);
            process.exit(1);
        }
    });
    auth
        .command('logout')
        .description('Se déconnecter (supprime les tokens locaux)')
        .action(() => {
        config_1.walletConfig.clearTokens();
        console.log(chalk_1.default.green('✓ Déconnecté. À bientôt !'));
    });
    auth
        .command('status')
        .description('Afficher l\'état de la session courante')
        .action(() => {
        const tokens = config_1.walletConfig.getTokens();
        if (!tokens.refreshToken || tokens.refreshExpiresAt <= Date.now()) {
            console.log(chalk_1.default.yellow('✗ Non authentifié. Lancez : wallet auth login'));
            return;
        }
        const msLeft = tokens.refreshExpiresAt - Date.now();
        const daysLeft = Math.floor(msLeft / 86400000);
        const hoursLeft = Math.floor((msLeft % 86400000) / 3600000);
        const minutesLeft = Math.floor((msLeft % 3600000) / 60000);
        const expiryStr = daysLeft > 0
            ? `${daysLeft}j ${hoursLeft}h`
            : hoursLeft > 0
                ? `${hoursLeft}h ${minutesLeft}min`
                : `${minutesLeft}min`;
        console.log(chalk_1.default.green(`✓ Connecté`));
        if (tokens.email)
            console.log(`  Email   : ${tokens.email}`);
        if (tokens.keycloakId)
            console.log(`  ID      : ${tokens.keycloakId}`);
        console.log(`  Session : encore ${expiryStr}`);
    });
}
