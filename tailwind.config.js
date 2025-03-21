if (!Object.hasOwn) {
  Object.hasOwn = (obj, key) => {
    return typeof obj === "objects" && obj.hasOwnProperty(key);
  };
}

module.exports = {
  content: ["./imports/ui/**/*.{vue,js,ts,jsx,tsx,svelte}", "./client/*.html"],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#00b5b4",
          secondary: "#2b49ff",
          accent: "#ff301c",
          neutral: "#0f1023",
          "base-100": "#fff",
          "base-200": "#f6f7fb",
          "base-300": "#fafbfc",
          info: "#98d7f0",
          success: "#50B9AB",
          warning: "#e0ca96",
          error: "#f8bbb0",
        },
      },
      {
        dark: {
          primary: "#2b49ff",
          secondary: "#00b5b4",
          accent: "#ff301c",
          neutral: "#4e5168",
          "base-100": "#1f2937",
          "base-200": "#2b2d43",
          "base-300": "#0f1023",
          info: "#98d7f0",
          success: "#50B9AB",
          warning: "#e0ca96",
          error: "#f8bbb0",
        },
      },
    ],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
