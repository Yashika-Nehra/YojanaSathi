/** @type {import('tailwindcss').Config} */
export default {
  content:["./index.html","./src/**/*.{js,jsx}"],
  theme:{extend:{colors:{paper:"#F6F2EA",ink:"#1B1B1A",primary:"#1F4D3A",accent:"#C8891B",line:"#D8D0C0",surface:"#FFFFFF",brick:"#A63A2B"},fontFamily:{serif:['"Source Serif 4"','Georgia','serif'],sans:['"Noto Sans"','"Noto Sans Devanagari"','"Noto Sans Bengali"','"Noto Sans Tamil"','"Noto Sans Telugu"','"Noto Sans Gujarati"','system-ui','sans-serif']}}},
  plugins:[]
};
