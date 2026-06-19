MOCK_MODULE_RESPONSES = {
    "solvency": """
        Cash & equivalents stand at $42.3B against total debt of $28.1B,
        yielding a net cash position of $14.2B. Current ratio of 1.87
        indicates comfortable short-term liquidity. No going concern flags
        from auditors. Debt maturity profile is well-laddered through 2028.
        Interest coverage ratio of 8.4x provides strong buffer.
        SOLVENCY_SCORE: 22
    """,
    "earnings_quality": """
        Revenue recognition follows accrual basis consistently across periods.
        Operating margins compressed 2.1pp YoY due to input cost inflation.
        Accounts receivable days increased from 38 to 47 — warrants monitoring.
        Free cash flow conversion at 91% of net income signals high earnings quality.
        No restatements in prior 5 years.
        EARNINGS_QUALITY_SCORE: 31
    """,
    "governance": """
        Board composition: 8 independent directors of 11 total (73%).
        Audit committee meets quarterly with Big 4 auditor sign-off.
        CEO tenure 6 years with no insider selling in past 12 months.
        Dual-class share structure present — minor governance discount applied.
        No related-party transaction flags.
        GOVERNANCE_SCORE: 28
    """,
    "legal_regulatory": """
        One active SEC inquiry regarding revenue timing (2022) — currently
        in document production phase, no charges filed. EU antitrust fine
        of €340M settled in 2023, fully provisioned. No active criminal
        investigations. Patent litigation with competitor — low financial exposure.
        LEGAL_REGULATORY_SCORE: 45
    """,
    "market_position": """
        Market share stable at 23% in core segment over trailing 8 quarters.
        Top 3 customers represent 31% of revenue — moderate concentration risk.
        Switching costs are high (enterprise SaaS contracts avg 3 years).
        New entrant pressure from 2 well-funded startups in adjacent segment.
        MARKET_POSITION_SCORE: 38
    """
}

MOCK_FINAL_JSON = {
    "final_score": 33,
    "risk_level": "MODERATE",
    "debt_to_equity": 0.67,
    "current_ratio": 1.87,
    "altman_z_score": 3.42,
    "interest_coverage": 8.4,
    "key_findings": [
        "Net cash positive with $14.2B surplus over total debt",
        "SEC inquiry active but no charges filed — monitor closely",
        "Receivables days expanding — early earnings quality signal"
    ],
    "verdict": "Financially resilient with strong liquidity, tempered by an active regulatory inquiry and modest customer concentration risk."
}
