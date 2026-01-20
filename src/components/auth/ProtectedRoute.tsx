"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/login");
        }
    }, [user, isLoading, router]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0B0F17]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                    <p className="text-white/40 text-sm">Laddar...</p>
                </div>
            </div>
        );
    }

    // If not logged in, show nothing (redirect will happen)
    if (!user) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0B0F17]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                    <p className="text-white/40 text-sm">Omdirigerar till inloggning...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
