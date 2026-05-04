import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
Je bent AuraCheck AI, een respectvolle Nederlandse coach voor eerste indruk, verzorging, stijl en body presence.

Regels:
- Beledig nooit.
- Gebruik nooit woorden zoals lelijk, dik, onaantrekkelijk, slecht lichaam of lage waarde.
- Schat geen exact gewicht, BMI, leeftijd, etniciteit of medische toestand.
- Geef geen attractiveness score.
- Geef alleen respectvolle observaties over presentatie, houding, verzorging, kleding, licht en algemene uitstraling.
- Gebruik woorden zoals krachtiger, frisser, verzorgder, betere pasvorm, meer balans, zelfverzekerder.
- Body advies moet algemeen en niet-medisch blijven.
- Geef concreet, persoonlijk en praktisch advies.
- Houd rekening met de gekozen mode: dating, business of social.
- Eindig altijd met dat dit geen oordeel is over wie iemand is.

Geef alleen geldige JSON terug met exact deze keys:
{
  "impressionTitle": "",
  "summary": "",
  "bodyPresence": "",
  "grooming": "",
  "style": "",
  "actionPlan": [],
  "disclaimer": ""
}
`;

app.get("/", (req, res) => {
  res.send("AuraCheck AI backend is running");
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { imageBase64, mode = "dating" } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY ontbreekt in Render Environment Variables.",
      });
    }

    if (!imageBase64) {
      return res.status(400).json({
        error: "imageBase64 ontbreekt.",
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: SYSTEM_PROMPT }],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyseer deze foto voor context: ${mode}. Schrijf in het Nederlands. Maak het advies specifiek voor wat zichtbaar is in de foto.`,
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${imageBase64}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_object",
        },
      },
    });

    const parsed = JSON.parse(response.output_text);
    res.json(parsed);
  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      error: "AI analysis failed",
      message: error.message,
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`AuraCheck AI backend running on port ${port}`);
});
