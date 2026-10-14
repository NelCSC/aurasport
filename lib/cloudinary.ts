/**
 * Cloudinary Upload Utility for AuraSport Manager
 * Allows uploading player photos, team badges, and tournament logos
 * directly from mobile devices (Camera/Gallery) and desktop computers.
 */

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  secure_url?: string;
  error?: string;
}

export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dornxf4al';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'aurasport_uploads';

  try {
    // 1. First attempt: Direct unsigned upload from browser to Cloudinary CDN
    if (cloudName && uploadPreset) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'sportmaster_players');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.secure_url || data.url;
        if (imageUrl) {
          if (onProgress) onProgress(100);
          return {
            success: true,
            url: imageUrl,
            secure_url: imageUrl,
          };
        }
      } else {
        const errJson = await response.json().catch(() => null);
        console.warn('Direct Cloudinary upload failed, trying server-side proxy route /api/upload:', errJson);
      }
    }

    // 2. Second attempt: Fallback through server-side proxy route /api/upload
    const serverFormData = new FormData();
    serverFormData.append('file', file);

    const serverRes = await fetch('/api/upload', {
      method: 'POST',
      body: serverFormData,
    });

    if (serverRes.ok) {
      const serverData = await serverRes.json();
      const imageUrl = serverData.secure_url || serverData.url;
      if (imageUrl) {
        if (onProgress) onProgress(100);
        return {
          success: true,
          url: imageUrl,
          secure_url: imageUrl,
        };
      }
    }

    const serverErr = await serverRes.json().catch(() => null);
    throw new Error(serverErr?.error || 'No se pudo subir la imagen a Cloudinary');
  } catch (err: any) {
    console.error('uploadImageToCloudinary exception:', err);
    return {
      success: false,
      error: err?.message || 'Error al conectar con Cloudinary',
    };
  }
}
