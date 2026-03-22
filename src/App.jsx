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

