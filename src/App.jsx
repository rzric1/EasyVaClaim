import { useMemo, useState } from "react";

const features = [
  {
    title: "Upload claim documents",
    text: "Review decision letters, DBQs, nexus letters, and medical records in one clean workflow.",
  },
  {
    title: "AI-powered insights",
    text: "Surface conditions, possible secondaries, symptoms, and evidence gaps in plain English.",
  },
  {
    title: "Claim readiness view",
    text: "See how complete your intake is before deciding your next move.",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload",
    text: "Add your documents and claim details for structured review.",
  },
  {
    number: "02",
    title: "Analyze",
    text: "AI reviews findings, possible gaps, and areas that may need support.",
  },
  {
    number: "03",
    title: "Act",
    text: "Use the results and draft tools to prepare stronger next steps.",
  },
];

const tools = [
  {
    title: "Claim Review",
    text: "Review conditions, symptoms, ratings, and goals in one place.",
  },
  {
    title: "Evidence Gap Finder",
    text: "Spot missing support, weak areas, and items that may need more documentation.",
  },
  {
    title: "Draft Builder",
    text: "Generate ready-to-edit nexus, buddy, and personal statement drafts.",
  },
];

const sectionStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "72px 24px",
};

const muted = "#475569";
const border = "#e2e8f0";
const dark = "#0f172a";
const light = "#f8fafc";
const accent = "#111827";
const blue = "#2563eb";

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: `1px solid ${border}`,
  fontSize: "15px",
  color: "#000000",
  backgroundColor: "#ffffff",
  boxSizing: "border-box",
};

function parseAiSections(text) {
  if (!text) return [];

  const normalized = text.replace(/\r/g, "").trim();
  const parts = normalized.split(/\n(?=###\s*\d+\.)/g).filter(Boolean);

  if (parts.length === 0) {
    return [{ title: "AI Claim Review", body: normalized }];
  }

  return parts.map((part) => {
    const lines = part.split("\n").filter(Boolean);
    const heading = lines.shift() || "";
    const title = heading.replace(/^###\s*\d+\.\s*/, "").trim();
    const body = lines.join("\n").trim();
    return { title, body };
  });
}

function renderInlineBold(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} style={{ color: dark }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function renderRichText(text) {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  const elements = [];
  let bullets = [];

  const flushBullets = (keyBase) => {
    if (bullets.length > 0) {
      elements.push(
        <ul
          key={`ul-${keyBase}-${elements.length}`}
          style={{
            margin: "10px 0 0 0",
            paddingLeft: "20px",
            color: muted,
            lineHeight: 1.8,
          }}
        >
          {bullets.map((item, index) => (
            <li key={`${keyBase}-li-${index}`} style={{ marginBottom: "8px" }}>
              {renderInlineBold(item)}
            </li>
          ))}
        </ul>
      );
      bullets = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ")) {
      bullets.push(trimmed.slice(2));
      return;
    }

    flushBullets(index);

    elements.push(
      <p
        key={`p-${index}`}
        style={{
          color: muted,
          lineHeight: 1.85,
          margin: "10px 0 0 0",
          fontSize: "15px",
        }}
      >
        {renderInlineBold(trimmed)}
      </p>
    );
  });

  flushBullets("final");
  return elements;
}

function ResultCard({ title, body, tone = "default" }) {
  const styles = {
    default: {
      background: "#ffffff",
      borderColor: border,
      titleBg: "#f8fafc",
    },
    warning: {
      background: "#fff7ed",
      borderColor: "#fed7aa",
      titleBg: "#ffedd5",
    },
    info: {
      background: "#f8fafc",
      borderColor: "#cbd5e1",
      titleBg: "#eef2ff",
    },
  };

  const style = styles[tone] || styles.default;

  return (
    <div
      style={{
        border: `1px solid ${style.borderColor}`,
        borderRadius: "22px",
        overflow: "hidden",
        backgroundColor: style.background,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: `1px solid ${style.borderColor}`,
          backgroundColor: style.titleBg,
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", color: dark }}>{title}</h3>
      </div>

      <div style={{ padding: "18px" }}>{renderRichText(body)}</div>
    </div>
  );
}

function buildNexusDraft(formData) {
  return `NEXUS LETTER DRAFT
Draft only — must be reviewed, corrected if needed, and signed by the appropriate licensed medical professional.

Provider Information
Name: [Provider Name]
Credentials: [MD / DO / NP / PA / Psychologist]
License Number: [License Number]
Clinic / Practice: [Clinic Name]
Address: [Clinic Address]
Phone: [Clinic Phone]

Veteran Information
Veteran Name: [Veteran Name]
Current Service-Connected Condition: ${formData.currentRating || "[Current service-connected condition]"}
Condition Being Addressed: ${formData.conditions || "[Claimed condition]"}

Medical Opinion
I have reviewed the veteran's available medical history, reported symptoms, and relevant records. Based on my professional review, it is my medical opinion that the veteran's claimed condition(s), including ${formData.conditions || "[claimed condition]"}, are at least as likely as not related to the veteran's military service or to an already service-connected condition, if supported by the full medical record and clinical evaluation.

Reported Symptoms / History
${formData.symptoms || "[Insert symptom history and medical findings here]"}

Rationale
This draft should be updated by the provider with the medical basis for the opinion, including:
- symptom timeline
- treatment history
- examination findings
- relationship between the primary and claimed condition
- medical reasoning supporting causation or aggravation

Signature Block
Provider Signature: ______________________
Printed Name: ___________________________
Date: _________________________________
`;
}

function buildBuddyDraft(formData) {
  return `BUDDY LETTER DRAFT
Draft only — must be reviewed, corrected if needed, and signed by the actual witness.

Buddy / Witness Information
Full Name: [Buddy Full Name]
Relationship to Veteran: [Relationship]
Phone / Email: [Contact Information]

Statement
My name is [Buddy Full Name], and I am the veteran's [relationship]. I have known the veteran since [time period].

During the time I have known the veteran, I have personally observed the following issues:
- ${formData.conditions || "[Condition or symptom observed]"}
- ${formData.symptoms || "[Observed impact on daily life]"}
- [Additional observations]

I have noticed changes in the veteran's daily functioning, behavior, mood, sleep, work, or physical abilities. These observations are based on my personal knowledge and direct experience.

Additional Details
This statement may be updated with examples such as:
- when the witness first noticed symptoms
- how often symptoms occur
- how the symptoms affect work, relationships, sleep, or routine activities

Signature Block
Signature: ______________________
Printed Name: ___________________
Date: __________________________
`;
}

function buildPersonalStatementDraft(formData) {
  return `STATEMENT IN SUPPORT OF CLAIM DRAFT
Draft only — must be reviewed and signed by the veteran before submission.

Veteran Statement
I am submitting this statement in support of my claim. I am currently reporting issues related to ${formData.conditions || "[condition]"}.

Current Service-Connected Status
Service connected: ${formData.serviceConnected || "[yes/no/not sure]"}
Current rating: ${formData.currentRating || "[current rating]"}

My Symptoms
${formData.symptoms || "[Describe symptoms, onset, worsening, frequency, and impact]"}

How This Affects My Life
These symptoms affect my daily life in areas such as:
- work and concentration
- sleep and rest
- relationships and family life
- physical activity and routine tasks

My Current Goal
${formData.goal || "[goal]"}

I certify that this statement is true to the best of my knowledge.

Signature Block
Veteran Signature: ______________________
Date: _________________________________
`;
}

function InfoStat({ label, value }) {
  return (
    <div
      style={{
        border: `1px solid ${border}`,
        borderRadius: "18px",
        padding: "18px",
        backgroundColor: "#ffffff",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <p style={{ margin: 0, fontSize: "13px", color: muted, fontWeight: 700 }}>
        {label}
      </p>
      <h3 style={{ margin: "8px 0 0 0", fontSize: "22px", color: dark }}>
        {value}
      </h3>
    </div>
  );
}

export default function App() {
  const [formData, setFormData] = useState({
    serviceConnected: "",
    currentRating: "",
    conditions: "",
    symptoms: "",
    goal: "",
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draftType, setDraftType] = useState("");
  const [draftText, setDraftText] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setUploadedFile(file);
  }

  function generateDraft(type) {
    setDraftType(type);

    if (type === "nexus") {
      setDraftText(buildNexusDraft(formData));
    } else if (type === "buddy") {
      setDraftText(buildBuddyDraft(formData));
    } else if (type === "statement") {
      setDraftText(buildPersonalStatementDraft(formData));
    }
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draftText);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(false);
    setAiResult("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          uploadedFileName: uploadedFile ? uploadedFile.name : "",
        }),
      });

      const raw = await response.text();

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(raw || "Server returned a non-JSON response.");
      }

      if (!response.ok) {
        throw new Error(data.error || data.details || "Request failed");
      }

      setAiResult(data.output || "No result returned.");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const aiSections = useMemo(() => parseAiSections(aiResult), [aiResult]);

  const completionScore = useMemo(() => {
    let score = 0;
    if (formData.serviceConnected) score += 20;
    if (formData.currentRating) score += 20;
    if (formData.conditions) score += 20;
    if (formData.symptoms) score += 20;
    if (formData.goal) score += 20;
    return score;
  }, [formData]);

  return (
    <div
      style={{
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        color: dark,
        backgroundColor: "#ffffff",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          borderBottom: `1px solid ${border}`,
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: muted,
              fontWeight: 800,
            }}
          >
            Tactical Claims AI
          </div>

          <nav
            style={{
              display: "flex",
              gap: "24px",
              fontSize: "14px",
              color: muted,
              flexWrap: "wrap",
            }}
          >
            <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>
              Features
            </a>
            <a href="#tools" style={{ color: "inherit", textDecoration: "none" }}>
              Tools
            </a>
            <a href="#how" style={{ color: "inherit", textDecoration: "none" }}>
              How it works
            </a>
            <a href="#review" style={{ color: "inherit", textDecoration: "none" }}>
              Start Review
            </a>
            <a href="#join" style={{ color: "inherit", textDecoration: "none" }}>
              Join
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section style={sectionStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "32px",
              alignItems: "center",
            }}
          >
            <div style={{ maxWidth: "760px" }}>
              <p style={{ color: muted, fontSize: "14px", fontWeight: 700, margin: 0 }}>
                Veteran Claim Intelligence Platform
              </p>

              <h1
                style={{
                  fontSize: "56px",
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  margin: "18px 0 20px",
                  color: dark,
                }}
              >
                Build a stronger VA claim with more clarity
              </h1>

              <p
                style={{
                  fontSize: "20px",
                  lineHeight: 1.7,
                  color: muted,
                  maxWidth: "720px",
                  margin: 0,
                }}
              >
                Tactical Claims AI helps veterans review documents, identify evidence gaps,
                organize symptoms, and generate clearer next-step guidance before filing or
                pursuing an increase.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  marginTop: "32px",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="#review"
                  style={{
                    backgroundColor: accent,
                    color: "#ffffff",
                    padding: "14px 22px",
                    borderRadius: "14px",
                    textDecoration: "none",
                    fontWeight: 600,
                    boxShadow: "0 10px 24px rgba(17, 24, 39, 0.18)",
                  }}
                >
                  Start Claim Review
                </a>

                <a
                  href="#how"
                  style={{
                    border: `1px solid ${border}`,
                    color: dark,
                    padding: "14px 22px",
                    borderRadius: "14px",
                    textDecoration: "none",
                    fontWeight: 600,
                    backgroundColor: "#ffffff",
                  }}
                >
                  See how it works
                </a>
              </div>

              <div
                style={{
                  marginTop: "22px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${border}`,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
                }}
              >
                <span style={{ color: muted, fontSize: "14px", fontWeight: 600 }}>
                  Claim Readiness
                </span>
                <span style={{ color: dark, fontSize: "16px", fontWeight: 800 }}>
                  {completionScore}%
                </span>
              </div>

              <p style={{ marginTop: "16px", fontSize: "13px", color: muted }}>
                Educational use only. Not legal or medical advice.
              </p>
            </div>

            <div
              style={{
                border: `1px solid ${border}`,
                borderRadius: "24px",
                padding: "24px",
                backgroundColor: "#ffffff",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
              }}
            >
              <p style={{ color: muted, fontSize: "14px", fontWeight: 700, margin: 0 }}>
                Platform Snapshot
              </p>

              <h3 style={{ fontSize: "30px", margin: "10px 0 18px", color: dark }}>
                Claim Intelligence View
              </h3>

              <div style={{ display: "grid", gap: "14px" }}>
                <InfoStat label="Readiness Score" value={`${completionScore}%`} />
                <InfoStat
                  label="Uploaded File"
                  value={uploadedFile ? uploadedFile.name : "No file selected"}
                />
                <InfoStat
                  label="Current Goal"
                  value={formData.goal || "No goal selected"}
                />
              </div>

              <div
                style={{
                  marginTop: "18px",
                  border: `1px solid ${border}`,
                  borderRadius: "18px",
                  padding: "18px",
                  backgroundColor: "#f8fafc",
                }}
              >
                <p style={{ margin: 0, fontSize: "13px", color: muted, fontWeight: 700 }}>
                  What this helps you do
                </p>

                <ul
                  style={{
                    margin: "12px 0 0 0",
                    paddingLeft: "20px",
                    color: muted,
                    lineHeight: 1.8,
                  }}
                >
                  <li>Review symptoms and claimed conditions in one place</li>
                  <li>See how complete your intake is before moving forward</li>
                  <li>Generate draft support letters after review</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          style={{ ...sectionStyle, borderTop: `1px solid ${border}` }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "28px",
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                style={{
                  padding: "24px",
                  border: `1px solid ${border}`,
                  borderRadius: "22px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
                }}
              >
                <h2 style={{ fontSize: "22px", marginBottom: "12px", color: dark }}>
                  {feature.title}
                </h2>
                <p style={{ color: muted, lineHeight: 1.8, margin: 0 }}>
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="tools"
          style={{ ...sectionStyle, borderTop: `1px solid ${border}` }}
        >
          <div style={{ maxWidth: "640px", marginBottom: "28px" }}>
            <p style={{ color: muted, fontSize: "14px", fontWeight: 700, margin: 0 }}>
              Tools
            </p>
            <h2 style={{ fontSize: "38px", margin: "14px 0 0", color: dark }}>
              Built like a platform, not just a form
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "22px",
            }}
          >
            {tools.map((tool) => (
              <div
                key={tool.title}
                style={{
                  border: `1px solid ${border}`,
                  borderRadius: "24px",
                  padding: "28px",
                  backgroundColor: "#ffffff",
                }}
              >
                <h3 style={{ fontSize: "24px", margin: "0 0 10px", color: dark }}>
                  {tool.title}
                </h3>
                <p style={{ color: muted, lineHeight: 1.8, margin: 0 }}>
                  {tool.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="how"
          style={{ ...sectionStyle, borderTop: `1px solid ${border}` }}
        >
          <div style={{ maxWidth: "640px", marginBottom: "28px" }}>
            <p style={{ color: muted, fontSize: "14px", fontWeight: 700, margin: 0 }}>
              How it works
            </p>
            <h2 style={{ fontSize: "38px", margin: "14px 0 0", color: dark }}>
              Simple by design
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "22px",
            }}
          >
            {steps.map((step) => (
              <div
                key={step.number}
                style={{
                  border: `1px solid ${border}`,
                  borderRadius: "24px",
                  padding: "28px",
                  backgroundColor: "#ffffff",
                }}
              >
                <div style={{ color: "#64748b", fontSize: "13px", fontWeight: 800 }}>
                  {step.number}
                </div>
                <h3 style={{ fontSize: "24px", margin: "14px 0 10px", color: dark }}>
                  {step.title}
                </h3>
                <p style={{ color: muted, lineHeight: 1.8, margin: 0 }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="review"
          style={{ ...sectionStyle, borderTop: `1px solid ${border}` }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "32px",
              alignItems: "start",
            }}
          >
            <div>
              <p style={{ color: muted, fontSize: "14px", fontWeight: 700, margin: 0 }}>
                Start Claim Review
              </p>
              <h2 style={{ fontSize: "38px", margin: "14px 0 16px", color: dark }}>
                Enter your information to begin
              </h2>
              <p style={{ color: muted, lineHeight: 1.8, fontSize: "17px" }}>
                Enter your current ratings, symptoms, and goals to receive a
                structured educational review with clearer next steps.
              </p>
            </div>

            <div
              style={{
                border: `1px solid ${border}`,
                borderRadius: "24px",
                padding: "28px",
                backgroundColor: light,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
              }}
            >
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                      Upload Documents
                    </label>

                    <label
                      htmlFor="record-upload"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: blue,
                        color: "#ffffff",
                        padding: "14px 20px",
                        borderRadius: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "none",
                        boxShadow: "0 10px 24px rgba(37, 99, 235, 0.25)",
                      }}
                    >
                      Upload VA or Medical Records
                    </label>

                    <input
                      id="record-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />

                    <p
                      style={{
                        marginTop: "10px",
                        marginBottom: 0,
                        color: muted,
                        fontSize: "13px",
                        lineHeight: 1.6,
                      }}
                    >
                      Accepted files: PDF, decision letters, DBQs, nexus letters, and
                      medical records.
                    </p>

                    {uploadedFile && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "12px 14px",
                          borderRadius: "12px",
                          backgroundColor: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          color: "#1e3a8a",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        Selected file: {uploadedFile.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                      Is your condition already service connected?
                    </label>
                    <select
                      name="serviceConnected"
                      value={formData.serviceConnected}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="">Select an option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="not-sure">Not Sure</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                      Current VA rating
                    </label>
                    <input
                      type="text"
                      name="currentRating"
                      value={formData.currentRating}
                      onChange={handleChange}
                      placeholder="Example: 70% PTSD"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                      Conditions you want reviewed
                    </label>
                    <input
                      type="text"
                      name="conditions"
                      value={formData.conditions}
                      onChange={handleChange}
                      placeholder="Example: PTSD, migraines, back pain"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                      Symptoms or worsening issues
                    </label>
                    <textarea
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleChange}
                      placeholder="Describe your symptoms or what has worsened"
                      rows="4"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
                      Your goal
                    </label>
                    <select
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="">Select a goal</option>
                      <option value="start-claim">Start a new claim</option>
                      <option value="increase-rating">Increase my rating</option>
                      <option value="secondary-conditions">Find secondary conditions</option>
                      <option value="review-documents">Review documents</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: accent,
                      color: "#ffffff",
                      padding: "14px 22px",
                      borderRadius: "14px",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer",
                      marginTop: "8px",
                    }}
                  >
                    Review My Claim
                  </button>
                </div>
              </form>
            </div>
          </div>

          {loading && (
            <div
              style={{
                marginTop: "28px",
                border: `1px solid ${border}`,
                borderRadius: "24px",
                padding: "24px",
                backgroundColor: "#ffffff",
              }}
            >
              <p style={{ margin: 0, color: muted, fontWeight: 600 }}>
                Reviewing your claim...
              </p>
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: "28px",
                border: "1px solid #fecaca",
                borderRadius: "24px",
                padding: "24px",
                backgroundColor: "#fef2f2",
                color: "#991b1b",
              }}
            >
              {error}
            </div>
          )}

          {submitted && aiResult && (
            <div style={{ marginTop: "32px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <p style={{ color: muted, fontSize: "14px", fontWeight: 700, margin: 0 }}>
                    AI Claim Review
                  </p>
                  <h3 style={{ margin: "8px 0 0 0", fontSize: "30px", color: dark }}>
                    Your structured review is ready
                  </h3>
                </div>

                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "999px",
                    backgroundColor: "#eef2ff",
                    color: "#3730a3",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                >
                  Educational Guidance
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                  marginBottom: "22px",
                }}
              >
                <InfoStat label="Readiness Score" value={`${completionScore}%`} />
                <InfoStat
                  label="Uploaded File"
                  value={uploadedFile ? uploadedFile.name : "No file selected"}
                />
                <InfoStat
                  label="Claim Goal"
                  value={formData.goal || "Not selected"}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "18px",
                }}
              >
                {aiSections.map((section, index) => {
                  const lower = section.title.toLowerCase();
                  let tone = "default";
                  if (lower.includes("disclaimer")) tone = "warning";
                  if (lower.includes("starting point")) tone = "info";

                  return (
                    <ResultCard
                      key={`${section.title}-${index}`}
                      title={section.title}
                      body={section.body}
                      tone={tone}
                    />
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: "28px",
                  border: `1px solid ${border}`,
                  borderRadius: "24px",
                  padding: "24px",
                  backgroundColor: "#ffffff",
                }}
              >
                <p style={{ color: muted, fontSize: "14px", fontWeight: 700, marginTop: 0 }}>
                  Draft Support Letters
                </p>
                <h3 style={{ margin: "8px 0 14px 0", fontSize: "28px", color: dark }}>
                  Support Draft Builder
                </h3>
                <p style={{ color: muted, lineHeight: 1.8, fontSize: "15px", marginTop: 0 }}>
                  These are educational draft templates only. They must be reviewed,
                  corrected if needed, and signed by the appropriate medical
                  professional, witness, or veteran before use.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => generateDraft("nexus")}
                    style={{
                      backgroundColor: blue,
                      color: "#ffffff",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Generate Nexus Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => generateDraft("buddy")}
                    style={{
                      backgroundColor: "#0f766e",
                      color: "#ffffff",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Generate Buddy Letter Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => generateDraft("statement")}
                    style={{
                      backgroundColor: "#7c3aed",
                      color: "#ffffff",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Generate Personal Statement Draft
                  </button>
                </div>

                {draftText && (
                  <div
                    style={{
                      marginTop: "20px",
                      border: `1px solid ${border}`,
                      borderRadius: "18px",
                      backgroundColor: light,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "14px 16px",
                        borderBottom: `1px solid ${border}`,
                        backgroundColor: "#ffffff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <strong style={{ color: dark }}>
                        {draftType === "nexus"
                          ? "Nexus Letter Draft"
                          : draftType === "buddy"
                          ? "Buddy Letter Draft"
                          : "Statement in Support Draft"}
                      </strong>

                      <button
                        type="button"
                        onClick={copyDraft}
                        style={{
                          backgroundColor: accent,
                          color: "#ffffff",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "none",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Copy Draft
                      </button>
                    </div>

                    <pre
                      style={{
                        margin: 0,
                        padding: "18px",
                        whiteSpace: "pre-wrap",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: "14px",
                        lineHeight: 1.7,
                        color: dark,
                      }}
                    >
                      {draftText}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section
          style={{ ...sectionStyle, borderTop: `1px solid ${border}` }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
            }}
          >
            <div>
              <p style={{ color: muted, fontSize: "14px", fontWeight: 700, margin: 0 }}>
                What it helps with
              </p>
              <h2 style={{ fontSize: "38px", margin: "14px 0 0", color: dark }}>
                Clearer insights before your next move
              </h2>
            </div>

            <div style={{ color: muted, lineHeight: 1.9, fontSize: "17px" }}>
              <p>Identify possible conditions and secondaries found in your documents.</p>
              <p>Spot missing evidence that may need more support or clarification.</p>
              <p>Turn complex claim language into a more understandable format.</p>
            </div>
          </div>
        </section>

        <section
          id="join"
          style={{ ...sectionStyle, borderTop: `1px solid ${border}` }}
        >
          <div style={{ maxWidth: "720px" }}>
            <p style={{ color: muted, fontSize: "14px", fontWeight: 700, margin: 0 }}>
              Join
            </p>
            <h2 style={{ fontSize: "38px", margin: "14px 0 0", color: dark }}>
              Get updates as the platform is built
            </h2>
            <p
              style={{
                color: muted,
                lineHeight: 1.8,
                fontSize: "18px",
                marginTop: "16px",
              }}
            >
              Follow the progress and be among the first to try the platform when it
              is ready.
            </p>

            <form
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "28px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  flex: "1 1 280px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${border}`,
                  fontSize: "15px",
                  color: "#000000",
                  backgroundColor: "#ffffff",
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: accent,
                  color: "#ffffff",
                  padding: "14px 22px",
                  borderRadius: "14px",
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Notify me
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
