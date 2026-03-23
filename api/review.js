import OpenAI from "openai";
import fs from "fs";
import path from "path";

function normalizeText(value = "") {
  return value
    .toLowerCase()
    .replace(/\bdisfunction\b/g, "dysfunction")
    .replace(/[^\w\s,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY in environment variables.",
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let body = req.body || {};

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          error: "Invalid JSON body.",
        });
      }
    }

    const {
      serviceConnected,
      currentRating,
      conditions,
      symptoms,
      goal,
      uploadedFileName,
    } = body;

    const combinedText = normalizeText(
      `${serviceConnected || ""} ${currentRating || ""} ${conditions || ""} ${symptoms || ""} ${goal || ""}`
    );

    const filePath = path.join(process.cwd(), "data", "rules-data.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const rulesData = JSON.parse(rawData);

    const matchedRules = rulesData.filter((rule) =>
      (rule.trigger_keywords || []).some((keyword) =>
        combinedText.includes(String(keyword).toLowerCase())
      )
    );

    const regulatoryGuidance = matchedRules.length
      ? matchedRules
          .map(
            (rule) =>
              `- ${rule.regulation_family} (${rule.topic}): ${rule.notes}`
          )
          .join("\n")
      : "- No specific regulatory pattern matched.";

    const evidenceGuidance = matchedRules.length
      ? matchedRules
          .flatMap((rule) => rule.evidence_focus || [])
          .map((item) => `- ${item}`)
          .join("\n")
      : "- General medical records, symptom timeline, and lay evidence may help clarify the claim path.";

    const prompt = `
A veteran submitted the following intake:

- Service connected: ${serviceConnected || "Not provided"}
- Current rating: ${currentRating || "Not provided"}
- Conditions to review: ${conditions || "Not provided"}
- Symptoms: ${symptoms || "Not provided"}
- Goal: ${goal || "Not provided"}
- Uploaded file name: ${uploadedFileName || "None"}

Relevant regulatory guidance:
${regulatoryGuidance}

Evidence considerations:
${evidenceGuidance}

Instructions for the response:
- Follow the educational guidance style.
- Use the regulation-aware context above.
- Distinguish between possible increase path, possible secondary-condition path, and possible need for more clarification.
- If the facts suggest a possible toxic exposure path, mention that it may be worth screening under the PACT Act.
- Do not give legal advice.
- Do not give medical advice.
- Do not guarantee outcomes.
- Use language like "You may consider..." and "It could be helpful to..."

Respond in plain English with these sections:
### 1. Suggested Starting Point
### 2. Possible Evidence to Gather
### 3. Possible Secondary Issues to Explore
### 4. Questions to Ask an Accredited Representative or Doctor
### 5. Important Disclaimer
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an educational VA claim assistant.

Rules:
- Do not give legal advice.
- Do not give medical advice.
- Do not tell users what they must do.
- Use language like:
  - "You may consider..."
  - "Some veterans explore..."
  - "It could be helpful to..."
- Never use:
  - "You should"
  - "You must"
  - "Begin by filing"
- Always include a disclaimer.
- Do not guarantee outcomes.
- Keep responses practical, cautious, and easy to understand.
          `.trim(),
        },
        {
          role: "user",
          content: prompt.trim(),
        },
      ],
      temperature: 0.3,
    });

    const output =
      response.choices?.[0]?.message?.content || "No output returned.";

    return res.status(200).json({ output });
  } catch (error) {
    console.error("OpenAI handler error:", error);

    return res.status(500).json({
      error: "Something went wrong while generating the response.",
      details: error?.message || "Unknown error",
    });
  }
}
