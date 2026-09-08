import { render, screen } from "@testing-library/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

describe("foundation primitives", () => {
  it("communicates action states and a named busy state", () => {
    render(
      <>
        <Button type="button">Continue</Button>
        <Button disabled type="button">Unavailable</Button>
        <Button aria-busy="true" disabled type="button"><Spinner aria-hidden="true" />Saving</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Unavailable" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Saving" })).toHaveAttribute("aria-busy", "true");
  });

  it("connects labels, descriptions, and invalid state to inputs", () => {
    render(
      <Field data-invalid="true">
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" aria-describedby="email-help" aria-invalid="true" />
        <FieldDescription id="email-help">Use a work email address.</FieldDescription>
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAccessibleDescription("Use a work email address.");
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("aria-invalid", "true");
  });

  it("exposes complete card, alert, and decorative loading compositions", () => {
    render(
      <>
        <Card>
          <CardHeader><CardTitle>Summary</CardTitle><CardDescription>Details</CardDescription></CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
        <Alert><AlertTitle>Notice</AlertTitle><AlertDescription>Message</AlertDescription></Alert>
        <Skeleton aria-hidden="true" />
        <Spinner aria-label="Loading results" />
      </>,
    );
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("NoticeMessage");
    expect(screen.getByRole("status", { name: "Loading results" })).toBeInTheDocument();
  });
});
