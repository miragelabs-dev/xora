import { NextResponse } from "next/server";

import { createUserCaller, handleApiRouteError, readJsonBody } from "@/server/api/helpers/trpc-route";
import type { UserCaller } from "@/server/api/helpers/trpc-route";

export async function POST(req: Request) {
  try {
    const caller = await createUserCaller(req);
    const payload = await readJsonBody<Parameters<UserCaller["follow"]>[0]>(req);
    await caller.follow(payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiRouteError(error);
  }
}
