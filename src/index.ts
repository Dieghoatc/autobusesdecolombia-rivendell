import express from "express";
import multer from "multer";
import sharp from "sharp";
import { createTextImage } from "./helper/createTextImage";
import path from "path";

const app = express();
const PORT = 8000;
const upload = multer({ storage: multer.memoryStorage() });

const logoPath = path.join(process.cwd(), "assets", "logo.png");

// Load logo at server startup
let logoBuffer: Buffer;
sharp(logoPath)
  .png()
  .toBuffer()
  .then(buf => logoBuffer = buf)
  .catch(err => console.error("Error cargando logo:", err));

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

    // First we get the metadata of the image
    const image = sharp(req.file.buffer);
    const metadata = await image.metadata();

    // Generate watermark proporcional to image width (e.g: 20%)
    const watermarkBuffer = await sharp(createTextImage(author, location))
      .resize({ width: Math.round(metadata.width * 0.2) })
      .png()
      .toBuffer();

    // Using streaming to process the main image and compose watermark + logo
    res.set("Content-Type", "image/avif");
    image
      .resize({ width: 1800, withoutEnlargement: true })
      .composite([
        { input: watermarkBuffer, gravity: "southeast" },
        { input: logoBuffer, gravity: "southwest" }
      ])
      .avif({ quality: 70 })
      .pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
