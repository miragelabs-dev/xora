import { Db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function setUserId(db: Db, userId: number | undefined) {
  await db.execute(sql`SET app.user_id = ${sql.raw(userId?.toString() ?? '0')}`);
} 