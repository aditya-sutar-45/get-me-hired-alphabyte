import React, { useRef, useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// Enhanced hook for real-time streaming text (subtitle-like)
const useStreamingText = (text, isStreaming = false, speed = 20) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setIsActive(false);
      return;
    }

    if (isStreaming) {
      setIsActive(true);
      let index = 0;
      setDisplayedText("");

      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsActive(false);
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);
    } else {
      setDisplayedText(text);
      setIsActive(false);
    }
  }, [text, isStreaming, speed]);

  return { displayedText, isActive };
};

// Function to detect and parse code blocks from text
const parseMessageContent = (text) => {
  // Updated regex to handle both ``````
  const codeBlockRegex = /``````/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add code block (with or without language identifier)
    parts.push({
      type: "code",
      language: match[1] || "python", // Default to python if no language specified
      content: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }];
};

// Message component with streaming effect and code highlighting
const MessageBubble = ({ msg, isLatestStreaming = false }) => {
  const { displayedText, isActive } = useStreamingText(
    msg.text,
    isLatestStreaming && !msg.isFinal,
    msg.speaker === "Agent" ? 15 : 25,
  );

  const contentParts = parseMessageContent(displayedText);

  return (
    <div
      className={`flex ${msg.speaker === "You" ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] ${
          msg.speaker === "You" ? "bg-base-100" : "bg-base-100"
        } rounded-2xl px-4 py-3 relative break-words`}
      >
        <p
          className={`font-medium text-xs mb-1 ${
            msg.speaker === "You" ? "text-blue-200" : "text-green-200"
          }`}
        >
          {msg.speaker} • {msg.timestamp}
          {isActive && msg.speaker === "Agent" && (
            <span className="ml-2 text-xs text-green-300">● LIVE</span>
          )}
        </p>
        
        <div className="text-white text-sm leading-relaxed break-words overflow-wrap-anywhere">
          {contentParts.map((part, idx) => {
            if (part.type === "code") {
              return (
                <div key={idx} className="my-2 rounded-lg overflow-hidden">
                  <SyntaxHighlighter
                    language={part.language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      padding: "1rem",
                    }}
                    showLineNumbers={true}
                  >
                    {part.content}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return (
              <span key={idx} className="whitespace-pre-wrap">
                {part.content}
              </span>
            );
          })}
          {isActive && (
            <span className="animate-pulse ml-1 text-gray-300 font-bold">
              |
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const TranscriptPanel = ({
  transcript,
  isAgentSpeaking = false,
  onSendMessage,
  messageInputDisabled = false,
}) => {
  const transcriptEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [message]);

  const filteredTranscript = transcript.filter(
    (msg) => msg.speaker === "You" || msg.speaker === "Agent",
  );

  const handleSend = () => {
    if (message.trim() && !messageInputDisabled && onSendMessage) {
      onSendMessage(message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg bg-base-300">
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredTranscript.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">AI Interview </p>
              <p className="text-gray-400 text-sm">
                Interview will start soon...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTranscript.map((msg, idx) => {
              const isLatest = idx === filteredTranscript.length - 1;
              const isLatestAgent = isLatest && msg.speaker === "Agent";

              return (
                <MessageBubble
                  key={`${msg.speaker}-${idx}-${msg.timestamp}-${msg.segmentId || ""}`}
                  msg={msg}
                  isLatestStreaming={isLatestAgent && isAgentSpeaking}
                />
              );
            })}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="relative flex items-end bg-base-100 rounded-xl focus-within:border-gray-500 transition-colors shadow-lg">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={messageInputDisabled}
            placeholder="Type a message or speak..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-3 pr-12 resize-none focus:outline-none max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
            style={{ minHeight: "54px" }}
          />
          <button
            onClick={handleSend}
            disabled={messageInputDisabled || !message.trim()}
            className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${
              message.trim() && !messageInputDisabled
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranscriptPanel;
