import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface SectionHeaderProps {
  title: string
  href?: string
}

export function SectionHeader({ title, href = "/blogs" }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-foreground md:text-2xl lg:text-3xl">{title}</h2>
        <div className="hidden h-0.5 w-16 bg-gradient-to-r from-primary to-transparent sm:block rounded-full" />
      </div>
      <Link
        href={href}
        className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Ver Todos
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  )
}
