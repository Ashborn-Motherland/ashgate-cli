import chalk from 'chalk';
import inquirer from 'inquirer';
import open from 'open';
import { saasApi } from '../api/client';

export async function requireProSubscription(): Promise<void> {
    try {
        const subscription = await saasApi.getSubscription();

        if (subscription.plan === 'pro') {
            return;
        }

        console.log('\n');
        console.log(chalk.red('✗ Erreur: La CLI est réservée aux utilisateurs Pro.'));
        console.log(chalk.gray(`  Votre statut actuel est : ${subscription.plan}`));
        console.log('\n');
        
        const answers = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'upgrade',
                message: chalk.yellow('Voulez-vous passer en Pro maintenant (12 000 FCFA/mois) pour débloquer la CLI ?'),
                default: false,
            },
        ]);

        if (answers.upgrade) {
            console.log(chalk.cyan('Génération du lien de paiement...'));
            try {
                const upgradeResult = await saasApi.upgrade();
                
                if (upgradeResult.paymentUrl) {
                    console.log('\n');
                    console.log(chalk.green('✓ Lien généré avec succès !'));
                    console.log(chalk.white('Le lien vient de s\'ouvrir dans votre navigateur pour régler votre abonnement :'));
                    console.log(chalk.bold.underline.blue(upgradeResult.paymentUrl));
                    
                    // Open the browser immediately
                    await open(upgradeResult.paymentUrl);

                    console.log('\n');
                    console.log(chalk.dim('Une fois le paiement effectué, relancez votre commande CLI.'));
                } else if (upgradeResult.success) {
                    console.log('\n');
                    console.log(chalk.green('✓ Abonnement Pro activé sur l\'environnement de test !'));
                    console.log(chalk.dim('Relancez votre commande CLI pour continuer.'));
                }
            } catch (err: any) {
                console.error(chalk.red('✗ Impossible de générer le lien de paiement. Veuillez réessayer depuis le dashboard web.'));
            }
        }
        
        // Always exit if they weren't Pro, even if they requested an upgrade.
        // They need to pay and rerun the command.
        process.exit(1);

    } catch (err: any) {
        console.error(chalk.red('✗ Erreur de vérification de l\'abonnement.'));
        process.exit(1);
    }
}
