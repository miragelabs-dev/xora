import { appRouter } from "@/server/api/routers";
import { createTRPCContext } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { NextResponse } from "next/server";

const TRPC_STATUS_MAP: Partial<Record<TRPC_ERROR_CODE_KEY, number>> = {
  PARSE_ERROR: 400,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_SUPPORTED: 405,
  TIMEOUT: 504,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_CONTENT: 422,
  CLIENT_CLOSED_REQUEST: 499,
};

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

type AppRouterCaller = ReturnType<(typeof appRouter)["createCaller"]>;
type RouterKey = keyof AppRouterCaller;

export type RouterCaller<K extends RouterKey> = AppRouterCaller[K];

export async function createRouterCaller<K extends RouterKey>(
  req: Request,
  routerKey: K
): Promise<AppRouterCaller[K]> {
  const ctx = await createTRPCContext(req);
  const caller = appRouter.createCaller(ctx);
  return caller[routerKey];
}

export function createRouterCallerFactory<K extends RouterKey>(routerKey: K) {
  return (req: Request) => createRouterCaller(req, routerKey);
}

export const createPostCaller = createRouterCallerFactory("post");
export const createUserCaller = createRouterCallerFactory("user");
export const createAuthCaller = createRouterCallerFactory("auth");
export const createNotificationCaller = createRouterCallerFactory("notification");

export type PostCaller = Awaited<ReturnType<typeof createPostCaller>>;
export type UserCaller = Awaited<ReturnType<typeof createUserCaller>>;
export type AuthCaller = Awaited<ReturnType<typeof createAuthCaller>>;
export type NotificationCaller = Awaited<ReturnType<typeof createNotificationCaller>>;

export async function readJsonBody<T>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}

export function handleApiRouteError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof TRPCError) {
    const status = TRPC_STATUS_MAP[error.code] ?? 500;
    return NextResponse.json({ error: error.message, code: error.code }, { status });
  }

  console.error("API route error:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

export function searchParamsToInput<T extends Record<string, unknown>>(searchParams: URLSearchParams) {
  const payload: Partial<T> = {};

  for (const [key, value] of searchParams.entries()) {
    if (value === "") {
      continue;
    }

    const numericValue = Number(value);
    (payload as Record<string, unknown>)[key] = Number.isNaN(numericValue) ? value : numericValue;
  }

  return payload as T;
}
