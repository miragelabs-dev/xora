import { NextResponse } from "next/server";

import { createPostCaller, handleApiRouteError, readJsonBody } from "@/server/api/helpers/trpc-route";
import type { PostCaller } from "@/server/api/helpers/trpc-route";

export async function POST(req: Request) {
  try {
    const caller = await createPostCaller(req);
    const payload = await readJsonBody<Parameters<PostCaller["create"]>[0]>(req);
    const post = await caller.create(payload);
    return NextResponse.json(post);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
