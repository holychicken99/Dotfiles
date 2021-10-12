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
exports.getLauncher = exports.Launcher = exports.LaunchStatuses = void 0;
// Launch support: debug and run in terminal
const configuration = require("./configuration");
const extension = require("./extension");
const logger = require("./logger");
const make = require("./make");
const path = require("path");
const telemetry = require("./telemetry");
const util = require("./util");
const vscode = require("vscode");
var LaunchStatuses;
(function (LaunchStatuses) {
    LaunchStatuses["success"] = "success";
    LaunchStatuses["blocked"] = "blocked by (pre)configure or build";
    LaunchStatuses["noLaunchConfigurationSet"] = "no launch configuration set by the user";
    LaunchStatuses["launchTargetsListEmpty"] = "launch targets list empty";
    LaunchStatuses["buildFailed"] = "build failed";
})(LaunchStatuses = exports.LaunchStatuses || (exports.LaunchStatuses = {}));
let launcher;
class Launcher {
    constructor() {
        // Watch for the user closing our terminal
        this.onTerminalClose = vscode.window.onDidCloseTerminal(term => {
            if (term === this.launchTerminal) {
                this.launchTerminal = undefined;
            }
        });
    }
    // Command property accessible from launch.json:
    // the full path of the target binary currently set for launch
    getLaunchTargetPath() {
        let launchConfiguration = configuration.getCurrentLaunchConfiguration();
        if (launchConfiguration) {
            return launchConfiguration.binaryPath;
        }
        else {
            return "";
        }
    }
    // Command property accessible from launch.json:
    // calls getLaunchTargetPath after triggering a build of the current target,
    // if makefile.buildBeforeLaunch allows it.
    launchTargetPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (configuration.getBuildBeforeLaunch()) {
                yield make.buildTarget(make.TriggeredBy.launch, configuration.getCurrentTarget() || "");
            }
            return this.getLaunchTargetPath();
        });
    }
    // Command property accessible from launch.json:
    // the full path from where the target binary is to be launched
    getLaunchTargetDirectory() {
        let launchConfiguration = configuration.getCurrentLaunchConfiguration();
        if (launchConfiguration) {
            return launchConfiguration.cwd;
        }
        else {
            return util.getWorkspaceRoot();
        }
    }
    // Command property accessible from launch.json:
    // the file name of the current target binary, without path or extension.
    getLaunchTargetFileName() {
        let launchConfiguration = configuration.getCurrentLaunchConfiguration();
        if (launchConfiguration) {
            return path.parse(launchConfiguration.binaryPath).name;
        }
        else {
            return "";
        }
    }
    // Command property accessible from launch.json:
    // calls getLaunchTargetFileName after triggering a build of the current target,
    // if makefile.buildBeforeLaunch allows it.
    launchTargetFileName() {
        return __awaiter(this, void 0, void 0, function* () {
            if (configuration.getBuildBeforeLaunch()) {
                yield make.buildTarget(make.TriggeredBy.launch, configuration.getCurrentTarget() || "");
            }
            return this.getLaunchTargetFileName();
        });
    }
    // Command property accessible from launch.json:
    // the arguments sent to the target binary, returned as array of string
    // This is used by the debug/terminal VS Code APIs.
    getLaunchTargetArgs() {
        let launchConfiguration = configuration.getCurrentLaunchConfiguration();
        if (launchConfiguration) {
            return launchConfiguration.binaryArgs;
        }
        else {
            return [];
        }
    }
    // Command property accessible from launch.json:
    // the arguments sent to the target binary, returned as one simple string
    // This is an alternative to define the arguments in launch.json,
    // since the string array syntax is not working.
    // This is not a perfect solution, it all depends on how the main entry point
    // is parsing its given arguments.
    // Example: for [CWD>tool arg1 arg2 arg3], the tool will receive
    // 2 arguments: tool and "arg1 arg2 arg3"
    // As opposed to the above case when the tool will receive
    // 4 arguments: tool, arg1, arg2, arg3
    // TODO: investigate how we can define string array arguments
    // for the target binary in launch.json
    getLaunchTargetArgsConcat() {
        return this.getLaunchTargetArgs().join(" ");
    }
    // Invoke a VS Code debugging session passing it all the information
    // from the current launch configuration.
    // Debugger (imperfect) guess logic:
    //    - VS for msvc toolset, lldb for clang toolset, gdb for anything else.
    //    - debugger path is assumed to be the same as the compiler path.
    // Exceptions for miMode:
    //    - if the above logic results in a debugger that is missing, try the other one.
    //      This is needed either because the system might not be equipped
    //      with the preffered debugger that corresponds to the toolset in use,
    //      but also because there might be a compiler alias that is not properly identified
    //      (example: "cc" alias that points to clang but is not identified as clang,
    //       therefore requesting a gdb debugger which may be missing
    //       because there is no gcc toolset installed).
    //       TODO: implement proper detection of aliases and their commands.
    // Exceptions for miDebuggerPath:
    //    - for MacOS, point to the lldb-mi debugger that is installed by CppTools
    //    - if CppTools extension is not installed, intentionally do not provide a miDebuggerPath On MAC,
    //      because the debugger knows how to find automatically the right lldb-mi when miMode is lldb and miDebuggerPath is undefined
    //      (this is true for systems older than Catalina).
    // Additionally, cppvsdbg ignores miMode and miDebuggerPath.
    prepareDebugCurrentTarget(currentLaunchConfiguration) {
        let args = this.getLaunchTargetArgs();
        let compilerPath = extension.extension.getCompilerFullPath();
        let parsedObjPath = compilerPath ? path.parse(compilerPath) : undefined;
        let isClangCompiler = parsedObjPath === null || parsedObjPath === void 0 ? void 0 : parsedObjPath.name.startsWith("clang");
        let isMsvcCompiler = !isClangCompiler && (parsedObjPath === null || parsedObjPath === void 0 ? void 0 : parsedObjPath.name.startsWith("cl"));
        let dbg = (isMsvcCompiler) ? "cppvsdbg" : "cppdbg";
        // Initial debugger guess
        let guessMiDebuggerPath = (!isMsvcCompiler && parsedObjPath) ? parsedObjPath.dir : undefined;
        let guessMiMode;
        if (parsedObjPath === null || parsedObjPath === void 0 ? void 0 : parsedObjPath.name.startsWith("clang")) {
            guessMiMode = "lldb";
        }
        else if (!(parsedObjPath === null || parsedObjPath === void 0 ? void 0 : parsedObjPath.name.startsWith("cl"))) {
            guessMiMode = "gdb";
        }
        // If the first chosen debugger is not installed, try the other one.
        if (guessMiDebuggerPath && guessMiMode) {
            let debuggerPath = path.join(guessMiDebuggerPath, guessMiMode);
            if (process.platform === "win32") {
                // On mingw a file is not found if the extension is not part of the path
                debuggerPath = debuggerPath + ".exe";
            }
            if (!util.checkFileExistsSync(debuggerPath)) {
                guessMiMode = (guessMiMode === "gdb") ? "lldb" : "gdb";
            }
        }
        // Properties defined by makefile.launchConfigurations override makefile.defaultLaunchConfiguration
        // and they both override the guessed values.
        let defaultLaunchConfiguration = configuration.getDefaultLaunchConfiguration();
        let miMode = currentLaunchConfiguration.MIMode || (defaultLaunchConfiguration === null || defaultLaunchConfiguration === void 0 ? void 0 : defaultLaunchConfiguration.MIMode) || guessMiMode;
        let miDebuggerPath = currentLaunchConfiguration.miDebuggerPath || (defaultLaunchConfiguration === null || defaultLaunchConfiguration === void 0 ? void 0 : defaultLaunchConfiguration.miDebuggerPath) || guessMiDebuggerPath;
        // Exception for MAC-lldb, point to the lldb-mi installed by CppTools or set debugger path to undefined
        // (more details in the comment at the beginning of this function).
        if (miMode === "lldb" && process.platform === "darwin") {
            const cpptoolsExtension = vscode.extensions.getExtension('ms-vscode.cpptools');
            miDebuggerPath = cpptoolsExtension ? path.join(cpptoolsExtension.extensionPath, "debugAdapters", "lldb-mi", "bin", "lldb-mi") : undefined;
        }
        else if (miDebuggerPath && miMode) {
            miDebuggerPath = path.join(miDebuggerPath, miMode);
            if (process.platform === "win32") {
                miDebuggerPath = miDebuggerPath + ".exe";
            }
        }
        let debugConfig = {
            type: dbg,
            name: `Debug My Program`,
            request: 'launch',
            cwd: this.getLaunchTargetDirectory(),
            args,
            program: this.getLaunchTargetPath(),
            MIMode: miMode,
            miDebuggerPath: miDebuggerPath,
            console: "internalConsole",
            internalConsoleOptions: "openOnSessionStart",
            stopAtEntry: currentLaunchConfiguration.stopAtEntry || (defaultLaunchConfiguration === null || defaultLaunchConfiguration === void 0 ? void 0 : defaultLaunchConfiguration.stopAtEntry),
            symbolSearchPath: currentLaunchConfiguration.symbolSearchPath || (defaultLaunchConfiguration === null || defaultLaunchConfiguration === void 0 ? void 0 : defaultLaunchConfiguration.symbolSearchPath)
        };
        logger.message("Created the following debug config:\n   type = " + debugConfig.type +
            "\n   cwd = " + debugConfig.cwd + " (= " + this.getLaunchTargetDirectory() + ")" +
            "\n   args = " + args.join(" ") +
            "\n   program = " + debugConfig.program + " (= " + this.getLaunchTargetPath() + ")" +
            "\n   MIMode = " + debugConfig.MIMode +
            "\n   miDebuggerPath = " + debugConfig.miDebuggerPath +
            "\n   stopAtEntry = " + debugConfig.stopAtEntry +
            "\n   symbolSearchPath = " + debugConfig.symbolSearchPath);
        return debugConfig;
    }
    validateLaunchConfiguration(op) {
        return __awaiter(this, void 0, void 0, function* () {
            // Cannot debug the project if it is currently building or (pre-)configuring.
            if (make.blockedByOp(op)) {
                return LaunchStatuses.blocked;
            }
            if (configuration.getBuildBeforeLaunch()) {
                let currentBuildTarget = configuration.getCurrentTarget() || "";
                logger.message(`Building current target before launch: "${currentBuildTarget}"`);
                let buildSuccess = (yield make.buildTarget(make.TriggeredBy.buildTarget, currentBuildTarget, false)) === make.ConfigureBuildReturnCodeTypes.success;
                if (!buildSuccess) {
                    logger.message(`Building target "${currentBuildTarget}" failed.`);
                    let noButton = "No";
                    let yesButton = "Yes";
                    const chosen = yield vscode.window.showErrorMessage("Build failed. Do you want to continue anyway?", {
                        title: yesButton,
                        isCloseAffordance: false,
                    }, {
                        title: noButton,
                        isCloseAffordance: true
                    });
                    if (chosen === undefined || chosen.title === noButton) {
                        return LaunchStatuses.buildFailed;
                    }
                }
            }
            let currentLaunchConfiguration = configuration.getCurrentLaunchConfiguration();
            if (!currentLaunchConfiguration) {
                // If no launch configuration is set, give the user a chance to select one now from the quick pick
                // (unless we know it's going to be empty).
                if (configuration.getLaunchTargets().length === 0) {
                    vscode.window.showErrorMessage(`Cannot ${op} because there is no launch configuration set` +
                        " and the list of launch targets is empty. Double check the makefile configuration and the build target.");
                    return LaunchStatuses.launchTargetsListEmpty;
                }
                else {
                    vscode.window.showErrorMessage(`Cannot ${op} because there is no launch configuration set. Choose one from the quick pick.`);
                    yield configuration.selectLaunchConfiguration();
                    // Read again the current launch configuration. If a current launch configuration is stil not set
                    // (the user cancelled the quick pick or the parser found zero launch targets) message and fail.
                    currentLaunchConfiguration = configuration.getCurrentLaunchConfiguration();
                    if (!currentLaunchConfiguration) {
                        vscode.window.showErrorMessage(`Cannot ${op} until you select an active launch configuration.`);
                        return LaunchStatuses.noLaunchConfigurationSet;
                    }
                }
            }
            return LaunchStatuses.success;
        });
    }
    debugCurrentTarget() {
        return __awaiter(this, void 0, void 0, function* () {
            let status = yield this.validateLaunchConfiguration(make.Operations.debug);
            let currentLaunchConfiguration;
            if (status === LaunchStatuses.success) {
                currentLaunchConfiguration = configuration.getCurrentLaunchConfiguration();
            }
            if (currentLaunchConfiguration) {
                let debugConfig = this.prepareDebugCurrentTarget(currentLaunchConfiguration);
                let startFolder;
                if (vscode.workspace.workspaceFolders) {
                    startFolder = vscode.workspace.workspaceFolders[0];
                    yield vscode.debug.startDebugging(startFolder, debugConfig);
                }
                else {
                    yield vscode.debug.startDebugging(undefined, debugConfig);
                }
                if (!vscode.debug.activeDebugSession) {
                    status = "failed";
                }
            }
            let telemetryProperties = {
                status: status
            };
            telemetry.logEvent("debug", telemetryProperties);
            return vscode.debug.activeDebugSession;
        });
    }
    // Invoke a VS Code running terminal passing it all the information
    // from the current launch configuration
    prepareRunCurrentTarget() {
        // Add a pair of quotes just in case there is a space in the binary path
        let terminalCommand = '"' + this.getLaunchTargetPath() + '" ';
        terminalCommand += this.getLaunchTargetArgs().join(" ");
        // Log the message for high verbosity only because the output channel will become visible over the terminal,
        // even if the terminal show() is called after the logger show().
        logger.message("Running command '" + terminalCommand + "' in the terminal from location '" + this.getLaunchTargetDirectory() + "'", "Debug");
        return terminalCommand;
    }
    runCurrentTarget() {
        return __awaiter(this, void 0, void 0, function* () {
            const terminalOptions = {
                name: 'Make/Launch',
            };
            // Use cmd.exe on Windows
            if (process.platform === 'win32') {
                terminalOptions.shellPath = 'C:\\Windows\\System32\\cmd.exe';
            }
            terminalOptions.cwd = this.getLaunchTargetDirectory();
            if (!this.launchTerminal) {
                this.launchTerminal = vscode.window.createTerminal(terminalOptions);
            }
            let status = yield this.validateLaunchConfiguration(make.Operations.run);
            let currentLaunchConfiguration;
            if (status === LaunchStatuses.success) {
                currentLaunchConfiguration = configuration.getCurrentLaunchConfiguration();
                let terminalCommand = this.prepareRunCurrentTarget();
                this.launchTerminal.sendText(terminalCommand);
                let telemetryProperties = {
                    status: status
                };
                telemetry.logEvent("run", telemetryProperties);
                this.launchTerminal.show();
            }
            return this.launchTerminal;
        });
    }
    dispose() {
        if (this.launchTerminal) {
            this.launchTerminal.dispose();
        }
        this.onTerminalClose.dispose();
    }
}
exports.Launcher = Launcher;
function getLauncher() {
    if (launcher === undefined) {
        launcher = new Launcher();
    }
    return launcher;
}
exports.getLauncher = getLauncher;
//# sourceMappingURL=launch.js.map