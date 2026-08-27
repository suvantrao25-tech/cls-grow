"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import BusinessProfileCard from "@/components/BusinessProfileCard";
import GrowthScoreCard from "@/components/GrowthScoreCard";
import BusinessProfileForm from "@/components/BusinessProfileForm";
import AISuggestionsCard from "@/components/AISuggestionsCard";
import GrowthTasksCard from "@/components/GrowthTasksCard";
import GrowthAuditReport from "@/components/GrowthAuditReport";
import ReviewsCard from "@/components/ReviewsCard";
import { useBusiness } from "@/components/BusinessContext";
import { getLocalGrowthMove, getCustomerOfferIdea, getCustomerMessage, getRetentionIdea } from "@/lib/subscription";

export default function Home() {
  const { business, audit, completedTasks } = useBusiness();
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
      <h1 className="text-3xl font-bold text-gray-800">
        Business Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Track your business growth with AI.
      </p>

      {!trialLoading && trial && (
        <div className="mt-6 bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                Current Plan
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {trial.plan === "START" ? "LOCAL - ₹299/month" : "FREE - 15-Day Trial"}
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
              href={trial.plan === "FREE" ? "/subscription" : "/billing"}
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              {trial.plan === "FREE"
                ? "Upgrade to LOCAL - ₹299/month"
                : "Manage LOCAL Plan"}
            </Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">
            Business Score
          </h2>

          <p className="text-4xl font-bold text-blue-600 mt-4">
            {audit.score}/100
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">
            Growth Tasks
          </h2>

          <p className="text-4xl font-bold text-green-600 mt-4">
            {audit.tasks.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Growth opportunities
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">
            AI Suggestions
          </h2>

          <p className="text-4xl font-bold text-purple-600 mt-4">
            {audit.suggestions.length}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <GrowthScoreCard />
      </div>

      <div className="mt-8 bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          Weekly Growth Move
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-2">
          Your Next Growth Move
        </h2>
        <p className="text-gray-600 mt-2">
          {getLocalGrowthMove(audit.suggestions)}
        </p>
      </div>
      <div className="mt-8">
        <BusinessProfileCard />
      </div>

      <div className="mt-8 bg-white border border-green-100 rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">
          Weekly Customer Offer
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-2">
          Offer Idea for This Week
        </h2>
        <p className="text-gray-600 mt-2">
          {getCustomerOfferIdea(business.category)}
        </p>
      </div>
      <div className="mt-8 bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
          Customer Message
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-2">
          Ready-to-Use Message
        </h2>
        <p className="text-gray-600 mt-2">
          {getCustomerMessage(business.businessName)}
        </p>
      </div>
      <div className="mt-8 bg-white border border-orange-100 rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
          Customer Retention
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-2">
          Retention Idea
        </h2>
        <p className="text-gray-600 mt-2">
          {getRetentionIdea()}
        </p>
      </div>
      <div className="mt-8">
        <GrowthAuditReport />
      </div>

      <div className="mt-8">
        <AISuggestionsCard />
      </div>

      <div className="mt-8">
        <GrowthTasksCard />
      </div>

      <div className="mt-8">
        <ReviewsCard />
      </div>

      <div className="mt-8">
        <BusinessProfileForm />
      </div>
      </DashboardLayout>
    </AuthGuard>
  );
}















