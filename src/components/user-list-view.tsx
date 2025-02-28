'use client';

import { UserList } from "@/components/user-list";

interface UserListViewProps {
  username: string;
  type: 'followers' | 'following';
}

export function UserListView({ username, type }: UserListViewProps) {
  return <UserList type={type} username={username} />;
} 