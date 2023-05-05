import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { getState } from "./common";
import SnippetItem from "./components/SnippetItem";
import Toolbar from "./components/Toolbar";
import getVsCode from "./getVsCode";
import { EDIT, NAME, NEW_ITEM } from "./symbols";
import { ISnippet } from "./typings";
import throttle from "lodash/throttle";

import "./CodeSnippetsEditor.scss";

const vscode = getVsCode();

function getSnippets(): ISnippet[] {
  const state = getState();

  let result: ISnippet[] = [...state.addingSnippets];

  for (const [name, vscodeSnippet] of state.vscodeSnippetEntries) {
    const editingSnippet = state.editingSnippetObjMap[name];
    if (editingSnippet) {
      result.push(editingSnippet);
      continue;
    }

    let body = vscodeSnippet.body;

    if (Array.isArray(body)) {
      body = body.join("\n");
    }

    result.push({
      ...vscodeSnippet,
      name,
      body,
      [NAME]: name,
    });
  }

  return result;
}

const CodeSnippetsEditor = () => {
  const [error, setError] = useState<string>("");

  const commonRef = useRef<{
    addEdit(keyName: string): void;
    removeEdit(keyName: string): void;
    removeAdd(keyName: string): void;
    setError(error: string): void;
    updateSnippets(): void;
  }>({
    removeEdit(keyName: string) {
      const state = getState();
      delete state.editingSnippetObjMap[keyName];
      vscode.setState(state);
      commonRef.current.updateSnippets();
    },
    removeAdd(keyName: string) {
      const state = getState();
      state.addingSnippets = state.addingSnippets.filter(
        (d) => d[NAME] !== keyName
      );
      vscode.setState(state);
      commonRef.current.updateSnippets();
    },
    setError,
    addEdit() { },
    updateSnippets() { },
  });

  const [snippets, setSnippets] = useState<ISnippet[]>([]);

  commonRef.current.updateSnippets = () => {
    setSnippets(getSnippets());
  };

  commonRef.current.addEdit = (keyName: string) => {
    const snippet = snippets.find((d) => d[NAME] === keyName);

    if (!snippet) {
      return;
    }

    const state = getState();
    state.editingSnippetObjMap[keyName] = { ...snippet, [EDIT]: true };
    vscode.setState(state);
    commonRef.current.updateSnippets();
  };

  useEffect(() => {
    const state = getState();
    setTimeout(() => {
      window.scrollTo(0, state.scrollY);
    }, 0);

    const listener = throttle(() => {
      const state = getState();
      vscode.setState({
        ...state,
        scrollY: window.scrollY,
      });
    }, 300);

    window.addEventListener("scroll", listener);

    return () => {
      window.removeEventListener("scroll", listener);
    };
  }, []);

  useEffect(() => {
    const listener = (event: any) => {
      const message = event.data;
      switch (message.type) {
        case "update":
          const vscodeSnippetEntries = message.vscodeSnippetEntries;

          vscode.setState({
            ...vscode.getState(),
            vscodeSnippetEntries,
          });

          commonRef.current.updateSnippets();
          return;

        case "show":
          setTimeout(() => {
            document.getElementById(message.keyName)?.scrollIntoView();
          }, 0);
          return;

        case "edit":
          commonRef.current.addEdit(message.keyName);
          return;

        case "updateSuccess":
          commonRef.current.removeEdit(message.keyName);
          return;

        case "insertSuccess":
          commonRef.current.removeAdd(message.keyName);
          return;

        case "error":
          commonRef.current.setError(message.errMsg);
          return;
      }
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, []);

  const handleAddSnippetClick = () => {
    const keyName = nanoid();
    const state = getState();
    vscode.setState({
      ...state,
      addingSnippets: [
        {
          name: "",
          body: "",
          description: "",
          prefix: "",
          scope: "",
          [NAME]: keyName,
          [EDIT]: true,
          [NEW_ITEM]: true,
        },
        ...state.addingSnippets,
      ],
    });

    commonRef.current.updateSnippets();
  };

  const throwError = () => {
    throw Error(error);
  };

  const handleSaveEdit = (snippet: ISnippet, keyName: string) => {
    const state = getState();
    if (snippet[NEW_ITEM]) {
      const currentSnippet = state.addingSnippets.find(
        (d) => d[NAME] === keyName
      );
      if (!currentSnippet) {
        return;
      }

      vscode.postMessage({
        type: "insert",
        payload: {
          keyName,
          snippet: currentSnippet,
        },
      });
      return;
    }

    const currentSnippet = state.editingSnippetObjMap[keyName];
    if (!currentSnippet) {
      return;
    }

    vscode.postMessage({
      type: "update",
      payload: {
        keyName,
        snippet: currentSnippet,
      },
    });
  };

  const handleCancelEdit = (snippet: ISnippet, keyName: string) => {
    if (snippet[NEW_ITEM]) {
      commonRef.current.removeAdd(keyName);
      return;
    }

    commonRef.current.removeEdit(keyName);
  };

  return (
    <main className="code-snippets-editor">
      {error ? throwError() : null}
      <Toolbar onAddSnippetClick={handleAddSnippetClick} />
      {snippets.length ? (
        <ul className="code-snippets-editor-snippets">
          {snippets.map((snippet) => {
            const keyName = snippet[NAME];
            return (
              <li className="code-snippets-editor-snippets__item" key={keyName}>
                <SnippetItem
                  snippet={snippet}
                  clickEdit={() => commonRef.current.addEdit(keyName)}
                  saveEdit={() => handleSaveEdit(snippet, keyName)}
                  cancelEdit={() => handleCancelEdit(snippet, keyName)}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <div>{window.i18nText.noSnippets}</div>
      )}
    </main>
  );
};

export default CodeSnippetsEditor;
