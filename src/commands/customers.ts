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

export function registerCustomerCommands(program: Command) {
    const custCmd = program.command('customers').description('Gérer les clients FedaPay pour le projet actif');

    custCmd
        .command('list')
        .description('Lister les clients')
        .action(async () => {
            try {
                const cfg = walletConfig.get();
                if (!cfg.activeProject) {
                    return console.error(chalk.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
                }
                const pKey = await getProjectKey(cfg.activeProject);
                const data = await fedapayApi.customers.list(pKey, cfg.environment);
                console.log(chalk.green('✓ Clients récupérés :'));
                if (data.customers && data.customers.length > 0) {
                    data.customers.forEach((c: any) => {
                        console.log(`- ID: ${c.id} | Nom: ${c.firstname} ${c.lastname} | Email: ${c.email || 'N/A'}`);
                    });
                } else {
                    console.log(chalk.dim('Aucun client trouvé.'));
                }
            } catch (err: any) {
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
                const cfg = walletConfig.get();
                if (!cfg.activeProject) {
                    return console.error(chalk.red('✗ Aucun projet actif. Utilisez : wallet project use <slug>'));
                }
                const pKey = await getProjectKey(cfg.activeProject);
                const payload: any = {
                    firstname: options.firstname,
                    lastname: options.lastname,
                    email: options.email,
                };
                const data = await fedapayApi.customers.create(payload, pKey, cfg.environment);
                console.log(chalk.green('✓ Client créé :'));
                console.log(`ID: ${data.customer?.id ?? data.id}`);
            } catch (err: any) {
                // Interceptor handles error
            }
        });
}
