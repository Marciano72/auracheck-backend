const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("AuraCheck backend is running");
});

app.post("/analyze", async (req, res) => {
  try {
    const { image, mode } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Geen afbeelding ontvangen." });
    }

    const selectedMode = mode || "dating";

    const prompt = `
Je bent AuraCheck AI, een respectvolle Nederlandse image coach.

Analyseer de foto op:
1. eerste indruk
2. houding en presence
3. verzorging
4. kleding/stijl
5. lifestyle/gewicht op een veilige manier

Belangrijke regels:
- Gebruik respectvolle taal.
- Zeg nooit: dik, lelijk, onaantrekkelijk of slecht.
- Geef geen exacte gewichtsschatting.
- Geef geen medische diagnose.
- Geef geen harde attractiveness score.
- Gebruik woorden zoals: frisser, krachtiger, verzorgder, meer balans, meer definitie, energiekere uitstraling.
- Advies moet per foto verschillend zijn.
- Houd rekening met de gekozen context: ${selectedMode}.
- Dating = warmte, benaderbaarheid, zelfvertrouwen.
- Business = professioneel, betrouwbaar, autoriteit.
- Social = energie, vibe, persoonlijkheid.

Kies aanbevolen links uit exact deze opties:
"Grooming routine"
"Premium grooming"
"Gezond gewicht"
"Beweging & fitness"

Geef alleen geldige JSON terug in exact dit formaat:
{
  "firstImpression": "...",
  "bodyPresence": "...",
  "grooming": "...",
  "style": "...",
  "lifestyle": "...",
  "recommendedLinks": ["...","..."]
}
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${image}`,
            },
          ],
        },
      ],
    });

    const rawText = response.output_text;

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      parsed = {
        firstImpression: "Je foto is geanalyseerd.",
        bodyPresence:
          "Je uitstraling kan sterker worden door meer aandacht voor houding, licht en compositie.",
        grooming:
          "Kleine verbeteringen in verzorging, zoals haar, huid en kledingdetails, kunnen je uitstraling frisser maken.",
        style:
          "Een outfit met betere pasvorm en rustiger kleurgebruik kan meer balans geven.",
        lifestyle:
          "Consistente beweging, slaap en voeding ondersteunen een energiekere uitstraling.",
        recommendedLinks: ["Grooming routine", "Beweging & fitness"],
      };
    }

    res.json(parsed);
  } catch (error) {
    console.error("AI analyse fout:", error);
    res.status(500).json({
      error: "AI analyse mislukt.",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("AuraCheck backend running on port " + PORT);
});
