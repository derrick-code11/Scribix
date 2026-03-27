import { authRequest } from '@/lib/api-client'

export interface AuthMeResponse {
  user: { id: string; status: string }
  profile: {
    id: string
    username: string
    display_name: string
    bio: string | null
    avatar_url: string | null
  } | null
  onboarding: {
    is_complete: boolean
    missing_fields: string[]
  }
}

export interface UsernameAvailability {
  username: string
  available: boolean
  reason: 'taken' | 'invalid' | null
}

export interface UpsertProfileResponse {
  profile: {
    id: string
    username: string
    display_name: string
    bio: string | null
    avatar_url: string | null
  }
  onboarding: { is_complete: boolean }
}

export interface UploadUrlResponse {
  upload_url: string
  storage_key: string
}

export interface RegisterMediaResponse {
  id: string
  storage_key: string
  public_url: string
  mime_type: string
  file_size_bytes: number
  asset_type: string
}

export function fetchAuthMe() {
  return authRequest<AuthMeResponse>('/auth/me')
}

export function checkUsernameAvailability(username: string) {
  return authRequest<UsernameAvailability>(
    `/profiles/username-availability?username=${encodeURIComponent(username)}`,
  )
}

export function upsertProfile(data: {
  username?: string
  display_name: string
  bio?: string | null
  avatar_media_id?: string | null
}) {
  return authRequest<UpsertProfileResponse>('/profiles/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function requestUploadUrl(data: {
  file_name: string
  mime_type: string
  file_size_bytes: number
  asset_type: 'avatar' | 'cover_image' | 'other'
}) {
  return authRequest<UploadUrlResponse>('/media/upload-url', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function registerMedia(data: {
  storage_key: string
  asset_type: 'avatar' | 'cover_image' | 'other'
  mime_type: string
  file_size_bytes: number
  width?: number | null
  height?: number | null
}) {
  return authRequest<RegisterMediaResponse>('/media', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function uploadFileToS3(url: string, file: File) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`)
}
