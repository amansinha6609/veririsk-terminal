"""
Claude Analysis Service
Core AI engine: runs each due diligence module via Claude with built-in web search.
Supports streaming text deltas for SSE delivery.
"""

import json
import logging
import time
from typing import AsyncGenerator, Optional
import anthropic

from models.schemas import AnalysisModule, ModuleResult, RiskLevel, SectionSource
from utils.config import settings

logger = logging.getLogger(__name__)

# ── Module prompts ────────────────────────────────────────────────────────────

MODULE_PROMPTS: dict[AnalysisModule, str] = {
    AnalysisModule.OVERVIEW: """
You are a senior due diligence analyst. Research and write a Company Overview for: **{company}**

Use web search to find CURRENT, ACCURATE data. Cover:
- Founding year, founders/co-founders
- Headquarters and operating geographies
- Core business model and revenue streams
- Key products/services/subsidiaries
- Ownership structure (public/private, major shareholders, PE/VC backing)
- Current employee count (approximate)
- Recent major milestones, pivots, or structural changes

Be factual, specific, and cite data points with years. Flag anything unusual about the corporate structure.
""",

    AnalysisModule.FINANCIAL: """
You are a senior financial risk analyst. Research the Financial Health of: **{company}**

Use web search to find the most current figures. Cover:
- Latest reported revenue and YoY growth/decline
- Profitability (net income/loss, EBITDA if available)
- Funding history: all rounds, lead investors, valuations, total raised
- Cash position, burn rate (if startup/scale-up)
- Debt levels and credit ratings if available
- Any financial restatements, accounting irregularities, or auditor concerns
- Bankruptcy risk signals or covenant breaches
- Recent financial news or investor concerns

Be specific with numbers and dates. Flag any red flags clearly.
""",

    AnalysisModule.LEGAL: """
You are a senior legal risk analyst. Research Legal & Compliance risks for: **{company}**

Use web search. Cover:
- Active lawsuits (plaintiff, nature, amount at stake)
- Past major legal settlements (last 5 years, amounts paid)
- Regulatory investigations or enforcement actions (SEC, FTC, DOJ, FCA, SEBI, CCI, etc.)
- Regulatory fines and penalties (amounts, regulators, dates)
- Antitrust / competition law issues
- Intellectual property disputes
- Criminal charges against the company or executives
- Sanctions or export control violations
- Compliance program maturity signals

Rate the legal risk and list specific cases with dates.
""",

    AnalysisModule.REPUTATION: """
You are a senior reputation risk analyst. Research Reputation & Media risk for: **{company}**

Use web search. Cover:
- Recent news sentiment over the last 12–24 months (positive/negative/neutral)
- Major controversies, scandals, or PR crises
- Customer complaints at scale (product recalls, mass refunds, class actions)
- Social media sentiment signals
- Whistleblower allegations or investigative journalism exposés
- Brand boycott campaigns
- Treatment of employees (Glassdoor themes, mass layoffs, labor disputes)
- Any reputation recovery efforts and their effectiveness

Identify the top 3 reputational red flags if any exist.
""",

    AnalysisModule.LEADERSHIP: """
You are a senior governance risk analyst. Research Leadership Risk for: **{company}**

Use web search. Cover:
- CEO background: experience, past companies, exits, controversies
- C-suite composition and recent executive turnover
- Board of directors: independence, qualifications, conflicts of interest
- Any insider trading investigations or charges
- Founder/CEO misconduct allegations (harassment, fraud, misrepresentation)
- Related-party transactions that raise conflict-of-interest concerns
- Governance structure: dual-class shares, entrenchment mechanisms
- Activist investor pressure or proxy fights

Flag any governance red flags prominently.
""",

    AnalysisModule.CYBER: """
You are a senior cybersecurity risk analyst. Research Cyber & Data Risk for: **{company}**

Use web search. Cover:
- Known data breaches: dates, records exposed, type of data
- Ransomware or cyberattack incidents
- GDPR, CCPA, PDPA, or other data privacy fines and investigations
- FTC or ICO enforcement actions related to data misuse
- Public vulnerability disclosures (CVEs related to their products)
- Bug bounty program presence (positive signal)
- Third-party security audit results if publicly disclosed
- Supply chain cyber risk indicators
- Overall cybersecurity posture signals

Assess the cyber risk level and highlight incidents with dates and scale.
""",

    AnalysisModule.ESG: """
You are a senior ESG risk analyst. Research ESG Factors for: **{company}**

Use web search. Cover:
- Environmental: carbon footprint commitments, violations, fines, greenwashing allegations
- Social: labor practices, child labor/supply chain controversies, diversity & inclusion record, community impact
- Governance: executive pay vs. performance, shareholder rights, ethics hotline, anti-corruption policies
- ESG ratings from major agencies (MSCI, Sustainalytics, ISS) if available
- Involvement in ESG-related controversies or activism targets
- Recent ESG improvements or deterioration signals

Identify the most material ESG risks for this company specifically.
""",

    AnalysisModule.COMPETITIVE: """
You are a senior competitive intelligence analyst. Research the Competitive Position of: **{company}**

Use web search. Cover:
- Current market position and estimated market share
- Primary competitors and competitive dynamics
- Competitive moat / durable advantages (network effects, IP, switching costs, scale)
- Recent market share gains or losses
- Technology differentiation and R&D investment signals
- Customer concentration risk (heavy reliance on few clients)
- Geographic concentration risk
- Disruption threats (new entrants, regulatory shifts, tech changes)
- M&A activity (acquirer or acquisition target signals)

Provide a realistic competitive risk assessment.
""",
}

# ── Risk scoring prompt suffix ─────────────────────────────────────────────

SCORE_SUFFIX = """

---
After your analysis, on a new line output EXACTLY this JSON object and nothing else after it:
{"risk_score": <integer 0-100>, "key_findings": ["finding1", "finding2", "finding3"]}

Where risk_score is 0 (no risk) to 100 (extreme risk). Be calibrated — most companies score 20-60.
key_findings: exactly 3 short bullet-point findings (max 12 words each).
"""


# ── Claude service ─────────────────────────────────────────────────────────

class ClaudeAnalysisService:

    def __init__(self):
        self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def analyze_module_stream(
        self,
        company: str,
        module: AnalysisModule,
    ) -> AsyncGenerator[dict, None]:
        """
        Stream analysis for a single module.
        Yields dicts: {"type": "chunk"|"complete"|"error", ...}
        """
        prompt = MODULE_PROMPTS[module].format(company=company) + SCORE_SUFFIX
        start = time.time()
        full_text = ""
        sources: list[SectionSource] = []

        try:
            async with self.client.messages.stream(
                model="claude-sonnet-4-20250514",
                max_tokens=1500,
                tools=[{"type": "web_search_20250305", "name": "web_search"}],
                messages=[{"role": "user", "content": prompt}],
            ) as stream:
                async for event in stream:
                    # Text streaming
                    if (
                        hasattr(event, "type")
                        and event.type == "content_block_delta"
                        and hasattr(event, "delta")
                        and hasattr(event.delta, "type")
                        and event.delta.type == "text_delta"
                    ):
                        chunk = event.delta.text
                        full_text += chunk
                        # Don't stream the trailing JSON to the frontend
                        visible = _strip_json_suffix(full_text)
                        yield {"type": "chunk", "text": chunk, "visible_text": visible}

                    # Capture web search result URLs
                    elif (
                        hasattr(event, "type")
                        and event.type == "content_block_stop"
                    ):
                        pass  # handled below via final message

                # Extract sources from the final message
                final_msg = await stream.get_final_message()
                for block in final_msg.content:
                    if hasattr(block, "type") and block.type == "tool_result":
                        pass
                    # web_search tool_use blocks carry the query
                    if hasattr(block, "type") and block.type == "tool_use" and block.name == "web_search":
                        query = block.input.get("query", "")
                        sources.append(SectionSource(
                            title=f"Web search: {query}",
                            source_type="web_search"
                        ))

        except anthropic.APIError as e:
            logger.error(f"Claude API error for {module}: {e}")
            yield {"type": "error", "error": str(e)}
            return

        # Parse trailing JSON
        risk_score, key_findings = _parse_score_block(full_text)
        clean_content = _strip_json_suffix(full_text).strip()
        duration_ms = int((time.time() - start) * 1000)

        result = ModuleResult(
            module=module,
            status="complete",
            content=clean_content,
            risk_score=risk_score,
            risk_level=_score_to_level(risk_score),
            key_findings=key_findings,
            sources=sources,
            duration_ms=duration_ms,
        )

        yield {"type": "complete", "result": result}

    async def generate_overall_risk(
        self,
        company: str,
        module_results: dict[str, ModuleResult],
    ) -> dict:
        """
        Generate an overall risk verdict by synthesizing all module scores.
        Returns dict with score, level, summary, critical_flags.
        """
        scores = {k: v.risk_score for k, v in module_results.items() if v.risk_score is not None}
        findings_summary = "\n".join(
            f"- {k.upper()} (score {v.risk_score}/100): {'; '.join(v.key_findings[:2])}"
            for k, v in module_results.items()
            if v.status == "complete"
        )

        avg = int(sum(scores.values()) / len(scores)) if scores else 50

        prompt = f"""
You are a chief risk officer synthesizing a due diligence report on **{company}**.

Module risk scores and key findings:
{findings_summary}

Write a 3-4 sentence executive summary of the overall risk. Then output EXACTLY this JSON on a new line:
{{"overall_score": {avg}, "critical_flags": ["flag1", "flag2"]}}

critical_flags: up to 3 most critical risk flags (max 15 words each). Empty list if no critical flags.
"""
        try:
            msg = await self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=400,
                messages=[{"role": "user", "content": prompt}],
            )
            text = msg.content[0].text
            summary = _strip_json_suffix(text).strip()
            parsed = _parse_json_block(text)
            return {
                "score": avg,
                "level": _score_to_level(avg).value,
                "summary": summary,
                "critical_flags": parsed.get("critical_flags", []),
            }
        except Exception as e:
            logger.error(f"Overall risk synthesis failed: {e}")
            return {
                "score": avg,
                "level": _score_to_level(avg).value,
                "summary": f"Due diligence analysis completed for {company}.",
                "critical_flags": [],
            }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _score_to_level(score: Optional[int]) -> RiskLevel:
    if score is None:
        return RiskLevel.MODERATE
    if score < 30:
        return RiskLevel.LOW
    if score < 55:
        return RiskLevel.MODERATE
    if score < 75:
        return RiskLevel.HIGH
    return RiskLevel.CRITICAL


def _strip_json_suffix(text: str) -> str:
    """Remove the trailing JSON score block from visible content."""
    idx = text.rfind('{"risk_score"')
    if idx == -1:
        idx = text.rfind('\n{"risk_score"')
    return text[:idx].rstrip() if idx != -1 else text


def _parse_score_block(text: str) -> tuple[int, list[str]]:
    """Parse risk_score and key_findings from trailing JSON."""
    try:
        parsed = _parse_json_block(text)
        score = max(0, min(100, int(parsed.get("risk_score", 50))))
        findings = parsed.get("key_findings", [])[:3]
        return score, findings
    except Exception:
        return 50, []


def _parse_json_block(text: str) -> dict:
    """Find and parse the last JSON object in a string."""
    last_brace = text.rfind("{")
    if last_brace == -1:
        return {}
    snippet = text[last_brace:]
    end = snippet.find("}")
    if end == -1:
        return {}
    return json.loads(snippet[:end + 1])
