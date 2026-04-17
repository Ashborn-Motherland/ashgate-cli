#!/usr/bin/env node
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const auth_1 = require("./commands/auth");
const project_1 = require("./commands/project");
const env_1 = require("./commands/env");
const logs_1 = require("./commands/logs");
const generate_1 = require("./commands/generate");
const plan_1 = require("./commands/plan");
const transactions_1 = require("./commands/transactions");
const customers_1 = require("./commands/customers");
const payouts_1 = require("./commands/payouts");
const simulate_1 = require("./commands/simulate");
const listen_1 = require("./commands/listen");
const config_1 = require("./config/config");
const client_1 = require("./api/client");
const keycloak_1 = require("./auth/keycloak");
const program = new commander_1.Command();
program
    .name('wallet')
    .description(chalk_1.default.bold('wallet-cli') +
    ' — CLI de la plateforme ash-wallet\n' +
    chalk_1.default.dim('  Gérez vos projets, clés API, et paiements FedaPay depuis le terminal.'))
    .version('2.0.0');
// Enregistrement des groupes de commandes
(0, auth_1.registerAuthCommands)(program);
(0, project_1.registerProjectCommands)(program);
(0, env_1.registerEnvCommands)(program);
(0, logs_1.registerLogsCommand)(program);
(0, generate_1.registerGenerateCommand)(program);
(0, plan_1.registerPlanCommands)(program);
(0, transactions_1.registerTransactionCommands)(program);
(0, customers_1.registerCustomerCommands)(program);
(0, payouts_1.registerPayoutCommands)(program);
(0, simulate_1.registerSimulateCommands)(program);
(0, listen_1.registerListenCommands)(program);
// Commande init — configure un projet Flutter/React/Vue local
program
    .command('init')
    .description('Initialiser la configuration wallet dans le projet courant (Flutter, Nuxt, NextJS…)')
    .action(async () => {
    const cfg = config_1.walletConfig.get();
    const cwd = process.cwd();
    // ── 1. Vérifier qu'un projet est actif ─────────────────────────────
    if (!cfg.activeProject) {
        console.error(chalk_1.default.red('✗ Aucun projet actif.'));
        console.error(chalk_1.default.dim('  Créez-en un : wallet project create'));
        console.error(chalk_1.default.dim('  Ou sélectionnez-en un : wallet project use <slug>'));
        process.exit(1);
    }
    let framework = 'Unknown';
    let frameworkLabel = 'projet inconnu';
    if (fs_1.default.existsSync(path_1.default.join(cwd, 'pubspec.yaml'))) {
        framework = 'Flutter';
        frameworkLabel = 'Flutter';
    }
    else if (fs_1.default.existsSync(path_1.default.join(cwd, 'package.json'))) {
        try {
            const pkg = JSON.parse(fs_1.default.readFileSync(path_1.default.join(cwd, 'package.json'), 'utf8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            if (deps['nuxt']) {
                framework = 'Nuxt';
                frameworkLabel = 'Nuxt';
            }
            else if (deps['next']) {
                framework = 'NextJS';
                frameworkLabel = 'NextJS';
            }
            else if (deps['react']) {
                framework = 'React';
                frameworkLabel = 'React (Vite)';
            }
            else if (deps['vue']) {
                framework = 'Vue';
                frameworkLabel = 'Vue (Vite)';
            }
        }
        catch { /* ignore */ }
    }
    console.log(chalk_1.default.bold('\n🚀 Initialisation wallet\n'));
    console.log(`  Projet  : ${chalk_1.default.cyan(cfg.activeProject)}`);
    console.log(`  Cloud   : ${chalk_1.default.dim(cfg.cloudUrl)}`);
    console.log(`  Env     : ${chalk_1.default.dim(cfg.environment)}`);
    console.log(`  Détecté : ${chalk_1.default.yellow(frameworkLabel)}\n`);
    // ── 3. Récupérer la publicKey du projet via l'API ──────────────────
    (0, keycloak_1.requireAuth)();
    await (0, keycloak_1.refreshTokenIfNeeded)();
    const spinner = (0, ora_1.default)('Récupération des infos du projet…').start();
    let publicKey = '';
    try {
        const project = await client_1.projectsApi.get(cfg.activeProject);
        publicKey = project.publicKey ?? '';
        spinner.succeed(`Projet "${project.name}" — clé : ${chalk_1.default.cyan(publicKey)}`);
    }
    catch {
        spinner.warn('Impossible de récupérer la clé du projet (mode hors-ligne).');
        console.log(chalk_1.default.dim('  Remplacez pk_VOTRE_CLE par votre vraie clé dans les fichiers générés.\n'));
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
    fs_1.default.writeFileSync(path_1.default.join(cwd, 'wallet.yaml'), walletYaml, 'utf8');
    console.log(chalk_1.default.green('✓ wallet.yaml créé'));
    // ── 5. Ajouter wallet.yaml au .gitignore ──────────────────────────
    const gitignorePath = path_1.default.join(cwd, '.gitignore');
    const gitignoreEntry = 'wallet.yaml';
    if (fs_1.default.existsSync(gitignorePath)) {
        const content = fs_1.default.readFileSync(gitignorePath, 'utf8');
        if (!content.includes(gitignoreEntry)) {
            fs_1.default.appendFileSync(gitignorePath, `\n# wallet-cli config (contient votre project key)\n${gitignoreEntry}\n`);
            console.log(chalk_1.default.green('✓ wallet.yaml ajouté au .gitignore'));
        }
        else {
            console.log(chalk_1.default.dim('  .gitignore : wallet.yaml déjà présent'));
        }
    }
    else {
        fs_1.default.writeFileSync(gitignorePath, `# wallet-cli config\n${gitignoreEntry}\n`);
        console.log(chalk_1.default.green('✓ .gitignore créé avec wallet.yaml'));
    }
    // ── 6. Patch spécifique au framework ─────────────────────────────
    if (framework === 'Flutter') {
        await initFlutter(cwd, publicKey, cfg.cloudUrl, cfg.environment);
    }
    else if (framework === 'Nuxt') {
        initNuxt(cwd, publicKey, cfg.cloudUrl);
    }
    else if (framework === 'NextJS') {
        initNextJS(cwd, publicKey, cfg.cloudUrl);
    }
    else {
        console.log(chalk_1.default.yellow('\n⚠ Framework non reconnu. wallet.yaml créé, mais aucun fichier de code modifié.'));
        console.log(chalk_1.default.dim('  Frameworks supportés : Flutter, Nuxt, NextJS, React, Vue'));
    }
    console.log(chalk_1.default.bold.green('\n✅ Initialisation terminée !'));
});
// ─── Flutter init ──────────────────────────────────────────────────────────
async function initFlutter(cwd, publicKey, cloudUrl, env) {
    console.log(chalk_1.default.bold('\n📱 Configuration Flutter\n'));
    // ── flutter pub add feda_flutter (installe ET met à jour pubspec + pub get) ──
    const pubspecPath = path_1.default.join(cwd, 'pubspec.yaml');
    if (!fs_1.default.existsSync(pubspecPath)) {
        console.log(chalk_1.default.yellow('  ⚠ pubspec.yaml introuvable — pas un projet Flutter valide'));
        return;
    }
    const pubspec = fs_1.default.readFileSync(pubspecPath, 'utf8');
    if (pubspec.includes('feda_flutter')) {
        console.log(chalk_1.default.dim('  feda_flutter déjà présent dans pubspec.yaml'));
    }
    else {
        // Cherche si le SDK local existe en remontant l'arborescence (workspace mono-repo)
        const localSdkCandidates = [
            path_1.default.resolve(cwd, '../../feda_flutter'),
            path_1.default.resolve(cwd, '../feda_flutter'),
            path_1.default.resolve(cwd, 'packages/feda_flutter'),
        ];
        const localSdkPath = localSdkCandidates.find((p) => fs_1.default.existsSync(path_1.default.join(p, 'pubspec.yaml')));
        if (localSdkPath) {
            // Dépendance locale (développement) — pointe vers le SDK source
            const relPath = path_1.default.relative(cwd, localSdkPath).replace(/\\/g, '/');
            let pubspecContent = fs_1.default.readFileSync(pubspecPath, 'utf8');
            pubspecContent = pubspecContent.replace(/^(  cupertino_icons:.+)$/m, `$1\n  feda_flutter:\n    path: ${relPath}`);
            fs_1.default.writeFileSync(pubspecPath, pubspecContent, 'utf8');
            const getSpinner = (0, ora_1.default)('  flutter pub get…').start();
            try {
                (0, child_process_1.execSync)('flutter pub get', { cwd, stdio: 'pipe' });
                getSpinner.succeed(`feda_flutter ajouté (path: ${relPath}) + pub get ✓`);
            }
            catch (e) {
                getSpinner.fail('flutter pub get a échoué');
                console.log(chalk_1.default.dim(`  ${e.message ?? e}`));
            }
        }
        else {
            // Pas de SDK local → pub.dev
            const addSpinner = (0, ora_1.default)('  flutter pub add feda_flutter…').start();
            try {
                (0, child_process_1.execSync)('flutter pub add feda_flutter', { cwd, stdio: 'pipe' });
                addSpinner.succeed('flutter pub add feda_flutter  (pubspec.yaml + pub get ✓)');
            }
            catch (e) {
                addSpinner.fail('flutter pub add a échoué');
                console.log(chalk_1.default.dim(`  Ajoutez manuellement : feda_flutter: ^0.2.2`));
            }
        }
    }
    // ── Patch main.dart ──
    const mainDartPath = path_1.default.join(cwd, 'lib', 'main.dart');
    if (fs_1.default.existsSync(mainDartPath)) {
        let mainDart = fs_1.default.readFileSync(mainDartPath, 'utf8');
        let changed = false;
        if (!mainDart.includes('feda_flutter')) {
            mainDart = mainDart.replace(`import 'package:flutter/material.dart';`, `import 'package:flutter/material.dart';\nimport 'package:feda_flutter/feda_flutter.dart';`);
            changed = true;
        }
        if (!mainDart.includes('applyCloudConfig') && !mainDart.includes('applyConfig')) {
            mainDart = mainDart.replace(/void main\(\)\s*\{[\s\n]*runApp\(/, `void main() {\n  FedaFlutter.applyCloudConfig(\n    projectKey: '${publicKey}',\n    cloudUrl: '${cloudUrl}',\n    environment: ApiEnvironment.${env},\n  );\n  runApp(`);
            changed = true;
        }
        if (changed) {
            fs_1.default.writeFileSync(mainDartPath, mainDart, 'utf8');
            console.log(chalk_1.default.green('  ✓ lib/main.dart — FedaFlutter.applyCloudConfig() ajouté'));
        }
        else {
            console.log(chalk_1.default.dim('  lib/main.dart — déjà initialisé'));
        }
    }
    else {
        console.log(chalk_1.default.yellow('  ⚠ lib/main.dart introuvable'));
    }
    // ── Lancer generate widget directement ──
    console.log(chalk_1.default.bold('\n🎨 Génération du widget de paiement\n'));
    const cliPath = process.argv[1]; // chemin absolu vers dist/index.js
    const result = (0, child_process_1.spawnSync)('node', [cliPath, 'generate', 'widget'], {
        cwd,
        stdio: 'inherit', // garde le terminal interactif pour Inquirer
        env: process.env,
    });
    if (result.status !== 0) {
        console.log(chalk_1.default.yellow('\n  ⚠ Génération du widget annulée ou échouée.'));
        console.log(chalk_1.default.dim('  Relancez manuellement : wallet generate widget'));
    }
}
// ─── Nuxt init ────────────────────────────────────────────────────────────
function initNuxt(cwd, publicKey, cloudUrl) {
    console.log(chalk_1.default.bold('\n🟢 Configuration Nuxt\n'));
    const envPath = path_1.default.join(cwd, '.env');
    const envLines = [
        `NUXT_PUBLIC_FEDA_PROJECT_KEY=${publicKey}`,
        `NUXT_PUBLIC_FEDA_CLOUD_URL=${cloudUrl}`,
    ];
    if (fs_1.default.existsSync(envPath)) {
        let env = fs_1.default.readFileSync(envPath, 'utf8');
        let changed = false;
        for (const line of envLines) {
            const key = line.split('=')[0];
            if (!env.includes(key)) {
                env += `\n${line}`;
                changed = true;
            }
        }
        if (changed) {
            fs_1.default.writeFileSync(envPath, env.trimStart(), 'utf8');
            console.log(chalk_1.default.green('  ✓ .env — variables NUXT_PUBLIC_FEDA_* ajoutées'));
        }
        else {
            console.log(chalk_1.default.dim('  .env — variables déjà présentes'));
        }
    }
    else {
        fs_1.default.writeFileSync(envPath, envLines.join('\n') + '\n', 'utf8');
        console.log(chalk_1.default.green('  ✓ .env créé avec les variables NUXT_PUBLIC_FEDA_*'));
    }
    console.log(chalk_1.default.bold('\n  Prochaines étapes :'));
    console.log(`    ${chalk_1.default.cyan('wallet generate widget')}`);
    console.log(`    ${chalk_1.default.cyan('wallet generate guard')}`);
}
// ─── NextJS init ──────────────────────────────────────────────────────────
function initNextJS(cwd, publicKey, cloudUrl) {
    console.log(chalk_1.default.bold('\n⚛️  Configuration NextJS\n'));
    const envPath = path_1.default.join(cwd, '.env.local');
    const envLines = [
        `NEXT_PUBLIC_FEDA_PROJECT_KEY=${publicKey}`,
        `NEXT_PUBLIC_FEDA_CLOUD_URL=${cloudUrl}`,
    ];
    if (fs_1.default.existsSync(envPath)) {
        let env = fs_1.default.readFileSync(envPath, 'utf8');
        let changed = false;
        for (const line of envLines) {
            const key = line.split('=')[0];
            if (!env.includes(key)) {
                env += `\n${line}`;
                changed = true;
            }
        }
        if (changed) {
            fs_1.default.writeFileSync(envPath, env.trimStart(), 'utf8');
            console.log(chalk_1.default.green('  ✓ .env.local — variables NEXT_PUBLIC_FEDA_* ajoutées'));
        }
        else {
            console.log(chalk_1.default.dim('  .env.local — variables déjà présentes'));
        }
    }
    else {
        fs_1.default.writeFileSync(envPath, envLines.join('\n') + '\n', 'utf8');
        console.log(chalk_1.default.green('  ✓ .env.local créé avec les variables NEXT_PUBLIC_FEDA_*'));
    }
    console.log(chalk_1.default.bold('\n  Prochaines étapes :'));
    console.log(`    ${chalk_1.default.cyan('wallet generate widget')}`);
    console.log(`    ${chalk_1.default.cyan('wallet generate guard')}`);
}
// Commande config — afficher la configuration courante
program
    .command('config')
    .description('Afficher la configuration courante de la CLI')
    .action(() => {
    const cfg = config_1.walletConfig.get();
    const tokens = config_1.walletConfig.getTokens();
    console.log(chalk_1.default.bold('\nConfiguration wallet-cli'));
    console.log(`  Cloud URL     : ${cfg.cloudUrl}`);
    console.log(`  Environnement : ${cfg.environment === 'live' ? chalk_1.default.red('LIVE') : chalk_1.default.cyan('sandbox')}`);
    console.log(`  Projet actuel : ${cfg.activeProject ?? chalk_1.default.dim('(aucun)')}`);
    console.log(`  Authentifié   : ${tokens.accessToken && tokens.expiresAt > Date.now() ? chalk_1.default.green('oui') : chalk_1.default.red('non')}`);
    console.log(`  Config file   : ${chalk_1.default.dim(config_1.walletConfig.getConfigPath())}`);
});
program.parse(process.argv);
// Si aucune commande fournie, afficher l'aide
if (process.argv.length <= 2) {
    program.help();
}
