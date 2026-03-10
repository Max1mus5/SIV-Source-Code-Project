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
  Calendar,
  MapPin,
  LinkIcon,
  PlusCircle,
  Loader2,
  FileText,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-context"
import EditProfileModal from "@/components/edit-profile-modal"
import { apiFetch } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Post {
  id: number
  title: string
  content: string
  resume?: string
  estado: 'draft' | 'published'
  hashBlockchain?: string
  autor_id: number
  createdAt: string
  updatedAt: string
  likes: number
  comments: number
  category_id?: number
}

const tabs = [
  { id: "posts", label: "Publicaciones", icon: BookOpen },
  { id: "drafts", label: "Borradores", icon: FileText },
  { id: "likes", label: "Me gusta", icon: Heart },
  { id: "comments", label: "Comentarios", icon: MessageSquare },
]

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("posts")
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [drafts, setDrafts] = useState<Post[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)

  // Fetch posts and drafts
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserContent()
    }
  }, [isAuthenticated, user])

  const fetchUserContent = async () => {
    setIsLoadingPosts(true)
    try {
      const [postsRes, draftsRes] = await Promise.all([
        apiFetch<{ data: Post[] }>('/post/my-posts'),
        apiFetch<{ data: Post[] }>('/post/my-drafts')
      ])
      setPosts(postsRes?.data || [])
      setDrafts(draftsRes?.data || [])
    } catch (error) {
      console.error('Error fetching user content:', error)
    } finally {
      setIsLoadingPosts(false)
    }
  }
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
    ? `${apiUrl}${user.profile_image || user.profileImage}`
    : '/images/default-avatar.svg' // SVG predeterminado

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
                    {posts.length}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Publicaciones</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-background/30 hover:bg-primary/10 transition-colors">
                  <p className="text-2xl font-bold text-foreground">
                    {drafts.length}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Borradores</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-background/30 hover:bg-primary/10 transition-colors">
                  <p className="text-2xl font-bold text-foreground">
                    {posts.reduce((sum, p) => sum + (p.likes || 0), 0)}
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
              {isLoadingPosts ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Cargando contenido...</p>
                </div>
              ) : activeTab === "posts" ? (
                posts.length > 0 ? (
                  posts.map((post) => (
                    <Card key={post.id} className="hover:border-primary transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg hover:text-primary cursor-pointer">
                              <Link href={`/blogs/${post.hashBlockchain}/${post.autor_id}`}>
                                {post.title}
                              </Link>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(post.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            Publicado
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">
                          {post.resume || post.content.substring(0, 150)}
                        </p>
                        <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {post.comments || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            Ver
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aún no has publicado nada. ¡Crea tu primera publicación!
                  </p>
                )
              ) : activeTab === "drafts" ? (
                drafts.length > 0 ? (
                  drafts.map((draft) => (
                    <Card key={draft.id} className="hover:border-primary transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg hover:text-primary cursor-pointer">
                              <Link href={`/blogs/edit/${draft.id}`}>
                                {draft.title}
                              </Link>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Actualizado: {new Date(draft.updatedAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            Borrador
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">
                          {draft.resume || draft.content.substring(0, 150)}
                        </p>
                        <div className="flex gap-4 mt-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/blogs/edit/${draft.id}`}>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Editar
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No tienes borradores guardados.
                  </p>
                )
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Contenido próximamente...
                </p>
              )}
            </div>
          </div>

          {/* Sidebar - Temporarily hidden until real data is available */}
          <div className="space-y-6">
            {/* Sidebar content can be added later with real statistics */}
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
