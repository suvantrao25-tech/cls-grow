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
    name: "LOCAL",
    amount: 299,
    billingCycle: "monthly",
  },
  GROW: {
    name: "BUSINESS",
    amount: 699,
    billingCycle: "monthly",
  },
  PRO: {
    name: "SCALE",
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

export function hasPlanAccess(
  plan: Plan,
  requiredPlan: Plan
): boolean {
  const levels: Record<Plan, number> = {
    FREE: 0,
    START: 1,
    GROW: 2,
    PRO: 3,
  };

  return levels[plan] >= levels[requiredPlan];
}

export const PLAN_FEATURES = {
  FREE: [
    "business_profile",
    "growth_score",
    "basic_analysis",
    "ai_suggestions",
    "growth_tasks",
    "business_problem",
    "basic_problem_analysis",
    "basic_growth_plan",
    "limited_ai_insights",
    "growth_trial",
  ],

  START: [
    "next_growth_move",
    "local_visibility",
    "weekly_customer_offer",
    "ready_customer_message",
    "customer_follow_up",
    "customer_return_offer",
    "google_business_profile",
    "google_post_creation",
    "regional_languages",
    "growth_progress_tracking",
    "ai_business_action",
    "ai_business_video",
    "business_connect",
  ],

  GROW: [
    "business_monitoring",
    "automatic_problem_detection",
    "customer_reactivation",
    "lead_conversion_analysis",
    "growth_opportunity_alerts",
    "marketing_recommendations",
    "customer_acquisition_strategy",
    "customer_retention_strategy",
    "advanced_growth_tracking",
    "higher_ai_usage",
  ],

  PRO: [
    "advanced_growth_intelligence",
    "advanced_analytics",
    "multiple_growth_campaigns",
    "competitor_monitoring",
    "lead_funnel_optimization",
    "advanced_growth_opportunities",
    "automation",
    "advanced_reports",
    "growth_workflows",
    "higher_ai_usage_features",
  ],
} as const;

export function hasFeature(
  plan: Plan,
  feature: string
): boolean {
  const levels: Record<Plan, number> = {
    FREE: 0,
    START: 1,
    GROW: 2,
    PRO: 3,
  };

  const featurePlan: Plan | null =
    (PLAN_FEATURES.FREE as readonly string[]).includes(feature)
      ? "FREE"
      : (PLAN_FEATURES.START as readonly string[]).includes(feature)
        ? "START"
        : (PLAN_FEATURES.GROW as readonly string[]).includes(feature)
          ? "GROW"
          : (PLAN_FEATURES.PRO as readonly string[]).includes(feature)
            ? "PRO"
            : null;

  if (!featurePlan) {
    return false;
  }

  return levels[plan] >= levels[featurePlan];
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  gu: "Gujarati",
  mr: "Marathi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
};

export function getLanguageLabel(language: string): string {
  return LANGUAGE_LABELS[language] || "English";
}

const REGIONAL_TEXT: Record<string, {
  growthMove: string;
  offer: string;
  message: string;
  followUp: string;
  returnOffer: string;
}> = {
  hi: {
    growthMove: "\u0905\u092a\u0928\u0947 Google Business Profile \u0915\u094b \u092a\u0942\u0930\u093e \u0914\u0930 \u0905\u092a\u0921\u0947\u091f \u0930\u0916\u0947\u0902 \u0924\u093e\u0915\u093f \u091c\u093c\u094d\u092f\u093e\u0926\u093e \u0938\u094d\u0925\u093e\u0928\u0940\u092f \u0917\u094d\u0930\u093e\u0939\u0915 \u0906 \u0938\u0915\u0947\u0902\u0964",
    offer: "\u0907\u0938 \u0938\u092a\u094d\u0924\u093e\u0939 \u0905\u092a\u0928\u0947 \u0917\u094d\u0930\u093e\u0939\u0915\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u090f\u0915 \u0938\u0940\u092e\u093f\u0924 \u0938\u092e\u092f \u0915\u093e \u0935\u093f\u0936\u0947\u0937 \u0911\u092b\u0930 \u092c\u0928\u093e\u090f\u0902\u0964",
    message: "\u0928\u092e\u0938\u094d\u0924\u0947! \u0939\u092e\u093e\u0930\u0947 \u092a\u093e\u0938 \u0907\u0938 \u0938\u092a\u094d\u0924\u093e\u0939 \u0906\u092a\u0915\u0947 \u0932\u093f\u090f \u090f\u0915 \u0916\u093e\u0938 \u0911\u092b\u0930 \u0939\u0948\u0964 \u091c\u093c\u094d\u092f\u093e\u0926\u093e \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0915\u0947 \u0932\u093f\u090f \u0930\u093f\u092a\u094d\u0932\u093e\u0908 \u0915\u0930\u0947\u0902\u0964",
    followUp: "\u0939\u093e\u0932 \u0939\u0940 \u092e\u0947\u0902 \u0906\u090f \u0917\u094d\u0930\u093e\u0939\u0915\u094b\u0902 \u0938\u0947 \u092b\u0949\u0932\u094b-\u0905\u092a \u0915\u0930\u0947\u0902 \u0914\u0930 \u0909\u0928\u094d\u0939\u0947\u0902 \u0935\u093e\u092a\u0938 \u0906\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0938\u0930\u0932 \u0911\u092b\u0930 \u0926\u0947\u0902\u0964",
    returnOffer: "\u092a\u0941\u0930\u093e\u0928\u0947 \u0917\u094d\u0930\u093e\u0939\u0915\u094b\u0902 \u0915\u094b \u0935\u093e\u092a\u0938 \u092c\u0941\u0932\u093e\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u090f\u0915 \u0935\u093f\u0936\u0947\u0937 \u0930\u093f\u091f\u0930\u094d\u0928 \u0911\u092b\u0930 \u092c\u0928\u093e\u090f\u0902\u0964",
  },
  gu: {
    growthMove: "\u092a\u094b\u0924\u093e\u0928\u0940 Google Business Profile \u0928\u0947 \u092a\u0942\u0930\u094d\u0923 \u0905\u0928\u0947 \u0905\u092a\u0921\u0947\u091f \u0930\u093e\u0916\u094b \u091c\u0947\u0925\u0940 \u0935\u0927\u0941 \u0938\u094d\u0925\u093e\u0928\u093f\u0915 \u0917\u094d\u0930\u093e\u0939\u0915\u094b \u092e\u0933\u0940 \u0936\u0915\u0947.",
    offer: "\u0906 \u0905\u0920\u0935\u093e\u0921\u093f\u092f\u093e\u092e\u093e\u0902 \u0924\u092e\u093e\u0930\u093e \u0917\u094d\u0930\u093e\u0939\u0915\u094b \u092e\u093e\u091f\u0947 \u0938\u0940\u092e\u093f\u0924 \u0938\u092e\u092f\u0928\u094b \u0935\u093f\u0936\u0947\u0937 \u0911\u092b\u0930 \u092c\u0928\u093e\u0935\u094b.",
    message: "\u0928\u092e\u0938\u094d\u0924\u0947! \u0906 \u0905\u0920\u0935\u093e\u0921\u093f\u092f\u093e \u0924\u092e\u093e\u0930\u093e \u092e\u093e\u091f\u0947 \u0916\u093e\u0938 \u0911\u092b\u0930 \u091b\u0947. \u0935\u0927\u0941 \u092e\u093e\u0939\u093f\u0924\u0940 \u092e\u093e\u091f\u0947 \u0930\u093f\u092a\u094d\u0932\u093e\u0907 \u0915\u0930\u094b.",
    followUp: "\u0939\u093e\u0932\u0928\u093e \u0917\u094d\u0930\u093e\u0939\u0915\u094b \u0938\u093e\u0925\u0947 \u092b\u0949\u0932\u094b-\u0905\u092a \u0915\u0930\u094b \u0905\u0928\u0947 \u0938\u0930\u0933 \u0911\u092b\u0930 \u0938\u093e\u0925\u0947 \u092a\u093e\u091b\u093e \u0906\u0935\u0935\u093e \u092e\u093e\u091f\u0947 \u0906\u092e\u0902\u0924\u094d\u0930\u0923 \u0906\u092a\u094b.",
    returnOffer: "\u092a\u0941\u0930\u093e\u0923\u093e \u0917\u094d\u0930\u093e\u0939\u0915\u094b\u0928\u0947 \u092a\u093e\u091b\u093e \u092c\u094b\u0932\u093e\u0935\u0935\u093e \u092e\u093e\u091f\u0947 \u0935\u093f\u0936\u0947\u0937 \u0930\u093f\u091f\u0930\u094d\u0928 \u0911\u092b\u0930 \u0906\u092a\u094b.",
  },
  mr: {
    growthMove: "\u0924\u0941\u092e\u091a\u0947 Google Business Profile \u092a\u0942\u0930\u094d\u0923 \u0915\u0930\u093e \u0906\u0923\u093f \u0928\u093f\u092f\u092e\u093f\u0924 \u0905\u092a\u0921\u0947\u091f \u0915\u0930\u093e.",
    offer: "\u092f\u093e \u0906\u0920\u0935\u0921\u094d\u092f\u093e\u0924 \u0917\u094d\u0930\u093e\u0939\u0915\u093e\u0902\u0938\u093e\u0920\u0940 \u092e\u0930\u094d\u092f\u093e\u0926\u093f\u0924 \u0935\u093f\u0936\u0947\u0937 \u0911\u092b\u0930 \u0924\u092f\u093e\u0930 \u0915\u0930\u093e.",
    message: "\u0928\u092e\u0938\u094d\u0915\u093e\u0930! \u092f\u093e \u0906\u0920\u0935\u0921\u094d\u092f\u093e\u0924 \u0924\u0941\u092e\u091a\u094d\u092f\u093e\u0938\u093e\u0920\u0940 \u0916\u093e\u0938 \u0911\u092b\u0930 \u0906\u0939\u0947. \u0905\u0927\u093f\u0915 \u092e\u093e\u0939\u093f\u0924\u0940\u0938\u093e\u0920\u0940 \u0930\u093f\u092a\u094d\u0932\u093e\u092f \u0915\u0930\u093e.",
    followUp: "\u0905\u0932\u0940\u0915\u0921\u0947 \u0906\u0932\u0947\u0932\u094d\u092f\u093e \u0917\u094d\u0930\u093e\u0939\u0915\u093e\u0902\u0936\u0940 \u092b\u0949\u0932\u094b-\u0905\u092a \u0915\u0930\u093e \u0906\u0923\u093f \u0938\u094b\u092a\u094d\u092f\u093e \u0911\u092b\u0930\u0938\u0939 \u092a\u0941\u0928\u094d\u0939\u093e \u092f\u0947\u0923\u094d\u092f\u093e\u0938 \u0906\u092e\u0902\u0924\u094d\u0930\u0923 \u0926\u094d\u092f\u093e.",
    returnOffer: "\u092e\u093e\u0917\u0940\u0932 \u0917\u094d\u0930\u093e\u0939\u0915\u093e\u0902\u0928\u093e \u092a\u0941\u0928\u094d\u0939\u093e \u092c\u094b\u0932\u093e\u0935\u0923\u094d\u092f\u093e\u0938\u093e\u0920\u0940 \u0935\u093f\u0936\u0947\u0937 \u0911\u092b\u0930 \u0926\u094d\u092f\u093e.",
  },
  en: {
    growthMove: "Focus on one important action that can bring more customers this week.",
    offer: "Create a simple special offer for your customers this week.",
    message: "Hi! We have a special offer for you this week. Reply to know more.",
    followUp: "Contact previous customers and ask if they need your service.",
    returnOffer: "Create a special return offer to bring previous customers back.",
  },
};

function getRegionalText(language: string) {
  return REGIONAL_TEXT[language] || REGIONAL_TEXT.en;
}

export function getRegionalGrowthMove(language: string): string {
  return getRegionalText(language).growthMove;
}

export function getRegionalOffer(language: string): string {
  return getRegionalText(language).offer;
}

export function getRegionalMessage(
  language: string,
  businessName = ""
): string {
  const text = getRegionalText(language).message;

  if (language === "en" && businessName) {
    return `Hi! This is ${businessName}. We have a special offer for you this week. Reply to know more.`;
  }

  return text;
}

export function getRegionalFollowUp(language: string): string {
  return getRegionalText(language).followUp;
}

export function getRegionalReturnOffer(language: string): string {
  return getRegionalText(language).returnOffer;
}
export function getLocalGrowthMove(
  suggestions: string[]
): string {
  return (
    suggestions[0] ||
    "Complete your business profile to get your next growth move."
  );
}

export function getCustomerOfferIdea(
  category: string
): string {
  if (category) {
    return `Create a limited-time offer for your ${category} customers this week.`;
  }

  return "Create a simple limited-time offer for your customers this week.";
}

export function getCustomerMessage(
  businessName: string
): string {
  return `Hi! ${businessName ? `This is ${businessName}. ` : ""}We have a special offer for you this week. Reply to know more.`;
}

export function getRetentionIdea(businessName: string = ""): string {
  return `Follow up with recent customers${businessName ? ` of ${businessName}` : ""} and invite them to return with a simple offer.`;
}




