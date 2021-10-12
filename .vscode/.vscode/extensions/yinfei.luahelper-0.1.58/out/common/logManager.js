"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugLogger = void 0;
const vscode = require("vscode");
class DebugLogger {
    static init() {
        DebugLogger.Ainfo = vscode.window.createOutputChannel("Adapter/log");
        // DebugLogger.Ainfo.show();
        DebugLogger.Dinfo = vscode.window.createOutputChannel("Debugger/log");
        // DebugLogger.Dinfo.show();
        DebugLogger.Dinfo.appendLine("LuaHelper initializing...");
    }
    static DebuggerInfo(str) {
        if (str != "" && str != null) {
            DebugLogger.Dinfo.appendLine(str);
        }
    }
    static AdapterInfo(str) {
        if (str != "" && str != null) {
            DebugLogger.Ainfo.appendLine(str);
        }
    }
    static showTips(str, level) {
        if (level === 2) {
            vscode.window.showErrorMessage(str);
        }
        else if (level === 1) {
            vscode.window.showWarningMessage(str);
        }
        else {
            vscode.window.showInformationMessage(str);
        }
    }
}
exports.DebugLogger = DebugLogger;
//# sourceMappingURL=logManager.js.map