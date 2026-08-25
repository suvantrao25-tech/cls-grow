"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

type Customer = {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  banned_until?: string | null;
};

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

export default function AdminCustomerPage() {
  const router = useRouter();
  const params = useParams();

  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/admin/login");
          return;
        }

        const customerResponse = await fetch(
          "/api/admin/customers",
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          }
        );

        const customerResult =
          await customerResponse.json();

        if (
          !customerResponse.ok ||
          !customerResult.authorized
        ) {
          setError("Unable to load customer.");
          return;
        }

        const foundCustomer =
          (customerResult.customers ?? []).find(
            (item: Customer) => item.id === customerId
          );

        if (!foundCustomer) {
          setError("Customer not found.");
          return;
        }

        setCustomer(foundCustomer);

        const businessResponse = await fetch(
          "/api/admin/businesses?userId=" +
            encodeURIComponent(customerId),
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          }
        );

        const businessResult =
          await businessResponse.json();

        if (
          businessResponse.ok &&
          businessResult.authorized
        ) {
          setBusiness(businessResult.business ?? null);
          setSubscription(
            businessResult.subscription ?? null
          );
        }
      } catch (err) {
        console.error(
          "CUSTOMER PROFILE ERROR:",
          err
        );

        setError("Unable to load customer.");
      } finally {
        setLoading(false);
      }
    }

    if (customerId) {
      loadCustomer();
    }
  }, [router, customerId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Loading customer profile...
        </p>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() =>
              router.push("/admin/dashboard")
            }
            className="mb-6 px-4 py-2 rounded-lg border bg-white text-sm font-medium hover:bg-gray-50 cursor-pointer"
          >
            Back to Admin Dashboard
          </button>

          <div className="bg-white border rounded-2xl p-8">
            <p className="text-red-600">
              {error || "Customer not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto">

          <button
            onClick={() =>
              router.push("/admin/dashboard")
            }
            className="text-sm text-blue-600 hover:underline cursor-pointer"
          >
            Back to Admin Dashboard
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mt-3">
            Customer Profile
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            CLS GROW Customer Details
          </p>

        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Account Status
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {customer.banned_until
                ? "Banned"
                : "Active"}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Email Status
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {customer.email_confirmed_at
                ? "Verified"
                : "Unverified"}
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Current Plan
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {subscription?.plan || "FREE"}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {subscription?.status ||
                "No active subscription"}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

          <div className="bg-white border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Account Information
            </h2>

            <div className="space-y-4">

              <div>
                <p className="text-xs text-gray-500">
                  Email
                </p>

                <p className="font-medium text-gray-900 break-all">
                  {customer.email || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Registration Date
                </p>

                <p className="font-medium text-gray-900">
                  {new Date(
                    customer.created_at
                  ).toLocaleDateString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Last Login
                </p>

                <p className="font-medium text-gray-900">
                  {customer.last_sign_in_at
                    ? new Date(
                        customer.last_sign_in_at
                      ).toLocaleString("en-IN")
                    : "Never"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Email Verification
                </p>

                <p className="font-medium text-gray-900">
                  {customer.email_confirmed_at
                    ? new Date(
                        customer.email_confirmed_at
                      ).toLocaleDateString("en-IN")
                    : "Not verified"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  User ID
                </p>

                <p className="font-mono text-xs text-gray-700 break-all">
                  {customer.id}
                </p>
              </div>

            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Business Profile
            </h2>

            {!business ? (
              <p className="text-sm text-gray-500">
                No business profile created yet.
              </p>
            ) : (
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
                    <p className="text-xs text-gray-500">
                      {label}
                    </p>

                    <p className="font-medium text-gray-900">
                      {value || "-"}
                    </p>
                  </div>
                ))}

              </div>
            )}

          </div>

        </div>

        <div className="bg-white border rounded-2xl p-6 mt-6">

          <h2 className="text-lg font-bold text-gray-900">
            Subscription
          </h2>

          {!subscription ? (
            <p className="text-sm text-gray-500 mt-4">
              No subscription found. Customer is currently on FREE.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-5">

              <div>
                <p className="text-xs text-gray-500">
                  Plan
                </p>
                <p className="font-semibold text-gray-900 mt-1">
                  {subscription.plan}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>
                <p className="font-semibold text-gray-900 mt-1">
                  {subscription.status}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Billing
                </p>
                <p className="font-semibold text-gray-900 mt-1">
                  {subscription.currency}{" "}
                  {subscription.amount} /{" "}
                  {subscription.billing_cycle}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Created
                </p>
                <p className="font-semibold text-gray-900 mt-1">
                  {new Date(
                    subscription.created_at
                  ).toLocaleDateString("en-IN")}
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}
