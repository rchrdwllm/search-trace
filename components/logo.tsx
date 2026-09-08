import type React from "react";

export function LogoIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 6.5h5.25a3.75 3.75 0 1 1 0 7.5H8.5A3.5 3.5 0 0 0 5 17.5V19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M19 17.5h-5.25a3.75 3.75 0 1 1 0-7.5h1.75A3.5 3.5 0 0 0 19 6.5V5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}
