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
    vscode.window.registerWebviewViewProvider("tailwind-search", sidebarProvider)
  );

  // Load Tailwind Data Asynchronously for IntelliSense
  let tailwindClasses = [];
  
  // Use a promise to load data so we don't block activation
  const loadTailwindData = async () => {
    try {
      const dataPath = path.join(context.extensionUri.fsPath, "tailwindVersions", "3.4.10", "data.json");
      const fileContent = await fs.promises.readFile(dataPath, "utf-8");
      const jsonData = JSON.parse(fileContent);
      
      const tempClasses = [];
      jsonData.forEach(item => {
        item.data.forEach(c => {
          tempClasses.push({
            label: c.class,
            detail: c.property,
            documentation: item.heading
          });
        });
      });
      tailwindClasses = tempClasses;
    } catch (err) {
      console.error("Failed to load tailwind data", err);
    }
  };

  loadTailwindData();

  // Register Completion Provider
  const provider = vscode.languages.registerCompletionItemProvider(
    { pattern: "**/*.{html,js,jsx,ts,tsx,vue,svelte}" },
    {
      provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        
        // Match if we are inside a class or className attribute
        const match = linePrefix.match(/class(?:Name)?\s*=\s*["']([^"']*)$/);
        if (!match) {
          return undefined;
        }

        const currentClasses = match[1];
        // Split by space or colon to get the actual class being typed (handling hover:, sm:, etc.)
        const parts = currentClasses.split(/[\s:]/);
        const currentWord = parts[parts.length - 1];

        // Filter classes based on what the user has already typed
        const filtered = tailwindClasses.filter(tw => 
          tw.label.toLowerCase().includes(currentWord.toLowerCase())
        ).slice(0, 500); // Limit to top 500 for responsiveness

        return filtered.map(tw => {
          // Using an object for the label allows showing supplementary info in the list itself
          const item = new vscode.CompletionItem({
            label: tw.label,
            detail: `  ${tw.detail}`, // Shows right after the class name
            // description: tw.documentation // Shows the category at the far right
          }, vscode.CompletionItemKind.Constant);
          
          // Documentation still exists for the "more info" panel (fly-out)
          item.documentation = new vscode.MarkdownString(`**Full CSS**:\n\`\`\`css\n${tw.detail}\n\`\`\``);
          
          item.sortText = `00_${tw.label}`;
          const startPos = position.translate(0, -currentWord.length);
          item.range = new vscode.Range(startPos, position);
          
          return item;
        });
      }
    },
    " ", '"', "'", "-", ".", ":" // Added more trigger characters
  );

  context.subscriptions.push(provider);

  // Commands
  let disposableSearchQuery = vscode.commands.registerCommand(
    "tailwind-search.handleSearchQuery",
    async (query) => { url = query; }
  );

  let disposable = vscode.commands.registerCommand(
    "tailwind-search.classCopied",
    (classCopied) => { vscode.window.showInformationMessage(`class ${classCopied} copied successfully`); }
  );

  let webPage = vscode.commands.registerCommand(
    "tailwind-search.openWebpage",
    (heading) => {
      const panel = vscode.window.createWebviewPanel("tailwind-search", heading, vscode.ViewColumn.One, { enableScripts: true });
      panel.webview.html = getWebviewContent(url);
    }
  );

  let insertClass = vscode.commands.registerCommand(
    "tailwind-search.insertClass",
    (className) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        // Only add space if not already at the start of a class attribute
        editor.edit(editBuilder => {
          const pos = editor.selection.active;
          const line = editor.document.lineAt(pos.line).text;
          const charBefore = pos.character > 0 ? line[pos.character - 1] : "";
          const prefix = (charBefore !== '"' && charBefore !== "'" && charBefore !== " ") ? " " : "";
          editBuilder.insert(pos, prefix + className);
        });
      }
    }
  );

  const onEditorChange = vscode.window.onDidChangeTextEditorSelection(() => {
    sidebarProvider._view?.webview.postMessage({ type: "closeDropdown" });
  });

  context.subscriptions.push(disposableSearchQuery, disposable, webPage, insertClass, onEditorChange);
}

function getWebviewContent(url) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Tailwind</title></head><body><iframe src="${url}" style="width: 100%; height: 100vh; border: none;"></iframe></body></html>`;
}

module.exports = { activate, deactivate: () => {} };
