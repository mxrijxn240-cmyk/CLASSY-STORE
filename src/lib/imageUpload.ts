import { supabase } from '@/lib/supabase';

export const productPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const brandAssetTypes = [...productPhotoTypes, 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
export const maxImageBytes = 5 * 1024 * 1024;

export function validateImageFile(file: File, allowedTypes: string[]): string | null {
  if (!allowedTypes.includes(file.type)) return 'Please choose a supported image file.';
  if (file.size > maxImageBytes) return 'Photos must be 5 MB or smaller.';
  return null;
}

export async function uploadPublicImage(bucket: string, file: File): Promise<string> {
  if (!supabase) throw new Error('Store unavailable');
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
