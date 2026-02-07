const SidebarProvider = require("./SidebarProvider");
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  let url = "";

  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "tailwind-search",
      sidebarProvider
    )
  );

  // Load Tailwind Data for IntelliSense
  let tailwindClasses = [];
  try {
    const dataPath = path.join(context.extensionUri.fsPath, "tailwindVersions", "3.4.10", "data.json");
    const jsonData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    jsonData.forEach(item => {
      item.data.forEach(c => {
        tailwindClasses.push({
          label: c.class,
          detail: c.property,
          documentation: item.heading
        });
      });
    });
  } catch (err) {
    console.error("Failed to load tailwind data for IntelliSense", err);
  }

  // Register Completion Provider
  const provider = vscode.languages.registerCompletionItemProvider(
    ["html", "javascript", "javascriptreact", "typescript", "typescriptreact", "vue", "svelte"],
    {
      provideCompletionItems(document, position) {
        // Basic check to see if we are likely inside a class attribute
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (!linePrefix.match(/class(?:Name)?\s*=\s*["'][^"']*$/)) {
          return undefined;
        }

        return tailwindClasses.map(tw => {
          const item = new vscode.CompletionItem(tw.label, vscode.CompletionItemKind.Value);
          item.detail = tw.detail;
          item.documentation = new vscode.MarkdownString(`**${tw.documentation}**\n\n\`${tw.detail}\``);
          return item;
        });
      }
    },
    " ", // Trigger on space
    '"', // Trigger on double quote
    "'"  // Trigger on single quote
  );

  context.subscriptions.push(provider);

  // Register command to handle search queries
  let disposableSearchQuery = vscode.commands.registerCommand(
    "tailwind-search.handleSearchQuery",
    async function (query) {
      url = query;
    }
  );

  let disposable = vscode.commands.registerCommand(
    "tailwind-search.classCopied",
    function (classCopied) {
      vscode.window.showInformationMessage(`class ${classCopied} copied successfully`);
    }
  );

  let webPage = vscode.commands.registerCommand(
    "tailwind-search.openWebpage",
    function (heading) {
      const panel = vscode.window.createWebviewPanel(
        "tailwind-search",
        heading,
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      panel.webview.html = getWebviewContent(url);
    }
  );

  let insertClass = vscode.commands.registerCommand(
    "tailwind-search.insertClass",
    function (className) {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.active, " " + className);
        });
      }
    }
  );

  // FIX: Close dropdown when user clicks back into the editor
  const onEditorChange = vscode.window.onDidChangeTextEditorSelection(() => {
    sidebarProvider._view?.webview.postMessage({ type: "closeDropdown" });
  });

  context.subscriptions.push(disposableSearchQuery, disposable, webPage, insertClass, onEditorChange);
}

function getWebviewContent(url) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tailwind</title>
    </head>
    <body>
      <iframe src="${url}" style="width: 100%; height: 100vh; border: 1px solid black;"></iframe>
    </body>
    </html>`;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
