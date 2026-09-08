/** @jest-environment node */
import { POST } from "@/app/api/opportunities/[opportunityId]/resume/route";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { getResumeStorageService } from "@/lib/storage/resume";

jest.mock("@/lib/auth/session", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  getDb: jest.fn(),
}));

describe("POST /api/opportunities/[opportunityId]/resume", () => {
  const actorId = "user-123";
  const opportunityId = "opp-123";

  const mockSession = {
    user: { id: actorId, name: "Test User", email: "test@example.com" },
    session: { id: "s-1" },
  };

  const mockDb = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockReturnValue(mockDb);
    getResumeStorageService().clear?.();
  });

  it("returns 401 Unauthorized if caller is not authenticated", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost/api/opportunities/opp-1/resume", {
      method: "POST",
    });

    const res = await POST(req, { params: Promise.resolve({ opportunityId: "opp-1" }) });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toMatch(/sign in/i);
  });

  it("returns 404 if opportunity does not exist or is owned by another user", async () => {
    (getSession as jest.Mock).mockResolvedValue(mockSession);

    // mock select returning empty (not found or foreign)
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    const req = new Request("http://localhost/api/opportunities/foreign-opp/resume", {
      method: "POST",
    });

    const res = await POST(req, { params: Promise.resolve({ opportunityId: "foreign-opp" }) });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toMatch(/unavailable/i);
  });

  it("returns 400 if file is missing in form data", async () => {
    (getSession as jest.Mock).mockResolvedValue(mockSession);

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ id: opportunityId, userId: actorId }]),
        }),
      }),
    });

    const formData = new FormData();
    const req = new Request("http://localhost/api/opportunities/opp-123/resume", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req, { params: Promise.resolve({ opportunityId }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/file must be provided/i);
  });

  it("returns 400 if file signature is not PDF or DOCX", async () => {
    (getSession as jest.Mock).mockResolvedValue(mockSession);

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ id: opportunityId, userId: actorId }]),
        }),
      }),
    });

    const formData = new FormData();
    const fakeFile = new Blob(["This is a plain text file, not a PDF."], { type: "text/plain" });
    formData.append("file", fakeFile, "test.txt");

    const req = new Request("http://localhost/api/opportunities/opp-123/resume", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req, { params: Promise.resolve({ opportunityId }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/PDF or DOCX/i);
  });
});
