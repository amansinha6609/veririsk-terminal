/**
 * DueDiligenceAI — Frontend SSE Client
 * Drop this into your existing frontend to connect to the FastAPI backend.
 *
 * Usage:
 *   const dd = new DueDiligenceClient("https://your-api.com");
 *   await dd.analyze("Adani Group", ["overview","financial","legal"], {
 *     onModuleStart:    (module) => ...,
 *     onChunk:          (module, text) => ...,
 *     onModuleComplete: (module, result) => ...,
 *     onReportComplete: (report) => ...,
 *     onError:          (err) => ...,
 *   });
 */

export class DueDiligenceClient {
  constructor(baseUrl = "http://localhost:8000") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Run a due diligence analysis with SSE streaming.
   *
   * @param {string} companyName
   * @param {string[]} modules  — e.g. ["overview","financial","legal"]
   * @param {object}  callbacks — { onModuleStart, onChunk, onModuleComplete, onReportComplete, onError }
   * @param {string}  clientRef — optional client reference ID
   * @returns {Promise<object>}  final report object
   */
  async analyze(companyName, modules = null, callbacks = {}, clientRef = null) {
    const allModules = [
      "overview","financial","legal","reputation",
      "leadership","cyber","esg","competitive"
    ];

    const body = {
      company_name: companyName,
      modules: modules ?? allModules,
      ...(clientRef && { client_ref: clientRef }),
    };

    const response = await fetch(`${this.baseUrl}/api/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      callbacks.onError?.({ message: `HTTP ${response.status}: ${err}` });
      throw new Error(`API error ${response.status}`);
    }

    // Capture report ID from header (available immediately)
    const reportId = response.headers.get("X-Report-ID");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalReport = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // hold incomplete line

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") break;

        let parsed;
        try { parsed = JSON.parse(raw); } catch { continue; }

        const { event, data } = parsed;

        switch (event) {
          case "module_start":
            callbacks.onModuleStart?.(data.module, data);
            break;

          case "module_chunk":
            // data.visible_text = full text so far (trailing JSON stripped)
            // data.text = the delta chunk
            callbacks.onChunk?.(data.module, data.visible_text ?? data.text, data);
            break;

          case "module_complete":
            callbacks.onModuleComplete?.(data.module, data);
            break;

          case "module_error":
            callbacks.onError?.({ module: data.module, message: data.error });
            break;

          case "report_complete":
            finalReport = data.report;
            callbacks.onReportComplete?.(data);
            break;

          case "error":
            callbacks.onError?.(data);
            break;
        }
      }
    }

    return finalReport;
  }

  /** Fetch a previously saved report by ID */
  async getReport(reportId) {
    const r = await fetch(`${this.baseUrl}/api/v1/reports/${reportId}`);
    if (!r.ok) throw new Error(`Report not found: ${reportId}`);
    return r.json();
  }

  /** List all saved reports */
  async listReports(companyFilter = null, limit = 50) {
    const params = new URLSearchParams({ limit });
    if (companyFilter) params.set("company", companyFilter);
    const r = await fetch(`${this.baseUrl}/api/v1/reports?${params}`);
    return r.json();
  }

  /** Delete a report */
  async deleteReport(reportId) {
    const r = await fetch(`${this.baseUrl}/api/v1/reports/${reportId}`, { method: "DELETE" });
    return r.json();
  }
}


// ── Example usage ─────────────────────────────────────────────────────────────

/*
const client = new DueDiligenceClient("http://localhost:8000");

await client.analyze(
  "Byju's",
  ["overview", "financial", "legal", "reputation"],
  {
    onModuleStart: (module) => {
      console.log(`Starting: ${module}`);
      showSpinner(module);
    },
    onChunk: (module, visibleText) => {
      // Update your UI with streaming text
      document.getElementById(`section-${module}`).textContent = visibleText;
    },
    onModuleComplete: (module, result) => {
      console.log(`${module} done — risk: ${result.risk_score}/100 (${result.risk_level})`);
      showRiskBadge(module, result.risk_score, result.risk_level);
    },
    onReportComplete: (report) => {
      console.log("Overall risk:", report.overall_risk);
      showFinalReport(report);
    },
    onError: (err) => {
      console.error("Analysis error:", err);
    },
  }
);
*/
