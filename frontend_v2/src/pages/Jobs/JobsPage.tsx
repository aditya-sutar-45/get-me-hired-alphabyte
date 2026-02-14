import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getAllJobs } from "./api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CardView from "./components/CardView"
import ListView from "./components/ListView"

export default function JobsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: getAllJobs,
  })

  const [view, setView] = useState<"card" | "list">("card")

  if (isLoading) return <div className="text-xl">Loading....</div>
  if (isError)
    return (
      <div className="text-xl text-destructive">
        {(error as Error).message}
      </div>
    )
  if (!data) return <div className="text-xl">no data....</div>

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Input placeholder="Search jobs..." className="md:max-w-sm" />

        <div className="flex gap-2">
          <Button
            variant={view === "card" ? "default" : "outline"}
            onClick={() => setView("card")}
          >
            Card View
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
          >
            List View
          </Button>
        </div>
      </div>

      {/* Jobs */}
      {view === "card" ? (
        <CardView jobs={data} />
      ) : (
        <ListView jobs={data} />
      )
      }
    </div >
  )
}
