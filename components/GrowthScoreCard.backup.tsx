"use client";

import { useBusiness } from "./BusinessContext";

export default function GrowthScoreCard() {
  const { business } = useBusiness();

  let score = 0;

  // Business Name — 15 points
  if (business.businessName?.trim()) {
    score += 15;
  }

  // Category — 15 points
  if (business.category?.trim()) {
    score += 15;
  }

  // Location — 15 points
  if (business.location?.trim()) {
    score += 15;
  }

  // Phone — 15 points
  if (business.phone?.trim()) {
    score += 15;
  }

  // Website — 20 points
  if (business.website?.trim()) {
    score += 20;
  }

  // Profile completeness bonus — 20 points
  const profileFields = [
    business.businessName,
    business.category,
    business.location,
    business.phone,
    business.website,
  ];

  const completedFields = profileFields.filter(
    (field) => field?.trim()
  ).length;

  if (completedFields === 5) {
    score += 20;
  }

  let status = "Needs Improvement";
  let nextAction = "Complete your business profile.";

  if (score >= 80) {
    status = "Excellent";
    nextAction = "Start improving your customer acquisition.";
  } else if (score >= 60) {
    status = "Good";
    nextAction = "Improve your online presence and visibility.";
  } else if (score >= 40) {
    status = "Fair";
    nextAction = "Complete the missing business information.";
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
          {nextAction}
        </p>
      </div>
    </div>
  );
}