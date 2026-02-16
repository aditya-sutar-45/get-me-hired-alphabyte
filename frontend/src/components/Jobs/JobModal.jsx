import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

function JobModal({ job }) {
  const darkTheme = useTheme();
  const navigate = useNavigate();

  const { user } = useAuth();

  const handleConfirm = async () => {
    try {
      // Request fullscreen mode
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        // Safari support
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        // IE11 support
        await elem.msRequestFullscreen();
      }
    } catch (error) {
      console.error("Error entering fullscreen:", error);
    }

    // Navigate to interview page
    navigate(`/interview/${job.id}`, {
      state: {
        jobData: {
          job_id: job.id,
          companyName: job.company_name,
          title: job.title,
          description: job.description,
          languages: job.languages,
          custom_interview: job.custom_interview,
          namespace: job.id,
        },
      },
    });
  };

  return (
    <dialog id={`modal_${job.id}`} className="modal">
      <div className="modal-box w-[60vw]">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h1 className="text-3xl font-space-mono">Interview Details</h1>
        <div className="divider"></div>
        <div className="m-2 font-work-sans">
          <h2 className="text-xl">
            Company Name: <span className="font-bold">{job.company_name}</span>
          </h2>
          <h2 className="text-xl">
            Job Title: <span className="font-bold">{job.title}</span>
          </h2>
          <p className="text-md my-2">
            Job Description:
            <br /> {job.description}
          </p>

          <h1 className="font-bold">Languages:</h1>
          {job.languages.map((lang, i) => (
            <div
              className={`mr-2 my-2 badge ${darkTheme ? "text-warning badge-primary" : "badge-neutral badge-soft"}`}
              key={i}
            >
              {lang}
            </div>
          ))}
          <button
            className="btn btn-success w-full my-2"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default JobModal;
