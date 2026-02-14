import { Link, NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "./mode-toggle"

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" }
  ]

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-lg font-semibold tracking-tight mr-2">
          Get-Me-Hired
        </Link>

        <div className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to={"/auth/register"}>
            <Button size="sm">Register</Button>
          </Link>
          <ModeToggle />
        </div>

        {/* Mobile Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 pb-4">
          <div className="flex flex-col gap-4 pt-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                {item.name}
              </NavLink>
            ))}
            <Link to={"/auth/register"}>
              <Button size="sm">Login</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
