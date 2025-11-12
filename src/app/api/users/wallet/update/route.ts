import { NextResponse } from "next/server";

import { createUserCaller, handleApiRouteError, readJsonBody } from "@/server/api/helpers/trpc-route";
import type { UserCaller } from "@/server/api/helpers/trpc-route";

export async function POST(req: Request) {
  try {
    const caller = await createUserCaller(req);
    const payload = await readJsonBody<Parameters<UserCaller["updateWalletAddress"]>[0]>(req);
    const updated = await caller.updateWalletAddress(payload);
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
