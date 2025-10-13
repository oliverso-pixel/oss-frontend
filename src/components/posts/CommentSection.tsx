// src/components/posts/CommentSection.tsx
"use client";

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchComments, addComment, likeComment, unlikeComment, deleteComment } from '@/store/postSlice';
import { Comment as CommentType } from '@/types';
import { Button } from '@/components/ui/Button';
import { User, MessageSquareOff, Heart, MessageSquare, CornerUpRight, Quote, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Select } from '../ui/Select';

const QuotedComment = ({ comment }: { comment: CommentType }) => {
    return (
        <div className="mt-2 p-2 border-l-2 bg-secondary/50 rounded-r-md">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
                <CornerUpRight size={12} />
                <span>回覆 <Link href={`/users/${comment.user.id}`} className="font-semibold hover:underline">{comment.user.display_name || comment.user.username}</Link></span>
            </div>
            <p className="text-sm text-muted-foreground truncate">{comment.content}</p>
        </div>
    )
};

const Comment = ({ comment, onReply, onQuote, onDelete }: { comment: CommentType, onReply: (c: CommentType) => void, onQuote: (c: CommentType) => void, onDelete: (c: CommentType) => void }) => {
    const dispatch = useAppDispatch();
    const { user: currentUser } = useAppSelector(state => state.auth);

    const handleLikeToggle = () => {
        if (comment.is_liked) {
            dispatch(unlikeComment(comment.id));
        } else {
            dispatch(likeComment(comment.id));
        }
    }
    
    if (comment.is_deleted) {
        return (
            <div className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <MessageSquareOff className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground italic">{comment.content}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-start gap-4 py-4">
            <Link href={`/users/${comment.user.id}`} className="flex-shrink-0">
                {comment.user.avatar_url ? (
                    <img src={comment.user.avatar_url} alt={comment.user.username} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                )}
            </Link>
            <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                    <Link href={`/users/${comment.user.id}`} className="font-bold hover:underline">{comment.user.display_name || comment.user.username}</Link>
                    <span className="text-muted-foreground">· {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: zhTW })}</span>
                </div>
                {comment.quoted_comment && <QuotedComment comment={comment.quoted_comment} />}
                <p className="mt-1">{comment.content}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <button onClick={handleLikeToggle} className="flex items-center gap-1 hover:text-red-500">
                        <Heart size={14} className={cn(comment.is_liked && "fill-current text-red-500")} /> {comment.like_count}
                    </button>
                    <button onClick={() => onReply(comment)} className="flex items-center gap-1 hover:text-primary"><CornerUpRight size={14} /> 回覆</button>
                    <button onClick={() => onQuote(comment)} className="flex items-center gap-1 hover:text-primary"><Quote size={14} /> 引用</button>
                    {currentUser?.id === comment.user.id && 
                        <button onClick={() => onDelete(comment)} className="flex items-center gap-1 hover:text-destructive"><Trash2 size={14} /> 刪除</button>
                    }
                </div>
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2 pl-4 border-l-2">
                        {comment.replies.map(reply => <Comment key={reply.id} comment={reply} onReply={onReply} onQuote={onQuote} onDelete={onDelete}/>)}
                    </div>
                )}
            </div>
        </div>
    )
}

const AddCommentForm = ({ postId, commentsEnabled, replyTo, quoteTo, onCancelReply }: { postId: number, commentsEnabled: boolean, replyTo: CommentType | null, quoteTo: CommentType | null, onCancelReply: () => void }) => {
    const [content, setContent] = useState('');
    const dispatch = useAppDispatch();
    const { status } = useAppSelector(state => state.posts);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            dispatch(addComment({ 
                postId, 
                content,
                parent_id: replyTo?.id,
                quoted_comment_id: quoteTo?.id
            }));
            setContent('');
            onCancelReply();
        }
    };

    if (!commentsEnabled) {
        return (
            <div className="text-center text-muted-foreground py-4 border rounded-md mt-4 bg-secondary">
                <MessageSquareOff className="mx-auto h-6 w-6" />
                <p className="mt-2 text-sm">此貼文已關閉留言功能</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            {(replyTo || quoteTo) && (
                <div className="p-2 bg-secondary rounded-t-md text-sm text-muted-foreground flex justify-between items-center">
                    <div>
                        {replyTo && <span>回覆給 <span className="font-semibold">{replyTo.user.display_name || replyTo.user.username}</span></span>}
                        {quoteTo && <span>引用 <span className="font-semibold">{quoteTo.user.display_name || quoteTo.user.username}</span> 的留言</span>}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={onCancelReply}><X size={16}/></Button>
                </div>
            )}
            <div className="flex gap-2">
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={replyTo ? '輸入您的回覆...' : (quoteTo ? '輸入您的引用...' : '新增留言...')}
                    className="flex-1 px-3 py-2 border rounded-md bg-background"
                />
                <Button type="submit" disabled={status === 'loading' || !content.trim()}>
                    留言
                </Button>
            </div>
        </form>
    );
}


export default function CommentSection({ postId }: { postId: number }) {
    const dispatch = useAppDispatch();
    const { activePost, activePostComments, status } = useAppSelector(state => state.posts);
    const [sortBy, setSortBy] = useState('newest');
    const [replyTo, setReplyTo] = useState<CommentType | null>(null);
    const [quoteTo, setQuoteTo] = useState<CommentType | null>(null);

    useEffect(() => {
        if (postId) {
            dispatch(fetchComments({ postId, sortBy }));
        }
    }, [postId, sortBy, dispatch]);
    
    const handleReply = (comment: CommentType) => {
        setQuoteTo(null);
        setReplyTo(comment);
    }
    const handleQuote = (comment: CommentType) => {
        setReplyTo(null);
        setQuoteTo(comment);
    }
    const handleDelete = (comment: CommentType) => {
        if (window.confirm("確定要刪除這則留言嗎？")) {
            dispatch(deleteComment({ commentId: comment.id })).then(() => {
                dispatch(fetchComments({ postId, sortBy }));
            });
        }
    }
    const handleCancelReply = () => {
        setReplyTo(null);
        setQuoteTo(null);
    }

    return (
        <div className="mt-6 border-t">
            <div className="flex justify-between items-center pt-4">
                <h2 className="text-xl font-bold">留言 ({activePost?.comment_count || 0})</h2>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-40 text-sm">
                    <option value="newest">最新</option>
                    <option value="oldest">最舊</option>
                    <option value="most_likes">最多按讚</option>
                    <option value="most_replies">最多回覆</option>
                    <option value="recent_activity">最近活動</option>
                </Select>
            </div>

            <AddCommentForm 
                postId={postId} 
                commentsEnabled={activePost?.comments_enabled ?? true}
                replyTo={replyTo}
                quoteTo={quoteTo}
                onCancelReply={handleCancelReply}
            />

            <div className="mt-4 divide-y">
                {status === 'loading' && <p>載入留言中...</p>}
                {status === 'succeeded' && activePostComments.map(comment => (
                    <Comment key={comment.id} comment={comment} onReply={handleReply} onQuote={handleQuote} onDelete={handleDelete}/>
                ))}
                {status === 'succeeded' && activePostComments.length === 0 && (
                    <p className="text-center text-muted-foreground py-6">還沒有留言。</p>
                )}
            </div>
        </div>
    );
}

