import { NextRequest, NextResponse } from "next/server";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    await caller.notification.markAllAsRead();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
