import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      console.log("ADMIN VERIFY: NO BEARER TOKEN");
      return NextResponse.json(
        { authorized: false, reason: "no_token" },
        { status: 401 }
      );
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

    console.log("ADMIN VERIFY USER:", {
      userId: user?.id ?? null,
      userError: userError?.message ?? null,
      serviceKeyPresent: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    });

    if (userError || !user) {
      return NextResponse.json(
        { authorized: false, reason: "invalid_user" },
        { status: 401 }
      );
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("admin_type, status")
      .eq("user_id", user.id)
      .maybeSingle();

    console.log("ADMIN VERIFY PROFILE:", {
      userId: user.id,
      adminProfile,
      adminError: adminError?.message ?? null,
    });

    if (
      adminError ||
      !adminProfile ||
      adminProfile.status !== "active"
    ) {
      return NextResponse.json(
        {
          authorized: false,
          reason: adminError
            ? "admin_query_error"
            : !adminProfile
              ? "admin_profile_not_found"
              : "admin_inactive",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authorized: true,
      admin_type: adminProfile.admin_type,
    });
  } catch (error) {
    console.error("ADMIN VERIFY ERROR:", error);

    return NextResponse.json(
      { authorized: false, reason: "server_error" },
      { status: 500 }
    );
  }
}
