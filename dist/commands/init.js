"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeReadlineInterface = closeReadlineInterface;
exports.registerInitCommands = registerInitCommands;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("readline/promises"));
const process_1 = require("process");
const child_process_1 = require("child_process");
const client_1 = require("../api/client");
const config_1 = require("../config/config");
const keycloak_1 = require("../auth/keycloak");
let rlInstance = null;
function getReadlineInterface() {
    if (!rlInstance) {
        rlInstance = promises_1.default.createInterface({ input: process_1.stdin, output: process_1.stdout });
    }
    return rlInstance;
}
async function askQuestion(query) {
    const rl = getReadlineInterface();
    const answer = await rl.question(query);
    return answer.trim();
}
function closeReadlineInterface() {
    if (rlInstance) {
        rlInstance.close();
        rlInstance = null;
    }
}
function updateEnvFile(envPath, vars) {
    let content = fs_1.default.existsSync(envPath) ? fs_1.default.readFileSync(envPath, 'utf8') : '';
    for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp(`^${key}=.*$`, 'gm');
        if (regex.test(content)) {
            content = content.replace(regex, `${key}=${value}`);
        }
        else {
            if (content && !content.endsWith('\n')) {
                content += '\n';
            }
            content += `${key}=${value}\n`;
        }
    }
    fs_1.default.writeFileSync(envPath, content);
}
function registerInitCommands(program) {
    program
        .command('init')
        .description('Détecter le projet local, configurer les clés et installer les composants de paiement')
        .action(async () => {
        try {
            console.log(chalk_1.default.bold.cyan('\nInitialisation d\'Ash Gateway dans votre projet local...'));
            const cwd = process.cwd();
            let detectedType = null;
            let projectPath = cwd;
            // 1. DÉTECTION DU PROJET
            if (fs_1.default.existsSync(path_1.default.join(cwd, 'pubspec.yaml'))) {
                detectedType = 'flutter';
            }
            else if (fs_1.default.existsSync(path_1.default.join(cwd, 'Gemfile'))) {
                detectedType = 'rails';
            }
            else if (fs_1.default.existsSync(path_1.default.join(cwd, 'package.json'))) {
                try {
                    const pkg = JSON.parse(fs_1.default.readFileSync(path_1.default.join(cwd, 'package.json'), 'utf8'));
                    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                    if (deps.nuxt) {
                        detectedType = 'nuxt';
                    }
                    else if (deps.next) {
                        detectedType = 'next';
                    }
                    else if (deps.vue) {
                        detectedType = 'vue';
                    }
                    else if (deps.react) {
                        detectedType = 'react';
                    }
                    else if (deps.express) {
                        detectedType = 'express';
                    }
                }
                catch {
                    // ignore JSON parse errors
                }
            }
            // Si rien n'est détecté dans le dossier courant, chercher des indices ou demander
            if (!detectedType) {
                console.log(chalk_1.default.yellow('\nAucun projet compatible détecté directement dans le dossier actuel.'));
                const searchDirs = fs_1.default.readdirSync(cwd).filter(f => fs_1.default.statSync(path_1.default.join(cwd, f)).isDirectory());
                // Chercher dans les sous-dossiers immédiats (ex: lab_app, etc.)
                for (const dir of searchDirs) {
                    const subPath = path_1.default.join(cwd, dir);
                    if (fs_1.default.existsSync(path_1.default.join(subPath, 'pubspec.yaml'))) {
                        detectedType = 'flutter';
                        projectPath = subPath;
                        break;
                    }
                    else if (fs_1.default.existsSync(path_1.default.join(subPath, 'package.json'))) {
                        try {
                            const pkg = JSON.parse(fs_1.default.readFileSync(path_1.default.join(subPath, 'package.json'), 'utf8'));
                            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                            if (deps.nuxt) {
                                detectedType = 'nuxt';
                                projectPath = subPath;
                                break;
                            }
                            else if (deps.next) {
                                detectedType = 'next';
                                projectPath = subPath;
                                break;
                            }
                            else if (deps.vue) {
                                detectedType = 'vue';
                                projectPath = subPath;
                                break;
                            }
                            else if (deps.react) {
                                detectedType = 'react';
                                projectPath = subPath;
                                break;
                            }
                        }
                        catch { }
                    }
                }
            }
            if (detectedType) {
                console.log(chalk_1.default.green(`✓ Projet détecté : ${chalk_1.default.bold(detectedType.toUpperCase())} dans ${path_1.default.relative(cwd, projectPath) || '.'}`));
            }
            else {
                console.log(chalk_1.default.cyan('\nTypes de projets supportés : flutter, nuxt, vue, next, react, express, rails'));
                const manual = await askQuestion('Veuillez entrer le type de votre projet manuellement : ');
                const type = manual.toLowerCase();
                if (['flutter', 'nuxt', 'vue', 'next', 'react', 'express', 'rails'].includes(type)) {
                    detectedType = type;
                }
                else {
                    console.error(chalk_1.default.red('✗ Type de projet non supporté.'));
                    process.exit(1);
                }
            }
            // 2. CONFIGURATION DES CLÉS (INTELLIGENTE OU MANUELLE)
            let projectKey = '';
            let projectSlug = '';
            let cloudUrl = config_1.walletConfig.get().cloudUrl || 'https://app.ashgateway.com';
            let environment = 'sandbox';
            if (!config_1.walletConfig.isAuthenticated()) {
                console.log(chalk_1.default.yellow('\nVous n\'êtes pas connecté. Connexion requise pour continuer.'));
                try {
                    await (0, keycloak_1.loginWithKeycloak)();
                }
                catch (err) {
                    console.error(chalk_1.default.red(`\n✗ Échec de la connexion : ${err.message}`));
                    process.exit(1);
                }
            }
            if (config_1.walletConfig.isAuthenticated()) {
                try {
                    const response = await client_1.apiClient.get('/projects');
                    const projects = response.data;
                    if (Array.isArray(projects) && projects.length > 0) {
                        console.log(chalk_1.default.cyan('\nVos projets Ash Gateway :'));
                        projects.forEach((p, idx) => {
                            console.log(`  ${idx + 1}. ${p.name} (${p.slug})`);
                        });
                        const selection = await askQuestion(`Choisissez le projet (1-${projects.length}) : `);
                        const index = parseInt(selection) - 1;
                        if (index >= 0 && index < projects.length) {
                            projectKey = projects[index].publicKey;
                            projectSlug = projects[index].slug;
                            console.log(chalk_1.default.green(`✓ Projet sélectionné : ${projects[index].name}`));
                        }
                    }
                    else {
                        console.log(chalk_1.default.yellow('\nAucun projet trouvé sur votre compte.'));
                    }
                }
                catch (err) {
                    console.log(chalk_1.default.yellow(`\n⚠️  Impossible de charger les projets depuis l'API (${err.message}).`));
                }
            }
            if (!projectKey) {
                console.log(chalk_1.default.yellow('\n(Configuration manuelle des clés)'));
                projectKey = await askQuestion('Entrez la clé publique de votre projet (ap_pub_xxx) : ');
                projectSlug = await askQuestion('Entrez le slug de votre projet : ');
            }
            const envSelection = await askQuestion('\nChoisissez l\'environnement (1. sandbox [défaut], 2. live) : ');
            if (envSelection === '2') {
                environment = 'live';
            }
            // Configuration interactive des fournisseurs de paiement
            console.log(chalk_1.default.cyan('\nConfiguration des fournisseurs de paiement :'));
            console.log('  1. Tous les 7 fournisseurs (FedaPay, pawaPay, PayPal, FeexPay, PayDunya, Stripe, SebPay) [défaut]');
            console.log('  2. FedaPay uniquement (Mobile Money Afrique de l\'Ouest)');
            console.log('  3. pawaPay uniquement (Mobile Money Pan-Africain)');
            console.log('  4. PayPal uniquement (Checkout V2)');
            console.log('  5. FeexPay uniquement (Direct / Proxy)');
            console.log('  6. PayDunya uniquement (Sénégal & UEMOA)');
            console.log('  7. Stripe uniquement (Cartes Bancaires Internationales)');
            console.log('  8. SebPay uniquement (Afrique de l\'Ouest / Mobile Money & Cartes)');
            console.log('  9. Sélection personnalisée');
            const providerSelection = await askQuestion('Choisissez une option (1-9) [1 par défaut] : ');
            let useFedapay = true;
            let usePawapay = true;
            let usePaypal = true;
            let useFeexpay = true;
            let usePaydunya = true;
            let useStripe = true;
            let useSebpay = true;
            if (providerSelection === '2') {
                usePawapay = false;
                usePaypal = false;
                useFeexpay = false;
                usePaydunya = false;
                useStripe = false;
                useSebpay = false;
            }
            else if (providerSelection === '3') {
                useFedapay = false;
                usePaypal = false;
                useFeexpay = false;
                usePaydunya = false;
                useStripe = false;
                useSebpay = false;
            }
            else if (providerSelection === '4') {
                useFedapay = false;
                usePawapay = false;
                useFeexpay = false;
                usePaydunya = false;
                useStripe = false;
                useSebpay = false;
            }
            else if (providerSelection === '5') {
                useFedapay = false;
                usePawapay = false;
                usePaypal = false;
                usePaydunya = false;
                useStripe = false;
                useSebpay = false;
            }
            else if (providerSelection === '6') {
                useFedapay = false;
                usePawapay = false;
                usePaypal = false;
                useFeexpay = false;
                useStripe = false;
                useSebpay = false;
            }
            else if (providerSelection === '7') {
                useFedapay = false;
                usePawapay = false;
                usePaypal = false;
                useFeexpay = false;
                usePaydunya = false;
                useSebpay = false;
            }
            else if (providerSelection === '8') {
                useFedapay = false;
                usePawapay = false;
                usePaypal = false;
                useFeexpay = false;
                usePaydunya = false;
                useStripe = false;
            }
            else if (providerSelection === '9') {
                useFedapay = (await askQuestion('Activer FedaPay ? (o/n) [o] : ')).toLowerCase() !== 'n';
                usePawapay = (await askQuestion('Activer pawaPay ? (o/n) [o] : ')).toLowerCase() !== 'n';
                usePaypal = (await askQuestion('Activer PayPal ? (o/n) [o] : ')).toLowerCase() !== 'n';
                useFeexpay = (await askQuestion('Activer FeexPay ? (o/n) [o] : ')).toLowerCase() !== 'n';
                usePaydunya = (await askQuestion('Activer PayDunya ? (o/n) [o] : ')).toLowerCase() !== 'n';
                useStripe = (await askQuestion('Activer Stripe ? (o/n) [o] : ')).toLowerCase() !== 'n';
                useSebpay = (await askQuestion('Activer SebPay ? (o/n) [o] : ')).toLowerCase() !== 'n';
            }
            let feexpayMode = 'proxy';
            let feexpayToken = '';
            let feexpayShopId = '';
            if (useFeexpay) {
                console.log(chalk_1.default.cyan('\nMode d\'intégration pour FeexPay :'));
                console.log('  1. Proxy/Serveur USSD (Recommandé - Sécurisé et sans SDK local) [défaut]');
                console.log('  2. SDK local (feexpay_flutter - nécessite d\'exposer vos clés)');
                const modeSelection = await askQuestion('Choisissez une option (1-2) : ');
                if (modeSelection === '2') {
                    feexpayMode = 'sdk';
                    console.log(chalk_1.default.yellow('\n(Configuration des clés FeexPay requise pour le SDK local)'));
                    feexpayToken = await askQuestion('Entrez votre clé API / Token FeexPay (ex: fp_xxxx ou Bearer token) : ');
                    feexpayShopId = await askQuestion('Entrez votre Shop ID FeexPay : ');
                }
            }
            // Configuration interactive du mode de notification d'événements
            console.log(chalk_1.default.cyan('\nConfiguration du mode de notification des événements :'));
            console.log('  1. Webhook HTTP POST (Serveur à Serveur)');
            console.log('  2. WebSocket WSS Realtime (Client léger / App Mobile temps réel)');
            console.log('  3. Hybride : Webhook + WebSocket (Recommandé - Validation BDD + UX Directe) [défaut]');
            const notificationSelection = await askQuestion('Choisissez le mode de notification (1-3) [3 par défaut] : ');
            let notificationMode = 'both';
            if (notificationSelection === '1') {
                notificationMode = 'webhook';
            }
            else if (notificationSelection === '2') {
                notificationMode = 'websocket';
            }
            let webhookUrlInput = '';
            if (['webhook', 'both'].includes(notificationMode)) {
                webhookUrlInput = await askQuestion('URL Webhook Client (optionnelle, ex: https://mon-app.com/api/webhooks/ashgate) : ');
            }
            if (projectSlug) {
                try {
                    const updatePayload = { notificationMode };
                    if (webhookUrlInput.trim()) {
                        updatePayload.webhookUrl = webhookUrlInput.trim();
                    }
                    await client_1.apiClient.patch(`/projects/${projectSlug}`, updatePayload);
                    console.log(chalk_1.default.green(`✓ Mode de notification [${notificationMode}] configuré sur le projet "${projectSlug}".`));
                }
                catch (e) {
                    // Ignore error if offline
                }
            }
            // 3. ÉCRITURE DES CONFIGURATIONS ET COMPOSANTS
            try {
                if (detectedType === 'flutter') {
                    const pubspecPath = path_1.default.join(projectPath, 'pubspec.yaml');
                    const pubspecContent = fs_1.default.readFileSync(pubspecPath, 'utf8');
                    // ÉTAPE A : Installer les dépendances nécessaires
                    if (useFedapay) {
                        if (!pubspecContent.includes('feda_flutter:')) {
                            console.log(chalk_1.default.cyan('\nInstallation de la dépendance feda_flutter...'));
                            try {
                                (0, child_process_1.execSync)('flutter pub add feda_flutter', { cwd: projectPath, stdio: 'inherit' });
                                console.log(chalk_1.default.green('✓ Dépendance feda_flutter ajoutée avec succès.'));
                            }
                            catch (err) {
                                console.warn(chalk_1.default.yellow('⚠️  Impossible d\'ajouter feda_flutter via la CLI flutter. Veuillez l\'ajouter manuellement à vos dependencies dans pubspec.yaml.'));
                            }
                        }
                    }
                    if (useFeexpay && feexpayMode === 'sdk') {
                        if (!pubspecContent.includes('feexpay_flutter:')) {
                            console.log(chalk_1.default.cyan('\nInstallation de la dépendance feexpay_flutter...'));
                            try {
                                (0, child_process_1.execSync)('flutter pub add feexpay_flutter', { cwd: projectPath, stdio: 'inherit' });
                                console.log(chalk_1.default.green('✓ Dépendance feexpay_flutter ajoutée avec succès.'));
                            }
                            catch (err) {
                                console.warn(chalk_1.default.yellow('⚠️  Impossible d\'ajouter feexpay_flutter via la CLI flutter. Veuillez l\'ajouter manuellement à vos dependencies dans pubspec.yaml.'));
                            }
                        }
                    }
                    if ((useFeexpay && feexpayMode === 'proxy') || (useFedapay && useFeexpay) || useStripe) {
                        if (!pubspecContent.includes('webview_flutter:')) {
                            console.log(chalk_1.default.cyan('\nInstallation de la dépendance webview_flutter...'));
                            try {
                                (0, child_process_1.execSync)('flutter pub add webview_flutter', { cwd: projectPath, stdio: 'inherit' });
                                console.log(chalk_1.default.green('✓ Dépendance webview_flutter ajoutée avec succès.'));
                            }
                            catch (err) {
                                console.warn(chalk_1.default.yellow('⚠️  Impossible d\'ajouter webview_flutter via la CLI flutter. Veuillez l\'ajouter manuellement à vos dependencies dans pubspec.yaml.'));
                            }
                        }
                    }
                    // ÉTAPE B : Créer la structure de dossiers lib/
                    const libDir = path_1.default.join(projectPath, 'lib');
                    const providersDir = path_1.default.join(libDir, 'providers');
                    if (!fs_1.default.existsSync(providersDir)) {
                        fs_1.default.mkdirSync(providersDir, { recursive: true });
                    }
                    // 1. ashgate_config.dart
                    const fedaImport = useFedapay ? "import 'package:feda_flutter/feda_flutter.dart';\n" : "";
                    const fedaEnvType = useFedapay ? "ApiEnvironment" : "String";
                    const fedaEnvVal = useFedapay ? `ApiEnvironment.${environment}` : `'${environment}'`;
                    const configContent = `// Généré automatiquement par ashgate init
${fedaImport}
class AshgateConfig {
  static const String cloudUrl = '${cloudUrl}';
  static const String projectKey = '${projectKey}';
  static const String projectSlug = '${projectSlug}';
  static const ${fedaEnvType} environment = ${fedaEnvVal};
  static const bool useFedapay = ${useFedapay};
  static const bool usePawapay = ${usePawapay};
  static const bool usePaypal = ${usePaypal};
  static const bool useFeexpay = ${useFeexpay};
  static const bool usePaydunya = ${usePaydunya};
  static const bool useStripe = ${useStripe};
  static const bool useSebpay = ${useSebpay};
  static const String feexpayToken = '${feexpayToken}';
  static const String feexpayShopId = '${feexpayShopId}';
}
`;
                    fs_1.default.writeFileSync(path_1.default.join(libDir, 'ashgate_config.dart'), configContent);
                    console.log(chalk_1.default.green('✓ Fichier lib/ashgate_config.dart généré.'));
                    // 2. ashgate_payment_provider.dart (Interface et DTO commun)
                    const providerBaseContent = `// Généré automatiquement par ashgate init
import 'package:flutter/material.dart';

/// Modèle unifié de demande de paiement pour Ash Gateway.
/// Traduit automatiquement selon les besoins de chaque passerelle.
class AshgatePaymentRequest {
  final double amount;
  final String description;
  final String phoneNumber;
  final String country; // ex: "bj", "ci"
  final String email;
  final String firstname;
  final String lastname;
  final String paymentMethod; // ex: "mtn", "moov", "celtiis"
  final String currency; // ex: "XOF", "EUR"
  final BuildContext? context; // Requis pour certains SDK (ex: ChoicePage de FeexPay)

  AshgatePaymentRequest({
    required this.amount,
    required this.description,
    required this.phoneNumber,
    this.country = 'bj',
    required this.email,
    required this.firstname,
    required this.lastname,
    required this.paymentMethod,
    this.currency = 'XOF',
    this.context,
  });
}

/// Résultat unifié renvoyé après l'initiation d'un paiement.
class AshgatePaymentResult {
  final bool success;
  final String? transactionId;
  final String? paymentUrl;
  final String? token;
  final String? errorMessage;

  AshgatePaymentResult({
    required this.success,
    this.transactionId,
    this.paymentUrl,
    this.token,
    this.errorMessage,
  });
}

/// Interface commune pour toutes les passerelles de paiement de l'écosystème.
abstract class AshgatePaymentProvider {
  Future<AshgatePaymentResult> pay(AshgatePaymentRequest request);
}
`;
                    fs_1.default.writeFileSync(path_1.default.join(libDir, 'ashgate_payment_provider.dart'), providerBaseContent);
                    console.log(chalk_1.default.green('✓ Fichier lib/ashgate_payment_provider.dart généré.'));
                    // 3. providers/fedapay_provider.dart (Adaptateur FedaPay)
                    if (useFedapay) {
                        const fedapayProviderContent = `// Généré automatiquement par ashgate init
import 'package:feda_flutter/feda_flutter.dart';
import '../ashgate_payment_provider.dart';

class FedapayProvider implements AshgatePaymentProvider {
  @override
  Future<AshgatePaymentResult> pay(AshgatePaymentRequest request) async {
    try {
      // 1. Adapter la requête plate vers le modèle FedaPay
      final customer = CustomerCreate(
        email: request.email,
        firstname: request.firstname,
        lastname: request.lastname,
        phoneNumber: PhoneNumber(number: request.phoneNumber, country: request.country),
      );

      final transactionCreate = TransactionCreate(
        amount: request.amount.toInt(),
        description: request.description,
        currency: CurrencyIso(iso: request.currency),
        customer: customer,
      );

      // 2. Créer la transaction via le SDK feda_flutter
      final response = await FedaFlutter.instance.transactions.createTransaction(transactionCreate);
      final transactionId = response.data?.id;

      if (transactionId == null) {
        return AshgatePaymentResult(success: false, errorMessage: "Erreur lors de la création de la transaction FedaPay.");
      }

      // 3. Récupérer le token de paiement
      final tokenResponse = await FedaFlutter.instance.transactions.getTransactionToken(transactionId);
      final token = tokenResponse.data?.token;
      final url = tokenResponse.data?.url;

      return AshgatePaymentResult(
        success: token != null,
        transactionId: transactionId.toString(),
        paymentUrl: url,
        token: token,
      );
    } catch (e) {
      return AshgatePaymentResult(success: false, errorMessage: e.toString());
    }
  }
}
`;
                        fs_1.default.writeFileSync(path_1.default.join(providersDir, 'fedapay_provider.dart'), fedapayProviderContent);
                        console.log(chalk_1.default.green('✓ Fichier lib/providers/fedapay_provider.dart généré.'));
                    }
                    else {
                        const oldFeda = path_1.default.join(providersDir, 'fedapay_provider.dart');
                        if (fs_1.default.existsSync(oldFeda))
                            fs_1.default.unlinkSync(oldFeda);
                    }
                    // 3.5 providers/stripe_provider.dart (Adaptateur Stripe Checkout via Proxy)
                    if (useStripe) {
                        const stripeProviderContent = `// Généré automatiquement par ashgate init
import 'dart:convert';
import 'dart:io';
import '../ashgate_config.dart';
import '../ashgate_payment_provider.dart';

class StripeProvider implements AshgatePaymentProvider {
  @override
  Future<AshgatePaymentResult> pay(AshgatePaymentRequest request) async {
    final client = HttpClient();
    try {
      final url = Uri.parse('\${AshgateConfig.cloudUrl}/payments/direct-payment');

      final req = await client.postUrl(url);
      req.headers.set('content-type', 'application/json');
      req.headers.set('x-feda-project-key', AshgateConfig.projectKey);
      req.headers.set('x-feda-env', AshgateConfig.environment.toString().split('.').last);

      final body = {
        'provider': 'stripe',
        'amount': request.amount.toInt(),
        'email': request.email,
        'description': request.description,
        'firstname': request.firstname,
        'lastname': request.lastname,
        'currency': request.currency == 'XOF' ? 'EUR' : request.currency,
      };

      req.add(utf8.encode(jsonEncode(body)));
      final response = await req.close();
      
      final responseBody = await response.transform(utf8.decoder).join();
      final json = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 || response.statusCode == 201) {
        return AshgatePaymentResult(
          success: true,
          transactionId: json['id']?.toString(),
          paymentUrl: json['payment_url'] ?? json['url'],
          token: json['id']?.toString(),
        );
      } else {
        return AshgatePaymentResult(
          success: false, 
          errorMessage: json['message'] ?? "Erreur HTTP \${response.statusCode}"
        );
      }
    } catch (e) {
      return AshgatePaymentResult(success: false, errorMessage: e.toString());
    } finally {
      client.close();
    }
  }
}
`;
                        fs_1.default.writeFileSync(path_1.default.join(providersDir, 'stripe_provider.dart'), stripeProviderContent);
                        console.log(chalk_1.default.green('✓ Fichier lib/providers/stripe_provider.dart généré.'));
                    }
                    else {
                        const oldStripe = path_1.default.join(providersDir, 'stripe_provider.dart');
                        if (fs_1.default.existsSync(oldStripe))
                            fs_1.default.unlinkSync(oldStripe);
                    }
                    // 3.6 providers/pawapay_provider.dart
                    if (usePawapay) {
                        const pawapayProviderContent = `// Généré automatiquement par ashgate init
import 'dart:convert';
import 'dart:io';
import '../ashgate_config.dart';
import '../ashgate_payment_provider.dart';

class PawapayProvider implements AshgatePaymentProvider {
  @override
  Future<AshgatePaymentResult> pay(AshgatePaymentRequest request) async {
    final client = HttpClient();
    try {
      final url = Uri.parse('\${AshgateConfig.cloudUrl}/payments/direct-payment');

      final req = await client.postUrl(url);
      req.headers.set('content-type', 'application/json');
      req.headers.set('x-feda-project-key', AshgateConfig.projectKey);
      req.headers.set('x-feda-env', AshgateConfig.environment.toString().split('.').last);

      final body = {
        'provider': 'pawapay',
        'amount': request.amount.toInt(),
        'currency': request.currency,
        'phoneNumber': request.phoneNumber,
        'email': request.email,
        'description': request.description,
      };

      req.add(utf8.encode(jsonEncode(body)));
      final response = await req.close();
      
      final responseBody = await response.transform(utf8.decoder).join();
      final json = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 || response.statusCode == 201) {
        return AshgatePaymentResult(
          success: true,
          transactionId: json['id']?.toString(),
          paymentUrl: json['payment_url'] ?? json['url'],
          token: json['id']?.toString(),
        );
      } else {
        return AshgatePaymentResult(
          success: false, 
          errorMessage: json['message'] ?? "Erreur HTTP \${response.statusCode}"
        );
      }
    } catch (e) {
      return AshgatePaymentResult(success: false, errorMessage: e.toString());
    } finally {
      client.close();
    }
  }
}
`;
                        fs_1.default.writeFileSync(path_1.default.join(providersDir, 'pawapay_provider.dart'), pawapayProviderContent);
                        console.log(chalk_1.default.green('✓ Fichier lib/providers/pawapay_provider.dart généré.'));
                    }
                    else {
                        const oldPawa = path_1.default.join(providersDir, 'pawapay_provider.dart');
                        if (fs_1.default.existsSync(oldPawa))
                            fs_1.default.unlinkSync(oldPawa);
                    }
                    // 3.7 providers/paypal_provider.dart
                    if (usePaypal) {
                        const paypalProviderContent = `// Généré automatiquement par ashgate init
import 'dart:convert';
import 'dart:io';
import '../ashgate_config.dart';
import '../ashgate_payment_provider.dart';

class PaypalProvider implements AshgatePaymentProvider {
  @override
  Future<AshgatePaymentResult> pay(AshgatePaymentRequest request) async {
    final client = HttpClient();
    try {
      final url = Uri.parse('\${AshgateConfig.cloudUrl}/payments/direct-payment');

      final req = await client.postUrl(url);
      req.headers.set('content-type', 'application/json');
      req.headers.set('x-feda-project-key', AshgateConfig.projectKey);
      req.headers.set('x-feda-env', AshgateConfig.environment.toString().split('.').last);

      final body = {
        'provider': 'paypal',
        'amount': request.amount.toInt(),
        'currency': request.currency == 'XOF' ? 'EUR' : request.currency,
        'email': request.email,
        'description': request.description,
      };

      req.add(utf8.encode(jsonEncode(body)));
      final response = await req.close();
      
      final responseBody = await response.transform(utf8.decoder).join();
      final json = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 || response.statusCode == 201) {
        return AshgatePaymentResult(
          success: true,
          transactionId: json['id']?.toString(),
          paymentUrl: json['payment_url'] ?? json['url'],
          token: json['id']?.toString(),
        );
      } else {
        return AshgatePaymentResult(
          success: false, 
          errorMessage: json['message'] ?? "Erreur HTTP \${response.statusCode}"
        );
      }
    } catch (e) {
      return AshgatePaymentResult(success: false, errorMessage: e.toString());
    } finally {
      client.close();
    }
  }
}
`;
                        fs_1.default.writeFileSync(path_1.default.join(providersDir, 'paypal_provider.dart'), paypalProviderContent);
                        console.log(chalk_1.default.green('✓ Fichier lib/providers/paypal_provider.dart généré.'));
                    }
                    else {
                        const oldPaypal = path_1.default.join(providersDir, 'paypal_provider.dart');
                        if (fs_1.default.existsSync(oldPaypal))
                            fs_1.default.unlinkSync(oldPaypal);
                    }
                    // 3.8 providers/paydunya_provider.dart
                    if (usePaydunya) {
                        const paydunyaProviderContent = `// Généré automatiquement par ashgate init
import 'dart:convert';
import 'dart:io';
import '../ashgate_config.dart';
import '../ashgate_payment_provider.dart';

class PaydunyaProvider implements AshgatePaymentProvider {
  @override
  Future<AshgatePaymentResult> pay(AshgatePaymentRequest request) async {
    final client = HttpClient();
    try {
      final url = Uri.parse('\${AshgateConfig.cloudUrl}/payments/direct-payment');

      final req = await client.postUrl(url);
      req.headers.set('content-type', 'application/json');
      req.headers.set('x-feda-project-key', AshgateConfig.projectKey);
      req.headers.set('x-feda-env', AshgateConfig.environment.toString().split('.').last);

      final body = {
        'provider': 'paydunya',
        'amount': request.amount.toInt(),
        'currency': request.currency,
        'email': request.email,
        'description': request.description,
      };

      req.add(utf8.encode(jsonEncode(body)));
      final response = await req.close();
      
      final responseBody = await response.transform(utf8.decoder).join();
      final json = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 || response.statusCode == 201) {
        return AshgatePaymentResult(
          success: true,
          transactionId: json['id']?.toString(),
          paymentUrl: json['payment_url'] ?? json['url'],
          token: json['id']?.toString(),
        );
      } else {
        return AshgatePaymentResult(
          success: false, 
          errorMessage: json['message'] ?? "Erreur HTTP \${response.statusCode}"
        );
      }
    } catch (e) {
      return AshgatePaymentResult(success: false, errorMessage: e.toString());
    } finally {
      client.close();
    }
  }
}
`;
                        fs_1.default.writeFileSync(path_1.default.join(providersDir, 'paydunya_provider.dart'), paydunyaProviderContent);
                        console.log(chalk_1.default.green('✓ Fichier lib/providers/paydunya_provider.dart généré.'));
                    }
                    else {
                        const oldPaydunya = path_1.default.join(providersDir, 'paydunya_provider.dart');
                        if (fs_1.default.existsSync(oldPaydunya))
                            fs_1.default.unlinkSync(oldPaydunya);
                    }
                    // 4. providers/feexpay_provider.dart (Adaptateur FeexPay)
                    if (useFeexpay) {
                        let feexpayProviderContent = '';
                        if (feexpayMode === 'sdk') {
                            feexpayProviderContent = `// Généré automatiquement par ashgate init
import 'package:flutter/material.dart';
import 'package:feexpay_flutter/feexpay_flutter.dart';
import '../ashgate_config.dart';
import '../ashgate_payment_provider.dart';

class FeexpayProvider implements AshgatePaymentProvider {
  @override
  Future<AshgatePaymentResult> pay(AshgatePaymentRequest request) async {
    if (request.context == null) {
      return AshgatePaymentResult(
        success: false,
        errorMessage: "BuildContext est requis pour lancer le SDK FeexPay.",
      );
    }

    try {
      Navigator.push(
        request.context!,
        MaterialPageRoute(
          builder: (context) => ChoicePage(
            token: AshgateConfig.feexpayToken,
            id: AshgateConfig.feexpayShopId,
            amount: request.amount.toInt().toString(),
            redirecturl: '/success',
            errorredirecturl: '/error',
            trans_key: DateTime.now().millisecondsSinceEpoch.toString(),
          ),
        ),
      );
      return AshgatePaymentResult(success: true);
    } catch (e) {
      return AshgatePaymentResult(success: false, errorMessage: e.toString());
    }
  }
}
`;
                        }
                        else {
                            feexpayProviderContent = `// Généré automatiquement par ashgate init
import 'dart:convert';
import 'dart:io';
import '../ashgate_config.dart';
import '../ashgate_payment_provider.dart';

class FeexpayProvider implements AshgatePaymentProvider {
  @override
  Future<AshgatePaymentResult> pay(AshgatePaymentRequest request) async {
    final client = HttpClient();
    try {
      // Résoudre le réseau compatible FeexPay
      final network = _mapToFeexpayNetwork(request.paymentMethod);
      final url = Uri.parse('\${AshgateConfig.cloudUrl}/feexpay/payin');

      final req = await client.postUrl(url);
      req.headers.set('content-type', 'application/json');
      req.headers.set('x-feda-project-key', AshgateConfig.projectKey);
      req.headers.set('x-feda-env', AshgateConfig.environment.toString().split('.').last);

      final body = {
        'network': network,
        'amount': request.amount.toInt(),
        'phoneNumber': request.phoneNumber,
        'fullname': '\${request.firstname} \${request.lastname}',
        'email': request.email,
        'description': request.description,
      };

      req.add(utf8.encode(jsonEncode(body)));
      final response = await req.close();
      
      final responseBody = await response.transform(utf8.decoder).join();
      final json = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 || response.statusCode == 201) {
        final reference = json['reference'] ?? json['id'];
        return AshgatePaymentResult(
          success: true,
          transactionId: reference?.toString(),
          paymentUrl: json['url'] ?? json['payment_url'],
          token: reference?.toString(),
        );
      } else {
        return AshgatePaymentResult(
          success: false, 
          errorMessage: json['message'] ?? "Erreur HTTP \${response.statusCode}"
        );
      }
    } catch (e) {
      return AshgatePaymentResult(success: false, errorMessage: e.toString());
    } finally {
      client.close();
    }
  }

  String _mapToFeexpayNetwork(String method) {
    final mapping = {
      'mtn': 'mtn',
      'moov': 'moov',
      'celtiis': 'celtiis',
      'mtn_open': 'mtn',
      'sbin': 'celtiis',
    };
    return mapping[method.toLowerCase()] ?? method;
  }
}
`;
                        }
                        fs_1.default.writeFileSync(path_1.default.join(providersDir, 'feexpay_provider.dart'), feexpayProviderContent);
                        console.log(chalk_1.default.green('✓ Fichier lib/providers/feexpay_provider.dart généré.'));
                    }
                    else {
                        const oldFeex = path_1.default.join(providersDir, 'feexpay_provider.dart');
                        if (fs_1.default.existsSync(oldFeex))
                            fs_1.default.unlinkSync(oldFeex);
                    }
                    // 4.5 providers/sebpay_provider.dart (Adaptateur SebPay)
                    if (useSebpay) {
                        const sebpayProviderContent = `// Généré automatiquement par ashgate init
import 'dart:convert';
import 'dart:io';
import '../ashgate_config.dart';
import '../ashgate_payment_provider.dart';

class SebpayProvider implements AshgatePaymentProvider {
  @override
  Future<AshgatePaymentResult> pay(AshgatePaymentRequest request) async {
    final client = HttpClient();
    try {
      final url = Uri.parse('\${AshgateConfig.cloudUrl}/sebpay/direct-payment');

      final req = await client.postUrl(url);
      req.headers.set('content-type', 'application/json');
      req.headers.set('x-feda-project-key', AshgateConfig.projectKey);
      req.headers.set('x-feda-env', AshgateConfig.environment.toString().split('.').last);

      final body = {
        'amount': request.amount.toInt(),
        'currency': request.currency,
        'phoneNumber': request.phoneNumber,
        'paymentMethod': request.paymentMethod,
        'firstname': request.firstname,
        'lastname': request.lastname,
        'email': request.email,
        'description': request.description,
      };

      req.add(utf8.encode(jsonEncode(body)));
      final response = await req.close();
      
      final responseBody = await response.transform(utf8.decoder).join();
      final json = jsonDecode(responseBody) as Map<String, dynamic>;

      if (response.statusCode == 200 || response.statusCode == 201) {
        final reference = json['transactionId'] ?? json['id'] ?? json['reference'];
        return AshgatePaymentResult(
          success: true,
          transactionId: reference?.toString(),
          paymentUrl: json['paymentUrl'] ?? json['payment_url'] ?? json['url'],
          token: reference?.toString(),
        );
      } else {
        return AshgatePaymentResult(
          success: false, 
          errorMessage: json['message'] ?? "Erreur HTTP \${response.statusCode}"
        );
      }
    } catch (e) {
      return AshgatePaymentResult(success: false, errorMessage: e.toString());
    } finally {
      client.close();
    }
  }
}
`;
                        fs_1.default.writeFileSync(path_1.default.join(providersDir, 'sebpay_provider.dart'), sebpayProviderContent);
                        console.log(chalk_1.default.green('✓ Fichier lib/providers/sebpay_provider.dart généré.'));
                    }
                    else {
                        const oldSeb = path_1.default.join(providersDir, 'sebpay_provider.dart');
                        if (fs_1.default.existsSync(oldSeb))
                            fs_1.default.unlinkSync(oldSeb);
                    }
                    // 5. ashgate_payment.dart (Orchestrateur & Helpers)
                    const imports = [
                        "import 'package:flutter/material.dart';",
                    ];
                    if (useFedapay) {
                        imports.push("import 'package:feda_flutter/feda_flutter.dart';");
                    }
                    if ((useFeexpay && feexpayMode === 'proxy') || useStripe || usePawapay || usePaypal || usePaydunya || useSebpay) {
                        imports.push("import 'package:webview_flutter/webview_flutter.dart';");
                    }
                    if (useFedapay || useStripe || useFeexpay || usePawapay || usePaypal || usePaydunya || useSebpay) {
                        imports.push("import 'ashgate_config.dart';");
                    }
                    imports.push("import 'ashgate_payment_provider.dart';");
                    if (useFedapay) {
                        imports.push("import 'providers/fedapay_provider.dart';");
                    }
                    if (usePawapay) {
                        imports.push("import 'providers/pawapay_provider.dart';");
                    }
                    if (usePaypal) {
                        imports.push("import 'providers/paypal_provider.dart';");
                    }
                    if (useFeexpay) {
                        imports.push("import 'providers/feexpay_provider.dart';");
                    }
                    if (usePaydunya) {
                        imports.push("import 'providers/paydunya_provider.dart';");
                    }
                    if (useStripe) {
                        imports.push("import 'providers/stripe_provider.dart';");
                    }
                    if (useSebpay) {
                        imports.push("import 'providers/sebpay_provider.dart';");
                    }
                    let providerResolver = '\n    final name = providerName.toLowerCase();';
                    if (useFedapay) {
                        providerResolver += '\n    if (name == \'fedapay\') return FedapayProvider();';
                    }
                    if (usePawapay) {
                        providerResolver += '\n    if (name == \'pawapay\') return PawapayProvider();';
                    }
                    if (usePaypal) {
                        providerResolver += '\n    if (name == \'paypal\') return PaypalProvider();';
                    }
                    if (useFeexpay) {
                        providerResolver += '\n    if (name == \'feexpay\') return FeexpayProvider();';
                    }
                    if (usePaydunya) {
                        providerResolver += '\n    if (name == \'paydunya\') return PaydunyaProvider();';
                    }
                    if (useStripe) {
                        providerResolver += '\n    if (name == \'stripe\') return StripeProvider();';
                    }
                    if (useSebpay) {
                        providerResolver += '\n    if (name == \'sebpay\') return SebpayProvider();';
                    }
                    providerResolver += `\n    throw Exception("Le fournisseur de paiement '\$providerName' n'est pas supporté.");`;
                    let payWidgetHelper = '';
                    if (useFedapay && ((useFeexpay && feexpayMode === 'proxy') || useStripe)) {
                        payWidgetHelper = `
  /// Widget de paiement unifié (FedaPay, FeexPay ou Stripe)
  static Widget payWidget({
    String? transactionToken,
    String? paymentUrl,
    required VoidCallback onPaymentSuccess,
    required VoidCallback onPaymentFailed,
  }) {
    if (transactionToken != null) {
      return PayWidget(
        transactionToken: transactionToken,
        onPaymentSuccess: onPaymentSuccess,
        onPaymentFailed: onPaymentFailed,
      );
    }
    if (paymentUrl != null) {
      return AshgateWebView(
        url: paymentUrl,
        onPaymentSuccess: onPaymentSuccess,
        onPaymentFailed: onPaymentFailed,
      );
    }
    return const SizedBox();
  }`;
                    }
                    else if (useFedapay) {
                        payWidgetHelper = `
  /// Widget de paiement unifié (FedaPay)
  static Widget payWidget({
    String? transactionToken,
    String? paymentUrl,
    required VoidCallback onPaymentSuccess,
    required VoidCallback onPaymentFailed,
  }) {
    if (transactionToken != null) {
      return PayWidget(
        transactionToken: transactionToken,
        onPaymentSuccess: onPaymentSuccess,
        onPaymentFailed: onPaymentFailed,
      );
    }
    return const SizedBox();
  }`;
                    }
                    else if ((useFeexpay && feexpayMode === 'proxy') || useStripe) {
                        payWidgetHelper = `
  /// Widget de paiement unifié (WebView)
  static Widget payWidget({
    String? transactionToken,
    String? paymentUrl,
    required VoidCallback onPaymentSuccess,
    required VoidCallback onPaymentFailed,
  }) {
    if (paymentUrl != null) {
      return AshgateWebView(
        url: paymentUrl,
        onPaymentSuccess: onPaymentSuccess,
        onPaymentFailed: onPaymentFailed,
      );
    }
    return const SizedBox();
  }`;
                    }
                    else {
                        payWidgetHelper = `
  /// Widget de paiement unifié (Non configuré pour ce mode)
  static Widget payWidget({
    String? transactionToken,
    String? paymentUrl,
    required VoidCallback onPaymentSuccess,
    required VoidCallback onPaymentFailed,
  }) {
    return const SizedBox();
  }`;
                    }
                    let showPaymentSheetHelper = '';
                    if ((useFeexpay && feexpayMode === 'proxy') || useStripe) {
                        showPaymentSheetHelper = `
  /// Affiche une boîte de dialogue bottom sheet avec un WebView pour n'importe quelle URL de paiement (ex: FeexPay)
  static Future<void> showPaymentSheet({
    required BuildContext context,
    required String paymentUrl,
    required VoidCallback onPaymentSuccess,
    required VoidCallback onPaymentFailed,
  }) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => Container(
        height: MediaQuery.of(sheetContext).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          child: Column(
            children: [
              AppBar(
                title: const Text('Paiement Sécurisé'),
                centerTitle: true,
                leading: IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () {
                    if (sheetContext.mounted) Navigator.pop(sheetContext);
                    onPaymentFailed();
                  },
                ),
                backgroundColor: Colors.white,
                elevation: 0.5,
              ),
              Expanded(
                child: AshgateWebView(
                  url: paymentUrl,
                  onPaymentSuccess: () {
                    if (sheetContext.mounted) Navigator.pop(sheetContext);
                    onPaymentSuccess();
                  },
                  onPaymentFailed: () {
                    if (sheetContext.mounted) Navigator.pop(sheetContext);
                    onPaymentFailed();
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }`;
                    }
                    else {
                        showPaymentSheetHelper = `
  /// Affiche une boîte de dialogue bottom sheet (Non configuré pour ce mode)
  static Future<void> showPaymentSheet({
    required BuildContext context,
    required String paymentUrl,
    required VoidCallback onPaymentSuccess,
    required VoidCallback onPaymentFailed,
  }) async {}
`;
                    }
                    let webviewClass = '';
                    if ((useFeexpay && feexpayMode === 'proxy') || useStripe) {
                        webviewClass = `
/// WebView personnalisé pour écouter la redirection de succès / échec d'Ash Gateway
class AshgateWebView extends StatefulWidget {
  final String url;
  final VoidCallback onPaymentSuccess;
  final VoidCallback onPaymentFailed;

  const AshgateWebView({
    super.key,
    required this.url,
    required this.onPaymentSuccess,
    required this.onPaymentFailed,
  });

  @override
  State<AshgateWebView> createState() => _AshgateWebViewState();
}

class _AshgateWebViewState extends State<AshgateWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _callbackCalled = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) setState(() => _isLoading = true);
          },
          onPageFinished: (_) {
            if (mounted) setState(() => _isLoading = false);
          },
          onUrlChange: (change) {
            if (_callbackCalled) return;
            if (change.url != null) {
              try {
                final uri = Uri.tryParse(change.url!);
                if (uri != null) {
                  final pathString = uri.path.toLowerCase();
                  bool isSuccess = pathString.contains('success');
                  bool isFailure = pathString.contains('failure') ||
                      pathString.contains('fail') ||
                      pathString.contains('cancel') ||
                      pathString.contains('error');

                  if (uri.hasQuery) {
                    final status = uri.queryParameters['status'];
                    final transaction = uri.queryParameters['transaction'];
                    if (status == 'success' || transaction == 'success') {
                      isSuccess = true;
                    }
                    if (status == 'failed') {
                      isFailure = true;
                    }
                  }

                  if (isSuccess) {
                    _callbackCalled = true;
                    widget.onPaymentSuccess();
                  } else if (isFailure) {
                    _callbackCalled = true;
                    widget.onPaymentFailed();
                  }
                }
              } catch (e) {
                // Avoid crashing on malformed query parameters
              }
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        WebViewWidget(controller: _controller),
        if (_isLoading)
          const Center(child: CircularProgressIndicator()),
      ],
    );
  }
}
`;
                    }
                    const bootstrapInitializer = useFedapay ? `
  /// Initialise la configuration globale d'Ashgate (FedaPay Cloud Proxy inclus)
  static void initialize() {
    FedaFlutter.applyCloudConfig(
      projectKey: AshgateConfig.projectKey,
      cloudUrl: AshgateConfig.cloudUrl,
      environment: AshgateConfig.environment,
    );
  }` : `
  /// Initialise la configuration globale d'Ashgate
  static void initialize() {
    // Aucune configuration de SDK client requise (mode FeexPay unique / API directe)
  }`;
                    const startPaymentHelper = `
  /// Lance la procédure de paiement de manière unifiée pour tous les modes et fournisseurs.
  static Future<AshgatePaymentResult> startPayment({
    required BuildContext context,
    required String provider,
    required AshgatePaymentRequest request,
    required VoidCallback onPaymentSuccess,
    required VoidCallback onPaymentFailed,
  }) async {
    final result = await AshgatePaymentService.instance.payWith(
      provider: provider,
      request: request,
    );

    if (!result.success) {
      onPaymentFailed();
      return result;
    }

    if (!context.mounted) return result;

    final name = provider.toLowerCase();
    if (name == 'fedapay') {
      if (result.token == null) {
        onPaymentFailed();
        return result;
      }
      await showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (sheetContext) => Container(
          height: MediaQuery.of(sheetContext).size.height * 0.8,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: payWidget(
            transactionToken: result.token,
            onPaymentSuccess: () {
              if (sheetContext.mounted) Navigator.pop(sheetContext);
              onPaymentSuccess();
            },
            onPaymentFailed: () {
              if (sheetContext.mounted) Navigator.pop(sheetContext);
              onPaymentFailed();
            },
          ),
        ),
      );
    } else if (name == 'feexpay' || name == 'stripe') {
      if (result.paymentUrl != null) {
        await showPaymentSheet(
          context: context,
          paymentUrl: result.paymentUrl!,
          onPaymentSuccess: onPaymentSuccess,
          onPaymentFailed: onPaymentFailed,
        );
      }
    }

    return result;
  }`;
                    const orchestratorContent = `// Généré automatiquement par ashgate init
${imports.join('\n')}

export 'ashgate_config.dart';
export 'ashgate_payment_provider.dart';

/// Service instanciable facilitant la gestion des paiements dans vos blocs/providers.
class AshgatePaymentService {
  static final AshgatePaymentService instance = AshgatePaymentService._internal();

  AshgatePaymentService._internal();

  /// Résout l'adaptateur de paiement correspondant
  AshgatePaymentProvider getProvider(String providerName) {${providerResolver}
  }

  /// Déclenche le paiement sur le provider de votre choix
  Future<AshgatePaymentResult> payWith({
    required String provider,
    required AshgatePaymentRequest request,
  }) async {
    return getProvider(provider).pay(request);
  }
}

/// Helper global d'initialisation et d'affichage des composants graphiques.
class AshgatePayment {${bootstrapInitializer}
${payWidgetHelper}
${showPaymentSheetHelper}
${startPaymentHelper}
}
${webviewClass}
`;
                    fs_1.default.writeFileSync(path_1.default.join(libDir, 'ashgate_payment.dart'), orchestratorContent);
                    console.log(chalk_1.default.green('✓ Fichier lib/ashgate_payment.dart généré.'));
                    // ÉTAPE D : Modifier automatiquement main.dart pour injecter l'initialisation ou l'exemple de démo
                    const mainDartPath = path_1.default.join(projectPath, 'lib/main.dart');
                    if (fs_1.default.existsSync(mainDartPath)) {
                        const generateDemo = await askQuestion('\nVoulez-vous remplacer lib/main.dart par un exemple de checkout complet et fonctionnel ? (y/n) [n] : ');
                        if (generateDemo.toLowerCase() === 'y' || generateDemo.toLowerCase() === 'yes') {
                            const mainDartDemoContent = `import 'ashgate_payment.dart';
import 'package:flutter/material.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  AshgatePayment.initialize();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ashgate Payment Demo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF6C63FF),
        scaffoldBackgroundColor: const Color(0xFF0F0F1E),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6C63FF),
          secondary: Color(0xFF3F3D56),
          surface: Color(0xFF1E1E2E),
        ),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Ashgate Checkout'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  final _formKey = GlobalKey<FormState>();
  final _firstnameController = TextEditingController(text: 'Alexis');
  final _lastnameController = TextEditingController(text: 'Ashborn');
  final _emailController = TextEditingController(text: 'contact@ashborn.com');
  final _phoneController = TextEditingController(text: '90000000');

  String _selectedProvider = 'fedapay'; // 'fedapay', 'feexpay', 'stripe'
  String _selectedOperator = 'mtn'; // 'mtn', 'moov', 'celtiis'
  bool _isProcessing = false;

  @override
  void dispose() {
    _firstnameController.dispose();
    _lastnameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _startCheckout() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isProcessing = true;
    });

    // Définir le montant et la devise selon le fournisseur
    double amount = _selectedProvider == 'stripe' ? 9.99 : 6500.0;
    // Si Stripe, le montant transmis doit être en centimes (subunit) : 999
    if (_selectedProvider == 'stripe') {
      amount = 999.0;
    }
    final currency = _selectedProvider == 'stripe' ? 'EUR' : 'XOF';

    final request = AshgatePaymentRequest(
      amount: amount,
      currency: currency,
      description: 'Abonnement Premium Ashgate',
      phoneNumber: _phoneController.text,
      country: 'bj',
      email: _emailController.text,
      firstname: _firstnameController.text,
      lastname: _lastnameController.text,
      paymentMethod: _selectedOperator,
      context: context,
    );

    try {
      final result = await AshgatePayment.startPayment(
        context: context,
        provider: _selectedProvider,
        request: request,
        onPaymentSuccess: () {
          _showStatusDialog(
            title: 'Paiement Réussi !',
            message: 'Votre abonnement Premium est maintenant activé.',
            isSuccess: true,
          );
        },
        onPaymentFailed: () {
          _showStatusDialog(
            title: 'Annulé ou Échoué',
            message: 'La transaction a été annulée ou a échoué.',
            isSuccess: false,
          );
        },
      );

      // Notification pour le mode direct USSD prompt de FedaPay (qui n'utilise pas de redirect automatique)
      if (result.success && _selectedProvider == 'fedapay') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Veuillez confirmer le prompt de paiement sur votre téléphone...'),
            backgroundColor: Colors.blueAccent,
          ),
        );
      }
    } catch (e) {
      _showStatusDialog(
        title: 'Erreur',
        message: e.toString(),
        isSuccess: false,
      );
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  void _showStatusDialog({
    required String title,
    required String message,
    required bool isSuccess,
  }) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E2E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(
              isSuccess ? Icons.check_circle_rounded : Icons.cancel_rounded,
              color: isSuccess ? Colors.green : Colors.red,
              size: 28,
            ),
            const SizedBox(width: 10),
            Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(message, style: const TextStyle(color: Color(0xFFC0C0D0), fontSize: 16)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK', style: TextStyle(color: Color(0xFF6C63FF), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isStripe = _selectedProvider == 'stripe';

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title, style: const TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: const Color(0xFF1E1E2E),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Récapitulatif d'Achat Premium
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF6C63FF), Color(0xFF3F3D56)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6C63FF).withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    )
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'PRODUIT SELECTIONNÉ',
                      style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Abonnement Premium (1 mois)',
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    Divider(color: Colors.white.withOpacity(0.2)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total à payer :', style: TextStyle(color: Colors.white70, fontSize: 16)),
                        Text(
                          isStripe ? '9.99 EUR' : '6 500 XOF',
                          style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Titre Sélection du Fournisseur
              const Text(
                'Moyen de paiement',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white70),
              ),
              const SizedBox(height: 12),

              // Boutons Fournisseurs (FedaPay, FeexPay, Stripe)
              Row(
                children: [
                  _buildProviderCard('fedapay', 'FedaPay', Icons.phone_android),
                  const SizedBox(width: 12),
                  _buildProviderCard('feexpay', 'FeexPay', Icons.payment),
                  const SizedBox(width: 12),
                  _buildProviderCard('stripe', 'Stripe', Icons.credit_card),
                ],
              ),
              const SizedBox(height: 24),

              // Champs Utilisateur
              _buildInputLabel('Prénom'),
              _buildTextField(_firstnameController, 'Prénom', Icons.person_outline),
              const SizedBox(height: 16),

              _buildInputLabel('Nom'),
              _buildTextField(_lastnameController, 'Nom', Icons.person),
              const SizedBox(height: 16),

              _buildInputLabel('Email'),
              _buildTextField(_emailController, 'Email', Icons.mail_outline, keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 16),

              // Champ Téléphone + Opérateur (Affichés uniquement pour FedaPay/FeexPay)
              if (!isStripe) ...[
                _buildInputLabel('Numéro de Téléphone'),
                _buildTextField(_phoneController, 'Téléphone', Icons.phone, keyboardType: TextInputType.phone),
                const SizedBox(height: 16),

                _buildInputLabel('Opérateur mobile'),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _buildOperatorCard('mtn', 'MTN'),
                    const SizedBox(width: 12),
                    _buildOperatorCard('moov', 'Moov'),
                    const SizedBox(width: 12),
                    _buildOperatorCard('celtiis', 'Celtiis'),
                  ],
                ),
                const SizedBox(height: 24),
              ],

              // Message d'information pour Stripe
              if (isStripe) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1E2E),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF6C63FF).withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: Color(0xFF6C63FF)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          "Vous allez être redirigé vers l'interface sécurisée de Stripe Checkout pour finaliser le paiement par carte bancaire.",
                          style: const TextStyle(color: Color(0xFFA0A0B0), fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Bouton d'action de paiement
              ElevatedButton(
                onPressed: _isProcessing ? null : _startCheckout,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6C63FF),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 5,
                ),
                child: _isProcessing
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                      )
                    : Text(
                        isStripe ? 'Payer 9.99 EUR avec Stripe' : 'Lancer le paiement Mobile Money',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.white70)),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String hint,
    IconData icon, {
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        prefixIcon: Icon(icon, color: const Color(0xFF6C63FF)),
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white24),
        filled: true,
        fillColor: const Color(0xFF1E1E2E),
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFF6C63FF), width: 2),
        ),
      ),
      validator: (value) => value == null || value.trim().isEmpty ? 'Ce champ est requis' : null,
    );
  }

  Widget _buildProviderCard(String provider, String title, IconData icon) {
    final isSelected = _selectedProvider == provider;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedProvider = provider;
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF6C63FF).withOpacity(0.15) : const Color(0xFF1E1E2E),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? const Color(0xFF6C63FF) : Colors.white10,
              width: 2,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? const Color(0xFF6C63FF) : Colors.white60, size: 28),
              const SizedBox(height: 8),
              Text(
                title,
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.white70,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOperatorCard(String operator, String label) {
    final isSelected = _selectedOperator == operator;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedOperator = operator;
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF6C63FF).withOpacity(0.1) : const Color(0xFF1E1E2E),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? const Color(0xFF6C63FF) : Colors.white12,
              width: 1.5,
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.white70,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
`;
                            fs_1.default.writeFileSync(mainDartPath, mainDartDemoContent);
                            console.log(chalk_1.default.green('✓ Fichier lib/main.dart remplacé par l\'exemple de checkout fonctionnel.'));
                        }
                        else {
                            let mainContent = fs_1.default.readFileSync(mainDartPath, 'utf8');
                            // 1. Ajouter l'import
                            if (!mainContent.includes('ashgate_payment.dart')) {
                                mainContent = `import 'ashgate_payment.dart';\n` + mainContent;
                            }
                            // 2. Injecter l'initialisation dans main()
                            if (!mainContent.includes('AshgatePayment.initialize()')) {
                                // Chercher void main() ou void main() async
                                const mainRegex = /void\s+main\s*\(\s*\)\s*(async\s*)?{/;
                                if (mainRegex.test(mainContent)) {
                                    mainContent = mainContent.replace(mainRegex, (match) => {
                                        return `${match}\n  WidgetsFlutterBinding.ensureInitialized();\n  AshgatePayment.initialize();`;
                                    });
                                }
                                else {
                                    // Cas flèche void main() => runApp(...)
                                    const arrowRegex = /void\s+main\s*\(\s*\)\s*=>\s*(runApp\([^)]+\));/;
                                    if (arrowRegex.test(mainContent)) {
                                        mainContent = mainContent.replace(arrowRegex, (match, runAppCall) => {
                                            return `void main() {\n  WidgetsFlutterBinding.ensureInitialized();\n  AshgatePayment.initialize();\n  ${runAppCall};\n}`;
                                        });
                                    }
                                }
                            }
                            fs_1.default.writeFileSync(mainDartPath, mainContent);
                            console.log(chalk_1.default.green('✓ Fichier lib/main.dart mis à jour avec l\'initialisation d\'Ashgate.'));
                        }
                    }
                }
                else if (detectedType === 'nuxt') {
                    // --- INTEGRATION NUXT 3 ---
                    const envPath = path_1.default.join(projectPath, '.env');
                    updateEnvFile(envPath, {
                        NUXT_PUBLIC_ASHGATE_API_URL: cloudUrl,
                        NUXT_PUBLIC_ASHGATE_PROJECT_KEY: projectKey,
                        NUXT_PUBLIC_ASHGATE_ENV: environment,
                    });
                    console.log(chalk_1.default.green('✓ Fichier .env mis à jour avec les variables NUXT_PUBLIC_ASHGATE.'));
                    // 1. Server Route Nitro : server/api/ashgate/checkout.post.ts
                    const serverApiDir = path_1.default.join(projectPath, 'server', 'api', 'ashgate');
                    if (!fs_1.default.existsSync(serverApiDir))
                        fs_1.default.mkdirSync(serverApiDir, { recursive: true });
                    const serverNitroContent = `export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();
  const apiUrl = config.public.ashgateApiUrl || '${cloudUrl}';
  const projectKey = config.public.ashgateProjectKey || '${projectKey}';

  const provider = (body.provider || 'fedapay').toLowerCase();

  // Routing intelligent par fournisseur
  // - feexpay  → POST /feexpay/payin        (route dédiée, payload spécifique)
  // - sebpay   → POST /sebpay/direct-payment (route dédiée)
  // - autres   → POST /payments/direct-payment (route universelle multi-gateway)
  let endpoint: string;
  let payload: Record<string, unknown>;

  if (provider === 'feexpay') {
    endpoint = \`\${apiUrl}/feexpay/payin\`;
    payload = {
      network: body.operator || body.payment_method || 'mtn',
      amount: body.amount,
      phoneNumber: body.phoneNumber || body.phone_number,
      fullname: [body.firstname, body.lastname].filter(Boolean).join(' ') || 'Client',
      email: body.email,
      description: body.description || 'Paiement Ashgate',
    };
  } else if (provider === 'sebpay') {
    endpoint = \`\${apiUrl}/sebpay/direct-payment\`;
    payload = {
      amount: body.amount,
      currency: body.currency || 'XOF',
      phoneNumber: body.phoneNumber || body.phone_number,
      email: body.email,
      firstname: body.firstname,
      lastname: body.lastname,
      description: body.description || 'Paiement Ashgate',
      callback_url: body.callbackUrl || body.callback_url,
    };
  } else {
    endpoint = \`\${apiUrl}/payments/direct-payment\`;
    payload = {
      provider,
      amount: body.amount,
      currency: body.currency || 'XOF',
      email: body.email,
      firstname: body.firstname,
      lastname: body.lastname,
      phone_number: body.phoneNumber || body.phone_number,
      payment_method: body.operator || body.payment_method || 'mtn',
      description: body.description || 'Paiement Ashgate',
      callback_url: body.callbackUrl || body.callback_url,
    };
  }

  try {
    const res = await $fetch(endpoint, {
      method: 'POST',
      headers: { 'x-feda-project-key': projectKey },
      body: payload,
    });
    return res;
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.message || 'Échec du paiement Ashgate',
    });
  }
});
`;
                    fs_1.default.writeFileSync(path_1.default.join(serverApiDir, 'checkout.post.ts'), serverNitroContent);
                    console.log(chalk_1.default.green('✓ Route serveur server/api/ashgate/checkout.post.ts générée.'));
                    const isTs = fs_1.default.existsSync(path_1.default.join(projectPath, 'tsconfig.json'));
                    const routeExt = isTs ? 'ts' : 'js';
                    const compExt = isTs ? 'ts' : 'js';
                    const serverNitroContentTs = `import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();

  const apiUrl = config.public.ashgateApiUrl || '${cloudUrl}';
  const projectKey = config.public.ashgateProjectKey || '${projectKey}';

  const provider = (body.provider || 'fedapay').toLowerCase();

  // Routing intelligent par fournisseur :
  // feexpay  → POST /feexpay/payin (route dédiée, payload spécifique)
  // sebpay   → POST /sebpay/direct-payment (route dédiée)
  // autres   → POST /payments/direct-payment (route universelle multi-gateway)
  let endpoint: string;
  let payload: Record<string, unknown>;

  if (provider === 'feexpay') {
    endpoint = \`\${apiUrl}/feexpay/payin\`;
    payload = {
      network: body.operator || body.payment_method || 'mtn',
      amount: body.amount,
      phoneNumber: body.phoneNumber || body.phone_number,
      fullname: [body.firstname, body.lastname].filter(Boolean).join(' ') || 'Client',
      email: body.email,
      description: body.description || 'Paiement Ashgate',
    };
  } else if (provider === 'sebpay') {
    endpoint = \`\${apiUrl}/sebpay/direct-payment\`;
    payload = {
      amount: body.amount,
      currency: body.currency || 'XOF',
      phoneNumber: body.phoneNumber || body.phone_number,
      email: body.email,
      firstname: body.firstname,
      lastname: body.lastname,
      description: body.description || 'Paiement Ashgate',
      callback_url: body.callbackUrl || body.callback_url,
    };
  } else {
    endpoint = \`\${apiUrl}/payments/direct-payment\`;
    payload = {
      provider,
      amount: body.amount,
      currency: body.currency || 'XOF',
      email: body.email,
      firstname: body.firstname,
      lastname: body.lastname,
      phone_number: body.phoneNumber || body.phone_number,
      payment_method: body.operator || body.payment_method || 'mtn',
      description: body.description || 'Paiement Ashgate',
      callback_url: body.callbackUrl || body.callback_url,
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-feda-project-key': projectKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw createError({ statusCode: res.status, statusMessage: data.message || 'Échec du paiement' });
    }
    return data;
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: err.message || 'Erreur interne' });
  }
});
`;
                    const serverNitroContentJs = `import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();

  const apiUrl = config.public.ashgateApiUrl || '${cloudUrl}';
  const projectKey = config.public.ashgateProjectKey || '${projectKey}';

  const provider = (body.provider || 'fedapay').toLowerCase();

  // Routing intelligent par fournisseur :
  // feexpay  → POST /feexpay/payin (route dédiée, payload spécifique)
  // sebpay   → POST /sebpay/direct-payment (route dédiée)
  // autres   → POST /payments/direct-payment (route universelle multi-gateway)
  let endpoint;
  let payload;

  if (provider === 'feexpay') {
    endpoint = \`\${apiUrl}/feexpay/payin\`;
    payload = {
      network: body.operator || body.payment_method || 'mtn',
      amount: body.amount,
      phoneNumber: body.phoneNumber || body.phone_number,
      fullname: [body.firstname, body.lastname].filter(Boolean).join(' ') || 'Client',
      email: body.email,
      description: body.description || 'Paiement Ashgate',
    };
  } else if (provider === 'sebpay') {
    endpoint = \`\${apiUrl}/sebpay/direct-payment\`;
    payload = {
      amount: body.amount,
      currency: body.currency || 'XOF',
      phoneNumber: body.phoneNumber || body.phone_number,
      email: body.email,
      firstname: body.firstname,
      lastname: body.lastname,
      description: body.description || 'Paiement Ashgate',
      callback_url: body.callbackUrl || body.callback_url,
    };
  } else {
    endpoint = \`\${apiUrl}/payments/direct-payment\`;
    payload = {
      provider,
      amount: body.amount,
      currency: body.currency || 'XOF',
      email: body.email,
      firstname: body.firstname,
      lastname: body.lastname,
      phone_number: body.phoneNumber || body.phone_number,
      payment_method: body.operator || body.payment_method || 'mtn',
      description: body.description || 'Paiement Ashgate',
      callback_url: body.callbackUrl || body.callback_url,
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-feda-project-key': projectKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw createError({ statusCode: res.status, statusMessage: data.message || 'Échec du paiement' });
    }
    return data;
  } catch (err) {
    throw createError({ statusCode: 500, statusMessage: err.message || 'Erreur interne' });
  }
});
`;
                    fs_1.default.writeFileSync(path_1.default.join(serverApiDir, `checkout.post.${routeExt}`), isTs ? serverNitroContentTs : serverNitroContentJs);
                    console.log(chalk_1.default.green(`✓ Route serveur server/api/ashgate/checkout.post.${routeExt} générée.`));
                    // 2. Composable Nuxt 3 : composables/useAshgatePayment
                    const composablesDir = path_1.default.join(projectPath, 'composables');
                    if (!fs_1.default.existsSync(composablesDir))
                        fs_1.default.mkdirSync(composablesDir, { recursive: true });
                    const composableContentTs = `export function useAshgatePayment() {
  const isProcessing = ref(false);
  const paymentUrl = ref<string | null>(null);
  const error = ref<string | null>(null);

  const initCheckout = async (params: {
    provider?: 'fedapay' | 'feexpay' | 'stripe' | 'pawapay' | 'paypal' | 'paydunya' | string;
    amount: number;
    currency?: string;
    email: string;
    firstname?: string;
    lastname?: string;
    phoneNumber?: string;
    operator?: 'mtn' | 'moov' | 'celtiis' | string;
    description?: string;
  }) => {
    isProcessing.value = true;
    error.value = null;
    paymentUrl.value = null;

    try {
      const res: any = await $fetch('/api/ashgate/checkout', {
        method: 'POST',
        body: params,
      });

      const url = res.url || res.payment_url;
      if (url) {
        paymentUrl.value = url;
      }
      return res;
    } catch (err: any) {
      error.value = err.statusMessage || err.message || 'Échec du paiement';
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    isProcessing,
    paymentUrl,
    error,
    initCheckout,
  };
}
`;
                    const composableContentJs = `export function useAshgatePayment() {
  const isProcessing = ref(false);
  const paymentUrl = ref(null);
  const error = ref(null);

  const initCheckout = async (params) => {
    isProcessing.value = true;
    error.value = null;
    paymentUrl.value = null;

    try {
      const res = await $fetch('/api/ashgate/checkout', {
        method: 'POST',
        body: params,
      });

      const url = res.url || res.payment_url;
      if (url) {
        paymentUrl.value = url;
      }
      return res;
    } catch (err) {
      error.value = err.statusMessage || err.message || 'Échec du paiement';
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    isProcessing,
    paymentUrl,
    error,
    initCheckout,
  };
}
`;
                    fs_1.default.writeFileSync(path_1.default.join(composablesDir, `useAshgatePayment.${compExt}`), isTs ? composableContentTs : composableContentJs);
                    console.log(chalk_1.default.green(`✓ Composable composables/useAshgatePayment.${compExt} généré.`));
                    // 3. Composant Vue 3 : components/AshgateCheckout.vue
                    const compDir = path_1.default.join(projectPath, 'components');
                    if (!fs_1.default.existsSync(compDir))
                        fs_1.default.mkdirSync(compDir, { recursive: true });
                    const vueContent = `<template>
  <div class="ashgate-checkout p-6 bg-slate-900 text-white rounded-xl shadow-xl max-w-lg mx-auto border border-slate-800">
    <h2 class="text-xl font-bold mb-4 text-center">Paiement Sécurisé Ashgate</h2>

    <form @submit.prevent="handlePay" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1 text-slate-300">Fournisseur</label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            v-for="p in ['fedapay', 'feexpay', 'sebpay', 'stripe', 'pawapay', 'paypal', 'paydunya']"
            :key="p"
            @click="form.provider = p"
            :class="[
              'py-2 px-2.5 text-xs font-semibold rounded-lg border transition uppercase text-center',
              form.provider === p
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
            ]"
          >
            {{ p }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2" v-if="!props.customer?.firstname || !props.customer?.lastname">
        <div>
          <label class="block text-sm font-medium mb-1 text-slate-300">Prénom</label>
          <input
            v-model="form.firstname"
            type="text"
            placeholder="Prénom"
            required
            class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-slate-300">Nom</label>
          <input
            v-model="form.lastname"
            type="text"
            placeholder="Nom"
            required
            class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1 text-slate-300">Email</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="client@example.com"
          required
          class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div v-if="['fedapay', 'feexpay', 'pawapay', 'sebpay'].includes(form.provider)" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 text-slate-300">Téléphone Mobile Money</label>
          <input
            v-model="form.phoneNumber"
            type="tel"
            placeholder="ex: 90000000"
            required
            class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-slate-300">Opérateur Mobile Money</label>
          <select
            v-model="form.operator"
            class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="mtn">MTN Mobile Money</option>
            <option value="moov">Moov Money</option>
            <option value="celtiis">Celtiis Cash</option>
            <option value="orange">Orange Money</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1 text-slate-300">Montant ({{ form.currency }})</label>
        <input
          v-model.number="form.amount"
          type="number"
          required
          class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <button
        type="submit"
        :disabled="isProcessing"
        class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg transition"
      >
        <span v-if="isProcessing">Traitement en cours...</span>
        <span v-else>Payer {{ form.amount }} {{ form.currency }}</span>
      </button>

      <p v-if="error" class="text-red-400 text-sm text-center mt-2">{{ error }}</p>
    </form>

    <div v-if="paymentUrl" class="mt-6 border-t border-slate-800 pt-4">
      <iframe :src="paymentUrl" class="w-full h-[500px] border-0 rounded-lg shadow" allow="payment"></iframe>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
  amount: { type: Number, default: 5000 },
  currency: { type: String, default: 'XOF' },
  description: { type: String, default: 'Paiement Sécurisé Ashgate' },
  customer: {
    type: Object,
    default: () => ({ firstname: '', lastname: '', email: '', phone: '' }),
  },
});

const form = reactive({
  provider: 'fedapay',
  amount: props.amount,
  currency: props.currency,
  email: props.customer?.email || '',
  firstname: props.customer?.firstname || '',
  lastname: props.customer?.lastname || '',
  phoneNumber: props.customer?.phone || '',
  operator: 'mtn',
  description: props.description,
});

const { isProcessing, paymentUrl, error, initCheckout } = useAshgatePayment();

const handlePay = async () => {
  try {
    await initCheckout(form);
  } catch (e) {
    console.error('Erreur checkout:', e);
  }
};
</script>
`;
                    fs_1.default.writeFileSync(path_1.default.join(compDir, 'AshgateCheckout.vue'), vueContent);
                    console.log(chalk_1.default.green('✓ Composant components/AshgateCheckout.vue généré.'));
                }
                else if (detectedType === 'vue') {
                    // --- INTEGRATION VUE 3 ---
                    const envPath = path_1.default.join(projectPath, '.env');
                    updateEnvFile(envPath, {
                        VITE_ASHGATE_API_URL: cloudUrl,
                        VITE_ASHGATE_PROJECT_KEY: projectKey,
                        VITE_ASHGATE_ENV: environment,
                    });
                    console.log(chalk_1.default.green('✓ Fichier .env mis à jour avec les variables VITE_ASHGATE.'));
                    const srcDir = path_1.default.join(projectPath, 'src');
                    const compDir = path_1.default.join(srcDir, 'components');
                    const composablesDir = path_1.default.join(srcDir, 'composables');
                    if (!fs_1.default.existsSync(compDir))
                        fs_1.default.mkdirSync(compDir, { recursive: true });
                    if (!fs_1.default.existsSync(composablesDir))
                        fs_1.default.mkdirSync(composablesDir, { recursive: true });
                    const isTs = fs_1.default.existsSync(path_1.default.join(projectPath, 'tsconfig.json')) || fs_1.default.existsSync(path_1.default.join(projectPath, 'tsconfig.app.json'));
                    const composableVueTs = `import { ref } from 'vue';

export interface CheckoutParams {
  provider?: string;
  amount: number;
  currency?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
  description?: string;
  operator?: string;
  callbackUrl?: string;
}

export function useAshgatePayment() {
  const isProcessing = ref<boolean>(false);
  const paymentUrl = ref<string | null>(null);
  const error = ref<string | null>(null);

  const initCheckout = async (params: CheckoutParams) => {
    isProcessing.value = true;
    error.value = null;
    paymentUrl.value = null;

    const apiUrl = import.meta.env.VITE_ASHGATE_API_URL || '${cloudUrl}';
    const projectKey = import.meta.env.VITE_ASHGATE_PROJECT_KEY || '${projectKey}';
    const provider = (params.provider || 'fedapay').toLowerCase();

    // Routing intelligent par fournisseur :
    // feexpay  → POST /feexpay/payin (route dédiée, payload spécifique)
    // sebpay   → POST /sebpay/direct-payment (route dédiée)
    // autres   → POST /payments/direct-payment (route universelle multi-gateway)
    let endpoint: string;
    let payload: Record<string, unknown>;

    if (provider === 'feexpay') {
      endpoint = \`\${apiUrl}/feexpay/payin\`;
      payload = {
        network: params.operator || 'mtn',
        amount: params.amount,
        phoneNumber: params.phoneNumber,
        fullname: [params.firstname, params.lastname].filter(Boolean).join(' ') || 'Client',
        email: params.email,
        description: params.description || 'Paiement Ashgate',
      };
    } else if (provider === 'sebpay') {
      endpoint = \`\${apiUrl}/sebpay/direct-payment\`;
      payload = {
        amount: params.amount,
        currency: params.currency || 'XOF',
        phoneNumber: params.phoneNumber,
        email: params.email,
        firstname: params.firstname,
        lastname: params.lastname,
        description: params.description || 'Paiement Ashgate',
        callback_url: params.callbackUrl,
      };
    } else {
      endpoint = \`\${apiUrl}/payments/direct-payment\`;
      payload = {
        provider,
        amount: params.amount,
        currency: params.currency || 'XOF',
        email: params.email,
        firstname: params.firstname,
        lastname: params.lastname,
        phone_number: params.phoneNumber,
        payment_method: params.operator || 'mtn',
        description: params.description || 'Paiement Ashgate',
        callback_url: params.callbackUrl,
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-feda-project-key': projectKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Echec de l\'initialisation');

      const url = data.url || data.payment_url;
      if (url) paymentUrl.value = url;
      return data;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du paiement';
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  return { isProcessing, paymentUrl, error, initCheckout };
}
`;
                    const composableVueJs = `import { ref } from 'vue';

export function useAshgatePayment() {
  const isProcessing = ref(false);
  const paymentUrl = ref(null);
  const error = ref(null);

  const initCheckout = async (params) => {
    isProcessing.value = true;
    error.value = null;
    paymentUrl.value = null;

    const apiUrl = import.meta.env.VITE_ASHGATE_API_URL || '${cloudUrl}';
    const projectKey = import.meta.env.VITE_ASHGATE_PROJECT_KEY || '${projectKey}';
    const provider = (params.provider || 'fedapay').toLowerCase();

    // Routing intelligent par fournisseur :
    // feexpay  → POST /feexpay/payin (route dédiée, payload spécifique)
    // sebpay   → POST /sebpay/direct-payment (route dédiée)
    // autres   → POST /payments/direct-payment (route universelle multi-gateway)
    let endpoint;
    let payload;

    if (provider === 'feexpay') {
      endpoint = \`\${apiUrl}/feexpay/payin\`;
      payload = {
        network: params.operator || 'mtn',
        amount: params.amount,
        phoneNumber: params.phoneNumber,
        fullname: [params.firstname, params.lastname].filter(Boolean).join(' ') || 'Client',
        email: params.email,
        description: params.description || 'Paiement Ashgate',
      };
    } else if (provider === 'sebpay') {
      endpoint = \`\${apiUrl}/sebpay/direct-payment\`;
      payload = {
        amount: params.amount,
        currency: params.currency || 'XOF',
        phoneNumber: params.phoneNumber,
        email: params.email,
        firstname: params.firstname,
        lastname: params.lastname,
        description: params.description || 'Paiement Ashgate',
        callback_url: params.callbackUrl,
      };
    } else {
      endpoint = \`\${apiUrl}/payments/direct-payment\`;
      payload = {
        provider,
        amount: params.amount,
        currency: params.currency || 'XOF',
        email: params.email,
        firstname: params.firstname,
        lastname: params.lastname,
        phone_number: params.phoneNumber,
        payment_method: params.operator || 'mtn',
        description: params.description || 'Paiement Ashgate',
        callback_url: params.callbackUrl,
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-feda-project-key': projectKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Echec de l\'initialisation');

      const url = data.url || data.payment_url;
      if (url) paymentUrl.value = url;
      return data;
    } catch (err) {
      error.value = err.message || 'Erreur lors du paiement';
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  return { isProcessing, paymentUrl, error, initCheckout };
}
`;
                    const fileName = isTs ? 'useAshgatePayment.ts' : 'useAshgatePayment.js';
                    fs_1.default.writeFileSync(path_1.default.join(composablesDir, fileName), isTs ? composableVueTs : composableVueJs);
                    console.log(chalk_1.default.green(`✓ Composable src/composables/${fileName} généré.`));
                }
                else if (detectedType === 'next') {
                    // --- INTEGRATION NEXT.JS ---
                    const isTs = fs_1.default.existsSync(path_1.default.join(projectPath, 'tsconfig.json'));
                    const routeExt = isTs ? 'ts' : 'js';
                    const hookExt = isTs ? 'ts' : 'js';
                    const compExt = isTs ? 'tsx' : 'jsx';
                    const envPath = path_1.default.join(projectPath, '.env');
                    updateEnvFile(envPath, {
                        NEXT_PUBLIC_ASHGATE_API_URL: cloudUrl,
                        NEXT_PUBLIC_ASHGATE_PROJECT_KEY: projectKey,
                        NEXT_PUBLIC_ASHGATE_ENV: environment,
                    });
                    console.log(chalk_1.default.green('✓ Fichier .env mis à jour avec NEXT_PUBLIC_ASHGATE.'));
                    // 1. App Router API Route : app/api/ashgate/checkout/route
                    const appApiDir = path_1.default.join(projectPath, 'app', 'api', 'ashgate', 'checkout');
                    if (!fs_1.default.existsSync(appApiDir))
                        fs_1.default.mkdirSync(appApiDir, { recursive: true });
                    const nextRouteContentTs = `import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_ASHGATE_API_URL || '${cloudUrl}';
    const projectKey = process.env.NEXT_PUBLIC_ASHGATE_PROJECT_KEY || '${projectKey}';

    const provider = (body.provider || 'fedapay').toLowerCase();

    // Routing intelligent par fournisseur :
    // feexpay  → POST /feexpay/payin (route dédiée, payload spécifique)
    // sebpay   → POST /sebpay/direct-payment (route dédiée)
    // autres   → POST /payments/direct-payment (route universelle multi-gateway)
    let endpoint: string;
    let payload: Record<string, unknown>;

    if (provider === 'feexpay') {
      endpoint = \`\${apiUrl}/feexpay/payin\`;
      payload = {
        network: body.operator || body.payment_method || 'mtn',
        amount: body.amount,
        phoneNumber: body.phoneNumber || body.phone_number,
        fullname: [body.firstname, body.lastname].filter(Boolean).join(' ') || 'Client',
        email: body.email,
        description: body.description || 'Paiement Ashgate',
      };
    } else if (provider === 'sebpay') {
      endpoint = \`\${apiUrl}/sebpay/direct-payment\`;
      payload = {
        amount: body.amount,
        currency: body.currency || 'XOF',
        phoneNumber: body.phoneNumber || body.phone_number,
        email: body.email,
        firstname: body.firstname,
        lastname: body.lastname,
        description: body.description || 'Paiement Ashgate',
        callback_url: body.callbackUrl || body.callback_url,
      };
    } else {
      endpoint = \`\${apiUrl}/payments/direct-payment\`;
      payload = {
        provider,
        amount: body.amount,
        currency: body.currency || 'XOF',
        email: body.email,
        firstname: body.firstname,
        lastname: body.lastname,
        phone_number: body.phoneNumber || body.phone_number,
        payment_method: body.operator || body.payment_method || 'mtn',
        description: body.description || 'Paiement Ashgate',
        callback_url: body.callbackUrl || body.callback_url,
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-feda-project-key': projectKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Echec du paiement' }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur Interne' }, { status: 500 });
  }
}
`;
                    const nextRouteContentJs = `import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_ASHGATE_API_URL || '${cloudUrl}';
    const projectKey = process.env.NEXT_PUBLIC_ASHGATE_PROJECT_KEY || '${projectKey}';

    const provider = (body.provider || 'fedapay').toLowerCase();

    // Routing intelligent par fournisseur :
    // feexpay  → POST /feexpay/payin (route dédiée, payload spécifique)
    // sebpay   → POST /sebpay/direct-payment (route dédiée)
    // autres   → POST /payments/direct-payment (route universelle multi-gateway)
    let endpoint;
    let payload;

    if (provider === 'feexpay') {
      endpoint = \`\${apiUrl}/feexpay/payin\`;
      payload = {
        network: body.operator || body.payment_method || 'mtn',
        amount: body.amount,
        phoneNumber: body.phoneNumber || body.phone_number,
        fullname: [body.firstname, body.lastname].filter(Boolean).join(' ') || 'Client',
        email: body.email,
        description: body.description || 'Paiement Ashgate',
      };
    } else if (provider === 'sebpay') {
      endpoint = \`\${apiUrl}/sebpay/direct-payment\`;
      payload = {
        amount: body.amount,
        currency: body.currency || 'XOF',
        phoneNumber: body.phoneNumber || body.phone_number,
        email: body.email,
        firstname: body.firstname,
        lastname: body.lastname,
        description: body.description || 'Paiement Ashgate',
        callback_url: body.callbackUrl || body.callback_url,
      };
    } else {
      endpoint = \`\${apiUrl}/payments/direct-payment\`;
      payload = {
        provider,
        amount: body.amount,
        currency: body.currency || 'XOF',
        email: body.email,
        firstname: body.firstname,
        lastname: body.lastname,
        phone_number: body.phoneNumber || body.phone_number,
        payment_method: body.operator || body.payment_method || 'mtn',
        description: body.description || 'Paiement Ashgate',
        callback_url: body.callbackUrl || body.callback_url,
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-feda-project-key': projectKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Echec du paiement' }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur Interne' }, { status: 500 });
  }
}
`;
                    fs_1.default.writeFileSync(path_1.default.join(appApiDir, `route.${routeExt}`), isTs ? nextRouteContentTs : nextRouteContentJs);
                    console.log(chalk_1.default.green(`✓ Next.js App Router Route app/api/ashgate/checkout/route.${routeExt} générée.`));
                    // 2. React Hook : hooks/useAshgatePayment
                    const hooksDir = path_1.default.join(projectPath, 'hooks');
                    if (!fs_1.default.existsSync(hooksDir))
                        fs_1.default.mkdirSync(hooksDir, { recursive: true });
                    const hookContentTs = `import { useState } from 'react';

export function useAshgatePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initCheckout = async (params: {
    provider?: 'fedapay' | 'feexpay' | 'stripe' | 'pawapay' | 'paypal' | 'paydunya' | string;
    amount: number;
    currency?: string;
    email: string;
    firstname?: string;
    lastname?: string;
    phoneNumber?: string;
    operator?: string;
    description?: string;
  }) => {
    setIsProcessing(true);
    setError(null);
    setPaymentUrl(null);

    try {
      const res = await fetch('/api/ashgate/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec du paiement');

      const url = data.url || data.payment_url;
      if (url) setPaymentUrl(url);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, paymentUrl, error, initCheckout };
}
`;
                    const hookContentJs = `import { useState } from 'react';

export function useAshgatePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [error, setError] = useState(null);

  const initCheckout = async (params) => {
    setIsProcessing(true);
    setError(null);
    setPaymentUrl(null);

    try {
      const res = await fetch('/api/ashgate/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec du paiement');

      const url = data.url || data.payment_url;
      if (url) setPaymentUrl(url);
      return data;
    } catch (err) {
      setError(err.message || 'Erreur lors du paiement');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, paymentUrl, error, initCheckout };
}
`;
                    fs_1.default.writeFileSync(path_1.default.join(hooksDir, `useAshgatePayment.${hookExt}`), isTs ? hookContentTs : hookContentJs);
                    console.log(chalk_1.default.green(`✓ React Hook hooks/useAshgatePayment.${hookExt} généré.`));
                    // 3. React Component : components/AshgateCheckout
                    const compDir = path_1.default.join(projectPath, 'components');
                    if (!fs_1.default.existsSync(compDir))
                        fs_1.default.mkdirSync(compDir, { recursive: true });
                    const reactNextComponentTs = `'use client';

import React, { useState } from 'react';
import { useAshgatePayment } from '../hooks/useAshgatePayment';

interface AshgateCheckoutProps {
  amount?: number;
  currency?: string;
  description?: string;
  customer?: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
  };
}

export default function AshgateCheckout({
  amount = 5000,
  currency = 'XOF',
  description = 'Paiement Sécurisé Ashgate',
  customer = {},
}: AshgateCheckoutProps) {
  const [provider, setProvider] = useState<'fedapay' | 'feexpay' | 'sebpay' | 'stripe' | 'pawapay' | 'paypal' | 'paydunya'>('fedapay');
  const [firstname, setFirstname] = useState(customer.firstname || '');
  const [lastname, setLastname] = useState(customer.lastname || '');
  const [email, setEmail] = useState(customer.email || '');
  const [phoneNumber, setPhoneNumber] = useState(customer.phone || '');
  const [operator, setOperator] = useState('mtn');

  const { isProcessing, paymentUrl, error, initCheckout } = useAshgatePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await initCheckout({
        provider,
        amount,
        currency,
        firstname,
        lastname,
        email,
        phoneNumber,
        operator,
        description,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const providers = ['fedapay', 'feexpay', 'sebpay', 'stripe', 'pawapay', 'paypal', 'paydunya'] as const;

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto', padding: '1.5rem', background: '#0F172A', color: '#FFF', borderRadius: '12px', fontFamily: 'sans-serif', border: '1px solid #1E293B' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>Paiement Sécurisé Ashgate</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Fournisseur</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: '0.5rem' }}>
            {providers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                style={{
                  padding: '0.5rem 0.25rem',
                  borderRadius: '6px',
                  border: '1px solid ' + (provider === p ? '#6366F1' : '#334155'),
                  background: provider === p ? '#4F46E5' : '#1E293B',
                  color: '#FFF',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {(!customer.firstname || !customer.lastname) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Prénom</label>
              <input
                type="text"
                placeholder="Prénom"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Nom</label>
              <input
                type="text"
                placeholder="Nom"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
              />
            </div>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Email</label>
          <input
            type="email"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
          />
        </div>

        {['fedapay', 'feexpay', 'pawapay', 'sebpay'].includes(provider) && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Téléphone Mobile Money</label>
              <input
                type="tel"
                placeholder="ex: 90000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Opérateur Mobile Money</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
              >
                <option value="mtn">MTN Mobile Money</option>
                <option value="moov">Moov Money</option>
                <option value="celtiis">Celtiis Cash</option>
                <option value="orange">Orange Money</option>
              </select>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isProcessing}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#4F46E5', color: '#FFF', fontWeight: 'bold', cursor: 'pointer', opacity: isProcessing ? 0.6 : 1 }}
        >
          {isProcessing ? 'Traitement en cours...' : \`Payer \${amount} \${currency}\`}
        </button>

        {error && <p style={{ color: '#EF4444', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}
      </form>

      {paymentUrl && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
          <iframe src={paymentUrl} style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }} allow="payment" />
        </div>
      )}
    </div>
  );
}
`;
                    const reactNextComponentJs = `'use client';

import React, { useState } from 'react';
import { useAshgatePayment } from '../hooks/useAshgatePayment';

export default function AshgateCheckout({
  amount = 5000,
  currency = 'XOF',
  description = 'Paiement Sécurisé Ashgate',
  customer = {},
}) {
  const [provider, setProvider] = useState('fedapay');
  const [firstname, setFirstname] = useState(customer.firstname || '');
  const [lastname, setLastname] = useState(customer.lastname || '');
  const [email, setEmail] = useState(customer.email || '');
  const [phoneNumber, setPhoneNumber] = useState(customer.phone || '');
  const [operator, setOperator] = useState('mtn');

  const { isProcessing, paymentUrl, error, initCheckout } = useAshgatePayment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await initCheckout({
        provider,
        amount,
        currency,
        firstname,
        lastname,
        email,
        phoneNumber,
        operator,
        description,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const providers = ['fedapay', 'feexpay', 'sebpay', 'stripe', 'pawapay', 'paypal', 'paydunya'];

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto', padding: '1.5rem', background: '#0F172A', color: '#FFF', borderRadius: '12px', fontFamily: 'sans-serif', border: '1px solid #1E293B' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>Paiement Sécurisé Ashgate</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Fournisseur</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: '0.5rem' }}>
            {providers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                style={{
                  padding: '0.5rem 0.25rem',
                  borderRadius: '6px',
                  border: '1px solid ' + (provider === p ? '#6366F1' : '#334155'),
                  background: provider === p ? '#4F46E5' : '#1E293B',
                  color: '#FFF',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {(!customer.firstname || !customer.lastname) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Prénom</label>
              <input
                type="text"
                placeholder="Prénom"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Nom</label>
              <input
                type="text"
                placeholder="Nom"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
              />
            </div>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Email</label>
          <input
            type="email"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
          />
        </div>

        {['fedapay', 'feexpay', 'pawapay', 'sebpay'].includes(provider) && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Téléphone Mobile Money</label>
              <input
                type="tel"
                placeholder="ex: 90000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Opérateur Mobile Money</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
              >
                <option value="mtn">MTN Mobile Money</option>
                <option value="moov">Moov Money</option>
                <option value="celtiis">Celtiis Cash</option>
                <option value="orange">Orange Money</option>
              </select>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isProcessing}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#4F46E5', color: '#FFF', fontWeight: 'bold', cursor: 'pointer', opacity: isProcessing ? 0.6 : 1 }}
        >
          {isProcessing ? 'Traitement en cours...' : \`Payer \${amount} \${currency}\`}
        </button>

        {error && <p style={{ color: '#EF4444', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}
      </form>

      {paymentUrl && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
          <iframe src={paymentUrl} style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }} allow="payment" />
        </div>
      )}
    </div>
  );
}
`;
                    fs_1.default.writeFileSync(path_1.default.join(compDir, `AshgateCheckout.${compExt}`), isTs ? reactNextComponentTs : reactNextComponentJs);
                    console.log(chalk_1.default.green(`✓ Composant React components/AshgateCheckout.${compExt} généré.`));
                }
                else if (detectedType === 'react') {
                    // --- INTEGRATION REACT SPA ---
                    const isTs = fs_1.default.existsSync(path_1.default.join(projectPath, 'tsconfig.json'));
                    const hookExt = isTs ? 'ts' : 'js';
                    const envPath = path_1.default.join(projectPath, '.env');
                    updateEnvFile(envPath, {
                        VITE_ASHGATE_API_URL: cloudUrl,
                        VITE_ASHGATE_PROJECT_KEY: projectKey,
                        VITE_ASHGATE_ENV: environment,
                    });
                    console.log(chalk_1.default.green('✓ Fichier .env mis à jour avec VITE_ASHGATE.'));
                    const srcDir = path_1.default.join(projectPath, 'src');
                    const compDir = path_1.default.join(srcDir, 'components');
                    const hooksDir = path_1.default.join(srcDir, 'hooks');
                    if (!fs_1.default.existsSync(compDir))
                        fs_1.default.mkdirSync(compDir, { recursive: true });
                    if (!fs_1.default.existsSync(hooksDir))
                        fs_1.default.mkdirSync(hooksDir, { recursive: true });
                    const reactHookContentTs = `import { useState } from 'react';

interface CheckoutParams {
  provider?: string;
  amount: number;
  currency?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
  operator?: string;
  description?: string;
  callbackUrl?: string;
}

export function useAshgatePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initCheckout = async (params: CheckoutParams) => {
    setIsProcessing(true);
    setError(null);
    setPaymentUrl(null);

    const apiUrl = import.meta.env.VITE_ASHGATE_API_URL || '${cloudUrl}';
    const projectKey = import.meta.env.VITE_ASHGATE_PROJECT_KEY || '${projectKey}';
    const provider = (params.provider || 'fedapay').toLowerCase();

    // Routing intelligent par fournisseur :
    // feexpay  → POST /feexpay/payin (route dédiée, payload spécifique)
    // sebpay   → POST /sebpay/direct-payment (route dédiée)
    // autres   → POST /payments/direct-payment (route universelle multi-gateway)
    let endpoint: string;
    let payload: Record<string, unknown>;

    if (provider === 'feexpay') {
      endpoint = \`\${apiUrl}/feexpay/payin\`;
      payload = {
        network: params.operator || 'mtn',
        amount: params.amount,
        phoneNumber: params.phoneNumber,
        fullname: [params.firstname, params.lastname].filter(Boolean).join(' ') || 'Client',
        email: params.email,
        description: params.description || 'Paiement Ashgate',
      };
    } else if (provider === 'sebpay') {
      endpoint = \`\${apiUrl}/sebpay/direct-payment\`;
      payload = {
        amount: params.amount,
        currency: params.currency || 'XOF',
        phoneNumber: params.phoneNumber,
        email: params.email,
        firstname: params.firstname,
        lastname: params.lastname,
        description: params.description || 'Paiement Ashgate',
        callback_url: params.callbackUrl,
      };
    } else {
      endpoint = \`\${apiUrl}/payments/direct-payment\`;
      payload = {
        provider,
        amount: params.amount,
        currency: params.currency || 'XOF',
        email: params.email,
        firstname: params.firstname,
        lastname: params.lastname,
        phone_number: params.phoneNumber,
        payment_method: params.operator || 'mtn',
        description: params.description || 'Paiement Ashgate',
        callback_url: params.callbackUrl,
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-feda-project-key': projectKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Echec du paiement');

      const url = data.url || data.payment_url;
      if (url) setPaymentUrl(url);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, paymentUrl, error, initCheckout };
}
`;
                    const reactHookContentJs = `import { useState } from 'react';

export function useAshgatePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [error, setError] = useState(null);

  const initCheckout = async (params) => {
    setIsProcessing(true);
    setError(null);
    setPaymentUrl(null);

    const apiUrl = import.meta.env.VITE_ASHGATE_API_URL || '${cloudUrl}';
    const projectKey = import.meta.env.VITE_ASHGATE_PROJECT_KEY || '${projectKey}';
    const provider = (params.provider || 'fedapay').toLowerCase();

    // Routing intelligent par fournisseur :
    // feexpay  → POST /feexpay/payin (route dédiée, payload spécifique)
    // sebpay   → POST /sebpay/direct-payment (route dédiée)
    // autres   → POST /payments/direct-payment (route universelle multi-gateway)
    let endpoint;
    let payload;

    if (provider === 'feexpay') {
      endpoint = \`\${apiUrl}/feexpay/payin\`;
      payload = {
        network: params.operator || 'mtn',
        amount: params.amount,
        phoneNumber: params.phoneNumber,
        fullname: [params.firstname, params.lastname].filter(Boolean).join(' ') || 'Client',
        email: params.email,
        description: params.description || 'Paiement Ashgate',
      };
    } else if (provider === 'sebpay') {
      endpoint = \`\${apiUrl}/sebpay/direct-payment\`;
      payload = {
        amount: params.amount,
        currency: params.currency || 'XOF',
        phoneNumber: params.phoneNumber,
        email: params.email,
        firstname: params.firstname,
        lastname: params.lastname,
        description: params.description || 'Paiement Ashgate',
        callback_url: params.callbackUrl,
      };
    } else {
      endpoint = \`\${apiUrl}/payments/direct-payment\`;
      payload = {
        provider,
        amount: params.amount,
        currency: params.currency || 'XOF',
        email: params.email,
        firstname: params.firstname,
        lastname: params.lastname,
        phone_number: params.phoneNumber,
        payment_method: params.operator || 'mtn',
        description: params.description || 'Paiement Ashgate',
        callback_url: params.callbackUrl,
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-feda-project-key': projectKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Echec du paiement');

      const url = data.url || data.payment_url;
      if (url) setPaymentUrl(url);
      return data;
    } catch (err) {
      setError(err.message || 'Erreur lors du paiement');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, paymentUrl, error, initCheckout };
}
`;
                    fs_1.default.writeFileSync(path_1.default.join(hooksDir, `useAshgatePayment.${hookExt}`), isTs ? reactHookContentTs : reactHookContentJs);
                    console.log(chalk_1.default.green(`✓ React Hook src/hooks/useAshgatePayment.${hookExt} généré.`));
                }
                else {
                    console.log(chalk_1.default.yellow(`\nℹ Génération des templates non supportée pour le type : ${detectedType}.`));
                }
                console.log(chalk_1.default.bold.green('\n🎉 Projet configuré avec succès !'));
                console.log('Vous pouvez maintenant importer le composant ou helper généré pour accepter les paiements.');
            }
            catch (err) {
                console.error(chalk_1.default.red('\n✗ Erreur d\'écriture de la configuration :'), err.message);
                process.exit(1);
            }
        }
        finally {
            closeReadlineInterface();
        }
    });
}
