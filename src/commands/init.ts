import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { execSync } from 'child_process';
import { apiClient } from '../api/client';
import { walletConfig } from '../config/config';
import { loginWithKeycloak } from '../auth/keycloak';


let rlInstance: any = null;
function getReadlineInterface() {
    if (!rlInstance) {
        rlInstance = readline.createInterface({ input, output });
    }
    return rlInstance;
}

async function askQuestion(query: string): Promise<string> {
    const rl = getReadlineInterface();
    const answer = await rl.question(query);
    return answer.trim();
}

export function closeReadlineInterface(): void {
    if (rlInstance) {
        rlInstance.close();
        rlInstance = null;
    }
}

export function registerInitCommands(program: Command): void {
    program
        .command('init')
        .description('Détecter le projet local, configurer les clés et installer les composants de paiement')
        .action(async () => {
            try {
                console.log(chalk.bold.cyan('\nInitialisation d\'Ash Gateway dans votre projet local...'));

            const cwd = process.cwd();
            let detectedType: 'flutter' | 'nuxt' | 'vue' | 'next' | 'react' | 'express' | 'rails' | null = null;
            let projectPath = cwd;

            // 1. DÉTECTION DU PROJET
            if (fs.existsSync(path.join(cwd, 'pubspec.yaml'))) {
                detectedType = 'flutter';
            } else if (fs.existsSync(path.join(cwd, 'Gemfile'))) {
                detectedType = 'rails';
            } else if (fs.existsSync(path.join(cwd, 'package.json'))) {
                try {
                    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
                    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                    if (deps.nuxt) {
                        detectedType = 'nuxt';
                    } else if (deps.next) {
                        detectedType = 'next';
                    } else if (deps.vue) {
                        detectedType = 'vue';
                    } else if (deps.react) {
                        detectedType = 'react';
                    } else if (deps.express) {
                        detectedType = 'express';
                    }
                } catch {
                    // ignore JSON parse errors
                }
            }

            // Si rien n'est détecté dans le dossier courant, chercher des indices ou demander
            if (!detectedType) {
                console.log(chalk.yellow('\nAucun projet compatible détecté directement dans le dossier actuel.'));
                const searchDirs = fs.readdirSync(cwd).filter(f => fs.statSync(path.join(cwd, f)).isDirectory());
                
                // Chercher dans les sous-dossiers immédiats (ex: lab_app, etc.)
                for (const dir of searchDirs) {
                    const subPath = path.join(cwd, dir);
                    if (fs.existsSync(path.join(subPath, 'pubspec.yaml'))) {
                        detectedType = 'flutter';
                        projectPath = subPath;
                        break;
                    } else if (fs.existsSync(path.join(subPath, 'package.json'))) {
                        try {
                            const pkg = JSON.parse(fs.readFileSync(path.join(subPath, 'package.json'), 'utf8'));
                            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                            if (deps.nuxt) {
                                detectedType = 'nuxt';
                                projectPath = subPath;
                                break;
                            } else if (deps.next) {
                                detectedType = 'next';
                                projectPath = subPath;
                                break;
                            } else if (deps.vue) {
                                detectedType = 'vue';
                                projectPath = subPath;
                                break;
                            } else if (deps.react) {
                                detectedType = 'react';
                                projectPath = subPath;
                                break;
                            }
                        } catch {}
                    }
                }
            }

            if (detectedType) {
                console.log(chalk.green(`✓ Projet détecté : ${chalk.bold(detectedType.toUpperCase())} dans ${path.relative(cwd, projectPath) || '.'}`));
            } else {
                console.log(chalk.cyan('\nTypes de projets supportés : flutter, nuxt, vue, next, react, express, rails'));
                const manual = await askQuestion('Veuillez entrer le type de votre projet manuellement : ');
                const type = manual.toLowerCase();
                if (['flutter', 'nuxt', 'vue', 'next', 'react', 'express', 'rails'].includes(type)) {
                    detectedType = type as any;
                } else {
                    console.error(chalk.red('✗ Type de projet non supporté.'));
                    process.exit(1);
                }
            }

            // 2. CONFIGURATION DES CLÉS (INTELLIGENTE OU MANUELLE)
            let projectKey = '';
            let projectSlug = '';
            let cloudUrl = walletConfig.get().cloudUrl || 'https://app.ashgateway.com';
            let environment = 'sandbox';

            if (!walletConfig.isAuthenticated()) {
                console.log(chalk.yellow('\nVous n\'êtes pas connecté. Connexion requise pour continuer.'));
                try {
                    await loginWithKeycloak();
                } catch (err: any) {
                    console.error(chalk.red(`\n✗ Échec de la connexion : ${err.message}`));
                    process.exit(1);
                }
            }

            if (walletConfig.isAuthenticated()) {
                try {
                    const response = await apiClient.get('/projects');
                    const projects = response.data;
                    if (Array.isArray(projects) && projects.length > 0) {
                        console.log(chalk.cyan('\nVos projets Ash Gateway :'));
                        projects.forEach((p, idx) => {
                            console.log(`  ${idx + 1}. ${p.name} (${p.slug})`);
                        });
                        const selection = await askQuestion(`Choisissez le projet (1-${projects.length}) : `);
                        const index = parseInt(selection) - 1;
                        if (index >= 0 && index < projects.length) {
                            projectKey = projects[index].publicKey;
                            projectSlug = projects[index].slug;
                            console.log(chalk.green(`✓ Projet sélectionné : ${projects[index].name}`));
                        }
                    } else {
                        console.log(chalk.yellow('\nAucun projet trouvé sur votre compte.'));
                    }
                } catch (err: any) {
                    console.log(chalk.yellow(`\n⚠️  Impossible de charger les projets depuis l'API (${err.message}).`));
                }
            }

            if (!projectKey) {
                console.log(chalk.yellow('\n(Configuration manuelle des clés)'));
                projectKey = await askQuestion('Entrez la clé publique de votre projet (ap_pub_xxx) : ');
                projectSlug = await askQuestion('Entrez le slug de votre projet : ');
            }

            const envSelection = await askQuestion('\nChoisissez l\'environnement (1. sandbox [défaut], 2. live) : ');
            if (envSelection === '2') {
                environment = 'live';
            }

            // Configuration interactive des fournisseurs de paiement
            console.log(chalk.cyan('\nConfiguration des fournisseurs de paiement :'));
            console.log('  1. FedaPay uniquement');
            console.log('  2. FeexPay uniquement');
            console.log('  3. Stripe uniquement');
            console.log('  4. FedaPay et FeexPay');
            console.log('  5. Tous (FedaPay, FeexPay et Stripe) [défaut]');
            const providerSelection = await askQuestion('Choisissez une option (1-5) : ');
            
            let useFedapay = true;
            let useFeexpay = true;
            let useStripe = true;
            if (providerSelection === '1') {
                useFeexpay = false;
                useStripe = false;
            } else if (providerSelection === '2') {
                useFedapay = false;
                useStripe = false;
            } else if (providerSelection === '3') {
                useFedapay = false;
                useFeexpay = false;
            } else if (providerSelection === '4') {
                useStripe = false;
            }

            let feexpayMode: 'proxy' | 'sdk' = 'proxy';
            let feexpayToken = '';
            let feexpayShopId = '';
            if (useFeexpay) {
                console.log(chalk.cyan('\nMode d\'intégration pour FeexPay :'));
                console.log('  1. Proxy/Serveur USSD (Recommandé - Sécurisé et sans SDK local) [défaut]');
                console.log('  2. SDK local (feexpay_flutter - nécessite d\'exposer vos clés)');
                const modeSelection = await askQuestion('Choisissez une option (1-2) : ');
                if (modeSelection === '2') {
                    feexpayMode = 'sdk';
                    console.log(chalk.yellow('\n(Configuration des clés FeexPay requise pour le SDK local)'));
                    feexpayToken = await askQuestion('Entrez votre clé API / Token FeexPay (ex: fp_xxxx ou Bearer token) : ');
                    feexpayShopId = await askQuestion('Entrez votre Shop ID FeexPay : ');
                }
            }

            // Configuration interactive du mode de notification d'événements
            console.log(chalk.cyan('\nConfiguration du mode de notification des événements :'));
            console.log('  1. Webhook HTTP POST (Serveur à Serveur)');
            console.log('  2. WebSocket WSS Realtime (Client léger / App Mobile temps réel)');
            console.log('  3. Hybride : Webhook + WebSocket (Recommandé - Validation BDD + UX Directe) [défaut]');
            const notificationSelection = await askQuestion('Choisissez le mode de notification (1-3) [3 par défaut] : ');
            let notificationMode: 'webhook' | 'websocket' | 'both' = 'both';
            if (notificationSelection === '1') {
                notificationMode = 'webhook';
            } else if (notificationSelection === '2') {
                notificationMode = 'websocket';
            }

            let webhookUrlInput = '';
            if (['webhook', 'both'].includes(notificationMode)) {
                webhookUrlInput = await askQuestion('URL Webhook Client (optionnelle, ex: https://mon-app.com/api/webhooks/ashgate) : ');
            }

            if (projectSlug) {
                try {
                    const updatePayload: any = { notificationMode };
                    if (webhookUrlInput.trim()) {
                        updatePayload.webhookUrl = webhookUrlInput.trim();
                    }
                    await apiClient.patch(`/projects/${projectSlug}`, updatePayload);
                    console.log(chalk.green(`✓ Mode de notification [${notificationMode}] configuré sur le projet "${projectSlug}".`));
                } catch (e: any) {
                    // Ignore error if offline
                }
            }

            // 3. ÉCRITURE DES CONFIGURATIONS ET COMPOSANTS
            try {
                if (detectedType === 'flutter') {
                    const pubspecPath = path.join(projectPath, 'pubspec.yaml');
                    const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');

                    // ÉTAPE A : Installer les dépendances nécessaires
                    if (useFedapay) {
                        if (!pubspecContent.includes('feda_flutter:')) {
                            console.log(chalk.cyan('\nInstallation de la dépendance feda_flutter...'));
                            try {
                                execSync('flutter pub add feda_flutter', { cwd: projectPath, stdio: 'inherit' });
                                console.log(chalk.green('✓ Dépendance feda_flutter ajoutée avec succès.'));
                            } catch (err: any) {
                                console.warn(chalk.yellow('⚠️  Impossible d\'ajouter feda_flutter via la CLI flutter. Veuillez l\'ajouter manuellement à vos dependencies dans pubspec.yaml.'));
                            }
                        }
                    }

                    if (useFeexpay && feexpayMode === 'sdk') {
                        if (!pubspecContent.includes('feexpay_flutter:')) {
                            console.log(chalk.cyan('\nInstallation de la dépendance feexpay_flutter...'));
                            try {
                                execSync('flutter pub add feexpay_flutter', { cwd: projectPath, stdio: 'inherit' });
                                console.log(chalk.green('✓ Dépendance feexpay_flutter ajoutée avec succès.'));
                            } catch (err: any) {
                                console.warn(chalk.yellow('⚠️  Impossible d\'ajouter feexpay_flutter via la CLI flutter. Veuillez l\'ajouter manuellement à vos dependencies dans pubspec.yaml.'));
                            }
                        }
                    }

                    if ((useFeexpay && feexpayMode === 'proxy') || (useFedapay && useFeexpay) || useStripe) {
                        if (!pubspecContent.includes('webview_flutter:')) {
                            console.log(chalk.cyan('\nInstallation de la dépendance webview_flutter...'));
                            try {
                                execSync('flutter pub add webview_flutter', { cwd: projectPath, stdio: 'inherit' });
                                console.log(chalk.green('✓ Dépendance webview_flutter ajoutée avec succès.'));
                            } catch (err: any) {
                                console.warn(chalk.yellow('⚠️  Impossible d\'ajouter webview_flutter via la CLI flutter. Veuillez l\'ajouter manuellement à vos dependencies dans pubspec.yaml.'));
                            }
                        }
                    }

                    // ÉTAPE B : Créer la structure de dossiers lib/
                    const libDir = path.join(projectPath, 'lib');
                    const providersDir = path.join(libDir, 'providers');
                    if (!fs.existsSync(providersDir)) {
                        fs.mkdirSync(providersDir, { recursive: true });
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
  static const bool useFeexpay = ${useFeexpay};
  static const bool useStripe = ${useStripe};
  static const String feexpayToken = '${feexpayToken}';
  static const String feexpayShopId = '${feexpayShopId}';
}
`;
                    fs.writeFileSync(path.join(libDir, 'ashgate_config.dart'), configContent);
                    console.log(chalk.green('✓ Fichier lib/ashgate_config.dart généré.'));

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
                    fs.writeFileSync(path.join(libDir, 'ashgate_payment_provider.dart'), providerBaseContent);
                    console.log(chalk.green('✓ Fichier lib/ashgate_payment_provider.dart généré.'));

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
                        fs.writeFileSync(path.join(providersDir, 'fedapay_provider.dart'), fedapayProviderContent);
                        console.log(chalk.green('✓ Fichier lib/providers/fedapay_provider.dart généré.'));
                    } else {
                        const oldFeda = path.join(providersDir, 'fedapay_provider.dart');
                        if (fs.existsSync(oldFeda)) fs.unlinkSync(oldFeda);
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
      final url = Uri.parse('\${AshgateConfig.cloudUrl}/fedapay/direct-payment');

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
                        fs.writeFileSync(path.join(providersDir, 'stripe_provider.dart'), stripeProviderContent);
                        console.log(chalk.green('✓ Fichier lib/providers/stripe_provider.dart généré.'));
                    } else {
                        const oldStripe = path.join(providersDir, 'stripe_provider.dart');
                        if (fs.existsSync(oldStripe)) fs.unlinkSync(oldStripe);
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
                        } else {
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
                        fs.writeFileSync(path.join(providersDir, 'feexpay_provider.dart'), feexpayProviderContent);
                        console.log(chalk.green('✓ Fichier lib/providers/feexpay_provider.dart généré.'));
                    } else {
                        const oldFeex = path.join(providersDir, 'feexpay_provider.dart');
                        if (fs.existsSync(oldFeex)) fs.unlinkSync(oldFeex);
                    }

                    // 5. ashgate_payment.dart (Orchestrateur & Helpers)
                    const imports: string[] = [
                        "import 'package:flutter/material.dart';",
                    ];
                    if (useFedapay) {
                        imports.push("import 'package:feda_flutter/feda_flutter.dart';");
                    }
                    if ((useFeexpay && feexpayMode === 'proxy') || useStripe) {
                        imports.push("import 'package:webview_flutter/webview_flutter.dart';");
                    }
                    if (useFedapay || useStripe || useFeexpay) {
                        imports.push("import 'ashgate_config.dart';");
                    }
                    imports.push("import 'ashgate_payment_provider.dart';");
                    if (useFedapay) {
                        imports.push("import 'providers/fedapay_provider.dart';");
                    }
                    if (useFeexpay) {
                        imports.push("import 'providers/feexpay_provider.dart';");
                    }
                    if (useStripe) {
                        imports.push("import 'providers/stripe_provider.dart';");
                    }

                    let providerResolver = '\n    final name = providerName.toLowerCase();';
                    if (useFedapay) {
                        providerResolver += '\n    if (name == \'fedapay\') return FedapayProvider();';
                    }
                    if (useFeexpay) {
                        providerResolver += '\n    if (name == \'feexpay\') return FeexpayProvider();';
                    }
                    if (useStripe) {
                        providerResolver += '\n    if (name == \'stripe\') return StripeProvider();';
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
                    } else if (useFedapay) {
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
                    } else if ((useFeexpay && feexpayMode === 'proxy') || useStripe) {
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
                    } else {
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
                    } else {
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
                    fs.writeFileSync(path.join(libDir, 'ashgate_payment.dart'), orchestratorContent);
                    console.log(chalk.green('✓ Fichier lib/ashgate_payment.dart généré.'));


                    // ÉTAPE D : Modifier automatiquement main.dart pour injecter l'initialisation ou l'exemple de démo
                    const mainDartPath = path.join(projectPath, 'lib/main.dart');
                    if (fs.existsSync(mainDartPath)) {
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
                            fs.writeFileSync(mainDartPath, mainDartDemoContent);
                            console.log(chalk.green('✓ Fichier lib/main.dart remplacé par l\'exemple de checkout fonctionnel.'));
                        } else {
                            let mainContent = fs.readFileSync(mainDartPath, 'utf8');

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
                                } else {
                                    // Cas flèche void main() => runApp(...)
                                    const arrowRegex = /void\s+main\s*\(\s*\)\s*=>\s*(runApp\([^)]+\));/;
                                    if (arrowRegex.test(mainContent)) {
                                        mainContent = mainContent.replace(arrowRegex, (match, runAppCall) => {
                                            return `void main() {\n  WidgetsFlutterBinding.ensureInitialized();\n  AshgatePayment.initialize();\n  ${runAppCall};\n}`;
                                        });
                                    }
                                }
                            }

                            fs.writeFileSync(mainDartPath, mainContent);
                            console.log(chalk.green('✓ Fichier lib/main.dart mis à jour avec l\'initialisation d\'Ashgate.'));
                        }
                    }

                } else if (detectedType === 'nuxt') {
                    // --- INTEGRATION NUXT 3 ---
                    const envPath = path.join(projectPath, '.env');
                    const envVars = `\nNUXT_PUBLIC_ASHGATE_API_URL=${cloudUrl}\nNUXT_PUBLIC_ASHGATE_PROJECT_KEY=${projectKey}\nNUXT_PUBLIC_ASHGATE_ENV=${environment}\n`;
                    fs.appendFileSync(envPath, envVars);
                    console.log(chalk.green('✓ Fichier .env mis à jour avec les variables NUXT_PUBLIC_ASHGATE.'));

                    // 1. Server Route Nitro : server/api/ashgate/checkout.post.ts
                    const serverApiDir = path.join(projectPath, 'server', 'api', 'ashgate');
                    if (!fs.existsSync(serverApiDir)) fs.mkdirSync(serverApiDir, { recursive: true });

                    const serverNitroContent = `export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();
  const apiUrl = config.public.ashgateApiUrl || '${cloudUrl}';
  const projectKey = config.public.ashgateProjectKey || '${projectKey}';

  const provider = (body.provider || 'fedapay').toLowerCase();
  const endpoint = provider === 'feexpay'
    ? \`\${apiUrl}/feexpay/payin\`
    : \`\${apiUrl}/fedapay/direct-payment\`;

  const payload = provider === 'feexpay'
    ? {
        network: body.operator || 'mtn',
        amount: body.amount,
        phoneNumber: body.phoneNumber,
        fullname: \`\${body.firstname || ''} \${body.lastname || ''}\`.trim(),
        email: body.email,
        description: body.description || 'Paiement Ashgate',
      }
    : {
        provider: provider,
        amount: body.amount,
        currency: body.currency || 'XOF',
        email: body.email,
        firstname: body.firstname,
        lastname: body.lastname,
        phoneNumber: body.phoneNumber,
        description: body.description || 'Paiement Ashgate',
      };

  try {
    const res = await $fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-feda-project-key': projectKey,
      },
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
                    fs.writeFileSync(path.join(serverApiDir, 'checkout.post.ts'), serverNitroContent);
                    console.log(chalk.green('✓ Route serveur server/api/ashgate/checkout.post.ts générée.'));

                    const isTs = fs.existsSync(path.join(projectPath, 'tsconfig.json'));
                    const routeExt = isTs ? 'ts' : 'js';
                    const compExt = isTs ? 'ts' : 'js';

                    const serverNitroContentTs = `import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();

  const apiUrl = config.public.ashgateApiUrl || '${cloudUrl}';
  const projectKey = config.public.ashgateProjectKey || '${projectKey}';

  const provider = (body.provider || 'fedapay').toLowerCase();
  const endpoint = provider === 'feexpay'
    ? \`\${apiUrl}/feexpay/payin\`
    : \`\${apiUrl}/fedapay/direct-payment\`;

  const payload = provider === 'feexpay'
    ? {
        network: body.operator || 'mtn',
        amount: body.amount,
        phoneNumber: body.phoneNumber,
        fullname: \`\${body.firstname || ''} \${body.lastname || ''}\`.trim(),
        email: body.email,
        description: body.description || 'Paiement Ashgate',
      }
    : {
        provider: provider,
        amount: body.amount,
        currency: body.currency || 'XOF',
        email: body.email,
        firstname: body.firstname,
        lastname: body.lastname,
        phoneNumber: body.phoneNumber,
        description: body.description || 'Paiement Ashgate',
      };

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
  const endpoint = provider === 'feexpay'
    ? \`\${apiUrl}/feexpay/payin\`
    : \`\${apiUrl}/fedapay/direct-payment\`;

  const payload = provider === 'feexpay'
    ? {
        network: body.operator || 'mtn',
        amount: body.amount,
        phoneNumber: body.phoneNumber,
        fullname: \`\${body.firstname || ''} \${body.lastname || ''}\`.trim(),
        email: body.email,
        description: body.description || 'Paiement Ashgate',
      }
    : {
        provider: provider,
        amount: body.amount,
        currency: body.currency || 'XOF',
        email: body.email,
        firstname: body.firstname,
        lastname: body.lastname,
        phoneNumber: body.phoneNumber,
        description: body.description || 'Paiement Ashgate',
      };

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

                    fs.writeFileSync(path.join(serverApiDir, `checkout.post.${routeExt}`), isTs ? serverNitroContentTs : serverNitroContentJs);
                    console.log(chalk.green(`✓ Route serveur server/api/ashgate/checkout.post.${routeExt} générée.`));

                    // 2. Composable Nuxt 3 : composables/useAshgatePayment
                    const composablesDir = path.join(projectPath, 'composables');
                    if (!fs.existsSync(composablesDir)) fs.mkdirSync(composablesDir, { recursive: true });

                    const composableContentTs = `export function useAshgatePayment() {
  const isProcessing = ref(false);
  const paymentUrl = ref<string | null>(null);
  const error = ref<string | null>(null);

  const initCheckout = async (params: {
    provider?: 'fedapay' | 'feexpay' | 'stripe' | string;
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

                    fs.writeFileSync(path.join(composablesDir, `useAshgatePayment.${compExt}`), isTs ? composableContentTs : composableContentJs);
                    console.log(chalk.green(`✓ Composable composables/useAshgatePayment.${compExt} généré.`));

                    // 3. Composant Vue 3 : components/AshgateCheckout.vue
                    const compDir = path.join(projectPath, 'components');
                    if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });

                    const vueContent = `<template>
  <div class="ashgate-checkout p-6 bg-slate-900 text-white rounded-xl shadow-xl max-w-md mx-auto border border-slate-800">
    <h2 class="text-xl font-bold mb-4 text-center">Paiement Sécurisé Ashgate</h2>

    <form @submit.prevent="handlePay" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1 text-slate-300">Fournisseur</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            type="button"
            v-for="p in ['fedapay', 'feexpay', 'stripe']"
            :key="p"
            @click="form.provider = p"
            :class="[
              'py-2 px-3 text-sm font-semibold rounded-lg border transition',
              form.provider === p
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            ]"
          >
            {{ p.toUpperCase() }}
          </button>
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

      <div>
        <label class="block text-sm font-medium mb-1 text-slate-300">Email</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div v-if="form.provider !== 'stripe'">
        <label class="block text-sm font-medium mb-1 text-slate-300">Téléphone Mobile Money</label>
        <input
          v-model="form.phoneNumber"
          type="tel"
          placeholder="90000000"
          required
          class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div v-if="form.provider !== 'stripe'">
        <label class="block text-sm font-medium mb-1 text-slate-300">Opérateur</label>
        <select
          v-model="form.operator"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="mtn">MTN Mobile Money</option>
          <option value="moov">Moov Money</option>
          <option value="celtiis">Celtiis Cash</option>
        </select>
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
const props = defineProps({
  amount: { type: Number, default: 5000 },
  currency: { type: String, default: 'XOF' },
});

const form = reactive({
  provider: 'fedapay',
  amount: props.amount,
  currency: props.currency,
  email: 'client@example.com',
  firstname: 'Alexis',
  lastname: 'Ashborn',
  phoneNumber: '90000000',
  operator: 'mtn',
  description: 'Abonnement Ashgate',
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
                    fs.writeFileSync(path.join(compDir, 'AshgateCheckout.vue'), vueContent);
                    console.log(chalk.green('✓ Composant components/AshgateCheckout.vue généré.'));

                } else if (detectedType === 'vue') {
                    // --- INTEGRATION VUE 3 ---
                    const envPath = path.join(projectPath, '.env');
                    const envVars = `\nVITE_ASHGATE_API_URL=${cloudUrl}\nVITE_ASHGATE_PROJECT_KEY=${projectKey}\nVITE_ASHGATE_ENV=${environment}\n`;
                    fs.appendFileSync(envPath, envVars);
                    console.log(chalk.green('✓ Fichier .env mis à jour avec les variables VITE_ASHGATE.'));

                    const srcDir = path.join(projectPath, 'src');
                    const compDir = path.join(srcDir, 'components');
                    const composablesDir = path.join(srcDir, 'composables');
                    if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });
                    if (!fs.existsSync(composablesDir)) fs.mkdirSync(composablesDir, { recursive: true });

                    const isTs = fs.existsSync(path.join(projectPath, 'tsconfig.json')) || fs.existsSync(path.join(projectPath, 'tsconfig.app.json'));

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
    const endpoint = provider === 'feexpay'
      ? \`\${apiUrl}/feexpay/payin\`
      : \`\${apiUrl}/fedapay/direct-payment\`;

    const payload = provider === 'feexpay'
      ? {
          network: params.operator || 'mtn',
          amount: params.amount,
          phoneNumber: params.phoneNumber,
          fullname: \`\${params.firstname || ''} \${params.lastname || ''}\`.trim(),
          email: params.email,
          description: params.description || 'Paiement Ashgate',
        }
      : {
          provider: provider,
          amount: params.amount,
          currency: params.currency || 'XOF',
          email: params.email,
          firstname: params.firstname,
          lastname: params.lastname,
          phoneNumber: params.phoneNumber,
          description: params.description || 'Paiement Ashgate',
        };

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
      if (!res.ok) throw new Error(data.message || 'Échec de l’initialisation');

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
    const endpoint = provider === 'feexpay'
      ? \`\${apiUrl}/feexpay/payin\`
      : \`\${apiUrl}/fedapay/direct-payment\`;

    const payload = provider === 'feexpay'
      ? {
          network: params.operator || 'mtn',
          amount: params.amount,
          phoneNumber: params.phoneNumber,
          fullname: \`\${params.firstname || ''} \${params.lastname || ''}\`.trim(),
          email: params.email,
          description: params.description || 'Paiement Ashgate',
        }
      : {
          provider: provider,
          amount: params.amount,
          currency: params.currency || 'XOF',
          email: params.email,
          firstname: params.firstname,
          lastname: params.lastname,
          phoneNumber: params.phoneNumber,
          description: params.description || 'Paiement Ashgate',
        };

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
      if (!res.ok) throw new Error(data.message || 'Échec de l’initialisation');

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
                    fs.writeFileSync(path.join(composablesDir, fileName), isTs ? composableVueTs : composableVueJs);
                    console.log(chalk.green(`✓ Composable src/composables/${fileName} généré.`));

                } else if (detectedType === 'next') {
                    // --- INTEGRATION NEXT.JS ---
                    const isTs = fs.existsSync(path.join(projectPath, 'tsconfig.json'));
                    const routeExt = isTs ? 'ts' : 'js';
                    const hookExt = isTs ? 'ts' : 'js';
                    const compExt = isTs ? 'tsx' : 'jsx';

                    const envPath = path.join(projectPath, '.env');
                    const envVars = `\nNEXT_PUBLIC_ASHGATE_API_URL=${cloudUrl}\nNEXT_PUBLIC_ASHGATE_PROJECT_KEY=${projectKey}\nNEXT_PUBLIC_ASHGATE_ENV=${environment}\n`;
                    fs.appendFileSync(envPath, envVars);
                    console.log(chalk.green('✓ Fichier .env mis à jour avec NEXT_PUBLIC_ASHGATE.'));

                    // 1. App Router API Route : app/api/ashgate/checkout/route
                    const appApiDir = path.join(projectPath, 'app', 'api', 'ashgate', 'checkout');
                    if (!fs.existsSync(appApiDir)) fs.mkdirSync(appApiDir, { recursive: true });

                    const nextRouteContentTs = `import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_ASHGATE_API_URL || '${cloudUrl}';
    const projectKey = process.env.NEXT_PUBLIC_ASHGATE_PROJECT_KEY || '${projectKey}';

    const provider = (body.provider || 'fedapay').toLowerCase();
    const endpoint = provider === 'feexpay'
      ? \`\${apiUrl}/feexpay/payin\`
      : \`\${apiUrl}/fedapay/direct-payment\`;

    const payload = provider === 'feexpay'
      ? {
          network: body.operator || 'mtn',
          amount: body.amount,
          phoneNumber: body.phoneNumber,
          fullname: \`\${body.firstname || ''} \${body.lastname || ''}\`.trim(),
          email: body.email,
          description: body.description || 'Paiement Ashgate',
        }
      : {
          provider: provider,
          amount: body.amount,
          currency: body.currency || 'XOF',
          email: body.email,
          firstname: body.firstname,
          lastname: body.lastname,
          phoneNumber: body.phoneNumber,
          description: body.description || 'Paiement Ashgate',
        };

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
      return NextResponse.json({ error: data.message || 'Échec du paiement' }, { status: res.status });
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
    const endpoint = provider === 'feexpay'
      ? \`\${apiUrl}/feexpay/payin\`
      : \`\${apiUrl}/fedapay/direct-payment\`;

    const payload = provider === 'feexpay'
      ? {
          network: body.operator || 'mtn',
          amount: body.amount,
          phoneNumber: body.phoneNumber,
          fullname: \`\${body.firstname || ''} \${body.lastname || ''}\`.trim(),
          email: body.email,
          description: body.description || 'Paiement Ashgate',
        }
      : {
          provider: provider,
          amount: body.amount,
          currency: body.currency || 'XOF',
          email: body.email,
          firstname: body.firstname,
          lastname: body.lastname,
          phoneNumber: body.phoneNumber,
          description: body.description || 'Paiement Ashgate',
        };

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
      return NextResponse.json({ error: data.message || 'Échec du paiement' }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur Interne' }, { status: 500 });
  }
}
`;

                    fs.writeFileSync(path.join(appApiDir, `route.${routeExt}`), isTs ? nextRouteContentTs : nextRouteContentJs);
                    console.log(chalk.green(`✓ Next.js App Router Route app/api/ashgate/checkout/route.${routeExt} générée.`));

                    // 2. React Hook : hooks/useAshgatePayment
                    const hooksDir = path.join(projectPath, 'hooks');
                    if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });

                    const hookContentTs = `import { useState } from 'react';

export function useAshgatePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initCheckout = async (params: {
    provider?: 'fedapay' | 'feexpay' | 'stripe' | string;
    amount: number;
    currency?: string;
    email: string;
    firstname?: string;
    lastname?: string;
    phoneNumber?: string;
    operator?: 'mtn' | 'moov' | 'celtiis' | string;
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

                    fs.writeFileSync(path.join(hooksDir, `useAshgatePayment.${hookExt}`), isTs ? hookContentTs : hookContentJs);
                    console.log(chalk.green(`✓ React Hook hooks/useAshgatePayment.${hookExt} généré.`));

                    // 3. React Component : components/AshgateCheckout
                    const compDir = path.join(projectPath, 'components');
                    if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });

                    const reactNextComponentTs = `'use client';

import React, { useState } from 'react';
import { useAshgatePayment } from '../hooks/useAshgatePayment';

export default function AshgateCheckout({ amount = 5000, currency = 'XOF' }) {
  const [provider, setProvider] = useState<'fedapay' | 'feexpay' | 'stripe'>('fedapay');
  const [email, setEmail] = useState('client@example.com');
  const [phoneNumber, setPhoneNumber] = useState('90000000');
  const [operator, setOperator] = useState<'mtn' | 'moov' | 'celtiis'>('mtn');

  const { isProcessing, paymentUrl, error, initCheckout } = useAshgatePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await initCheckout({
        provider,
        amount,
        currency,
        email,
        phoneNumber,
        operator,
        description: 'Paiement via Ashgate Next.js',
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '2rem auto', padding: '1.5rem', background: '#0F172A', color: '#FFF', borderRadius: '12px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>Paiement Sécurisé Ashgate</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Fournisseur</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {(['fedapay', 'feexpay', 'stripe'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid ' + (provider === p ? '#6366F1' : '#334155'),
                  background: provider === p ? '#4F46E5' : '#1E293B',
                  color: '#FFF',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
          />
        </div>

        {provider !== 'stripe' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Téléphone Mobile Money</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
            />
          </div>
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

export default function AshgateCheckout({ amount = 5000, currency = 'XOF' }) {
  const [provider, setProvider] = useState('fedapay');
  const [email, setEmail] = useState('client@example.com');
  const [phoneNumber, setPhoneNumber] = useState('90000000');
  const [operator, setOperator] = useState('mtn');

  const { isProcessing, paymentUrl, error, initCheckout } = useAshgatePayment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await initCheckout({
        provider,
        amount,
        currency,
        email,
        phoneNumber,
        operator,
        description: 'Paiement via Ashgate Next.js',
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '2rem auto', padding: '1.5rem', background: '#0F172A', color: '#FFF', borderRadius: '12px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>Paiement Sécurisé Ashgate</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Fournisseur</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {['fedapay', 'feexpay', 'stripe'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid ' + (provider === p ? '#6366F1' : '#334155'),
                  background: provider === p ? '#4F46E5' : '#1E293B',
                  color: '#FFF',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
          />
        </div>

        {provider !== 'stripe' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#94A3B8' }}>Téléphone Mobile Money</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #334155', background: '#1E293B', color: '#FFF' }}
            />
          </div>
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

                    fs.writeFileSync(path.join(compDir, `AshgateCheckout.${compExt}`), isTs ? reactNextComponentTs : reactNextComponentJs);
                    console.log(chalk.green(`✓ Composant React components/AshgateCheckout.${compExt} généré.`));

                } else if (detectedType === 'react') {
                    // --- INTEGRATION REACT SPA ---
                    const isTs = fs.existsSync(path.join(projectPath, 'tsconfig.json'));
                    const hookExt = isTs ? 'ts' : 'js';

                    const envPath = path.join(projectPath, '.env');
                    const envVars = `\nVITE_ASHGATE_API_URL=${cloudUrl}\nVITE_ASHGATE_PROJECT_KEY=${projectKey}\nVITE_ASHGATE_ENV=${environment}\n`;
                    fs.appendFileSync(envPath, envVars);
                    console.log(chalk.green('✓ Fichier .env mis à jour avec VITE_ASHGATE.'));

                    const srcDir = path.join(projectPath, 'src');
                    const compDir = path.join(srcDir, 'components');
                    const hooksDir = path.join(srcDir, 'hooks');
                    if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });
                    if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });

                    const reactHookContentTs = `import { useState } from 'react';

export function useAshgatePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initCheckout = async (params: any) => {
    setIsProcessing(true);
    setError(null);
    setPaymentUrl(null);

    const apiUrl = import.meta.env.VITE_ASHGATE_API_URL || '${cloudUrl}';
    const projectKey = import.meta.env.VITE_ASHGATE_PROJECT_KEY || '${projectKey}';

    const provider = (params.provider || 'fedapay').toLowerCase();
    const endpoint = provider === 'feexpay'
      ? \`\${apiUrl}/feexpay/payin\`
      : \`\${apiUrl}/fedapay/direct-payment\`;

    const payload = provider === 'feexpay'
      ? {
          network: params.operator || 'mtn',
          amount: params.amount,
          phoneNumber: params.phoneNumber,
          fullname: \`\${params.firstname || ''} \${params.lastname || ''}\`.trim(),
          email: params.email,
          description: params.description || 'Paiement Ashgate',
        }
      : {
          provider: provider,
          amount: params.amount,
          currency: params.currency || 'XOF',
          email: params.email,
          firstname: params.firstname,
          lastname: params.lastname,
          phoneNumber: params.phoneNumber,
          description: params.description || 'Paiement Ashgate',
        };

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
      if (!res.ok) throw new Error(data.message || 'Échec du paiement');

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
    const endpoint = provider === 'feexpay'
      ? \`\${apiUrl}/feexpay/payin\`
      : \`\${apiUrl}/fedapay/direct-payment\`;

    const payload = provider === 'feexpay'
      ? {
          network: params.operator || 'mtn',
          amount: params.amount,
          phoneNumber: params.phoneNumber,
          fullname: \`\${params.firstname || ''} \${params.lastname || ''}\`.trim(),
          email: params.email,
          description: params.description || 'Paiement Ashgate',
        }
      : {
          provider: provider,
          amount: params.amount,
          currency: params.currency || 'XOF',
          email: params.email,
          firstname: params.firstname,
          lastname: params.lastname,
          phoneNumber: params.phoneNumber,
          description: params.description || 'Paiement Ashgate',
        };

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
      if (!res.ok) throw new Error(data.message || 'Échec du paiement');

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

                    fs.writeFileSync(path.join(hooksDir, `useAshgatePayment.${hookExt}`), isTs ? reactHookContentTs : reactHookContentJs);
                    console.log(chalk.green(`✓ React Hook src/hooks/useAshgatePayment.${hookExt} généré.`));
                } else {
                    console.log(chalk.yellow(`\nℹ Génération des templates non supportée pour le type : ${detectedType}.`));
                }

                console.log(chalk.bold.green('\n🎉 Projet configuré avec succès !'));
                console.log('Vous pouvez maintenant importer le composant ou helper généré pour accepter les paiements.');
            } catch (err: any) {
                console.error(chalk.red('\n✗ Erreur d\'écriture de la configuration :'), err.message);
                process.exit(1);
            }
        } finally {
            closeReadlineInterface();
        }
    });
}
