import { SearchView } from "@/components/search-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for posts and people",
};

export default function SearchPage() {
  return (
    <div>
      <SearchView />
    </div>
  );
} 