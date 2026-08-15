"use client";

import { useBusiness } from "./BusinessContext";

export default function AISuggestionsCard() {
  const { audit } = useBusiness();

  const suggestions = audit.suggestions;

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-800">
        AI Growth Suggestions
      </h2>

      <div className="mt-5 space-y-3">
        {suggestions.length > 0 ? (
          suggestions.map((item: string, index: number) => (
            <div
              key={index}
              className="bg-gray-100 p-3 rounded-lg text-gray-700"
            >
              - {item}
            </div>
          ))
        ) : (
          <div className="bg-gray-100 p-3 rounded-lg text-gray-700">
            Complete your business profile to get growth suggestions.
          </div>
        )}
      </div>
    </div>
  );
}
