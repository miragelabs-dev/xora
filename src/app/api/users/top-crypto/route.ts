import { NextResponse } from "next/server";

import { createUserCaller, handleApiRouteError } from "@/server/api/helpers/trpc-route";

export async function GET(req: Request) {
  try {
    const caller = await createUserCaller(req);
    const accounts = await caller.getTopCryptoAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
