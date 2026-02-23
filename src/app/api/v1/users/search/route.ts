import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

const Query = z.object({
  query: z.string().min(1).max(50),
  limit: z.coerce.number().min(1).max(20).default(5),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const input = Query.parse({
      query: url.searchParams.get("query") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.user.search(input);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
