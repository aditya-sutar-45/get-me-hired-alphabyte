import { ArrowRight, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getJobsByCompany } from "../api/api";
import { BACKEND_BASE_URL } from "../constants";

function Company() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["companyJobs"],
    queryFn: getJobsByCompany,
  });

  const allJobs = data || [];

  const deleteMutation = useMutation({
    mutationFn: async (jobID) => {
      const res = await fetch(`${BACKEND_BASE_URL}/jobs/${jobID}`, {
        method: "DELETE",
        credentials: "include",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["companyJobs"]);
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-2xl font-space-mono animate-pulse">
          Loading opportunities...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-2xl font-space-mono text-error">
          Error loading jobs. Please try again.
        </p>
      </div>
    );

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Job Listings</h1>
          <p className="text-base text-gray-500 mt-1">
            Manage & track all jobs posted by your company
          </p>
        </div>

        <button
          onClick={() => navigate("/job/create")}
          className="btn btn-primary gap-2"
        >
          Create Job <ArrowRight size={18} />
        </button>
      </div>

      {/* Job Grid */}
      {allJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-xl font-medium text-gray-500">
            You haven’t posted any jobs yet.
          </p>
          <button
            onClick={() => navigate("/job/create")}
            className="btn btn-primary mt-4"
          >
            Post Your First Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {allJobs.map((job) => (
            <div
              key={job.id}
              className="card bg-base-100 w-full shadow-md hover:shadow-2xl 
              transition-all duration-300 border border-base-200 hover:-translate-y-1 rounded-xl"
            >

              <div className="card-body p-6">
                <h2 className="text-xl font-bold font-space-mono text-primary mb-1 flex justify-between">
                  {job.company_name}
                  <button className="btn btn-primary btn-soft btn-sm" onClick={() => navigate(`/company/kb/${job.id}`)}>Explore Knowledge Base</button>
                </h2>
                <h3 className="text-lg font-semibold text-base-content/80 mb-3">
                  {job.title}
                </h3>

                {job.location && (
                  <p className="text-sm text-base-content/60 mb-4">
                    📍 {job.location}
                  </p>
                )}

                <div className="flex gap-2 flex-wrap mb-5">
                  {job.languages && job.languages.slice(0, 3).map((lang, i) => (
                    <span
                      className="badge badge-primary badge-outline"
                      key={i}
                    >
                      {lang}
                    </span>
                  ))}

                  {job.languages && job.languages.length > 3 && (
                    <span className="badge badge-ghost">
                      +{job.languages.length - 3}
                    </span>
                  )}
                </div>

                <button
                  className="btn btn-error btn-outline w-full gap-2 font-medium"
                  onClick={() => deleteMutation.mutate(job.id)}
                  disabled={deleteMutation.isLoading}
                >
                  <Trash2 size={18} />
                  {deleteMutation.isLoading ? "Deleting..." : "Delete Job"}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Company;

