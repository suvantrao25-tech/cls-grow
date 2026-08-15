"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "./BusinessContext";

export default function GrowthTasksCard() {
  const {
    audit,
    completedTasks,
    setCompletedTasks,
  } = useBusiness();

  const tasks = audit.tasks;

  const [completed, setCompleted] = useState<boolean[]>(
    () => tasks.map(() => false)
  );

  useEffect(() => {
    setCompleted((current) =>
      tasks.map((_: string, index: number) => current[index] ?? false)
    );
  }, [tasks.length]);

  function toggleTask(index: number) {
    const updated = [...completed];

    updated[index] = !updated[index];

    setCompleted(updated);

    const count = updated.filter(Boolean).length;

    setCompletedTasks(count);
  }

  const completedCount = completed.filter(Boolean).length;

  const progress =
    tasks.length > 0
      ? Math.round(
          (completedCount / tasks.length) * 100
        )
      : 0;

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-800">
        Growth Tasks
      </h2>

      <div className="mt-5 space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task: string, index: number) => (
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
          ))
        ) : (
          <div className="bg-gray-100 p-3 rounded-lg text-gray-700">
            Complete your business profile to generate growth tasks.
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm text-gray-600">
          Progress: {completedCount}/{tasks.length} Completed
        </p>

        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className="bg-green-600 h-3 rounded-full"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
