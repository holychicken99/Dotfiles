"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnlinePeople = void 0;
const vscode_1 = require("vscode");
const vscode = require("vscode");
let statusBar;
class OnlinePeople {
    Start(client) {
        if (!statusBar) {
            statusBar = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right);
        }
        if (this.timeoutToReqAnn) {
            clearInterval(this.timeoutToReqAnn);
        }
        sendRequest(statusBar, client);
        // 每分钟触发一次
        this.timeoutToReqAnn = setInterval(function () {
            sendRequest(statusBar, client);
        }, 60000);
    }
    // 销毁对象和自由资源
    dispose() {
        statusBar.dispose();
        if (this.timeoutToReqAnn) {
            clearInterval(this.timeoutToReqAnn);
        }
    }
}
exports.OnlinePeople = OnlinePeople;
function sendRequest(statusBar, client) {
    let params = { Req: 0 };
    client.sendRequest("luahelper/getOnlineReq", params).then(onelineReturn => {
        let showConfig = vscode.workspace.getConfiguration("luahelper.show", null).get("online");
        var openFlag = false;
        if (showConfig !== undefined) {
            openFlag = showConfig;
        }
        if (openFlag === true) {
            if (onelineReturn.Num === 0) {
                statusBar.text = "LuaHelper";
                statusBar.tooltip = "LuaHelper";
                statusBar.show();
            }
            else {
                if (vscode.env.language === "zh-cn" || vscode.env.language === "zh-tw") {
                    statusBar.text = "LuaHelper 在线人数 : " + onelineReturn.Num;
                    statusBar.tooltip = "LuaHelper online People: " + onelineReturn.Num;
                }
                else {
                    statusBar.text = "LuaHelper : " + onelineReturn.Num;
                    statusBar.tooltip = "LuaHelper Online People: " + onelineReturn.Num;
                }
                statusBar.show();
            }
        }
        else {
            statusBar.text = "LuaHelper";
            statusBar.tooltip = "LuaHelper";
            statusBar.show();
        }
    });
}
//# sourceMappingURL=onlinePeople.js.map