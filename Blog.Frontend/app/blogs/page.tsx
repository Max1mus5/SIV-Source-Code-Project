"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Clock, Heart, MessageSquare, Bookmark, Share2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"
import type { Post, Category } from "@/lib/types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

function getImageUrl(path?: string) {
  if (!path) return '/images/game-design-document.jpg'
  if (path.startsWith('http')) return path
  return `${BASE_URL}${path}`
}

function SkeletonCard() {
  return (
    <div className="glass border border-border rounded-2xl overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

const _mockBlogs = [
  {
    id: "1",
    title: "Introducción a Unity para principiantes: Tu primer videojuego",
    excerpt: "Una guía completa para comenzar en el desarrollo de videojuegos con Unity. Aprenderás desde la instalación hasta crear tu primer proyecto funcional.",
    image: "/images/game-design-document.jpg",
    author: {
      name: "Juan Pérez",
      username: "juanperez",
      avatar: "/images/team-photo.jpg",
    },
    category: "Unity",
    likes: 145,
    comments: 32,
    readTime: "8 min",
    date: "Mar 5, 2026",
    isTrending: true,
  },
  {
    id: "2",
    title: "Patrones de diseño en C# para desarrollo de juegos",
    excerpt: "Aprende los patrones más utilizados en la industria del gaming: Singleton, Observer, State Machine y más.",
    image: "/images/programacion-csharp.jpg",
    author: {
      name: "María García",
      username: "mariagarcia",
      avatar: "/images/team-photo.jpg",
    },
    category: "Desarrollo",
    likes: 98,
    comments: 18,
    readTime: "12 min",
    date: "Mar 3, 2026",
    isTrending: false,
  },
  {
    id: "3",
    title: "Creando animaciones fluidas con CSS para interfaces de juegos",
    excerpt: "Tips y trucos para mejorar la experiencia de usuario con transiciones y animaciones performantes.",
    image: "/images/animated-toggle.jpg",
    author: {
      name: "Carlos López",
      username: "carloslopez",
      avatar: "/images/team-photo.jpg",
    },
    category: "Diseño",
    likes: 76,
    comments: 14,
    readTime: "6 min",
    date: "Feb 28, 2026",
    isTrending: true,
  },
  {
    id: "4",
    title: "Construyendo un Tic-Tac-Toe con React: Tutorial paso a paso",
    excerpt: "Aprende React mientras construyes un juego clásico. Incluye lógica de juego, gestión de estado y diseño responsive.",
    image: "/images/tic-tac-toe.jpg",
    author: {
      name: "Ana Martínez",
      username: "anamartinez",
      avatar: "/images/team-photo.jpg",
    },
    category: "Tutoriales",
    likes: 203,
    comments: 45,
    readTime: "15 min",
    date: "Feb 25, 2026",
    isTrending: true,
  },
  {
    id: "5",
    title: "Desarrollo de RPGs Top-Down: Mecánicas esenciales",
    excerpt: "Explora las mecánicas fundamentales para crear tu propio RPG: sistemas de combate, inventario, diálogos y más.",
    image: "/images/top-down-rpg.jpg",
    author: {
      name: "Diego Rangel",
      username: "diegorangel",
      avatar: "/images/team-photo.jpg",
    },
    category: "Desarrollo",
    likes: 167,
    comments: 38,
    readTime: "20 min",
    date: "Feb 20, 2026",
    isTrending: false,
  },
  {
    id: "6",
    title: "Creación de plataformas 2D: De la idea al producto final",
    excerpt: "Un recorrido completo por el proceso de desarrollo de un juego de plataformas, desde el concepto hasta la publicación.",
    image: "/images/plataformas-2d.jpg",
    author: {
      name: "Jerónimo Riveros",
      username: "jeronimoriveros",
      avatar: "/images/team-photo.jpg",
    },
    category: "Gamificación",
    likes: 124,
    comments: 27,
    readTime: "18 min",
    date: "Feb 15, 2026",
    isTrending: false,
  },
]

export default function BlogsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [apiCategories, setApiCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [savedPosts, setSavedPosts] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, catsRes] = await Promise.allSettled([
          apiFetch<{ data: Post[] }>('/post/feed'),
          apiFetch<{ data: Category[] }>('/category/getCategory'),
        ])
        if (postsRes.status === 'fulfilled') {
          setPosts(postsRes.value?.data ?? [])
        }
        if (catsRes.status === 'fulfilled') {
          const catNames = (catsRes.value?.data ?? []).map((c) => c.category_name)
          setApiCategories(catNames)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const categories = ['Todos', ...apiCategories]

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.resume ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'Todos' || post.category?.category_name === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleSave = (id: string) => {
    setSavedPosts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleShare = async (post: Post) => {
    const url = `/blogs/${post.hash}/${post.autor_id}`
    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.resume ?? '', url })
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            <span className="text-gradient">Blog</span> & Artículos
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Explora contenido sobre desarrollo de videojuegos, gamificación y más
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar artículos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/80 border-border focus:border-primary"
            />
          </div>
          <Button
            variant="outline"
            className="border-border hover:border-primary md:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card/60 text-muted-foreground hover:text-foreground border border-border hover:border-primary hover:bg-card"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {isLoading ? (
          <div className="mb-10 glass border border-border rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <Skeleton className="h-64 md:h-80 w-full" />
              <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ) : filteredPosts.length > 0 && (
          <Link
            href={`/blogs/${filteredPosts[0].hash}/${filteredPosts[0].autor_id}`}
            className="block mb-10 group"
          >
            <div className="relative glass border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(5,242,155,0.1)]">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-80">
                  <Image
                    src={getImageUrl(filteredPosts[0].post_image)}
                    alt={filteredPosts[0].title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <span className="text-primary text-sm font-medium mb-2">
                    {filteredPosts[0].category?.category_name}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {filteredPosts[0].title}
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {filteredPosts[0].resume}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                        <span className="text-xs font-bold text-primary">
                          {(filteredPosts[0].autor?.name ?? 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span>{filteredPosts[0].autor?.name ?? 'Autor'}</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {filteredPosts[0].createdAt ? new Date(filteredPosts[0].createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filteredPosts.slice(1).map((post) => (
            <article
              key={post.id}
              className="glass border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(5,242,155,0.1)] group"
            >
              <Link href={`/blogs/${post.hash}/${post.autor_id}`}>
                <div className="relative h-48">
                  <Image
                    src={getImageUrl(post.post_image)}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 bg-card/90 text-foreground px-2 py-1 rounded-full text-xs font-medium">
                    {post.category?.category_name}
                  </span>
                </div>
              </Link>

              <div className="p-5">
                <Link href={`/blogs/${post.hash}/${post.autor_id}`}>
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {post.resume}
                  </p>
                </Link>

                {/* Author & Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
                      <span className="text-xs font-bold text-primary">
                        {(post.autor?.name ?? 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {post.autor?.name ?? 'Autor'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSave(String(post.id))}
                      className={`p-2 rounded-lg transition-colors ${
                        savedPosts.includes(String(post.id))
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare(post)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Cargar Más Artículos
          </Button>
        </div>
      </div>
    </div>
  )
}
