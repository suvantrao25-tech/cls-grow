"use client";

type Props = {
  suggestions: string[];
};

export default function AIBusinessAction({ suggestions }: Props) {
  return (
    <div className="mt-6 bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
      <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
        AI Business Action
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-2">
        Your Action Today
      </h2>

      <p className="text-gray-600 mt-2">
        {suggestions[0] ||
          "Complete your business profile so CLS GROW can suggest your next business action."}
      </p>

      <div className="mt-4 bg-purple-50 rounded-xl p-4">
        <p className="text-sm font-semibold text-purple-700">
          Why this matters
        </p>

        <p className="text-sm text-gray-600 mt-1">
          Taking one focused action today can improve your local visibility
          and help you attract more customers.
        </p>
      </div>
    </div>
  );
}
