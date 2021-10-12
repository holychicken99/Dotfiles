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
exports.analyzeSettings = exports.logEvent = exports.deactivate = exports.activate = void 0;
// Telemetry.ts
const configuration = require("./configuration");
const logger = require("./logger");
const util = require("./util");
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
let telemetryReporter;
function activate() {
    try {
        // Don't create the telemetry object (which will result in no information being sent)
        // when running Makefile Tools tests.
        if (process.env['MAKEFILE_TOOLS_TESTING'] !== '1') {
            telemetryReporter = createReporter();
        }
    }
    catch (e) {
        // can't really do much about this
    }
}
exports.activate = activate;
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        if (telemetryReporter) {
            yield telemetryReporter.dispose();
        }
    });
}
exports.deactivate = deactivate;
function logEvent(eventName, properties, measures) {
    if (telemetryReporter) {
        try {
            telemetryReporter.sendTelemetryEvent(eventName, properties, measures);
        }
        catch (e) {
            logger.message(e.message);
        }
        logger.message(`Sending telemetry: eventName = ${eventName}`, "Debug");
        if (properties) {
            logger.message(`properties: ${Object.getOwnPropertyNames(properties).map(k => `${k} = "${properties[k]}"`).concat()}`, "Debug");
        }
        if (measures) {
            logger.message(`measures: ${Object.getOwnPropertyNames(measures).map(k => `${k} = "${measures[k]}"`).concat()}`, "Debug");
        }
    }
}
exports.logEvent = logEvent;
// Allow-lists for various settings.
function filterSetting(value, key, defaultValue) {
    if (key === "makefile.dryrunSwitches") {
        let dryrunSwitches = value;
        let filteredSwitches = dryrunSwitches.map(sw => {
            switch (sw) {
                case "--dry-run":
                case "-n":
                case "--just-print":
                case "--recon":
                case "--keep-going":
                case "-k":
                case "--always-make":
                case "-B":
                case "--print-data-base":
                case "-p":
                case "--print-directory":
                case "-w":
                    return sw;
                default:
                    return "...";
            }
        });
        return filteredSwitches.join(";");
    }
    // Even if the key represents a setting that shouldn't share its value,
    // we can still record if it is undefined by the user (removed from settings.json)
    // or equal to the default we set in package.json.
    if (!value) {
        return "undefined";
    }
    else if (value === defaultValue) {
        return "default";
    }
    return "...";
}
// Detect which item from the given array setting is relevant for telemetry.
// Return the index in the array or -1 if we don't find a match.
// The telemetry is not yet collecting settings information from all items of an array.
// Until this will be needed, we pick the item in the array that corresponds
// to some current state value.
// Example: don't report telemetry for all launch configurations but only for
// the current launch configuration.
function activeArrayItem(setting, key) {
    if (key === "makefile.configurations") {
        let makefileConfigurations = configuration.getMakefileConfigurations();
        let currentMakefileConfigurationName = configuration.getCurrentMakefileConfiguration();
        if (!currentMakefileConfigurationName) {
            return -1;
        }
        let currentMakefileConfiguration = makefileConfigurations.find(config => {
            if (config.name === currentMakefileConfigurationName) {
                return config;
            }
        });
        return currentMakefileConfiguration ? makefileConfigurations.indexOf(currentMakefileConfiguration) : -1;
    }
    if (key === "makefile.launchConfigurations") {
        let launchConfigurations = configuration.getLaunchConfigurations();
        let currentLaunchConfiguration = launchConfigurations.find(config => {
            if (util.areEqual(config, configuration.getCurrentLaunchConfiguration())) {
                return config;
            }
        });
        return currentLaunchConfiguration ? launchConfigurations.indexOf(currentLaunchConfiguration) : -1;
    }
    return -1;
}
// Filter the array item indexes from the key since for now, when we analyze an array,
// we pick one item that corresponds to a current state of the project.
// Example: makefile.configurations.0.name ==> makefile.configurations.name
// The extension currently has a settings structure with only one level of objects arrays
// (makefile.configurations and makefile.launchConfigurations).
// Other arrays are of simple type (like make or executable arguments, dryrun switches)
// and don't create a key that would have 2 numerical properties
// (there is no makefile.configurations.1.makeArgs.2.something).
// So, eliminate only one numerical (if exists) before the last dot in this key string.
// We still need the complete key for anything else than the telemetry properties
// (example: validation errors are more clear when an array item is highlighted).
// This helper should be called when a property is ready to be collected for telemetry.
// Calling this earlier would result in different dot patterns.
function filterKey(key) {
    let filteredKey = key;
    let lastDot = key.lastIndexOf(".");
    let beforeLastDot = key.lastIndexOf(".", lastDot - 1);
    if (lastDot !== -1 && beforeLastDot !== -1) {
        let lastProp = key.substring(beforeLastDot + 1, lastDot);
        let numericalProp = Number.parseInt(lastProp);
        if (!Number.isNaN(numericalProp)) {
            filteredKey = filteredKey.replace(`${numericalProp}.`, "");
        }
    }
    return filteredKey;
}
// Analyze recursively all the settings for telemetry and type validation.
// Return all the telemetry properties that have been collected throughout this recursive process.
// If telemetryProperties is null, this function performs only type validation.
// If analyzeSettings gets called before a configure (or after an unsuccesful one), it is possible to have
// inaccurate or incomplete telemetry information for makefile and launch configurations.
// This is not very critical since any of their state changes will update telemetry for them.
function analyzeSettings(setting, key, propSchema, ignoreDefault, telemetryProperties) {
    // type can be undefined if setting is null,
    // which happens when the user removes that setting.
    let type = setting ? typeof (setting) : undefined;
    let jsonType = propSchema.type ? propSchema.type : undefined;
    // Skip anything else if the current setting represents a function.
    if (type === "function") {
        return telemetryProperties;
    }
    // Interested to continue only for properties that are different than their defaults,
    // unless ignoreDefault requests we report those too (useful when the user is changing
    // from a non default value back to default, usually via removing/undefining a setting).
    if (util.areEqual(propSchema.default, setting) && ignoreDefault) {
        return telemetryProperties;
    }
    // The type "array" defined in package.json is seen as object by the workspace setting type.
    // Not all package.json constructs have a type (example: configuration properties list)
    // but the workspace setting type sees them as object.
    if (jsonType !== type &&
        jsonType !== undefined && type !== undefined &&
        (type !== "object" || jsonType !== "array")) {
        logger.message(`Settings versus package.json type mismatch for "${key}".`);
    }
    // Enum values always safe to report.
    let enumValues = propSchema.enum;
    if (enumValues && enumValues.length > 0) {
        if (!enumValues.includes(setting)) {
            logger.message(`Invalid value "${setting}" for enum "${key}". Only "${enumValues.join(";")}" values are allowed."`);
            if (telemetryProperties) {
                telemetryProperties[filterKey(key)] = "invalid";
            }
        }
        else if (telemetryProperties) {
            telemetryProperties[filterKey(key)] = setting;
        }
        return telemetryProperties;
    }
    // When propSchema does not have a type defined (for example at the root scope)
    // use the setting type. We use the setting type second because it sees array as object.
    switch (jsonType || type) {
        // Report numbers and booleans since there is no private information in such types.
        case "boolean": /* falls through */
        case "number":
            if (telemetryProperties) {
                telemetryProperties[filterKey(key)] = setting;
            }
            break;
        // Apply allow-lists for strings.
        case "string":
            if (telemetryProperties) {
                telemetryProperties[filterKey(key)] = filterSetting(setting, key, propSchema.default);
            }
            break;
        case "array":
            // We are interested in logging arrays of basic types
            if (telemetryProperties && propSchema.items.type !== "object" && propSchema.items.type !== "array") {
                telemetryProperties[filterKey(key)] = filterSetting(setting, key, propSchema.default);
                break;
            }
        /* falls through */
        case "object":
            let settingsProps = Object.getOwnPropertyNames(setting);
            let index = -1;
            let active = 0;
            if (jsonType === "array") {
                active = activeArrayItem(setting, key);
            }
            settingsProps.forEach(prop => {
                index++;
                let jsonProps;
                if (jsonType === "array") {
                    jsonProps = propSchema.items.properties || propSchema.items;
                }
                else {
                    let newProp = (key === "makefile") ? `${key}.` + prop : prop;
                    if (propSchema.properties) {
                        jsonProps = Object.getOwnPropertyNames(propSchema.properties).includes(newProp) ?
                            propSchema.properties[newProp] : undefined;
                    }
                    else {
                        jsonProps = Object.getOwnPropertyNames(propSchema).includes(newProp) ?
                            propSchema[newProp] : undefined;
                    }
                }
                // The user defined a setting property wrong (example miMode instead of MIMode).
                // Exceptions are 'has', 'get', 'update' and 'inspect' for the makefile root.
                // They are functions and we can use this type to make the exclusion..
                if (jsonProps === undefined) {
                    if (typeof (setting[prop]) !== "function") {
                        logger.message(`Schema mismatch between settings and package.json for property "${key}.${prop}"`);
                    }
                }
                else {
                    // Skip if the analyzed prop is a function or if it's the length of an array.
                    if (type !== "function" /*&& jsonType !== undefined*/ &&
                        (jsonType !== "array" || prop !== "length")) {
                        let newTelemetryProperties = {};
                        newTelemetryProperties = analyzeSettings(setting[prop], key + "." + prop, jsonProps, ignoreDefault, ((jsonType !== "array" || index === active)) ? newTelemetryProperties : null);
                        // If telemetryProperties is null, it means we're not interested in reporting any telemetry for this subtree
                        if (telemetryProperties) {
                            telemetryProperties = util.mergeProperties(telemetryProperties, newTelemetryProperties);
                        }
                    }
                }
            });
            break;
        default:
            break;
    }
    return telemetryProperties;
}
exports.analyzeSettings = analyzeSettings;
function createReporter() {
    const packageInfo = getPackageInfo();
    if (packageInfo && packageInfo.aiKey) {
        return new vscode_extension_telemetry_1.default(packageInfo.name, packageInfo.version, packageInfo.aiKey);
    }
    return null;
}
function getPackageInfo() {
    const packageJSON = util.thisExtensionPackage();
    return {
        name: `${packageJSON.publisher}.${packageJSON.name}`,
        version: packageJSON.version,
        aiKey: "AIF-d9b70cd4-b9f9-4d70-929b-a071c400b217"
    };
}
//# sourceMappingURL=telemetry.js.map