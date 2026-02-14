import { useNavigate } from "react-router-dom";
import type { Job } from "../types";

type ListViewProps = {
  jobs: Job[]
}

export default function ListView({ jobs }: ListViewProps) {
  const navigate = useNavigate()

  return (
    <div className="divide-y">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="px-4 py-3 hover:bg-muted/40 transition flex items-center justify-between gap-4"
          onClick={() => navigate(`/jobs/${job.id}`)}
        >
          {/* Left Section */}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate">
              {job.title}
            </h2>
            <p className="text-xs text-primary truncate">
              {job.company_name}
            </p>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex gap-1 flex-wrap max-w-[300px] justify-end">
              {job.languages.slice(0, 3).map((lang) => (
                <span
                  key={lang}
                  className="text-[10px] px-2 py-0.5 bg-muted rounded"
                >
                  {lang}
                </span>
              ))}
              {job.languages.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{job.languages.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
