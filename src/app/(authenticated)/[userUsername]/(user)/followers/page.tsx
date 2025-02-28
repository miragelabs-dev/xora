import { PageHeader } from "@/components/page-header";
import { UserListView } from "@/components/user-list-view";

type Params = Promise<{ userUsername: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { userUsername } = await params;

  return {
    title: `People following @${userUsername}`,
    description: `@${userUsername}'s followers`,
  };
}

export default async function FollowersPage({ params }: { params: Params }) {
  const { userUsername } = await params;

  return (
    <div>
      <PageHeader title="Followers" subtitle={`@${userUsername}`} />
      <UserListView type="followers" username={userUsername} />
    </div>
  );
} 