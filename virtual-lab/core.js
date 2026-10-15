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
    physics:   { name:"Physics",   code:"Cambridge IGCSE 0625", theme:"ocean",    blurb:"Electricity, forces and light — measure, plot and find the relationship." },
    chemistry: { name:"Chemistry", code:"Cambridge IGCSE 0620", theme:"sunset",   blurb:"Titrations, rates and qualitative analysis without the broken glassware." },
    biology:   { name:"Biology",   code:"Cambridge IGCSE 0610", theme:"forest",   blurb:"Photosynthesis, enzymes and osmosis with living-system variability." },
    ict:       { name:"ICT & IT",  code:"Cambridge IGCSE 0417", theme:"lavender", blurb:"Spreadsheets, database queries and validation — the practical-paper skills." }
  };
  const ORDER = ["physics","chemistry","biology","ict"];
  const sims = [], byId = {};
  let current = null;
  let filter = "all";

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

  /* ── light / dark / auto ── */
  function setMode(mode){
    document.documentElement.setAttribute("data-mode", mode);
    try{ localStorage.setItem("datalab-mode", mode); }catch(e){}
    updateModeButtons(mode);
    if(current && current.redraw) current.redraw();
  }
  function updateModeButtons(mode){
    ["light","auto","dark"].forEach(m => { const b = document.getElementById("btn-"+m); if(b) b.classList.toggle("active", m === mode); });
  }

  /* ══════════════ ROUTER ══════════════ */
  function register(def){ sims.push(def); byId[def.id] = def; }

  function teardown(){
    if(!current) return;
    current.cleanups.forEach(fn => { try{ fn(); }catch(e){ console.error(e); } });
    current = null;
  }

  function route(){
    teardown();
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
  function renderHub(){
    document.documentElement.setAttribute("data-theme", filter === "all" ? "ocean" : SUBJECTS[filter].theme);
    document.title = "Virtual Lab — IGCSE Sciences & ICT";
    const app = $("#app");
    const pills = [["all","All subjects"]].concat(ORDER.map(s => [s, SUBJECTS[s].name]))
      .map(([k,n]) => `<a class="pill${filter===k?" active":""}" href="#/${k==="all"?"":k}" role="tab" aria-selected="${filter===k}">${esc(n)}</a>`).join("");
    const sections = ORDER.filter(s => filter === "all" || filter === s).map(s => {
      const list = sims.filter(d => d.subject === s);
      const cards = list.map(d => {
        const n = load(rowsKey(d.id), []).length;
        return `<a class="card" data-s="${s}" href="#/${s}/${d.id}">
          <span class="ico" aria-hidden="true">${d.icon || "🧪"}</span>
          <span class="topic">${esc(d.topic)}</span>
          <h3>${esc(d.title)}</h3>
          <p>${esc(d.summary)}</p>
          <span class="done">${n ? n + " result" + (n === 1 ? "" : "s") + " recorded" : "Not started"}</span>
        </a>`;
      }).join("");
      return `<section class="subject" aria-label="${esc(SUBJECTS[s].name)}">
        <div class="subject-head"><h2>${esc(SUBJECTS[s].name)}</h2><span class="code">${esc(SUBJECTS[s].code)} · ${list.length} experiments</span></div>
        <div class="cards">${cards}</div>
      </section>`;
    }).join("");
    app.innerHTML = `
      <section class="hero">
        <div class="hero-badge">Cambridge IGCSE · Virtual Practicals</div>
        <h1>The Virtual Lab</h1>
        <p>${filter === "all"
          ? "Run real IGCSE practicals in your browser. Change one variable, record a results table, plot the graph and draw your conclusion."
          : esc(SUBJECTS[filter].blurb)}</p>
      </section>
      <nav class="pillbar" role="tablist" aria-label="Subject">${pills}</nav>
      ${sections}`;
  }

  /* ══════════════ EXPERIMENT PAGE ══════════════ */
  function renderExperiment(def){
    const subj = SUBJECTS[def.subject];
    document.documentElement.setAttribute("data-theme", subj.theme);
    document.title = def.title + " — Virtual Lab";
    const v = def.variables;
    const varsHtml = v ? `<div class="vars">
        ${v.iv ? `<div class="var iv"><b>Independent variable</b>${esc(v.iv)}</div>` : ""}
        ${v.dv ? `<div class="var dv"><b>Dependent variable</b>${esc(v.dv)}</div>` : ""}
        ${v.cv ? `<div class="var cv"><b>Control variables</b>${esc(v.cv.join(" · "))}</div>` : ""}
      </div>` : "";
    const hasTable = !!def.columns, hasGraph = !!(def.columns && def.graph);
    const app = $("#app");
    app.innerHTML = `
      <div class="exp-head">
        <div class="crumbs"><a href="#/">Virtual Lab</a> / <a href="#/${def.subject}">${esc(subj.name)}</a> / ${esc(def.topic)}</div>
        <h1>${esc(def.title)}</h1>
        <p class="aim"><b>Aim:</b> ${esc(def.aim)}</p>
        ${varsHtml}
      </div>
      <div class="bench${def.layout === "wide" ? " wide" : ""}">
        <section class="panel" aria-label="Controls"><div class="panel-head">${esc(def.controlsTitle || "Controls")}</div><div class="panel-body" id="ctl"></div></section>
        <section class="panel" aria-label="Apparatus"><div class="panel-head">${esc(def.stageTitle || "Apparatus")}<span class="sp" id="stage-tools"></span></div>
          <div class="stage${def.layout === "wide" ? " plain" : ""}" id="stage"></div><div class="readout" id="readout"></div></section>
      </div>
      ${hasTable ? `<div class="results${hasGraph ? "" : " solo"}">
        <section class="panel" aria-label="Results table"><div class="panel-head">Results table<span class="sp">
          <button class="btn small" type="button" id="csv-btn">Export CSV</button>
          <button class="btn small" type="button" id="clear-btn">Clear</button></span></div>
          <div class="tbl-wrap" id="tbl"></div></section>
        ${hasGraph ? `<section class="panel" aria-label="Graph"><div class="panel-head">Graph<span class="sp graph-tools" id="graph-tools"></span></div>
          <canvas class="graph-canvas" id="graph" role="img" aria-label="Graph of recorded results"></canvas>
          <div class="fit-info" id="fit-info"></div></section>` : ""}
      </div>` : ""}
      ${def.questions && def.questions.length ? `<section class="panel qs" aria-label="Questions"><div class="panel-head">Check your understanding</div>
        ${def.questions.map((q,i) => `<div class="q"><p><b>Q${i+1}.</b> ${q.q}</p><details><summary>Show answer</summary>${q.a}</details></div>`).join("")}
      </section>` : ""}`;

    current = { def, cleanups:[], rows: load(rowsKey(def.id), []), redraw:null };
    const cur = current;
    const ctx = makeCtx(def, cur);

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
      rows: () => cur.rows.slice(),
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
    a.download = "virtual-lab-" + def.id + ".csv";
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
    const groups = series.map(s => rows.filter(r => !def.series || String(r[def.series]) === s)
      .map(r => [r[gs.x], r[gs.y]]).filter(([x,y]) => typeof x === "number" && typeof y === "number" && isFinite(x) && isFinite(y)));
    const all = [].concat(...groups);
    const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
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
    // points as crosses (exam convention)
    groups.forEach((pts, gi) => {
      c.strokeStyle = colors[gi % colors.length]; c.lineWidth = 2;
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
    updateModeButtons(document.documentElement.getAttribute("data-mode") || "auto");
    window.addEventListener("hashchange", route);
    route();
  }

  return { register, start, setMode, SUBJECTS };
})();
