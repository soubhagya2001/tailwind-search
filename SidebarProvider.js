const vscode = require("vscode");
const { getNonce } = require("./getNonce");

class SidebarProvider {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri,
        vscode.Uri.joinPath(this._extensionUri, "media"),
        vscode.Uri.joinPath(this._extensionUri, "tailwindVersions"),
        vscode.Uri.joinPath(this._extensionUri, "media", "icons"),
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "searchQuery":
          vscode.commands.executeCommand(
            "tailwind-search.handleSearchQuery",
            data.value.link
          );
          vscode.commands.executeCommand(
            "tailwind-search.openWebpage",
            data.value.heading
          );
          break;

        case "classCopied":
          vscode.commands.executeCommand(
            "tailwind-search.classCopied",
            data.value
          );
          break;

        case "onInfo":
          if (data.value) {
            vscode.window.showInformationMessage(data.value);
          }
          break;

        case "onError":
          if (data.value) {
            vscode.window.showErrorMessage(data.value);
          }
          break;
      }
    });
  }

  revive(panel) {
    this._view = panel;
  }

  _getHtmlForWebview(webview) {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "stylesheet",
        "style.css"
      )
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "javascript",
        "cssFinderScript.js"
      )
    );
    const jsonUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "tailwindVersions",
        "3.4.10",
        "data.json"
      )
    );
    const nonce = getNonce();

    // Detect VS Code theme and pass it to the webview
    const vsCodeTheme = vscode.workspace
      .getConfiguration("workbench")
      .get("colorTheme");
    const currentTheme = vsCodeTheme.toLowerCase().includes("dark")
      ? "dark"
      : "light";

    return `<!DOCTYPE html>
      <html lang="en" data-theme="${currentTheme}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
      </head>
      <body class="${currentTheme}-theme">
        <div>
          <select id="theme-selector">
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme</option>
            <option value="high-contrast">High Contrast Theme</option>
          </select>
        </div>
        <div class="header-container">
          <h1>Tailwind Search</h1>
          <input type="text" id="searchInput" placeholder="Search for classes or headings..." />
        </div>
        <ul id="resultList"></ul>
        <script nonce="${nonce}" src="${scriptUri}"></script>
        <script nonce="${nonce}">
          const jsonUri = "${jsonUri}";
          const currentTheme = "${currentTheme}";

          // Automatically select the current theme in the dropdown
          const themeSelector = document.getElementById("theme-selector");
          themeSelector.value = currentTheme;

          // Listen for theme changes
          themeSelector.addEventListener("change", (event) => {
            const selectedTheme = event.target.value;
            document.body.className = selectedTheme + '-theme';
            document.body.dataset.theme = selectedTheme;
          });
        </script>
      </body>
      </html>`;
  }
}

module.exports = SidebarProvider;
