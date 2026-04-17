"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLogsCommand = registerLogsCommand;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../config/config");
const keycloak_1 = require("../auth/keycloak");
const subscription_1 = require("../auth/subscription");
// EventSource is required for SSE streaming
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EventSource = require('eventsource');
function registerLogsCommand(program) {
    program
        .command('logs')
        .description('Afficher les logs en temps réel depuis le proxy ash-bwallet')
        .option('-p, --project <slug>', 'Projet cible (par défaut : projet actif)')
        .option('--tail', 'Mode streaming continu', false)
        .action(async (opts) => {
        (0, keycloak_1.requireAuth)();
        await (0, keycloak_1.refreshTokenIfNeeded)();
        await (0, subscription_1.requireProSubscription)();
        const slug = opts.project ?? config_1.walletConfig.get().activeProject;
        if (!slug) {
            console.error(chalk_1.default.red('✗ Précisez un projet avec -p <slug> ou via : wallet project use <slug>'));
            process.exit(1);
        }
        const tokens = config_1.walletConfig.getTokens();
        const cfg = config_1.walletConfig.get();
        const url = `${cfg.cloudUrl}/projects/${slug}/logs/stream`;
        console.log(chalk_1.default.cyan(`\n→ Connexion aux logs de ${chalk_1.default.bold(slug)} (${cfg.environment})...`));
        console.log(chalk_1.default.dim('  Appuyez sur Ctrl+C pour arrêter\n'));
        const es = new EventSource(url, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });
        es.onopen = () => {
            console.log(chalk_1.default.green('✓ Connecté — en attente d\'événements...\n'));
        };
        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const statusColor = (data.status ?? 0) >= 400 ? chalk_1.default.red : chalk_1.default.green;
                const ts = data.timestamp ? chalk_1.default.dim(new Date(data.timestamp).toLocaleTimeString()) : '';
                console.log(`${ts}  ${chalk_1.default.bold(data.method ?? 'GET')} ${data.path ?? ''}  ` +
                    `${statusColor(String(data.status ?? '?'))}  ` +
                    `${chalk_1.default.dim(data.duration ? `${data.duration}ms` : '')}  ` +
                    `${chalk_1.default.yellow(data.env ?? cfg.environment)}`);
            }
            catch {
                console.log(chalk_1.default.dim(event.data));
            }
        };
        es.onerror = () => {
            if (!opts.tail) {
                console.log(chalk_1.default.yellow('\n⚠ Connexion perdue ou fin du stream.'));
                es.close();
            }
        };
        process.on('SIGINT', () => {
            es.close();
            console.log(chalk_1.default.dim('\n  Stream fermé.'));
            process.exit(0);
        });
    });
}
