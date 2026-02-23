import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { toHttpError } from "@/server/http/trpc-to-http";

export const runtime = "nodejs";

const UpdateProfileBody = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    ),
  bio: z.string()
    .max(160, "Bio must be less than 160 characters")
    .nullable(),
  image: z.string().nullable(),
  cover: z.string().nullable(),
});

export async function PATCH(req: NextRequest) {
  try {
    const json = await req.json();
    const input = UpdateProfileBody.parse(json);

    const ctx = await createTRPCContext(req);
    const caller = appRouter.createCaller(ctx);

    const data = await caller.user.updateProfile(input);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
