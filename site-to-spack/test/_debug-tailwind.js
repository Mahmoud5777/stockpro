const { extractTheme, readTailwindConfig } = require("../lib/parse-tailwind");
const fs = require("fs");
const path = require("path");

const cfg = `
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        brand: { DEFAULT: '#f43f5e', hover: '#e11d48' },
        surface: '#ffffff',
      },
      fontFamily: { sans: ['Rubik', 'ui-sans-serif'] },
      borderRadius: { md: '0.75rem' },
      boxShadow: { md: '0 1px 2px rgb(0 0 0 / 0.1)' },
    },
  },
};
`;
console.log(JSON.stringify(extractTheme(cfg), null, 2));
console.log("readTailwindConfig:", JSON.stringify(readTailwindConfig(cfg), null, 2));