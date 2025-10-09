// src/app/(protected)/feed/page.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFeed } from "@/store/postSlice";
import PostCard from "@/components/posts/PostCard";
import CreatePostForm from "@/components/posts/CreatePostForm";

export default function FeedPage() {
    const dispatch = useAppDispatch();
    const { feed, status } = useAppSelector((state) => state.posts);

    useEffect(() => {
        dispatch(fetchFeed());
    }, [dispatch]);

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">動態牆</h1>
            
            <CreatePostForm />

            {status === 'loading' && <p>正在載入動態...</p>}

            <div className="space-y-4">
                {status === 'succeeded' && feed.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            {status === 'succeeded' && feed.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                    動態牆上還沒有任何貼文。
                </p>
            )}
        </div>
    );
}

