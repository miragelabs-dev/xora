import { createClient } from "@openauthjs/openauth/client";
import { createSubjects } from "@openauthjs/openauth/subject";
import { object, string } from "valibot";

const CHOPIN_CLIENT_ID = process.env.CHOPIN_CLIENT_ID ?? "prealpha";
const CHOPIN_ISSUER =
  process.env.CHOPIN_ISSUER ?? "https://prealpha-login.chopin.sh";

export const chopinSubjects = createSubjects({
  user: object({
    id: string(),
  }),
});

export const chopinClient = createClient({
  clientID: CHOPIN_CLIENT_ID,
  issuer: CHOPIN_ISSUER,
});

export async function authorizeWithChopin(
  redirectUri: string,
  opts?: { provider?: string }
) {
  const result = await chopinClient.authorize(redirectUri, "code", {
    pkce: true,
    provider: opts?.provider,
  });

  return result;
}

export async function exchangeAuthorizationCode(
  code: string,
  redirectUri: string,
  verifier?: string
) {
  const result = await chopinClient.exchange(code, redirectUri, verifier);

  if (result.err) {
    throw new Error("Invalid authorization code");
  }

  return result.tokens;
}

export function extractBearerToken(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

export async function verifyAccessToken(token: string) {
  try {
    const verified = await chopinClient.verify(chopinSubjects, token);

    if (verified.err || !verified.subject) {
      return null;
    }

    const address = verified.subject.properties?.id;
    if (!address) {
      return null;
    }

    return { address };
  } catch {
    return null;
  }
}

export async function resolveAddress(req?: Request) {
  if (!req) {
    return null;
  }

  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) {
    return null;
  }

  const verified = await verifyAccessToken(token);
  return verified?.address ?? null;
}
