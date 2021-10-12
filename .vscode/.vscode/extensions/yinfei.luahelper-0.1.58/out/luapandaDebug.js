"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuaConfigurationProvider = void 0;
const vscode = require("vscode");
const Net = require("net");
const tools_1 = require("./common/tools");
const logManager_1 = require("./common/logManager");
const luaDebug_1 = require("./debug/luaDebug");
// debug启动时的配置项处理
class LuaConfigurationProvider {
    resolveDebugConfiguration(folder, config, token) {
        // if launch.json is missing or empty
        if (!config.type && !config.name) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'lua') {
                vscode.window.showInformationMessage('请先正确配置launch文件!');
                config.type = 'LuaHelper-Debug';
                config.name = 'LuaHelper';
                config.request = 'launch';
            }
        }
        // 不调试而直接运行当前文件
        if (config.noDebug) {
            // 获取活跃窗口
            let retObject = tools_1.Tools.getVSCodeAvtiveFilePath();
            if (retObject["retCode"] !== 0) {
                logManager_1.DebugLogger.DebuggerInfo(retObject["retMsg"]);
                return;
            }
            let filePath = retObject["filePath"];
            if (LuaConfigurationProvider.RunFileTerminal) {
                LuaConfigurationProvider.RunFileTerminal.dispose();
            }
            LuaConfigurationProvider.RunFileTerminal = vscode.window.createTerminal({
                name: "Run Lua File (LuaHelper)",
                env: {},
            });
            // 把路径加入package.path
            let path = require("path");
            let pathCMD = "'";
            let pathArr = tools_1.Tools.VSCodeExtensionPath.split(path.sep);
            let stdPath = pathArr.join('/');
            pathCMD = pathCMD + stdPath + "/debugger/?.lua;";
            pathCMD = pathCMD + config.packagePath.join(';');
            pathCMD = pathCMD + "'";
            //拼接命令
            pathCMD = " \"package.path = " + pathCMD + ".. package.path;\" ";
            let doFileCMD = filePath;
            let runCMD = pathCMD + doFileCMD;
            let LuaCMD;
            if (config.luaPath && config.luaPath !== '') {
                LuaCMD = config.luaPath + " -e ";
            }
            else {
                LuaCMD = "lua -e ";
            }
            LuaConfigurationProvider.RunFileTerminal.sendText(LuaCMD + runCMD, true);
            LuaConfigurationProvider.RunFileTerminal.show();
            return;
        }
        // 关于打开调试控制台的自动设置
        if (config.name === "LuaHelper-DebugFile") {
            if (!config.internalConsoleOptions) {
                config.internalConsoleOptions = "neverOpen";
            }
        }
        else {
            if (!config.internalConsoleOptions) {
                config.internalConsoleOptions = "openOnFirstSessionStart";
            }
            if (config.name === "LuaHelper-Attach") {
                if (!tools_1.Tools.VSCodeOpenedFolder) {
                    // 如果插件还未启动，在这里等待一下
                    vscode.window.showWarningMessage('LuaHelper 插件正在启动， 请再次点击 Run 按钮进行 luanch 调试！', "好的");
                    return;
                }
            }
        }
        if (!config.program) {
            config.program = '';
        }
        if (!config.autoPathMode) {
            config.autoPathMode = false;
        }
        if (!config.args) {
            config.args = new Array();
        }
        if (!config.request) {
            config.request = 'launch';
        }
        if (!config.cwd) {
            config.cwd = '${workspaceFolder}';
        }
        if (!config.TempFilePath) {
            config.TempFilePath = '${workspaceFolder}';
        }
        if (!config.luaFileExtension) {
            config.luaFileExtension = '';
        }
        else {
            let firseLetter = config.luaFileExtension.substr(0, 1);
            if (firseLetter === '.') {
                config.luaFileExtension = config.luaFileExtension.substr(1);
            }
        }
        if (config.stopOnEntry === undefined) {
            config.stopOnEntry = true;
        }
        if (config.pathCaseSensitivity === undefined) {
            config.pathCaseSensitivity = true;
        }
        if (config.trace === undefined) {
            config.trace = false;
        }
        if (config.connectionPort === undefined) {
            luaDebug_1.LuaDebugSession.TCPPort = 8818;
        }
        else {
            luaDebug_1.LuaDebugSession.TCPPort = config.connectionPort;
        }
        if (config.logLevel === undefined) {
            config.logLevel = 1;
        }
        if (config.autoReconnect !== true) {
            config.autoReconnect = false;
        }
        if (config.updateTips === undefined) {
            config.updateTips = true;
        }
        //隐藏属性
        if (config.DebugMode === undefined) {
            config.DebugMode = false;
        }
        if (config.useCHook === undefined) {
            config.useCHook = true;
        }
        if (config.isNeedB64EncodeStr === undefined) {
            config.isNeedB64EncodeStr = true;
        }
        if (!this._server) {
            this._server = Net.createServer(socket => {
                const session = new luaDebug_1.LuaDebugSession();
                session.setRunAsServer(true);
                session.start(socket, socket);
            }).listen(0);
        }
        // make VS Code connect to debug server instead of launching debug adapter
        let addressInfo = this._server.address();
        config.debugServer = addressInfo.port;
        return config;
    }
    dispose() {
        if (this._server) {
            this._server.close();
        }
    }
}
exports.LuaConfigurationProvider = LuaConfigurationProvider;
//# sourceMappingURL=luapandaDebug.js.map