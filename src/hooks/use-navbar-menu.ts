import { useSession } from "@/app/session-provider";
import { Bookmark, Home, Library, MessageCircle, User } from "lucide-react";

export function useNavbarMenu() {
  const { user } = useSession();

  return [
    {
      name: "Home",
      link: "/home",
      icon: Home,
    },
    {
      name: "NFT Collections",
      link: "/nft-collections",
      icon: Library,
    },
    {
      name: "Messages",
      link: "/messages",
      icon: MessageCircle,
    },
    {
      name: "Bookmarks",
      link: "/bookmarks",
      icon: Bookmark,
    },
    {
      name: "Profile",
      link: `/${user.username}`,
      icon: User,
    },
  ];
} 