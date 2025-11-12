import { getAddress } from '@chopinframework/next';
import { db } from "./db";
import { users } from "./db/schema";
import { verifyAccessToken } from "./chopin-auth";

function generateRandomUsername(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => String.fromCharCode(97 + (b % 26)))
    .join('');
}

function extractBearerToken(headerValue?: string | null) {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.split(' ');
  if (!token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }

  return token.trim();
}

async function resolveAddress(req?: Request) {
  if (req) {
    const token = extractBearerToken(req.headers.get('authorization'));

    if (token) {
      const verified = await verifyAccessToken(token);

      if (verified?.address) {
        return verified.address;
      }
    }
  }

  return await getAddress();
}

export async function upsertUser(address: string) {
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

  return user;
}

export async function validateRequest(req?: Request) {
  try {
    const address = await resolveAddress(req);

    if (!address) {
      return null;
    }

    const user = await upsertUser(address);

    return { user };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
    throw new Error('Authentication failed');
  }
}
