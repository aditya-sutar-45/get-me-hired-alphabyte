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
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    parts.push({
      type: "code",
      language: match[1] || "javascript",
      content: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }];
};

// VS Code-like code block component
const CodeBlock = ({ language, content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-gray-700 bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 ml-2 font-mono">
            {language || "code"}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          {copied ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <SyntaxHighlighter
          language={language || "javascript"}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: "0.875rem",
            padding: "1rem",
            background: "#1e1e1e",
          }}
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            color: "#858585",
            userSelect: "none",
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// Message component with streaming effect and code highlighting
const MessageBubble = ({ msg, isLatestStreaming = false, feedback = null }) => {
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
      <div className="max-w-[85%] sm:max-w-[80%] lg:max-w-[75%]">
        <div
          className={`${msg.speaker === "You" ? "bg-base-100" : "bg-base-100"
            } rounded-2xl px-4 py-3 relative break-words`}
        >
          <p
            className={`font-medium text-xs mb-1 ${msg.speaker === "You" ? "text-blue-200" : "text-green-200"
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
                  <CodeBlock
                    key={idx}
                    language={part.language}
                    content={part.content}
                  />
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

        {/* Feedback display for user answers */}
        {feedback && msg.speaker === "You" && (
          <div className="mt-2 p-3 bg-base-200 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-300">
                AI Feedback
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  Score: {feedback.logical_score}/10
                </span>
                <span className="text-xs text-gray-400">
                  Confidence: {feedback.confidence}%
                </span>
              </div>
            </div>

            <div className="mb-2">
              <span className={`text-xs font-medium ${feedback.logical_correctness === "correct"
                ? "text-green-400"
                : feedback.logical_correctness === "partially_correct"
                  ? "text-yellow-400"
                  : "text-red-400"
                }`}>
                {feedback.logical_correctness === "correct"
                  ? "✓ Correct"
                  : feedback.logical_correctness === "partially_correct"
                    ? "⚠ Partially Correct"
                    : "✗ Incorrect"}
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {feedback.feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// NEW: Function to group consecutive messages from the same speaker
const groupConsecutiveMessages = (transcript) => {
  const grouped = [];

  for (let i = 0; i < transcript.length; i++) {
    const currentMsg = transcript[i];

    // If this is the first message or speaker changed, start a new group
    if (grouped.length === 0 || grouped[grouped.length - 1].speaker !== currentMsg.speaker) {
      grouped.push({
        ...currentMsg,
        originalIndices: [i], // Track original indices for feedback mapping
      });
    } else {
      // Same speaker - append to the last group
      const lastGroup = grouped[grouped.length - 1];
      lastGroup.text += " " + currentMsg.text;
      lastGroup.timestamp = currentMsg.timestamp; // Use the latest timestamp
      lastGroup.isFinal = currentMsg.isFinal; // Use the latest isFinal status
      lastGroup.originalIndices.push(i);
    }
  }

  return grouped;
};

const TranscriptPanel = ({
  transcript,
  isAgentSpeaking = false,
  onSendMessage,
  messageInputDisabled = false,
  apiBaseUrl = "", // Add this prop for API endpoint configuration
  allFeedback,
  setAllFeedback,
}) => {
  const transcriptEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [message, setMessage] = useState("");
  const [lastAgentQuestion, setLastAgentQuestion] = useState(null);
  const [feedbackMap, setFeedbackMap] = useState({}); // Store feedback by message index
  const [processingFeedback, setProcessingFeedback] = useState(false);
  const [processedUserMessages, setProcessedUserMessages] = useState(new Set()); // Track processed messages

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

  // Track the last agent question
  useEffect(() => {
    const filteredTranscript = transcript.filter(
      (msg) => msg.speaker === "You" || msg.speaker === "Agent"
    );

    // Find the last agent message
    for (let i = filteredTranscript.length - 1; i >= 0; i--) {
      if (filteredTranscript[i].speaker === "Agent") {
        setLastAgentQuestion(filteredTranscript[i].text);
        break;
      }
    }
  }, [transcript]);

  // NEW: Monitor transcript for new user messages (including voice messages)
  useEffect(() => {
    const filteredTranscript = transcript.filter(
      (msg) => msg.speaker === "You" || msg.speaker === "Agent"
    );

    // Find all user messages
    filteredTranscript.forEach((msg, idx) => {
      if (msg.speaker === "You" && msg.isFinal) {
        // Create a unique identifier for this message
        const messageId = `${idx}-${msg.timestamp}-${msg.text.substring(0, 20)}`;

        // Check if we've already processed this message
        if (!processedUserMessages.has(messageId)) {
          // Mark as processed
          setProcessedUserMessages(prev => new Set([...prev, messageId]));

          // Find the most recent Agent question before this user message
          let questionForThisAnswer = null;
          for (let i = idx - 1; i >= 0; i--) {
            if (filteredTranscript[i].speaker === "Agent") {
              questionForThisAnswer = filteredTranscript[i].text;
              break;
            }
          }

          // If there's a question and API URL, get feedback
          if (questionForThisAnswer && apiBaseUrl && !feedbackMap[idx]) {
            console.log("Processing voice/text message:", msg.text);
            getUserFeedback(questionForThisAnswer, msg.text, idx);
          }
        }
      }
    });
  }, [transcript, apiBaseUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to call the user feedback API
  const getUserFeedback = async (question, userAnswer, messageIndex) => {
    if (!apiBaseUrl) {
      console.warn("API base URL not provided");
      return;
    }

    // Check if feedback already exists for this index
    if (feedbackMap[messageIndex]) {
      console.log("Feedback already exists for index:", messageIndex);
      return;
    }

    try {
      setProcessingFeedback(true);

      console.log("Sending feedback request:", {
        question,
        userAnswer,
        messageIndex
      });

      const response = await fetch(`${apiBaseUrl}/user_feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          user_answer: userAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Store feedback with the message index

      const feedbackObject = {
        messageIndex,
        question,
        userAnswer,
        logical_correctness: data.logical_correctness,
        feedback: data.feedback,
        logical_score: data.logical_score,
        confidence: data.confidence,
      };

      setFeedbackMap(prev => ({
        ...prev,
        [messageIndex]: feedbackObject,
      }));

      setAllFeedback(prev => [...prev, feedbackObject]);

      console.log("Feedback received and stored for index", messageIndex, ":", data);
    } catch (error) {
      console.error("Error getting user feedback:", error);
    } finally {
      setProcessingFeedback(false);
    }
  };

  const filteredTranscript = transcript.filter(
    (msg) => msg.speaker === "You" || msg.speaker === "Agent"
  );

  // NEW: Group consecutive messages
  const groupedTranscript = groupConsecutiveMessages(filteredTranscript);

  const handleSend = () => {
    if (message.trim() && !messageInputDisabled && onSendMessage) {
      const userMessage = message;
      onSendMessage(userMessage);

      // The useEffect will handle the API call for this message
      // No need to manually call it here anymore

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
        {groupedTranscript.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">AI Interview</p>
              <p className="text-gray-400 text-sm">
                Interview will start soon...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {groupedTranscript.map((msg, idx) => {
              const isLatest = idx === groupedTranscript.length - 1;
              const isLatestAgent = isLatest && msg.speaker === "Agent";

              // For grouped user messages, get feedback for the last original index
              const feedbackIndex = msg.originalIndices
                ? msg.originalIndices[msg.originalIndices.length - 1]
                : idx;

              return (
                <MessageBubble
                  key={`${msg.speaker}-${idx}-${msg.timestamp}-${msg.segmentId || ""}`}
                  msg={msg}
                  isLatestStreaming={isLatestAgent && isAgentSpeaking}
                  feedback={feedbackMap[feedbackIndex]}
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
            disabled={messageInputDisabled || processingFeedback}
            placeholder="Type a message or speak..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-3 pr-12 resize-none focus:outline-none max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
            style={{ minHeight: "54px" }}
          />
          <button
            onClick={handleSend}
            disabled={messageInputDisabled || !message.trim() || processingFeedback}
            className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${message.trim() && !messageInputDisabled && !processingFeedback
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            aria-label="Send message"
          >
            {processingFeedback ? (
              <svg
                className="animate-spin"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="0.75" />
              </svg>
            ) : (
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
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranscriptPanel;
