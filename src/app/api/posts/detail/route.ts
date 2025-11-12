import { NextResponse } from "next/server";

import { createPostCaller, handleApiRouteError, searchParamsToInput } from "@/server/api/helpers/trpc-route";
import type { PostCaller } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createPostCaller(req);
    const { searchParams } = new URL(req.url);
    const params = searchParamsToInput<{ postId?: number }>(searchParams);
    const postId = params.postId;

    if (typeof postId !== "number") {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const post = await caller.getById({ postId });
    return NextResponse.json(post);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
