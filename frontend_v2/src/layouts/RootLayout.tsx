import { Outlet } from "react-router-dom"
import Navbar from "@/components/shared/Navbar"

export default function RootLayout() {
  return (
    <div className="h-screen w-screen m-0 p-0 flex flex-col">
      <Navbar />
      <main className="flex-1 h-[93vh]">
        <Outlet />
      </main>
    </div>
  )
}
