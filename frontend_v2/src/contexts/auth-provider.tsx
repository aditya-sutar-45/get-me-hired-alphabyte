import { fetchUser, login, registerCompany, registerUser } from "@/pages/auth/auth";
import type { Company, User } from "@/pages/auth/types";
import { createContext, useEffect, useState, type ReactNode } from "react";

type AuthContextType = {
  user: User | Company | null
  loading: boolean
  authError: string
  fetchUser: typeof fetchUser
  login: typeof login
  registerUser: typeof registerUser
  registerCompany: typeof registerCompany
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | Company | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");


  useEffect(() => {
    const f = async () => {
      setLoading(true)
      setAuthError("")
      try {
        const res = await fetchUser()
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
      }
    }

    f()
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      fetchUser,
      registerUser,
      registerCompany,
      login,
      loading,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  )
}

