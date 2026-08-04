"use client";

import { useBusiness } from "./BusinessContext";

export default function GrowthScoreCard() {
  const { business } = useBusiness();

  let score = 0;

  // Profile Complete Score (10 points)
  const profileFields = [
    business.businessName,
    business.category,
    business.location,
    business.phone,
    business.website,
  ];

  const completedFields = profileFields.filter(Boolean).length;

  if (completedFields === 5) {
    score += 10;
  }

  // Website Score (10 points)
  if (business.website) {
    score += 10;
  }

  let status = "Needs Improvement";

  if (score >= 75) {
    status = "Excellent";
  } else if (score >= 40) {
    status = "Good";
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800">
        Growth Score
      </h2>

      <div className="mt-5 flex items-center justify-center">
        <div className="w-32 h-32 rounded-full border-8 border-blue-600 flex items-center justify-center">
          <span className="text-3xl font-bold text-blue-600">
            {score}
          </span>
        </div>
      </div>

      <p className="text-center mt-4 text-gray-600">
        Out of 100
      </p>

      <div className="mt-6 bg-gray-100 rounded-lg p-4">
        <p className="font-semibold">
          Status
        </p>

        <p className="text-gray-600 mt-1">
          {status}
        </p>
      </div>

      <div className="mt-4">
        <p className="font-semibold">
          Next Action
        </p>

        <p className="text-gray-600 mt-1">
          Add Google Business & collect reviews
        </p>
      </div>
    </div>
  );
}