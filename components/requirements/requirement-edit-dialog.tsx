"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  requirementCategoryEnum,
  requirementCategoryLabels,
  type RequirementCategory,
} from "@/lib/validations/requirement";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

interface RequirementItemData {
  title: string;
  category: RequirementCategory;
  jobDescriptionExcerpt: string;
}

interface RequirementEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirement: RequirementItemData | null;
  jobDescription: string;
  onSave: (updated: RequirementItemData) => void;
}

interface RequirementEditFormProps {
  requirement: RequirementItemData;
  jobDescription: string;
  onSave: (updated: RequirementItemData) => void;
  onCancel: () => void;
}

function RequirementEditForm({
  requirement,
  jobDescription,
  onSave,
  onCancel,
}: RequirementEditFormProps) {
  const [title, setTitle] = useState(requirement.title);
  const [category, setCategory] = useState<RequirementCategory>(requirement.category);
  const [excerpt, setExcerpt] = useState(requirement.jobDescriptionExcerpt);
  const [error, setError] = useState<string | null>(null);

  // Client-side citation check against job description
  const isCitationValid = Boolean(
    excerpt.trim().length > 0 &&
      (jobDescription.includes(excerpt.trim()) ||
        jobDescription.replace(/\s+/g, " ").includes(excerpt.trim().replace(/\s+/g, " ")))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (excerpt.trim().length > 0 && !isCitationValid) {
      setError("Citation excerpt must match verbatim text in the job description.");
      return;
    }

    onSave({
      title: title.trim(),
      category,
      jobDescriptionExcerpt: excerpt.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Edit Requirement</DialogTitle>
        <DialogDescription>
          Update the requirement statement, category, or cited job-description excerpt.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="edit-req-title" className="text-xs font-medium">
            Requirement Statement
          </Label>
          <Input
            id="edit-req-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 5+ years of TypeScript experience"
            className="text-sm"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-req-category" className="text-xs font-medium">
            Category
          </Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as RequirementCategory)}
          >
            <SelectTrigger id="edit-req-category" className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {requirementCategoryEnum.options.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {requirementCategoryLabels[cat]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-req-excerpt" className="text-xs font-medium">
              Job Description Citation Excerpt
            </Label>
            {excerpt.trim().length > 0 && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  isCitationValid
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {isCitationValid ? (
                  <>
                    <CheckCircle2Icon className="size-3" />
                    Verbatim Match
                  </>
                ) : (
                  <>
                    <AlertCircleIcon className="size-3" />
                    Not found in JD
                  </>
                )}
              </span>
            )}
          </div>
          <Textarea
            id="edit-req-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Exact quote from the job description..."
            className="text-xs font-mono min-h-[80px]"
          />
        </div>

        {error && (
          <p className="text-xs font-medium text-destructive">{error}</p>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RequirementEditDialog({
  open,
  onOpenChange,
  requirement,
  jobDescription,
  onSave,
}: RequirementEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {requirement && (
          <RequirementEditForm
            key={`${requirement.title}-${requirement.category}`}
            requirement={requirement}
            jobDescription={jobDescription}
            onSave={(updated) => {
              onSave(updated);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
