"use client"

import Link from "next/link"
import { Search, Gamepad2, LogOut, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/blogs", label: "Blog" },
    { href: "/sobre-nosotros", label: "Sobre Nosotros" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary">
            <Gamepad2 className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-primary">SIV</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-primary"
                  : "text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </button>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link 
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <User className="h-4 w-4" />
                {user?.name || user?.username}
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2 text-sm font-bold text-destructive-foreground transition-all hover:scale-105 hover:shadow-lg hover:shadow-destructive/25"
              >
                <Gamepad2 className="h-4 w-4" />
                Únete Al Equipo
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`h-0.5 w-6 bg-foreground transition-transform ${mobileMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 bg-foreground transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-foreground transition-transform ${mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${mobileMenuOpen ? 'max-h-96 border-t border-border' : 'max-h-0'} bg-background/95 backdrop-blur px-4`}
      >
        <nav className="flex flex-col gap-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-border">
            {isAuthenticated ? (
              <>
                <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  {user?.name}
                </span>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false) }}
                  className="flex w-fit items-center gap-1.5 text-sm font-medium text-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-destructive px-5 py-2 text-sm font-bold text-destructive-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Gamepad2 className="h-4 w-4" />
                  Únete Al Equipo
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
