import { getAddress } from '@chopinframework/next';
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema";

function generateRandomUsername(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => String.fromCharCode(97 + (b % 26)))
    .join('');
}

export async function validateRequest() {
  try {
    const address = await getAddress();

    if (!address) {
      return null;
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.address, address),
    });

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