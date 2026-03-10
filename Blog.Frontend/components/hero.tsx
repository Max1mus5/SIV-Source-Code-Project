import Link from "next/link"
import { ArrowRight, Gamepad2 } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex flex-col items-center px-4 pb-16 pt-12 md:pb-24 md:pt-20 overflow-hidden">
      {/* Decorative dots */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse" />
      <div className="absolute top-40 right-20 w-3 h-3 bg-primary/50 rounded-full animate-pulse delay-300" />
      <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse delay-700" />
      <div className="absolute top-32 left-1/3 w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse delay-500" />
      <div className="absolute top-16 right-1/3 w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-1000" />
      <div className="absolute bottom-32 right-1/4 w-1 h-1 bg-primary/50 rounded-full animate-pulse delay-200" />
      <div className="absolute bottom-10 right-12 w-2.5 h-2.5 bg-primary/20 rounded-full animate-pulse delay-600" />

      {/* Grid mesh overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(5,242,155,1) 1px, transparent 1px), linear-gradient(90deg, rgba(5,242,155,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main title */}
      <h1 className="animate-fade-in max-w-3xl text-center text-3xl font-bold italic leading-tight text-primary md:text-5xl lg:text-6xl text-balance drop-shadow-[0_0_30px_rgba(5,242,155,0.3)]">
        Semillero de investigación en videojuegos y gamificación
      </h1>

      {/* Description box */}
      <div className="animate-fade-in [animation-delay:200ms] [animation-fill-mode:both] mt-10 max-w-2xl rounded-2xl border border-primary/30 bg-card/50 backdrop-blur-sm px-6 py-5 text-center md:mt-14 md:px-10 md:py-7 glow-primary-sm">
        <p className="text-sm leading-relaxed text-foreground md:text-base">
          {"En "}
          <span className="font-bold text-primary">SIV</span>
          {", nos apasiona explorar las infinitas posibilidades que ofrecen los "}
          <span className="font-bold text-primary">videojuegos</span>
          {" y la "}
          <span className="font-bold text-primary">gamificación</span>
          {". Nuestro principal objetivo es fomentar la creatividad, el trabajo en equipo y el aprendizaje a través del desarrollo y la experimentación en este emocionante campo."}
        </p>
      </div>

      {/* CTAs */}
      <div className="animate-fade-in [animation-delay:400ms] [animation-fill-mode:both] mt-8 flex flex-col sm:flex-row gap-4">
        <Link
          href="/blogs"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
        >
          Explorar Blog
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/sobre-nosotros"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card/50 px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-primary hover:text-primary"
        >
          <Gamepad2 className="h-4 w-4" />
          Conoce al Equipo
        </Link>
      </div>
    </section>
  )
}
