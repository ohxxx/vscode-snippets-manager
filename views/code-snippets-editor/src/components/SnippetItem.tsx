import { useEffect, useRef } from "react";
import { getState } from "../common";
import getVsCode from "../getVsCode";
import { EDIT, NAME, NEW_ITEM } from "../symbols";
import { ISnippet } from "../typings";
import { CancelIcon, CopyIcon, DeleteIcon, EditIcon, GoToFileIcon, SaveIcon } from "./SVG";

import "./SnippetItem.scss";

interface Props {
  snippet: ISnippet;
  clickEdit(): void;
  saveEdit(): void;
  cancelEdit(): void;
}

const SnippetItem = ({ snippet, clickEdit, saveEdit, cancelEdit }: Props) => {
  const vscode = getVsCode();
  const keyName = snippet[NAME];
  const editing = snippet[EDIT];
  const formRef = useRef<HTMLFormElement | null>(null);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const prefixInputRef = useRef<HTMLInputElement | null>(null);
  const scopeInputRef = useRef<HTMLInputElement | null>(null);
  const descriptionInputRef = useRef<HTMLInputElement | null>(null);

  const saveBtnRef = useRef<HTMLDivElement | null>(null);
  const cancelBtnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editing) {
      const { name, prefix, scope, description } = snippet;
      nameInputRef.current!.value = name;
      prefixInputRef.current!.value = prefix;
      scopeInputRef.current!.value = scope;
      descriptionInputRef.current!.value = description;
    }
  }, [editing]);

  const handleChange = () => {
    if (!formRef.current) {
      return;
    }

    const data = new FormData(formRef.current);
    const newSnippet = {
      name: data.get("name")?.toString() || "",
      prefix: data.get("prefix")?.toString() || "",
      scope: data.get("scope")?.toString() || "",
      description: data.get("description")?.toString() || "",
      body: data.get("body")?.toString() || "",
    };
    const state = getState();

    if (snippet[NEW_ITEM]) {
      const index = state.addingSnippets.findIndex((d) => d[NAME] === keyName);

      if (index === -1) {
        return;
      }

      const currentSnippet = state.addingSnippets[index];

      state.addingSnippets.splice(index, 1, {
        ...currentSnippet,
        ...newSnippet,
      });

      vscode.setState(state);
      return;
    }

    if (editing) {
      const snippet = state.editingSnippetObjMap[keyName];
      if (!snippet) {
        return;
      }

      state.editingSnippetObjMap[keyName] = {
        ...snippet,
        ...newSnippet,
      };
      vscode.setState(state);
      return;
    }
  };

  const renderNonEditingSnippet = () => (
    <div hidden={editing}>
      <div className="code-snippets-editor-operation">
        <div onClick={clickEdit} className="code-snippets-editor-operation__btn">
          <EditIcon fontSize={18} color="inherit" />
          <span>{window.i18nText.editItem}</span>
        </div>
        <div onClick={() => vscode.postMessage({ type: "duplicate", payload: { keyName } })} className="code-snippets-editor-operation__btn">
          <CopyIcon fontSize={18} color="inherit" />
          <span>{window.i18nText.duplicateItem}</span>
        </div>
        <div onClick={() => vscode.postMessage({ type: "delete", payload: { keyName } })} className="code-snippets-editor-operation__btn">
          <DeleteIcon fontSize={18} color="inherit" />
          <span>{window.i18nText.deleteItem}</span>
        </div>
      </div>
      <div className="code-snippets-editor-snippet__top">
        <div className="code-snippets-editor-top-items">
          <div className="code-snippets-editor-top-items__item">
            <span className="code-snippets-editor-label">
              {window.i18nText.name}:{" "}
            </span>
            <span className="code-snippets-editor-content">{keyName || '-'}</span>
          </div>
          <div className="code-snippets-editor-top-items__item">
            <span className="code-snippets-editor-label">
              {window.i18nText.prefix}:{" "}
            </span>
            <span className="code-snippets-editor-content">{snippet.prefix || '-'}</span>
          </div>
          <div className="code-snippets-editor-top-items__item">
            <span className="code-snippets-editor-label">
              {window.i18nText.scope}:{" "}
            </span>
            <span className="code-snippets-editor-content">{snippet.scope || '-'}</span>
          </div>
        </div>
      </div>
      <div className="code-snippets-editor-snippet__desc">
        <span className="code-snippets-editor-label">
          {window.i18nText.description}:{" "}
        </span>
        <span className="code-snippets-editor-content">{snippet.description || '-'}</span>
      </div>
      <div className="code-snippets-editor-snippet__body">
        <div>
          <span className="code-snippets-editor-label code-snippets-editor-label--body">
            <span className="code-snippets-editor-label">{window.i18nText.body}{":"}</span>
            <div
              onClick={() => vscode.postMessage({ type: "editBody", payload: { keyName } })}
              className="code-snippets-editor-operation__btn"
              style={{ padding: '0.2em' }}
            >
              <GoToFileIcon fontSize={16} color="inherit" />
            </div>
          </span>{" "}
        </div>
        <div className="code-snippets-editor-snippet__body__content">
          <pre>{snippet.body || '-'}</pre>
        </div>
      </div>
    </div>
  );

  const renderEditingSnippet = () => (
    <form ref={formRef}>
      <div className="code-snippets-editor-operation">
        <div
          className="code-snippets-editor-operation__btn"
          style={{ 'background': 'var(--vscode-button-background)', 'color': '#fff' }}
          ref={saveBtnRef}
          onClick={saveEdit}
          tab-goto-key={`${keyName}-save-button`}
          shift-tab-goto={`[tab-goto-key="${keyName}-body-input"]`}
        >
          <SaveIcon fontSize={18} color="#fff" />
          <span>{window.i18nText.save}</span>
        </div>
        <div
          className="code-snippets-editor-operation__btn"
          ref={cancelBtnRef}
          onClick={cancelEdit}
          tab-goto-key={`${keyName}-cancel-button`}
          tab-goto={`[tab-goto-key="${keyName}-name-input"]`}
        >
          <CancelIcon fontSize={18} color="inherit" />
          <span>{window.i18nText.cancel}</span>
        </div>
      </div>
      <div className="code-snippets-editor-snippet__top">
        <div className="code-snippets-editor-top-items">
          <div className="code-snippets-editor-snippet__content">
            <span className="code-snippets-editor-snippet__content-title">{window.i18nText.name}</span>
            <div className="code-snippets-editor-snippet__content-input">
              <input
                ref={nameInputRef}
                name="name"
                onChange={handleChange}
                tab-goto-key={`${keyName}-name-input`}
                shift-tab-goto={`[tab-goto-key="${keyName}-cancel-button"]`}
              />
            </div>
          </div>
          <div className="code-snippets-editor-snippet__content">
            <span className="code-snippets-editor-snippet__content-title">{window.i18nText.prefix}</span>
            <div className="code-snippets-editor-snippet__content-input">
              <input
                ref={prefixInputRef}
                name="prefix"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="code-snippets-editor-snippet__content">
            <span className="code-snippets-editor-snippet__content-title">{window.i18nText.scope}</span>
            <div className="code-snippets-editor-snippet__content-input">
              <input
                ref={scopeInputRef}
                name="scope"
                onChange={handleChange}
                tab-goto-key={`${keyName}-scope-input`}
                tab-goto={`[tab-goto-key="${keyName}-description-input"]`}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="code-snippets-editor-snippet__desc code-snippets-editor-snippet__content">
        <span className="code-snippets-editor-snippet__content-title">{window.i18nText.description}</span>
        <div className="code-snippets-editor-snippet__content-input">
          <input
            ref={descriptionInputRef}
            name="description"
            onChange={handleChange}
            tab-goto-key={`${keyName}-description-input`}
            shift-tab-goto={`[tab-goto-key="${keyName}-scope-input"]`}
          />
        </div>
      </div>
      <div className="code-snippets-editor-snippet__body code-snippets-editor-snippet__content">
        <span className="code-snippets-editor-snippet__content-title">{window.i18nText.body}</span>
        <div className="code-snippets-editor-snippet__content-textarea">
          <textarea
            tab-goto-key={`${keyName}-body-input`}
            tab-goto={`[tab-goto-key="${keyName}-save-button"]`}
            rows={10}
            name="body"
            onChange={handleChange}
          >{snippet.body}</textarea>
        </div>
      </div>
    </form>
  );

  return (
    <section id={keyName} className="code-snippets-editor-snippet">
      {renderNonEditingSnippet()}
      {editing && renderEditingSnippet()}
    </section>
  );
};

export default SnippetItem;
