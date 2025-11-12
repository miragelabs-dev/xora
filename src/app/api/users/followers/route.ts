import { NextResponse } from "next/server";

import { createUserCaller, handleApiRouteError, searchParamsToInput } from "@/server/api/helpers/trpc-route";
import type { UserCaller } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createUserCaller(req);
    const { searchParams } = new URL(req.url);
    const params = searchParamsToInput<{ username?: string; limit?: number; cursor?: number }>(searchParams);
    const { username, limit, cursor } = params;

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "username is required" }, { status: 400 });
    }

    const payload: Parameters<UserCaller["getFollowers"]>[0] = {
      username,
      ...(typeof limit === "number" ? { limit } : {}),
      ...(typeof cursor === "number" ? { cursor } : {}),
    };

    const followers = await caller.getFollowers(payload);
    return NextResponse.json(followers);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
