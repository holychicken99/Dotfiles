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
exports.ProjectOutlineProvider = exports.ConfigurationNode = exports.LaunchTargetNode = exports.BuildTargetNode = void 0;
// Tree.ts
const configuration = require("./configuration");
const util = require("./util");
const vscode = require("vscode");
class BaseNode {
    constructor(id) {
        this.id = id;
    }
}
class BuildTargetNode extends BaseNode {
    constructor(targetName) {
        super(`buildTarget:${targetName}`);
        this._name = targetName;
    }
    update(targetName) {
        this._name = `Build target: [${targetName}]`;
    }
    getChildren() {
        return [];
    }
    getTreeItem() {
        try {
            const item = new vscode.TreeItem(this._name);
            item.collapsibleState = vscode.TreeItemCollapsibleState.None;
            item.tooltip = "The makefile target currently selected for build.";
            item.contextValue = [
                `nodeType=buildTarget`,
            ].join(',');
            return item;
        }
        catch (e) {
            return new vscode.TreeItem(`${this._name} (There was an issue rendering this item.)`);
        }
    }
}
exports.BuildTargetNode = BuildTargetNode;
class LaunchTargetNode extends BaseNode {
    constructor(targetName) {
        super(`launchTarget:${targetName}`);
        // Show the complete launch target name as tooltip and the short name as label
        this._name = targetName;
        this._toolTip = targetName;
    }
    // Keep the tree node label as short as possible.
    // The binary path is the most important component of a launch target.
    getShortLaunchTargetName(completeLaunchTargetName) {
        return __awaiter(this, void 0, void 0, function* () {
            let launchConfiguration = yield configuration.stringToLaunchConfiguration(completeLaunchTargetName);
            let shortName;
            if (!launchConfiguration) {
                shortName = "Unset";
            }
            else {
                if (vscode.workspace.workspaceFolders) {
                    // In a complete launch target string, the binary path is relative to cwd.
                    // In here, since we don't show cwd, make it relative to current workspace folder.
                    shortName = util.makeRelPath(launchConfiguration.binaryPath, vscode.workspace.workspaceFolders[0].uri.fsPath);
                }
                else {
                    // Just in case, if for some reason we don't have a workspace folder, return full binary path.
                    shortName = launchConfiguration.binaryPath;
                }
            }
            return `Launch target: [${shortName}]`;
        });
    }
    update(targetName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Show the complete launch target name as tooltip and the short name as label
            this._name = yield this.getShortLaunchTargetName(targetName);
            this._toolTip = targetName;
        });
    }
    getChildren() {
        return [];
    }
    getTreeItem() {
        try {
            const item = new vscode.TreeItem(this._name);
            item.collapsibleState = vscode.TreeItemCollapsibleState.None;
            item.tooltip = `The launch target currently selected for debug and run in terminal.\n${this._toolTip}`;
            item.contextValue = [
                `nodeType=launchTarget`,
            ].join(',');
            return item;
        }
        catch (e) {
            return new vscode.TreeItem(`${this._name} (There was an issue rendering this item.)`);
        }
    }
}
exports.LaunchTargetNode = LaunchTargetNode;
class ConfigurationNode extends BaseNode {
    constructor(configurationName) {
        super(`configuration:${configurationName}`);
        this._name = configurationName;
    }
    update(configurationName) {
        this._name = `Configuration: [${configurationName}]`;
    }
    getChildren() {
        return [];
    }
    getTreeItem() {
        try {
            const item = new vscode.TreeItem(this._name);
            item.collapsibleState = vscode.TreeItemCollapsibleState.None;
            item.tooltip = "The makefile configuration currently selected from settings ('makefile.configurations').";
            item.contextValue = [
                `nodeType=configuration`,
            ].join(',');
            return item;
        }
        catch (e) {
            return new vscode.TreeItem(`${this._name} (There was an issue rendering this item.)`);
        }
    }
}
exports.ConfigurationNode = ConfigurationNode;
class ProjectOutlineProvider {
    constructor() {
        this._changeEvent = new vscode.EventEmitter();
        this._currentConfigurationItem = new ConfigurationNode("Unset");
        this._currentBuildTargetItem = new BuildTargetNode("Unset");
        this._currentLaunchTargetItem = new LaunchTargetNode("Unset");
    }
    get onDidChangeTreeData() {
        return this._changeEvent.event;
    }
    getTreeItem(node) {
        return __awaiter(this, void 0, void 0, function* () {
            return node.getTreeItem();
        });
    }
    getChildren(node) {
        if (node) {
            return node.getChildren();
        }
        return [this._currentConfigurationItem, this._currentBuildTargetItem, this._currentLaunchTargetItem];
    }
    update(configuration, buildTarget, launchTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            this._currentConfigurationItem.update(configuration);
            this._currentBuildTargetItem.update(buildTarget);
            yield this._currentLaunchTargetItem.update(launchTarget);
            this._changeEvent.fire(null);
        });
    }
    updateConfiguration(configuration) {
        this._currentConfigurationItem.update(configuration);
        this._changeEvent.fire(null);
    }
    updateBuildTarget(buildTarget) {
        this._currentBuildTargetItem.update(buildTarget);
        this._changeEvent.fire(null);
    }
    updateLaunchTarget(launchTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._currentLaunchTargetItem.update(launchTarget);
            this._changeEvent.fire(null);
        });
    }
}
exports.ProjectOutlineProvider = ProjectOutlineProvider;
//# sourceMappingURL=tree.js.map