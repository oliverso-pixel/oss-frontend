// src/components/posts/CreatePostForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createPost, uploadPostMedia } from "@/store/postSlice";
import { fetchPets } from "@/store/petSlice";
import { Button } from "../ui/Button";
import { ImagePlus, X, Globe, Users, Lock, MapPin, MessageCircleOff, MessageCircle, Tag, PawPrint } from "lucide-react";
import { Select } from "../ui/Select";
import { Input } from "../ui/Input";
import { Switch } from "../ui/Switch";
import { Label } from "../ui/Label";
import { useToast } from "../ui/Toaster";

export default function CreatePostForm() {
    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
    const [location, setLocation] = useState('');
    const [tags, setTags] = useState('');
    const [commentsEnabled, setCommentsEnabled] = useState(true);
    const [selectedPetId, setSelectedPetId] = useState<number | ''>('');

    const dispatch = useAppDispatch();
    const { status } = useAppSelector(state => state.posts);
    const { pets } = useAppSelector(state => state.pets);
    const { user } = useAppSelector(state => state.auth);
    const { addToast } = useToast();

    useEffect(() => {
        if (user) {
            dispatch(fetchPets(false)); // false to fetch only active pets
        }
    }, [dispatch, user]);

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
            const uploadResult = await dispatch(uploadPostMedia(files));
            if (uploadPostMedia.fulfilled.match(uploadResult)) {
                media_ids = uploadResult.payload.map((media) => media.id);
            } else {
                addToast('媒體上傳失敗', 'error');
                return;
            }
        }

        const postData = {
            content,
            visibility,
            media_ids,
            location: location.trim() || null,
            pet_id: selectedPetId === '' ? null : Number(selectedPetId),
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            comments_enabled: commentsEnabled
        };

        const createResult = await dispatch(createPost(postData));
        
        if (createPost.fulfilled.match(createResult)) {
            addToast('貼文已成功發佈！', 'success');
            // Reset form
            setContent("");
            setFiles([]);
            previews.forEach(URL.revokeObjectURL);
            setPreviews([]);
            setVisibility('public');
            setLocation('');
            setTags('');
            setSelectedPetId('');
            setCommentsEnabled(true);
        } else {
            addToast(`發佈貼文失敗: ${createResult.payload as string}`, 'error');
        }
    };

    const activePets = pets.filter(p => p.is_active);

    return (
        <form onSubmit={handleSubmit} className="mb-6 bg-background p-4 rounded-lg border">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="分享您的寵物新鮮事..."
                className="w-full p-3 border rounded-md min-h-[100px] bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {previews.length > 0 && (
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative">
                            <img src={preview} alt="preview" className="w-full h-24 object-cover rounded-md" />
                            <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                 <div>
                    <Label htmlFor="visibility" className="flex items-center gap-2 mb-1 text-sm font-medium text-muted-foreground"><Globe size={14}/> 可見性</Label>
                    <Select id="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
                        <option value="public">公開</option>
                        <option value="friends">僅好友</option>
                        <option value="private">私人</option>
                    </Select>
                 </div>
                 <div>
                    <Label htmlFor="pet_id" className="flex items-center gap-2 mb-1 text-sm font-medium text-muted-foreground"><PawPrint size={14}/> 附加寵物</Label>
                    <Select id="pet_id" value={selectedPetId} onChange={(e) => setSelectedPetId(e.target.value === '' ? '' : Number(e.target.value))}>
                        <option value="">不附加</option>
                        {activePets.map(pet => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
                    </Select>
                 </div>
                 <div>
                    <Label htmlFor="location" className="flex items-center gap-2 mb-1 text-sm font-medium text-muted-foreground"><MapPin size={14}/> 地點</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例如：台北市" />
                 </div>
                 <div>
                    <Label htmlFor="tags" className="flex items-center gap-2 mb-1 text-sm font-medium text-muted-foreground"><Tag size={14}/> 標籤</Label>
                    <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="以逗號分隔, e.g. 貓,狗" />
                 </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                 <div className='flex items-center gap-4'>
                    <label htmlFor="file-upload" className="cursor-pointer text-muted-foreground hover:text-primary" title="新增圖片/影片">
                        <ImagePlus />
                        <input id="file-upload" type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    <div className="flex items-center gap-2" title={commentsEnabled ? "開放留言" : "關閉留言"}>
                        {commentsEnabled ? <MessageCircle size={20} className="text-muted-foreground"/> : <MessageCircleOff size={20} className="text-muted-foreground"/>}
                        <Switch id="comments-enabled" checked={commentsEnabled} onCheckedChange={setCommentsEnabled} />
                    </div>
                 </div>
                <Button type="submit" disabled={status === 'loading' || (!content.trim() && files.length === 0)}>
                    {status === 'loading' ? '發佈中...' : '發佈貼文'}
                </Button>
            </div>
        </form>
    );
}

