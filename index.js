const express = require('express');
const Jimp = require('jimp');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 3000;

// Configure Multer to handle binary file input
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/watermark', upload.single('data'), async (req, res) => {
  console.log("hi");
  const watermarkUrl = req.query.watermarkUrl;
  if (!req.file || !watermarkUrl) {
    return res.status(400).json({ error: 'Missing image or watermarkUrl' });
  }

  try {
    const [baseImage, watermark] = await Promise.all([
      Jimp.read(req.file.buffer),
      Jimp.read(watermarkUrl)
    ]);

    // Resize watermark to 20% of base width
    const watermarkResized = watermark.resize(baseImage.bitmap.width / 5, Jimp.AUTO);

    // Position: bottom-right
    const x = baseImage.bitmap.width - watermarkResized.bitmap.width - 10;
    const y = baseImage.bitmap.height - watermarkResized.bitmap.height - 10;

    baseImage.composite(watermarkResized, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5
    });

    const resultBuffer = await baseImage.getBufferAsync(Jimp.MIME_PNG);
    res.set('Content-Type', 'image/png');
    res.send(resultBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to apply watermark' });
  }
});

app.get('/', (req, res) => {
  res.send('✅ Watermark server is running');
});

app.listen(port, () => {
  console.log(`Watermark server listening on port ${port}`);
});
