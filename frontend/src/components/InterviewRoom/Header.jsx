import React from "react";
import ThemeController from "../General/ThemeController";
import CodeEditor from "./CodeEditor";

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
}) => {
  return (
    // <div className="flex items-center justify-between px-6 py-4 bg-black border-b border-gray-700">
    //   <CodeEditor
    //     codeValue={codeValue}
    //     setCodeValue={setCodeValue}
    //     output={output}
    //     setOutput={setOutput}
    //     handleCodeSubmit={handleCodeSubmit}
    //     language={language}
    //     setLanguage={setLanguage}
    //     analysis={analysis}
    //     loadingAnalysis={loadingAnalysis}
    //   />
    //   <h1 className="text-xl font-medium text-white">{interviewName}</h1>
    //   <div className="flex gap-3">
    //     <ThemeController />
    //     <button
    //       onClick={onRecordToggle}
    //       disabled={!isConnected}
    //       className={`btn btn-error ${isRecording ? "btn-active" : ""} rounded-lg px-8`}
    //     >
    //       {isRecording ? "Recording..." : "Record"}
    //     </button>
    //     <button
    //       onClick={isConnected ? onDisconnect : onConnect}
    //       className="btn btn-error rounded-lg px-8"
    //     >
    //       {isConnected ? "Disconnect" : "Connect"}
    //     </button>
    //   </div>
    // </div>

    <div className="flex items-center justify-between px-6 py-4 bg-base-300">
  <div className="flex-1 max-w-[60%]">
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

  <h1 className="text-xl font-medium text-grey-600 whitespace-nowrap mx-4">
    {interviewName}
  </h1>

  <div className="flex gap-3">
    <ThemeController />
    {/* <button
      onClick={onRecordToggle}
      disabled={!isConnected}
      className={`btn btn-error ${isRecording ? "btn-active" : ""} rounded-lg px-8`}
    >
      {isRecording ? "Recording..." : "Record"}
    </button> */}
    <button
      onClick={isConnected ? onDisconnect : onConnect}
      className="btn btn-error rounded-lg px-8"
    >
      {isConnected ? "Disconnect" : "Connect"}
    </button>
  </div>
</div>
  );
};

export default Header;
