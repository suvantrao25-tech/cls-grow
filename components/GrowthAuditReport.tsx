"use client";

import { useBusiness } from "./BusinessContext";

export default function GrowthAuditReport() {
  const { audit } = useBusiness();

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800">
        Business Growth Audit
      </h2>

      <p className="mt-2 text-gray-600">
        Understand where your business is strong and what to improve next.
      </p>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg p-5">
          <h3 className="font-bold text-green-800">
            Strengths
          </h3>

          <div className="mt-3 space-y-2">
            {audit.strengths.length > 0 ? (
              audit.strengths.map(
                (item: string, index: number) => (
                  <p
                    key={index}
                    className="text-green-700"
                  >
                    ? {item}
                  </p>
                )
              )
            ) : (
              <p className="text-gray-600">
                Complete your profile to identify strengths.
              </p>
            )}
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-5">
          <h3 className="font-bold text-red-800">
            Growth Gaps
          </h3>

          <div className="mt-3 space-y-2">
            {audit.weaknesses.length > 0 ? (
              audit.weaknesses.map(
                (item: string, index: number) => (
                  <p
                    key={index}
                    className="text-red-700"
                  >
                    ! {item}
                  </p>
                )
              )
            ) : (
              <p className="text-gray-600">
                No major profile gaps found.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-5">
        <h3 className="font-bold text-blue-800">
          Top Growth Priorities
        </h3>

        <div className="mt-3 space-y-3">
          {audit.tasks.length > 0 ? (
            audit.tasks.slice(0, 3).map(
              (task: string, index: number) => (
                <div
                  key={index}
                  className="flex gap-3"
                >
                  <span className="font-bold text-blue-700">
                    {index + 1}.
                  </span>

                  <span className="text-gray-700">
                    {task}
                  </span>
                </div>
              )
            )
          ) : (
            <p className="text-gray-600">
              Complete your profile to generate priorities.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
