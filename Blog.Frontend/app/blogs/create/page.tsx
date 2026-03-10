"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft,
  Image as ImageIcon,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link2,
  Code,
  Eye,
  Save,
  Send,
  X,
  Cpu,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiFetch, ApiError } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import type { Category } from "@/lib/types"
import MarkdownPreview from "@/components/markdown-preview"

export default function CreateBlogPage() {
  const router = useRouter()
  const { token, isAuthenticated } = useAuth()
  const [isPreview, setIsPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMining, setIsMining] = useState(false)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [apiCategories, setApiCategories] = useState<Category[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  // Fetch categories from API
  useEffect(() => {
    apiFetch<{ data: Category[] }>('/category/getCategory')
      .then((res) => setApiCategories(res?.data ?? []))
      .catch(() => {})
  }, [])

  const categories = apiCategories.length > 0
    ? apiCategories.map((c) => c.category_name)
    : ["Desarrollo", "Diseño", "Gamificación", "Unity", "Pixel Art", "Tutoriales", "Noticias"]

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => { setCoverImage(reader.result as string) }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    setSubmitError(null)
    setIsSubmitting(true)
    setIsMining(true)
    try {
      const categoryId = apiCategories.find((c) => c.category_name === formData.category)?.id
      const res = await apiFetch<{ data: { id: number; hash: string; autor_id: number } }>('/post/create-new-publication', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          resume: formData.excerpt,
          category_id: categoryId,
          estado: isDraft ? 'draft' : 'published',
        }),
      })
      const newPost = res?.data
      setIsMining(false)

      // Upload cover image if provided
      if (coverImageFile && newPost?.id) {
        try {
          const formDataImg = new FormData()
          formDataImg.append('image', coverImageFile)
          await apiFetch(`/post/upload-image/${newPost.id}`, {
            method: 'PUT',
            token: token ?? undefined,
            body: formDataImg,
          })
        } catch {
          // image upload failure is non-critical
        }
      }

      // Redirigir según el tipo de publicación
      if (isDraft) {
        router.push('/dashboard')  // Borradores al dashboard
      } else if (newPost?.hash && newPost?.autor_id) {
        router.push(`/blogs/${newPost.hash}/${newPost.autor_id}`)  // Publicados a detalle
      } else {
        router.push('/blogs')  // Fallback a lista
      }
    } catch (err) {
      setIsMining(false)
      if (err instanceof ApiError) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Error al crear la publicación')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const insertMarkdown = (type: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    let insertion = ""

    switch (type) {
      case "bold":
        insertion = `**${selectedText || "texto en negrita"}**`
        break
      case "italic":
        insertion = `*${selectedText || "texto en cursiva"}*`
        break
      case "list":
        insertion = `\n- ${selectedText || "elemento de lista"}\n`
        break
      case "ordered":
        insertion = `\n1. ${selectedText || "elemento numerado"}\n`
        break
      case "quote":
        insertion = `\n> ${selectedText || "cita"}\n`
        break
      case "link":
        insertion = `[${selectedText || "texto del enlace"}](url)`
        break
      case "code":
        insertion = `\`\`\`\n${selectedText || "código"}\n\`\`\``
        break
    }

    const newContent =
      formData.content.substring(0, start) +
      insertion +
      formData.content.substring(end)

    setFormData({ ...formData, content: newContent })
  }

  return (
    <div className="min-h-screen py-8">
      {/* Blockchain mining overlay */}
      {isMining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="glass border border-primary/30 rounded-2xl p-10 flex flex-col items-center gap-4 text-center glow-primary-sm max-w-xs">
            <Cpu className="w-10 h-10 text-primary animate-pulse" />
            <p className="text-lg font-bold text-foreground">Minando bloque...</p>
            <p className="text-sm text-muted-foreground">Tu publicación está siendo registrada en la blockchain. Esto puede tomar unos segundos.</p>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
              className="border-border hover:border-primary"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? "Editar" : "Vista Previa"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="border-border hover:border-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || !formData.title || !formData.content}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>
        {submitError && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-destructive text-sm">
            {submitError}
          </div>
        )}

        {!isPreview ? (
          /* Editor Mode */
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl overflow-hidden">
              {coverImage ? (
                <div className="relative h-64">
                  <Image
                    src={coverImage}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => setCoverImage(null)}
                    className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-background/50 transition-colors">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                  <span className="text-muted-foreground">
                    Agregar imagen de portada
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Title */}
            <Input
              type="text"
              placeholder="Título de tu artículo..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="text-3xl font-bold bg-transparent border-none focus:ring-0 px-0 placeholder:text-muted-foreground/50"
            />

            {/* Excerpt */}
            <Input
              type="text"
              placeholder="Descripción breve (opcional)..."
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              className="text-lg bg-transparent border-none focus:ring-0 px-0 placeholder:text-muted-foreground/50"
            />

            {/* Category & Tags */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Etiquetas
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Agregar etiqueta..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    className="bg-card border-border focus:border-primary"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                    className="border-border hover:border-primary"
                  >
                    Agregar
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-1 p-2 border-b border-border bg-background/50">
                <button
                  type="button"
                  onClick={() => insertMarkdown("bold")}
                  className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                  title="Negrita"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("italic")}
                  className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                  title="Cursiva"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("list")}
                  className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                  title="Lista"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("ordered")}
                  className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                  title="Lista numerada"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown("quote")}
                  className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                  title="Cita"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("link")}
                  className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                  title="Enlace"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("code")}
                  className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                  title="Código"
                >
                  <Code className="w-4 h-4" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Escribe el contenido de tu artículo aquí... (Soporta Markdown)"
                rows={20}
                className="w-full bg-transparent p-4 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none"
              />
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-8">
            {coverImage && (
              <div className="relative h-64 rounded-xl overflow-hidden mb-8">
                <Image src={coverImage} alt="Cover" fill className="object-cover" />
              </div>
            )}

            {formData.category && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {formData.category}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-4">
              {formData.title || "Sin título"}
            </h1>

            {formData.excerpt && (
              <p className="text-lg text-muted-foreground mb-6">
                {formData.excerpt}
              </p>
            )}

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-primary text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="max-w-none">
              {formData.content ? (
                <MarkdownPreview content={formData.content} />
              ) : (
                <p className="text-muted-foreground italic">
                  El contenido aparecerá aquí...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
