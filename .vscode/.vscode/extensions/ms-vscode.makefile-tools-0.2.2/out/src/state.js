"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = void 0;
// state.ts
const vscode = require("vscode");
// Class for the management of all the workspace state variables
class StateManager {
    constructor(extensionContext) {
        this.extensionContext = extensionContext;
    }
    _get(key) {
        return this.extensionContext.workspaceState.get(key);
    }
    _update(key, value) {
        return this.extensionContext.workspaceState.update(key, value);
    }
    // The project build configuration (one of the entries in the array of makefile.configurations
    // or a default).
    get buildConfiguration() {
        return this._get('buildConfiguration');
    }
    set buildConfiguration(v) {
        this._update('buildConfiguration', v);
    }
    // The project build target (one of the targets defined in the makefile).
    get buildTarget() {
        return this._get('buildTarget');
    }
    set buildTarget(v) {
        this._update('buildTarget', v);
    }
    // The project launch configuration (one of the entries in the array of makefile.launchConfigurations).
    get launchConfiguration() {
        return this._get('launchConfiguration');
    }
    set launchConfiguration(v) {
        this._update('launchConfiguration', v);
    }
    // Whether this project had any configure attempt before
    // (it didn't have to succeed or even complete).
    // Sent as telemetry information and useful to know
    // how many projects are able to configure out of the box.
    get ranConfigureInCodebaseLifetime() {
        return this._get('ranConfigureInCodebaseLifetime') || false;
    }
    set ranConfigureInCodebaseLifetime(v) {
        this._update('ranConfigureInCodebaseLifetime', v);
    }
    // If the project needs a clean configure as a result
    // of an operation that alters the configure state
    // (makefile configuration change, build target change,
    // settings or makefiles edits)
    get configureDirty() {
        let dirty = this._get('configureDirty');
        if (dirty === undefined) {
            dirty = true;
        }
        return dirty;
    }
    set configureDirty(v) {
        this._update('configureDirty', v);
    }
    // Reset all the variables saved in the workspace state.
    reset() {
        this.buildConfiguration = undefined;
        this.buildTarget = undefined;
        this.launchConfiguration = undefined;
        this.ranConfigureInCodebaseLifetime = false;
        this.configureDirty = false;
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
}
exports.StateManager = StateManager;
//# sourceMappingURL=state.js.map