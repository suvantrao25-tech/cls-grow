import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Razorpay from "razorpay";

const PLANS = {
  START: {
    amount: 29900,
    name: "START",
  },
  GROW: {
    amount: 69900,
    name: "GROW",
  },
  PRO: {
    amount: 129900,
    name: "PRO",
  },
} as const;

type PlanName = keyof typeof PLANS;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const plan = body?.plan as PlanName;

    if (!plan || !PLANS[plan]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async getAll() {
            const cookieStore = await cookies();
            return cookieStore.getAll();
          },
          async setAll(cookiesToSet) {
            const cookieStore = await cookies();

            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {}
          },
        },
      }
    );

    const authorization = request.headers.get("authorization");

    let user;

    if (authorization?.startsWith("Bearer ")) {
      const accessToken = authorization.replace("Bearer ", "");

      const {
        data: { user: tokenUser },
        error: tokenError,
      } = await supabase.auth.getUser(accessToken);

      if (!tokenError && tokenUser) {
        user = tokenUser;
      }
    }

    if (!user) {
      const {
        data: { user: cookieUser },
        error: cookieError,
      } = await supabase.auth.getUser();

      if (!cookieError && cookieUser) {
        user = cookieUser;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: "Payment service is not configured" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const selectedPlan = PLANS[plan];

    const order = await razorpay.orders.create({
      amount: selectedPlan.amount,
      currency: "INR",
      receipt: `cls_grow_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan: selectedPlan.name,
        product: "CLS GROW",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: selectedPlan.name,
      keyId: razorpayKeyId,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return NextResponse.json(
      { error: "Unable to create payment order" },
      { status: 500 }
    );
  }
}

