/** @jest-environment node */
import {
  InMemoryResumeStorage,
  generateResumeStoragePath,
  getResumeStorageService,
  sanitizeFileName,
  setResumeStorageService,
} from "@/lib/storage/resume";

describe("storage path utilities", () => {
  it("sanitizes filenames to prevent path traversal or unsafe characters", () => {
    expect(sanitizeFileName("resume.pdf")).toBe("resume.pdf");
    expect(sanitizeFileName("../../../etc/passwd.pdf")).toBe("._._._etc_passwd.pdf");
    expect(sanitizeFileName("John Doe's Résumé (1).pdf")).toBe("John_Doe_s_R_sum___1_.pdf");
  });

  it("constructs user- and opportunity-scoped storage paths", () => {
    const path = generateResumeStoragePath("user-123", "opp-456", "my-resume.pdf");
    expect(path).toMatch(/^user-123\/opp-456\/[a-f0-9-]{36}-my-resume\.pdf$/);
  });
});

describe("InMemoryResumeStorage provider", () => {
  let storage: InMemoryResumeStorage;

  beforeEach(() => {
    storage = new InMemoryResumeStorage();
  });

  it("stores, retrieves, and deletes files in memory", async () => {
    const testPath = "user-1/opp-1/file-1.pdf";
    const content = Buffer.from("%PDF-1.4 test document");

    await storage.uploadFile(testPath, content, "application/pdf");
    expect(storage.hasFile(testPath)).toBe(true);

    const retrieved = await storage.downloadFile(testPath);
    expect(retrieved.equals(content)).toBe(true);

    const signedUrl = await storage.createSignedUrl(testPath, 60);
    expect(signedUrl).toContain("mock-signed-token");
    expect(signedUrl).toContain(testPath);

    await storage.deleteFile(testPath);
    expect(storage.hasFile(testPath)).toBe(false);
    await expect(storage.downloadFile(testPath)).rejects.toThrow(/not found/i);
  });

  it("fails to generate signed URL for nonexistent file", async () => {
    await expect(storage.createSignedUrl("missing.pdf", 60)).rejects.toThrow(/nonexistent file/i);
  });
});

describe("resume storage service factory", () => {
  afterEach(() => {
    setResumeStorageService(null);
  });

  it("provides memory storage in test environment by default", () => {
    const service = getResumeStorageService();
    expect(service).toBeInstanceOf(InMemoryResumeStorage);
  });

  it("respects explicitly set custom storage provider", () => {
    const custom = new InMemoryResumeStorage();
    setResumeStorageService(custom);
    expect(getResumeStorageService()).toBe(custom);
  });
});
