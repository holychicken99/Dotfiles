"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuaLanguageConfiguration = void 0;
const vscode_1 = require("vscode");
class LuaLanguageConfiguration {
    constructor() {
        this.onEnterRules = [
            {
                action: { indentAction: vscode_1.IndentAction.None, appendText: "---@" },
                beforeText: /( *---@class)|( *---@field)|( *---@param)|( *---@return)/,
            }
        ];
        this.wordPattern = /((?<=')[^']+(?='))|((?<=")[^"]+(?="))|(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g;
    }
}
exports.LuaLanguageConfiguration = LuaLanguageConfiguration;
//# sourceMappingURL=languageConfiguration.js.map