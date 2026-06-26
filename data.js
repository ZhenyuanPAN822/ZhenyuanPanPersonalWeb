/* data.js - content for Screen 2 (Professional Experience · Experience Console).
   Internship experience is the primary narrative; the Yinhua quant strategy is
   ONE representative work sample, not the identity of the screen.

   Dates / locations are the candidate's real chronology. Strategy KPIs are
   VERIFIED resume-level values for the flagship composite only; the other two
   research threads carry no fabricated metrics. The candlestick is a
   representative visualization, labelled as such. Exposed as window.SITE_DATA. */
window.SITE_DATA = {
  /* ── Yinhua representative-work strategy threads (chart tabs) ─────────────── */
  strategies: [
    {
      id: "dpro",
      name: "DPRO + SUE + Dividend Yield",
      short: "DPRO · SUE · DY",
      tag: "Multi-factor · A-share",
      factors: ["DPRO", "SUE", "Div. Yield"],
      maLabels: ["MA20", "MA60"],
      seed: 11,
      desc:
        "Combines analyst-revision momentum (DPRO), standardized unexpected earnings (SUE), and a dividend-yield tilt to identify A-share companies with improving fundamentals and attractive valuations.",
      verified: true,
      metricsNote: "Long-only · CSI 300 benchmark · backtest 2005-2026.",
      metrics: [
        { v: "20.4%", l: "Annualized return", sub: "CSI 300 · 7.7%", pos: true },
        { v: "4,531%", l: "Cumulative return", sub: "CSI 300 · 371%", pos: true },
        { v: "0.131", l: "Jensen’s α" },
        { v: "1.00", l: "Information ratio" },
      ],
    },
    {
      id: "etf",
      name: "Industry ETF Rotation",
      short: "ETF Rotation",
      tag: "Cross-sector · Monthly",
      factors: ["12-1 Mom.", "Vol. Adj.", "Breadth"],
      maLabels: ["MA20", "MA60"],
      seed: 23,
      desc:
        "Rotates monthly across industry ETFs by risk-adjusted trailing momentum, overweighting sectors with broadening participation and trimming crowded leaders.",
      verified: false,
      metricsNote:
        "Research prototype from the same internship; verified benchmarked metrics are reported for the flagship composite.",
      metrics: null,
    },
    {
      id: "event",
      name: "Event-Driven A-Share Signal",
      short: "Event-Driven",
      tag: "Event study · Daily",
      factors: ["CAR", "Liquidity", "News Flow"],
      maLabels: ["MA10", "MA30"],
      seed: 37,
      desc:
        "Trades short-horizon drift around scheduled corporate events (guidance, buybacks, index inclusions), filtering by liquidity and abnormal-return persistence.",
      verified: false,
      metricsNote: "Exploratory event-study signal, not separately benchmarked.",
      metrics: null,
    },
  ],

  /* ── Five internships, in display order. Yinhua is selected by default. ───── */
  internships: [
    {
      id: "yinhua",
      idx: "01",
      start: "2024-06",
      company: "Yinhua Fund Management Co., Ltd.",
      companyShort: "Yinhua Fund",
      role: "Quantitative Research Intern",
      period: "Jun 2024 - Sept 2024",
      periodShort: "2024",
      location: "Beijing, China",
      team: "Quantitative Investment Department",
      tag: "Quantitative Equity Research",
      firm:
        "Yinhua Fund Management is a large Chinese asset manager with established index, quantitative and active-equity franchises serving institutional and retail investors.",
      roleSummary:
        "Built and tested systematic A-share strategies using factor signals, stock-ranking models, and portfolio backtests.",
      overview: [
        "Independently replicated and backtested 20+ systematic A-share strategies to assess their investment logic, historical performance, and practical viability.",
        "Developed original stock-selection and industry-ETF rotation models, with robustness tested under changing market conditions and realistic trading assumptions.",
        "Published selected strategies to the JoinQuant public community.",
        "Worked end-to-end with market data, signal construction, validation, and portfolio implementation.",
      ],
      keyGroups: [
        { label: "Outputs", items: ["Replication Reports", "Stock Selection", "ETF Rotation"] },
        { label: "Methods", items: ["Signal Engineering", "Event-Driven Design", "Barra Exposure Control"] },
      ],
      outputs: [
        "Multi-factor long-only A-share strategy: DPRO + SUE + Dividend Yield",
        "CSI 300 benchmark · backtest period 2005-2026",
        "Factor, event-driven, and industry-ETF-rotation research threads",
      ],
      tools: ["Python", "JoinQuant", "iFinD", "Wind", "Suntime"],
      evidence: { type: "chart" },
    },
    {
      id: "sinosafe",
      idx: "02",
      start: "2023-07",
      company: "Sinosafe General Insurance Co., Ltd.",
      companyShort: "Sinosafe",
      role: "Equity Research Intern",
      period: "Jul 2023 - Sept 2023",
      periodShort: "2023",
      location: "Shenzhen, China",
      team: "Investment / Equity Research",
      tag: "Fundamental Equity Research",
      firm:
        "Sinosafe General Insurance manages an investment portfolio alongside its underwriting business, with an internal equity-research function supporting allocation decisions.",
      roleSummary:
        "Analyzed Hong Kong-listed companies across consumer, property, financials, and internet sectors, forming and updating investment views through earnings, operating trends, valuation, and industry developments.",
      overview: [
        "Assessed earnings quality and operating momentum by linking financial-statement movements to company-specific drivers, industry conditions, and management disclosures.",
        "Updated investment views as results and policy developments emerged, separating temporary earnings noise from changes that could alter valuation, catalysts, or downside risk.",
      ],
      keyGroups: [
        { label: "Outputs", items: ["Company Review Notes", "Thesis Update Memos", "Sector Comparison Reviews"] },
        { label: "Methods", items: ["Earnings Quality Analysis", "Fundamental Driver Analysis", "Valuation & Thesis Review"] },
      ],
      outputs: [
        "Sector and single-name equity research notes",
        "Post-investment & risk-monitoring report series",
        "Company-monitoring coverage workflow",
      ],
      tools: ["Wind", "iFinD", "Bloomberg", "Excel / VBA", "PowerPoint"],
      evidence: {
        type: "module",
        kicker: "Representative Work",
        title: "HK Equity Coverage & Risk Monitoring",
        intro:
          "Fundamental coverage and post-investment risk monitoring across 80+ Hong Kong-listed names.",
        stats: [
          { v: "80+", l: "HK-listed companies reviewed" },
          { v: "30+", l: "Post-investment / risk reports" },
          { v: "8", l: "Sectors under coverage" },
        ],
        blocks: [
          { label: "Sector coverage", kind: "chips",
            items: ["Financials", "Property", "Industrials", "Tech", "Healthcare", "Consumer", "Energy", "Materials"] },
          { label: "Risk flags monitored", kind: "list",
            items: ["Disclosure-quality & filing flags", "Sentiment / news-flow shifts", "Post-investment covenant & valuation risk"] },
          { label: "Company-monitoring workflow", kind: "flow",
            items: ["Screen & assign coverage", "Fundamental + disclosure read", "Risk & sentiment scan", "Post-investment report"] },
        ],
      },
    },
    {
      id: "sifra",
      idx: "03",
      start: "2025-06",
      company: "Shenzhen International Financial Research Association",
      companyShort: "SZ Int’l Financial Research Assoc.",
      role: "Macro Research",
      period: "Jun 2025 - Sept 2025",
      periodShort: "2025",
      location: "Shenzhen, China",
      team: "Macro & Policy Research",
      tag: "Macro Nowcasting",
      firm:
        "A Shenzhen-based financial research association producing market, industry and policy research for members across the financial sector.",
      roleSummary:
        "Built prototype China GDP and CPI nowcasts using high-frequency macroeconomic indicators.",
      leadPoints: [
        "Constructed and standardized a real-time indicator panel for Chinese activity and price tracking.",
        "Adapted a Cleveland Fed-style nowcasting workflow and tested multiple estimation approaches.",
      ],
      keyGroups: [
        { label: "Outputs", items: ["China CPI Nowcast", "Real-Time Macro Signal Tracker", "Port Throughput"] },
        { label: "Methods", items: ["Tree-Based Ensembles", "Gradient Boosted Trees", "Meta-Model Stacking"] },
      ],
      overview: [
        "Built a GDP / CPI nowcasting workflow from high-frequency macro indicators.",
        "Replicated Cleveland Fed-style nowcasting methodology on domestic data.",
        "Maintained an indicator-release calendar and tracked nowcast revisions over time.",
        "Drafted research sections, charts and exhibits for member distribution.",
      ],
      outputs: [
        "GDP / CPI nowcasting dashboard",
        "Methodology note replicating Cleveland Fed nowcasting",
        "Indicator-release calendar + revision tracker",
      ],
      tools: ["Python", "Stata / EViews", "Wind", "Excel", "LaTeX"],
      evidence: {
        type: "module",
        kicker: "Representative Work",
        title: "Macro Nowcasting Dashboard",
        intro:
          "High-frequency GDP / CPI nowcasting, replicating Cleveland Fed methodology on Chinese data.",
        stats: [
          { v: "GDP·CPI", l: "Nowcast targets" },
          { v: "Weekly", l: "Update cadence" },
          { v: "Cleveland Fed", l: "Methodology basis" },
        ],
        blocks: [
          { label: "High-frequency inputs", kind: "chips",
            items: ["Industrial activity", "Credit & money", "Trade", "Prices / commodities", "Mobility", "Surveys"] },
          { label: "Pipeline", kind: "flow",
            items: ["Ingest HF indicators", "Align & seasonally adjust", "Nowcast GDP / CPI", "Track revisions vs release"] },
          { label: "Deliverables", kind: "list",
            items: ["Indicator-release calendar", "Nowcast-revision time series", "Methodology replication note"] },
        ],
      },
    },
    {
      id: "gaoke",
      idx: "02",
      start: "2025-01",
      company: "Zhuhai Gaoke Venture Capital",
      companyShort: "Zhuhai Gaoke Venture Capital",
      role: "Investment & Risk Control",
      period: "Jan 2025",
      periodShort: "2025",
      location: "Zhuhai, China",
      team: "Risk & Compliance",
      tag: "Risk × Engineering",
      firm:
        "Zhuhai Gaoke Venture Capital invests in early- and growth-stage companies, with a risk and compliance function overseeing portfolio and regulatory exposures.",
      roleSummary:
        "Embedded across the investment and risk-control functions: running venture due diligence and deal screening, and rebuilding the firm's manual risk checks into a structured AI workflow.",
      overview: [
        "Evaluated prospective deals on financials, cap-table structure and legal exposure to judge investment quality.",
        "Turned manual Tianyancha corporate, litigation and cap-table checks into a structured, repeatable AI workflow.",
      ],
      keyGroups: [
        { label: "Outputs", items: ["Due-Diligence Packs", "AI Risk-Check Workflow", "Equity-Repurchase Ops Guide"] },
        { label: "Methods", items: ["Cap-Table & Financial Analysis", "Litigation & Regulatory Screening"] },
      ],
      outputs: [
        "Due-diligence support packs",
        "Compliance review checklists",
        "Equity-repurchase operations guide",
      ],
      tools: ["Tianyancha", "Excel", "Wind", "PowerPoint"],
      evidence: {
        type: "module",
        kicker: "Representative Work",
        title: "Due-Diligence & Compliance Workflow",
        intro:
          "Diligence support, data ingestion and risk/compliance review across the venture investment lifecycle.",
        stats: [
          { v: "Tianyancha", l: "Primary data source" },
          { v: "DD + RC", l: "Workflow scope" },
          { v: "Checklist", l: "Compliance control" },
        ],
        blocks: [
          { label: "Diligence workflow", kind: "flow",
            items: ["Source & screen target", "Tianyancha data ingestion", "Financial + legal review", "Risk / compliance memo"] },
          { label: "Risk & compliance checklist", kind: "list",
            items: ["Corporate & cap-table structure", "Litigation & regulatory exposure", "Equity-repurchase / buyback terms"] },
          { label: "Deliverables", kind: "chips",
            items: ["DD pack", "Relationship map", "Repurchase ops guide", "Risk register"] },
        ],
      },
    },
  ],
};
