import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const CHOPIN_PUBLIC_KEY = "";

export async function validateRequest() {
  try {
    const token = (await cookies()).get("chopin_jwt")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, CHOPIN_PUBLIC_KEY, { algorithms: ["none"] });

    return {
      address: decoded.sub as string
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("JWT validation error:", error.message);
    }

    return null;
  }
}