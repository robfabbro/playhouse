if (!Object.hasOwn) {
  Object.hasOwn = (obj, key) => {
    return typeof obj === "objects" && obj.hasOwnProperty(key);
  };
}

module.exports = {
  content: ["./imports/ui/**/*.{vue,js,ts,jsx,tsx,svelte}", "./client/*.html"],
  daisyui: {
    themes: [
      "light",
      {
        light: {
          primary: "#00b5b4",
          "primary-content": "#ffffff",
          secondary: "#2b49ff",
          "secondary-content": "#ffffff",
          accent: "#ff301c",
          "accent-content": "#ffffff",
          neutral: "#0f1023",
          "neutral-content": "#ffffff",
          "base-100": "#fff",
          "base-200": "#f6f7fb",
          "base-300": "#fafbfc",
          info: "#98d7f0",
          "info-content": "#ffffff",
          success: "#50B9AB",
          "success-content": "#ffffff",
          warning: "#e0ca96",
          "warning-content": "#ffffff",
          error: "#f8bbb0",
          "error-content": "#ffffff",
        },
      },
    ],
    defaultTheme: "light",
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
