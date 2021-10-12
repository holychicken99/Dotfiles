"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageNoCR = exports.message = exports.clearOutputChannel = exports.showOutputChannel = void 0;
// Logging support
const fs = require("fs");
const configuration = require("./configuration");
const vscode = require("vscode");
let makeOutputChannel;
function getOutputChannel() {
    if (!makeOutputChannel) {
        makeOutputChannel = vscode.window.createOutputChannel("Makefile tools");
        makeOutputChannel.show(true); // don't take focus
    }
    return makeOutputChannel;
}
// TODO: process verbosities with enums instead of strings.
// This is a temporary hack.
function loggingLevelApplies(messageVerbosity) {
    let projectVerbosity = configuration.getLoggingLevel();
    if (messageVerbosity === "Debug") {
        return projectVerbosity === "Debug";
    }
    else if (messageVerbosity === "Verbose") {
        return projectVerbosity === "Verbose" || projectVerbosity === "Debug";
    }
    return true;
}
function showOutputChannel() {
    if (makeOutputChannel) {
        makeOutputChannel.show(true);
    }
}
exports.showOutputChannel = showOutputChannel;
function clearOutputChannel() {
    if (makeOutputChannel) {
        makeOutputChannel.clear();
    }
}
exports.clearOutputChannel = clearOutputChannel;
//TODO: implement more verbosity levels for the output log
function message(message, loggingLevel) {
    // Print the message only if the intended logging level matches the settings
    // or if no loggingLevel restriction is provided.
    if (!loggingLevelApplies(loggingLevel)) {
        return;
    }
    let channel = getOutputChannel();
    channel.appendLine(message);
    let extensionLog = configuration.getExtensionLog();
    if (extensionLog) {
        fs.appendFileSync(extensionLog, message);
        fs.appendFileSync(extensionLog, "\n");
    }
}
exports.message = message;
// This is used for a few scenarios where the message already has end of line incorporated.
// Example: stdout/stderr of a child process read before the stream is closed.
function messageNoCR(message, loggingLevel) {
    // Print the message only if the intended logging level matches the settings
    // or if no loggingLevel restriction is provided.
    if (!loggingLevelApplies(loggingLevel)) {
        return;
    }
    let channel = getOutputChannel();
    channel.append(message);
    let extensionLog = configuration.getExtensionLog();
    if (extensionLog) {
        fs.appendFileSync(extensionLog, message);
    }
}
exports.messageNoCR = messageNoCR;
//# sourceMappingURL=logger.js.map