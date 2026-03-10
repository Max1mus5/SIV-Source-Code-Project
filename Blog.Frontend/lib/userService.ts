import { apiFetch } from './api';
import type { User } from './types';

/**
 * Get user profile by username
 */
export async function getUserProfile(username: string): Promise<User> {
  return apiFetch<User>(`/user/${username}`);
}

/**
 * Update user profile information
 * @param username - Current username
 * @param data - Partial user data to update
 */
export async function updateProfile(
  username: string, 
  data: {
    username?: string;
    email?: string;
    name?: string;
    bio?: string;
  }
) {
  return apiFetch<User>(`/user/profile/${username}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Upload or update user profile image
 * @param username - Current username
 * @param file - Image file to upload
 */
export async function uploadProfileImage(username: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = localStorage.getItem('siv_token');

  const response = await fetch(`${apiUrl}/user/profile-image/${username}`, {
    method: 'PUT',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error uploading image');
  }

  return response.json();
}

/**
 * Get user's posts
 * @param userId - User ID
 */
export async function getUserPosts(userId: number) {
  // This would need to filter posts by user
  // For now, we fetch all posts and filter client-side
  // TODO: Backend should provide /user/:id/posts endpoint
  return apiFetch<any[]>('/post/feed');
}
