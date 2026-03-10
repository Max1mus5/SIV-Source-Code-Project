import Link from "next/link"
import { Gamepad2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary glow-primary-sm group-hover:scale-105 transition-transform">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-primary">SIV</span>
            </Link>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Semillero de Investigación en Videojuegos y Gamificación &mdash; Universidad Tecnológica de Pereira
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {"Diseñado por"}
              <br />
              {"> Jeronimo Riveros"}
              <br />
              {"> Diego Rangel"}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Link href="#" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Twitter">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Instagram">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-primary" aria-label="LinkedIn">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </Link>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="text-sm font-bold uppercase text-primary">Categorías</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[
                { label: "Unity", href: "/blogs?cat=Unity" },
                { label: "C#", href: "/blogs?cat=Desarrollo" },
                { label: "Pixel Art", href: "/blogs?cat=Pixel+Art" },
                { label: "Gamificación", href: "/blogs?cat=Gamificaci%C3%B3n" },
                { label: "Tutoriales", href: "/blogs?cat=Tutoriales" },
                { label: "Diseño", href: "/blogs?cat=Dise%C3%B1o" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-foreground transition-colors hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sobre Nosotros */}
          <div>
            <h3 className="text-sm font-bold uppercase text-primary">Sobre Nosotros</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[
                { label: "El Equipo", href: "/sobre-nosotros" },
                { label: "Blog", href: "/blogs" },
                { label: "Contribuir", href: "/blogs/create" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-foreground transition-colors hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-bold uppercase text-primary">Contacto</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <Link href="tel:+573025276300" className="text-sm text-foreground transition-colors hover:text-primary">
                  +57 302 527 6300
                </Link>
              </li>
              <li>
                <Link href="mailto:j.riveros@utp.edu.co" className="text-sm text-foreground transition-colors hover:text-primary">
                  j.riveros@utp.edu.co
                </Link>
              </li>
            </ul>
          </div>

          {/* Síguenos */}
          <div>
            <h3 className="text-sm font-bold uppercase text-primary">Síguenos</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {["Instagram", "Twitter", "LinkedIn"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-foreground transition-colors hover:text-primary">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 <span className="text-primary font-medium">SIV</span>. Todos los derechos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Hecho con <span className="text-primary">&hearts;</span> en Colombia
          </p>
        </div>
      </div>
    </footer>
  )
}
