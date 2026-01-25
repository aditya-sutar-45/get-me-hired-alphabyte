import { Editor } from "@monaco-editor/react";
import { Code, Play } from "lucide-react";
import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { executeCode } from "../../api/api";

function CodeEditor({
  codeValue,
  setCodeValue,
  output,
  setOutput,
  handleCodeSubmit,
  language,
  setLanguage,
  analysis,
  loadingAnalysis,
}) {
  const location = useLocation();
  const editorRef = useRef();

  const languages = location.state?.jobData.languages || ["javascript"];
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' | 'output' | 'analysis'

  const onMount = (editor) => {
    editorRef.current = editor;
  };

  const onLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      const result = await executeCode(language, sourceCode);
      setOutput(result.run.output);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="drawer">
      <input id="my-drawer-1" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label htmlFor="my-drawer-1" className="btn drawer-button">
          <Code />
          Code
        </label>
      </div>

      <div className="drawer-side">
        <label
          htmlFor="my-drawer-1"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        <ul className="menu bg-none min-h-full">
          {/* === Header with Run + Submit buttons === */}
          <div className="h-[5vh] w-[60vw] bg-base-200 flex justify-end gap-2">
            <button className="btn btn-warning" onClick={() => runCode()}>
              <Play /> Run
            </button>
            <button
              className="btn btn-success"
              onClick={handleCodeSubmit}
              disabled={loadingAnalysis}
            >
              Submit
            </button>
          </div>

          {/* === Tab selector & language dropdown === */}
          <div className="h-[5vh] w-[60vw] bg-base-200 flex justify-between">
            <div className="join">
              <button
                className={`btn join-item ${
                  activeTab === "editor" ? "btn-active" : "btn-soft"
                }`}
                onClick={() => setActiveTab("editor")}
              >
                Editor
              </button>
              <button
                className={`btn join-item ${
                  activeTab === "output" ? "btn-active" : "btn-soft"
                }`}
                onClick={() => setActiveTab("output")}
              >
                Output
              </button>
              <button
                className={`btn join-item ${
                  activeTab === "analysis" ? "btn-active" : "btn-soft"
                }`}
                onClick={() => setActiveTab("analysis")}
              >
                Analysis
              </button>
            </div>

            <div>
              <select
                defaultValue={language}
                className="select select-secondary"
                onChange={onLanguageChange}
              >
                {languages.map((lang, i) => (
                  <option disabled={lang === language} key={i}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* === Editor / Output / Analysis === */}
          {activeTab === "editor" && (
            <Editor
              height="90vh"
              width="60vw"
              onMount={onMount}
              theme="vs-dark"
              defaultLanguage={language}
              language={language}
              defaultValue=""
              value={codeValue}
              onChange={(value) => setCodeValue(value)}
            />
          )}

          {activeTab === "output" && (
            <div className="h-[90vh] w-[60vw] bg-base-100 p-4 overflow-auto">
              <h1 className="text-2xl font-work-sans">Output</h1>
              <div className="divider"></div>
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
          )}

          {activeTab === "analysis" && (
            <div className="h-[90vh] w-[60vw] bg-base-100 p-4 overflow-auto">
              <h1 className="text-2xl font-work-sans">Analysis</h1>
              <div className="divider"></div>

              {analysis ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: analysis }}
                ></div>
              ) : (
                <p className="text-gray-500">No analysis available yet.</p>
              )}
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}

export default CodeEditor;
