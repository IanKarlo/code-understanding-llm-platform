import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  const provider = new CodeUnderstandingProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "codeUnderstandingView", // Deve ser igual ao ID no package.json
      provider
    )
  );

  let disposable = vscode.commands.registerCommand(
    "codeUnderstanding.getFileContent",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;
        const fullText = document.getText(); // Obtém todo o texto do arquivo aberto

        vscode.window.showInformationMessage(
          `Código do arquivo obtido com sucesso!`
        );

        // Enviar o texto para a Webview (se necessário)
        vscode.commands.executeCommand(
          "codeUnderstanding.sendToWebview",
          fullText
        );
      } else {
        vscode.window.showErrorMessage(
          "Nenhum arquivo está aberto no momento."
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

class CodeUnderstandingProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
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
          } else {
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
          } else {
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
            vscode.window.showWarningMessage(
              "Nenhum arquivo relevante encontrado no repositório."
            );
            return;
          }

          const repoContent = files
            .map((filePath) => {
              try {
                const content = fs.readFileSync(filePath, "utf8");
                const relativePath = path.relative(folderUri, filePath);
                const language = path.extname(filePath).slice(1); // Ex: "ts", "js"
                return `### ${relativePath}\n\n\`\`\`${language}\n${content}\n\`\`\``;
              } catch (err) {
                return `### ${filePath}\n\nErro ao ler o arquivo.`;
              }
            })
            .join("\n\n");

          if (!repoContent.trim()) {
            vscode.window.showWarningMessage(
              "Não foi possível ler o conteúdo dos arquivos do repositório."
            );
            return;
          }

          this._view?.webview.postMessage({
            command: "sendRepoContentToBackend",
            text: repoContent,
          });

          break;
      }
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const htmlPath = path.join(
      this.extensionUri.fsPath,
      "media",
      "layout/index.html"
    );
    let html = fs.readFileSync(htmlPath, "utf8");

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "media", "layout/script.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "media", "layout/styles.css")
    );

    html = html
      .replace("{{scriptUri}}", scriptUri.toString())
      .replace("{{styleUri}}", styleUri.toString());

    return html;
  }
}

const extensions = [".ts", ".js", ".json", ".py", ".java"];

function getAllFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesRecursively(filePath));
    } else {
      if (extensions.includes(path.extname(filePath))) {
        results.push(filePath);
      }
    }
  });

  return results;
}

// This method is called when your extension is deactivated
export function deactivate() {}
