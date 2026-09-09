"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useBusiness } from "@/components/BusinessContext";

type Broadcast = {
  id: string;
  business_id: string;
  user_id: string;
  category: string;
  message: string;
  image_url: string | null;
  created_at: string;
  expires_at: string;
};

type BusinessInfo = {
  id: string;
  business_name: string;
  category: string;
  location: string;
  user_id: string;
};

type BroadcastConnection = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
};

const CATEGORIES = [
  "All",
  "Retail",
  "Wholesale",
  "Pharmacy",
  "Food",
  "Fashion",
  "Manufacturing",
  "IT/Technology",
  "Automobile",
  "Construction",
  "Services",
  "Other",
];

export default function BusinessBroadcast() {
  const { business } = useBusiness();

  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [businesses, setBusinesses] = useState<Record<string, BusinessInfo>>({});
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentBusinessId, setCurrentBusinessId] = useState("");
  const [plan, setPlan] = useState("");

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Other");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [todayPublished, setTodayPublished] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [pendingBroadcastMessage, setPendingBroadcastMessage] = useState("");
  const [connections, setConnections] = useState<BroadcastConnection[]>([]);
  const [sendingConnection, setSendingConnection] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (business.category) {
      setCategory(business.category);
    }
  }, [business.category]);

  async function loadData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const { data: disclaimerData, error: disclaimerError } = await supabase
      .from("broadcast_disclaimer_acceptances")
      .select("user_id, disclaimer_version")
      .eq("user_id", user.id)
      .maybeSingle();

    if (disclaimerError) {
      console.error("Broadcast disclaimer load error:", disclaimerError.message);
    }

    setDisclaimerAccepted(!!disclaimerData);

    const { data: connectionData, error: connectionError } = await supabase
      .from("business_connections")
      .select("id, requester_id, receiver_id, status")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (connectionError) {
      console.error(
        "Broadcast connection load error:",
        connectionError.message
      );
    } else {
      setConnections(connectionData || []);
    }

    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("plan, status, trial_ends_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setPlan(subscriptionData?.plan || "");

    const { data: profileData, error: profileError } = await supabase
      .from("business_profiles")
      .select("id, business_name, category, location, user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Broadcast profile error:", profileError.message);
    }

    if (profileData) {
      setCurrentBusinessId(profileData.id);
    }

    const { data: broadcastData, error: broadcastError } = await supabase
      .from("business_broadcasts")
      .select(
        "id, business_id, user_id, category, message, image_url, created_at, expires_at"
      )
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(30);

    if (broadcastError) {
      console.error("Broadcast load error:", broadcastError.message);
    } else {
      const activeBroadcasts = broadcastData || [];
      setBroadcasts(activeBroadcasts);

      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

      setTodayPublished(
        activeBroadcasts.some((item) => {
          if (item.user_id !== user.id) return false;

          const itemDate = new Date(item.created_at).toLocaleDateString(
            "en-CA",
            {
              timeZone: "Asia/Kolkata",
            }
          );

          return itemDate === today;
        })
      );

      const businessIds = Array.from(
        new Set(activeBroadcasts.map((item) => item.business_id))
      );

      if (businessIds.length > 0) {
        const { data: businessData } = await supabase
          .from("business_profiles")
          .select("id, business_name, category, location, user_id")
          .in("id", businessIds);

        const map: Record<string, BusinessInfo> = {};

        (businessData || []).forEach((item) => {
          map[item.id] = item;
        });

        setBusinesses(map);
      }
    }

    setLoading(false);
  }

  const canPublish = ["START", "GROW", "PRO"].includes(plan);
  const canConnect = ["START", "GROW", "PRO"].includes(plan);

  async function reportBroadcast(broadcastId: string) {
    if (!currentUserId) return;

    const reason = window.prompt(
      "Why are you reporting this broadcast?\n\n1. Spam or misleading\n2. Inappropriate content\n3. Fraud or scam\n4. Other\n\nEnter 1, 2, 3 or 4:"
    );

    if (!reason) return;

    const reasons: Record<string, string> = {
      "1": "Spam or misleading",
      "2": "Inappropriate content",
      "3": "Fraud or scam",
      "4": "Other",
    };

    const selectedReason = reasons[reason.trim()];

    if (!selectedReason) {
      alert("Please select a valid report reason.");
      return;
    }

    const { error } = await supabase
      .from("broadcast_reports")
      .insert({
        broadcast_id: broadcastId,
        reporter_user_id: currentUserId,
        reason: selectedReason,
      });

    if (error) {
      console.error("Broadcast report error:", error);
      alert("Unable to submit report. Please try again.");
      return;
    }

    alert(
      "Report submitted successfully. Our Community Safety team will review it."
    );
  }
  function getBroadcastConnection(otherUserId: string) {
    return connections.find(
      (connection) =>
        (connection.requester_id === currentUserId &&
          connection.receiver_id === otherUserId) ||
        (connection.receiver_id === currentUserId &&
          connection.requester_id === otherUserId)
    );
  }

  async function sendBroadcastConnection(otherUserId: string) {
    if (!currentUserId || currentUserId === otherUserId) return;

    const existing = getBroadcastConnection(otherUserId);

    if (existing) return;

    setSendingConnection(otherUserId);

    const { data, error } = await supabase
      .from("business_connections")
      .insert({
        requester_id: currentUserId,
        receiver_id: otherUserId,
        status: "pending",
      })
      .select("id, requester_id, receiver_id, status")
      .single();

    if (error) {
      if (error.code === "23505") {
        alert("A connection request already exists.");
      } else {
        alert(error.message);
      }
    } else if (data) {
      setConnections((current) => [...current, data]);
      alert("Connect request sent!");
    }

    setSendingConnection(null);
  }

  function checkBroadcastMessage(text: string) {
    const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();

    const blockedPatterns = [
      /\b(fuck|fucking|motherfucker|bitch|asshole)\b/i,
      /\b(kill|murder|suicide|bomb)\b/i,
      /\b(terrorist|terrorism)\b/i,
      /\b(guaranteed\s+double\s+your\s+money)\b/i,
      /\b(send\s+money\s+first)\b/i,
      /\b(pay\s+first\s+then\s+delivery)\b/i,
      /\b(fake\s+documents?)\b/i,
      /\b(illegal\s+drugs?)\b/i,
      /\b(stolen\s+goods?)\b/i,
    ];

    return !blockedPatterns.some((pattern) => pattern.test(normalized));
  }
  async function publishBroadcast() {
    if (!currentUserId || !currentBusinessId) {
      alert("Please complete your business profile first.");
      return;
    }

    if (!canPublish) {
      alert("Business Broadcast is available on paid plans.");
      return;
    }

    if (todayPublished) {
      alert("You have already published today's broadcast.");
      return;
    }

    const cleanMessage = message.trim();

    if (!cleanMessage) {
      alert("Please enter your broadcast message.");
      return;
    }

    if (cleanMessage.length > 500) {
      alert("Broadcast message must be 500 characters or less.");
      return;
    }

    if (!checkBroadcastMessage(cleanMessage)) {
      alert("This message cannot be published because it contains content that may violate community safety guidelines.");
      return;
    }

    setPublishing(true);

    try {
      const safetyResponse = await fetch("/api/ai/broadcast-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: business.businessName,
          category: category || business.category || "Other",
          location: business.location,
          message: cleanMessage,
        }),
      });

      const safetyResult = await safetyResponse.json();

      if (!safetyResponse.ok || safetyResult.safe !== true) {
        alert(
          safetyResult.reason ||
            "This broadcast could not be approved for publication."
        );
        setPublishing(false);
        return;
      }

      if (!disclaimerAccepted) {
        setPendingBroadcastMessage(cleanMessage);
        setShowDisclaimer(true);
        setPublishing(false);
        return;
      }
    } catch (error) {
      console.error("Broadcast AI safety check error:", error);
      alert("Unable to check broadcast safety. Please try again.");
      setPublishing(false);
      return;
    }

    const { error } = await supabase
      .from("business_broadcasts")
      .insert({
        business_id: currentBusinessId,
        user_id: currentUserId,
        category: category || business.category || "Other",
        message: cleanMessage,
        image_url: null,
      });

    if (error) {
      if (
        error.code === "23505" ||
        error.message
          .toLowerCase()
          .includes("business_broadcasts_one_per_day")
      ) {
        alert("You have already published today's broadcast.");
        setTodayPublished(true);
      } else {
        alert(error.message);
      }
    } else {
      alert("Broadcast published successfully!");
      setMessage("");
      setTodayPublished(true);
      await loadData();
    }

    setPublishing(false);
  }


  async function acceptDisclaimerAndPublish() {
    if (!disclaimerChecked) {
      alert("Please read and accept the Business Dealing Disclaimer before publishing.");
      return;
    }

    if (!currentUserId || !currentBusinessId || !pendingBroadcastMessage) {
      alert("Unable to publish this broadcast. Please try again.");
      return;
    }

    setPublishing(true);

    const { error: disclaimerError } = await supabase
      .from("broadcast_disclaimer_acceptances")
      .insert({
        user_id: currentUserId,
        disclaimer_version: "v1",
      });

    if (disclaimerError && disclaimerError.code !== "23505") {
      alert(disclaimerError.message);
      setPublishing(false);
      return;
    }

    setDisclaimerAccepted(true);

    const { error } = await supabase
      .from("business_broadcasts")
      .insert({
        business_id: currentBusinessId,
        user_id: currentUserId,
        category: category || business.category || "Other",
        message: pendingBroadcastMessage,
        image_url: null,
      });

    if (error) {
      if (
        error.code === "23505" ||
        error.message.toLowerCase().includes("business_broadcasts_one_per_day")
      ) {
        alert("You have already published today\\'s broadcast.");
        setTodayPublished(true);
      } else {
        alert(error.message);
      }
    } else {
      alert("Broadcast published successfully!");
      setMessage("");
      setPendingBroadcastMessage("");
      setDisclaimerChecked(false);
      setShowDisclaimer(false);
      setTodayPublished(true);
      await loadData();
    }

    setPublishing(false);
  }

  const filteredBroadcasts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return broadcasts.filter((item) => {
      const info = businesses[item.business_id];

      if (
        selectedCategory !== "All" &&
        item.category !== selectedCategory
      ) {
        return false;
      }

      if (!query) return true;

      const searchableText = [
        item.message,
        item.category,
        info?.business_name || "",
        info?.location || "",
        info?.category || "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [broadcasts, businesses, search, selectedCategory]);

  if (loading) {
    return (
      <div className="mt-6 bg-white border border-orange-100 rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Loading business broadcasts...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white border border-orange-100 rounded-2xl p-6 shadow-sm">
      <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
        Business Broadcast
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-2">
        Share Today&apos;s Business Offer
      </h2>

      <p className="text-gray-600 mt-2">
        Discover offers, products and services from businesses across the
        CLS GROW community.
      </p>

      {canPublish ? (
        <div className="mt-5 border rounded-xl p-4 bg-orange-50">
          <h3 className="font-bold text-gray-900">
            Find Business Offers
          </h3>

          {!todayPublished ? (
            <>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                >
                  {CATEGORIES.filter((item) => item !== "All").map(
                    (item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Offer / Message
                </label>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Example: Today's special wholesale offer. Contact us for details."
                  className="w-full border rounded-lg px-3 py-3 resize-none"
                />

                <p className="text-xs text-gray-500 mt-1 text-right">
                  {message.length}/500
                </p>
              </div>

              <button
                type="button"
                disabled={publishing}
                onClick={publishBroadcast}
                className="mt-4 px-5 py-2.5 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50"
              >
                {publishing
                  ? "Publishing..."
                  : "Publish Today's Broadcast"}
              </button>


              {showDisclaimer && (
                <div className="mt-4 border border-orange-200 rounded-xl p-4 bg-orange-50">
                  <h3 className="font-bold text-gray-900">
                    Business Dealing Disclaimer
                  </h3>

                  <p className="text-sm text-gray-700 mt-2 leading-6">
                    I understand and agree that CLS Grow is only providing a platform to publish and discover business broadcasts. CLS Grow is not a party to, does not arrange, verify, guarantee, or take responsibility for any business dealing, transaction, payment, product, service, delivery, quality, loss, dispute, or decision between businesses.
                  </p>

                  <p className="text-sm text-gray-700 mt-2 leading-6">
                    Any business dealing or decision made through information shared on CLS Grow is solely between the businesses involved and is their own responsibility.
                  </p>

                  <label className="flex items-start gap-2 mt-4 text-sm text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={disclaimerChecked}
                      onChange={(e) => setDisclaimerChecked(e.target.checked)}
                      className="mt-1"
                    />
                    <span>I have read and agree to the above disclaimer.</span>
                  </label>

                  <button
                    type="button"
                    disabled={publishing || !disclaimerChecked}
                    onClick={acceptDisclaimerAndPublish}
                    className="mt-4 px-5 py-2.5 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50"
                  >
                    {publishing ? "Publishing..." : "Accept & Publish"}
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                One broadcast per day. Your broadcast remains visible for
                24 hours.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600 mt-3">
              You have already published today&apos;s broadcast. You can
              publish again tomorrow.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-5 border rounded-xl p-4 bg-gray-50">
          <p className="font-semibold text-gray-900">
            View Community Broadcasts
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Paid business members can publish one promotional broadcast
            each day.
          </p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-bold text-gray-900">
          Find Business Offers
        </h3>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search business, product, service or location..."
          className="w-full mt-3 border rounded-lg px-3 py-2.5"
        />

        <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSelectedCategory(item)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold ${
                selectedCategory === item
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {filteredBroadcasts.length === 0 ? (
          <div className="border rounded-xl p-5 text-center">
            <p className="text-sm text-gray-500">
              No active broadcasts found.
            </p>
          </div>
        ) : (
          filteredBroadcasts.map((item) => {
            const info = businesses[item.business_id];

            return (
              <div
                key={item.id}
                className="border rounded-xl p-4 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">
                      {info?.business_name || "Business"}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {item.category}
                      {info?.location ? ` - ${info.location}` : ""}
                    </p>
                  </div>

                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    24h
                  </span>
                </div>

                <p className="text-gray-700 mt-3 whitespace-pre-wrap">
                  {item.message}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200"
                    onClick={() => {
                      alert(
                        `Business: ${
                          info?.business_name || "Business"
                        }\nLocation: ${
                          info?.location || "Not available"
                        }\nCategory: ${
                          info?.category || item.category
                        }`
                      );
                    }}
                  >
                    View Business
                  </button>
                  {info && (
                    info.user_id === currentUserId ? (
                      <button
                        type="button"
                        disabled
                        className="px-3 py-2 rounded-lg bg-gray-200 text-gray-600 text-sm font-semibold"
                      >
                        Your Business
                      </button>
                    ) : canConnect ? (
                      (() => {
                        const connection = getBroadcastConnection(info.user_id);

                        if (connection?.status === "accepted") {
                          return (
                            <button
                              type="button"
                              disabled
                              className="px-3 py-2 rounded-lg bg-gray-200 text-gray-600 text-sm font-semibold"
                            >
                              Connected
                            </button>
                          );
                        }

                        if (
                          connection?.status === "pending" &&
                          connection.requester_id === currentUserId
                        ) {
                          return (
                            <button
                              type="button"
                              disabled
                              className="px-3 py-2 rounded-lg bg-gray-200 text-gray-600 text-sm font-semibold"
                            >
                              Request Sent
                            </button>
                          );
                        }

                        if (
                          connection?.status === "pending" &&
                          connection.receiver_id === currentUserId
                        ) {
                          return (
                            <button
                              type="button"
                              disabled
                              className="px-3 py-2 rounded-lg bg-gray-200 text-gray-600 text-sm font-semibold"
                            >
                              Request Received
                            </button>
                          );
                        }

                        return (
                          <button
                            type="button"
                            disabled={sendingConnection === info.user_id}
                            className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-50"
                            onClick={() => sendBroadcastConnection(info.user_id)}
                          >
                            {sendingConnection === info.user_id
                              ? "Sending..."
                              : "Connect"}
                          </button>
                        );
                      })()
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-3 py-2 rounded-lg bg-gray-100 text-gray-500 text-sm font-semibold"
                        >
                        Connect - LOCAL plan required
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100"
                    onClick={() => reportBroadcast(item.id)}
                  >
                    Report
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}






