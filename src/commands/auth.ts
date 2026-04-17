import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { loginWithKeycloak, requireAuth } from '../auth/keycloak';
import { walletConfig } from '../config/config';

export function registerAuthCommands(program: Command): void {
    const auth = program.command('auth').description('Gestion de l\'authentification');

    auth
        .command('login')
        .description('Se connecter à la plateforme ash-wallet via Keycloak')
        .action(async () => {
            try {
                await loginWithKeycloak();
            } catch (err) {
                console.error(chalk.red('✗ Échec de la connexion :'), (err as Error).message);
                process.exit(1);
            }
        });

    auth
        .command('logout')
        .description('Se déconnecter (supprime les tokens locaux)')
        .action(() => {
            walletConfig.clearTokens();
            console.log(chalk.green('✓ Déconnecté. À bientôt !'));
        });

    auth
        .command('status')
        .description('Afficher l\'état de la session courante')
        .action(() => {
            const tokens = walletConfig.getTokens();
            if (!tokens.refreshToken || tokens.refreshExpiresAt <= Date.now()) {
                console.log(chalk.yellow('✗ Non authentifié. Lancez : wallet auth login'));
                return;
            }
            const msLeft = tokens.refreshExpiresAt - Date.now();
            const daysLeft = Math.floor(msLeft / 86_400_000);
            const hoursLeft = Math.floor((msLeft % 86_400_000) / 3_600_000);
            const minutesLeft = Math.floor((msLeft % 3_600_000) / 60_000);
            const expiryStr = daysLeft > 0
                ? `${daysLeft}j ${hoursLeft}h`
                : hoursLeft > 0
                    ? `${hoursLeft}h ${minutesLeft}min`
                    : `${minutesLeft}min`;
            console.log(chalk.green(`✓ Connecté`));
            if (tokens.email) console.log(`  Email   : ${tokens.email}`);
            if (tokens.keycloakId) console.log(`  ID      : ${tokens.keycloakId}`);
            console.log(`  Session : encore ${expiryStr}`);
        });
}
