import DashboardLayout from "@/components/DashboardLayout";
import BusinessProfileCard from "@/components/BusinessProfileCard";
import GrowthScoreCard from "@/components/GrowthScoreCard";
import BusinessProfileForm from "@/components/BusinessProfileForm";
import AISuggestionsCard from "@/components/AISuggestionsCard";
import GrowthTasksCard from "@/components/GrowthTasksCard";

export default function Home() {
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
            0/100
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">
            Growth Tasks
          </h2>
          <p className="text-4xl font-bold text-green-600 mt-4">
            0
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">
            AI Suggestions
          </h2>
          <p className="text-4xl font-bold text-purple-600 mt-4">
            0
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