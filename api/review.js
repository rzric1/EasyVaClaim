import { applyRules } from "./rules";

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, method: "GET" });
  }

  if (req.method === "POST") {
    try {
      let body = req.body || {};

      if (typeof body === "string") {
        body = JSON.parse(body);
      }

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

      return res.status(200).json({
        output: JSON.stringify(rules, null, 2),
      });
    } catch (error) {
      return res.status(500).json({
        error: error?.message || "Rules processing failed",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
