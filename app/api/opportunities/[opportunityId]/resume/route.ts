import "server-only";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { opportunities, resumes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { MAX_RESUME_FILE_SIZE } from "@/lib/validations/resume";
import { validateResumeBuffer } from "@/lib/extraction/magic-bytes";
import { extractResumeText } from "@/lib/extraction/parser";
import {
  generateResumeStoragePath,
  getResumeStorageService,
} from "@/lib/storage/resume";

export async function POST(
  request: Request,
  context: { params: Promise<{ opportunityId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to continue." },
        { status: 401 }
      );
    }

    const { opportunityId } = await context.params;
    const actorId = session.user.id;
    const db = getDb();

    // Verify opportunity ownership
    const [opportunity] = await db
      .select()
      .from(opportunities)
      .where(and(eq(opportunities.id, opportunityId), eq(opportunities.userId, actorId)))
      .limit(1);

    if (!opportunity) {
      return NextResponse.json(
        { error: "The requested resource is unavailable." },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "A valid résumé file must be provided." },
        { status: 400 }
      );
    }

    if (file.size > MAX_RESUME_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 10 MB limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = "name" in file && typeof file.name === "string" ? file.name : "resume.pdf";

    const validation = validateResumeBuffer(buffer, {
      declaredMimeType: file.type,
      fileName,
    });

    if (!validation.valid || !validation.detectedType) {
      return NextResponse.json(
        { error: validation.error ?? "Invalid document format. Only PDF and DOCX files are supported." },
        { status: 400 }
      );
    }

    const storage = getResumeStorageService();

    // Check if an existing résumé exists for this opportunity
    const [existingResume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.opportunityId, opportunityId))
      .limit(1);

    if (existingResume?.storagePath) {
      try {
        await storage.deleteFile(existingResume.storagePath);
      } catch {
        // Continue even if old storage object was already absent
      }
    }

    const storagePath = generateResumeStoragePath(actorId, opportunityId, fileName);
    const mimeType =
      validation.detectedType === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    await storage.uploadFile(storagePath, buffer, mimeType);

    // Upsert database record with pending extraction
    let resumeRecord;
    if (existingResume) {
      const [updated] = await db
        .update(resumes)
        .set({
          fileName,
          fileSize: file.size,
          fileType: mimeType,
          storagePath,
          extractionState: "pending",
          extractedText: null,
          reviewedText: null,
          aiOptIn: false,
          updatedAt: new Date(),
        })
        .where(eq(resumes.id, existingResume.id))
        .returning();
      resumeRecord = updated;
    } else {
      const [inserted] = await db
        .insert(resumes)
        .values({
          opportunityId,
          userId: actorId,
          fileName,
          fileSize: file.size,
          fileType: mimeType,
          storagePath,
          extractionState: "pending",
          aiOptIn: false,
        })
        .returning();
      resumeRecord = inserted;
    }

    // Trigger server-side extraction
    try {
      const { text } = await extractResumeText(buffer, validation.detectedType);
      const [readyRecord] = await db
        .update(resumes)
        .set({
          extractedText: text,
          reviewedText: text,
          extractionState: "ready",
          updatedAt: new Date(),
        })
        .where(eq(resumes.id, resumeRecord.id))
        .returning();

      resumeRecord = readyRecord;
    } catch {
      const [failedRecord] = await db
        .update(resumes)
        .set({
          extractionState: "failed",
          updatedAt: new Date(),
        })
        .where(eq(resumes.id, resumeRecord.id))
        .returning();

      resumeRecord = failedRecord;
    }

    return NextResponse.json({
      resume: {
        id: resumeRecord.id,
        opportunityId: resumeRecord.opportunityId,
        fileName: resumeRecord.fileName,
        fileSize: resumeRecord.fileSize,
        fileType: resumeRecord.fileType,
        extractionState: resumeRecord.extractionState,
        createdAt: resumeRecord.createdAt,
        updatedAt: resumeRecord.updatedAt,
      },
    });
  } catch (e) {
    console.log({ error: e })

    return NextResponse.json(
      { error: "Unable to complete that request. Please try again." },
      { status: 500 }
    );
  }
}
