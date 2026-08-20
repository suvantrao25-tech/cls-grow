import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLANS = {
  START: {
    amount: 29900,
    billingCycle: "monthly",
  },
  GROW: {
    amount: 69900,
    billingCycle: "monthly",
  },
  PRO: {
    amount: 129900,
    billingCycle: "monthly",
  },
} as const;

type PlanName = keyof typeof PLANS;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !plan
    ) {
      return NextResponse.json(
        { success: false, error: "Missing payment details" },
        { status: 400 }
      );
    }

    if (!PLANS[plan as PlanName]) {
      return NextResponse.json(
        { success: false, error: "Invalid plan" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Razorpay secret is not configured" },
        { status: 500 }
      );
    }

    // 1. Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!signaturesMatch) {
      console.error("RAZORPAY SIGNATURE VERIFICATION FAILED");

      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    console.log("RAZORPAY SIGNATURE VERIFIED");

    // 2. Find the Razorpay order
    const razorpayOrderResponse = await fetch(
      `https://api.razorpay.com/v1/orders/${razorpay_order_id}`,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${secret}`
            ).toString("base64"),
        },
      }
    );

    if (!razorpayOrderResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Unable to verify Razorpay order" },
        { status: 400 }
      );
    }

    const razorpayOrder = await razorpayOrderResponse.json();

    const userId = razorpayOrder?.notes?.user_id;
    const orderPlan = razorpayOrder?.notes?.plan;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User information missing from order" },
        { status: 400 }
      );
    }

    if (orderPlan !== plan) {
      return NextResponse.json(
        { success: false, error: "Payment plan mismatch" },
        { status: 400 }
      );
    }

    const selectedPlan = PLANS[plan as PlanName];

    if (razorpayOrder.amount !== selectedPlan.amount) {
      return NextResponse.json(
        { success: false, error: "Payment amount mismatch" },
        { status: 400 }
      );
    }

    // 3. Prevent duplicate payment processing
    const { data: existingPayment, error: existingPaymentError } =
      await supabaseAdmin
        .from("payments")
        .select("id, subscription_id")
        .eq("razorpay_payment_id", razorpay_payment_id)
        .maybeSingle();

    if (existingPaymentError) {
      console.error(
        "Existing payment lookup error:",
        existingPaymentError.message
      );

      return NextResponse.json(
        { success: false, error: "Payment lookup failed" },
        { status: 500 }
      );
    }

    if (existingPayment) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        subscriptionId: existingPayment.subscription_id,
        message: "Payment already processed",
      });
    }

    // 4. Create subscription
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);

    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data: subscription, error: subscriptionError } =
      await supabaseAdmin
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan,
          status: "active",
          billing_cycle: selectedPlan.billingCycle,
          amount: selectedPlan.amount / 100,
          currency: "INR",
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          razorpay_subscription_id: null,
          razorpay_customer_id: null,
        })
        .select()
        .single();

    if (subscriptionError || !subscription) {
      console.error(
        "SUBSCRIPTION INSERT ERROR:",
        subscriptionError?.message
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to activate subscription",
        },
        { status: 500 }
      );
    }

    // 5. Save payment
    const invoiceNumber = `CLS-${Date.now()}`;

    const { error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: userId,
        subscription_id: subscription.id,
        plan,
        amount: selectedPlan.amount / 100,
        currency: "INR",
        status: "paid",
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        invoice_number: invoiceNumber,
        paid_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error("PAYMENT INSERT ERROR:", paymentError.message);

      // Roll back subscription if payment record could not be created
      await supabaseAdmin
        .from("subscriptions")
        .delete()
        .eq("id", subscription.id);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to save payment",
        },
        { status: 500 }
      );
    }

    console.log("PAYMENT SAVED:", razorpay_payment_id);
    console.log("SUBSCRIPTION ACTIVATED:", subscription.id);
    console.log("PLAN:", plan);

    return NextResponse.json({
      success: true,
      message: `${plan} subscription activated successfully`,
      plan,
      subscriptionId: subscription.id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("PAYMENT VERIFICATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Payment verification failed",
      },
      { status: 500 }
    );
  }
}