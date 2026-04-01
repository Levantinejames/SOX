import OpenAI from "openai";

export default async function handler(req, res) {
  // Basic CORS so your GitHub Pages site can call this API.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { appName, appDescription } = req.body || {};

    if (!appDescription || !appDescription.trim()) {
      return res.status(400).json({ error: "Application description is required." });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are evaluating an application's proximity to financial statements.

Classify the application as exactly one of:
- High: directly records, processes, calculates, posts, consolidates, or materially supports financial statement data
- Medium: indirectly supports financial reporting or provides data used in supporting financial processes
- Low: little or no connection to financial statement preparation or reporting

Application name: ${appName || "Not provided"}
Application description: ${appDescription}

Return valid JSON only in this exact format:
{
  "suggested_rating": "High|Medium|Low",
  "reason": "Brief explanation in 1-2 sentences"
}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text;
    const parsed = JSON.parse(text);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to generate suggestion."
    });
  }
}
