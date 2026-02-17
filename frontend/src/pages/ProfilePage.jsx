import { useParams } from "react-router-dom";
import { getUserByUsername } from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, BarChart3, Brain, Lightbulb, FileText } from "lucide-react";
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

  useEffect(() => {

    const fetchSessions = async () => {

      try {

        const res = await fetch(`${BACKEND_BASE_URL}/interview`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        setSessionData(data);

      } catch (err) {
        console.error(err);
      }

    };

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

            {/* Avatar */}

            <div className="w-28 h-28 rounded-full bg-primary text-primary-content flex items-center justify-center text-4xl font-bold shadow-lg">

              {data.username?.charAt(0).toUpperCase()}

            </div>


            {/* Info */}

            <div className="flex-1 text-center md:text-left">

              <h1 className="text-3xl font-bold font-mono">

                {data.username}

              </h1>

              <p className="opacity-70">

                {data.email}

              </p>

              <p className="text-sm opacity-50 mt-1">

                Interview Performance Dashboard

              </p>

            </div>


            {/* Score Highlight */}

            <div className="text-center">

              <p className="text-sm opacity-60">
                Avg Score
              </p>

              <p className="text-4xl font-bold text-primary">
                {avgScore}%
              </p>

            </div>

          </div>

        </div>



        {/* ANALYTICS */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">


          <Card
            icon={<BarChart3 />}
            label="Total Interviews"
            value={totalSessions}
          />

          <Card
            icon={<Brain />}
            label="Questions Answered"
            value={totalQuestions}
          />

          <Card
            icon={<FileText />}
            label="Avg Logical Score"
            value={`${avgScore}%`}
          />

          <Card
            icon={<Lightbulb />}
            label="Hints Used"
            value={totalHintsUsed}
          />

        </div>




        {/* RESUME */}

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

                  <ReactMarkdown>

                    {data.parsed_resume || "No Resume"}

                  </ReactMarkdown>

                </div>

              </motion.div>

            )}

          </AnimatePresence>

        </div>




        {/* INTERVIEW HISTORY */}

        <div className="bg-base-100 rounded-2xl shadow-xl p-6">

          <h2 className="text-xl font-bold mb-6">

            Interview History

          </h2>



          <div className="space-y-4">


            {sessionData.map(session => {

              const score =
                session.user_feedbacks?.length
                  ? (
                    session.user_feedbacks.reduce(
                      (acc, fb) => acc + fb.logical_score,
                      0
                    ) / session.user_feedbacks.length
                  ).toFixed(1)
                  : "N/A";


              return (

                <motion.div

                  key={session.id}

                  whileHover={{ scale: 1.02 }}

                  className="bg-base-200 p-5 rounded-xl shadow-sm hover:shadow-md transition"

                >

                  <div className="flex justify-between items-center">

                    <div>

                      <p className="font-bold">

                        Interview

                      </p>

                      <p className="text-sm opacity-60">

                        {session.id.slice(0, 8)}

                      </p>

                    </div>


                    <div className="text-right">

                      <p className="font-bold text-primary text-lg">

                        {score}%

                      </p>

                      <p className="text-xs opacity-60">

                        Avg Score

                      </p>

                    </div>

                  </div>


                  <div className="flex justify-between mt-4 text-sm opacity-70">

                    <span>

                      Questions: {session.user_feedbacks?.length || 0}

                    </span>


                    <span>

                      Hints: {session.hints_used?.length || 0}

                    </span>


                    <span>

                      {new Date(session.created_at).toLocaleDateString()}

                    </span>

                  </div>


                </motion.div>

              );

            })}


          </div>

        </div>


      </div>

    </div>

  );

}



export default ProfilePage;



function Card({ icon, label, value }) {

  return (

    <div className="bg-base-100 rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition">

      <div className="bg-primary/10 text-primary p-3 rounded-xl">

        {icon}

      </div>

      <div>

        <p className="text-sm opacity-60">

          {label}

        </p>

        <p className="text-2xl font-bold">

          {value}

        </p>

      </div>

    </div>

  );

}
