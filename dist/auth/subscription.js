"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProSubscription = requireProSubscription;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const open_1 = __importDefault(require("open"));
const client_1 = require("../api/client");
async function requireProSubscription() {
    try {
        const subscription = await client_1.saasApi.getSubscription();
        if (subscription.plan === 'pro') {
            return;
        }
        console.log('\n');
        console.log(chalk_1.default.red('✗ Erreur: La CLI est réservée aux utilisateurs Pro.'));
        console.log(chalk_1.default.gray(`  Votre statut actuel est : ${subscription.plan}`));
        console.log('\n');
        const answers = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'upgrade',
                message: chalk_1.default.yellow('Voulez-vous passer en Pro maintenant (12 000 FCFA/mois) pour débloquer la CLI ?'),
                default: false,
            },
        ]);
        if (answers.upgrade) {
            console.log(chalk_1.default.cyan('Génération du lien de paiement...'));
            try {
                const upgradeResult = await client_1.saasApi.upgrade();
                if (upgradeResult.paymentUrl) {
                    console.log('\n');
                    console.log(chalk_1.default.green('✓ Lien généré avec succès !'));
                    console.log(chalk_1.default.white('Le lien vient de s\'ouvrir dans votre navigateur pour régler votre abonnement :'));
                    console.log(chalk_1.default.bold.underline.blue(upgradeResult.paymentUrl));
                    // Open the browser immediately
                    await (0, open_1.default)(upgradeResult.paymentUrl);
                    console.log('\n');
                    console.log(chalk_1.default.dim('Une fois le paiement effectué, relancez votre commande CLI.'));
                }
                else if (upgradeResult.success) {
                    console.log('\n');
                    console.log(chalk_1.default.green('✓ Abonnement Pro activé sur l\'environnement de test !'));
                    console.log(chalk_1.default.dim('Relancez votre commande CLI pour continuer.'));
                }
            }
            catch (err) {
                console.error(chalk_1.default.red('✗ Impossible de générer le lien de paiement. Veuillez réessayer depuis le dashboard web.'));
            }
        }
        // Always exit if they weren't Pro, even if they requested an upgrade.
        // They need to pay and rerun the command.
        process.exit(1);
    }
    catch (err) {
        console.error(chalk_1.default.red('✗ Erreur de vérification de l\'abonnement.'));
        process.exit(1);
    }
}
