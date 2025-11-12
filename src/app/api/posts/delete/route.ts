import { NextResponse } from "next/server";

import { createPostCaller, handleApiRouteError, readJsonBody } from "@/server/api/helpers/trpc-route";
import type { PostCaller } from "@/server/api/helpers/trpc-route";

export async function POST(req: Request) {
  try {
    const caller = await createPostCaller(req);
    const payload = await readJsonBody<Parameters<PostCaller["delete"]>[0]>(req);
    const deleted = await caller.delete(payload);
    return NextResponse.json(deleted);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
