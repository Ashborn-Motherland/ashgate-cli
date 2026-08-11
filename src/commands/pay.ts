import { Command } from 'commander';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import open from 'open';
import { apiClient } from '../api/client';
import { requireAuth } from '../auth/keycloak';
import { walletConfig } from '../config/config';

export function registerPayCommands(program: Command): void {
    program
        .command('pay')
        .description('Créer et tester un paiement directement depuis la ligne de commande')
        .option('-a, --amount <amount>', 'Montant du paiement (ex: 5000)', parseFloat)
        .option('-c, --currency <currency>', 'Devise (XOF, EUR, USD)', 'XOF')
        .option('-p, --provider <provider>', 'Fournisseur (fedapay, feexpay, stripe)', 'fedapay')
        .option('-e, --email <email>', 'Email du client', 'client@example.com')
        .option('-f, --firstname <firstname>', 'Prénom du client', 'Client')
        .option('-l, --lastname <lastname>', 'Nom du client', 'Ashgate')
        .option('--phone <phone>', 'Numéro de téléphone (ex: 90000000)', '90000000')
        .option('--operator <operator>', 'Opérateur mobile (mtn, moov, celtiis)', 'mtn')
        .option('-d, --description <description>', 'Description du paiement', 'Paiement via Ashgate CLI')
        .option('--slug <slug>', 'Slug du projet Ashgate à utiliser')
        .option('--open', 'Ouvrir automatiquement le lien de paiement dans le navigateur')
        .action(async (options) => {
            requireAuth();
            try {
                const amount = options.amount || 5000;
                const currency = options.currency || 'XOF';
                const provider = (options.provider || 'fedapay').toLowerCase();
                const email = options.email;
                const firstname = options.firstname;
                const lastname = options.lastname;
                const phone = options.phone;
                const operator = options.operator || 'mtn';
                const description = options.description;

                let projectKey = '';
                let projectSlug = options.slug || '';

                // Récupérer la liste des projets pour obtenir la clé publique
                const projectsResponse = await apiClient.get('/projects');
                const projects = projectsResponse.data;

                if (!Array.isArray(projects) || projects.length === 0) {
                    console.log(chalk.yellow('\nAucun projet trouvé. Veuillez créer un projet avec : ashgate project create'));
                    return;
                }

                let selectedProject = projects[0];
                if (projectSlug) {
                    const found = projects.find((p: any) => p.slug === projectSlug);
                    if (found) selectedProject = found;
                }

                projectKey = selectedProject.publicKey;
                projectSlug = selectedProject.slug;

                console.log(chalk.bold(`\nInitiation du paiement [Projet: ${selectedProject.name}]...`));
                console.log(`  Fournisseur   : ${chalk.cyan(provider.toUpperCase())}`);
                console.log(`  Montant       : ${chalk.green(amount + ' ' + currency)}`);
                console.log(`  Client        : ${firstname} ${lastname} (${email})`);

                const cloudUrl = walletConfig.get().cloudUrl;

                let paymentUrl = '';
                let transactionId = '';

                if (provider === 'feexpay') {
                    const response = await apiClient.post('/feexpay/payin', {
                        network: operator,
                        amount: amount,
                        phoneNumber: phone,
                        fullname: `${firstname} ${lastname}`,
                        email: email,
                        description: description,
                    }, {
                        headers: {
                            'x-feda-project-key': projectKey,
                        }
                    });

                    paymentUrl = response.data.url || response.data.payment_url;
                    transactionId = response.data.reference || response.data.id || 'FEEX-' + Date.now();
                } else {
                    // FedaPay & Stripe proxy
                    const response = await apiClient.post('/fedapay/direct-payment', {
                        provider: provider,
                        amount: amount,
                        currency: currency,
                        email: email,
                        firstname: firstname,
                        lastname: lastname,
                        phoneNumber: phone,
                        description: description,
                    }, {
                        headers: {
                            'x-feda-project-key': projectKey,
                        }
                    });

                    paymentUrl = response.data.url || response.data.payment_url;
                    transactionId = response.data.id || response.data.reference || 'TX-' + Date.now();
                }

                console.log(chalk.bold.green('\n[OK] Transaction de paiement initialisée !'));
                console.log(`  ID Transaction : ${transactionId}`);
                if (paymentUrl) {
                    console.log(`  Lien de paiement : ${chalk.underline.blue(paymentUrl)}\n`);
                    console.log(chalk.bold('QR Code de paiement :'));
                    qrcode.generate(paymentUrl, { small: true });

                    if (options.open) {
                        console.log(chalk.dim('\nOuverture dans le navigateur...'));
                        await open(paymentUrl);
                    }
                } else {
                    console.log(chalk.yellow('  (Demande de confirmation USSD envoyée sur le mobile du client)'));
                }
                console.log('');
            } catch (err: any) {
                console.error(chalk.red('\n[FAIL] Échec du paiement :'), err.response?.data?.message || err.message);
                process.exit(1);
            }
        });
}
