import type { Job } from "./types";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const getAllJobs = async (): Promise<Job[]> => {
  const res = await fetch(`${BASE_URL}/jobs`)
  if (!res.ok) {
    throw new Error("Failed to fetch jobs")
  }
  return res.json()
}

export const getJobByID = async (id: string): Promise<Job> => {
  const res = await fetch(`${BASE_URL}/jobs/${id}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch job with id: ${id}`)
  }
  return res.json()
}
