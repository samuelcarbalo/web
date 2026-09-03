/**
 * Upload an image to ImgBB. Requires `VITE_IMGBB_API_KEY` in the env.
 * Always returns a public HTTPS URL suitable for form fields.
 */
const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload';
export const IMAGE_UPLOAD_MAX_BYTES = 2 * 1024 * 1024;
export const IMAGE_UPLOAD_ACCEPT =
  'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';

const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export function validateImageFile(file: File): string | null {
  const typeOk = file.type.startsWith('image/') || ALLOWED_TYPES.has(file.type);
  if (!typeOk) return 'El archivo debe ser una imagen (PNG, JPG, WEBP, GIF o SVG).';
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) return 'La imagen debe ser menor a 2 MB.';
  return null;
}

export async function uploadImageToImgBB(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Falta VITE_IMGBB_API_KEY. Configúrala en .env / Hostinger para subir imágenes.',
    );
  }

  const formatError = validateImageFile(file);
  if (formatError) throw new Error(formatError);

  const body = new FormData();
  body.append('image', file);
  body.append('key', apiKey);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', IMGBB_ENDPOINT);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      onProgress(Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100))));
    };

    xhr.onload = () => {
      let result: {
        success?: boolean;
        data?: { url?: string; display_url?: string };
        error?: { message?: string };
      };
      try {
        result = JSON.parse(xhr.responseText) as typeof result;
      } catch {
        reject(new Error(`Error HTTP ${xhr.status}: respuesta inválida del servidor de imágenes.`));
        return;
      }

      const url = result.data?.url || result.data?.display_url;
      if (xhr.status >= 200 && xhr.status < 300 && result.success && url) {
        onProgress?.(100);
        resolve(url);
        return;
      }

      reject(
        new Error(
          result.error?.message ||
            `Error HTTP ${xhr.status}: no se pudo subir la imagen.`,
        ),
      );
    };

    xhr.onerror = () => {
      reject(new Error('No se pudo conectar con el servicio de imágenes. Intenta de nuevo.'));
    };

    xhr.send(body);
  });
}
