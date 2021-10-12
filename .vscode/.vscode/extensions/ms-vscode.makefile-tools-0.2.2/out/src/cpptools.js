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
exports.CppConfigurationProvider = void 0;
// Support for integration with CppTools Custom Configuration Provider
const configuration = require("./configuration");
const logger = require("./logger");
const make = require("./make");
const path = require("path");
const util = require("./util");
class CppConfigurationProvider {
    constructor() {
        this.name = 'Makefile Tools';
        this.extensionId = 'ms-vscode.makefile-tools';
        this.workspaceBrowseConfiguration = { browsePath: [] };
        this.fileIndex = new Map();
    }
    getConfiguration(uri) {
        const norm_path = path.normalize(uri.fsPath);
        // First look in the file index computed during the last configure.
        // If nothing is found and there is a configure running right now,
        // try also the temporary index of the current configure.
        let sourceFileConfiguration = this.fileIndex.get(norm_path);
        if (!sourceFileConfiguration && make.getIsConfiguring()) {
            sourceFileConfiguration = make.getDeltaCustomConfigurationProvider().fileIndex.get(norm_path);
            logger.message(`Configuration for file ${norm_path} was not found. Searching in the current configure temporary file index.`);
        }
        if (!sourceFileConfiguration) {
            logger.message(`Configuration for file ${norm_path} was not found. CppTools will set a default configuration.`);
            logger.showOutputChannel();
        }
        return sourceFileConfiguration;
    }
    canProvideConfiguration(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            return !!this.getConfiguration(uri);
        });
    }
    provideConfigurations(uris) {
        return __awaiter(this, void 0, void 0, function* () {
            return util.dropNulls(uris.map(u => this.getConfiguration(u)));
        });
    }
    // Used when saving all the computed configurations into a cache.
    getCustomConfigurationProvider() {
        let provider = {
            fileIndex: this.fileIndex,
            workspaceBrowse: this.workspaceBrowseConfiguration
        };
        return provider;
    }
    // Used to reset all the configurations with what was previously cached.
    setCustomConfigurationProvider(provider) {
        this.fileIndex = provider.fileIndex;
        this.workspaceBrowseConfiguration = provider.workspaceBrowse;
    }
    // Used to merge a new set of configurations on top of what was calculated during the previous configure.
    // If this is clean configure, clear all the arrays before the merge.
    mergeCustomConfigurationProvider(provider) {
        var _a;
        if (make.getConfigureIsClean()) {
            this.fileIndex.clear();
            this.workspaceBrowseConfiguration = {
                browsePath: [],
                compilerArgs: [],
                compilerPath: undefined,
                standard: undefined,
                windowsSdkVersion: undefined
            };
        }
        let map = this.fileIndex;
        provider.fileIndex.forEach(function (value, key) {
            map.set(key, value);
        });
        this.workspaceBrowseConfiguration = {
            browsePath: util.sortAndRemoveDuplicates(this.workspaceBrowseConfiguration.browsePath.concat(provider.workspaceBrowse.browsePath)),
            compilerArgs: (_a = this.workspaceBrowseConfiguration.compilerArgs) === null || _a === void 0 ? void 0 : _a.concat(provider.workspaceBrowse.compilerArgs || []),
            compilerPath: provider.workspaceBrowse.compilerPath,
            standard: provider.workspaceBrowse.standard,
            windowsSdkVersion: provider.workspaceBrowse.windowsSdkVersion
        };
    }
    canProvideBrowseConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    canProvideBrowseConfigurationsPerFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
    provideFolderBrowseConfiguration(_uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (_uri.fsPath !== util.getWorkspaceRoot()) {
                logger.message("Makefile Tools supports single root for now.");
            }
            return this.workspaceBrowseConfiguration;
        });
    }
    provideBrowseConfiguration() {
        return __awaiter(this, void 0, void 0, function* () { return this.workspaceBrowseConfiguration; });
    }
    setBrowseConfiguration(browseConfiguration) { this.workspaceBrowseConfiguration = browseConfiguration; }
    dispose() { }
    logConfigurationProviderBrowse() {
        var _a;
        logger.message("Sending Workspace Browse Configuration: -----------------------------------", "Verbose");
        logger.message("    Browse Path: " + this.workspaceBrowseConfiguration.browsePath.join(";"), "Verbose");
        logger.message("    Standard: " + this.workspaceBrowseConfiguration.standard, "Verbose");
        logger.message("    Compiler Path: " + this.workspaceBrowseConfiguration.compilerPath, "Verbose");
        logger.message("    Compiler Arguments: " + ((_a = this.workspaceBrowseConfiguration.compilerArgs) === null || _a === void 0 ? void 0 : _a.join(";")), "Verbose");
        if (process.platform === "win32" && this.workspaceBrowseConfiguration.windowsSdkVersion) {
            logger.message("    Windows SDK Version: " + this.workspaceBrowseConfiguration.windowsSdkVersion, "Verbose");
        }
        logger.message("----------------------------------------------------------------------------", "Verbose");
    }
    logConfigurationProviderItem(filePath, fromCache = false) {
        var _a;
        let uriObj = filePath.uri;
        logger.message("Sending configuration " + (fromCache ? "(from cache) " : "") + "for file " + uriObj.fsPath + " -----------------------------------", "Normal");
        logger.message("    Defines: " + filePath.configuration.defines.join(";"), "Verbose");
        logger.message("    Includes: " + filePath.configuration.includePath.join(";"), "Verbose");
        if (filePath.configuration.forcedInclude) {
            logger.message("    Force Includes: " + filePath.configuration.forcedInclude.join(";"), "Verbose");
        }
        logger.message("    Standard: " + filePath.configuration.standard, "Verbose");
        logger.message("    IntelliSense Mode: " + filePath.configuration.intelliSenseMode, "Verbose");
        logger.message("    Compiler Path: " + filePath.configuration.compilerPath, "Verbose");
        logger.message("    Compiler Arguments: " + ((_a = filePath.configuration.compilerArgs) === null || _a === void 0 ? void 0 : _a.join(";")), "Verbose");
        if (process.platform === "win32" && filePath.configuration.windowsSdkVersion) {
            logger.message("    Windows SDK Version: " + filePath.configuration.windowsSdkVersion, "Verbose");
        }
        logger.message("---------------------------------------------------------------------------------------------------", "Verbose");
    }
    logConfigurationProviderComplete() {
        if (configuration.getLoggingLevel() !== "Normal") {
            this.logConfigurationProviderBrowse();
            this.fileIndex.forEach(filePath => {
                // logConfigurationProviderComplete is called (so far) only after loading
                // the configurations from cache, so mark the boolean to be able to distinguish
                // the log entries in case of interleaved output.
                this.logConfigurationProviderItem(filePath, true);
            });
        }
    }
}
exports.CppConfigurationProvider = CppConfigurationProvider;
//# sourceMappingURL=cpptools.js.map