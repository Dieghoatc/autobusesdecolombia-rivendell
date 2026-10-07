// Escapes text for safe use inside the SVG (e.g. "&" in a name)
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// The layout is designed at 600x100 and rendered at `outputWidth` (vector, so it stays sharp)
export function createTextImage(author: string, location: string | undefined, outputWidth: number) {
  const width = 600;
  const height = 100;
  const outputHeight = Math.round((outputWidth * height) / width);
  

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${width} ${height}">
    <defs>
        <linearGradient id="fade-bg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:black; stop-opacity:0" />
          <stop offset="100%" style="stop-color:black; stop-opacity:0.6" />
        </linearGradient>
      </defs>
      <rect x="0" y="${height - 70}" width="100%" height="80" fill="url(#fade-bg)" />
      <style>      
        .author { fill: white; font-size: 18px; font-weight: bold; font-family: Arial; opacity: 0.8; }
        .location { fill: white; font-size: 18px; font-family: Arial; opacity: 0.7; }
      </style>
      <text x="100%" y="60%" text-anchor="end">
        <tspan class="author" x="98%" dy="0">${escapeXml(author)} ©</tspan>
        ${
          location
            ? `<tspan class="location" x="98%" dy="28">${escapeXml(location)}</tspan>`
            : ""
        }
      </text>
    </svg>
  `;
  return Buffer.from(svg);
}
