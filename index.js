const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

app.post('/generate-hairstyle', upload.single('image'), async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const imageBuffer = req.file.buffer;

    const formData = new FormData();
    formData.append('image', imageBuffer, 'photo.jpg');
    formData.append('prompt', prompt);

    // Cambia la URL al Space deseado si quieres otro modelo
    const response = await fetch('https://fffiloni-stablediffusion-hairstyle.hf.space/run/predict', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Error en HuggingFace Space' });
    }
    const result = await response.json();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error en el proxy', details: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Proxy backend listening on port ${PORT}`));
