"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuaFormatProvider = exports.LuaFormatRangeProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const child_process = require("child_process");
function needShowFormatErr() {
    let formatErrConfig = vscode.workspace.getConfiguration("luahelper.format", null).get("errShow");
    var formatErrshow = true;
    if (formatErrConfig !== undefined) {
        formatErrshow = formatErrConfig;
    }
    return formatErrshow;
}
// 获取luafmt二进制的文件的路径
function GetLuaFmtPath(context) {
    var vscodeRunStr = path.resolve(context.extensionPath, "server");
    let binaryPath = "";
    if (process.platform === "win32") {
        binaryPath = path.resolve(vscodeRunStr, "win32", "lua-format");
    }
    else if (process.platform === "darwin") {
        binaryPath = path.resolve(vscodeRunStr, "darwin", "lua-format");
    }
    else if (process.platform === "linux") {
        binaryPath = path.resolve(vscodeRunStr, "linux", "lua-format");
    }
    return binaryPath;
}
class LuaFormatRangeProvider {
    constructor(context) {
        this.context = context;
    }
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        let data = document.getText();
        data = data.substring(document.offsetAt(range.start), document.offsetAt(range.end));
        let formatErrshow = needShowFormatErr();
        return new Promise((resolve, reject) => {
            var vscodeRunStr = path.resolve(this.context.extensionPath, "server");
            let configPath = path.resolve(vscodeRunStr, "luafmt.config");
            let binaryPath = GetLuaFmtPath(this.context);
            if (binaryPath === "") {
                return;
            }
            try {
                const args = ["-i"];
                if (configPath) {
                    args.push("-c");
                    args.push(configPath);
                }
                const cmd = child_process.spawn(binaryPath, args, {});
                const result = [], errorMsg = [];
                cmd.on('error', err => {
                    if (formatErrshow) {
                        vscode.window.showErrorMessage(`Run lua-format error : '${err.message}'`);
                    }
                    reject(err);
                });
                cmd.stdout.on('data', data => {
                    result.push(Buffer.from(data));
                });
                cmd.stderr.on('data', data => {
                    errorMsg.push(Buffer.from(data));
                });
                cmd.on('exit', code => {
                    const resultStr = Buffer.concat(result).toString();
                    if (code) {
                        if (formatErrshow) {
                            vscode.window.showErrorMessage(`Run lua-format failed with exit code: ${code}`);
                        }
                        reject(new Error(`Run lua-format failed with exit code: ${code}`));
                        return;
                    }
                    if (resultStr.length > 0) {
                        resolve([new vscode.TextEdit(range, resultStr)]);
                    }
                });
                cmd.stdin.write(data);
                cmd.stdin.end();
            }
            catch (e) {
                console.log("exception");
            }
        });
    }
}
exports.LuaFormatRangeProvider = LuaFormatRangeProvider;
class LuaFormatProvider {
    constructor(context) {
        this.context = context;
    }
    provideDocumentFormattingEdits(document, options, token) {
        var data = document.getText();
        let formatErrshow = needShowFormatErr();
        return new Promise((resolve, reject) => {
            var vscodeRunStr = path.resolve(this.context.extensionPath, "server");
            let configPath = path.resolve(vscodeRunStr, "luafmt.config");
            let binaryPath = GetLuaFmtPath(this.context);
            if (binaryPath === "") {
                return;
            }
            try {
                const args = ["-i"];
                if (configPath) {
                    args.push("-c");
                    args.push(configPath);
                }
                const cmd = child_process.spawn(binaryPath, args, {});
                const result = [], errorMsg = [];
                cmd.on('error', err => {
                    if (formatErrshow) {
                        vscode.window.showErrorMessage(`Run lua-format error : '${err.message}'`);
                    }
                    reject(err);
                });
                cmd.stdout.on('data', data => {
                    result.push(Buffer.from(data));
                });
                cmd.stderr.on('data', data => {
                    errorMsg.push(Buffer.from(data));
                });
                cmd.on('exit', code => {
                    const resultStr = Buffer.concat(result).toString();
                    if (code) {
                        if (formatErrshow) {
                            vscode.window.showErrorMessage(`Run lua-format failed with exit code: ${code}`);
                        }
                        reject(new Error(`Run lua-format failed with exit code: ${code}`));
                        return;
                    }
                    if (resultStr.length > 0) {
                        const range = document.validateRange(new vscode.Range(0, 0, Infinity, Infinity));
                        resolve([new vscode.TextEdit(range, resultStr)]);
                    }
                });
                cmd.stdin.write(data);
                cmd.stdin.end();
            }
            catch (e) {
                console.log("exception");
            }
        });
    }
}
exports.LuaFormatProvider = LuaFormatProvider;
//# sourceMappingURL=luaformat.js.map