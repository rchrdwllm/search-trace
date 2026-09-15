"use client";

import { useEffect, useState } from "react";
import { cn } from "cn";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "resume", label: "Résumé" },
  { id: "evidence", label: "Evidence" },
  { id: "feedback", label: "Feedback" },
  { id: "gap-review", label: "Gap review" },
  { id: "requirements", label: "Requirements" },
] as const;

export function OpportunitySectionNav() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const targets = sections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target instanceof HTMLElement) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Opportunity sections"
      className="sticky top-20 flex gap-1 overflow-x-auto rounded-xl bg-card p-2 ring-1 ring-foreground/10 lg:flex-col"
    >
      {sections.map(({ id, label }) => {
        const isActive = activeSection === id;

        return (
          <a
            key={id}
            href={`#${id}`}
            aria-current={isActive ? "location" : undefined}
            className={cn(
              "flex h-10 shrink-0 items-center rounded-lg px-3 font-mono text-xs uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-muted font-semibold text-foreground"
                : "text-muted-foreground/60 hover:bg-muted/70 hover:text-muted-foreground",
            )}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
