"use client";

import { useState } from "react";
import { useBusiness } from "./BusinessContext";
import { supabase } from "@/lib/supabase";

export default function BusinessProfileForm() {
  const { setBusiness } = useBusiness();

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const businessData = {
      businessName,
      category,
      location,
      phone,
      website,
    };

    // Save in UI
    setBusiness(businessData);

    // Save in Supabase
    const { error } = await supabase
      .from("business_profiles")
      .insert([
        {
          business_name: businessName,
          category,
          location,
          phone,
          website,
        },
      ]);

    if (error) {
      console.error("Supabase Error Message:", error.message); console.error("Supabase Error Code:", error.code); console.error("Supabase Error Details:", error.details); console.error("Supabase Error Hint:", error.hint);
      alert(`Profile save failed: ${error.message}`);
      return;
    }

    alert("Business Profile Saved!");
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-800">
        Setup Business Profile
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Category (Medical, Shop, Salon...)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Website (optional)"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Save Profile
        </button>

      </form>
    </div>
  );
}
