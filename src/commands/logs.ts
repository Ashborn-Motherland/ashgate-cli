import { Command } from 'commander';
import chalk from 'chalk';
import { walletConfig } from '../config/config';
import { requireAuth, refreshTokenIfNeeded } from '../auth/keycloak';
import { requireProSubscription } from '../auth/subscription';
// EventSource is required for SSE streaming
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EventSource = require('eventsource') as typeof import('eventsource');

export function registerLogsCommand(program: Command): void {
    program
        .command('logs')
        .description('Afficher les logs en temps réel depuis le proxy ash-bwallet')
        .option('-p, --project <slug>', 'Projet cible (par défaut : projet actif)')
        .option('--tail', 'Mode streaming continu', false)
        .action(async (opts: { project?: string; tail: boolean }) => {
            requireAuth();
            await refreshTokenIfNeeded();
            await requireProSubscription();

            const slug = opts.project ?? walletConfig.get().activeProject;
            if (!slug) {
                console.error(chalk.red('✗ Précisez un projet avec -p <slug> ou via : wallet project use <slug>'));
                process.exit(1);
            }

            const tokens = walletConfig.getTokens();
            const cfg = walletConfig.get();
            const url = `${cfg.cloudUrl}/projects/${slug}/logs/stream`;

            console.log(chalk.cyan(`\n→ Connexion aux logs de ${chalk.bold(slug)} (${cfg.environment})...`));
            console.log(chalk.dim('  Appuyez sur Ctrl+C pour arrêter\n'));

            const es = new EventSource(url, {
                headers: { Authorization: `Bearer ${tokens.accessToken}` },
            });

            es.onopen = () => {
                console.log(chalk.green('✓ Connecté — en attente d\'événements...\n'));
            };

            es.onmessage = (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data as string) as {
                        method?: string;
                        path?: string;
                        status?: number;
                        duration?: number;
                        env?: string;
                        timestamp?: string;
                    };
                    const statusColor = (data.status ?? 0) >= 400 ? chalk.red : chalk.green;
                    const ts = data.timestamp ? chalk.dim(new Date(data.timestamp).toLocaleTimeString()) : '';
                    console.log(
                        `${ts}  ${chalk.bold(data.method ?? 'GET')} ${data.path ?? ''}  ` +
                        `${statusColor(String(data.status ?? '?'))}  ` +
                        `${chalk.dim(data.duration ? `${data.duration}ms` : '')}  ` +
                        `${chalk.yellow(data.env ?? cfg.environment)}`,
                    );
                } catch {
                    console.log(chalk.dim(event.data as string));
                }
            };

            es.onerror = () => {
                if (!opts.tail) {
                    console.log(chalk.yellow('\n⚠ Connexion perdue ou fin du stream.'));
                    es.close();
                }
            };

            process.on('SIGINT', () => {
                es.close();
                console.log(chalk.dim('\n  Stream fermé.'));
                process.exit(0);
            });
        });
}
