import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid user session" },
        { status: 401 }
      );
    }

    const { data: existingSubscription, error: existingError } =
      await supabaseAdmin
        .from("subscriptions")
        .select("id, plan, status, trial_ends_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (existingError) {
      console.error("TRIAL LOOKUP ERROR:", existingError.message);

      return NextResponse.json(
        { success: false, error: "Unable to check subscription" },
        { status: 500 }
      );
    }

    if (existingSubscription) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        subscription: existingSubscription,
      });
    }

    const trialStart = new Date();
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 15);

    const { data: subscription, error: subscriptionError } =
      await supabaseAdmin
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: "FREE",
          status: "active",
          billing_cycle: "trial",
          amount: 0,
          currency: "INR",
          current_period_start: trialStart.toISOString(),
          current_period_end: trialEnd.toISOString(),
          trial_started_at: trialStart.toISOString(),
          trial_ends_at: trialEnd.toISOString(),
          razorpay_subscription_id: null,
          razorpay_customer_id: null,
        })
        .select()
        .single();

    if (subscriptionError || !subscription) {
      console.error(
        "FREE TRIAL INSERT ERROR:",
        subscriptionError?.message
      );

      return NextResponse.json(
        { success: false, error: "Unable to create free trial" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      subscription,
    });
  } catch (error) {
    console.error("TRIAL API ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

