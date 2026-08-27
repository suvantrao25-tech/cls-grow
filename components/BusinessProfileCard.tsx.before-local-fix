"use client";

import { useBusiness } from "./BusinessContext";

export default function BusinessProfileCard() {
  const { business } = useBusiness();

  const completion = [
    business.businessName,
    business.category,
    business.location,
    business.phone,
    business.website,
  ].filter(Boolean).length;

  const percentage = completion * 20;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800">
        Business Profile
      </h2>

      <div className="mt-5 space-y-3 text-gray-600">

        <p>
          <span className="font-semibold">
            Business Name:
          </span>{" "}
          {business.businessName || "Not Added"}
        </p>

        <p>
          <span className="font-semibold">
            Category:
          </span>{" "}
          {business.category || "Not Selected"}
        </p>

        <p>
          <span className="font-semibold">
            Location:
          </span>{" "}
          {business.location || "Not Added"}
        </p>

        <p>
          <span className="font-semibold">
            Phone:
          </span>{" "}
          {business.phone || "Not Added"}
        </p>

        <p>
          <span className="font-semibold">
            Website:
          </span>{" "}
          {business.website || "Not Added"}
        </p>

      </div>

      <div className="mt-6">
        <p className="font-semibold mb-2">
          Profile Completion
        </p>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {percentage}% Complete
        </p>
      </div>

    </div>
  );
}