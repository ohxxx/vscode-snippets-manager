import * as vscode from "vscode";
import refreshAllView from "../views/RefreshAllView";

export default async () => {
  await vscode.commands.executeCommand("workbench.action.openSnippets");
  refreshAllView();
  return;
};

export const workbenchActionOpenSnippetsId =
  "_snippetsmanager.workbenchActionOpenSnippets";
