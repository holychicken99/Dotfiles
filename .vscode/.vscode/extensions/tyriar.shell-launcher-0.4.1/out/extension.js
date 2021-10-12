"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const process = require("process");
const path = require("path");
const fs = require("fs");
const vscode = require("vscode");
const environment_1 = require("./environment");
function getShells() {
    const config = vscode.workspace.getConfiguration().get('shellLauncher');
    const shells = config.shells;
    if (os.platform() === 'win32') {
        return shells.windows;
    }
    if (os.platform() === 'darwin') {
        return shells.osx;
    }
    return shells.linux;
}
function getShellLabel(shell) {
    if (shell.label) {
        return shell.label;
    }
    return getShellDescription(shell);
}
function getShellDescription(shell) {
    if (!shell.args || shell.args.length === 0) {
        return shell.shell;
    }
    return `${shell.shell} ${shell.args.join(' ')}`;
}
function resolveShellVariables(shellConfig) {
    const isWindows = os.platform() === 'win32';
    shellConfig.shell = environment_1.resolveEnvironmentVariables(shellConfig.shell, isWindows);
    if (shellConfig.args) {
        for (let i = 0; i < shellConfig.args.length; i++) {
            shellConfig.args[i] = environment_1.resolveEnvironmentVariables(shellConfig.args[i], isWindows);
        }
    }
}
function startShell(shell) {
    const terminalOptions = {
        cwd: shell.cwd,
        name: shell.launchName,
        shellPath: shell.shell,
        shellArgs: shell.args,
        env: shell.env
    };
    const terminal = vscode.window.createTerminal(terminalOptions);
    terminal.show();
}
function activate(context) {
    const disposable = vscode.commands.registerCommand('shellLauncher.launch', () => {
        const shells = getShells();
        shells.forEach(s => resolveShellVariables(s));
        const options = {
            placeHolder: 'Select the shell to launch'
        };
        const items = shells.filter(s => {
            // If the basename is the same assume it's being pulled from the PATH
            if (path.basename(s.shell) === s.shell) {
                return true;
            }
            // Only show the shell if the path exists
            try {
                // Sysnative virtual folder to access 64bit system System32 on 32bit vscode
                if (os.platform() === 'win32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
                    s.shell = s.shell.replace('System32', 'Sysnative');
                }
                fs.accessSync(s.shell, fs.constants.R_OK | fs.constants.X_OK);
            }
            catch (_a) {
                return false;
            }
            return true;
        }).map(s => {
            return {
                label: getShellLabel(s),
                description: getShellDescription(s),
                _shell: s
            };
        });
        if (items.length === 1) {
            startShell(items[0]._shell);
        }
        else {
            vscode.window.showQuickPick(items, options).then(item => {
                if (item) {
                    startShell(item._shell);
                }
            });
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map