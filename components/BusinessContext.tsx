"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  runGrowthAudit,
  type BusinessAudit,
} from "@/lib/growthAudit";

import { supabase } from "@/lib/supabase";

type BusinessData = {
  businessName: string;
  category: string;
  location: string;
  phone: string;
  website: string;
  language: string;
};

type BusinessContextType = {
  business: BusinessData;
  setBusiness: React.Dispatch<React.SetStateAction<BusinessData>>;
  audit: BusinessAudit;
  completedTasks: number;
  setCompletedTasks: React.Dispatch<React.SetStateAction<number>>;
};

const defaultData: BusinessData = {
  businessName: "",
  category: "",
  location: "",
  phone: "",
  website: "",
  language: "en",
};

const emptyAudit: BusinessAudit = runGrowthAudit(defaultData);

const BusinessContext = createContext<BusinessContextType | null>(null);

export function BusinessProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [business, setBusiness] =
    useState<BusinessData>(defaultData);

  const [completedTasks, setCompletedTasks] =
    useState(0);

  const [audit, setAudit] =
    useState<BusinessAudit>(emptyAudit);

  // Load only the currently authenticated user's business profile
  async function loadBusinessProfile(userId: string) {
    const { data, error } = await supabase
      .from("business_profiles")
      .select(
        "business_name, category, location, phone, website, language"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error(
        "Business profile load error:",
        error.message
      );
      return;
    }

    if (data) {
      const userBusiness: BusinessData = {
        businessName: data.business_name || "",
        category: data.category || "",
        location: data.location || "",
        phone: data.phone || "",
        website: data.website || "",
        language: data.language || "en",
      };

      setBusiness(userBusiness);

      localStorage.setItem(
        `cls_grow_business_${userId}`,
        JSON.stringify(userBusiness)
      );
    } else {
      // No profile for this user
      setBusiness(defaultData);
    }
  }

  // Keep business state isolated to the authenticated user
  useEffect(() => {
    let mounted = true;

    async function initializeUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (user) {
        await loadBusinessProfile(user.id);
      } else {
        setBusiness(defaultData);
        setCompletedTasks(0);
      }
    }

    initializeUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_OUT") {
          // Immediately remove previous user's data from React state
          setBusiness(defaultData);
          setCompletedTasks(0);
          return;
        }

        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED"
        ) {
          const user = session?.user;

          if (user) {
            // Reset first so previous user's data can never remain visible
            setBusiness(defaultData);
            setCompletedTasks(0);

            await loadBusinessProfile(user.id);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load completed tasks for current authenticated user
  useEffect(() => {
    let mounted = true;

    async function loadUserTasks() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setCompletedTasks(0);
        return;
      }

      const savedTasks = localStorage.getItem(
        `cls_grow_tasks_${user.id}`
      );

      if (savedTasks) {
        setCompletedTasks(Number(savedTasks));
      } else {
        setCompletedTasks(0);
      }
    }

    loadUserTasks();

    return () => {
      mounted = false;
    };
  }, []);

  // Run growth audit whenever business changes
  useEffect(() => {
    const result = runGrowthAudit(business);
    setAudit(result);
  }, [business]);

  // Keep a user-specific local cache
  useEffect(() => {
    let active = true;

    async function saveUserBusinessCache() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active || !user) return;

      localStorage.setItem(
        `cls_grow_business_${user.id}`,
        JSON.stringify(business)
      );
    }

    saveUserBusinessCache();

    return () => {
      active = false;
    };
  }, [business]);

  // Save completed tasks for current user only
  useEffect(() => {
    let active = true;

    async function saveUserTasks() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active || !user) return;

      localStorage.setItem(
        `cls_grow_tasks_${user.id}`,
        completedTasks.toString()
      );
    }

    saveUserTasks();

    return () => {
      active = false;
    };
  }, [completedTasks]);

  return (
    <BusinessContext.Provider
      value={{
        business,
        setBusiness,
        audit,
        completedTasks,
        setCompletedTasks,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);

  if (!context) {
    throw new Error(
      "useBusiness must be used inside BusinessProvider"
    );
  }

  return context;
}
