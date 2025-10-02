"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";

const SettingsNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Profile",
      path: "/settings/profile",
      icon: UserIcon,
    },
    {
      name: "Account",
      path: "/settings/account",
      icon: ShieldCheckIcon,
    },
    {
      name: "Appearance",
      path: "/settings/appearance",
      icon: PaintBrushIcon,
    },
  ];

  return (
    <div className="w-full mb-6">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between w-full relative">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} className="flex-1" href={item.path}>
                <div
                  className={`relative flex items-center justify-center gap-2 px-4 py-4 cursor-pointer transition-colors ${
                    isActive ? "text-primary" : "text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Divider line */}
        <div className="w-full h-px bg-gray-300 dark:bg-gray-600 mt-2 relative">
          {/* Active indicator - positioned to overlap the divider */}
          {navItems.map((item) => {
            const isActive = pathname === item.path;

            if (!isActive) return null;

            return (
              <div
                key={item.path}
                className="absolute top-0 h-px bg-primary"
                style={{
                  left: `${(navItems.indexOf(item) * 100) / navItems.length}%`,
                  width: `${100 / navItems.length}%`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsNav;
