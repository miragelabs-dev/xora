import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Unsupported Content-Type: ${contentType}`,
      });
    }

    const json = await req.json();
    const input = CreateBody.parse(json);

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.post.create(input);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
