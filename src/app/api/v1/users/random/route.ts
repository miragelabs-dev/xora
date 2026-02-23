import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

const Query = z.object({
  limit: z.coerce.number().min(1).max(10).default(3),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const input = Query.parse({
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.user.getRandomUsers(input);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
