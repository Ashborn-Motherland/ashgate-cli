#!/usr/bin/env node
'use strict';

import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import { registerAuthCommands } from './commands/auth';
import { walletConfig } from './config/config';

const program = new Command();

program
    .name('ashgate')
    .description(
        chalk.bold('ashgate-cli') +
        ' — Interface en ligne de commande pour la plateforme Ashgate\n' +
        chalk.dim('  Connectez-vous à votre compte et gérez votre session.'),
    )
    .version('3.0.0');

// Enregistrement uniquement des commandes d'authentification
registerAuthCommands(program);

// Commande config — afficher l'état de l'authentification
program
    .command('status')
    .description('Afficher l\'état de la connexion')
    .action(() => {
        const cfg = walletConfig.get();
        const tokens = walletConfig.getTokens();
        console.log(chalk.bold('\nStatut ashgate-cli'));
        console.log(`  Cloud URL     : ${cfg.cloudUrl}`);
        console.log(`  Authentifié   : ${tokens.accessToken && tokens.expiresAt > Date.now() ? chalk.green('oui') : chalk.red('non')}`);
    });

program.parse(process.argv);

// Si aucune commande fournie, afficher l'aide
if (process.argv.length <= 2) {
    program.help();
}
