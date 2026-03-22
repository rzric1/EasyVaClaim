function normalizeText(value = "") {
  return value
    .toLowerCase()
    .replace(/\bdisfunction\b/g, "dysfunction")
    .replace(/\bhead ache\b/g, "headache")
    .replace(/\bheart palpitations\b/g, "palpitations")
    .replace(/[^\w\s,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text, keywords = []) {
  return keywords.some((keyword) => text.includes(keyword));
}

function applyRules(input) {
  const conditions = normalizeText(input.conditions || "");
  const symptoms = normalizeText(input.symptoms || "");
  const rating = normalizeText(input.currentRating || "");
  const goal = normalizeText(input.goal || "");
  const serviceConnected = normalizeText(input.serviceConnected || "");

  const combined = `${conditions} ${symptoms} ${rating} ${goal}`.trim();

  const ruleInsights = [];
  const possibleSecondaries = [];
  const evidenceFocus = [];
  const classification = [];

  const hasPTSD = hasAny(combined, ["ptsd", "post traumatic stress", "post-traumatic stress"]);
  const hasHeadaches = hasAny(combined, ["headache", "headaches", "migraine", "migraines"]);
  const hasED = hasAny(combined, ["erectile dysfunction", "ed", "sexual dysfunction"]);
  const hasSleepIssues = hasAny(combined, [
    "nightmare",
    "nightmares",
    "sleep",
    "insomnia",
    "poor sleep",
    "sleep disturbance",
  ]);
  const hasNeckPain = hasAny(combined, ["neck pain", "neck"]);
  const hasPalpitations = hasAny(combined, ["palpitations", "heart palpitations", "rapid heart"]);
  const hasWorsening = hasAny(combined, [
    "worsening",
    "worse",
    "increasing",
    "more severe",
    "getting worse",
    "daily",
    "frequent",
  ]);

  const goalIncrease = goal.includes("increase");
  const goalNew = goal.includes("start a new claim");
  const goalSecondary = goal.includes("secondary");

  if (hasWorsening || goalIncrease) {
    classification.push(
      "The intake suggests possible worsening of symptoms, which may support reviewing whether an increase path should be explored."
    );
  }

  if (hasPTSD && (hasHeadaches || hasED || hasSleepIssues || hasPalpitations)) {
    classification.push(
      "The intake also suggests possible secondary-condition pathways connected to an existing PTSD history."
    );
  }

  if (goalNew) {
    classification.push(
      "The stated goal mentions starting a new claim, so the response should acknowledge both new and secondary claim possibilities where appropriate."
    );
  }

  if (goalSecondary) {
    classification.push(
      "The stated goal specifically mentions secondary-condition review."
    );
  }

  if (hasPTSD && hasHeadaches) {
    possibleSecondaries.push(
      "Headaches or migraines may be worth exploring as possible secondary conditions when sleep disruption, stress, or PTSD symptoms are part of the pattern."
    );
    evidenceFocus.push(
      "Evidence describing frequency, severity, duration, and functional impact of headaches could be helpful."
    );
  }

  if (hasPTSD && hasED) {
    possibleSecondaries.push(
      "Erectile dysfunction may be worth exploring as a possible secondary condition to PTSD, including possible links to mental health symptoms or medication side effects."
    );
    evidenceFocus.push(
      "Documentation about when erectile dysfunction began, how often it occurs, and whether medications or mental health symptoms may play a role could be helpful."
    );
  }

  if (hasPTSD && hasSleepIssues) {
    possibleSecondaries.push(
      "Sleep disturbance, nightmares, and insomnia patterns may strengthen the explanation of how PTSD symptoms are affecting daily life and may also overlap with other symptom clusters."
    );
    evidenceFocus.push(
      "Sleep-related treatment notes, medication history, and personal statements about poor sleep and nightmares may help clarify severity."
    );
  }

  if (hasNeckPain) {
    possibleSecondaries.push(
      "Neck pain may need clarification to determine whether it appears to be a separate issue, a headache-related symptom, or part of another physical condition."
    );
  }

  if (hasPalpitations) {
    possibleSecondaries.push(
      "Heart palpitations may warrant additional medical clarification, especially if they appear during anxiety, panic, sleep disturbance, or stress episodes."
    );
    evidenceFocus.push(
      "It could be helpful to gather medical documentation that explains when palpitations happen and whether a provider has linked them to anxiety, panic, medication, or another medical cause."
    );
  }

  if (serviceConnected.includes("yes")) {
    ruleInsights.push(
      "The user indicates an existing service-connected condition, so the response should distinguish between increase pathways and secondary-condition pathways instead of treating everything as a brand-new claim."
    );
  }

  if (hasWorsening) {
    ruleInsights.push(
      "The user is describing worsening symptoms. The response should discuss symptom severity, frequency, and functional impact as possible evidence themes."
    );
  }

  if (hasPTSD && (hasHeadaches || hasED)) {
    ruleInsights.push(
      "The response should not frame this only as an increase claim. It should also acknowledge possible secondary-condition routes related to PTSD."
    );
  }

  if (possibleSecondaries.length === 0) {
    possibleSecondaries.push(
      "No highly specific secondary-condition pattern was identified from the current rules, so the response should stay cautious and general."
    );
  }

  if (evidenceFocus.length === 0) {
    evidenceFocus.push(
      "General medical records, personal statements, and any symptom timeline may help clarify what path makes the most sense."
    );
  }

  return {
    classification,
    ruleInsights,
    possibleSecondaries,
    evidenceFocus,
  };
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
      error: error?.message || "Inline rules test failed",
    });
  }
}
