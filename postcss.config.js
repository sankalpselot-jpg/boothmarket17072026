// postcss.config.js
// Required by Vite to process Tailwind CSS directives (@tailwind base/components/utilities)
// Without this file, the build fails silently or Tailwind classes don't apply.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
