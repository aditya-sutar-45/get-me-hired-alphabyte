import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserRegisterForm } from "./components/UserRegisterForm"
import { CompanyRegisterForm } from "./components/CompanyRegisterForm"

type Role = "user" | "company" | "admin"

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("user")

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full h-[85vh] max-w-lg bg-base text-secondary-foreground">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Create an Account
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col h-full">
          <div className="flex gap-2 w-full">
            <Button
              variant={role === "user" ? "outline" : "ghost"}
              className="flex-1"
              onClick={() => setRole("user")}
            >
              User
            </Button>

            <Button
              variant={role === "company" ? "outline" : "ghost"}
              className="flex-1"
              onClick={() => setRole("company")}
            >
              Company
            </Button>
          </div>

          {/* Form container */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full">
              {role === "user" ? (
                <UserRegisterForm />
              ) : (
                <CompanyRegisterForm />
              )}
            </div>
          </div>
        </CardContent>

      </Card>
    </div>
  )
}
