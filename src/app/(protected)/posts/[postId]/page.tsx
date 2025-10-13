// src/app/(protected)/posts/[postId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPostById, toggleComments } from '@/store/postSlice';
import PostCard from '@/components/posts/PostCard';
import CommentSection from '@/components/posts/CommentSection';
import { ArrowLeft, MessageCircleOff, MessageCircle, Edit } from 'lucide-react';
import Modal from '@/components/Modal';
import EditPostForm from '@/components/posts/EditPostForm';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const postId = Number(params.postId);
    const dispatch = useAppDispatch();
    const { activePost, status } = useAppSelector(state => state.posts);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (postId) {
            dispatch(fetchPostById(postId));
        }
    }, [postId, dispatch]);

    const handleToggleComments = () => {
        if (activePost) {
            dispatch(toggleComments({ postId: activePost.id, enabled: !activePost.comments_enabled }));
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft size={16} /> 返回
                </button>
                
                {activePost?.user_can_edit && (
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">編輯選項</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setIsEditModalOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>編輯貼文</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleToggleComments}>
                                {activePost.comments_enabled ? <MessageCircleOff className="mr-2 h-4 w-4" /> : <MessageCircle className="mr-2 h-4 w-4" />}
                                <span>{activePost.comments_enabled ? '關閉留言' : '開放留言'}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {status === 'loading' && !activePost && <p>正在載入貼文...</p>}
            
            {status === 'failed' && <p className="text-center text-destructive">無法載入貼文。</p>}

            {activePost && (
                <div>
                    <PostCard post={activePost} isLink={false} />
                    <CommentSection postId={activePost.id} />
                </div>
            )}

            {activePost && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="編輯貼文">
                    <EditPostForm post={activePost} onFinished={() => setIsEditModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
}

