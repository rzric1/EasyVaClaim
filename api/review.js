import OpenAI from "openai";

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

    const prompt = `
A veteran submitted the following intake:

- Service connected: ${serviceConnected || "Not provided"}
- Current rating: ${currentRating || "Not provided"}
- Conditions to review: ${conditions || "Not provided"}
- Symptoms: ${symptoms || "Not provided"}
- Goal: ${goal || "Not provided"}

Respond in plain English with these sections:
1. Suggested starting point
2. Possible evidence to gather
3. Possible secondary issues to explore
4. Questions to ask an accredited representative or doctor
5. Important disclaimer

Keep the response practical, clear, and educational.
Avoid legal or medical advice.
Avoid guarantees or promises.
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
