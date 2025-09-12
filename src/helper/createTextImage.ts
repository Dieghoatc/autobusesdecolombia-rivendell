import fs from "fs";
import path from "path";

const fontBase64 = fs.readFileSync(
  path.join(__dirname, "assets", "fonts", "arial.ttf.base64"),
  "utf-8"
);

export function createTextImage(author: string, location?: string) {
  const width = 600;
  const height = 100;
  

  const svg = `
    <svg width="${width}" height="${height}">
    <defs>
        <linearGradient id="fade-bg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:black; stop-opacity:0" />
          <stop offset="100%" style="stop-color:black; stop-opacity:0.6" />
        </linearGradient>
      </defs>
      <rect x="0" y="${height - 70}" width="100%" height="80" fill="url(#fade-bg)" />
      <style>      
      @font-face {
        font-family: "Arial";
        src: url("data:font/ttf;base64,${fontBase64}");
      }
        .author { fill: white; font-size: 22px; font-weight: bold; font-family: Arial; opacity: 0.8; }
        .location { fill: white; font-size: 18px; font-family: Arial; opacity: 0.7; }
      </style>
      <text x="100%" y="60%" text-anchor="end">
        <tspan class="author" x="98%" dy="0">${author} ©</tspan>
        ${
          location
            ? `<tspan class="location" x="98%" dy="28">${location}</tspan>`
            : ""
        }
      </text>
    </svg>
  `;
  return Buffer.from(svg);
}
