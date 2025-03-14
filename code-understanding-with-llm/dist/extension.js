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
function activate(context) {
    const provider = new CodeUnderstandingProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("codeUnderstandingView", // Deve ser igual ao ID no package.json
    provider));
    let disposable = vscode.commands.registerCommand('codeUnderstanding.getFileContent', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const fullText = document.getText(); // Obtém todo o texto do arquivo aberto
            vscode.window.showInformationMessage(`Código do arquivo obtido com sucesso!`);
            // Enviar o texto para a Webview (se necessário)
            vscode.commands.executeCommand('codeUnderstanding.sendToWebview', fullText);
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
            localResourceRoots: [this.extensionUri]
        };
        webviewView.webview.html = this.getHtml();
        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === "getFileContent") {
                vscode.commands.executeCommand("codeUnderstanding.getFileContent");
            }
        });
    }
    getHtml() {
        return `
	<!DOCTYPE html>
	<html lang="pt-BR">
		<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Code Understanding</title>
		<style>
			* {
			font-family: Arial, sans-serif;
			margin: 0;
			padding: 0;
			box-sizing: border-box;
			}

			body {
			background-color: #1e1e1e;
			color: #ffffff;
			padding: 20px;
			text-align: center;
			}

			h1 {
			font-size: 20px;
			margin-bottom: 20px;
			}

			.button-container {
			display: flex;
			flex-direction: column;
			gap: 10px;
			margin-bottom: 20px;
			}

			.btn {
			background-color: #007acc;
			color: white;
			border: none;
			padding: 12px;
			font-size: 16px;
			border-radius: 5px;
			cursor: pointer;
			transition: background 0.3s ease;
			width: 100%;
			max-width: 300px;
			margin: 0 auto;
			}

			.btn:hover {
			background-color: #005a9e;
			}

			.input-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 10px;
			margin-top: 20px;
			}

			textarea {
			width: 100%;
			max-width: 300px;
			height: 80px;
			padding: 12px;
			font-size: 16px;
			border: 1px solid #444;
			border-radius: 5px;
			background-color: #2d2d2d;
			color: white;
			outline: none;
			resize: none; /* Impede redimensionamento */
			}

			textarea::placeholder {
			color: #888;
			}

			.send-btn {
			background-color: #28a745;
			color: white;
			border: none;
			padding: 10px;
			font-size: 14px;
			border-radius: 5px;
			cursor: pointer;
			transition: background 0.3s ease;
			width: 100%;
			max-width: 300px;
			}

			.send-btn:hover {
			background-color: #218838;
			}
		</style>
		</head>
		<body>

		<h1>Entendimento de Código</h1>

		<div class="button-container">
			<button class="btn" id="explainSelection">📌 Explicar Código Selecionado</button>
			<button class="btn" id="explainFile">📄 Explicar Arquivo</button>
			<button class="btn" id="explainRepo">📂 Explicar Repositório</button>
		</div>

		<div class="input-container">
			<textarea id="questionInput" placeholder="Pergunte para o modelo algo sobre a linguagem ou o código"></textarea>
			<button class="send-btn" id="sendQuestion">🚀 Enviar</button>
		</div>

		<script>
			document.getElementById("explainSelection").addEventListener("click", () => {
			vscode.postMessage({ command: "explainSelection" });
			});

			document.getElementById("explainFile").addEventListener("click", () => {
			vscode.postMessage({ command: "explainFile" });
			});

			document.getElementById("explainRepo").addEventListener("click", () => {
			vscode.postMessage({ command: "explainRepo" });
			});

			document.getElementById("sendQuestion").addEventListener("click", () => {
			sendQuestion();
			});

			document.getElementById("questionInput").addEventListener("keypress", (event) => {
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault(); // Impede pular linha
				sendQuestion();
			}
			});

			function sendQuestion() {
			const questionText = document.getElementById("questionInput").value.trim();
			if (questionText) {
				vscode.postMessage({ command: "askQuestion", text: questionText });
				document.getElementById("questionInput").value = ""; // Limpar campo após enviar a pergunta
			}
			}

			document.getElementById("explainFile").addEventListener("click", () => {
				vscode.postMessage({ command: "getFileContent" });
			});

			// API para comunicação com o VS Code
			const vscode = acquireVsCodeApi();
		</script>

		</body>
	</html>
    `;
    }
}
// This method is called when your extension is deactivated
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

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