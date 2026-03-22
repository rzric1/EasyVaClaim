import { useState } from "react";

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
    title: "Simple dashboards",
    text: "Use clean Power BI visuals to organize trends, patterns, and claim preparation insights.",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload",
    text: "Add your documents for structured review.",
  },
  {
    number: "02",
    title: "Analyze",
    text: "AI reviews key findings and possible gaps.",
  },
  {
    number: "03",
    title: "Understand",
    text: "Get a clearer view of what may need attention next.",
  },
];

const sectionStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "72px 24px",
};

const muted = "#374151";
const border = "#e5e7eb";
const dark = "#000000";
const light = "#f9fafb";

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

export default function App() {
  const [formData, setFormData] = useState({
    serviceConnected: "",
    currentRating: "",
    conditions: "",
    symptoms: "",
    goal: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        body: JSON.stringify(formData),
      });

      const raw = await response.text();

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(raw || "Server returned a non-JSON response.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
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
          backgroundColor: "#ffffff",
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
              fontWeight: 700,
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
          <div style={{ maxWidth: "760px" }}>
            <p
              style={{
                color: muted,
                fontSize: "14px",
                fontWeight: 700,
                margin: 0,
              }}
            >
              Veteran Claim Intelligence Platform
            </p>

            <h1
              style={{
                fontSize: "56px",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                margin: "18px 0 20px",
                color: "#000000",
              }}
            >
              Understand your VA disability claim with more clarity
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
              Tactical Claims AI is being built to help veterans review documents,
              identify gaps, and better understand possible next steps before filing
              or pursuing an increase.
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
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  padding: "14px 22px",
                  borderRadius: "14px",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Start Claim Review
              </a>

              <a
                href="#how"
                style={{
                  border: `1px solid ${border}`,
                  color: "#000000",
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

            <p
              style={{
                marginTop: "16px",
                fontSize: "13px",
                color: muted,
              }}
            >
              Educational use only. Not legal or medical advice.
            </p>
          </div>
        </section>

        <section
          id="features"
          style={{
            ...sectionStyle,
            borderTop: `1px solid ${border}`,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "28px",
            }}
          >
            {features.map((feature) => (
              <div key={feature.title}>
                <h2
                  style={{
                    fontSize: "22px",
                    marginBottom: "12px",
                    color: "#000000",
                  }}
                >
                  {feature.title}
                </h2>
                <p
                  style={{
                    color: muted,
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="how"
          style={{
            ...sectionStyle,
            borderTop: `1px solid ${border}`,
          }}
        >
          <div style={{ maxWidth: "640px", marginBottom: "28px" }}>
            <p
              style={{
                color: muted,
                fontSize: "14px",
                fontWeight: 700,
                margin: 0,
              }}
            >
              How it works
            </p>
            <h2
              style={{
                fontSize: "38px",
                margin: "14px 0 0",
                color: "#000000",
              }}
            >
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
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {step.number}
                </div>
                <h3
                  style={{
                    fontSize: "24px",
                    margin: "14px 0 10px",
                    color: "#000000",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    color: muted,
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="review"
          style={{
            ...sectionStyle,
            borderTop: `1px solid ${border}`,
          }}
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
              <p
                style={{
                  color: muted,
                  fontSize: "14px",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Start Claim Review
              </p>
              <h2
                style={{
                  fontSize: "38px",
                  margin: "14px 0 16px",
                  color: "#000000",
                }}
              >
                Enter your information to begin
              </h2>
              <p
                style={{
                  color: muted,
                  lineHeight: 1.8,
                  fontSize: "17px",
                }}
              >
                This intake section is the foundation for your future AI-powered
                review flow. Veterans can enter current ratings, symptoms, and goals
                to begin organizing next steps.
              </p>
            </div>

            <div
              style={{
                border: `1px solid ${border}`,
                borderRadius: "24px",
                padding: "28px",
                backgroundColor: light,
              }}
            >
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gap: "16px" }}>
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
                      backgroundColor: "#000000",
                      color: "#ffffff",
                      padding: "14px 22px",
                      borderRadius: "14px",
                      border: "none",
                      fontWeight: 600,
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
                padding: "28px",
                backgroundColor: "#ffffff",
              }}
            >
              <p style={{ margin: 0, color: muted }}>Reviewing your claim...</p>
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: "28px",
                border: "1px solid #fecaca",
                borderRadius: "24px",
                padding: "28px",
                backgroundColor: "#fef2f2",
                color: "#991b1b",
              }}
            >
              {error}
            </div>
          )}

          {submitted && aiResult && (
            <div
              style={{
                marginTop: "28px",
                border: `1px solid ${border}`,
                borderRadius: "24px",
                padding: "28px",
                backgroundColor: "#ffffff",
              }}
            >
              <p style={{ color: muted, fontSize: "14px", fontWeight: 700, marginTop: 0 }}>
                AI Claim Review
              </p>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  color: muted,
                  lineHeight: 1.8,
                  fontSize: "16px",
                }}
              >
                {aiResult}
              </div>
            </div>
          )}
        </section>

        <section
          style={{
            ...sectionStyle,
            borderTop: `1px solid ${border}`,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
            }}
          >
            <div>
              <p
                style={{
                  color: muted,
                  fontSize: "14px",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                What it helps with
              </p>
              <h2
                style={{
                  fontSize: "38px",
                  margin: "14px 0 0",
                  color: "#000000",
                }}
              >
                Clearer insights before your next move
              </h2>
            </div>

            <div
              style={{
                color: muted,
                lineHeight: 1.9,
                fontSize: "17px",
              }}
            >
              <p>Identify possible conditions and secondaries found in your documents.</p>
              <p>Spot missing evidence that may need more support or clarification.</p>
              <p>Turn complex claim language into a more understandable format.</p>
            </div>
          </div>
        </section>

        <section
          id="join"
          style={{
            ...sectionStyle,
            borderTop: `1px solid ${border}`,
          }}
        >
          <div style={{ maxWidth: "720px" }}>
            <p
              style={{
                color: muted,
                fontSize: "14px",
                fontWeight: 700,
                margin: 0,
              }}
            >
              Join
            </p>
            <h2
              style={{
                fontSize: "38px",
                margin: "14px 0 0",
                color: "#000000",
              }}
            >
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
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  padding: "14px 22px",
                  borderRadius: "14px",
                  border: "none",
                  fontWeight: 600,
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
