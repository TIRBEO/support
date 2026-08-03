"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  DashboardShell,
  type NavSection,
  type AppLink,
} from "@tirbeo/ui";
import { LifeBuoy, MessagesSquare, CircleHelp, FileText, Home } from "lucide-react";

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
  { id: "accounts", name: "Accounts", href: "https://accounts.tirbeo.app" },
  { id: "dashboard", name: "Dashboard", href: "https://dashboard.tirbeo.app" },
  { id: "forms", name: "Forms", href: "https://forms.tirbeo.app" },
  { id: "admin", name: "Admin", href: "https://admin.tirbeo.app" },
  { id: "www", name: "Website", href: "https://tirbeo.app" },
];

export function SupportShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DashboardShell
      navSections={NAV_SECTIONS}
      apps={APPS}
      brand={{ name: "Support" }}
      user={null}
      onLogout={() => router.push("/")}
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
  );
}
