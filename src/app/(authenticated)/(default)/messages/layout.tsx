'use client';

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/user-avatar";
import { User } from "@/lib/db/schema";
import { api } from "@/utils/api";
import { CheckIcon, Loader2, MessageCirclePlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewMessageModal() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Pick<User, "id" | "username" | "image">[]>([]);
  const router = useRouter();

  const createConversation = api.message.createConversation.useMutation({
    onSuccess: (data) => {
      setOpen(false);
      setSelected([]);

      router.push(`/messages/${data.id}`);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MessageCirclePlusIcon className="w-4 h-4" />
          <span className="hidden md:block">New Message</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <UserSelectList selected={selected} onSelect={(user) => {
          if (selected.some(u => u.id === user.id)) {
            setSelected(selected.filter(u => u.id !== user.id));
          } else {
            setSelected([...selected, user]);
          }
        }} />
        <DialogFooter>
          <Button
            onClick={() => createConversation.mutate({ userIds: selected.map(u => u.id) })}
            disabled={selected.length === 0}
          >
            Next
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[calc(100vh-55px)] lg:h-screen flex flex-col">
      <PageHeader title="Messages" toolbar={
        <NewMessageModal />
      } />
      <div className="grid grid-cols-1 flex-1 md:grid-cols-[380px_1fr] flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function UserSelectList({
  selected,
  onSelect
}: {
  selected: Pick<User, "id" | "username" | "image">[];
  onSelect: (user: Pick<User, "id" | "username" | "image">) => void;
}) {
  const [query, setQuery] = useState("");
  const { data: users, isFetching } = api.user.search.useQuery({ query, limit: 20 }, { enabled: query.length > 0 });

  return (
    <Command shouldFilter={false}>
      <CommandInput value={query} onValueChange={setQuery} />
      <CommandList>
        {isFetching && <CommandItem className="flex justify-center gap-2 py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
        </CommandItem>}
        <CommandEmpty>No results found.</CommandEmpty>
        {users?.map((user) => {
          const isSelected = selected.some(u => u.id === user.id);

          return (
            <CommandItem className={
              isSelected ? "bg-muted" : ""
            } key={user.id} onSelect={() => onSelect(user)}>
              <div className="flex gap-2 items-center w-full">
                <UserAvatar src={user.image} />
                <p className="flex-1">{user.username}</p>
                {isSelected && <CheckIcon className="w-4 h-4" />}
              </div>
            </CommandItem>
          );
        })}
      </CommandList>
    </Command>
  );
} 