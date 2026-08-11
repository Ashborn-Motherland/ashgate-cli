"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTemplateCommands = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const config_1 = require("../config/config");
const registerTemplateCommands = (program) => {
    const template = program.command('init').description('Initialize a project template');
    template
        .command('flutter')
        .description('Link current Flutter project to Ashgate ecosystem')
        .option('-p, --provider <name>', 'Payment provider (feda or kkiapay)', 'feda')
        .action(async (options) => {
        // 1. Check Auth
        const tokens = config_1.walletConfig.getTokens();
        if (!tokens?.accessToken) {
            console.log(chalk_1.default.red('❌ Please login first using: ashgate auth login'));
            return;
        }
        const pubspecPath = path_1.default.join(process.cwd(), 'pubspec.yaml');
        // 2. Check if it's a Flutter project
        if (!fs_1.default.existsSync(pubspecPath)) {
            console.log(chalk_1.default.red('❌ No pubspec.yaml found. Are you in a Flutter project directory?'));
            return;
        }
        const provider = options.provider.toLowerCase();
        const packageName = provider === 'kkiapay' ? 'kkiapay_flutter_sdk' : 'feda_flutter';
        console.log(chalk_1.default.blue(`🚀 Initializing Ashgate template with ${provider.toUpperCase()}...`));
        try {
            // 3. Add the dependency automatically
            console.log(chalk_1.default.dim(`  Running: flutter pub add ${packageName}`));
            (0, child_process_1.execSync)(`flutter pub add ${packageName}`, { stdio: 'inherit' });
            // 4. Create Ash Configuration for the App
            const config = {
                provider: provider,
                realm: config_1.walletConfig.get().realm || 'ash',
                linked_user: tokens.email,
                linked_at: new Date().toISOString(),
            };
            const assetsDir = path_1.default.join(process.cwd(), 'assets');
            if (!fs_1.default.existsSync(assetsDir)) {
                fs_1.default.mkdirSync(assetsDir, { recursive: true });
            }
            fs_1.default.writeFileSync(path_1.default.join(assetsDir, 'ashgate_config.json'), JSON.stringify(config, null, 2));
            console.log(chalk_1.default.green(`✅ ${provider.toUpperCase()} linked successfully and ashgate_config.json created!`));
        }
        catch (e) {
            console.log(chalk_1.default.red('❌ Error adding provider or creating config. Make sure Flutter is installed and accessible.'));
        }
    });
};
exports.registerTemplateCommands = registerTemplateCommands;
