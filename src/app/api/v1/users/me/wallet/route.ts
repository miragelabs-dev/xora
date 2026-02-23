import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

const UpdateWalletBody = z.object({
  walletAddress: z.string().nullable(),
});

export async function PATCH(req: NextRequest) {
  try {
    const json = await req.json();
    const input = UpdateWalletBody.parse(json);

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.user.updateWalletAddress(input);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
