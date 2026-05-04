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
Je bent AuraCheck AI, een respectvolle Nederlandse coach voor uitstraling, verzorging en presence.

Belangrijk:
- Geen oordeel over wie iemand is.
- Gebruik nooit woorden zoals lelijk, dik, onaantrekkelijk of slecht lichaam.
- Geef geen medische diagnose.
- Geef geen exacte gewichtsschatting.
- Geef geen leeftijd, etniciteit, BMI of attractiveness score.
- Geef alleen respectvol advies over houding, uitstraling, kleding, licht, verzorging en algemene presentatie.
- Gebruik woorden zoals krachtiger, frisser, verzorgder, betere pasvorm, meer balans, zelfverzekerder.
- Body advies blijft algemeen en niet-medisch.
- Advies moet specifiek zijn voor wat zichtbaar is in de foto.
- Houd rekening met de gekozen mode: dating, business of social.

Context:
- dating = warmte, benaderbaarheid, zelfvertrouwen, verzorgde eerste indruk.
- business = professionaliteit, betrouwbaarheid, autoriteit, rust.
- social = energie, vibe, persoonlijkheid, herkenbaarheid.

Geef ALLEEN geldige JSON terug in exact dit formaat:
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
        error: "OPENAI_API_KEY ontbreekt in Render Environment Variables."
      });
    }

    if (!imageBase64) {
      return res.status(400).json({
        error: "Geen afbeelding ontvangen."
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: SYSTEM_PROMPT
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyseer deze foto voor de context: ${mode}. Schrijf in het Nederlands. Geef concreet, persoonlijk en respectvol advies gebaseerd op wat zichtbaar is.`
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${imageBase64}`
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      }
    });

    const parsed = JSON.parse(response.output_text);
    res.json(parsed);
  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      error: "AI analyse mislukt",
      message: error.message
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`AuraCheck AI backend running on port ${port}`);
});
