import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { TechCard } from "@/components/tech-card"

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-16">
          {/* Team Photo */}
          <div className="relative h-64 w-full max-w-md overflow-hidden rounded-2xl md:h-72 md:w-96 glow-primary-sm">
            <Image
              src="/images/team-photo.jpg"
              alt="Equipo SIV"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
          </div>

          {/* About Text */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold uppercase text-primary md:text-5xl lg:text-6xl drop-shadow-[0_0_30px_rgba(5,242,155,0.3)]">
              Sobre Nosotros
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-foreground md:text-base">
              {"En "}
              <span className="font-bold text-primary">SIV</span>
              {", nos apasiona explorar las infinitas posibilidades que ofrecen los "}
              <span className="font-bold">videojuegos</span>
              {" y la "}
              <span className="font-bold">gamificación</span>
              {". Nuestro principal objetivo es fomentar la creatividad, el trabajo en equipo y el aprendizaje a través del desarrollo y la experimentación en este emocionante campo."}
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-10 flex justify-center">
          <ChevronDown className="h-6 w-6 animate-bounce text-foreground" />
        </div>
      </section>

      {/* Gamificación Section */}
      <section className="border-y border-border bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl lg:text-4xl text-balance">
            El poder transformador de la <span className="text-primary">gamificación</span>
          </h2>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
          {/* Gamepad illustration */}
          <div className="flex h-44 w-44 flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-card/80 backdrop-blur-sm glow-primary-sm">
            <svg viewBox="0 0 120 80" className="h-28 w-28 text-primary" fill="none" stroke="currentColor" strokeWidth="3">
              {/* D-pad */}
              <rect x="15" y="25" width="12" height="30" rx="2" />
              <rect x="9" y="31" width="24" height="12" rx="2" />
              {/* Buttons */}
              <circle cx="80" cy="30" r="8" />
              <circle cx="100" cy="40" r="8" />
            </svg>
          </div>

          {/* Description */}
          <div className="max-w-xl">
            <p className="text-sm leading-relaxed text-foreground md:text-base">
              {"Creemos firmemente en el poder transformador de la gamificación. ¿Por qué? Porque puede impulsar la participación, fomentar el compromiso y facilitar el aprendizaje. Con la gamificación, convertimos tareas aparentemente monótonas en desafíos emocionantes, motivando a las personas."}
            </p>
          </div>
        </div>
      </section>

      {/* Tendencias Section */}
      <section className="border-y border-border bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl lg:text-4xl text-balance">
            Explorando las últimas <span className="text-primary">tendencias</span> en desarrollo de videojuegos
          </h2>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
          <div className="max-w-xl">
            <p className="text-sm leading-relaxed text-foreground md:text-base">
              {"Recientemente, tuvimos el privilegio de visitar la sede de Unity en Latinoamérica, una experiencia enriquecedora que amplió nuestro conocimiento sobre el desarrollo de videojuegos y las últimas tendencias en tecnología y diseño."}
            </p>
          </div>

          {/* Unity visit photo */}
          <div className="relative h-64 w-full max-w-lg overflow-hidden rounded-2xl md:h-72 glow-primary-sm">
            <Image
              src="/images/unity-visit.jpg"
              alt="Visita a Unity Latinoamérica"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* Innovación Section */}
      <section className="border-y border-border bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl lg:text-4xl text-balance">
            Nuestro compromiso con la <span className="text-primary">innovación</span>
          </h2>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-foreground md:text-base">
          {"En nuestro semillero, nos comprometemos a explorar nuevas ideas, experimentar con nuevas tecnologías y colaborar en proyectos innovadores que impulsen el campo de la gamificación. Estamos emocionados de compartir nuestro conocimiento y trabajar en equipo para llevar nuestras ideas a la vida."}
        </p>
      </section>

      {/* Herramientas Section */}
      <section className="border-t border-border bg-card/30 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="mb-12 text-center text-xl font-bold uppercase tracking-widest text-muted-foreground md:text-2xl">
            Algunas <span className="text-primary">herramientas</span> y tecnologías que usamos
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <TechCard name="Unity" icon="unity" />
            <TechCard name="Aseprite" icon="aseprite" />
            <TechCard name="C Sharp" icon="csharp" />
          </div>
        </div>
      </section>
    </div>
  )
}
