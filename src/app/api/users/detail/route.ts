import { NextResponse } from "next/server";

import { createUserCaller, handleApiRouteError, searchParamsToInput } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createUserCaller(req);
    const { searchParams } = new URL(req.url);
    const params = searchParamsToInput<{ userId?: number }>(searchParams);
    const userId = params.userId;

    if (typeof userId !== "number") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await caller.getById({ userId });
    return NextResponse.json(user);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
