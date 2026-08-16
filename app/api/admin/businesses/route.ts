import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ authorized: false }, { status: 401 });
    }

    const accessToken = authorization.replace("Bearer ", "");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ authorized: false }, { status: 401 });
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("admin_type, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      adminError ||
      !adminProfile ||
      adminProfile.admin_type !== "super_admin" ||
      adminProfile.status !== "active"
    ) {
      return NextResponse.json({ authorized: false }, { status: 403 });
    }

    const { data: businesses, error } = await supabase
      .from("business_profiles")
      .select(
        "id, user_id, business_name, category, location, phone, website, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("BUSINESSES ERROR:", error);

      return NextResponse.json(
        { authorized: true, businesses: [], error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authorized: true,
      businesses: businesses ?? [],
    });
  } catch (error) {
    console.error("ADMIN BUSINESSES ERROR:", error);

    return NextResponse.json(
      { authorized: false },
      { status: 500 }
    );
  }
}
