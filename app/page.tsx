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
      <h1 className="text-2xl font-medium text-[var(--color-text-primary)]">Support</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Help and resources for Tirbeo.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CARDS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="block border-2 border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal"
          >
            <h2 className="text-base font-medium text-[var(--color-text-primary)]">{item.title}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-[var(--color-text-muted)]">
        <a href={appUrl("www")} className="hover:text-[var(--color-text-primary)]">tirbeo.app</a>
        {" · "}
        <a href={appUrl("dashboard")} className="hover:text-[var(--color-text-primary)]">My Account</a>
      </p>
    </div>
  );
}
