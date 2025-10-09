// src/components/posts/CreatePostForm.tsx
"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createPost } from "@/store/postSlice";
import { Button } from "../ui/Button";
import { ImagePlus, X } from "lucide-react";

export default function CreatePostForm() {
    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const dispatch = useAppDispatch();
    const { status } = useAppSelector(state => state.posts);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            URL.revokeObjectURL(previews[index]); // Clean up memory
            return newPreviews;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && files.length === 0) return;

        let media_ids: number[] = [];
        if (files.length > 0) {
            // const uploadPromises = files.map(file => dispatch(uploadMedia(file)));
            // const results = await Promise.all(uploadPromises);
            // media_ids = results.map(result => {
            //     if (uploadMedia.fulfilled.match(result)) {
            //         return result.payload.id;
            //     }
            //     return null;
            // }).filter((id): id is number => id !== null);
        }

        await dispatch(createPost({
            content,
            visibility: 'public',
            tags: [], // Simplified for now
            media_ids,
        }));
        
        setContent("");
        setFiles([]);
        previews.forEach(URL.revokeObjectURL);
        setPreviews([]);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 bg-background p-4 rounded-lg border">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="分享您的寵物新鮮事..."
                className="w-full p-3 border rounded-md min-h-[100px] bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {previews.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative">
                            <img src={preview} alt="preview" className="w-full h-24 object-cover rounded-md" />
                            <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center mt-2">
                 <label htmlFor="file-upload" className="cursor-pointer text-muted-foreground hover:text-primary">
                    <ImagePlus />
                    <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                <Button type="submit" disabled={status === 'loading' || (!content.trim() && files.length === 0)}>
                    {status === 'loading' ? '發佈中...' : '發佈貼文'}
                </Button>
            </div>
        </form>
    );
}

