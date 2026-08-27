"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "./BusinessContext";
import { supabase } from "@/lib/supabase";

type GrowthTask = {
  id: string;
  task: string;
  completed: boolean;
};

export default function GrowthTasksCard() {
  const { audit } = useBusiness();

  const [tasks, setTasks] = useState<GrowthTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("growth_tasks")
        .select("id, task, completed")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Growth tasks load error:", error.message);
        setLoading(false);
        return;
      }

      setTasks(data || []);
      setLoading(false);
    }

    loadTasks();
  }, []);

  useEffect(() => {
    async function createTasks() {
      if (loading || tasks.length > 0) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const auditTasks = audit.tasks || [];

      if (auditTasks.length === 0) {
        return;
      }

      const newTasks = Array.from(new Set(auditTasks)).slice(0, 5).map((task: string) => ({
        user_id: user.id,
        task,
        completed: false,
      }));

      const { data, error } = await supabase
        .from("growth_tasks")
        .insert(newTasks)
        .select("id, task, completed");

      if (error) {
        console.error("Growth tasks create error:", error.message);
        return;
      }

      setTasks(data || []);
    }

    createTasks();
  }, [audit.tasks, loading, tasks.length]);

  async function toggleTask(task: GrowthTask) {
    setSavingId(task.id);

    const newCompleted = !task.completed;

    const { error } = await supabase
      .from("growth_tasks")
      .update({
        completed: newCompleted,
      })
      .eq("id", task.id);

    if (error) {
      console.error("Growth task update error:", error.message);
      alert(`Task update failed: ${error.message}`);
      setSavingId(null);
      return;
    }

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, completed: newCompleted }
          : item
      )
    );

    setSavingId(null);
  }

  const uniqueTasks = Array.from(
    new Map(tasks.map((item) => [item.task, item])).values()
  );

  const completedCount = uniqueTasks.filter(
    (task) => task.completed
  ).length;

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-800">
        Growth Tasks
      </h2>

      {loading ? (
        <div className="mt-5 text-gray-500">
          Loading growth tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="mt-5 bg-gray-100 p-4 rounded-lg text-gray-600">
          Complete your business profile to generate growth tasks.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {uniqueTasks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleTask(item)}
              disabled={savingId === item.id}
              className={`w-full text-left p-4 rounded-lg border transition ${
                item.completed
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-sm ${
                    item.completed
                      ? "bg-green-600 border-green-600 text-white"
                      : "border-gray-400 text-transparent"
                  }`}
                >
                  ?
                </div>

                <span
                  className={
                    item.completed
                      ? "text-gray-500 line-through"
                      : "text-gray-700"
                  }
                >
                  {item.task}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 text-sm text-gray-500">
        Progress: {completedCount}/{uniqueTasks.length} Completed
      </div>
    </div>
  );
}




