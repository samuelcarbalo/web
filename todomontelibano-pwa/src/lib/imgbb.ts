/**
 * Upload an image to ImgBB. Requires `VITE_IMGBB_API_KEY` in the env.
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Falta VITE_IMGBB_API_KEY. Configúrala en .env / Hostinger para subir imágenes.'
    );
  }

  const body = new FormData();
  body.append('image', file);
  body.append('key', apiKey);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error HTTP ${response.status}: ${errorText}`);
  }

  const result = (await response.json()) as {
    success?: boolean;
    data?: { url?: string };
    error?: { message?: string };
  };

  if (result.success && result.data?.url) {
    return result.data.url;
  }

  throw new Error(result.error?.message || 'Error desconocido al subir imagen');
}
