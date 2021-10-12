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
exports.setLaunchTargets = exports.getLaunchTargets = exports.setBuildTargets = exports.getBuildTargets = exports.selectLaunchConfiguration = exports.setLaunchConfigurationByName = exports.selectTarget = exports.setTargetByName = exports.setNewConfiguration = exports.prepareConfigurationsQuickPick = exports.setConfigurationByName = exports.initFromStateAndSettings = exports.readIgnoreDirectoryCommands = exports.setIgnoreDirectoryCommands = exports.getIgnoreDirectoryCommands = exports.readClearOutputBeforeBuild = exports.setClearOutputBeforeBuild = exports.getClearOutputBeforeBuild = exports.readBuildBeforeLaunch = exports.setBuildBeforeLaunch = exports.getBuildBeforeLaunch = exports.readSaveBeforeBuildOrConfigure = exports.setSaveBeforeBuildOrConfigure = exports.getSaveBeforeBuildOrConfigure = exports.readPhonyOnlyTargets = exports.setPhonyOnlyTargets = exports.getPhonyOnlyTargets = exports.readConfigureAfterCommand = exports.setConfigureAfterCommand = exports.getConfigureAfterCommand = exports.readConfigureOnEdit = exports.setConfigureOnEdit = exports.getConfigureOnEdit = exports.readConfigureOnOpen = exports.setConfigureOnOpen = exports.getConfigureOnOpen = exports.setCurrentTarget = exports.getCurrentTarget = exports.setMakefileConfigurations = exports.getMakefileConfigurations = exports.getBuildLogForConfiguration = exports.getCommandForConfiguration = exports.setConfigurationBuildLog = exports.getConfigurationBuildLog = exports.setConfigurationMakeArgs = exports.getConfigurationMakeArgs = exports.setConfigurationMakeCommand = exports.getConfigurationMakeCommand = exports.readDefaultLaunchConfiguration = exports.getDefaultLaunchConfiguration = exports.setCurrentLaunchConfiguration = exports.getCurrentLaunchConfiguration = exports.stringToLaunchConfiguration = exports.launchConfigurationToString = exports.setLaunchConfigurations = exports.getLaunchConfigurations = exports.readDryrunSwitches = exports.setDryrunSwitches = exports.getDryrunSwitches = exports.readExcludeCompilerNames = exports.setExcludeCompilerNames = exports.getExcludeCompilerNames = exports.readAdditionalCompilerNames = exports.setAdditionalCompilerNames = exports.getAdditionalCompilerNames = exports.readConfigurationCachePath = exports.setConfigurationCachePath = exports.getConfigurationCachePath = exports.readAlwaysPreConfigure = exports.setAlwaysPreConfigure = exports.getAlwaysPreConfigure = exports.readPreConfigureScript = exports.setPreConfigureScript = exports.getPreConfigureScript = exports.readExtensionLog = exports.setExtensionLog = exports.getExtensionLog = exports.readExtensionOutputFolder = exports.setExtensionOutputFolder = exports.getExtensionOutputFolder = exports.readLoggingLevel = exports.setLoggingLevel = exports.getLoggingLevel = exports.setBuildLog = exports.getBuildLog = exports.setMakeDirectory = exports.getMakeDirectory = exports.setMakefilePath = exports.getMakefilePath = exports.setMakePath = exports.getMakePath = exports.setCurrentMakefileConfiguration = exports.getCurrentMakefileConfiguration = void 0;
// Configuration support
const extension_1 = require("./extension");
const logger = require("./logger");
const make = require("./make");
const ui = require("./ui");
const util = require("./util");
const vscode = require("vscode");
const path = require("path");
const telemetry = require("./telemetry");
let statusBar = ui.getUI();
// Last configuration name picked from the set defined in makefile.configurations setting.
// Saved into the workspace state. Also reflected in the configuration status bar button.
// If no particular current configuration is defined in settings, set to 'Default'.
let currentMakefileConfiguration;
function getCurrentMakefileConfiguration() { return currentMakefileConfiguration; }
exports.getCurrentMakefileConfiguration = getCurrentMakefileConfiguration;
function setCurrentMakefileConfiguration(configuration) {
    currentMakefileConfiguration = configuration;
    statusBar.setConfiguration(currentMakefileConfiguration);
    logger.message("Setting configuration - " + currentMakefileConfiguration);
    analyzeConfigureParams();
}
exports.setCurrentMakefileConfiguration = setCurrentMakefileConfiguration;
// Read the current configuration from workspace state, update status bar item
function readCurrentMakefileConfiguration() {
    let buildConfiguration = extension_1.extension.getState().buildConfiguration;
    if (!buildConfiguration) {
        logger.message("No current configuration is defined in the workspace state. Assuming 'Default'.");
        currentMakefileConfiguration = "Default";
    }
    else {
        logger.message(`Reading current configuration "${buildConfiguration}" from the workspace state.`);
        currentMakefileConfiguration = buildConfiguration;
    }
    statusBar.setConfiguration(currentMakefileConfiguration);
}
let makePath;
function getMakePath() { return makePath; }
exports.getMakePath = getMakePath;
function setMakePath(path) { makePath = path; }
exports.setMakePath = setMakePath;
// Read the path (full or directory only) of the make tool if defined in settings.
// It represents a default to look for if no other path is already included
// in "makefile.configurations.makePath".
function readMakePath() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    makePath = workspaceConfiguration.get("makePath");
    // Don't resolve makePath to root, because make needs to be searched in the path too.
    if (!makePath) {
        logger.message("No path to the make tool is defined in the settings file.");
    }
}
let makefilePath;
function getMakefilePath() { return makefilePath; }
exports.getMakefilePath = getMakefilePath;
function setMakefilePath(path) { makefilePath = path; }
exports.setMakefilePath = setMakefilePath;
// Read the full path to the makefile if defined in settings.
// It represents a default to look for if no other makefile is already provided
// in makefile.configurations.makefilePath.
// TODO: validate and integrate with "-f [Makefile]" passed in makefile.configurations.makeArgs.
function readMakefilePath() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    makefilePath = workspaceConfiguration.get("makefilePath");
    if (!makefilePath) {
        logger.message("No path to the makefile is defined in the settings file.");
    }
    else {
        makefilePath = util.resolvePathToRoot(makefilePath);
    }
}
let makeDirectory;
function getMakeDirectory() { return makeDirectory; }
exports.getMakeDirectory = getMakeDirectory;
function setMakeDirectory(dir) { makeDirectory = dir; }
exports.setMakeDirectory = setMakeDirectory;
// Read the make working directory path if defined in settings.
// It represents a default to look for if no other makeDirectory is already provided
// in makefile.configurations.makeDirectory.
// TODO: validate and integrate with "-C [DIR_PATH]" passed in makefile.configurations.makeArgs.
function readMakeDirectory() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    makeDirectory = workspaceConfiguration.get("makeDirectory");
    if (!makeDirectory) {
        logger.message("No folder path to the makefile is defined in the settings file.");
    }
    else {
        makeDirectory = util.resolvePathToRoot(makeDirectory);
    }
}
let buildLog;
function getBuildLog() { return buildLog; }
exports.getBuildLog = getBuildLog;
function setBuildLog(path) { buildLog = path; }
exports.setBuildLog = setBuildLog;
// Read from settings the path of the build log that is desired to be parsed
// instead of a dry-run command output.
// Useful for complex, tricky and corner case repos for which make --dry-run
// is not working as the extension expects.
// Example: --dry-run actually running configure commands, instead of only displaying them,
// possibly changing unexpectedly a previous configuration set by the repo developer.
// This scenario may also result in infinite loop, depending on how the makefile
// and the configuring process are written, thus making the extension unusable.
// Defining a build log to be parsed instead of a dry-run output represents a good alternative.
// Also useful for developing unit tests based on real world code,
// that would not clone a whole repo for testing.
// It is recommended to produce the build log with all the following commands,
// so that the extension has the best content to operate on.
//    --always-make (to make sure no target is skipped because it is up to date)
//    --keep-going (to not stumble on the first error)
//    --print-data-base (special verbose printing which this extension is using for parsing the makefile targets)
// If any of the above switches is missing, the extension may have less log to parse from,
// therefore offering less intellisense information for source files,
// identifying less possible binaries to debug or not providing any makefile targets (other than the 'all' default).
function readBuildLog() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    buildLog = workspaceConfiguration.get("buildLog");
    if (buildLog) {
        buildLog = util.resolvePathToRoot(buildLog);
        logger.message('Build log defined at "' + buildLog + '"');
        if (!util.checkFileExistsSync(buildLog)) {
            logger.message("Build log not found on disk.");
        }
    }
}
let loggingLevel;
function getLoggingLevel() { return loggingLevel; }
exports.getLoggingLevel = getLoggingLevel;
function setLoggingLevel(logLevel) { loggingLevel = logLevel; }
exports.setLoggingLevel = setLoggingLevel;
// Read from settings the desired logging level for the Makefile Tools extension.
function readLoggingLevel() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    loggingLevel = workspaceConfiguration.get("loggingLevel");
    if (!loggingLevel) {
        loggingLevel = "Normal";
    }
    logger.message(`Logging level: ${loggingLevel}`);
}
exports.readLoggingLevel = readLoggingLevel;
let extensionOutputFolder;
function getExtensionOutputFolder() { return extensionOutputFolder; }
exports.getExtensionOutputFolder = getExtensionOutputFolder;
function setExtensionOutputFolder(folder) { extensionOutputFolder = folder; }
exports.setExtensionOutputFolder = setExtensionOutputFolder;
// Read from settings the path to a folder where the extension is dropping various output files
// (like extension.log, dry-run.log, targets.log).
// Useful to control where such potentially large files should reside.
function readExtensionOutputFolder() {
    var _a;
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    const propKey = "extensionOutputFolder";
    extensionOutputFolder = workspaceConfiguration.get(propKey);
    if (extensionOutputFolder) {
        extensionOutputFolder = util.resolvePathToRoot(extensionOutputFolder);
        if (!util.checkDirectoryExistsSync(extensionOutputFolder)) {
            logger.message(`Provided extension output folder does not exist: ${extensionOutputFolder}.`);
            let defaultExtensionOutputFolder = (_a = workspaceConfiguration.inspect(propKey)) === null || _a === void 0 ? void 0 : _a.defaultValue;
            if (defaultExtensionOutputFolder) {
                logger.message(`Switching to default: ${defaultExtensionOutputFolder}.`);
                workspaceConfiguration.update(propKey, defaultExtensionOutputFolder);
                extensionOutputFolder = util.resolvePathToRoot(defaultExtensionOutputFolder);
            }
        }
        logger.message(`Dropping various extension output files at ${extensionOutputFolder}`);
    }
}
exports.readExtensionOutputFolder = readExtensionOutputFolder;
let extensionLog;
function getExtensionLog() { return extensionLog; }
exports.getExtensionLog = getExtensionLog;
function setExtensionLog(path) { extensionLog = path; }
exports.setExtensionLog = setExtensionLog;
// Read from settings the path to a log file capturing all the "Makefile Tools" output channel content.
// Useful for very large repos, which would produce with a single command a log larger
// than the "Makefile Tools" output channel capacity.
// Also useful for developing unit tests based on real world code,
// that would not clone a whole repo for testing.
// If an extension log is specified, its content is cleared during activation.
// Any messages that are being logged throughout the lifetime of the extension
// are going to be appended to this file.
function readExtensionLog() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    extensionLog = workspaceConfiguration.get("extensionLog");
    if (extensionLog) {
        // If there is a directory defined within the extension log path,
        // honor it and don't append to extensionOutputFolder.
        let parsePath = path.parse(extensionLog);
        if (extensionOutputFolder && !parsePath.dir) {
            extensionLog = path.join(extensionOutputFolder, extensionLog);
        }
        else {
            extensionLog = util.resolvePathToRoot(extensionLog);
        }
        logger.message(`Writing extension log at ${extensionLog}`);
    }
}
exports.readExtensionLog = readExtensionLog;
let preConfigureScript;
function getPreConfigureScript() { return preConfigureScript; }
exports.getPreConfigureScript = getPreConfigureScript;
function setPreConfigureScript(path) { preConfigureScript = path; }
exports.setPreConfigureScript = setPreConfigureScript;
// Read from settings the path to a script file that needs to have been run at least once
// before a sucessful configure of this project.
function readPreConfigureScript() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    preConfigureScript = workspaceConfiguration.get("preConfigureScript");
    if (preConfigureScript) {
        preConfigureScript = util.resolvePathToRoot(preConfigureScript);
        logger.message(`Found pre-configure script defined as ${preConfigureScript}`);
        if (!util.checkFileExistsSync(preConfigureScript)) {
            logger.message("Pre-configure script not found on disk.");
        }
    }
}
exports.readPreConfigureScript = readPreConfigureScript;
let alwaysPreConfigure;
function getAlwaysPreConfigure() { return alwaysPreConfigure; }
exports.getAlwaysPreConfigure = getAlwaysPreConfigure;
function setAlwaysPreConfigure(path) { alwaysPreConfigure = path; }
exports.setAlwaysPreConfigure = setAlwaysPreConfigure;
// Read from settings whether the pre-configure step is supposed to be executed
// always before the configure operation.
function readAlwaysPreConfigure() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    alwaysPreConfigure = workspaceConfiguration.get("alwaysPreConfigure");
    logger.message(`Always pre-configure: ${alwaysPreConfigure}`);
}
exports.readAlwaysPreConfigure = readAlwaysPreConfigure;
let configurationCachePath;
function getConfigurationCachePath() { return configurationCachePath; }
exports.getConfigurationCachePath = getConfigurationCachePath;
function setConfigurationCachePath(path) { configurationCachePath = path; }
exports.setConfigurationCachePath = setConfigurationCachePath;
// Read from settings the path to a cache file containing the output of the last dry-run make command.
// This file is recreated when opening a project, when changing the build configuration or the build target
// and when the settings watcher detects a change of any properties that may impact the dryrun output.
function readConfigurationCachePath() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    // how to get default from package.json to avoid problem with 'undefined' type?
    configurationCachePath = workspaceConfiguration.get("configurationCachePath");
    if (configurationCachePath) {
        // If there is a directory defined within the configuration cache path,
        // honor it and don't append to extensionOutputFolder.
        let parsePath = path.parse(configurationCachePath);
        if (extensionOutputFolder && !parsePath.dir) {
            configurationCachePath = path.join(extensionOutputFolder, configurationCachePath);
        }
        else {
            configurationCachePath = util.resolvePathToRoot(configurationCachePath);
        }
    }
    logger.message(`Configurations cached at ${configurationCachePath}`);
}
exports.readConfigurationCachePath = readConfigurationCachePath;
let additionalCompilerNames;
function getAdditionalCompilerNames() { return additionalCompilerNames; }
exports.getAdditionalCompilerNames = getAdditionalCompilerNames;
function setAdditionalCompilerNames(compilerNames) { additionalCompilerNames = compilerNames; }
exports.setAdditionalCompilerNames = setAdditionalCompilerNames;
function readAdditionalCompilerNames() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    additionalCompilerNames = workspaceConfiguration.get("additionalCompilerNames");
    logger.message(`Additional compiler names: ${additionalCompilerNames}`);
}
exports.readAdditionalCompilerNames = readAdditionalCompilerNames;
let excludeCompilerNames;
function getExcludeCompilerNames() { return excludeCompilerNames; }
exports.getExcludeCompilerNames = getExcludeCompilerNames;
function setExcludeCompilerNames(compilerNames) { excludeCompilerNames = compilerNames; }
exports.setExcludeCompilerNames = setExcludeCompilerNames;
function readExcludeCompilerNames() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    excludeCompilerNames = workspaceConfiguration.get("excludeCompilerNames");
    logger.message(`Exclude compiler names: ${excludeCompilerNames}`);
}
exports.readExcludeCompilerNames = readExcludeCompilerNames;
let dryrunSwitches;
function getDryrunSwitches() { return dryrunSwitches; }
exports.getDryrunSwitches = getDryrunSwitches;
function setDryrunSwitches(switches) { dryrunSwitches = switches; }
exports.setDryrunSwitches = setDryrunSwitches;
// Read from settings the dry-run switches array. If there is no user definition, the defaults are:
//   --always-make: to not skip over up-to-date targets
//   --keep-going: to not stop at the first error that is encountered
//   --print-data-base: to generate verbose log output that can be parsed to identify all the makefile targets
// Some code bases have various issues with the above make parameters: infrastructure (not build) errors,
// infinite reconfiguration loops, resulting in the extension being unusable.
// To work around this, the setting makefile.dryrunSwitches is providing a way to skip over the problematic make arguments,
// even if this results in not ideal behavior: less information available to be parsed, which leads to incomplete IntelliSense or missing targets.
function readDryrunSwitches() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    dryrunSwitches = workspaceConfiguration.get("dryrunSwitches");
    logger.message(`Dry-run switches: ${dryrunSwitches}`);
}
exports.readDryrunSwitches = readDryrunSwitches;
let launchConfigurations = [];
function getLaunchConfigurations() { return launchConfigurations; }
exports.getLaunchConfigurations = getLaunchConfigurations;
function setLaunchConfigurations(configurations) { launchConfigurations = configurations; }
exports.setLaunchConfigurations = setLaunchConfigurations;
// Read make configurations optionally defined by the user in settings: makefile.configurations.
function readLaunchConfigurations() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    launchConfigurations = workspaceConfiguration.get("launchConfigurations") || [];
}
// Helper used to fill the launch configurations quick pick.
// The input object for this method is either read from the settings or it is an object
// constructed by the parser while analyzing the dry-run output (or the build log),
// when the extension is trying to determine if and how (from what folder, with what arguments)
// the makefile is invoking any of the programs that are built by the current target.
// Properties other than cwd, binary path and args could be manually defined by the user
// in settings (after the extension creates a first minimal launch configuration object) and are not relevant
// for the strings being used to populate the quick pick.
// Syntax:
//    [CWD path]>[binaryPath]([binaryArg1,binaryArg2,binaryArg3,...])
function launchConfigurationToString(configuration) {
    let binPath = util.makeRelPath(configuration.binaryPath, configuration.cwd);
    let binArgs = configuration.binaryArgs.join(",");
    return `${configuration.cwd}>${binPath}(${binArgs})`;
}
exports.launchConfigurationToString = launchConfigurationToString;
// Helper used to construct a minimal launch configuration object
// (only cwd, binary path and arguments) from a string that respects
// the syntax of its quick pick.
function stringToLaunchConfiguration(str) {
    return __awaiter(this, void 0, void 0, function* () {
        let regexp = /(.*)\>(.*)\((.*)\)/mg;
        let match = regexp.exec(str);
        if (match) {
            let fullPath = yield util.makeFullPath(match[2], match[1]);
            let splitArgs = (match[3] === "") ? [] : match[3].split(",");
            return {
                cwd: match[1],
                binaryPath: fullPath,
                binaryArgs: splitArgs
            };
        }
        else {
            return undefined;
        }
    });
}
exports.stringToLaunchConfiguration = stringToLaunchConfiguration;
let currentLaunchConfiguration;
function getCurrentLaunchConfiguration() { return currentLaunchConfiguration; }
exports.getCurrentLaunchConfiguration = getCurrentLaunchConfiguration;
function setCurrentLaunchConfiguration(configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        currentLaunchConfiguration = configuration;
        let launchConfigStr = launchConfigurationToString(currentLaunchConfiguration);
        statusBar.setLaunchConfiguration(launchConfigStr);
        yield extension_1.extension._projectOutlineProvider.updateLaunchTarget(launchConfigStr);
    });
}
exports.setCurrentLaunchConfiguration = setCurrentLaunchConfiguration;
function getLaunchConfiguration(name) {
    return launchConfigurations.find(k => {
        if (launchConfigurationToString(k) === name) {
            return Object.assign(Object.assign({}, k), { keep: true });
        }
    });
}
// Construct the current launch configuration object:
// Read the identifier from workspace state storage, then find the corresponding object
// in the launch configurations array from settings.
// Also update the status bar item.
function readCurrentLaunchConfiguration() {
    return __awaiter(this, void 0, void 0, function* () {
        readLaunchConfigurations();
        let currentLaunchConfigurationName = extension_1.extension.getState().launchConfiguration;
        if (currentLaunchConfigurationName) {
            currentLaunchConfiguration = getLaunchConfiguration(currentLaunchConfigurationName);
        }
        let launchConfigStr = "No launch configuration set.";
        if (currentLaunchConfiguration) {
            launchConfigStr = launchConfigurationToString(currentLaunchConfiguration);
            logger.message(`Reading current launch configuration "${launchConfigStr}" from the workspace state.`);
        }
        else {
            // A null launch configuration after a non empty launch configuration string name
            // means that the name stored in the project state does not match any of the entries in settings.
            // This typically happens after the user modifies manually "makefile.launchConfigurations"
            // in the .vscode/settings.json, specifically the entry that corresponds to the current launch configuration.
            // Make sure to unset the launch configuration in this scenario.
            if (currentLaunchConfigurationName !== undefined && currentLaunchConfigurationName !== "") {
                logger.message(`Launch configuration "${currentLaunchConfigurationName}" is no longer defined in settings "makefile.launchConfigurations".`);
                yield setLaunchConfigurationByName("");
            }
            else {
                logger.message("No current launch configuration is set in the workspace state.");
            }
        }
        statusBar.setLaunchConfiguration(launchConfigStr);
        yield extension_1.extension._projectOutlineProvider.updateLaunchTarget(launchConfigStr);
    });
}
let defaultLaunchConfiguration;
function getDefaultLaunchConfiguration() { return defaultLaunchConfiguration; }
exports.getDefaultLaunchConfiguration = getDefaultLaunchConfiguration;
// No setter needed. Currently only the user can define makefile.defaultLaunchConfiguration
function readDefaultLaunchConfiguration() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    defaultLaunchConfiguration = workspaceConfiguration.get("defaultLaunchConfiguration");
    logger.message(`Default launch configuration: MIMode = ${defaultLaunchConfiguration === null || defaultLaunchConfiguration === void 0 ? void 0 : defaultLaunchConfiguration.MIMode},
                    miDebuggerPath = ${defaultLaunchConfiguration === null || defaultLaunchConfiguration === void 0 ? void 0 : defaultLaunchConfiguration.miDebuggerPath},
                    stopAtEntry = ${defaultLaunchConfiguration === null || defaultLaunchConfiguration === void 0 ? void 0 : defaultLaunchConfiguration.stopAtEntry},
                    symbolSearchPath = ${defaultLaunchConfiguration === null || defaultLaunchConfiguration === void 0 ? void 0 : defaultLaunchConfiguration.symbolSearchPath}`);
}
exports.readDefaultLaunchConfiguration = readDefaultLaunchConfiguration;
// Command name and args are used when building from within the VS Code Makefile Tools Extension,
// when parsing all the targets that exist and when updating the cpptools configuration provider
// for IntelliSense.
let configurationMakeCommand;
function getConfigurationMakeCommand() { return configurationMakeCommand; }
exports.getConfigurationMakeCommand = getConfigurationMakeCommand;
function setConfigurationMakeCommand(name) { configurationMakeCommand = name; }
exports.setConfigurationMakeCommand = setConfigurationMakeCommand;
let configurationMakeArgs = [];
function getConfigurationMakeArgs() { return configurationMakeArgs; }
exports.getConfigurationMakeArgs = getConfigurationMakeArgs;
function setConfigurationMakeArgs(args) { configurationMakeArgs = args; }
exports.setConfigurationMakeArgs = setConfigurationMakeArgs;
let configurationBuildLog;
function getConfigurationBuildLog() { return configurationBuildLog; }
exports.getConfigurationBuildLog = getConfigurationBuildLog;
function setConfigurationBuildLog(name) { configurationBuildLog = name; }
exports.setConfigurationBuildLog = setConfigurationBuildLog;
// Analyze the settings of the current makefile configuration and the global workspace settings,
// according to various merging rules and decide what make command and build log
// apply to the current makefile configuration.
function analyzeConfigureParams() {
    getBuildLogForConfiguration(currentMakefileConfiguration);
    getCommandForConfiguration(currentMakefileConfiguration);
}
// Helper to find in the array of MakefileConfiguration which command/args correspond to a configuration name.
// Higher level settings (like makefile.makePath, makefile.makefilePath or makefile.makeDirectory)
// also have an additional effect on the final command.
function getCommandForConfiguration(configuration) {
    var _a;
    let makefileConfiguration = makefileConfigurations.find(k => {
        if (k.name === configuration) {
            return k;
        }
    });
    let makeParsedPathSettings = makePath ? path.parse(makePath) : undefined;
    let makeParsedPathConfigurations = (makefileConfiguration === null || makefileConfiguration === void 0 ? void 0 : makefileConfiguration.makePath) ? path.parse(makefileConfiguration === null || makefileConfiguration === void 0 ? void 0 : makefileConfiguration.makePath) : undefined;
    // Arguments for the make tool can be defined as makeArgs in makefile.configurations setting.
    // When not defined, default to empty array.
    // Make sure to copy from makefile.configurations.makeArgs because we are going to append more switches,
    // which shouldn't be identified as read from settings.
    // Make sure we start from a fresh empty configurationMakeArgs because there may be old arguments that don't apply anymore.
    configurationMakeArgs = ((_a = makefileConfiguration === null || makefileConfiguration === void 0 ? void 0 : makefileConfiguration.makeArgs) === null || _a === void 0 ? void 0 : _a.concat()) || [];
    // Name of the make tool can be defined as makePath in makefile.configurations or as makefile.makePath.
    // When none defined, default to "make".
    configurationMakeCommand = (makeParsedPathConfigurations === null || makeParsedPathConfigurations === void 0 ? void 0 : makeParsedPathConfigurations.base) || (makeParsedPathSettings === null || makeParsedPathSettings === void 0 ? void 0 : makeParsedPathSettings.base) || "make";
    let configurationMakeCommandExtension = (makeParsedPathConfigurations === null || makeParsedPathConfigurations === void 0 ? void 0 : makeParsedPathConfigurations.ext) || (makeParsedPathSettings === null || makeParsedPathSettings === void 0 ? void 0 : makeParsedPathSettings.ext);
    // Prepend the directory path, if defined in either makefile.configurations or makefile.makePath (first has priority).
    let configurationCommandPath = (makeParsedPathConfigurations === null || makeParsedPathConfigurations === void 0 ? void 0 : makeParsedPathConfigurations.dir) || (makeParsedPathSettings === null || makeParsedPathSettings === void 0 ? void 0 : makeParsedPathSettings.dir) || "";
    configurationMakeCommand = path.join(configurationCommandPath, configurationMakeCommand);
    // Add the ".exe" extension on windows if no extension was specified, otherwise the file search APIs don't find it.
    if (process.platform === "win32" && configurationMakeCommandExtension === "") {
        configurationMakeCommand += ".exe";
    }
    // Add the makefile path via the -f make switch.
    // makefile.configurations.makefilePath overwrites makefile.makefilePath.
    let makefileUsed = (makefileConfiguration === null || makefileConfiguration === void 0 ? void 0 : makefileConfiguration.makefilePath) || makefilePath;
    if (makefileUsed) {
        configurationMakeArgs.push("-f");
        configurationMakeArgs.push(`"${makefileUsed}"`);
        // Need to rethink this (GitHub 59).
        // Some repos don't work when we automatically add -C, others don't work when we don't.
        // configurationMakeArgs.push("-C");
        // configurationMakeArgs.push(path.parse(makefileUsed).dir);
    }
    // Add the working directory path via the -C switch.
    // makefile.configurations.makeDirectory overwrites makefile.makeDirectory.
    let makeDirectoryUsed = (makefileConfiguration === null || makefileConfiguration === void 0 ? void 0 : makefileConfiguration.makeDirectory) || makeDirectory;
    if (makeDirectoryUsed) {
        configurationMakeArgs.push("-C");
        configurationMakeArgs.push(`"${makeDirectoryUsed}"`);
    }
    if (configurationMakeCommand) {
        logger.message("Deduced command '" + configurationMakeCommand + " " + configurationMakeArgs.join(" ") + "' for configuration " + configuration);
    }
    // Validation and warnings about properly defining the makefile and make tool.
    // These are not needed if the current configuration reads from a build log instead of dry-run output.
    let buildLog = getConfigurationBuildLog();
    let buildLogContent = buildLog ? util.readFile(buildLog) : undefined;
    if (!buildLogContent) {
        if ((!makeParsedPathSettings || makeParsedPathSettings.name === "") &&
            (!makeParsedPathConfigurations || makeParsedPathConfigurations.name === "")) {
            logger.message("Could not find any make tool file name in makefile.configurations.makePath, nor in makefile.makePath. Assuming make.");
        }
        // If configuration command has a path (absolute or relative), check if it exists on disk and error if not.
        // If no path is given to the make tool, search all paths in the environment and error if make is not on the path.
        if (configurationCommandPath !== "") {
            if (!util.checkFileExistsSync(configurationMakeCommand)) {
                vscode.window.showErrorMessage("Make not found.");
                logger.message("Make was not found on disk at the location provided via makefile.makePath or makefile.configurations[].makePath.");
                // How often location settings don't work (maybe because not yet expanding variables)?
                const telemetryProperties = {
                    reason: "not found at path given in settings"
                };
                telemetry.logEvent("makeNotFound", telemetryProperties);
            }
        }
        else {
            if (!util.toolPathInEnv(path.parse(configurationMakeCommand).base)) {
                vscode.window.showErrorMessage("Make not found.");
                logger.message("Make was not given any path in settings and is also not found on the environment path.");
                // Do the users need an environment automatically set by the extension?
                // With a kits feature or expanding on the pre-configure script.
                const telemetryProperties = {
                    reason: "not found in environment path"
                };
                telemetry.logEvent("makeNotFound", telemetryProperties);
            }
        }
        // Check for makefile path on disk: we search first for any makefile specified via the makefilePath setting,
        // then via the makeDirectory setting and then in the root of the workspace. On linux/mac, it often is 'Makefile', so verify that we default to the right filename.
        if (!makefileUsed) {
            if (makeDirectoryUsed) {
                makefileUsed = util.resolvePathToRoot(path.join(makeDirectoryUsed, "Makefile"));
                if (!util.checkFileExistsSync(makefileUsed)) {
                    makefileUsed = util.resolvePathToRoot(path.join(makeDirectoryUsed, "makefile"));
                }
            }
            else {
                makefileUsed = util.resolvePathToRoot("./Makefile");
                if (!util.checkFileExistsSync(makefileUsed)) {
                    makefileUsed = util.resolvePathToRoot("./makefile");
                }
            }
        }
        if (!util.checkFileExistsSync(makefileUsed)) {
            vscode.window.showErrorMessage("Makefile entry point not found.");
            logger.message("The makefile entry point was not found. " +
                "Make sure it exists at the location defined by makefile.makefilePath, makefile.configurations[].makefilePath, " +
                "makefile.makeDirectory, makefile.configurations[].makeDirectory" +
                "or in the root of the workspace.");
            const telemetryProperties = {
                reason: makefileUsed ?
                    "not found at path given in settings" : // we may need more advanced ability to process settings
                    "not found in workspace root" // insight into different project structures
            };
            telemetry.logEvent("makefileNotFound", telemetryProperties);
        }
    }
}
exports.getCommandForConfiguration = getCommandForConfiguration;
// Helper to find in the array of MakefileConfiguration which buildLog correspond to a configuration name
function getBuildLogForConfiguration(configuration) {
    let makefileConfiguration = makefileConfigurations.find(k => {
        if (k.name === configuration) {
            return Object.assign(Object.assign({}, k), { keep: true });
        }
    });
    configurationBuildLog = makefileConfiguration === null || makefileConfiguration === void 0 ? void 0 : makefileConfiguration.buildLog;
    if (configurationBuildLog) {
        logger.message('Found build log path setting "' + configurationBuildLog + '" defined for configuration "' + configuration);
        if (!path.isAbsolute(configurationBuildLog)) {
            configurationBuildLog = path.join(util.getWorkspaceRoot(), configurationBuildLog);
            logger.message('Resolving build log path to "' + configurationBuildLog + '"');
        }
        if (!util.checkFileExistsSync(configurationBuildLog)) {
            logger.message("Build log not found. Remove the build log setting or provide a build log file on disk at the given location.");
        }
    }
    else {
        // Default to an eventual build log defined in settings
        // If that one is not found on disk, the setting reader already warned about it.
        configurationBuildLog = buildLog;
    }
}
exports.getBuildLogForConfiguration = getBuildLogForConfiguration;
let makefileConfigurations = [];
function getMakefileConfigurations() { return makefileConfigurations; }
exports.getMakefileConfigurations = getMakefileConfigurations;
function setMakefileConfigurations(configurations) { makefileConfigurations = configurations; }
exports.setMakefileConfigurations = setMakefileConfigurations;
// Read make configurations optionally defined by the user in settings: makefile.configurations.
function readMakefileConfigurations() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    makefileConfigurations = workspaceConfiguration.get("configurations") || [];
    let detectedUnnamedConfigurations = false;
    let unnamedConfigurationId = 0;
    // Collect unnamed configurations (probably) defined by the extension earlier,
    // to make sure we avoid duplicates in case any new configuration is in need of a name.
    let unnamedConfigurationNames = makefileConfigurations.map((k => {
        return k.name;
    }));
    unnamedConfigurationNames = unnamedConfigurationNames.filter(item => (item && item.startsWith("Unnamed configuration")));
    makefileConfigurations.forEach(element => {
        if (!element.name) {
            detectedUnnamedConfigurations = true;
            // Just considering the possibility that there are already unnamed configurations
            // defined with IDs other than the rule we assume (like not consecutive numbers, but not only).
            // This may happen when the user deletes configurations at some point without updating the IDs.
            unnamedConfigurationId++;
            let autoGeneratedName = `Unnamed configuration ${unnamedConfigurationId}`;
            while (unnamedConfigurationNames.includes(autoGeneratedName)) {
                unnamedConfigurationId++;
                autoGeneratedName = `Unnamed configuration ${unnamedConfigurationId}`;
            }
            element.name = autoGeneratedName;
            logger.message(`Defining name ${autoGeneratedName} for unnamed configuration ${element}.`);
        }
    });
    if (detectedUnnamedConfigurations) {
        logger.message("Updating makefile configurations in settings.");
        workspaceConfiguration.update("configurations", makefileConfigurations);
    }
    // Log the updated list of configuration names
    const makefileConfigurationNames = makefileConfigurations.map((k => {
        return k.name;
    }));
    if (makefileConfigurationNames.length > 0) {
        logger.message("Found the following configurations defined in makefile.configurations setting: " +
            makefileConfigurationNames.join(";"));
    }
    // Verify if the current makefile configuration is still part of the list and unset otherwise.
    // Exception: "Default" which means the user didn't set it and relies on whatever default
    // the current set of makefiles support. "Default" is not going to be part of the list
    // but we shouldn't log about it.
    if (currentMakefileConfiguration !== "Default" && !makefileConfigurationNames.includes(currentMakefileConfiguration)) {
        logger.message(`Current makefile configuration ${currentMakefileConfiguration} is no longer present in the available list.` +
            ` Re-setting the current makefile configuration to default.`);
        setConfigurationByName("Default");
    }
}
// Last target picked from the set of targets that are run by the makefiles
// when building for the current configuration.
// Saved into the settings storage. Also reflected in the configuration status bar button
let currentTarget;
function getCurrentTarget() { return currentTarget; }
exports.getCurrentTarget = getCurrentTarget;
function setCurrentTarget(target) { currentTarget = target; }
exports.setCurrentTarget = setCurrentTarget;
// Read current target from workspace state, update status bar item
function readCurrentTarget() {
    let buildTarget = extension_1.extension.getState().buildTarget;
    if (!buildTarget) {
        logger.message("No target defined in the workspace state. Assuming 'Default'.");
        statusBar.setTarget("Default");
        // If no particular target is defined in settings, use 'Default' for the button
        // but keep the variable empty, to not append it to the make command.
        currentTarget = "";
    }
    else {
        currentTarget = buildTarget;
        logger.message(`Reading current build target "${currentTarget}" from the workspace state.`);
        statusBar.setTarget(currentTarget);
    }
}
let configureOnOpen;
function getConfigureOnOpen() { return configureOnOpen; }
exports.getConfigureOnOpen = getConfigureOnOpen;
function setConfigureOnOpen(configure) { configureOnOpen = configure; }
exports.setConfigureOnOpen = setConfigureOnOpen;
function readConfigureOnOpen() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    // how to get default from package.json to avoid problem with 'undefined' type?
    configureOnOpen = workspaceConfiguration.get("configureOnOpen");
    logger.message(`Configure on open: ${configureOnOpen}`);
}
exports.readConfigureOnOpen = readConfigureOnOpen;
let configureOnEdit;
function getConfigureOnEdit() { return configureOnEdit; }
exports.getConfigureOnEdit = getConfigureOnEdit;
function setConfigureOnEdit(configure) { configureOnEdit = configure; }
exports.setConfigureOnEdit = setConfigureOnEdit;
function readConfigureOnEdit() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    // how to get default from package.json to avoid problem with 'undefined' type?
    configureOnEdit = workspaceConfiguration.get("configureOnEdit");
    logger.message(`Configure on edit: ${configureOnEdit}`);
}
exports.readConfigureOnEdit = readConfigureOnEdit;
let configureAfterCommand;
function getConfigureAfterCommand() { return configureAfterCommand; }
exports.getConfigureAfterCommand = getConfigureAfterCommand;
function setConfigureAfterCommand(configure) { configureAfterCommand = configure; }
exports.setConfigureAfterCommand = setConfigureAfterCommand;
function readConfigureAfterCommand() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    // how to get default from package.json to avoid problem with 'undefined' type?
    configureAfterCommand = workspaceConfiguration.get("configureAfterCommand");
    logger.message(`Configure after command: ${configureAfterCommand}`);
}
exports.readConfigureAfterCommand = readConfigureAfterCommand;
let phonyOnlyTargets;
function getPhonyOnlyTargets() { return phonyOnlyTargets; }
exports.getPhonyOnlyTargets = getPhonyOnlyTargets;
function setPhonyOnlyTargets(phony) { phonyOnlyTargets = phony; }
exports.setPhonyOnlyTargets = setPhonyOnlyTargets;
function readPhonyOnlyTargets() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    // how to get default from package.json to avoid problem with 'undefined' type?
    phonyOnlyTargets = workspaceConfiguration.get("phonyOnlyTargets");
    logger.message(`Only .PHONY targets: ${phonyOnlyTargets}`);
}
exports.readPhonyOnlyTargets = readPhonyOnlyTargets;
let saveBeforeBuildOrConfigure;
function getSaveBeforeBuildOrConfigure() { return saveBeforeBuildOrConfigure; }
exports.getSaveBeforeBuildOrConfigure = getSaveBeforeBuildOrConfigure;
function setSaveBeforeBuildOrConfigure(save) { saveBeforeBuildOrConfigure = save; }
exports.setSaveBeforeBuildOrConfigure = setSaveBeforeBuildOrConfigure;
function readSaveBeforeBuildOrConfigure() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    saveBeforeBuildOrConfigure = workspaceConfiguration.get("saveBeforeBuildOrConfigure");
    logger.message(`Save before build or configure: ${saveBeforeBuildOrConfigure}`);
}
exports.readSaveBeforeBuildOrConfigure = readSaveBeforeBuildOrConfigure;
let buildBeforeLaunch;
function getBuildBeforeLaunch() { return buildBeforeLaunch; }
exports.getBuildBeforeLaunch = getBuildBeforeLaunch;
function setBuildBeforeLaunch(build) { buildBeforeLaunch = build; }
exports.setBuildBeforeLaunch = setBuildBeforeLaunch;
function readBuildBeforeLaunch() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    buildBeforeLaunch = workspaceConfiguration.get("buildBeforeLaunch");
    logger.message(`Build before launch: ${buildBeforeLaunch}`);
}
exports.readBuildBeforeLaunch = readBuildBeforeLaunch;
let clearOutputBeforeBuild;
function getClearOutputBeforeBuild() { return clearOutputBeforeBuild; }
exports.getClearOutputBeforeBuild = getClearOutputBeforeBuild;
function setClearOutputBeforeBuild(clear) { clearOutputBeforeBuild = clear; }
exports.setClearOutputBeforeBuild = setClearOutputBeforeBuild;
function readClearOutputBeforeBuild() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    clearOutputBeforeBuild = workspaceConfiguration.get("clearOutputBeforeBuild");
    logger.message(`Clear output before build: ${clearOutputBeforeBuild}`);
}
exports.readClearOutputBeforeBuild = readClearOutputBeforeBuild;
// This setting is useful for some repos where directory changing commands (cd, push, pop)
// are missing or printed more than once, resulting in associating some IntelliSense information
// with the wrong file or even with a non existent URL.
// When this is set, the current path deduction relies only on --print-directory
// (which prints the messages regarding "Entering direcory" and "Leaving directory"),
// which is not perfect either for all repos.
let ignoreDirectoryCommands;
function getIgnoreDirectoryCommands() { return ignoreDirectoryCommands; }
exports.getIgnoreDirectoryCommands = getIgnoreDirectoryCommands;
function setIgnoreDirectoryCommands(ignore) { ignoreDirectoryCommands = ignore; }
exports.setIgnoreDirectoryCommands = setIgnoreDirectoryCommands;
function readIgnoreDirectoryCommands() {
    let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
    // how to get default from package.json to avoid problem with 'undefined' type?
    ignoreDirectoryCommands = workspaceConfiguration.get("ignoreDirectoryCommands");
    logger.message(`Ignore directory commands: ${ignoreDirectoryCommands}`);
}
exports.readIgnoreDirectoryCommands = readIgnoreDirectoryCommands;
// Initialization from settings (or backup default rules), done at activation time
function initFromStateAndSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        readConfigurationCachePath();
        readMakePath();
        readMakefilePath();
        readMakeDirectory();
        readBuildLog();
        readPreConfigureScript();
        readAlwaysPreConfigure();
        readDryrunSwitches();
        readAdditionalCompilerNames();
        readExcludeCompilerNames();
        readCurrentMakefileConfiguration();
        readMakefileConfigurations();
        readCurrentTarget();
        yield readCurrentLaunchConfiguration();
        readDefaultLaunchConfiguration();
        readConfigureOnOpen();
        readConfigureOnEdit();
        readConfigureAfterCommand();
        readPhonyOnlyTargets();
        readSaveBeforeBuildOrConfigure();
        readBuildBeforeLaunch();
        readClearOutputBeforeBuild();
        readIgnoreDirectoryCommands();
        analyzeConfigureParams();
        yield extension_1.extension._projectOutlineProvider.update(extension_1.extension.getState().buildConfiguration || "unset", extension_1.extension.getState().buildTarget || "unset", extension_1.extension.getState().launchConfiguration || "unset");
        // Verify the dirty state of the IntelliSense config provider and update accordingly.
        // The makefile.configureOnEdit setting can be set to false when this behavior is inconvenient.
        vscode.window.onDidChangeActiveTextEditor((e) => __awaiter(this, void 0, void 0, function* () {
            let language = "";
            if (e) {
                language = e.document.languageId;
            }
            // It is too annoying to generate a configure on any kind of editor focus change
            // (for example even searching in the logging window generates this event).
            // Since all the operations are guarded by the configureDirty state,
            // the only "operation" left that we need to make sure it's up to date
            // is IntelliSense, so trigger a configure when we switch editor focus
            // into C/C++ source code.
            switch (language) {
                case "c":
                case "cpp":
                    // If configureDirty is already set from a previous VSCode session,
                    // at workspace load this event (onDidChangeActiveTextEditor) is triggered automatically
                    // and if makefile.configureOnOpen is true, there is a race between two configure operations,
                    // one of which being unnecessary. If configureOnOpen is false, there is no race
                    // but still we don't want to override the behavior desired by the user.
                    // Additionally, if anything dirtied the configure state during a (pre)configure or build,
                    // skip this clean configure, to avoid annoying "blocked operation" notifications.
                    // The configure state remains dirty and a new configure will be triggered eventually:
                    // (selecting a new configuration, target or launch, build, editor focus change).
                    // Guarding only for not being blocked is not enough. For example,
                    // in the first scenario explained above, the race happens when nothing looks blocked
                    // here, but leading to a block notification soon.
                    if (extension_1.extension.getState().configureDirty && configureOnEdit) {
                        if ((extension_1.extension.getCompletedConfigureInSession())
                            && !make.blockedByOp(make.Operations.configure, false)) {
                            logger.message("Configuring after settings or makefile changes...");
                            yield make.configure(make.TriggeredBy.configureAfterEditorFocusChange); // this sets configureDirty back to false if it succeeds
                        }
                    }
                    break;
                default:
                    break;
            }
        }));
        // Modifying any makefile should trigger an IntelliSense config provider update,
        // so make the dirty state true.
        // TODO: limit to makefiles relevant to this project, instead of any random makefile anywhere.
        //       We can't listen only to the makefile pointed to by makefile.makefilePath or makefile.makeDirectory,
        //       because that is only the entry point and can refer to other relevant makefiles.
        // TODO: don't trigger an update for any dummy save, verify how the content changed.
        vscode.workspace.onDidSaveTextDocument(e => {
            if (e.uri.fsPath.toLowerCase().endsWith("makefile")) {
                extension_1.extension.getState().configureDirty = true;
            }
        });
        // Watch for Makefile Tools setting updates that can change the IntelliSense config provider dirty state.
        // More than one setting may be updated on one settings.json save,
        // so make sure to OR the dirty state when it's calculated by a formula (not a simple TRUE value).
        vscode.workspace.onDidChangeConfiguration((e) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (vscode.workspace.workspaceFolders &&
                e.affectsConfiguration('makefile', vscode.workspace.workspaceFolders[0].uri)) {
                // We are interested in updating only some relevant properties.
                // A subset of these should also trigger an IntelliSense config provider update.
                // Avoid unnecessary updates (for example, when settings are modified via the extension quickPick).
                let telemetryProperties = {};
                let updatedSettingsSubkeys = [];
                let keyRoot = "makefile";
                let workspaceConfiguration = vscode.workspace.getConfiguration(keyRoot);
                let subKey = "launchConfigurations";
                let updatedLaunchConfigurations = workspaceConfiguration.get(subKey);
                if (!util.areEqual(updatedLaunchConfigurations, launchConfigurations)) {
                    // Changing a launch configuration does not impact the make or compiler tools invocations,
                    // so no IntelliSense update is needed.
                    yield readCurrentLaunchConfiguration(); // this gets a refreshed view of all launch configurations
                    // and also updates the current one in case it was affected
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "defaultLaunchConfiguration";
                let updatedDefaultLaunchConfiguration = workspaceConfiguration.get(subKey);
                if (!util.areEqual(updatedDefaultLaunchConfiguration, defaultLaunchConfiguration)) {
                    // Changing a global debug configuration does not impact the make or compiler tools invocations,
                    // so no IntelliSense update is needed.
                    readDefaultLaunchConfiguration();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "loggingLevel";
                let updatedLoggingLevel = workspaceConfiguration.get(subKey);
                if (updatedLoggingLevel !== loggingLevel) {
                    readLoggingLevel();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "buildLog";
                let updatedBuildLog = workspaceConfiguration.get(subKey);
                if (updatedBuildLog) {
                    updatedBuildLog = util.resolvePathToRoot(updatedBuildLog);
                }
                if (updatedBuildLog !== buildLog) {
                    // Configure is dirty only if the current configuration
                    // doesn't have already another build log set
                    // (which overrides the global one).
                    let currentMakefileConfiguration = makefileConfigurations.find(k => {
                        if (k.name === getCurrentMakefileConfiguration()) {
                            return k;
                        }
                    });
                    extension_1.extension.getState().configureDirty = extension_1.extension.getState().configureDirty ||
                        !currentMakefileConfiguration || !currentMakefileConfiguration.buildLog;
                    readBuildLog();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "extensionOutputFolder";
                let updatedExtensionOutputFolder = workspaceConfiguration.get(subKey);
                let switchedToDefault = false;
                if (updatedExtensionOutputFolder) {
                    updatedExtensionOutputFolder = util.resolvePathToRoot(updatedExtensionOutputFolder);
                    if (!util.checkDirectoryExistsSync(updatedExtensionOutputFolder)) {
                        logger.message(`Provided extension output folder does not exist: ${updatedExtensionOutputFolder}.`);
                        let defaultExtensionOutputFolder = (_a = workspaceConfiguration.inspect(subKey)) === null || _a === void 0 ? void 0 : _a.defaultValue;
                        if (defaultExtensionOutputFolder) {
                            logger.message(`Switching to default: ${defaultExtensionOutputFolder}.`);
                            updatedExtensionOutputFolder = util.resolvePathToRoot(defaultExtensionOutputFolder);
                            // This will trigger another settings changed event
                            workspaceConfiguration.update(subKey, defaultExtensionOutputFolder);
                            updatedSettingsSubkeys.push(subKey);
                            // to prevent the below readExtensionOutputFolder to be executed now,
                            // it will during the next immediate changed event
                            switchedToDefault = true;
                        }
                    }
                }
                if (updatedExtensionOutputFolder !== extensionOutputFolder && !switchedToDefault) {
                    // No IntelliSense update needed.
                    readExtensionOutputFolder();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "extensionLog";
                let updatedExtensionLog = workspaceConfiguration.get(subKey);
                if (updatedExtensionLog) {
                    // If there is a directory defined within the extension log path,
                    // honor it and don't append to extensionOutputFolder.
                    let parsePath = path.parse(updatedExtensionLog);
                    if (extensionOutputFolder && !parsePath.dir) {
                        updatedExtensionLog = path.join(extensionOutputFolder, updatedExtensionLog);
                    }
                    else {
                        updatedExtensionLog = util.resolvePathToRoot(updatedExtensionLog);
                    }
                }
                if (updatedExtensionLog !== extensionLog) {
                    // No IntelliSense update needed.
                    readExtensionLog();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "preConfigureScript";
                let updatedPreConfigureScript = workspaceConfiguration.get(subKey);
                if (updatedPreConfigureScript) {
                    updatedPreConfigureScript = util.resolvePathToRoot(updatedPreConfigureScript);
                }
                if (updatedPreConfigureScript !== preConfigureScript) {
                    // No IntelliSense update needed.
                    readPreConfigureScript();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "alwaysPreConfigure";
                let updatedAlwaysPreConfigure = workspaceConfiguration.get(subKey);
                if (updatedAlwaysPreConfigure !== alwaysPreConfigure) {
                    // No IntelliSense update needed.
                    readAlwaysPreConfigure();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "configurationCachePath";
                let updatedConfigurationCachePath = workspaceConfiguration.get(subKey);
                if (updatedConfigurationCachePath) {
                    // If there is a directory defined within the configuration cache path,
                    // honor it and don't append to extensionOutputFolder.
                    let parsePath = path.parse(updatedConfigurationCachePath);
                    if (extensionOutputFolder && !parsePath.dir) {
                        updatedConfigurationCachePath = path.join(extensionOutputFolder, updatedConfigurationCachePath);
                    }
                    else {
                        updatedConfigurationCachePath = util.resolvePathToRoot(updatedConfigurationCachePath);
                    }
                }
                if (updatedConfigurationCachePath !== configurationCachePath) {
                    // A change in makefile.configurationCachePath should trigger an IntelliSense update
                    // only if the extension is not currently reading from a build log.
                    extension_1.extension.getState().configureDirty = extension_1.extension.getState().configureDirty ||
                        !buildLog || !util.checkFileExistsSync(buildLog);
                    readConfigurationCachePath();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "makePath";
                let updatedMakePath = workspaceConfiguration.get(subKey);
                if (updatedMakePath !== makePath) {
                    // Not very likely, but it is safe to consider that a different make tool
                    // may produce a different dry-run output with potential impact on IntelliSense,
                    // so trigger an update (unless we read from a build log).
                    extension_1.extension.getState().configureDirty = extension_1.extension.getState().configureDirty ||
                        !buildLog || !util.checkFileExistsSync(buildLog);
                    readMakePath();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "makefilePath";
                let updatedMakefilePath = workspaceConfiguration.get(subKey);
                if (updatedMakefilePath) {
                    updatedMakefilePath = util.resolvePathToRoot(updatedMakefilePath);
                }
                if (updatedMakefilePath !== makefilePath) {
                    // A change in makefile.makefilePath should trigger an IntelliSense update
                    // only if the extension is not currently reading from a build log.
                    extension_1.extension.getState().configureDirty = extension_1.extension.getState().configureDirty ||
                        !buildLog || !util.checkFileExistsSync(buildLog);
                    readMakefilePath();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "makeDirectory";
                let updatedMakeDirectory = workspaceConfiguration.get(subKey);
                if (updatedMakeDirectory) {
                    updatedMakeDirectory = util.resolvePathToRoot(updatedMakeDirectory);
                }
                if (updatedMakeDirectory !== makeDirectory) {
                    // A change in makefile.makeDirectory should trigger an IntelliSense update
                    // only if the extension is not currently reading from a build log.
                    extension_1.extension.getState().configureDirty = extension_1.extension.getState().configureDirty ||
                        !buildLog || !util.checkFileExistsSync(buildLog);
                    readMakeDirectory();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "configurations";
                let updatedMakefileConfigurations = workspaceConfiguration.get(subKey);
                if (!util.areEqual(updatedMakefileConfigurations, makefileConfigurations)) {
                    // todo: skip over updating the IntelliSense configuration provider if the current makefile configuration
                    // is not among the subobjects that suffered modifications.
                    extension_1.extension.getState().configureDirty = true;
                    readMakefileConfigurations();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "dryrunSwitches";
                let updatedDryrunSwitches = workspaceConfiguration.get(subKey);
                if (!util.areEqual(updatedDryrunSwitches, dryrunSwitches)) {
                    // A change in makefile.dryrunSwitches should trigger an IntelliSense update
                    // only if the extension is not currently reading from a build log.
                    extension_1.extension.getState().configureDirty = extension_1.extension.getState().configureDirty ||
                        !buildLog || !util.checkFileExistsSync(buildLog);
                    readDryrunSwitches();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "additionalCompilerNames";
                let updatedAdditionalCompilerNames = workspaceConfiguration.get(subKey);
                if (!util.areEqual(updatedAdditionalCompilerNames, additionalCompilerNames)) {
                    readAdditionalCompilerNames();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "excludeCompilerNames";
                let updatedExcludeCompilerNames = workspaceConfiguration.get(subKey);
                if (!util.areEqual(updatedExcludeCompilerNames, excludeCompilerNames)) {
                    readExcludeCompilerNames();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "configureOnOpen";
                let updatedConfigureOnOpen = workspaceConfiguration.get(subKey);
                if (updatedConfigureOnOpen !== configureOnOpen) {
                    readConfigureOnOpen();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "configureOnEdit";
                let updatedConfigureOnEdit = workspaceConfiguration.get(subKey);
                if (updatedConfigureOnEdit !== configureOnEdit) {
                    readConfigureOnEdit();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "configureAfterCommand";
                let updatedConfigureAfterCommand = workspaceConfiguration.get(subKey);
                if (updatedConfigureAfterCommand !== configureAfterCommand) {
                    readConfigureAfterCommand();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "phonyOnlyTargets";
                let updatedPhonyOnlyTargets = workspaceConfiguration.get(subKey);
                if (updatedPhonyOnlyTargets !== phonyOnlyTargets) {
                    readPhonyOnlyTargets();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "saveBeforeBuildOrConfigure";
                let updatedSaveBeforeBuildOrConfigure = workspaceConfiguration.get(subKey);
                if (updatedSaveBeforeBuildOrConfigure !== saveBeforeBuildOrConfigure) {
                    readSaveBeforeBuildOrConfigure();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "buildBeforeLaunch";
                let updatedBuildBeforeLaunch = workspaceConfiguration.get(subKey);
                if (updatedBuildBeforeLaunch !== buildBeforeLaunch) {
                    readBuildBeforeLaunch();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "clearOutputBeforeBuild";
                let updatedClearOutputBeforeBuild = workspaceConfiguration.get(subKey);
                if (updatedClearOutputBeforeBuild !== clearOutputBeforeBuild) {
                    readClearOutputBeforeBuild();
                    updatedSettingsSubkeys.push(subKey);
                }
                subKey = "ignoreDirectoryCommands";
                let updatedIgnoreDirectoryCommands = workspaceConfiguration.get(subKey);
                if (updatedIgnoreDirectoryCommands !== ignoreDirectoryCommands) {
                    readIgnoreDirectoryCommands();
                    updatedSettingsSubkeys.push(subKey);
                }
                // Final updates in some constructs that depend on more than one of the above settings.
                if (extension_1.extension.getState().configureDirty) {
                    analyzeConfigureParams();
                }
                // Report all the settings changes detected by now.
                // TODO: to avoid unnecessary telemetry processing, evaluate whether the changes done
                // in the object makefile.launchConfigurations and makefile.configurations
                // apply exactly to the current launch configuration, since we don't collect and aggregate
                // information from all the array yet.
                updatedSettingsSubkeys.forEach(subKey => {
                    let key = keyRoot + "." + subKey;
                    logger.message(`${key} setting changed.`, "Verbose");
                    try {
                        telemetryProperties = telemetry.analyzeSettings(workspaceConfiguration[subKey], key, util.thisExtensionPackage().contributes.configuration.properties[key], false, telemetryProperties);
                    }
                    catch (e) {
                        logger.message(e.message);
                    }
                });
                if (telemetryProperties && util.hasProperties(telemetryProperties)) {
                    telemetry.logEvent("settingsChanged", telemetryProperties);
                }
            }
        }));
    });
}
exports.initFromStateAndSettings = initFromStateAndSettings;
function setConfigurationByName(configurationName) {
    extension_1.extension.getState().buildConfiguration = configurationName;
    setCurrentMakefileConfiguration(configurationName);
    extension_1.extension._projectOutlineProvider.updateConfiguration(configurationName);
}
exports.setConfigurationByName = setConfigurationByName;
function prepareConfigurationsQuickPick() {
    const items = makefileConfigurations.map((k => {
        return k.name;
    }));
    if (items.length === 0) {
        logger.message("No configurations defined in makefile.configurations setting.");
        items.push("Default");
    }
    return items;
}
exports.prepareConfigurationsQuickPick = prepareConfigurationsQuickPick;
// Fill a drop-down with all the configuration names defined by the user in makefile.configurations setting.
// Triggers a cpptools configuration provider update after selection.
function setNewConfiguration() {
    return __awaiter(this, void 0, void 0, function* () {
        // Cannot set a new makefile configuration if the project is currently building or (pre-)configuring.
        if (make.blockedByOp(make.Operations.changeConfiguration)) {
            return;
        }
        const items = prepareConfigurationsQuickPick();
        let options = {};
        options.ignoreFocusOut = true; // so that the logger and the quick pick don't compete over focus
        const chosen = yield vscode.window.showQuickPick(items, options);
        if (chosen && chosen !== getCurrentMakefileConfiguration()) {
            let telemetryProperties = {
                state: "makefileConfiguration"
            };
            telemetry.logEvent("stateChanged", telemetryProperties);
            setConfigurationByName(chosen);
            if (configureAfterCommand) {
                logger.message("Automatically reconfiguring the project after a makefile configuration change.");
                yield make.configure(make.TriggeredBy.configureAfterConfigurationChange);
            }
            // Refresh telemetry for this new makefile configuration
            // (this will find the corresponding item in the makefile.configurations array
            // and report all the relevant settings of that object).
            // Because of this, the event name is still "settingsChanged", even if
            // we're doing a state change now.
            let keyRoot = "makefile";
            let subKey = "configurations";
            let key = keyRoot + "." + subKey;
            let workspaceConfiguration = vscode.workspace.getConfiguration(keyRoot);
            telemetryProperties = {};
            // We should have at least one item in the configurations array
            // if the extension changes state for launch configuration,
            // but guard just in case.
            let makefileonfigurationSetting = workspaceConfiguration[subKey];
            if (makefileonfigurationSetting) {
                try {
                    telemetryProperties = telemetry.analyzeSettings(makefileonfigurationSetting, key, util.thisExtensionPackage().contributes.configuration.properties[key], true, telemetryProperties);
                }
                catch (e) {
                    logger.message(e.message);
                }
                if (telemetryProperties && util.hasProperties(telemetryProperties)) {
                    telemetry.logEvent("settingsChanged", telemetryProperties);
                }
            }
        }
    });
}
exports.setNewConfiguration = setNewConfiguration;
function setTargetByName(targetName) {
    currentTarget = targetName;
    let displayTarget = targetName ? currentTarget : "Default";
    statusBar.setTarget(displayTarget);
    logger.message("Setting target " + displayTarget);
    extension_1.extension.getState().buildTarget = currentTarget;
    extension_1.extension._projectOutlineProvider.updateBuildTarget(targetName);
}
exports.setTargetByName = setTargetByName;
// Fill a drop-down with all the target names run by building the makefile for the current configuration
// Triggers a cpptools configuration provider update after selection.
// TODO: change the UI list to multiple selections mode and store an array of current active targets
function selectTarget() {
    return __awaiter(this, void 0, void 0, function* () {
        // Cannot select a new target if the project is currently building or (pre-)configuring.
        if (make.blockedByOp(make.Operations.changeBuildTarget)) {
            return;
        }
        // warn about an out of date configure state and configure if makefile.configureAfterCommand allows.
        if (extension_1.extension.getState().configureDirty ||
            // The configure state might not be dirty from the last session but if the project is set to skip
            // configure on open and no configure happened yet we still must warn.
            (configureOnOpen === false && !extension_1.extension.getCompletedConfigureInSession())) {
            logger.message("The project needs a configure to populate the build targets correctly.");
            if (configureAfterCommand) {
                let retc = yield make.configure(make.TriggeredBy.configureBeforeTargetChange);
                if (retc !== make.ConfigureBuildReturnCodeTypes.success) {
                    logger.message("The build targets list may not be accurate because configure failed.");
                }
            }
        }
        let options = {};
        options.ignoreFocusOut = true; // so that the logger and the quick pick don't compete over focus
        // Ensure "all" is always available as a target to select.
        // There are scenarios when "all" might not be present in the list of available targets,
        // for example when the extension is using a build log or dryrun cache of a previous state
        // when a particular target was selected and a dryrun applied on that is producing a subset of targets,
        // making it impossible to select "all" back again without resetting the Makefile Tools state
        // or switching to a different makefile configuration or implementing an editable target quick pick.
        // Another situation where "all" would inconveniently miss from the quick pick is when the user is
        // providing a build log without the required verbosity for parsing targets (-p or --print-data-base switches).
        // When the extension is not reading from build log or dryrun cache, we have logic to prevent
        // "all" from getting lost: make sure the target is not appended to the make invocation
        // whose output is used to parse the targets (as opposed to parsing for IntelliSense or launch targets
        // when the current target must be appended to the make command).
        if (!buildTargets.includes("all")) {
            buildTargets.push("all");
        }
        const chosen = yield vscode.window.showQuickPick(buildTargets, options);
        if (chosen && chosen !== getCurrentTarget()) {
            const telemetryProperties = {
                state: "buildTarget"
            };
            telemetry.logEvent("stateChanged", telemetryProperties);
            setTargetByName(chosen);
            if (configureAfterCommand) {
                // The set of build targets remains the same even if the current target has changed
                logger.message("Automatically reconfiguring the project after a build target change.");
                yield make.configure(make.TriggeredBy.configureAfterTargetChange, false);
            }
        }
    });
}
exports.selectTarget = selectTarget;
// The 'name' of a launch configuration is a string following this syntax:
//    [cwd]>[binaryPath](binaryArg1,binaryArg2,...)
// These strings are found by the extension while parsing the output of the dry-run or build log,
// which reflect possible different ways of running the binaries built by the makefile.
// TODO: If we find that these strings are not unique (meaning the makefile may invoke
// the given binary in the exact same way more than once), incorporate also the containing target
// name in the syntax (or, since in theory one can write a makefile target to run the same binary
// in the same way more than once, add some number suffix).
function setLaunchConfigurationByName(launchConfigurationName) {
    return __awaiter(this, void 0, void 0, function* () {
        // Find the matching entry in the array of launch configurations
        // or generate a new entry in settings if none are found.
        currentLaunchConfiguration = getLaunchConfiguration(launchConfigurationName);
        if (!currentLaunchConfiguration) {
            currentLaunchConfiguration = yield stringToLaunchConfiguration(launchConfigurationName);
            if (currentLaunchConfiguration) {
                launchConfigurations.push(currentLaunchConfiguration);
                let workspaceConfiguration = vscode.workspace.getConfiguration("makefile");
                workspaceConfiguration.update("launchConfigurations", launchConfigurations);
                logger.message("Inserting a new entry for {0} in the array of makefile.launchConfigurations. " +
                    "You may define any additional debug properties for it in settings.", launchConfigurationName);
            }
        }
        if (currentLaunchConfiguration) {
            logger.message('Setting current launch target "' + launchConfigurationName + '"');
            extension_1.extension.getState().launchConfiguration = launchConfigurationName;
            statusBar.setLaunchConfiguration(launchConfigurationName);
        }
        else {
            if (launchConfigurationName === "") {
                logger.message("Unsetting the current launch configuration.");
            }
            else {
                logger.message(`A problem occured while analyzing launch configuration name ${launchConfigurationName}. Current launch configuration is unset.`);
            }
            extension_1.extension.getState().launchConfiguration = undefined;
            statusBar.setLaunchConfiguration("No launch configuration set");
        }
        yield extension_1.extension._projectOutlineProvider.updateLaunchTarget(launchConfigurationName);
    });
}
exports.setLaunchConfigurationByName = setLaunchConfigurationByName;
// Fill a drop-down with all the launch configurations found for binaries built by the makefile
// under the scope of the current build configuration and target
// Selection updates current launch configuration that will be ready for the next debug/run operation
function selectLaunchConfiguration() {
    return __awaiter(this, void 0, void 0, function* () {
        // Cannot select a new launch configuration if the project is currently building or (pre-)configuring.
        if (make.blockedByOp(make.Operations.changeLaunchTarget)) {
            return;
        }
        // warn about an out of date configure state and configure if makefile.configureAfterCommand allows.
        if (extension_1.extension.getState().configureDirty ||
            // The configure state might not be dirty from the last session but if the project is set to skip
            // configure on open and no configure happened yet we still must warn.
            (configureOnOpen === false && !extension_1.extension.getCompletedConfigureInSession())) {
            logger.message("The project needs a configure to populate the launch targets correctly.");
            if (configureAfterCommand) {
                let retc = yield make.configure(make.TriggeredBy.configureBeforeLaunchTargetChange);
                if (retc !== make.ConfigureBuildReturnCodeTypes.success) {
                    logger.message("The launch targets list may not be accurate because configure failed.");
                }
            }
        }
        // TODO: create a quick pick with description and details for items
        // to better view the long targets commands
        // In the quick pick, include also any makefile.launchConfigurations entries,
        // as long as they exist on disk and without allowing duplicates.
        let launchTargetsNames = [...launchTargets];
        launchConfigurations.forEach(launchConfiguration => {
            if (util.checkFileExistsSync(launchConfiguration.binaryPath)) {
                launchTargetsNames.push(launchConfigurationToString(launchConfiguration));
            }
        });
        launchTargetsNames = util.sortAndRemoveDuplicates(launchTargetsNames);
        let options = {};
        options.ignoreFocusOut = true; // so that the logger and the quick pick don't compete over focus
        if (launchTargets.length === 0) {
            options.placeHolder = "No launch targets identified";
        }
        const chosen = yield vscode.window.showQuickPick(launchTargetsNames, options);
        if (chosen) {
            let currentLaunchConfiguration = getCurrentLaunchConfiguration();
            if (!currentLaunchConfiguration || chosen !== launchConfigurationToString(currentLaunchConfiguration)) {
                let telemetryProperties = {
                    state: "launchConfiguration"
                };
                telemetry.logEvent("stateChanged", telemetryProperties);
                yield setLaunchConfigurationByName(chosen);
                // Refresh telemetry for this new launch configuration
                // (this will find the corresponding item in the makefile.launchConfigurations array
                // and report all the relevant settings of that object).
                // Because of this, the event name is still "settingsChanged", even if
                // we're doing a state change now.
                let keyRoot = "makefile";
                let subKey = "launchConfigurations";
                let key = keyRoot + "." + subKey;
                let workspaceConfiguration = vscode.workspace.getConfiguration(keyRoot);
                telemetryProperties = {};
                // We should have at least one item in the launchConfigurations array
                // if the extension changes state for launch configuration,
                // but guard just in case.
                let launchConfigurationSetting = workspaceConfiguration[subKey];
                if (launchConfigurationSetting) {
                    try {
                        telemetryProperties = telemetry.analyzeSettings(launchConfigurationSetting, key, util.thisExtensionPackage().contributes.configuration.properties[key], true, telemetryProperties);
                    }
                    catch (e) {
                        logger.message(e.message);
                    }
                    if (telemetryProperties && util.hasProperties(telemetryProperties)) {
                        telemetry.logEvent("settingsChanged", telemetryProperties);
                    }
                }
            }
        }
    });
}
exports.selectLaunchConfiguration = selectLaunchConfiguration;
// List of targets defined in the makefile project.
// Parsed from the build log, configuration cache or live dry-run output at configure time.
// Currently, this list contains any abstract intermediate target
// (like any object produced by the compiler from a source code file).
// TODO: filter only the relevant targets (binaries, libraries, etc...) from this list.
let buildTargets = [];
function getBuildTargets() { return buildTargets; }
exports.getBuildTargets = getBuildTargets;
function setBuildTargets(targets) { buildTargets = targets; }
exports.setBuildTargets = setBuildTargets;
// List of all the binaries built by the current project and all the ways
// they may be invoked (from what cwd, with what arguments).
// This is parsed from the build log, configuration cache or live dry-run output at configure time.
// This is what populates the 'launch targets' quick pick and is different than the
// launch configurations defined in settings.
// A launch configuration extends a launch target with various debugger settings.
// Each launch configuration entry is written in settings by the extension
// when the user actively selects any launch target from the quick pick.
// Then the user can add any of the provided extra attributes (miMode, miDebuggerPath, etc...)
// under that entry. It is possible that not all launch targets have a launch configuration counterpart,
// but if they do it is only one. Technically, we can imagine one launch target may have
// more than one launch configurations defined in settings (same binary, location and arguments debugged
// with different scenarios)) but this is not yet supported because currently the launch configurations
// are uniquely referenced by a string formed by cwd, binary and args (which form a launch target).
// The quick pick is not populated by the launch configurations list because its entries may be
// out of date and most importantly a subset. We want the quick pick to reflect all the possibilities
// that are found available with the current configuration of the project.
let launchTargets = [];
function getLaunchTargets() { return launchTargets; }
exports.getLaunchTargets = getLaunchTargets;
function setLaunchTargets(targets) { launchTargets = targets; }
exports.setLaunchTargets = setLaunchTargets;
//# sourceMappingURL=configuration.js.map