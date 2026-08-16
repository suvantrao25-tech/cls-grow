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

    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      console.error("CUSTOMERS ERROR:", error);
      return NextResponse.json(
        { authorized: true, customers: [], error: error.message },
        { status: 500 }
      );
    }

    const customers = data.users.map((customer) => ({
      id: customer.id,
      email: customer.email ?? "",
      created_at: customer.created_at,
      email_confirmed_at: customer.email_confirmed_at,
      last_sign_in_at: customer.last_sign_in_at,
      banned_until: customer.banned_until,
    }));

    return NextResponse.json({
      authorized: true,
      customers,
    });
  } catch (error) {
    console.error("ADMIN CUSTOMERS ERROR:", error);

    return NextResponse.json(
      { authorized: false },
      { status: 500 }
    );
  }
}
