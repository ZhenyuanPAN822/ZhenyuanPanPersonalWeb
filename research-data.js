/* research-data.js — Screen 3 content. Exposed as window.RESEARCH_DATA.
   Event-study arrays are illustrative/fictional and easy to edit. Each project
   mirrors a strategy card from Screen 2 so the selector feels continuous. */
window.RESEARCH_DATA = {
  projects: [
    {
      id: "redsea",
      name: "Red Sea Shipping Crisis",
      tag: "Maritime · DID",
      methods: ["Event Study", "Triple-Diff", "Panel FE"],
      title: "Port Resilience under Maritime Chokepoint Disruption",
      lede: "How do ports reallocate trade flows when a major maritime chokepoint is disrupted?",
      // event study: months relative to the Red Sea disruption (t=0)
      es: {
        label: "Event Study · Port Exposure to Red Sea Disruption",
        y: "Δ log port calls",
        unit: "coef.",
        points: [
          { t: -6, b: 0.01, lo: -0.04, hi: 0.06 },
          { t: -5, b: -0.02, lo: -0.07, hi: 0.03 },
          { t: -4, b: 0.00, lo: -0.05, hi: 0.05 },
          { t: -3, b: 0.02, lo: -0.03, hi: 0.07 },
          { t: -2, b: -0.01, lo: -0.06, hi: 0.04 },
          { t: -1, b: 0.00, lo: -0.04, hi: 0.04 },
          { t: 0, b: -0.05, lo: -0.11, hi: 0.01 },
          { t: 1, b: -0.14, lo: -0.21, hi: -0.07 },
          { t: 2, b: -0.21, lo: -0.29, hi: -0.13 },
          { t: 3, b: -0.18, lo: -0.27, hi: -0.09 },
          { t: 4, b: -0.12, lo: -0.21, hi: -0.03 },
          { t: 5, b: -0.07, lo: -0.17, hi: 0.03 },
          { t: 6, b: -0.04, lo: -0.15, hi: 0.07 },
        ],
      },
      // lower-left: shipping corridors schematic
      corridors: {
        label: "Global Shipping Network · Top Corridors",
        nodes: [
          { id: "rtm", x: 0.30, y: 0.30, r: "Rotterdam" },
          { id: "suez", x: 0.55, y: 0.46, r: "Suez / Red Sea" },
          { id: "jeb", x: 0.62, y: 0.52, r: "Jebel Ali" },
          { id: "sin", x: 0.80, y: 0.62, r: "Singapore" },
          { id: "sha", x: 0.90, y: 0.40, r: "Shanghai" },
          { id: "cape", x: 0.42, y: 0.84, r: "Cape Route" },
        ],
        routes: [
          { a: "rtm", b: "suez", k: "primary" },
          { a: "suez", b: "jeb", k: "primary" },
          { a: "jeb", b: "sin", k: "primary" },
          { a: "sin", b: "sha", k: "primary" },
          { a: "rtm", b: "cape", k: "alt" },
          { a: "cape", b: "sin", k: "alt" },
        ],
      },
      // lower-right: panel-data small multiples (connectivity groups)
      panel: {
        label: "Panel Data Overview · by Connectivity",
        groups: [
          { k: "High connectivity", trend: [0, 0.4, 0.6, 0.55, 0.7, 0.9, 1.0, 0.95] },
          { k: "Medium connectivity", trend: [0, 0.2, 0.1, -0.1, -0.2, -0.15, 0.0, 0.1] },
          { k: "Low connectivity", trend: [0, -0.1, -0.3, -0.6, -0.8, -0.7, -0.5, -0.4] },
        ],
      },
      details: {
        question: "How do ports reallocate trade flows when a major maritime chokepoint is disrupted?",
        data: ["175 ports × 3 corridors", "Monthly panel, 2019–2024", "AIS calls, throughput, schedules"],
        identification: ["Continuous-intensity DID", "Triple differences", "Port × Month FE"],
        findings: ["Connectivity attenuates the exposure gradient", "Red Sea–Gulf ports absorb reallocated calls", "Effects peak at t+2, decay by t+5"],
        robustness: ["Alternative event windows", "Placebo chokepoints", "Leave-one-out ports"],
      },
      metrics: [
        { v: "175", l: "Ports" },
        { v: "3", l: "Corridors" },
        { v: "2019–2024", l: "Panel" },
        { v: "DID + 3-Diff", l: "Design" },
        { v: "200-Round", l: "Placebo" },
      ],
    },

    {
      id: "rct",
      name: "Social Capital & Fairness RCT",
      tag: "Field RCT · ITT/LATE",
      methods: ["RCT", "ITT / LATE", "Strata FE"],
      title: "Social Capital and Fairness Preferences",
      lede: "Does exposure to cooperative institutions shift fairness preferences and trust?",
      es: {
        label: "Treatment Effects · Fairness & Trust Indices",
        y: "Std. effect (σ)",
        unit: "ATE",
        points: [
          { t: -3, b: 0.01, lo: -0.05, hi: 0.07 },
          { t: -2, b: -0.02, lo: -0.08, hi: 0.04 },
          { t: -1, b: 0.00, lo: -0.05, hi: 0.05 },
          { t: 0, b: 0.06, lo: -0.01, hi: 0.13 },
          { t: 1, b: 0.18, lo: 0.10, hi: 0.26 },
          { t: 2, b: 0.24, lo: 0.15, hi: 0.33 },
          { t: 3, b: 0.21, lo: 0.12, hi: 0.30 },
          { t: 4, b: 0.17, lo: 0.07, hi: 0.27 },
        ],
      },
      corridors: {
        label: "Randomization Design · Clusters",
        nodes: [
          { id: "t1", x: 0.25, y: 0.32, r: "Treat A" },
          { id: "t2", x: 0.50, y: 0.26, r: "Treat B" },
          { id: "c1", x: 0.38, y: 0.62, r: "Control" },
          { id: "c2", x: 0.66, y: 0.58, r: "Control" },
          { id: "hub", x: 0.78, y: 0.40, r: "Strata hub" },
        ],
        routes: [
          { a: "hub", b: "t1", k: "primary" },
          { a: "hub", b: "t2", k: "primary" },
          { a: "hub", b: "c1", k: "alt" },
          { a: "hub", b: "c2", k: "alt" },
        ],
      },
      panel: {
        label: "Outcomes · by Arm",
        groups: [
          { k: "Cooperation arm", trend: [0, 0.3, 0.5, 0.7, 0.8, 0.9, 1.0, 0.95] },
          { k: "Information arm", trend: [0, 0.2, 0.3, 0.35, 0.4, 0.45, 0.5, 0.5] },
          { k: "Control", trend: [0, 0.05, 0.0, 0.1, 0.05, 0.0, 0.1, 0.05] },
        ],
      },
      details: {
        question: "Does exposure to cooperative institutions shift fairness preferences and trust?",
        data: ["~2,400 participants", "3 arms, stratified", "Baseline + 2 follow-ups"],
        identification: ["Randomized assignment", "ITT and LATE", "Strata fixed effects"],
        findings: ["Cooperation arm raises fairness ~0.24σ", "Trust spillovers within clusters", "Effects persist at follow-up 2"],
        robustness: ["Multiple-hypothesis adjustment", "Attrition bounds", "Re-randomization inference"],
      },
      metrics: [
        { v: "2,400", l: "Participants" },
        { v: "3", l: "Arms" },
        { v: "3", l: "Waves" },
        { v: "ITT + LATE", l: "Design" },
        { v: "Romano–Wolf", l: "MHT" },
      ],
    },

    {
      id: "covid",
      name: "COVID-19 & Intertemporal Decisions",
      tag: "Natural Exp. · Panel",
      methods: ["Event Study", "Within FE", "IV"],
      title: "Pandemic Shocks and Intertemporal Choice",
      lede: "How did pandemic exposure reshape time preferences and intertemporal decisions?",
      es: {
        label: "Event Study · Discounting around Exposure",
        y: "Δ present bias",
        unit: "coef.",
        points: [
          { t: -5, b: 0.00, lo: -0.05, hi: 0.05 },
          { t: -4, b: 0.01, lo: -0.04, hi: 0.06 },
          { t: -3, b: -0.01, lo: -0.06, hi: 0.04 },
          { t: -2, b: 0.00, lo: -0.05, hi: 0.05 },
          { t: -1, b: 0.02, lo: -0.03, hi: 0.07 },
          { t: 0, b: 0.08, lo: 0.02, hi: 0.14 },
          { t: 1, b: 0.15, lo: 0.08, hi: 0.22 },
          { t: 2, b: 0.13, lo: 0.05, hi: 0.21 },
          { t: 3, b: 0.09, lo: 0.01, hi: 0.17 },
          { t: 4, b: 0.05, lo: -0.04, hi: 0.14 },
        ],
      },
      corridors: {
        label: "Exposure Intensity · Regions",
        nodes: [
          { id: "a", x: 0.28, y: 0.30, r: "High exposure" },
          { id: "b", x: 0.55, y: 0.40, r: "Mid exposure" },
          { id: "c", x: 0.74, y: 0.30, r: "Low exposure" },
          { id: "d", x: 0.46, y: 0.70, r: "Lockdown wave" },
        ],
        routes: [
          { a: "a", b: "d", k: "primary" },
          { a: "b", b: "d", k: "primary" },
          { a: "c", b: "d", k: "alt" },
        ],
      },
      panel: {
        label: "Choices · by Exposure",
        groups: [
          { k: "High exposure", trend: [0, 0.2, 0.5, 0.8, 0.9, 0.7, 0.5, 0.4] },
          { k: "Mid exposure", trend: [0, 0.1, 0.25, 0.4, 0.45, 0.35, 0.25, 0.2] },
          { k: "Low exposure", trend: [0, 0.05, 0.1, 0.12, 0.1, 0.08, 0.05, 0.05] },
        ],
      },
      details: {
        question: "How did pandemic exposure reshape time preferences and intertemporal decisions?",
        data: ["Longitudinal survey panel", "Pre/post 2020 waves", "Incentivized choice tasks"],
        identification: ["Event-study design", "Within-person FE", "Exposure IV"],
        findings: ["Present bias rises post-exposure", "Reverts partially by t+4", "Stronger for liquidity-constrained"],
        robustness: ["Alternative exposure measures", "Selective-attrition checks", "Placebo timing"],
      },
      metrics: [
        { v: "12k", l: "Respondents" },
        { v: "5", l: "Waves" },
        { v: "2018–2023", l: "Panel" },
        { v: "Event Study", l: "Design" },
        { v: "IV", l: "Robustness" },
      ],
    },

    {
      id: "ads",
      name: "Advertising & Fertility Preferences",
      tag: "Media Exp. · DID",
      methods: ["DID", "Border Discont.", "Panel FE"],
      title: "Media Exposure and Fertility Preferences",
      lede: "Does advertising and media exposure shift stated fertility intentions?",
      es: {
        label: "Event Study · Exposure to Campaign Rollout",
        y: "Δ fertility intent",
        unit: "coef.",
        points: [
          { t: -4, b: -0.01, lo: -0.06, hi: 0.04 },
          { t: -3, b: 0.00, lo: -0.05, hi: 0.05 },
          { t: -2, b: 0.01, lo: -0.04, hi: 0.06 },
          { t: -1, b: -0.01, lo: -0.06, hi: 0.04 },
          { t: 0, b: 0.03, lo: -0.03, hi: 0.09 },
          { t: 1, b: 0.09, lo: 0.02, hi: 0.16 },
          { t: 2, b: 0.12, lo: 0.04, hi: 0.20 },
          { t: 3, b: 0.10, lo: 0.02, hi: 0.18 },
          { t: 4, b: 0.06, lo: -0.03, hi: 0.15 },
        ],
      },
      corridors: {
        label: "Rollout Geography · Media Markets",
        nodes: [
          { id: "m1", x: 0.30, y: 0.34, r: "Market I" },
          { id: "m2", x: 0.58, y: 0.28, r: "Market II" },
          { id: "m3", x: 0.50, y: 0.64, r: "Border pair" },
          { id: "m4", x: 0.78, y: 0.50, r: "Market III" },
        ],
        routes: [
          { a: "m1", b: "m3", k: "primary" },
          { a: "m2", b: "m3", k: "primary" },
          { a: "m2", b: "m4", k: "alt" },
        ],
      },
      panel: {
        label: "Intentions · by Cohort",
        groups: [
          { k: "Younger cohort", trend: [0, 0.15, 0.35, 0.5, 0.55, 0.5, 0.45, 0.4] },
          { k: "Mid cohort", trend: [0, 0.1, 0.2, 0.3, 0.32, 0.28, 0.24, 0.2] },
          { k: "Older cohort", trend: [0, 0.02, 0.05, 0.08, 0.06, 0.05, 0.03, 0.02] },
        ],
      },
      details: {
        question: "Does advertising and media exposure shift stated fertility intentions?",
        data: ["Repeated cross-sections", "Campaign rollout timing", "Media-market geocodes"],
        identification: ["Staggered DID", "Border discontinuity", "Market × Wave FE"],
        findings: ["Modest positive intent shift", "Concentrated in younger cohorts", "Fades beyond t+3"],
        robustness: ["Goodman-Bacon decomposition", "Border-pair placebos", "Honest pre-trends (Rambachan–Roth)"],
      },
      metrics: [
        { v: "48", l: "Markets" },
        { v: "6", l: "Waves" },
        { v: "2016–2022", l: "Panel" },
        { v: "Staggered DID", l: "Design" },
        { v: "HonestDiD", l: "Robustness" },
      ],
    },
  ],
};
