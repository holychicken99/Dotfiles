'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
var si = require('systeminformation');
function activate(context) {
    var resourceMonitor = new ResMon();
    resourceMonitor.StartUpdating();
    context.subscriptions.push(resourceMonitor);
}
exports.activate = activate;
class Resource {
    constructor(config) {
        this._config = config;
    }
    getResourceDisplay() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.isShown()) ? this.getDisplay() : null;
        });
    }
    convertBytesToLargestUnit(bytes, precision = 2) {
        let unit = constants_1.Units.None;
        while (bytes / unit >= 1024 && unit < constants_1.Units.G) {
            unit *= 1024;
        }
        return `${(bytes / unit).toFixed(precision)} ${constants_1.Units[unit]}`;
    }
}
class CpuUsage extends Resource {
    constructor(config) {
        super(config);
    }
    isShown() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(this._config.get("show.cpuusage", true));
        });
    }
    getDisplay() {
        return __awaiter(this, void 0, void 0, function* () {
            let currentLoad = yield si.currentLoad();
            return `$(pulse) ${(100 - currentLoad.currentload_idle).toFixed(2)}%`;
        });
    }
}
class CpuTemp extends Resource {
    constructor(config) {
        super(config);
    }
    isShown() {
        return __awaiter(this, void 0, void 0, function* () {
            // If the CPU temp sensor cannot retrieve a valid temperature, disallow its reporting.
            var cpuTemp = (yield si.cpuTemperature()).main;
            let hasCpuTemp = cpuTemp !== -1;
            return Promise.resolve(hasCpuTemp && this._config.get("show.cputemp", true));
        });
    }
    getDisplay() {
        return __awaiter(this, void 0, void 0, function* () {
            let currentTemps = yield si.cpuTemperature();
            return `$(flame) ${(currentTemps.main).toFixed(2)} C`;
        });
    }
}
class CpuFreq extends Resource {
    constructor(config) {
        super(config);
    }
    isShown() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(this._config.get("show.cpufreq", false));
        });
    }
    getDisplay() {
        return __awaiter(this, void 0, void 0, function* () {
            let cpuCurrentSpeed = yield si.cpuCurrentspeed();
            // systeminformation returns frequency in terms of GHz by default
            let speedHz = parseFloat(cpuCurrentSpeed.avg) * constants_1.Units.G;
            let formattedWithUnits = this.getFormattedWithUnits(speedHz);
            return `$(dashboard) ${(formattedWithUnits)}`;
        });
    }
    getFormattedWithUnits(speedHz) {
        var unit = this._config.get('freq.unit', "GHz");
        var freqDivisor = constants_1.FreqMappings[unit];
        return `${(speedHz / freqDivisor).toFixed(2)} ${unit}`;
    }
}
class Battery extends Resource {
    constructor(config) {
        super(config);
    }
    isShown() {
        return __awaiter(this, void 0, void 0, function* () {
            let hasBattery = (yield si.battery()).hasbattery;
            return Promise.resolve(hasBattery && this._config.get("show.battery", false));
        });
    }
    getDisplay() {
        return __awaiter(this, void 0, void 0, function* () {
            let rawBattery = yield si.battery();
            var percentRemaining = Math.min(Math.max(rawBattery.percent, 0), 100);
            return `$(plug) ${percentRemaining}%`;
        });
    }
}
class Memory extends Resource {
    constructor(config) {
        super(config);
    }
    isShown() {
        return Promise.resolve(this._config.get("show.mem", true));
    }
    getDisplay() {
        return __awaiter(this, void 0, void 0, function* () {
            let unit = this._config.get('memunit', "GB");
            var memDivisor = constants_1.MemMappings[unit];
            let memoryData = yield si.mem();
            let memoryUsedWithUnits = memoryData.active / memDivisor;
            let memoryTotalWithUnits = memoryData.total / memDivisor;
            return `$(ellipsis) ${(memoryUsedWithUnits).toFixed(2)}/${(memoryTotalWithUnits).toFixed(2)} ${unit}`;
        });
    }
}
class DiskSpace extends Resource {
    constructor(config) {
        super(config);
    }
    isShown() {
        return Promise.resolve(this._config.get("show.disk", false));
    }
    getFormat() {
        let format = this._config.get("disk.format");
        if (format) {
            return constants_1.DiskSpaceFormatMappings[format];
        }
        else {
            return constants_1.DiskSpaceFormat.PercentRemaining;
        }
    }
    getDrives() {
        let drives = this._config.get("disk.drives");
        if (drives) {
            return drives;
        }
        else {
            return [];
        }
    }
    getFormattedDiskSpace(fsSize) {
        switch (this.getFormat()) {
            case constants_1.DiskSpaceFormat.PercentRemaining:
                return `${fsSize.fs} ${(100 - fsSize.use).toFixed(2)}% remaining`;
            case constants_1.DiskSpaceFormat.PercentUsed:
                return `${fsSize.fs} ${fsSize.use.toFixed(2)}% used`;
            case constants_1.DiskSpaceFormat.Remaining:
                return `${fsSize.fs} ${this.convertBytesToLargestUnit(fsSize.size - fsSize.used)} remaining`;
            case constants_1.DiskSpaceFormat.UsedOutOfTotal:
                return `${fsSize.fs} ${this.convertBytesToLargestUnit(fsSize.used)}/${this.convertBytesToLargestUnit(fsSize.size)} used`;
        }
    }
    getDisplay() {
        return __awaiter(this, void 0, void 0, function* () {
            let fsSizes = yield si.fsSize();
            let drives = this.getDrives();
            var formatted = "$(database) ";
            let formattedDrives = [];
            for (let fsSize of fsSizes) {
                // Drives were specified, check if this is an included drive
                if (drives.length === 0 || drives.indexOf(fsSize.fs) !== -1) {
                    formattedDrives.push(this.getFormattedDiskSpace(fsSize));
                }
            }
            return formatted + formattedDrives.join(", ");
        });
    }
}
class ResMon {
    constructor() {
        this._statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        this._statusBarItem.show();
        this._config = vscode_1.workspace.getConfiguration('resmon');
        this._delimiter = "    ";
        this._updating = false;
    }
    StartUpdating() {
        this._updating = true;
        this.update(this._statusBarItem);
    }
    StopUpdating() {
        this._updating = false;
    }
    update(statusBarItem) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._updating) {
                // Update the configuration in case it has changed
                this._config = vscode_1.workspace.getConfiguration('resmon');
                // Add all resources to monitor
                let resources = [];
                resources.push(new CpuUsage(this._config));
                resources.push(new CpuFreq(this._config));
                resources.push(new Battery(this._config));
                resources.push(new Memory(this._config));
                resources.push(new DiskSpace(this._config));
                resources.push(new CpuTemp(this._config));
                // Get the display of the requested resources
                let pendingUpdates = resources.map(resource => resource.getResourceDisplay());
                // Wait for the resources to update
                yield Promise.all(pendingUpdates).then(finishedUpdates => {
                    // Remove nulls, join with delimiter
                    statusBarItem.text = finishedUpdates.filter(update => update !== null).join(this._delimiter);
                });
                setTimeout(() => this.update(statusBarItem), this._config.get('updatefrequencyms', 2000));
            }
        });
    }
    dispose() {
        this.StopUpdating();
        this._statusBarItem.dispose();
    }
}
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map