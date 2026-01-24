import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const full_name = typeof body.full_name === "string" ? body.full_name : null;
    const avatar_url = typeof body.avatar_url === "string" ? body.avatar_url : null;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name, avatar_url })
      .eq("id", user.id);

    if (error) {
      console.error("Profile update error", error);
      return NextResponse.json({ error: "Could not update profile" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
