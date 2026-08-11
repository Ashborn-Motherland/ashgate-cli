"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUninstallCommands = registerUninstallCommands;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const config_1 = require("../config/config");
function askConfirmation(query) {
    const rl = readline_1.default.createInterface({
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
function registerUninstallCommands(program) {
    program
        .command('uninstall')
        .description('Désinstaller complètement Ashgate CLI et supprimer sa configuration locale')
        .option('-y, --yes', 'Confirmer automatiquement sans demander d\'interaction')
        .action(async (options) => {
        console.log(chalk_1.default.bold('\nDésinstallation d\'Ashgate CLI'));
        console.log(chalk_1.default.dim('----------------------------------------------------\n'));
        if (!options.yes) {
            const confirm = await askConfirmation('Êtes-vous sûr de vouloir désinstaller Ashgate CLI ? (y/N) : ');
            if (!confirm) {
                console.log(chalk_1.default.yellow('\nAction annulée.'));
                return;
            }
        }
        // 1. Nettoyage du fichier de configuration local (~/.config/configstore/ashgate-cli.json)
        try {
            const configPath = config_1.walletConfig.getConfigPath();
            if (fs_1.default.existsSync(configPath)) {
                fs_1.default.unlinkSync(configPath);
                console.log(chalk_1.default.green('✓ Configuration et session locales supprimées.'));
            }
        }
        catch (err) {
            console.log(chalk_1.default.yellow('⚠️ Impossible de supprimer la configuration locale :'), err.message);
        }
        // 2. Détection du binaire exécutable
        const execPath = process.execPath;
        const scriptPath = process.argv[1];
        const possiblePaths = [
            execPath,
            scriptPath,
            '/usr/local/bin/ashgate',
            path_1.default.join(process.env.HOME || '', '.local', 'bin', 'ashgate'),
        ];
        let removedBinary = false;
        for (const p of possiblePaths) {
            if (p && fs_1.default.existsSync(p) && !p.includes('node_modules') && !p.endsWith('node')) {
                try {
                    fs_1.default.unlinkSync(p);
                    console.log(chalk_1.default.green(`✓ Executable supprimé : ${p}`));
                    removedBinary = true;
                    break;
                }
                catch (err) {
                    console.log(chalk_1.default.yellow(`⚠️ Droits insuffisants pour supprimer ${p}. Veuillez exécuter : sudo rm -f ${p}`));
                }
            }
        }
        if (!removedBinary) {
            console.log(chalk_1.default.dim('Pour finaliser la suppression du binaire exécutable, lancez :'));
            console.log(chalk_1.default.bold('  sudo rm -f /usr/local/bin/ashgate ~/.local/bin/ashgate\n'));
        }
        console.log(chalk_1.default.dim('----------------------------------------------------'));
        console.log(chalk_1.default.green('Désinstallation terminée avec succès.\n'));
    });
}
