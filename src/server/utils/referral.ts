import { db } from "@/lib/db";
import { referrals, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function processReferral(userId: number, referralCode: string) {
  try {
    const referrer = await db.query.users.findFirst({
      where: eq(users.referralCode, referralCode),
    });

    if (!referrer) {
      console.log(`Invalid referral code: ${referralCode}`);
      return;
    }

    if (referrer.id === userId) {
      console.log(`Self-referral attempt blocked for user ${userId}`);
      return;
    }

    const existingReferral = await db.query.referrals.findFirst({
      where: eq(referrals.referredUserId, userId),
    });

    if (existingReferral) {
      console.log(`User ${userId} already has a referrer`);
      return;
    }

    await db.insert(referrals).values({
      referrerUserId: referrer.id,
      referredUserId: userId,
    });

    console.log(`Referral created: User ${userId} referred by ${referrer.id} (${referralCode})`);
  } catch (error) {
    console.error('Error processing referral:', error);
  }
}