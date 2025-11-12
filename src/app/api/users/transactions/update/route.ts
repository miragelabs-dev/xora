import { NextResponse } from "next/server";

import { createUserCaller, handleApiRouteError, searchParamsToInput } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createUserCaller(req);
    const { searchParams } = new URL(req.url);
    const params = searchParamsToInput<{ userUsername?: string }>(searchParams);
    const userUsername = params.userUsername ?? searchParams.get("userUsername");

    if (!userUsername || typeof userUsername !== "string") {
      return NextResponse.json({ error: "userUsername is required" }, { status: 400 });
    }

    const result = await caller.updateTransactionCount({ userUsername });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
