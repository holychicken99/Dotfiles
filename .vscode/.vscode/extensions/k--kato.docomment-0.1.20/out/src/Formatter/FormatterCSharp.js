"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatterCSharp = void 0;
const Configuration_1 = require("../Entity/Config/Contributes/Configuration");
const SyntacticAnalysisCSharp_1 = require("../SyntacticAnalysis/SyntacticAnalysisCSharp");
class FormatterCSharp {
    /*-------------------------------------------------------------------------
     * Public Method: Formatter
     *-----------------------------------------------------------------------*/
    static Format(docommentList, indent, syntax, activateOnEnter) {
        switch (syntax) {
            case Configuration_1.CommentSyntax.single:
                return FormatterCSharp.FormatAsSingle(docommentList, indent, syntax);
            case Configuration_1.CommentSyntax.delimited:
                return FormatterCSharp.FormatAsDelimited(docommentList, indent, syntax, activateOnEnter);
        }
    }
    /*-------------------------------------------------------------------------
     * Private Method: Formatter
     *-----------------------------------------------------------------------*/
    static FormatAsSingle(docommentList, indent, syntax) {
        let docomment = ' ' + docommentList[0] + '\n';
        for (let i = 1; i < docommentList.length; i++) {
            docomment += indent + SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.GetCommentSyntax(syntax) + ' ' + docommentList[i];
            if (i !== docommentList.length - 1) {
                docomment += '\n';
            }
        }
        return docomment;
    }
    static FormatAsDelimited(docommentList, indent, syntax, activateOnEnter) {
        let docomment = '\n';
        for (let i = 0; i < docommentList.length; i++) {
            docomment += indent + ' ' + SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.GetCommentSyntax(syntax) + ' ' + docommentList[i];
            if (i !== docommentList.length - 1) {
                docomment += '\n';
            }
        }
        docomment += '\n';
        docomment += indent;
        docomment += ' */';
        return docomment;
    }
}
exports.FormatterCSharp = FormatterCSharp;
//# sourceMappingURL=FormatterCSharp.js.map