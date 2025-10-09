// src/components/posts/CommentSection.tsx
"use client";

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchComments, addComment } from '@/store/postSlice';
import { Comment as CommentType } from '@/types';
import { Button } from '@/components/ui/Button';
import { User } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const Comment = ({ comment }: { comment: CommentType }) => {
    return (
        <div className="flex items-start gap-4 py-4">
            <Link href={`/users/${comment.author.id}`}>
                {comment.author.avatar_url ? (
                    <img src={comment.author.avatar_url} alt={comment.author.username} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                )}
            </Link>
            <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                    <Link href={`/users/${comment.author.id}`} className="font-bold hover:underline">{comment.author.display_name || comment.author.username}</Link>
                    <span className="text-muted-foreground">· {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: zhTW })}</span>
                </div>
                <p className="mt-1">{comment.content}</p>
            </div>
        </div>
    )
}

const AddCommentForm = ({ postId }: { postId: number }) => {
    const [content, setContent] = useState('');
    const dispatch = useAppDispatch();
    const { status } = useAppSelector(state => state.posts);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            dispatch(addComment({ postId, content }));
            setContent('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="新增留言..."
                className="flex-1 px-3 py-2 border rounded-md bg-background"
            />
            <Button type="submit" disabled={status === 'loading' || !content.trim()}>
                留言
            </Button>
        </form>
    );
}


export default function CommentSection({ postId }: { postId: number }) {
    const dispatch = useAppDispatch();
    const { activePostComments, status } = useAppSelector(state => state.posts);

    useEffect(() => {
        if (postId) {
            dispatch(fetchComments(postId));
        }
    }, [postId, dispatch]);

    return (
        <div className="mt-6 border-t">
            <h2 className="text-xl font-bold pt-4">留言</h2>
            <AddCommentForm postId={postId} />
            <div className="mt-4 divide-y">
                {status === 'loading' && <p>載入留言中...</p>}
                {status === 'succeeded' && activePostComments.map(comment => (
                    <Comment key={comment.id} comment={comment} />
                ))}
                {status === 'succeeded' && activePostComments.length === 0 && (
                    <p className="text-center text-muted-foreground py-6">還沒有留言。</p>
                )}
            </div>
        </div>
    );
}

