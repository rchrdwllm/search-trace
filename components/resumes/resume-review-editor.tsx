"use client";

import { useState } from "react";
import { Edit3Icon, CheckIcon, XIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ResumeReviewEditorProps {
  reviewedText: string | null;
  onSaveText: (text: string) => Promise<void>;
  isSaving?: boolean;
}

export function ResumeReviewEditor({
  reviewedText,
  onSaveText,
  isSaving = false,
}: ResumeReviewEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [prevReviewedText, setPrevReviewedText] = useState(reviewedText);
  const [text, setText] = useState(reviewedText ?? "");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (reviewedText !== prevReviewedText) {
    setPrevReviewedText(reviewedText);
    setText(reviewedText ?? "");
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;

  const handleSave = async () => {
    if (!text.trim()) return;
    setStatusMessage(null);
    try {
      await onSaveText(text);
      setIsEditing(false);
      setStatusMessage("Changes saved successfully.");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch {
      setStatusMessage("Failed to save changes.");
    }
  };

  const handleCancel = () => {
    setText(reviewedText ?? "");
    setIsEditing(false);
    setStatusMessage(null);
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Reviewed Résumé Plain Text
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            This text represents your submitted evidence for AI gap analysis. You can review and correct any extracted content.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground font-mono">
            {words} words • {characters} chars
          </span>

          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 gap-1.5 text-xs"
            >
              <Edit3Icon className="size-3.5" />
              Edit Text
            </Button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-md p-2"
        >
          {statusMessage}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            id="resume-review-textarea"
            aria-label="Reviewed résumé plain text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="font-sans text-sm leading-relaxed p-3 bg-background resize-y"
            placeholder="Paste or edit plain text..."
          />

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-8 gap-1.5 text-xs"
            >
              <XIcon className="size-3.5" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !text.trim()}
              className="h-8 gap-1.5 text-xs"
            >
              {isSaving ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <CheckIcon className="size-3.5" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <div
          data-testid="reviewed-text-preview"
          className="rounded-lg border bg-muted/20 p-4 text-sm font-sans whitespace-pre-wrap leading-relaxed text-foreground break-words max-h-[450px] overflow-y-auto"
        >
          {text || "No text content available."}
        </div>
      )}
    </div>
  );
}
