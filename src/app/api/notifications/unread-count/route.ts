import { NextResponse } from "next/server";

import { createNotificationCaller, handleApiRouteError } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createNotificationCaller(req);
    const count = await caller.getUnreadCount();
    return NextResponse.json({ count });
  } catch (error) {
    return handleApiRouteError(error);
  }
}
