import { NextRequest, NextResponse } from "next/server";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const [messagesCount, notificationsCount] = await Promise.all([
      caller.message.getUnreadCount(),
      caller.notification.getUnreadCount(),
    ]);

    const data = {
      messages_unread_count: messagesCount,
      notifications_unread_count: notificationsCount,
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
