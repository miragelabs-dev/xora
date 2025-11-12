import { NextResponse } from "next/server";

import { createPostCaller, handleApiRouteError, readJsonBody } from "@/server/api/helpers/trpc-route";
import type { PostCaller } from "@/server/api/helpers/trpc-route";

export async function POST(req: Request) {
  try {
    const caller = await createPostCaller(req);
    const payload = await readJsonBody<Parameters<PostCaller["save"]>[0]>(req);
    await caller.save(payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiRouteError(error);
  }
}
