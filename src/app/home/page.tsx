import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Page() {

  return (
    <div>
      <div className="sticky top-0 z-[25] h-auto w-full">
        <Tabs defaultValue="for-you">
          <TabsList className="w-full">
            <TabsTrigger value="for-you" className="flex-1">
              For You
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {
        // TODO: Implement for you feed
      }
    </div>
  );
}
