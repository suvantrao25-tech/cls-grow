"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Review = {
  id: string;
  customer_name: string | null;
  rating: number;
  review_text: string | null;
  created_at: string | null;
};

export default function ReviewsCard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadReviews() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("id, customer_name, rating, review_text, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews load error:", error.message);
      setLoading(false);
      return;
    }

    setReviews(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!customerName.trim()) {
      alert("Please enter customer name.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login again.");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          user_id: user.id,
          customer_name: customerName.trim(),
          rating,
          review_text: reviewText.trim(),
        },
      ])
      .select("id, customer_name, rating, review_text, created_at")
      .single();

    if (error) {
      console.error("Review save error:", error.message);
      alert(`Review save failed: ${error.message}`);
      setSaving(false);
      return;
    }

    setReviews((current) => [data, ...current]);

    setCustomerName("");
    setRating(5);
    setReviewText("");

    alert("Review added successfully!");

    setSaving(false);
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          Customer Reviews
        </h2>

        <div className="text-right">
          <p className="text-lg font-bold text-blue-600">
            * {averageRating}
          </p>

          <p className="text-xs text-gray-500">
            {reviews.length} reviews
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          className="w-full border rounded-lg p-3"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <select
          className="w-full border rounded-lg p-3"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          <option value={5}>5 Stars</option>
          <option value={4}>4 Stars</option>
          <option value={3}>3 Stars</option>
          <option value={2}>2 Stars</option>
          <option value={1}>1 Star</option>
        </select>

        <textarea
          className="w-full border rounded-lg p-3 min-h-24"
          placeholder="Customer review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg"
        >
          {saving ? "Saving..." : "Add Review"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-gray-500">
            Loading reviews...
          </p>
        ) : reviews.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-4 text-gray-600">
            No customer reviews added yet.
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border rounded-lg p-4"
            >
              <div className="flex justify-between gap-4">
                <p className="font-semibold text-gray-800">
                  {review.customer_name || "Customer"}
                </p>

                <p className="text-yellow-500">
                  {"*".repeat(review.rating)}
                  {"-".repeat(5 - review.rating)}
                </p>
              </div>

              {review.review_text && (
                <p className="mt-2 text-gray-600">
                  {review.review_text}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
