"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setEmail(data.user.email ?? "");
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = email ? email.charAt(0).toUpperCase() : "B";

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-2xl font-bold text-blue-600">
        CLS GROW
      </h1>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">
            {loading ? "Loading..." : email || "Business Owner"}
          </p>

          <button
            onClick={handleLogout}
            className="text-xs text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
          {initial}
        </div>
      </div>
    </header>
  );
}
