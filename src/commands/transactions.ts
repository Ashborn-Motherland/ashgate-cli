import { Command } from 'commander';
import chalk from 'chalk';
import { walletConfig } from '../config/config';
import { fedapayApi, projectsApi } from '../api/client';

async function getProjectKey(slug: string): Promise<string> {
    const project = await projectsApi.get(slug);
    if (!project || !project.publicKey) {
        throw new Error(`Public key non trouvée pour le projet ${slug}.`);
    }
    return project.publicKey;
}

export function registerTransactionCommands(program: Command) {
    const transactionsCmd = program.command('transactions').description('Gérer les transactions FedaPay pour le projet actif');

    transactionsCmd
        .command('list')
        .description('Lister les transactions')
        .action(async () => {
            try {
                const cfg = walletConfig.get();
                if (!cfg.activeProject) {
                    return console.error(chalk.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
                }
                const pKey = await getProjectKey(cfg.activeProject);
                const data = await fedapayApi.transactions.list(pKey, cfg.environment);
                console.log(chalk.green('✓ Transactions récupérées :'));
                if (data.transactions && data.transactions.length > 0) {
                    data.transactions.forEach((t: any) => {
                        console.log(`- ID: ${t.id} | Status: ${t.status} | Montant: ${t.amount} ${t.currency?.iso || 'XOF'} | Ref: ${t.reference}`);
                    });
                } else {
                    console.log(chalk.dim('Aucune transaction trouvée.'));
                }
            } catch (err: any) {
                // Erreur déjà affichée par l'interceptor
            }
        });

    transactionsCmd
        .command('get <id>')
        .description('Récupérer les détails d\'une transaction')
        .action(async (id: string) => {
            try {
                const cfg = walletConfig.get();
                if (!cfg.activeProject) {
                    return console.error(chalk.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
                }
                const pKey = await getProjectKey(cfg.activeProject);
                const data = await fedapayApi.transactions.get(id, pKey, cfg.environment);
                console.log(chalk.green('✓ Détails de la transaction :'));
                console.log(JSON.stringify(data.transaction || data, null, 2));
            } catch (err: any) {
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
                const cfg = walletConfig.get();
                if (!cfg.activeProject) {
                    return console.error(chalk.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
                }
                const pKey = await getProjectKey(cfg.activeProject);
                const payload: any = {
                    amount: parseInt(options.amount),
                    description: options.desc,
                    currency: { iso: 'XOF' },
                };
                if (options.email) {
                    payload.customer = { email: options.email, firstname: 'Test', lastname: 'Client' };
                }
                const data = await fedapayApi.transactions.create(payload, pKey, cfg.environment);
                console.log(chalk.green('✓ Transaction créée :'));
                console.log(`ID: ${data.transaction?.id ?? data.id}`);
            } catch (err: any) {
                // Erreur déjà affichée par l'interceptor
            }
        });
}
