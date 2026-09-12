"use client";

import { Loader2Icon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ResumeAiConsentToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<void>;
  isUpdating?: boolean;
}

export function ResumeAiConsentToggle({
  enabled,
  onToggle,
  isUpdating = false,
}: ResumeAiConsentToggleProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex h-5 items-center pt-0.5">
        <Checkbox
          id="resume-ai-consent-checkbox"
          checked={enabled}
          disabled={isUpdating}
          onCheckedChange={(checked) => void onToggle(checked === true)}
        />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="resume-ai-consent-checkbox"
            className="text-sm font-semibold text-foreground cursor-pointer"
          >
            Include résumé in AI analysis
          </Label>
          {isUpdating && <Loader2Icon className="size-3 animate-spin text-muted-foreground" />}
        </div>
        <p className="text-xs text-muted-foreground leading-normal">
          Allow your reviewed résumé text to be sent to the configured AI provider during evidence analysis. This setting is <strong>OFF by default</strong> and scoped strictly to this opportunity.
        </p>
      </div>
    </div>
  );
}
