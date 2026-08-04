"use client";

import { useBusiness } from "./BusinessContext";

export default function AISuggestionsCard() {
  const { business } = useBusiness();

  let suggestions = [
    "Complete your business profile",
    "Add Google Business Profile",
    "Collect customer reviews",
  ];

  if (business.category) {
    if (business.category.toLowerCase().includes("medical")) {
      suggestions = [
        "Create Google Business Profile for your medical store",
        "Collect customer reviews from regular patients",
        "Start WhatsApp ordering for medicines",
        "Create monthly health offers",
      ];
    }

    if (business.category.toLowerCase().includes("salon")) {
      suggestions = [
        "Upload salon photos on Google Business",
        "Collect customer reviews",
        "Create festival offers",
      ];
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-800">
        AI Growth Suggestions
      </h2>

      <div className="mt-5 space-y-3">
        {suggestions.map((item: string, index: number) => (
          <div
            key={index}
            className="bg-gray-100 p-3 rounded-lg text-gray-700"
          >
            💡 {item}
          </div>
        ))}
      </div>
    </div>
  );
}