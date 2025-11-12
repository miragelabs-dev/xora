import { authorizeWithChopin } from "@/lib/chopin-auth";
import { HttpError, handleApiRouteError } from "@/server/api/helpers/trpc-route";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  redirectUri: z.string().url(),
  provider: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => {
      throw new HttpError(400, "Invalid JSON body");
    });

    const body = requestSchema.parse(json);

    const { url, challenge } = await authorizeWithChopin(body.redirectUri, {
      provider: body.provider,
    });

    return NextResponse.json({ url, challenge });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleApiRouteError(new HttpError(400, error.errors[0]?.message ?? "Invalid request body"));
    }

    return handleApiRouteError(error);
  }
}
