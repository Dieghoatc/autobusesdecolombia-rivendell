import express from "express";
import multer from "multer";
import sharp from "sharp";

const app = express();
const PORT = 3002;
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ messafe: "holandas" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const resized = await sharp(req.file.buffer)
      .resize(2000)
      .avif({ quality: 80 })
      .toBuffer();

    return res.set("Content-Type", "image/avif").send(resized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
