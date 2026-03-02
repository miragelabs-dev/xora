import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

const Params = z.object({
  id: z.coerce.number(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = Params.parse(await params);

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    await caller.message.markConversationAsRead({ conversationId: id });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
