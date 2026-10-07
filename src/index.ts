import "./fonts";
import express from "express";
import multer from "multer";
import sharp from "sharp";
import { createTextImage } from "./helper/createTextImage";
import path from "path";

const app = express();
const PORT = 8000;
const upload = multer({ storage: multer.memoryStorage() });

// Longest side of the output image. Larger photos are scaled down, smaller ones are kept as is.
const MAX_DIMENSION = Number(process.env.MAX_DIMENSION) || 2560;
// AVIF quality (1-100). 75 keeps fine detail without visible artifacts.
const AVIF_QUALITY = Number(process.env.AVIF_QUALITY) || 75;

// Watermark and logo sizes, relative to the output image width. 0.4 matches how the
// watermark looked on phone photos before (it was sized from the original width).
const WATERMARK_WIDTH_RATIO = 0.4;
const LOGO_WIDTH_RATIO = 0.17;

// High resolution logo, scaled down to the size each image needs
const logoPath = path.join(process.cwd(), "assets", "logox3.png");

app.get("/", (req, res) => {
  res.json({ message: "Server running successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { author, location } = req.body;
    if (!author) return res.status(400).json({ error: "Faltan campos: author" });

    // Apply the EXIF orientation (phone photos) and limit the size. Kept as raw
    // pixels so the only lossy step is the final AVIF encoding.
    const { data, info } = await sharp(req.file.buffer)
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Rendered directly at the final size so the text stays sharp
    const watermarkBuffer = await sharp(
      createTextImage(author, location, Math.round(info.width * WATERMARK_WIDTH_RATIO))
    )
      .png()
      .toBuffer();

    const logoBuffer = await sharp(logoPath)
      .resize({ width: Math.round(info.width * LOGO_WIDTH_RATIO) })
      .png()
      .toBuffer();

    const output = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: info.channels },
    })
      .composite([
        { input: watermarkBuffer, gravity: "southeast" },
        { input: logoBuffer, gravity: "southwest" },
      ])
      .avif({ quality: AVIF_QUALITY })
      .toBuffer();

    res.set("Content-Type", "image/avif");
    res.send(output);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
