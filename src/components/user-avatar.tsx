import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  fallback?: string;
  className?: string;
  onClick?: () => void;
}

export function UserAvatar({
  src,
  fallback = "U",
  className = "h-10 w-10",
  onClick
}: UserAvatarProps) {
  return (
    <Avatar className={cn(
      "border border-border",
      className
    )} onClick={onClick}>
      {src && <AvatarImage src={src} alt="User avatar" />}
      <AvatarFallback>{fallback.toUpperCase()}</AvatarFallback>
    </Avatar>
  );
} 