/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "cyber-black": "#050505",
        "cyber-surface": "#0a0c10",
        "cyber-card": "#0e1117",
        "cyber-border": "#1a1f29",
        "cyber-border-bright": "#2e3748",
        "acid-lime": "#d4ff00",
        "acid-lime-dim": "#a3c700",
        "acid-glow": "rgba(212, 255, 0, 0.15)",
        "alert-red": "#ff2a51",
        "radar-cyan": "#00f0ff",
        "hazard-amber": "#ffb703",
        "muted-gray": "#737987",
      },
      fontFamily: {
        mono: ['"Space Mono"', '"JetBrains Mono"', "monospace"],
        display: ['"Chakra Petch"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "acid-sm": "0 0 10px rgba(212, 255, 0, 0.25)",
        "acid-md": "0 0 20px rgba(212, 255, 0, 0.35)",
        "acid-block": "4px 4px 0px #d4ff00",
        "red-block": "4px 4px 0px #ff2a51",
        "dark-block": "4px 4px 0px #1a1f29",
      },
    },
  },
  plugins: [],
};
