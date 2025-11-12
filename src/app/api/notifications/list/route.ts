import { NextResponse } from "next/server";

import { createNotificationCaller, handleApiRouteError, searchParamsToInput } from "@/server/api/helpers/trpc-route";
import type { NotificationCaller } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createNotificationCaller(req);
    const { searchParams } = new URL(req.url);
    const payload = searchParamsToInput<Parameters<NotificationCaller["list"]>[0]>(searchParams);
    const notifications = await caller.list(payload);
    return NextResponse.json(notifications);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
