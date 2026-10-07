import path from "path";

// librsvg (used by sharp to render the watermark SVG) ignores @font-face and only uses
// fonts found by fontconfig. Point fontconfig at the fonts bundled in assets/ so the
// text renders on any server; without this, a server with no system fonts draws
// every character as a box. Must run before sharp renders any text.
process.env.FONTCONFIG_FILE = path.join(process.cwd(), "assets", "fonts.conf");
