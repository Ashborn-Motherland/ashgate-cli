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

export function registerPayoutCommands(program: Command) {
    const payoutCmd = program.command('payouts').description('Gérer les reversements (payouts) FedaPay pour le projet actif');

    payoutCmd
        .command('list')
        .description('Lister les paiements ou reversements')
        .action(async () => {
            try {
                const cfg = walletConfig.get();
                if (!cfg.activeProject) {
                    return console.error(chalk.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
                }
                const pKey = await getProjectKey(cfg.activeProject);
                const data = await fedapayApi.payouts.list(pKey, cfg.environment);
                console.log(chalk.green('✓ Reversements récupérés :'));
                if (data.payouts && data.payouts.length > 0) {
                    data.payouts.forEach((p: any) => {
                        console.log(`- ID: ${p.id} | Status: ${p.status} | Montant: ${p.amount} ${p.currency?.iso || 'XOF'}`);
                    });
                } else {
                    console.log(chalk.dim('Aucun reversement trouvé.'));
                }
            } catch (err: any) {
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
                const cfg = walletConfig.get();
                if (!cfg.activeProject) {
                    return console.error(chalk.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
                }
                const pKey = await getProjectKey(cfg.activeProject);
                const payload: any = {
                    amount: parseInt(options.amount),
                    customer: { id: parseInt(options.customer) },
                    currency: { iso: 'XOF' },
                };
                const data = await fedapayApi.payouts.create(payload, pKey, cfg.environment);
                console.log(chalk.green('✓ Reversement créé :'));
                console.log(`ID: ${data.payout?.id ?? data.id}`);
            } catch (err: any) {
                // Interceptor handles error
            }
        });
}
