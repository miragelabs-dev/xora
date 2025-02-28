import { Metadata } from "next";
import { CollectionDetail } from "./collection-detail";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: `NFT Collection`,
  description: `View NFT collection`,
};

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <CollectionDetail collectionId={parseInt(id)} />
  );
} 