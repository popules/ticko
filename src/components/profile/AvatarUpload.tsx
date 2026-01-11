"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface AvatarUploadProps {
    currentUrl: string | null;
    onUploadComplete: (url: string) => void;
}

export function AvatarUpload({ currentUrl, onUploadComplete }: AvatarUploadProps) {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) return;

        const file = e.target.files[0];
        const fileSizeLimit = 2 * 1024 * 1024; // 2MB

        // Client-side validation
        if (file.size > fileSizeLimit) {
            alert("Bilden är för stor (max 2MB)");
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Endast bildfiler är tillåtna");
            return;
        }

        setIsUploading(true);

        try {
            // Create a preview immediately
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            // Update profile
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: publicUrl })
                .eq("id", user.id);

            if (updateError) throw updateError;

            onUploadComplete(publicUrl);

        } catch (error: any) {
            console.error("Upload failed:", error);
            alert("Kunde inte ladda upp bilden: " + error.message);
            // Revert preview on error
            setPreviewUrl(currentUrl);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 bg-white/5 relative">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                            <Camera className="w-8 h-8" />
                        </div>
                    )}

                    {/* Hover Overlay */}
                    <div
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Camera className="w-6 h-6 text-white" />
                    </div>

                    {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                        </div>
                    )}
                </div>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 rounded-full text-white shadow-lg hover:bg-emerald-600 transition-colors border-2 border-[#0B0F17]"
                >
                    <Camera className="w-3 h-3" />
                </button>
            </div>

            <div className="text-center">
                <p className="text-sm font-medium text-white/80">Profilbild</p>
                <p className="text-xs text-white/40 mt-1">
                    Max 2MB. Inga olämpliga bilder (NSFW).
                </p>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
}
