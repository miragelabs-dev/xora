import { CollectionsView } from "@/components/collections-view";
import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'NFT Collections',
  description: 'Browse and manage your NFT collections',
};

export default function CollectionsPage() {
  return (
    <>
      <PageHeader title="NFT Collections" />
      <CollectionsView />
    </>
  );
} 