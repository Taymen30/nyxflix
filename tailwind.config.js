/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "ghost-shimmer": {
          "0%, 15%": { transform: "translateX(-100%)" },
          "85%, 100%": { transform: "translateX(100%)" },
        },
        "fog-drift": {
          from: { transform: "translate(-2%, 1%) scale(1)", opacity: ".65" },
          to: { transform: "translate(2%, -1%) scale(1.05)", opacity: "1" },
        },
      },
      animation: {
        "ghost-shimmer": "ghost-shimmer 3.8s ease-in-out infinite",
        "fog-drift": "fog-drift 9s ease-in-out infinite alternate",
      },
      fontFamily: {
        "space-grotesk": ['"Space Grotesk"', "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
