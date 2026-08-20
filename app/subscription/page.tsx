"use client";

import { useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    name: "FREE",
    price: "0",
    period: "Forever",
    description:
      "Start understanding your business and discover growth opportunities.",
    featured: false,
    comingSoon: false,
    features: [
      "Business Profile",
      "Business Growth Score",
      "Basic Business Analysis",
      "AI Growth Suggestions",
      "Growth Tasks",
      "My Business Problem",
      "Basic Problem Analysis",
      "Basic Growth Plan",
      "Limited Monitoring",
    ],
  },
  {
    name: "START",
    price: "299",
    period: "/month",
    description:
      "Essential growth tools for small and local businesses.",
    featured: false,
    comingSoon: false,
    features: [
      "Everything in FREE",
      "Regular Business Analysis",
      "Local SEO Recommendations",
      "Social Media Growth",
      "Basic Competitor Analysis",
      "Lead Generation Opportunities",
      "Customer Retention Suggestions",
      "Weekly Growth Plan",
      "More AI Actions",
      "Growth Progress Tracking",
    ],
  },
  {
    name: "GROW",
    price: "699",
    period: "/month",
    description:
      "Your complete AI-powered business growth system.",
    featured: true,
    comingSoon: true,
    features: [
      "Everything in START",
      "Continuous Business Monitoring",
      "Automatic Problem Detection",
      "AI Growth Strategy",
      "Advanced Competitor Analysis",
      "Lead & Conversion Analysis",
      "Marketing Campaign Recommendations",
      "Customer Acquisition Strategy",
      "Customer Retention Strategy",
      "Advanced Local SEO",
      "Social Media Growth Strategy",
      "Monthly Growth Strategy",
      "Advanced Performance Tracking",
      "Higher AI Usage",
      "Growth Opportunity Alerts",
    ],
  },
  {
    name: "PRO",
    price: "1,299",
    period: "/month",
    description:
      "Advanced growth, automation and business intelligence.",
    featured: false,
    comingSoon: true,
    features: [
      "Everything in GROW",
      "Advanced Automation",
      "Multiple Growth Campaigns",
      "Advanced Business Intelligence",
      "Advanced Analytics",
      "Deeper Competitor Monitoring",
      "Lead & Funnel Optimization",
      "Advanced Growth Opportunities",
      "Higher AI Usage",
      "Priority Processing",
      "Advanced Reports",
      "Powerful Growth Workflows",
    ],
  },
];

export default function SubscriptionPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePayment = async (
    plan: "START" | "GROW" | "PRO"
  ) => {
    try {
      setLoadingPlan(plan);

      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () =>
            reject(
              new Error("Razorpay Checkout load nahi hua")
            );
          document.body.appendChild(script);
        });
      }

      const response = await fetch(
        "/api/payments/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Payment order create nahi hua"
        );
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Creator Launch Space",
        description: `CLS GROW - ${plan}`,
        order_id: data.orderId,

        handler: async function (paymentResponse: any) {
          try {
            console.log("Razorpay payment successful:", paymentResponse);

            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                plan,
              }),
            });

            const verifyData = await verifyResponse.json();

            console.log("PAYMENT VERIFICATION RESULT:", verifyData);

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.error || "Payment verification failed"
              );
            }

            alert(`${plan} plan activated successfully!`);

            window.location.href = "/billing";
          } catch (error) {
            console.error("PAYMENT VERIFICATION ERROR:", error);

            alert(
              error instanceof Error
                ? error.message
                : "Payment verification failed"
            );
          }
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response: any) {
          console.error(
            "Razorpay payment failed:",
            response.error
          );

          alert(
            "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Payment start nahi ho saka"
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          CLS GROW Plans
        </p>

        <h1 className="text-4xl font-bold text-gray-900 mt-2">
          Choose Your Growth Plan
        </h1>

        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Start free and upgrade when your business needs more.
          Every plan is designed to help your business get more
          visibility, customers, leads, and repeat business.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10 text-center">
        <h2 className="text-xl font-bold text-gray-900">
          Flexible Plans. Change Anytime.
        </h2>

        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Upgrade whenever your business needs more growth tools.
          You can also downgrade your plan when your needs change.
          Downgrades take effect from the next billing cycle.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 bg-white border border-blue-100 rounded-lg px-4 py-2">
          <span className="text-sm text-gray-600">
            Current Plan:
          </span>

          <span className="font-bold text-blue-600">
            FREE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-2xl border p-6 flex flex-col ${
              plan.featured
                ? "border-blue-600 shadow-xl ring-2 ring-blue-100"
                : "border-gray-200 shadow-sm"
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                  MOST POPULAR
                </span>
              </div>
            )}

            <div className="min-h-[28px]">
              {plan.comingSoon && (
                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                  COMING SOON
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-3">
              {plan.name}
            </h2>

            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-bold text-gray-900">
                {String.fromCharCode(8377)}
                {plan.price}
              </span>

              <span className="text-gray-500 mb-1">
                {plan.period}
              </span>
            </div>

            <p className="text-sm text-gray-600 mt-4 min-h-[60px]">
              {plan.description}
            </p>

            <button
              disabled={
                plan.comingSoon ||
                loadingPlan === plan.name
              }
              onClick={() => {
                if (
                  plan.name === "START" ||
                  plan.name === "GROW" ||
                  plan.name === "PRO"
                ) {
                  handlePayment(plan.name);
                }
              }}
              className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${
                plan.comingSoon ||
                loadingPlan === plan.name
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {plan.comingSoon
                ? "Coming Soon"
                : loadingPlan === plan.name
                  ? "Processing..."
                  : plan.name === "FREE"
                    ? "Current Plan"
                    : "Choose Plan"}
            </button>

            <div className="border-t mt-6 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                What's included
              </h3>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-green-600 font-bold">
                      {String.fromCharCode(10003)}
                    </span>

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Manage Your Plan
          </h2>

          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Your business can change over time. Your CLS GROW plan
            can change with it.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-7">
          <div className="border rounded-xl p-5 text-center">
            <h3 className="font-semibold text-gray-900">
              Upgrade
            </h3>

            <p className="text-sm text-gray-600 mt-2">
              Get more tools and advanced growth capabilities.
            </p>
          </div>

          <div className="border rounded-xl p-5 text-center">
            <h3 className="font-semibold text-gray-900">
              Downgrade
            </h3>

            <p className="text-sm text-gray-600 mt-2">
              Move to a lower plan when your business needs change.
            </p>
          </div>

          <div className="border rounded-xl p-5 text-center">
            <h3 className="font-semibold text-gray-900">
              Cancel
            </h3>

            <p className="text-sm text-gray-600 mt-2">
              Manage or cancel your subscription when needed.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Subscription changes and payments will be available when
          paid plans launch.
        </p>
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Need something specific for your business?
        </h2>

        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Website creation, advanced SEO, Google Business Profile
          optimization, marketing campaigns, and other custom
          business-growth services may be available separately.
        </p>

        <Link
          href="/"
          className="inline-block mt-5 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}







