import { CollectionDetail } from "./collection-detail";

interface CollectionDetailPageProps {
  params: {
    id: string;
  };
}

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  return (
    <main className="flex-1">
      <div className="container max-w-2xl flex-1 px-4">
        <CollectionDetail collectionId={parseInt(params.id)} />
      </div>
    </main>
  );
} 