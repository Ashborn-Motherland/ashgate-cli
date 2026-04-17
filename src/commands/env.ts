import { Command } from 'commander';
import chalk from 'chalk';
import { walletConfig } from '../config/config';

export function registerEnvCommands(program: Command): void {
    const env = program.command('env').description('Gestion de l\'environnement (sandbox/live)');

    env
        .command('sandbox')
        .description('Basculer en mode Sandbox (développement/test)')
        .action(() => {
            walletConfig.set({ environment: 'sandbox' });
            console.log(chalk.cyan('✓ Environnement basculé sur ') + chalk.bold('SANDBOX'));
            console.log(chalk.dim('  Les requêtes proxy utiliseront votre clé FedaPay Sandbox.'));
            console.log(chalk.dim('  Aucune transaction réelle ne sera effectuée.'));
        });

    env
        .command('live')
        .description('Basculer en mode Live (production)')
        .action(() => {
            walletConfig.set({ environment: 'live' });
            console.log(chalk.yellow('⚠  Environnement basculé sur ') + chalk.bold.red('LIVE'));
            console.log(chalk.dim('  Les requêtes proxy utiliseront votre clé FedaPay Live.'));
            console.log(chalk.dim('  Assurez-vous que la clé Live est configurée dans le dashboard.'));
        });

    env
        .command('status')
        .description('Afficher l\'environnement actif')
        .action(() => {
            const cfg = walletConfig.get();
            const envLabel = cfg.environment === 'live'
                ? chalk.bold.red('LIVE')
                : chalk.bold.cyan('SANDBOX');
            console.log(`Environnement : ${envLabel}`);
            console.log(`Cloud         : ${cfg.cloudUrl}`);
            if (cfg.activeProject) {
                console.log(`Projet actif  : ${chalk.bold(cfg.activeProject)}`);
            }
        });
}
