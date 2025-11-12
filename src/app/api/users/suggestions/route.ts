import { NextResponse } from "next/server";

import { createUserCaller, handleApiRouteError, searchParamsToInput } from "@/server/api/helpers/trpc-route";
import type { UserCaller } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createUserCaller(req);
    const { searchParams } = new URL(req.url);
    const payload = searchParamsToInput<Parameters<UserCaller["getRandomSuggestions"]>[0]>(searchParams);
    const suggestions = await caller.getRandomSuggestions(payload);
    return NextResponse.json(suggestions);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
