import { useQuery } from "@tanstack/react-query";
import JobCard from "../components/Jobs/JobCard";
import { Search, Briefcase } from "lucide-react";
import { getJobs } from "../api/api";
import { useState } from "react";

function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: getJobs,
  });

  const allJobs = data;

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl font-space-mono animate-pulse">
          Loading opportunities...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl font-space-mono text-error">
          Error loading jobs. Please try again.
        </div>
      </div>
    );

  return (
    <div className="min-h-screen relative">
      {/* Global Animated Grid Background */}
      <div className="fixed inset-0 h-full w-full -z-10 bg-base-200">
        <div 
          className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#4f4f4f18_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f18_1px,transparent_1px)] bg-[size:40px_40px]"
          style={{
            animation: 'gridFlow 30s linear infinite',
          }}
        ></div>
      </div>

      {/* Header with Grid Background */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-space-mono text-base-content">
                Job Opportunities
              </h1>
              <p className="text-sm text-base-content/70 font-work-sans mt-1">
                {allJobs.length} positions available
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-base-100 rounded-lg shadow-xl p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Main Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="search"
                  placeholder="Job title, skills, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full pl-12 bg-base-100 focus:outline-primary font-work-sans"
                />
              </div>

              {/* Search Button */}
              <button className="btn btn-primary gap-2 px-8 font-work-sans">
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Job Cards Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allJobs.map((job, i) => (
            <JobCard key={job.id || i} job={job} />
          ))}
        </div>

        {/* Empty State */}
        {allJobs.length === 0 && (
          <div className="bg-base-100 rounded-lg shadow-md text-center py-20 px-4">
            <div className="max-w-md mx-auto">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-base-content mb-2 font-space-mono">
                No jobs found
              </h3>
              <p className="text-base-content/60 mb-6 font-work-sans">
                We couldn't find any positions matching your criteria. Try adjusting your search terms.
              </p>
              <button className="btn btn-primary font-work-sans">
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {allJobs.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="join">
              <button className="join-item btn btn-sm">«</button>
              <button className="join-item btn btn-sm btn-active">1</button>
              <button className="join-item btn btn-sm">2</button>
              <button className="join-item btn btn-sm">3</button>
              <button className="join-item btn btn-sm">»</button>
            </div>
          </div>
        )}
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes gridFlow {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(40px, 40px);
          }
        }
      `}</style>
    </div>
  );
}

export default Jobs;
