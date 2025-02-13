import "dotenv/config";

import { reset } from "drizzle-seed";

import { db } from ".";
import * as schema from "./schema";

async function main() {
  await reset(db, schema);

  // TODO: Add seed data here
}

main();
