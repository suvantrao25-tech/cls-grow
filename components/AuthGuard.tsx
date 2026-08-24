"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          router.replace("/login");
          return;
        }

        if (!user.email_confirmed_at) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        // Verify whether this user is an active admin
        // through the server-side admin verification endpoint.
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          router.replace("/login");
          return;
        }

        const adminResponse = await fetch("/api/admin/verify", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const adminResult = await adminResponse.json();

        if (!mounted) return;

        // Admin accounts are not allowed to use the Business Dashboard.
        if (
          adminResponse.ok &&
          adminResult.authorized === true
        ) {
          router.replace("/admin/dashboard");
          return;
        }

        // Normal authenticated user = Business user.
        setChecking(false);
      } catch (error) {
        console.error("AUTH GUARD ERROR:", error);

        if (mounted) {
          router.replace("/login");
        }
      }
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-6 text-gray-600">
          Checking your account...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
