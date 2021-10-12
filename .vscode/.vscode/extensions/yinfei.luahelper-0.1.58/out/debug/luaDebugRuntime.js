"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuaDebugRuntime = void 0;
const vscode = require("vscode");
const events_1 = require("events");
const dataProcessor_1 = require("./dataProcessor");
const logManager_1 = require("../common/logManager");
const tools_1 = require("../common/tools");
class LuaDebugRuntime extends events_1.EventEmitter {
    constructor() {
        super();
        // 生成断点id，id是累加的
        this._breakpointId = 1;
        //保存断点处堆栈信息
        this.breakStack = new Array();
    }
    get sourceFile() {
        return this._sourceFile;
    }
    get TCPSplitChar() {
        return this._TCPSplitChar;
    }
    set TCPSplitChar(char) {
        this._TCPSplitChar = char;
    }
    getBreakPointId() {
        return this._breakpointId++;
    }
    /**
     * 发送初始化请求
     * @param callback: 收到请求返回后的回调函数
     * @param callbackArgs：回调参数
     * @param sendArgs：发给debugger的参数
     */
    start(callback, callbackArgs, sendArgs) {
        let arrSend = new Object();
        for (let key in sendArgs) {
            arrSend[key] = String(sendArgs[key]);
        }
        dataProcessor_1.DataProcessor.commandToDebugger('initSuccess', arrSend, callback, callbackArgs);
    }
    /**
     * 通知Debugger继续执行
     * @param callback: 收到请求返回后的回调函数
     * @param callbackArgs：回调参数
     * @param event：事件名
     */
    continue(callback, callbackArgs, event = 'continue') {
        logManager_1.DebugLogger.AdapterInfo("continue");
        let arrSend = new Object();
        dataProcessor_1.DataProcessor.commandToDebugger(event, arrSend, callback, callbackArgs);
    }
    /**
     * 从 Debugger 获取监视变量的值
     * @param callback: 收到请求返回后的回调函数
     * @param callbackArgs：回调参数
     * @param varName：变量名
     * @param frameId：当前栈层（变量的值会随切换栈层而改变）
     * @param event：事件名
     */
    getWatchedVariable(callback, callbackArgs, varName, frameId = 2, event = 'getWatchedVariable') {
        logManager_1.DebugLogger.AdapterInfo("getWatchedVariable");
        let arrSend = new Object();
        arrSend["varName"] = String(varName);
        arrSend["stackId"] = String(frameId);
        dataProcessor_1.DataProcessor.commandToDebugger(event, arrSend, callback, callbackArgs);
    }
    /**
     * 通知 Debugger 执行代码段
     * @param callback: 收到请求返回后的回调函数
     * @param callbackArgs：回调参数
     * @param expression：被执行的代码段
     * @param frameId：当前栈层（变量的值会随切换栈层而改变）
     * @param event：事件名
     */
    getREPLExpression(callback, callbackArgs, expression, frameId = 2, event = 'runREPLExpression') {
        logManager_1.DebugLogger.AdapterInfo("runREPLExpression");
        let arrSend = new Object();
        arrSend["Expression"] = String(expression);
        arrSend["stackId"] = String(frameId);
        dataProcessor_1.DataProcessor.commandToDebugger(event, arrSend, callback, callbackArgs);
    }
    /**
     * 设置 某一变量的值
     * @param callback: 收到请求返回后的回调函数
     * @param callbackArgs：回调参数
     * @param name: 变量名
     * @param newValue: 用户设置的新值
     * @param variableRef：变量id。首次获取时id填0，之后展开table时，id填table id
     * @param frameId：当前栈层（变量的值会随切换栈层而改变）
     * @param event：事件名
     */
    setVariable(callback, callbackArgs, name, newValue, variableRef = 0, frameId = 2, event = 'setVariable') {
        logManager_1.DebugLogger.AdapterInfo("setVariable");
        let arrSend = new Object();
        arrSend["varRef"] = String(variableRef);
        arrSend["stackId"] = String(frameId);
        arrSend["newValue"] = String(newValue);
        arrSend["varName"] = String(name);
        dataProcessor_1.DataProcessor.commandToDebugger(event, arrSend, callback, callbackArgs);
    }
    /**
     * 从 Debugger 获取变量信息
     * @param callback: 收到请求返回后的回调函数
     * @param callbackArgs：回调参数
     * @param variableRef：变量id。首次获取时id填0，之后展开table时，id填table id
     * @param expression：被执行的代码段
     * @param frameId：当前栈层（变量的值会随切换栈层而改变）
     * @param event：事件名
     */
    getVariable(callback, callbackArgs, variableRef = 0, frameId = 2, event = 'getVariable') {
        logManager_1.DebugLogger.AdapterInfo("getVariable");
        let arrSend = new Object();
        arrSend["varRef"] = String(variableRef);
        arrSend["stackId"] = String(frameId);
        dataProcessor_1.DataProcessor.commandToDebugger(event, arrSend, callback, callbackArgs, 3);
    }
    /**
     * 通知Debugger停止运行
     */
    stopRun(callback, callbackArgs, event = 'stopRun') {
        let arrSend = new Object();
        dataProcessor_1.DataProcessor.commandToDebugger(event, arrSend, callback, callbackArgs);
    }
    /**
     * 	通知Debugger单步运行
     */
    step(callback, callbackArgs, event = 'stopOnStep') {
        logManager_1.DebugLogger.AdapterInfo("step:" + event);
        let arrSend = new Object();
        dataProcessor_1.DataProcessor.commandToDebugger(event, arrSend, callback, callbackArgs);
    }
    /**
     * 	强制回收内存
     */
    luaGarbageCollect(event = "LuaGarbageCollect") {
        let arrSend = new Object();
        dataProcessor_1.DataProcessor.commandToDebugger(event, arrSend);
    }
    /**
     * 通知 Debugger 设置断点
     * @param path：文件路径
     * @param bks：断点信息
     * @param callback：回调信息，用来确认断点
     * @param callbackArgs：回调参数
     */
    setBreakPoint(path, bks, callback, callbackArgs) {
        logManager_1.DebugLogger.AdapterInfo("setBreakPoint " + " path:" + path);
        let arrSend = new Object();
        arrSend["path"] = path;
        arrSend["bks"] = bks;
        dataProcessor_1.DataProcessor.commandToDebugger("setBreakPoint", arrSend, callback, callbackArgs);
    }
    /**
     * 向 luadebug.ts 返回保存的堆栈信息
     */
    stack(startFrame, endFrame) {
        return {
            frames: this.breakStack,
            count: this.breakStack.length //栈深度
        };
    }
    /**
     * 	在Debugger日志中输出
     */
    printLog(logStr) {
        logManager_1.DebugLogger.DebuggerInfo("[Debugger Log]:" + logStr);
    }
    /**
     * 	刷新显示lua虚拟机内存信息
     */
    refreshLuaMemoty(luaMemory) {
        //StatusBarManager.refreshLuaMemNum(parseInt(luaMemory));
    }
    /**
     * 	显示tip info
     */
    showTip(tip) {
        vscode.window.showInformationMessage(tip);
    }
    /**
     * 	显示tip error
     */
    showError(tip) {
        vscode.window.showErrorMessage(tip);
    }
    /**
     * 	命中断点
     */
    stop(stack, reason) {
        stack.forEach(element => {
            let linenum = element.line;
            element.line = parseInt(linenum); //转为VSCode行号(int)
            let getinfoPath = element.file;
            element.file = tools_1.Tools.checkFullPath(getinfoPath);
        });
        //先保存堆栈信息，再发暂停请求
        this.breakStack = stack;
        this.sendEvent(reason);
    }
    sendEvent(event, ...args) {
        setImmediate(_ => {
            this.emit(event, ...args);
        });
    }
}
exports.LuaDebugRuntime = LuaDebugRuntime;
//# sourceMappingURL=luaDebugRuntime.js.map