import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { authorized: false },
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

    if (userError || !user) {
      return NextResponse.json(
        { authorized: false },
        { status: 401 }
      );
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
      return NextResponse.json(
        { authorized: false },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          authorized: true,
          error: "userId is required.",
        },
        { status: 400 }
      );
    }

    const [businessResult, tasksResult, subscriptionResult] =
      await Promise.all([
        supabase
          .from("business_profiles")
          .select(
            "id, user_id, business_name, category, location, phone, website, language, created_at"
          )
          .eq("user_id", userId)
          .maybeSingle(),

        supabase
          .from("growth_tasks")
          .select("id, task, completed, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: true }),

        supabase
          .from("subscriptions")
          .select(
            "id, user_id, plan, status, billing_cycle, amount, currency, current_period_start, current_period_end, created_at"
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    if (businessResult.error) {
      console.error(
        "BUSINESS LOAD ERROR:",
        businessResult.error
      );

      return NextResponse.json(
        {
          authorized: true,
          error: businessResult.error.message,
        },
        { status: 500 }
      );
    }

    if (!businessResult.data) {
      return NextResponse.json({
        authorized: true,
        business: null,
        tasks: [],
        subscription: null,
      });
    }

    if (tasksResult.error) {
      console.error(
        "GROWTH TASKS LOAD ERROR:",
        tasksResult.error
      );
    }

    if (subscriptionResult.error) {
      console.error(
        "SUBSCRIPTION LOAD ERROR:",
        subscriptionResult.error
      );
    }

    return NextResponse.json({
      authorized: true,
      business: businessResult.data,
      tasks: tasksResult.data ?? [],
      subscription: subscriptionResult.data ?? null,
    });
  } catch (error) {
    console.error("ADMIN BUSINESS API ERROR:", error);

    return NextResponse.json(
      {
        authorized: false,
        error: "Failed to load business.",
      },
      { status: 500 }
    );
  }
}