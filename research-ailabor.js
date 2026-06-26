/* research-ailabor.js : expanded research-detail experience for
   "AI, Creative Labor Substitution, and Structural Unemployment in a DSGE-DMP
   Growth Model" (Research Assistant to Prof. Hongru Tan).

   Exposes:
     window.__ailaborArticle(data) -> full article HTML string (consumed by
        case-study.js, morph "plain").
     window.__ailaborViz.init(scroller) -> renders KaTeX, wires the reading-mode
        / full-derivation switch, sticky index scroll-spy, progress bar, the
        interactive CES comparative-statics widget, the latent-to-observed
        mapping, the formula dictionary, and one-shot diagram reveals.

   Math is typeset with KaTeX (loaded in index.html). TeX is authored with
   String.raw. No empirical results, parameter values, or impulse responses are
   fabricated: interactive widgets are clearly labelled illustrative comparative
   statics or conceptual model responses. Objective voice, no first person.
   No en-dashes or em-dashes in any visible copy (project rule). */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function eq(tex, num) {
    return '<div class="ai-eq"><div class="ai-eqx">\\[' + tex + '\\]</div>' +
      (num ? '<span class="ai-eqn">(' + num + ")</span>" : "") + "</div>";
  }
  function m(tex) { return '<span class="ai-m">\\(' + tex + "\\)</span>"; }
  function sec(id, eyebrow, title, inner) {
    return '<section class="ca-section ai-sec" id="ai-sec-' + id + '" data-ai-label="' + esc(eyebrow) + '">' +
      '<div class="ca-h">' + esc(eyebrow) + "</div>" +
      (title ? '<h3 class="ca-sub ai-h2">' + esc(title) + "</h3>" : "") +
      inner + "</section>";
  }
  function p(t) { return '<p class="ca-p">' + t + "</p>"; }
  function quote(t) { return '<blockquote class="rs-quote">' + t + "</blockquote>"; }
  function callout(t) { return '<div class="rs-callout">' + t + "</div>"; }
  function note(t) { return '<div class="rs-note">' + t + "</div>"; }
  function status(t) { return '<div class="ai-status">' + t + "</div>"; }
  function flow(steps, marks) {
    return '<div class="rs-flow ai-flow">' + steps.map(function (s, i) {
      var cls = marks && marks[i] ? " " + marks[i] : "";
      return (i ? '<span class="rs-flow-arr" aria-hidden="true">\u2192</span>' : "") +
        '<span class="rs-flow-step' + cls + '">' + s + "</span>";
    }).join("") + "</div>";
  }
  function deriv(title, inner) {
    return '<details class="ai-deriv"><summary class="ai-deriv-sum"><span class="ai-deriv-cue">View derivation</span>' +
      esc(title) + "</summary><div class=\"ai-deriv-body\">" + inner + "</div></details>";
  }
  function table(cols, rows, foot) {
    var thead = "<thead><tr>" + cols.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr></thead>";
    var tbody = "<tbody>" + rows.map(function (r) {
      return "<tr>" + r.map(function (v) { return "<td>" + v + "</td>"; }).join("") + "</tr>";
    }).join("") + "</tbody>";
    return '<div class="rs-tablewrap"><table class="rs-table ai-table">' + thead + tbody + "</table>" +
      (foot ? '<div class="rs-tnote">' + foot + "</div>" : "") + "</div>";
  }
  // symbol chip wired to the formula dictionary
  function sym(s, label) { return '<button type="button" class="ai-sym" data-sym="' + esc(s) + '">' + (label || s) + "</button>"; }

  /* ---------- diagrams (SVG, one-shot reveal on view) ---------- */
  function systemDiagram(idSuffix) {
    // closed-economy system: nodes + directed edges, with a propagate pulse
    var nodes = [
      { id: "ai", x: 430, y: 60, t: "AI state a_t", k: "ai" },
      { id: "hh", x: 430, y: 470, t: "Household", k: "hh" },
      { id: "ptask", x: 180, y: 175, t: "Productive task", k: "task" },
      { id: "ctask", x: 680, y: 175, t: "Creative task", k: "task" },
      { id: "ais", x: 430, y: 175, t: "AI services", k: "ai" },
      { id: "out", x: 120, y: 300, t: "Final output", k: "out" },
      { id: "tech", x: 740, y: 300, t: "Technology Z", k: "tech" },
      { id: "mpY", x: 250, y: 300, t: "MP / job value", k: "lab" },
      { id: "mpA", x: 610, y: 300, t: "MP / job value", k: "lab" },
      { id: "vacY", x: 250, y: 390, t: "Vacancies", k: "vac" },
      { id: "vacA", x: 610, y: 390, t: "Vacancies", k: "vac" },
      { id: "matchY", x: 320, y: 455, t: "Matching", k: "match" },
      { id: "matchA", x: 540, y: 455, t: "Matching", k: "match" },
      { id: "urY", x: 250, y: 520, t: "Unemployment Y", k: "ur" },
      { id: "urA", x: 610, y: 520, t: "Unemployment A", k: "ur" }
    ];
    var edges = [
      ["ai", "ais"], ["ai", "ptask"], ["ai", "ctask"], ["ais", "ptask"], ["ais", "ctask"],
      ["ptask", "out"], ["ptask", "mpY"], ["ctask", "tech"], ["ctask", "mpA"],
      ["tech", "ptask"], ["mpY", "vacY"], ["mpA", "vacA"], ["vacY", "matchY"], ["vacA", "matchA"],
      ["matchY", "urY"], ["matchA", "urA"], ["out", "hh"], ["urY", "hh"], ["urA", "hh"], ["hh", "ai"]
    ];
    function node(n) { return nodes.filter(function (x) { return x.id === n; })[0]; }
    var svg = '<svg class="ai-sysmap" viewBox="0 0 860 580" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Closed general-equilibrium system: AI state, productive and creative tasks, technology, job values, vacancies, matching, employment, unemployment, and the household">';
    svg += '<rect x="0" y="0" width="860" height="580" rx="14" fill="#f7f9fc"/>';
    edges.forEach(function (e, i) {
      var a = node(e[0]), b = node(e[1]);
      svg += '<path class="ai-edge" data-i="' + i + '" d="M' + a.x + "," + a.y + " L" + b.x + "," + b.y + '"/>';
    });
    nodes.forEach(function (n) {
      svg += '<g class="ai-snode ai-snode-' + n.k + '">' +
        '<rect x="' + (n.x - 62) + '" y="' + (n.y - 17) + '" width="124" height="34" rx="8"/>' +
        '<text x="' + n.x + '" y="' + (n.y + 4) + '" text-anchor="middle">' + n.t + "</text></g>";
    });
    svg += "</svg>";
    return '<figure class="ai-figure"><div class="ai-diagram" data-ai-diagram="system-' + idSuffix + '">' + svg +
      '<button type="button" class="ai-diagram-btn" data-ai-propagate="1">Propagate AI shock</button></div>' +
      '<figcaption class="rs-cap">One closed system. An AI disturbance branches through services, tasks, technology, job values, vacancies, matching, and employment before returning through the household. Conceptual; no estimated magnitudes.</figcaption></figure>';
  }

  function channelTiming() {
    // four conceptual response paths drawn on reveal (different shapes/speeds)
    var w = 760, h = 300, x0 = 70, x1 = 720, y0 = 40, y1 = 250, base = 170;
    function X(t) { return x0 + (x1 - x0) * t; }
    function lab(x, y, t, cls) { return '<text x="' + x + '" y="' + y + '" class="ai-tl-lab ' + (cls || "") + '">' + t + "</text>"; }
    var svg = '<svg class="ai-timing" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Conceptual timing of four AI channels">';
    svg += '<line x1="' + x0 + '" y1="' + base + '" x2="' + x1 + '" y2="' + base + '" class="ai-axis"/>';
    svg += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + y1 + '" class="ai-axis"/>';
    // effective price: immediate downward step then flat
    svg += '<path class="ai-tl ai-tl-price" d="M' + x0 + "," + base + " L" + X(0.06) + "," + base + " L" + X(0.08) + "," + (base + 55) + " L" + x1 + "," + (base + 55) + '"/>';
    // applicability: smooth logistic up
    svg += '<path class="ai-tl ai-tl-omega" d="M' + x0 + "," + base + " C" + X(0.3) + "," + base + " " + X(0.35) + "," + (base - 70) + " " + x1 + "," + (base - 78) + '"/>';
    // new-task value: gradual linear-ish up
    svg += '<path class="ai-tl ai-tl-gamma" d="M' + x0 + "," + base + " C" + X(0.5) + "," + (base - 6) + " " + X(0.7) + "," + (base - 34) + " " + x1 + "," + (base - 52) + '"/>';
    // mismatch: delayed then accumulating down
    svg += '<path class="ai-tl ai-tl-m" d="M' + x0 + "," + base + " L" + X(0.32) + "," + base + " C" + X(0.55) + "," + base + " " + X(0.7) + "," + (base + 38) + " " + x1 + "," + (base + 64) + '"/>';
    svg += lab(x1 - 4, base + 50, "effective price", "price");
    svg += lab(x1 - 4, base - 84, "task applicability", "omega");
    svg += lab(x1 - 4, base - 58, "new-task value", "gamma");
    svg += lab(x1 - 4, base + 78, "mismatch", "m");
    svg += lab(x0 + 4, y0 - 12, "response", "axis");
    svg += lab(x1, y1 + 22, "time after AI shock", "axis");
    svg += "</svg>";
    return '<figure class="ai-figure"><div class="ai-diagram" data-ai-diagram="timing">' + svg + "</div>" +
      '<figcaption class="rs-cap">Conceptual model responses, not estimated impulse responses. The effective price responds immediately, applicability adjusts smoothly, new-task value builds gradually, and mismatch accumulates with a delay.</figcaption></figure>';
  }

  function matchingDiagram() {
    var svg = '<svg class="ai-match" viewBox="0 0 760 320" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Conceptual search and matching: unemployed workers, vacancies, completed matches, separations, and mismatch">';
    svg += '<rect x="0" y="0" width="760" height="320" rx="12" fill="#f7f9fc"/>';
    svg += '<text x="120" y="40" class="ai-mh">Unemployed U</text><text x="640" y="40" class="ai-mh">Vacancies V</text><text x="380" y="40" class="ai-mh">Matches M</text>';
    var uy = [80, 130, 180, 230, 280], vy = [90, 150, 210, 270];
    uy.forEach(function (y, i) { svg += '<circle class="ai-worker" data-i="' + i + '" cx="120" cy="' + y + '" r="13"/>'; });
    vy.forEach(function (y, i) { svg += '<rect class="ai-vac" data-i="' + i + '" x="610" y="' + (y - 13) + '" width="30" height="26" rx="4"/>'; });
    // candidate links
    var links = [[80, 90], [130, 90], [130, 150], [180, 210], [230, 210], [230, 270], [280, 270]];
    links.forEach(function (l, i) {
      var made = (i % 2 === 0);
      svg += '<path class="ai-link ' + (made ? "made" : "miss") + '" data-i="' + i + '" d="M133,' + l[0] + " C360," + l[0] + " 400," + l[1] + " 607," + l[1] + '"/>';
    });
    svg += '<text x="380" y="300" class="ai-mnote">Higher tightness raises job finding and lowers vacancy filling. Mismatch lowers completed matches.</text>';
    svg += "</svg>";
    return '<figure class="ai-figure"><div class="ai-diagram" data-ai-diagram="matching">' + svg + "</div>" +
      '<figcaption class="rs-cap">Conceptual matching dynamics. Solid links become matches that enter next-period employment; dashed links fail. Separations return workers to unemployment.</figcaption></figure>';
  }

  function cesWidget() {
    return '<div class="ai-ces" data-ai-ces="1">' +
      '<div class="ai-ces-head"><span class="ai-iv-tag">Interactive</span><span class="ai-iv-title">CES task composition: illustrative comparative statics</span></div>' +
      '<div class="ai-ces-tabs"><button type="button" class="on" data-task="Y">Productive labor (Y)</button><button type="button" data-task="A">Creative labor (A)</button></div>' +
      '<div class="ai-ces-grid">' +
        '<div class="ai-ces-controls">' +
          '<label class="ai-ctl"><span class="ai-ctl-k">AI weight ' + m(String.raw`\omega_e`) + '</span><input type="range" min="0.05" max="0.95" step="0.01" value="0.35" data-ces="omega"><b data-out="omega">0.35</b></label>' +
          '<label class="ai-ctl"><span class="ai-ctl-k">Elasticity ' + m(String.raw`\varepsilon_e`) + '</span><input type="range" min="0.3" max="4" step="0.05" value="1.6" data-ces="eps"><b data-out="eps">1.60</b></label>' +
          '<label class="ai-ctl"><span class="ai-ctl-k">AI input ' + m(String.raw`R_e`) + '</span><input type="range" min="0.2" max="3" step="0.05" value="1" data-ces="R"><b data-out="R">1.00</b></label>' +
          '<div class="ai-ces-readout"><div><span>Curvature ' + m(String.raw`\rho_e^{CES}`) + '</span><b data-out="rho">0.38</b></div>' +
            '<div><span>Task output ' + m(String.raw`Q_e`) + '</span><b data-out="Q">1.00</b></div>' +
            '<div><span>Labor MP ' + m(String.raw`MP_{e}`) + '</span><b data-out="mp">0.65</b></div>' +
            '<div class="ai-ces-tech"><span>Creative link</span><b data-out="tech">to ' + m(String.raw`Z_{t+1}`) + '</b></div></div>' +
        '</div>' +
        '<div class="ai-ces-bars">' +
          '<div class="ai-bar"><span class="ai-bar-k">Labor contribution</span><div class="ai-bar-t"><i data-bar="lab"></i></div></div>' +
          '<div class="ai-bar"><span class="ai-bar-k">AI contribution</span><div class="ai-bar-t"><i data-bar="ai"></i></div></div>' +
          '<div class="ai-bar"><span class="ai-bar-k">Task output</span><div class="ai-bar-t"><i data-bar="Q"></i></div></div>' +
          '<div class="ai-bar"><span class="ai-bar-k">Labor marginal product</span><div class="ai-bar-t"><i data-bar="mp"></i></div></div>' +
        '</div>' +
      '</div>' +
      '<div class="rs-cap">Illustrative comparative statics from the CES aggregator with normalized labor input. No estimated parameter values; the widget shows how task composition and the marginal product move with the AI weight, the elasticity, and AI input.</div>' +
    "</div>";
  }

  function latentWidget() {
    return '<div class="ai-l2o" data-ai-l2o="1">' +
      '<div class="ai-ces-head"><span class="ai-iv-tag">Interactive</span><span class="ai-iv-title">Latent variable to observable mapping</span></div>' +
      '<div class="ai-l2o-grid"><div class="ai-l2o-list" role="tablist"></div><div class="ai-l2o-panel"></div></div>' +
      '<div class="rs-cap">Selecting a latent model variable shows its structural role, its measurement equation, the required observable, and the parameter groups that depend on it. Datasets are not named until selected for the research.</div>' +
    "</div>";
  }

  function dictionaryPanel() {
    return '<div class="ai-dict" data-ai-dict="1"><div class="ai-dict-chips"></div><div class="ai-dict-info"><div class="ai-dict-empty">Select a symbol to see its definition, interpretation, and the equations where it appears.</div></div></div>';
  }

  /* ---------- article ---------- */
  window.__ailaborArticle = function (data) {
    var H = "";

    /* reading controls (sticky) */
    H += '<div class="ai-controls" data-ai-controls="1">' +
      '<div class="ai-modeswitch" role="group" aria-label="Reading mode">' +
        '<button type="button" class="on" data-mode="reading">Reading mode</button>' +
        '<button type="button" data-mode="full">Full derivation</button>' +
      '</div>' +
      '<nav class="ai-index" aria-label="Section index"></nav>' +
    "</div>";
    H += '<div class="ai-progress" data-ai-progress="1"><i></i></div>';

    /* HERO */
    H += '<section class="ca-section ai-sec ai-hero" id="ai-sec-hero" data-ai-label="Research Role">' +
      '<div class="ca-kicker">Macro-Labor Theory \u00b7 Structural Macroeconomics</div>' +
      '<h1 class="ca-title">AI, Creative Labor Substitution, and Structural Unemployment in a DSGE-DMP Growth Model</h1>' +
      '<div class="ai-role">Research Assistant to Prof. Hongru Tan</div>' +
      '<div class="ca-ymeta">Ongoing research \u00b7 Theoretical model and labor-market closure developed \u00b7 Empirical implementation in progress</div>' +
      quote("Contributed to the theoretical derivation and labor-market closure of the DSGE-DMP framework. Leads the full empirical implementation, including data construction, model-to-data mapping, structural estimation, model validation, and counterfactual analysis.") +
      p("The page presents the developed theoretical system and estimation design. Parameter estimation, model validation, and counterfactual analysis remain in progress.") +
      p("The project develops a dynamic general-equilibrium model of artificial intelligence and structural unemployment. AI enters productive and creative tasks, changes the cost and applicability of AI services, contributes to technology accumulation, creates new tasks, and alters labor-market matching through skill mismatch.") +
      p("These channels affect labor marginal products, filled-job values, vacancy posting, matching probabilities, employment stocks, and unemployment. Their signs and timing differ. The equilibrium response depends on their combined effect.") +
      quote("<b>AI changes unemployment through the value of work, the creation of vacancies, and the process that matches workers to jobs.</b>") +
      systemDiagram("hero") +
    "</section>";

    /* RESEARCH ROLE */
    H += sec("role", "Research Role", "From Model Derivation to Empirical Implementation",
      p("The research is conducted as research assistance to Prof. Hongru Tan. The role covers theoretical derivation, labor-market closure, and the design of the structural estimation system.") +
      p("The theoretical work includes the AI transmission process, productive and creative CES tasks, technology accumulation, AI-service demand, labor marginal products, DMP matching, job values, vacancy creation, wage bargaining, and the general-equilibrium resource constraint.") +
      p("The empirical work covers data construction, classification of productive and creative labor, model-to-data mapping, selection of calibrated and estimated parameters, structural estimation, validation, and counterfactual design.") +
      p("The theoretical system has been developed. The empirical implementation is underway.") +
      flow(["Theory derivation", "Labor-market closure", "Nonlinear system", "Log-linear system", "Data mapping", "Estimation", "Validation", "Counterfactuals"],
        ["done", "done", "done", "done", "wip", "wip", "wip", "wip"]) +
      note("Stages marked in magenta are developed. Remaining stages are in progress."));

    /* RESEARCH QUESTION */
    H += sec("question", "The Research Question", "How Does an AI Shock Reach Unemployment?",
      p("An improvement in AI capability affects several parts of the economy at the same time.") +
      p("Higher task applicability can reduce labor's weight inside productive and creative tasks. Lower effective AI costs can expand AI-service use. AI-assisted research can raise future technology. New tasks can increase the value of employment. Skill mismatch can reduce the efficiency of matching workers to vacancies.") +
      p("Each mechanism enters a different equation. Their combined effect determines vacancy creation, matching, employment, and unemployment.") +
      eq(String.raw`a_t \longrightarrow \left\{\, \widetilde P_t^{B},\ \omega_{e,t},\ \Gamma_{e,t},\ m_{e,t} \,\right\} \longrightarrow \left\{\, R_{e,t},\ Q_{e,t},\ MP_{e,t},\ \mu_{e,t} \,\right\}`) +
      eq(String.raw`\longrightarrow \left\{\, J_{e,t},\ V_{e,t},\ M_{e,t},\ N_{e,t+1} \,\right\} \longrightarrow UR_{e,t+1}`) +
      '<div class="ai-channels"><div class="ai-chan"><b>Task substitution</b><span>reduces the labor contribution</span></div>' +
      '<div class="ai-chan"><b>Technology accumulation</b><span>raises future productive capacity</span></div>' +
      '<div class="ai-chan"><b>New tasks</b><span>add to job value</span></div>' +
      '<div class="ai-chan"><b>Mismatch</b><span>reduces completed matches</span></div></div>' +
      callout("<b>Equilibrium sign depends on the combined channels.</b>"));

    /* MODEL ARCHITECTURE */
    H += sec("model", "Model Architecture", "A DSGE-DMP Growth Model with Two Labor Markets",
      p("The economy contains a representative household, a final-goods sector, a research sector, AI services, and two search-and-matching labor markets.") +
      p("Productive labor contributes to current final-goods production. Creative labor contributes to research and technology accumulation. AI services enter both tasks.") +
      p("Employment is predetermined at the start of each period. Firms choose AI services and vacancies. Matching determines new employment. Creative-task output changes the future technology stock.") +
      eq(String.raw`e \in \{Y, A\}, \qquad Y:\ \text{productive labor}, \qquad A:\ \text{creative and research labor}`) +
      '<h4 class="ai-h3">Predetermined state vector</h4>' +
      eq(String.raw`S_t = \left( Z_t,\ N_{Y,t},\ N_{A,t},\ a_t,\ m_{Y,t},\ m_{A,t} \right)`) +
      '<h4 class="ai-h3">Controls and endogenous equilibrium variables</h4>' +
      eq(String.raw`X_t = \left( C_t, Y_t, Q_{Y,t}, Q_{A,t}, R_{Y,t}, R_{A,t}, V_{Y,t}, V_{A,t}, M_{Y,t}, M_{A,t}, w_{Y,t}, w_{A,t}, J_{Y,t}, J_{A,t} \right)`) +
      note("Here " + m(String.raw`X_t`) + " collects controls and endogenous equilibrium variables. It is not the predetermined state vector.") +
      '<h4 class="ai-h3">Within-period timing</h4>' +
      eq(String.raw`S_t \rightarrow a_t \rightarrow \left( R_{Y,t}, R_{A,t}, V_{Y,t}, V_{A,t} \right) \rightarrow \left( Y_t, Q_{A,t}, C_t \right) \rightarrow \left( M_{Y,t}, M_{A,t} \right) \rightarrow S_{t+1}`) +
      systemDiagram("arch"));

    /* HOUSEHOLD */
    H += sec("household", "Household", "Consumption and Intertemporal Valuation",
      p("The representative household owns firms and receives wages, unemployment income, profits, and asset returns. Household marginal utility provides the stochastic discount factor used in job values, technology values, and vacancy creation.") +
      eq(String.raw`E_0 \sum_{t=0}^{\infty} \beta^{t}\, \frac{C_t^{1-\sigma}-1}{1-\sigma}`, "H1") +
      eq(String.raw`\lambda_t = C_t^{-\sigma}`, "H2") +
      eq(String.raw`\mathcal{M}_{t,t+1} = \beta\, \frac{\lambda_{t+1}}{\lambda_t}`, "H3") +
      eq(String.raw`C_t + \frac{B_{t+1}}{R_t} = \sum_{e\in\{Y,A\}} w_{e,t} N_{e,t} + \sum_{e\in\{Y,A\}} b_{e,t} U_{e,t} + \Pi_t + B_t - T_t`, "H4") +
      eq(String.raw`B_t = 0 \quad \text{(aggregate bond market)}`, "H5") +
      note("Marginal utility, the discount factor, and labor and unemployment income link the household to job values, vacancy creation, and the resource constraint."));

    /* AI TECHNOLOGY */
    H += sec(" aitech".trim(), "AI Technology", "One AI State, Several Structural Effects",
      p("A common state " + m(String.raw`a_t`) + " summarizes changes in AI capability. It changes the effective price of AI services, the applicability of AI inside each task, the value created by new tasks, and the degree of skill mismatch.") +
      p("The first three channels enter firm and job-value decisions. Skill mismatch enters the matching technology.") +
      eq(String.raw`a_{t+1} = \rho_a\, a_t + \varepsilon^{a}_{t+1}`, "A1") +
      eq(String.raw`\widetilde P_t^{B} = \bar P^{B}\, \exp(-\chi_p\, a_t)`, "A2") +
      eq(String.raw`\omega_{e,t} = \Lambda\!\left( \bar\omega_e + \chi_{\omega,e}\, a_t \right), \qquad \Lambda(x) = \frac{1}{1+\exp(-x)}`, "A3") +
      eq(String.raw`\Gamma_{e,t} = \bar\Gamma_e\, \exp(\chi_{\Gamma,e}\, a_t)`, "A4") +
      eq(String.raw`m_{e,t+1} = \rho_e^{m}\, m_{e,t} + \chi_e^{m}\, a_t + \varepsilon^{m}_{e,t+1}`, "A5") +
      eq(String.raw`\mu_{e,t} = \bar\mu_e\, \exp(-\chi_e^{\mu}\, m_{e,t})`, "A6") +
      channelTiming() +
      callout("<b>Conceptual model responses. No estimated impulse responses and no numerical parameter values.</b>"));

    /* TASKS */
    H += sec("tasks", "Task Production", "AI Enters Current Production and Knowledge Production",
      p("Productive and creative tasks use separate CES aggregators. The productive task determines current output. The creative task changes the technology available in the next period.") +
      p("AI can reduce the direct labor weight inside either task. Greater AI use can also expand total task output. Labor demand reflects both forces.") +
      eq(String.raw`Y_t = Z_t\, Q_{Y,t}`, "T1") +
      eq(String.raw`Q_{Y,t} = \left[ (1-\omega_{Y,t})\, N_{Y,t}^{\rho_Y^{CES}} + \omega_{Y,t}\, R_{Y,t}^{\rho_Y^{CES}} \right]^{1/\rho_Y^{CES}}`, "T2") +
      eq(String.raw`Q_{A,t} = \left[ (1-\omega_{A,t})\, N_{A,t}^{\rho_A^{CES}} + \omega_{A,t}\, R_{A,t}^{\rho_A^{CES}} \right]^{1/\rho_A^{CES}}`, "T3") +
      eq(String.raw`\rho_e^{CES} = \frac{\varepsilon_e - 1}{\varepsilon_e}`, "T4") +
      eq(String.raw`Z_{t+1} = Z_t \left[ 1 - \delta_Z + \phi\, Q_{A,t} \right]`, "T5") +
      cesWidget() +
      deriv("CES derivatives, steady-state shares, and the log-linear task equation",
        eq(String.raw`\frac{\partial Q_{e,t}}{\partial R_{e,t}} = \omega_{e,t} \left( \frac{Q_{e,t}}{R_{e,t}} \right)^{1-\rho_e^{CES}}`, "D1") +
        eq(String.raw`\frac{\partial Q_{e,t}}{\partial N_{e,t}} = (1-\omega_{e,t}) \left( \frac{Q_{e,t}}{N_{e,t}} \right)^{1-\rho_e^{CES}}`, "D2") +
        eq(String.raw`s_e^{R} = \frac{\bar\omega_e\, \bar R_e^{\rho_e^{CES}}}{(1-\bar\omega_e)\, \bar N_e^{\rho_e^{CES}} + \bar\omega_e\, \bar R_e^{\rho_e^{CES}}}, \qquad s_e^{N} = 1 - s_e^{R}`, "D3") +
        eq(String.raw`\kappa_e^{Q} = \frac{ \dfrac{s_e^{R}}{1-\bar\omega_e} - \dfrac{s_e^{N}}{\bar\omega_e} }{ \rho_e^{CES} }`, "D4") +
        eq(String.raw`\widehat Q_{e,t} = s_e^{N}\, \widehat N_{e,t} + s_e^{R}\, \widehat R_{e,t} + \kappa_e^{Q}\, \chi_{\omega,e}\, \widehat a_t`, "D5") +
        p("Task output responds to the employment stock, AI-service use, and the AI-driven change in task applicability.")));

    /* FIRM OPTIMIZATION / AI SERVICE DEMAND */
    H += sec("firm", "Firm Optimization", "AI Use Follows a Firm First-Order Condition",
      p("Firms choose AI services by equating their marginal contribution inside a task with the effective AI-service price.") +
      p("Current productivity determines the shadow value of the productive task. The discounted future value of technology determines the shadow value of the creative task.") +
      eq(String.raw`V_t^{Z} = Q_{Y,t} + E_t\left[ \mathcal{M}_{t,t+1}\, V_{t+1}^{Z} \left( 1 - \delta_Z + \phi\, Q_{A,t} \right) \right]`, "F1") +
      eq(String.raw`P_{A,t}^{Q} = E_t\left[ \mathcal{M}_{t,t+1}\, V_{t+1}^{Z}\, \phi\, Z_t \right]`, "F2") +
      eq(String.raw`P_{e,t}^{Q}\, \frac{\partial Q_{e,t}}{\partial R_{e,t}} = \widetilde P_t^{B} \quad\Rightarrow\quad P_{e,t}^{Q}\, \omega_{e,t} \left( \frac{Q_{e,t}}{R_{e,t}} \right)^{1-\rho_e^{CES}} = \widetilde P_t^{B}`, "F3") +
      eq(String.raw`Z_t\, \omega_{Y,t} \left( \frac{Q_{Y,t}}{R_{Y,t}} \right)^{1-\rho_Y^{CES}} = \widetilde P_t^{B}`, "F4") +
      eq(String.raw`P_{A,t}^{Q}\, \omega_{A,t} \left( \frac{Q_{A,t}}{R_{A,t}} \right)^{1-\rho_A^{CES}} = \widetilde P_t^{B}`, "F5") +
      note("When the effective AI-service price falls, AI input adjusts until the marginal task value of AI services again equals the price.") +
      deriv("AI-demand log-linearization and the combined task equation",
        p("Let " + m(String.raw`\Omega_{e,t}`) + " denote the logit index underlying " + m(String.raw`\omega_{e,t}`) + ":") +
        eq(String.raw`\Omega_{e,t} = \bar\omega_e^{\,index} + \chi_{\omega,e}\, a_t, \qquad \widehat\Omega_{e,t} = \chi_{\omega,e}\, \widehat a_t, \qquad \widehat{\widetilde P}_t^{B} = -\chi_p\, \widehat a_t`, "L1") +
        eq(String.raw`\widehat P_{e,t}^{Q} + (1-\bar\omega_e)\, \widehat\Omega_{e,t} + (1-\rho_e^{CES})\left( \widehat Q_{e,t} - \widehat R_{e,t} \right) = \widehat{\widetilde P}_t^{B}`, "L2") +
        eq(String.raw`\widehat R_{e,t} = \widehat Q_{e,t} + \frac{ \widehat P_{e,t}^{Q} + \left[ (1-\bar\omega_e)\chi_{\omega,e} + \chi_p \right] \widehat a_t }{ 1 - \rho_e^{CES} }`, "L3") +
        eq(String.raw`\alpha_e^{P} = \frac{ s_e^{R} }{ s_e^{N}(1-\rho_e^{CES}) }, \qquad \alpha_e^{a} = \frac{ s_e^{R}\left[ (1-\bar\omega_e)\chi_{\omega,e} + \chi_p \right] }{ s_e^{N}(1-\rho_e^{CES}) } + \frac{ \kappa_e^{Q}\chi_{\omega,e} }{ s_e^{N} }`, "L4") +
        eq(String.raw`\widehat Q_{e,t} = \widehat N_{e,t} + \alpha_e^{P}\, \widehat P_{e,t}^{Q} + \alpha_e^{a}\, \widehat a_t`, "L5") +
        p("This equation links employment, task shadow value, and the AI state to equilibrium task output.")) +
      deriv("Technology accumulation in log-linear form",
        eq(String.raw`\varpi_Z = \frac{ \phi\, \bar Q_A }{ 1 - \delta_Z + \phi\, \bar Q_A }, \qquad \widehat Z_{t+1} = \widehat Z_t + \varpi_Z\, \widehat Q_{A,t}`, "L6") +
        p("Creative-task output enters the next-period technology state.")));

    /* LABOR MARGINAL PRODUCTS */
    H += sec("mp", "Labor Demand", "Task Structure Determines the Value of Labor",
      p("The task aggregators determine the marginal products of productive and creative labor.") +
      p("Higher AI applicability reduces the direct labor weight. Higher task output can raise the task-output-to-labor ratio. The equilibrium marginal product reflects both movements.") +
      eq(String.raw`MP_{Y,t} = Z_t\, (1-\omega_{Y,t}) \left( \frac{Q_{Y,t}}{N_{Y,t}} \right)^{1-\rho_Y^{CES}}`, "M1") +
      eq(String.raw`MP_{A,t} = P_{A,t}^{Q}\, (1-\omega_{A,t}) \left( \frac{Q_{A,t}}{N_{A,t}} \right)^{1-\rho_A^{CES}}`, "M2") +
      '<div class="ai-decomp"><span>Direct labor-weight effect</span><span>Task-expansion effect</span><span>Technology or shadow-value effect</span></div>' +
      deriv("Marginal-product log-linearization",
        eq(String.raw`\widehat{MP}_{e,t} = \widehat P_{e,t}^{Q} - \bar\omega_e\, \chi_{\omega,e}\, \widehat a_t + (1-\rho_e^{CES})\left( \widehat Q_{e,t} - \widehat N_{e,t} \right)`, "M3") +
        eq(String.raw`\widehat Q_{e,t} - \widehat N_{e,t} = \alpha_e^{P}\, \widehat P_{e,t}^{Q} + \alpha_e^{a}\, \widehat a_t`, "M4") +
        eq(String.raw`\beta_e^{P} = 1 + (1-\rho_e^{CES})\, \alpha_e^{P}, \qquad \beta_e^{a} = -\bar\omega_e\, \chi_{\omega,e} + (1-\rho_e^{CES})\, \alpha_e^{a}`, "M5") +
        eq(String.raw`\widehat{MP}_{e,t} = \beta_e^{P}\, \widehat P_{e,t}^{Q} + \beta_e^{a}\, \widehat a_t, \qquad \widehat P_{Y,t}^{Q} = \widehat Z_t`, "M6") +
        p("For creative labor, " + m(String.raw`\widehat P_{A,t}^{Q}`) + " follows from the technology-shadow-value block.")));

    /* DMP LABOR MARKET */
    H += sec("dmp", "DMP Labor Market", "Vacancies and Matching Determine Employment",
      p("Each labor type has a separate search-and-matching market. The labor force " + m(String.raw`L_e`) + " is fixed in the baseline. Employment is predetermined at the start of the period. Firms choose vacancies. Matching produces new jobs that enter next-period employment.") +
      eq(String.raw`L_e = \bar L_e, \qquad U_{e,t} = L_e - N_{e,t}`, "P1") +
      eq(String.raw`M_{e,t} = \mu_{e,t}\, U_{e,t}^{\xi_e}\, V_{e,t}^{1-\xi_e}, \qquad \theta_{e,t} = \frac{V_{e,t}}{U_{e,t}}`, "P2") +
      eq(String.raw`p_{e,t} = \frac{M_{e,t}}{U_{e,t}} = \mu_{e,t}\, \theta_{e,t}^{1-\xi_e}, \qquad q_{e,t} = \frac{M_{e,t}}{V_{e,t}} = \mu_{e,t}\, \theta_{e,t}^{-\xi_e}`, "P3") +
      eq(String.raw`N_{e,t+1} = (1-s_e)\, N_{e,t} + M_{e,t}`, "P4") +
      eq(String.raw`UR_{e,t} = 1 - \frac{N_{e,t}}{L_e}`, "P5") +
      eq(String.raw`UR_t = \Omega_Y\, UR_{Y,t} + \Omega_A\, UR_{A,t}, \qquad \Omega_e = \frac{L_e}{L_Y + L_A}`, "P6") +
      table(["Component", "Condition"], [
        ["Labor force", m(String.raw`L_e = \bar L_e`)],
        ["Unemployment", m(String.raw`U_{e,t} = L_e - N_{e,t}`)],
        ["Matching", m(String.raw`M_{e,t} = \mu_{e,t} U_{e,t}^{\xi_e} V_{e,t}^{1-\xi_e}`)],
        ["Tightness", m(String.raw`\theta_{e,t} = V_{e,t}/U_{e,t}`)],
        ["Job finding", m(String.raw`p_{e,t} = \mu_{e,t}\theta_{e,t}^{1-\xi_e}`)],
        ["Vacancy filling", m(String.raw`q_{e,t} = \mu_{e,t}\theta_{e,t}^{-\xi_e}`)],
        ["Employment dynamics", m(String.raw`N_{e,t+1} = (1-s_e)N_{e,t} + M_{e,t}`)],
        ["Vacancy demand", "free-entry condition"],
        ["Wage setting", "Nash bargaining"]
      ], "Employment adjusts through vacancies and matching. The model does not add a contemporaneous " + m(String.raw`N^{d} = N^{s}`) + " condition.") +
      matchingDiagram() +
      eq(String.raw`\theta_{e,t}\uparrow \;\Rightarrow\; p_{e,t}\uparrow, \qquad q_{e,t}\downarrow`) +
      deriv("DMP log-linear block",
        eq(String.raw`\widehat M_{e,t} = \widehat\mu_{e,t} + \xi_e\, \widehat U_{e,t} + (1-\xi_e)\, \widehat V_{e,t}, \qquad \widehat\mu_{e,t} = -\chi_e^{\mu}\, \widehat m_{e,t}`, "G1") +
        eq(String.raw`\widehat\theta_{e,t} = \widehat V_{e,t} - \widehat U_{e,t}, \qquad \widehat p_{e,t} = \widehat\mu_{e,t} + (1-\xi_e)\widehat\theta_{e,t}, \qquad \widehat q_{e,t} = \widehat\mu_{e,t} - \xi_e\widehat\theta_{e,t}`, "G2") +
        eq(String.raw`\bar M_e = s_e\, \bar N_e, \qquad \widehat N_{e,t+1} = (1-s_e)\widehat N_{e,t} + s_e\, \widehat M_{e,t}`, "G3") +
        eq(String.raw`\widehat U_{e,t} = -\frac{\bar N_e}{\bar U_e}\, \widehat N_{e,t}`, "G4") +
        eq(String.raw`\Lambda_{e,t} = \log\!\left( \frac{UR_{e,t}}{1-UR_{e,t}} \right) = \log U_{e,t} - \log N_{e,t}, \qquad \widehat\Lambda_{e,t} = \widehat U_{e,t} - \widehat N_{e,t}`, "G5") +
        eq(String.raw`\bar u_e = \frac{\bar U_e}{L_e}, \qquad \widehat\Lambda_{e,t} = -\frac{1}{\bar u_e}\, \widehat N_{e,t}`, "G6") +
        p("This is the baseline unemployment observation relationship.")));

    /* STEADY STATE */
    H += sec("steady", "Steady State", "The Flow-Balance Unemployment Relationship",
      p("The steady-state flow condition equates job separations with new matches. It provides a compact analytical relationship among unemployment, separation, matching efficiency, and labor-market tightness.") +
      p("Transition dynamics continue to follow the employment law of motion. The steady-state formula serves as an analytical target and a bridge to the semi-structural specification.") +
      eq(String.raw`N_{e,t+1} = N_{e,t} \;\Rightarrow\; s_e N_e = M_e = p_e U_e`, "S1") +
      eq(String.raw`N_e = (1-UR_e)L_e, \quad U_e = UR_e L_e \;\Rightarrow\; s_e(1-UR_e) = p_e UR_e`, "S2") +
      eq(String.raw`UR_e = \frac{s_e}{s_e + p_e} = \frac{s_e}{s_e + \mu_e\, \theta_e^{1-\xi_e}}`, "S3") +
      eq(String.raw`\Lambda_e = \log\!\left( \frac{UR_e}{1-UR_e} \right) = \log s_e - \log\mu_e - (1-\xi_e)\log\theta_e`, "S4") +
      callout("<b>Steady-state analytical relationship.</b> Not the exact transition equation after a shock; transition paths follow the employment law of motion."));

    /* JOB VALUE / VACANCY CREATION */
    H += sec("jobvalue", "Job Creation", "Job Value Drives Vacancy Posting",
      p("A filled job generates a marginal product, requires a wage payment, receives any new-task contribution, and retains a continuation value when the match survives. Firms post vacancies when the expected discounted value of a future filled job covers the vacancy cost.") +
      eq(String.raw`J_{e,t} = MP_{e,t} - w_{e,t} + \Gamma_{e,t} + E_t\left[ \mathcal{M}_{t,t+1}(1-s_e) J_{e,t+1} \right]`, "J1") +
      eq(String.raw`F_{e,t} = MP_{e,t} - w_{e,t} + \Gamma_{e,t}, \qquad \mathcal{J}_{e,t} = E_t\left[ \mathcal{M}_{t,t+1} J_{e,t+1} \right]`, "J2") +
      eq(String.raw`\kappa_e = q_{e,t}\, \mathcal{J}_{e,t} = \mu_{e,t}\, \theta_{e,t}^{-\xi_e}\, \mathcal{J}_{e,t}`, "J3") +
      eq(String.raw`a_t \rightarrow R_{e,t} \rightarrow Q_{e,t} \rightarrow MP_{e,t} \rightarrow J_{e,t} \rightarrow V_{e,t} \rightarrow \theta_{e,t} \rightarrow p_{e,t} \rightarrow N_{e,t+1} \rightarrow UR_{e,t+1}`) +
      note("Substitution reduces the job-value position, new tasks raise it, and lower matching efficiency changes the free-entry balance.") +
      deriv("Job-value log-linearization and the structural unemployment target",
        eq(String.raw`\psi_e^{F} = \frac{\bar F_e}{\bar J_e}, \qquad \psi_e^{J} = \beta(1-s_e), \qquad \psi_e^{F} + \psi_e^{J} = 1`, "K1") +
        eq(String.raw`\psi_e^{MP} = \frac{\overline{MP}_e}{\bar F_e}, \qquad \psi_e^{w} = \frac{\bar w_e}{\bar F_e}, \qquad \psi_e^{\Gamma} = \frac{\bar\Gamma_e}{\bar F_e}`, "K2") +
        eq(String.raw`\widehat J_{e,t} = \psi_e^{F}\left[ \psi_e^{MP}\widehat{MP}_{e,t} - \psi_e^{w}\widehat w_{e,t} + \psi_e^{\Gamma}\chi_{\Gamma,e}\widehat a_t \right] + \psi_e^{J} E_t\left[ \widehat{\mathcal{M}}_{t,t+1} + \widehat J_{e,t+1} \right]`, "K3") +
        eq(String.raw`0 = \widehat q_{e,t} + E_t\left[ \widehat{\mathcal{M}}_{t,t+1} + \widehat J_{e,t+1} \right]`, "K4") +
        eq(String.raw`\widehat q_{e,t} = -\chi_e^{\mu}\widehat m_{e,t} - \xi_e\widehat\theta_{e,t} \;\Rightarrow\; \widehat\theta_{e,t} = -\frac{\chi_e^{\mu}}{\xi_e}\widehat m_{e,t} + \frac{1}{\xi_e} E_t\left[ \widehat{\mathcal{M}}_{t,t+1} + \widehat J_{e,t+1} \right]`, "K5") +
        eq(String.raw`\widehat\Lambda_{e,t}^{\,target} = -\widehat\mu_{e,t} - (1-\xi_e)\widehat\theta_{e,t}`, "K6") +
        eq(String.raw`\widehat\Lambda_{e,t}^{\,target} = \frac{\chi_e^{\mu}}{\xi_e}\widehat m_{e,t} - \frac{1-\xi_e}{\xi_e} E_t\left[ \widehat{\mathcal{M}}_{t,t+1} + \widehat J_{e,t+1} \right]`, "K7") +
        callout("<b>Structural steady-state unemployment target.</b> The transition path is generated by the employment law of motion. The target equation summarizes the vacancy and matching forces associated with a given state.")));

    /* WAGES */
    H += sec("wages", "Wage Determination", "Wages Divide Match Surplus",
      p("Nash bargaining divides the surplus created by a match between the worker and the firm. The worker compares employment with unemployment. The firm values the filled job through " + m(String.raw`J_{e,t}`) + ".") +
      eq(String.raw`W_{e,t}^{E} = w_{e,t} + E_t\left[ \mathcal{M}_{t,t+1}\left( (1-s_e) W_{e,t+1}^{E} + s_e W_{e,t+1}^{U} \right) \right]`, "W1") +
      eq(String.raw`W_{e,t}^{U} = b_{e,t} + E_t\left[ \mathcal{M}_{t,t+1}\left( p_{e,t} W_{e,t+1}^{E} + (1-p_{e,t}) W_{e,t+1}^{U} \right) \right]`, "W2") +
      eq(String.raw`S_{e,t}^{W} = W_{e,t}^{E} - W_{e,t}^{U}, \qquad S_{e,t}^{F} = J_{e,t}`, "W3") +
      eq(String.raw`W_{e,t}^{E} - W_{e,t}^{U} = \frac{\vartheta_e}{1-\vartheta_e}\, J_{e,t}`, "W4"));

    /* GENERAL EQUILIBRIUM */
    H += sec("ge", "General Equilibrium", "Closing the Baseline System",
      p("Household valuation, task production, AI-service demand, technology accumulation, job creation, matching, wage bargaining, employment dynamics, and the resource constraint jointly determine the equilibrium.") +
      p("Creative-task activity changes future technology. Job values determine vacancies. Matching determines future employment. Employment and wages feed into household income and consumption. AI expenditure and vacancy costs absorb final output.") +
      eq(String.raw`Y_t = C_t + \widetilde P_t^{B}\left( R_{Y,t} + R_{A,t} \right) + \kappa_Y V_{Y,t} + \kappa_A V_{A,t}`, "E1") +
      flow(["Household", "Production and Research", "Job Values", "Vacancies", "Matching", "Employment and Wages", "Household"]) +
      deriv("Log-linear resource and discount equations",
        eq(String.raw`\widehat{\mathcal{M}}_{t,t+1} = -\sigma\left( \widehat C_{t+1} - \widehat C_t \right), \qquad \widehat Y_t = \widehat Z_t + \widehat Q_{Y,t}`, "E2") +
        eq(String.raw`s_C = \frac{\bar C}{\bar Y}, \quad s_{R_Y} = \frac{\overline{\widetilde P^{B}}\bar R_Y}{\bar Y}, \quad s_{R_A} = \frac{\overline{\widetilde P^{B}}\bar R_A}{\bar Y}, \quad s_{V_Y} = \frac{\kappa_Y \bar V_Y}{\bar Y}, \quad s_{V_A} = \frac{\kappa_A \bar V_A}{\bar Y}`, "E3") +
        eq(String.raw`s_C + s_{R_Y} + s_{R_A} + s_{V_Y} + s_{V_A} = 1`, "E4") +
        eq(String.raw`\widehat Y_t = s_C\widehat C_t + s_{R_Y}\!\left( \widehat{\widetilde P}_t^{B} + \widehat R_{Y,t} \right) + s_{R_A}\!\left( \widehat{\widetilde P}_t^{B} + \widehat R_{A,t} \right) + s_{V_Y}\widehat V_{Y,t} + s_{V_A}\widehat V_{A,t}`, "E5") +
        eq(String.raw`\widehat{\widetilde P}_t^{B} = -\chi_p\, \widehat a_t`, "E6")));

    /* OPTIONAL PARTICIPATION EXTENSION */
    H += sec("participation", "Optional Participation Extension", "Allowing the Labor Force to Respond",
      status("Extension \u00b7 outside the baseline fixed-labor estimation system") +
      p("The baseline keeps each labor force fixed. A separate extension allows workers to move among employment, active unemployment, and non-participation.") +
      p("This extension is useful when labor-force entry and exit carry independent empirical importance. It requires additional states or controls and a revised observation system.") +
      eq(String.raw`\bar L_e = N_{e,t} + U_{e,t} + O_{e,t}, \qquad L_{e,t} = N_{e,t} + U_{e,t}, \qquad O_{e,t} = \bar L_e - L_{e,t}`, "X1") +
      eq(String.raw`W_{e,t}^{O} = h_{e,t} + E_t\left[ \mathcal{M}_{t,t+1} W_{e,t+1}^{O} \right]`, "X2") +
      eq(String.raw`\frac{\chi_e^{L} L_{e,t}^{\nu_e}}{\lambda_t} = W_{e,t}^{U} - W_{e,t}^{O}`, "X3") +
      note("When this extension is activated, labor-force movements enter unemployment dynamics and measurement equations directly. The baseline fixed-labor formulas remain unchanged elsewhere on the page.") +
      '<h4 class="ai-h3">Optional wage-rigidity extension</h4>' +
      eq(String.raw`w_{e,t} = (1-\rho_e^{w})\, w_{e,t}^{N} + \rho_e^{w}\, w_{e,t-1}`, "X4"));

    /* STRUCTURAL ESTIMATION */
    H += sec("estimation", "Structural Estimation", "Estimating the Joint System",
      p("Full structural estimation treats unemployment as one observable generated by the complete DSGE-DMP system.") +
      p("Task production, AI-service demand, technology accumulation, marginal products, job values, vacancies, matching, wages, employment, and unemployment enter the same estimation problem.") +
      eq(String.raw`\mathcal{F}\!\left( E_t x_{t+1},\ x_t,\ x_{t-1},\ \varepsilon_t;\ \Theta \right) = 0`, "Q1") +
      eq(String.raw`y_t^{obs} = \mathcal{H}\!\left( x_t;\ \Theta \right) + \nu_t`, "Q2") +
      note("Here " + m(String.raw`x_t`) + " collects states, controls, and endogenous equilibrium variables. The page continues to distinguish predetermined states from jump variables and controls.") +
      '<div class="ai-params">' +
        '<div class="ai-pgroup"><b>Task substitution</b>' + eq(String.raw`\varepsilon_Y,\ \varepsilon_A,\ \bar\omega_Y,\ \bar\omega_A`) + "</div>" +
        '<div class="ai-pgroup"><b>Innovation</b>' + eq(String.raw`\phi,\ \delta_Z`) + "</div>" +
        '<div class="ai-pgroup"><b>Matching</b>' + eq(String.raw`\bar\mu_e,\ \xi_e,\ s_e`) + "</div>" +
        '<div class="ai-pgroup"><b>Vacancy and bargaining</b>' + eq(String.raw`\kappa_e,\ \vartheta_e`) + "</div>" +
        '<div class="ai-pgroup"><b>AI channels</b>' + eq(String.raw`\chi_p,\ \chi_{\omega,e},\ \chi_{\Gamma,e},\ \chi_e^{m},\ \chi_e^{\mu}`) + "</div>" +
        '<div class="ai-pgroup"><b>Shock persistence</b>' + eq(String.raw`\rho_a,\ \rho_e^{m}`) + "</div>" +
        '<div class="ai-pgroup"><b>Optional extensions</b>' + eq(String.raw`\rho_e^{w},\ \chi_e^{L},\ \nu_e`) + "</div>" +
      "</div>" +
      note("The final empirical design will divide parameters among direct estimation, calibration, and external discipline according to data availability and identification strength. Not every parameter is freely estimated in one specification.") +
      '<div class="ai-compress" data-ai-compress="1">' +
        '<div class="ai-compress-chips">' + ["Household", "AI state", "Task production", "Technology", "AI demand", "Marginal products", "DMP", "Job value", "Wage bargaining", "Resource constraint"].map(function (c) { return '<span class="ai-cchip">' + c + "</span>"; }).join("") + "</div>" +
        '<div class="ai-compress-result"><span class="ai-cF">' + m(String.raw`\mathcal{F}(\cdot)=0`) + '</span><span class="ai-carr">\u2192</span><span class="ai-cH">' + m(String.raw`y_t^{obs}=\mathcal{H}(\cdot)+\nu_t`) + "</span></div>" +
        '<button type="button" class="ai-diagram-btn" data-ai-compress-btn="1">Compress to estimation system</button>' +
      "</div>");

    /* SEMI-STRUCTURAL BRIDGE */
    H += sec("bridge", "Empirical Bridge", "A DMP-Motivated Unemployment Decomposition",
      p("A semi-structural equation offers a feasible empirical decomposition when the data required for joint structural estimation remain incomplete.") +
      p("Its coefficients combine several structural parameters. They describe empirical channels and do not directly recover CES substitution elasticities or task weights.") +
      eq(String.raw`\widehat\Lambda_{e,t} = \varrho_e\, \widehat\Lambda_{e,t-1} + B_e^{M} MIS_{e,t} - B_e^{Z}\widehat Z_t + B_e^{Y} SUB_t^{Y} + B_e^{A} SUB_t^{A} - B_e^{G} GEN_{e,t} + \varepsilon_{e,t}`, "B1") +
      eq(String.raw`\widehat{\mathcal{J}}_{e,t} = -\zeta_e^{Z}\widehat Z_t - \zeta_e^{Y} SUB_t^{Y} - \zeta_e^{A} SUB_t^{A} + \zeta_e^{G} GEN_{e,t} + u_{e,t}^{J}`, "B2") +
      eq(String.raw`\widehat\mu_{e,t} = -\zeta_e^{M} MIS_{e,t} + u_{e,t}^{\mu}`, "B3") +
      '<div class="ai-compare" data-ai-compare="1">' +
        '<div class="ai-compare-tabs"><button type="button" class="on" data-side="semi">Semi-structural</button><button type="button" data-side="full">Full structural</button></div>' +
        table(["Semi-structural design", "Full structural design"], [
          ["Composite channel coefficients", "Deep structural parameters"],
          ["Externally constructed channel measures", "Endogenous task and firm decisions"],
          ["DMP-motivated unemployment decomposition", "Joint DSGE-DMP estimation"],
          ["Lower data burden", "Higher data and identification burden"],
          ["Limited structural counterfactual scope", "Structural counterfactual analysis after validation"]
        ]) +
      "</div>");

    /* STRUCTURAL TRANSMISSION */
    H += sec("chain", "Structural Transmission", "From AI Capability to Unemployment",
      p("The log-linear structural system links the AI state to unemployment through a sequence of equilibrium conditions.") +
      p("AI affects prices, task applicability, new-task value, and matching efficiency. These variables determine AI demand, task output, marginal products, job values, vacancies, matches, and employment.") +
      eq(String.raw`\widehat a_t \Rightarrow \left( \widehat{\widetilde P}_t^{B}, \widehat\Omega_{e,t}, \widehat\Gamma_{e,t}, \widehat\mu_{e,t} \right) \Rightarrow \left( \widehat R_{e,t}, \widehat Q_{e,t}, \widehat{MP}_{e,t} \right)`) +
      eq(String.raw`\Rightarrow \left( \widehat J_{e,t}, \widehat V_{e,t}, \widehat M_{e,t}, \widehat N_{e,t} \right) \Rightarrow \widehat\Lambda_{e,t}`) +
      eq(String.raw`\widehat\Lambda_{e,t}^{\,target} = \frac{\chi_e^{\mu}}{\xi_e}\widehat m_{e,t} - \frac{1-\xi_e}{\xi_e} E_t\left[ \widehat{\mathcal{M}}_{t,t+1} + \widehat J_{e,t+1} \right]`, "C1") +
      p("Here " + m(String.raw`\widehat J_{e,t}`) + " is determined by task production, AI-service demand, task shadow prices, labor marginal products, wages, new-task value, and the continuation value. The formula is a target relationship derived from the vacancy and matching block."));

    /* MODEL TO DATA */
    H += sec("data", "Model-to-Data Mapping", "Connecting Model Variables to Observables",
      callout("The empirical implementation is led within the research-assistant role. It covers data construction, labor classification, measurement design, parameter strategy, estimation, validation, and counterfactual analysis.") +
      p("The measurement system must distinguish productive and creative labor and connect output, technology, employment, unemployment, vacancies, wages, and AI inputs to the corresponding model variables.") +
      p("AI substitution, task creation, and mismatch require separate empirical measures. Their definitions must follow the roles they play in the structural model.") +
      eq(String.raw`y_t^{obs} = \left( \Delta\log Y_t^{obs}, \Delta\log Z_t^{obs}, UR_{Y,t}^{obs}, UR_{A,t}^{obs}, N_{Y,t}^{obs}, N_{A,t}^{obs}, V_{Y,t}^{obs}, V_{A,t}^{obs}, R_{Y,t}^{obs}, R_{A,t}^{obs}, w_{Y,t}^{obs}, w_{A,t}^{obs} \right)`, "Y1") +
      deriv("Measurement equations",
        eq(String.raw`\Delta\log Y_t^{obs} = \widehat Y_t - \widehat Y_{t-1} + \nu_t^{Y}, \qquad \Delta\log Z_t^{obs} = \widehat Z_t - \widehat Z_{t-1} + \nu_t^{Z}`, "Y2") +
        eq(String.raw`\Lambda_{e,t}^{obs} = \widehat\Lambda_{e,t} + \nu_{e,t}^{UR}, \qquad \log N_{e,t}^{obs} = \widehat N_{e,t} + \nu_{e,t}^{N}`, "Y3") +
        eq(String.raw`\log V_{e,t}^{obs} = \widehat V_{e,t} + \nu_{e,t}^{V}, \quad \log R_{e,t}^{obs} = \widehat R_{e,t} + \nu_{e,t}^{R}, \quad \log w_{e,t}^{obs} = \widehat w_{e,t} + \nu_{e,t}^{w}`, "Y4")) +
      table(["Model variable", "Economic meaning", "Measurement requirement"], [
        [m(String.raw`Y_t`), "output", "real output or production"],
        [m(String.raw`Z_t`), "technology", "TFP or productivity proxy"],
        [m(String.raw`N_{Y,t}`), "productive employment", "classified employment"],
        [m(String.raw`N_{A,t}`), "creative employment", "research or knowledge-intensive employment"],
        [m(String.raw`UR_{Y,t}`), "productive unemployment", "group-specific unemployment"],
        [m(String.raw`UR_{A,t}`), "creative unemployment", "group-specific unemployment"],
        [m(String.raw`V_{Y,t}`), "productive vacancies", "classified vacancies or postings"],
        [m(String.raw`V_{A,t}`), "creative vacancies", "classified vacancies or postings"],
        [m(String.raw`R_{Y,t}`), "productive AI input", "AI-use or adoption measure"],
        [m(String.raw`R_{A,t}`), "creative AI input", "AI use in research or knowledge tasks"],
        [m(String.raw`w_{Y,t}`), "productive wage", "group-specific wage"],
        [m(String.raw`w_{A,t}`), "creative wage", "group-specific wage"]
      ], "Datasets are not named until selected for the research.") +
      latentWidget());

    /* EMPIRICAL WORKSTREAM */
    H += sec("workstream", "Empirical Implementation", "Turning the Model into an Estimable System",
      p("The empirical work begins with the classification of productive and creative labor and the construction of output, productivity, employment, unemployment, vacancy, wage, and AI-input measures.") +
      p("The next stage derives the steady state, assigns parameters to calibration or estimation, solves or approximates the equilibrium system, and implements the observation equations.") +
      p("Estimation will be followed by identification checks, moment comparisons, model validation, and channel-specific counterfactual analysis.") +
      '<div class="ai-statuscols"><div class="ai-statuscol developed"><h4>Developed</h4><ul>' +
        ["theoretical architecture", "AI-state process", "productive and creative task blocks", "technology accumulation", "AI-service first-order conditions", "labor marginal products", "DMP matching", "employment dynamics", "job values", "vacancy free entry", "wage bargaining", "resource constraint", "nonlinear structural system", "log-linear equations", "observation-equation framework"].map(function (x) { return "<li>" + x + "</li>"; }).join("") +
      "</ul></div>" +
      '<div class="ai-statuscol wip"><h4>In progress</h4><ul>' +
        ["final labor classification", "data selection", "observable construction", "calibration strategy", "structural estimation", "validation", "counterfactual analysis"].map(function (x) { return "<li>" + x + "</li>"; }).join("") +
      "</ul></div></div>" +
      flow(["Classification", "Data construction", "Steady state", "Solution", "Estimation", "Validation", "Counterfactuals"]));

    /* INTERACTION: DICTIONARY */
    H += sec("dictionary", "Formula Dictionary", "Symbols, Definitions, and Where They Appear",
      p("Select a symbol to see its definition, economic interpretation, the equations where it appears, and its model block.") +
      dictionaryPanel());

    /* BOUNDARIES */
    H += sec("boundaries", "Research Boundaries", "Current Scope",
      p("The project currently provides a closed theoretical model, a labor-market closure, a nonlinear structural system, and a log-linear estimation design.") +
      p("Parameter estimation, empirical validation, impulse responses, historical decompositions, and counterfactual exercises remain in progress.") +
      p("The baseline model holds each labor force and separation rate fixed. Labor-force participation and wage rigidity appear as separate extensions.") +
      p("The steady-state unemployment equation summarizes flow balance. Transition paths follow the employment law of motion.") +
      p("The semi-structural equation estimates composite channel coefficients. The full structural design targets the underlying task, innovation, matching, and vacancy parameters.") +
      '<ul class="ai-scope">' + [
        "Developed theoretical model", "Developed baseline labor-market closure", "Derived nonlinear equilibrium system",
        "Derived log-linear estimation equations", "Designed observation system", "Empirical estimates pending", "Counterfactual results pending"
      ].map(function (x, i) { return '<li class="' + (i < 5 ? "done" : "pend") + '">' + x + "</li>"; }).join("") + "</ul>");

    /* EQUATION INDEX */
    H += sec("index", "Model Equation Index", "Model Blocks and Derivations",
      table(["Block", "Included content"], [
        ["Household", "utility, budget, marginal utility, discount factor"],
        ["AI state", "AI process, effective price, applicability, new tasks, mismatch"],
        ["Task production", "productive CES, creative CES, elasticities, derivatives"],
        ["Innovation", "technology accumulation, technology value, task shadow price"],
        ["AI demand", "nonlinear FOCs and log-linear demand"],
        ["Labor demand", "nonlinear and log-linear marginal products"],
        ["DMP", "matching, tightness, probabilities, employment dynamics"],
        ["Unemployment", "rates, logit observation, steady-state target"],
        ["Job creation", "job value, expected value, free entry, log-linear job value"],
        ["Wages", "worker values, surpluses, Nash bargaining"],
        ["General equilibrium", "timing, states, controls, resource constraint"],
        ["Participation extension", "population allocation and participation condition"],
        ["Semi-structural bridge", "channel equation and composite coefficients"],
        ["Structural estimation", "nonlinear system, parameters, observables, measurements"]
      ]));

    /* CONCLUSION */
    H += sec("conclusion", "Model Contribution", "From AI Capability to Structural Unemployment",
      p("The model places productive labor, creative labor, AI services, innovation, job value, vacancy creation, and search frictions inside one dynamic general-equilibrium system.") +
      p("AI changes task composition, technology accumulation, new-task value, and matching efficiency. These effects move through marginal products, job values, vacancies, matches, employment, and unemployment.") +
      p("The empirical phase will map the system into observed data, estimate a feasible parameter set, evaluate identification and fit, and construct channel-specific counterfactuals.") +
      quote("<b>The unemployment response emerges from the interaction of task substitution, innovation, job creation, and matching frictions.</b>") +
      systemDiagram("final") +
      '<div class="ca-foot"><span>Research Detail \u00b7 DSGE-DMP Model</span><span>Zhenyuan Pan \u00b7 2026</span></div>');

    return (
      '<button class="case-close" type="button" aria-label="Close case study"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll ai-scroll"><article class="case-article ai-article">' +
        H +
      "</article></div>"
    );
  };

  /* ================= interactions / viz ================= */
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function renderKatex(root) {
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(root, {
          delimiters: [{ left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }],
          throwOnError: false, errorColor: "#b3133f"
        });
      } catch (e) { /* leave raw TeX if KaTeX unavailable */ }
    }
  }

  /* CES illustrative comparative statics */
  function wireCES(box) {
    var task = "Y";
    var st = { omega: 0.35, eps: 1.6, R: 1 };
    var outs = {}; box.querySelectorAll("[data-out]").forEach(function (n) { outs[n.getAttribute("data-out")] = n; });
    var bars = {}; box.querySelectorAll("[data-bar]").forEach(function (n) { bars[n.getAttribute("data-bar")] = n; });
    function compute() {
      var N = 1, R = st.R, w = st.omega, eps = st.eps;
      var rho = (eps - 1) / eps;
      if (Math.abs(rho) < 0.04) rho = rho < 0 ? -0.04 : 0.04; // avoid the Cobb-Douglas singularity
      var termN = (1 - w) * Math.pow(N, rho);
      var termR = w * Math.pow(R, rho);
      var Q = Math.pow(termN + termR, 1 / rho);
      var labShare = termN / (termN + termR);
      var aiShare = 1 - labShare;
      var mp = (1 - w) * Math.pow(Q / N, 1 - rho); // Z=1 normalization (productive); shadow price=1 (creative)
      outs.omega.textContent = st.omega.toFixed(2);
      outs.eps.textContent = st.eps.toFixed(2);
      outs.R.textContent = st.R.toFixed(2);
      outs.rho.textContent = rho.toFixed(2);
      outs.Q.textContent = Q.toFixed(2);
      outs.mp.textContent = mp.toFixed(2);
      if (outs.tech) outs.tech.style.opacity = task === "A" ? "1" : "0.32";
      bars.lab.style.width = (labShare * 100).toFixed(1) + "%";
      bars.ai.style.width = (aiShare * 100).toFixed(1) + "%";
      bars.Q.style.width = Math.max(2, Math.min(100, Q / 2.4 * 100)).toFixed(1) + "%";
      bars.mp.style.width = Math.max(2, Math.min(100, mp / 1.4 * 100)).toFixed(1) + "%";
    }
    box.querySelectorAll("input[data-ces]").forEach(function (inp) {
      inp.addEventListener("input", function () { st[inp.getAttribute("data-ces")] = parseFloat(inp.value); compute(); });
    });
    box.querySelectorAll(".ai-ces-tabs button").forEach(function (b) {
      b.addEventListener("click", function () {
        box.querySelectorAll(".ai-ces-tabs button").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); task = b.getAttribute("data-task");
        box.setAttribute("data-task-active", task); compute();
      });
    });
    compute();
  }

  /* latent-to-observed mapping */
  var L2O = [
    { k: "Y", name: "Output", struct: "Y_t = Z_t Q_{Y,t}", meas: "\\Delta\\log Y_t^{obs} = \\widehat Y_t - \\widehat Y_{t-1} + \\nu_t^{Y}", obs: "Real output or production", params: "Task substitution, Innovation" },
    { k: "Z", name: "Technology", struct: "Z_{t+1} = Z_t(1-\\delta_Z + \\phi Q_{A,t})", meas: "\\Delta\\log Z_t^{obs} = \\widehat Z_t - \\widehat Z_{t-1} + \\nu_t^{Z}", obs: "TFP or productivity proxy", params: "Innovation" },
    { k: "N_Y", name: "Productive employment", struct: "N_{Y,t+1} = (1-s_Y)N_{Y,t} + M_{Y,t}", meas: "\\log N_{Y,t}^{obs} = \\widehat N_{Y,t} + \\nu_{Y,t}^{N}", obs: "Classified employment", params: "Matching, Vacancy and bargaining" },
    { k: "N_A", name: "Creative employment", struct: "N_{A,t+1} = (1-s_A)N_{A,t} + M_{A,t}", meas: "\\log N_{A,t}^{obs} = \\widehat N_{A,t} + \\nu_{A,t}^{N}", obs: "Research or knowledge-intensive employment", params: "Matching, Innovation" },
    { k: "UR", name: "Unemployment", struct: "\\Lambda_{e,t} = \\log U_{e,t} - \\log N_{e,t}", meas: "\\Lambda_{e,t}^{obs} = \\widehat\\Lambda_{e,t} + \\nu_{e,t}^{UR}", obs: "Group-specific unemployment", params: "Matching, AI channels" },
    { k: "V", name: "Vacancies", struct: "\\kappa_e = q_{e,t}\\mathcal{J}_{e,t}", meas: "\\log V_{e,t}^{obs} = \\widehat V_{e,t} + \\nu_{e,t}^{V}", obs: "Classified vacancies or postings", params: "Vacancy and bargaining" },
    { k: "R", name: "AI input", struct: "P_{e,t}^{Q}\\,\\omega_{e,t}(Q_{e,t}/R_{e,t})^{1-\\rho_e^{CES}} = \\widetilde P_t^{B}", meas: "\\log R_{e,t}^{obs} = \\widehat R_{e,t} + \\nu_{e,t}^{R}", obs: "AI-use or adoption measure", params: "AI channels, Task substitution" },
    { k: "w", name: "Wage", struct: "W_{e,t}^{E} - W_{e,t}^{U} = \\tfrac{\\vartheta_e}{1-\\vartheta_e} J_{e,t}", meas: "\\log w_{e,t}^{obs} = \\widehat w_{e,t} + \\nu_{e,t}^{w}", obs: "Group-specific wage", params: "Vacancy and bargaining" }
  ];
  function wireL2O(box) {
    var list = box.querySelector(".ai-l2o-list"), panel = box.querySelector(".ai-l2o-panel");
    L2O.forEach(function (d, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "ai-l2o-item" + (i === 0 ? " on" : "");
      b.innerHTML = '<span class="ai-l2o-sym">\\(' + d.k.replace("_", "_{") + (d.k.indexOf("_") > -1 ? "}" : "") + "\\)</span><span class=\"ai-l2o-name\">" + d.name + "</span>";
      b.addEventListener("click", function () {
        list.querySelectorAll(".ai-l2o-item").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); show(d);
      });
      list.appendChild(b);
    });
    function show(d) {
      panel.innerHTML =
        '<div class="ai-l2o-row"><span class="ai-l2o-lab">Structural role</span><div class="ai-eqx">\\[' + d.struct + "\\]</div></div>" +
        '<div class="ai-l2o-row"><span class="ai-l2o-lab">Measurement</span><div class="ai-eqx">\\[' + d.meas + "\\]</div></div>" +
        '<div class="ai-l2o-row"><span class="ai-l2o-lab">Required observable</span><p>' + d.obs + "</p></div>" +
        '<div class="ai-l2o-row"><span class="ai-l2o-lab">Parameter groups</span><p>' + d.params + "</p></div>";
      renderKatex(panel);
    }
    renderKatex(list);
    show(L2O[0]);
  }

  /* formula dictionary */
  var DICT = {
    "a_t": { tex: "a_t", def: "AI state. A common scalar summarizing changes in AI capability.", interp: "Drives the effective AI price, task applicability, new-task value, and mismatch.", blocks: "AI state", eqs: "A1 to A6" },
    "\\omega": { tex: "\\omega_{e,t}", def: "AI weight inside task e.", interp: "Higher applicability lowers the direct labor weight in the CES aggregator.", blocks: "AI state, Task production", eqs: "A3, T2, T3" },
    "eps": { tex: "\\varepsilon_e", def: "Substitution elasticity between labor and AI in task e.", interp: "Sets the CES curvature through the relation below.", blocks: "Task production", eqs: "T4" },
    "R": { tex: "R_{e,t}", def: "AI services used in task e.", interp: "Chosen by a firm first-order condition against the effective AI price.", blocks: "AI demand", eqs: "F3 to F5, L3" },
    "PAQ": { tex: "P_{A,t}^{Q}", def: "Shadow price of the creative task.", interp: "Equals the discounted future value of technology times the marginal effect on Z.", blocks: "Innovation", eqs: "F2" },
    "MP": { tex: "MP_{e,t}", def: "Marginal product of labor in task e.", interp: "Reflects the direct labor weight, task expansion, and the shadow value.", blocks: "Labor demand", eqs: "M1, M2, M6" },
    "J": { tex: "J_{e,t}", def: "Value of a filled job.", interp: "Combines the flow payoff, the new-task value, and a discounted continuation value.", blocks: "Job creation", eqs: "J1, K3" },
    "calJ": { tex: "\\mathcal{J}_{e,t}", def: "Expected discounted job value.", interp: "Enters the vacancy free-entry condition through the filling probability.", blocks: "Job creation", eqs: "J2, J3" },
    "mu": { tex: "\\mu_{e,t}", def: "Matching efficiency in market e.", interp: "Falls with accumulated skill mismatch.", blocks: "AI state, DMP", eqs: "A6, G1" },
    "theta": { tex: "\\theta_{e,t}", def: "Labor-market tightness, vacancies over unemployment.", interp: "Higher tightness raises job finding and lowers vacancy filling.", blocks: "DMP", eqs: "P2, P3" },
    "V": { tex: "V_{e,t}", def: "Vacancies posted in market e.", interp: "Determined by the free-entry condition.", blocks: "Job creation", eqs: "J3" },
    "Nnext": { tex: "N_{e,t+1}", def: "Next-period employment stock.", interp: "Surviving jobs plus new matches.", blocks: "DMP", eqs: "P4, G3" },
    "Lambda": { tex: "\\Lambda_{e,t}", def: "Unemployment log-odds.", interp: "The baseline unemployment observation variable.", blocks: "Unemployment", eqs: "G5, S4" }
  };
  function wireDict(box) {
    var chips = box.querySelector(".ai-dict-chips"), info = box.querySelector(".ai-dict-info");
    Object.keys(DICT).forEach(function (k, i) {
      var d = DICT[k];
      var b = document.createElement("button");
      b.type = "button"; b.className = "ai-dchip"; b.innerHTML = "\\(" + d.tex + "\\)";
      b.addEventListener("click", function () {
        chips.querySelectorAll(".ai-dchip").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        info.innerHTML = '<div class="ai-dict-tex">\\[' + d.tex + "\\]</div>" +
          '<div class="ai-dict-def">' + d.def + "</div>" +
          '<div class="ai-dict-interp">" + ' + '"' + "</div>".replace('" + "', d.interp) +
          '<div class="ai-dict-meta"><span><b>Block</b> ' + d.blocks + "</span><span><b>Equations</b> " + d.eqs + "</span></div>";
        // safer construction (avoid the quote glitch above)
        info.innerHTML = '<div class="ai-dict-tex">\\[' + d.tex + "\\]</div>" +
          '<div class="ai-dict-def">' + d.def + "</div>" +
          '<div class="ai-dict-interp">' + d.interp + "</div>" +
          '<div class="ai-dict-meta"><span><b>Block</b> ' + d.blocks + "</span><span><b>Equations</b> " + d.eqs + "</span></div>";
        renderKatex(info);
      });
      chips.appendChild(b);
    });
    renderKatex(chips);
  }

  /* reading-mode switch + derivation panels */
  function wireModes(scroller, root) {
    var btns = root.querySelectorAll(".ai-modeswitch button");
    var derivs = root.querySelectorAll(".ai-deriv");
    function setMode(mode) {
      btns.forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-mode") === mode); });
      derivs.forEach(function (d) { if (mode === "full") d.setAttribute("open", ""); else d.removeAttribute("open"); });
      root.setAttribute("data-ai-mode", mode);
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); }); });
    setMode("reading");
  }

  /* sticky index + scroll-spy + progress */
  function wireIndexAndProgress(scroller, root) {
    var nav = root.querySelector(".ai-index");
    var secs = [].slice.call(root.querySelectorAll(".ai-sec[data-ai-label]"));
    var links = [];
    secs.forEach(function (s) {
      var label = s.getAttribute("data-ai-label");
      var a = document.createElement("button");
      a.type = "button"; a.className = "ai-ix"; a.textContent = label; a.setAttribute("data-target", s.id);
      a.addEventListener("click", function () {
        var top = s.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 90;
        scroller.scrollTo({ top: top, behavior: REDUCED ? "auto" : "smooth" });
      });
      nav.appendChild(a); links.push({ a: a, s: s });
    });
    var prog = root.querySelector(".ai-progress i");
    var ticking = false;
    function upd() {
      var max = scroller.scrollHeight - scroller.clientHeight;
      var f = max > 0 ? scroller.scrollTop / max : 0;
      if (prog) prog.style.transform = "scaleX(" + Math.max(0, Math.min(1, f)).toFixed(4) + ")";
      var mid = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.3;
      var active = links[0];
      links.forEach(function (l) { if (l.s.getBoundingClientRect().top <= mid) active = l; });
      links.forEach(function (l) { l.a.classList.toggle("on", l === active); });
    }
    scroller.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; upd(); });
    }, { passive: true });
    upd();
  }

  /* one-shot diagram reveals on scroll into view */
  function wireReveals(scroller, root) {
    var items = [].slice.call(root.querySelectorAll("[data-ai-diagram]"));
    function check() {
      var R = scroller.getBoundingClientRect();
      items.forEach(function (it) {
        if (it.__shown) return;
        var r = it.getBoundingClientRect();
        if (r.top < R.bottom - R.height * 0.14 && r.bottom > R.top) { it.__shown = true; it.classList.add("ai-shown"); }
      });
    }
    var ticking = false;
    scroller.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; check(); });
    }, { passive: true });
    requestAnimationFrame(function () { requestAnimationFrame(check); });
  }

  /* propagate / compress buttons */
  function wireButtons(root) {
    root.querySelectorAll("[data-ai-propagate]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var fig = btn.closest("[data-ai-diagram]");
        fig.classList.remove("ai-propagate"); void fig.offsetWidth; fig.classList.add("ai-propagate");
      });
    });
    root.querySelectorAll("[data-ai-compress-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var box = btn.closest("[data-ai-compress]");
        box.classList.toggle("ai-compressed");
        btn.textContent = box.classList.contains("ai-compressed") ? "Expand blocks" : "Compress to estimation system";
      });
    });
    // semi/full + participation-style compare tabs
    root.querySelectorAll("[data-ai-compare] .ai-compare-tabs button").forEach(function (b) {
      b.addEventListener("click", function () {
        var box = b.closest("[data-ai-compare]");
        box.querySelectorAll(".ai-compare-tabs button").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); box.setAttribute("data-side", b.getAttribute("data-side"));
      });
    });
  }

  window.__ailaborViz = {
    init: function (scroller) {
      if (!scroller || scroller.__ailaborDone) return;
      var root = scroller.querySelector(".ai-controls") ? scroller : scroller;
      if (!scroller.querySelector(".ai-hero")) return; // not the ailabor article
      scroller.__ailaborDone = true;
      try {
        renderKatex(scroller);
        wireModes(scroller, scroller);
        wireIndexAndProgress(scroller, scroller);
        wireReveals(scroller, scroller);
        wireButtons(scroller);
        scroller.querySelectorAll("[data-ai-ces]").forEach(wireCES);
        scroller.querySelectorAll("[data-ai-l2o]").forEach(wireL2O);
        scroller.querySelectorAll("[data-ai-dict]").forEach(wireDict);
        // dictionary symbol chips inside prose
        scroller.querySelectorAll(".ai-sym").forEach(function (b) {
          b.addEventListener("click", function () {
            var dictBox = scroller.querySelector("[data-ai-dict]");
            if (!dictBox) return;
            var want = b.getAttribute("data-sym");
            var chip = dictBox.querySelector('.ai-dchip[data-sym="' + want + '"]');
            if (chip) { chip.click(); dictBox.scrollIntoView ? null : null; }
          });
        });
      } catch (err) { if (window.console) console.warn("ailabor-viz", err); }
    }
  };
})();
