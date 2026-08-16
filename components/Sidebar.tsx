"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/" },
  { name: "Business Profile", href: "/business-profile" },
  { name: "Growth Score", href: "/growth-score" },
  { name: "AI Suggestions", href: "/ai-suggestions" },
  { name: "Tasks", href: "/tasks" },
  { name: "Reviews", href: "/reviews" },
  { name: "Subscription", href: "/subscription" },
  { name: "Billing", href: "/billing" },
  { name: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-8">
        CLS GROW
      </h2>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg transition ${
                active
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
