"use strict";
// Tencent is pleased to support the open source community by making LuaPanda available.
// Copyright (C) 2019 THL A29 Limited, a Tencent company. All rights reserved.
// Licensed under the BSD 3-Clause License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
// https://opensource.org/licenses/BSD-3-Clause
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuaDebugSession = void 0;
const vscode = require("vscode");
const vscode_debugadapter_1 = require("vscode-debugadapter");
const path_1 = require("path");
const luaDebugRuntime_1 = require("./luaDebugRuntime");
const { Subject } = require('await-notify');
const Net = require("net");
const dataProcessor_1 = require("./dataProcessor");
const logManager_1 = require("../common/logManager");
const breakpoint_1 = require("./breakpoint");
const tools_1 = require("../common/tools");
const os = require("os");
// 获取luasocket库的路径
function GetLuasocketPath() {
    let retStr = "";
    let platform = os.platform();
    switch (platform) {
        case "win32":
            retStr = "/debugger/luasocket/win/x64/?.dll;";
            if (os.arch() === "x86") {
                retStr = "/debugger/luasocket/win/x86/?.dll;";
            }
            break;
        case "linux":
            retStr = "/debugger/luasocket/linux/?.so;";
            break;
        case "darwin":
            retStr = "/debugger/luasocket/mac/?.so;";
            break;
    }
    return retStr;
}
class LuaDebugSession extends vscode_debugadapter_1.LoggingDebugSession {
    constructor() {
        super("lua-debug.txt");
        this._configurationDone = new Subject();
        this._variableHandles = new vscode_debugadapter_1.Handles(50000); //Handle编号从50000开始
        this.UseLoadstring = false;
        //设置自身实例
        LuaDebugSession.instance = this;
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(true);
        //设置runtime实例
        this._runtime = new luaDebugRuntime_1.LuaDebugRuntime();
        dataProcessor_1.DataProcessor._runtime = this._runtime;
        this._runtime.TCPSplitChar = "|*|";
        //给状态绑定监听方法
        this._runtime.on('stopOnEntry', () => {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent('entry', LuaDebugSession.THREAD_ID));
        });
        this._runtime.on('stopOnStep', () => {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent('step', LuaDebugSession.THREAD_ID));
        });
        this._runtime.on('stopOnStepIn', () => {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent('step', LuaDebugSession.THREAD_ID));
        });
        this._runtime.on('stopOnStepOut', () => {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent('step', LuaDebugSession.THREAD_ID));
        });
        this._runtime.on('stopOnBreakpoint', () => {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent('breakpoint', LuaDebugSession.THREAD_ID));
        });
        this._runtime.on('stopOnException', () => {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent('exception', LuaDebugSession.THREAD_ID));
        });
        this._runtime.on('stopOnPause', () => {
            this.sendEvent(new vscode_debugadapter_1.StoppedEvent('exception', LuaDebugSession.THREAD_ID));
        });
        this._runtime.on('breakpointValidated', (bp) => {
            this.sendEvent(new vscode_debugadapter_1.BreakpointEvent('changed', { verified: bp.verified, id: bp.id }));
        });
        this._runtime.on('output', (text, filePath, line, column) => {
            const e = new vscode_debugadapter_1.OutputEvent(`${text}\n`);
            e.body.source = this.createSource(filePath);
            e.body.line = this.convertDebuggerLineToClient(line);
            e.body.column = this.convertDebuggerColumnToClient(column);
            this.sendEvent(e);
        });
    }
    static getInstance() {
        return LuaDebugSession.instance;
    }
    getRuntime() {
        return this._runtime;
    }
    /**
     * VScode前端的首个请求，询问debug adapter所能提供的特性
     * 这个方法是VSCode调过来的，adapter拿到其中的参数进行填充. 再回给VSCode,VSCode根据这些设置做不同的显示
     */
    initializeRequest(response, args) {
        logManager_1.DebugLogger.AdapterInfo("initializeRequest!");
        //设置Debug能力
        response.body = response.body || {};
        response.body.supportsConfigurationDoneRequest = true;
        //后面可以支持Hovers显示值
        response.body.supportsEvaluateForHovers = true; //悬停请求变量的值
        response.body.supportsStepBack = false; //back按钮
        response.body.supportsSetVariable = true; //修改变量的值
        response.body.supportsFunctionBreakpoints = false;
        response.body.supportsConditionalBreakpoints = true;
        response.body.supportsHitConditionalBreakpoints = false;
        response.body.supportsLogPoints = true;
        this.sendResponse(response);
    }
    /**
     * configurationDone后通知launchRequest
     */
    configurationDoneRequest(response, args) {
        super.configurationDoneRequest(response, args);
        this._configurationDone.notify();
    }
    /**
     * launchRequest的args会把在Launch.json中的配置读取出来, 在这里通过socket传给Debugger
     */
    launchRequest(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            vscode_debugadapter_1.logger.setup(args.trace ? vscode_debugadapter_1.Logger.LogLevel.Verbose : vscode_debugadapter_1.Logger.LogLevel.Stop, false);
            // 等待configurationDoneRequest的通知
            yield this._configurationDone.wait(1000);
            //1. 配置初始化信息
            let os = require("os");
            let path = require("path");
            tools_1.Tools.useAutoPathMode = !!args.autoPathMode;
            tools_1.Tools.pathCaseSensitivity = !!args.pathCaseSensitivity;
            // 临时加的
            //Tools.rebuildWorkspaceNamePathMap(args.cwd);
            if (tools_1.Tools.useAutoPathMode === true) {
                tools_1.Tools.rebuildAcceptExtMap(args.luaFileExtension);
                tools_1.Tools.rebuildWorkspaceNamePathMap(args.cwd);
                tools_1.Tools.checkSameNameFile();
            }
            // 去除out, Debugger/debugger_lib/plugins/Darwin/   libpdebug_版本号.so
            let sendArgs = new Array();
            sendArgs["stopOnEntry"] = !!args.stopOnEntry;
            sendArgs["luaFileExtension"] = args.luaFileExtension;
            sendArgs["cwd"] = args.cwd;
            sendArgs["isNeedB64EncodeStr"] = !!args.isNeedB64EncodeStr;
            sendArgs["TempFilePath"] = args.TempFilePath;
            sendArgs["logLevel"] = args.logLevel;
            sendArgs["debugMode"] = args.DebugMode;
            sendArgs["pathCaseSensitivity"] = args.pathCaseSensitivity;
            sendArgs["OSType"] = os.type();
            sendArgs["clibPath"] = tools_1.Tools.getClibPathInExtension();
            sendArgs["useCHook"] = args.useCHook;
            sendArgs["adapterVersion"] = String(tools_1.Tools.adapterVersion);
            sendArgs["autoPathMode"] = tools_1.Tools.useAutoPathMode;
            if (args.docPathReplace instanceof Array && args.docPathReplace.length === 2) {
                LuaDebugSession.replacePath = new Array(tools_1.Tools.genUnifiedPath(String(args.docPathReplace[0])), tools_1.Tools.genUnifiedPath(String(args.docPathReplace[1])));
            }
            else {
                LuaDebugSession.replacePath = null;
            }
            LuaDebugSession.autoReconnect = args.autoReconnect;
            //2. 初始化内存分析状态栏
            //StatusBarManager.reset();
            //3. 把response装入回调
            let callbackArgs = new Array();
            callbackArgs.push(this);
            callbackArgs.push(response);
            //4. 启动Adapter的socket   |   VSCode = Server ; Debugger = Client
            LuaDebugSession._server = Net.createServer(socket => {
                //--connect--
                logManager_1.DebugLogger.AdapterInfo("Debugger  " + socket.remoteAddress + ":" + socket.remotePort + "  connect!");
                dataProcessor_1.DataProcessor._socket = socket;
                //向debugger发送含配置项的初始化协议
                this._runtime.start((arr, info) => {
                    logManager_1.DebugLogger.AdapterInfo("已建立连接，发送初始化协议和断点信息!");
                    //对luapanda.lua的版本控制，低于一定版本要提示升级
                    if (typeof info.debuggerVer == "string") {
                        //转数字
                        let DVerArr = info.debuggerVer.split(".");
                        let AVerArr = String(tools_1.Tools.adapterVersion).split(".");
                        if (DVerArr.length === AVerArr.length && DVerArr.length === 3) {
                            //在adapter和debugger版本号长度相等的前提下，比较大版本，大版本 <2 或者 小版本 < 1 就提示. 2.1.0以下会提示
                            let intDVer = parseInt(DVerArr[0]) * 10000 + parseInt(DVerArr[1]) * 100 + parseInt(DVerArr[2]);
                            if (intDVer < 20100) {
                                logManager_1.DebugLogger.showTips("当前调试器的lua文件版本过低，可能无法正常使用，请升级到最新版本。帮助文档 https://github.com/Tencent/LuaPanda/blob/master/Docs/Manual/update.md ", 2);
                            }
                        }
                        else {
                            logManager_1.DebugLogger.showTips("调试器版本号异常:" + info.debuggerVer + ". 建议升级至最新版本。帮助文档 https://github.com/Tencent/LuaPanda/blob/master/Docs/Manual/update.md ", 1);
                        }
                    }
                    if (info.UseLoadstring === "1") {
                        this.UseLoadstring = true;
                    }
                    else {
                        this.UseLoadstring = false;
                    }
                    if (info.isNeedB64EncodeStr === "true") {
                        LuaDebugSession.isNeedB64EncodeStr = true;
                    }
                    else {
                        LuaDebugSession.isNeedB64EncodeStr = false;
                    }
                    if (info.UseHookLib === "1") { }
                    //已建立连接，并完成初始化
                    let ins = arr[0];
                    ins.sendResponse(arr[1]);
                    LuaDebugSession.userConnectionFlag = true;
                    LuaDebugSession.isListening = false;
                    //发送断点信息
                    for (let bkMap of LuaDebugSession.breakpointsArray) {
                        this._runtime.setBreakPoint(bkMap.bkPath, bkMap.bksArray, null, null);
                    }
                }, callbackArgs, sendArgs);
                //--connect end--
                socket.on('end', () => {
                    logManager_1.DebugLogger.AdapterInfo('socket end');
                });
                socket.on('close', () => {
                    if (LuaDebugSession.isListening == true) {
                        logManager_1.DebugLogger.AdapterInfo('close socket when listening!');
                        return;
                    }
                    logManager_1.DebugLogger.AdapterInfo('Socket close!');
                    vscode.window.showInformationMessage('Stop connecting!');
                    //停止连接
                    LuaDebugSession._server.close();
                    LuaDebugSession.userConnectionFlag = false;
                    delete dataProcessor_1.DataProcessor._socket;
                    //停止VSCode的调试模式
                    this.sendEvent(new vscode_debugadapter_1.TerminatedEvent(LuaDebugSession.autoReconnect));
                });
                socket.on('data', (data) => {
                    logManager_1.DebugLogger.AdapterInfo('[Get Msg]:' + data);
                    dataProcessor_1.DataProcessor.processMsg(data.toString());
                });
            }).listen(LuaDebugSession.TCPPort, function () {
                logManager_1.DebugLogger.AdapterInfo("listening...");
                logManager_1.DebugLogger.DebuggerInfo("listening...");
            });
            LuaDebugSession.isListening = true;
            LuaDebugSession.breakpointsArray = new Array();
            this.sendEvent(new vscode_debugadapter_1.InitializedEvent()); //收到返回后，执行setbreakpoint
            //单文件调试模式
            if (args.name === 'LuaHelper-DebugFile') {
                // 获取活跃窗口
                let retObject = tools_1.Tools.getVSCodeAvtiveFilePath();
                if (retObject["retCode"] !== 0) {
                    logManager_1.DebugLogger.DebuggerInfo(retObject["retMsg"]);
                    return;
                }
                let filePath = retObject["filePath"];
                if (LuaDebugSession._debugFileTermianl) {
                    LuaDebugSession._debugFileTermianl.dispose();
                }
                LuaDebugSession._debugFileTermianl = vscode.window.createTerminal({
                    name: "Debug Lua File (LuaHelper)",
                    env: {},
                });
                // 把路径加入package.path
                let pathCMD = "'";
                let pathArr = tools_1.Tools.VSCodeExtensionPath.split(path.sep);
                let stdPath = pathArr.join('/');
                pathCMD = pathCMD + stdPath + "/debugger/?.lua;";
                pathCMD = pathCMD + args.packagePath.join(';');
                pathCMD = pathCMD + "'";
                // 路径socket的路径加入到package.cpath中
                let cpathCMD = "'";
                cpathCMD = cpathCMD + stdPath + GetLuasocketPath();
                cpathCMD = cpathCMD + args.packagePath.join(';');
                cpathCMD = cpathCMD + "'";
                cpathCMD = " package.cpath = " + cpathCMD + ".. package.cpath; ";
                //拼接命令
                pathCMD = " \"package.path = " + pathCMD + ".. package.path; ";
                let reqCMD = "require('LuaPanda').start('127.0.0.1'," + LuaDebugSession.TCPPort + ");\" ";
                let doFileCMD = filePath;
                let runCMD = pathCMD + cpathCMD + reqCMD + doFileCMD;
                let LuaCMD;
                if (args.luaPath && args.luaPath !== '') {
                    LuaCMD = args.luaPath + " -e ";
                }
                else {
                    LuaCMD = "lua -e ";
                }
                LuaDebugSession._debugFileTermianl.sendText(LuaCMD + runCMD, true);
                LuaDebugSession._debugFileTermianl.show();
            }
            else {
                // 非单文件调试模式下，拉起program
                if (args.program != undefined && args.program.trim() != '') {
                    let fs = require('fs');
                    if (fs.existsSync(args.program) && fs.statSync(args.program).isFile()) {
                        //program 和 args 分开
                        if (LuaDebugSession._programTermianl) {
                            LuaDebugSession._programTermianl.dispose();
                        }
                        LuaDebugSession._programTermianl = vscode.window.createTerminal({
                            name: "Run Program File (LuaHelper)",
                            env: {},
                        });
                        let progaamCmdwithArgs = args.program;
                        for (const arg of args.args) {
                            progaamCmdwithArgs = progaamCmdwithArgs + " " + arg;
                        }
                        LuaDebugSession._programTermianl.sendText(progaamCmdwithArgs, true);
                        LuaDebugSession._programTermianl.show();
                    }
                    else {
                        vscode.window.showErrorMessage("launch.json 文件中 program 设置的路径错误： 文件 " + args.program + " 不存在，请修改后再试。", "好的");
                    }
                }
            }
        });
    }
    /**
     * VSCode -> Adapter 设置(删除)断点
     */
    setBreakPointsRequest(response, args) {
        logManager_1.DebugLogger.AdapterInfo('setBreakPointsRequest');
        let path = args.source.path;
        path = tools_1.Tools.genUnifiedPath(path);
        if (LuaDebugSession.replacePath && LuaDebugSession.replacePath.length === 2) {
            path = path.replace(LuaDebugSession.replacePath[1], LuaDebugSession.replacePath[0]);
        }
        let vscodeBreakpoints = new Array(); //VScode UI识别的断点（起始行号1）
        args.breakpoints.map(bp => {
            const id = this._runtime.getBreakPointId();
            let breakpoint; // 取出args中的断点并判断类型。
            if (bp.condition) {
                breakpoint = new breakpoint_1.ConditionBreakpoint(true, bp.line, bp.condition, id);
            }
            else if (bp.logMessage) {
                breakpoint = new breakpoint_1.LogPoint(true, bp.line, bp.logMessage, id);
            }
            else {
                breakpoint = new breakpoint_1.LineBreakpoint(true, bp.line, id);
            }
            vscodeBreakpoints.push(breakpoint);
        });
        response.body = {
            breakpoints: vscodeBreakpoints
        };
        // 更新记录数据中的断点
        if (LuaDebugSession.breakpointsArray == undefined) {
            LuaDebugSession.breakpointsArray = new Array();
        }
        let isbkPathExist = false; //断点路径已经存在于断点列表中
        for (let bkMap of LuaDebugSession.breakpointsArray) {
            if (bkMap.bkPath === path) {
                bkMap["bksArray"] = vscodeBreakpoints;
                isbkPathExist = true;
            }
        }
        if (!isbkPathExist) {
            let bk = new Object();
            bk["bkPath"] = path;
            bk["bksArray"] = vscodeBreakpoints;
            LuaDebugSession.breakpointsArray.push(bk);
        }
        if (dataProcessor_1.DataProcessor._socket && LuaDebugSession.userConnectionFlag) {
            //已建立连接
            let callbackArgs = new Array();
            callbackArgs.push(this);
            callbackArgs.push(response);
            this._runtime.setBreakPoint(path, vscodeBreakpoints, function (arr) {
                logManager_1.DebugLogger.AdapterInfo("确认断点");
                let ins = arr[0];
                ins.sendResponse(arr[1]); //在收到debugger的返回后，通知VSCode, VSCode界面的断点会变成已验证
            }, callbackArgs);
        }
        else {
            //未连接，直接返回
            this.sendResponse(response);
        }
    }
    /**
     * 断点的堆栈追踪
     */
    stackTraceRequest(response, args) {
        const startFrame = typeof args.startFrame === 'number' ? args.startFrame : 0;
        const maxLevels = typeof args.levels === 'number' ? args.levels : 1000;
        const endFrame = startFrame + maxLevels;
        const stk = this._runtime.stack(startFrame, endFrame);
        response.body = {
            stackFrames: stk.frames.map(f => {
                let source = f.file;
                if (LuaDebugSession.replacePath && LuaDebugSession.replacePath.length === 2) {
                    source = source.replace(LuaDebugSession.replacePath[0], LuaDebugSession.replacePath[1]);
                }
                return new vscode_debugadapter_1.StackFrame(f.index, f.name, this.createSource(source), f.line);
            }),
            totalFrames: stk.count
        };
        this.sendResponse(response);
    }
    /**
     * 监控的变量
     */
    evaluateRequest(response, args) {
        //watch -- 监视窗口
        if (args.context == "watch" || args.context == "hover") {
            let callbackArgs = new Array();
            callbackArgs.push(this);
            callbackArgs.push(response);
            //把B["A"] ['A'] => B.A形式
            if (this.UseLoadstring == false) {
                let watchString = args.expression;
                watchString = watchString.replace(/\[/g, ".");
                watchString = watchString.replace(/\"/g, "");
                watchString = watchString.replace(/\'/g, "");
                watchString = watchString.replace(/]/g, "");
                args.expression = watchString;
            }
            this._runtime.getWatchedVariable((arr, info) => {
                if (info.length === 0) {
                    //没有查到
                    arr[1].body = {
                        result: '未能查到变量的值',
                        type: 'string',
                        variablesReference: 0
                    };
                }
                else {
                    arr[1].body = {
                        result: info[0].value,
                        type: info[0].type,
                        variablesReference: parseInt(info[0].variablesReference)
                    };
                }
                let ins = arr[0]; //第一个参数是实例
                ins.sendResponse(arr[1]); //第二个参数是response
            }, callbackArgs, args.expression, args.frameId);
        }
        else if (args.context == "repl") {
            //repl -- 调试控制台
            let callbackArgs = new Array();
            callbackArgs.push(this);
            callbackArgs.push(response);
            this._runtime.getREPLExpression((arr, info) => {
                if (info.length === 0) {
                    //没有查到
                    arr[1].body = {
                        result: 'nil',
                        variablesReference: 0
                    };
                }
                else {
                    arr[1].body = {
                        result: info[0].value,
                        type: info[0].type,
                        variablesReference: parseInt(info[0].variablesReference)
                    };
                }
                let ins = arr[0];
                ins.sendResponse(arr[1]);
            }, callbackArgs, args.expression, args.frameId);
        }
        else {
            this.sendResponse(response);
        }
    }
    /**
     * 在变量大栏目中列举出的种类
     */
    scopesRequest(response, args) {
        const frameReference = args.frameId;
        const scopes = new Array();
        //local 10000,  global 20000, upvalue 30000
        scopes.push(new vscode_debugadapter_1.Scope("Local", this._variableHandles.create("10000_" + frameReference), false));
        scopes.push(new vscode_debugadapter_1.Scope("Global", this._variableHandles.create("20000_" + frameReference), true));
        scopes.push(new vscode_debugadapter_1.Scope("UpValue", this._variableHandles.create("30000_" + frameReference), false));
        response.body = {
            scopes: scopes
        };
        this.sendResponse(response);
    }
    /**
     * 设置变量的值
     */
    setVariableRequest(response, args) {
        let callbackArgs = new Array();
        callbackArgs.push(this);
        callbackArgs.push(response);
        let referenceString = this._variableHandles.get(args.variablesReference);
        let referenceArray = [];
        if (referenceString != null) {
            referenceArray = referenceString.split('_');
            if (referenceArray.length < 2) {
                logManager_1.DebugLogger.AdapterInfo("[variablesRequest Error] #referenceArray < 2 , #referenceArray = " + referenceArray.length);
                this.sendResponse(response);
                return;
            }
        }
        else {
            //_variableHandles 取不到的情况下 referenceString 即为真正的变量 ref
            referenceArray[0] = String(args.variablesReference);
        }
        this._runtime.setVariable((arr, info) => {
            if (info.success === "true") {
                arr[1].body = {
                    value: String(info.value),
                    type: String(info.type),
                    variablesReference: parseInt(info.variablesReference)
                };
                logManager_1.DebugLogger.showTips(info.tip);
            }
            else {
                logManager_1.DebugLogger.showTips("变量赋值失败 [" + info.tip + "]");
            }
            let ins = arr[0];
            ins.sendResponse(arr[1]);
        }, callbackArgs, args.name, args.value, parseInt(referenceArray[0]), parseInt(referenceArray[1]));
    }
    /**
     * 变量信息   断点的信息应该完全用一条协议单独发，因为点开Object，切换堆栈都需要单独请求断点信息
     */
    variablesRequest(response, args) {
        let callbackArgs = new Array();
        callbackArgs.push(this);
        callbackArgs.push(response);
        let referenceString = this._variableHandles.get(args.variablesReference);
        let referenceArray = [];
        if (referenceString != null) {
            referenceArray = referenceString.split('_');
            if (referenceArray.length < 2) {
                logManager_1.DebugLogger.AdapterInfo("[variablesRequest Error] #referenceArray < 2 , #referenceArray = " + referenceArray.length);
                this.sendResponse(response);
                return;
            }
        }
        else {
            //_variableHandles 取不到的情况下 referenceString 即为真正的变量ref
            referenceArray[0] = String(args.variablesReference);
        }
        this._runtime.getVariable((arr, info) => {
            if (info == undefined) {
                info = new Array();
            }
            const variables = new Array();
            info.forEach(element => {
                variables.push({
                    name: element.name,
                    type: element.type,
                    value: element.value,
                    variablesReference: parseInt(element.variablesReference)
                });
            });
            arr[1].body = {
                variables: variables
            };
            let ins = arr[0];
            ins.sendResponse(arr[1]);
        }, callbackArgs, parseInt(referenceArray[0]), parseInt(referenceArray[1]));
    }
    /**
     * continue 执行
     */
    continueRequest(response, args) {
        let callbackArgs = new Array();
        callbackArgs.push(this);
        callbackArgs.push(response);
        this._runtime.continue(arr => {
            logManager_1.DebugLogger.AdapterInfo("确认继续运行");
            let ins = arr[0];
            ins.sendResponse(arr[1]);
        }, callbackArgs);
    }
    /**
     * step 单步执行
     */
    nextRequest(response, args) {
        let callbackArgs = new Array();
        callbackArgs.push(this);
        callbackArgs.push(response);
        this._runtime.step(arr => {
            logManager_1.DebugLogger.AdapterInfo("确认单步");
            let ins = arr[0];
            ins.sendResponse(arr[1]);
        }, callbackArgs);
    }
    /**
     * step in
     */
    stepInRequest(response, args) {
        let callbackArgs = new Array();
        callbackArgs.push(this);
        callbackArgs.push(response);
        this._runtime.step(arr => {
            logManager_1.DebugLogger.AdapterInfo("确认StepIn");
            let ins = arr[0];
            ins.sendResponse(arr[1]);
        }, callbackArgs, 'stopOnStepIn');
    }
    /**
     * step out
     */
    stepOutRequest(response, args) {
        let callbackArgs = new Array();
        callbackArgs.push(this);
        callbackArgs.push(response);
        this._runtime.step(arr => {
            logManager_1.DebugLogger.AdapterInfo("确认StepOut");
            let ins = arr[0];
            ins.sendResponse(arr[1]);
        }, callbackArgs, 'stopOnStepOut');
    }
    /**
     * pause 暂不支持
     */
    pauseRequest(response, args) {
        vscode.window.showInformationMessage('pauseRequest!');
    }
    /**
     * disconnect
     */
    disconnectRequest(response, args) {
        logManager_1.DebugLogger.AdapterInfo("disconnectRequest");
        let restart = args.restart;
        //给lua发消息，让lua停止运行
        let callbackArgs = new Array();
        callbackArgs.push(restart);
        this._runtime.stopRun(arr => {
            //客户端主动断开连接，这里仅做确认
            logManager_1.DebugLogger.AdapterInfo("确认stop");
        }, callbackArgs, 'stopRun');
        LuaDebugSession.userConnectionFlag = false;
        this.sendResponse(response);
        LuaDebugSession._server.close();
    }
    restartRequest(response, args) {
        logManager_1.DebugLogger.AdapterInfo("restartRequest");
    }
    restartFrameRequest(response, args) {
        logManager_1.DebugLogger.AdapterInfo("restartFrameRequest");
    }
    createSource(filePath) {
        return new vscode_debugadapter_1.Source(path_1.basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, undefined);
    }
    threadsRequest(response) {
        response.body = {
            threads: [
                new vscode_debugadapter_1.Thread(LuaDebugSession.THREAD_ID, "thread 1")
            ]
        };
        this.sendResponse(response);
    }
    LuaGarbageCollect() {
        this._runtime.luaGarbageCollect();
    }
}
exports.LuaDebugSession = LuaDebugSession;
LuaDebugSession.isNeedB64EncodeStr = true;
LuaDebugSession.THREAD_ID = 1; //调试器不支持多线程，硬编码THREAD_ID为1
LuaDebugSession.TCPPort = 0; //和客户端连接的端口号，通过VScode的设置赋值
//# sourceMappingURL=luaDebug.js.map