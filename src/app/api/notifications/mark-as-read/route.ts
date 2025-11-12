import { NextResponse } from "next/server";

import { createNotificationCaller, handleApiRouteError, readJsonBody } from "@/server/api/helpers/trpc-route";
import type { NotificationCaller } from "@/server/api/helpers/trpc-route";

export async function POST(req: Request) {
  try {
    const caller = await createNotificationCaller(req);
    const payload = await readJsonBody<Parameters<NotificationCaller["markAsRead"]>[0]>(req);
    await caller.markAsRead(payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiRouteError(error);
  }
}
