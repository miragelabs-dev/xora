import { TRPCError } from "@trpc/server";

const codeToStatus: Record<string, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export function toHttpError(err: unknown): { status: number; body: any } {
  console.log(err);

  if (err instanceof SyntaxError) {
    return { status: 400, body: { error: "BAD_REQUEST", message: "Invalid JSON body" } };
  }

  if (err && typeof err === "object" && "name" in err && (err as any).name === "ZodError") {
    return { status: 400, body: { error: "BAD_REQUEST", details: (err as any).issues } };
  }

  if (err instanceof TRPCError) {
    const status = codeToStatus[err.code] ?? 500;
    return { status, body: { error: err.code, message: err.message } };
  }

  return { status: 500, body: { error: "INTERNAL_SERVER_ERROR" } };
}
