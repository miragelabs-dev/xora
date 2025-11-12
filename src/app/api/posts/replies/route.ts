import { NextResponse } from "next/server";

import { createPostCaller, handleApiRouteError, searchParamsToInput } from "@/server/api/helpers/trpc-route";
import type { PostCaller } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createPostCaller(req);
    const { searchParams } = new URL(req.url);
    const params = searchParamsToInput<{ postId?: number; limit?: number; cursor?: number }>(searchParams);
    const postId = params.postId;

    if (typeof postId !== "number") {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const { limit, cursor } = params;
    const payload: Parameters<PostCaller["getReplies"]>[0] = {
      postId,
      ...(typeof limit === "number" ? { limit } : {}),
      ...(typeof cursor === "number" ? { cursor } : {}),
    };

    const replies = await caller.getReplies(payload);
    return NextResponse.json(replies);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
