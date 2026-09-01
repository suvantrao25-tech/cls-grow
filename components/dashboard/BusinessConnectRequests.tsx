"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Request = {
  id: string;
  requester_id: string;
  business_name: string;
  category: string;
  location: string;
};

export default function BusinessConnectRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: connectionData, error: connectionError } = await supabase
      .from("business_connections")
      .select("id, requester_id")
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    if (connectionError) {
      console.error("Connect requests error:", connectionError.message);
      setLoading(false);
      return;
    }

    if (!connectionData || connectionData.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const requesterIds = connectionData.map((item) => item.requester_id);

    const { data: profileData, error: profileError } = await supabase
      .from("business_profiles")
      .select("user_id, business_name, category, location")
      .in("user_id", requesterIds);

    if (profileError) {
      console.error("Business profile error:", profileError.message);
      setLoading(false);
      return;
    }

    const formatted = connectionData.map((item) => {
      const profile = profileData?.find(
        (p) => p.user_id === item.requester_id
      );

      return {
        id: item.id,
        requester_id: item.requester_id,
        business_name: profile?.business_name || "Business",
        category: profile?.category || "",
        location: profile?.location || "",
      };
    });

    setRequests(formatted);
    setLoading(false);
  }

  async function updateRequest(id: string, status: "accepted" | "declined") {
    const { error } = await supabase
      .from("business_connections")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setRequests((current) => current.filter((item) => item.id !== id));
  }

  if (loading) {
    return <p className="text-sm text-gray-500 mt-4">Loading requests...</p>;
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-white border border-teal-100 rounded-2xl p-6 shadow-sm">
      <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">
        Connection Requests
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-2">
        Businesses Want to Connect
      </h2>

      <div className="mt-5 space-y-3">
        {requests.map((item) => (
          <div key={item.id} className="border rounded-xl p-4">
            <p className="font-semibold text-gray-900">
              {item.business_name}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {item.category} • {item.location}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => updateRequest(item.id, "accepted")}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold"
              >
                Accept
              </button>

              <button
                onClick={() => updateRequest(item.id, "declined")}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
