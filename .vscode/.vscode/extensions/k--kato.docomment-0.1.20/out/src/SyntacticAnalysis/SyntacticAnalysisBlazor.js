"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntacticAnalysisBlazor = void 0;
class SyntacticAnalysisBlazor {
    /*-------------------------------------------------------------------------
     * Public Method: Comment Type
     *-----------------------------------------------------------------------*/
    static IsCodeScope(line) {
        return line.match(/@code[ \t\n]*\{/) !== null;
    }
}
exports.SyntacticAnalysisBlazor = SyntacticAnalysisBlazor;
//# sourceMappingURL=SyntacticAnalysisBlazor.js.map