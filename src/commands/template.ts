import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { walletConfig } from '../config/config';

export const registerTemplateCommands = (program: Command) => {
  const template = program.command('init').description('Initialize a project template');

  template
    .command('flutter')
    .description('Link current Flutter project to Ashgate ecosystem')
    .action(async () => {
      // 1. Check Auth
      if (!walletConfig.getTokens()?.accessToken) {
        console.log(chalk.red('❌ Please login first using: ashgate auth login'));
        return;
      }

      const pubspecPath = path.join(process.cwd(), 'pubspec.yaml');

      // 2. Check if it's a Flutter project
      if (!fs.existsSync(pubspecPath)) {
        console.log(chalk.red('❌ No pubspec.yaml found. Are you in a Flutter project directory?'));
        return;
      }

      console.log(chalk.blue('🚀 Initializing Ashgate template for Flutter...'));

      // 3. Create Ash Configuration for the App
      const config = {
        realm: walletConfig.get().realm || 'ash',
        client_id: 'wallet_cli',
        environment: 'development',
        linked_at: new Date().toISOString(),
        user_email: walletConfig.getTokens()?.email
      };

      fs.writeFileSync(
        path.join(process.cwd(), 'ash_config.json'),
        JSON.stringify(config, null, 2)
      );

      console.log(chalk.green('✅ Created ash_config.json with your CLI session data.'));
      console.log(chalk.yellow('🛠️ Next: The CLI will now add feda_flutter to your pubspec.yaml...'));
      
      // Note: In a real scenario, you'd use a YAML parser here to add the dependency.
    });
};
