import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE() {
    try {
        const supabase = await createSupabaseServerClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json({ error: "Ej autentiserad" }, { status: 401 });
        }

        // Create admin client for user deletion
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Delete user's data first (cascade should handle most, but be explicit)
        // Posts, comments, reactions, watchlists etc. should be handled by DB cascade

        // Delete the auth user (requires admin client)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error("Delete user error:", deleteError);
            return NextResponse.json({ error: "Kunde inte radera konto" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Konto raderat" });
    } catch (error) {
        console.error("Delete account error:", error);
        return NextResponse.json({ error: "Serverfel" }, { status: 500 });
    }
}
