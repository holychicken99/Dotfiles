"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocommentDomain = void 0;
const VSCodeApi_1 = require("../Api/VSCodeApi");
const IDocommentDomain_1 = require("./IDocommentDomain");
const StringUtil_1 = require("../Utility/StringUtil");
class DocommentDomain {
    /*-------------------------------------------------------------------------
     * Entry Method
     *-----------------------------------------------------------------------*/
    /* @implements */
    Execute(activeEditor, event, languageId, config) {
        this._event = event;
        this._activeEditor = activeEditor;
        this._vsCodeApi = new VSCodeApi_1.VSCodeApi(activeEditor);
        this._config = config;
        // Detect Language
        if (!this._vsCodeApi.IsLanguage(languageId))
            return;
        // Initalize
        this.Init();
        // Can Fire Document Comment
        if (!this.IsTriggerDocomment())
            return;
        if (!this.IsInScope())
            return;
        // Get Code
        const code = this.GetCode();
        // Detect Code Type
        const codeType = this.GetCodeType(code);
        console.debug(codeType);
        if (codeType === null)
            return;
        // Gene Comment
        const docomment = this.GeneDocomment(code, codeType);
        console.debug(docomment);
        if (StringUtil_1.StringUtil.IsNullOrWhiteSpace(docomment))
            return;
        // Write Comment
        this.WriteDocomment(code, codeType, docomment);
        // Move Cursor to <Summary>
        this.MoveCursorTo(code, codeType, docomment);
    }
    /*-------------------------------------------------------------------------
     * Domain Method
     *-----------------------------------------------------------------------*/
    /* @implements */
    Init() {
        // NOP
    }
    /* @implements */
    IsTriggerDocomment() {
        return false;
    }
    /* @implements */
    IsInScope() {
        return false;
    }
    /* @implements */
    GetCode() {
        return null;
    }
    /* @implements */
    GetCodeType(code) {
        return IDocommentDomain_1.CodeType.None;
    }
    /* @implements */
    GeneDocomment(code, codeType) {
        return null;
    }
    /* @implements */
    WriteDocomment(code, codeType, docommnet) {
        // NOP
    }
    /* @implements */
    MoveCursorTo(code, codeType, docomment) {
        // NOP
    }
    /* @implements */
    dispose() {
        // NOP
    }
}
exports.DocommentDomain = DocommentDomain;
//# sourceMappingURL=DocommentDomain.js.map