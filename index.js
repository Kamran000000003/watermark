const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Create upload and output directories if they don't exist
const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Multer setup
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.post('/', upload.single('image'), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join(outputDir, `watermarked-${Date.now()}.png`);

  try {
    await sharp(inputPath)
      .composite([
        {
          input: Buffer.from(
            `<svg width="500" height="500">
              <text x="10" y="50" font-size="32" fill="white" opacity="0.7">Watermark</text>
            </svg>`
          ),
          gravity: 'southeast',
        },
      ])
      .png()
      .toFile(outputPath);

    // Send the processed file
    res.download(outputPath, 'watermarked.png', (err) => {
      // Clean up temporary files
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error('Processing error:', err);
    res.status(500).send('Error processing image');
  }
});

app.get('/', (req, res) => {
  res.send('✅ Watermark server is up and running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
