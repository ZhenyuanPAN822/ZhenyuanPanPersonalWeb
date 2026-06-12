/* data.js — content for Screen 2. All performance figures are illustrative /
   simulated and intended to be edited. Exposed as window.SITE_DATA. */
window.SITE_DATA = {
  strategies: [
    {
      id: "dpro",
      name: "DPRO + SUE + Dividend Yield",
      tag: "Multi-factor · A-share",
      factors: ["DPRO", "SUE", "Div. Yield", "Quality"],
      thesis:
        "Combine analyst-revision momentum (DPRO) with standardized earnings surprise (SUE) and a dividend-yield value tilt to select quality A-share names with improving fundamentals.",
      buy: "Top-quintile composite z-score, positive SUE, yield above sector median.",
      sell: "Composite drops below median, or SUE turns negative for two reports.",
      perf: { cagr: "+14.6%", sharpe: "1.32", win: "57%", mdd: "−11.8%" },
      maLabels: ["MA20", "MA60"],
      seed: 11,
    },
    {
      id: "etf",
      name: "Industry ETF Rotation",
      tag: "Cross-sector · Monthly",
      factors: ["12-1 Mom.", "Vol. Adj.", "Breadth"],
      thesis:
        "Rotate monthly across industry ETFs by risk-adjusted trailing momentum, overweighting sectors with broadening participation and trimming crowded leaders.",
      buy: "Hold top 3 sectors by 12-1 momentum, scaled inverse to realized vol.",
      sell: "Exit on rank fall below 5 or a trend break beneath MA60.",
      perf: { cagr: "+11.2%", sharpe: "1.08", win: "61%", mdd: "−9.4%" },
      maLabels: ["MA20", "MA60"],
      seed: 23,
    },
    {
      id: "event",
      name: "Event-Driven A-Share Signal",
      tag: "Event study · Daily",
      factors: ["CAR", "Liquidity", "News Flow"],
      thesis:
        "Trade short-horizon drift around scheduled corporate events — guidance, buybacks, index inclusions — filtering by liquidity and abnormal-return persistence.",
      buy: "Significant positive CAR in the [-1,+1] window with rising turnover.",
      sell: "Drift decays to noise by t+7, or liquidity contracts sharply.",
      perf: { cagr: "+9.8%", sharpe: "0.97", win: "54%", mdd: "−8.1%" },
      maLabels: ["MA10", "MA30"],
      seed: 37,
    },
    {
      id: "surprise",
      name: "Earnings Surprise Momentum",
      tag: "PEAD · Quarterly",
      factors: ["SUE", "Estimate Rev.", "Drift"],
      thesis:
        "Capture post-earnings-announcement drift: go long the highest standardized-unexpected-earnings decile and ride the estimate-revision tailwind into the next quarter.",
      buy: "Top SUE decile with upward analyst revisions post-print.",
      sell: "Unwind into the following announcement or on revision rollover.",
      perf: { cagr: "+13.1%", sharpe: "1.19", win: "58%", mdd: "−10.6%" },
      maLabels: ["MA20", "MA60"],
      seed: 53,
    },
  ],

  internships: [
    {
      id: "yinhua",
      company: "Yinhua Fund Management",
      role: "Quantitative Analyst Intern",
      period: "2024",
      location: "Shenzhen, CN",
      team: "Quant Equity / Index & Factor",
      sector: "Asset Management",
      quant: true,
      firm:
        "Yinhua Fund Management is a large Chinese asset manager with established index, quantitative and active equity franchises serving institutional and retail investors.",
      roleSummary:
        "Embedded with the quantitative equity team supporting factor research, signal construction and backtesting of systematic A-share strategies.",
      did: [
        "Built and cleaned factor datasets (valuation, quality, momentum, earnings-revision) for the A-share universe.",
        "Researched a composite DPRO + SUE + dividend-yield signal and evaluated it against sector-neutral benchmarks.",
        "Ran event-study and PEAD diagnostics to test earnings-surprise persistence and decay horizons.",
        "Maintained a vectorised backtesting workflow and produced factor-performance attribution notes for the team.",
      ],
      tools: ["Python", "pandas / NumPy", "JoinQuant", "iFinD", "Wind", "SQL", "Excel / VBA"],
      outputs: [
        "Reusable factor library + data-cleaning pipeline",
        "Backtest report on the DPRO+SUE+yield composite",
        "Earnings-surprise drift study deck",
      ],
      representative:
        "Composite multi-factor A-share signal with full factor attribution and a simulated long-only backtest.",
      perf: [
        { v: "20+", l: "Factors tested" },
        { v: "1.3", l: "Best Sharpe (sim.)" },
        { v: "8 yrs", l: "Backtest window" },
      ],
    },
    {
      id: "sinosafe",
      company: "Sinosafe General Insurance",
      role: "Equity Market Analyst Intern",
      period: "2023",
      location: "Shenzhen, CN",
      team: "Investment / Equity Research",
      sector: "Insurance · Buy-side",
      quant: true,
      firm:
        "Sinosafe General Insurance manages an investment portfolio alongside its underwriting business, with an internal equity research function supporting allocation decisions.",
      roleSummary:
        "Supported the equity desk with company and sector analysis, market monitoring, and an industry ETF-rotation study used as an allocation input.",
      did: [
        "Tracked sector performance and built a monthly industry ETF-rotation model on risk-adjusted momentum.",
        "Wrote concise equity and sector notes summarising fundamentals, catalysts and valuation.",
        "Monitored macro releases and market breadth, flagging rotation signals to the desk.",
        "Assembled monitoring dashboards consolidating prices, factor ranks and news flow.",
      ],
      tools: ["Wind", "iFinD", "Bloomberg", "Excel / VBA", "Python", "PowerPoint"],
      outputs: [
        "Industry ETF-rotation model + monthly signal",
        "Sector and single-name research notes",
        "Market-monitoring dashboard",
      ],
      representative:
        "Monthly industry ETF-rotation framework feeding tactical sector weights.",
      perf: [
        { v: "11", l: "Sectors tracked" },
        { v: "Monthly", l: "Rebalance" },
        { v: "1.1", l: "Sharpe (sim.)" },
      ],
    },
    {
      id: "sifra",
      company: "Shenzhen Int'l Financial Research Association",
      role: "Research Intern",
      period: "2023",
      location: "Shenzhen, CN",
      team: "Markets & Policy Research",
      sector: "Research Institute",
      quant: false,
      firm:
        "A Shenzhen-based financial research association producing market, industry and policy research for members across the financial sector.",
      roleSummary:
        "Contributed to applied research on markets and economic policy, supporting reports with data work, literature review and drafting.",
      did: [
        "Compiled and cleaned macro and market datasets for thematic research reports.",
        "Surveyed academic and industry literature on market microstructure and factor investing.",
        "Drafted sections of research notes and prepared charts and exhibits.",
        "Synthesised findings into clear summaries for internal and member distribution.",
      ],
      tools: ["Python", "Stata / EViews", "Wind", "Excel", "LaTeX", "PowerPoint"],
      outputs: [
        "Data appendices for published research",
        "Literature reviews on factor & microstructure topics",
        "Charts and exhibits for member reports",
      ],
      representative:
        "Applied markets-and-policy research synthesising data, literature and narrative.",
    },
    {
      id: "gaoke",
      company: "Zhuhai Gaoke Venture Capital",
      role: "Risk Control & Compliance Intern",
      period: "2022",
      location: "Zhuhai, CN",
      team: "Risk & Compliance",
      sector: "Venture Capital",
      quant: false,
      firm:
        "Zhuhai Gaoke Venture Capital invests in early- and growth-stage companies, with a risk and compliance function overseeing portfolio and regulatory exposures.",
      roleSummary:
        "Assisted the risk and compliance team with due-diligence support, documentation review and portfolio risk monitoring.",
      did: [
        "Supported due-diligence on prospective investments, organising financial and legal materials.",
        "Reviewed compliance documentation against internal and regulatory checklists.",
        "Helped maintain a portfolio risk register and tracked key exposures.",
        "Summarised findings into memos for investment and risk committees.",
      ],
      tools: ["Excel", "Wind", "PowerPoint", "Internal risk systems"],
      outputs: [
        "Due-diligence support packs",
        "Compliance review checklists",
        "Portfolio risk-monitoring notes",
      ],
      representative:
        "Risk and compliance support across the venture investment lifecycle.",
    },
    {
      id: "zhongan",
      company: "Guangdong ZhongAn Law Firm",
      role: "Legal Intern",
      period: "2022",
      location: "Guangdong, CN",
      team: "Corporate & Financial Law",
      sector: "Legal Services",
      quant: false,
      firm:
        "Guangdong ZhongAn Law Firm advises corporate and financial clients on transactions, compliance and dispute matters.",
      roleSummary:
        "Supported attorneys on corporate and financial-law matters through research, document drafting and case preparation.",
      did: [
        "Researched statutes, regulations and precedent relevant to corporate and financial matters.",
        "Drafted and proof-read contracts, memos and supporting legal documents.",
        "Organised case files and prepared materials for filings and meetings.",
        "Summarised regulatory requirements into client-ready briefs.",
      ],
      tools: ["Legal databases", "Word", "Excel", "PowerPoint"],
      outputs: [
        "Legal research memos",
        "Drafted contracts & documents",
        "Organised case files",
      ],
      representative:
        "Corporate and financial-law support bridging legal and market context.",
    },
  ],
};
