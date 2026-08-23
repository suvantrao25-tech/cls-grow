
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Subscription = {
  plan: string;
  status: string;
  billing_cycle: string;
  amount: number;
  currency: string;
  current_period_start: string | null;
  current_period_end: string | null;
};

type Payment = {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  invoice_number: string | null;
  paid_at: string | null;
  created_at: string;
};

const plans = [
  {
    name: "LOCAL",
    price: 299,
    description:
      "An AI growth partner for small and local businesses. CLS GROW tells you what to focus on next, so you do less manual work.",
    active: true,
    popular: true,
  },
  {
    name: "BUSINESS",
    price: 699,
    description:
      "For struggling and small companies that need deeper AI monitoring and practical growth support.",
    comingSoon: true,
    popular: false,
  },
  {
    name: "SCALE",
    price: 1299,
    description:
      "For medium and growing companies that need advanced growth intelligence, automation and scalable workflows.",
    comingSoon: true,
    popular: false,
  },
];

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(
    null
  );

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadBilling() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        const { data: subscriptionData, error: subscriptionError } =
          await supabase
            .from("subscriptions")
            .select(
              "plan, status, billing_cycle, amount, currency, current_period_start, current_period_end"
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (subscriptionError) {
          console.error(
            "Subscription load error:",
            subscriptionError.message
          );
        }

        const { data: paymentData, error: paymentError } = await supabase
          .from("payments")
          .select(
            "id, plan, amount, currency, status, invoice_number, paid_at, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (paymentError) {
          console.error(
            "Payment history load error:",
            paymentError.message
          );
        }

        if (mounted) {
          setSubscription(subscriptionData || null);
          setPayments(paymentData || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Billing load error:", error);

        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadBilling();

    return () => {
      mounted = false;
    };
  }, []);

  const currentPlan = subscription?.plan || "FREE";
  const displayPlan = currentPlan === "START" ? "LOCAL" : currentPlan === "GROW" ? "BUSINESS" : currentPlan === "PRO" ? "SCALE" : currentPlan;
  const currentStatus = subscription?.status || "active";

  const currentAmount =
    subscription?.amount != null ? subscription.amount : 0;

  const billingCycle = subscription?.billing_cycle || "Forever";

  const nextBillingDate =
    subscription?.current_period_end &&
    currentPlan !== "FREE"
      ? new Date(subscription.current_period_end).toLocaleDateString(
          "en-IN"
        )
      : "-";

  const formatAmount = (amount: number) => {
    return "\u20B9" + amount.toLocaleString("en-IN");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          Billing
        </p>

        <h1 className="text-4xl font-bold text-gray-900 mt-2">
          Billing & Subscription
        </h1>

        <p className="text-gray-600 mt-3 max-w-2xl">
          Manage your CLS GROW plan, billing information, payment
          history, and subscription.
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>

            <h2 className="text-3xl font-bold text-gray-900 mt-1">
              {loading ? "Loading..." : displayPlan}
            </h2>

            <p className="text-gray-600 mt-1">
              {formatAmount(currentAmount)} /{" "}
              {currentPlan === "FREE" ? "15-Day Trial" : billingCycle}
            </p>
          </div>

          <span className="inline-flex w-fit px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
            {currentStatus}
          </span>
        </div>

        <div className="border-t mt-6 pt-6 grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">
              Next Billing Date
            </p>

            <p className="font-semibold text-gray-900 mt-1">
              {nextBillingDate}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {currentPlan === "FREE"
                ? "No billing for FREE plan"
                : "Next subscription renewal"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Payment Method
            </p>

            <p className="font-semibold text-gray-900 mt-1">
              Not added
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Payment details will appear after a paid transaction.
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Billing Cycle
            </p>

            <p className="font-semibold text-gray-900 mt-1">
              {currentPlan === "FREE" ? "15-Day Trial" : billingCycle}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {currentPlan === "FREE"
                ? "FREE plan"
                : "Paid subscription"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/subscription"
            className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Change Plan
          </Link>

          <Link
            href="/subscription"
            className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
          >
            View All Plans
          </Link>
        </div>
      </div>

      {/* Available Plans */}
      <div className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Plans
          </h2>

          <p className="text-gray-600 mt-1">
            Upgrade or downgrade your plan whenever your business needs
            change.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-6 ${
                plan.popular
                  ? "border-2 border-blue-600 shadow-md"
                  : "border border-gray-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-5 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}

              <h3 className="text-xl font-bold text-gray-900">
                {plan.name}
              </h3>

              <p className="text-3xl font-bold text-gray-900 mt-3">
                {formatAmount(plan.price)}
                <span className="text-sm font-normal text-gray-500">
                  /month
                </span>
              </p>

              <p className="text-sm text-gray-600 mt-3">
                {plan.description}
              </p>

            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Billing History
            </h2>

            <p className="text-gray-600 mt-1">
              Your invoices and payment history.
            </p>
          </div>

          <span className="text-sm font-medium text-gray-500">
            {payments.length} transactions
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-6 text-center">
            <p className="font-semibold text-gray-700">
              No billing history available.
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Your invoices will appear here after a paid subscription
              is activated.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-3 text-sm font-semibold text-gray-600">
                    Plan
                  </th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-600">
                    Invoice
                  </th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-100"
                  >
                    <td className="py-4 px-3 font-semibold text-gray-900">
                      {payment.plan === "START" ? "LOCAL" : payment.plan === "GROW" ? "BUSINESS" : payment.plan === "PRO" ? "SCALE" : payment.plan}
                    </td>

                    <td className="py-4 px-3 text-gray-700">
                      {formatAmount(payment.amount)}
                    </td>

                    <td className="py-4 px-3">
                      <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                        {payment.status}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-gray-700">
                      {payment.invoice_number || "-"}
                    </td>

                    <td className="py-4 px-3 text-gray-700">
                      {new Date(
                        payment.paid_at || payment.created_at
                      ).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Payment Method
        </h2>

        <p className="text-gray-600 mt-2">
          Payment information from your CLS GROW transactions.
        </p>

        <div className="mt-5 flex items-center justify-between border rounded-xl p-4">
          <div>
            <p className="font-semibold text-gray-900">
              No payment method added
            </p>

            <p className="text-sm text-gray-500 mt-1">
              A payment method will appear after your first paid
              transaction.
            </p>
          </div>

          <Link
            href="/subscription"
            className="px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800"
          >
            Manage Payment
          </Link>
        </div>
      </div>

      {/* Manage Subscription */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-7">
        <h2 className="text-2xl font-bold text-gray-900">
          Manage Your Subscription
        </h2>

        <p className="text-gray-600 mt-2 max-w-2xl">
          Upgrade, downgrade, or cancel your subscription when your
          business needs change.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white border border-blue-100 rounded-xl p-5">
            <h3 className="font-bold text-gray-900">Upgrade</h3>

            <p className="text-sm text-gray-600 mt-2">
              Move to a higher plan for more growth capabilities.
            </p>
          </div>

          <div className="bg-white border border-blue-100 rounded-xl p-5">
            <h3 className="font-bold text-gray-900">Downgrade</h3>

            <p className="text-sm text-gray-600 mt-2">
              Move to a lower plan when your business needs change.
            </p>
          </div>

          <div className="bg-white border border-blue-100 rounded-xl p-5">
            <h3 className="font-bold text-gray-900">Cancel</h3>

            <p className="text-sm text-gray-600 mt-2">
              Manage or cancel your paid subscription when available.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 mb-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/subscription"
          className="px-6 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800"
        >
          Manage Plans
        </Link>

        <Link
          href="/"
          className="px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

















