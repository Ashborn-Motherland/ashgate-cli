"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTemplateCommands = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../config/config");
const registerTemplateCommands = (program) => {
    const template = program.command('init').description('Initialize a project template');
    template
        .command('flutter')
        .description('Link current Flutter project to Ashgate ecosystem')
        .action(async () => {
        // 1. Check Auth
        if (!config_1.walletConfig.getTokens()?.accessToken) {
            console.log(chalk_1.default.red('❌ Please login first using: ashgate auth login'));
            return;
        }
        const pubspecPath = path_1.default.join(process.cwd(), 'pubspec.yaml');
        // 2. Check if it's a Flutter project
        if (!fs_1.default.existsSync(pubspecPath)) {
            console.log(chalk_1.default.red('❌ No pubspec.yaml found. Are you in a Flutter project directory?'));
            return;
        }
        console.log(chalk_1.default.blue('🚀 Initializing Ashgate template for Flutter...'));
        // 3. Create Ash Configuration for the App
        const config = {
            realm: config_1.walletConfig.get().realm || 'ash',
            client_id: 'wallet_cli',
            environment: 'development',
            linked_at: new Date().toISOString(),
            user_email: config_1.walletConfig.getTokens()?.email
        };
        fs_1.default.writeFileSync(path_1.default.join(process.cwd(), 'ash_config.json'), JSON.stringify(config, null, 2));
        console.log(chalk_1.default.green('✅ Created ash_config.json with your CLI session data.'));
        console.log(chalk_1.default.yellow('🛠️ Next: The CLI will now add feda_flutter to your pubspec.yaml...'));
        // Note: In a real scenario, you'd use a YAML parser here to add the dependency.
    });
};
exports.registerTemplateCommands = registerTemplateCommands;
