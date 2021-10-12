"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function startSpinner(message) {
    vscode_1.window.setStatusBarMessage(`Rust: $(settings-gear~spin) ${message}`);
}
exports.startSpinner = startSpinner;
function stopSpinner(message) {
    vscode_1.window.setStatusBarMessage(message ? `Rust: ${message}` : 'Rust');
}
exports.stopSpinner = stopSpinner;
//# sourceMappingURL=spinner.js.map