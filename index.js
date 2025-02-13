import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";
const DEEPL_API_KEY = "2d9421c7-6aef-25e5-96ac-86e601c07928:fx"; 

app.use(express.json());
app.use(cors());

app.post("/translate", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "El texto es obligatorio" });
    }

    // 🔍 Detectar idioma
    const detectResponse = await axios.post(
      DEEPL_API_URL,
      {
        text: [text], // DeepL espera un array
        target_lang: "EN", // Esto es solo para recibir la detección de idioma
      },
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const detectedLang = detectResponse.data.translations[0].detected_source_language;
    console.log(`Idioma detectado: ${detectedLang}`);

    // 🌍 Determinar a qué idioma traducir
    const targetLang = detectedLang === "ES" ? "EN" : "ES"; // 🔥 Si es español, traduce a inglés; si es inglés, traduce a español.

    // 🔄 Traducir texto
    const translateResponse = await axios.post(
      DEEPL_API_URL,
      {
        text: [text],
        target_lang: targetLang,
      },
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(translateResponse.data);
  } catch (error) {
    console.error("Error en la traducción:", error.response?.data || error.message);
    res.status(500).json({ error: "Error al traducir el texto" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
