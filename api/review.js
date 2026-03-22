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

      return res.status(200).json({
        ok: true,
        method: "POST",
        body,
      });
    } catch (error) {
      return res.status(500).json({
        error: error?.message || "Body parsing failed",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}