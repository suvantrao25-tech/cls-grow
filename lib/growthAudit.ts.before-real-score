export type BusinessAudit = {
  score: number;
  status: string;
  completedFields: number;
  totalFields: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  tasks: string[];
};

type BusinessData = {
  businessName: string;
  category: string;
  location: string;
  phone: string;
  website: string;
};

export function runGrowthAudit(
  business: BusinessData
): BusinessAudit {
  let score = 0;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  const tasks: string[] = [];

  if (business.businessName?.trim()) {
    score += 15;
    strengths.push("Business name is available.");
  } else {
    weaknesses.push("Business name is missing.");
    tasks.push("Complete your business name.");
  }

  if (business.category?.trim()) {
    score += 15;
    strengths.push("Business category is defined.");
  } else {
    weaknesses.push("Business category is missing.");
    tasks.push("Add your business category.");
  }

  if (business.location?.trim()) {
    score += 15;
    strengths.push("Business location is available.");
  } else {
    weaknesses.push("Business location is missing.");
    tasks.push("Add your business location.");
  }

  if (business.phone?.trim()) {
    score += 15;
    strengths.push("Business phone number is available.");
  } else {
    weaknesses.push("Business phone number is missing.");
    tasks.push("Add a business phone number.");
  }

  if (business.website?.trim()) {
    score += 20;
    strengths.push("Business website is available.");
  } else {
    weaknesses.push("Business website is missing.");
    suggestions.push(
      "Create or add a professional website for your business."
    );
    tasks.push("Add a business website.");
  }

  const fields = [
    business.businessName,
    business.category,
    business.location,
    business.phone,
    business.website,
  ];

  const completedFields = fields.filter(
    (field) => field?.trim()
  ).length;

  const totalFields = fields.length;

  if (completedFields === totalFields) {
    score += 20;
    strengths.push("Business profile is complete.");
  } else {
    weaknesses.push(
      `Business profile is ${Math.round(
        (completedFields / totalFields) * 100
      )}% complete.`
    );
  }

  const category = business.category?.toLowerCase() || "";

  if (category.includes("medical") || category.includes("pharma")) {
    suggestions.push(
      "Optimize your Google Business Profile for local medicine searches."
    );

    suggestions.push(
      "Collect genuine customer reviews to build local trust."
    );

    suggestions.push(
      "Add WhatsApp ordering or enquiry support."
    );

    tasks.push("Optimize Google Business Profile.");
    tasks.push("Collect 5 genuine customer reviews.");
    tasks.push("Add WhatsApp enquiry or ordering.");
  } else if (
    category.includes("salon") ||
    category.includes("beauty")
  ) {
    suggestions.push(
      "Showcase your latest work with high-quality photos."
    );

    suggestions.push(
      "Collect customer reviews after completed services."
    );

    suggestions.push(
      "Create seasonal or festival offers."
    );

    tasks.push("Upload recent business photos.");
    tasks.push("Collect 5 genuine customer reviews.");
    tasks.push("Create a seasonal offer.");
  } else if (
    category.includes("restaurant") ||
    category.includes("cafe") ||
    category.includes("food")
  ) {
    suggestions.push(
      "Optimize your local business listing with menu and photos."
    );

    suggestions.push(
      "Collect genuine customer reviews."
    );

    suggestions.push(
      "Create an easy WhatsApp ordering or enquiry path."
    );

    tasks.push("Add menu and business photos.");
    tasks.push("Collect 5 genuine customer reviews.");
    tasks.push("Add WhatsApp enquiry/order option.");
  } else {
    suggestions.push(
      "Create and optimize your Google Business Profile."
    );

    suggestions.push(
      "Collect genuine customer reviews."
    );

    suggestions.push(
      "Build a consistent online presence."
    );

    tasks.push("Create or optimize Google Business Profile.");
    tasks.push("Collect 5 genuine customer reviews.");
    tasks.push("Create a consistent weekly content plan.");
  }

  let status = "Needs Improvement";

  if (score >= 80) {
    status = "Excellent";
  } else if (score >= 60) {
    status = "Good";
  } else if (score >= 40) {
    status = "Fair";
  }

  const uniqueTasks = [...new Set(tasks)];
  const uniqueSuggestions = [...new Set(suggestions)];

  return {
    score,
    status,
    completedFields,
    totalFields,
    strengths,
    weaknesses,
    suggestions: uniqueSuggestions.slice(0, 5),
    tasks: uniqueTasks.slice(0, 5),
  };
}
