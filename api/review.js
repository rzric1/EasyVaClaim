import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      serviceConnected,
      currentRating,
      conditions,
      symptoms,
      goal,
    } = req.body || {};

    const prompt = `
You are an educational VA claim review assistant.

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

Do not give legal or medical advice.
Do not guarantee outcomes.
Keep it practical and clear.
`;

    const response = await client.responses.create({
      model: "gpt-5",
      input: prompt,
    });

    return res.status(200).json({
      output: response.output_text,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Something went wrong while reviewing the claim.",
    });
  }
}
