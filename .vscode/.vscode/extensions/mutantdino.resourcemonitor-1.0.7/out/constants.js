'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Units;
(function (Units) {
    Units[Units["None"] = 1] = "None";
    Units[Units["K"] = 1024] = "K";
    Units[Units["M"] = 1048576] = "M";
    Units[Units["G"] = 1073741824] = "G";
})(Units = exports.Units || (exports.Units = {}));
var DiskSpaceFormat;
(function (DiskSpaceFormat) {
    DiskSpaceFormat[DiskSpaceFormat["PercentUsed"] = 0] = "PercentUsed";
    DiskSpaceFormat[DiskSpaceFormat["PercentRemaining"] = 1] = "PercentRemaining";
    DiskSpaceFormat[DiskSpaceFormat["Remaining"] = 2] = "Remaining";
    DiskSpaceFormat[DiskSpaceFormat["UsedOutOfTotal"] = 3] = "UsedOutOfTotal";
})(DiskSpaceFormat = exports.DiskSpaceFormat || (exports.DiskSpaceFormat = {}));
exports.DiskSpaceFormatMappings = {
    "PercentUsed": DiskSpaceFormat.PercentUsed,
    "PercentRemaining": DiskSpaceFormat.PercentRemaining,
    "Remaining": DiskSpaceFormat.Remaining,
    "UsedOutOfTotal": DiskSpaceFormat.UsedOutOfTotal,
};
exports.FreqMappings = {
    "GHz": Units.G,
    "MHz": Units.M,
    "KHz": Units.K,
    "Hz": Units.None,
};
exports.MemMappings = {
    "GB": Units.G,
    "MB": Units.M,
    "KB": Units.K,
    "B": Units.None,
};
//# sourceMappingURL=constants.js.map