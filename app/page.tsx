import Link from "next/link";
import { appUrl } from "@/lib/domains";

const CARDS = [
  { title: "Help Center", desc: "Browse FAQs and guides", href: "/help" },
  { title: "My Tickets", desc: "View and manage your support tickets", href: "/tickets" },
  { title: "Contact Us", desc: "Get in touch with our team", href: "/contact" },
  { title: "Documentation", desc: "Learn how Tirbeo works", href: "/help" },
];

export default function SupportHome() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-medium text-[var(--color-text-primary,#202124)]">Support</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary,#5F6368)]">Help and resources for Tirbeo.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CARDS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-md border border-[var(--color-border-default,#DADCE0)] bg-[var(--color-surface-raised,#FFFFFF)] p-6 shadow-[var(--shadow-card,0_1px_2px_rgba(0,0,0,0.05))] transition-colors hover:border-[var(--color-border-strong,#BDC1C6)]"
          >
            <h2 className="text-base font-medium text-[var(--color-text-primary,#202124)]">{item.title}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary,#5F6368)]">{item.desc}</p>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-[var(--color-text-muted,#80868B)]">
        <a href={appUrl("www")} className="hover:text-[var(--color-text-primary,#202124)]">tirbeo.app</a>
        {" · "}
        <a href={appUrl("dashboard")} className="hover:text-[var(--color-text-primary,#202124)]">My Account</a>
      </p>
    </div>
  );
}
