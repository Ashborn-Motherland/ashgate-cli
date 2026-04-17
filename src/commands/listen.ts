import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

export function registerListenCommands(program: Command) {
    program
        .command('listen')
        .description('Écouter localement les Webhooks FedaPay (Bêta)')
        .option('-f, --forward-to <url>', 'URL locale de redirection', 'http://localhost:3005/fedapay/webhook')
        .action(async (options) => {
            console.log(chalk.blue('Écoute des webhooks FedaPay 🚀'));
            console.log(chalk.dim(`Redirection vers : ${options.forwardTo}`));
            console.log(chalk.dim(`\n(Bientôt disponible : Le tunnel Node.JS complet vers ash-bwallet sera implémenté dans la prochaine mise à jour.)`));

            const spinner = ora('Connexion au proxy de webhooks...').start();
            setTimeout(() => {
                spinner.text = 'En attente d\'événements (Appuyez sur Ctrl+C pour quitter)...';
            }, 1000);
        });
}
