"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  DashboardShell,
  type NavSection,
  type AppLink,
} from "@tirbeo/ui";
import { useThemeToggle } from "@tirbeo/theme";
import { LifeBuoy, MessagesSquare, CircleHelp, FileText, Home, Sun, Moon } from "lucide-react";
import { appUrl } from "@/lib/domains";
import { accountsUrl } from "@/lib/auth";

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Support",
    items: [
      { href: "/", label: "Overview", icon: Home },
      { href: "/help", label: "Help Center", icon: CircleHelp },
      { href: "/tickets", label: "My Tickets", icon: MessagesSquare },
      { href: "/contact", label: "Contact Us", icon: LifeBuoy },
    ],
  },
  {
    label: "Resources",
    items: [{ href: "/help", label: "Documentation", icon: FileText }],
  },
];

const APPS: AppLink[] = [
  { id: "accounts", name: "Accounts", href: appUrl("accounts") },
  { id: "dashboard", name: "Dashboard", href: appUrl("dashboard") },
  { id: "forms", name: "Forms", href: appUrl("forms") },
  { id: "admin", name: "Admin", href: appUrl("admin") },
  { id: "www", name: "Website", href: appUrl("www") },
];

export function SupportShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, toggle } = useThemeToggle();

  return (
    <>
      <button
        onClick={toggle}
        className="theme-toggle"
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      >
        {isDark ? <Sun className="w-5 h-5" strokeWidth={2} /> : <Moon className="w-5 h-5" strokeWidth={2} />}
      </button>
    <DashboardShell
      navSections={NAV_SECTIONS}
      apps={APPS}
      brand={{ name: "Support" }}
      user={null}
      onLogout={() => { window.location.href = accountsUrl('/logout'); }}
      onNavigate={(href) => router.push(href)}
      currentPath={pathname}
      searchPlaceholder="Search help articles, tickets..."
      searchGroups={[
        {
          label: "Help articles",
          items: [
            { label: "Getting started", href: "/help" },
            { label: "Billing & plans", href: "/help" },
            { label: "Privacy & security", href: "/help" },
          ],
        },
        {
          label: "Tickets",
          items: [
            { label: "My tickets", href: "/tickets" },
            { label: "Open a new ticket", href: "/tickets/create" },
          ],
        },
      ]}
      helpLinks={[{ label: "Help center", href: "/help" }, { label: "Contact support", href: "/contact" }]}
    >
      {children}
    </DashboardShell>
    </>
  );
}
