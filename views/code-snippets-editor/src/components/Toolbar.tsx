import "./Toolbar.scss";

interface Props {
  onAddSnippetClick(): void;
}

const Toolbar = ({ onAddSnippetClick }: Props) => {
  return (
    <section className="code-snippets-editor-toolbar">
      <vscode-button onClick={onAddSnippetClick}>
        {window.i18nText.addSnippet}
      </vscode-button>
    </section>
  );
};

export default Toolbar;
