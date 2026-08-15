"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password reset link has been sent to your email.");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow">
            C
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            CLS GROW
          </h1>

          <p className="text-gray-500 mt-2">
            Grow your business smarter.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8">

          <h2 className="text-2xl font-bold text-gray-900">
            Forgot your password?
          </h2>

          <p className="text-gray-500 mt-2">
            Enter your email and we'll send you a secure password reset link.
          </p>

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-5 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleReset} className="mt-6 space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Back to Login
            </Link>
          </div>

        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 CLS GROW. All rights reserved.
        </p>

      </div>
    </main>
  );
}
