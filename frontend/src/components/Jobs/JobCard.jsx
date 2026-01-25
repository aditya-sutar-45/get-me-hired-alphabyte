import { Info } from "lucide-react";
// import { useTheme } from "../../contexts/ThemeContext";
// import { useNavigate } from "react-router-dom";
import JobModal from "./JobModal";


function JobCard({ job }) {
  // const darkTheme = useTheme();
  // const navigate = useNavigate();


  return (
    <div className="card bg-base-100 w-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-work-sans border border-base-300">


      {/* <figure className="h-[12vh] overflow-hidden">
        <img
          src="https://img.freepik.com/premium-vector/business-meeting-discussion-man-woman-office-table-vector-illustration_107641-425.jpg?semt=ais_hybrid&w=740&q=80"
          alt="Company"
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
      </figure> */}
      <div className="card-body p-6">
        <div className="mb-2">
          <h2 className="card-title text-2xl font-bold font-space-mono text-primary mb-1">
            {job.company_name}
          </h2>
          <h3 className="text-lg font-semibold text-base-content/80 mb-3">{job.title}</h3>
        </div>


        {job.location && (
          <p className="text-sm text-base-content/60 mb-3 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </p>
        )}


        <div className="flex gap-2 flex-wrap mb-4">
          {job.languages && job.languages.slice(0, 3).map((lang, i) => (
            <div
              className="badge badge-outline badge-primary"
              key={i}
            >
              {lang}
            </div>
          ))}
          {job.languages && job.languages.length > 3 && (
            <div className="badge badge-ghost">+{job.languages.length - 3}</div>
          )}
        </div>



        <div className="card-actions justify-end mt-auto">
          <button
            className="btn btn-primary w-full hover:btn-secondary transition-colors duration-300"
            onClick={() =>
              document.getElementById(`modal_${job.id}`).showModal()
            }
          >
            <span>Start Interview</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <JobModal job={job} />
        </div>
      </div>
    </div>
  );
}


export default JobCard;
