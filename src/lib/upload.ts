import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * Validate and save an uploaded image to disk.
 *
 * @param file    - The uploaded File object
 * @param subDir  - Subdirectory under `public/`, e.g. "uploads/staff-documents"
 * @param prefix  - Filename prefix, e.g. the staff ID
 * @returns       - { fileName, filePath, fileSize, mimeType }
 */
export async function saveUploadedImage(
  file: File,
  subDir: string,
  prefix: string
): Promise<{
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new UploadError(
      `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP`
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new UploadError(
      `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 2MB`
    );
  }

  const ext = EXTENSION_MAP[file.type] ?? ".bin";
  const fileName = `${prefix}_${Date.now()}${ext}`;
  const relativeDir = subDir;
  const filePath = path.join(relativeDir, fileName);

  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(absoluteDir, fileName), buffer);

  return {
    fileName,
    filePath,
    fileSize: file.size,
    mimeType: file.type,
  };
}

/**
 * Delete an uploaded file from disk. Logs a warning on failure (does not throw).
 *
 * @param relativePath - Path relative to `public/`, e.g. "uploads/staff-documents/abc_123.jpg"
 */
export async function deleteUploadedFile(relativePath: string): Promise<void> {
  try {
    const absolutePath = path.join(process.cwd(), "public", relativePath);
    await unlink(absolutePath);
  } catch (error) {
    console.warn(`Failed to delete file "${relativePath}":`, error);
  }
}
