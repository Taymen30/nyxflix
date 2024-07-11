/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      height: {
        "fill-available": "-webkit-fill-available",
      },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
