/** @type {import('tailwindcss').Config} */

import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    'src/frontend/index.html',
    // React source files
    "./src/frontend/src/**/*.{js,ts,jsx,tsx}",

    // If you keep components in /src/frontend/components
    "./src/frontend/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        landingBg: "url('/assets/img/landing_background.png')",
      },
      colors: {
        littledark: '#0F0C1D',
        dashboard_dark: '#44403c',
        layout_dark: '#0F0C1D',
        dark: '#0F0C1D',
        background: '#27262C',
        btn_color: '#662483',
        transparent: 'transparent',
        icon_color: '#1FC7D4',
      },
    },
  },
  plugins: [],
}
