import { verifyCitation, normalizeWhitespace } from "@/lib/extraction/citation-verifier";

describe("Citation Verifier (verifyCitation)", () => {
  const sampleJobDescription = `
    Acme Software is seeking a Senior Full-Stack Engineer to join our team.

    Responsibilities:
    - Build and scale distributed web applications using TypeScript and Next.js.
    - Design and maintain relational databases with PostgreSQL.
    - Collaborate closely with product managers and designers.

    Qualifications:
    - 5+ years of experience with modern TypeScript and React.
    - Demonstrated background with automated testing (Jest, Playwright).
    - Bachelor's degree in Computer Science or equivalent practical experience.
  `;

  it("returns true for an exact substring quotation", () => {
    const excerpt = "Build and scale distributed web applications using TypeScript and Next.js.";
    expect(verifyCitation(sampleJobDescription, excerpt)).toBe(true);
  });

  it("returns true for an excerpt with differing internal whitespace or line breaks", () => {
    const excerpt = "Build   and\nscale distributed\tweb applications using TypeScript and Next.js.";
    expect(verifyCitation(sampleJobDescription, excerpt)).toBe(true);
  });

  it("returns true for an excerpt copied from qualifications", () => {
    const excerpt = "5+ years of experience with modern TypeScript and React.";
    expect(verifyCitation(sampleJobDescription, excerpt)).toBe(true);
  });

  it("returns false for a hallucinated requirement that does not exist in the job description", () => {
    const excerpt = "10+ years of Kubernetes and cloud architecture experience.";
    expect(verifyCitation(sampleJobDescription, excerpt)).toBe(false);
  });

  it("returns false for a paraphrased version of a requirement", () => {
    const excerpt = "Must have five years of React and TypeScript background.";
    expect(verifyCitation(sampleJobDescription, excerpt)).toBe(false);
  });

  it("returns false for empty or whitespace-only inputs", () => {
    expect(verifyCitation(sampleJobDescription, "")).toBe(false);
    expect(verifyCitation(sampleJobDescription, "   \n\t  ")).toBe(false);
    expect(verifyCitation("", "TypeScript")).toBe(false);
  });

  it("properly collapses whitespace via normalizeWhitespace", () => {
    expect(normalizeWhitespace("  hello \n\n world\t  foo  ")).toBe("hello world foo");
  });
});
