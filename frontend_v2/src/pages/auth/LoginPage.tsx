import { useForm } from "react-hook-form"
import type { LoginPayload } from "./types"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
  const { login, loading, authError } = useAuth()
  const navigate = useNavigate()

  const form = useForm<LoginPayload>({
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginPayload) {
    try {
      await login(values)

      navigate("/")
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full bg-background max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Auth Error */}
              {authError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {authError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                rules={{ required: "Username is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your_username"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
