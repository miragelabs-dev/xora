import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

const Params = z.object({
  id: z.coerce.number(),
});

const ListQuery = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.coerce.number().default(0),
});

const ReplyBody = z.object({
  content: z.string().min(1).max(280),
  image: z.string().nullable().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = Params.parse(await params);
    const url = new URL(req.url);
    const query = ListQuery.parse({
      limit: url.searchParams.get("limit") ?? undefined,
      cursor: url.searchParams.get("cursor") ?? undefined,
    });

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.post.getReplies({
      postId: id,
      ...query,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = Params.parse(await params);
    const json = await req.json();
    const input = ReplyBody.parse(json);

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.post.reply({
      replyToId: id,
      ...input,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
