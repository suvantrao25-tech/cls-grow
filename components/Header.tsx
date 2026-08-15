"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setEmail(user.email);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      setLoggingOut(false);
      alert("Logout failed. Please try again.");
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  const initial = email
    ? email.charAt(0).toUpperCase()
    : "B";

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-2xl font-bold text-blue-600">
        CLS GROW
      </h1>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-700">
            Business Owner
          </p>

          <p className="text-xs text-gray-500">
            {email || "Loading..."}
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
          {initial}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
