"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCompletionCommands = registerCompletionCommands;
const chalk_1 = __importDefault(require("chalk"));
const client_1 = require("../api/client");
const config_1 = require("../config/config");
function registerCompletionCommands(program) {
    // Commande publique 'completion' pour afficher les scripts d'intégration
    program
        .command('completion <shell>')
        .description('Générer les scripts d\'autocomplétion pour votre shell (bash ou zsh)')
        .action((shell) => {
        const shellNormalized = shell.toLowerCase();
        if (shellNormalized === 'bash') {
            console.log(`
# Script d'autocomplétion Bash pour ashgate-cli
# Pour l'activer, ajoutez la ligne suivante à votre ~/.bashrc :
# source <(ashgate completion bash)

_ashgate_completion() {
  local cur prev
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  
  # Passer tous les mots saisis après 'ashgate' jusqu'au curseur actuel
  local words=(\"\${COMP_WORDS[@]:1:COMP_CWORD-1}\")
  
  # Si le mot courant est vide, s'assurer d'envoyer un argument vide
  if [ -z "\$cur" ]; then
    words+=(\"\")
  fi

  local suggestions=$(ashgate __complete "\${words[@]}" 2>/dev/null)
  COMPREPLY=( \$(compgen -W "\$suggestions" -- "\$cur") )
  return 0
}
complete -F _ashgate_completion ashgate
`);
        }
        else if (shellNormalized === 'zsh') {
            console.log(`
# Script d'autocomplétion Zsh pour ashgate-cli
# Pour l'activer, ajoutez la ligne suivante à votre ~/.zshrc :
# source <(ashgate completion zsh)

_ashgate_completion() {
  local -a suggestions
  local -a words_to_send
  
  # Récupérer les mots saisis
  words_to_send=("\${(@)words[2,\$CURRENT-1]}")
  
  # Obtenir les suggestions depuis le CLI
  local suggestions_raw
  suggestions_raw=$(ashgate __complete "\${words_to_send[@]}" 2>/dev/null)
  
  # Séparer par retour à la ligne
  suggestions=(\${(f)suggestions_raw})
  
  _describe 'commands' suggestions
}

compdef _ashgate_completion ashgate
`);
        }
        else {
            console.error(chalk_1.default.red(`✗ Shell non supporté : "${shell}". Les shells supportés sont "bash" et "zsh".`));
            process.exit(1);
        }
    });
    // Commande masquée '__complete' appelée par le script shell pour fournir les suggestions
    program
        .command('__complete', { hidden: true })
        .argument('[words...]')
        .action(async (words = []) => {
        const topLevelCommands = ['auth', 'project', 'status', 'completion', 'init', 'doctor', 'pay'];
        const authCommands = ['login', 'logout', 'status'];
        const projectCommands = ['list', 'create', 'show', 'update', 'delete', 'usage', 'logs'];
        const shellOptions = ['bash', 'zsh'];
        // Si aucun mot n'a été tapé, suggérer les commandes principales
        if (words.length === 0 || (words.length === 1 && words[0] === '')) {
            console.log(topLevelCommands.join(' '));
            return;
        }
        const firstWord = words[0];
        // 1. Suggestions sous 'auth'
        if (firstWord === 'auth') {
            if (words.length === 1 || (words.length === 2 && words[1] === '')) {
                console.log(authCommands.join(' '));
                return;
            }
        }
        // 2. Suggestions sous 'completion'
        if (firstWord === 'completion') {
            if (words.length === 1 || (words.length === 2 && words[1] === '')) {
                console.log(shellOptions.join(' '));
                return;
            }
        }
        // 3. Suggestions sous 'project'
        if (firstWord === 'project') {
            if (words.length === 1 || (words.length === 2 && words[1] === '')) {
                console.log(projectCommands.join(' '));
                return;
            }
            const secondWord = words[1];
            const needsSlug = ['show', 'update', 'delete', 'usage', 'logs'].includes(secondWord);
            // Si la commande demande un slug de projet et que l'utilisateur est dessus
            if (needsSlug && (words.length === 2 || (words.length === 3 && words[2] === ''))) {
                // Vérifier si l'utilisateur est connecté pour éviter les requêtes anonymes
                if (config_1.walletConfig.isAuthenticated()) {
                    try {
                        const response = await client_1.apiClient.get('/projects');
                        const projects = response.data;
                        if (Array.isArray(projects)) {
                            const slugs = projects.map(p => p.slug);
                            console.log(slugs.join(' '));
                        }
                    }
                    catch {
                        // En cas d'erreur de réseau ou d'auth, ne rien afficher pour ne pas casser l'expérience terminal
                    }
                }
                return;
            }
        }
        // Fallback : si le premier mot commence comme une commande principale
        if (words.length === 1) {
            const matches = topLevelCommands.filter(cmd => cmd.startsWith(firstWord));
            console.log(matches.join(' '));
        }
    });
}
