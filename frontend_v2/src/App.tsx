import { RouterProvider } from "react-router-dom"
import { router } from "./routes/router"
import { ThemeProvider } from "./contexts/theme-provider"
import { AuthProvider } from "./contexts/auth-provider"

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

