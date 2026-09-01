"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import BusinessProfileCard from "@/components/BusinessProfileCard";
import GoogleBusinessProfileCard from "@/components/GoogleBusinessProfileCard";
import BusinessProfileForm from "@/components/BusinessProfileForm";
import BusinessConnectRequests from "@/components/dashboard/BusinessConnectRequests";
import BusinessConnect from "@/components/dashboard/BusinessConnect";
import VideoCreator from "@/components/dashboard/VideoCreator";
import AIBusinessAction from "@/components/dashboard/AIBusinessAction";
import { useBusiness } from "@/components/BusinessContext";
import {
  getLocalGrowthMove,
  getCustomerOfferIdea,
  getCustomerMessage,
  getRetentionIdea,
  getRegionalGrowthMove,
  getRegionalOffer,
  getRegionalMessage,
  getRegionalFollowUp,
  getRegionalReturnOffer,
} from "@/lib/subscription";

export default function Home() {
  const { business, audit } = useBusiness();

  const [trialLoading, setTrialLoading] = useState(true);
  const [trial, setTrial] = useState<{
    plan: string;
    status: string;
    trial_ends_at: string | null;
  } | null>(null);

  useEffect(() => {
    async function loadTrial() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setTrialLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan, status, trial_ends_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Trial status load error:", error.message);
      }

      setTrial(data || null);
      setTrialLoading(false);
    }

    loadTrial();
  }, []);

  const trialEnd = trial?.trial_ends_at
    ? new Date(trial.trial_ends_at)
    : null;

  const now = new Date();

  const copyMessage = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      alert("Message copied!");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = message;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("Message copied!");
    }
  };

  const daysRemaining =
    trialEnd && trial?.plan === "FREE"
      ? Math.max(
          0,
          Math.ceil(
            (trialEnd.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const trialExpired =
    trial?.plan === "FREE" &&
    trialEnd &&
    trialEnd.getTime() <= now.getTime();

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800">
            Business Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Simple actions to help your business grow locally.
          </p>

          {!trialLoading && trial && (
            <div className="mt-6 bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                    Current Plan
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {trial.plan === "START"
                      ? "LOCAL - ₹299/month"
                      : "FREE - 15-Day Trial"}
                  </h2>

                  {trial.plan === "FREE" ? (
                    <>
                      {trialExpired ? (
                        <p className="text-red-600 font-semibold mt-2">
                          Your free trial has expired.
                        </p>
                      ) : (
                        <p className="text-gray-600 mt-2">
                          {daysRemaining} days remaining
                        </p>
                      )}

                      {trialEnd && (
                        <p className="text-sm text-gray-500 mt-1">
                          Trial ends:{" "}
                          {trialEnd.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-600 mt-2">
                      Your business is using LOCAL growth tools.
                    </p>
                  )}
                </div>

                <Link
                  href={
                    trial.plan === "FREE"
                      ? "/subscription"
                      : "/billing"
                  }
                  className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  {trial.plan === "FREE"
                    ? "Upgrade to LOCAL - ₹299/month"
                    : "Manage LOCAL Plan"}
                </Link>
              </div>
            </div>
          )}

          {/* 1. NEXT GROWTH MOVE */}
          <div className="mt-8 bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              1. Next Growth Move
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              Your Next Growth Move
            </h2>

            <p className="text-gray-600 mt-3">
              {business.language !== "en" ? getRegionalGrowthMove(business.language) : getLocalGrowthMove(audit.suggestions)}
            </p>
          </div>

          <AIBusinessAction suggestions={audit.suggestions} />
          {/* 2. GET MORE CUSTOMERS */}
          <div className="mt-6 bg-white border border-green-100 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">
              2. Get More Customers
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-2">
              Weekly Customer Offer
            </h2>

            <p className="text-gray-600 mt-2">
              {business.language !== "en" ? getRegionalOffer(business.language) : getCustomerOfferIdea(business.category)}
            </p>

            <div className="mt-5 bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700">
                Ready-to-Use Customer Message
              </p>

              <p className="text-gray-600 mt-2">
                {business.language !== "en" ? getRegionalMessage(business.language, business.businessName) : getCustomerMessage(business.businessName)}
              </p>
            </div>
          </div>

          {/* 3. CUSTOMER FOLLOW-UP */}
          <div className="mt-6 bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
              3. Customer Follow-Up
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-2">
              Customer Follow-Up
            </h2>

            <p className="text-gray-600 mt-2">
              Stay connected with interested and previous customers.
            </p>

            <div className="mt-5 bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700">
                Ready-to-Use Follow-Up Message
              </p>

              <p className="text-gray-600 mt-2">
                Hi! We hope you are doing well. We’d be happy to serve you again. Please contact us anytime.
              </p>

              <button
                type="button"
                onClick={() =>
                  copyMessage(
                    "Hi! We hope you are doing well. We’d be happy to serve you again. Please contact us anytime."
                  )
                }
                className="mt-3 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold cursor-pointer"
              >
                Copy Message
              </button>
            </div>
          </div>

          {/* 4. BRING CUSTOMERS BACK */}
          <div className="mt-6 bg-white border border-orange-100 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
              4. Bring Customers Back
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-2">
              Customer Return Offer
            </h2>

            <p className="text-gray-600 mt-2">
              Give previous customers a simple reason to return and buy from your business again.
            </p>

            <div className="mt-5 bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700">
                This Week's Return Offer
              </p>

              <p className="text-gray-600 mt-2">
                Welcome back offer: Get a special discount on your next purchase this week.
              </p>

              <p className="text-sm font-semibold text-gray-700 mt-4">
                Ready-to-Use Return Message
              </p>

              <p className="text-gray-600 mt-2">
                Hi! This is {business.businessName || "our business"}. We would love to welcome you back. Contact us to know about this week's special offer.
              </p>

              <button
                type="button"
                onClick={() =>
                  copyMessage(
                    `Hi! This is ${business.businessName || "our business"}. We would love to welcome you back. Contact us to know about this week's special offer.`
                  )
                }
                className="mt-3 px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold cursor-pointer"
              >
                Copy Return Offer Message
              </button>
            </div>
          </div>
          {/* 5. LOCAL VISIBILITY */}
          <div className="mt-6">
            <div className="mb-3">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                5. Local Visibility
              </p>
            </div>

            <GoogleBusinessProfileCard />
          </div>

          {/* 6. BUSINESS PROFILE */}
          <div className="mt-6">
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                6. Business Profile
              </p>
            </div>

            <BusinessProfileCard />
          </div>

          <div className="mt-6 bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              7. AI Business Video
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-2">
              Create Today’s Business Video
            </h2>

            <p className="text-gray-600 mt-2">
              Create a short promotional video for your business with your photos and background music.
            </p>

            <div className="mt-5">
              <VideoCreator />
            </div>
          </div>
          {/* 8. BUSINESS CONNECT */}
          <div className="mt-6 bg-white border border-teal-100 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">
              8. Business Connect
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-2">
              Connect With Other Businesses
            </h2>
            <p className="text-gray-600 mt-2">
              Connect and chat with other local businesses.
            </p>
            <div className="mt-5">
              <BusinessConnectRequests />
              <div className="mt-4">
                <BusinessConnect />
              </div>
            </div>
          </div>
          {/* GROWTH PROGRESS */}
          <div className="mt-8 bg-white rounded-2xl shadow-sm border p-6">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              9. Growth Progress
            </p>

            <div className="grid md:grid-cols-3 gap-5 mt-5">
              <div>
                <p className="text-sm text-gray-500">
                  Business Score
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {audit.score}/100
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Growth Opportunities
                </p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {audit.tasks.length}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  AI Suggestions
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {audit.suggestions.length}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">
                  Business Profile
                </span>
                <span className="text-gray-500">
                  {audit.completedFields}/{audit.totalFields}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{
                    width: `${
                      audit.totalFields
                        ? (audit.completedFields /
                            audit.totalFields) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* PROFILE SETUP */}
          <div className="mt-8">
            <BusinessProfileForm />
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
























