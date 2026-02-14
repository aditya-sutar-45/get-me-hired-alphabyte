import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import type { Job } from "../types";
import { useNavigate } from "react-router-dom";

type CardViewProps = {
  jobs: Job[]
}

export default function CardView({ jobs }: CardViewProps) {
  const navigate = useNavigate()

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (

        <Card
          key={job.id}
          onClick={() => navigate(`/jobs/${job.id}`)}
          className="cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl border"
        >
          <CardHeader>
            <CardTitle>{job.title}</CardTitle>
            <p className="text-sm text-primary">
              {job.company_name}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm line-clamp-3">
              {job.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.languages.map((lang) => (
                <span
                  key={lang}
                  className="text-xs px-2 py-1 bg-muted rounded-md"
                >
                  {lang}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
