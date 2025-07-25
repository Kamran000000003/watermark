const express = require("express");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

const app = express();
const port = process.env.PORT || 3000;

// Accept raw binary image uploads (e.g., from n8n HTTP Request)
app.use(express.raw({ type: 'image/*', limit: '10mb' }));

app.post("/", async (req, res) => {
  try {
    const inputBuffer = req.body;

    // Read image from buffer
    const image = await Jimp.read(inputBuffer);

    // Load watermark
    const watermark = await Jimp.read("https://iili.io/J9vTbss.md.png");

    // Resize watermark
    watermark.resize(image.bitmap.width / 4, Jimp.AUTO);

    // Calculate position (bottom-right corner)
    const x = image.bitmap.width - watermark.bitmap.width - 10;
    const y = image.bitmap.height - watermark.bitmap.height - 10;

    // Composite watermark onto image
    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.6,
    });

    // Get image buffer (PNG)
    const outputBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

    // Send back
    res.set("Content-Type", "image/png");
    res.send(outputBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to apply watermark");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
