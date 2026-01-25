import { useParams } from "react-router-dom";
import { getUserByUsername } from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => getUserByUsername(username),
  });

  const [showResume, setShowResume] = useState(false);

  if (error)
    return (
      <h1 className="flex justify-center items-center min-h-screen">
        error!: {error}
      </h1>
    );
  if (isLoading)
    return (
      <h1 className="flex justify-center items-center min-h-screen">Loading</h1>
    );

  return (
    <>
      {
        data.role === "company" ? (
          <div className="flex justify-center items-center min-h-screen bg-base-200 font-work-sans">
            <div className="w-full max-w-2xl mx-auto p-8 bg-base-100 rounded-lg shadow-2xl space-y-6">

              {/* Company Header */}
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-32 rounded-full ring-4 ring-primary bg-base-300 flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-base-content opacity-40"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4h12v12H4V4zm2 2v8h8V6H6z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-primary font-mono">
                  {data.company_name}
                </h1>

                <p className="text-sm text-base-content/70">{data.email}</p>

                <a
                  href={`https://${data.comapny_website}`}
                  target="_blank"
                  className="text-primary underline font-semibold hover:text-primary/80"
                >
                  {data.comapny_website}
                </a>
              </div>

              {/* Company Description */}
              <div className="p-4 border border-base-300 rounded-lg bg-base-200">
                <h2 className="text-xl font-bold mb-2 font-space-mono">
                  About the Company
                </h2>

                <p className="leading-relaxed font-work-sans">
                  {data.company_description || "No description available."}
                </p>
              </div>

            </div>
          </div>
        ) :
          (

            <div className="flex justify-center items-center min-h-screen bg-base-200  font-work-sans">
              <div className="w-full max-w-2xl mx-auto p-8 bg-base-100 rounded-lg shadow-2xl">
                <div className="text-center space-y-4">
                  {/* THIS IS THE PLACEHOLDER - Profile Picture */}
                  <div className="flex justify-center mb-4">
                    <div className="w-32 h-32 rounded-full ring-4 ring-primary bg-base-300 flex items-center justify-center">
                      <svg
                        className="w-20 h-20 text-base-content opacity-40"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-primary font-mono">
                    {data.username}
                  </h1>
                  <h2 className="text-base">{data.email}</h2>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setShowResume((prev) => !prev)}
                    className="w-full flex justify-between items-center text-primary-content font-bold bg-primary px-4 py-2 rounded-md font-work-sans hover:bg-primary/90 transition"
                  >
                    <span>Resume Details:</span>
                    {showResume ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  <AnimatePresence>
                    {showResume && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden mt-4"
                      >
                        <div className="p-4 border border-base-300 rounded-lg bg-base-200">
                          <div className="prose prose-headings:font-space-mono prose-stone prose-lead:font-work-sans h-80 overflow-y-auto">
                            <ReactMarkdown>
                              {data?.parsed_resume || "No resume available."}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/*
        {user._id === data._id && (
          <fieldset className="fieldset w-full mt-4 flex flex-col items-center">
            <legend className="fieldset-legend w-full flex-col items-center">Upload Resume</legend>
            <input type="file" className="file-input" />
            <label className="label">format: pdf</label>
          </fieldset>
        )}
        */}
              </div>
            </div>
          )
      }</>
  );
}

export default ProfilePage;
