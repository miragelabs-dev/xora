import { Session } from "@/types";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "./db";
import { users } from "./db/schema";

const CHOPIN_PUBLIC_KEY = "";

export async function validateRequest(): Promise<Session | null> {
  try {
    const token = cookies().get("chopin_jwt")?.value;

    console.log("token", token);

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, CHOPIN_PUBLIC_KEY, { algorithms: ["none"] });
    const address = decoded.sub as string;
    console.log("address", address);

    const [user] = await db
      .insert(users)
      .values({
        address,
        username: Array.from(crypto.getRandomValues(new Uint8Array(6))).map(b => String.fromCharCode(97 + (b % 26))).join(''),
      })
      .onConflictDoUpdate({
        target: users.address,
        set: {
          address: address
        },
      })
      .returning({
        id: users.id,
        address: users.address,
        username: users.username,
      });

    return user;
  } catch (error) {
    if (error instanceof Error) {
      console.error("JWT validation error:", error);
    }
    return null;
  }
}