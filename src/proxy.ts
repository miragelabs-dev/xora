import { chopinClient, chopinSubjects } from "@/lib/chopin-auth";
import { middleware as chopinMiddleware } from "@chopinframework/next";
import { NextResponse, type NextRequest } from "next/server";

const TOKEN_MAX_AGE_SECONDS = 34_560_000;

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function configuredOrigin(): string | null {
  const origin = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;

  if (!origin) {
    return null;
  }

  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
}

function getRequestOrigin(request: NextRequest): string {
  const configured = configuredOrigin();
  if (configured) {
    return configured;
  }

  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ??
    request.headers.get("host") ??
    request.nextUrl.host;
  const forwardedProto = firstHeaderValue(
    request.headers.get("x-forwarded-proto")
  );
  const proto =
    forwardedProto === "http" || forwardedProto === "https"
      ? forwardedProto
      : host.includes("localhost") || host.startsWith("127.")
        ? "http"
        : "https";

  return `${proto}://${host}`;
}

function getCallbackUrl(request: NextRequest): string {
  return `${getRequestOrigin(request)}/_chopin/auth-callback`;
}

function cookieOptions(origin: string): string {
  const secure = origin.startsWith("https://") ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_MAX_AGE_SECONDS}${secure}`;
}

function setTokens(
  response: NextResponse,
  origin: string,
  access: string,
  refresh: string
) {
  const options = cookieOptions(origin);

  response.headers.set("Set-Cookie", `access_token=${access}; ${options}`);
  response.headers.append("Set-Cookie", `refresh_token=${refresh}; ${options}`);

  return response;
}

function clearTokenCookies(response: NextResponse, origin: string) {
  const secure = origin.startsWith("https://") ? "; Secure" : "";

  response.headers.set(
    "Set-Cookie",
    `access_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
  response.headers.append(
    "Set-Cookie",
    `refresh_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
  response.headers.append(
    "Set-Cookie",
    `dev-address=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );

  return response;
}

async function getVerifiedAddress(request: NextRequest) {
  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");

  if (!accessToken) {
    return null;
  }

  const verified = await chopinClient.verify(
    chopinSubjects,
    accessToken.value,
    {
      refresh: refreshToken?.value,
    }
  );

  if (verified.err) {
    return null;
  }

  return {
    address: verified.subject.properties.id,
    tokens: verified.tokens,
  };
}

async function login(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const verified = await getVerifiedAddress(request);

  if (verified?.tokens) {
    const response = NextResponse.redirect(new URL("/", origin));
    return setTokens(
      response,
      origin,
      verified.tokens.access,
      verified.tokens.refresh
    );
  }

  if (verified?.address) {
    return NextResponse.redirect(new URL("/", origin));
  }

  const { url } = await chopinClient.authorize(getCallbackUrl(request), "code");
  return NextResponse.redirect(url);
}

async function logout(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const response = NextResponse.redirect(new URL("/", origin));

  return clearTokenCookies(response, origin);
}

async function me(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const verified = await getVerifiedAddress(request);
  const response = NextResponse.json({ address: verified?.address ?? null });

  if (verified?.tokens) {
    return setTokens(
      response,
      origin,
      verified.tokens.access,
      verified.tokens.refresh
    );
  }

  return response;
}

async function authCallback(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = getRequestOrigin(request);
  const redirectUri = getCallbackUrl(request);

  if (!code) {
    return NextResponse.json(
      { error: "missing_code", message: "Chopin callback did not include code" },
      { status: 400 }
    );
  }

  const exchanged = await chopinClient.exchange(code, redirectUri);

  if (exchanged.err) {
    console.error("[chopin] Authorization code exchange failed", {
      message: exchanged.err.message,
      redirectUri,
    });

    return NextResponse.json(
      {
        error: "invalid_authorization_code",
        message: exchanged.err.message,
      },
      { status: 400 }
    );
  }

  const response = NextResponse.redirect(new URL("/", origin));
  return setTokens(
    response,
    origin,
    exchanged.tokens.access,
    exchanged.tokens.refresh
  );
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/_chopin/login")) {
    return login(request);
  }

  if (request.nextUrl.pathname.startsWith("/_chopin/logout")) {
    return logout(request);
  }

  if (request.nextUrl.pathname.startsWith("/_chopin/me")) {
    return me(request);
  }

  if (request.nextUrl.pathname.startsWith("/_chopin/auth-callback")) {
    return authCallback(request);
  }

  return chopinMiddleware(request);
}
