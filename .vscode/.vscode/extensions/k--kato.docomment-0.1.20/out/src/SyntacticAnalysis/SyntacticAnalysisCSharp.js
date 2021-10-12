"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntacticAnalysisCSharp = void 0;
const IDocommentDomain_1 = require("../Domain/IDocommentDomain");
const Configuration_1 = require("../Entity/Config/Contributes/Configuration");
class SyntacticAnalysisCSharp {
    /*-------------------------------------------------------------------------
     * Public Method: Comment Type
     *-----------------------------------------------------------------------*/
    static IsEnterKey(eventText) {
        return (eventText.startsWith('\n') || eventText.startsWith("\r\n"));
    }
    static IsAfterDocomment(eventText) {
        return eventText.match(/^\n[ \t]+[\S]+/) !== null || eventText.match(/^\r\n[ \t]+[\S]+/) !== null;
    }
    static IsInsertLineAbove(activeLine) {
        return activeLine !== null && activeLine.trim().length === 0;
    }
    static IsActivationKey(activeChar, syntax) {
        switch (syntax) {
            case Configuration_1.CommentSyntax.single:
                return activeChar === '/';
            case Configuration_1.CommentSyntax.delimited:
                return activeChar === '*';
        }
    }
    /**
     * Tests whether a line contains ONLY a doc comment and nothing else except whitespace.
     * @param activeLine The line to test.
     */
    static IsDocCommentStrict(activeLine, syntax) {
        switch (syntax) {
            case Configuration_1.CommentSyntax.single:
                return activeLine.match(/^[ \t]*\/{3}[ \t]*$/) !== null; // FIXME:
            case Configuration_1.CommentSyntax.delimited:
                return activeLine.match(/^[ \t]*\/\*{2}[ \t]*$/) !== null; // FIXME:
        }
    }
    static IsDocComment(activeLine, syntax) {
        switch (syntax) {
            case Configuration_1.CommentSyntax.single:
                return activeLine.match(/\/{3}/) !== null;
            case Configuration_1.CommentSyntax.delimited:
                return ((activeLine.match(/^[ \t]*\*{1}[^\/]/) !== null) || this.IsDocCommentStrict(activeLine, syntax));
        }
    }
    static IsDocCommentOnActivationEnter(activeLine, syntax) {
        switch (syntax) {
            case Configuration_1.CommentSyntax.single:
                return activeLine.match(/^[ \t]*\/{3}$/) !== null;
            case Configuration_1.CommentSyntax.delimited:
                return activeLine.match(/^[ \t]*\/\*{2}[ \t]*$/) !== null
                    || SyntacticAnalysisCSharp.IsDocComment(activeLine, syntax);
        }
    }
    static IsDoubleDocComment(activeLine, syntax) {
        switch (syntax) {
            case Configuration_1.CommentSyntax.single:
                return activeLine.match(/^[ \t]*\/{3} $/) !== null;
            case Configuration_1.CommentSyntax.delimited:
                return activeLine.match(/^[ \t]*\*{1} $/) !== null;
        }
    }
    /*-------------------------------------------------------------------------
     * Public Method: Code
     *-----------------------------------------------------------------------*/
    static IsAttribute(code) {
        if (code === null)
            return false;
        return code.match(/^\[.+\]$/) !== null;
    }
    /*-------------------------------------------------------------------------
     * Public Method: Code Type
     *-----------------------------------------------------------------------*/
    static IsNamespace(code) {
        if (code === null)
            return false;
        return code.match(/\bnamespace\b/) !== null;
    }
    static IsClass(code) {
        if (code === null)
            return false;
        return code.match(/\bclass\b/) !== null;
    }
    static IsInterface(code) {
        if (code === null)
            return false;
        return code.match(/\binterface\b/) !== null;
    }
    static IsStruct(code) {
        if (code === null)
            return false;
        return code.match(/\bstruct\b/) !== null;
    }
    static IsEnum(code) {
        if (code === null)
            return false;
        return code.match(/\benum\b/) !== null;
    }
    static IsDelegate(code) {
        if (code === null)
            return false;
        return code.match(/\bdelegate\b/) !== null;
    }
    static IsEvent(code) {
        if (code === null)
            return false;
        return code.match(/\bevent\b/) !== null;
    }
    static IsProperty(code) {
        if (code === null)
            return false;
        return code.match(/[\w\S]+[^)]?(\b)?\s*{/) !== null;
    }
    static IsField(code) {
        if (code === null)
            return false;
        return code.match(/[^()]+;[ \t]*$/) !== null;
    }
    static IsMethod(code) {
        if (code === null)
            return false;
        return code.match(/[\w\S]\s+[\w\S]+\s*\(.*\)/) !== null;
    }
    static IsComment(code) {
        if (code === null)
            return false;
        return true;
    }
    static GetCommentSyntax(syntax) {
        switch (syntax) {
            case Configuration_1.CommentSyntax.single:
                return '///';
            case Configuration_1.CommentSyntax.delimited:
                return '*';
        }
    }
    static GetGenericList(code) {
        if (code === null)
            return null;
        const isAfterExtends = code.match(/:.+<([^<>]*)>/) !== null;
        if (isAfterExtends) {
            const isBeforeExtends = code.match(/<([^<>]*)>.+:/) !== null;
            if (!isBeforeExtends)
                return null;
        }
        const generics = code.match(/<([^<>]*)>/);
        const isUnMatched = (generics === null || generics.length !== 2);
        if (isUnMatched)
            return null;
        let genericNames = new Array();
        generics[1].split(',').forEach(param => {
            const name = param.match(/(\S+)\s*$/);
            if (name !== null && name.length === 2) {
                genericNames.push(name[1]);
            }
        });
        return genericNames;
    }
    static GetGenericMethodsList(code) {
        if (code === null)
            return null;
        const generics = code.match(/<([^<>]*)>\s*\(/);
        const isUnMatched = (generics === null || generics.length !== 2);
        if (isUnMatched)
            return null;
        let genericNames = new Array();
        generics[1].split(',').forEach(param => {
            const name = param.match(/(\S+)\s*$/);
            if (name !== null && name.length === 2) {
                genericNames.push(name[1]);
            }
        });
        return genericNames;
    }
    static GetMethodParamNameList(code) {
        if (code === null)
            return null;
        const removedAttrCode = code.replace(/^\s*\[.+?\]/, ''); // FIXME:
        const removedExtendsCode = removedAttrCode.replace(/:.+/, ''); // FIXME:
        const removedLamdaCode = removedExtendsCode.replace(/=>.*/, ''); // FIXME:
        const removedArrayCode = removedLamdaCode.replace(/\[.*?\]/g, ''); // FIXME:
        const params = removedArrayCode.match(/\((.+)\)/s);
        const isMatched = (params === null || params.length !== 2);
        if (isMatched)
            return null;
        let paramNames = new Array();
        params[1].split(',').forEach(param => {
            const hasOpen = param.match(/</) !== null;
            const hasClose = param.match(/>/) !== null;
            const isHighOrderParam = hasOpen && !hasClose;
            if (isHighOrderParam) {
                return;
            }
            const hasOptionalParam = param.match(/\S+\s+\S+\s*=/) !== null;
            const hasTypeInfo = param.match(/[\w\W]+\s+[\w\W]+/) !== null;
            let name = null;
            if (hasOptionalParam) {
                name = param.match(/\S+\s+(\S+)\s*=.*/);
            }
            else if (!hasTypeInfo) {
                name = null; // SKIP
            }
            else {
                name = param.match(/(\S+)\s*$/);
            }
            if (name !== null && name.length === 2) {
                const hasIdentifer = name[1].startsWith('@');
                const paramName = (hasIdentifer)
                    ? name[1].replace('@', '')
                    : name[1];
                paramNames.push(paramName);
            }
        });
        return paramNames;
    }
    static HasMethodReturn(code) {
        if (code === null) {
            return false;
        }
        {
            const returns = code.match(/([\w\S]+)\s+[\w\S]+\s*\(.*\)/);
            const isMatched = (returns !== null && returns.length === 2);
            if (isMatched) {
                const isReserved = (returns[1].match(this.RESERVED_WORDS) !== null);
                if (!isReserved) {
                    return true;
                }
            }
        }
        {
            const returns = code.match(/([\w\S]+)\s+[\w\S]+\s+[\w\S]+\s*\(.*\)/);
            const isMatched = (returns !== null && returns.length === 2);
            if (isMatched) {
                const isReserved = (returns[1].match(this.RESERVED_WORDS) !== null);
                if (!isReserved) {
                    return true;
                }
            }
        }
        return false;
    }
    static HasPropertyReturn(code) {
        if (code === null)
            return false;
        const returns = code.match(/([\w\S]+)\s+[\w\S]+\s*\{/);
        const isMatched = (returns === null || returns.length !== 2);
        if (isMatched)
            return false;
        return (returns[1].match(this.RESERVED_WORDS) === null) ? true : false;
    }
    /*-------------------------------------------------------------------------
     * Public Method: Cursor
     *-----------------------------------------------------------------------*/
    static GetLineOffset(syntax, codeType) {
        switch (syntax) {
            case Configuration_1.CommentSyntax.single:
                return 1;
            case Configuration_1.CommentSyntax.delimited:
                switch (codeType) {
                    case IDocommentDomain_1.CodeType.Comment:
                        return 1;
                    default:
                        return 2;
                }
        }
    }
}
exports.SyntacticAnalysisCSharp = SyntacticAnalysisCSharp;
/*-------------------------------------------------------------------------
 * Field
 *-----------------------------------------------------------------------*/
SyntacticAnalysisCSharp.RESERVED_WORDS = /(void|event|delegate|internal|public|protected|private|static|const|new|sealed|abstract|virtual|override|extern|unsafe|readonly|volatile|implicit|explicit|operator)/;
//# sourceMappingURL=SyntacticAnalysisCSharp.js.map