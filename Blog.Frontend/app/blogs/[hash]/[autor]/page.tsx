"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  MessageSquare,
  Share2,
  ArrowLeft,
  Send,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch, ApiError } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import type { Post, Comment } from "@/lib/types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

function getImageUrl(path?: string) {
  if (!path) return '/images/game-design-document.jpg'
  if (path.startsWith('http')) return path
  return `${BASE_URL}${path}`
}

interface PageParams {
  hash: string
  autor: string
}

export default function BlogDetailPage({ params }: { params: Promise<PageParams> }) {
  const { hash, autor } = use(params)
  const { token, isAuthenticated } = useAuth()

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await apiFetch<{ data: Post }>(`/post/${hash}/${autor}`)
        const fetchedPost = res?.data ?? (res as unknown as Post)
        setPost(fetchedPost)

        // Fetch comments for this post
        if (fetchedPost?.id) {
          try {
            const cRes = await apiFetch<{ data: Comment[] }>(`/comments/${fetchedPost.id}`)
            setComments(cRes?.data ?? [])
          } catch {
            // comments not critical
          }
        }
      } catch {
        // post fetch failed
      } finally {
        setIsLoading(false)
      }
    }
    fetchPost()
  }, [hash, autor])

  const handleLike = async () => {
    if (!isAuthenticated) return
    setLikeLoading(true)
    try {
      await apiFetch('/reaction/create', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({ post_id: post?.id, type: 'like' }),
      })
      setIsLiked(!isLiked)
    } catch {
      // ignore
    } finally {
      setLikeLoading(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setCommentError(null)
    setCommentLoading(true)
    try {
      const res = await apiFetch<{ data: Comment }>('/comments/', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({ content: commentText, post_id: post?.id }),
      })
      setComments((prev) => [...prev, res.data])
      setCommentText("")
    } catch (err) {
      if (err instanceof ApiError) {
        setCommentError(err.message)
      } else {
        setCommentError('Error al enviar el comentario')
      }
    } finally {
      setCommentLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && post) {
      await navigator.share({ title: post.title, text: post.resume ?? '', url: window.location.href })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-8" />
          <Skeleton className="h-72 w-full rounded-2xl mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No se encontró el artículo.</p>
          <Link href="/blogs" className="text-primary hover:underline">Volver al Blog</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back button */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Blog
        </Link>

        {/* Header */}
        <div className="mb-8">
          {post.category && (
            <span className="text-primary text-sm font-medium mb-3 block">
              {post.category.category_name}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {post.title}
          </h1>
          {post.resume && (
            <p className="text-lg text-muted-foreground mb-6">{post.resume}</p>
          )}

          {/* Author + actions */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/20">
                <span className="text-sm font-bold text-primary">
                  {(post.autor?.name ?? 'A').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{post.autor?.name ?? 'Autor'}</p>
                <p className="text-xs text-muted-foreground">
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    isLiked
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-primary' : ''}`} />
                  Me gusta
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all"
                >
                  <Heart className="w-4 h-4" />
                  Me gusta
                </Link>
              )}
              <button
                onClick={handleShare}
                className="p-2 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.post_image && (
          <div className="relative h-72 md:h-96 w-full rounded-2xl overflow-hidden mb-10 border border-border">
            <Image
              src={getImageUrl(post.post_image)}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Article content */}
        <article
          className="prose-article mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Comments section */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Comentarios ({comments.length})
          </h2>

          {/* Comment form */}
          {isAuthenticated ? (
            <form onSubmit={handleComment} className="mb-8">
              {commentError && (
                <div className="flex items-center gap-2 mb-3 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {commentError}
                </div>
              )}
              <div className="flex gap-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escribe un comentario..."
                  rows={3}
                  className="flex-1 resize-none rounded-xl border border-border bg-card/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end mt-3">
                <Button
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                  {commentLoading ? 'Enviando...' : 'Comentar'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mb-8 rounded-xl border border-border bg-card/50 p-4 text-center">
              <p className="text-muted-foreground text-sm">
                <Link href="/login" className="text-primary hover:underline font-medium">Inicia sesión</Link> para dejar un comentario.
              </p>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-5">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                No hay comentarios aún. ¡Sé el primero!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <span className="text-xs font-bold text-primary">
                      {(comment.user?.name ?? 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 rounded-xl border border-border bg-card/50 px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {comment.user?.name ?? 'Usuario'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
