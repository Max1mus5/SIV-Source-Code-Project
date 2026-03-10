import { Hero } from "@/components/hero"
import { SectionHeader } from "@/components/section-header"
import { ArticleCard } from "@/components/article-card"
import { apiFetch } from "@/lib/api"
import type { Post } from "@/lib/types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

function getImageUrl(path?: string) {
  if (!path) return '/images/game-design-document.jpg'
  if (path.startsWith('http')) return path
  return `${BASE_URL}${path}`
}

async function getRecentPosts(): Promise<Post[]> {
  try {
    const res = await apiFetch<{ data: Post[] }>('/post/feed')
    return res?.data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const posts = await getRecentPosts()

  const temasPosts = posts.slice(0, 4)
  const proyectosPosts = posts.slice(4, 8)

  const fallbackArticles = [
    { title: "Diseño", image: "/images/game-design-document.jpg", author: "SIV", date: "", readTime: "5 Min Read", href: "/blogs" },
    { title: "Programacion", image: "/images/programacion-csharp.jpg", author: "SIV", date: "", readTime: "5 Min Read", href: "/blogs" },
    { title: "Animaciones CSS", image: "/images/animated-toggle.jpg", author: "SIV", date: "", readTime: "3 Min Read", href: "/blogs" },
    { title: "Juegos con React", image: "/images/tic-tac-toe.jpg", author: "SIV", date: "", readTime: "5 Min Read", href: "/blogs" },
  ]

  const toArticle = (post: Post) => ({
    title: post.title,
    image: getImageUrl(post.post_image),
    author: post.autor?.name ?? 'SIV',
    date: post.createdAt ? new Date(post.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    readTime: '5 Min Read',
    href: `/blogs/${post.hash}/${post.autor_id}`,
    category: post.category?.category_name,
  })

  const temasArticles = temasPosts.length > 0 ? temasPosts.map(toArticle) : fallbackArticles
  const proyectosArticles = proyectosPosts.length > 0 ? proyectosPosts.map(toArticle) : [
    { title: "TOP-DOWN RPG", image: "/images/top-down-rpg.jpg", author: "SIV", date: "", readTime: "2 Min Read", href: "/blogs" },
    { title: "PLATAFORMAS 2D", image: "/images/plataformas-2d.jpg", author: "SIV", date: "", readTime: "5 Min Read", href: "/blogs" },
    { title: "Animaciones CSS", image: "/images/animated-toggle.jpg", author: "SIV", date: "", readTime: "2 Min Read", href: "/blogs" },
    { title: "Juegos con React", image: "/images/tic-tac-toe.jpg", author: "SIV", date: "", readTime: "2 Min Read", href: "/blogs" },
  ]
  return (
    <div className="min-h-screen">
      <Hero />

      {/* Temas Y Ramas */}
      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <SectionHeader title="Temas Y Ramas" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {temasArticles.map((article, i) => (
            <ArticleCard key={i} {...article} />
          ))}
        </div>
      </section>

      {/* Proyectos */}
      <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
        <SectionHeader title="Proyectos" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {proyectosArticles.map((article, i) => (
            <ArticleCard key={i} {...article} />
          ))}
        </div>
      </section>
    </div>
  )
}
