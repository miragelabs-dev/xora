import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

const AddPointsBody = z.object({
  activityType: z.enum(["like", "post", "streak", "badge", "follow", "comment"]),
  points: z.number().min(1).max(100),
  metadata: z.record(z.any()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.points.getUserPoints();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = AddPointsBody.parse(json);

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.points.addPoints(input);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
