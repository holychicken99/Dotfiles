"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocommentController = void 0;
const vscode_1 = require("vscode");
const Configuration_1 = require("../Entity/Config/Contributes/Configuration");
class DocommentController {
    /*-------------------------------------------------------------------------
     * Entry Constructor
     *-----------------------------------------------------------------------*/
    constructor(docommentDomain) {
        /* Load Configuration File (.vscode/settings.json) */
        const config = this.loadConfig();
        const subscriptions = [];
        /* Add Text Change Event */
        vscode_1.workspace.onDidChangeTextDocument(event => {
            const activeEditor = vscode_1.window.activeTextEditor;
            if (activeEditor && event.document === activeEditor.document) {
                this._onEvent(activeEditor, event.contentChanges[0], config, docommentDomain);
            }
        }, this, subscriptions);
        /* Add Config File Change Event */
        vscode_1.workspace.onDidChangeConfiguration(() => {
            this.loadConfig();
        }, this, subscriptions);
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    /*-------------------------------------------------------------------------
     * Public Method
     *-----------------------------------------------------------------------*/
    /* @implements */
    dispose() {
        this._disposable.dispose();
    }
    /*-------------------------------------------------------------------------
     * Private Method
     *-----------------------------------------------------------------------*/
    loadConfig() {
        const confDocomment = vscode_1.workspace.getConfiguration(Configuration_1.Configuration.KEY_DOCOMMENT);
        const confFiles = vscode_1.workspace.getConfiguration(Configuration_1.Configuration.KEY_FILES);
        const confEditor = vscode_1.workspace.getConfiguration(Configuration_1.Configuration.KEY_EDITOR);
        const config = new Configuration_1.Configuration();
        config.syntax = Configuration_1.CommentSyntax[confDocomment.get(Configuration_1.Configuration.SYNTAX, Configuration_1.CommentSyntax.single)];
        config.activateOnEnter = confDocomment.get(Configuration_1.Configuration.ACTIVATE_ON_ENTER, false);
        config.advanced = confDocomment.get(Configuration_1.Configuration.ADVANCED);
        config.eol = confFiles.get(Configuration_1.Configuration.EOL, '\n');
        config.insertSpaces = confEditor.get(Configuration_1.Configuration.INSERT_SPACES, false);
        config.detectIdentation = confEditor.get(Configuration_1.Configuration.DETECT_IDENTATION, true);
        return config;
    }
    /*-------------------------------------------------------------------------
     * Event
     *-----------------------------------------------------------------------*/
    _onEvent(activeEditor, event, config, domain) {
        // Insert XML document comment
        domain.Execute(activeEditor, event, this._languageId, config);
    }
}
exports.DocommentController = DocommentController;
//# sourceMappingURL=DocommentController.js.map