"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const sections = [
  ["overview", "Overview"], ["resume", "Résumé"], ["evidence", "Evidence"],
  ["feedback", "Feedback"], ["gap", "Gap review"], ["requirements", "Requirements"],
] as const;

export function OpportunityPageNavigation() {
  const [active, setActive] = useState<string>("overview");

  useEffect(() => {
    const update = () => {
      let current: string = "overview";
      for (const [id] of sections) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 160) current = id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <nav aria-label="On this page" className="min-w-0 rounded-xl border bg-card p-3 lg:sticky lg:top-20">
      <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">On this page</p>
      <div className="flex flex-wrap gap-1 lg:flex-col">
        {sections.map(([id, label], index) => (
          <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined}
            className={cn("flex min-h-11 items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring", active === id ? "bg-muted font-medium text-foreground" : "text-muted-foreground")}>
            {label}<span aria-hidden="true" className="font-mono text-xs">0{index + 1}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
