import { refreshChopinTokens, verifyAccessToken } from "@/lib/chopin-auth";
import { upsertUser } from "@/lib/session";
import { HttpError, handleApiRouteError } from "@/server/api/helpers/trpc-route";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  refreshToken: z.string(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => {
      throw new HttpError(400, "Invalid JSON body");
    });

    const body = requestSchema.parse(json);

    const tokens = await refreshChopinTokens(body.refreshToken);
    const verified = await verifyAccessToken(tokens.access);

    if (!verified?.address) {
      throw new HttpError(401, "Invalid access token");
    }

    const user = await upsertUser(verified.address);

    return NextResponse.json({
      accessToken: tokens.access,
      refreshToken: tokens.refresh,
      address: verified.address,
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleApiRouteError(new HttpError(400, error.errors[0]?.message ?? "Invalid request body"));
    }

    if (error instanceof Error && error.message === "Invalid refresh token") {
      return handleApiRouteError(new HttpError(400, error.message));
    }

    return handleApiRouteError(error);
  }
}
