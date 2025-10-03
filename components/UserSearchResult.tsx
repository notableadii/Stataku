import { Avatar } from "@heroui/avatar";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { SearchUser } from "@/hooks/useUserSearch";

interface UserSearchResultProps {
  user: SearchUser;
  onClick?: () => void;
}

export function UserSearchResult({ user, onClick }: UserSearchResultProps) {
  const displayName = user.display_name || user.username;
  const avatarUrl = user.avatar_url || `/avatars/universal-avatar.jpg`;

  return (
    <Link
      as={NextLink}
      href={`/user/${user.slug}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-default-100 transition-colors"
      onClick={onClick}
    >
      <Avatar
        src={avatarUrl}
        alt={displayName}
        size="sm"
        className="flex-shrink-0"
      />
      <div className="flex flex-col min-w-0 flex-1">
        <div className="font-medium text-foreground truncate">
          {displayName}
        </div>
        <div className="text-sm text-default-500 truncate">
          @{user.username}
        </div>
      </div>
    </Link>
  );
}
