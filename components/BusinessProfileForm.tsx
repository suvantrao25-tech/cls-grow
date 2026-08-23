"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "./BusinessContext";
import { supabase } from "@/lib/supabase";

export default function BusinessProfileForm() {
  const { business, setBusiness } = useBusiness();

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [language, setLanguage] = useState("en");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBusinessName(business.businessName || "");
    setCategory(business.category || "");
    setLocation(business.location || "");
    setPhone(business.phone || "");
    setWebsite(business.website || "");
    setLanguage(business.language || "en");
  }, [business]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User Error:", userError);
      alert("Please login again.");
      setLoading(false);
      return;
    }

    const businessData = {
      businessName,
      category,
      location,
      phone,
      website,
      language,
    };

    const { data: existingProfile, error: existingError } =
      await supabase
        .from("business_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (existingError) {
      console.error("Profile Check Error:", existingError);
      alert(`Profile check failed: ${existingError.message}`);
      setLoading(false);
      return;
    }

    let saveError = null;

    if (existingProfile) {
      const result = await supabase
        .from("business_profiles")
        .update({
          business_name: businessName,
          category,
          location,
          phone,
          website,
          language,
        })
        .eq("id", existingProfile.id)
        .eq("user_id", user.id);

      saveError = result.error;
    } else {
      const result = await supabase
        .from("business_profiles")
        .insert([
          {
            user_id: user.id,
            business_name: businessName,
            category,
            location,
            phone,
            website,
            language,
          },
        ]);

      saveError = result.error;
    }

    if (saveError) {
      console.error("Supabase Error Message:", saveError.message);
      console.error("Supabase Error Code:", saveError.code);
      console.error("Supabase Error Details:", saveError.details);
      console.error("Supabase Error Hint:", saveError.hint);

      alert(`Profile save failed: ${saveError.message}`);
      setLoading(false);
      return;
    }

    setBusiness(businessData);

    alert("Business Profile Saved!");

    setLoading(false);
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
          required
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Category (Medical, Shop, Salon...)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Website (optional)"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>

      </form>
    </div>
  );
}





