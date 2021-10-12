'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.savedContext = void 0;
const vscode = require("vscode");
const path = require("path");
const net = require("net");
const process = require("process");
const child_process = require("child_process");
const Annotator = require("./annotator");
const os = require("os");
//import { LanguageClient, LanguageClientOptions, ServerOptions, StreamInfo } from "vscode-languageclient";
const languageConfiguration_1 = require("./languageConfiguration");
const tools_1 = require("./common/tools");
const logManager_1 = require("./common/logManager");
const luapandaDebug_1 = require("./luapandaDebug");
const luaformat_1 = require("./luaformat");
const onlinePeople_1 = require("./onlinePeople");
const node_1 = require("vscode-languageclient/node");
let luadoc = require('../client/3rd/vscode-lua-doc/extension.js');
const LANGUAGE_ID = 'lua';
let client;
let activeEditor;
let onlinePeople = new onlinePeople_1.OnlinePeople();
let progressBar;
function activate(context) {
    let luaDocContext = {
        ViewType: undefined,
        OpenCommand: undefined,
        extensionPath: undefined,
    };
    for (const k in context) {
        try {
            luaDocContext[k] = context[k];
        }
        catch (error) { }
    }
    luaDocContext.ViewType = 'lua-doc';
    luaDocContext.OpenCommand = 'extension.lua.doc';
    luaDocContext.extensionPath = context.extensionPath + '/client/3rd/vscode-lua-doc';
    luadoc.activate(luaDocContext);
    console.log("luahelper actived!");
    exports.savedContext = context;
    exports.savedContext.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider({ scheme: "file", language: LANGUAGE_ID }, new luaformat_1.LuaFormatProvider(context)));
    exports.savedContext.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider({ scheme: "file", language: LANGUAGE_ID }, new luaformat_1.LuaFormatRangeProvider(context)));
    exports.savedContext.subscriptions.push(vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocument, null, exports.savedContext.subscriptions));
    exports.savedContext.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor, null, exports.savedContext.subscriptions));
    // 注册了LuaPanda的调试功能
    const provider = new luapandaDebug_1.LuaConfigurationProvider();
    exports.savedContext.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('LuaHelper-Debug', provider));
    exports.savedContext.subscriptions.push(provider);
    // 插入快捷拷贝调试文件的命令   
    exports.savedContext.subscriptions.push(vscode.commands.registerCommand("LuaHelper.copyDebugFile", copyDebugFile));
    // 插入快捷拷贝luasocket的命令   
    exports.savedContext.subscriptions.push(vscode.commands.registerCommand("LuaHelper.copyLuaSocket", copyLuaSocket));
    // 插入快捷输入调试的命令   
    exports.savedContext.subscriptions.push(vscode.commands.registerCommand("LuaHelper.insertDebugCode", insertDebugCode));
    // 打开调试文件夹
    exports.savedContext.subscriptions.push(vscode.commands.registerCommand("LuaHelper.openDebugFolder", openDebugFolder));
    // 设置格式化配置
    exports.savedContext.subscriptions.push(vscode.commands.registerCommand("LuaHelper.setFormatConfig", setFormatConfig));
    exports.savedContext.subscriptions.push(vscode.languages.setLanguageConfiguration("lua", new languageConfiguration_1.LuaLanguageConfiguration()));
    // 公共变量赋值
    let pkg = require(exports.savedContext.extensionPath + "/package.json");
    tools_1.Tools.adapterVersion = pkg.version;
    tools_1.Tools.VSCodeExtensionPath = exports.savedContext.extensionPath;
    tools_1.Tools.VSCodeOpenedFolder = exports.savedContext.extensionPath;
    // init log
    logManager_1.DebugLogger.init();
    // left progess bar
    progressBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    startServer();
    //vscode.commands.executeCommand('extension.lua.doc', "en-us/54/manual.html#lua_rawget");
}
exports.activate = activate;
exports.activate = activate;
// 获取相应的告警配置开关，返回true或false
function getWarnCheckFlag(str) {
    let checkFlagConfig = vscode.workspace.getConfiguration("luahelper.Warn", null).get(str);
    var checkFlag = false;
    if (checkFlagConfig !== undefined) {
        checkFlag = checkFlagConfig;
    }
    return checkFlag;
}
function onDidChangeTextDocument(event) {
    if (activeEditor && activeEditor.document === event.document && activeEditor.document.languageId === LANGUAGE_ID) {
        Annotator.requestAnnotators(activeEditor, client);
    }
}
function onDidChangeActiveTextEditor(editor) {
    if (editor && editor.document.languageId === LANGUAGE_ID) {
        activeEditor = editor;
        Annotator.requestAnnotators(activeEditor, client);
    }
}
function deactivate() {
    vscode.window.showInformationMessage("deactivate");
    stopServer();
}
exports.deactivate = deactivate;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        let showConfig = vscode.workspace.getConfiguration("luahelper.show", null).get("costTime");
        var openFlag = false;
        if (showConfig !== undefined) {
            openFlag = showConfig;
        }
        let begin_time = Date.now();
        doStartServer().then(() => {
            if (openFlag === true) {
                let end_time = Date.now();
                let cost_ms = end_time - begin_time;
                let second = Math.floor(cost_ms / 1000);
                let ms = Math.floor(cost_ms % 1000 / 100);
                let str_cost_time = String(second) + "." + String(ms) + "s";
                vscode.window.showInformationMessage("start luahelper ok, cost time: " + str_cost_time);
            }
            onDidChangeActiveTextEditor(vscode.window.activeTextEditor);
            onlinePeople.Start(client);
        })
            .catch(reson => {
            vscode.window.showErrorMessage(`${reson}`, "Try again").then(startServer);
        });
    });
}
// mac目录赋予可执行权限
function changeExMod() {
    try {
        if (process.platform === "darwin" || process.platform === "linux") {
            var vscodeRunStr = path.resolve(exports.savedContext.extensionPath, "server");
            // 赋予可执行权限
            let cmdExeStr = "chmod -R +x " + vscodeRunStr;
            child_process.execSync(cmdExeStr);
        }
    }
    catch (e) {
        //捕获异常
        console.log("exception");
        vscode.window.showInformationMessage("chmod error");
    }
}
function doStartServer() {
    return __awaiter(this, void 0, void 0, function* () {
        changeExMod();
        let filterArray = vscode.workspace.getConfiguration("luahelper.source", null).get("roots");
        if (filterArray !== undefined) {
            for (let str of filterArray) {
                console.log(str);
            }
        }
        let referenceMaxConfig = vscode.workspace.getConfiguration("luahelper.reference", null).get("maxNum");
        var referenceMaxNum = 3000;
        if (referenceMaxConfig !== undefined) {
            referenceMaxNum = referenceMaxConfig;
        }
        let referenceDefineConfig = vscode.workspace.getConfiguration("luahelper.reference", null).get("incudeDefine");
        var referenceDefineFlag = true;
        if (referenceDefineConfig !== undefined) {
            referenceDefineFlag = referenceDefineConfig;
        }
        let lspConfig = vscode.workspace.getConfiguration("luahelper.project", null).get("lsp");
        var lspStr = "cmd rpc";
        if (lspConfig !== undefined) {
            lspStr = lspConfig;
        }
        let lspLogConfig = vscode.workspace.getConfiguration("luahelper.lspserver", null).get("log");
        var lspLogFlag = false;
        if (lspLogConfig !== undefined) {
            lspLogFlag = lspLogConfig;
        }
        // 定义所有的监控文件后缀的关联
        var filesWatchers = new Array();
        filesWatchers.push(vscode.workspace.createFileSystemWatcher("**/*.lua"));
        // 获取其他文件关联为lua的配置
        let fileAssociationsConfig = vscode.workspace.getConfiguration("files.associations", null);
        if (fileAssociationsConfig !== undefined) {
            for (const key of Object.keys(fileAssociationsConfig)) {
                if (fileAssociationsConfig.hasOwnProperty(key)) {
                    let strValue = fileAssociationsConfig[key];
                    if (strValue === "lua") {
                        // 如果映射为lua文件
                        filesWatchers.push(vscode.workspace.createFileSystemWatcher("**/" + key));
                    }
                }
            }
        }
        const clientOptions = {
            documentSelector: [{ scheme: 'file', language: LANGUAGE_ID }],
            synchronize: {
                configurationSection: ["luahelper", "files.associations"],
                fileEvents: filesWatchers,
            },
            initializationOptions: {
                client: 'vsc',
                PluginPath: exports.savedContext.extensionPath,
                referenceMaxNum: referenceMaxNum,
                referenceDefineFlag: referenceDefineFlag,
                FileAssociationsConfig: fileAssociationsConfig,
                AllEnable: getWarnCheckFlag("AllEnable"),
                CheckSyntax: getWarnCheckFlag("CheckSyntax"),
                CheckNoDefine: getWarnCheckFlag("CheckNoDefine"),
                CheckAfterDefine: getWarnCheckFlag("CheckAfterDefine"),
                CheckLocalNoUse: getWarnCheckFlag("CheckLocalNoUse"),
                CheckTableDuplicateKey: getWarnCheckFlag("CheckTableDuplicateKey"),
                CheckReferNoFile: getWarnCheckFlag("CheckReferNoFile"),
                CheckAssignParamNum: getWarnCheckFlag("CheckAssignParamNum"),
                CheckLocalDefineParamNum: getWarnCheckFlag("CheckLocalDefineParamNum"),
                CheckGotoLable: getWarnCheckFlag("CheckGotoLable"),
                CheckFuncParam: getWarnCheckFlag("CheckFuncParam"),
                CheckImportModuleVar: getWarnCheckFlag("CheckImportModuleVar"),
                CheckIfNotVar: getWarnCheckFlag("CheckIfNotVar"),
                CheckFunctionDuplicateParam: getWarnCheckFlag("CheckFunctionDuplicateParam"),
                CheckBinaryExpressionDuplicate: getWarnCheckFlag("CheckBinaryExpressionDuplicate"),
                CheckErrorOrAlwaysTrue: getWarnCheckFlag("CheckErrorOrAlwaysTrue"),
                CheckErrorAndAlwaysFalse: getWarnCheckFlag("CheckErrorAndAlwaysFalse"),
                CheckNoUseAssign: getWarnCheckFlag("CheckNoUseAssign"),
                CheckAnnotateType: getWarnCheckFlag("CheckAnnotateType"),
            },
            markdown: {
                isTrusted: true,
            }
        };
        var DEBUG_MODE = process.env['DEBUG_MODE'] === "true";
        if (lspStr !== "cmd rpc") {
            DEBUG_MODE = true;
        }
        // 调试模式，通过socket链接lsp后台程序
        if (DEBUG_MODE) {
            const connectionInfo = {
                host: "localhost",
                port: 7778
            };
            let serverOptions;
            serverOptions = () => {
                // Connect to language server via socket
                let socket = net.connect(connectionInfo);
                let result = {
                    writer: socket,
                    reader: socket
                };
                socket.on("close", () => {
                    vscode.window.showInformationMessage("luahelper connect close");
                    console.log("client connect error!");
                });
                return Promise.resolve(result);
            };
            client = new node_1.LanguageClient(LANGUAGE_ID, "luahelper plugin for vscode.", serverOptions, clientOptions);
            exports.savedContext.subscriptions.push(client.start());
            yield client.onReady();
        }
        else {
            let cp = "";
            let platform = os.platform();
            switch (platform) {
                case "win32":
                    cp = path.resolve(exports.savedContext.extensionPath, "server", "lualsp.exe");
                    break;
                case "linux":
                    cp = path.resolve(exports.savedContext.extensionPath, "server", "linuxlualsp");
                    break;
                case "darwin":
                    cp = path.resolve(exports.savedContext.extensionPath, "server", "maclualsp");
                    break;
            }
            if (cp === "") {
                return;
            }
            let serverOptions;
            //cp = cp + "/luachecklsp.exe";
            let logSetStr = "-logflag=0";
            if (lspLogFlag === true) {
                logSetStr = "-logflag=1";
            }
            serverOptions = {
                command: cp,
                args: ["-mode=1", logSetStr]
            };
            client = new node_1.LanguageClient(LANGUAGE_ID, "luahelper plugin for vscode.", serverOptions, clientOptions);
            exports.savedContext.subscriptions.push(client.start());
            yield client.onReady();
        }
        client.onNotification("luahelper/progressReport", (d) => {
            progressBar.show();
            progressBar.text = d.text;
            if (d.state === 2) {
                setTimeout(() => {
                    progressBar.hide();
                }, 3000);
            }
        });
    });
}
function stopServer() {
    if (client) {
        client.stop();
    }
}
function insertDebugCode() {
    return __awaiter(this, void 0, void 0, function* () {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }
        const document = activeEditor.document;
        if (document.languageId !== 'lua') {
            return;
        }
        console.log(os.arch());
        const ins = new vscode.SnippetString();
        //ins.appendText(`\n`);
        ins.appendText(`require("LuaPanda").start("127.0.0.1", 8818);`);
        //ins.appendText(`\n`);
        activeEditor.insertSnippet(ins);
    });
}
function copyDebugFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }
        let rootPathStr = vscode.workspace.workspaceFolders[0].uri;
        const arch = yield vscode.window.showOpenDialog({
            defaultUri: rootPathStr,
            openLabel: "add debug file",
            canSelectFolders: true,
            canSelectMany: false,
        });
        if (!arch || !arch.length) {
            console.log("not select dst director");
            return;
        }
        let pathArr = tools_1.Tools.VSCodeExtensionPath.split(path.sep);
        let srcPath = pathArr.join('/');
        srcPath = srcPath + "/debugger/LuaPanda.lua";
        let selectDstPath = arch[0];
        let dstPath = selectDstPath.fsPath + "/LuaPanda.lua";
        try {
            if (process.platform === "win32") {
                srcPath = pathArr.join('\\');
                srcPath = srcPath + "\\debugger\\LuaPanda.lua";
                dstPath = selectDstPath.fsPath + "\\LuaPanda.lua";
                let cmdStr = "copy " + srcPath + " " + dstPath + "/Y";
                console.log("cmdStr:%s", cmdStr);
                child_process.execSync(cmdStr);
                vscode.window.showInformationMessage("copy lua debug file success.");
            }
            else if (process.platform === "darwin") {
                let cmdStr = "cp -R " + srcPath + dstPath;
                console.log("cmdStr:%s", cmdStr);
                child_process.execSync(cmdStr);
                vscode.window.showInformationMessage("copy lua debug file success.");
            }
            else if (process.platform === "linux") {
                let cmdStr = "cp -a " + srcPath + dstPath;
                console.log("cmdStr:%s", cmdStr);
                child_process.execSync(cmdStr);
                vscode.window.showInformationMessage("copy lua debug file success.");
            }
        }
        catch (e) {
            //捕获异常
            console.log("exception", e);
        }
    });
}
function copyLuaSocket() {
    return __awaiter(this, void 0, void 0, function* () {
        let rootPathStr = vscode.workspace.workspaceFolders[0].uri;
        const arch = yield vscode.window.showOpenDialog({
            defaultUri: rootPathStr,
            openLabel: "copy luasocket",
            canSelectFolders: true,
            canSelectMany: false,
        });
        if (!arch || !arch.length) {
            console.log("not select dst director");
            return;
        }
        let selectDstPath = arch[0];
        let dstPath = selectDstPath.fsPath;
        let srcCopyDir = "";
        try {
            if (process.platform === "win32") {
                srcCopyDir = path.join(tools_1.Tools.VSCodeExtensionPath, '/debugger/luasocket/win/x64');
                let cmdStr = "xcopy " + srcCopyDir + " " + dstPath + " /S /Y";
                console.log("cmdStr:%s", cmdStr);
                child_process.execSync(cmdStr);
                vscode.window.showInformationMessage("copy lua socket lib success.");
            }
            else if (process.platform === "darwin") {
                srcCopyDir = path.join(tools_1.Tools.VSCodeExtensionPath, '/debugger/luasocket/mac');
                let cmdStr = "cp -R " + srcCopyDir + "/ " + dstPath + "/";
                console.log("cmdStr:%s", cmdStr);
                child_process.execSync(cmdStr);
                vscode.window.showInformationMessage("copy lua socket lib success.");
            }
            else if (process.platform === "linux") {
                srcCopyDir = path.join(tools_1.Tools.VSCodeExtensionPath, '/debugger/luasocket/linux');
                let cmdStr = "cp -a " + srcCopyDir + "/ " + dstPath + "/";
                console.log("cmdStr:%s", cmdStr);
                child_process.execSync(cmdStr);
                vscode.window.showInformationMessage("copy lua socket lib success.");
            }
        }
        catch (e) {
            //捕获异常
            console.log("exception", e);
        }
    });
}
function openDebugFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        let pathArr = tools_1.Tools.VSCodeExtensionPath.split(path.sep);
        let srcPath = pathArr.join('/');
        let cmdExeStr = "";
        if (process.platform === "win32") {
            srcPath = pathArr.join('\\');
            cmdExeStr = "explorer " + srcPath + "\\" + "debugger";
        }
        else if (process.platform === "darwin") {
            cmdExeStr = "open  " + srcPath + "/debugger";
        }
        else if (process.platform === "linux") {
            cmdExeStr = "nautilus  " + srcPath + "/debugger";
        }
        else {
            return;
        }
        try {
            child_process.execSync(cmdExeStr);
        }
        catch (e) {
            console.log("exception");
        }
    });
}
function setFormatConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        var vscodeRunStr = path.resolve(exports.savedContext.extensionPath, "server");
        let configPath = path.resolve(vscodeRunStr, "luafmt.config");
        try {
            yield vscode.window.showTextDocument(vscode.Uri.file(configPath));
        }
        catch (e) {
            console.log("setFormatConfig exception");
        }
    });
}
//# sourceMappingURL=extension.js.map