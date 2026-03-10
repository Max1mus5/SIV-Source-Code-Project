"use client"

import Link from "next/link"
import { Gamepad2, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center mb-4 glow-primary-sm">
          <Gamepad2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">¿Olvidaste tu contraseña?</h1>
        <p className="text-muted-foreground mt-2 text-center">Contacta a un administrador para recuperar tu cuenta</p>
      </div>

      <div className="glass border border-border rounded-2xl p-8 glow-primary-sm flex flex-col gap-5 items-center text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Mail className="w-7 h-7 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          En este momento la recuperación de contraseña se gestiona de forma manual. Escríbenos a{" "}
          <span className="text-foreground font-medium">siv@utp.edu.co</span> con tu nombre de usuario y te ayudaremos a recuperar el acceso.
        </p>
        <Link
          href="/login"
          className="text-primary hover:underline font-medium text-sm"
        >
          Volver a Iniciar Sesión
        </Link>
      </div>
    </div>
  )
}
