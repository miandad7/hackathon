/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ink: "var(--ink)",
        "route-blue": "var(--route-blue)",
        "signal-amber": "var(--signal-amber)",
        "transit-green": "var(--transit-green)",
        "alert-clay": "var(--alert-clay)",
        hairline: "var(--line-hairline)",
      },
      fontFamily: {
        body: ["var(--font-public-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "monospace", "sans-serif"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
      },
    },
  },
  plugins: [],
};
