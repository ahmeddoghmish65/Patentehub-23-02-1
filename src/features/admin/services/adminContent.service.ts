/**
 * Admin Content Service — wraps all content-related API calls.
 * Keeps raw API imports out of components and hooks.
 */
import * as api from '@/infrastructure/database/api';

export async function exportContentData(token: string, storeName: string): Promise<unknown[]> {
  const r = await api.apiExportData(token, storeName);
  return (r.data ?? []) as unknown[];
}

export async function importContentData(
  token: string,
  storeName: string,
  data: unknown[]
): Promise<number> {
  const r = await api.apiImportData(token, storeName, data);
  return (r.data ?? 0) as number;
}

export async function downloadJson(data: unknown[], filename: string): Promise<void> {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

export function resizeImageToSquare(dataUrl: string, size: number): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const scale = Math.max(size / img.width, size / img.height);
      const x = (size - img.width * scale) / 2;
      const y = (size - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = dataUrl;
  });
}

export function uploadImageDirect(squareSize?: number): Promise<string | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = async () => {
        const raw = reader.result as string;
        const result = squareSize ? await resizeImageToSquare(raw, squareSize) : raw;
        resolve(result);
      };
      reader.readAsDataURL(file);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
