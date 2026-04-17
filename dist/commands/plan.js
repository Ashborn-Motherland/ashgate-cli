"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlanCommands = registerPlanCommands;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const inquirer_1 = __importDefault(require("inquirer"));
const keycloak_1 = require("../auth/keycloak");
const subscription_1 = require("../auth/subscription");
const config_1 = require("../config/config");
const client_1 = require("../api/client");
function registerPlanCommands(program) {
    const plan = program.command('plan').description('Gestion des plans tarifaires de vos projets');
    plan
        .command('list [slug]')
        .alias('ls')
        .description('Lister les plans d\'un projet')
        .action(async (slug) => {
        (0, keycloak_1.requireAuth)();
        await (0, keycloak_1.refreshTokenIfNeeded)();
        await (0, subscription_1.requireProSubscription)();
        const target = slug ?? config_1.walletConfig.get().activeProject;
        if (!target) {
            console.error(chalk_1.default.red('✗ Précisez un slug ou sélectionnez un projet actif avec : wallet project use <slug>'));
            return;
        }
        const spinner = (0, ora_1.default)(`Chargement des plans pour ${target}...`).start();
        try {
            const project = await client_1.projectsApi.get(target);
            const projectId = project.id ?? project._id;
            const plans = await client_1.billingPlansApi.list(projectId);
            spinner.stop();
            if (!plans.length) {
                console.log(chalk_1.default.yellow(`Aucun plan pour le projet ${target}.`));
                console.log(chalk_1.default.dim(`Utilisez 'wallet plan seed' pour ajouter les templates par défaut.`));
                return;
            }
            console.log(chalk_1.default.bold(`\n  Plans pour ${target} :`));
            for (const p of plans) {
                console.log(`  - ${chalk_1.default.bold(p.name)} (${p.amount} ${p.currency} / ${p.interval})`);
                if (p.description)
                    console.log(`    ${chalk_1.default.dim(p.description)}`);
                console.log(`    ID: ${chalk_1.default.dim(p._id)}`);
            }
        }
        catch (err) {
            spinner.fail('Erreur lors du chargement des plans');
        }
    });
    plan
        .command('seed [slug]')
        .description('Générer les plans par défaut (Basic, Pro, Business)')
        .action(async (slug) => {
        (0, keycloak_1.requireAuth)();
        await (0, keycloak_1.refreshTokenIfNeeded)();
        await (0, subscription_1.requireProSubscription)();
        const target = slug ?? config_1.walletConfig.get().activeProject;
        if (!target) {
            console.error(chalk_1.default.red('✗ Précisez un slug ou sélectionnez un projet actif avec : wallet project use <slug>'));
            return;
        }
        const spinner = (0, ora_1.default)(`Génération des templates pour ${target}...`).start();
        try {
            const project = await client_1.projectsApi.get(target);
            const projectId = project.id ?? project._id;
            await client_1.billingPlansApi.seed(projectId);
            spinner.succeed(`Templates générés pour ${target} !`);
        }
        catch {
            spinner.fail('Erreur lors de la génération');
        }
    });
    plan
        .command('create [slug]')
        .description('Créer un nouveau plan personnalisé')
        .action(async (slug) => {
        (0, keycloak_1.requireAuth)();
        await (0, keycloak_1.refreshTokenIfNeeded)();
        await (0, subscription_1.requireProSubscription)();
        const target = slug ?? config_1.walletConfig.get().activeProject;
        if (!target) {
            console.error(chalk_1.default.red('✗ Précisez un slug ou sélectionnez un projet actif avec : wallet project use <slug>'));
            return;
        }
        const answers = await inquirer_1.default.prompt([
            { type: 'input', name: 'name', message: 'Nom du plan (ex: Premium) :', validate: (v) => !!v },
            { type: 'input', name: 'description', message: 'Description :' },
            { type: 'number', name: 'amount', message: 'Montant :', default: 1000 },
            { type: 'input', name: 'currency', message: 'Devise :', default: 'XOF' },
            { type: 'list', name: 'interval', message: 'Intervalle :', choices: ['month', 'year'], default: 'month' },
            { type: 'number', name: 'trialDays', message: 'Jours d\'essai :', default: 0 },
            { type: 'number', name: 'gracePeriod', message: 'Période de grâce (jours) :', default: 3 },
        ]);
        const spinner = (0, ora_1.default)('Création du plan...').start();
        try {
            const project = await client_1.projectsApi.get(target);
            const projectId = project.id ?? project._id;
            const newPlan = await client_1.billingPlansApi.create(projectId, answers);
            spinner.succeed(`Plan "${newPlan.name}" créé avec succès !`);
        }
        catch {
            spinner.fail('Erreur lors de la création');
        }
    });
    plan
        .command('subscriptions [slug]')
        .alias('subs')
        .description('Lister les abonnés actifs du projet')
        .action(async (slug) => {
        (0, keycloak_1.requireAuth)();
        await (0, keycloak_1.refreshTokenIfNeeded)();
        await (0, subscription_1.requireProSubscription)();
        const target = slug ?? config_1.walletConfig.get().activeProject;
        if (!target) {
            console.error(chalk_1.default.red('✗ Précisez un slug ou sélectionnez un projet actif avec : wallet project use <slug>'));
            return;
        }
        const spinner = (0, ora_1.default)(`Chargement des abonnés pour ${target}...`).start();
        try {
            const project = await client_1.projectsApi.get(target);
            const projectId = project.id ?? project._id;
            const subs = await client_1.subscriptionsApi.list(projectId);
            spinner.stop();
            if (!subs.length) {
                console.log(chalk_1.default.yellow(`Aucun abonné pour le projet ${target}.`));
                return;
            }
            console.log(chalk_1.default.bold(`\n  Abonnés pour ${target} :`));
            for (const s of subs) {
                const statusColor = s.status === 'active' ? chalk_1.default.green : chalk_1.default.yellow;
                console.log(`  - ${chalk_1.default.cyan(s.customerEmail || s.customerId)}`);
                console.log(`    Statut : ${statusColor(s.status)} | Plan : ${s.planName || s.planId}`);
                console.log(`    Fin : ${new Date(s.currentPeriodEnd).toLocaleDateString()}`);
            }
        }
        catch {
            spinner.fail('Erreur lors du chargement des abonnés');
        }
    });
}
