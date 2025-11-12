import { NextResponse } from "next/server";

import { createUserCaller, handleApiRouteError } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createUserCaller(req);
    const stats = await caller.getLandingStats();
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
