/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
      },
      colors: {
        gold: "#FFD700",
        electric: "#00BFFF",
        dark: "#0A0A0A",
        navy: "#0B132B",
      },
    },
  },
  plugins: [],
}
