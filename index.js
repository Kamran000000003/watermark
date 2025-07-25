const express = require("express");
const Jimp = require("jimp");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint: /watermark?imageUrl=...&watermarkUrl=...
app.get("/watermark", async (req, res) => {
  const { imageUrl, watermarkUrl } = req.query;

  if (!imageUrl || !watermarkUrl) {
    return res.status(400).json({ error: "Missing imageUrl or watermarkUrl" });
  }

  try {
    const [baseImage, watermark] = await Promise.all([
      Jimp.read(imageUrl),
      Jimp.read(watermarkUrl),
    ]);

    // Resize watermark to 30% of base image width
    const scaleFactor = baseImage.bitmap.width * 0.3 / watermark.bitmap.width;
    watermark.scale(scaleFactor);

    // Position watermark at bottom-right
    const x = baseImage.bitmap.width - watermark.bitmap.width - 10;
    const y = baseImage.bitmap.height - watermark.bitmap.height - 10;

    baseImage.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.7,
    });

    const buffer = await baseImage.getBufferAsync(Jimp.MIME_PNG);

    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process image" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
