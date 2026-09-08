import { render, screen } from "@testing-library/react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";

jest.mock("next/navigation", () => ({ useRouter: () => ({ replace: jest.fn(), refresh: jest.fn() }) }));
jest.mock("@/lib/auth-client", () => ({ authClient: { signIn: { email: jest.fn() }, signUp: { email: jest.fn() }, signOut: jest.fn() } }));

describe("authentication browser forms", () => {
  it("retains accessible client-side validation affordances", () => {
    render(<SignInForm />);
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
    render(<SignUpForm />);
    expect(screen.getByRole("button", { name: "Create account" })).toBeEnabled();
  });
});
