const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Create directories
const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Multer config
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Replace with your watermark image URL (PNG recommended, transparent)
const WATERMARK_URL = 'https://i.imgur.com/GIu8fED.png'; // sample watermark

// POST route
app.post('/', upload.single('image'), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join(outputDir, `watermarked-${Date.now()}.png`);

  try {
    // Download watermark from URL into a buffer
    const response = await axios.get(WATERMARK_URL, { responseType: 'arraybuffer' });
    const watermarkBuffer = Buffer.from(response.data);

    // Composite image
    await sharp(inputPath)
      .composite([{ input: watermarkBuffer, gravity: 'southeast' }])
      .png()
      .toFile(outputPath);

    res.download(outputPath, 'watermarked.png', () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).send('Image processing failed');
  }
});

app.get('/', (req, res) => {
  res.send('✅ Watermark API is live');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
