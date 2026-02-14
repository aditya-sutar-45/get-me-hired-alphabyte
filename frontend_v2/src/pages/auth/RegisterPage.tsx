import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserRegisterForm } from "./components/UserRegisterForm"
import { CompanyRegisterForm } from "./components/CompanyRegisterForm"

type Role = "user" | "company" | "admin"

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("user")

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Create an Account
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={role === "user" ? "outline" : "secondary"}
              className="flex-1"
              onClick={() => setRole("user")}
            >
              User
            </Button>

            <Button
              variant={role === "company" ? "outline" : "secondary"}
              className="flex-1"
              onClick={() => setRole("company")}
            >
              Company
            </Button>
          </div>

          {role === "user" ? (
            <UserRegisterForm />
          ) : (
            <CompanyRegisterForm />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
