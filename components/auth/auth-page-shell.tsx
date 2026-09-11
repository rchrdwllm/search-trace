import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ZapIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type AuthPageShellProps = {
  children: React.ReactNode;
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  alternatePrompt: string;
  alternateLabel: string;
  alternateHref: "/sign-in" | "/sign-up";
  panelSignal: string;
  panelIndex: string;
  panelTitle: React.ReactNode;
  panelDescription: string;
  panelLabel: string;
  steps: Array<{ title: string; description: string }>;
  panelFooter: string;
};

export function AuthPageShell({
  children,
  title,
  description,
  alternatePrompt,
  alternateLabel,
  alternateHref,
  panelSignal,
  panelTitle,
  panelDescription,
  panelLabel,
  steps,
}: AuthPageShellProps) {
  return (
    <div className="auth-theme grid min-h-svh bg-background lg:grid-cols-2">
      <section className="grid min-h-svh grid-rows-[auto_1fr_auto] gap-12 px-6 py-6 sm:px-8 sm:py-8 lg:px-12 xl:px-16 xl:py-12">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 text-2xl font-bold tracking-[-0.06em] text-foreground no-underline"
          aria-label="SearchTrace home"
        >
          <span className="grid size-7 place-items-center rounded-sm bg-accent text-accent-foreground">
            <ZapIcon className="size-5" aria-hidden="true" />
          </span>
          searchtrace<span className="text-muted-foreground">/</span>
        </Link>

        <main id="main-content" className="my-auto w-full max-w-md justify-self-center py-4">
          <header className="mb-8 flex flex-col gap-4">
            <h1 className="font-display text-4xl leading-[1.08] font-normal tracking-[-0.045em] text-balance sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-sm leading-7 text-muted-foreground">{description}</p>
          </header>

          {children}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {alternatePrompt}{" "}
            <Link className="font-medium text-primary underline underline-offset-4" href={alternateHref}>
              {alternateLabel}
            </Link>
          </p>
        </main>

        <footer className="flex flex-wrap justify-between gap-4 text-xs text-muted-foreground">
          <span>Your materials stay private to your workspace.</span>
        </footer>
      </section>

      <aside
        className="m-4 ml-0 hidden flex-col justify-between gap-12 rounded-lg bg-muted p-8 lg:flex xl:p-12"
        aria-label="About SearchTrace"
      >
        <div className="flex justify-between gap-4 font-mono text-xs tracking-[0.08em] uppercase">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
            {panelSignal}
          </span>
        </div>

        <div className="mx-auto w-full max-w-lg">
          <h2 className="font-display text-5xl leading-[1.05] font-normal tracking-[-0.045em] text-balance xl:text-6xl">
            {panelTitle}
          </h2>
          <p className="mt-6 max-w-sm leading-7 text-muted-foreground">{panelDescription}</p>

          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="font-mono text-xs tracking-[0.08em] uppercase">
                {panelLabel}
              </CardTitle>
              <CardDescription className="font-mono text-xs uppercase">SearchTrace /</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-col">
              {steps.map((step, index) => (
                <div key={step.title} className="flex items-center gap-4 py-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-sm border text-primary">
                    {index === steps.length - 1 ? (
                      <CheckIcon className="size-4" aria-hidden="true" />
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{step.title}</span>
                    <span className="block text-xs text-muted-foreground">{step.description}</span>
                  </span>
                  {index === steps.length - 1 && (
                    <ArrowRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Separator className="mb-6" />
        </div>
      </aside>
    </div>
  );
}
