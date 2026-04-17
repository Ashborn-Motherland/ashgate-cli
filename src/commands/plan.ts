import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { requireAuth, refreshTokenIfNeeded } from '../auth/keycloak';
import { requireProSubscription } from '../auth/subscription';
import { walletConfig } from '../config/config';
import { projectsApi, billingPlansApi, subscriptionsApi } from '../api/client';

export function registerPlanCommands(program: Command): void {
    const plan = program.command('plan').description('Gestion des plans tarifaires de vos projets');

    plan
        .command('list [slug]')
        .alias('ls')
        .description('Lister les plans d\'un projet')
        .action(async (slug?: string) => {
            requireAuth();
            await refreshTokenIfNeeded();
            await requireProSubscription();
            
            const target = slug ?? walletConfig.get().activeProject;
            if (!target) {
                console.error(chalk.red('✗ Précisez un slug ou sélectionnez un projet actif avec : wallet project use <slug>'));
                return;
            }

            const spinner = ora(`Chargement des plans pour ${target}...`).start();
            try {
                const project = await projectsApi.get(target);
                const projectId = project.id ?? project._id;
                const plans = await billingPlansApi.list(projectId);
                spinner.stop();

                if (!plans.length) {
                    console.log(chalk.yellow(`Aucun plan pour le projet ${target}.`));
                    console.log(chalk.dim(`Utilisez 'wallet plan seed' pour ajouter les templates par défaut.`));
                    return;
                }

                console.log(chalk.bold(`\n  Plans pour ${target} :`));
                for (const p of plans) {
                    console.log(`  - ${chalk.bold(p.name)} (${p.amount} ${p.currency} / ${p.interval})`);
                    if (p.description) console.log(`    ${chalk.dim(p.description)}`);
                    console.log(`    ID: ${chalk.dim(p._id)}`);
                }
            } catch (err: any) {
                spinner.fail('Erreur lors du chargement des plans');
            }
        });

    plan
        .command('seed [slug]')
        .description('Générer les plans par défaut (Basic, Pro, Business)')
        .action(async (slug?: string) => {
            requireAuth();
            await refreshTokenIfNeeded();
            await requireProSubscription();

            const target = slug ?? walletConfig.get().activeProject;
            if (!target) {
                console.error(chalk.red('✗ Précisez un slug ou sélectionnez un projet actif avec : wallet project use <slug>'));
                return;
            }

            const spinner = ora(`Génération des templates pour ${target}...`).start();
            try {
                const project = await projectsApi.get(target);
                const projectId = project.id ?? project._id;
                await billingPlansApi.seed(projectId);
                spinner.succeed(`Templates générés pour ${target} !`);
            } catch {
                spinner.fail('Erreur lors de la génération');
            }
        });

    plan
        .command('create [slug]')
        .description('Créer un nouveau plan personnalisé')
        .action(async (slug?: string) => {
            requireAuth();
            await refreshTokenIfNeeded();
            await requireProSubscription();

            const target = slug ?? walletConfig.get().activeProject;
            if (!target) {
                console.error(chalk.red('✗ Précisez un slug ou sélectionnez un projet actif avec : wallet project use <slug>'));
                return;
            }

            const answers = await inquirer.prompt([
                { type: 'input', name: 'name', message: 'Nom du plan (ex: Premium) :', validate: (v) => !!v },
                { type: 'input', name: 'description', message: 'Description :' },
                { type: 'number', name: 'amount', message: 'Montant :', default: 1000 },
                { type: 'input', name: 'currency', message: 'Devise :', default: 'XOF' },
                { type: 'list', name: 'interval', message: 'Intervalle :', choices: ['month', 'year'], default: 'month' },
                { type: 'number', name: 'trialDays', message: 'Jours d\'essai :', default: 0 },
                { type: 'number', name: 'gracePeriod', message: 'Période de grâce (jours) :', default: 3 },
            ]);

            const spinner = ora('Création du plan...').start();
            try {
                const project = await projectsApi.get(target);
                const projectId = project.id ?? project._id;
                const newPlan = await billingPlansApi.create(projectId, answers);
                spinner.succeed(`Plan "${newPlan.name}" créé avec succès !`);
            } catch {
                spinner.fail('Erreur lors de la création');
            }
        });

    plan
        .command('subscriptions [slug]')
        .alias('subs')
        .description('Lister les abonnés actifs du projet')
        .action(async (slug?: string) => {
            requireAuth();
            await refreshTokenIfNeeded();
            await requireProSubscription();

            const target = slug ?? walletConfig.get().activeProject;
            if (!target) {
                console.error(chalk.red('✗ Précisez un slug ou sélectionnez un projet actif avec : wallet project use <slug>'));
                return;
            }

            const spinner = ora(`Chargement des abonnés pour ${target}...`).start();
            try {
                const project = await projectsApi.get(target);
                const projectId = project.id ?? project._id;
                const subs = await subscriptionsApi.list(projectId);
                spinner.stop();

                if (!subs.length) {
                    console.log(chalk.yellow(`Aucun abonné pour le projet ${target}.`));
                    return;
                }

                console.log(chalk.bold(`\n  Abonnés pour ${target} :`));
                for (const s of subs) {
                    const statusColor = s.status === 'active' ? chalk.green : chalk.yellow;
                    console.log(`  - ${chalk.cyan(s.customerEmail || s.customerId)}`);
                    console.log(`    Statut : ${statusColor(s.status)} | Plan : ${s.planName || s.planId}`);
                    console.log(`    Fin : ${new Date(s.currentPeriodEnd).toLocaleDateString()}`);
                }
            } catch {
                spinner.fail('Erreur lors du chargement des abonnés');
            }
        });
}
