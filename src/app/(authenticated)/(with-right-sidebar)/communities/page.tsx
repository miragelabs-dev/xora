import { CommunityListView } from "@/components/community-list-view";
import { CreateCommunityModal } from "@/components/create-community-modal";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communities",
  description: "Discover communities and see where people gather.",
};

export default function CommunitiesPage() {
  return (
    <div>
      <PageHeader
        title="Communities"
        toolbar={
          <CreateCommunityModal>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -m-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CreateCommunityModal>
        }
      />
      <CommunityListView />
    </div>
  );
}
