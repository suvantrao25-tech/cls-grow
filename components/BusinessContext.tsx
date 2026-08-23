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

  // Load logged-in user's business profile from Supabase
  useEffect(() => {
    let mounted = true;

    async function loadBusinessProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("business_profiles")
        .select(
          "business_name, category, location, phone, website, language"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Business profile load error:",
          error.message
        );
        return;
      }

      if (data && mounted) {
        setBusiness({
          businessName: data.business_name || "",
          category: data.category || "",
          location: data.location || "",
          phone: data.phone || "",
          website: data.website || "",
          language: data.language || "en",
        });
      }
    }

    loadBusinessProfile();

    return () => {
      mounted = false;
    };
  }, []);

  // Load completed tasks for current browser
  useEffect(() => {
    const savedTasks =
      localStorage.getItem("cls_grow_tasks");

    if (savedTasks) {
      setCompletedTasks(Number(savedTasks));
    }
  }, []);

  // Run growth audit whenever business changes
  useEffect(() => {
    const result = runGrowthAudit(business);
    setAudit(result);
  }, [business]);

  // Keep local cache for quick UI recovery
  useEffect(() => {
    localStorage.setItem(
      "cls_grow_business",
      JSON.stringify(business)
    );
  }, [business]);

  // Save completed tasks
  useEffect(() => {
    localStorage.setItem(
      "cls_grow_tasks",
      completedTasks.toString()
    );
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



