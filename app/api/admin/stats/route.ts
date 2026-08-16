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

    // Businesses
    const { count: businesses } = await supabase
      .from("business_profiles")
      .select("*", { count: "exact", head: true });

    // Growth tasks
    const { count: growthTasks } = await supabase
      .from("growth_tasks")
      .select("*", { count: "exact", head: true });

    const { count: completedTasks } = await supabase
      .from("growth_tasks")
      .select("*", { count: "exact", head: true })
      .eq("completed", true);

    // Subscriptions
    const { count: subscriptions } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true });

    const { count: activeSubscriptions } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Payments
    const { data: paymentRows, error: paymentsError } = await supabase
      .from("payments")
      .select("id, user_id, plan, amount, currency, status, created_at")
      .order("created_at", { ascending: false });

    if (paymentsError) {
      console.error("PAYMENTS ERROR:", paymentsError);
    }

    const payments = paymentRows ?? [];

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

    // Reviews
    const { count: reviews } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true });

    // Recent businesses
    const { data: recentBusinesses } = await supabase
      .from("business_profiles")
      .select(
        "id, user_id, business_name, category, location, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(5);

    // Recent subscriptions
    const { data: recentSubscriptions } = await supabase
      .from("subscriptions")
      .select(
        "id, user_id, plan, status, billing_cycle, amount, currency, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(5);

    // Recent payments
    const recentPayments = payments.slice(0, 5);

    return NextResponse.json({
      authorized: true,

      admin: {
        email: user.email,
        admin_type: adminProfile.admin_type,
      },

      stats: {
        customers,
        businesses: businesses ?? 0,
        growthTasks: growthTasks ?? 0,
        completedTasks: completedTasks ?? 0,
        subscriptions: subscriptions ?? 0,
        activeSubscriptions: activeSubscriptions ?? 0,
        payments: payments.length,
        reviews: reviews ?? 0,
        totalRevenue,
      },

      recentBusinesses: recentBusinesses ?? [],
      recentSubscriptions: recentSubscriptions ?? [],
      recentPayments,
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
