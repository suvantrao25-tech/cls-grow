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

    // Verify logged-in user
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

    // Verify admin
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

    // Run independent database queries in parallel.
    const [
      businessesResult,
      growthTasksResult,
      completedTasksResult,
      subscriptionsResult,
      activeSubscriptionsResult,
      paymentsResult,
      reviewsResult,
      recentBusinessesResult,
      recentSubscriptionsResult,
    ] = await Promise.all([
      supabase
        .from("business_profiles")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("growth_tasks")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("growth_tasks")
        .select("*", { count: "exact", head: true })
        .eq("completed", true),

      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),

      supabase
        .from("payments")
        .select("id, user_id, plan, amount, currency, status, created_at")
        .order("created_at", { ascending: false }),

      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("business_profiles")
        .select(
          "id, user_id, business_name, category, location, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(5),

      supabase
        .from("subscriptions")
        .select(
          "id, user_id, plan, status, billing_cycle, amount, currency, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    // Customers
    let customers = 0;
    let page = 1;

    while (true) {
      const { data: usersData, error: usersError } =
        await supabase.auth.admin.listUsers({
          page,
          perPage: 1000,
        });

      if (usersError) {
        console.error("CUSTOMERS ERROR:", usersError);
        break;
      }

      customers += usersData.users.length;

      if (usersData.users.length < 1000) {
        break;
      }

      page++;
    }

    const businesses = businessesResult.count ?? 0;
    const growthTasks = growthTasksResult.count ?? 0;
    const completedTasks = completedTasksResult.count ?? 0;
    const subscriptions = subscriptionsResult.count ?? 0;
    const activeSubscriptions = activeSubscriptionsResult.count ?? 0;
    const reviews = reviewsResult.count ?? 0;

    if (paymentsResult.error) {
      console.error("PAYMENTS ERROR:", paymentsResult.error);
    }

    const payments = paymentsResult.data ?? [];

    const paidPayments = payments.filter(
      (payment) =>
        payment.status?.toLowerCase() === "paid" ||
        payment.status?.toLowerCase() === "captured" ||
        payment.status?.toLowerCase() === "success"
    );

    const totalRevenue = paidPayments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    );

    return NextResponse.json({
      authorized: true,

      admin: {
        email: user.email,
        admin_type: adminProfile.admin_type,
      },

      stats: {
        customers,
        businesses,
        growthTasks,
        completedTasks,
        subscriptions,
        activeSubscriptions,
        payments: payments.length,
        reviews,
        totalRevenue,
      },

      recentBusinesses: recentBusinessesResult.data ?? [],
      recentSubscriptions: recentSubscriptionsResult.data ?? [],
      recentPayments: payments.slice(0, 5),
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);

    return NextResponse.json(
      {
        authorized: false,
        error: "Failed to load admin statistics.",
      },
      { status: 500 }
    );
  }
}