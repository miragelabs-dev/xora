import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

const ListQuery = z.object({
  type: z.enum(["all", "my"]),
  limit: z.coerce.number().min(1).max(100).default(50),
  cursor: z.coerce.number().nullish(),
});

const CreateBody = z.object({
  name: z.string().min(3).max(255),
  symbol: z.string().min(2).max(10),
  description: z.string().max(1000).nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const input = ListQuery.parse({
      type: url.searchParams.get("type") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      cursor: url.searchParams.get("cursor") ?? undefined,
    });

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.nft.getCollections(input);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = CreateBody.parse(json);

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.nft.createCollection(input);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
