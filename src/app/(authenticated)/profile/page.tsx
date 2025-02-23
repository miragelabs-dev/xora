import { validateRequest } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await validateRequest();

  if (session?.id) {
    redirect(`/users/${session.id}`);
  }

  return <div>Profile</div>;
}
