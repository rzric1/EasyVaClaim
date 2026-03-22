export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, method: "GET" });
  }

  if (req.method === "POST") {
    return res.status(200).json({
      ok: true,
      method: "POST",
      note: "Minimal POST route is working",
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}