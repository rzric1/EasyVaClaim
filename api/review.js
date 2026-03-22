import OpenAI from "openai";
import { applyRules } from "./rules";

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

    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const {
      serviceConnected,
      currentRating,
      conditions,
      symptoms,
      goal,
    } = body;

    const rules = applyRules({
      serviceConnected,
      currentRating,
      conditions,
      symptoms,
      goal,
    });

    const prompt = `
A veteran submitted the following intake:

- Service connected: ${serviceConnected || "Not provided"}
- Current rating: ${currentRating || "Not provided"}
- Conditions to review: ${conditions || "Not provided"}
- Symptoms: ${symptoms || "Not provided"}
- Goal: ${goal || "Not provided"}

Internal classification guidance:
${rules.classification.length ? "- " + rules.classification.join("\n- ") : "- No classification guidance available."}

Internal rule insights:
${rules.ruleInsights.length ? "- " + rules.ruleInsights.join("\n- ") : "- No rule insights available."}

Potential secondary-condition pathways to consider:
${rules.possibleSecondaries.length ? "- " + rules.possibleSecondaries.join("\n- ") : "- None identified."}

Evidence themes that may be worth mentioning:
${rules.evidenceFocus.length ? "- " + rules.evidenceFocus.join("\n- ") : "- None identified."}

Instructions for the response:
- Do not treat everything only as an increase claim if the intake suggests possible secondary conditions.
- Distinguish clearly between:
  1. possible increase path
  2. possible secondary-condition path
  3. possible need for more medical clarification
- Keep the tone educational, practical, and cautious.
- Use the user's actual symptoms when relevant.
- Do not overstate certainty.

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
- When the facts suggest both an increase path and a secondary-condition path, acknowledge both instead of picking only one.
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const output =
      response.choices?.[0]?.message?.content || "No output returned.";

    return res.status(200).json({ output });
  } catch (error) {
    console.error("API REVIEW ERROR:", error);

    return res.status(500).json({
      error:
        error?.message ||
        error?.toString() ||
        "Unknown backend error in /api/review.",
    });
  }
}
