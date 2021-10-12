"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
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
exports.deactivate = exports.activate = exports.MakefileToolsExtension = exports.extension = void 0;
// Makefile Tools extension
const configuration = require("./configuration");
const cpptools = require("./cpptools");
const launch = require("./launch");
const logger = require("./logger");
const make = require("./make");
const path = require("path");
const state = require("./state");
const telemetry = require("./telemetry");
const tree = require("./tree");
const ui = require("./ui");
const util = require("./util");
const vscode = require("vscode");
const cpp = require("vscode-cpptools");
let statusBar = ui.getUI();
let launcher = launch.getLauncher();
class MakefileToolsExtension {
    constructor(extensionContext) {
        this.extensionContext = extensionContext;
        this._projectOutlineProvider = new tree.ProjectOutlineProvider();
        this._projectOutlineTreeView = vscode.window.createTreeView('makefile.outline', {
            treeDataProvider: this._projectOutlineProvider,
            showCollapseAll: false
        });
        this.cppConfigurationProvider = new cpptools.CppConfigurationProvider();
        this.mementoState = new state.StateManager(this.extensionContext);
        // Used for calling cppToolsAPI.notifyReady only once in a VSCode session.
        this.ranNotifyReadyInSession = false;
        // Similar to state.ranConfigureInCodebaseLifetime, but at the scope of a VSCode session
        this.completedConfigureInSession = false;
        this.cummulativeBrowsePath = [];
    }
    getCppConfigurationProvider() { return this.cppConfigurationProvider; }
    getState() { return this.mementoState; }
    dispose() {
        this._projectOutlineTreeView.dispose();
        if (this.cppToolsAPI) {
            this.cppToolsAPI.dispose();
        }
    }
    getRanNotifyReadyInSession() { return this.ranNotifyReadyInSession; }
    setRanNotifyReadyInSession(ran) { this.ranNotifyReadyInSession = ran; }
    getCompletedConfigureInSession() { return this.completedConfigureInSession; }
    setCompletedConfigureInSession(completed) { this.completedConfigureInSession = completed; }
    // Register this extension as a new provider or request an update
    registerCppToolsProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureCppToolsProviderRegistered();
            // Call notifyReady earlier than when the provider is updated,
            // as soon as we know that we are going to actually parse for IntelliSense.
            // This allows CppTools to ask earlier about source files in use
            // and Makefile Tools may return a targeted source file configuration
            // if it was already computed in our internal arrays (make.ts: customConfigProviderItems).
            // If the requested file isn't yet processed, it will get updated when configure is finished.
            // TODO: remember all requests that are coming and send an update as soon as we detect
            // any of them being pushed into make.customConfigProviderItems.
            if (this.cppToolsAPI) {
                if (!this.ranNotifyReadyInSession && this.cppToolsAPI.notifyReady) {
                    this.cppToolsAPI.notifyReady(this.cppConfigurationProvider);
                    this.setRanNotifyReadyInSession(true);
                }
            }
        });
    }
    // Request a custom config provider update.
    updateCppToolsProvider() {
        this.cppConfigurationProvider.logConfigurationProviderBrowse();
        if (this.cppToolsAPI) {
            this.cppToolsAPI.didChangeCustomConfiguration(this.cppConfigurationProvider);
        }
    }
    ensureCppToolsProviderRegistered() {
        // make sure this extension is registered as provider only once
        if (!this.cppConfigurationProviderRegister) {
            this.cppConfigurationProviderRegister = this.registerCppTools();
        }
        return this.cppConfigurationProviderRegister;
    }
    getCppToolsVersion() {
        var _a;
        return (_a = this.cppToolsAPI) === null || _a === void 0 ? void 0 : _a.getVersion();
    }
    registerCppTools() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cppToolsAPI) {
                this.cppToolsAPI = yield cpp.getCppToolsApi(cpp.Version.v4);
            }
            if (this.cppToolsAPI) {
                this.cppToolsAPI.registerCustomConfigurationProvider(this.cppConfigurationProvider);
            }
        });
    }
    clearCummulativeBrowsePath() {
        this.cummulativeBrowsePath = [];
    }
    buildCustomConfigurationProvider(customConfigProviderItem) {
        this.compilerFullPath = customConfigProviderItem.compilerFullPath;
        let provider = make.getDeltaCustomConfigurationProvider();
        const configuration = {
            defines: customConfigProviderItem.defines,
            standard: customConfigProviderItem.standard || "c++17",
            includePath: customConfigProviderItem.includes,
            forcedInclude: customConfigProviderItem.forcedIncludes,
            intelliSenseMode: customConfigProviderItem.intelliSenseMode,
            compilerPath: customConfigProviderItem.compilerFullPath,
            compilerArgs: customConfigProviderItem.compilerArgs,
            windowsSdkVersion: customConfigProviderItem.windowsSDKVersion
        };
        // cummulativeBrowsePath incorporates all the files and the includes paths
        // of all the compiler invocations of the current configuration
        customConfigProviderItem.files.forEach(filePath => {
            let uri = vscode.Uri.file(filePath);
            let sourceFileConfigurationItem = {
                uri,
                configuration,
            };
            // These are the configurations processed during the current configure.
            // Store them in the 'delta' file index instead of the final one.
            provider.fileIndex.set(path.normalize(uri.fsPath), sourceFileConfigurationItem);
            exports.extension.getCppConfigurationProvider().logConfigurationProviderItem(sourceFileConfigurationItem);
            let folder = path.dirname(filePath);
            if (!this.cummulativeBrowsePath.includes(folder)) {
                this.cummulativeBrowsePath.push(folder);
            }
        });
        customConfigProviderItem.includes.forEach(incl => {
            if (!this.cummulativeBrowsePath.includes(incl)) {
                this.cummulativeBrowsePath.push(incl);
            }
        });
        customConfigProviderItem.forcedIncludes.forEach(fincl => {
            let folder = path.dirname(fincl);
            if (!this.cummulativeBrowsePath.includes(folder)) {
                this.cummulativeBrowsePath.push(fincl);
            }
        });
        provider.workspaceBrowse = {
            browsePath: this.cummulativeBrowsePath,
            standard: customConfigProviderItem.standard,
            compilerPath: customConfigProviderItem.compilerFullPath,
            compilerArgs: customConfigProviderItem.compilerArgs,
            windowsSdkVersion: customConfigProviderItem.windowsSDKVersion
        };
        make.setCustomConfigurationProvider(provider);
    }
    getCompilerFullPath() { return this.compilerFullPath; }
}
exports.MakefileToolsExtension = MakefileToolsExtension;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        statusBar = ui.getUI();
        exports.extension = new MakefileToolsExtension(context);
        telemetry.activate();
        context.subscriptions.push(vscode.commands.registerCommand('makefile.setBuildConfiguration', () => __awaiter(this, void 0, void 0, function* () {
            yield configuration.setNewConfiguration();
        })));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.setBuildTarget', () => __awaiter(this, void 0, void 0, function* () {
            yield configuration.selectTarget();
        })));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.buildTarget', () => __awaiter(this, void 0, void 0, function* () {
            yield make.buildTarget(make.TriggeredBy.buildTarget, configuration.getCurrentTarget() || "", false);
        })));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.buildCleanTarget', () => __awaiter(this, void 0, void 0, function* () {
            yield make.buildTarget(make.TriggeredBy.buildCleanTarget, configuration.getCurrentTarget() || "", true);
        })));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.buildAll', () => __awaiter(this, void 0, void 0, function* () {
            yield make.buildTarget(make.TriggeredBy.buildAll, "all", false);
        })));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.buildCleanAll', () => __awaiter(this, void 0, void 0, function* () {
            yield make.buildTarget(make.TriggeredBy.buildCleanAll, "all", true);
        })));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.setLaunchConfiguration', () => __awaiter(this, void 0, void 0, function* () {
            yield configuration.selectLaunchConfiguration();
        })));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.launchDebug', () => __awaiter(this, void 0, void 0, function* () {
            yield launcher.debugCurrentTarget();
        })));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.launchRun', () => __awaiter(this, void 0, void 0, function* () {
            yield launcher.runCurrentTarget();
        })));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.getLaunchTargetPath', () => {
            telemetry.logEvent("getLaunchTargetPath");
            return launcher.getLaunchTargetPath();
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.launchTargetPath', () => {
            telemetry.logEvent("launchTargetPath");
            return launcher.launchTargetPath();
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.getLaunchTargetDirectory', () => {
            telemetry.logEvent("getLaunchTargetDirectory");
            return launcher.getLaunchTargetDirectory();
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.getLaunchTargetFileName', () => {
            telemetry.logEvent("getLaunchTargetFileName");
            return launcher.getLaunchTargetFileName();
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.launchTargetFileName', () => {
            telemetry.logEvent("launchTargetFileName");
            return launcher.launchTargetFileName();
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.getLaunchTargetArgs', () => {
            telemetry.logEvent("getLaunchTargetArgs");
            return launcher.getLaunchTargetArgs();
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.getLaunchTargetArgsConcat', () => {
            telemetry.logEvent("getLaunchTargetArgsConcat");
            return launcher.getLaunchTargetArgsConcat();
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.configure', () => __awaiter(this, void 0, void 0, function* () {
            yield make.configure(make.TriggeredBy.configure);
        })));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.cleanConfigure', () => __awaiter(this, void 0, void 0, function* () {
            yield make.cleanConfigure(make.TriggeredBy.cleanConfigure);
        })));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.preConfigure', () => __awaiter(this, void 0, void 0, function* () {
            yield make.preConfigure(make.TriggeredBy.preconfigure);
        })));
        // Reset state - useful for troubleshooting.
        context.subscriptions.push(vscode.commands.registerCommand('makefile.resetState', () => {
            telemetry.logEvent("commandResetState");
            exports.extension.getState().reset();
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.outline.configure', () => {
            return vscode.commands.executeCommand("makefile.configure");
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.outline.cleanConfigure', () => {
            return vscode.commands.executeCommand("makefile.cleanConfigure");
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.outline.preConfigure', () => {
            return vscode.commands.executeCommand("makefile.preConfigure");
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.outline.setLaunchConfiguration', () => {
            return vscode.commands.executeCommand("makefile.setLaunchConfiguration");
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.outline.launchDebug', () => {
            return vscode.commands.executeCommand("makefile.launchDebug");
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.outline.launchRun', () => {
            return vscode.commands.executeCommand("makefile.launchRun");
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.outline.setBuildTarget', () => {
            return vscode.commands.executeCommand("makefile.setBuildTarget");
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.outline.buildTarget', () => {
            return vscode.commands.executeCommand("makefile.buildTarget");
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.outline.buildCleanTarget', () => {
            return vscode.commands.executeCommand("makefile.buildCleanTarget");
        }));
        context.subscriptions.push(vscode.commands.registerCommand('makefile.outline.setBuildConfiguration', () => {
            return vscode.commands.executeCommand("makefile.setBuildConfiguration");
        }));
        configuration.readLoggingLevel();
        configuration.readExtensionOutputFolder();
        configuration.readExtensionLog();
        // Delete the extension log file, if exists
        let extensionLog = configuration.getExtensionLog();
        if (extensionLog && util.checkFileExistsSync(extensionLog)) {
            util.deleteFileSync(extensionLog);
        }
        // Delete the script that is created by this extension in the temporary folder
        // with the purpose of spliting a compilation command fragment into switch arguments
        // as the shell sees them. See more about this script in parser.ts, parseAnySwitchFromToolArguments.
        // We need to delete this file occasionally to ensure that the extension will not use indefinitely
        // an eventual old version, especially because for performance reasons we don't create this file
        // every time we use it (the configure process creates it every time it's not found on disk).
        // Deleting this script here ensures that every new VSCode instance will operate on up to date script functionality.
        let parseCompilerArgsScript = util.parseCompilerArgsScriptFile();
        if (util.checkFileExistsSync(parseCompilerArgsScript)) {
            util.deleteFileSync(parseCompilerArgsScript);
        }
        // Read configuration info from settings
        yield configuration.initFromStateAndSettings();
        if (configuration.getConfigureOnOpen()) {
            // Always clean configure on open
            yield make.cleanConfigure(make.TriggeredBy.cleanConfigureOnOpen);
        }
        // Analyze settings for type validation and telemetry
        let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
        let telemetryProperties = {};
        try {
            telemetryProperties = telemetry.analyzeSettings(workspaceConfiguration, "makefile", util.thisExtensionPackage().contributes.configuration.properties, true, telemetryProperties);
        }
        catch (e) {
            logger.message(e.message);
        }
        if (telemetryProperties && util.hasProperties(telemetryProperties)) {
            telemetry.logEvent("settings", telemetryProperties);
        }
    });
}
exports.activate = activate;
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.window.showInformationMessage('The extension "vscode-makefile-tools" is de-activated');
        yield telemetry.deactivate();
        const items = [
            exports.extension,
            launcher,
            statusBar
        ];
        for (const item of items) {
            if (item) {
                item.dispose();
            }
        }
    });
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map