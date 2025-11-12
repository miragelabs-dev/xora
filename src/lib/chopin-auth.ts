import { createClient } from "@openauthjs/openauth/client";
import { createSubjects } from "@openauthjs/openauth/subject";
import { object, string } from "valibot";

const CHOPIN_CLIENT_ID = process.env.CHOPIN_CLIENT_ID ?? "prealpha";
const CHOPIN_ISSUER = process.env.CHOPIN_ISSUER ?? "https://prealpha-login.chopin.sh";

export const chopinSubjects = createSubjects({
  user: object({
    id: string(),
  }),
});

export const chopinClient = createClient({
  clientID: CHOPIN_CLIENT_ID,
  issuer: CHOPIN_ISSUER,
});

export async function authorizeWithChopin(redirectUri: string, opts?: { provider?: string }) {
  const result = await chopinClient.authorize(redirectUri, "code", {
    pkce: true,
    provider: opts?.provider,
  });

  return result;
}

export async function exchangeAuthorizationCode(code: string, redirectUri: string, verifier?: string) {
  const result = await chopinClient.exchange(code, redirectUri, verifier);

  if (result.err) {
    throw new Error("Invalid authorization code");
  }

  return result.tokens;
}

export async function refreshChopinTokens(refreshToken: string) {
  const result = await chopinClient.refresh(refreshToken);

  if (result.err || !result.tokens) {
    throw new Error("Invalid refresh token");
  }

  return result.tokens;
}

export async function verifyAccessToken(accessToken: string) {
  const result = await chopinClient.verify(chopinSubjects, accessToken);

  if ("err" in result) {
    return null;
  }

  return {
    address: result.subject.properties.id,
    tokens: result.tokens,
  };
}
