import { NextResponse } from "next/server";

import { createNotificationCaller, handleApiRouteError } from "@/server/api/helpers/trpc-route";

export async function POST(req: Request) {
  try {
    const caller = await createNotificationCaller(req);
    await caller.markAllAsRead();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiRouteError(error);
  }
}
