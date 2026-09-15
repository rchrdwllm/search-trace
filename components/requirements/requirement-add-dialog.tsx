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

interface RequirementAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobDescription: string;
  onAdd: (req: {
    title: string;
    category: RequirementCategory;
    jobDescriptionExcerpt: string;
  }) => void;
}

export function RequirementAddDialog({
  open,
  onOpenChange,
  jobDescription,
  onAdd,
}: RequirementAddDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<RequirementCategory>("technical_skill");
  const [excerpt, setExcerpt] = useState("");
  const [error, setError] = useState<string | null>(null);

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

    onAdd({
      title: title.trim(),
      category,
      jobDescriptionExcerpt: excerpt.trim(),
    });

    setTitle("");
    setCategory("technical_skill");
    setExcerpt("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add Custom Requirement</DialogTitle>
            <DialogDescription>
              Create a role requirement manually with an optional verbatim citation from the job description.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-req-title" className="text-xs font-medium">
                Requirement Statement
              </Label>
              <Input
                id="add-req-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Experience deploying Docker containers on AWS"
                className="text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-req-category" className="text-xs font-medium">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as RequirementCategory)}
              >
                <SelectTrigger id="add-req-category" className="w-full">
                  <SelectValue placeholder="Select category" />
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
                <Label htmlFor="add-req-excerpt" className="text-xs font-medium">
                  Job Description Citation Excerpt (Optional)
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
                id="add-req-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Paste verbatim quote from the job description..."
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add Requirement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
