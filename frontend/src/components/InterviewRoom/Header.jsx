import React, { useState } from "react";
import ThemeController from "../General/ThemeController";
import CodeEditor from "./CodeEditor";
import { Lightbulb } from "lucide-react";

const Header = ({
  interviewName,
  isRecording,
  onRecordToggle,
  isConnected,
  onDisconnect,
  onConnect,
  codeValue,
  setCodeValue,
  output,
  setOutput,
  handleCodeSubmit,
  language,
  setLanguage,
  analysis,
  loadingAnalysis,
  hints,
  hintTopic,
  hintsUsed,
  setHintsUsed
}) => {
  const [showHintsDropdown, setShowHintsDropdown] = useState(false);
  const [selectedHint, setSelectedHint] = useState(null);


  const handleHintClick = (hint, index) => {
    const hintData = {
      hintId: index + 1,
      hintText: hint,
      question: interviewName || "Unknown Question",
      topic: hintTopic || null,
      timestamp: new Date().toISOString(),
    };

    // push into state
    setHintsUsed((prev) => [...prev, hintData]);

    // show modal
    setSelectedHint({ text: hint, index: index + 1 });
    setShowHintsDropdown(false);

    // debug log
    console.log("Hints Used So Far:", [...hintsUsed, hintData]);
  };

  const closeHintModal = () => {
    setSelectedHint(null);
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 bg-base-300">
        <div className="flex-1 max-w-[13%] flex items-center gap-1">
          {/* Code Editor */}
          <div className="flex-1">
            <CodeEditor
              codeValue={codeValue}
              setCodeValue={setCodeValue}
              output={output}
              setOutput={setOutput}
              handleCodeSubmit={handleCodeSubmit}
              language={language}
              setLanguage={setLanguage}
              analysis={analysis}
              loadingAnalysis={loadingAnalysis}
            />
          </div>

          {/* Hints Button */}
          {hints && hints.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowHintsDropdown(!showHintsDropdown)}
                className="btn btn-base-300 rounded-lg px-6 flex items-center gap-2"
              >
                <Lightbulb />
              </button>

              {/* Dropdown */}
              {showHintsDropdown && (
                <div className="absolute mt-2 w-50 bg-base-100 border border-base-300 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-base-300">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Available Hints</h3>
                      <button
                        onClick={() => setShowHintsDropdown(false)}
                        className="btn btn-ghost btn-sm btn-circle"
                      >
                        ✕
                      </button>
                    </div>

                    {hintTopic && (
                      <p className="text-sm text-base-content/60 mt-1">
                        Topic: <span className="text-primary">{hintTopic}</span>
                      </p>
                    )}
                  </div>

                  <div className="p-2">
                    {hints.map((hint, index) => (
                      <button
                        key={index}
                        onClick={() => handleHintClick(hint, index)}
                        className="w-full text-left p-3 hover:bg-base-200 rounded-lg transition-colors flex items-start gap-2"
                      >
                        <span className="badge badge-primary mt-1">
                          hint {index + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={isConnected ? onDisconnect : onConnect}
            className="btn btn-error rounded-lg px-8"
          >
            {isConnected ? "Disconnect" : "Connect"}
          </button>
        </div>
      </div>

      {/* Hint Modal */}
      {selectedHint && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeHintModal}
        >
          <div
            className="bg-base-100 rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-primary/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Hint {selectedHint.index}
                </h2>
                {hintTopic && (
                  <p className="text-sm text-base-content/60 mt-1">
                    Topic: <span className="text-primary">{hintTopic}</span>
                  </p>
                )}
              </div>
              <button
                onClick={closeHintModal}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            <div className="bg-base-200 rounded-lg p-4 border border-base-300">
              <p className="text-base leading-relaxed">{selectedHint.text}</p>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={closeHintModal}
                className="btn btn-primary rounded-lg"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
