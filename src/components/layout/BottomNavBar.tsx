"use client";

import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaCalendarAlt, FaCog } from "react-icons/fa";
import { ROUTES } from "@/lib/constants/routes";

export default function BottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      icon: FaHome,
      label: "홈",
      path: ROUTES.DASHBOARD,
      active: pathname === ROUTES.DASHBOARD,
    },
    {
      icon: FaCalendarAlt,
      label: "일정",
      path: ROUTES.TASKS.LIST,
      active: pathname === ROUTES.TASKS.LIST,
    },
    {
      icon: FaCog,
      label: "설정",
      path: ROUTES.ACCOUNT.SETTING,
      active: pathname === ROUTES.ACCOUNT.SETTING,
    },
  ];

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex h-full flex-1 flex-col items-center justify-center transition-colors ${
                item.active ? "text-emerald-500" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="mb-1 text-xl" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
