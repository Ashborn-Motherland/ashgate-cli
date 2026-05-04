import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { validateProjectName } from '../utils/validation';
import { walletConfig } from '../config/config';

export const registerInitCommand = (program: Command) => {
  program
    .command('init [tech]')
    .description('Initialize a new project skeleton or link a project template')
    .option('-t, --type <type>', 'Project type (service, library, app)')
    .option('-n, --name <name>', 'Project name')
    .option('-l, --language <lang>', 'Language (typescript, javascript)', 'typescript')
    .option('-m, --manager <manager>', 'Package manager (npm, yarn, pnpm)', 'npm')
    .option('-p, --provider <provider>', 'Payment provider (feda, kkiapay)', 'feda')
    .option('--git', 'Initialize git repository', false)
    .option('--install', 'Install dependencies', false)
    .action(async (tech, options) => {

      // ─── AGY-7 / AGY-2: Template Linking ───────────────────────────────
      if (tech === 'flutter') {
        console.log(chalk.blue('🚀 Linking existing Flutter project to Ashgate ecosystem...'));

        // 1. Check Auth
        const tokens = walletConfig.getTokens();
        if (!tokens?.accessToken) {
          console.log(chalk.red('❌ Please login first using: ashgate auth login'));
          return;
        }

        // 2. Verify Flutter project
        const pubspecPath = path.join(process.cwd(), 'pubspec.yaml');
        if (!fs.existsSync(pubspecPath)) {
          console.log(chalk.red('❌ No pubspec.yaml found. Are you in a Flutter project directory?'));
          return;
        }

        const provider = options.provider.toLowerCase();
        const packageName = provider === 'kkiapay' ? 'kkiapay_flutter_sdk' : 'feda_flutter';

        console.log(chalk.blue(`  Using provider: ${chalk.bold(provider.toUpperCase())}`));

        try {
          // 3. Add Flutter dependency
          console.log(chalk.dim(`  Running: flutter pub add ${packageName}`));
          execSync(`flutter pub add ${packageName}`, { stdio: 'inherit' });

          // 4. Write Ashgate config into assets/
          const config = {
            provider,
            realm: walletConfig.get().realm || 'ash',
            linked_user: tokens.email,
            linked_at: new Date().toISOString(),
          };

          const assetsDir = path.join(process.cwd(), 'assets');
          await fs.ensureDir(assetsDir);
          await fs.writeJSON(path.join(assetsDir, 'ashgate_config.json'), config, { spaces: 2 });

          console.log(chalk.green(`\n✅ ${provider.toUpperCase()} linked successfully and ashgate_config.json created!`));
        } catch {
          console.log(chalk.red('❌ Error adding provider or creating config. Make sure Flutter is installed and accessible.'));
        }

        return;
      }

      // ─── AGY-12: Project Scaffolding ───────────────────────────────────
      let inputs = options;

      try {
        if (!options.type || !options.name) {
          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'type',
              message: 'What type of project do you want to create?',
              choices: ['service', 'library', 'app'],
              when: !options.type,
            },
            {
              type: 'input',
              name: 'name',
              message: 'Enter project name:',
              validate: validateProjectName,
              when: !options.name,
            },
            {
              type: 'list',
              name: 'language',
              message: 'Select language:',
              choices: ['typescript', 'javascript'],
              when: !options.language,
            },
            {
              type: 'list',
              name: 'manager',
              message: 'Select package manager:',
              choices: ['npm', 'yarn', 'pnpm'],
              when: !options.manager,
            },
          ]);
          inputs = { ...options, ...answers };
        }
      } catch (error: any) {
        if (error.isTtyError) {
          console.log(chalk.red('\n❌ Prompt could not be rendered in this environment.'));
        } else {
          console.log(chalk.yellow('\n👋 Initialization cancelled.'));
        }
        return;
      }

      // Final validation
      const nameCheck = validateProjectName(inputs.name);
      if (typeof nameCheck === 'string') {
        console.error(chalk.red(`❌ ${nameCheck}`));
        process.exit(1);
      }

      const targetDir = path.join(process.cwd(), inputs.name);
      if (fs.existsSync(targetDir)) {
        console.error(chalk.red(`❌ Error: Directory "${inputs.name}" already exists.`));
        process.exit(1);
      }

      console.log(chalk.green(`\n✨ Creating a new Ashgate ${inputs.type} in ${targetDir}...`));

      try {
        await fs.ensureDir(targetDir);
        await fs.ensureDir(path.join(targetDir, 'src'));

        const packageJson = {
          name: inputs.name,
          version: '0.1.0',
          description: `Ashgate ${inputs.type} skeleton`,
          main: 'dist/index.js',
          scripts: {
            start: 'node dist/index.js',
            build: inputs.language === 'typescript' ? 'tsc' : 'echo "No build step"',
            test: 'echo "Error: no test specified" && exit 1',
          },
          dependencies: {},
          devDependencies: inputs.language === 'typescript' ? { typescript: '^5.0.0' } : {},
        };

        await fs.writeJSON(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 });
        await fs.writeFile(
          path.join(targetDir, 'src', `index.${inputs.language === 'typescript' ? 'ts' : 'js'}`),
          `console.log("Hello from ${inputs.name}!");\n`,
        );

        if (inputs.git) {
          console.log(chalk.yellow('📦 Initializing git...'));
          execSync('git init', { cwd: targetDir });
        }

        if (inputs.install) {
          console.log(chalk.yellow(`📥 Installing dependencies with ${inputs.manager}...`));
          execSync(`${inputs.manager} install`, { cwd: targetDir, stdio: 'inherit' });
        }

        console.log(chalk.green(`\n✅ Project "${inputs.name}" initialized successfully!`));
        console.log(chalk.white(`Next steps:\n  cd ${inputs.name}\n  ${inputs.manager} start`));
      } catch (err: any) {
        console.error(chalk.red(`❌ Initialization failed: ${err.message}`));
        process.exit(1);
      }
    });
};
