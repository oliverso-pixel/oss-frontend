// src/components/posts/PostCard.tsx
"use client";

import { Post } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Heart, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { likePost, unlikePost } from "@/store/postSlice";
import { cn } from "@/lib/utils";

interface PostCardProps {
    post: Post;
    isLink?: boolean;
}

export default function PostCard({ post, isLink = true }: PostCardProps) {
    const dispatch = useAppDispatch();

    const handleLikeToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (post.is_liked_by_user) {
            dispatch(unlikePost(post.id));
        } else {
            dispatch(likePost(post.id));
        }
    };

    const cardContent = (
        <div className="bg-background rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <Link href={`/users/${post.author.id}`}>
                    {post.author.avatar_url ? (
                        <img src={post.author.avatar_url} alt={post.author.username} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                    )}
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Link href={`/users/${post.author.id}`} className="font-bold hover:underline">{post.author.display_name || post.author.username}</Link>
                        <span className="text-sm text-muted-foreground">· {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhTW })}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">@{post.author.username}</p>
                </div>
            </div>

            <p className="my-4 whitespace-pre-wrap">{post.content}</p>

            {post.media && post.media.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                    {post.media.map(m => (
                        <img key={m.id} src={m.url} alt="Post media" className="w-full h-auto object-cover" />
                    ))}
                </div>
            )}

            <div className="flex items-center gap-6 mt-4 pt-2 border-t">
                <button onClick={handleLikeToggle} className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500">
                    <Heart size={18} className={cn(post.is_liked_by_user && "fill-current text-red-500")} />
                    <span className="text-sm">{post.statistics ? post.statistics.likes_count : 0}</span>
                </button>
                <Link href={`/posts/${post.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
                    <MessageCircle size={18} />
                    <span className="text-sm">{post.statistics ? post.statistics.comments_count : 0}</span>
                </Link>
            </div>
        </div>
    );
    
    if(isLink) {
        return <Link href={`/posts/${post.id}`}>{cardContent}</Link>
    }
    return cardContent;
}

