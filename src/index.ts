import express from "express";
import multer from "multer";
import sharp from "sharp";
import { createTextImage } from "./helper/createTextImage";
import path from "path";


const app = express();
const PORT = 8000;
const upload = multer({ storage: multer.memoryStorage() });
const logoPath = path.join(process.cwd(), "assets", "logo.png");

app.get("/", (req, res) => {
  res.json({ messafe: "Server running successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { author, location } = req.body;

    if (!author) {
      return res.status(400).json({ error: 'Faltan campos: author' });
    }

    const resized = await sharp(req.file.buffer)
      .resize(2000)
      .avif({ quality: 80 })
      .toBuffer();
    
    const watermark = await sharp(createTextImage(author, location)).png().toBuffer();
    const logo = await sharp(logoPath).resize(120).png().toBuffer();

    const output = await sharp(resized)
    .composite([{ input: watermark , gravity: 'southeast'}, {input: logoPath, gravity: 'southwest'} ])
    .avif({ quality: 80 })
    .toBuffer();

    return res.set("Content-Type", "image/avif").send(output);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
