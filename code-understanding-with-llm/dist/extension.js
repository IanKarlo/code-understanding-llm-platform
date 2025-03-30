/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const path = __importStar(__webpack_require__(2));
const fs = __importStar(__webpack_require__(3));
function activate(context) {
    const provider = new CodeUnderstandingProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("codeUnderstandingView", // Deve ser igual ao ID no package.json
    provider));
    let disposable = vscode.commands.registerCommand("codeUnderstanding.getFileContent", () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const fullText = document.getText(); // Obtém todo o texto do arquivo aberto
            vscode.window.showInformationMessage(`Código do arquivo obtido com sucesso!`);
            // Enviar o texto para a Webview (se necessário)
            vscode.commands.executeCommand("codeUnderstanding.sendToWebview", fullText);
        }
        else {
            vscode.window.showErrorMessage("Nenhum arquivo está aberto no momento.");
        }
    });
    context.subscriptions.push(disposable);
}
class CodeUnderstandingProvider {
    extensionUri;
    _view;
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri],
        };
        webviewView.webview.html = this.getHtml(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((message) => {
            const editor = vscode.window.activeTextEditor;
            switch (message.command) {
                case "getFileContent":
                    if (editor) {
                        const document = editor.document;
                        const fullText = document.getText();
                        const fileName = document.fileName.split(/[\\/]/).pop();
                        this._view?.webview.postMessage({
                            command: "sendFileContentToBackend",
                            text: fullText,
                            fileName,
                        });
                    }
                    else {
                        vscode.window.showErrorMessage("Nenhum arquivo está aberto.");
                    }
                    break;
                case "explainSelection":
                    if (editor) {
                        const document = editor.document;
                        const fileName = document.fileName.split(/[\\/]/).pop();
                        const selection = editor.selection;
                        const selectedText = document.getText(selection);
                        if (!selectedText.trim()) {
                            vscode.window.showWarningMessage("Nenhum texto selecionado.");
                            return;
                        }
                        this._view?.webview.postMessage({
                            command: "sendSelectedTextToBackend",
                            text: selectedText,
                            fileName,
                        });
                    }
                    else {
                        vscode.window.showErrorMessage("Nenhum arquivo está aberto.");
                    }
                    break;
                case "explainRepo":
                    const folders = vscode.workspace.workspaceFolders;
                    if (!folders || folders.length === 0) {
                        vscode.window.showErrorMessage("Nenhum repositório está aberto.");
                        return;
                    }
                    const folderUri = folders[0].uri.fsPath;
                    this._view?.webview.postMessage({
                        command: "repoLoading",
                    });
                    const files = getAllFilesRecursively(folderUri);
                    if (files.length === 0) {
                        vscode.window.showWarningMessage("Nenhum arquivo relevante encontrado no repositório.");
                        return;
                    }
                    const repoContent = files
                        .map((filePath) => {
                        try {
                            const content = fs.readFileSync(filePath, "utf8");
                            const relativePath = path.relative(folderUri, filePath);
                            const language = path.extname(filePath).slice(1); // Ex: "ts", "js"
                            return `### ${relativePath}\n\n\`\`\`${language}\n${content}\n\`\`\``;
                        }
                        catch (err) {
                            return `### ${filePath}\n\nErro ao ler o arquivo.`;
                        }
                    })
                        .join("\n\n");
                    if (!repoContent.trim()) {
                        vscode.window.showWarningMessage("Não foi possível ler o conteúdo dos arquivos do repositório.");
                        return;
                    }
                    this._view?.webview.postMessage({
                        command: "sendRepoContentToBackend",
                        text: repoContent,
                    });
                    break;
                case 'askRepo':
                    const folders2 = vscode.workspace.workspaceFolders;
                    if (!folders2 || folders2.length === 0) {
                        vscode.window.showErrorMessage("Nenhum repositório está aberto.");
                        return;
                    }
                    const folderUri2 = folders2[0].uri.fsPath;
                    this._view?.webview.postMessage({
                        command: "repoLoading",
                    });
                    const files2 = getAllFilesRecursively(folderUri2);
                    if (files2.length === 0) {
                        vscode.window.showWarningMessage("Nenhum arquivo relevante encontrado no repositório.");
                        return;
                    }
                    const repoContent2 = files2
                        .map((filePath) => {
                        try {
                            const content = fs.readFileSync(filePath, "utf8");
                            const relativePath = path.relative(folderUri2, filePath);
                            const language = path.extname(filePath).slice(1); // Ex: "ts", "js"
                            return `### ${relativePath}\n\n\`\`\`${language}\n${content}\n\`\`\``;
                        }
                        catch (err) {
                            return `### ${filePath}\n\nErro ao ler o arquivo.`;
                        }
                    })
                        .join("\n\n");
                    if (!repoContent2.trim()) {
                        vscode.window.showWarningMessage("Não foi possível ler o conteúdo dos arquivos do repositório.");
                        return;
                    }
                    this._view?.webview.postMessage({
                        command: "sendAskRepoToBackend",
                        text: repoContent2,
                    });
                    break;
            }
        });
    }
    getHtml(webview) {
        const htmlPath = path.join(this.extensionUri.fsPath, "media", "layout/index.html");
        let html = fs.readFileSync(htmlPath, "utf8");
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "media", "layout/script.js"));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "media", "layout/styles.css"));
        html = html
            .replace("{{scriptUri}}", scriptUri.toString())
            .replace("{{styleUri}}", styleUri.toString());
        return html;
    }
}
const extensions = [".ts", ".js", ".json", ".py", ".java", ".md"];
function getAllFilesRecursively(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFilesRecursively(filePath));
        }
        else {
            if (extensions.includes(path.extname(filePath))) {
                results.push(filePath);
            }
        }
    });
    return results;
}
// This method is called when your extension is deactivated
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("fs");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map