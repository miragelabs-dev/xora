import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  src?: string;
  fallback?: string;
}

export function UserAvatar({ src, fallback = "U" }: UserAvatarProps) {
  return (
    <Avatar className="h-10 w-10">
      <AvatarImage src={src} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
} 