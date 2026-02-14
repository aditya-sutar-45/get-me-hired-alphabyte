import { RouterProvider } from "react-router-dom"
import { router } from "./routes/router"
import { ThemeProvider } from "./contexts/theme-provider"

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

