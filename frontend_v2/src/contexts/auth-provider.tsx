import { fetchUserHelper, loginHelper, registerCompany, registerUser } from "@/pages/auth/auth";
import type { Company, CompanyRegisterPayload, LoginPayload, User, UserRegisterPayload } from "@/pages/auth/types";
import { createContext, useEffect, useState, type ReactNode } from "react";

type AuthContextType = {
  user: User | Company | null
  fetchUser: () => Promise<void>
  registerAsUser: (u: UserRegisterPayload) => Promise<void>
  registerAsCompany: (c: CompanyRegisterPayload) => Promise<void>
  login: (l: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  authError: string
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | Company | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");

  const fetchUser = async () => {
    setLoading(true)
    setAuthError("")
    try {
      const res = await fetchUserHelper()
      if (res.status === 401) {
        setUser(null)
        return;
      }

      const data = await res.json();
      setUser(data)
    } catch (err) {
      console.error("ERROR FETCHING: ", err)

      if (err instanceof Error) {
        setAuthError(err.message)
      } else {
        setAuthError("Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const registerAsUser = async (u: UserRegisterPayload) => {
    setLoading(true);
    setAuthError("");

    try {
      const res = await registerUser(u)

      const data: User = await res.json()
      const loginPayload: LoginPayload = {
        username: u.username,
        password: u.password,
      }

      console.log("REGISTERED USER: ", data)

      await login(loginPayload)
    } catch (err) {
      console.error("ERROR REGISTERING: ", err)
      if (err instanceof Error) {
        setAuthError(err.message)
      } else {
        setAuthError("Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  const registerAsCompany = async (c: CompanyRegisterPayload) => {
    setLoading(true)
    setAuthError("")

    try {
      const res = await registerCompany(c)

      const data = await res.json()
      const loginPayload: LoginPayload = {
        username: c.username,
        password: c.password,
      }
      console.log("REGISTERED COMPANY: ", data)
      await login(loginPayload);
    } catch (err) {
      console.error("ERROR REGISTERING: ", err)
      if (err instanceof Error) {
        setAuthError(err.message)
      } else {
        setAuthError("Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (l: LoginPayload) => {
    setLoading(true)
    setAuthError("")
    try {
      const res = await loginHelper(l);
      const data = await res.json();
      if (res.ok) {
        await fetchUser();
      } else {
        setAuthError("incorrect username / password")
        console.log(data)
        throw new Error("invalid username / password")
      }
    } catch (err) {
      console.error("ERROR LOGING IN: ", err)
      if (err instanceof Error) {
        setAuthError(err.message)
      } else {
        setAuthError("Something went wrong")
      }

      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setAuthError("");
    setLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/logout`, {
        method: "GET",
        credentials: "include",
      });
      setUser(null);
    } catch (err) {
      console.error("ERROR LOGING OUT: ", err)
      if (err instanceof Error) {
        setAuthError(err.message)
      } else {
        setAuthError("Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      fetchUser,
      registerAsUser,
      registerAsCompany,
      login,
      logout,
      loading,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  )
}

