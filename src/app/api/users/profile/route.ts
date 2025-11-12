import { NextResponse } from "next/server";

import { createUserCaller, handleApiRouteError, searchParamsToInput } from "@/server/api/helpers/trpc-route";
import type { UserCaller } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createUserCaller(req);
    const { searchParams } = new URL(req.url);
    const params = searchParamsToInput<{ username?: string }>(searchParams);
    const username = params.username ?? searchParams.get("username");

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "username is required" }, { status: 400 });
    }

    const profile = await caller.getProfileByUsername({ username });
    return NextResponse.json(profile);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
