"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
function activate(context) {
    //console.log("binaryView activate");
    let binaryView = vscode.commands.registerCommand('extension.binaryView', (uri) => {
        var _a;
        uri = uri || ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri);
        if (!uri)
            return;
        let extPath = context.extensionPath;
        let fd = fs.openSync(uri.fsPath, 'r');
        if (!fd) {
            vscode.window.showErrorMessage(`open file ${uri.fsPath} failed.`);
            return;
        }
        let stat = fs.fstatSync(fd);
        let size = stat.size;
        let panel = vscode.window.createWebviewPanel('Hexadecimal View', `${path.basename(uri.path)}`, vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(extPath, 'www'))]
        });
        panel.onDidDispose(() => {
            fs.closeSync(fd);
        });
        function getUri(res) {
            return panel.webview.asWebviewUri(vscode.Uri.file(`${extPath}/www/${res}`));
        }
        panel.webview.onDidReceiveMessage(e => {
            //console.log(e);
            var len = e.end - e.start;
            let buf = new Uint8Array(len);
            fs.readSync(fd, buf, 0, len, e.start);
            e.data = buf;
            e.len = buf.length;
            panel.webview.postMessage(e);
        });
        var html = `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="Content-Security-Policy" content="default-src ${panel.webview.cspSource} data: 'unsafe-inline';" />
	<link rel="stylesheet" href="${getUri('main.css')}">
	<script>var totalSize = ${size};</script>
	<script src="${getUri('jquery.js')}"></script>
</head>
<body>
	<div class="toolbar">
		<label style="width:100px;">offset</label>
		<input id="offset" type="text" style="width:120px" value=0 />
		<button id="abs_btn">absolute</button>
		<button id="rel_btn">relative</button>
	</div>
	<div class="frame">
		<div id="scroll"><span style="position:absolute;display:block;width:1px"></span></div>
		<div style="position:absolute;width=1160;overflow:hidden;">
			<table class="tbl" id='table' cellPadding=0 cellSpacing=0 width=1160>
				<tr style='height:32px;'>
					<td width=90>address</td>
					<td width=220>00 01 02 03 04 05 06 07</td>
					<td width=220>08 09 10 11 12 13 14 15</td>
					<td width=5></td>
					<td width=620>
						<select id="view">
							<option value="1">AscII</option>
							<option value="2">UTF8</option>
							<option value="3">UTF16</option>
							<option value="4">int8</option>
							<option value="5">int16</option>
							<option value="6">int32</option>
							<option value="7">int64</option>
							<option value="8">float32</option>
							<option value="9">float64</option>
							<!--<option value="10">GBK</option>-->
						</select>
						<input type="checkbox" id="unsigned"><label for="unsigned">unsigned</label>
						<input type="checkbox" id="bigendian"><label for="bigendian">bigendian</label>
					</td>
				</tr>
				<tr><td>1</td></tr>
			</table>
		</div>
	</div>
	<div id="inspector" style="display: none;">
		<div style="text-align:right; margin: 6px;">Number inspector</div>
		<div id="address"> address: </div>
		<div class="item"><div class="item-name">int8: </div><span id="int8"></span></div>
		<div class="item"><div class="item-name">int16: </div><span id="int16"></span></div>
		<div class="item"><div class="item-name">int32: </div><span id="int32"></span></div>
		<div class="item"><div class="item-name">int64: </div><span id="int64"></span></div>
		<div class="item"><div class="item-name">float32: </div><span id="float32"></span></div>
		<div class="item"><div class="item-name">float64: </div><span id="float64"></span></div>
		</div>
	</div>
	<script src="${getUri('viewer.js')}"></script>
</body>
</html>`;
        //console.log(html);
        panel.webview.html = html;
    });
    context.subscriptions.push(binaryView);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map