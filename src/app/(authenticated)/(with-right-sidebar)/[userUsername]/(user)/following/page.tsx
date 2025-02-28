import { PageHeader } from "@/components/page-header";
import { UserListView } from "@/components/user-list-view";
import { Metadata } from "next";

type Params = Promise<{ userUsername: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { userUsername } = await params;

  return {
    title: `People followed by @${userUsername}`,
    description: `People that @${userUsername} follows`,
  };
}

export default async function FollowingPage({ params }: { params: Params }) {
  const { userUsername } = await params;

  return (
    <div>
      <PageHeader title="Following" subtitle={`@${userUsername}`} />
      <UserListView type="following" username={userUsername} />
    </div>
  );
} 