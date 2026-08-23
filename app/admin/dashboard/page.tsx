"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

type Stats = {
  customers: number;
  businesses: number;
  growthTasks: number;
  completedTasks: number;
  subscriptions: number;
  activeSubscriptions: number;
  payments: number;
  reviews: number;
  totalRevenue: number;
};

type Business = {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  location: string;
  language?: string;
  created_at: string;
};

type Payment = {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

type Subscription = {
  id: string;
  plan: string;
  status: string;
  billing_cycle: string;
  amount: number;
  currency: string;
  created_at: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/admin/login");
          return;
        }

        const response = await fetch("/api/admin/stats", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.authorized) {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }

        setEmail(result.admin?.email ?? "");
        setStats(result.stats);
        setBusinesses(result.recentBusinesses ?? []);
        setPayments(result.recentPayments ?? []);
        setSubscriptions(result.recentSubscriptions ?? []);
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);
        setError("Unable to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut({
      scope: "global",
    });

    if (error) {
      console.error("ADMIN LOGOUT ERROR:", error);
    }
  } finally {
    window.location.replace("/admin/login");
  }
}

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Loading CLS GROW Admin...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white border rounded-2xl p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            CLS GROW Admin
          </h1>

          <p className="text-sm text-gray-500">
            Super Admin Control Panel
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
        >
          Logout
        </button>
      </header>

      <div className="p-6 max-w-7xl mx-auto">

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Logged in as
          </p>

          <p className="font-semibold text-gray-900">
            {email}
          </p>
        </div>

        {/* STAT CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Customers
            </p>

            <p className="text-3xl font-bold mt-2 text-gray-900">
              {stats?.customers ?? 0}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Businesses
            </p>

            <p className="text-3xl font-bold mt-2 text-gray-900">
              {stats?.businesses ?? 0}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Growth Tasks
            </p>

            <p className="text-3xl font-bold mt-2 text-gray-900">
              {stats?.growthTasks ?? 0}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {stats?.completedTasks ?? 0} completed
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Active Subscriptions
            </p>

            <p className="text-3xl font-bold mt-2 text-gray-900">
              {stats?.activeSubscriptions ?? 0}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {stats?.subscriptions ?? 0} total
            </p>
          </div>

        </div>

        {/* REVENUE */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Total Payments
            </p>

            <p className="text-3xl font-bold mt-2">
              {stats?.payments ?? 0}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Total Revenue
            </p>

            <p className="text-3xl font-bold mt-2">
              INR {(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Reviews
            </p>

            <p className="text-3xl font-bold mt-2">
              {stats?.reviews ?? 0}
            </p>
          </div>

        </div>

        {/* RECENT BUSINESSES */}

        <div className="mt-6 bg-white border rounded-2xl overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Businesses
            </h2>
          </div>

          {businesses.length === 0 ? (
            <div className="p-6 text-gray-500">
              No businesses found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">Business</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Location</th>
                    <th className="text-left p-4">Created</th>
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {businesses.map((business) => (
                    <tr key={business.id} className="border-t">

                      <td className="p-4 font-medium">
                        {business.business_name || "—"}
                      </td>

                      <td className="p-4">
                        {business.category || "—"}
                      </td>

                      <td className="p-4">
                        {business.location || "—"}
                      </td>

                      <td className="p-4 text-gray-500">
                        {new Date(
                          business.created_at
                        ).toLocaleDateString("en-IN")}
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/admin/businesses/${business.user_id}`)
                          }
                          className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 cursor-pointer"
                        >
                          View Dashboard
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

        {/* RECENT PAYMENTS */}

        <div className="mt-6 bg-white border rounded-2xl overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Payments
            </h2>
          </div>

          {payments.length === 0 ? (
            <div className="p-6 text-gray-500">
              No payments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">Plan</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-t">

                      <td className="p-4 font-medium">
                        {payment.plan || "—"}
                      </td>

                      <td className="p-4">
                        {payment.currency || "INR"}{" "}
                        {Number(payment.amount || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">
                          {payment.status || "—"}
                        </span>
                      </td>

                      <td className="p-4 text-gray-500">
                        {new Date(
                          payment.created_at
                        ).toLocaleDateString("en-IN")}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

        {/* RECENT SUBSCRIPTIONS */}

        <div className="mt-6 bg-white border rounded-2xl overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Subscriptions
            </h2>
          </div>

          {subscriptions.length === 0 ? (
            <div className="p-6 text-gray-500">
              No subscriptions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">Plan</th>
                    <th className="text-left p-4">Billing</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="border-t">

                      <td className="p-4 font-medium">
                        {subscription.plan || "—"}
                      </td>

                      <td className="p-4">
                        {subscription.billing_cycle || "—"}
                      </td>

                      <td className="p-4">
                        {subscription.currency || "INR"}{" "}
                        {Number(
                          subscription.amount || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">
                          {subscription.status || "—"}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          CLS GROW Admin • Super Admin Access
        </div>

      </div>
    </main>
  );
}



