#!/usr/bin/env node
'use strict';

import 'dotenv/config';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';

import chalk from 'chalk';
import ora from 'ora';
import { registerAuthCommands } from './commands/auth';
import { registerProjectCommands } from './commands/project';
import { registerEnvCommands } from './commands/env';
import { registerLogsCommand } from './commands/logs';
import { registerGenerateCommand } from './commands/generate';
import { registerPlanCommands } from './commands/plan';
import { registerTransactionCommands } from './commands/transactions';
import { registerCustomerCommands } from './commands/customers';
import { registerPayoutCommands } from './commands/payouts';
import { registerSimulateCommands } from './commands/simulate';
import { registerListenCommands } from './commands/listen';
import { walletConfig } from './config/config';
import { projectsApi } from './api/client';
import { requireAuth, refreshTokenIfNeeded } from './auth/keycloak';

const program = new Command();

program
    .name('wallet')
    .description(
        chalk.bold('wallet-cli') +
        ' — CLI de la plateforme ash-wallet\n' +
        chalk.dim('  Gérez vos projets, clés API, et paiements FedaPay depuis le terminal.'),
    )
    .version('3.0.0');

// Enregistrement des groupes de commandes
registerAuthCommands(program);
registerProjectCommands(program);
registerEnvCommands(program);
registerLogsCommand(program);
registerGenerateCommand(program);
registerPlanCommands(program);
registerTransactionCommands(program);
registerCustomerCommands(program);
registerPayoutCommands(program);
registerSimulateCommands(program);
registerListenCommands(program);

// Commande init — configure un projet Flutter/React/Vue local
program
    .command('init')
    .description('Initialiser la configuration wallet dans le projet courant (Flutter, Nuxt, NextJS…)')
    .action(async () => {
        const cfg = walletConfig.get();
        const cwd = process.cwd();

        // ── 1. Vérifier qu'un projet est actif ─────────────────────────────
        if (!cfg.activeProject) {
            console.error(chalk.red('✗ Aucun projet actif.'));
            console.error(chalk.dim('  Créez-en un : wallet project create'));
            console.error(chalk.dim('  Ou sélectionnez-en un : wallet project use <slug>'));
            process.exit(1);
        }

        // ── 2. Détecter le framework ───────────────────────────────────────
        type Framework = 'Flutter' | 'Nuxt' | 'NextJS' | 'React' | 'Vue' | 'Unknown';
        let framework: Framework = 'Unknown';
        let frameworkLabel = 'projet inconnu';

        if (fs.existsSync(path.join(cwd, 'pubspec.yaml'))) {
            framework = 'Flutter';
            frameworkLabel = 'Flutter';
        } else if (fs.existsSync(path.join(cwd, 'package.json'))) {
            try {
                const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                if (deps['nuxt']) { framework = 'Nuxt'; frameworkLabel = 'Nuxt'; }
                else if (deps['next']) { framework = 'NextJS'; frameworkLabel = 'NextJS'; }
                else if (deps['react']) { framework = 'React'; frameworkLabel = 'React (Vite)'; }
                else if (deps['vue']) { framework = 'Vue'; frameworkLabel = 'Vue (Vite)'; }
            } catch { /* ignore */ }
        }

        console.log(chalk.bold('\n🚀 Initialisation wallet\n'));
        console.log(`  Projet  : ${chalk.cyan(cfg.activeProject)}`);
        console.log(`  Cloud   : ${chalk.dim(cfg.cloudUrl)}`);
        console.log(`  Env     : ${chalk.dim(cfg.environment)}`);
        console.log(`  Détecté : ${chalk.yellow(frameworkLabel)}\n`);

        // ── 3. Récupérer la publicKey du projet via l'API ──────────────────
        requireAuth();
        await refreshTokenIfNeeded();

        const spinner = ora('Récupération des infos du projet…').start();
        let publicKey = '';
        try {
            const project = await projectsApi.get(cfg.activeProject);
            publicKey = project.publicKey ?? '';
            spinner.succeed(`Projet "${project.name}" — clé : ${chalk.cyan(publicKey)}`);
        } catch {
            spinner.warn('Impossible de récupérer la clé du projet (mode hors-ligne).');
            console.log(chalk.dim('  Remplacez pk_VOTRE_CLE par votre vraie clé dans les fichiers générés.\n'));
            publicKey = 'pk_VOTRE_CLE_ICI';
        }

        // ── 4. Créer wallet.yaml ──────────────────────────────────────────
        const walletYaml = `# wallet.yaml — Configuration ash-wallet pour ce projet
# Généré par wallet-cli le ${new Date().toISOString()}
project: ${cfg.activeProject}
project_key: ${publicKey}
cloud_url: ${cfg.cloudUrl}
environment: ${cfg.environment}
`;
        fs.writeFileSync(path.join(cwd, 'wallet.yaml'), walletYaml, 'utf8');
        console.log(chalk.green('✓ wallet.yaml créé'));

        // ── 5. Ajouter wallet.yaml au .gitignore ──────────────────────────
        const gitignorePath = path.join(cwd, '.gitignore');
        const gitignoreEntry = 'wallet.yaml';
        if (fs.existsSync(gitignorePath)) {
            const content = fs.readFileSync(gitignorePath, 'utf8');
            if (!content.includes(gitignoreEntry)) {
                fs.appendFileSync(gitignorePath, `\n# wallet-cli config (contient votre project key)\n${gitignoreEntry}\n`);
                console.log(chalk.green('✓ wallet.yaml ajouté au .gitignore'));
            } else {
                console.log(chalk.dim('  .gitignore : wallet.yaml déjà présent'));
            }
        } else {
            fs.writeFileSync(gitignorePath, `# wallet-cli config\n${gitignoreEntry}\n`);
            console.log(chalk.green('✓ .gitignore créé avec wallet.yaml'));
        }

        // ── 6. Patch spécifique au framework ─────────────────────────────
        if (framework === 'Flutter') {
            await initFlutter(cwd, publicKey, cfg.cloudUrl, cfg.environment);
        } else if (framework === 'Nuxt') {
            initNuxt(cwd, publicKey, cfg.cloudUrl);
        } else if (framework === 'NextJS') {
            initNextJS(cwd, publicKey, cfg.cloudUrl);
        } else {
            console.log(chalk.yellow('\n⚠ Framework non reconnu. wallet.yaml créé, mais aucun fichier de code modifié.'));
            console.log(chalk.dim('  Frameworks supportés : Flutter, Nuxt, NextJS, React, Vue'));
        }

        console.log(chalk.bold.green('\n✅ Initialisation terminée !'));
    });

// ─── Flutter init ──────────────────────────────────────────────────────────
async function initFlutter(cwd: string, publicKey: string, cloudUrl: string, env: string): Promise<void> {
    console.log(chalk.bold('\n📱 Configuration Flutter\n'));

    // ── flutter pub add feda_flutter (installe ET met à jour pubspec + pub get) ──
    const pubspecPath = path.join(cwd, 'pubspec.yaml');
    if (!fs.existsSync(pubspecPath)) {
        console.log(chalk.yellow('  ⚠ pubspec.yaml introuvable — pas un projet Flutter valide'));
        return;
    }

    const pubspec = fs.readFileSync(pubspecPath, 'utf8');
    if (pubspec.includes('feda_flutter')) {
        console.log(chalk.dim('  feda_flutter déjà présent dans pubspec.yaml'));
    } else {
        // Cherche si le SDK local existe en remontant l'arborescence (workspace mono-repo)
        const localSdkCandidates = [
            path.resolve(cwd, '../../feda_flutter'),
            path.resolve(cwd, '../feda_flutter'),
            path.resolve(cwd, 'packages/feda_flutter'),
        ];
        const localSdkPath = localSdkCandidates.find(
            (p) => fs.existsSync(path.join(p, 'pubspec.yaml')),
        );

        if (localSdkPath) {
            // Dépendance locale (développement) — pointe vers le SDK source
            const relPath = path.relative(cwd, localSdkPath).replace(/\\/g, '/');
            let pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
            pubspecContent = pubspecContent.replace(
                /^(  cupertino_icons:.+)$/m,
                `$1\n  feda_flutter:\n    path: ${relPath}`,
            );
            fs.writeFileSync(pubspecPath, pubspecContent, 'utf8');
            const getSpinner = ora('  flutter pub get…').start();
            try {
                execSync('flutter pub get', { cwd, stdio: 'pipe' });
                getSpinner.succeed(`feda_flutter ajouté (path: ${relPath}) + pub get ✓`);
            } catch (e: any) {
                getSpinner.fail('flutter pub get a échoué');
                console.log(chalk.dim(`  ${e.message ?? e}`));
            }
        } else {
            // Pas de SDK local → pub.dev
            const addSpinner = ora('  flutter pub add feda_flutter…').start();
            try {
                execSync('flutter pub add feda_flutter', { cwd, stdio: 'pipe' });
                addSpinner.succeed('flutter pub add feda_flutter  (pubspec.yaml + pub get ✓)');
            } catch (e: any) {
                addSpinner.fail('flutter pub add a échoué');
                console.log(chalk.dim(`  Ajoutez manuellement : feda_flutter: ^1.0.0`));
            }
        }
    }

    // ── Patch main.dart ──
    const mainDartPath = path.join(cwd, 'lib', 'main.dart');
    if (fs.existsSync(mainDartPath)) {
        let mainDart = fs.readFileSync(mainDartPath, 'utf8');
        let changed = false;

        if (!mainDart.includes('feda_flutter')) {
            mainDart = mainDart.replace(
                `import 'package:flutter/material.dart';`,
                `import 'package:flutter/material.dart';\nimport 'package:feda_flutter/feda_flutter.dart';`,
            );
            changed = true;
        }

        if (!mainDart.includes('applyCloudConfig') && !mainDart.includes('applyConfig')) {
            mainDart = mainDart.replace(
                /void main\(\)\s*\{[\s\n]*runApp\(/,
                `void main() {\n  FedaFlutter.applyCloudConfig(\n    projectKey: '${publicKey}',\n    cloudUrl: '${cloudUrl}',\n    environment: ApiEnvironment.${env},\n  );\n  runApp(`,
            );
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(mainDartPath, mainDart, 'utf8');
            console.log(chalk.green('  ✓ lib/main.dart — FedaFlutter.applyCloudConfig() ajouté'));
        } else {
            console.log(chalk.dim('  lib/main.dart — déjà initialisé'));
        }
    } else {
        console.log(chalk.yellow('  ⚠ lib/main.dart introuvable'));
    }

    // ── Lancer generate widget directement ──
    console.log(chalk.bold('\n🎨 Génération du widget de paiement\n'));
    const cliPath = process.argv[1]; // chemin absolu vers dist/index.js
    const result = spawnSync('node', [cliPath, 'generate', 'widget'], {
        cwd,
        stdio: 'inherit',  // garde le terminal interactif pour Inquirer
        env: process.env,
    });
    if (result.status !== 0) {
        console.log(chalk.yellow('\n  ⚠ Génération du widget annulée ou échouée.'));
        console.log(chalk.dim('  Relancez manuellement : wallet generate widget'));
    }
}

// ─── Nuxt init ────────────────────────────────────────────────────────────
function initNuxt(cwd: string, publicKey: string, cloudUrl: string): void {
    console.log(chalk.bold('\n🟢 Configuration Nuxt\n'));

    const envPath = path.join(cwd, '.env');
    const envLines = [
        `NUXT_PUBLIC_FEDA_PROJECT_KEY=${publicKey}`,
        `NUXT_PUBLIC_FEDA_CLOUD_URL=${cloudUrl}`,
    ];

    if (fs.existsSync(envPath)) {
        let env = fs.readFileSync(envPath, 'utf8');
        let changed = false;
        for (const line of envLines) {
            const key = line.split('=')[0];
            if (!env.includes(key)) {
                env += `\n${line}`;
                changed = true;
            }
        }
        if (changed) {
            fs.writeFileSync(envPath, env.trimStart(), 'utf8');
            console.log(chalk.green('  ✓ .env — variables NUXT_PUBLIC_FEDA_* ajoutées'));
        } else {
            console.log(chalk.dim('  .env — variables déjà présentes'));
        }
    } else {
        fs.writeFileSync(envPath, envLines.join('\n') + '\n', 'utf8');
        console.log(chalk.green('  ✓ .env créé avec les variables NUXT_PUBLIC_FEDA_*'));
    }

    console.log(chalk.bold('\n  Prochaines étapes :'));
    console.log(`    ${chalk.cyan('wallet generate widget')}`);
    console.log(`    ${chalk.cyan('wallet generate guard')}`);
}

// ─── NextJS init ──────────────────────────────────────────────────────────
function initNextJS(cwd: string, publicKey: string, cloudUrl: string): void {
    console.log(chalk.bold('\n⚛️  Configuration NextJS\n'));

    const envPath = path.join(cwd, '.env.local');
    const envLines = [
        `NEXT_PUBLIC_FEDA_PROJECT_KEY=${publicKey}`,
        `NEXT_PUBLIC_FEDA_CLOUD_URL=${cloudUrl}`,
    ];

    if (fs.existsSync(envPath)) {
        let env = fs.readFileSync(envPath, 'utf8');
        let changed = false;
        for (const line of envLines) {
            const key = line.split('=')[0];
            if (!env.includes(key)) {
                env += `\n${line}`;
                changed = true;
            }
        }
        if (changed) {
            fs.writeFileSync(envPath, env.trimStart(), 'utf8');
            console.log(chalk.green('  ✓ .env.local — variables NEXT_PUBLIC_FEDA_* ajoutées'));
        } else {
            console.log(chalk.dim('  .env.local — variables déjà présentes'));
        }
    } else {
        fs.writeFileSync(envPath, envLines.join('\n') + '\n', 'utf8');
        console.log(chalk.green('  ✓ .env.local créé avec les variables NEXT_PUBLIC_FEDA_*'));
    }

    console.log(chalk.bold('\n  Prochaines étapes :'));
    console.log(`    ${chalk.cyan('wallet generate widget')}`);
    console.log(`    ${chalk.cyan('wallet generate guard')}`);
}

// Commande config — afficher la configuration courante
program
    .command('config')
    .description('Afficher la configuration courante de la CLI')
    .action(() => {
        const cfg = walletConfig.get();
        const tokens = walletConfig.getTokens();
        console.log(chalk.bold('\nConfiguration wallet-cli'));
        console.log(`  Cloud URL     : ${cfg.cloudUrl}`);
        console.log(`  Environnement : ${cfg.environment === 'live' ? chalk.red('LIVE') : chalk.cyan('sandbox')}`);
        console.log(`  Projet actuel : ${cfg.activeProject ?? chalk.dim('(aucun)')}`);
        console.log(`  Authentifié   : ${tokens.accessToken && tokens.expiresAt > Date.now() ? chalk.green('oui') : chalk.red('non')}`);
        console.log(`  Config file   : ${chalk.dim(walletConfig.getConfigPath())}`);
    });

program.parse(process.argv);

// Si aucune commande fournie, afficher l'aide
if (process.argv.length <= 2) {
    program.help();
}
