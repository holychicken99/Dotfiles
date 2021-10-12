"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestAnnotators = exports.onDidChangeConfiguration = void 0;
const vscode = require("vscode");
const notifications_1 = require("./notifications");
let D_Global_Var;
let D_Global_Func;
let D_Annotate_Type;
function createDecoration(key, config = undefined) {
    let color = vscode.workspace.getConfiguration("luahelper").get(key);
    config = config || {};
    if (typeof (color) === 'string') {
        config.light = { color: color };
        config.dark = { color: color };
    }
    return vscode.window.createTextEditorDecorationType(config);
}
function updateDecorations() {
    D_Global_Var = createDecoration("colors.Global Field Color");
    D_Global_Func = createDecoration("colors.Global Fun Color");
    D_Annotate_Type = createDecoration("colors.Type(annotation) Color");
}
function onDidChangeConfiguration(client) {
    updateDecorations();
}
exports.onDidChangeConfiguration = onDidChangeConfiguration;
let timeoutToReqAnn;
function requestAnnotators(editor, client) {
    let openFlagConfig = vscode.workspace.getConfiguration("luahelper.colors", null).get("Enable");
    var openFlag = false;
    if (openFlagConfig !== undefined) {
        openFlag = openFlagConfig;
    }
    // 若没有开启开关，退出
    if (!openFlag) {
        return;
    }
    clearTimeout(timeoutToReqAnn);
    timeoutToReqAnn = setTimeout(() => {
        requestAnnotatorsImpl(editor, client);
    }, 250);
}
exports.requestAnnotators = requestAnnotators;
function requestAnnotatorsImpl(editor, client) {
    if (!D_Global_Var) {
        updateDecorations();
    }
    let params = { uri: editor.document.uri.toString() };
    client.sendRequest("luahelper/getVarColor", params).then(list => {
        let map = new Map();
        map.set(notifications_1.AnnotatorType.GlobalVar, []);
        map.set(notifications_1.AnnotatorType.GlobalFunc, []);
        if (list !== undefined && list !== null) {
            list.forEach(data => {
                let uri = vscode.Uri.parse(data.uri);
                vscode.window.visibleTextEditors.forEach((editor) => {
                    let docUri = editor.document.uri;
                    if (uri.path.toLowerCase() === docUri.path.toLowerCase()) {
                        var list = map.get(data.annotatorType);
                        if (list === undefined) {
                            list = data.ranges;
                        }
                        else {
                            list = list.concat(data.ranges);
                        }
                        map.set(data.annotatorType, list);
                    }
                });
            });
        }
        map.forEach((v, k) => {
            updateAnnotators(editor, k, v);
        });
    });
}
function updateAnnotators(editor, type, ranges) {
    switch (type) {
        case notifications_1.AnnotatorType.GlobalVar:
            editor.setDecorations(D_Global_Var, ranges);
            break;
        case notifications_1.AnnotatorType.GlobalFunc:
            editor.setDecorations(D_Global_Func, ranges);
            break;
        case notifications_1.AnnotatorType.AnnotateType:
            editor.setDecorations(D_Annotate_Type, ranges);
            break;
    }
}
//# sourceMappingURL=annotator.js.map