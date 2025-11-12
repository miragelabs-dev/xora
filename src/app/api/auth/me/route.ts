import { NextResponse } from "next/server";

import { createAuthCaller, handleApiRouteError } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createAuthCaller(req);
    const me = await caller.me();
    return NextResponse.json(me);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
