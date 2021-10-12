"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUI = exports.UI = void 0;
// Deprecated UI support for buttons and quickpicks.
// Replaced by makefile.outline view in the left side bar.
// To be removed, hidden for now.
const vscode = require("vscode");
let ui;
class UI {
    constructor() {
        this.configurationButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 4.6);
        this.configurationButton.command = "makefile.setBuildConfiguration";
        this.configurationButton.tooltip = "Click to select the workspace make configuration";
        this.configurationButton.hide();
        this.targetButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 4.5);
        this.targetButton.command = "makefile.setBuildTarget";
        this.targetButton.tooltip = "Click to select the target to be run by make";
        this.targetButton.hide();
        this.buildButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 4.4);
        this.buildButton.command = "makefile.buildTarget";
        this.buildButton.tooltip = "Click to build the selected target";
        this.buildButton.text = "$(gear) Build";
        this.buildButton.hide();
        this.launchConfigurationButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 4.3);
        this.launchConfigurationButton.command = "makefile.setLaunchConfiguration";
        this.launchConfigurationButton.tooltip = "Click to select the make launch configuration (binary, args and current path)";
        this.launchConfigurationButton.hide();
        this.debugButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 4.2);
        this.debugButton.command = "makefile.launchDebug";
        this.debugButton.tooltip = "Click to debug the selected executable";
        this.debugButton.text = "$(bug) Debug";
        this.debugButton.hide();
        this.runButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 4.1);
        this.runButton.command = "makefile.launchRun";
        this.runButton.tooltip = "Click to launch the selected executable";
        this.runButton.text = "$(terminal) Run";
        this.runButton.hide();
    }
    setConfiguration(configuration) {
        this.configurationButton.text = "$(settings) Build configuration: " + configuration;
    }
    setTarget(target) {
        this.targetButton.text = "$(tag) Target to build: " + target;
    }
    setLaunchConfiguration(launchConfigurationStr) {
        if (launchConfigurationStr) {
            this.launchConfigurationButton.text = "$(rocket) Launch configuration: ";
            this.launchConfigurationButton.text += "[";
            this.launchConfigurationButton.text += launchConfigurationStr;
            this.launchConfigurationButton.text += "]";
        }
        else {
            this.launchConfigurationButton.text = "No launch configuration set";
        }
    }
    dispose() {
        this.configurationButton.dispose();
        this.targetButton.dispose();
        this.launchConfigurationButton.dispose();
        this.buildButton.dispose();
        this.debugButton.dispose();
        this.runButton.dispose();
    }
}
exports.UI = UI;
function getUI() {
    if (ui === undefined) {
        ui = new UI();
    }
    return ui;
}
exports.getUI = getUI;
//# sourceMappingURL=ui.js.map