import { useSession } from "@/app/session-provider";
import { BellIcon, BookmarkIcon, HomeIcon, UserIcon } from "lucide-react";

export function useNavbarMenu() {
  const { user } = useSession();

  return [
    { name: "Home", icon: HomeIcon, link: "/home" },
    { name: "Notifications", icon: BellIcon, link: "/notifications" },
    { name: "Bookmarks", icon: BookmarkIcon, link: "/bookmarks" },
    { name: "Profile", icon: UserIcon, link: `/${user.username}` },
  ];
} 