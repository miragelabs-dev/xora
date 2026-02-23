import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

const FeedQuery = z.object({
  type: z.enum(["for-you", "following", "user", "replies", "interests"]).default("for-you"),
  userId: z.coerce.number().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.coerce.number().default(0),
});

const CreateBody = z.object({
  content: z.string().min(1).max(280),
  image: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const input = FeedQuery.parse({
      type: url.searchParams.get("type") ?? undefined,
      userId: url.searchParams.get("userId") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      cursor: url.searchParams.get("cursor") ?? undefined,
    });

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.post.feed(input);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}

import { TRPCError } from "@trpc/server";

// TODO: kendi storage'ına göre doldur
async function uploadImageToStorage(file: File): Promise<string> {
  // güvenlik: type/size kontrolü
  const maxBytes = 5 * 1024 * 1024;
  if (!file.type.startsWith("image/")) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "image must be an image file" });
  }
  if (file.size > maxBytes) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "image too large" });
  }

  // File -> Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // burada buffer'ı S3/MinIO/Cloudinary'ye upload edip public URL döndür
  // return uploadedUrl;

  throw new Error("uploadImageToStorage not implemented");
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let payload: { content: string; image?: string | null };

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();

      const content = String(fd.get("content") ?? "");
      const imageField = fd.get("image");

      let imageUrl: string | null = null;

      // image alanı File ise upload et
      if (imageField && imageField instanceof File && imageField.size > 0) {
        imageUrl = await uploadImageToStorage(imageField);
      } else if (typeof imageField === "string") {
        // bazı client’lar URL string gönderebilir
        imageUrl = imageField || null;
      }

      payload = { content, image: imageUrl };
    } else if (contentType.includes("application/json")) {
      const json = await req.json();
      payload = json;
    } else {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Unsupported Content-Type: ${contentType}`,
      });
    }

    const input = CreateBody.parse(payload);

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.post.create(input);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
