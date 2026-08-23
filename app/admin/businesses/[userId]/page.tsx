"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { runGrowthAudit } from "@/lib/growthAudit";

type Business = {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  location: string;
  phone: string;
  website: string;
  language: string;
  created_at: string;
};

type GrowthTask = {
  id: string;
  task: string;
  completed: boolean;
  created_at: string;
};

type Subscription = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  billing_cycle: string;
  amount: number;
  currency: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
};

export default function AdminBusinessPage() {
  const router = useRouter();
  const params = useParams();

  const userId = params.userId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [tasks, setTasks] = useState<GrowthTask[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBusiness() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/admin/login");
          return;
        }

        const response = await fetch(
          "/api/admin/businesses?userId=" +
            encodeURIComponent(userId),
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.authorized) {
          setError("Unable to load business.");
          return;
        }

        if (!result.business) {
          setError("Business not found.");
          return;
        }

        setBusiness(result.business);
        setTasks(result.tasks || []);
        setSubscription(result.subscription || null);
      } catch (err) {
        console.error("BUSINESS DASHBOARD ERROR:", err);
        setError("Unable to load business.");
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadBusiness();
    }
  }, [router, userId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading business...</p>
      </main>
    );
  }

  if (error || !business) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="mb-6 px-4 py-2 rounded-lg border bg-white text-sm font-medium cursor-pointer hover:bg-gray-50"
          >
            Back to Admin Dashboard
          </button>

          <div className="bg-white border rounded-2xl p-8">
            <p className="text-red-600">
              {error || "Business not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const audit = runGrowthAudit({
    businessName: business.business_name,
    category: business.category,
    location: business.location,
    phone: business.phone,
    website: business.website,
  });

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="text-sm text-blue-600 hover:underline cursor-pointer"
          >
            Back to Admin Dashboard
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mt-3">
            {business.business_name}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Admin Business Dashboard
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">Growth Score</p>

            <div className="flex items-center gap-4 mt-3">
              <div className="w-20 h-20 rounded-full border-8 border-blue-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {audit.score}
                </span>
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  {audit.status}
                </p>
                <p className="text-sm text-gray-500">
                  Out of 100
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">Growth Tasks</p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {tasks.length}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {completedTasks} completed
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">Subscription</p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {subscription?.plan || "FREE"}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {subscription?.status || "No active subscription"}
            </p>

            {subscription && (
              <p className="text-sm text-gray-600 mt-2">
                {subscription.currency} {subscription.amount} /{" "}
                {subscription.billing_cycle}
              </p>
            )}
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

          <div className="bg-white border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Business Profile
            </h2>

            <div className="space-y-4">
              {[
                ["Business Name", business.business_name],
                ["Category", business.category],
                ["Location", business.location],
                ["Phone", business.phone],
                ["Website", business.website],
                ["Language", business.language],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-medium text-gray-900">
                    {value || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Business Status
            </h2>

            <div className="space-y-4">

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500">
                  Profile Created
                </p>

                <p className="font-medium text-gray-900 mt-1">
                  {new Date(
                    business.created_at
                  ).toLocaleDateString("en-IN")}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500">
                  User ID
                </p>

                <p className="font-mono text-xs text-gray-700 mt-1 break-all">
                  {business.user_id}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500">
                  Business Status
                </p>

                <p className="font-semibold text-green-600 mt-1">
                  Active
                </p>
              </div>

            </div>
          </div>

        </div>

        <div className="bg-white border rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900">
            Growth Tasks
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {completedTasks} of {tasks.length} tasks completed
          </p>

          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500 mt-5">
              No growth tasks found.
            </p>
          ) : (
            <div className="space-y-3 mt-5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border ${
                    task.completed
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-sm ${
                        task.completed
                          ? "bg-green-600 border-green-600 text-white"
                          : "border-gray-400"
                      }`}
                    >
                      {task.completed ? "✓" : ""}
                    </div>

                    <span
                      className={
                        task.completed
                          ? "text-gray-500 line-through"
                          : "text-gray-700"
                      }
                    >
                      {task.task}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900">
            AI Growth Recommendations
          </h2>

          <div className="space-y-3 mt-5">
            {audit.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-blue-50 border border-blue-100"
              >
                <p className="text-sm text-gray-700">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900">
            Next Growth Action
          </h2>

          <p className="text-gray-700 mt-2">
            {audit.tasks[0] ||
              "Continue improving your business growth."}
          </p>
        </div>

      </div>
    </main>
  );
}