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
exports.cleanConfigure = exports.doConfigure = exports.loadConfigurationFromCache = exports.preprocessDryRun = exports.configure = exports.runPreConfigureScript = exports.preConfigure = exports.generateParseContent = exports.setParseFile = exports.getParseFile = exports.setParseContent = exports.getParseContent = exports.doBuildTarget = exports.buildTarget = exports.setCurPID = exports.getCurPID = exports.prepareBuildTarget = exports.blockedByOp = exports.setCustomConfigurationProvider = exports.getDeltaCustomConfigurationProvider = exports.TriggeredBy = exports.Operations = exports.ConfigureBuildReturnCodeTypes = exports.setIsPreConfiguring = exports.getIsPreConfiguring = exports.setConfigureIsClean = exports.getConfigureIsClean = exports.setConfigureIsInBackground = exports.getConfigureIsInBackground = exports.setIsConfiguring = exports.getIsConfiguring = exports.setIsBuilding = exports.getIsBuilding = void 0;
// Support for make operations
const configuration = require("./configuration");
const extension_1 = require("./extension");
const fs = require("fs");
const logger = require("./logger");
const parser = require("./parser");
const path = require("path");
const util = require("./util");
const telemetry = require("./telemetry");
const vscode = require("vscode");
let isBuilding = false;
function getIsBuilding() { return isBuilding; }
exports.getIsBuilding = getIsBuilding;
function setIsBuilding(building) {
    isBuilding = building;
}
exports.setIsBuilding = setIsBuilding;
let isConfiguring = false;
function getIsConfiguring() { return isConfiguring; }
exports.getIsConfiguring = getIsConfiguring;
function setIsConfiguring(configuring) { isConfiguring = configuring; }
exports.setIsConfiguring = setIsConfiguring;
let configureIsInBackground = false;
function getConfigureIsInBackground() { return configureIsInBackground; }
exports.getConfigureIsInBackground = getConfigureIsInBackground;
function setConfigureIsInBackground(background) { configureIsInBackground = background; }
exports.setConfigureIsInBackground = setConfigureIsInBackground;
let configureIsClean = false;
function getConfigureIsClean() { return configureIsClean; }
exports.getConfigureIsClean = getConfigureIsClean;
function setConfigureIsClean(clean) { configureIsClean = clean; }
exports.setConfigureIsClean = setConfigureIsClean;
let isPreConfiguring = false;
function getIsPreConfiguring() { return isPreConfiguring; }
exports.getIsPreConfiguring = getIsPreConfiguring;
function setIsPreConfiguring(preConfiguring) { isPreConfiguring = preConfiguring; }
exports.setIsPreConfiguring = setIsPreConfiguring;
// Leave positive error codes for make exit values
var ConfigureBuildReturnCodeTypes;
(function (ConfigureBuildReturnCodeTypes) {
    ConfigureBuildReturnCodeTypes[ConfigureBuildReturnCodeTypes["success"] = 0] = "success";
    ConfigureBuildReturnCodeTypes[ConfigureBuildReturnCodeTypes["blocked"] = -1] = "blocked";
    ConfigureBuildReturnCodeTypes[ConfigureBuildReturnCodeTypes["cancelled"] = -2] = "cancelled";
    ConfigureBuildReturnCodeTypes[ConfigureBuildReturnCodeTypes["notFound"] = -3] = "notFound";
    ConfigureBuildReturnCodeTypes[ConfigureBuildReturnCodeTypes["outOfDate"] = -4] = "outOfDate";
    ConfigureBuildReturnCodeTypes[ConfigureBuildReturnCodeTypes["other"] = -5] = "other";
    ConfigureBuildReturnCodeTypes[ConfigureBuildReturnCodeTypes["saveFailed"] = -6] = "saveFailed";
})(ConfigureBuildReturnCodeTypes = exports.ConfigureBuildReturnCodeTypes || (exports.ConfigureBuildReturnCodeTypes = {}));
var Operations;
(function (Operations) {
    Operations["preConfigure"] = "pre-configure";
    Operations["configure"] = "configure";
    Operations["build"] = "build";
    Operations["changeConfiguration"] = "change makefile configuration";
    Operations["changeBuildTarget"] = "change build target";
    Operations["changeLaunchTarget"] = "change launch target";
    Operations["debug"] = "debug";
    Operations["run"] = "run";
})(Operations = exports.Operations || (exports.Operations = {}));
var TriggeredBy;
(function (TriggeredBy) {
    TriggeredBy["buildTarget"] = "command pallette (buildTarget)";
    TriggeredBy["buildCleanTarget"] = "command pallette (buildCleanTarget)";
    TriggeredBy["buildAll"] = "command pallette (buildAll)";
    TriggeredBy["buildCleanAll"] = "command pallette (buildCleanAll)";
    TriggeredBy["preconfigure"] = "command pallette (preConfigure)";
    TriggeredBy["alwaysPreconfigure"] = "settings (alwaysPreConfigure)";
    TriggeredBy["configure"] = "command pallette (configure)";
    TriggeredBy["configureOnOpen"] = "settings (configureOnOpen)";
    TriggeredBy["cleanConfigureOnOpen"] = "configure dirty (on open), settings (configureOnOpen)";
    TriggeredBy["cleanConfigure"] = "command pallette (clean configure)";
    TriggeredBy["configureBeforeBuild"] = "configure dirty (before build), settings (configureAfterCommand)";
    TriggeredBy["configureAfterConfigurationChange"] = "settings (configureAfterCommand), command pallette (setBuildConfiguration)";
    TriggeredBy["configureAfterEditorFocusChange"] = "configure dirty (editor focus change), settings (configureOnEdit)";
    TriggeredBy["configureBeforeTargetChange"] = "configure dirty (before target change), settings (configureAfterCommand)";
    TriggeredBy["configureAfterTargetChange"] = "settings (configureAfterCommand), command pallette (setBuildTarget)";
    TriggeredBy["configureBeforeLaunchTargetChange"] = "configureDirty (before launch target change), settings (configureAfterCommand)";
    TriggeredBy["launch"] = "Launch (debug|run)";
})(TriggeredBy = exports.TriggeredBy || (exports.TriggeredBy = {}));
let fileIndex = new Map();
let workspaceBrowseConfiguration = { browsePath: [] };
function getDeltaCustomConfigurationProvider() {
    let provider = {
        fileIndex: fileIndex,
        workspaceBrowse: workspaceBrowseConfiguration
    };
    return provider;
}
exports.getDeltaCustomConfigurationProvider = getDeltaCustomConfigurationProvider;
function setCustomConfigurationProvider(provider) {
    fileIndex = provider.fileIndex;
    workspaceBrowseConfiguration = provider.workspaceBrowse;
}
exports.setCustomConfigurationProvider = setCustomConfigurationProvider;
// Identifies and logs whether an operation should be prevented from running.
// So far, the only blocking scenarios are if an ongoing configure, pre-configure or build
// is blocking other new similar operations and setter commands (selection of new configurations, targets, etc...)
// Getter commands are not blocked, even if by the time the (pre-)configure or build operations are completed
// they might be out of date.
// For the moment, the status bar buttons don't change when an operation is blocked
// and cancelling is done only via a button in the bottom right popup.
// Clicking the status bar buttons attempts to run the corresponding operation,
// which triggers a popup and returns early if it should be blocked. Same for pallette commands.
// In future we may enable/disable or change text depending on the blocking state.
function blockedByOp(op, showPopup = true) {
    let blocker;
    if (getIsPreConfiguring()) {
        blocker = Operations.preConfigure;
    }
    if (getIsConfiguring()) {
        // A configure in the background shouldn't block anything except another configure
        if (getConfigureIsInBackground() && op !== Operations.configure) {
            vscode.window.showInformationMessage(`The project is configuring in the background and ${op} may run on out-of-date input.`);
        }
        else {
            blocker = Operations.configure;
        }
    }
    if (getIsBuilding()) {
        blocker = Operations.build;
    }
    if (blocker && showPopup) {
        vscode.window.showErrorMessage(`Cannot "${op}" because the project is already doing a ${blocker}.`);
    }
    return blocker;
}
exports.blockedByOp = blockedByOp;
function saveAll() {
    return __awaiter(this, void 0, void 0, function* () {
        if (configuration.getSaveBeforeBuildOrConfigure()) {
            logger.message("Saving opened files before build.");
            let saveSuccess = yield vscode.workspace.saveAll();
            if (saveSuccess) {
                return true;
            }
            else {
                logger.message("Saving opened files failed.");
                let yesButton = "Yes";
                let noButton = "No";
                const chosen = yield vscode.window.showErrorMessage("Saving opened files failed. Do you want to continue anyway?", {
                    title: yesButton,
                    isCloseAffordance: false,
                }, {
                    title: noButton,
                    isCloseAffordance: true
                });
                return chosen !== undefined && chosen.title === yesButton;
            }
        }
        else {
            return true;
        }
    });
}
function prepareBuildTarget(target) {
    let makeArgs = [];
    // Prepend the target to the arguments given in the configurations json.
    // If a clean build is desired, "clean" should precede the target.
    if (target) {
        makeArgs.push(target);
    }
    makeArgs = makeArgs.concat(configuration.getConfigurationMakeArgs());
    logger.message(`Building target "${target}" with command: "` + configuration.getConfigurationMakeCommand() + " " + makeArgs.join(" ") + '"');
    return makeArgs;
}
exports.prepareBuildTarget = prepareBuildTarget;
// Build targets allow list for telemetry
function processTargetForTelemetry(target) {
    if (!target || target === "") {
        return "(unset)";
    }
    else if (target === "all" || target === "clean") {
        return target;
    }
    return "..."; // private undisclosed info
}
// PID of the process that may be running currently.
// At any moment, there is either no process or only one process running
// (make for configure, make for build or pre-configure cmd/bash).
// TODO: improve the code regarding curPID and how util.spawnChildProcess is setting it in make.ts unit.
let curPID = -1;
function getCurPID() { return curPID; }
exports.getCurPID = getCurPID;
function setCurPID(pid) { curPID = pid; }
exports.setCurPID = setCurPID;
function buildTarget(triggeredBy, target, clean = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (blockedByOp(Operations.build)) {
            return ConfigureBuildReturnCodeTypes.blocked;
        }
        if (!saveAll()) {
            return ConfigureBuildReturnCodeTypes.saveFailed;
        }
        logger.showOutputChannel();
        logger.clearOutputChannel();
        // Same start time for build and an eventual configure.
        let buildStartTime = Date.now();
        // warn about an out of date configure state and configure if makefile.configureAfterCommand allows.
        let configureExitCode; // used for telemetry
        let configureElapsedTime; // used for telemetry
        if (extension_1.extension.getState().configureDirty) {
            logger.message("The project needs to configure in order to build properly the current target.");
            if (configuration.getConfigureAfterCommand()) {
                configureExitCode = yield configure(TriggeredBy.configureBeforeBuild);
                if (configureExitCode !== ConfigureBuildReturnCodeTypes.success) {
                    logger.message("Attempting to run build after a failed configure.");
                }
                configureElapsedTime = util.elapsedTimeSince(buildStartTime);
            }
        }
        // Prepare a notification popup
        let config = configuration.getCurrentMakefileConfiguration();
        let configAndTarget = config;
        if (target) {
            target = target.trimLeft();
            if (target !== "") {
                configAndTarget += "/" + target;
            }
        }
        configAndTarget = `"${configAndTarget}"`;
        let popupStr = 'Building ' + (clean ? "clean " : "") + 'the current makefile configuration ' + configAndTarget;
        let cancelBuild = false; // when the build was cancelled by the user
        try {
            return yield vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: popupStr,
                cancellable: true,
            }, (progress, cancel) => __awaiter(this, void 0, void 0, function* () {
                cancel.onCancellationRequested(() => __awaiter(this, void 0, void 0, function* () {
                    progress.report({ increment: 1, message: "Cancelling..." });
                    logger.message("The user is cancelling the build...");
                    cancelBuild = true;
                    // Kill make and all its children subprocesses.
                    logger.message(`Attempting to kill the make process (PID = ${curPID}) and all its children subprocesses...`);
                    yield vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Cancelling build",
                        cancellable: false,
                    }, (progress) => __awaiter(this, void 0, void 0, function* () {
                        yield util.killTree(progress, curPID);
                    }));
                }));
                setIsBuilding(true);
                if (clean) {
                    // We don't need to track the return code for 'make "clean"'.
                    // We want to proceed with the 'make "target"' step anyway.
                    // The relevant return code for telemetry will be the second one.
                    // If the clean step fails, doBuildTarget will print an error message in the log.
                    yield doBuildTarget(progress, "clean");
                }
                let retc = yield doBuildTarget(progress, target);
                // We need to know whether this build was cancelled by the user
                // more than the real exit code of the make process in this circumstance.
                if (cancelBuild) {
                    retc = ConfigureBuildReturnCodeTypes.cancelled;
                }
                let buildElapsedTime = util.elapsedTimeSince(buildStartTime);
                const telemetryProperties = {
                    exitCode: retc.toString(),
                    target: processTargetForTelemetry(target),
                    triggeredBy: triggeredBy
                };
                const telemetryMeasures = {
                    buildTotalElapsedTime: buildElapsedTime
                };
                // Report if this build ran also a configure and how long it took.
                if (configureExitCode !== undefined) {
                    telemetryProperties.configureExitCode = configureExitCode.toString();
                }
                if (configureElapsedTime !== undefined) {
                    telemetryMeasures.configureElapsedTime = configureElapsedTime;
                }
                telemetry.logEvent("build", telemetryProperties, telemetryMeasures);
                cancelBuild = false;
                if (retc !== ConfigureBuildReturnCodeTypes.success) {
                    logger.showOutputChannel();
                }
                return retc;
            }));
        }
        finally {
            setIsBuilding(false);
        }
    });
}
exports.buildTarget = buildTarget;
function doBuildTarget(progress, target) {
    return __awaiter(this, void 0, void 0, function* () {
        let makeArgs = prepareBuildTarget(target);
        try {
            // Append without end of line since there is one already included in the stdout/stderr fragments
            let stdout = (result) => {
                logger.messageNoCR(result, "Normal");
                progress.report({ increment: 1, message: "..." });
            };
            let stderr = (result) => {
                logger.messageNoCR(result, "Normal");
            };
            // The build invocation should use the system locale.
            const result = yield util.spawnChildProcess(configuration.getConfigurationMakeCommand(), makeArgs, util.getWorkspaceRoot(), false, stdout, stderr);
            if (result.returnCode !== ConfigureBuildReturnCodeTypes.success) {
                logger.message(`Target ${target} failed to build.`);
            }
            else {
                logger.message(`Target ${target} built successfully.`);
            }
            return result.returnCode;
        }
        catch (error) {
            // No need for notification popup, since the build result is visible already in the output channel
            logger.message(error);
            return ConfigureBuildReturnCodeTypes.notFound;
        }
    });
}
exports.doBuildTarget = doBuildTarget;
// Content to be parsed by various operations post configure (like finding all build/launch targets).
// Represents the content of the provided makefile.buildLog or a fresh output of make --dry-run
// (which is also written into makefile.configurationCachePath).
let parseContent;
function getParseContent() { return parseContent; }
exports.getParseContent = getParseContent;
function setParseContent(content) { parseContent = content; }
exports.setParseContent = setParseContent;
// The source file of parseContent (build log or configuration dryrun cache).
let parseFile;
function getParseFile() { return parseFile; }
exports.getParseFile = getParseFile;
function setParseFile(file) { parseFile = file; }
exports.setParseFile = setParseFile;
// Targets need to parse a dryrun make invocation that does not include a target name
// (other than default empty "" or the standard "all"), otherwise it would produce
// a subset of all the targets involved in the makefile (only the ones triggered
// by building the current target).
function generateParseContent(progress, cancel, forTargets = false, recursive = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (cancel.isCancellationRequested) {
            return {
                retc: ConfigureBuildReturnCodeTypes.cancelled,
                elapsed: 0
            };
        }
        let startTime = Date.now();
        // Rules for parse content and file:
        //     1. makefile.buildLog provided by the user in settings
        //     2. configuration cache (the previous dryrun output): makefile.configurationCachePath
        //     3. the make dryrun output if (2) is missing
        // We do not use buildLog for build targets analysis because
        // we can afford to invoke make -pRrq (very quick even on large projects).
        let buildLog = configuration.getConfigurationBuildLog();
        if (buildLog && !forTargets) {
            parseContent = util.readFile(buildLog);
            if (parseContent) {
                parseFile = buildLog;
                return {
                    retc: ConfigureBuildReturnCodeTypes.success,
                    elapsed: util.elapsedTimeSince(startTime)
                };
            }
        }
        progress.report({
            increment: 1, message: "Generating dry-run output" +
                ((recursive) ? " (recursive)" : "") +
                ((forTargets) ? " (for targets specifically)" : "" +
                    "...")
        });
        // Continue with the make dryrun invocation
        let makeArgs = [];
        // Prepend the target to the arguments given in the makefile.configurations object,
        // unless we want to parse for the full set of available targets.
        if (forTargets) {
            makeArgs.push("all");
        }
        else {
            let currentTarget = configuration.getCurrentTarget();
            if (currentTarget) {
                makeArgs.push(currentTarget);
            }
        }
        // Include all the make arguments defined in makefile.configurations.makeArgs
        makeArgs = makeArgs.concat(configuration.getConfigurationMakeArgs());
        // If we are analyzing build targets, we need the following switches:
        //  --print-data-base (which generates verbose output where we parse targets from).
        // --no-builtin-variables and --no-builtin-rules (to reduce the size of the
        // output produced by --print-data-base and also to obtain a list of targets
        // that make sense, skipping over implicit targets like objects from sources
        // or binaries from objects and libs).
        // --question (to not execute anything, for us equivalent of dry-run
        // but without printing commands, which contributes again to a smaller output).
        // If we are analyzing compiler/linker commands for IntelliSense and launch targets,
        // we use --dry-run and anything from makefile.dryrunSwitches.
        const dryrunSwitches = configuration.getDryrunSwitches();
        if (forTargets) {
            makeArgs.push("--print-data-base");
            makeArgs.push("--no-builtin-variables");
            makeArgs.push("--no-builtin-rules");
            makeArgs.push("--question");
            logger.messageNoCR("Generating targets information with command: ");
        }
        else {
            makeArgs.push("--dry-run");
            // If this is not a clean configure, remove --always-make from the arguments list.
            // We need to have --always-make in makefile.dryrunSwitches and remove it for not clean configure
            // (as opposed to not having --always-make in makefile.dryrunSwitches and adding it for clean configure)
            // because we want to avoid having 2 dryrun switches settings (one for clean and one for not clean configure)
            // and also because the user needs to be able to remove --always-make from any make --dry-run invocation,
            // if it causes trouble.
            dryrunSwitches === null || dryrunSwitches === void 0 ? void 0 : dryrunSwitches.forEach(sw => {
                if (getConfigureIsClean() || (sw !== "--always-make" && sw !== "-B")) {
                    makeArgs.push(sw);
                }
            });
            logger.messageNoCR("Generating " + (getConfigureIsInBackground() ? "in the background a new " : "") + "configuration cache with command: ");
        }
        logger.message(configuration.getConfigurationMakeCommand() + " " + makeArgs.join(" "));
        try {
            let dryrunFile = forTargets ? "./targets.log" : "./dryrun.log";
            let extensionOutputFolder = configuration.getExtensionOutputFolder();
            if (extensionOutputFolder) {
                dryrunFile = path.join(extensionOutputFolder, dryrunFile);
            }
            dryrunFile = util.resolvePathToRoot(dryrunFile);
            logger.message(`Writing the dry-run output: ${dryrunFile}`);
            util.writeFile(dryrunFile, configuration.getConfigurationMakeCommand() + " " + makeArgs.join(" ") + "\r\n");
            let stdoutStr = "";
            let stderrStr = "";
            let heartBeat = Date.now();
            let stdout = (result) => {
                stdoutStr += result;
                fs.appendFileSync(dryrunFile, `${result} \r\n`);
                progress.report({ increment: 1, message: "Generating dry-run output" +
                        ((recursive) ? " (recursive)" : "") +
                        ((forTargets) ? " (for targets specifically)" : "" +
                            "...") });
                heartBeat = Date.now();
            };
            let stderr = (result) => {
                fs.appendFileSync(dryrunFile, `${result} \r\n`);
                stderrStr += result;
            };
            const heartBeatTimeout = 30; // half minute. TODO: make this a setting
            let timeout = setInterval(function () {
                let elapsedHeartBit = util.elapsedTimeSince(heartBeat);
                if (elapsedHeartBit > heartBeatTimeout) {
                    vscode.window.showWarningMessage("Dryrun timeout. See Makefile Tools Output Channel for details.");
                    logger.message("Dryrun timeout. Verify that the make command works properly " +
                        "in your development terminal (it could wait for stdin).");
                    logger.message(`Double check the dryrun output log: ${dryrunFile}`);
                    // It's enough to show this warning popup once.
                    clearInterval(timeout);
                }
            }, 5 * 1000);
            // The dry-run analysis should operate on english.
            const result = yield util.spawnChildProcess(configuration.getConfigurationMakeCommand(), makeArgs, util.getWorkspaceRoot(), true, stdout, stderr);
            clearInterval(timeout);
            let elapsedTime = util.elapsedTimeSince(startTime);
            logger.message(`Generating dry-run elapsed time: ${elapsedTime}`);
            parseFile = dryrunFile;
            parseContent = stdoutStr;
            // The error codes returned by the targets invocation (make -pRrq) mean something else
            // (for example if targets are out of date). We can ignore the return code for this
            // because it "can't fail". It represents only display of database and no targets are actually run.
            // try syntax error
            if (result.returnCode !== ConfigureBuildReturnCodeTypes.success && !forTargets) {
                logger.message("The make dry-run command failed.");
                logger.message("IntelliSense may work only partially or not at all.");
                logger.message(stderrStr);
                // Report the standard dry-run error & guide only when the configure was not cancelled
                // by the user (which causes retCode to be null).
                // Also don't write the cache if this operation was cancelled
                // because it may be incomplete and affect a future non clean configure.
                if (result.returnCode !== null) {
                    util.reportDryRunError(dryrunFile);
                }
            }
            curPID = -1;
            return {
                retc: result.returnCode,
                elapsed: elapsedTime
            };
        }
        catch (error) {
            logger.message(error);
            return {
                retc: ConfigureBuildReturnCodeTypes.notFound,
                elapsed: util.elapsedTimeSince(startTime)
            };
        }
    });
}
exports.generateParseContent = generateParseContent;
function preConfigure(triggeredBy) {
    return __awaiter(this, void 0, void 0, function* () {
        if (blockedByOp(Operations.preConfigure)) {
            return ConfigureBuildReturnCodeTypes.blocked;
        }
        let preConfigureStartTime = Date.now();
        let scriptFile = configuration.getPreConfigureScript();
        if (!scriptFile) {
            vscode.window.showErrorMessage("Pre-configure failed: no script provided.");
            logger.message("No pre-configure script is set in settings. " +
                "Make sure a pre-configuration script path is defined with makefile.preConfigureScript.");
            return ConfigureBuildReturnCodeTypes.notFound;
        }
        if (!util.checkFileExistsSync(scriptFile)) {
            vscode.window.showErrorMessage("Could not find pre-configure script.");
            logger.message(`Could not find the given pre-configure script "${scriptFile}" on disk. `);
            return ConfigureBuildReturnCodeTypes.notFound;
        }
        let cancelPreConfigure = false; // when the pre-configure was cancelled by the user
        try {
            return yield vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Pre-configuring: ${scriptFile}`,
                cancellable: true,
            }, (progress, cancel) => __awaiter(this, void 0, void 0, function* () {
                cancel.onCancellationRequested(() => __awaiter(this, void 0, void 0, function* () {
                    progress.report({ increment: 1, message: "Cancelling..." });
                    cancelPreConfigure = true;
                    logger.message("The user is cancelling the pre-configure...");
                    logger.message(`Attempting to kill the console process (PID = ${curPID}) and all its children subprocesses...`);
                    yield vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Cancelling pre-configure",
                        cancellable: false,
                    }, (progress) => __awaiter(this, void 0, void 0, function* () {
                        yield util.killTree(progress, curPID);
                    }));
                }));
                setIsPreConfiguring(true);
                let retc = yield runPreConfigureScript(progress, scriptFile || ""); // get rid of || ""
                // We need to know whether this pre-configure was cancelled by the user
                // more than the real exit code of the pr-econfigure script in this circumstance.
                if (cancelPreConfigure) {
                    retc = ConfigureBuildReturnCodeTypes.cancelled;
                }
                let preConfigureElapsedTime = util.elapsedTimeSince(preConfigureStartTime);
                const telemetryMeasures = {
                    preConfigureElapsedTime: preConfigureElapsedTime
                };
                const telemetryProperties = {
                    exitCode: retc.toString(),
                    triggeredBy: triggeredBy
                };
                telemetry.logEvent("preConfigure", telemetryProperties, telemetryMeasures);
                cancelPreConfigure = false;
                if (retc !== ConfigureBuildReturnCodeTypes.success) {
                    logger.showOutputChannel();
                }
                return retc;
            }));
        }
        finally {
            setIsPreConfiguring(false);
        }
    });
}
exports.preConfigure = preConfigure;
// Applies to the current process all the environment variables that resulted from the pre-configure step.
// The input 'content' represents the output of a command that lists all the environment variables:
// set on windows or printenv on linux/mac.
function applyEnvironment(content) {
    return __awaiter(this, void 0, void 0, function* () {
        let lines = (content === null || content === void 0 ? void 0 : content.split(/\r?\n/)) || [];
        lines.forEach(line => {
            let eqPos = line.search("=");
            // Sometimes we get a "" line and searching for = returns -1. Skip.
            if (eqPos !== -1) {
                let envVarName = line.substring(0, eqPos);
                let envVarValue = line.substring(eqPos + 1, line.length);
                process.env[envVarName] = envVarValue;
            }
        });
    });
}
function runPreConfigureScript(progress, scriptFile) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.message(`Pre-configuring...\nScript: "${configuration.getPreConfigureScript()}"`);
        // Create a temporary wrapper for the user pre-configure script so that we collect
        // in another temporary output file the environrment variables that were produced.
        let wrapScriptFile = path.join(util.tmpDir(), "wrapPreconfigureScript");
        let wrapScriptOutFile = wrapScriptFile + ".out";
        let wrapScriptContent;
        if (process.platform === "win32") {
            wrapScriptContent = `call "${scriptFile}"\r\n`;
            wrapScriptContent += `set > "${wrapScriptOutFile}"`;
            wrapScriptFile += ".bat";
        }
        else {
            wrapScriptContent = `source '${scriptFile}'\n`;
            wrapScriptContent += `printenv > '${wrapScriptOutFile}'`;
            wrapScriptFile += ".sh";
        }
        util.writeFile(wrapScriptFile, wrapScriptContent);
        let scriptArgs = [];
        let runCommand;
        if (process.platform === 'win32') {
            runCommand = "cmd";
            scriptArgs.push("/c");
            scriptArgs.push(`"${wrapScriptFile}"`);
        }
        else {
            runCommand = "/bin/bash";
            scriptArgs.push("-c");
            scriptArgs.push(`"source '${wrapScriptFile}'"`);
        }
        try {
            let stdout = (result) => {
                progress.report({ increment: 1, message: "..." });
                logger.messageNoCR(result, "Normal");
            };
            let someErr = false;
            let stderr = (result) => {
                someErr = true;
                logger.messageNoCR(result, "Normal");
            };
            // The preconfigure invocation should use the system locale.
            const result = yield util.spawnChildProcess(runCommand, scriptArgs, util.getWorkspaceRoot(), false, stdout, stderr);
            if (result.returnCode === ConfigureBuildReturnCodeTypes.success) {
                if (someErr) {
                    // Depending how the preconfigure scripts (and any inner called sub-scripts) are written,
                    // it may happen that the final error code returned by them to be succesful even if
                    // previous steps reported errors.
                    // Until a better error code analysis, simply warn wih a logger message and turn the successful
                    // return code into ConfigureBuildReurnCodeTypes.other, which would let us know in telemetry
                    // of this specific situation.
                    result.returnCode = ConfigureBuildReturnCodeTypes.other;
                    logger.message("The pre-configure script returned success code " +
                        "but somewhere during the preconfigure process there were errors reported. " +
                        "Double check the preconfigure output in the Makefile Tools channel.");
                }
                else {
                    logger.message("The pre-configure succeeded.");
                }
            }
            else {
                logger.message("The pre-configure script failed. This project may not configure successfully.");
            }
            // Apply the environment produced by running the pre-configure script.
            yield applyEnvironment(util.readFile(wrapScriptOutFile));
            return result.returnCode;
        }
        catch (error) {
            logger.message(error);
            return ConfigureBuildReturnCodeTypes.notFound;
        }
    });
}
exports.runPreConfigureScript = runPreConfigureScript;
// What makes a configure succesful or failed.
// This is not called when there was a cancellation, to simplify the logic and rules.
// Here are some considerations:
// 1.   If generate parse content returns a non successful return code,
// which is very frequent in the case of make --dry-run, we can't consider this
// as a configure failure because it is a problem in the developer environment/code base.
// Most of the times we get valuable output to parse regardless of some minor error
// at the end of the process. The user is notified about the dry-run error
// and is given steps to fix that, in case it is a bug in the extension.
// 2.   Preprocessing the build log or the dryrun output, together with all the parsers
// either succeed or are cancelled. For now there is no other failure scenario.
// Since this analyze helper is never called when configure is cancelled,
// it means that the outcome of these 4 subphases does not affect the total return code.
function analyzeConfigureSubphases(stats) {
    var _a, _b, _c;
    // Generate parse content is a critical phase. Either if it reads from a build log
    // or invokes make --dry-run, a not found means there's nothing to parse.
    // Same applies for the phase that computes the build targets, which always invokes make.
    if (((_a = stats.generateParseContent) === null || _a === void 0 ? void 0 : _a.retc) === ConfigureBuildReturnCodeTypes.notFound ||
        ((_b = stats.dryrunTargets) === null || _b === void 0 ? void 0 : _b.retc) === ConfigureBuildReturnCodeTypes.notFound) {
        // But if a configure was successful from cache, return outOfDate and not failure.
        return ((_c = stats.loadFromCache) === null || _c === void 0 ? void 0 : _c.retc) === ConfigureBuildReturnCodeTypes.success ?
            ConfigureBuildReturnCodeTypes.outOfDate :
            ConfigureBuildReturnCodeTypes.notFound;
    }
    // The outcome of a recursive configure invalidates any other previous returns.
    if (stats.recursiveConfigure) {
        return analyzeConfigureSubphases(stats.recursiveConfigure);
    }
    return ConfigureBuildReturnCodeTypes.success;
}
// Process a list of possible undefined status properties and return an array
// easy to log or send to telemetry.
// The caller of "getRelevantConfigStats" sends "stats" of type "ConfigureSubphasesStatus"
// but we need to declare it here as "any" to be able to index by prop (a string) below.
function getRelevantConfigStats(stats) {
    let relevantStats = [];
    let retCodeProps = Object.getOwnPropertyNames(stats);
    retCodeProps.forEach(prop => {
        if (prop.toString() === "recursiveConfigure") {
            let recursiveRetCodes = getRelevantConfigStats(stats[prop]);
            recursiveRetCodes.forEach(recursiveRetCode => {
                relevantStats.push({
                    name: prop.toString() + "." + recursiveRetCode.name,
                    status: {
                        retc: recursiveRetCode.status.retc,
                        elapsed: recursiveRetCode.status.elapsed
                    }
                });
            });
        }
        else {
            relevantStats.push({
                name: prop.toString(),
                status: {
                    retc: stats[prop].retc,
                    elapsed: stats[prop].elapsed
                }
            });
        }
    });
    return relevantStats;
}
// A non clean configure loads first any pre-existing cache, so that the user
// has IntelliSense and build/launch targets available earlier.
// Then invokes make dry-run (without --always-make which is used for clean configure only)
// or reads from a provided build log and parses new content to be added to the configuration cache.
// The configuration cache content and the CppTools custom IntelliSense provider are not reset.
// This way we can add incrementally to what has been parsed from the previous clean configure.
// There is the downside that any files that are removed from the makefile
// (thus disappearing from the log with commands) will still have IntelliSense loaded
// until the next clean configure.
function configure(triggeredBy, updateTargets = true) {
    return __awaiter(this, void 0, void 0, function* () {
        // Mark that this workspace had at least one attempt at configuring, before any chance of early return,
        // to accurately identify whether this project configured successfully out of the box or not.
        let ranConfigureInCodebaseLifetime = extension_1.extension.getState().ranConfigureInCodebaseLifetime;
        extension_1.extension.getState().ranConfigureInCodebaseLifetime = true;
        if (blockedByOp(Operations.configure)) {
            return ConfigureBuildReturnCodeTypes.blocked;
        }
        if (!saveAll()) {
            return ConfigureBuildReturnCodeTypes.saveFailed;
        }
        // Same start time for configure and an eventual pre-configure.
        let configureStartTime = Date.now();
        let preConfigureExitCode; // used for telemetry
        let preConfigureElapsedTime; // used for telemetry
        if (configuration.getAlwaysPreConfigure()) {
            preConfigureExitCode = yield preConfigure(TriggeredBy.alwaysPreconfigure);
            if (preConfigureExitCode !== ConfigureBuildReturnCodeTypes.success) {
                logger.message("Attempting to run configure after a failed pre-configure.");
            }
            preConfigureElapsedTime = util.elapsedTimeSince(configureStartTime);
        }
        // Identify for telemetry whether this configure will invoke make --dry-run or will read from a build log
        // If a build log is set and it exists, we are sure make --dry-run is not getting invoked.
        let makeDryRun = true;
        let buildLog = configuration.getConfigurationBuildLog();
        if (buildLog && util.checkFileExistsSync(buildLog)) {
            makeDryRun = false;
        }
        // Identify for telemetry whether this configure will read configuration constructs from cache.
        let readCache = false;
        let configurationCachePath = configuration.getConfigurationCachePath();
        if (configurationCachePath && util.checkFileExistsSync(configurationCachePath)) {
            readCache = true;
        }
        // Identify for telemetry whether:
        //   - this configure will need to double the workload, if it needs to analyze the build targets separately.
        //   - this configure will need to reset the build target to the default, which will need a reconfigure.
        let processTargetsSeparately = false;
        let currentBuildTarget = configuration.getCurrentTarget();
        let oldBuildTarget = currentBuildTarget;
        if (!currentBuildTarget || currentBuildTarget === "") {
            currentBuildTarget = "all";
        }
        if (updateTargets && currentBuildTarget !== "all") {
            processTargetsSeparately = true;
        }
        // Start with the success assumption until later analysis.
        let retc = ConfigureBuildReturnCodeTypes.success;
        let subphaseStats = {};
        try {
            subphaseStats = yield vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Configuring",
                cancellable: true,
            }, (progress, cancel) => {
                cancel.onCancellationRequested(() => __awaiter(this, void 0, void 0, function* () {
                    if (curPID !== -1) {
                        logger.message(`Attempting to kill the make process (PID = ${curPID}) and all its children subprocesses...`);
                        yield vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "Cancelling configure",
                            cancellable: false,
                        }, (progress) => __awaiter(this, void 0, void 0, function* () {
                            return util.killTree(progress, curPID);
                        }));
                    }
                    else {
                        // The configure process may run make twice (or three times if the build target is reset),
                        // with parsing in between and after. There is also the CppTools IntelliSense custom provider update
                        // awaiting at various points. It is possible that the cancellation may happen when there is no make running.
                        logger.message("curPID is 0, we are in between make invocations.");
                    }
                    logger.message("Exiting early from the configure process.");
                    // We want a successful configure as soon as possible.
                    // The dirty state can help with that by triggering a new configure
                    // when the next relevant command occurs.
                    extension_1.extension.getState().configureDirty = true;
                    retc = ConfigureBuildReturnCodeTypes.cancelled;
                    setIsConfiguring(false);
                    setConfigureIsClean(false);
                    setConfigureIsInBackground(false);
                }));
                setIsConfiguring(true);
                return doConfigure(progress, cancel, updateTargets);
            });
            // If not cancelled already, analyze all doConfigure subphases
            // to decide how we should look at the final configure outcome.
            // retc is set to cancel in onCancellationRequested
            // and we don't need to look which subphase cancelled.
            if (retc !== ConfigureBuildReturnCodeTypes.cancelled) {
                retc = analyzeConfigureSubphases(subphaseStats);
            }
            if (retc === ConfigureBuildReturnCodeTypes.success) {
                logger.message("Configure succeeded.");
            }
            else {
                logger.message("Configure failed.");
            }
            return retc;
        }
        catch (e) {
            logger.message(`Exception thrown during the configure process: ${e.message}`);
            retc = ConfigureBuildReturnCodeTypes.other;
            return e.errno;
        }
        finally {
            let provider = extension_1.extension.getCppConfigurationProvider().getCustomConfigurationProvider();
            let ConfigurationCache = {
                buildTargets: configuration.getBuildTargets(),
                launchTargets: configuration.getLaunchTargets(),
                customConfigurationProvider: {
                    workspaceBrowse: provider.workspaceBrowse,
                    // trick to serialize a map in a JSON
                    fileIndex: Array.from(provider.fileIndex)
                }
            };
            // Rewrite the configuration cache according to the last updates of the internal arrays,
            // but not if the configure was cancelled.
            if (configurationCachePath && retc !== ConfigureBuildReturnCodeTypes.cancelled) {
                util.writeFile(configurationCachePath, JSON.stringify(ConfigurationCache));
            }
            let newBuildTarget = configuration.getCurrentTarget();
            let configureElapsedTime = util.elapsedTimeSince(configureStartTime);
            const telemetryMeasures = {
                numberBuildTargets: configuration.getBuildTargets().length,
                numberLaunchTargets: configuration.getLaunchTargets().length,
                numberIndexedSourceFiles: provider.fileIndex.size,
                numberMakefileConfigurations: configuration.getMakefileConfigurations().length,
                totalElapsedTime: configureElapsedTime,
            };
            const telemetryProperties = {
                firstTime: (!ranConfigureInCodebaseLifetime).toString(),
                makeDryRun: makeDryRun.toString(),
                readCache: readCache.toString(),
                isClean: getConfigureIsClean().toString(),
                processTargetsSeparately: processTargetsSeparately.toString(),
                resetBuildTarget: (oldBuildTarget !== newBuildTarget).toString(),
                triggeredBy: triggeredBy
            };
            // Report all relevant exit codes
            telemetryMeasures.exitCode = retc;
            let subphases = getRelevantConfigStats(subphaseStats);
            subphases.forEach(phase => {
                telemetryMeasures[phase.name + ".exitCode"] = phase.status.retc;
                telemetryMeasures[phase.name + ".elapsed"] = phase.status.elapsed;
            });
            // Report if this configure ran also a pre-configure and how long it took.
            if (preConfigureExitCode !== undefined) {
                telemetryProperties.preConfigureExitCode = preConfigureExitCode.toString();
            }
            if (preConfigureElapsedTime !== undefined) {
                telemetryMeasures.preConfigureElapsedTime = preConfigureElapsedTime;
                logger.message(`Preconfigure elapsed time: ${preConfigureElapsedTime}`);
            }
            telemetryProperties.buildTarget = processTargetForTelemetry(newBuildTarget);
            telemetry.logEvent("configure", telemetryProperties, telemetryMeasures);
            logger.message(`Configure elapsed time: ${configureElapsedTime}`);
            setIsConfiguring(false);
            setConfigureIsClean(false);
            setConfigureIsInBackground(false);
            // Let's consider that a cancelled configure is not a complete configure,
            // even if, depending when the cancel happened, the cache may have been loaded already.
            // Cancelled configures reach this point too, because of the finally construct.
            if (retc !== ConfigureBuildReturnCodeTypes.cancelled) {
                extension_1.extension.setCompletedConfigureInSession(true);
            }
            if (retc !== ConfigureBuildReturnCodeTypes.success) {
                logger.showOutputChannel();
            }
        }
    });
}
exports.configure = configure;
function parseLaunchConfigurations(progress, cancel, dryRunOutput, recursive = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (cancel.isCancellationRequested) {
            return {
                retc: ConfigureBuildReturnCodeTypes.cancelled,
                elapsed: 0
            };
        }
        let startTime = Date.now();
        let launchConfigurations = [];
        let onStatus = (status) => {
            progress.report({ increment: 1, message: status + ((recursive) ? "(recursive)" : "" + "...") });
        };
        let onFoundLaunchConfiguration = (launchConfiguration) => {
            launchConfigurations.push(launchConfiguration);
        };
        let retc = yield parser.parseLaunchConfigurations(cancel, dryRunOutput, onStatus, onFoundLaunchConfiguration);
        if (retc === ConfigureBuildReturnCodeTypes.success) {
            let launchConfigurationsStr = [];
            launchConfigurations.forEach(config => {
                launchConfigurationsStr.push(configuration.launchConfigurationToString(config));
            });
            if (launchConfigurationsStr.length === 0) {
                logger.message("No" + (getConfigureIsClean() ? "" : " new") + " launch configurations have been detected.");
            }
            else {
                // Sort and remove duplicates that can be created in the following scenarios:
                //    - the same target binary invoked several times with the same arguments and from the same path
                //    - a target binary invoked once with no parameters is still a duplicate
                //      of the entry generated by the linker command which produced the binary
                //    - sometimes the same binary is linked more than once in the same location
                //      (example: instrumentation) but the launch configurations list need only one entry,
                //      corresponding to the final binary, not the intermediate ones.
                launchConfigurationsStr = util.sortAndRemoveDuplicates(launchConfigurationsStr);
                logger.message(`Found the following ${launchConfigurationsStr.length}` + (getConfigureIsClean() ? "" : " new") + " launch targets defined in the makefile: " + launchConfigurationsStr.join(";"));
            }
            if (getConfigureIsClean()) {
                // If configure is clean, delete any old launch targets found previously.
                configuration.setLaunchTargets(launchConfigurationsStr);
            }
            else {
                // If we're merging with a previous set of launch targets,
                // remove duplicates because sometimes, depending how the makefiles are set up,
                // a non --always-make dry-run may still log commands for up to date files.
                // These would be found also in the previous list of launch targets.
                configuration.setLaunchTargets(util.sortAndRemoveDuplicates(configuration.getLaunchTargets().concat(launchConfigurationsStr)));
            }
            logger.message(`Complete list of launch targets: ${configuration.getLaunchTargets().join(";")}`);
        }
        return {
            retc,
            elapsed: util.elapsedTimeSince(startTime)
        };
    });
}
function parseTargets(progress, cancel, dryRunOutput, recursive = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (cancel.isCancellationRequested) {
            return {
                retc: ConfigureBuildReturnCodeTypes.cancelled,
                elapsed: 0
            };
        }
        let startTime = Date.now();
        let targets = [];
        let onStatus = (status) => {
            progress.report({ increment: 1, message: status + ((recursive) ? "(recursive)" : "") });
        };
        let onFoundTarget = (target) => {
            targets.push(target);
        };
        let retc = yield parser.parseTargets(cancel, dryRunOutput, onStatus, onFoundTarget);
        if (retc === ConfigureBuildReturnCodeTypes.success) {
            if (targets.length === 0) {
                logger.message("No" + (getConfigureIsClean() ? "" : " new") + " build targets have been detected.");
            }
            else {
                targets = targets.sort();
                logger.message(`Found the following ${targets.length}` + (getConfigureIsClean() ? "" : " new") + " build targets defined in the makefile: " + targets.join(";"));
            }
            if (getConfigureIsClean()) {
                // If configure is clean, delete any old build targets found previously.
                configuration.setBuildTargets(targets);
            }
            else {
                // If we're merging with a previous set of build targets,
                // remove duplicates because sometimes, depending how the makefiles are set up,
                // a non --always-make dry-run may still log commands for up to date files.
                // These would be found also in the previous list of build targets.
                configuration.setBuildTargets(util.sortAndRemoveDuplicates(configuration.getBuildTargets().concat(targets)));
            }
            logger.message(`Complete list of build targets: ${configuration.getBuildTargets().join(";")}`);
        }
        return {
            retc,
            elapsed: util.elapsedTimeSince(startTime)
        };
    });
}
function updateProvider(progress, cancel, dryRunOutput, recursive = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (cancel.isCancellationRequested) {
            return {
                retc: ConfigureBuildReturnCodeTypes.cancelled,
                elapsed: 0
            };
        }
        let startTime = Date.now();
        logger.message("Updating the CppTools IntelliSense Configuration Provider." + ((recursive) ? "(recursive)" : ""));
        let onStatus = (status) => {
            progress.report({ increment: 1, message: status + ((recursive) ? "(recursive)" : "" + "...") });
        };
        let onFoundCustomConfigProviderItem = (customConfigProviderItem) => {
            // Configurations parsed from dryrun output or build log are saved temporarily in the delta file index
            extension_1.extension.buildCustomConfigurationProvider(customConfigProviderItem);
        };
        // Empty the cummulative browse path before we start a new parse for custom configuration.
        // We can empty even if the configure is not clean, because the new browse paths will be appended
        // to the previous browse paths.
        extension_1.extension.clearCummulativeBrowsePath();
        let retc = yield parser.parseCustomConfigProvider(cancel, dryRunOutput, onStatus, onFoundCustomConfigProviderItem);
        if (retc !== ConfigureBuildReturnCodeTypes.cancelled) {
            // If this configure is clean, overwrite the final file index, otherwise merge with it.
            let provider = getDeltaCustomConfigurationProvider();
            extension_1.extension.getCppConfigurationProvider().mergeCustomConfigurationProvider(provider);
            // Empty the 'delta' configurations.
            provider.fileIndex.clear();
            provider.workspaceBrowse = {
                browsePath: [],
                compilerArgs: [],
                compilerPath: undefined,
                standard: undefined,
                windowsSdkVersion: undefined
            };
            setCustomConfigurationProvider(provider);
            extension_1.extension.updateCppToolsProvider();
        }
        return {
            retc,
            elapsed: util.elapsedTimeSince(startTime)
        };
    });
}
function preprocessDryRun(progress, cancel, dryrunOutput, recursive = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (cancel.isCancellationRequested) {
            return {
                retc: ConfigureBuildReturnCodeTypes.cancelled,
                elapsed: 0,
                result: ""
            };
        }
        let onStatus = (status) => {
            progress.report({ increment: 1, message: status + ((recursive) ? "(recursive)" : "" + "...") });
        };
        return parser.preprocessDryRunOutput(cancel, dryrunOutput, onStatus);
    });
}
exports.preprocessDryRun = preprocessDryRun;
function loadConfigurationFromCache(progress, cancel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (cancel.isCancellationRequested) {
            return {
                retc: ConfigureBuildReturnCodeTypes.cancelled,
                elapsed: 0
            };
        }
        let startTime = Date.now();
        let elapsedTime;
        yield util.scheduleAsyncTask(() => __awaiter(this, void 0, void 0, function* () { yield extension_1.extension.registerCppToolsProvider(); }));
        let cachePath = configuration.getConfigurationCachePath();
        if (cachePath) {
            let content = util.readFile(cachePath);
            if (content) {
                try {
                    progress.report({ increment: 1, message: "Configuring from cache" });
                    logger.message(`Configuring from cache: ${cachePath}`);
                    let configurationCache = {
                        buildTargets: [],
                        launchTargets: [],
                        customConfigurationProvider: {
                            workspaceBrowse: {
                                browsePath: []
                            },
                            fileIndex: []
                        }
                    };
                    configurationCache = JSON.parse(content);
                    // Trick to get proper URIs after reading from the cache.
                    // At the moment of writing into the cache, the URIs have
                    // the vscode.Uri.file(string) format.
                    // After saving and re-reading, we need the below,
                    // otherwise CppTools doesn't get anything.
                    yield util.scheduleTask(() => {
                        configurationCache.customConfigurationProvider.fileIndex.forEach(i => {
                            i[1].uri = vscode.Uri.file(i[0]);
                        });
                    });
                    yield util.scheduleTask(() => {
                        configuration.setBuildTargets(configurationCache.buildTargets);
                        configuration.setLaunchTargets(configurationCache.launchTargets);
                    });
                    yield util.scheduleTask(() => {
                        // The configurations saved in the cache are read directly into the final file index.
                        extension_1.extension.getCppConfigurationProvider().setCustomConfigurationProvider({
                            workspaceBrowse: configurationCache.customConfigurationProvider.workspaceBrowse,
                            // Trick to read a map from json
                            fileIndex: new Map(configurationCache.customConfigurationProvider.fileIndex)
                        });
                    });
                }
                catch (e) {
                    logger.message("An error occured while parsing the configuration cache.");
                    logger.message("Running clean configure instead.");
                    setConfigureIsInBackground(false);
                    setConfigureIsClean(true);
                }
                elapsedTime = util.elapsedTimeSince(startTime);
                logger.message(`Load configuration from cache elapsed time: ${elapsedTime}`);
                // Log all the files read from cache after elapsed time is calculated.
                // IntelliSense should be available by now for all files.
                // Don't await for this logging step. This may produce some interleaved output
                // but it will still be readable.
                yield util.scheduleTask(() => {
                    extension_1.extension.getCppConfigurationProvider().logConfigurationProviderComplete();
                });
            }
            else {
                return {
                    retc: ConfigureBuildReturnCodeTypes.notFound,
                    elapsed: 0
                };
            }
        }
        else {
            return {
                retc: ConfigureBuildReturnCodeTypes.notFound,
                elapsed: 0
            };
        }
        return {
            retc: cancel.isCancellationRequested ? ConfigureBuildReturnCodeTypes.cancelled : ConfigureBuildReturnCodeTypes.success,
            elapsed: elapsedTime
        };
    });
}
exports.loadConfigurationFromCache = loadConfigurationFromCache;
// Update IntelliSense and launch targets with information parsed from a user given build log,
// the dryrun cache or make dryrun output if the cache is not present.
// Sometimes the targets do not need an update (for example, when there has been
// a change in the current build target), as requested through the boolean.
// This saves unnecessary parsing which may be signifficant for very big code bases.
function doConfigure(progress, cancel, updateTargets = true, recursiveDoConfigure = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let subphaseStats = {};
        // Configure does not start in the background (we have to load a configuration cache first).
        setConfigureIsInBackground(false);
        // If available, load all the configure constructs via json from the cache file.
        // If this doConfigure is in level 1 of recursion, avoid loading the configuration cache again
        // since it's been done at recursion level 0.
        // Also skip if there was at least one completed configure before in this VSCode session,
        // regardless of any other failure error code, because at the end of that last configure,
        // the extension saved this configuration content (that we can skip loading now) into the cache.
        // The loading from cache is cheap, but logging it (for Verbose level) may interfere unnecessarily
        // with the output channel, especially since that logging is not awaited for.
        if (!recursiveDoConfigure && !extension_1.extension.getCompletedConfigureInSession()) {
            subphaseStats.loadFromCache = yield loadConfigurationFromCache(progress, cancel);
            if (subphaseStats.loadFromCache.retc === ConfigureBuildReturnCodeTypes.cancelled) {
                return subphaseStats;
            }
            else if (subphaseStats.loadFromCache.retc === ConfigureBuildReturnCodeTypes.success) {
                // In case of success, the following configure steps should not block any other operation
                // and can be performed in the background.
                setConfigureIsInBackground(true);
            }
        }
        else {
            logger.message("Loading configurations from cache is not necessary.", "Verbose");
        }
        // This generates the dryrun output (saving it on disk) or reads an alternative build log.
        // Timings for this sub-phase happen inside.
        subphaseStats.generateParseContent = yield generateParseContent(progress, cancel, false, recursiveDoConfigure);
        if (subphaseStats.generateParseContent.retc === ConfigureBuildReturnCodeTypes.cancelled) {
            return subphaseStats;
        }
        // Some initial preprocessing required before any parsing is done.
        logger.message(`Preprocessing: "${parseFile}"`);
        let preprocessedDryrunOutput;
        let preprocessedDryrunOutputResult = yield preprocessDryRun(progress, cancel, parseContent || "", recursiveDoConfigure);
        subphaseStats.preprocessParseContent = {
            retc: preprocessedDryrunOutputResult.retc,
            elapsed: preprocessedDryrunOutputResult.retc
        };
        if (preprocessedDryrunOutputResult.result) {
            preprocessedDryrunOutput = preprocessedDryrunOutputResult.result;
        }
        else {
            return subphaseStats;
        }
        logger.message(`Preprocess elapsed time: ${subphaseStats.preprocessParseContent.elapsed}`);
        // Configure IntelliSense
        // Don't override retc1, since make invocations may fail with errors different than cancel
        // and we still complete the configure process.
        logger.message("Parsing for IntelliSense.");
        subphaseStats.parseIntelliSense = yield updateProvider(progress, cancel, preprocessedDryrunOutput, recursiveDoConfigure);
        if (subphaseStats.parseIntelliSense.retc === ConfigureBuildReturnCodeTypes.cancelled) {
            return subphaseStats;
        }
        logger.message(`Parsing for IntelliSense elapsed time: ${subphaseStats.parseIntelliSense.elapsed}`);
        // Configure launch targets as parsed from the makefile
        // (and not as read from settings via makefile.launchConfigurations).
        logger.message(`Parsing for launch targets.`);
        subphaseStats.parseLaunch = yield parseLaunchConfigurations(progress, cancel, preprocessedDryrunOutput, recursiveDoConfigure);
        if (subphaseStats.parseLaunch.retc === ConfigureBuildReturnCodeTypes.cancelled) {
            return subphaseStats;
        }
        logger.message(`Parsing for launch targets elapsed time: ${subphaseStats.parseLaunch.elapsed}`);
        // Verify if the current launch configuration is still part of the list and unset otherwise.
        // By this point, configuration.getLaunchTargets() contains a complete list (old and new).
        let currentLaunchConfiguration = configuration.getCurrentLaunchConfiguration();
        let currentLaunchConfigurationStr = currentLaunchConfiguration ? configuration.launchConfigurationToString(currentLaunchConfiguration) : "";
        if (currentLaunchConfigurationStr !== "" && currentLaunchConfiguration &&
            !configuration.getLaunchConfigurations().includes(currentLaunchConfiguration)) {
            logger.message(`Current launch configuration ${currentLaunchConfigurationStr} is no longer present in the available list.`);
            yield configuration.setLaunchConfigurationByName("");
        }
        // Configure build targets only if necessary:
        // if the caller considers we need a build target update
        // or if the build target array hasn't been populated by now
        // or if it contains only 'all' which we push automatically.
        let buildTargets = configuration.getBuildTargets();
        if (updateTargets || buildTargets.length === 0 ||
            (buildTargets.length === 1 && buildTargets[0] === "all")) {
            logger.message("Generating parse content for build targets.");
            subphaseStats.dryrunTargets = yield generateParseContent(progress, cancel, true, recursiveDoConfigure);
            if (subphaseStats.dryrunTargets.retc === ConfigureBuildReturnCodeTypes.cancelled) {
                return subphaseStats;
            }
            logger.message(`Parsing for build targets from: "${parseFile}"`);
            subphaseStats.parseTargets = yield parseTargets(progress, cancel, parseContent || "", recursiveDoConfigure);
            if (subphaseStats.parseTargets.retc === ConfigureBuildReturnCodeTypes.cancelled) {
                return subphaseStats;
            }
            logger.message(`Parsing build targets elapsed time: ${subphaseStats.parseTargets.elapsed}`);
            // Verify if the current build target is still part of the list and unset otherwise.
            // By this point, configuration.getBuildTargets() contains a comlete list (old and new).
            buildTargets = configuration.getBuildTargets();
            let currentBuildTarget = configuration.getCurrentTarget();
            if (currentBuildTarget && currentBuildTarget !== "" && currentBuildTarget !== "all" &&
                !buildTargets.includes(currentBuildTarget)) {
                logger.message(`Current build target ${currentBuildTarget} is no longer present in the available list.` +
                    ` Unsetting the current build target.`);
                // Setting a new target by name is not triggering a configure
                // (only its caller setBuildTarget, invoked by its command or status bar button).
                // But we do need to configure again after a build target change,
                // so call doConfigure here and not configure.
                // We don't need to alter yet any dirty or pending states, this being an 'inner' call of configure.
                // We don't need to consider makefile.configureAfterCommand: even if set to false
                // (which would result in changing a build target without a following configure - in the normal scenario)
                // now we need to configure because this build target reset was done under the covers
                // by the extension and as a result of a configure (which can only be triggered by the user
                // if makefile.configureAfterCommand is set to false).
                // Calling doConfigure here will not result in extra telemetry (just extra logging).
                // The recursive call to doConfigure will fall still under the same progress bar and cancel button
                // as the caller and its result will be included into the telemetry information reported by that.
                // There can be only one level of recursivity because once the target is reset to empty,
                // it is impossible to get into the state of having a target that is not found in the available list.
                configuration.setTargetByName("");
                logger.message("Automatically reconfiguring the project after a build target change.");
                recursiveDoConfigure = true;
                // This one level recursive doConfigure will keep the same clean state as the caller
                // since setConfigureIsClean runs before the caller configure and resets after
                // the eventual recursive configure.
                subphaseStats.recursiveConfigure = yield doConfigure(progress, cancel, updateTargets, true);
            }
        }
        // Let the caller collect and log all information regarding the subphases return codes.
        if (!recursiveDoConfigure) {
            logger.message("Configure finished. The status for all the subphases that ran:");
            let subphases = getRelevantConfigStats(subphaseStats);
            subphases.forEach(subphase => {
                logger.message(`${subphase.name}: return code = ${subphase.status.retc}, ` +
                    `elapsed time = ${subphase.status.elapsed}`);
            });
        }
        extension_1.extension.getState().configureDirty = false;
        return subphaseStats;
    });
}
exports.doConfigure = doConfigure;
// A clean configure = a non clean configure + empty the CppTools custom IntelliSense config provider.
// In the case of a dry-run setting (not a build log) it also means adding --always-make to the make invocation.
// Because we want to first read any existing cache and let the remaining heavy processing run in the background,
// we don't delete the cache here. We just mark it to be later deleted by the non clean configure.
function cleanConfigure(triggeredBy, updateTargets = true) {
    return __awaiter(this, void 0, void 0, function* () {
        // Even if the core configure process also checks for blocking operations,
        // verify the same here as well, to make sure that we don't delete the caches
        // only to return early from the core configure.
        if (blockedByOp(Operations.configure)) {
            return ConfigureBuildReturnCodeTypes.blocked;
        }
        setConfigureIsClean(true);
        return configure(triggeredBy, updateTargets);
    });
}
exports.cleanConfigure = cleanConfigure;
//# sourceMappingURL=make.js.map