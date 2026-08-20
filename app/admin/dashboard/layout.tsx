import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  // Read the authenticated user from the Supabase SSR session.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Cookie updates may be ignored in a Server Component.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No authenticated user.
  if (!user) {
    redirect("/admin/login");
  }

  // Use the service-role client only on the server
  // to verify admin authorization.
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: adminProfile, error: adminError } = await adminClient
    .from("admin_profiles")
    .select("admin_type, status")
    .eq("user_id", user.id)
    .maybeSingle();

  // User is not an active super admin.
  if (
    adminError ||
    !adminProfile ||
    adminProfile.admin_type !== "super_admin" ||
    adminProfile.status !== "active"
  ) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}