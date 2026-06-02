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
                console.log(chalk.bold.cyan('\n🚀 Initialisation d\'Ash Gateway dans votre projet local...'));

            const cwd = process.cwd();
            let detectedType: 'flutter' | 'nuxt' | 'react' | 'express' | 'rails' | null = null;
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
                    } else if (deps.next || deps.react) {
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
                            } else if (deps.next || deps.react) {
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
                console.log(chalk.cyan('\nTypes de projets supportés : flutter, nuxt, react, express, rails'));
                const manual = await askQuestion('Veuillez entrer le type de votre projet manuellement : ');
                const type = manual.toLowerCase();
                if (['flutter', 'nuxt', 'react', 'express', 'rails'].includes(type)) {
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
            console.log('  3. Les deux (FedaPay et FeexPay) [défaut]');
            const providerSelection = await askQuestion('Choisissez une option (1-3) : ');
            
            let useFedapay = true;
            let useFeexpay = true;
            if (providerSelection === '1') {
                useFeexpay = false;
            } else if (providerSelection === '2') {
                useFedapay = false;
            }

            let feexpayMode: 'proxy' | 'sdk' = 'proxy';
            if (useFeexpay) {
                console.log(chalk.cyan('\nMode d\'intégration pour FeexPay :'));
                console.log('  1. Proxy/Serveur USSD (Recommandé - Sécurisé et sans SDK local) [défaut]');
                console.log('  2. SDK local (feexpay_flutter - nécessite d\'exposer vos clés)');
                const modeSelection = await askQuestion('Choisissez une option (1-2) : ');
                if (modeSelection === '2') {
                    feexpayMode = 'sdk';
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

                    if ((useFeexpay && feexpayMode === 'proxy') || (useFedapay && useFeexpay)) {
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
        currency: CurrencyIso(iso: 'XOF'),
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
            token: AshgateConfig.projectKey, // Clé de projet API
            id: AshgateConfig.projectSlug,  // Shop ID
            amount: request.amount.toInt().toString(),
            redirecturl: '/success',
            errorredirecturl: '/error',
            trans_key: DateTime.now().millisecondsSinceEpoch.toString().substring(0, 15),
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
                    if (useFeexpay && feexpayMode === 'proxy') {
                        imports.push("import 'package:webview_flutter/webview_flutter.dart';");
                    }
                    if (useFedapay) {
                        imports.push("import 'ashgate_config.dart';");
                    }
                    imports.push("import 'ashgate_payment_provider.dart';");
                    if (useFedapay) {
                        imports.push("import 'providers/fedapay_provider.dart';");
                    }
                    if (useFeexpay) {
                        imports.push("import 'providers/feexpay_provider.dart';");
                    }

                    let providerResolver = '';
                    if (useFedapay && useFeexpay) {
                        providerResolver = `
    final name = providerName.toLowerCase();
    if (name == 'fedapay') return FedapayProvider();
    if (name == 'feexpay') return FeexpayProvider();
    throw Exception("Le fournisseur de paiement '\$providerName' n'est pas supporté.");`;
                    } else if (useFedapay) {
                        providerResolver = `
    final name = providerName.toLowerCase();
    if (name == 'fedapay') return FedapayProvider();
    throw Exception("Le fournisseur de paiement '\$providerName' n'est pas supporté (seul FedaPay est activé).");`;
                    } else {
                        providerResolver = `
    final name = providerName.toLowerCase();
    if (name == 'feexpay') return FeexpayProvider();
    throw Exception("Le fournisseur de paiement '\$providerName' n'est pas supporté (seul FeexPay est activé).");`;
                    }

                    let payWidgetHelper = '';
                    if (useFedapay && useFeexpay && feexpayMode === 'proxy') {
                        payWidgetHelper = `
  /// Widget de paiement unifié (FedaPay ou FeexPay)
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
                    } else if (useFeexpay && feexpayMode === 'proxy') {
                        payWidgetHelper = `
  /// Widget de paiement unifié (FeexPay WebView)
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
                    if (useFeexpay && feexpayMode === 'proxy') {
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
                    Navigator.pop(sheetContext);
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
                    Navigator.pop(sheetContext);
                    onPaymentSuccess();
                  },
                  onPaymentFailed: () {
                    Navigator.pop(sheetContext);
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
                    if (useFeexpay && feexpayMode === 'proxy') {
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
            if (change.url != null) {
              final uri = Uri.tryParse(change.url!);
              if (uri != null) {
                final urlString = change.url!.toLowerCase();
                if (urlString.contains('/status/success') ||
                    uri.queryParameters['status'] == 'success' ||
                    uri.queryParameters['transaction'] == 'success' ||
                    urlString.contains('success')) {
                  widget.onPaymentSuccess();
                } else if (urlString.contains('/status/failure') ||
                           uri.queryParameters['status'] == 'failed' ||
                           urlString.contains('fail') ||
                           urlString.contains('cancel')) {
                  widget.onPaymentFailed();
                }
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
    } else if (name == 'feexpay') {
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


                    // ÉTAPE D : Modifier automatiquement main.dart pour injecter l'initialisation
                    const mainDartPath = path.join(projectPath, 'lib/main.dart');
                    if (fs.existsSync(mainDartPath)) {
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

                } else if (detectedType === 'nuxt') {
                    // Écrire les clés dans le .env
                    const envPath = path.join(projectPath, '.env');
                    const envVars = `\nASHGATE_API_URL=${cloudUrl}\nASHGATE_PROJECT_KEY=${projectKey}\nASHGATE_ENV=${environment}\n`;
                    fs.appendFileSync(envPath, envVars);
                    console.log(chalk.green('✓ Fichier .env mis à jour avec les variables ASHGATE.'));

                    // Générer un composant Vue
                    const compDir = path.join(projectPath, 'components');
                    if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });

                    const vueContent = `<template>
  <div class="ashgate-payment-widget">
    <iframe
      v-if="paymentUrl"
      :src="paymentUrl"
      class="w-full h-[600px] border-0 rounded-lg shadow-sm"
      allow="payment"
    ></iframe>
    <div v-else class="text-center p-6 text-gray-500">
      Chargement du paiement...
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  amount: { type: Number, required: true },
  description: { type: String, default: 'Paiement Ashgate' },
  customerEmail: { type: String, required: true },
});

const paymentUrl = ref(null);

onMounted(async () => {
  try {
    const config = useRuntimeConfig();
    const res = await $fetch('/fedapay/direct-payment', {
      baseURL: '${cloudUrl}',
      method: 'POST',
      headers: {
        'x-feda-project-key': '${projectKey}',
        'x-feda-env': '${environment}',
      },
      body: {
        amount: props.amount,
        description: props.description,
        email: props.customerEmail,
        // Autres infos clients optionnelles
      }
    });
    paymentUrl.value = res.url;
  } catch (err) {
    console.error('Erreur d\\'initialisation du paiement Ashgate:', err);
  }
});
</script>
`;
                    fs.writeFileSync(path.join(compDir, 'AshgatePayment.vue'), vueContent);
                    console.log(chalk.green('✓ Composant components/AshgatePayment.vue généré.'));

                } else if (detectedType === 'react') {
                    // Écrire les clés dans le .env
                    const envPath = path.join(projectPath, '.env');
                    const envVars = `\nNEXT_PUBLIC_ASHGATE_API_URL=${cloudUrl}\nNEXT_PUBLIC_ASHGATE_PROJECT_KEY=${projectKey}\nNEXT_PUBLIC_ASHGATE_ENV=${environment}\n`;
                    fs.appendFileSync(envPath, envVars);
                    console.log(chalk.green('✓ Fichier .env mis à jour.'));

                    const compDir = path.join(projectPath, 'components');
                    if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });

                    const reactContent = `import React, { useEffect, useState } from 'react';

export default function AshgatePayment({ amount, description, customerEmail, onSuccess, onFailure }) {
  const [paymentUrl, setPaymentUrl] = useState('');

  useEffect(() => {
    async function initPayment() {
      try {
        const res = await fetch('${cloudUrl}/fedapay/direct-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-feda-project-key': '${projectKey}',
            'x-feda-env': '${environment}',
          },
          body: JSON.stringify({ amount, description, email: customerEmail }),
        });
        const data = await res.json();
        if (data.url) setPaymentUrl(data.url);
      } catch (err) {
        console.error('Failed to init payment:', err);
        if (onFailure) onFailure(err);
      }
    }
    initPayment();
  }, [amount, description, customerEmail]);

  return (
    <div className="ashgate-payment-container">
      {paymentUrl ? (
        <iframe
          src={paymentUrl}
          style={{ width: '100%', height: '600px', border: '0', borderRadius: '8px' }}
          allow="payment"
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>Chargement du widget de paiement...</div>
      )}
    </div>
  );
}
`;
                    fs.writeFileSync(path.join(compDir, 'AshgatePayment.tsx'), reactContent);
                    console.log(chalk.green('✓ Composant components/AshgatePayment.tsx généré.'));
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
