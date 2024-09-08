const SidebarProvider = require("./SidebarProvider");
const vscode = require("vscode");

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
        "tailwind-search", // Identifies the type of the webview
        heading, // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in
        {
          enableScripts: true, // Enable JavaScript in the webview
        }
      );

      panel.webview.html = getWebviewContent(url);
    }
  );

  context.subscriptions.push(disposableSearchQuery, disposable, webPage);
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
