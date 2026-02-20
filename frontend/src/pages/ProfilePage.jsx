import { useParams } from "react-router-dom";
import { getUserByUsername } from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BarChart3,
  Brain,
  Lightbulb,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Hash,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_BASE_URL } from "../constants";

function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["profiles", username],
    queryFn: () => getUserByUsername(username),
  });

  const [showResume, setShowResume] = useState(false);
  const [sessionData, setSessionData] = useState([]);
  const [expandedSession, setExpandedSession] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/interview`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSessionData(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (user.role === "company") return;
    fetchSessions();
  }, []);

  const totalSessions = sessionData.length;
  const totalQuestions = sessionData.reduce(
    (acc, session) => acc + (session.user_feedbacks?.length || 0),
    0
  );
  const avgScore =
    totalQuestions === 0
      ? 0
      : (
        sessionData.reduce(
          (acc, session) =>
            acc +
            (session.user_feedbacks?.reduce(
              (sum, fb) => sum + (fb.logical_score || 0),
              0
            ) || 0),
          0
        ) / totalQuestions
      ).toFixed(1);

  const totalHintsUsed = sessionData.reduce(
    (acc, session) => acc + (session.hints_used?.length || 0),
    0
  );

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading profile...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-error">
        Error loading profile
      </div>
    );

  return (
    <div className="min-h-screen bg-base-200 px-4 py-10 font-work-sans">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* PROFILE HEADER */}
        <div className="bg-base-100 shadow-xl rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-primary text-primary-content flex items-center justify-center text-4xl font-bold shadow-lg">
              {data.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold font-mono">{data.username}</h1>
              <p className="opacity-70">{data.email}</p>
              <p className="text-sm opacity-50 mt-1">Interview Performance Dashboard</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-60">Avg Score</p>
              <p className="text-4xl font-bold text-primary">{avgScore}%</p>
            </div>
          </div>
        </div>

        {user.role !== "company" && (
          <>
            < div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card icon={<BarChart3 />} label="Total Interviews" value={totalSessions} />
              <Card icon={<Brain />} label="Questions Answered" value={totalQuestions} />
              <Card icon={<FileText />} label="Avg Logical Score" value={`${avgScore}%`} />
              <Card icon={<Lightbulb />} label="Hints Used" value={totalHintsUsed} />
            </div>

            <div className="bg-base-100 rounded-2xl shadow-xl">
              <button
                onClick={() => setShowResume(!showResume)}
                className="w-full flex justify-between items-center p-6 font-semibold text-lg hover:bg-base-200 transition rounded-2xl"
              >
                Resume
                {showResume ? <ChevronUp /> : <ChevronDown />}
              </button>
              <AnimatePresence>
                {showResume && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    <div className="prose max-w-none bg-base-200 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <ReactMarkdown>{data.parsed_resume || "No Resume"}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-base-100 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-6">Interview History</h2>
              <div className="space-y-4">
                {sessionData.map((session) => {
                  const sessionAvg =
                    session.user_feedbacks?.length
                      ? (
                        session.user_feedbacks.reduce((acc, fb) => acc + fb.logical_score, 0) /
                        session.user_feedbacks.length
                      ).toFixed(1)
                      : "N/A";

                  const isExpanded = expandedSession === session.id;

                  return (
                    <div key={session.id} className="bg-base-200 rounded-xl shadow-sm overflow-hidden">

                      {/* Session Summary Row */}
                      <motion.button
                        whileHover={{ scale: 1.005 }}
                        onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                        className="w-full text-left p-5 hover:bg-base-300 transition"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold">Interview</p>
                            <p className="text-sm opacity-60 font-mono">{session.id.slice(0, 8)}…</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-primary text-lg">{sessionAvg}%</p>
                              <p className="text-xs opacity-60">Avg Score</p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="opacity-50" size={18} />
                            ) : (
                              <ChevronDown className="opacity-50" size={18} />
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between mt-4 text-sm opacity-70">
                          <span>Questions: {session.user_feedbacks?.length || 0}</span>
                          <span>Hints: {session.hints_used?.length || 0}</span>
                          <span>{new Date(session.created_at).toLocaleDateString()}</span>
                        </div>
                      </motion.button>

                      {/* Expandable Detail Panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-6 space-y-6 border-t border-base-300 pt-5">

                              {/* Q&A Feedback */}
                              {session.user_feedbacks?.length > 0 && (
                                <section>
                                  <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                                    <MessageSquare size={16} className="text-primary" />
                                    Question Feedback
                                  </h3>
                                  <div className="space-y-3">
                                    {session.user_feedbacks.map((fb, i) => (
                                      <FeedbackCard key={i} feedback={fb} index={i} />
                                    ))}
                                  </div>
                                </section>
                              )}

                              {/* Hints Used */}
                              {session.hints_used?.length > 0 && (
                                <section>
                                  <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                                    <Lightbulb size={16} className="text-warning" />
                                    Hints Used ({session.hints_used.length})
                                  </h3>
                                  <div className="space-y-2">
                                    {session.hints_used.map((hint, i) => (
                                      <HintCard key={i} hint={hint} />
                                    ))}
                                  </div>
                                </section>
                              )}

                              {/* Transcript */}
                              {session.transcript?.length > 0 && (
                                <section>
                                  <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                                    <FileText size={16} className="text-secondary" />
                                    Full Transcript
                                  </h3>
                                  <div className="bg-base-100 rounded-xl p-4 max-h-72 overflow-y-auto space-y-3">
                                    {session.transcript.map((msg, i) => (
                                      <TranscriptMessage key={i} msg={msg} />
                                    ))}
                                  </div>
                                </section>
                              )}

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div >
  );
}

export default ProfilePage;

/* ─── Sub-components ─────────────────────────────────────────── */

function Card({ icon, label, value }) {
  return (
    <div className="bg-base-100 rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition">
      <div className="bg-primary/10 text-primary p-3 rounded-xl">{icon}</div>
      <div>
        <p className="text-sm opacity-60">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function FeedbackCard({ feedback: fb, index }) {
  const statusIcon =
    fb.logical_correctness === "correct" ? (
      <CheckCircle size={16} className="text-success" />
    ) : fb.logical_correctness === "partially_correct" ? (
      <AlertCircle size={16} className="text-warning" />
    ) : (
      <XCircle size={16} className="text-error" />
    );

  const scoreBadgeClass =
    fb.logical_score >= 70
      ? "badge-success"
      : fb.logical_score >= 40
        ? "badge-warning"
        : "badge-error";

  return (
    <div className="bg-base-100 rounded-xl p-4 space-y-2">
      {/* Question */}
      <p className="text-xs font-semibold opacity-50 uppercase tracking-wide">
        Q{index + 1}
      </p>
      <p className="text-sm font-medium opacity-90 line-clamp-3">{fb.question}</p>

      {/* User Answer */}
      <div className="bg-base-200 rounded-lg px-3 py-2">
        <p className="text-xs opacity-50 mb-1">Your Answer</p>
        <p className="text-sm italic opacity-80">"{fb.userAnswer}"</p>
      </div>

      {/* Feedback row */}
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0">{statusIcon}</span>
        <p className="text-sm opacity-70">{fb.feedback}</p>
      </div>

      {/* Score + confidence */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <span className={`badge badge-sm ${scoreBadgeClass}`}>
          Score: {fb.logical_score}%
        </span>
        <span className="badge badge-sm badge-ghost capitalize">
          {fb.logical_correctness?.replace("_", " ")}
        </span>
        <span className="badge badge-sm badge-ghost opacity-60">
          Confidence: {fb.confidence}
        </span>
      </div>
    </div>
  );
}

function HintCard({ hint }) {
  return (
    <div className="flex items-start gap-3 bg-base-100 rounded-xl px-4 py-3">
      <Lightbulb size={15} className="text-warning mt-0.5 shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="badge badge-sm badge-warning badge-outline">{hint.topic}</span>
          <span className="text-xs opacity-50 flex items-center gap-1">
            <Hash size={11} />
            Hint {hint.hintId}
          </span>
        </div>
        <p className="text-sm opacity-80">{hint.hintText}</p>
        {hint.timestamp && (
          <p className="text-xs opacity-40 mt-1 flex items-center gap-1">
            <Clock size={11} />
            {new Date(hint.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

function TranscriptMessage({ msg }) {
  const isAgent = msg.speaker === "Agent";
  return (
    <div className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isAgent
          ? "bg-primary text-primary-content"
          : "bg-secondary text-secondary-content"
          }`}
      >
        {isAgent ? "AI" : "You"}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isAgent ? "bg-base-200" : "bg-primary/10"
          }`}
      >
        <p className="leading-relaxed">{msg.text}</p>
        {msg.timestamp && (
          <p className="text-xs opacity-40 mt-1 text-right">{msg.timestamp}</p>
        )}
      </div>
    </div>
  );
}
