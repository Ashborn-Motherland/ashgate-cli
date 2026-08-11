#!/usr/bin/env node
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const auth_1 = require("./commands/auth");
const template_1 = require("./commands/template");
const config_1 = require("./config/config");
const program = new commander_1.Command();
program
    .name('ashgate')
    .description(chalk_1.default.bold('ashgate-cli') +
    ' — Interface en ligne de commande pour la plateforme Ashgate\n' +
    chalk_1.default.dim('  Connectez-vous à votre compte et gérez votre session.'))
    .version('3.0.0');
// Enregistrement uniquement des commandes d'authentification
(0, auth_1.registerAuthCommands)(program);
(0, template_1.registerTemplateCommands)(program);
// Commande config — afficher l'état de l'authentification
program
    .command('status')
    .description('Afficher l\'état de la connexion')
    .action(() => {
    const cfg = config_1.walletConfig.get();
    const tokens = config_1.walletConfig.getTokens();
    console.log(chalk_1.default.bold('\nStatut ashgate-cli'));
    console.log(`  Cloud URL     : ${cfg.cloudUrl}`);
    console.log(`  Authentifié   : ${tokens.accessToken && tokens.expiresAt > Date.now() ? chalk_1.default.green('oui') : chalk_1.default.red('non')}`);
});
program.parse(process.argv);
// Si aucune commande fournie, afficher l'aide
if (process.argv.length <= 2) {
    program.help();
}
