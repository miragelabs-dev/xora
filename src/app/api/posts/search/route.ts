import { NextResponse } from "next/server";

import { createPostCaller, handleApiRouteError, searchParamsToInput } from "@/server/api/helpers/trpc-route";
import type { PostCaller } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createPostCaller(req);
    const { searchParams } = new URL(req.url);
    const payload = searchParamsToInput<Parameters<PostCaller["search"]>[0]>(searchParams);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    payload.query = query;

    const results = await caller.search(payload);
    return NextResponse.json(results);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
