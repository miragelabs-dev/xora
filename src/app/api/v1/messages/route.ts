import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

const SendBody = z.object({
  recipientId: z.number(),
  content: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = SendBody.parse(json);

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.message.sendMessage(input);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
