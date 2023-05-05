import * as vscode from "vscode";
// nlsConfig must before other imports
import "./nlsConfig";

// Add a newline, wait for [Automatically create sort groups based on newlines in organize imports](https://github.com/microsoft/TypeScript/pull/48330)

import { CodeSnippetsEditor } from "./CodeSnippetsEditor";
import createSnippet from "./commands/createSnippet";
import createSnippetTo from "./commands/createSnippetTo";
import deleteSnippet from "./commands/deleteSnippet";
import deleteSnippetFile from "./commands/deleteSnippetFile";
import duplicateSnippet from "./commands/duplicateSnippet";
import editSnippet from "./commands/editSnippet";
import { initEditSnippetBody } from "./commands/editSnippetBody";
import searchSnippet from "./commands/searchSnippet";
import showEditor from "./commands/showEditor";
import showSnippet from "./commands/showSnippet";
import showSource from "./commands/showSource";
import workbenchActionOpenSnippets, {
  workbenchActionOpenSnippetsId,
} from "./commands/workbenchActionOpenSnippets";
import { setContext, SnippetType } from "./share";
import ExtensionSnippetsExplorerView from "./views/ExtensionSnippetsExplorerView";
import refreshAllView from "./views/RefreshAllView";
import UserSnippetsExplorerView from "./views/UserSnippetsExplorerView";
import WorkspaceSnippetsExplorerView from "./views/WorkspaceSnippetsExplorerView";

export const log = vscode.window.createOutputChannel("Snippets Manager");

export function activate(context: vscode.ExtensionContext) {
  setContext(context);

  initEditSnippetBody();

  new WorkspaceSnippetsExplorerView(context);

  new UserSnippetsExplorerView(context);

  new ExtensionSnippetsExplorerView(context);

  context.subscriptions.push(
    vscode.commands.registerCommand("snippets-manager-sleek.search", (type) => {
      return searchSnippet(type);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "snippets-manager-sleek.searchWorkspaceSnippets",
      async () => {
        await vscode.commands.executeCommand(
          "snippets-manager-sleek.search",
          SnippetType.WORKSPACE
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "snippets-manager-sleek.searchUserSnippets",
      async () => {
        await vscode.commands.executeCommand(
          "snippets-manager-sleek.search",
          SnippetType.USER
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "snippets-manager-sleek.searchExtensionSnippets",
      async () => {
        await vscode.commands.executeCommand(
          "snippets-manager-sleek.search",
          SnippetType.EXTENSION
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "snippets-manager-sleek.createSnippet",
      async (prefix?: string) => {
        return createSnippet(prefix);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "snippets-manager-sleek.createSnippetTo",
      async (prefix?: string, uri?: vscode.Uri) => {
        return createSnippetTo(prefix, uri);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      workbenchActionOpenSnippetsId,
      workbenchActionOpenSnippets
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "_snippets-manager-sleek.deleteSnippetFile",
      (snippet) => {
        deleteSnippetFile(snippet);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "_snippets-manager-sleek.duplicateSnippet",
      (snippet) => {
        duplicateSnippet(snippet);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "_snippets-manager-sleek.deleteSnippet",
      (snippet) => {
        deleteSnippet(snippet);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "_snippets-manager-sleek.editSnippet",
      (snippet) => {
        editSnippet(snippet);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "_snippets-manager-sleek.showSnippet",
      (snippet) => {
        showSnippet(snippet);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("snippets-manager-sleek.refresh", () => {
      refreshAllView();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("snippets-manager-sleek.showSource", async () => {
      return showSource();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("snippets-manager-sleek.showEditor", async () => {
      return showEditor();
    })
  );

  context.subscriptions.push(CodeSnippetsEditor.register(context));

}

export function deactivate() {}
