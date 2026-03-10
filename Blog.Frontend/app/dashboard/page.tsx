"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  User,
  Settings,
  Edit3,
  BookOpen,
  Heart,
  MessageSquare,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  LinkIcon,
  PlusCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-context"
import EditProfileModal from "@/components/edit-profile-modal"

const mockPosts = [
  {
    id: 1,
    title: "Introducción a Unity para principiantes",
    excerpt: "Una guía completa para comenzar en el desarrollo de videojuegos...",
    image: "/images/game-design-document.jpg",
    likes: 45,
    comments: 12,
    date: "Hace 2 días",
  },
  {
    id: 2,
    title: "Patrones de diseño en C# para juegos",
    excerpt: "Aprende los patrones más utilizados en la industria del gaming...",
    image: "/images/programacion-csharp.jpg",
    likes: 67,
    comments: 23,
    date: "Hace 1 semana",
  },
  {
    id: 3,
    title: "Creando animaciones fluidas con CSS",
    excerpt: "Tips y trucos para mejorar la experiencia de usuario...",
    image: "/images/animated-toggle.jpg",
    likes: 32,
    comments: 8,
    date: "Hace 2 semanas",
  },
]

const tabs = [
  { id: "posts", label: "Publicaciones", icon: BookOpen },
  { id: "likes", label: "Me gusta", icon: Heart },
  { id: "comments", label: "Comentarios", icon: MessageSquare },
]

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("posts")
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, router])

  // Show loading while checking authentication
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  // Format join date from createdAt
  const joinedDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('es-ES', { 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Fecha desconocida'

  // Use actual API URL for profile images
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const profileImageUrl = user.profile_image || user.profileImage
    ? `${apiUrl}/uploads/profiles/${user.profile_image || user.profileImage}`
    : '/images/team-photo.jpg' // Fallback image

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="glass border border-border rounded-2xl overflow-hidden glow-primary-sm">
          {/* Cover */}
          <div className="h-48 bg-gradient-to-r from-primary/30 via-primary/10 to-accent/20 relative">
            <div className="absolute inset-0 bg-[url('/images/unity-visit.jpg')] bg-cover bg-center opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 relative z-10">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full border-4 border-card bg-card overflow-hidden flex-shrink-0">
                <Image
                  src={profileImageUrl}
                  alt={user.name || user.username}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 pt-4 md:pt-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {user.name || user.username}
                    </h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="border-border hover:border-primary"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configuración
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio & Details */}
            <div className="mt-6 space-y-4">
              {user.bio && (
                <p className="text-foreground max-w-2xl">{user.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Se unió en {joinedDate}
                </span>
                {user.email && (
                  <span className="flex items-center gap-1 text-muted-foreground/80">
                    📧 {user.email}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-4 sm:gap-8 pt-4 border-t border-border">
                <div className="text-center px-4 py-2 rounded-xl bg-background/30 hover:bg-primary/10 transition-colors">
                  <p className="text-2xl font-bold text-foreground">
                    {mockPosts.length}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Publicaciones</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-background/30 hover:bg-primary/10 transition-colors">
                  <p className="text-2xl font-bold text-foreground">
                    0
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Seguidores</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-background/30 hover:bg-primary/10 transition-colors">
                  <p className="text-2xl font-bold text-foreground">
                    0
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Siguiendo</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-primary/10 ring-1 ring-primary/30">
                  <p className="text-2xl font-bold text-primary">
                    0
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Me gusta</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-2 flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Create Post Button */}
            <Link
              href="/blogs/create"
              className="block bg-card/80 backdrop-blur-sm border border-border border-dashed rounded-xl p-6 text-center hover:border-primary transition-colors group"
            >
              <PlusCircle className="w-12 h-12 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="mt-2 font-medium text-foreground">
                Crear Nueva Publicación
              </p>
              <p className="text-sm text-muted-foreground">
                Comparte tus conocimientos con la comunidad
              </p>
            </Link>

            {/* Posts List */}
            <div className="space-y-4">
              {mockPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blogs/${post.id}`}
                  className="block bg-card/80 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:border-primary transition-colors"
                >
                  <div className="flex">
                    <div className="w-40 h-32 flex-shrink-0">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={160}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold text-foreground mb-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {post.comments}
                        </span>
                        <span>{post.date}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Estadísticas Rápidas
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Vistas esta semana
                  </span>
                  <span className="font-semibold text-foreground">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Nuevos seguidores
                  </span>
                  <span className="font-semibold text-primary">+28</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Engagement rate
                  </span>
                  <span className="font-semibold text-foreground">4.2%</span>
                </div>
              </div>
            </div>

            {/* Suggested Users */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Usuarios Sugeridos
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        Usuario {i}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        @usuario{i}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Seguir
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  )
}
