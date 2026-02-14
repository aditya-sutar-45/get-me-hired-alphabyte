export type UserRegisterPayload = {
  username: string
  email: string
  password: string
  resumeFile: File | null
}

export type CompanyRegisterPayload = {
  username: string
  email: string
  password: string
  company_name: string
  company_website: string
  company_description: string
}

export type LoginPayload = {
  username: string
  password: string
}

export type User = {
  id: string
  created_at: string
  updated_at: string
  role: "user" | "admin"
  username: string
  email: string
  resume_path: string
  parsed_resume: string
}

export type Company = {
  id: string
  created_at: string
  updated_at: string
  role: "company"
  username: string
  email: string
  company_name: string
  company_website: string
  company_description: string
}

