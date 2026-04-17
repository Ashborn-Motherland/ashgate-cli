"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSimulateCommands = registerSimulateCommands;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config/config");
const client_1 = require("../api/client");
function registerSimulateCommands(program) {
    const simulateCmd = program.command('simulate').description('Simuler des événements FedaPay (Webhooks)');
    simulateCmd
        .command('payment')
        .description('Simule un webhook de paiement FedaPay (Succès/Échec) vers une URL locale')
        .option('-u, --url <url>', 'URL locale du webhook', 'http://localhost:3005/fedapay/webhook')
        .option('-s, --secret <secret>', 'Secret du webhook (FEDAPAY_WEBHOOK_SECRET)', '')
        .action(async (options) => {
        console.log(chalk_1.default.blue('Simulateur de Webhook FedaPay 🚀'));
        const cfg = config_1.walletConfig.get();
        const activeProject = cfg.activeProject;
        // 1. Quel type d'événement ?
        const eventSelection = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'eventName',
                message: 'Quel événement souhaitez-vous simuler ?',
                choices: [
                    { name: 'Paiement Approuvé (transaction.approved)', value: 'transaction.approved' },
                    { name: 'Paiement Annulé (transaction.canceled)', value: 'transaction.canceled' },
                ]
            }
        ]);
        // 2. Récupérer les projets
        let projects = [];
        try {
            projects = await client_1.projectsApi.list();
        }
        catch (e) {
            console.error(chalk_1.default.yellow('⚠ Impossible de récupérer les projets depuis le serveur. Êtes-vous connecté ?'));
            // On peut continuer sans projet strict
        }
        let projectId = activeProject || '';
        if (projects.length > 0) {
            const projectSelection = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'projectId',
                    message: 'Sélectionnez le projet concerné :',
                    choices: [
                        ...projects.map(p => ({ name: `${p.name} (${p.slug})`, value: p._id || p.id })),
                        { name: 'Saisir un ID manuellement', value: 'manual' }
                    ]
                }
            ]);
            if (projectSelection.projectId === 'manual') {
                const manualProject = await inquirer_1.default.prompt([
                    {
                        type: 'input',
                        name: 'projectId',
                        message: 'Entrez l\'ID du projet :'
                    }
                ]);
                projectId = manualProject.projectId;
            }
            else {
                projectId = projectSelection.projectId;
            }
        }
        else {
            const manualProject = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'projectId',
                    message: 'ID du projet concerné :',
                    default: activeProject || '',
                    validate: (input) => input.trim().length > 0 || 'Veuillez entrer un ID de projet',
                }
            ]);
            projectId = manualProject.projectId;
        }
        // 3. Récupérer les plans tarifaires (si applicables)
        let plans = [];
        if (projectId) {
            try {
                plans = await client_1.billingPlansApi.list(projectId);
            }
            catch (e) {
                // Ignore, maybe it's not a SaaS project
            }
        }
        let planId = '';
        let defaultAmount = '5000';
        if (plans.length > 0) {
            const planSelection = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'planId',
                    message: 'Sélectionnez le plan tarifaire (Optionnel, pour simulation d\'abonnement SaaS) :',
                    choices: [
                        { name: 'Aucun (Paiement direct)', value: '' },
                        ...plans.map(p => ({ name: `${p.name} - ${p.amount} ${p.currency} / ${p.interval}`, value: p._id || p.id }))
                    ]
                }
            ]);
            planId = planSelection.planId;
            const selectedPlan = plans.find(p => (p._id || p.id) === planId);
            if (selectedPlan) {
                defaultAmount = selectedPlan.amount.toString();
            }
        }
        else {
            const manualPlan = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'planId',
                    message: 'ID du plan tarifaire (Optionnel, pour la simulation d\'abonnement) :',
                    default: '',
                }
            ]);
            planId = manualPlan.planId;
        }
        // 4. Suite des champs optionnels et montant
        const remainingAnswers = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'subscriptionId',
                message: 'ID de l\'abonnement (Optionnel) :',
                default: '',
            },
            {
                type: 'input',
                name: 'amount',
                message: 'Montant de la transaction (XOF):',
                default: defaultAmount,
                validate: (input) => !isNaN(parseInt(input)) || 'Veuillez entrer un nombre valide'
            },
            {
                type: 'input',
                name: 'txId',
                message: 'ID de la transaction FedaPay (Optionnel):',
                default: Math.floor(Math.random() * 100000).toString()
            }
        ]);
        const answers = {
            eventName: eventSelection.eventName,
            projectId,
            planId,
            subscriptionId: remainingAnswers.subscriptionId,
            amount: remainingAnswers.amount,
            txId: remainingAnswers.txId
        };
        const customMetadata = {
            ash_project_id: answers.projectId,
        };
        if (answers.planId)
            customMetadata.ash_plan_id = answers.planId;
        if (answers.subscriptionId)
            customMetadata.ash_subscription_id = answers.subscriptionId;
        // If plan ID is provided, tag this as a subscription payment
        if (answers.planId)
            customMetadata.ash_subscription_type = 'saas';
        const payload = {
            name: answers.eventName,
            entity: {
                id: parseInt(answers.txId),
                amount: parseInt(answers.amount),
                status: answers.eventName === 'transaction.approved' ? 'approved' : 'canceled',
                currency_id: 1,
                mode: cfg.environment ?? 'sandbox',
                reference: `sim_${Date.now()}`,
                description: `Simulation ${answers.eventName}`,
                custom_metadata: customMetadata,
                customer: {
                    id: 1,
                    firstname: 'John',
                    lastname: 'Doe',
                    email: 'john.doe@example.com'
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                approved_at: answers.eventName === 'transaction.approved' ? new Date().toISOString() : null
            }
        };
        const payloadString = JSON.stringify(payload);
        let signature = '';
        if (options.secret) {
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const hmac = crypto_1.default.createHmac('sha256', options.secret).update(`${timestamp}.${payloadString}`).digest('hex');
            signature = `t=${timestamp},v1=${hmac}`;
        }
        console.log(chalk_1.default.dim(`\nEnvoi de l'événement vers ${options.url}...`));
        if (answers.planId) {
            console.log(chalk_1.default.dim(`  → Projet  : ${answers.projectId}`));
            console.log(chalk_1.default.dim(`  → Plan    : ${answers.planId}`));
        }
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (signature)
                headers['x-fedapay-signature'] = signature;
            const response = await axios_1.default.post(options.url, payloadString, { headers });
            console.log(chalk_1.default.green(`\n✓ Webhook envoyé avec succès ! Status: ${response.status}`));
        }
        catch (error) {
            console.error(chalk_1.default.red(`✗ Échec de l'envoi du webhook vers ${options.url}`));
            if (error.response) {
                console.error(chalk_1.default.red(`  Status: ${error.response.status}`));
                console.error(chalk_1.default.dim(`  Response: ${JSON.stringify(error.response.data)}`));
            }
            else {
                console.error(chalk_1.default.red(`  Erreur: ${error.message}`));
            }
        }
    });
}
