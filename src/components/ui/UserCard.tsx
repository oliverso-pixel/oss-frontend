// src/components/ui/UserCard.tsx
import { UserPublicProfile } from "@/types";
import { User } from "lucide-react";
import Link from "next/link";

interface UserCardProps {
  user: UserPublicProfile;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <Link href={`/users/${user.id}`} className="block">
      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow flex items-center gap-4 bg-background">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        <div>
          <p className="font-bold text-foreground">{user.display_name || user.username}</p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
      </div>
    </Link>
  );
}