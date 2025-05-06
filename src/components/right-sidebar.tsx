'use client';

import { useSession } from "@/app/session-provider";
import { TopCryptoAccounts } from "@/components/top-crypto-accounts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UserSuggestion } from "@/components/user-suggestion";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/utils/api";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function UserSuggestionSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-9 w-16 rounded-md ml-4" />
    </div>
  );
}

interface TrendingTopic {
  tag: string;
  count: number;
}

function TrendingTopicSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

function TrendingTopic({ topic }: { topic: TrendingTopic }) {
  return (
    <Link
      href={`/search?q=%23${topic.tag}`}
      className="block space-y-1 rounded-lg p-3 transition-colors hover:bg-muted"
    >
      <p className="font-medium">#{topic.tag}</p>
      <p className="text-sm text-muted-foreground">
        {topic.count} {topic.count === 1 ? 'post' : 'posts'}
      </p>
    </Link>
  );
}

export function RightSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const router = useRouter();
  const { user } = useSession();

  const { data: searchResults, isLoading: isSearching } = api.user.search.useQuery(
    { query: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.length > 0 }
  );

  const { data: suggestions, isLoading: isSuggestionsLoading } =
    api.user.getRandomSuggestions.useQuery({
      limit: 5
    });

  const { data: trendingTopics, isLoading: isTopicsLoading } =
    api.post.getTrendingHashtags.useQuery({
      limit: 5
    });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const query = searchQuery.trim();
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery("");
    }
  };

  return (
    <aside className="sticky top-0 hidden w-[350px] pl-8 xl:block">
      <div className="space-y-6 py-5">
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleSearch}
          />

          {isSearchOpen && debouncedQuery.length > 0 && (
            <div className="absolute top-full z-50 mt-2 w-full rounded-lg border bg-background shadow-lg">
              {isSearching ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults?.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              ) : (
                <div className="py-2">
                  {searchResults?.map((user) => (
                    <Link
                      key={user.id}
                      href={`/${user.username}`}
                      className="block px-4 py-2 hover:bg-muted"
                    >
                      <p className="font-medium">{`@${user.username}`}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Card className="overflow-hidden">
          <div className="p-4">
            <h2 className="text-xl font-bold">Trending</h2>
          </div>
          <div className="divide-y">
            {isTopicsLoading ? (
              <div className="space-y-4 p-4">
                <TrendingTopicSkeleton />
                <TrendingTopicSkeleton />
                <TrendingTopicSkeleton />
                <TrendingTopicSkeleton />
                <TrendingTopicSkeleton />
              </div>
            ) : trendingTopics?.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No trending topics
              </div>
            ) : (
              trendingTopics?.map((topic) => (
                <TrendingTopic key={topic.tag} topic={topic} />
              ))
            )}
          </div>
        </Card>

        {
          user && (
            <>

              <div className="rounded-xl bg-muted/50 p-4">
                <h2 className="mb-4 text-xl font-bold">Who to follow</h2>
                <div className="space-y-4">
                  {isSuggestionsLoading ? (
                    <>
                      <UserSuggestionSkeleton />
                      <UserSuggestionSkeleton />
                      <UserSuggestionSkeleton />
                      <UserSuggestionSkeleton />
                      <UserSuggestionSkeleton />
                    </>
                  ) : suggestions?.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground">
                      No suggestions available
                    </div>
                  ) : (
                    suggestions?.map((user) => (
                      <UserSuggestion key={user.id} user={user} />
                    ))
                  )}
                </div>
              </div>
              <TopCryptoAccounts />
            </>
          )
        }

      </div>
    </aside>
  );
} 