import { PageHeader } from "@/components/page-header";
import { ProfileView } from "@/components/profile-view";
import { Metadata } from "next";

type Params = Promise<{ userUsername: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { userUsername } = await params;

  return {
    title: `@${userUsername}`,
    description: `Profile of @${userUsername}`,
  };
}

export default async function UserProfilePage({ params }: { params: Params }) {
  const { userUsername } = await params;

  return (
    <div>
      <PageHeader
        title={`@${userUsername}`}
      />
      <ProfileView username={userUsername} />
    </div>
  );
} 