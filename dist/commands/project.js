"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProjectCommands = registerProjectCommands;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const inquirer_1 = __importDefault(require("inquirer"));
const keycloak_1 = require("../auth/keycloak");
const subscription_1 = require("../auth/subscription");
const config_1 = require("../config/config");
const client_1 = require("../api/client");
function registerProjectCommands(program) {
    const proj = program.command('project').description('Gestion des projets ash-wallet');
    proj
        .command('list')
        .alias('ls')
        .description('Lister mes projets')
        .action(async () => {
        (0, keycloak_1.requireAuth)();
        await (0, keycloak_1.refreshTokenIfNeeded)();
        await (0, subscription_1.requireProSubscription)();
        const spinner = (0, ora_1.default)('Chargement des projets...').start();
        try {
            const projects = await client_1.projectsApi.list();
            spinner.stop();
            if (!projects.length) {
                console.log(chalk_1.default.yellow('Aucun projet. Créez-en un avec : wallet project create'));
                return;
            }
            const active = config_1.walletConfig.get().activeProject;
            for (const p of projects) {
                const isActive = p.slug === active ? chalk_1.default.green(' ← actif') : '';
                const rate = p.commissionRate ? ` (${p.commissionRate}%)` : '';
                console.log(`  ${chalk_1.default.bold(p.name)} ${chalk_1.default.dim(`(${p.slug})`)}${isActive}`);
                console.log(`    Facturation clients : ${p.billingMode}${rate} | Clé : ${chalk_1.default.dim(p.publicKey)}`);
            }
        }
        catch {
            spinner.fail('Erreur lors du chargement des projets');
        }
    });
    proj
        .command('use <slug>')
        .description('Sélectionner le projet actif')
        .action((slug) => {
        config_1.walletConfig.set({ activeProject: slug });
        console.log(chalk_1.default.green(`✓ Projet actif : ${slug}`));
    });
    proj
        .command('create')
        .description('Créer un nouveau projet')
        .action(async () => {
        (0, keycloak_1.requireAuth)();
        await (0, keycloak_1.refreshTokenIfNeeded)();
        await (0, subscription_1.requireProSubscription)();
        const answers = await inquirer_1.default.prompt([
            { type: 'input', name: 'name', message: 'Nom du projet :', validate: (v) => v.length > 0 },
            {
                type: 'input',
                name: 'slug',
                message: 'Slug (URL-safe, ex: mon-app) :',
                validate: (v) => /^[a-z0-9-]+$/.test(v) || 'Lettres minuscules, chiffres et tirets uniquement',
            },
            {
                type: 'list',
                name: 'billingMode',
                message: 'Comment voulez-vous facturer vos clients finaux ?',
                choices: [
                    { name: 'Aucun (standard, pas de facturation récurrente)', value: 'none' },
                    { name: 'Abonnement mensuel/annuel (BillingPlan)', value: 'subscription' },
                    { name: 'Commission sur chaque transaction', value: 'commission' },
                ],
                default: 'none',
            },
            {
                type: 'input',
                name: 'commissionRate',
                message: 'Taux de commission (%) :',
                when: (ans) => ans.billingMode === 'commission',
                default: 2.0,
                validate: (v) => !isNaN(parseFloat(v)) || 'Entrez un nombre (ex: 1.5)',
            },
            {
                type: 'input',
                name: 'sandboxApiKey',
                message: 'Clé API FedaPay Sandbox (laissez vide pour configurer plus tard) :',
            },
        ]);
        const spinner = (0, ora_1.default)('Création du projet...').start();
        try {
            const project = await client_1.projectsApi.create({
                name: answers.name,
                slug: answers.slug,
                billingMode: answers.billingMode,
                commissionRate: answers.commissionRate ? parseFloat(answers.commissionRate) : undefined,
                sandboxApiKey: answers.sandboxApiKey || undefined,
            });
            spinner.succeed(`Projet créé !`);
            console.log(chalk_1.default.bold(`\n  Nom        : ${project.name}`));
            console.log(`  Slug       : ${project.slug}`);
            console.log(`  Clé publique (x-feda-project-key) : ${chalk_1.default.cyan(project.publicKey)}`);
            console.log(chalk_1.default.dim('\n  ── Intégration depuis votre backend ────────────────────────────'));
            console.log(`  Ajoutez ce header à toutes vos requêtes vers ash-bwallet :`);
            console.log(chalk_1.default.cyan(`    x-feda-project-key: ${project.publicKey}`));
            console.log(chalk_1.default.cyan(`    x-feda-env: sandbox`));
            console.log(chalk_1.default.dim(`\n  Documentation API : README.md → section "API — Référence pour les intégrateurs"`));
            console.log(chalk_1.default.dim(`  (Swagger sur ${config_1.walletConfig.get().cloudUrl}/api — dev uniquement, désactivé en prod)`));
            console.log(chalk_1.default.dim('  ────────────────────────────────────────────────────'));
            console.log(chalk_1.default.dim('\n  Pour configurer votre projet Flutter/Web, lancez depuis votre app :'));
            console.log(chalk_1.default.cyan('    wallet init'));
            config_1.walletConfig.set({ activeProject: project.slug });
        }
        catch {
            spinner.fail('Erreur lors de la création');
        }
    });
    proj
        .command('usage [slug]')
        .description('Afficher l\'usage (quotas) du mois courant')
        .action(async (slug) => {
        (0, keycloak_1.requireAuth)();
        await (0, keycloak_1.refreshTokenIfNeeded)();
        await (0, subscription_1.requireProSubscription)();
        const target = slug ?? config_1.walletConfig.get().activeProject;
        if (!target) {
            console.error(chalk_1.default.red('✗ Précisez un slug ou sélectionnez un projet actif avec : wallet project use <slug>'));
            return;
        }
        const spinner = (0, ora_1.default)(`Chargement de l'usage pour ${target}...`).start();
        try {
            const usage = await client_1.projectsApi.usage(target);
            spinner.stop();
            console.log(chalk_1.default.bold(`\n  Usage — ${target} (${usage?.month ?? 'mois courant'})`));
            console.log(`  Sandbox : ${usage?.sandboxCallsCount ?? 0} / 500 appels`);
            console.log(`  Live    : ${usage?.liveTransactionsCount ?? 0} transactions`);
        }
        catch {
            spinner.fail('Erreur lors du chargement de l\'usage');
        }
    });
}
