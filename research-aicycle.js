/* research-aicycle.js : "A Front-Row Seat to the AI Cycle" detail page.
   Field Note 01 of the AI Systems section. Opens from the first .sys-row
   (data-sys="ai-cycle") through the shared case-study.js frosted overlay
   (morph "plain"). Self-contained: ships its own scoped ac-* styles and
   reuses the existing ca-* / ai-* article shell for parity with the other
   research detail pages.

   Exposes:
     window.__aicycleArticle(data) -> full overlay HTML string
     window.__aicycleViz.init(scroller) -> sticky index + progress bar,
        quality-loop motion, and the two interactive explorers.

   No en-dashes or em-dashes in any visible copy (project rule). */
(function () {
  "use strict";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function p(t) { return '<p class="ca-p">' + t + "</p>"; }
  function sec(id, label, title, inner) {
    return '<section class="ca-section ai-sec ac-sec" id="ac-sec-' + id + '" data-ac-label="' + esc(label) + '">' +
      '<div class="ca-h">' + esc(label) + "</div>" +
      (title ? '<h3 class="ca-sub ac-h2">' + esc(title) + "</h3>" : "") + inner + "</section>";
  }

  var IMG = "papers/ai-cycle/";

  /* ---------- scoped styles ---------- */
  var STYLE = "<style id=\"ac-style\">" + [
    ".ac-article{--mag:#d6006c;--ink:#14181f;--line:rgba(20,24,31,0.12);--mut:#6b7480;--soft:rgba(214,0,108,0.07);--paper:#faf9f7;}",
    ".ac-h2{max-width:26ch;margin-bottom:20px;}",
    ".ac-sec{padding-top:clamp(8px,1.6vh,22px);}",,
    ".ac-sub-lede{font-size:clamp(16px,1.4vw,20px);line-height:1.5;color:#3a4049;max-width:64ch;margin:0 0 8px;text-wrap:pretty;font-weight:400;}",
    /* hero proof card */
    ".ac-proof{display:grid;grid-template-columns:0.85fr 1.15fr;gap:clamp(20px,2.8vw,40px);align-items:center;border:1px solid var(--line);border-radius:16px;background:#fff;padding:clamp(20px,2.6vw,30px);margin:34px 0 12px;}",
    ".ac-proof-img{border-radius:12px;overflow:hidden;background:#f3eef0;border:1px solid var(--line);}",
    ".ac-proof-img img{width:100%;height:auto;display:block;}",
    ".ac-proof-chips{display:flex;flex-direction:column;gap:12px;}",
    ".ac-chip{border:1px solid var(--line);border-left:3px solid var(--mag);border-radius:10px;padding:13px 16px;background:var(--paper);}",
    ".ac-chip b{display:block;font:800 clamp(22px,2.6vw,32px)/1 'Archivo',sans-serif;color:var(--ink);letter-spacing:-0.02em;font-variant-numeric:tabular-nums;}",
    ".ac-chip span{display:block;font-size:12.5px;color:var(--mut);margin-top:6px;}",
    ".ac-cap{font-size:12px;line-height:1.5;color:#9098a3;margin-top:12px;font-family:'Times New Roman',Times,serif;letter-spacing:0.02em;}",
    /* metric strip */
    ".ac-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:30px 0 8px;}",
    ".ac-mc{border:1px solid var(--line);border-top:2px solid var(--mag);border-radius:12px;background:#fff;padding:19px 18px 18px;}",
    ".ac-mv{font:800 clamp(20px,2.2vw,28px)/1 'Archivo',sans-serif;letter-spacing:-0.02em;color:var(--ink);font-variant-numeric:tabular-nums;}",
    ".ac-ml{font-size:12px;line-height:1.4;color:var(--mut);margin-top:8px;}",
    /* static timeline */
    ".ac-tl{display:flex;flex-direction:column;gap:0;margin:20px 0 4px;}",
    ".ac-tl-row{display:grid;grid-template-columns:96px 1fr;gap:clamp(20px,3vw,42px);padding:34px 0;border-top:1px solid var(--line);}",
    ".ac-tl-row:first-child{border-top:0;}",
    ".ac-tl-year{font:800 clamp(26px,3vw,40px)/1 'Archivo',sans-serif;color:var(--mag);letter-spacing:-0.02em;position:relative;}",
    ".ac-tl-era{font:700 11px 'Archivo',sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:var(--mut);margin-top:8px;}",
    ".ac-tl-main{min-width:0;}",
    ".ac-tl-h{font:800 clamp(18px,1.9vw,24px)/1.12 'Archivo',sans-serif;color:var(--ink);letter-spacing:-0.015em;margin:0 0 11px;}",
    ".ac-tl-b{font-size:clamp(14.5px,1.1vw,16px);line-height:1.65;color:#3f4751;margin:0 0 18px;text-wrap:pretty;max-width:60ch;}",
    ".ac-tl-plates{display:flex;flex-wrap:wrap;gap:14px;}",
    ".ac-plate{border:1px solid var(--line);border-radius:11px;overflow:hidden;background:#fff;max-width:100%;}",
    ".ac-plate img{display:block;width:100%;height:auto;}",
    ".ac-plate.lg{flex:1 1 320px;max-width:440px;}",
    ".ac-plate.sm{flex:0 1 200px;max-width:240px;}",
    ".ac-plate-cap{font-size:11px;color:#9098a3;padding:7px 11px;border-top:1px solid var(--line);font-family:'Times New Roman',Times,serif;letter-spacing:0.02em;}",
    ".ac-2026{flex:1 1 320px;max-width:440px;border:1px dashed var(--mag);border-radius:11px;background:var(--soft);padding:16px;}",
    ".ac-2026 .r{display:flex;align-items:center;gap:8px;margin-bottom:9px;}",
    ".ac-2026 .b{flex:1 1 0;text-align:center;font:700 12px 'Archivo',sans-serif;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:8px;padding:9px 6px;}",
    ".ac-2026 .b.on{border-color:var(--mag);background:#fff;color:var(--mag);}",
    ".ac-2026 .ar{color:var(--mut);font-size:12px;}",
    ".ac-2026 .cap{font-size:11.5px;color:var(--mut);margin-top:4px;text-align:center;}",
    /* matrix table */
    ".ac-tablewrap{margin:24px 0;overflow-x:auto;}",
    ".ac-table{width:100%;border-collapse:collapse;font-size:13.5px;}",
    ".ac-table th,.ac-table td{text-align:left;padding:14px 16px;border-bottom:1px solid var(--line);vertical-align:top;line-height:1.5;}",
    ".ac-table thead th{font:800 11px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);border-bottom:1.5px solid var(--line);white-space:nowrap;}",
    ".ac-table td.work{font-weight:700;color:var(--ink);white-space:nowrap;}",
    ".ac-table td.layer{color:var(--ink);font-weight:600;}",
    ".ac-table td.gate{color:var(--mut);}",
    ".ac-table tbody tr:hover{background:var(--soft);}",
    /* ladder */
    ".ac-ladder{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin:26px 0;align-items:stretch;}",
    ".ac-rung{position:relative;border:1px solid var(--line);border-right:0;padding:19px 18px;background:#fff;display:flex;flex-direction:column;}",
    ".ac-ladder .ac-rung:last-child{border-right:1px solid var(--line);}",
    ".ac-rung:nth-child(1){background:#fff;} .ac-rung:nth-child(2){background:#fdfafc;} .ac-rung:nth-child(3){background:var(--soft);} .ac-rung:nth-child(4){background:var(--ink);}",
    ".ac-rung-n{font:800 11px 'Archivo',sans-serif;letter-spacing:0.1em;color:var(--mut);margin-bottom:9px;}",
    ".ac-rung:nth-child(4) .ac-rung-n{color:rgba(255,255,255,0.6);}",
    ".ac-rung-h{font:800 16px 'Archivo',sans-serif;color:var(--ink);margin-bottom:6px;letter-spacing:-0.01em;}",
    ".ac-rung:nth-child(3) .ac-rung-h{color:var(--mag);} .ac-rung:nth-child(4) .ac-rung-h{color:#fff;}",
    ".ac-rung-b{font-size:12.5px;line-height:1.5;color:var(--mut);}",
    ".ac-rung:nth-child(4) .ac-rung-b{color:rgba(255,255,255,0.78);}",
    ".ac-rung .ac-rung-bar{height:4px;border-radius:3px;background:var(--line);margin-bottom:12px;}",
    ".ac-rung:nth-child(1) .ac-rung-bar{width:25%;background:var(--mag);} .ac-rung:nth-child(2) .ac-rung-bar{width:50%;background:var(--mag);} .ac-rung:nth-child(3) .ac-rung-bar{width:75%;background:var(--mag);} .ac-rung:nth-child(4) .ac-rung-bar{width:100%;background:var(--mag);}",
    /* use-case cards */
    ".ac-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin:24px 0;}",
    ".ac-uc{border:1px solid var(--line);border-radius:12px;background:#fff;padding:19px 18px;border-top:2px solid var(--mag);}",
    ".ac-uc-h{font:800 14.5px 'Archivo',sans-serif;color:var(--ink);margin-bottom:9px;letter-spacing:-0.01em;}",
    ".ac-uc-b{font-size:13px;line-height:1.6;color:var(--mut);}",
    /* tool stack */
    ".ac-stack{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:24px 0;}",
    ".ac-sg{border:1px solid var(--line);border-radius:12px;background:#fff;padding:18px;}",
    ".ac-sg-h{font:700 11px 'Archivo',sans-serif;letter-spacing:0.1em;text-transform:uppercase;color:var(--mag);margin-bottom:13px;}",
    ".ac-sg-t{display:flex;flex-wrap:wrap;gap:8px;}",
    ".ac-sg-t span{font:600 12px 'Archivo',sans-serif;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:7px;padding:5px 10px;}",
    /* quality loop */
    ".ac-loop{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin:24px 0 8px;}",
    ".ac-node{position:relative;border:1px solid var(--line);border-radius:12px;background:#fff;padding:17px 15px;text-align:left;transition:border-color .3s,box-shadow .3s,transform .3s;}",
    ".ac-node .n{font:800 12px 'Archivo',sans-serif;color:#fff;background:var(--mag);width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:10px;}",
    ".ac-node h4{font:800 13px 'Archivo',sans-serif;color:var(--ink);margin:0 0 6px;letter-spacing:-0.01em;}",
    ".ac-node p{font-size:11.5px;line-height:1.45;color:var(--mut);margin:0;}",
    ".ac-node.on{border-color:var(--mag);box-shadow:0 12px 30px -20px rgba(214,0,108,0.6);transform:translateY(-3px);}",
    /* interactive explorer */
    ".ac-ix{border:1px solid var(--line);border-radius:14px;background:#fff;padding:22px;margin:24px 0;}",
    ".ac-ix-h{font:700 12px 'Archivo',sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink);margin:0 0 16px;display:flex;align-items:center;gap:9px;}",
    ".ac-ix-h .tag{font:800 10px 'Archivo',sans-serif;letter-spacing:0.1em;color:#fff;background:var(--mag);border-radius:999px;padding:3px 9px;}",
    ".ac-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}",
    ".ac-yc{font:800 13px 'Archivo',sans-serif;color:var(--mut);background:#fff;border:1px solid var(--line);border-radius:999px;padding:7px 15px;cursor:pointer;transition:all .15s;font-variant-numeric:tabular-nums;}",
    ".ac-yc:hover{border-color:var(--mag);color:var(--ink);}",
    ".ac-yc.on{background:var(--mag);color:#fff;border-color:var(--mag);}",
    ".ac-ex-grid{display:grid;grid-template-columns:1.1fr 0.9fr;gap:20px;align-items:start;}",
    ".ac-ex-regime{font:800 clamp(18px,2vw,24px)/1.1 'Archivo',sans-serif;color:var(--ink);letter-spacing:-0.02em;margin:0 0 12px;}",
    ".ac-ex-block{margin-bottom:12px;}",
    ".ac-ex-k{font:800 10.5px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);margin-bottom:5px;}",
    ".ac-ex-v{font-size:14px;line-height:1.55;color:#3f4751;}",
    ".ac-ex-img{border:1px solid var(--line);border-radius:11px;overflow:hidden;background:#f3eef0;}",
    ".ac-ex-img img{display:block;width:100%;height:auto;}",
    /* workflow selector */
    ".ac-tabs{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;}",
    ".ac-tab{font:700 12.5px 'Archivo',sans-serif;color:var(--mut);background:#fff;border:1px solid var(--line);border-radius:8px;padding:7px 13px;cursor:pointer;transition:all .15s;}",
    ".ac-tab:hover{border-color:var(--mag);color:var(--ink);}",
    ".ac-tab.on{background:var(--ink);color:#fff;border-color:var(--ink);}",
    ".ac-flow{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}",
    ".ac-fl{border:1px solid var(--line);border-radius:10px;padding:13px;background:var(--paper);}",
    ".ac-fl.io{border-top:2px solid var(--mag);}",
    ".ac-fl-k{font:800 10.5px 'Archivo',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);margin-bottom:7px;}",
    ".ac-fl-v{font-size:12.5px;line-height:1.5;color:var(--ink);}",
    /* series roadmap */
    ".ac-series{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin:24px 0;}",
    ".ac-sr{border:1px solid var(--line);border-radius:12px;background:#fff;padding:22px;position:relative;overflow:hidden;transition:border-color .25s,box-shadow .25s;}",
    ".ac-sr:hover{border-color:var(--mag);box-shadow:0 16px 36px -26px rgba(214,0,108,0.5);}",
    ".ac-sr-n{font:800 11px 'Archivo',sans-serif;letter-spacing:0.12em;color:var(--mag);margin-bottom:9px;}",
    ".ac-sr-h{font:800 17px 'Archivo',sans-serif;color:var(--ink);margin:0 0 8px;letter-spacing:-0.015em;}",
    ".ac-sr-b{font-size:13px;line-height:1.55;color:var(--mut);margin:0;}",
    ".ac-sr-soon{position:absolute;top:14px;right:14px;font:700 9px 'Archivo',sans-serif;letter-spacing:0.1em;text-transform:uppercase;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:3px 8px;}",
    /* reveal: no entrance animation (kept robust); modules are always visible. */
    ".ac-reveal{opacity:1;}",
    /* responsive */
    "@media (max-width:820px){",
    ".ac-proof{grid-template-columns:1fr;} .ac-metrics{grid-template-columns:repeat(2,1fr);}",
    ".ac-tl-row{grid-template-columns:1fr;gap:10px;} .ac-tl-year{font-size:30px;}",
    ".ac-ladder{grid-template-columns:1fr 1fr;} .ac-rung{border-right:1px solid var(--line);border-bottom:0;} .ac-rung:nth-child(1),.ac-rung:nth-child(2){border-bottom:0;}",
    ".ac-stack{grid-template-columns:1fr;} .ac-loop{grid-template-columns:1fr 1fr;}",
    ".ac-ex-grid{grid-template-columns:1fr;} .ac-flow{grid-template-columns:1fr 1fr;} .ac-series{grid-template-columns:1fr;}",
    "}",
    "@media (prefers-reduced-motion:reduce){.ac-reveal{opacity:1;}}"
  ].join("") + "</style>";

  /* ---------- module builders ---------- */
  function heroProof() {
    return '<div class="ac-proof ac-reveal">' +
      '<div class="ac-proof-img"><img src="' + IMG + 'hero-stats.jpg" alt="ChatGPT 2025 chat stats screenshot"></div>' +
      '<div class="ac-proof-chips">' +
        '<div class="ac-chip"><b>17.25K</b><span>Messages sent in 2025 ChatGPT stats</span></div>' +
        '<div class="ac-chip"><b>Top 1%</b><span>By messages sent in 2025 ChatGPT stats</span></div>' +
        '<div class="ac-chip"><b>979</b><span>Total chats recorded in 2025 ChatGPT stats</span></div>' +
        '<div class="ac-cap">2025 ChatGPT usage stats: 17.25K messages sent, 979 total chats, top 1% by messages sent.</div>' +
      "</div></div>";
  }

  function metricStrip() {
    var M = [
      ["Nov 2022", "Started using ChatGPT from the first public release"],
      ["Early Plus", "Continuous paid ChatGPT use from the Plus rollout"],
      ["17.25K", "Messages sent in 2025 ChatGPT stats"],
      ["Top 1%", "By messages sent in 2025 ChatGPT stats"],
      ["979", "Total chats recorded in 2025 ChatGPT stats"],
      ["20+", "GitHub repositories built with AI-assisted workflows"]
    ];
    return '<div class="ac-metrics ac-reveal">' + M.map(function (x) {
      return '<div class="ac-mc"><div class="ac-mv">' + x[0] + '</div><div class="ac-ml">' + x[1] + "</div></div>";
    }).join("") + "</div>";
  }

  function timelineStatic() {
    function plateLg(src, cap) { return '<div class="ac-plate lg"><img src="' + IMG + src + '" alt="' + esc(cap) + '"><div class="ac-plate-cap">' + esc(cap) + "</div></div>"; }
    function plateSm(src, cap) { return '<div class="ac-plate sm"><img src="' + IMG + src + '" alt="' + esc(cap) + '"><div class="ac-plate-cap">' + esc(cap) + "</div></div>"; }
    var rows = [
      { y: "2022", era: "Chatbot Era", h: "Natural language becomes a usable interface", b: "ChatGPT made natural-language interaction with AI feel usable for everyday work. Early use focused on learning, writing support, code explanations, research questions, and fast iteration. The model was powerful enough to change habits, but unreliable enough to require constant checking.", plates: plateLg("2022-chatgpt.png", "OpenAI, Introducing ChatGPT, November 30, 2022.") },
      { y: "2023", era: "Serious Work Era", h: "GPT-4 turns AI into a work companion", b: "GPT-4 made AI much more useful for research structure, paper drafting, econometrics questions, Stata code, debugging, business analysis, and longer reasoning tasks. The model became less of a novelty and more of a serious work companion.", plates: plateLg("2023-chatgpt-plus.png", "OpenAI, Introducing ChatGPT Plus, February 1, 2023.") + plateSm("2023-gpt4-benchmark.png", "GPT-4 technical report benchmark table.") },
      { y: "2024", era: "Multimodal and Reasoning Era", h: "Images, documents, and stepwise reasoning", b: "GPT-4o, reasoning models, and stronger long-context systems expanded the range of tasks. AI became useful not only for text, but also for images, documents, diagrams, screenshots, and more complex planning. The challenge shifted from getting an answer to choosing the right model, context, and verification process.", plates: plateLg("2024-o1.png", "OpenAI o1 reasoning model, 2024.") + plateSm("2024-imagegen.png", "Multimodal text-in-image generation demo.") },
      { y: "2025", era: "Agentic Coding and Workflow Era", h: "Models move into the repository", b: "Claude Code, Cursor, Codex, and similar tools moved AI into implementation. The model could inspect files, propose edits, refactor code, and operate inside a project structure. This changed the unit of work from a response to a task.", plates: plateLg("2025-claude-code.png", "Claude Code, an agent that reads a codebase and runs commands.") },
      { y: "2026", era: "Harness Era", h: "From prompting models to designing systems", b: "The focus shifted from prompting individual models to designing repeatable systems around them. Research papers, internet products, and quant research workflows could be organized as harnesses: structured pipelines with context packaging, model routing, review gates, and reusable output formats.", plates: harness2026() }
    ];
    return '<div class="ac-tl">' + rows.map(function (r) {
      return '<div class="ac-tl-row ac-reveal"><div><div class="ac-tl-year">' + r.y + '</div><div class="ac-tl-era">' + esc(r.era) + '</div></div>' +
        '<div class="ac-tl-main"><h4 class="ac-tl-h">' + esc(r.h) + '</h4><p class="ac-tl-b">' + esc(r.b) + '</p>' +
        '<div class="ac-tl-plates">' + r.plates + "</div></div></div>";
    }).join("") + "</div>";
  }
  function harness2026() {
    return '<div class="ac-2026"><div class="r"><span class="b">Context</span><span class="ar">&#8594;</span><span class="b on">Route</span><span class="ar">&#8594;</span><span class="b">Generate</span><span class="ar">&#8594;</span><span class="b">Review</span></div>' +
      '<div class="cap">A harness: structured pipeline with context packaging, model routing, review gates, and reusable output formats.</div></div>';
  }

  function routingMatrix() {
    var rows = [
      ["Research framing", "ChatGPT / Claude", "fast structure, hypothesis generation, critique", "source check and manual revision"],
      ["Long-form writing", "Claude / ChatGPT", "rewrite quality, narrative control, section logic", "human editing and tone control"],
      ["Source-heavy reading", "NotebookLM / Gemini", "grounded synthesis across documents", "citation and source verification"],
      ["Codebase editing", "Claude Code / Cursor / Codex", "file-level changes, refactors, repo context", "run, inspect, test, commit manually"],
      ["Chinese reasoning", "DeepSeek / Kimi / Doubao", "Chinese context, local phrasing, alternative checks", "cross-model comparison"],
      ["Visual ideation", "Midjourney / Seedance / media models", "rapid visual exploration and concept generation", "manual selection and consistency check"],
      ["Quant workflow", "ChatGPT / Claude / Codex", "factor ideation, code scaffolding, robustness lists", "data validation and backtest reading"]
    ];
    return '<div class="ac-tablewrap ac-reveal"><table class="ac-table">' +
      "<thead><tr><th>Work type</th><th>Model layer</th><th>Why it fits</th><th>Review gate</th></tr></thead><tbody>" +
      rows.map(function (r) {
        return '<tr><td class="work">' + esc(r[0]) + '</td><td class="layer">' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td class="gate">' + esc(r[3]) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function ladder() {
    var steps = [
      ["Step 1", "Prompt", "Single question, single answer, low structure."],
      ["Step 2", "Workflow", "Multi-step process with context, intermediate outputs, and revision."],
      ["Step 3", "Harness", "Reusable pipeline with templates, model routing, checks, and repeatable outputs."],
      ["Step 4", "Production System", "A working structure for papers, products, repositories, or quant research loops."]
    ];
    return '<div class="ac-ladder ac-reveal">' + steps.map(function (s) {
      return '<div class="ac-rung"><div class="ac-rung-bar"></div><div class="ac-rung-n">' + s[0] + '</div><div class="ac-rung-h">' + esc(s[1]) + '</div><div class="ac-rung-b">' + esc(s[2]) + "</div></div>";
    }).join("") + "</div>";
  }

  function useCases() {
    var C = [
      ["Research Writing", "Literature triage, research-question formation, outline design, paragraph revision, argument testing, and memo production."],
      ["Econometrics and Stata", "Regression setup, Stata syntax, DID and RCT intuition, panel-data questions, robustness planning, and output-table interpretation."],
      ["Coding and Web Implementation", "Code inspection, scoped edits, debugging, refactoring, interface implementation, and repository-level iteration."],
      ["Product and Business Analysis", "User flows, page structures, PRDs, competitor maps, positioning notes, and launch plans."],
      ["Quant and Equity Research", "Factor ideation, signal framing, code scaffolding, chart generation, research-note drafting, and robustness checklists."]
    ];
    return '<div class="ac-cards ac-reveal">' + C.map(function (c) {
      return '<div class="ac-uc"><div class="ac-uc-h">' + esc(c[0]) + '</div><div class="ac-uc-b">' + esc(c[1]) + "</div></div>";
    }).join("") + "</div>";
  }

  function toolStack() {
    var G = [
      ["Reasoning and Writing", ["ChatGPT", "Claude", "Gemini", "DeepSeek", "Kimi", "Doubao"]],
      ["Coding and Agents", ["Claude Code", "Cursor", "OpenAI Codex"]],
      ["Research and Knowledge", ["NotebookLM", "Obsidian", "structured notes", "source libraries"]],
      ["Data and Econometrics", ["Stata workflows", "regression debugging", "robustness planning", "code generation"]],
      ["Multimodal Generation", ["Midjourney", "Seedance", "image models", "video models"]],
      ["Durable Outputs", ["GitHub repositories", "research notes", "product specs", "quant memos"]]
    ];
    return '<div class="ac-stack ac-reveal">' + G.map(function (g) {
      return '<div class="ac-sg"><div class="ac-sg-h">' + esc(g[0]) + '</div><div class="ac-sg-t">' + g[1].map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div></div>";
    }).join("") + "</div>";
  }

  function qualityLoop() {
    var N = [
      ["Source grounding", "Important claims should trace back to source material."],
      ["Cross-model comparison", "Different models expose different assumptions and failure modes."],
      ["Manual review", "Final judgment remains human, especially for research and investment work."],
      ["Testable implementation", "Code should be inspected, run, and checked before being trusted."],
      ["Versioned output", "Prompts, notes, drafts, and code changes should leave a trace."]
    ];
    return '<div class="ac-loop ac-reveal" data-ac-loop="1">' + N.map(function (n, i) {
      return '<div class="ac-node' + (i === 0 ? " on" : "") + '"><div class="n">' + (i + 1) + '</div><h4>' + esc(n[0]) + '</h4><p>' + esc(n[1]) + "</p></div>";
    }).join("") + "</div>";
  }

  function timelineExplorer() {
    return '<div class="ac-ix ac-reveal" data-ac-explorer="1">' +
      '<div class="ac-ix-h"><span class="tag">Interactive</span>Timeline explorer</div>' +
      '<div class="ac-chips" data-role="years"></div>' +
      '<div class="ac-ex-grid"><div class="ac-ex-text"></div><div class="ac-ex-side"></div></div>' +
      "</div>";
  }

  function workflowSelector() {
    return '<div class="ac-ix ac-reveal" data-ac-workflow="1">' +
      '<div class="ac-ix-h"><span class="tag">Interactive</span>Workflow selector</div>' +
      '<div class="ac-tabs" data-role="tabs"></div>' +
      '<div class="ac-flow" data-role="flow"></div>' +
      "</div>";
  }

  function seriesCards() {
    var C = [
      ["Next 01", "Paper Production Harness", "A repeatable workflow for literature triage, research framing, outline design, drafting, revision, citation checks, and final manuscript assembly.", true],
      ["Next 02", "Product Manager Harness", "A workflow for turning rough internet-product ideas into user flows, feature maps, interface copy, PRDs, and implementation-ready specifications.", true],
      ["Next 03", "Quant Research Harness", "A research system for moving from factor intuition to code scaffolding, backtest logic, robustness checks, charts, and research memos.", true],
      ["Next 04", "GitHub Case Studies", "Concrete repositories showing how AI-assisted workflows move from prompts to files, scripts, interfaces, and working systems.", true]
    ];
    return '<div class="ac-series ac-reveal">' + C.map(function (c) {
      return '<div class="ac-sr"><div class="ac-sr-n">' + esc(c[0]) + '</div>' + (c[3] ? '<div class="ac-sr-soon">Coming soon</div>' : "") +
        '<h4 class="ac-sr-h">' + esc(c[1]) + '</h4><p class="ac-sr-b">' + esc(c[2]) + "</p></div>";
    }).join("") + "</div>";
  }

  /* ---------- article ---------- */
  window.__aicycleArticle = function (data) {
    var H = STYLE;

    /* sticky controls + progress (reuse ai-* shell) */
    H += '<div class="ai-controls ac-controls">' +
      '<span class="ac-brand" style="display:inline-flex;align-items:center;gap:8px;flex:none;font:800 11px \'Archivo\',sans-serif;letter-spacing:0.12em;text-transform:uppercase;color:#d6006c;"><i style="width:9px;height:9px;border-radius:2px;background:#d6006c;display:inline-block;"></i>AI Field Note 01</span>' +
      '<nav class="ai-index" aria-label="Section index"></nav></div>';
    H += '<div class="ai-progress" data-ac-progress="1"><i></i></div>';

    /* HERO */
    H += '<section class="ca-section ai-sec ac-sec" id="ac-sec-hero" data-ac-label="Overview">' +
      '<div class="ca-kicker">Working with AI &middot; Field Note 01</div>' +
      '<h1 class="ca-title">A Front-Row Seat to the AI Cycle</h1>' +
      '<div class="ai-role">Documented top 1% ChatGPT user &middot; daily use since the first public release</div>' +
      '<p class="ac-sub-lede">A personal record of high-intensity AI use since the first public ChatGPT release, from early chatbot workflows to research systems, coding agents, and production harnesses.</p>' +
      p("I started using ChatGPT in November 2022, when the first public version still felt closer to a strange research demo than a mature work tool. At the time, the main question was simple: could a language model actually help with real thinking, writing, coding, and analysis?") +
      p("That question became a daily experiment. When ChatGPT Plus became available during the early rollout in 2023, I began using it continuously. By 2025, my ChatGPT stats recorded 17.25K messages sent, 979 total chats, and top 1% usage by messages sent.") +
      p("The number is not the point by itself. It matters because it represents accumulated contact with model behavior across thousands of real tasks: research writing, coding, econometrics, product analysis, stock research, quant workflows, and learning. The real skill came from seeing where models improved, where they failed, and how different tools fit different parts of a workflow.") +
      heroProof() +
      metricStrip() +
      "</section>";

    /* 1 — working layer */
    H += sec("workinglayer", "From Chatbot to Working Layer", "AI Stops Being a Place to Ask Questions",
      p("The first version of ChatGPT was useful, but fragile. It could explain concepts, rewrite paragraphs, and generate code snippets, but it often lost precision when the task became long, technical, or source-dependent. Early use was mostly exploratory: asking for explanations, testing writing styles, debugging code, and using the model as a fast tutor.") +
      p("The workflow changed as the models improved. GPT-4 made AI more reliable for structured research, argument review, coding assistance, and complex reasoning. Multimodal models added image and document understanding. Reasoning models made stepwise problem-solving more useful. Coding agents moved the interaction from a chat window into repositories, terminals, and file systems.") +
      p("Looking back, the important shift was not one single model release. It was the movement from &ldquo;AI as an assistant&rdquo; to &ldquo;AI as a working layer.&rdquo; The model stopped being a place to ask isolated questions and became part of the way research, code, products, and analysis were produced."));

    /* 2 — the cycle (static timeline) */
    H += sec("cycle", "The AI Cycle I Lived Through", "Five Capability Regimes, 2022 to 2026",
      p("The last three years were not one continuous improvement curve. They felt more like a sequence of capability regimes. Each regime changed what kind of work could be done with AI and what kind of human judgment became more important.") +
      timelineStatic());

    /* 3 — model judgment + matrix */
    H += sec("judgment", "Model Judgment, Not Model Loyalty", "Knowing Which Model Handles Which Work",
      p("I do not treat frontier models as interchangeable. After years of daily use, the main skill has become knowing which model should handle which part of the work, and where each model needs constraints.") +
      p("ChatGPT has been the default layer for broad reasoning, fast iteration, multimodal exploration, and general research assistance. Claude is often better for long-form writing, careful rewriting, document structure, and codebase-level reasoning. Claude Code, Cursor, and Codex move AI from conversation into implementation, where prompts become commits, tests, refactors, and file-level changes. Gemini and NotebookLM are useful when the task depends on source-heavy reading and cross-document synthesis. DeepSeek, Kimi, and Doubao are useful for Chinese-language reasoning, local context, and fast alternative model checks.") +
      p("The point is not that one model is best. The point is that different models have different failure modes. Some write fluent prose too easily. Some are better at explaining code than safely editing it. Some are strong at retrieval but weaker at judgment. Some can reason through a problem but still invent details when the source context is thin.") +
      p("My workflow therefore treats model selection as part of the research design. A task is first decomposed into reading, reasoning, coding, drafting, checking, and presentation. Each stage is assigned to the model or tool that fits it best. Outputs are then reviewed through source grounding, cross-model comparison, manual verification, and testable implementation steps.") +
      '<div class="ca-h" style="margin-top:26px">How I Route Work Across Models</div>' +
      routingMatrix());

    /* 4 — prompts to harnesses + ladder */
    H += sec("harness", "From Prompts to Harnesses", "A Prompt Is Not Yet a System",
      p("Most people first meet AI through prompts. A prompt is useful, but it is not yet a system. A prompt produces an answer. A workflow produces a sequence of outputs. A harness produces repeatable work.") +
      p("Over time, my use moved from single prompts to structured production loops. A research task might begin with source collection, move into literature mapping, generate a research memo, test econometric framing, draft sections, check claims, and produce figures. A coding task might begin with a feature description, move into file inspection, implementation, debugging, refactoring, and deployment. A quant task might begin with a market intuition, move into factor definition, data preparation, backtest logic, robustness checks, and a research note.") +
      p("The harness idea is simple: give each model a defined role, feed it the right context, constrain the output format, and create review gates before the next step. This makes AI useful without pretending that the model is always correct.") +
      ladder());

    /* 5 — where AI does real work */
    H += sec("realwork", "Where AI Does Real Work", "Five Use Cases That Hold Up",
      p("AI has been most useful when the task can be decomposed into smaller parts and reviewed at each stage. My strongest use cases fall into five categories.") +
      useCases());

    /* 6 — tool stack */
    H += sec("stack", "The Tool Stack", "Layers, Not a Collection",
      p("The tool stack is less important than the work it enables, but different layers serve different roles. The stack changes often. The operating principle stays stable: choose the smallest tool that can do the job, keep the context clean, and make the output inspectable.") +
      toolStack());

    /* 7 — quality control + loop */
    H += sec("quality", "Quality Control", "High-Volume Use Makes Verification Matter More",
      p("High-volume AI use makes verification more important, not less important. The most useful AI workflows include review gates. Research output needs source grounding. Code changes need inspection and testing. Econometric suggestions need identification checks. Product analysis needs market judgment. Quant ideas need data validation and backtesting. Writing needs tone control and removal of fluent but empty language.") +
      p("My default assumption is that an AI output is a draft, not a conclusion. It may be fast, useful, and surprisingly strong, but it still needs to be checked against sources, data, code, or experience. If a question matters, one model is rarely enough. Cross-model comparison often reveals hidden assumptions, missing details, or overconfident reasoning.") +
      '<div class="ca-h" style="margin-top:26px">Quality Control Loop</div>' +
      qualityLoop());

    /* 8 — what changed */
    H += sec("changed", "What High-Intensity Use Changed", "Leverage, Not Just Speed",
      p("The biggest change was not speed, although the speed gain is real. The bigger change was leverage. AI made it possible to explore more research directions, test more phrasing options, build more prototypes, debug more code, and compare more analytical frames. It also made weak thinking easier to hide. That is why the workflow matters more than the tool.") +
      p("A strong AI workflow does not ask the model to replace judgment. It uses the model to expand the search space, accelerate low-level production, surface alternatives, and create drafts that can be reviewed. The human role shifts toward framing, selection, verification, and final synthesis. That is the difference between using AI often and working AI-native."));

    /* 9 — interactive explorers */
    H += sec("explore", "Explore the Cycle", "Two Compact Control Panels",
      p("The same material, made explorable. Select a year to see how each capability regime changed the workflow, or select a work type to see how AI is routed through it.") +
      timelineExplorer() +
      workflowSelector());

    /* 10 — series + conclusion */
    H += sec("series", "What This Series Covers", "The Harnesses Behind the Output",
      p("This article is the entry point for a series on AI-native work systems. The following pieces go deeper into the harnesses behind different kinds of output.") +
      seriesCards() +
      '<h3 class="ca-sub ac-h2" style="margin-top:40px">Not Just More AI Usage</h3>' +
      p("The value of three years of intensive AI use is not simply familiarity with more tools. It is the ability to see how models differ, where they fail, and how they can be combined into workflows that produce real output.") +
      p("The strongest lesson is a modest one: AI is most powerful when it is neither treated as magic nor dismissed as autocomplete. It works best as a structured layer inside research, coding, product, and analytical systems, with clear human judgment around it.") +
      '<div class="ca-foot"><span>AI Field Note 01 &middot; A Front-Row Seat to the AI Cycle</span><span>Zhenyuan Pan &middot; 2026</span></div>');

    return (
      '<button class="case-close" type="button" aria-label="Close article"><span>Close</span><span class="x">\u2715</span></button>' +
      '<div class="case-scroll ac-scroll"><article class="case-article ai-article ac-article">' + H + "</article></div>"
    );
  };

  /* ================= interactions / viz ================= */
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var EXPLORER = {
    "2022": { regime: "Chatbot Era", changed: "AI became usable through natural language.", shift: "Learning, writing support, code explanations, and research questions.", img: "2022-chatgpt.png", cap: "Introducing ChatGPT, 2022." },
    "2023": { regime: "Serious Work Era", changed: "GPT-4 improved structured reasoning and reliability.", shift: "Paper drafting, econometrics questions, Stata code, business analysis, and longer technical reasoning.", img: "2023-gpt4-benchmark.png", cap: "GPT-4 benchmark table, 2023." },
    "2024": { regime: "Multimodal and Reasoning Era", changed: "Multimodal and reasoning models expanded task coverage.", shift: "Document reading, image interpretation, diagram reasoning, planning, and model comparison.", img: "2024-o1.png", cap: "o1 reasoning model, 2024." },
    "2025": { regime: "Agentic Coding and Workflow Era", changed: "Coding agents entered repositories, terminals, and project structures.", shift: "Prompts became scoped implementation tasks, diffs, refactors, and codebase-level edits.", img: "2025-claude-code.png", cap: "Claude Code, 2025." },
    "2026": { regime: "Harness Era", changed: "The focus moved from individual prompts to repeatable systems.", shift: "Paper, product, and quant workflows became structured pipelines.", img: null, cap: null }
  };
  var YEARS = ["2022", "2023", "2024", "2025", "2026"];

  var WORKFLOWS = {
    Research: { input: "paper topic, source documents, notes, research question", ai: "literature mapping, outline design, argument testing, paragraph revision", human: "source verification, academic judgment, claim control", output: "research memo, outline, draft section, revision checklist" },
    Coding: { input: "feature request, codebase, error message, implementation goal", ai: "file inspection, patch proposal, refactor, debugging assistance", human: "diff inspection, test run, scope control", output: "working code, patch, commit-ready change" },
    Econometrics: { input: "dataset structure, regression question, identification design", ai: "Stata syntax, model setup, robustness checklist, output interpretation draft", human: "identification logic, data validity, coefficient interpretation", output: "regression code, table notes, robustness plan" },
    Product: { input: "product idea, user problem, competitor references", ai: "user flow, PRD draft, feature map, page copy, launch checklist", human: "prioritization, market logic, user judgment", output: "product spec, interface structure, implementation brief" },
    Quant: { input: "market intuition, factor hypothesis, data structure", ai: "signal framing, code scaffolding, chart generation, memo drafting", human: "data cleaning, backtest validity, risk interpretation", output: "factor memo, scripts, figures, repository update" },
    Knowledge: { input: "notes, documents, screenshots, saved sources", ai: "summarization, connection discovery, retrieval, synthesis", human: "source checking, memory organization, long-term note quality", output: "structured notes, knowledge maps, reusable context packs" }
  };
  var WF_KEYS = ["Research", "Coding", "Econometrics", "Product", "Quant", "Knowledge"];

  function wireIndexAndProgress(scroller) {
    var nav = scroller.querySelector(".ac-controls .ai-index");
    var secs = [].slice.call(scroller.querySelectorAll(".ac-sec[data-ac-label]"));
    if (!nav) return;
    var links = [];
    secs.forEach(function (s) {
      var a = document.createElement("button");
      a.type = "button"; a.className = "ai-ix"; a.textContent = s.getAttribute("data-ac-label"); a.setAttribute("data-target", s.id);
      a.addEventListener("click", function () {
        var top = s.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 92;
        scroller.scrollTo({ top: top, behavior: REDUCED ? "auto" : "smooth" });
      });
      nav.appendChild(a); links.push({ a: a, s: s });
    });
    var prog = scroller.querySelector(".ai-progress i");
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

  function wireReveal(scroller) {
    var els = [].slice.call(scroller.querySelectorAll(".ac-reveal"));
    if (REDUCED) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    function check() {
      var srt = scroller.getBoundingClientRect().top;
      var vh = scroller.clientHeight || window.innerHeight || 800;
      els.forEach(function (e) {
        if (e.classList.contains("in")) return;
        var r = e.getBoundingClientRect();
        if (r.top < srt + vh * 0.94) e.classList.add("in");
      });
    }
    var ticking = false;
    scroller.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; check(); });
    }, { passive: true });
    /* initial passes: the overlay open animation can delay layout, so re-check a few times */
    requestAnimationFrame(check);
    setTimeout(check, 150);
    setTimeout(check, 550);
    /* safety net: never leave a module stuck invisible */
    setTimeout(function () { els.forEach(function (e) { e.classList.add("in"); }); }, 1800);
  }

  function wireLoop(scroller) {
    var loop = scroller.querySelector("[data-ac-loop]");
    if (!loop) return;
    var nodes = [].slice.call(loop.querySelectorAll(".ac-node"));
    if (REDUCED || nodes.length < 2) return;
    var i = 0;
    setInterval(function () {
      nodes.forEach(function (n) { n.classList.remove("on"); });
      i = (i + 1) % nodes.length;
      nodes[i].classList.add("on");
    }, 2200);
  }

  function wireExplorer(scroller) {
    var box = scroller.querySelector("[data-ac-explorer]");
    if (!box) return;
    var chips = box.querySelector('[data-role="years"]');
    var textEl = box.querySelector(".ac-ex-text");
    var sideEl = box.querySelector(".ac-ex-side");
    YEARS.forEach(function (y, idx) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "ac-yc" + (idx === 0 ? " on" : ""); b.textContent = y;
      b.addEventListener("click", function () {
        chips.querySelectorAll(".ac-yc").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); render(y);
      });
      chips.appendChild(b);
    });
    function render(y) {
      var d = EXPLORER[y];
      textEl.innerHTML = '<div class="ac-ex-regime">' + esc(d.regime) + "</div>" +
        '<div class="ac-ex-block"><div class="ac-ex-k">What changed in AI</div><div class="ac-ex-v">' + esc(d.changed) + "</div></div>" +
        '<div class="ac-ex-block"><div class="ac-ex-k">How the workflow changed</div><div class="ac-ex-v">' + esc(d.shift) + "</div></div>";
      sideEl.innerHTML = d.img ? '<div class="ac-ex-img"><img src="' + IMG + d.img + '" alt="' + esc(d.cap || "") + '"></div>' +
        (d.cap ? '<div class="ac-cap">' + esc(d.cap) + "</div>" : "")
        : '<div class="ac-2026"><div class="r"><span class="b">Context</span><span class="ar">&#8594;</span><span class="b on">Route</span><span class="ar">&#8594;</span><span class="b">Generate</span><span class="ar">&#8594;</span><span class="b">Review</span></div><div class="cap">2026 is about building repeatable harnesses around models.</div></div>';
    }
    render("2022");
  }

  function wireWorkflow(scroller) {
    var box = scroller.querySelector("[data-ac-workflow]");
    if (!box) return;
    var tabs = box.querySelector('[data-role="tabs"]');
    var flow = box.querySelector('[data-role="flow"]');
    WF_KEYS.forEach(function (k, idx) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "ac-tab" + (idx === 0 ? " on" : ""); b.textContent = k;
      b.addEventListener("click", function () {
        tabs.querySelectorAll(".ac-tab").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); render(k);
      });
      tabs.appendChild(b);
    });
    function render(k) {
      var d = WORKFLOWS[k];
      flow.innerHTML =
        '<div class="ac-fl io"><div class="ac-fl-k">Input</div><div class="ac-fl-v">' + esc(d.input) + "</div></div>" +
        '<div class="ac-fl"><div class="ac-fl-k">AI role</div><div class="ac-fl-v">' + esc(d.ai) + "</div></div>" +
        '<div class="ac-fl"><div class="ac-fl-k">Human review</div><div class="ac-fl-v">' + esc(d.human) + "</div></div>" +
        '<div class="ac-fl io"><div class="ac-fl-k">Output</div><div class="ac-fl-v">' + esc(d.output) + "</div></div>";
    }
    render("Research");
  }

  window.__aicycleViz = {
    init: function (scroller) {
      if (!scroller || scroller.__acDone) return;
      if (!scroller.querySelector(".ac-article")) return;
      scroller.__acDone = true;
      try {
        wireIndexAndProgress(scroller);
        wireReveal(scroller);
        wireLoop(scroller);
        wireExplorer(scroller);
        wireWorkflow(scroller);
      } catch (err) { if (window.console) console.warn("aicycle-viz", err); }
    }
  };
})();
