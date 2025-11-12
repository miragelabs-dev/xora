import { NextResponse } from "next/server";

import { createUserCaller, handleApiRouteError, searchParamsToInput } from "@/server/api/helpers/trpc-route";
import type { UserCaller } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createUserCaller(req);
    const { searchParams } = new URL(req.url);
    const payload = searchParamsToInput<Parameters<UserCaller["getRandomUsers"]>[0]>(searchParams);
    const users = await caller.getRandomUsers(payload);
    return NextResponse.json(users);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
