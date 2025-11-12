import { NextResponse } from "next/server";

import { createUserCaller, handleApiRouteError, searchParamsToInput } from "@/server/api/helpers/trpc-route";
import type { UserCaller } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createUserCaller(req);
    const { searchParams } = new URL(req.url);
    const payload = searchParamsToInput<Parameters<UserCaller["search"]>[0]>(searchParams);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    payload.query = query;

    const results = await caller.search(payload);
    return NextResponse.json(results);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
