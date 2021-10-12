"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogPoint = exports.ConditionBreakpoint = exports.LineBreakpoint = void 0;
var BreakpointType;
(function (BreakpointType) {
    BreakpointType[BreakpointType["conditionBreakpoint"] = 0] = "conditionBreakpoint";
    BreakpointType[BreakpointType["logPoint"] = 1] = "logPoint";
    BreakpointType[BreakpointType["lineBreakpoint"] = 2] = "lineBreakpoint";
})(BreakpointType || (BreakpointType = {}));
class LineBreakpoint {
    constructor(verified, line, id, column) {
        this.verified = verified;
        this.type = BreakpointType.lineBreakpoint;
        this.line = line;
    }
}
exports.LineBreakpoint = LineBreakpoint;
class ConditionBreakpoint {
    constructor(verified, line, condition, id) {
        this.verified = verified;
        this.type = BreakpointType.conditionBreakpoint;
        this.line = line;
        this.condition = condition;
    }
}
exports.ConditionBreakpoint = ConditionBreakpoint;
class LogPoint {
    constructor(verified, line, logMessage, id) {
        this.verified = verified;
        this.type = BreakpointType.logPoint;
        this.line = line;
        this.logMessage = logMessage;
    }
}
exports.LogPoint = LogPoint;
//# sourceMappingURL=breakpoint.js.map