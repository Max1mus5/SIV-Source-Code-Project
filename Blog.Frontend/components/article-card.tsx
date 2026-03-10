import Image from "next/image"
import Link from "next/link"
import { Clock } from "lucide-react"

interface ArticleCardProps {
  title: string
  image: string
  author: string
  date: string
  readTime: string
  href?: string
  category?: string
}

export function ArticleCard({
  title,
  image,
  author,
  date,
  readTime,
  href = "#",
  category,
}: ArticleCardProps) {
  return (
    <Link href={href} className="group block">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(5,242,155,0.15)] hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {category && (
            <span className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-primary text-xs font-medium px-2 py-1 rounded-full">
              {category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-sm font-bold text-card-foreground leading-snug group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Author info */}
          <div className="mt-auto flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/10">
                <span className="text-xs font-bold text-primary">
                  {author.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-primary">{author}</span>
                <span className="text-[10px] text-muted-foreground">{date}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{readTime}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
