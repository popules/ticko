import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createSupabaseServerClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json({ error: "Ej autentiserad" }, { status: 401 });
        }

        // Get the post first to verify ownership
        const { data: post, error: fetchError } = await (supabase as any)
            .from("posts")
            .select("user_id")
            .eq("id", id)
            .single();

        if (fetchError || !post) {
            return NextResponse.json({ error: "Inlägg hittades inte" }, { status: 404 });
        }

        // Check if user owns the post
        if (post.user_id !== user.id) {
            return NextResponse.json({ error: "Ej behörig att ta bort detta inlägg" }, { status: 403 });
        }

        // Delete the post
        const { error: deleteError } = await (supabase as any)
            .from("posts")
            .delete()
            .eq("id", id);

        if (deleteError) {
            console.error("Delete error:", deleteError);
            return NextResponse.json({ error: "Could not delete post" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Inlägg borttaget" });
    } catch (error) {
        console.error("Delete post error:", error);
        return NextResponse.json({ error: "Serverfel" }, { status: 500 });
    }
}
