'use client';

import { Feed } from "@/components/feed";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/user-avatar";
import { UserListSkeleton } from "@/components/user-list-skeleton";
import { api } from "@/utils/api";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [activeTab, setActiveTab] = useState<'posts' | 'people'>('posts');

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery !== query) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="relative m-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search posts and people"
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'posts' | 'people')}>
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">
            Posts
          </TabsTrigger>
          <TabsTrigger value="people" className="flex-1">
            People
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'posts' ? (
        <Feed type="search" searchQuery={searchQuery} />
      ) : (
        <UserSearchResults query={searchQuery} />
      )}
    </div>
  );
}

function UserSearchResults({ query }: { query: string }) {
  const { data: users, isLoading } = api.user.search.useQuery(
    { query, limit: 20 },
    { enabled: query.length > 0 }
  );

  if (isLoading) {
    return <UserListSkeleton />;
  }

  if (!users?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No users found
      </div>
    );
  }

  return (
    <div>
      {users.map((user) => (
        <Link
          key={user.id}
          href={`/${user.username}`}
          className="flex items-center gap-3 border-b border-border p-4 hover:bg-muted/50"
        >
          <UserAvatar
            src={user.image}
            className="h-10 w-10"
            fallback={user.username[0]}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {`@${user.username}`}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
} 