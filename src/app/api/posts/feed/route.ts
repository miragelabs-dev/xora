import { NextResponse } from "next/server";

import { createPostCaller, handleApiRouteError, searchParamsToInput } from "@/server/api/helpers/trpc-route";
import type { PostCaller } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createPostCaller(req);
    const { searchParams } = new URL(req.url);
    const payload = searchParamsToInput<Parameters<PostCaller["feed"]>[0]>(searchParams);
    const feed = await caller.feed(payload);
    return NextResponse.json(feed);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
