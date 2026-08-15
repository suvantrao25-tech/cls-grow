"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleVerification() {
      await supabase.auth.signOut();

      router.replace("/login?verified=true");
    }

    handleVerification();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
        <div className="text-3xl mb-4">?</div>

        <h1 className="text-xl font-bold text-gray-900">
          Email Verified
        </h1>

        <p className="text-gray-500 mt-2">
          Your email has been verified successfully.
        </p>

        <p className="text-gray-500 mt-1">
          Redirecting you to login...
        </p>
      </div>
    </main>
  );
}
