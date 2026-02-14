import type { CompanyRegisterPayload, LoginPayload, UserRegisterPayload } from "./types"

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const registerUser = async (u: UserRegisterPayload) => {
  const formData = new FormData();

  formData.append("username", u.username);
  formData.append("email", u.email);
  formData.append("password", u.password);
  if (u.resumeFile === null) {
    throw new Error("No attached resume")
  }
  formData.append("resume", u.resumeFile);
  formData.append("role", "user")

  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to register user");
  }

  return res;
}

export const registerCompany = async (c: CompanyRegisterPayload) => {
  const formData = new FormData();

  formData.append("username", c.username);
  formData.append("email", c.email);
  formData.append("password", c.password);
  formData.append("company_name", c.company_name)
  formData.append("company_website", c.company_website);
  formData.append("company_description", c.company_description);

  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to register company")
  }

  return res;
}

export const loginHelper = async (l: LoginPayload) => {
  const username = l.username;
  const password = l.password;

  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  return res
}

export const fetchUserHelper = async () => {
  const res = await fetch(`${BASE_URL}/user`, {
    method: "GET",
    credentials: "include",
  });

  return res;
}
