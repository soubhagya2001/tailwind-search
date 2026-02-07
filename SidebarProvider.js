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

        case "insertClass":
          vscode.commands.executeCommand(
            "tailwind-search.insertClass",
            data.value
          );
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
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
      </head>
      <body>
        <div class="header-container">
          <div class="search-container">
            <input type="text" id="searchInput" placeholder="Search Tailwind classes..." autofocus />
            <button id="clearSearch" class="clear-btn" style="display: none;">&times;</button>
          </div>
          <details id="quickNavDetails" class="quick-nav-details" style="display: none;">
            <summary>Jump to section...</summary>
            <div id="quickNav" class="quick-nav"></div>
          </details>
        </div>
        <div class="recent-section" id="recentSection" style="display: none;">
          <div class="recent-header">
            <div class="recent-title">Recently Used</div>
            <button id="clearRecent" class="icon-btn" title="Clear All">
              <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/></svg>
            </button>
          </div>
          <div class="recent-items" id="recentItems"></div>
        </div>
        <ul id="resultList"></ul>
        <script nonce="${nonce}" src="${scriptUri}"></script>
        <script nonce="${nonce}">
          const jsonUri = "${jsonUri}";
        </script>
      </body>
      </html>`;
  }
}

module.exports = SidebarProvider;
