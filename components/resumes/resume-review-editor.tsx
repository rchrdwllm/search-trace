"use client";

import { useState } from "react";
import { Edit3Icon, CheckIcon, XIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex flex-col justify-between gap-2 pb-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Reviewed Résumé Plain Text
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            This text represents your submitted evidence for AI gap analysis. You can review and correct any extracted content.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="sr-only">
            {words} words • {characters} chars
          </span>

          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 gap-1.5 text-xs"
            >
              <Edit3Icon data-icon="inline-start" />
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
        <div className="flex flex-col gap-3">
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
              <XIcon data-icon="inline-start" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !text.trim()}
              className="h-8 gap-1.5 text-xs"
            >
              {isSaving ? (
                <Loader2Icon data-icon="inline-start" className="animate-spin" />
              ) : (
                <CheckIcon data-icon="inline-start" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <ScrollArea
          data-testid="reviewed-text-preview"
          type="always"
          className="h-[450px] rounded-lg border bg-muted/20 p-4 text-sm font-sans whitespace-pre-wrap leading-relaxed text-foreground break-words"
        >
          {text || "No text content available."}
        </ScrollArea>
      )}
    </div>
  );
}
