"use client";

import { useBusiness } from "./BusinessContext";
import { useState } from "react";

export default function GoogleBusinessProfileCard() {
  const { business } = useBusiness();
  const [post, setPost] = useState("");

  const checks = [
    {
      label: "Business name",
      ready: Boolean(business.businessName?.trim()),
      advice: "Add the exact name customers use to find your business.",
    },
    {
      label: "Business category",
      ready: Boolean(business.category?.trim()),
      advice: "Choose the most relevant category for your main service.",
    },
    {
      label: "Business location",
      ready: Boolean(business.location?.trim()),
      advice: "Add your correct business location or service area.",
    },
    {
      label: "Phone number",
      ready: Boolean(business.phone?.trim()),
      advice: "Add a number customers can use for enquiries.",
    },
    {
      label: "Website",
      ready: Boolean(business.website?.trim()),
      advice: "Add your website so customers can learn more about your business.",
    },
  ];

  const improvements = checks
    .filter((check) => !check.ready)
    .map((check) => check.advice);

  const completed = checks.filter((check) => check.ready).length;
  const total = checks.length;
  const percentage = Math.round((completed / total) * 100);

  const businessName = business.businessName?.trim() || "our business";
  const category = business.category?.trim() || "local business";
  const location = business.location?.trim();

  function createGooglePost() {
    const locationText = location
      ? ` Serving customers in ${location}.`
      : "";

    setPost(
      `Looking for a trusted ${category}? ${businessName} is here to help.${locationText} Contact us today to learn more about our services. We look forward to serving you!`
    );
  }

  const searchText = [business.businessName, business.location]
    .filter(Boolean)
    .join(", ");

  const googleSearchUrl = searchText
    ? `https://www.google.com/search?q=${encodeURIComponent(searchText)}`
    : "https://www.google.com/business/";

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
      <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
        Local Visibility
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-2">
        Google Business Profile
      </h2>

      <p className="text-gray-600 mt-2">
        Check your business information, improve your profile, and
        create a simple weekly Google post.
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700">
            Profile Readiness
          </span>

          <span className="text-sm text-gray-500">
            {completed}/{total}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {percentage}% of your business information is ready.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-gray-900">
          What to Improve
        </h3>

        {improvements.length > 0 ? (
          <div className="mt-3 space-y-2">
            {improvements.map((improvement, index) => (
              <div
                key={index}
                className="flex gap-3 bg-orange-50 border border-orange-100 rounded-lg p-3"
              >
                <span className="text-orange-600 font-bold">
                  !
                </span>

                <p className="text-sm text-gray-700">
                  {improvement}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-700">
              Your basic business information is complete.
            </p>

            <p className="text-sm text-gray-600 mt-1">
              Next, focus on photos, genuine customer reviews,
              business hours, and regular Google updates.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-gray-900">
          Profile Checklist
        </h3>

        <div className="mt-3 space-y-2">
          {checks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between border rounded-lg px-4 py-3"
            >
              <span className="text-gray-700">
                {check.label}
              </span>

              <span
                className={
                  check.ready
                    ? "text-green-600 text-sm font-semibold"
                    : "text-orange-600 text-sm font-semibold"
                }
              >
                {check.ready ? "Ready" : "Needs attention"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7 border-t pt-6">
        <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
          Weekly Google Post
        </p>

        <h3 className="text-lg font-bold text-gray-900 mt-2">
          Create a Google Post
        </h3>

        <p className="text-sm text-gray-600 mt-2">
          Generate a simple post for your business and review it
          before publishing.
        </p>

        <button
          type="button"
          onClick={createGooglePost}
          className="mt-4 inline-flex items-center justify-center px-5 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
        >
          Create Google Post
        </button>

        {post && (
          <div className="mt-5">
            <label className="text-sm font-semibold text-gray-700">
              Your Post
            </label>

            <textarea
              value={post}
              onChange={(event) => setPost(event.target.value)}
              rows={6}
              className="mt-2 w-full rounded-lg border border-gray-300 p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <p className="text-xs text-gray-500 mt-2">
              Review and edit this post before publishing it on Google.
            </p>

            <a
              href={googleSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Open Google
            </a>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-5">
        CLS GROW creates suggestions and drafts. You remain in control
        and approve content before publishing.
      </p>
    </div>
  );
}
