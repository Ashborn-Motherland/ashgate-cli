import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { walletConfig } from '../config/config';

function askConfirmation(query: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(query, (ans) => {
            rl.close();
            const normalized = ans.trim().toLowerCase();
            resolve(normalized === 'y' || normalized === 'yes' || normalized === 'o' || normalized === 'oui');
        });
    });
}

export function registerUninstallCommands(program: Command): void {
    program
        .command('uninstall')
        .description('Désinstaller complètement Ashgate CLI et supprimer sa configuration locale')
        .option('-y, --yes', 'Confirmer automatiquement sans demander d\'interaction')
        .action(async (options) => {
            console.log(chalk.bold('\nDésinstallation d\'Ashgate CLI'));
            console.log(chalk.dim('----------------------------------------------------\n'));

            if (!options.yes) {
                const confirm = await askConfirmation('Êtes-vous sûr de vouloir désinstaller Ashgate CLI ? (y/N) : ');
                if (!confirm) {
                    console.log(chalk.yellow('\nAction annulée.'));
                    return;
                }
            }

            // 1. Nettoyage du fichier de configuration local (~/.config/configstore/ashgate-cli.json)
            try {
                const configPath = walletConfig.getConfigPath();
                if (fs.existsSync(configPath)) {
                    fs.unlinkSync(configPath);
                    console.log(chalk.green('✓ Configuration et session locales supprimées.'));
                }
            } catch (err: any) {
                console.log(chalk.yellow('⚠️ Impossible de supprimer la configuration locale :'), err.message);
            }

            // 2. Détection du binaire exécutable
            const execPath = process.execPath;
            const scriptPath = process.argv[1];

            const possiblePaths = [
                execPath,
                scriptPath,
                '/usr/local/bin/ashgate',
                path.join(process.env.HOME || '', '.local', 'bin', 'ashgate'),
            ];

            let removedBinary = false;

            for (const p of possiblePaths) {
                if (p && fs.existsSync(p) && !p.includes('node_modules') && !p.endsWith('node')) {
                    try {
                        fs.unlinkSync(p);
                        console.log(chalk.green(`✓ Executable supprimé : ${p}`));
                        removedBinary = true;
                        break;
                    } catch (err: any) {
                        console.log(chalk.yellow(`⚠️ Droits insuffisants pour supprimer ${p}. Veuillez exécuter : sudo rm -f ${p}`));
                    }
                }
            }

            if (!removedBinary) {
                console.log(chalk.dim('Pour finaliser la suppression du binaire exécutable, lancez :'));
                console.log(chalk.bold('  sudo rm -f /usr/local/bin/ashgate ~/.local/bin/ashgate\n'));
            }

            console.log(chalk.dim('----------------------------------------------------'));
            console.log(chalk.green('Désinstallation terminée avec succès.\n'));
        });
}
