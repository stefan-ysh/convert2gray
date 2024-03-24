/** @type {import('tailwindcss').Config} */
 export default {
  // 未使用的类名，不会打包到生产环境
  content: ["index.html", "./src/**/*.{html,js,ts,jsx,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

