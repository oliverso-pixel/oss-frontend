// src/app/(protected)/posts/[postId]/page.tsx
"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPostById } from '@/store/postSlice';
import PostCard from '@/components/posts/PostCard';
import CommentSection from '@/components/posts/CommentSection';
import { ArrowLeft } from 'lucide-react';

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const postId = Number(params.postId);
    const dispatch = useAppDispatch();
    const { activePost, status } = useAppSelector(state => state.posts);

    useEffect(() => {
        if (postId) {
            dispatch(fetchPostById(postId));
        }
    }, [postId, dispatch]);

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => router.back()} className="flex items-center gap-2 mb-4 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft size={16} /> 返回
            </button>

            {status === 'loading' && !activePost && <p>正在載入貼文...</p>}
            
            {status === 'failed' && <p className="text-center text-destructive">無法載入貼文。</p>}

            {activePost && (
                <div>
                    <PostCard post={activePost} isLink={false} />
                    <CommentSection postId={activePost.id} />
                </div>
            )}
        </div>
    );
}

