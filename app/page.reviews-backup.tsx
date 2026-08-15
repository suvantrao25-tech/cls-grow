"use client";

import DashboardLayout from "@/components/DashboardLayout";
import BusinessProfileCard from "@/components/BusinessProfileCard";
import GrowthScoreCard from "@/components/GrowthScoreCard";
import BusinessProfileForm from "@/components/BusinessProfileForm";
import AISuggestionsCard from "@/components/AISuggestionsCard";
import GrowthTasksCard from "@/components/GrowthTasksCard";
import GrowthAuditReport from "@/components/GrowthAuditReport";
import { useBusiness } from "@/components/BusinessContext";

export default function Home() {
  const { audit, completedTasks } = useBusiness();

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-800">
        Business Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Track your business growth with AI.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">
            Business Score
          </h2>

          <p className="text-4xl font-bold text-blue-600 mt-4">
            {audit.score}/100
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">
            Growth Tasks
          </h2>

          <p className="text-4xl font-bold text-green-600 mt-4">
            {Math.min(completedTasks, audit.tasks.length)}/{audit.tasks.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">
            AI Suggestions
          </h2>

          <p className="text-4xl font-bold text-purple-600 mt-4">
            {audit.suggestions.length}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <GrowthScoreCard />
      </div>

      <div className="mt-8">
        <BusinessProfileCard />
      </div>

      <div className="mt-8">
        <GrowthAuditReport />
      </div>

      <div className="mt-8">
        <AISuggestionsCard />
      </div>

      <div className="mt-8">
        <GrowthTasksCard />
      </div>

      <div className="mt-8">
        <BusinessProfileForm />
      </div>
    </DashboardLayout>
  );
}
