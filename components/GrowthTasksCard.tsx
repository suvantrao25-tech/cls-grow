"use client";

import { useState } from "react";
import { useBusiness } from "./BusinessContext";

export default function GrowthTasksCard() {
  const { business, setCompletedTasks } = useBusiness();
  let initialTasks = [
    "Complete your business profile",
    "Add Google Business Profile",
    "Collect customer reviews",
  ];

  if (business.category) {
    if (business.category.toLowerCase().includes("medical")) {
      initialTasks = [
        "Create Google Business Profile",
        "Add medical store photos",
        "Collect 5 customer reviews",
        "Start WhatsApp medicine ordering",
      ];
    }

    if (business.category.toLowerCase().includes("salon")) {
      initialTasks = [
        "Upload salon photos",
        "Collect customer reviews",
        "Create festival offers",
      ];
    }
  }

  const [completed, setCompleted] = useState<boolean[]>(
  () => initialTasks.map(() => false)
);

  function toggleTask(index: number) {
  const updated = [...completed];

  updated[index] = !updated[index];

  setCompleted(updated);

  const count = updated.filter(Boolean).length;

  setCompletedTasks(count);
}

  const completedCount = completed.filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-800">
        Growth Tasks
      </h2>

      <div className="mt-5 space-y-3">
        {initialTasks.map((task, index) => (
          <label
            key={index}
            className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg cursor-pointer"
          >
            <input
              type="checkbox"
              checked={completed[index] ?? false}
              onChange={() => toggleTask(index)}
              className="w-5 h-5"
            />

            <span
              className={
                completed[index]
                  ? "line-through text-gray-400"
                  : "text-gray-700"
              }
            >
              {task}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5">
        <p className="text-sm text-gray-600">
          Progress: {completedCount}/{initialTasks.length} Completed
        </p>

        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className="bg-green-600 h-3 rounded-full"
            style={{
              width: `${
                (completedCount / initialTasks.length) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}