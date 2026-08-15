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

type BusinessData = {
  businessName: string;
  category: string;
  location: string;
  phone: string;
  website: string;
};

const defaultData: BusinessData = {
  businessName: "",
  category: "",
  location: "",
  phone: "",
  website: "",
};

const emptyAudit: BusinessAudit = runGrowthAudit(defaultData);

const BusinessContext = createContext<any>(null);

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

  // Load business data
  useEffect(() => {
    const savedBusiness =
      localStorage.getItem("cls_grow_business");

    if (savedBusiness) {
      try {
        setBusiness(JSON.parse(savedBusiness));
      } catch (error) {
        console.error(
          "Business data load error:",
          error
        );
      }
    }

    const savedTasks =
      localStorage.getItem("cls_grow_tasks");

    if (savedTasks) {
      setCompletedTasks(Number(savedTasks));
    }
  }, []);

  // Run audit whenever business data changes
  useEffect(() => {
    const result = runGrowthAudit(business);
    setAudit(result);
  }, [business]);

  // Save business data
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
  return useContext(BusinessContext);
}
