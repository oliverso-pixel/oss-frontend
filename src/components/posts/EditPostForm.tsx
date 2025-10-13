// src/components/posts/EditPostForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updatePost } from "@/store/postSlice";
import { Button } from "../ui/Button";
import { Globe, MapPin } from "lucide-react";
import { Select } from "../ui/Select";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Post } from "@/types";

interface EditPostFormProps {
    post: Post;
    onFinished: () => void;
}

export default function EditPostForm({ post, onFinished }: EditPostFormProps) {
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
    const [location, setLocation] = useState('');
    
    const dispatch = useAppDispatch();
    const { status } = useAppSelector(state => state.posts);

    useEffect(() => {
        if (post) {
            setContent(post.content);
            setVisibility(post.visibility);
            setLocation(post.location || '');
        }
    }, [post]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const updatedData: Partial<Post> = {
            content,
            visibility,
            location: location || null,
        };

        await dispatch(updatePost({ postId: post.id, postData: updatedData }));
        
        onFinished();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="content">貼文內容</Label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full mt-1 p-3 border rounded-md min-h-[120px] bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            <div>
                <Label htmlFor="visibility" className="flex items-center gap-2 mb-1 text-sm font-medium"><Globe size={14}/> 可見性</Label>
                <Select id="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
                    <option value="public">公開</option>
                    <option value="friends">僅好友</option>
                    <option value="private">私人</option>
                </Select>
            </div>
            <div>
                <Label htmlFor="location" className="flex items-center gap-2 mb-1 text-sm font-medium"><MapPin size={14}/> 地點</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例如：台北市" />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onFinished}>取消</Button>
                <Button type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? '儲存中...' : '儲存變更'}
                </Button>
            </div>
        </form>
    );
}

