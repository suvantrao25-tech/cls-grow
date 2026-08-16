import { supabase } from "@/lib/supabase";

export type Plan = "FREE" | "START" | "GROW" | "PRO";

export type Subscription = {
  id: string;
  user_id: string;
  plan: Plan;
  status: string;
  billing_cycle: string;
  amount: number;
  currency: string;
  current_period_start: string | null;
  current_period_end: string | null;
  razorpay_subscription_id: string | null;
  razorpay_customer_id: string | null;
  created_at: string;
  updated_at: string;
};

export const PLAN_DETAILS: Record<
  Plan,
  {
    name: string;
    amount: number;
    billingCycle: string;
  }
> = {
  FREE: {
    name: "FREE",
    amount: 0,
    billingCycle: "forever",
  },
  START: {
    name: "START",
    amount: 299,
    billingCycle: "monthly",
  },
  GROW: {
    name: "GROW",
    amount: 699,
    billingCycle: "monthly",
  },
  PRO: {
    name: "PRO",
    amount: 1299,
    billingCycle: "monthly",
  },
};

export async function getCurrentSubscription(): Promise<Subscription | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Subscription load error:", error.message);
    return null;
  }

  return data as Subscription | null;
}

export async function getPaymentHistory() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Payment history error:", error.message);
    return [];
  }

  return data || [];
}

export function getPlanDetails(plan: Plan) {
  return PLAN_DETAILS[plan];
}
