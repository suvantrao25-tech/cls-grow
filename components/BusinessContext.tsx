"use client";

import { createContext, useContext, useEffect, useState } from "react";

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

const BusinessContext = createContext<any>(null);

export function BusinessProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [business, setBusiness] = useState<BusinessData>(defaultData);

  const [completedTasks, setCompletedTasks] = useState(0);

  // Load business data
  useEffect(() => {
    const savedBusiness = localStorage.getItem("cls_grow_business");

    if (savedBusiness) {
      setBusiness(JSON.parse(savedBusiness));
    }

    const savedTasks = localStorage.getItem("cls_grow_tasks");

    if (savedTasks) {
      setCompletedTasks(Number(savedTasks));
    }
  }, []);


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