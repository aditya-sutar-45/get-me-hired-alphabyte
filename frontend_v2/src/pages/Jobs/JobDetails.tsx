import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Code2,
  FileText,
  Calendar,
  PlayCircle
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { getJobByID } from "./api"
import { useQuery } from "@tanstack/react-query"
import { Separator } from "@/components/ui/separator"

export default function JobDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs", id],
    queryFn: () => getJobByID(id!),
    enabled: !!id,
  })

  if (isLoading)
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center text-muted-foreground">
        Loading job details...
      </div>
    )

  if (isError)
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center text-destructive">
        {(error as Error).message}
      </div>
    )

  if (!data)
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center text-muted-foreground">
        No job found.
      </div>
    )

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header Section */}
      <div className="space-y-6 border-b pb-6">

        {/* Title */}
        <div className="flex flex-col gap-4 items-start">
          <div className="flex items-center gap-3">
            <Briefcase className="h-7 w-7 text-muted-foreground shrink-0" />
            <h1 className="text-4xl font-bold tracking-tight text-primary leading-none">
              {data.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-lg text-muted-foreground mt-2">
            <Building2 className="h-4 w-4" />
            <span>{data.company_name}</span>
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code2 className="h-4 w-4" />
            Technologies
          </div>

          <div className="flex flex-wrap gap-2">
            {data.languages.map((lang) => (
              <Badge key={lang} variant="secondary">
                {lang}
              </Badge>
            ))}

            {data.custom_interview && (
              <Badge
                variant="outline"
                className="border-emerald-500 text-emerald-600"
              >
                Custom Interview
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content + Sidebar Layout */}
      <div className="grid md:grid-cols-3 gap-10">

        {/* Main Description */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">
                Job Description
              </h2>
            </div>
            <Separator className="my-1" />
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-[15px]">
              {data.description}
            </p>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-2 sticky top-24 shadow-sm">
            <Button
              size="lg"
              className="w-full bg-green-700 flex items-center justify-center"
              variant={"default"}
              onClick={() => navigate(`/interview/${data.id}`)}
            >
              <PlayCircle className="h-5 w-5" />
              Start Interview
            </Button>

            <Separator />

            <div className="text-sm text-muted-foreground space-y-4 pt-2">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Posted</span>
                </div>
                <span>
                  {new Date(data.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Last Updated</span>
                </div>
                <span>
                  {new Date(data.updated_at).toLocaleDateString()}
                </span>
              </div>

            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
