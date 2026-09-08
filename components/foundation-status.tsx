import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { CircleAlert, Info } from "lucide-react";

export type FoundationStatusKind = "info" | "unavailable" | "error";

const statusContent: Record<
  FoundationStatusKind,
  { title: string; icon: typeof Info; variant: "default" | "destructive" }
> = {
  info: { title: "Foundation ready", icon: Info, variant: "default" },
  unavailable: {
    title: "Service connection is not configured",
    icon: CircleAlert,
    variant: "default",
  },
  error: {
    title: "Something needs attention",
    icon: CircleAlert,
    variant: "destructive",
  },
};

export function FoundationStatus({
  kind,
  children,
}: {
  kind: FoundationStatusKind;
  children: React.ReactNode;
}) {
  const content = statusContent[kind];
  const Icon = content.icon;

  return (
    <Alert
      aria-live={kind === "error" ? "assertive" : "polite"}
      role={kind === "error" ? "alert" : "status"}
      variant={content.variant}
    >
      <Icon aria-hidden="true" />
      <AlertTitle>{content.title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
