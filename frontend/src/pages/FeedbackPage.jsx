import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Download,
  Mic,
  TrendingUp,
  ArrowLeft
} from "lucide-react";

const FeedbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState([]);
  const [interviewData, setInterviewData] = useState({});
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = location.state;
    console.log(data)

    if (!data || !data.sessionDetails.transcript) {
      return;
    }

    setTranscript(data.sessionDetails.transcript);
    setInterviewData({
      roomId: data.roomId || "",
      interviewName: data.interviewName || "Interview Session",
      duration: data.duration || "N/A",
    });

    const fetchFeedback = async () => {
      try {
        const res = await fetch("http://localhost:5000/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: data.transcript }),
        });

        const result = await res.json();
        setFeedback(result.feedback || []);
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [location.state, navigate]);

  const handleBackToHome = () => navigate("/");

  const handleDownloadTranscript = () => {
    const transcriptText = transcript
      .map((msg) => `[${msg.timestamp}] ${msg.speaker}: ${msg.text}`)
      .join("\n\n");

    const blob = new Blob([transcriptText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcript-${Date.now()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen relative font-work-sans">
      {/* Global Animated Grid Background */}
      <div className="fixed inset-0 h-full w-full -z-10 bg-base-200">
        <div
          className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f18_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f18_1px,transparent_1px)] bg-[size:40px_40px]"
          style={{
            animation: 'gridFlow 30s linear infinite',
          }}
        ></div>
      </div>

      {/* Hero Header */}
      <div className="hero min-h-[70vh] font-work-sans relative">
        <div className="hero-content text-center relative z-10">
          <div className="max-w-4xl">
            <div className="inline-block mb-6">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                Interview Analysis
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold font-space-mono mb-6 leading-tight">
              Your Feedback Report
            </h1>

            <p className="text-xl text-base-content/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Comprehensive analysis of your interview performance with actionable insights
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <button
                onClick={handleDownloadTranscript}
                className="btn btn-outline btn-primary gap-2 group font-work-sans"
              >
                <Download className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                Download Report
              </button>
              <button
                onClick={handleBackToHome}
                className="btn btn-ghost gap-2 font-work-sans"
              >
                <ArrowLeft className="w-4 h-4" />
                New Practice
              </button>
            </div>
          </div>
        </div>

        {/* Pulsing Analytics Visualization */}
        <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-96 h-96 opacity-20">
          <div className="absolute inset-0 flex items-center justify-center">
            {[1, 2, 3].map((ring) => (
              <div
                key={ring}
                className="absolute rounded-full border-2 border-primary/20"
                style={{
                  width: `${ring * 200}px`,
                  height: `${ring * 200}px`,
                  animation: `ripple 4s ease-out ${ring * 0.5}s infinite`,
                }}
              ></div>
            ))}
            {/* <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <BarChart3 className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10 -mt-20">
        {/* Interview Info Card */}
        <div className="bg-base-100/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-12 border border-base-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold font-space-mono mb-2">
                {interviewData.interviewName}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-base-content/60">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  Room ID: {interviewData.roomId}
                </span>
                <span>Duration: {interviewData.duration}</span>
                <span>{transcript.length} exchanges</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadTranscript}
                className="btn btn-outline btn-sm gap-1"
              >
                <Download className="w-4 h-4" />
                Transcript
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Transcript */}
          <div className="bg-base-100/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-base-200 p-8 lg:p-10">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-space-mono">Full Transcript</h2>
                  <p className="text-sm text-base-content/60">Complete conversation playback</p>
                </div>
              </div>
              <span className="badge badge-lg badge-primary font-mono">
                {transcript.length} messages
              </span>
            </div>

            <div className="divider"></div>

            <div className="overflow-y-auto max-h-[70vh] space-y-4 pr-2">
              {transcript.length === 0 ? (
                <div className="text-center py-20 text-base-content/40">
                  <Mic className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No transcript available</p>
                </div>
              ) : (
                transcript.map((msg, idx) => (
                  <div
                    key={`${msg.speaker}-${idx}-${msg.timestamp}`}
                    className={`p-4 lg:p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${msg.speaker === "You"
                      ? "bg-gradient-to-r from-primary/10 to-primary/5 ml-6 border-l-4 border-primary"
                      : "bg-gradient-to-r from-secondary/10 to-secondary/5 mr-6 border-l-4 border-secondary"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={`font-bold text-lg px-3 py-1 rounded-full text-sm ${msg.speaker === "You"
                          ? "bg-primary text-white"
                          : "bg-secondary text-white shadow-md"
                          }`}
                      >
                        {msg.speaker}
                      </span>
                      <span className="text-xs bg-base-200 px-2 py-1 rounded-full font-mono opacity-70">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="text-base leading-relaxed break-words font-work-sans">
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right - Feedback - BACK TO ORIGINAL SIMPLE DISPLAY */}
          <div className="bg-base-100/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-base-200 p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-success to-warning rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-space-mono">AI Performance Analysis</h2>
                <p className="text-sm text-base-content/60">Actionable insights for improvement</p>
              </div>
            </div>

            <div className="divider"></div>

            <div className="overflow-y-auto max-h-[70vh] space-y-4 pr-2">
              {loading ? (
                <div className="text-center py-12 opacity-60">
                  <span className="loading loading-spinner loading-lg"></span>
                  <p className="mt-4">Analyzing your interview...</p>
                </div>
              ) : feedback.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                  No feedback available.
                </div>
              ) : (
                feedback.map((item, idx) => (
                  <div
                    key={idx}
                    className="card bg-base-100 shadow-sm border border-base-300"
                  >
                    <div className="card-body p-4">
                      <h3 className="font-semibold text-base mb-2">
                        Q{idx + 1}: {item.question}
                      </h3>
                      <p className="text-sm mb-3">
                        <span className="font-semibold">Answer:</span>{" "}
                        {item.answer}
                      </p>

                      <div className="bg-base-200 rounded-md p-3">
                        <p className="text-sm mb-1">
                          <span className="font-semibold text-success">
                            Strengths:
                          </span>{" "}
                          {item.feedback?.strengths || "N/A"}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold text-warning">
                            Improvements:
                          </span>{" "}
                          {item.feedback?.improvements || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes gridFlow {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        
        @keyframes ripple {
          0% { 
            transform: scale(0.8); 
            opacity: 1; 
          }
          100% { 
            transform: scale(2); 
            opacity: 0; 
          }
        }
      `}</style>
    </div>
  );
};

export default FeedbackPage;
