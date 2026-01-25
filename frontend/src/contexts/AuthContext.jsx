import { createContext, useContext, useEffect, useState } from "react";
import { BACKEND_BASE_URL } from "../constants";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const BASE_URL = BACKEND_BASE_URL

  async function fetchUser() {
    setAuthError("");
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        setUser(null);
        return;
      }

      if (!response.ok) throw new Error("failed to fetch user");

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function register(username, email, password, resume) {
    setLoading(true);
    setAuthError("");
    try {
      const formData = new FormData();

      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("resume", resume);
      formData.append("role", "user")

      const res = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError("failed to register");
      } else {
        await login(username, password);
      }

      return data;
    } catch (err) {
      setAuthError("something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function registerAsCompany(companyUsername, companyEmail, companyPassword, companyName, companyWebsite, companyDescription) {
    setLoading(true);
    setAuthError("");
    try {
      const formData = new FormData();

      formData.append("username", companyUsername);
      formData.append("email", companyEmail);
      formData.append("password", companyPassword);
      formData.append("company_name", companyName)
      formData.append("company_website", companyWebsite);
      formData.append("company_description", companyDescription);
      formData.append("role", "company")

      const res = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError("failed to register");
      } else {
        alert("registered as a company")
      }

      return data;
    } catch (err) {
      setAuthError("something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchUser();
      } else {
        setAuthError("incorrect username/ password");
      }
    } catch (err) {
      setAuthError("something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setAuthError("");
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/logout`, {
        method: "GET",
        credentials: "include",
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, register, registerAsCompany, login, logout, loading, authError }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
