import { jwtVerify } from 'jose';
import { cookies } from "next/headers";
import { db } from "./db";
import { users } from "./db/schema";

interface JWTPayload {
  mode: string;
  type: string;
  properties: {
    id: string;
  };
  aud: string;
  iss: string;
  sub: string;
  exp: number;
}

const JWKS_URL = 'https://prealpha-login.chopin.sh/.well-known/jwks.json';
const ISSUER = 'https://prealpha-login.chopin.sh';
const AUDIENCE = 'prealpha';

async function getPublicKey(kid: string): Promise<CryptoKey> {
  const jwksResponse = await fetch(JWKS_URL);

  if (!jwksResponse.ok) {
    throw new Error(`Failed to fetch JWKS: ${jwksResponse.statusText}`);
  }

  const jwks = await jwksResponse.json();
  const key = jwks.keys.find((k: { kid: string }) => k.kid === kid);

  if (!key) {
    throw new Error('Public key not found');
  }

  return await crypto.subtle.importKey(
    'jwk',
    key,
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    true,
    ['verify']
  );
}

function generateRandomUsername(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => String.fromCharCode(97 + (b % 26)))
    .join('');
}

export async function validateRequest() {
  try {
    const token = cookies().get("access_token")?.value;

    if (!token) {
      return null;
    }

    const [headerB64] = token.split('.');

    if (!headerB64) {
      throw new Error('Invalid token format');
    }

    const header = JSON.parse(atob(headerB64));
    const publicKey = await getPublicKey(header.kid);

    const { payload } = await jwtVerify(token, publicKey, {
      issuer: ISSUER,
      audience: AUDIENCE
    }) as { payload: JWTPayload };

    const address = payload.properties.id;

    const [user] = await db
      .insert(users)
      .values({
        address,
        username: generateRandomUsername(),
      })
      .onConflictDoUpdate({
        target: users.address,
        set: {
          address
        },
      })
      .returning();

    if (!user) {
      throw new Error('Failed to create or update user');
    }

    return { user };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
    throw new Error('Authentication failed');
  }
}