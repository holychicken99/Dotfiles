"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resolveEnvironmentVariables(text, isWindows) {
    if (isWindows) {
        return text.replace(/%([^%]+)%/g, (unused, name) => {
            const resolved = process.env[name];
            return (resolved !== null && resolved !== void 0 ? resolved : name);
        });
    }
    return text.replace(/(\$[a-zA-Z_]+[a-zA-Z0-9_]*)/g, (unused, name) => {
        const resolved = process.env[name.substr(1)];
        return (resolved !== null && resolved !== void 0 ? resolved : name);
    });
}
exports.resolveEnvironmentVariables = resolveEnvironmentVariables;
//# sourceMappingURL=environment.js.map