const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

app.post("/analyze", async (req, res) => {
  res.json({
    firstImpression: "Je uitstraling komt verzorgd en stabiel over.",
    bodyPresence: "Werk aan een rechte houding voor meer kracht.",
    grooming: "Verbeter je haarstijl en huidverzorging.",
    lifestyle: "Meer beweging en betere voeding helpen je uitstraling.",
    recommendedLinks: ["Grooming routine", "Beweging & fitness"]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});