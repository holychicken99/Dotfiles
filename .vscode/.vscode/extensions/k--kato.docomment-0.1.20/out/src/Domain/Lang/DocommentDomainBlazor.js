"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocommentDomainBlazor = void 0;
const DocommentDomainCSharp_1 = require("./DocommentDomainCSharp");
const SyntacticAnalysisBlazor_1 = require("../../SyntacticAnalysis/SyntacticAnalysisBlazor");
class DocommentDomainBlazor extends DocommentDomainCSharp_1.DocommentDomainCSharp {
    /* @implements */
    IsInScope() {
        const lineNum = this._vsCodeApi.GetActivePosition().line;
        for (let i = lineNum - 1; i >= 0; i--) {
            const line = this._vsCodeApi.ReadLine(i);
            if (SyntacticAnalysisBlazor_1.SyntacticAnalysisBlazor.IsCodeScope(line)) {
                return true;
            }
        }
        return false;
    }
}
exports.DocommentDomainBlazor = DocommentDomainBlazor;
//# sourceMappingURL=DocommentDomainBlazor.js.map