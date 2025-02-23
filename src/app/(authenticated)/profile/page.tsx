import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { validateRequest } from "@/lib/session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await validateRequest();

  if (session?.id) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.id),
    });
    if (user) {
      redirect(`/${user.username}`);
    }
  }

  return <div>Profile</div>;
}
