import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ResumeStorageService {
  uploadFile(storagePath: string, buffer: Buffer | Uint8Array, contentType: string): Promise<void>;
  downloadFile(storagePath: string): Promise<Buffer>;
  deleteFile(storagePath: string): Promise<void>;
  createSignedUrl(storagePath: string, expiresInSeconds?: number): Promise<string>;
  hasFile?(storagePath: string): boolean;
  clear?(): void;
}

export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.+/g, ".")
    .substring(0, 100);
}

export function generateResumeStoragePath(
  userId: string,
  opportunityId: string,
  originalFileName: string
): string {
  const safeName = sanitizeFileName(originalFileName);
  const fileId = crypto.randomUUID();
  return `${userId}/${opportunityId}/${fileId}-${safeName}`;
}

export class InMemoryResumeStorage implements ResumeStorageService {
  private files = new Map<string, { buffer: Buffer; contentType: string }>();

  async uploadFile(storagePath: string, buffer: Buffer | Uint8Array, contentType: string): Promise<void> {
    const nodeBuf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    this.files.set(storagePath, { buffer: nodeBuf, contentType });
  }

  async downloadFile(storagePath: string): Promise<Buffer> {
    const entry = this.files.get(storagePath);
    if (!entry) {
      throw new Error(`File not found in storage: ${storagePath}`);
    }
    return entry.buffer;
  }

  async deleteFile(storagePath: string): Promise<void> {
    this.files.delete(storagePath);
  }

  async createSignedUrl(storagePath: string, expiresInSeconds = 60): Promise<string> {
    if (!this.files.has(storagePath)) {
      throw new Error(`Cannot create signed URL for nonexistent file: ${storagePath}`);
    }
    const expiry = Date.now() + expiresInSeconds * 1000;
    return `https://mock-storage.searchtrace.local/resumes/${storagePath}?token=mock-signed-token&expires=${expiry}`;
  }

  hasFile(storagePath: string): boolean {
    return this.files.has(storagePath);
  }

  clear(): void {
    this.files.clear();
  }
}

export class SupabaseResumeStorage implements ResumeStorageService {
  private bucket: string;

  constructor(bucket = "resumes") {
    this.bucket = bucket;
  }

  async uploadFile(storagePath: string, buffer: Buffer | Uint8Array, contentType: string): Promise<void> {
    const supabase = await createServerSupabaseClient();
    const nodeBuf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const { error } = await supabase.storage.from(this.bucket).upload(storagePath, nodeBuf, {
      contentType,
      upsert: true,
    });

    if (error) {
      throw new Error(`Failed to upload file to storage: ${error.message}`);
    }
  }

  async downloadFile(storagePath: string): Promise<Buffer> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.storage.from(this.bucket).download(storagePath);

    if (error || !data) {
      throw new Error(`Failed to download file from storage: ${error?.message ?? "Not found"}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async deleteFile(storagePath: string): Promise<void> {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.storage.from(this.bucket).remove([storagePath]);

    if (error) {
      throw new Error(`Failed to delete file from storage: ${error.message}`);
    }
  }

  async createSignedUrl(storagePath: string, expiresInSeconds = 60): Promise<string> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new Error(`Failed to generate signed URL: ${error?.message ?? "Unknown error"}`);
    }

    return data.signedUrl;
  }
}

let customStorageService: ResumeStorageService | null = null;
const defaultMemoryStorage = new InMemoryResumeStorage();

export function setResumeStorageService(service: ResumeStorageService | null): void {
  customStorageService = service;
}

export function getResumeStorageService(): ResumeStorageService {
  if (customStorageService) {
    return customStorageService;
  }

  // If in test environment or offline mode, default to in-memory storage
  if (
    process.env.NODE_ENV === "test" ||
    process.env.STORAGE_PROVIDER === "memory" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return defaultMemoryStorage;
  }

  return new SupabaseResumeStorage();
}
