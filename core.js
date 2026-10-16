"use strict";
/* ══════════════════════════════════════════════════════════════════
   VIRTUAL LAB CORE
   Every experiment is a plain object passed to Lab.register():

   {
     id, subject, title, topic, icon, summary, aim,
     variables: { iv, dv, cv:[...] },          // independent / dependent / control
     columns:   [{ key, label, dp }],          // results table (omit for none)
     series:    "key",                         // optional: group graph lines by this column
     graph:     { x:[keys], y:[keys], fit:"linear"|"curve"|"none" },  // omit for none
     layout:    "wide",                        // optional: apparatus first, controls on the right
     questions: [{ q, a }],
     setup(ctx) { ...build controls into ctx.controls, apparatus into ctx.stage... }
   }

   ctx gives each experiment: slider/select/seg/buttons helpers, readout(),
   record(row), rows(), toast(), frame() (animation loop), every(), cleanup().
══════════════════════════════════════════════════════════════════ */
const Lab = (function(){

  const SUBJECTS = {
    physics:   { name:"Physics",   codes:{ igcse:"0625", as:"9702", a:"9702" }, theme:"ocean",    blurb:"Electricity, forces, light and oscillations — measure, plot and find the relationship." },
    chemistry: { name:"Chemistry", codes:{ igcse:"0620", as:"9701", a:"9701" }, theme:"sunset",   blurb:"Titrations, rates and qualitative analysis without the broken glassware." },
    biology:   { name:"Biology",   codes:{ igcse:"0610", as:"9700", a:"9700" }, theme:"forest",   blurb:"Photosynthesis, enzymes and osmosis with living-system variability." },
    ict:       { name:"ICT & IT",  codes:{ igcse:"0417", as:"9626", a:"9626" }, theme:"lavender", blurb:"Spreadsheets, database queries and validation — the practical-paper skills." }
  };
  /* experiments set level:"igcse" (default), "as" or "a" */
  const LEVELS = { igcse:"IGCSE", as:"AS Level", a:"A Level" };
  const LEVEL_ORDER = ["igcse","as","a"];
  const levelsOf = d => [].concat(d.level || "igcse");          // a lab may belong to several levels
  const levelOf = d => levelsOf(d)[0];
  const inLevel = (d, lv) => lv === "all" || levelsOf(d).includes(lv);
  const levelChip = d => levelsOf(d).map(l => LEVELS[l]).join(" · ");
  const codesOf = d => [...new Set(levelsOf(d).map(l => SUBJECTS[d.subject].codes[l]))].join(" / ");
  function codeLine(s, lv){
    const c = SUBJECTS[s].codes;
    if(lv !== "all") return "Cambridge " + LEVELS[lv] + " " + c[lv];
    return "IGCSE " + c.igcse + " · AS & A Level " + c.as;
  }
  const ORDER = ["physics","chemistry","biology","ict"];
  const sims = [], byId = {};
  let current = null;
  let filter = "all";
  let level = "all";

  /* ── storage (wrapped: private windows can throw) ── */
  function load(key, fallback){
    try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; }
  }
  function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
  const rowsKey = id => "vlab-results::" + id;

  /* ── small helpers ── */
  const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const $ = (sel, root) => (root || document).querySelector(sel);
  function el(html){ const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function gauss(){ let u = 0, v = 0; while(!u) u = Math.random(); while(!v) v = Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
  function sig(v, n){
    if(!isFinite(v)) return "—";
    if(v === 0) return "0";
    return String(Number(v.toPrecision(n || 3)));
  }
  function fmt(v, dp){
    if(v === null || v === undefined || v === "") return "";
    if(typeof v === "number") return isFinite(v) ? (dp === undefined ? sig(v, 4) : v.toFixed(dp)) : "—";
    return String(v);
  }

  let toastTimer = null;
  function toast(msg){
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ── light / dark ── */
  function setMode(mode){
    document.documentElement.setAttribute("data-mode", mode);
    try{ localStorage.setItem("vlab-mode", mode); }catch(e){}
    if(current && current.redraw) current.redraw();
    if(current && current.onMode) current.onMode();
  }
  function toggleMode(){ setMode(document.documentElement.getAttribute("data-mode") === "dark" ? "light" : "dark"); }

  /* ══════════════ ROUTER ══════════════ */
  function register(def){ sims.push(def); byId[def.id] = def; }

  function teardown(){
    if(!current) return;
    current.cleanups.forEach(fn => { try{ fn(); }catch(e){ console.error(e); } });
    current = null;
  }

  function route(){
    teardown();
    document.body.classList.toggle("on-hub", !/^#\/?[^/]+\/[^/]+/.test(location.hash));
    $("#toast").classList.remove("show");
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if(parts.length >= 2 && byId[parts[1]] && byId[parts[1]].subject === parts[0]) renderExperiment(byId[parts[1]]);
    else{
      filter = SUBJECTS[parts[0]] ? parts[0] : "all";
      renderHub();
    }
    window.scrollTo(0, 0);
  }

  /* ══════════════ HUB ══════════════ */
  const ICONS = {
    all:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    physics:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.6" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>`,
    chemistry:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3"/><path d="M7 15h10"/></svg>`,
    biology:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21c8 0 14-6 14-16-8 0-14 4-14 12v4z"/><path d="M5 21C9 15 12 12 16 9"/></svg>`,
    ict:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/></svg>`
  };
  let query = "";
  function progressOf(d){
    const n = load(rowsKey(d.id), []).length, ch = d.challenges ? load(chKey(d.id), []).length : 0;
    if(d.challenges && ch) return `${ch}/${d.challenges.length} challenges`;
    return n ? `${n} result${n === 1 ? "" : "s"}` : "";
  }
  function visibleSims(){
    const q = query.trim().toLowerCase();
    return sims.filter(d => (filter === "all" || d.subject === filter) && inLevel(d, level)
        && (!q || [d.title, d.topic, d.summary, SUBJECTS[d.subject].name].join(" ").toLowerCase().includes(q)))
      .sort((a, b) => (b.interactive ? 1 : 0) - (a.interactive ? 1 : 0)
        || ORDER.indexOf(a.subject) - ORDER.indexOf(b.subject)
        || LEVEL_ORDER.indexOf(levelOf(a)) - LEVEL_ORDER.indexOf(levelOf(b)));
  }
  function cardHtml(d){
    const p = progressOf(d);
    return `<a class="lab-card" data-s="${d.subject}" href="#/${d.subject}/${d.id}">
      <div class="lab-thumb">${d.thumb || `<span class="thumb-ico" aria-hidden="true">${d.icon || "🧪"}</span>`}</div>
      <div class="lab-body">
        <div class="chips"><span class="chip subj">${esc(SUBJECTS[d.subject].name)}</span><span class="chip">${levelChip(d)}</span>${d.interactive ? `<span class="chip hot">Hands-on</span>` : ""}</div>
        <h3>${esc(d.title)}</h3>
        <p>${esc(d.summary)}</p>
        <div class="lab-foot"><span>${esc(d.topic)}</span>${p ? `<span class="prog">${esc(p)}</span>` : ""}</div>
      </div>
    </a>`;
  }
  function renderCards(){
    const list = visibleSims(), box = $("#cards");
    if(!box) return;
    box.innerHTML = list.length ? list.map(cardHtml).join("")
      : `<p class="empty">No labs match${query ? ` “${esc(query)}”` : ""}${level !== "all" ? ` at ${LEVELS[level]}` : ""} yet.</p>`;
    $("#result-count").textContent = list.length + " lab" + (list.length === 1 ? "" : "s");
  }
  function renderHub(){
    level = load("vlab-level", "all"); if(level !== "all" && !LEVELS[level]) level = "all";
    document.documentElement.setAttribute("data-subject", filter);
    document.title = "Insight Labs — Virtual Science Lab";
    const count = s => sims.filter(d => (s === "all" || d.subject === s) && inLevel(d, level)).length;
    const tiles = ["all"].concat(ORDER).map(s => `<a class="subj-tile${filter === s ? " on" : ""}" data-s="${s}" href="#/${s === "all" ? "" : s}" aria-current="${filter === s}">
        <span class="subj-ico">${ICONS[s]}</span><span class="subj-name">${s === "all" ? "All labs" : esc(SUBJECTS[s].name)}</span><span class="subj-n">${count(s)}</span></a>`).join("");
    const levels = [["all","All levels"]].concat(LEVEL_ORDER.map(l => [l, LEVELS[l]]))
      .map(([k,n]) => `<button type="button" class="${level === k ? "on" : ""}" data-level="${k}" aria-pressed="${level === k}">${esc(n)}</button>`).join("");
    $("#app").innerHTML = `
      <section class="hub-hero">
        <div>
          <span class="eyebrow">Insight Labs · Cambridge IGCSE · AS &amp; A Level</span>
          <h1>Virtual Science Lab</h1>
          <p>Build circuits, run titrations, test foods and analyse data — real practicals you control with your hands, not just sliders.</p>
          <div class="hub-stats"><span><b>${sims.length}</b> labs</span><span><b>${sims.filter(d => d.interactive).length}</b> hands-on benches</span><span><b>4</b> subjects</span></div>
        </div>
        <div class="hub-art" aria-hidden="true">${HERO_ART}</div>
      </section>
      <nav class="subj-tiles" aria-label="Subject">${tiles}</nav>
      <div class="filter-row">
        <div class="segmented" role="group" aria-label="Level">${levels}</div>
        <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input type="search" id="search" placeholder="Search labs…" value="${esc(query)}" aria-label="Search labs"></label>
        <span class="count" id="result-count"></span>
      </div>
      <div class="card-grid" id="cards"></div>`;
    $("#app").querySelectorAll("[data-level]").forEach(b => b.onclick = () => { save("vlab-level", b.dataset.level); renderHub(); });
    $("#search").addEventListener("input", e => { query = e.target.value; renderCards(); });
    renderCards();
  }
  const HERO_ART = `<svg viewBox="0 0 360 240">
    <defs><linearGradient id="ha1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8A3D" stop-opacity=".95"/><stop offset="1" stop-color="#FF5C7A" stop-opacity=".9"/></linearGradient>
      <linearGradient id="ha2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3DDC97"/><stop offset="1" stop-color="#2DD4BF"/></linearGradient>
      <radialGradient id="ha3"><stop offset="0" stop-color="#FFE68A"/><stop offset="1" stop-color="#FFE68A" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="180" cy="222" rx="170" ry="10" fill="currentColor" opacity=".06"/>
    <g transform="translate(40 40)"><path d="M28 0h34M34 0v52L4 150a10 10 0 0 0 9 14h64a10 10 0 0 0 9-14L56 52V0" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="3"/>
      <path d="M17 112h56l14 38a10 10 0 0 1-9 14H13a10 10 0 0 1-9-14z" fill="url(#ha1)"/><circle cx="40" cy="128" r="4" fill="#fff" opacity=".6"><animate attributeName="cy" values="150;100" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="2.4s" repeatCount="indefinite"/></circle>
      <circle cx="56" cy="140" r="3" fill="#fff" opacity=".6"><animate attributeName="cy" values="155;95" dur="3.1s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="3.1s" repeatCount="indefinite"/></circle></g>
    <g transform="translate(170 30)"><circle cx="60" cy="60" r="56" fill="url(#ha3)" opacity=".55"/><circle cx="60" cy="60" r="20" fill="#FFE68A" stroke="currentColor" stroke-opacity=".5" stroke-width="3"/>
      <path d="M50 52l20 16M70 52L50 68" stroke="#7A5A00" stroke-width="2.5"/><path d="M60 80v40M30 120h60" stroke="currentColor" stroke-opacity=".55" stroke-width="3" fill="none"/>
      <path d="M0 120h30M90 120h40v-60h-50" stroke="#4DA3FF" stroke-width="3" fill="none"/><circle r="3.5" fill="#4DA3FF"><animateMotion dur="2.2s" repeatCount="indefinite" path="M0 120h30M90 120h40v-60h-50"/></circle></g>
    <g transform="translate(250 130)"><path d="M10 80c40 0 70-30 70-80C40 0 10 20 10 60z" fill="url(#ha2)" opacity=".9"/><path d="M10 80C30 50 45 35 62 22" stroke="#0B3D2A" stroke-width="2.5" fill="none" opacity=".6"/></g>
  </svg>`;

  /* ══════════════ EXPERIMENT PAGE ══════════════ */
  const chKey = id => "vlab-ch::" + id;
  function renderExperiment(def){
    const subj = SUBJECTS[def.subject];
    document.documentElement.setAttribute("data-subject", def.subject);
    document.title = def.title + " — Insight Labs";
    const v = def.variables;
    const varsHtml = v ? `<dl class="vars">
        ${v.iv ? `<dt class="iv">Independent</dt><dd>${esc(v.iv)}</dd>` : ""}
        ${v.dv ? `<dt class="dv">Dependent</dt><dd>${esc(v.dv)}</dd>` : ""}
        ${v.cv ? `<dt class="cv">Control</dt><dd>${esc(v.cv.join(" · "))}</dd>` : ""}
      </dl>` : "";
    const hasTable = !!def.columns, hasGraph = !!(def.columns && def.graph);
    const done = new Set(load(chKey(def.id), []));
    $("#app").innerHTML = `
      <div class="exp-top">
        <a class="back-link" href="#/${def.subject}">← ${esc(subj.name)} labs</a>
        <div class="chips"><span class="chip subj">${esc(subj.name)} ${esc(codesOf(def))}</span><span class="chip">${levelChip(def)}</span><span class="chip">${esc(def.topic)}</span>${def.interactive ? `<span class="chip hot">Hands-on</span>` : ""}</div>
        <h1>${esc(def.title)}</h1>
      </div>
      <div class="exp-grid${def.layout === "wide" ? " wide" : ""}">
        <aside class="exp-side">
          <section class="card"><h4>Aim</h4><p class="aim">${esc(def.aim)}</p>${varsHtml}</section>
          ${def.steps ? `<section class="card"><h4>Method <span class="count" id="step-count"></span></h4>
            <ol class="checklist" id="steps">${def.steps.map(s => `<li data-id="${esc(s.id)}"><span class="tick" aria-hidden="true"></span><span>${s.text}</span></li>`).join("")}</ol></section>` : ""}
          ${def.challenges ? `<section class="card"><h4>Challenges <span class="count" id="ch-count"></span></h4>
            <ol class="checklist challenges" id="challenges">${def.challenges.map(c => `<li data-id="${esc(c.id)}" class="${done.has(c.id) ? "done" : ""}"><span class="tick" aria-hidden="true"></span><span><b>${esc(c.title)}</b>${c.text ? `<small>${c.text}</small>` : ""}</span></li>`).join("")}</ol>
            <button class="btn small ghost" type="button" id="ch-reset">Reset challenges</button></section>` : ""}
          <section class="card ctl-card"><h4>${esc(def.controlsTitle || "Controls")}</h4><div id="ctl"></div></section>
        </aside>
        <div class="exp-main">
          <section class="stage-wrap" aria-label="Apparatus">
            <div class="stage-bar"><span class="stage-title">${esc(def.stageTitle || "Bench")}</span><span class="stage-tools" id="stage-tools"></span></div>
            <div class="stage${def.layout === "wide" ? " plain" : ""}" id="stage"></div>
            <div class="readout" id="readout"></div>
          </section>
          ${hasTable ? `<div class="notebook${hasGraph ? "" : " solo"}">
            <section class="card" aria-label="Results table"><h4>Results <span class="sp">
              <button class="btn small ghost" type="button" id="csv-btn">Export CSV</button>
              <button class="btn small ghost" type="button" id="clear-btn">Clear</button></span></h4>
              <div class="tbl-wrap" id="tbl"></div></section>
            ${hasGraph ? `<section class="card" aria-label="Graph"><h4>Graph <span class="sp graph-tools" id="graph-tools"></span></h4>
              <canvas class="graph-canvas" id="graph" role="img" aria-label="Graph of recorded results"></canvas>
              <div class="fit-info" id="fit-info"></div></section>` : ""}
          </div>` : ""}
          ${def.questions && def.questions.length ? `<section class="card qs" aria-label="Questions"><h4>Check your understanding</h4>
            ${def.questions.map((q,i) => `<details class="q"><summary><b>Q${i+1}</b> ${q.q}</summary><div class="ans">${q.a}</div></details>`).join("")}
          </section>` : ""}
        </div>
      </div>`;

    current = { def, cleanups:[], rows: load(rowsKey(def.id), []), redraw:null, steps:new Set(), done };
    const cur = current;
    const ctx = makeCtx(def, cur);
    updateChecklists(def, cur);
    const chReset = $("#ch-reset");
    if(chReset) chReset.onclick = () => { cur.done.clear(); save(chKey(def.id), []); updateChecklists(def, cur); };

    if(hasTable){
      $("#clear-btn").onclick = () => {
        if(!cur.rows.length || !confirm("Clear all recorded results for this experiment?")) return;
        cur.rows = []; save(rowsKey(def.id), cur.rows); refreshResults(def, cur);
      };
      $("#csv-btn").onclick = () => exportCsv(def, cur.rows);
      if(hasGraph) setupGraph(def, cur);
      refreshResults(def, cur);
    }
    try{ def.setup(ctx); }catch(e){ console.error(e); $("#stage").innerHTML = `<p class="empty">This experiment failed to load: ${esc(e.message)}</p>`; }
  }
  function updateChecklists(def, cur){
    if(def.steps){
      $("#steps").querySelectorAll("li").forEach(li => li.classList.toggle("done", cur.steps.has(li.dataset.id)));
      const n = def.steps.filter(s => cur.steps.has(s.id)).length;
      const nx = def.steps.find(s => !cur.steps.has(s.id));
      $("#steps").querySelectorAll("li").forEach(li => li.classList.toggle("next", !!nx && li.dataset.id === nx.id));
      $("#step-count").textContent = n + "/" + def.steps.length;
    }
    if(def.challenges){
      $("#challenges").querySelectorAll("li").forEach(li => li.classList.toggle("done", cur.done.has(li.dataset.id)));
      $("#ch-count").textContent = def.challenges.filter(c => cur.done.has(c.id)).length + "/" + def.challenges.length;
    }
  }

  /* ── ctx: what an experiment can use ── */
  function makeCtx(def, cur){
    const controls = $("#ctl"), stage = $("#stage");
    let uid = 0;
    const id = () => "c" + (++uid);
    function put(node, parent){ (parent || controls).appendChild(node); return node; }
    const ctx = {
      def, controls, stage, stageTools: $("#stage-tools"),
      el, esc, gauss, sig, fmt, toast, cssVar,
      cleanup(fn){ cur.cleanups.push(fn); },
      every(ms, fn){ const h = setInterval(fn, ms); cur.cleanups.push(() => clearInterval(h)); return () => clearInterval(h); },
      after(ms, fn){ const h = setTimeout(fn, ms); cur.cleanups.push(() => clearTimeout(h)); return () => clearTimeout(h); },
      /* animation loop: fn(dtSeconds, elapsedSeconds); return false to stop */
      frame(fn){
        let raf = 0, last = performance.now(), t0 = last, live = true;
        const tick = now => {
          if(!live) return;
          const dt = Math.min(0.1, (now - last)/1000); last = now;
          if(fn(dt, (now - t0)/1000) === false){ live = false; return; }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        const stop = () => { live = false; cancelAnimationFrame(raf); };
        cur.cleanups.push(stop);
        return stop;
      },
      html(str, parent){ return put(el(str), parent); },
      slider(o){
        const i = id();
        const show = v => (o.fmt ? o.fmt(v) : v) + (o.unit ? " " + o.unit : "");
        const node = put(el(`<div class="ctl"><label for="${i}"><span>${esc(o.label)}</span><output>${esc(show(o.value))}</output></label>
          <input type="range" id="${i}" min="${o.min}" max="${o.max}" step="${o.step}" value="${o.value}">
          ${o.hint ? `<div class="hint">${o.hint}</div>` : ""}</div>`), o.parent);
        const input = node.querySelector("input"), out = node.querySelector("output");
        input.addEventListener("input", () => { out.textContent = show(+input.value); o.onInput && o.onInput(+input.value); });
        return { node, input,
          get: () => +input.value,
          set(v){ input.value = v; out.textContent = show(+input.value); },
          disable(d){ input.disabled = d; } };
      },
      select(o){
        const i = id();
        const node = put(el(`<div class="ctl"><label for="${i}"><span>${esc(o.label)}</span></label>
          <select id="${i}">${o.options.map(([v,l]) => `<option value="${esc(v)}"${v === o.value ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>
          ${o.hint ? `<div class="hint">${o.hint}</div>` : ""}</div>`), o.parent);
        const s = node.querySelector("select");
        s.addEventListener("change", () => o.onChange && o.onChange(s.value));
        return { node, input:s, get: () => s.value, set(v){ s.value = v; }, disable(d){ s.disabled = d; } };
      },
      seg(o){
        const node = put(el(`<div class="ctl"><div class="lbl"><span>${esc(o.label)}</span></div><div class="seg" role="group" aria-label="${esc(o.label)}">
          ${o.options.map(([v,l]) => `<button type="button" data-v="${esc(v)}" class="${v === o.value ? "on" : ""}" aria-pressed="${v === o.value}">${esc(l)}</button>`).join("")}</div>
          ${o.hint ? `<div class="hint">${o.hint}</div>` : ""}</div>`), o.parent);
        let val = o.value, disabled = false;
        const set = v => { val = v; node.querySelectorAll("button").forEach(b => { const on = b.dataset.v === String(v); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); }); };
        node.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
          if(disabled) return;
          const opt = o.options.find(([v]) => String(v) === b.dataset.v);
          set(opt[0]); o.onChange && o.onChange(opt[0]);
        }));
        return { node, get: () => val, set, disable(d){ disabled = d; node.style.opacity = d ? .5 : 1; } };
      },
      buttons(list, parent){
        const node = put(el(`<div class="ctl btns"></div>`), parent);
        const out = list.map(b => {
          const btn = el(`<button type="button" class="btn${b.primary ? " primary" : ""}${b.block ? " block" : ""}">${esc(b.label)}</button>`);
          btn.addEventListener("click", b.onClick);
          node.appendChild(btn); return btn;
        });
        out.node = node;
        return out;
      },
      /* readout([[label, value, cls], ...]) or readout(htmlString) */
      readout(items){
        const r = $("#readout"); if(!r) return;
        r.innerHTML = typeof items === "string" ? items
          : items.map(([l,v,c]) => `<span class="meter${c ? " " + c : ""}"><b>${esc(l)}</b>${esc(v)}</span>`).join("");
      },
      /* method steps (this visit) and challenges (saved) */
      step(id){ if(!def.steps || cur.steps.has(id)) return; cur.steps.add(id); updateChecklists(def, cur);
        if(def.steps.every(s => cur.steps.has(s.id))) toast("Method complete ✓"); },
      stepDone: id => cur.steps.has(id),
      resetSteps(){ cur.steps.clear(); if(def.steps) updateChecklists(def, cur); },
      complete(id){ if(!def.challenges || cur.done.has(id)) return; cur.done.add(id); save(chKey(def.id), [...cur.done]); updateChecklists(def, cur);
        const c = def.challenges.find(c => c.id === id); toast("Challenge complete: " + (c ? c.title : id)); },
      isComplete: id => cur.done.has(id),
      /* pointer position inside an SVG, in its own viewBox units */
      svgPoint(svg, e){ const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); },
      /* drag helper: calls onStart/onMove/onEnd with SVG coordinates */
      drag(svg, target, h){
        target.style.cursor = "grab"; target.style.touchAction = "none";
        target.addEventListener("pointerdown", e => {
          if(e.button) return; e.preventDefault(); e.stopPropagation();
          const p0 = ctx.svgPoint(svg, e); let last = p0;
          target.setPointerCapture(e.pointerId); target.style.cursor = "grabbing";
          if(h.onStart && h.onStart(p0, e) === false) return;
          const mv = ev => { last = ctx.svgPoint(svg, ev); h.onMove && h.onMove(last, p0, ev); };
          const up = ev => { target.removeEventListener("pointermove", mv); target.removeEventListener("pointerup", up); target.removeEventListener("pointercancel", up);
            target.style.cursor = "grab"; h.onEnd && h.onEnd(last, p0, ev); };
          target.addEventListener("pointermove", mv); target.addEventListener("pointerup", up); target.addEventListener("pointercancel", up);
        });
      },
      rows: () => cur.rows.slice(),
      linFit,
      record(row, quiet){
        cur.rows.push(row); save(rowsKey(def.id), cur.rows); refreshResults(def, cur);
        if(!quiet) toast("Result recorded");
      },
      clearRows(){ cur.rows = []; save(rowsKey(def.id), cur.rows); refreshResults(def, cur); }
    };
    return ctx;
  }

  /* ══════════════ RESULTS TABLE ══════════════ */
  function seriesColors(){
    return [cssVar("--accent"), cssVar("--hi"), cssVar("--sec"), cssVar("--tri"), "#8a8a8a", "#c06bd6", "#3aa6a0"];
  }
  function seriesList(def, rows){
    if(!def.series) return [""];
    const seen = [];
    rows.forEach(r => { const s = String(r[def.series]); if(!seen.includes(s)) seen.push(s); });
    return seen;
  }

  function refreshResults(def, cur){
    const tbl = $("#tbl"); if(!tbl) return;
    if(!cur.rows.length){
      tbl.innerHTML = `<p class="empty">No results yet — run the experiment and press <b>Record</b>.</p>`;
    }else{
      const series = seriesList(def, cur.rows), colors = seriesColors();
      tbl.innerHTML = `<table class="rt"><thead><tr>${def.columns.map(c => `<th scope="col">${esc(c.label)}</th>`).join("")}<th></th></tr></thead><tbody>
        ${cur.rows.map((r,i) => `<tr>${def.columns.map(c => {
          const sw = def.series === c.key ? `<span class="swatch" style="background:${colors[series.indexOf(String(r[c.key])) % colors.length]}"></span>` : "";
          return `<td>${sw}${esc(fmt(r[c.key], c.dp))}</td>`;
        }).join("")}<td class="x"><button type="button" data-i="${i}" aria-label="Delete row ${i+1}" title="Delete row">×</button></td></tr>`).join("")}
      </tbody></table>`;
      tbl.querySelectorAll("button[data-i]").forEach(b => b.onclick = () => {
        cur.rows.splice(+b.dataset.i, 1); save(rowsKey(def.id), cur.rows); refreshResults(def, cur);
      });
      tbl.scrollTop = tbl.scrollHeight;
    }
    if(cur.redraw) cur.redraw();
  }

  function exportCsv(def, rows){
    if(!rows.length){ toast("Nothing to export yet"); return; }
    const q = v => { const s = fmt(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s; };
    const csv = [def.columns.map(c => q(c.label)).join(",")]
      .concat(rows.map(r => def.columns.map(c => q(r[c.key])).join(","))).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    a.download = "insight-labs-" + def.id + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ══════════════ GRAPH ══════════════ */
  function colLabel(def, key){ const c = def.columns.find(c => c.key === key); return c ? c.label : key; }

  function setupGraph(def, cur){
    const g = def.graph;
    const gs = { x:g.x[0], y:g.y[0], fit:g.fit || "none" };
    const tools = $("#graph-tools");
    const mk = (name, opts, val) => `<label class="sr">${name} <select data-k="${name}">${opts.map(([v,l]) => `<option value="${esc(v)}"${v===val?" selected":""}>${esc(l)}</option>`).join("")}</select></label>`;
    let html = "";
    if(g.x.length > 1) html += mk("x", g.x.map(k => [k, colLabel(def,k)]), gs.x);
    if(g.y.length > 1) html += mk("y", g.y.map(k => [k, colLabel(def,k)]), gs.y);
    html += mk("fit", [["none","Points only"],["linear","Straight line of best fit"],["curve","Curve of best fit"]], gs.fit);
    tools.innerHTML = html;
    tools.querySelectorAll("select").forEach(s => s.onchange = () => {
      const k = s.dataset.k; if(k === "x") gs.x = s.value; else if(k === "y") gs.y = s.value; else gs.fit = s.value;
      draw();
    });
    const canvas = $("#graph");
    function draw(){ drawGraph(canvas, def, cur.rows, gs); }
    cur.redraw = draw;
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => draw();
    mq.addEventListener ? mq.addEventListener("change", onMq) : mq.addListener(onMq);
    cur.cleanups.push(() => {
      window.removeEventListener("resize", onResize);
      mq.removeEventListener ? mq.removeEventListener("change", onMq) : mq.removeListener(onMq);
    });
  }

  function niceStep(raw){
    const e = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / e;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * e;
  }
  function niceAxis(lo, hi){
    if(lo === hi){ if(lo === 0) hi = 1; else{ const d = Math.abs(lo); lo -= d/2; hi += d/2; } }
    const step = niceStep((hi - lo) / 6);
    return { lo: Math.floor(lo/step + 1e-9)*step, hi: Math.ceil(hi/step - 1e-9)*step, step };
  }

  function linFit(pts){
    const n = pts.length; let sx=0, sy=0, sxx=0, sxy=0;
    pts.forEach(([x,y]) => { sx+=x; sy+=y; sxx+=x*x; sxy+=x*y; });
    const d = n*sxx - sx*sx; if(Math.abs(d) < 1e-12) return null;
    const m = (n*sxy - sx*sy)/d; return { m, c:(sy - m*sx)/n };
  }
  /* AS-style worst acceptable line: through the ends of the error bars of the first and last points,
     choosing whichever (steepest / shallowest) differs most from the best-fit gradient */
  function worstFit(pts, best){
    if(pts.length < 2 || !pts.some(p => p[2])) return null;
    const s = pts.slice().sort((a, b) => a[0] - b[0]), p0 = s[0], p1 = s[s.length - 1];
    if(p1[0] === p0[0]) return null;
    const line = (y0, y1) => { const m = (y1 - y0)/(p1[0] - p0[0]); return { m, c: y0 - m*p0[0] }; };
    const steep = line(p0[1] - p0[2], p1[1] + p1[2]), shallow = line(p0[1] + p0[2], p1[1] - p1[2]);
    return Math.abs(steep.m - best.m) >= Math.abs(shallow.m - best.m) ? steep : shallow;
  }
  function polyFit(pts){
    const xs = pts.map(p => p[0]);
    const lo = Math.min(...xs), hi = Math.max(...xs), span = hi - lo || 1;
    const distinct = new Set(xs.map(x => x.toFixed(9))).size;
    const deg = Math.min(3, distinct - 1); if(deg < 1) return null;
    const N = deg + 1, A = [], b = [];
    for(let i=0;i<N;i++){ A.push(new Array(N).fill(0)); b.push(0); }
    pts.forEach(([x,y]) => {
      const u = (x - lo)/span, pw = [];
      for(let k=0;k<2*N;k++) pw.push(Math.pow(u,k));
      for(let i=0;i<N;i++){ b[i] += y*pw[i]; for(let j=0;j<N;j++) A[i][j] += pw[i+j]; }
    });
    for(let i=0;i<N;i++){                      // Gaussian elimination with partial pivoting
      let p = i; for(let r=i+1;r<N;r++) if(Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
      [A[i],A[p]] = [A[p],A[i]]; [b[i],b[p]] = [b[p],b[i]];
      if(Math.abs(A[i][i]) < 1e-12) return null;
      for(let r=i+1;r<N;r++){ const f = A[r][i]/A[i][i]; for(let c=i;c<N;c++) A[r][c] -= f*A[i][c]; b[r] -= f*b[i]; }
    }
    const co = new Array(N).fill(0);
    for(let i=N-1;i>=0;i--){ let s = b[i]; for(let c=i+1;c<N;c++) s -= A[i][c]*co[c]; co[i] = s/A[i][i]; }
    return { lo, hi, f: x => { const u = (x-lo)/span; return co.reduce((s,c,k) => s + c*Math.pow(u,k), 0); } };
  }

  function drawGraph(canvas, def, rows, gs){
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if(!W || !H) return;
    canvas.width = W*dpr; canvas.height = H*dpr;
    const c = canvas.getContext("2d"); c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,W,H);
    const txt = cssVar("--txt"), txt2 = cssVar("--txt2"), txt3 = cssVar("--txt3"), brd = cssVar("--brd");
    const colors = seriesColors();
    const series = seriesList(def, rows);
    const ek = def.graph.yErr && def.graph.yErr[gs.y];          // optional column holding ± uncertainty in y
    const groups = series.map(s => rows.filter(r => !def.series || String(r[def.series]) === s)
      .map(r => [r[gs.x], r[gs.y], ek && typeof r[ek] === "number" ? Math.abs(r[ek]) : 0])
      .filter(([x,y]) => typeof x === "number" && typeof y === "number" && isFinite(x) && isFinite(y)));
    const all = [].concat(...groups);
    const xs = all.map(p => p[0]), ys = [].concat(...all.map(p => [p[1] - p[2], p[1] + p[2]]));
    const X = niceAxis(Math.min(0, ...(xs.length ? xs : [0])), Math.max(0, ...(xs.length ? xs : [1])));
    const Y = niceAxis(Math.min(0, ...(ys.length ? ys : [0])), Math.max(0, ...(ys.length ? ys : [1])));
    const L = 62, R = 18, T = 18, B = 46;
    const px = x => L + (x - X.lo)/(X.hi - X.lo)*(W - L - R);
    const py = y => H - B - (y - Y.lo)/(Y.hi - Y.lo)*(H - T - B);
    c.font = "11px 'DM Sans', sans-serif"; c.lineWidth = 1;
    const tickTxt = v => sig(Math.abs(v) < 1e-12 ? 0 : v, 4);
    // grid + ticks
    c.strokeStyle = brd; c.fillStyle = txt3;
    c.textAlign = "center"; c.textBaseline = "top";
    for(let v = X.lo; v <= X.hi + X.step/2; v += X.step){
      c.beginPath(); c.moveTo(px(v), T); c.lineTo(px(v), H-B); c.stroke(); c.fillText(tickTxt(v), px(v), H-B+6);
    }
    c.textAlign = "right"; c.textBaseline = "middle";
    for(let v = Y.lo; v <= Y.hi + Y.step/2; v += Y.step){
      c.beginPath(); c.moveTo(L, py(v)); c.lineTo(W-R, py(v)); c.stroke(); c.fillText(tickTxt(v), L-6, py(v));
    }
    // axes through zero (or the frame edge)
    c.strokeStyle = txt2; c.lineWidth = 1.5;
    const ax0 = Math.min(Math.max(0, X.lo), X.hi), ay0 = Math.min(Math.max(0, Y.lo), Y.hi);
    c.beginPath(); c.moveTo(L, py(ay0)); c.lineTo(W-R, py(ay0)); c.moveTo(px(ax0), T); c.lineTo(px(ax0), H-B); c.stroke();
    // axis labels
    c.fillStyle = txt; c.font = "600 12px 'DM Sans', sans-serif";
    c.textAlign = "center"; c.textBaseline = "bottom"; c.fillText(colLabel(def, gs.x), L + (W-L-R)/2, H - 4);
    c.save(); c.translate(14, T + (H-T-B)/2); c.rotate(-Math.PI/2); c.textBaseline = "middle"; c.fillText(colLabel(def, gs.y), 0, 0); c.restore();

    if(!all.length){
      c.fillStyle = txt3; c.font = "13px 'DM Sans', sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("Record results to plot them here", L + (W-L-R)/2, T + (H-T-B)/2);
    }
    // clip fits to the plot area
    c.save(); c.beginPath(); c.rect(L, T, W-L-R, H-T-B); c.clip();
    const info = [];
    groups.forEach((pts, gi) => {
      const col = colors[gi % colors.length];
      const name = series[gi] ? series[gi] + ": " : "";
      if(gs.fit === "linear" && pts.length >= 2){
        const f = linFit(pts);
        if(f){
          c.strokeStyle = col; c.lineWidth = 1.8; c.setLineDash([]);
          c.beginPath(); c.moveTo(px(X.lo), py(f.m*X.lo + f.c)); c.lineTo(px(X.hi), py(f.m*X.hi + f.c)); c.stroke();
          let s = `${esc(name)}gradient = <b>${sig(f.m)}</b>, y-intercept = <b>${sig(f.c)}</b>`;
          if(Math.abs(f.m) > 1e-12) s += `, crosses the x-axis at <b>${sig(-f.c/f.m)}</b>`;
          const w = worstFit(pts, f);
          if(w){
            c.setLineDash([6, 5]); c.lineWidth = 1.4;
            c.beginPath(); c.moveTo(px(X.lo), py(w.m*X.lo + w.c)); c.lineTo(px(X.hi), py(w.m*X.hi + w.c)); c.stroke(); c.setLineDash([]);
            s += `<br>worst acceptable line (dashed): gradient = <b>${sig(w.m)}</b> → uncertainty in gradient = <b>± ${sig(Math.abs(f.m - w.m), 2)}</b>`
              + ` (${sig(Math.abs(f.m - w.m)/Math.abs(f.m)*100, 2)}%), y-intercept = <b>${sig(w.c)}</b>`;
          }
          info.push(`<span class="swatch" style="background:${col}"></span>${s}`);
        }
      }else if(gs.fit === "curve" && pts.length >= 3){
        const f = polyFit(pts);
        if(f){
          c.strokeStyle = col; c.lineWidth = 1.8; c.beginPath();
          for(let k=0;k<=120;k++){ const x = f.lo + (f.hi - f.lo)*k/120; const P = [px(x), py(f.f(x))]; k ? c.lineTo(...P) : c.moveTo(...P); }
          c.stroke();
        }
      }
    });
    c.restore();
    // points as crosses (exam convention), with error bars when the experiment supplies them
    groups.forEach((pts, gi) => {
      c.strokeStyle = colors[gi % colors.length]; c.lineWidth = 1.2;
      pts.forEach(([x,y,e]) => { if(!e) return; const a = px(x);
        c.beginPath(); c.moveTo(a, py(y - e)); c.lineTo(a, py(y + e)); c.moveTo(a-4, py(y - e)); c.lineTo(a+4, py(y - e)); c.moveTo(a-4, py(y + e)); c.lineTo(a+4, py(y + e)); c.stroke(); });
      c.lineWidth = 2;
      pts.forEach(([x,y]) => { const a = px(x), b = py(y), s = 4.5;
        c.beginPath(); c.moveTo(a-s,b-s); c.lineTo(a+s,b+s); c.moveTo(a+s,b-s); c.lineTo(a-s,b+s); c.stroke(); });
    });
    // legend
    if(def.series && series.length > 1 || (def.series && series.length === 1 && series[0])){
      c.font = "11px 'DM Sans', sans-serif"; c.textAlign = "left"; c.textBaseline = "middle";
      let ly = T + 10;
      series.forEach((s, gi) => {
        const w = c.measureText(s).width + 26;
        c.fillStyle = cssVar("--bg-card"); c.globalAlpha = .85; c.fillRect(L + 6, ly - 8, w, 16); c.globalAlpha = 1;
        c.fillStyle = colors[gi % colors.length]; c.fillRect(L + 10, ly - 4, 10, 8);
        c.fillStyle = txt2; c.fillText(s, L + 26, ly); ly += 17;
      });
    }
    const fi = $("#fit-info");
    if(fi) fi.innerHTML = gs.fit === "curve" && all.length >= 3
      ? "Curve drawn as a smooth best fit — don’t join the dots point to point."
      : info.map(s => `<div>${s}</div>`).join("") || (gs.fit === "linear" && all.length < 2 ? "Record at least two results to draw a line." : "");
  }

  /* ══════════════ START ══════════════ */
  function start(){
    window.addEventListener("hashchange", route);
    route();
  }

  return { register, start, setMode, toggleMode, SUBJECTS, LEVELS, linFit };
})();
