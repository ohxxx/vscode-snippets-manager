import * as vscode from "vscode";

export interface IPackageJSONContributesSnippet {
  name?: string;
  path?: string;
}

export interface ISnippetExtra {
  name?: string;
  uri?: vscode.Uri;
  index?: number;
}

export interface ISnippet extends ISnippetExtra {
  body: string;
  description: string;
  prefix: string;
  scope: string;
}

export interface IVscodeSnippet {
  body: string[] | string;
  description: string;
  prefix: string;
  scope: string;
}

export interface ISnippets {
  [key: string]: ISnippet;
}

export interface ISnippetContainer {
  name: string;
  isFile?: boolean;
  uri?: vscode.Uri;
  children: ISnippetContainer[] | ISnippet[];
}
