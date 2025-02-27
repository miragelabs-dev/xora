import "dotenv/config";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const CRYPTO_BOTS = [
  {
    username: "Bitcoin",
    bio: "Official Bitcoin account 🚀 #BTC",
    image: "https://bitcoin.org/img/icons/opengraph.png"
  },
  {
    username: "Ethereum",
    bio: "Official Ethereum account 💎 #ETH",
    image: "https://ethereum.org/static/eth-diamond-purple-purple.png"
  },
];

async function seedCryptoBots() {
  for (const bot of CRYPTO_BOTS) {
    await db
      .insert(users)
      .values({
        address: `bot-${bot.username.toLowerCase()}`,
        username: bot.username,
        bio: bot.bio,
        image: bot.image,
        isCryptoBot: true,
        isVerified: true,
      })
      .onConflictDoUpdate({
        target: users.address,
        set: {
          bio: bot.bio,
          image: bot.image,
          isCryptoBot: true,
          isVerified: true,
        },
      });
  }

  console.log("✅ Crypto bots seeded successfully");
}

seedCryptoBots().catch(console.error); 