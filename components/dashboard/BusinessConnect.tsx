"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BusinessChat from "./BusinessChat";

type Business = {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  location: string;
};

type Connection = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
};

export default function BusinessConnect() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [openChat, setOpenChat] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const { data: businessData, error: businessError } = await supabase
      .from("business_profiles")
      .select("id, user_id, business_name, category, location")
      .neq("user_id", user.id)
      .limit(20);

    if (businessError) {
      console.error("Business Connect load error:", businessError.message);
    } else {
      setBusinesses(businessData || []);
    }

    const { data: connectionData, error: connectionError } = await supabase
      .from("business_connections")
      .select("id, requester_id, receiver_id, status")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (connectionError) {
      console.error("Connection load error:", connectionError.message);
    } else {
      setConnections(connectionData || []);
    }

    setLoading(false);
  }

  function getConnection(businessUserId: string) {
    return connections.find(
      (connection) =>
        (connection.requester_id === currentUserId &&
          connection.receiver_id === businessUserId) ||
        (connection.receiver_id === currentUserId &&
          connection.requester_id === businessUserId)
    );
  }

  async function sendRequest(receiverId: string) {
    if (!currentUserId || currentUserId === receiverId) return;

    setSending(receiverId);

    const { error } = await supabase
      .from("business_connections")
      .insert({
        requester_id: currentUserId,
        receiver_id: receiverId,
        status: "pending",
      });

    if (error) {
      alert(error.message);
    } else {
      alert("Connect request sent!");
      await loadData();
    }

    setSending(null);
  }

  if (loading) {
    return (
      <div className="mt-6 bg-white border border-teal-100 rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-gray-500">Loading businesses...</p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white border border-teal-100 rounded-2xl p-6 shadow-sm">
      <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">
        Business Connect
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-2">
        Connect With Other Businesses
      </h2>

      <p className="text-gray-600 mt-2">
        Discover other CLS GROW businesses, send a connection request,
        and chat after they accept.
      </p>

      {businesses.length === 0 ? (
        <p className="text-sm text-gray-500 mt-4">
          No businesses available yet.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {businesses.map((item) => {
            const connection = getConnection(item.user_id);

            const isConnected = connection?.status === "accepted";
            const isPending =
              connection?.status === "pending" &&
              connection.requester_id === currentUserId;

            return (
              <div key={item.id} className="border rounded-xl p-4">
                <p className="font-semibold text-gray-900">
                  {item.business_name}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {item.category} • {item.location}
                </p>

                {isConnected ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenChat(
                          openChat === item.user_id ? null : item.user_id
                        )
                      }
                      className="mt-3 px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
                    >
                      {openChat === item.user_id ? "Close Chat" : "Chat"}
                    </button>

                    {openChat === item.user_id && (
                      <BusinessChat
                        connectionId={connection.id}
                        otherBusinessName={item.business_name}
                        currentUserId={currentUserId}
                      />
                    )}
                  </>
                ) : isPending ? (
                  <button
                    type="button"
                    disabled
                    className="mt-3 px-4 py-2 rounded-lg bg-gray-200 text-gray-600 font-semibold"
                  >
                    Request Sent
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={sending === item.user_id}
                    onClick={() => sendRequest(item.user_id)}
                    className="mt-3 px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
                  >
                    {sending === item.user_id
                      ? "Sending..."
                      : "Send Connect Request"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

