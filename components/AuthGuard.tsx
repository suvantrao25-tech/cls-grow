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

        // Check whether this user is an active admin.
        const { data: adminProfile, error } = await supabase
          .from("admin_profiles")
          .select("admin_type, status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!mounted) return;

        if (
          !error &&
          adminProfile &&
          adminProfile.admin_type === "super_admin" &&
          adminProfile.status === "active"
        ) {
          // Admin accounts must stay inside the admin area.
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
