import { useSession } from "@/app/session-provider";
import { Bell, Bookmark, Home, Library, LogIn, User } from "lucide-react";
import { useUnreadMessages } from "./use-unread-messages";
import { useUnreadNotifications } from "./use-unread-notifications";

export function useNavbarMenu() {
  const { user } = useSession();

  const unreadMessages = useUnreadMessages();
  const unreadNotifications = useUnreadNotifications();

  if (!user) {
    return [
      {
        name: "Login",
        link: "/?redirected=true",
        icon: LogIn,
      },
    ];
  }

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
    // {
    //   name: "Leaderboard",
    //   link: "/leaderboard",
    //   icon: Trophy,
    // },
    {
      name: "Notifications",
      link: "/notifications",
      icon: Bell,
      unreadCount: unreadNotifications,
    },
    // {
    //   name: "Messages",
    //   link: "/messages",
    //   icon: MessageCircle,
    //   unreadCount: unreadMessages,
    // },
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