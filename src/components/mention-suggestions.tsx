import { UserAvatar } from "@/components/user-avatar";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface MentionSuggestionsProps {
  query: string;
  onSelect: (username: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function MentionSuggestions({
  query,
  onSelect,
  isOpen,
  onClose,
}: MentionSuggestionsProps) {
  const { data: users, isLoading } = api.user.search.useQuery(
    { query: query.slice(1), limit: 5 },
    { enabled: isOpen && query.length > 1 }
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute z-50 mt-1 w-72 rounded-lg border bg-background shadow-lg"
    >
      <div className="p-1">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : !users?.length ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No users found
          </div>
        ) : (
          users.map((user) => (
            <button
              key={user.id}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              onClick={() => onSelect(user.username)}
            >
              <UserAvatar
                src={user.image}
                fallback={user.username[0]}
                className="h-6 w-6"
              />
              <div className="flex flex-col items-start">
                <span className="font-medium">@{user.username}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
} 