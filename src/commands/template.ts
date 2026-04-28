import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { walletConfig } from '../config/config';

export const registerTemplateCommands = (program: Command) => {
  const template = program.command('init').description('Initialize a project template');

  template
    .command('flutter')
    .description('Link current Flutter project to Ashgate ecosystem')
    .option('-p, --provider <name>', 'Payment provider (feda or kkiapay)', 'feda')
    .action(async (options) => {
      // 1. Check Auth
      const tokens = walletConfig.getTokens();
      if (!tokens?.accessToken) {
        console.log(chalk.red('❌ Please login first using: ashgate auth login'));
        return;
      }

      const pubspecPath = path.join(process.cwd(), 'pubspec.yaml');

      // 2. Check if it's a Flutter project
      if (!fs.existsSync(pubspecPath)) {
        console.log(chalk.red('❌ No pubspec.yaml found. Are you in a Flutter project directory?'));
        return;
      }

      const provider = options.provider.toLowerCase();
      const packageName = provider === 'kkiapay' ? 'kkiapay_flutter_sdk' : 'feda_flutter';

      console.log(chalk.blue(`🚀 Initializing Ashgate template with ${provider.toUpperCase()}...`));

      try {
        // 3. Add the dependency automatically
        console.log(chalk.dim(`  Running: flutter pub add ${packageName}`));
        execSync(`flutter pub add ${packageName}`, { stdio: 'inherit' });

        // 4. Create Ash Configuration for the App
        const config = {
          provider: provider,
          realm: walletConfig.get().realm || 'ash',
          linked_user: tokens.email,
          linked_at: new Date().toISOString(),
        };

        const assetsDir = path.join(process.cwd(), 'assets');
        if (!fs.existsSync(assetsDir)) {
          fs.mkdirSync(assetsDir, { recursive: true });
        }

        fs.writeFileSync(
          path.join(assetsDir, 'ashgate_config.json'),
          JSON.stringify(config, null, 2)
        );

        console.log(chalk.green(`✅ ${provider.toUpperCase()} linked successfully and ashgate_config.json created!`));
      } catch (e) {
        console.log(chalk.red('❌ Error adding provider or creating config. Make sure Flutter is installed and accessible.'));
      }
    });
};
