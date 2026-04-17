import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { requireAuth, refreshTokenIfNeeded } from '../auth/keycloak';
import { requireProSubscription } from '../auth/subscription';
import { walletConfig } from '../config/config';
import { projectsApi } from '../api/client';

export function registerProjectCommands(program: Command): void {
    const proj = program.command('project').description('Gestion des projets ash-wallet');

    proj
        .command('list')
        .alias('ls')
        .description('Lister mes projets')
        .action(async () => {
            requireAuth();
            await refreshTokenIfNeeded();
            await requireProSubscription();
            const spinner = ora('Chargement des projets...').start();
            try {
                const projects = await projectsApi.list();
                spinner.stop();
                if (!projects.length) {
                    console.log(chalk.yellow('Aucun projet. Créez-en un avec : wallet project create'));
                    return;
                }
                const active = walletConfig.get().activeProject;
                for (const p of projects) {
                    const isActive = p.slug === active ? chalk.green(' ← actif') : '';
                    const rate = p.commissionRate ? ` (${p.commissionRate}%)` : '';
                    console.log(`  ${chalk.bold(p.name)} ${chalk.dim(`(${p.slug})`)}${isActive}`);
                    console.log(`    Facturation clients : ${p.billingMode}${rate} | Clé : ${chalk.dim(p.publicKey)}`);
                }
            } catch {
                spinner.fail('Erreur lors du chargement des projets');
            }
        });

    proj
        .command('use <slug>')
        .description('Sélectionner le projet actif')
        .action((slug: string) => {
            walletConfig.set({ activeProject: slug });
            console.log(chalk.green(`✓ Projet actif : ${slug}`));
        });

    proj
        .command('create')
        .description('Créer un nouveau projet')
        .action(async () => {
            requireAuth();
            await refreshTokenIfNeeded();
            await requireProSubscription();
            const answers = await inquirer.prompt([
                { type: 'input', name: 'name', message: 'Nom du projet :', validate: (v: string) => v.length > 0 },
                {
                    type: 'input',
                    name: 'slug',
                    message: 'Slug (URL-safe, ex: mon-app) :',
                    validate: (v: string) => /^[a-z0-9-]+$/.test(v) || 'Lettres minuscules, chiffres et tirets uniquement',
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
                    when: (ans: any) => ans.billingMode === 'commission',
                    default: 2.0,
                    validate: (v: string) => !isNaN(parseFloat(v)) || 'Entrez un nombre (ex: 1.5)',
                },
                {
                    type: 'input',
                    name: 'sandboxApiKey',
                    message: 'Clé API FedaPay Sandbox (laissez vide pour configurer plus tard) :',
                },
            ]);

            const spinner = ora('Création du projet...').start();
            try {
                const project = await projectsApi.create({
                    name: answers.name,
                    slug: answers.slug,
                    billingMode: answers.billingMode,
                    commissionRate: answers.commissionRate ? parseFloat(answers.commissionRate) : undefined,
                    sandboxApiKey: answers.sandboxApiKey || undefined,
                });
                spinner.succeed(`Projet créé !`);
                console.log(chalk.bold(`\n  Nom        : ${project.name}`));
                console.log(`  Slug       : ${project.slug}`);
                console.log(`  Clé publique (x-feda-project-key) : ${chalk.cyan(project.publicKey)}`);
                console.log(chalk.dim('\n  ── Intégration depuis votre backend ────────────────────────────'));
                console.log(`  Ajoutez ce header à toutes vos requêtes vers ash-bwallet :`);
                console.log(chalk.cyan(`    x-feda-project-key: ${project.publicKey}`));
                console.log(chalk.cyan(`    x-feda-env: sandbox`));
                console.log(chalk.dim(`\n  Documentation API : README.md → section "API — Référence pour les intégrateurs"`));
                console.log(chalk.dim(`  (Swagger sur ${walletConfig.get().cloudUrl}/api — dev uniquement, désactivé en prod)`));
                console.log(chalk.dim('  ────────────────────────────────────────────────────'));
                console.log(chalk.dim('\n  Pour configurer votre projet Flutter/Web, lancez depuis votre app :'));
                console.log(chalk.cyan('    wallet init'));
                walletConfig.set({ activeProject: project.slug });
            } catch {
                spinner.fail('Erreur lors de la création');
            }
        });

    proj
        .command('usage [slug]')
        .description('Afficher l\'usage (quotas) du mois courant')
        .action(async (slug?: string) => {
            requireAuth();
            await refreshTokenIfNeeded();
            await requireProSubscription();
            const target = slug ?? walletConfig.get().activeProject;
            if (!target) {
                console.error(chalk.red('✗ Précisez un slug ou sélectionnez un projet actif avec : wallet project use <slug>'));
                return;
            }
            const spinner = ora(`Chargement de l'usage pour ${target}...`).start();
            try {
                const usage = await projectsApi.usage(target);
                spinner.stop();
                console.log(chalk.bold(`\n  Usage — ${target} (${usage?.month ?? 'mois courant'})`));
                console.log(`  Sandbox : ${usage?.sandboxCallsCount ?? 0} / 500 appels`);
                console.log(`  Live    : ${usage?.liveTransactionsCount ?? 0} transactions`);
            } catch {
                spinner.fail('Erreur lors du chargement de l\'usage');
            }
        });
}
