/* research-redsea.js : expanded research-essay article for Featured Project 1:
   "Port Adjustment to Maritime Chokepoint Disruption: Evidence from the Red Sea
   Shipping Crisis."

   Exposes window.__redseaArticle(data) -> full article HTML string, consumed by
   case-study.js (morph "plain"). All copy, equations, tables, and values come
   from the supplied paper; nothing is fabricated. Objective voice, no first
   person. Reuses the existing detail-page editorial classes (ca-*) plus a small
   set of rs-* helpers styled in case-study.css. */
(function () {
  "use strict";
  function esc(s) { return String(s).replace(/[&<>]/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[m]; }); }

  // a styled, library-free equation block (readable math, not LaTeX render)
  function eq(num, html) {
    return '<div class="rs-eq"><div class="rs-eq-body">' + html + "</div>" + (num ? '<div class="rs-eq-n">(' + num + ")</div>" : "") + "</div>";
  }
  function sec(eyebrow, title, inner) {
    return '<section class="ca-section rs-sec">' +
      '<div class="ca-h">' + esc(eyebrow) + "</div>" +
      (title ? '<h3 class="ca-sub">' + esc(title) + "</h3>" : "") +
      inner + "</section>";
  }
  function p(t) { return '<p class="ca-p">' + t + "</p>"; }
  function quote(t) { return '<blockquote class="rs-quote">' + t + "</blockquote>"; }
  function callout(t) { return '<div class="rs-callout">' + t + "</div>"; }
  function note(t) { return '<div class="rs-note">' + t + "</div>"; }
  function flow(steps) {
    return '<div class="rs-flow">' + steps.map(function (s, i) {
      return (i ? '<span class="rs-flow-arr" aria-hidden="true">\u2192</span>' : "") + '<span class="rs-flow-step">' + s + "</span>";
    }).join("") + "</div>";
  }
  // generic table: cols = [{h, num}], rows = [[...]], opts
  function table(cols, rows, foot) {
    var thead = "<thead><tr>" + cols.map(function (c) { return '<th' + (c.num ? ' class="num"' : "") + ">" + c.h + "</th>"; }).join("") + "</tr></thead>";
    var tbody = "<tbody>" + rows.map(function (r) {
      return "<tr>" + r.map(function (v, i) { return '<td' + (cols[i] && cols[i].num ? ' class="num"' : "") + (typeof v === "object" && v.cls ? ' class="' + (cols[i] && cols[i].num ? "num " : "") + v.cls + '"' : "") + ">" + (typeof v === "object" ? v.v : v) + "</td>"; }).join("") + "</tr>";
    }).join("") + "</tbody>";
    return '<div class="rs-tablewrap"><table class="rs-table">' + thead + tbody + "</table>" + (foot ? '<div class="rs-tnote">' + foot + "</div>" : "") + "</div>";
  }

  // paper figure (PNG at natural size, capped to the column; never upscaled)
  function fig(src, w, h, cap) {
    return '<figure class="rs-figure rs-imgfig"><img class="rs-img" src="' + src + '" width="' + w + '" height="' + h + '" alt="' + esc(cap) + '" loading="lazy"/>' +
      (cap ? '<figcaption class="rs-cap">' + cap + "</figcaption>" : "") + "</figure>";
  }

  /* schematic Suez-vs-Cape rerouting map (Europe / Africa / Asia, stylized, not to scale) */
  function redseaMap(labels) {
    return '<img class="rs-svgmap" src="redsea-route.png" alt="Stylized via-Suez and via-Cape rerouting map: port, Suez Canal, Cape of Good Hope, and European reference point" loading="lazy"/>';
  }

  window.__redseaArticle = function (data) {
    var H = "";

    // ── HERO ──
    H += '<section class="ca-section rs-hero">' +
      '<div class="ca-disclaimer">' + esc(data.disclaimer) + "</div>" +
      '<div class="ca-kicker">Maritime Economics \u00b7 Causal Inference</div>' +
      '<h1 class="ca-title">Port Adjustment to Maritime Chokepoint Disruption: Evidence from the Red Sea Shipping Crisis</h1>' +
      '<div class="ca-ymeta">2023-2024 Red Sea Crisis \u00b7 175 Ports \u00b7 Three Shipping Corridors \u00b7 Port-Month Panel</div>' +
      '<div class="rs-tags">' + ["IMF PortWatch", "UNCTAD PLSCI", "Event Study", "Continuous-Intensity DID", "Triple Difference"].map(function (t) { return '<span class="rs-tag">' + t + "</span>"; }).join("") + "</div>" +
      '<a class="rs-dl rs-dl-top" href="manuscript.pdf" download="Pan-RedSea-Manuscript.pdf"><span class="rs-dl-i" aria-hidden="true">\u2193</span> Download manuscript PDF</a>' +
      p("The 2023-2024 Red Sea crisis provides a quasi-natural experiment for studying port adjustment under a major maritime chokepoint disruption. The analysis assembles a port-month panel for 175 ports across three shipping corridors, combining IMF PortWatch activity data, UNCTAD\u2019s Port Liner Shipping Connectivity Index, IHO basin definitions, and a stylized geographic rerouting-penalty measure based on great-circle distance via Suez versus via the Cape of Good Hope.") +
      p("Continuous-intensity event-study difference-in-differences and triple-difference models estimate within-basin exposure gradients in port calls, imports, and exports. Adjustment is corridor-specific. Higher exposure is associated with lower relative imports in the Southeast Asia gateway corridor. Borderline evidence also points to higher relative port calls in the Red Sea-Gulf-western Indian Ocean corridor, while the pooled export gradient is positive but suggestive. Network connectivity shapes some short-run port-call gradients but does not consistently buffer or amplify geographic exposure.") +
      quote("<b>A maritime chokepoint disruption did not produce one uniform port-level effect.</b>") +
      "</section>";

    // ── THE DISRUPTION ──
    H += sec("The Disruption", "A Shock to One Corridor, Not One Uniform Outcome",
      p("At the end of 2023, escalating security incidents in the Red Sea disrupted a strategic maritime corridor. Major container carriers suspended Suez Canal routings and diverted services around the Cape of Good Hope. The rerouting lengthened Asia-Europe voyages by about 30%, or roughly 10 to 14 days, and tightened effective fleet capacity. It also raised freight costs and schedule uncertainty, adding pressure to global supply chains.") +
      p("Maritime transport carries more than 80% of global merchandise trade by volume, but its efficiency depends on a concentrated network of chokepoints. Disruptions at corridors such as the Suez Canal, the Panama Canal, and the Strait of Malacca can raise trade costs, delay deliveries, and transmit stress through shipping networks and supply chains.") +
      p("Ports connect maritime and inland supply chains, so corridor disruption appears in port performance through changes in calls, imports, and exports. The study does not construct a universal port-resilience index. It estimates standardized port outcome gradients around the Red Sea shock.") +
      '<div class="rs-band"><span><b>+30%</b> voyage distance</span><span><b>10-14</b> additional days</span><span><b>Dec 2023</b> event onset</span></div>' +
      flow(["Red Sea disruption", "Cape diversion", "Longer voyage cycles", "Tighter effective capacity", "Port adjustment"]));

    // ── ECONOMIC MECHANISM ──
    H += sec("Economic Mechanism", "Why the Same Shock Can Produce Different Port Adjustments",
      p("From a mechanism perspective, route disruption is a network-wide shock transmitted through vessel deviation, effective-capacity tightening, and trade adjustment. Higher route risk or reduced corridor capacity can increase sailing distance and transit time, raise fuel and chartering costs, and tighten effective shipping capacity through longer voyage cycles.") +
      p("These changes can reduce schedule reliability and trigger blank sailings, port skipping, and service reconfiguration. At the port level, the consequences may appear as fewer calls, lower import or export activity, longer waiting times, or congestion, but also as relative gains for substitute gateways that absorb diverted traffic.") +
      p("These responses are unlikely to be uniform. Even under the same corridor disruption, some ports may experience contraction while others receive reallocated services or cargo, depending on corridor position, cargo profile, and access to alternative network connections.") +
      p("Beyond geographic exposure, the role of network connectivity remains contested. One mechanism emphasizes redundancy and rerouting capacity: ports embedded in more connected networks may have access to more alternative services and paths. A competing mechanism emphasizes hub dependence and congestion propagation: highly connected ports may occupy core network positions where disruption and coordination complexity are concentrated.") +
      p("Geographic exposure therefore provides a first-order source of heterogeneity, while network connectivity may either buffer or amplify that exposure. The role of connectivity is an empirical question.") +
      '<div class="rs-twomech"><div class="rs-mech"><div class="rs-mech-k">Substitution</div><div class="rs-mech-d">Redundancy and rerouting capacity: more connected ports may access more alternative services and paths.</div></div>' +
      '<div class="rs-mech accent"><div class="rs-mech-k">Concentration</div><div class="rs-mech-d">Hub dependence and congestion propagation: core ports may concentrate disruption and coordination complexity.</div></div></div>' +
      callout("<b>Geographic exposure and network position are separate empirical dimensions.</b>") +
      note("Cargo and service categories are examined as outcome decompositions rather than as one composite resilience measure."));

    // ── DATA AND MEASUREMENT ──
    H += sec("Data and Measurement", "From Daily Port Activity to Comparable Port-Month Outcomes",
      p("The analysis uses a port-month panel from four sources: IMF PortWatch daily port activity, a basin lookup derived from IHO Sea Areas, UNCTAD quarterly PLSCI, and PortWatch port coordinates. PortWatch provides daily port calls and estimated import and export tonnage. The basin lookup assigns ports to corridor groups. PLSCI provides the baseline network measure, and coordinates are used to compute the rerouting-penalty proxy.") +
      p("The monthly panel begins in 2019 for pre-period standardization, while the estimating sample is limited to a fixed event window around December 2023. After basin filtering and exact matching to PLSCI labels, the event-window sample contains 2,975 port-month observations for 175 ports. After excluding event month (k=0) during panel construction and (k=-1) at the regression stage, the effective estimating sample contains 2,800 observations before outcome-specific missingness.") +
      p("The main analysis focuses on three aggregate monthly outcomes: port calls, import tonnage, and export tonnage. The same transformation is also applied to 18 cargo and service subcategories used in the exploratory decomposition.") +
      eq("1", '<span class="rs-v">z<sub>it</sub><sup>o</sup></span> = ( <span class="rs-v">Y<sub>it</sub><sup>o</sup></span> &minus; <span class="rs-v">&mu;<sub>i,m(t)</sub><sup>o,pre</sup></span> ) / <span class="rs-v">&sigma;<sub>i,m(t)</sub><sup>o,pre</sup></span>,&nbsp;&nbsp; pre = 2019m1 to 2023m11') +
      p("Each port-month observation is benchmarked against the same port\u2019s own pre-crisis distribution for the same calendar month. This removes regular within-port seasonality and makes outcomes comparable across ports of different scales.") +
      p("A constant shift keeps the transformed outcome strictly positive. The shifted series is winsorized at the 1st and 99th percentiles for estimation stability. Larger values continue to indicate activity above the port\u2019s own pre-crisis seasonal norm.") +
      flow(["Daily PortWatch activity", "Port-month aggregation", "Same-calendar-month benchmark", "Shift and winsorization", "Estimation-ready outcome"]));

    // ── SAMPLE CONSTRUCTION ──
    H += sec("Sample Construction", "A Coverage-Driven Exact-Match Port Sample",
      p("The baseline sample retains ports in three corridor groups that can be exactly matched to UNCTAD PLSCI records. Of 1,802 active ports, 584 lie in the three corridor groups, and 175 exactly match to PLSCI and form the estimation sample.") +
      p("The 409 corridor ports dropped at the PLSCI merge are not matched under the implemented exact rule. Matched ports are approximately 3.7 times the median size of dropped ports. The estimation sample should therefore be interpreted as a coverage-driven exact-match sample of larger and better-connected corridor ports rather than as all ports in the three corridors.") +
      '<div class="rs-funnel"><div class="rs-funnel-step"><span class="rs-funnel-v">1,802</span><span class="rs-funnel-l">Active ports</span></div>' +
      '<span class="rs-flow-arr">\u2192</span><div class="rs-funnel-step"><span class="rs-funnel-v">584</span><span class="rs-funnel-l">Corridor ports</span></div>' +
      '<span class="rs-flow-arr">\u2192</span><div class="rs-funnel-step accent"><span class="rs-funnel-v">175</span><span class="rs-funnel-l">Matched (estimation sample)</span></div></div>' +
      fig("redsea-sample-funnel.png", 2468, 1422, "Sample funnel from 1,802 active ports to 584 corridor-basin ports (Groups I / II / III) to the 175 ports matched to UNCTAD PLSCI, dropping 1,218 non-corridor ports and a further 409 (70%) not matched to PLSCI. Matched split I / II / III = 53 / 54 / 68.") +
      table([{ h: "Corridor group" }, { h: "Corridor ports", num: 1 }, { h: "Matched", num: 1 }, { h: "Retention", num: 1 }],
        [["I: Red Sea-Gulf-W. Indian Ocean", "167", "53", "31.7%"],
         ["II: Southeast Asia gateway", "173", "54", "31.2%"],
         ["III: East Asia origin", "244", "68", "27.9%"],
         [{ v: "All corridors", cls: "tot" }, { v: "584", cls: "tot" }, { v: "175", cls: "tot" }, { v: "30.0%", cls: "tot" }]],
        "The matched sample is more concentrated among larger, better-connected ports, improving measurement alignment while narrowing external validity."));

    // ── EXPOSURE CONSTRUCTION ──
    H += sec("Exposure Construction", "Measuring the Geographic Rerouting Penalty",
      p("Geographic exposure captures the deviation penalty implied by a shift from the Suez Canal to the Cape of Good Hope. Using the Suez Canal, the Cape of Good Hope, and a European reference point near the Strait of Gibraltar, two stylized routes are constructed for each port.") +
      p("The first route travels through Suez. The second route substitutes a Cape of Good Hope diversion. The raw exposure measure is the non-negative excess of the via-Cape route over the via-Suez route.") +
      p("Larger values indicate stronger dependence on the Suez corridor and a larger rerouting cost under diversion around the Cape.") +
      eq("2", 'viaSuez<sub>i</sub> = d(i, Suez) + d(Suez, Ref)&nbsp;&nbsp;;&nbsp;&nbsp; viaCape<sub>i</sub> = d(i, Cape) + d(Cape, Ref)') +
      eq("3", '<span class="rs-v">E<sub>geo,raw,i</sub></span> = max{ viaCape<sub>i</sub> &minus; viaSuez<sub>i</sub> ,&nbsp; 0 }') +
      p("Negative raw values are truncated at zero. The positive part of the distribution is then z-score standardized and shifted, while zero-exposure ports remain at zero.") +
      p("Algebraically, the route difference contains a common reference-leg constant. That constant cancels among positive-exposure ports under within-sample standardization. The final variable is nevertheless not globally equivalent to d(i, Cape) &minus; d(i, Suez), because the implementation truncates negative raw values, standardizes only the positive part, shifts that part, and retains zero-exposure ports at zero.") +
      p("One baseline geographic-exposure unit corresponds to approximately one standard deviation of the positive clipped rerouting-penalty distribution, or about 2,000 kilometres in the exact-match sample.") +
      '<figure class="rs-figure">' + redseaMap(true) + '<figcaption class="rs-cap">For each port, two stylized routes are compared: via Suez (port to Suez to the European reference point) and via the Cape of Good Hope. The raw exposure is the non-negative excess of the via-Cape route over the via-Suez route. Schematic, not to scale.</figcaption></figure>' + '<div class="rs-iviz" data-rsviz="reroute"></div>');

    // ── NETWORK POSITION ──
    H += sec("Network Position", "Baseline Liner-Shipping Connectivity",
      p("Network exposure is measured with the UNCTAD Port Liner Shipping Connectivity Index and fixed at the port-level baseline average used in the paper. Higher values indicate stronger integration into the liner-shipping network.") +
      p("PLSCI is merged to the port panel using a conservative exact-match procedure. Before estimation, the port-level average is standardized across matched ports and shifted to remain strictly positive.") +
      eq("4", '<span class="rs-v">E<sub>net,i</sub></span> = |Q<sub>pre</sub>|<sup>&minus;1</sup> &sum;<sub>q&isin;Q<sub>pre</sub></sub> PLSCI<sub>iq</sub>') +
      '<div class="rs-conn"><span class="rs-conn-node sm">Peripheral</span><span class="rs-conn-line"></span><span class="rs-conn-node md">Medium connectivity</span><span class="rs-conn-line"></span><span class="rs-conn-node lg">Central hub</span></div>' +
      note("Two possible mechanisms: route substitution versus hub dependence."));

    // ── EMPIRICAL STRATEGY ──
    H += sec("Empirical Strategy", "A Continuous Exposure Gradient, Not a Binary Treatment",
      p("The design treats the Red Sea crisis as an exogenous corridor shock to the liner-shipping system. The identifying comparison relies on cross-port variation in a pre-shock geographic rerouting-penalty proxy within a continuous-intensity difference-in-differences specification.") +
      p("Treatment intensity varies continuously across ports, so the crisis is modeled as an exposure gradient rather than a binary treated-control contrast. Event time is defined relative to December 2023, and the fixed event window is k &isin; [-5, 12].") +
      p("Event month k=0 is removed during panel construction, and k=-1 is removed at the regression stage. Post-period coefficients use k=1,...,12, with k=-2 serving as the omitted reference period in dynamic specifications.") +
      p("All models include port fixed effects, month fixed effects, constituent-IHO-basin-by-month fixed effects, and port-specific linear trends.") +
      eq("5", 'Y<sub>it</sub> = &beta;<sub>1</sub>(E<sub>geo,i</sub>&times;Post<sub>t</sub>) + &beta;<sub>2</sub>(E<sub>net,i</sub>&times;Post<sub>t</sub>) + &alpha;<sub>i</sub> + &lambda;<sub>t</sub> + &theta;<sub>b(i),t</sub> + &gamma;<sub>i</sub>Trend<sub>t</sub> + &epsilon;<sub>it</sub>') +
      p("The coefficient on E<sub>geo,i</sub>&times;Post<sub>t</sub> measures how much more or less geographically exposed ports adjusted after the shock relative to less-exposed ports in the same constituent basin and month.") +
      eq("6", 'Y<sub>it</sub> = &alpha;<sub>i</sub> + &lambda;<sub>t</sub> + &theta;<sub>b(i),t</sub> + &gamma;<sub>i</sub>Trend<sub>t</sub> + &sum;<sub>k&isin;K</sub> [ &beta;<sub>k</sub>D<sub>kt</sub>E<sub>geo,i</sub> + &eta;<sub>k</sub>D<sub>kt</sub>E<sub>net,i</sub> ] + &epsilon;<sub>it</sub>&nbsp;,&nbsp;&nbsp; K = {-5,-4,-3,1,...,12}') +
      p("The coefficient &beta;<sub>k</sub> measures the month-k slope with respect to geographic exposure relative to k=-2. Differential pre-trends are assessed jointly over k=-5,-4,-3, while post-period differences are summarized by a joint test over k=1,...,6.") +
      eq("7", 'Y<sub>it</sub> = &beta;<sub>1</sub>(E<sub>geo,i</sub>&times;Post<sub>t</sub>) + &beta;<sub>2</sub>(E<sub>geo,i</sub>&times;E<sub>net,i</sub>&times;Post<sub>t</sub>) + &beta;<sub>3</sub>(E<sub>net,i</sub>&times;Post<sub>t</sub>) + &alpha;<sub>i</sub> + &lambda;<sub>t</sub> + &theta;<sub>b(i),t</sub> + &gamma;<sub>i</sub>Trend<sub>t</sub> + &epsilon;<sub>it</sub>') +
      eq("8", 'Y<sub>it</sub> = &alpha;<sub>i</sub> + &lambda;<sub>t</sub> + &theta;<sub>b(i),t</sub> + &gamma;<sub>i</sub>Trend<sub>t</sub> + &sum;<sub>k&isin;K</sub> [ &beta;<sub>k</sub>D<sub>kt</sub>E<sub>geo,i</sub> + &gamma;<sub>k</sub>D<sub>kt</sub>E<sub>net,i</sub> + &delta;<sub>k</sub>D<sub>kt</sub>E<sub>geo,i</sub>E<sub>net,i</sub> ] + &epsilon;<sub>it</sub>') +
      eq("9", '&part;Y<sub>it</sub> / &part;E<sub>geo,i</sub> = &beta;<sub>k</sub> + &delta;<sub>k</sub>E<sub>net,i</sub>') +
      p("When lower outcomes represent larger losses, &delta;<sub>k</sub>&gt;0 is consistent with attenuation of the adverse geographic gradient for more connected ports, while &delta;<sub>k</sub>&lt;0 is consistent with amplification. The interaction captures conditional variation in the geographic gradient rather than a universal connectivity effect.") +
      '<div class="rs-festrip">Port FE \u00b7 Month FE \u00b7 Constituent-basin \u00d7 Month FE \u00b7 Port-specific trends \u00b7 Port-clustered SE</div>');

    // ── INFERENCE ──
    H += sec("Inference", "Estimation, Joint Tests, and Robustness Discipline",
      p("All models are estimated as linear regressions after residualizing port, month, and constituent-IHO-basin-by-month fixed effects and including port-specific linear trends. The same baseline and dynamic specifications are estimated for the pooled exact-match sample and separately for Groups I, II, and III.") +
      p("Aggregate tables focus on port calls, imports, and exports, while parallel regressions are run for 18 cargo and service subcategories. Standard errors are clustered at the port level. The same covariance structure is used for joint pre-trend and post-period tests.") +
      p("Main robustness checks exclude the single largest pre-shock port and replace the baseline exposure scaling with raw-standardized alternatives. Placebo evidence is based on 200 treatment-strength randomizations of geographic exposure across ports. A reported randomization value of 0.000 represents 0 of 200 exceedances under the unadjusted empirical rule, not an exact zero p-value.") +
      p("Coefficients are expressed in shifted, winsorized units of each port\u2019s own pre-crisis same-calendar-month standard deviation."));

    // ── MAIN RESULTS ──
    H += sec("Main Results", "Adjustment Was Corridor-Specific",
      quote("<b>The pooled estimate conceals different adjustment margins across corridors.</b>") +
      p("The coefficient on E<sub>geo</sub>&times;Post is a within-basin exposure-gradient effect. It measures how much more or less geographically exposed ports adjusted relative to less-exposed ports in the same constituent basin and month, rather than the average effect of the crisis on port activity.") +
      p("The pooled estimate is a single common-slope regression over the exact-match three-corridor sample rather than a precision-weighted average of corridor-specific slopes. The triple-difference term asks whether the geographic gradient varies with baseline connectivity.") +
      p("Three aggregate patterns stand out: a positive pooled exposure-gradient estimate for exports, a positive Group I effect for port calls, and a negative Group II effect for imports.") +
      table([{ h: "Sample" }, { h: "Outcome" }, { h: "Effect" }, { h: "Estimate", num: 1 }, { h: "Pre-trend p", num: 1 }, { h: "Drop-top1 p", num: 1 }, { h: "Raw-std p", num: 1 }, { h: "Placebo p", num: 1 }],
        [["Pooled (ALL)", "Export", "DID", "0.730** (0.315)", "0.989", "0.021", "0.019", "0.000"],
         ["Group I", "Port calls", "DID", "1.034** (0.422)", "0.887", "0.018", "0.020", "0.000"],
         ["Group I", "Export", "DID", "0.726* (0.403)", "0.943", "0.078", "0.075", "0.000"],
         ["Group II", "Import", "DID", { v: "\u22121.385*** (0.449)", cls: "neg" }, "0.529", "0.002", "0.003", "0.000"],
         ["Group II", "Port calls", "DDD", "0.324*** (0.082)", "0.137", "0.009", "0.000", "0.070"]],
        "DID denotes E<sub>geo</sub>&times;Post. DDD denotes E<sub>geo</sub>&times;E<sub>net</sub>&times;Post. Standard errors in parentheses. A placebo value of 0.000 means 0 of 200 randomized assignments exceeded the observed estimate.") +
      p("<b>Pooled exports.</b> At the pooled level, the clearest raw-p result appears on the export margin. The DID coefficient is 0.730 with p=0.022, indicating that more geographically exposed ports recorded relatively stronger standardized export activity than less-exposed ports within comparable basin-month cells. The estimate represents a relative change against each port\u2019s own pre-crisis seasonal norm. It should not be interpreted as a uniform increase in raw export volume. Neither pooled port calls nor pooled imports produces a comparably robust DID effect, and the pooled export DDD coefficient is insignificant.") +
      p("<b>Group I port calls.</b> In Group I, the strongest result is a positive DID effect for port calls: 1.034 with p=0.018, consistent with a reallocation of vessel activity toward more geographically exposed ports in the Red Sea, Gulf, and western Indian Ocean corridor. Group I also shows a positive export estimate, but the coefficient is only marginally significant at 0.726 with p=0.078. The Group I pattern is therefore interpreted primarily as operational adjustment, with export strengthening treated as a secondary margin.") +
      p("<b>Group II imports.</b> Group II presents a different pattern. The import DID coefficient is negative and strongly significant at \u22121.385 with p=0.003. Higher geographic exposure is associated with a sharper post-shock decline in import activity in the Southeast Asia gateway corridor. This is the core aggregate finding after multiple-testing adjustment, remaining significant at the 5% Benjamini-Hochberg false-discovery-rate threshold with q=0.039.") +
      p("<b>Group II port calls.</b> The positive Group II port-calls DDD estimate suggests that baseline network position conditioned how geographic exposure translated into short-run operational adjustment within the basin. The coefficient remains significant in the baseline and both re-estimation checks. However, the exposure-placebo diagnostic is weaker at p=0.070. The result is therefore retained as supplementary rather than core evidence.") +
      '<div class="rs-hier">' +
        '<div class="rs-hier-row core"><span class="rs-hier-k">Core</span><span class="rs-hier-v">Group II imports : DID</span></div>' +
        '<div class="rs-hier-row"><span class="rs-hier-k">Supplementary, FDR-robust</span><span class="rs-hier-v">Group II port calls : DDD</span></div>' +
        '<div class="rs-hier-row"><span class="rs-hier-k">Borderline / suggestive</span><span class="rs-hier-v">Pooled exports : DID \u00b7 Group I port calls : DID</span></div>' +
        '<div class="rs-hier-row dim"><span class="rs-hier-k">Not retained as core</span><span class="rs-hier-v">Group I exports : DID</span></div>' +
      "</div>");

    // ── EVENT STUDY ──
    H += sec("Event Study", "When Did the Adjustment Gradients Emerge?",
      p("Event-study estimates add a temporal dimension by showing when post-shock gradients emerge. The paths should be interpreted as pointwise timing evidence rather than as simultaneous path tests.") +
      p("Pooled exports show an episodic pattern, with significant coefficients at k=3 and k=6. Group I port calls show delayed and non-continuous signals at k=3 and k=5. Group I exports become significant only at k=6.") +
      p("Group II imports exhibit the strongest contraction pattern. The coefficient is significant at k=1 and reappears at k=5 and k=7, suggesting an early and recurrent but non-continuous contraction.") +
      p("The Group II port-calls DDD signal is concentrated at k=1, which is more consistent with a transient network-conditioned reshuffling of vessel activity than a persistent reordering of the basin\u2019s port hierarchy.") +
      fig("redsea-eventstudy.png", 3264, 2224, "Event-study coefficients by month from the December 2023 event onset. Pooled export DID, Basin I port-calls DID, Basin II import DID, and Basin II port-calls DDD, with pointwise confidence bands. Pre-event coefficients are flat; post-event gradients emerge episodically.") +
      table([{ h: "Sample" }, { h: "Outcome" }, { h: "Effect" }, { h: "Sig. pre-event" }, { h: "Sig. post-event" }, { h: "First post", num: 1 }],
        [["Pooled (ALL)", "Export", "DID", "None", "3, 6", "3"],
         ["Group I", "Port calls", "DID", "None", "3, 5", "3"],
         ["Group I", "Export", "DID", "None", "6", "6"],
         ["Group II", "Import", "DID", "None", "1, 5, 7", "1"],
         ["Group II", "Port calls", "DDD", "None", "1", "1"]],
        "Default reading view: Group II \u00b7 Imports \u00b7 DID. Timing is pointwise, not a joint path test."));

    // ── COEFFICIENT LANDSCAPE ──
    H += sec("Coefficient Landscape", "One Matrix, Several Adjustment Margins",
      p("The aggregate heatmap consolidates the negative Group II import DID, the positive Group II port-calls DDD, and the more marginal pooled export and Group I port-calls DID estimates. The pattern reinforces the central conclusion: the disruption produced different adjustments across corridors and activity margins rather than one common port response.") +
      fig("redsea-heatmap-summary.png", 2973, 1107, "Aggregate coefficient matrix for the three headline outcomes (exports, imports, port calls) by corridor group. Left: DID (E_geo \u00d7 post). Right: DDD (E_geo \u00d7 E_net \u00d7 post). Blue negative, red positive, zero-centered; dashed outlines mark the highlighted estimates. Stars denote raw port-clustered significance."));

    // ── DECOMPOSITION ──
    H += sec("Exploratory Decomposition", "Where Are the Aggregate Gradients Concentrated?",
      callout("<b>The cargo and service regressions are exploratory outcome decompositions. They do not identify pre-crisis cargo mix as a causal moderator.</b>") +
      p("At the pooled level, the positive aggregate export gradient is concentrated in dry-bulk exports, where the DID coefficient is 1.022 with p=0.039. The pooled subtype results also show selected network-conditioned adjustments on the service side: general-cargo port calls have a positive DDD effect, while RORO imports have a negative DDD effect.") +
      p("Group I\u2019s subtype pattern is more specific than the aggregate coefficients alone suggest. The positive port-call result is complemented by a positive dry-bulk port-calls DDD estimate. The clearest trade-side signal is a large positive RORO-export DID estimate. The subtype evidence is consistent with primarily operational adjustment and selected cargo-category strengthening.") +
      p("Group II presents the clearest subtype decomposition. The aggregate import contraction is mirrored by a negative cargo-import coefficient and a weaker negative dry-bulk import coefficient. On the service side, the positive aggregate port-calls interaction appears in cargo and container port calls.") +
      '<div class="rs-subgrid">' +
        subTable("Pooled", [["Dry bulk", "Export", "DID", "1.022** (0.491)", "0.039"], ["General cargo", "Port calls", "DDD", "0.239** (0.104)", "0.023"], ["RORO", "Import", "DDD", { v: "\u22120.467*** (0.126)", cls: "neg" }, "<0.001"], ["Cargo", "Port calls", "DDD", "0.208* (0.122)", "0.090"], ["Container", "Port calls", "DDD", "0.195* (0.111)", "0.081"]]) +
        subTable("Group I", [["Dry bulk", "Port calls", "DDD", "0.573** (0.234)", "0.018"], ["RORO", "Export", "DID", "5.621*** (1.445)", "<0.001"], ["Cargo", "Port calls", "DID", "0.838* (0.426)", "0.055"], ["Tanker", "Import", "DID", "1.406* (0.751)", "0.067"]]) +
        subTable("Group II", [["Cargo", "Import", "DID", { v: "\u22121.625*** (0.402)", cls: "neg" }, "<0.001"], ["Dry bulk", "Import", "DID", { v: "\u22120.884* (0.509)", cls: "neg" }, "0.089"], ["Cargo", "Port calls", "DDD", "0.381*** (0.117)", "0.002"], ["Container", "Port calls", "DDD", "0.491** (0.186)", "0.011"], ["Cargo", "Export", "DDD", { v: "\u22120.475** (0.236)", cls: "neg" }, "0.049"], ["Dry bulk", "Export", "DDD", { v: "\u22120.806** (0.338)", cls: "neg" }, "0.021"]]) +
        subTable("Group III", [["RORO", "Export", "DID", { v: "\u22122.385*** (0.637)", cls: "neg" }, "<0.001"], ["Container", "Port calls", "DDD", "1.849*** (0.696)", "0.010"]]) +
      "</div>" +
      fig("redsea-heatmap-did.png", 2234, 2863, "Full DID decomposition: E_geo \u00d7 post coefficients for all 18 cargo and service subcategories (plus aggregates) by corridor group. Blue negative, red positive, zero-centered; dashed outlines mark notable estimates, stars denote raw significance.") +
      fig("redsea-heatmap-ddd.png", 2234, 2863, "Full DDD decomposition: E_geo \u00d7 E_net \u00d7 post coefficients for all 18 cargo and service subcategories (plus aggregates) by corridor group. Same color scale and conventions as the DID panel.") +
      note("Stars reflect raw port-clustered p-values and are not FDR-adjusted."));

    // ── NETWORK MODERATION ──
    H += sec("Network Moderation", "Connectivity Was Not a Universal Shield",
      p("The evidence on network moderation is more nuanced than a broad triple-difference narrative would suggest. The supplementary Group II port-calls DDD result indicates that baseline network position was associated with how geographic exposure translated into short-run operational adjustment within that basin.") +
      p("The absence of equally strong and robust DDD effects across the rest of the aggregate outcome matrix indicates that the role of connectivity varied by adjustment margin. Alternative routes and connectivity may improve substitution in some settings while also intensifying hub dependence, cascading congestion, and coordination pressure in others.") +
      eq("", '&part;Y<sub>it</sub> / &part;E<sub>geo,i</sub> = &beta;<sub>k</sub> + &delta;<sub>k</sub>E<sub>net,i</sub>') +
      '<div class="rs-pivot"><div class="rs-pivot-k">Conceptual interpretation of the DDD interaction</div><div class="rs-pivot-row"><span>Lower connectivity</span><span>Median</span><span>Higher connectivity</span></div><div class="rs-pivot-bar"><span class="rs-pivot-line"></span></div></div>' +
      note("Conceptual, not an estimated empirical schedule."));

    // ── ROBUSTNESS ──
    H += sec("Robustness", "A Cautious Hierarchy of Evidence",
      table([{ h: "Sample" }, { h: "Outcome" }, { h: "Effect" }, { h: "Baseline p", num: 1 }, { h: "Drop-top1 p", num: 1 }, { h: "Raw-std p", num: 1 }, { h: "Placebo p", num: 1 }, { h: "Status" }],
        [["Pooled (ALL)", "Export", "DID", "0.022", "0.021", "0.019", "0.000", { v: "Stable", cls: "ok" }],
         ["Group I", "Port calls", "DID", "0.018", "0.018", "0.020", "0.000", { v: "Stable", cls: "ok" }],
         ["Group I", "Export", "DID", "0.078", "0.078", "0.075", "0.000", { v: "Mixed", cls: "mix" }],
         ["Group II", "Import", "DID", "0.003", "0.002", "0.003", "0.000", { v: "Stable", cls: "ok" }],
         ["Group II", "Port calls", "DDD", "0.000", "0.009", "0.000", "0.070", { v: "Supplementary", cls: "sup" }],
         ["Group II", "Export", "DDD", "0.018", "0.059", "0.018", "0.040", { v: "Mixed", cls: "mix" }]]) +
      p("The three principal DID findings remain stable across the retained robustness checks. The pooled export gradient, Group I port-calls gradient, and Group II import gradient remain statistically significant after excluding the largest pre-shock port and after replacing the baseline exposure variables with raw-standardized alternatives.") +
      p("In 200 exposure randomizations, none of the randomized assignments equaled or exceeded the observed estimates in absolute value for these three DID findings. These diagnostics indicate that the results are not driven solely by a dominant port, one particular scaling choice, or exposure assignments that are easily reproduced under random reshuffling.") +
      p("Supplementary findings are more mixed. The Group I export result remains significant at the 10% level. The Group II port-calls DDD remains significant in the baseline and both re-estimation checks, but its exposure-placebo diagnostic does not meet the 5% threshold. The robustness analysis therefore supports a cautious empirical hierarchy rather than a uniform set of strong findings.") + '<div class="rs-iviz" data-rsviz="evidence"></div>');

    // ── INTERPRETATION ──
    H += sec("Interpretation", "Different Corridors Adjusted Along Different Margins",
      p("The central implication is that the Red Sea crisis did not produce a single system-wide port response in the exact-match corridor sample. Different margins dominate in different corridors.") +
      p("The pooled export coefficient captures a within-basin differential in relative export activity between more- and less-exposed ports. Group I is characterized mainly by operational reallocation in port calls, while Group II is characterized by contraction in import activity.") +
      p("The cargo and service results reinforce this interpretation. The pooled export gradient is concentrated in dry-bulk exports. Group I combines operational adjustment with selective strengthening in RORO exports. Group II combines import weakness with supplementary evidence of network-sensitive reallocation in cargo and container port calls.") +
      p("Route geometry alone is therefore insufficient to summarize observed adjustment. Outcome categories, service roles, and network position also matter.") +
      '<div class="rs-corridors">' +
        '<div class="rs-corr"><div class="rs-corr-k">Pooled</div><div class="rs-corr-v">Export gradient, dry-bulk concentrated</div></div>' +
        '<div class="rs-corr accent"><div class="rs-corr-k">Group I</div><div class="rs-corr-v">Operational reallocation in port calls</div></div>' +
        '<div class="rs-corr accent"><div class="rs-corr-k">Group II</div><div class="rs-corr-v">Import contraction</div></div>' +
        '<div class="rs-corr"><div class="rs-corr-k">Group III</div><div class="rs-corr-v">Selective subtype evidence</div></div>' +
      "</div>");

    // ── IMPLICATIONS ──
    H += sec("Implications", "Vulnerability Cannot Be Summarized by One Pooled Gradient",
      p("Vulnerability assessment should not rely on the pooled-sample gradient alone. A planner focusing only on the positive pooled export gradient would miss that one corridor showed mainly service reallocation while another showed a clear decline in import activity.") +
      p("A strategy based only on physical rerouting costs would also overlook the limited but relevant role of network position in some operational adjustments.") +
      p("For port authorities and carriers, the results support mapping vulnerability separately across trade-volume exposure, service-reallocation exposure, and network-role exposure.") +
      '<div class="rs-layers"><div class="rs-layer">Trade-volume exposure</div><div class="rs-layer">Service-reallocation exposure</div><div class="rs-layer">Network-role exposure</div></div>' +
      note("Implication for vulnerability mapping. Not a validated index produced by the paper."));

    // ── LIMITATIONS ──
    H += sec("Research Boundaries", "What the Study Does Not Claim",
      p("The estimates capture relative differences within the exact-match corridor sample, not responses of all ports worldwide.") +
      p("Exact matching improves measurement alignment between PortWatch and PLSCI for retained ports, but it narrows external validity because the matched ports are larger and better connected than the typical corridor port.") +
      p("The exposure measure is a stylized Europe-oriented rerouting penalty. It does not directly observe realized Red Sea cargo exposure or pre-crisis cargo shares.") +
      p("The design can be adapted to other chokepoints only with episode-specific rerouting measures and comparable port-level exposure data.") +
      p("The paper documents heterogeneous exposure-gradient adjustment in this Red Sea episode. It does not demonstrate universal port resilience or a portable Cape-versus-Suez mechanism.") +
      '<ul class="rs-limits"><li>Not a worldwide average treatment effect</li><li>Not a universal port-resilience index</li><li>Not direct cargo-route exposure</li><li>Exact-match sample favours larger ports</li><li>External validity is episode- and measurement-specific</li></ul>');

    // ── CONCLUSION ──
    H += sec("Conclusion", "Maritime Chokepoint Shocks Should Not Be Reduced to One Average Port Effect",
      p("The Red Sea crisis generated heterogeneous port adjustment across corridors, outcomes, and time horizons.") +
      p("Higher geographic exposure was associated with lower relative imports in the Southeast Asia gateway corridor. The Red Sea-Gulf-western Indian Ocean corridor showed mainly operational reallocation in port calls. The pooled export gradient was positive but selective and suggestive.") +
      p("Baseline network connectivity shaped some short-run operational gradients but did not consistently buffer or amplify geographic exposure.") +
      p("The evidence therefore supports a corridor- and activity-specific interpretation of maritime chokepoint disruption rather than a single system-wide account of port resilience.") +
      quote("<b>The relevant question is not whether ports were affected, but how different ports adjusted along different margins.</b>"));

    // references
    H += '<section class="ca-section rs-sec"><div class="ca-h">Sources</div>' +
      '<p class="ca-p rs-srctext">Built from the supplied working paper and its source files: IMF PortWatch daily port activity, UNCTAD Port Liner Shipping Connectivity Index (PLSCI), IHO Sea Areas basin definitions, and PortWatch port coordinates. Estimates, tables, and figures reproduce values reported in the paper.</p></section>';

    // ── MANUSCRIPT (clean embedded PDF + download) ──
    H += '<section class="ca-section rs-sec rs-pdfsec"><div class="ca-h">Manuscript</div>' +
      '<h3 class="ca-sub">Read or Download the Full Paper</h3>' +
      '<p class="ca-p">The complete working paper, including all derivations, tables, and figures, is embedded below and available to download.</p>' +
      '<div class="rs-pdf">' +
        '<div class="rs-pdf-bar"><span class="rs-pdf-dot" aria-hidden="true"></span><span class="rs-pdf-name">Manuscript \u00b7 Port Adjustment to Maritime Chokepoint Disruption</span>' +
        '<a class="rs-dl" href="manuscript.pdf" download="Pan-RedSea-Manuscript.pdf"><span class="rs-dl-i" aria-hidden="true">\u2193</span> Download PDF</a></div>' +
        '<iframe class="rs-pdf-frame" src="manuscript.pdf#toolbar=0&navpanes=0&statusbar=0&view=FitH" title="Manuscript PDF" loading="lazy"></iframe>' +
      '</div></section>';

    return (
      '<button class="case-close" type="button" aria-label="Close case study"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll rs-scroll"><article class="case-article rs-article">' +
        H +
        '<div class="ca-foot"><span>Research \u00b7 Red Sea Port Adjustment</span><span>Zhenyuan Pan \u00b7 2026</span></div>' +
      "</article></div>"
    );
  };

  function subTable(label, rows) {
    var head = "<thead><tr><th>" + label + "</th><th>Outcome</th><th>Effect</th><th class=\"num\">Estimate</th><th class=\"num\">p</th></tr></thead>";
    var body = "<tbody>" + rows.map(function (r) {
      return "<tr>" + r.map(function (v, i) { var num = i >= 3; return "<td" + (num ? ' class="num' + (typeof v === "object" && v.cls ? " " + v.cls : "") + '"' : (typeof v === "object" && v.cls ? ' class="' + v.cls + '"' : "")) + ">" + (typeof v === "object" ? v.v : v) + "</td>"; }).join("") + "</tr>";
    }).join("") + "</tbody>";
    return '<div class="rs-subtable"><table class="rs-table">' + head + body + "</table></div>";
  }

  function heatmap() {
    var rows = ["Exports", "Imports", "Port calls"];
    var cols = ["ALL", "Group I", "Group II", "Group III"];
    // DID panel values from paper (blank where not a reported aggregate cell)
    var did = {
      "Exports": ["+0.73", "+0.73", "", ""],
      "Imports": ["", "", "-1.39", ""],
      "Port calls": ["", "+1.03", "", ""]
    };
    var ddd = {
      "Exports": ["", "", "", ""],
      "Imports": ["", "", "", ""],
      "Port calls": ["", "", "+0.32", ""]
    };
    function panel(title, data) {
      var h = '<div class="rs-hm"><div class="rs-hm-t">' + title + '</div><div class="rs-hm-grid">';
      h += '<span class="rs-hm-corner"></span>' + cols.map(function (c) { return '<span class="rs-hm-col">' + c + "</span>"; }).join("");
      rows.forEach(function (r) {
        h += '<span class="rs-hm-row">' + r + "</span>";
        data[r].forEach(function (v) {
          var cls = "z"; if (v.indexOf("-") === 0) cls = "neg"; else if (v.indexOf("+") === 0) cls = "pos";
          h += '<span class="rs-hm-cell ' + cls + '">' + (v || "") + "</span>";
        });
      });
      h += "</div></div>";
      return h;
    }
    return '<div class="rs-heatwrap">' + panel("DID \u00b7 E_geo \u00d7 Post", did) + panel("DDD \u00b7 E_geo \u00d7 E_net \u00d7 Post", ddd) +
      '<div class="rs-tnote">Blue negative, purple-red positive, zero-centered. Cells show reported aggregate coefficients; blank cells are not reported aggregate estimates.</div></div>';
  }
})();
