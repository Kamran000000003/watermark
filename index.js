const express = require("express");
const Jimp = require("jimp");

const app = express();
const port = process.env.PORT || 3000;

// Accept raw binary image uploads (e.g. from n8n HTTP Request)
app.use(express.raw({ type: 'image/*', limit: '10mb' }));

app.post("/", async (req, res) => {
  try {
    const inputBuffer = req.body;

    const image = await Jimp.read(inputBuffer);
    const watermark = await Jimp.read("https://iili.io/J9vTbss.md.png");

    watermark.resize(image.bitmap.width / 4, Jimp.AUTO);

    const x = image.bitmap.width - watermark.bitmap.width - 10;
    const y = image.bitmap.height - watermark.bitmap.height - 10;

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.6,
    });

    const outputBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

    res.set("Content-Type", "image/png");
    res.send(outputBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing image");
  }
});

app.listen(port, () => {
  console.log(`✅ Watermark server running on port ${port}`);
});
