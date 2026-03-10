export interface User {
  id: number
  username: string
  name?: string
  email: string
  bio?: string
  profile_image?: string
  profileImage?: string // Alias for backwards compatibility
  role?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: number
  category_name: string
  description?: string
}

export interface Post {
  id: number
  title: string
  content: string
  resume?: string
  post_image?: string
  hash: string
  autor_id: number
  category_id: number
  estado?: string
  createdAt?: string
  updatedAt?: string
  autor?: User
  category?: Category
}

export interface Comment {
  id: number
  content: string
  post_id: number
  user_id: number
  createdAt?: string
  user?: User
}

export interface Reaction {
  id: number
  type: string
  post_id: number
  user_id: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
