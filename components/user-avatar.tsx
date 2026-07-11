import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

const AVATAR_SIZES = {
  sm: "size-8",
  md: "size-10",
  lg: "size-14",
} as const;

interface UserAvatarProps {
  user: Pick<User, "name" | "avatar_url">;
  size?: keyof typeof AVATAR_SIZES;
  className?: string;
}

/**
 * 사용자 아바타 컴포넌트.
 * avatar_url이 없으면 이름 첫 글자로 폴백한다.
 */
export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  return (
    <Avatar className={cn(AVATAR_SIZES[size], className)}>
      <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}
