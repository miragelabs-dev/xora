import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

const Params = z.object({
  username: z.string().min(1),
});

const Query = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  cursor: z.coerce.number().nullish(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = Params.parse(await params);
    const url = new URL(req.url);
    const query = Query.parse({
      limit: url.searchParams.get("limit") ?? undefined,
      cursor: url.searchParams.get("cursor") ?? undefined,
    });

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.user.getFollowers({
      username,
      ...query,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
