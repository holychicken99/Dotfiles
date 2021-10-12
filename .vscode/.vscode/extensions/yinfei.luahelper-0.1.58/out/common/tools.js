"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tools = void 0;
const vscode = require("vscode");
const logManager_1 = require("./logManager");
const fs = require("fs");
const util_1 = require("util");
let path = require("path");
//let pathReader = require('path-reader');
class Tools {
    // 路径相关函数
    // 获取扩展中预置的lua文件位置
    static getLuaPathInExtension() {
        let luaPathInVSCodeExtension = this.VSCodeExtensionPath + "/debugger/LuaPanda.lua";
        return luaPathInVSCodeExtension;
    }
    // 获取扩展中预置的lua文件位置
    static getClibPathInExtension() {
        let ClibPathInVSCodeExtension = this.VSCodeExtensionPath + "/debugger/debugger_lib/plugins/";
        return ClibPathInVSCodeExtension;
    }
    // 读文本文件内容
    // @path 文件路径
    // @return 文件内容
    static readFileContent(path) {
        if (path === '' || path == undefined) {
            return '';
        }
        let data = fs.readFileSync(path);
        let dataStr = data.toString();
        return dataStr;
    }
    // 写文件内容
    // @path 文件路径
    // @return 文件内容
    static writeFileContent(path, content) {
        if (path === '' || path == undefined) {
            return;
        }
        fs.writeFileSync(path, content);
    }
    // 把传入的路径转为标准路径
    static genUnifiedPath(beProcessPath) {
        //全部使用 /
        beProcessPath = beProcessPath.replace(/\\/g, '/');
        while (beProcessPath.match(/\/\//)) {
            beProcessPath = beProcessPath.replace(/\/\//g, '/');
        }
        //win盘符转为小写
        beProcessPath = beProcessPath.replace(/^\w:/, function ($1) { return $1.toLocaleLowerCase(); });
        return beProcessPath;
    }
    // 获取当前VScode活跃窗口的文件路径
    static getVSCodeAvtiveFilePath() {
        let retObject = { retCode: 0, retMsg: "", filePath: "" };
        let activeWindow = vscode.window.activeTextEditor;
        if (activeWindow) {
            let activeFileUri = '';
            // 先判断当前活动窗口的 uri 是否有效
            let activeScheme = activeWindow.document.uri.scheme;
            if (activeScheme !== "file") {
                // 当前活动窗口不是file类型，遍历 visibleTextEditors，取出file类型的窗口
                let visableTextEditorArray = vscode.window.visibleTextEditors;
                for (const key in visableTextEditorArray) {
                    const editor = visableTextEditorArray[key];
                    let editScheme = editor.document.uri.scheme;
                    if (editScheme === "file") {
                        activeFileUri = editor.document.uri.fsPath;
                        break;
                    }
                }
            }
            else {
                // 使用 activeWindow
                activeFileUri = activeWindow.document.uri.fsPath;
            }
            if (activeFileUri === '') {
                retObject.retMsg = "[Error]: adapter start file debug, but file Uri is empty string";
                retObject.retCode = -1;
                return retObject;
            }
            let pathArray = activeFileUri.split(path.sep);
            let filePath = pathArray.join('/');
            filePath = '"' + filePath + '"'; //给路径加上""
            retObject.filePath = filePath;
            return retObject;
        }
        else {
            retObject.retMsg = "[Error]: can not get vscode activeWindow";
            retObject.retCode = -1;
            return retObject;
        }
    }
    // 构建可接受的后缀列表
    static rebuildAcceptExtMap(userSetExt) {
        this.extMap = new Object();
        this.extMap['lua'] = true;
        this.extMap['lua.txt'] = true;
        this.extMap['lua.bytes'] = true;
        if (typeof userSetExt == 'string' && userSetExt != '') {
            this.extMap[userSetExt] = true;
        }
    }
    // 获取目录下面的所有文件列表
    static getDirAllFiles(rootPath) {
        var fileList = [];
        function readDirRecur(folder) {
            const list = fs.readdirSync(folder);
            list.forEach(function (file) {
                var fullPath = folder + '/' + file;
                if (process.platform === "win32") {
                    fullPath = folder + '\\' + file;
                }
                var stats = fs.statSync(fullPath);
                if (stats.isDirectory()) {
                    if (file === "LuaHelper" || file === ".git" || file === ".svn") {
                    }
                    else {
                        return readDirRecur(fullPath);
                    }
                }
                else {
                    fileList.push(fullPath);
                }
            });
        }
        var filePath = path.resolve(rootPath);
        readDirRecur(filePath);
        return fileList;
    }
    // 建立/刷新 工程下文件名-路径Map
    static rebuildWorkspaceNamePathMap(rootPath) {
        let beginMS = this.getCurrentMS(); //启动时毫秒数
        let _fileNameToPathMap = new Array(); // 文件名-路径 cache
        //let workspaceFiles = pathReader.files(rootPath, { sync: true });   //同步读取工程中所有文件名
        let workspaceFiles = Tools.getDirAllFiles(rootPath);
        let workspaceFileCount = workspaceFiles.length;
        let processFilNum = 0; //记录最终处理了多少个文件
        for (let processingFileIdx = 0; processingFileIdx < workspaceFileCount; processingFileIdx++) {
            let strFile = workspaceFiles[processingFileIdx];
            // if (strFile.indexOf("LuaHelper") >= 0) {
            //     continue;
            // }
            let nameExtObject = this.getPathNameAndExt(strFile);
            if (!this.extMap[nameExtObject['ext']]) {
                // 文件类型不在可处理列表中
                continue;
            }
            processFilNum = processFilNum + 1;
            let fileNameKey = nameExtObject['name']; // key是文件名，不包含路径和文件后缀
            if (_fileNameToPathMap[fileNameKey]) {
                //存在同名文件
                if (util_1.isArray(_fileNameToPathMap[fileNameKey])) {
                    _fileNameToPathMap[fileNameKey].push(strFile);
                }
                else if (typeof _fileNameToPathMap[fileNameKey] === "string") {
                    //冲突, 对应的key已有值（存在同名文件), 使用数组保存数据
                    let tempSaveValue = _fileNameToPathMap[fileNameKey];
                    let tempArray = new Array();
                    tempArray.push(tempSaveValue);
                    tempArray.push(strFile);
                    _fileNameToPathMap[fileNameKey] = tempArray;
                }
            }
            else {
                _fileNameToPathMap[fileNameKey] = strFile;
            }
            // 显示进度
            let processingRate = Math.floor(processingFileIdx / workspaceFileCount * 100);
            let completePath = '';
            if (util_1.isArray(_fileNameToPathMap[fileNameKey])) {
                completePath = _fileNameToPathMap[fileNameKey][_fileNameToPathMap[fileNameKey].length - 1];
            }
            else if (typeof _fileNameToPathMap[fileNameKey] === "string") {
                completePath = _fileNameToPathMap[fileNameKey];
            }
            logManager_1.DebugLogger.AdapterInfo(processingRate + "%  |  " + fileNameKey + "   " + completePath);
        }
        let endMS = this.getCurrentMS(); //文件分析结束时毫秒数
        logManager_1.DebugLogger.AdapterInfo("文件Map刷新完毕，使用了" + (endMS - beginMS) + "毫秒。检索了" + workspaceFileCount + "个文件， 其中" + processFilNum + "个lua类型文件");
        if (processFilNum <= 0) {
            logManager_1.DebugLogger.showTips("没有在工程中检索到lua文件。请检查launch.json文件中lua后缀是否配置正确, 以及VSCode打开的工程是否正确", 2);
            let noLuaFileTip = "[!] 没有在VSCode打开的工程中检索到lua文件，请进行如下检查\n 1. VSCode打开的文件夹是否正确 \n 2. launch.json 文件中 luaFileExtension 选项配置是否正确";
            logManager_1.DebugLogger.DebuggerInfo(noLuaFileTip);
            logManager_1.DebugLogger.AdapterInfo(noLuaFileTip);
        }
        this.fileNameToPathMap = _fileNameToPathMap;
    }
    // 获取当前毫秒数
    static getCurrentMS() {
        let currentMS = new Date(); //获取当前时间
        return currentMS.getTime();
    }
    // 检查同名文件, 如果存在，通过日志输出
    static checkSameNameFile() {
        let sameNameFileStr;
        for (const nameKey in this.fileNameToPathMap) {
            let completePath = this.fileNameToPathMap[nameKey];
            if (util_1.isArray(completePath)) {
                //初始化语句
                if (sameNameFileStr === undefined) {
                    sameNameFileStr = "\n请注意VSCode打开工程中存在以下同名lua文件: \n";
                }
                sameNameFileStr = sameNameFileStr + " + " + completePath.join("\n + ") + "\n\n";
            }
        }
        if (sameNameFileStr) {
            logManager_1.DebugLogger.showTips("\nVSCode打开工程中存在同名lua文件, 可能会影响调试器执行, 详细信息请查看VSCode控制台 OUTPUT - Debugger/log 日志", 1);
            sameNameFileStr = sameNameFileStr + "调试器在自动路径模式下，可能无法识别同名lua文件中的断点，导致打开错误的文件。请修改VSCode打开的文件夹，确保其中没有同名文件。或者关闭launch.json中的autoPathMode, 改为手动配置路径。\n详细参考: https://github.com/Tencent/LuaPanda/blob/master/Docs/Manual/access-guidelines.md#第二步-路径规范 \n";
            logManager_1.DebugLogger.DebuggerInfo(sameNameFileStr);
            logManager_1.DebugLogger.AdapterInfo(sameNameFileStr);
        }
    }
    // 从URI分析出文件名和后缀
    static getPathNameAndExt(UriOrPath) {
        let name_and_ext = path.basename(UriOrPath).split('.');
        let name = name_and_ext[0]; //文件名
        let ext = name_and_ext[1] || ''; //文件后缀
        for (let index = 2; index < name_and_ext.length; index++) {
            ext = ext + '.' + name_and_ext[index];
        }
        return { name, ext };
    }
    // 传入局部路径，返回完整路径
    static checkFullPath(shortPath) {
        if (this.useAutoPathMode === false) {
            return shortPath;
        }
        //如果首字符是@，去除@
        if ('@' === shortPath.substr(0, 1)) {
            shortPath = shortPath.substr(1);
        }
        let nameExtObject = this.getPathNameAndExt(shortPath);
        let fileName = nameExtObject['name'];
        let fullPath;
        if (this.pathCaseSensitivity) {
            fullPath = this.fileNameToPathMap[fileName];
        }
        else {
            for (const keyPath in this.fileNameToPathMap) {
                if (keyPath.toLowerCase() === fileName) {
                    fullPath = this.fileNameToPathMap[keyPath];
                    break;
                }
            }
        }
        if (fullPath) {
            if (util_1.isArray(fullPath)) {
                // 存在同名文件
                for (const key in fullPath) {
                    const element = fullPath[key];
                    if (element.indexOf(shortPath)) {
                        return element; // 这里固定返回第一个元素
                    }
                }
            }
            else if (typeof fullPath === "string") {
                return fullPath;
            }
        }
        //最终没有找到，返回输入的地址
        logManager_1.DebugLogger.showTips("调试器没有找到文件 " + shortPath + " 。 请检查launch.json文件中lua后缀是否配置正确, 以及VSCode打开的工程是否正确", 2);
        return shortPath;
    }
    static removeDir(dir) {
        let files;
        try {
            files = fs.readdirSync(dir);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }
            else {
                throw err;
            }
        }
        for (var i = 0; i < files.length; i++) {
            let newPath = path.join(dir, files[i]);
            let stat = fs.statSync(newPath);
            if (stat.isDirectory()) {
                //如果是文件夹就递归
                this.removeDir(newPath);
            }
            else {
                //删除文件
                fs.unlinkSync(newPath);
            }
        }
        fs.rmdirSync(dir);
        return true;
    }
}
exports.Tools = Tools;
Tools.extMap = new Object(); // 可处理的文件后缀列表
Tools.useAutoPathMode = false;
Tools.pathCaseSensitivity = false;
//# sourceMappingURL=tools.js.map