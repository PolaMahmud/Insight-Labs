"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMISTRY · A LEVEL (9701, topics 24 and 28, Paper 5 skills) — part 1
   Electrochemistry: standard cell potentials, the Nernst equation,
   the Faraday and Avogadro constants by electrolysis ·
   Transition element complexes: ligand exchange, colorimetry,
   Job's method, iodometric titration of copper
══════════════════════════════════════════════════════════════════ */
(function(){
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const SUP = { "-":"⁻", "0":"⁰", "1":"¹", "2":"²", "3":"³", "4":"⁴", "5":"⁵", "6":"⁶", "7":"⁷", "8":"⁸", "9":"⁹" };
  const sci = (v, n) => { const e = Math.floor(Math.log10(Math.abs(v))); return `${(v/Math.pow(10, e)).toFixed((n || 3) - 1)} × 10${String(e).split("").map(c => SUP[c]).join("")}`; };
  const rgb = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  /* analogue meter scale: pivot (cx, cy), radius R, 0..max over 100° of arc.
     per = minor divisions per labelled major, mid = minor divisions per medium tick.
     k scales stroke widths and fonts down so the same drawing can be magnified. */
  function dial(o){
    const k = o.k || 1, N = Math.round(o.max/o.minor);
    const ang = f => (-50 + 100*f)*Math.PI/180;
    const P = (f, r) => [o.cx + r*Math.sin(ang(f)), o.cy - r*Math.cos(ang(f))];
    const [ax, ay] = P(0, o.R), [bx, by] = P(1, o.R);
    let s = `<path d="M${ax} ${ay} A${o.R} ${o.R} 0 0 1 ${bx} ${by}" fill="none" stroke="#334155" stroke-width="${1/k}"/>`;
    for(let i = 0; i <= N; i++){
      const f = i/N, big = i % o.per === 0, mid = o.mid && i % o.mid === 0;
      const [x1, y1] = P(f, o.R), [x2, y2] = P(f, o.R - (big ? 14 : mid ? 10 : 6));
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#334155" stroke-width="${(big ? 1.4 : .8)/k}"/>`;
      if(big && !o.k){ const [tx, ty] = P(f, o.R - 25); s += `<text x="${tx}" y="${ty + 4}" text-anchor="middle" style="font:600 11px 'JetBrains Mono',monospace;fill:#334155">${o.fmt(i*o.minor)}</text>`; }
    }
    const f = Math.max(-.04, Math.min(1.04, o.v/o.max)), [nx, ny] = P(f, o.R + 2);
    s += `<line x1="${o.cx}" y1="${o.cy}" x2="${nx}" y2="${ny}" stroke="#C0262D" stroke-width="${o.k ? .5 : 1.6}"/><circle cx="${o.cx}" cy="${o.cy}" r="${7/k}" fill="#1F2937"/>`;
    return { svg:s, tip:P(f, o.R - 8), P, N };
  }
  /* meter box with a dial, plus a magnifier on the needle tip */
  function meter(id, o){
    const d = dial(o);
    let s = `<g><rect x="${o.cx - 125}" y="${o.cy - 165}" width="250" height="210" rx="14" fill="#20262F" stroke="#4B5563" stroke-width="1.5"/>
      <rect x="${o.cx - 110}" y="${o.cy - 150}" width="220" height="160" rx="8" fill="#F7F5EE"/>${d.svg}
      <text x="${o.cx}" y="${o.cy - 42}" text-anchor="middle" style="font:700 22px 'Space Grotesk',sans-serif;fill:#334155">${o.unit}</text>
      <text x="${o.cx}" y="${o.cy + 26}" text-anchor="middle" style="font:600 10px Inter;fill:#CBD5E1">${o.caption}</text>
      <circle cx="${o.cx - 45}" cy="${o.cy + 30}" r="7" fill="#D33"/><text x="${o.cx - 60}" y="${o.cy + 34}" text-anchor="end" style="font:700 11px Inter;fill:#F87171">+</text>
      <circle cx="${o.cx + 45}" cy="${o.cy + 30}" r="7" fill="#111827" stroke="#9CA3AF"/><text x="${o.cx + 58}" y="${o.cy + 34}" style="font:700 9px Inter;fill:#CBD5E1">COM</text></g>`;
    const K = 3.5, [tx, ty] = d.tip, m = o.mag;
    const z = dial(Object.assign({}, o, { k:K }));
    let labs = "";                      /* labels drawn unscaled so they stay crisp */
    for(let i = 0; i <= d.N; i += o.magLab || o.per){
      const [x, y] = d.P(i/d.N, o.R - 25), X = m.x + K*(x - tx), Y = m.y + K*(y - ty);
      if(Math.hypot(X - m.x, Y - m.y) < m.r - 14) labs += `<text x="${X}" y="${Y + 5}" text-anchor="middle" style="font:600 13px 'JetBrains Mono',monospace;fill:#334155">${o.fmt(i*o.minor)}</text>`;
    }
    s += `<defs><clipPath id="${id}-mc"><circle cx="${m.x}" cy="${m.y}" r="${m.r}"/></clipPath></defs>
      <line x1="${tx}" y1="${ty}" x2="${m.x - m.r*.8}" y2="${m.y + m.r*.3}" stroke="var(--accent)" stroke-dasharray="3 3"/>
      <circle cx="${m.x}" cy="${m.y}" r="${m.r}" fill="#F7F5EE"/>
      <g clip-path="url(#${id}-mc)"><g transform="translate(${m.x} ${m.y}) scale(${K}) translate(${-tx} ${-ty})">${z.svg}</g>${labs}</g>
      <circle cx="${m.x}" cy="${m.y}" r="${m.r}" fill="none" stroke="var(--accent)" stroke-width="3"/>
      <text x="${m.x}" y="${m.y + m.r + 18}" text-anchor="middle" class="k-lbl">magnifier on the needle (read straight on)</text>`;
    return s;
  }
  /* an information card whose lines wrap */
  function card(x, y, w, title, lines, n, cls){
    n = n || Math.floor((w - 24)/6.1);
    let body = "", yy = 46, cnt = 0;
    lines.forEach(l => { const ws = ChemKit.wrap(l, n); body += ChemKit.lines(l, n, 14, yy, 16, cls); yy += ws.length*16 + 4; cnt += ws.length; });
    return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${yy + 4}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="14" y="24" class="k-tag">${esc(title)}</text>${body}</g>`;
  }
  /* a multiple-choice planning check */
  function quiz(ctx, title, items, onAll, parent){
    const box = ctx.html(`<div class="ctl"><div class="lbl"><span>${esc(title)}</span></div>${items.map((it, i) => `<div style="margin:.55rem 0">
      <div class="hint" style="margin:0 0 .3rem;color:var(--txt2)">${i + 1}. ${esc(it.q)}</div>
      <select class="inp" data-i="${i}" aria-label="Question ${i + 1}"><option value="">Choose…</option>${it.opts.map((o, j) => `<option value="${j}">${esc(o)}</option>`).join("")}</select>
      <div data-f="${i}" style="margin-top:.3rem"></div></div>`).join("")}
      <div class="btns"><button class="btn small primary" type="button">Check my plan</button></div><div data-fb style="margin-top:.4rem"></div></div>`, parent);
    box.querySelector("button").onclick = () => {
      let right = 0;
      items.forEach((it, i) => {
        const v = box.querySelector(`select[data-i="${i}"]`).value, f = box.querySelector(`[data-f="${i}"]`);
        if(v === ""){ f.innerHTML = ""; return; }
        const ok = +v === it.a; if(ok) right++;
        f.innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${ok ? "✓ " + esc(it.why) : "Not quite. " + esc(it.hint || "Think about what the examiner wants to be controlled or measured.")}</div>`;
      });
      box.querySelector("[data-fb]").innerHTML = `<div class="note ${right === items.length ? "ok" : "bad"}">${right} of ${items.length} correct.</div>`;
      if(right === items.length) onAll();
    };
    return box;
  }
  /* digital balance showing 2 or 3 decimal places */
  function balance(x, y, mass, dp){
    return `<g transform="translate(${x} ${y})"><rect x="0" y="30" width="170" height="48" rx="8" fill="#2B3240" stroke="#4B5563"/>
      <rect x="22" y="18" width="126" height="14" rx="3" fill="url(#k-metal)"/>
      <rect x="30" y="42" width="110" height="26" rx="4" fill="#132A1F"/><text x="126" y="61" text-anchor="end" class="k-lcd" style="font-size:16px">${mass === null ? "—" : mass.toFixed(dp)}</text>
      <text x="130" y="61" style="font:600 9px Inter;fill:#5FBF8A">g</text><text x="85" y="96" text-anchor="middle" class="k-lbl">${dp}-decimal-place balance</text></g>`;
  }

  /* ═════════════════ ELECTROCHEMISTRY ═════════════════ */
  const ID = "a-electrochem";
  /* E⦵ values from the 9701 data booklet (table 4) */
  const HC = {
    she: { short:"H⁺/H₂ (SHE)", name:"Standard hydrogen electrode", E:0.00, z:2, el:"pt", gas:true, sol:[225,232,240], solA:.22, eq:"2H⁺ + 2e⁻ ⇌ H₂", lbl:"1.00 mol dm⁻³ H⁺(aq)" },
    cu:  { short:"Cu²⁺/Cu", name:"Cu²⁺(aq)/Cu(s)", E:0.34, z:2, rod:"#C8733A", sol:[70,140,225], solA:.55, eq:"Cu²⁺ + 2e⁻ ⇌ Cu", lbl:"1.00 mol dm⁻³ CuSO₄" },
    zn:  { short:"Zn²⁺/Zn", name:"Zn²⁺(aq)/Zn(s)", E:-0.76, z:2, rod:"#AEB6C0", sol:null, eq:"Zn²⁺ + 2e⁻ ⇌ Zn", lbl:"1.00 mol dm⁻³ ZnSO₄" },
    fe:  { short:"Fe²⁺/Fe", name:"Fe²⁺(aq)/Fe(s)", E:-0.44, z:2, rod:"#6E737B", sol:[195,228,190], solA:.4, eq:"Fe²⁺ + 2e⁻ ⇌ Fe", lbl:"1.00 mol dm⁻³ FeSO₄" },
    pb:  { short:"Pb²⁺/Pb", name:"Pb²⁺(aq)/Pb(s)", E:-0.13, z:2, rod:"#7D8591", sol:null, eq:"Pb²⁺ + 2e⁻ ⇌ Pb", lbl:"1.00 mol dm⁻³ Pb(NO₃)₂" },
    ag:  { short:"Ag⁺/Ag", name:"Ag⁺(aq)/Ag(s)", E:0.80, z:1, rod:"#DCE0E6", sol:null, eq:"Ag⁺ + e⁻ ⇌ Ag", lbl:"1.00 mol dm⁻³ AgNO₃" },
    fe32:{ short:"Fe³⁺,Fe²⁺/Pt", name:"Fe³⁺(aq),Fe²⁺(aq)/Pt", E:0.77, z:1, el:"pt", sol:[214,165,70], solA:.55, eq:"Fe³⁺ + e⁻ ⇌ Fe²⁺", lbl:"1.00 mol dm⁻³ Fe³⁺ and Fe²⁺" },
    i2:  { short:"I₂,I⁻/Pt", name:"I₂(aq),I⁻(aq)/Pt", E:0.54, z:2, el:"pt", sol:[150,80,25], solA:.6, eq:"I₂ + 2e⁻ ⇌ 2I⁻", lbl:"I₂ and I⁻ at 1.00 mol dm⁻³" },
    x:   { short:"X²⁺/X", name:"X²⁺(aq)/X(s) — unknown", E:0, z:2, rod:"#9AA0A8", sol:null, eq:"X²⁺ + 2e⁻ ⇌ X", lbl:"1.00 mol dm⁻³ X²⁺(aq)" }
  };
  const XS = [{ m:"nickel", E:-0.25, sol:[120,190,120], rod:"#A3A9A0" }, { m:"tin", E:-0.14, sol:null, rod:"#BFC4C9" },
              { m:"cobalt", E:-0.28, sol:[232,150,172], rod:"#8E96A0" }, { m:"manganese", E:-1.18, sol:[245,220,228], rod:"#9B9EA3" }];
  /* reactions for the feasibility check: [text, E⦵ of species reduced, E⦵ of species oxidised, working] */
  const FEAS = [
    ["Fe³⁺(aq) oxidises I⁻(aq) to I₂", .77, .54, "Fe³⁺/Fe²⁺ +0.77, I₂/I⁻ +0.54"],
    ["Cu²⁺(aq) oxidises Fe²⁺(aq) to Fe³⁺", .34, .77, "Cu²⁺/Cu +0.34, Fe³⁺/Fe²⁺ +0.77"],
    ["Zn(s) reduces Cu²⁺(aq) to Cu", .34, -.76, "Cu²⁺/Cu +0.34, Zn²⁺/Zn −0.76"],
    ["Ag⁺(aq) oxidises Fe²⁺(aq) to Fe³⁺", .80, .77, "Ag⁺/Ag +0.80, Fe³⁺/Fe²⁺ +0.77"],
    ["I₂(aq) oxidises Fe²⁺(aq) to Fe³⁺", .54, .77, "I₂/I⁻ +0.54, Fe³⁺/Fe²⁺ +0.77"],
    ["Cu(s) reacts with H⁺(aq) to give H₂", 0, .34, "H⁺/H₂ 0.00, Cu²⁺/Cu +0.34"],
    ["Fe(s) reacts with H⁺(aq) to give H₂", 0, -.44, "H⁺/H₂ 0.00, Fe²⁺/Fe −0.44"],
    ["Acidified Cr₂O₇²⁻ oxidises Cl⁻ to Cl₂", 1.33, 1.36, "Cr₂O₇²⁻/Cr³⁺ +1.33, Cl₂/Cl⁻ +1.36"],
    ["Acidified MnO₄⁻ oxidises Cl⁻ to Cl₂", 1.52, 1.36, "MnO₄⁻/Mn²⁺ +1.52, Cl₂/Cl⁻ +1.36"],
    ["Br₂(aq) oxidises Fe²⁺(aq) to Fe³⁺", 1.07, .77, "Br₂/Br⁻ +1.07, Fe³⁺/Fe²⁺ +0.77"],
    ["Pb(s) reduces Fe³⁺(aq) to Fe²⁺", .77, -.13, "Fe³⁺/Fe²⁺ +0.77, Pb²⁺/Pb −0.13"],
    ["Acidified H₂O₂ oxidises Fe²⁺(aq) to Fe³⁺", 1.77, .77, "H₂O₂/H₂O +1.77, Fe³⁺/Fe²⁺ +0.77"]
  ];
  const CONCS = [[1, "1.00"], [.1, "0.100"], [.01, "0.0100"], [.001, "1.00 × 10⁻³"], [.0001, "1.00 × 10⁻⁴"]];
  const F_TRUE = 96485, M_CU = 63.5, SPEED = 60;

  Lab.register({
    id:ID, subject:"chemistry", level:["a"], topic:"Electrochemistry · E⦵, Nernst, Faraday constant", interactive:true,
    title:"Electrochemistry: cell potentials, Nernst and the Faraday constant",
    summary:"Build half-cells joined by a KNO₃ salt bridge and read a high-resistance voltmeter; compare with data-booklet E⦵ values and predict feasibility. Vary [Cu²⁺] and plot E against log[Cu²⁺]. Electrolyse CuSO₄(aq) at constant current to find F and L.",
    aim:"Measure standard cell potentials and use them to deduce E⦵ for an unknown half-cell and the feasibility of reactions; test the Nernst equation for Cu²⁺/Cu; determine the Faraday constant and the Avogadro constant by electrolysis.",
    variables:{ iv:"Half-cells used · [Cu²⁺] · charge passed Q = It", dv:"Cell e.m.f. E / V · change in mass of the cathode Δm / g", cv:["Temperature 298 K","Other half-cell kept standard","Constant current (variable resistor)","Same electrode area"] },
    stageTitle:"Electrochemical bench", controlsTitle:"Procedure",
    thumb:`<svg viewBox="0 0 300 140"><rect x="110" y="8" width="80" height="50" rx="8" fill="#20262F"/><path d="M122 46 A40 40 0 0 1 178 46" fill="none" stroke="#F7F5EE" stroke-width="3"/><line x1="150" y1="50" x2="165" y2="22" stroke="#E0334A" stroke-width="2"/><path d="M40 80 h70 v52 h-70z M190 80 h70 v52 h-70z" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="42" y="95" width="66" height="35" fill="#9AA3AD" opacity=".5"/><rect x="192" y="95" width="66" height="35" fill="#4C8FE0" opacity=".6"/><path d="M95 110 V70 H205 V110" fill="none" stroke="#E8DDBB" stroke-width="7"/><rect x="58" y="60" width="8" height="64" fill="#AEB6C0"/><rect x="232" y="60" width="8" height="64" fill="#C8733A"/></svg>`,
    challenges:[
      { id:"cell",  title:"Cell potentials and X", text:"Measure three different cells (one must contain the unknown X²⁺/X half-cell) and deduce E⦵ for X²⁺/X." },
      { id:"polar", title:"Polarity", text:"State which electrode is positive and the direction of electron flow in the external circuit of a cell you measured." },
      { id:"feas",  title:"Feasibility", text:"Use data-booklet E⦵ values to predict three reactions correctly, with E⦵cell." },
      { id:"nernst", title:"Nernst equation", text:"Measure E for four or more values of [Cu²⁺], plot E against log[Cu²⁺] and use the gradient to find z." },
      { id:"faraday", title:"Faraday and Avogadro constants", text:"Electrolyse CuSO₄(aq) with copper electrodes; calculate F from your data, then L = F/e." },
      { id:"unc",   title:"Uncertainty", text:"Calculate the percentage uncertainty in your mass of copper deposited." },
      { id:"plan",  title:"Paper 5 plan", text:"Answer every planning question correctly: variables, prediction, apparatus and hazards." }
    ],
    columns:[{key:"part",label:"Part"},{key:"set",label:"Set-up"},{key:"c",label:"[Cu²⁺] / mol dm⁻³"},{key:"lg",label:"log[Cu²⁺]",dp:2},{key:"E",label:"E / V"},
      {key:"I",label:"I / A",dp:2},{key:"t",label:"t / s",dp:0},{key:"Q",label:"Q / C",dp:0},{key:"dm",label:"Δm / g"}],
    series:"part",
    graph:{ x:["lg","Q"], y:["E","dm"], fit:"linear" },
    questions:[
      { q:"Define standard electrode potential and describe the standard hydrogen electrode.",
        a:"The e.m.f. of a half-cell compared with a standard hydrogen electrode, measured at 298 K with solutions at 1.00 mol dm⁻³ and gases at 101 kPa. The SHE is hydrogen gas at 101 kPa bubbling over a platinised platinum electrode dipping into 1.00 mol dm⁻³ H⁺(aq) at 298 K; its E⦵ is defined as 0.00 V." },
      { q:"Why is a high-resistance voltmeter used, and why a salt bridge of KNO₃(aq) rather than KCl(aq) with a silver half-cell?",
        a:"A high resistance means almost no current flows, so the reading is the maximum e.m.f. and the concentrations do not change. The salt bridge completes the circuit by letting ions move without mixing the solutions; KNO₃ is used because Cl⁻ would precipitate AgCl (and nitrates are all soluble), changing [Ag⁺]." },
      { q:"How do you measure E⦵ for Fe³⁺/Fe²⁺, where both species are ions?",
        a:"Use a platinum electrode (inert, conducts electrons) dipping into a solution that is 1.00 mol dm⁻³ in both Fe³⁺ and Fe²⁺, connected to a standard hydrogen electrode by a salt bridge, at 298 K." },
      { q:"Use the Nernst equation to predict E for Cu²⁺/Cu when [Cu²⁺] = 0.0100 mol dm⁻³. Sketch the graph you expect.",
        a:"E = 0.34 + (0.059/2) log 0.0100 = 0.34 − 0.059 = +0.28 V. E against log[Cu²⁺] is a straight line with gradient +0.0295 V (0.059/z with z = 2) and intercept +0.34 V at log[Cu²⁺] = 0." },
      { q:"Electrolysis of CuSO₄(aq): 0.500 A for 30.0 min deposits 0.296 g of copper. Calculate F and L (e = 1.60 × 10⁻¹⁹ C).",
        a:"Q = 0.500 × 1800 = 900 C. n(Cu) = 0.296/63.5 = 4.66 × 10⁻³ mol, so n(e⁻) = 9.32 × 10⁻³ mol. F = 900/9.32 × 10⁻³ = 9.66 × 10⁴ C mol⁻¹. L = F/e = 6.04 × 10²³ mol⁻¹." },
      { q:"Suggest why the cathode mass gain may be too small or too large, and how to minimise each error.",
        a:"Too small: a high current density gives a loose, spongy deposit that flakes off when rinsed — use a small current over a longer time and handle the cathode gently. Too large: weighing the cathode wet — rinse with distilled water, then propanone, and dry in warm air before weighing. Cleaning with emery paper first gives an adherent deposit." },
      { q:"State the hazards in the electrolysis experiment and the precautions.",
        a:"Propanone is highly flammable: no naked flames when drying. Copper(II) sulfate is harmful and an irritant: wear gloves and eye protection. Keep the power pack and wires away from spilt solution." },
      { q:"A student starts the stop-clock 20 s after switching on in a 600 s run. Is the error random or systematic, and what is its effect on F?",
        a:"Systematic: the time is always too short, so Q (= It) is too small and F = QM/(2Δm) is too small by about 3%. Starting the clock as the switch is closed removes it." }
    ],
    setup(ctx){
      const X = Object.assign({}, HC.x, XS[Math.floor(Math.random()*XS.length)]);
      const H = k => k === "x" ? X : HC[k];
      let mode = "a", Lk = "zn", Rk = "cu", lead = "R", bridge = "kno3", conc = 1, lastCell = null;
      const bias = {}, nb = {};
      const pairBias = (a, b) => { const k = [a, b].sort().join("|"); if(bias[k] === undefined) bias[k] = ctx.gauss()*.006; return bias[k]; };
      const nernstNoise = c => { if(nb[c] === undefined) nb[c] = -.003 + ctx.gauss()*.0012; return nb[c]; };
      const sw = Kit.stopwatch(ID + "-sw", 30, 330);
      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="${ID}-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 460)}<g id="${ID}-scene"></g>
        <g id="${ID}-swg">${sw.svg}</g><text x="24" y="30" class="k-status" id="${ID}-st"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector(`#${ID}-svg`), $ = s => svg.querySelector(s);
      sw.bind(svg);
      let tNow = 0;

      /* ── what the voltmeter shows ── */
      function cellV(){
        if(bridge === "none") return { v:0, note:"No salt bridge: the circuit is incomplete, so there is no reading." };
        let EL, ER, note = "";
        if(mode === "b"){ EL = 0; ER = .34 + .0295*Math.log10(conc) + nernstNoise(conc); }
        else{
          EL = H(Lk).E; ER = H(Rk).E;
          const d = pairBias(Lk, Rk); if(Lk !== Rk){ EL -= d/2; ER += d/2; }
          if(bridge === "kcl" && (Lk === "ag" || Rk === "ag")){
            const drop = .11 + .02*Math.sin(tNow*1.3); if(Lk === "ag") EL -= drop; if(Rk === "ag") ER -= drop;
            note = "White ppt. of AgCl forms in the KCl bridge; the reading is low and drifts.";
          }
          if(Lk === Rk) note = "Two identical half-cells: no potential difference.";
        }
        const v = lead === "R" ? ER - EL : EL - ER;
        return { v, note };
      }
      const range = () => mode === "b" ? { max:.5, minor:.005, per:20, mid:10, magLab:20, fmt:v => v.toFixed(1), cap:"high-resistance voltmeter · 0–0.5 V range" }
                                       : { max:2, minor:.02, per:25, mid:5, magLab:10, fmt:v => v.toFixed(1), cap:"high-resistance voltmeter · 0–2 V range" };

      /* ── drawing ── */
      function beaker(cx, sol, solA, conc){
        const top = 335, a = sol ? Math.max(.12, solA*(conc === undefined ? 1 : .45 + .55*Math.min(1, (Math.log10(conc) + 4)/4))) : 0;
        return `<path d="${ChemKit.BEAKER(cx - 85, 455, 170, 150)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
          <rect x="${cx - 83}" y="${top}" width="166" height="118" rx="4" fill="${sol ? rgb(sol, a) : "rgba(210,225,240,.3)"}"/>`;
      }
      function electrode(h, ex){
        if(h.gas) return `<rect x="${ex - 16}" y="250" width="32" height="160" rx="8" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.3"/>
          <path d="M${ex - 16} 268 h-30 v-30" fill="none" stroke="var(--txt2)" stroke-width="5"/><text x="${ex - 46}" y="228" text-anchor="middle" class="k-lbl">H₂(g), 101 kPa</text>
          <line x1="${ex}" y1="236" x2="${ex}" y2="380" stroke="#9CA3AF" stroke-width="2"/><rect x="${ex - 8}" y="378" width="16" height="22" fill="#2B2B2B"/>
          ${[0,1,2,3].map(i => `<circle cx="${ex - 10 + i*7}" cy="410" r="3" fill="none" stroke="var(--txt2)"><animate attributeName="cy" values="412;345" dur="${1.1 + i*.25}s" repeatCount="indefinite"/></circle>`).join("")}`;
        if(h.el === "pt") return `<line x1="${ex}" y1="236" x2="${ex}" y2="370" stroke="#9CA3AF" stroke-width="2"/><rect x="${ex - 9}" y="368" width="18" height="40" rx="2" fill="#D9DCE1" stroke="#8B93A1"/><text x="${ex + 13}" y="402" class="k-lbl">Pt</text>`;
        return `<rect x="${ex - 8}" y="236" width="16" height="190" rx="3" fill="${h.rod}" stroke="rgba(0,0,0,.25)"/>`;
      }
      function halfCell(k, cx, side, c){
        const h = mode === "b" && side === "L" ? HC.she : mode === "b" ? HC.cu : H(k), ex = cx + (side === "L" ? -40 : 40);
        let s = beaker(cx, h.sol, h.solA, mode === "b" && side === "R" ? c : undefined) + electrode(h, ex);
        if(bridge === "kcl" && h === HC.ag) s += [0,1,2,3,4,5].map(i => `<circle cx="${cx + (side === "L" ? 40 : -40) + (i % 3)*6 - 6}" cy="${345 + i*4}" r="2.4" fill="#F5F5F5" stroke="#bbb" stroke-width=".4"/>`).join("");
        const lbl = mode === "b" && side === "R" ? `[Cu²⁺] = ${CONCS.find(q => q[0] === c)[1]} mol dm⁻³` : h.lbl;
        s += `<text x="${cx}" y="478" text-anchor="middle" class="k-tag">${esc(h === X ? "X²⁺(aq)/X(s)" : h.name)}</text><text x="${cx}" y="494" text-anchor="middle" class="k-lbl">${esc(lbl)}</text>`;
        return { s, ex };
      }
      const fmtE = k => k === "x" ? "?" : (H(k).E > 0 ? "+" : H(k).E < 0 ? "−" : "") + Math.abs(H(k).E).toFixed(2) + " V";
      function wire(x1, y1, x2, y2, col){ return `<path d="M${x1} ${y1} C${x1} ${y1 - 40} ${x2} ${y2 + 70} ${x2} ${y2}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`; }

      function drawCells(){
        const L = halfCell(Lk, 205, "L"), R = halfCell(Rk, 585, "R", conc), cv = cellV(), r = range();
        let s = L.s + R.s;
        if(bridge !== "none") s += `<path d="M250 380 V292 H540 V380" fill="none" stroke="${bridge === "kno3" ? "#E8DDBB" : "#D7E3C0"}" stroke-width="12" stroke-linejoin="round"/>
          <text x="395" y="318" text-anchor="middle" class="k-lbl">salt bridge:</text><text x="395" y="333" text-anchor="middle" class="k-lbl">${bridge === "kno3" ? "KNO₃(aq)" : "KCl(aq)"} on filter paper</text>`;
        const red = lead === "R" ? R.ex : L.ex, blk = lead === "R" ? L.ex : R.ex;
        s += meter(ID + "-v", { cx:395, cy:205, R:118, max:r.max, minor:r.minor, per:r.per, mid:r.mid, fmt:r.fmt, magLab:r.magLab, v:cv.v, unit:"V", caption:r.cap, mag:{ x:800, y:135, r:95 } });
        s += wire(red, 236, 350, 235, "#D33") + wire(blk, 236, 440, 235, "#4B5563");
        const lines = mode === "b"
          ? ["Left: standard hydrogen electrode (reference, 0.00 V).", "Right: Cu(s) in CuSO₄(aq), made by serial dilution of 1.00 mol dm⁻³.", "Nernst: E = E⦵ + (0.059/z) log[Cu²⁺]", "Temperature: 298 K."]
          : [`Left: ${H(Lk).eq}`, `Right: ${H(Rk).eq}`, `E⦵: left ${fmtE(Lk)} · right ${fmtE(Rk)}`, `Red (+) lead on the ${lead === "R" ? "right" : "left"} electrode.`];
        if(cv.note) lines.push(cv.note);
        if(cv.v < 0 && bridge !== "none") lines.push("Needle below zero: the red lead is on the negative electrode. Swap the leads.");
        s += card(700, 268, 250, mode === "b" ? "Concentration cell data" : "Data booklet", lines, 36);
        $(`#${ID}-scene`).innerHTML = s;
        $(`#${ID}-swg`).style.display = "none";
        $(`#${ID}-st`).textContent = bridge === "none" ? "Complete the circuit with a salt bridge" : cv.v < 0 ? "Needle reversed — swap the leads" : "Read the voltmeter through the magnifier";
        ctx.readout(mode === "b" ? [["Cell", "SHE | Cu²⁺/Cu"], ["[Cu²⁺]", CONCS.find(q => q[0] === conc)[1] + " mol dm⁻³"], ["Bridge", bridge]]
          : [["Left", H(Lk).short], ["Right", H(Rk).short], ["Salt bridge", bridge === "none" ? "none" : bridge.toUpperCase()]]);
      }

      /* ── electrolysis ── */
      let bal = 3, conn = "cathode", Iset = .5, on = false;
      const EL = { base:0, dep:0, flake:0, clean:false, inCell:false, wet:false, onBal:false, m0:null, m1:null, Iread:null, wetAmt:0, tOn:0, wetWeigh:false };
      function newElectrode(){ Object.assign(EL, { base:Kit.round(6 + Math.random()*3, 4), dep:0, flake:0, clean:false, inCell:false, wet:false, onBal:false, m0:null, m1:null, Iread:null, tOn:0, wetWeigh:false }); sw.reset(); }
      newElectrode();
      const Itrue = () => on ? Iset*(1 + .004*Math.sin(tNow*.7)) : 0;
      const massNow = () => EL.base + EL.dep - EL.flake + (EL.wet ? EL.wetAmt : 0);
      function drawElec(){
        const I = Itrue();
        let s = `<g transform="translate(30 60)"><rect width="200" height="110" rx="12" fill="#2B3240" stroke="#4B5563"/><text x="100" y="24" text-anchor="middle" style="font:700 12px Inter;fill:#E5E7EB">d.c. power pack · 6 V</text>
          <circle cx="40" cy="62" r="13" fill="${on ? "#7CFFB2" : "#334155"}"/><text x="40" y="94" text-anchor="middle" style="font:600 10px Inter;fill:#CBD5E1">${on ? "ON" : "OFF"}</text>
          <circle cx="130" cy="86" r="8" fill="#D33"/><circle cx="170" cy="86" r="8" fill="#111827" stroke="#9CA3AF"/><text x="130" y="66" text-anchor="middle" style="font:700 11px Inter;fill:#F87171">+</text><text x="170" y="66" text-anchor="middle" style="font:700 12px Inter;fill:#CBD5E1">−</text></g>`;
        const rx = 40 + (1 - (Iset - .1)/.9)*150;
        s += `<g><rect x="30" y="206" width="200" height="26" rx="12" fill="#C9A86A" stroke="#7A6233"/>${Array.from({ length:30 }, (_, i) => `<line x1="${36 + i*6.3}" y1="208" x2="${36 + i*6.3}" y2="230" stroke="#7A6233" stroke-width=".8"/>`).join("")}
          <rect x="${rx}" y="196" width="14" height="44" rx="3" fill="url(#k-metal)"/><text x="130" y="258" text-anchor="middle" class="k-lbl">variable resistor (rheostat)</text></g>`;
        s += meter(ID + "-a", { cx:395, cy:205, R:118, max:1, minor:.02, per:10, mid:5, magLab:10, fmt:v => v.toFixed(1), v:I, unit:"A", caption:"ammeter · 0–1 A", mag:{ x:800, y:135, r:95 } });
        // beaker and electrodes
        s += `<path d="${ChemKit.BEAKER(310, 455, 170, 140)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><rect x="312" y="335" width="166" height="118" rx="4" fill="rgba(70,140,225,.5)"/>
          <text x="395" y="478" text-anchor="middle" class="k-tag">CuSO₄(aq), 1.0 mol dm⁻³</text>`;
        const depCol = EL.dep > 0 ? `rgba(220,120,90,${Math.min(.9, EL.dep*4)})` : "none";
        const wEl = (x, y) => `<rect x="${x}" y="${y}" width="14" height="150" rx="2" fill="#C8733A" stroke="rgba(0,0,0,.25)"/>${EL.dep > 0 ? `<rect x="${x}" y="${y + 60}" width="14" height="90" fill="${depCol}"/>` : ""}${EL.wet ? `<circle cx="${x + 7}" cy="${y + 150}" r="3" fill="#8EC5F5"/>` : ""}<text x="${x + 7}" y="${y - 6}" text-anchor="middle" class="k-hint">W</text>`;
        s += `<rect x="440" y="285" width="14" height="150" rx="2" fill="#C8733A" stroke="rgba(0,0,0,.25)"/>`;
        if(EL.inCell) s += wEl(336, 285);
        else{ const y = EL.onBal ? 348 : 300;
          s += `${EL.onBal ? "" : `<rect x="540" y="${y + 14}" width="160" height="6" rx="3" fill="#F4F4F2" stroke="#C9CCD3"/><text x="620" y="${y + 34}" text-anchor="middle" class="k-lbl">drying</text>`}
            <rect x="545" y="${y}" width="150" height="14" rx="2" fill="#C8733A" stroke="rgba(0,0,0,.25)"/>${EL.dep > 0 ? `<rect x="545" y="${y}" width="90" height="14" fill="${depCol}"/>` : ""}
            ${EL.wet ? `<circle cx="560" cy="${y + 16}" r="3" fill="#8EC5F5"/><circle cx="600" cy="${y + 17}" r="2.5" fill="#8EC5F5"/>` : ""}<text x="538" y="${y + 11}" text-anchor="end" class="k-hint">W</text>`; }
        s += balance(535, 345, EL.onBal ? Kit.round(massNow(), bal) : null, bal);
        // wires: pack + → rheostat → ammeter + ; ammeter COM → anode or W ; pack − → the other
        const pos = conn === "cathode" ? 447 : 343, neg = conn === "cathode" ? 343 : 447;
        s += `<path d="M160 146 V190 H${rx + 7}" fill="none" stroke="#D33" stroke-width="3"/><path d="M230 219 C260 219 300 260 350 235" fill="none" stroke="#D33" stroke-width="3"/>
          <path d="M440 235 C470 260 ${pos + 20} 250 ${pos} 285" fill="none" stroke="#D33" stroke-width="3"/>`;
        if(EL.inCell || conn !== "cathode") s += `<path d="M200 146 C230 170 ${neg - 60} 250 ${neg} 285" fill="none" stroke="#4B5563" stroke-width="3"/>`;
        if(!EL.inCell && conn === "cathode") s += `<path d="M200 146 C230 170 290 250 300 270" fill="none" stroke="#4B5563" stroke-width="3" stroke-dasharray="5 4"/>`;
        const st = [
          `Weighed electrode (W) is the ${conn === "cathode" ? "cathode (−)" : "anode (+)"}.`,
          `Before: ${EL.m0 === null ? "—" : EL.m0.toFixed(bal) + " g"} · after: ${EL.m1 === null ? "—" : EL.m1.toFixed(bal) + " g"}`,
          `Ammeter reading entered: ${EL.Iread === null ? "—" : EL.Iread.toFixed(2) + " A"}`,
          `Cathode: Cu²⁺ + 2e⁻ → Cu · anode: Cu → Cu²⁺ + 2e⁻`,
          `Time on the bench runs ${SPEED}× faster.`
        ];
        s += card(715, 268, 235, "Electrolysis log", st, 35);
        $(`#${ID}-scene`).innerHTML = s;
        $(`#${ID}-swg`).style.display = "";
        $(`#${ID}-st`).textContent = !EL.clean ? "Clean the electrode W, then weigh it" : EL.m0 === null ? "Weigh electrode W" : !EL.inCell && EL.m1 === null && EL.dep === 0 ? "Put the electrodes in the cell and connect" : on ? "Current flowing — read the ammeter, keep it constant" : EL.inCell ? "Switch on and start the stop-clock together" : EL.wet ? "Rinse with water, then propanone, and dry" : "Weigh W again, then record the run";
        ctx.readout([["Current", on ? I.toFixed(2) + " A (set)" : "off"], ["Balance", bal + " d.p."], ["Clock", sw.t.toFixed(0) + " s"]]);
      }

      /* ── planning sketch ── */
      function drawPlan(){
        let s = `<g transform="translate(70 70)"><rect width="420" height="320" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="16" y="26" class="k-tag">Predicted graph (sketch)</text>
          <line x1="70" y1="270" x2="400" y2="270" stroke="var(--txt2)"/><line x1="370" y1="290" x2="370" y2="50" stroke="var(--txt2)"/>
          <text x="230" y="305" text-anchor="middle" class="k-lbl">log[Cu²⁺]  (−4 to 0)</text><text x="380" y="60" class="k-lbl">E / V</text>
          <line x1="90" y1="230" x2="370" y2="90" stroke="var(--accent)" stroke-width="3"/><circle cx="370" cy="90" r="5" fill="var(--accent)"/>
          <text x="300" y="80" class="k-lbl">+0.34 V</text><text x="90" y="140" class="k-lbl">gradient = +0.059/z</text><text x="90" y="156" class="k-lbl">= +0.0295 V for z = 2</text></g>`;
        s += card(520, 70, 420, "Hypothesis", ["As [Cu²⁺] increases, E for Cu²⁺/Cu becomes more positive: the equilibrium Cu²⁺ + 2e⁻ ⇌ Cu shifts right.",
          "E varies linearly with log[Cu²⁺]: a tenfold increase in [Cu²⁺] raises E by 0.0295 V at 298 K.",
          "Independent variable: [Cu²⁺]. Dependent variable: E. Control: temperature, the reference electrode, the salt bridge, electrode surface."], 64);
        s += card(520, 290, 420, "Results table and analysis", ["Columns: [Cu²⁺] / mol dm⁻³ · log[Cu²⁺] · E / V (to 0.005 V).", "Plot E against log[Cu²⁺]; gradient = 0.059/z; intercept = E⦵.", "Repeat each reading and discard anomalies before taking a mean."], 64);
        $(`#${ID}-scene`).innerHTML = s; $(`#${ID}-swg`).style.display = "none";
        $(`#${ID}-st`).textContent = "Paper 5: plan the experiment";
        ctx.readout([["Part", "Planning"]]);
      }
      const draw = () => mode === "c" ? drawElec() : mode === "p" ? drawPlan() : drawCells();

      ctx.frame(dt => {
        tNow += dt;
        sw.tick(dt*SPEED);
        if(on){
          const I = Itrue(), dq = I*dt*SPEED, dmass = dq*M_CU/(2*F_TRUE);
          EL.tOn += dt*SPEED;
          EL.dep += conn === "cathode" ? dmass*.997 : -dmass*1.01;
          if(EL.tOn > 4000){ on = false; powBtn.textContent = "Switch on"; ctx.toast("Power pack switched off: the run is long enough"); }
        }
        draw();
      });

      /* ── controls ── */
      const boxes = {};
      ctx.seg({ label:"Part", value:mode, options:[["a","(a) E⦵cell"],["b","(b) Nernst"],["c","(c) Faraday"],["p","Plan"]], onChange(v){ mode = v; on = false; powBtn.textContent = "Switch on"; sync(); } });
      ["a", "b", "c", "p"].forEach(k => boxes[k] = ctx.html(`<div></div>`));
      const sync = () => { Object.keys(boxes).forEach(k => boxes[k].style.display = k === mode ? "" : "none"); shared.style.display = mode === "a" || mode === "b" ? "" : "none"; draw(); };

      // shared cell controls
      const shared = ctx.html(`<div></div>`);
      ctx.seg({ label:"Red (+) voltmeter lead to", value:lead, options:[["L","Left electrode"],["R","Right electrode"]], onChange(v){ lead = v; draw(); }, parent:shared });
      ctx.seg({ label:"Salt bridge", value:bridge, options:[["kno3","KNO₃ paper"],["kcl","KCl paper"],["none","None"]], onChange(v){ bridge = v; draw(); }, parent:shared });
      ctx.controls.insertBefore(shared, boxes.a);

      // (a)
      const opts = Object.keys(HC).map(k => [k, k === "x" ? "X²⁺/X (unknown metal X)" : HC[k].name + (k === "she" ? " (SHE)" : "")]);
      ctx.select({ label:"Left half-cell", value:Lk, options:opts, onChange(v){ Lk = v; draw(); }, parent:boxes.a });
      ctx.select({ label:"Right half-cell", value:Rk, options:opts, onChange(v){ Rk = v; draw(); }, parent:boxes.a });
      const pairs = new Set();
      Kit.reading(ctx, "Voltmeter reading / V (read to ±0.01 V)", "e.g. 1.10", () => {
        if(mode !== "a") return null; const c = cellV();
        if(bridge === "none" || c.v < 0) return null; return c.v;
      }, .0101, v => {
        if(Lk === Rk){ ctx.toast("Use two different half-cells"); return; }
        const pos = lead === "R" ? Rk : Lk, neg = lead === "R" ? Lk : Rk;
        ctx.record({ part:"(a) cell e.m.f.", set:`+ ${H(pos).short} | − ${H(neg).short}${bridge === "kcl" ? " (KCl bridge)" : ""}`, E:v });
        lastCell = { L:Lk, R:Rk };
        if(bridge === "kno3") pairs.add([Lk, Rk].sort().join("|"));
        polFb.innerHTML = "";
      }, boxes.a);
      Kit.answer(ctx, "E⦵ of X²⁺/X from your readings / V", "e.g. −0.25", v => {
        const has = ctx.rows().some(r => r.part === "(a) cell e.m.f." && r.set.includes("X²⁺/X") && !r.set.includes("KCl"));
        if(!has) return [false, "Measure a cell containing X²⁺/X (with a KNO₃ bridge) first."];
        if(Math.abs(v - X.E) <= .03){
          const n = [...pairs].length;
          if(n >= 3 && [...pairs].some(p => p.includes("x"))) ctx.complete("cell");
          return [true, `Correct: E⦵(X²⁺/X) ≈ ${(X.E >= 0 ? "+" : "−") + Math.abs(X.E).toFixed(2)} V, so X is ${X.m}.${n < 3 ? ` Measure ${3 - n} more different cell${3 - n > 1 ? "s" : ""} to complete the challenge.` : ""}`];
        }
        return [false, "E⦵cell = E⦵(positive) − E⦵(negative). If X is the negative electrode, E⦵(X) = E⦵(other) − E⦵cell. Watch the sign."];
      }, boxes.a);
      const pol = ctx.html(`<div class="ctl"><div class="lbl"><span>Polarity of the last cell you recorded</span></div>
        <div style="display:flex;gap:.4rem;margin-bottom:.4rem"><select class="inp" data-p="pos" aria-label="Positive electrode"><option value="">Positive electrode…</option><option value="L">Left</option><option value="R">Right</option></select>
        <select class="inp" data-p="e" aria-label="Electron flow"><option value="">Electrons flow…</option><option value="LR">left → right (external wire)</option><option value="RL">right → left (external wire)</option></select></div>
        <div class="btns"><button class="btn small" type="button">Check</button></div><div data-fb style="margin-top:.4rem"></div></div>`, boxes.a);
      const polFb = pol.querySelector("[data-fb]");
      pol.querySelector("button").onclick = () => {
        if(!lastCell) return polFb.innerHTML = `<div class="note bad">Record a cell reading first.</div>`;
        const p = pol.querySelector("[data-p=pos]").value, e = pol.querySelector("[data-p=e]").value;
        if(!p || !e) return polFb.innerHTML = `<div class="note bad">Choose both.</div>`;
        const posK = H(lastCell.R).E >= H(lastCell.L).E ? "R" : "L", eK = posK === "R" ? "LR" : "RL";
        const ok = p === posK && e === eK; if(ok) ctx.complete("polar");
        polFb.innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${ok ? `Correct: the ${posK === "R" ? "right" : "left"} half-cell has the more positive E⦵, so it is the positive electrode (reduction happens there). Electrons leave the negative electrode and flow through the wire to the positive one.` : "The half-cell with the more positive E⦵ is the positive pole. Electrons flow in the external circuit from the negative to the positive electrode."}</div>`;
      };
      // feasibility
      let fq = Math.floor(Math.random()*FEAS.length), fRight = 0;
      const fe = ctx.html(`<div class="ctl"><div class="lbl"><span>Feasibility from data-booklet E⦵</span></div><div class="hint" data-q style="color:var(--txt);font-size:.85rem"></div>
        <div style="display:flex;gap:.4rem;margin:.4rem 0"><input class="inp" type="number" step="any" placeholder="E⦵cell / V" aria-label="E cell"><select class="inp" aria-label="Feasible?"><option value="">Feasible?</option><option value="y">Feasible</option><option value="n">Not feasible</option></select></div>
        <div class="btns"><button class="btn small primary" type="button" data-a="c">Check</button><button class="btn small" type="button" data-a="n">Next reaction</button></div><div data-fb style="margin-top:.4rem"></div></div>`, boxes.a);
      const showF = () => { fe.querySelector("[data-q]").textContent = FEAS[fq][0] + "."; fe.querySelector("input").value = ""; fe.querySelector("select").value = ""; };
      fe.querySelector("[data-a=n]").onclick = () => { fq = (fq + 1 + Math.floor(Math.random()*(FEAS.length - 1))) % FEAS.length; fe.querySelector("[data-fb]").innerHTML = ""; showF(); };
      fe.querySelector("[data-a=c]").onclick = () => {
        const r = FEAS[fq], want = Kit.round(r[1] - r[2], 2), v = parseFloat(fe.querySelector("input").value), y = fe.querySelector("select").value, fb = fe.querySelector("[data-fb]");
        if(!isFinite(v) || !y) return fb.innerHTML = `<div class="note bad">Enter E⦵cell and choose feasible or not.</div>`;
        const ok = Math.abs(v - want) <= .011 && (y === "y") === (want > 0);
        if(ok){ fRight++; if(fRight >= 3) ctx.complete("feas"); }
        fb.innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${ok ? `Correct (${fRight} so far): ${r[3]}; E⦵cell = ${want > 0 ? "+" : ""}${want.toFixed(2)} V, ${want > 0 ? "feasible" : "not feasible"}.${Math.abs(want) < .1 ? " E⦵cell is small, so non-standard conditions or a high activation energy may still stop it happening." : ""}` : "E⦵cell = E⦵(species being reduced) − E⦵(species being oxidised). Positive means feasible."}</div>`;
      };
      showF();

      // (b)
      ctx.seg({ label:"[Cu²⁺] in the right half-cell / mol dm⁻³", value:conc, options:CONCS.map(q => [q[0], q[1]]), onChange(v){ conc = v; draw(); }, parent:boxes.b });
      ctx.html(`<div class="hint">Make each solution by pipetting 10.0 cm³ of the previous one into a 100 cm³ volumetric flask and making up to the mark.</div>`, boxes.b);
      Kit.reading(ctx, "Voltmeter reading / V (read to ±0.0025 V)", "e.g. 0.310", () => {
        if(mode !== "b") return null; const c = cellV(); if(bridge === "none" || c.v < 0) return null; return c.v;
      }, .0026, v => {
        if(bridge !== "kno3") ctx.toast("Use the KNO₃ bridge for the Nernst readings");
        ctx.record({ part:"(b) Nernst", set:"SHE | Cu²⁺/Cu", c:conc, lg:Math.log10(conc), E:v });
      }, boxes.b);
      const nFit = () => { const p = ctx.rows().filter(r => r.part === "(b) Nernst").map(r => [r.lg, r.E]); return new Set(p.map(q => q[0])).size >= 4 ? ctx.linFit(p) : null; };
      Kit.answer(ctx, "Gradient of E against log[Cu²⁺] / V", "e.g. 0.030", v => {
        const f = nFit(); if(!f) return [false, "Record E for at least four different concentrations."];
        if(Math.abs(v - f.m) <= .1*Math.abs(f.m) + .001) return [true, `Correct: your gradient is ${f.m.toFixed(4)} V and the intercept (log[Cu²⁺] = 0) is ${f.c.toFixed(3)} V, close to E⦵ = +0.34 V.`];
        return [false, "Use the graph: plot E (y) against log[Cu²⁺] (x). Gradient = ΔE ÷ Δlog[Cu²⁺]."];
      }, boxes.b);
      Kit.answer(ctx, "Number of electrons z in Cu²⁺ + ze⁻ ⇌ Cu, from your gradient", "e.g. 2", v => {
        const f = nFit(); if(!f) return [false, "Record E for at least four different concentrations."];
        const z = .059/f.m;
        if(v === 2 && z > 1.5 && z < 2.6){ ctx.complete("nernst"); return [true, `Correct: z = 0.059 ÷ ${f.m.toFixed(4)} = ${z.toFixed(2)} ≈ 2.`]; }
        if(v === 2) return [false, `Your gradient gives z = ${z.toFixed(2)}. Check your readings: some may be anomalous.`];
        return [false, "The Nernst gradient is 0.059/z. Rearrange: z = 0.059 ÷ gradient, then round to a whole number."];
      }, boxes.b);

      // (c)
      ctx.seg({ label:"Weighed electrode W connected as", value:conn, options:[["cathode","Cathode (−)"],["anode","Anode (+)"]], onChange(v){ if(on) return; conn = v; draw(); }, parent:boxes.c });
      ctx.seg({ label:"Balance", value:bal, options:[[2,"2 d.p."],[3,"3 d.p."]], onChange(v){ bal = v; draw(); }, parent:boxes.c });
      ctx.slider({ label:"Variable resistor → current", min:.1, max:1, step:.01, value:Iset, unit:"A", fmt:v => v.toFixed(2), hint:"Large currents give a loose, spongy deposit.", onInput(v){ Iset = v; }, parent:boxes.c });
      ctx.buttons([
        { label:"Clean W (emery paper), dry", onClick(){ if(EL.inCell) return ctx.toast("Take W out of the cell first"); if(on) return; newElectrode(); EL.clean = true; draw(); } },
        { label:"Weigh W", onClick(){
          if(EL.inCell) return ctx.toast("Take W out of the cell first");
          EL.onBal = true; const m = Kit.round(massNow(), bal);
          if(EL.m0 === null){ EL.m0 = m; if(!EL.clean) ctx.toast("W was not cleaned — the copper may not stick well"); }
          else if(EL.dep !== 0 || EL.flake){ EL.m1 = m; EL.wetWeigh = EL.wet; if(EL.wet) ctx.toast("W is still wet — the mass is too high"); }
          draw(); } }
      ], boxes.c);
      const [, powBtn] = ctx.buttons([
        { label:"Into the cell", onClick(){ if(EL.m0 === null) return ctx.toast("Weigh W first"); if(EL.m1 !== null) return ctx.toast("This run is finished — record it or clean W for a new run"); EL.inCell = true; EL.onBal = false; draw(); } },
        { label:"Switch on", onClick(){ if(!EL.inCell) return ctx.toast("Put the electrodes in the cell first"); on = !on; powBtn.textContent = on ? "Switch off" : "Switch on"; if(on && !sw.running) ctx.toast("Start the stop-clock now"); draw(); } },
        { label:"Remove W", onClick(){ if(on) return ctx.toast("Switch off first"); if(!EL.inCell) return;
          EL.inCell = false; EL.wet = true; EL.wetAmt = Kit.round(.02 + Math.random()*.03, 4);
          if(EL.dep > 0 && (Iset > .6 || !EL.clean)){ EL.flake = Kit.round(EL.dep*(.03 + Math.random()*.05), 4); ctx.toast("Some loose, spongy copper flaked off as you lifted W out"); }
          draw(); } }
      ], boxes.c);
      ctx.buttons([{ label:"Rinse (water, then propanone) and dry in warm air", block:true, onClick(){ if(EL.inCell) return; EL.wet = false; ctx.toast("No naked flames: propanone is highly flammable"); draw(); } }], boxes.c);
      const ammeter = Kit.reading(ctx, "Ammeter reading / A (to ±0.01 A)", "e.g. 0.50", () => mode === "c" && on ? Itrue() : null, .0101, v => { EL.Iread = v; draw(); }, boxes.c);
      ctx.buttons([{ label:"Record this run", primary:true, block:true, onClick(){
        if(EL.m0 === null || EL.m1 === null) return ctx.toast("Weigh W before and after electrolysis");
        if(EL.Iread === null) return ctx.toast("Enter the ammeter reading while the current flows");
        if(sw.running || sw.t <= 0) return ctx.toast("Stop the stop-clock first");
        if(Math.abs(sw.t - EL.tOn) > 15) ctx.toast(`Your clock says ${sw.t.toFixed(0)} s but the current flowed for ${EL.tOn.toFixed(0)} s — a timing error. Recording anyway.`);
        const t = Math.round(sw.t), Q = Kit.round(EL.Iread*t, 0), dm = Kit.round(EL.m1 - EL.m0, bal);
        ctx.record({ part:"(c) electrolysis", set:`W = ${conn}, ${bal} d.p.${EL.wetWeigh ? ", weighed wet" : ""}`, I:EL.Iread, t, Q, dm });
        lastRun = { Q, dm, dp:bal };
        ammeter.clear(); EL.m1 = null; EL.m0 = null; EL.dep = 0; EL.flake = 0; EL.Iread = null; EL.clean = false; sw.reset(); draw();
      } }], boxes.c);
      let lastRun = null, Fok = null;
      Kit.answer(ctx, "Faraday constant F from your data / C mol⁻¹", "e.g. 9.6e4", v => {
        const runs = ctx.rows().filter(r => r.part === "(c) electrolysis" && r.dm > 0 && r.set.startsWith("W = cathode"));
        if(!runs.length) return [false, "Record at least one run with W as the cathode."];
        const last = runs[runs.length - 1], Fr = last.Q*M_CU/(2*last.dm);
        let Fg = null; if(runs.length >= 3){ const f = ctx.linFit(runs.map(r => [r.Q, r.dm]).concat([[0, 0]])); if(f && f.m > 0) Fg = M_CU/(2*f.m); }
        const okR = Math.abs(v - Fr)/Fr <= .025, okG = Fg && Math.abs(v - Fg)/Fg <= .025;
        if(okR || okG){ Fok = v; if(Lok) ctx.complete("faraday");
          return [true, `Correct from your ${okG ? "gradient (Δm against Q)" : "last run"}: F = Q × M ÷ (2Δm) = ${sci(okG ? Fg : Fr)} C mol⁻¹. Data-booklet value 9.65 × 10⁴. Now find L.`]; }
        return [false, `n(Cu) = Δm ÷ 63.5; n(e⁻) = 2 n(Cu); F = Q ÷ n(e⁻) = Q × 63.5 ÷ (2Δm). Your last run: Q = ${last.Q} C, Δm = ${last.dm} g.`];
      }, boxes.c);
      let Lok = false;
      Kit.answer(ctx, "Avogadro constant L = F ÷ e (e = 1.60 × 10⁻¹⁹ C) / mol⁻¹", "e.g. 6.0e23", v => {
        if(Fok === null) return [false, "Find F first."];
        const L = Fok/1.60e-19;
        if(Math.abs(v - L)/L <= .02){ Lok = true; ctx.complete("faraday"); return [true, `Correct: L = ${sci(Fok)} ÷ 1.60 × 10⁻¹⁹ = ${sci(L)} mol⁻¹ (accepted 6.02 × 10²³).`]; }
        return [false, "F = Le, so L = F ÷ e."];
      }, boxes.c);
      Kit.answer(ctx, "Percentage uncertainty in Δm of your last run / %", "e.g. 0.7", v => {
        if(!lastRun || lastRun.dm <= 0) return [false, "Record a run in which W gained mass first."];
        const h = lastRun.dp === 3 ? .0005 : .005, p1 = ChemKit.pct(2*h, lastRun.dm), p2 = ChemKit.pct(4*h, lastRun.dm);
        if([p1, p2].some(p => Math.abs(v - p) <= .04*p + .01)){ ctx.complete("unc"); return [true, `Correct: two readings of ±${h} g → ±${Kit.round(2*h, 4)} g. ${Kit.round(2*h, 4)} ÷ ${lastRun.dm} × 100 = ${p1.toFixed(2)}% (or ${p2.toFixed(2)}% with ±${2*h} g per reading). ${lastRun.dp === 2 ? "A 3 d.p. balance would cut this by a factor of 10." : ""}`]; }
        return [false, `Δm is the difference of two readings, each ±half the last digit (±${h} g on a ${lastRun.dp} d.p. balance).`];
      }, boxes.c);

      // plan
      quiz(ctx, "Paper 5 planning questions", [
        { q:"In part (b), the independent variable is…", opts:["the cell e.m.f.","[Cu²⁺] in the right-hand half-cell","the temperature","the length of the salt bridge"], a:1, why:"[Cu²⁺] is what you change; E is measured (dependent).", hint:"Which quantity do you choose before each reading?" },
        { q:"Which variable must be controlled because the Nernst constant 0.059 depends on it?", opts:["Volume of solution","Temperature (298 K)","Mass of the copper electrode","Atmospheric pressure"], a:1, why:"0.059 = 2.303RT/F at 298 K, so E depends on temperature." },
        { q:"Why must the voltmeter have a very high resistance?", opts:["To protect it from large currents","So that almost no current flows and the full e.m.f. is measured","So that it reads to more decimal places","To heat the solutions to 298 K"], a:1, why:"With negligible current there is no reaction and no p.d. lost inside the cell." },
        { q:"Which salt bridge is suitable for a cell containing Ag⁺/Ag?", opts:["Filter paper soaked in KCl(aq)","Filter paper soaked in KNO₃(aq)","A copper wire","Filter paper soaked in distilled water"], a:1, why:"Cl⁻ would precipitate AgCl; nitrates are soluble and the ions conduct." },
        { q:"How should you make 1.00 × 10⁻³ mol dm⁻³ CuSO₄ from 1.00 mol dm⁻³ most accurately?", opts:["Measure 0.10 cm³ with a measuring cylinder and add 99.9 cm³ water","Three successive 1 in 10 dilutions with a 10.0 cm³ pipette and 100 cm³ volumetric flask","Add one drop of stock to a beaker of water","Dissolve 0.016 g of CuSO₄ in 100 cm³ of water in a beaker"], a:1, why:"Serial dilution with volumetric glassware keeps the percentage uncertainty small." },
        { q:"In part (c), how is the current kept constant?", opts:["By using a larger beaker","By adjusting the variable resistor while watching the ammeter","By stirring the electrolyte","By weighing the anode as well"], a:1, why:"The rheostat compensates for any change in resistance during the run." },
        { q:"The cathode is dried with propanone. The precaution is…", opts:["Use a fume cupboard because propanone is toxic","No naked flames, because propanone is highly flammable","Wear a face mask for dust","Cool it in a desiccator"], a:1, why:"Propanone vapour ignites easily: dry in warm air away from flames." }
      ], () => ctx.complete("plan"), boxes.p);
      sync();
    }
  });

  /* ═════════════════ TRANSITION ELEMENT COMPLEXES ═════════════════ */
  const TD = "a-transition";
  const OCT = "octahedral", TET = "tetrahedral";
  /* starting aqueous ions and what each reagent does */
  const IONS = {
    cu: { name:"Cu²⁺(aq)", sol:[80,150,230], cx:"[Cu(H₂O)₆]²⁺", shape:OCT, col:"blue solution",
      t:{ nh3few:{ obs:"pale blue ppt.", sol:[150,195,240], ppt:[120,175,235], cx:"[Cu(OH)₂(H₂O)₄]", shape:OCT },
          nh3xs: { obs:"pale blue ppt. dissolves in excess, giving a dark blue solution", sol:[25,45,170], solA:.85, cx:"[Cu(NH₃)₄(H₂O)₂]²⁺", shape:OCT },
          naohfew:{ obs:"pale blue ppt.", sol:[150,195,240], ppt:[120,175,235], cx:"[Cu(OH)₂(H₂O)₄]", shape:OCT },
          naohxs: { obs:"pale blue ppt., insoluble in excess", sol:[170,205,240], ppt:[120,175,235], cx:"[Cu(OH)₂(H₂O)₄]", shape:OCT },
          hcl:    { obs:"blue solution turns yellow-green", sol:[165,200,60], solA:.75, cx:"[CuCl₄]²⁻", shape:TET, fumes:true },
          kscn:   { na:"Thiocyanate is the test for Fe³⁺ — try it on Fe³⁺(aq) and Fe²⁺(aq)." } } },
    co: { name:"Co²⁺(aq)", sol:[235,150,170], cx:"[Co(H₂O)₆]²⁺", shape:OCT, col:"pink solution",
      t:{ nh3few:{ obs:"blue ppt.", sol:[225,185,200], ppt:[80,110,205], cx:"[Co(OH)₂(H₂O)₄]", shape:OCT },
          nh3xs: { obs:"blue ppt. dissolves in excess, giving a pale yellow-brown solution that darkens in air", sol:[205,165,95], solA:.6, cx:"[Co(NH₃)₆]²⁺", shape:OCT },
          naohfew:{ obs:"blue ppt., turning pink on standing", sol:[230,190,205], ppt:[80,110,205], cx:"[Co(OH)₂(H₂O)₄]", shape:OCT },
          naohxs: { obs:"blue ppt. turning pink, insoluble in excess", sol:[235,200,210], ppt:[215,135,150], cx:"[Co(OH)₂(H₂O)₄]", shape:OCT },
          hcl:    { obs:"pink solution turns blue", sol:[40,85,210], solA:.8, cx:"[CoCl₄]²⁻", shape:TET, fumes:true },
          kscn:   { obs:"no change", sol:[235,150,170], cx:"[Co(H₂O)₆]²⁺", shape:OCT } } },
    fe3:{ name:"Fe³⁺(aq)", sol:[215,160,60], cx:"[Fe(H₂O)₆]³⁺", shape:OCT, col:"yellow-brown solution",
      t:{ nh3few:{ obs:"red-brown ppt.", sol:[230,200,150], ppt:[160,70,30], cx:"[Fe(OH)₃(H₂O)₃]", shape:OCT },
          nh3xs: { obs:"red-brown ppt., insoluble in excess", sol:[235,215,180], ppt:[160,70,30], cx:"[Fe(OH)₃(H₂O)₃]", shape:OCT },
          naohfew:{ obs:"red-brown ppt.", sol:[230,200,150], ppt:[160,70,30], cx:"[Fe(OH)₃(H₂O)₃]", shape:OCT },
          naohxs: { obs:"red-brown ppt., insoluble in excess", sol:[235,215,180], ppt:[160,70,30], cx:"[Fe(OH)₃(H₂O)₃]", shape:OCT },
          hcl:    { obs:"solution turns yellow", sol:[240,215,50], solA:.7, cx:"[FeCl₄]⁻", shape:TET, fumes:true },
          kscn:   { obs:"blood-red solution", sol:[150,10,20], solA:.9, cx:"[Fe(SCN)(H₂O)₅]²⁺", shape:OCT } } },
    fe2:{ name:"Fe²⁺(aq)", sol:[195,230,190], cx:"[Fe(H₂O)₆]²⁺", shape:OCT, col:"pale green solution",
      t:{ nh3few:{ obs:"green ppt., turning brown on contact with air", sol:[215,230,205], ppt:[95,135,85], cx:"[Fe(OH)₂(H₂O)₄]", shape:OCT },
          nh3xs: { obs:"green ppt., insoluble in excess", sol:[215,230,205], ppt:[95,135,85], cx:"[Fe(OH)₂(H₂O)₄]", shape:OCT },
          naohfew:{ obs:"green ppt., turning brown on contact with air", sol:[215,230,205], ppt:[95,135,85], cx:"[Fe(OH)₂(H₂O)₄]", shape:OCT },
          naohxs: { obs:"green ppt., insoluble in excess", sol:[215,230,205], ppt:[95,135,85], cx:"[Fe(OH)₂(H₂O)₄]", shape:OCT },
          hcl:    { obs:"no significant change (pale green solution)", sol:[200,230,180], cx:"[Fe(H₂O)₆]²⁺", shape:OCT, fumes:true },
          kscn:   { obs:"no change (at most a faint red tinge if some Fe³⁺ is present)", sol:[205,225,190], cx:"[Fe(H₂O)₆]²⁺", shape:OCT } } },
    cr: { name:"Cr³⁺(aq)", sol:[100,150,110], cx:"[Cr(H₂O)₆]³⁺", shape:OCT, col:"green solution",
      t:{ nh3few:{ obs:"grey-green ppt.", sol:[190,210,195], ppt:[115,140,115], cx:"[Cr(OH)₃(H₂O)₃]", shape:OCT },
          nh3xs: { obs:"grey-green ppt., insoluble in excess", sol:[190,210,195], ppt:[115,140,115], cx:"[Cr(OH)₃(H₂O)₃]", shape:OCT, note:"A very large excess of concentrated NH₃ slowly gives purple [Cr(NH₃)₆]³⁺." },
          naohfew:{ obs:"grey-green ppt.", sol:[190,210,195], ppt:[115,140,115], cx:"[Cr(OH)₃(H₂O)₃]", shape:OCT },
          naohxs: { obs:"grey-green ppt. dissolves in excess, giving a dark green solution", sol:[35,115,55], solA:.8, cx:"[Cr(OH)₆]³⁻", shape:OCT },
          hcl:    { obs:"no significant change (green solution)", sol:[90,140,95], cx:"[Cr(H₂O)₄Cl₂]⁺", shape:OCT, fumes:true },
          kscn:   { obs:"no change", sol:[100,150,110], cx:"[Cr(H₂O)₆]³⁺", shape:OCT } } }
  };
  const TESTS = [["nh3few","NH₃(aq), a few drops"],["nh3xs","NH₃(aq), in excess"],["naohfew","NaOH(aq), a few drops"],["naohxs","NaOH(aq), in excess"],
    ["hcl","Concentrated HCl, in excess (fume cupboard)"],["water","…then dilute the HCl tube with water"],["kscn","KSCN(aq), a few drops"]];
  const ALLCX = [...new Set(Object.values(IONS).flatMap(i => [i.cx].concat(Object.values(i.t).map(r => r.cx).filter(Boolean))))];
  const PROMPTS = [["cu","nh3xs"],["cu","hcl"],["co","hcl"],["co","nh3xs"],["fe3","kscn"],["cr","naohxs"],["fe3","hcl"],["cu","start"],["co","start"]];
  const FILTERS = [["violet","Violet",[140,80,200]],["blue","Blue",[50,110,230]],["green","Green",[60,170,80]],["yellow","Yellow",[235,210,40]],["orange","Orange",[245,140,40]],["red","Red",[220,50,50]]];
  /* relative absorbance of each coloured species through each filter */
  const ABS = {
    cu:   { violet:.10, blue:.15, green:.45, yellow:1.4, orange:3.3, red:5.0 },                // per mol dm⁻³, 1 cm
    fescn:{ violet:2100, blue:4700, green:3500, yellow:900, orange:250, red:90 },             // per mol dm⁻³
    fe:   { violet:300, blue:60, green:10, yellow:5, orange:3, red:2 },
    nien: { violet:1.6, blue:2.2, green:9.4, yellow:11, orange:5, red:1.6 },
    ni:   { violet:3.5, blue:.6, green:.3, yellow:.5, orange:1.6, red:3.8 }
  };
  const JOB = {
    fe:{ name:"Fe³⁺ + SCN⁻", stock:.00200, n:1, M:"Fe³⁺(aq)", L:"SCN⁻(aq)", cx:"[Fe(SCN)(H₂O)₅]²⁺", col:[150,10,20] },
    ni:{ name:"Ni²⁺ + en", stock:.200, n:3, M:"Ni²⁺(aq)", L:"en (1,2-diaminoethane)", cx:"[Ni(en)₃]²⁺", col:[150,70,200] }
  };

  Lab.register({
    id:TD, subject:"chemistry", level:["a"], topic:"Transition elements · Complexes, colorimetry, redox titration", interactive:true,
    title:"Transition element complexes: ligand exchange, colorimetry and iodometry",
    summary:"Ligand exchange with NH₃, OH⁻, Cl⁻ and SCN⁻ for Cu²⁺, Co²⁺, Fe³⁺, Fe²⁺ and Cr³⁺. Choose a complementary filter, build a calibration curve and find an unknown [Cu²⁺]. Find a complex's formula by Job's method, and the copper content of brass by iodometric titration.",
    aim:"Observe and explain ligand exchange in complexes of copper(II), cobalt(II), iron and chromium(III); use colorimetry to find a concentration and the formula of a complex; determine copper by reaction with iodide and titration with thiosulfate.",
    variables:{ iv:"Concentration of the standard · mole fraction of ligand · ligand added", dv:"Absorbance A · colour observed · titre / cm³", cv:["Same filter and cuvette","Colorimeter zeroed with distilled water","Total volume constant in Job's method","Excess KI"] },
    stageTitle:"Complexes bench", controlsTitle:"Procedure",
    thumb:`<svg viewBox="0 0 300 140"><path d="M40 20 v80 a14 14 0 0 0 28 0 v-80" fill="#5A9BE6" stroke="#A2ACBD" stroke-width="2"/><path d="M90 20 v80 a14 14 0 0 0 28 0 v-80" fill="#1E3AA8" stroke="#A2ACBD" stroke-width="2"/><path d="M140 20 v80 a14 14 0 0 0 28 0 v-80" fill="#3B5BD6" stroke="#A2ACBD" stroke-width="2"/><path d="M190 20 v80 a14 14 0 0 0 28 0 v-80" fill="#9A0A14" stroke="#A2ACBD" stroke-width="2"/><path d="M240 20 v80 a14 14 0 0 0 28 0 v-80" fill="#A8C83C" stroke="#A2ACBD" stroke-width="2"/></svg>`,
    challenges:[
      { id:"ligand", title:"Ligand exchange", text:"Carry out six different tests, including excess NH₃(aq) on Cu²⁺(aq) and concentrated HCl on Co²⁺(aq)." },
      { id:"ident",  title:"Name the complex", text:"Give the formula and shape of three complexes correctly." },
      { id:"calib",  title:"Calibration curve", text:"Zero the colorimeter and measure five Cu²⁺ standards through the filter that gives the greatest absorbance." },
      { id:"unknown", title:"Unknown concentration", text:"Use your calibration line to find [Cu²⁺] in FB 5." },
      { id:"job",    title:"Job's method", text:"Measure seven or more mixtures of one metal–ligand pair and deduce n in MLₙ." },
      { id:"iodo",   title:"Copper in brass", text:"Titrate the liberated iodine with thiosulfate; get concordant titres and the percentage of copper in the brass." },
      { id:"plan",   title:"Paper 5 plan", text:"Answer every planning question correctly." }
    ],
    columns:[{key:"part",label:"Part"},{key:"sample",label:"Sample"},{key:"test",label:"Test / filter"},{key:"obs",label:"Observation"},
      {key:"c",label:"c / mol dm⁻³"},{key:"xf",label:"Mole fraction of ligand"},{key:"A",label:"Absorbance",dp:3},{key:"titre",label:"Titre / cm³",dp:2}],
    series:"part",
    graph:{ x:["c","xf"], y:["A"], fit:"linear" },
    questions:[
      { q:"Explain, with equations, what you see when aqueous ammonia is added dropwise and then in excess to Cu²⁺(aq).",
        a:"A few drops: pale blue ppt. — [Cu(H₂O)₆]²⁺ + 2OH⁻ → [Cu(OH)₂(H₂O)₄] + 2H₂O (NH₃ acts as a base). Excess: the ppt. dissolves giving a dark blue solution by ligand exchange — [Cu(H₂O)₆]²⁺ + 4NH₃ → [Cu(NH₃)₄(H₂O)₂]²⁺ + 4H₂O." },
      { q:"Why does adding concentrated HCl to Co²⁺(aq) change the colour from pink to blue, and why does adding water reverse it?",
        a:"[Co(H₂O)₆]²⁺ + 4Cl⁻ ⇌ [CoCl₄]²⁻ + 6H₂O. Cl⁻ is a larger ligand, so the coordination number falls from 6 (octahedral) to 4 (tetrahedral). The different ligands and geometry change ΔE between the split d orbitals, so a different frequency of light is absorbed. Adding water moves the equilibrium back to the left (Le Chatelier)." },
      { q:"Why does a solution of a transition metal complex look coloured, and why is the filter chosen to be the complementary colour?",
        a:"The ligands split the d orbitals into two non-degenerate sets. An electron absorbs light of frequency ΔE/h to move to the higher set; the colour seen is the complementary colour of the light absorbed. The filter passes the colour that is absorbed most, so absorbance changes most with concentration (greatest sensitivity)." },
      { q:"In Job's method the absorbance is greatest at a mole fraction of ligand of 0.75. What is the formula of the complex? State two conditions needed for the method.",
        a:"Ratio ligand : metal = 0.75 : 0.25 = 3 : 1, so ML₃ (e.g. [Ni(en)₃]²⁺). The metal and ligand solutions must have the same concentration, and the total volume must stay constant; the wavelength must be one absorbed by the complex and not by the reagents." },
      { q:"Write the equations for the iodometric determination of copper and the mole ratio Cu²⁺ : S₂O₃²⁻.",
        a:"2Cu²⁺ + 4I⁻ → 2CuI + I₂, then I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻. So 2Cu²⁺ ≡ I₂ ≡ 2S₂O₃²⁻: the ratio is 1 : 1." },
      { q:"Why is starch added only near the end-point, and what is the colour change at the end-point?",
        a:"At high [I₂] the starch–iodine complex forms in large amounts and releases iodine only slowly, so the end-point is late and indistinct. Add starch when the solution is pale yellow (straw); the end-point is blue-black → off-white (the white CuI ppt. remains)." },
      { q:"A student does not zero the colorimeter with distilled water. What is the effect on the calibration graph and on the unknown's concentration?",
        a:"Every absorbance is too high by the same amount (systematic error): the line is parallel but does not pass through the origin. If the unknown is read on the same line the error largely cancels, but if a through-origin line is assumed the concentration will be too high." },
      { q:"State the hazards and precautions for this practical.",
        a:"Concentrated HCl gives off corrosive, irritant fumes: use a fume cupboard, gloves and eye protection. Concentrated ammonia is irritant: fume cupboard. Dissolving brass in concentrated nitric acid produces toxic NO₂: fume cupboard. Cobalt(II) and nickel(II) salts are toxic/carcinogenic and sensitisers: wear gloves." }
    ],
    setup(ctx){
      let mode = "lx", ion = "cu", lastTest = null, hclDone = false, prompt = null;
      const done = new Set(), pr = { n:0 };
      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="${TD}-svg"><defs>${Kit.DEFS}<clipPath id="${TD}-fl"><path d="${ChemKit.FLASK(180, 455, 1)} Z"/></clipPath><clipPath id="${TD}-bur"><rect x="171" y="50" width="18" height="312"/></clipPath></defs>
        ${Kit.bench(960, 460)}<g id="${TD}-scene"></g><text x="24" y="30" class="k-status" id="${TD}-st"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector(`#${TD}-svg`), $ = s => svg.querySelector(s);
      const status = t => $(`#${TD}-st`).textContent = t;

      /* ── ligand exchange ── */
      function shapeSvg(shape, x, y){
        const L = (dx, dy, w) => `<line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}" stroke="var(--txt2)" stroke-width="${w || 2}"/><circle cx="${x + dx}" cy="${y + dy}" r="7" fill="var(--accent)"/>`;
        const c = `<circle cx="${x}" cy="${y}" r="11" fill="#C8733A"/>`;
        if(shape === TET) return L(0, -42) + L(-38, 22) + L(38, 22) + L(12, 30, 1.2) + c;
        return L(0, -44) + L(0, 44) + L(-44, 0) + L(44, 0) + L(-26, -20, 1.2) + L(26, 20, 1.2) + c;
      }
      function drawLx(r, title){
        const I = IONS[ion];
        let s = ChemKit.tube({ id:`${TD}-t0`, x:110, y:230, sol:I.sol, label:"before" });
        if(r) s += ChemKit.tube({ id:`${TD}-t1`, x:220, y:230, sol:r.sol, solA:r.solA, ppt:r.ppt, suspend:!!r.ppt, pptAmount:r.ppt ? .8 : 0, fumes:r.fumes ? [200,220,200] : null, label:"after" });
        const obs = r ? r.obs : `${I.name}: ${I.col}. Choose a test.`;
        s += card(330, 60, 600, title || "Observation", [obs].concat(r && r.note ? [r.note] : []), 76, "k-numb");
        const cx = r ? r.cx : I.cx, shape = r ? r.shape : I.shape;
        if(cx) s += `<g transform="translate(330 220)"><rect width="600" height="200" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="16" y="26" class="k-tag">Species present (after the test)</text>
          ${shapeSvg(shape, 90, 110)}<text x="180" y="80" class="k-numb" style="font-size:16px">${esc(cx)}</text>
          <text x="180" y="108" class="k-lbl">${cx.startsWith("[Cu(OH)") || cx.includes("(OH)₃(H₂O)₃") || cx.includes("(OH)₂(H₂O)₄") ? "neutral complex — insoluble, so a precipitate" : "complex ion in solution"}</text>
          <text x="180" y="130" class="k-lbl">shape: ${shape}${shape === OCT ? " (6 ligands, 90°)" : " (4 ligands, 109.5°)"}</text>
          ${ChemKit.lines(shape === TET ? "Tetrahedral splitting: three d orbitals higher, two lower. Large Cl⁻ ligands give coordination number 4." : "Octahedral splitting: two d orbitals higher, three lower. ΔE depends on the ligand, so ligand exchange changes the colour.", 70, 180, 158, 16)}</g>`;
        $(`#${TD}-scene`).innerHTML = s;
        status(r ? "Record what you see in exam wording" : "Choose a starting solution and a test");
        ctx.readout([["Solution", I.name], ["Test", lastTest || "—"]]);
      }
      function runTest(k, name){
        const I = IONS[ion];
        let r;
        if(k === "water"){
          if(!hclDone) return ctx.toast("Add concentrated HCl to a fresh sample first");
          r = ion === "cu" ? { obs:"yellow-green solution turns blue again", sol:I.sol, cx:I.cx, shape:OCT } : ion === "co" ? { obs:"blue solution turns pink again", sol:I.sol, cx:I.cx, shape:OCT }
            : ion === "fe3" ? { obs:"yellow solution turns pale yellow-brown again", sol:[225,180,90], cx:I.cx, shape:OCT } : { obs:"no significant change", sol:I.sol, cx:I.cx, shape:OCT };
        }else{
          r = I.t[k];
          if(r.na){ ctx.toast(r.na); return; }
        }
        hclDone = k === "hcl";
        lastTest = name;
        if(k === "hcl") ctx.toast("Fume cupboard, gloves, eye protection: concentrated HCl is corrosive");
        done.add(ion + ":" + k);
        if(done.size >= 6 && done.has("cu:nh3xs") && done.has("co:hcl")) ctx.complete("ligand");
        ctx.record({ part:"Ligand exchange", sample:I.name, test:name, obs:r.obs }, true);
        drawLx(r, `${I.name} + ${name}`);
      }

      /* ── colorimetry and Job's method ── */
      const unkC = Kit.round(.05 + Math.random()*.13, 4);
      let filt = "red", zero = {}, cSel = 6, cSample = "std", lastA = null, jSys = "fe", jV = 5, cuvette = null;
      const blank = { violet:.062, blue:.048, green:.041, yellow:.044, orange:.052, red:.057 };
      function jobConc(sys, V){
        const J = JOB[sys], a = J.stock*V/10, b = J.stock*(10 - V)/10;
        if(sys === "fe"){ const K = 140, S = a + b + 1/K, x = (S - Math.sqrt(S*S - 4*a*b))/2; return { cx:x, free:a - x }; }
        const x = Math.max(0, Math.min(a, b/3) - .004*Math.exp(-Math.pow((b - 3*a)/.06, 2)));
        return { cx:x, free:a - x };
      }
      function absorb(){
        let A;
        if(mode === "col") A = ABS.cu[filt]*(cSample === "std" ? .200*cSel/10 : unkC);
        else{ const q = jobConc(jSys, jV); A = jSys === "fe" ? ABS.fescn[filt]*q.cx + ABS.fe[filt]*q.free : ABS.nien[filt]*q.cx + ABS.ni[filt]*q.free; }
        return A + (zero[filt] ? 0 : blank[filt]) + ctx.gauss()*.003;
      }
      const cuCol = c => [Math.round(225 - 1000*c), Math.round(235 - 450*c), 240];
      function sampleCol(){
        if(mode === "col") return { c:cuCol(cSample === "std" ? .02*cSel : unkC), a:.25 + (cSample === "std" ? .02*cSel : unkC)*2.6 };
        const J = JOB[jSys], q = jobConc(jSys, jV), f = Math.min(1, q.cx/(jSys === "fe" ? .00012 : .05));
        return { c:ChemKit.mix(jSys === "fe" ? [235,215,150] : [140,200,150], J.col, f), a:.3 + .55*f };
      }
      function drawCol(){
        const F = FILTERS.find(f => f[0] === filt);
        // colour wheel
        let s = `<g transform="translate(150 150)">`;
        FILTERS.forEach((f, i) => { const a0 = (i*60 - 90)*Math.PI/180, a1 = ((i + 1)*60 - 90)*Math.PI/180, r = 82;
          s += `<path d="M0 0 L${r*Math.cos(a0)} ${r*Math.sin(a0)} A${r} ${r} 0 0 1 ${r*Math.cos(a1)} ${r*Math.sin(a1)} Z" fill="${rgb(f[2], .9)}" stroke="var(--bg2)" stroke-width="2"/>`;
          const am = (i*60 - 60)*Math.PI/180; s += `<text x="${58*Math.cos(am)}" y="${58*Math.sin(am) + 4}" text-anchor="middle" style="font:700 10px Inter;fill:#fff">${f[1]}</text>`; });
        s += `<circle r="22" fill="var(--bg2)"/></g>${ChemKit.lines("Colour wheel: a solution absorbs the colour opposite the one you see.", 34, 50, 262, 15)}`;
        // colorimeter
        const sc = sampleCol();
        s += `<g transform="translate(300 230)"><rect width="340" height="170" rx="16" fill="#2B3240" stroke="#4B5563"/>
          <rect x="34" y="-34" width="40" height="70" rx="4" fill="${cuvette ? rgb(sc.c, sc.a) : "rgba(210,225,240,.3)"}" stroke="#9AA3B2"/>
          <rect x="28" y="18" width="52" height="16" fill="#1F2937"/><text x="54" y="58" text-anchor="middle" style="font:600 9px Inter;fill:#CBD5E1">cuvette</text>
          <rect x="120" y="30" width="196" height="54" rx="6" fill="#132A1F"/><text x="300" y="68" text-anchor="end" class="k-lcd" style="font-size:24px">${lastA === null ? "—" : lastA.toFixed(3)}</text><text x="132" y="50" style="font:600 9px Inter;fill:#5FBF8A">A</text>
          <circle cx="54" cy="118" r="18" fill="${rgb(F[2], 1)}" stroke="#fff" stroke-width="2"/><text x="84" y="114" style="font:600 11px Inter;fill:#E5E7EB">filter: ${F[1].toLowerCase()}</text>
          <text x="84" y="132" style="font:500 10px Inter;fill:#CBD5E1">${zero[filt] ? "zeroed with distilled water ✓" : "NOT zeroed for this filter"}</text>
          <text x="170" y="158" text-anchor="middle" style="font:600 10px Inter;fill:#94A3B8">colorimeter · 1.00 cm path length</text></g>`;
        // rack of vials
        const vials = mode === "col" ? [2,4,6,8,10].map(v => ({ c:cuCol(.02*v), a:.25 + .02*v*2.6, l:(.02*v).toFixed(3) })).concat([{ c:cuCol(unkC), a:.25 + unkC*2.6, l:"FB 5" }])
          : [1,2,3,4,5,6,7,8,9].map(v => { const q = jobConc(jSys, v), f = Math.min(1, q.cx/(jSys === "fe" ? .00012 : .05)); return { c:ChemKit.mix(jSys === "fe" ? [235,215,150] : [140,200,150], JOB[jSys].col, f), a:.3 + .55*f, l:((10 - v)/10).toFixed(1) }; });
        vials.forEach((v, i) => { const x = 300 + i*(340/vials.length) + 6; s += `<rect x="${x}" y="412" width="22" height="40" rx="3" fill="${rgb(v.c, v.a)}" stroke="#9AA3B2"/><text x="${x + 11}" y="${mode === "col" ? 474 : 474}" text-anchor="middle" class="k-num">${v.l}</text>`; });
        s += `<text x="${mode === "col" ? 300 : 300}" y="492" class="k-lbl">${mode === "col" ? "standards / mol dm⁻³ and the unknown FB 5" : "mole fraction of ligand in each mixture"}</text>`;
        const lines = mode === "col"
          ? [`Stock: 0.200 mol dm⁻³ CuSO₄(aq).`, cSample === "std" ? `Standard: ${cSel.toFixed(1)} cm³ stock + ${(10 - cSel).toFixed(1)} cm³ water → ${(.02*cSel).toFixed(3)} mol dm⁻³` : "Unknown FB 5: CuSO₄(aq), concentration to find.", "Blue Cu²⁺(aq) absorbs red/orange light.", "Beer–Lambert: A = εcl, so A ∝ c."]
          : [`${JOB[jSys].M} and ${JOB[jSys].L}, both ${JOB[jSys].stock.toPrecision(3)} mol dm⁻³.`, `This mixture: ${jV} cm³ metal + ${10 - jV} cm³ ligand (total 10.0 cm³).`, `Mole fraction of ligand = ${((10 - jV)/10).toFixed(1)}.`, `Complex: ${JOB[jSys].cx}.`, "A is greatest where the ratio matches the formula."];
        s += card(680, 60, 265, mode === "col" ? "Calibration" : "Job's method", lines, 40);
        $(`#${TD}-scene`).innerHTML = s;
        status(!zero[filt] ? "Zero the colorimeter with distilled water" : !cuvette ? "Put a cuvette of the sample in the colorimeter" : "Read and record the absorbance");
        ctx.readout([["Filter", F[1]], ["Zeroed", zero[filt] ? "yes" : "no", zero[filt] ? "" : "warn"], ["A", lastA === null ? "—" : lastA.toFixed(3)]]);
      }

      /* ── iodometric titration ── */
      const BX = 180, Y0 = 60, PX = 6;
      const brass = { m:Kit.round(2.40 + Math.random()*.2, 2), P:Kit.round(56 + Math.random()*12, 1) };
      const Veq = Kit.round(brass.m*brass.P/100/63.5/10/.100*1000, 3);
      let r = null, initRead = null, flowing = false, TF = null;
      const freshT = () => ({ pip:false, ki:false, starch:false, early:false, added:0 });
      TF = freshT();
      const veff = () => Veq + (TF.early ? .25 : 0);
      function flaskState(){
        if(!TF.pip) return null;
        if(!TF.ki) return { col:"rgba(120,175,235,.5)", name:"pale blue solution", ppt:false };
        const g = 1 - TF.added/veff();
        if(TF.starch) return g > 0 ? { col:`rgba(25,25,70,${.4 + .5*Math.min(1, g*12)})`, name:"blue-black", ppt:true } : { col:"rgba(235,228,212,.55)", name:"white ppt. in a colourless solution (blue-black gone)", ppt:true };
        if(g <= 0) return { col:"rgba(235,228,212,.5)", name:"white ppt. in a colourless solution", ppt:true };
        const c = ChemKit.mix([246,236,170], [140,70,20], Math.min(1, g*1.6));
        return { col:`rgba(${c},${.35 + .55*Math.min(1, g*3)})`, name:g > .45 ? "white ppt. in a brown solution" : g > .12 ? "white ppt. in a yellow-brown solution" : "white ppt. in a pale yellow (straw) solution", ppt:true };
      }
      let ticks = "";
      for(let v = 0; v <= 50; v++){ const y = Y0 + v*PX; ticks += `<line x1="${BX - 10}" y1="${y}" x2="${BX - 10 + (v % 5 ? 4 : 8)}" y2="${y}" stroke="var(--txt2)" stroke-width=".8"/>${v % 10 ? "" : `<text x="${BX - 14}" y="${y + 3.5}" text-anchor="end" class="k-num">${v}</text>`}`; }
      function drawTit(){
        const fs = flaskState(), FL = ChemKit.FLASK(BX, 455, 1);
        const vol = TF.pip ? 25 + (TF.ki ? 10 : 0) + TF.added : 0, lvl = 450 - vol*.42;
        let s = `<rect x="80" y="450" width="160" height="10" rx="3" fill="url(#k-metal)"/><rect x="92" y="40" width="9" height="415" rx="3" fill="url(#k-metal)"/><rect x="92" y="160" width="${BX - 100}" height="8" rx="3" fill="url(#k-metal)"/>`;
        if(r !== null && r < 50) s += `<rect x="${BX - 9}" y="${Y0 + r*PX}" width="18" height="${362 - Y0 - r*PX}" fill="rgba(210,225,240,.45)" clip-path="url(#${TD}-bur)"/>`;
        s += `<rect x="${BX - 10}" y="50" width="20" height="312" rx="3" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/>${ticks}
          <path d="M${BX - 4} 362 L${BX - 2} 398 H${BX + 2} L${BX + 4} 362" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.3"/>
          <rect x="${BX - 14}" y="366" width="28" height="10" rx="4" fill="${flowing ? "var(--accent)" : "#3B4A63"}"/>`;
        if(fs){ s += `<g clip-path="url(#${TD}-fl)"><rect x="${BX - 70}" y="${lvl}" width="140" height="${460 - lvl}" fill="${fs.col}"/>`;
          if(fs.ppt) for(let i = 0; i < 40; i++){ const a = ((i*73) % 97)/97, b = ((i*41) % 89)/89; s += `<circle cx="${BX - 55 + b*110}" cy="${451 - a*(451 - lvl - 6)*.6}" r="${1.3 + a*1.5}" fill="#F1EADB" stroke="rgba(0,0,0,.15)" stroke-width=".4"/>`; }
          s += `</g>`; }
        s += `<path d="${FL}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
        s += r === null ? `<g transform="translate(430 200)"><circle r="85" fill="var(--bg-card)" stroke="var(--brd2)" stroke-dasharray="5 4"/><text text-anchor="middle" y="4" class="k-lbl">fill the burette</text></g>`
          : ChemKit.lens({ id:`${TD}-l`, cx:430, cy:200, r:85, S:60, value:Math.min(r, 50.6), minor:.1, major:1, half:.5, down:true, liquid:"rgba(200,215,235,.6)", label:"magnifier on the meniscus (eye level)" })
            + `<line x1="${BX + 12}" y1="${Y0 + Math.min(r, 50)*PX}" x2="345" y2="200" stroke="var(--accent)" stroke-dasharray="3 3"/>`;
        s += card(560, 60, 385, "Copper in brass", [
          `${brass.m.toFixed(2)} g of brass dissolved in conc. HNO₃ (fume cupboard), neutralised, acidified with ethanoic acid and made up to 250.0 cm³ (FB 6).`,
          `Burette: 0.100 mol dm⁻³ Na₂S₂O₃(aq).`,
          `Flask: ${TF.pip ? "25.0 cm³ FB 6" : "empty"}${TF.ki ? " + 10 cm³ KI(aq) (excess)" : ""}${TF.starch ? " + starch" : ""}`,
          `Colour: ${fs ? fs.name : "—"}`,
          `Initial reading entered: ${initRead === null ? "—" : initRead.toFixed(2) + " cm³"}`,
          "2Cu²⁺ + 4I⁻ → 2CuI + I₂ · I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻"], 62);
        $(`#${TD}-scene`).innerHTML = s;
        status(r === null ? "Fill the burette with thiosulfate" : !TF.pip ? "Pipette 25.0 cm³ of FB 6 into the flask" : !TF.ki ? "Add excess KI(aq)" : initRead === null ? "Enter the initial burette reading" : "Titrate; add starch when pale yellow");
        ctx.readout([["Flask", fs ? fs.name : "empty"], ["Added", TF.added.toFixed(2) + " cm³"]]);
      }
      function add(v){
        if(r === null){ ctx.toast("Fill the burette first"); return false; }
        if(!TF.pip){ ctx.toast("Pipette FB 6 into the flask first"); return false; }
        if(initRead === null){ ctx.toast("Enter the initial burette reading first"); return false; }
        if(r + v > 50.6){ ctx.toast("The burette is empty — refill it"); return false; }
        if(!TF.ki && TF.added === 0) ctx.toast("No KI added: thiosulfate does not react with Cu²⁺ here");
        r += v; TF.added = Kit.round(TF.added + v, 4); return true;
      }

      /* ── planning sketch ── */
      function drawPlan(){
        let s = `<g transform="translate(40 45)"><rect width="430" height="300" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="16" y="26" class="k-tag">Predicted calibration graph</text>
          <line x1="60" y1="250" x2="400" y2="250" stroke="var(--txt2)"/><line x1="60" y1="250" x2="60" y2="50" stroke="var(--txt2)"/>
          <line x1="60" y1="250" x2="380" y2="70" stroke="var(--accent)" stroke-width="3"/><text x="230" y="282" text-anchor="middle" class="k-lbl">[Cu²⁺] / mol dm⁻³</text><text x="68" y="50" class="k-lbl">A</text>
          <text x="200" y="210" class="k-lbl">straight line through the origin</text><text x="200" y="226" class="k-lbl">(Beer–Lambert, red filter)</text></g>
          <g transform="translate(500 45)"><rect width="430" height="300" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="16" y="26" class="k-tag">Predicted Job's plot for ML₃</text>
          <line x1="50" y1="250" x2="400" y2="250" stroke="var(--txt2)"/><line x1="50" y1="250" x2="50" y2="50" stroke="var(--txt2)"/>
          <path d="M50 250 L312 80 L400 250" fill="none" stroke="var(--accent)" stroke-width="3"/><line x1="312" y1="80" x2="312" y2="250" stroke="var(--txt3)" stroke-dasharray="4 4"/>
          <text x="312" y="268" text-anchor="middle" class="k-num">0.75</text><text x="225" y="290" text-anchor="middle" class="k-lbl">mole fraction of ligand</text><text x="58" y="50" class="k-lbl">A</text></g>`;
        s += card(40, 360, 890, "Plan outline", ["Independent: concentration of standard (or mole fraction). Dependent: absorbance. Control: filter, cuvette, path length, temperature, total volume; zero with distilled water each time the filter changes."], 140);
        $(`#${TD}-scene`).innerHTML = s;
        status("Paper 5: plan and predict");
        ctx.readout([["Part", "Planning"]]);
      }

      const draw = () => mode === "lx" ? drawLx(lastTest ? null : null) : mode === "tit" ? drawTit() : mode === "plan" ? drawPlan() : drawCol();
      ctx.frame(dt => { if(mode === "tit" && flowing){ if(!add(1.6*dt)) flowing = false; drawTit(); } });

      /* ── controls ── */
      const boxes = {};
      ctx.seg({ label:"Part", value:mode, options:[["lx","Ligand exchange"],["col","Colorimetry"],["job","Job's method"],["tit","Iodometry"],["plan","Plan"]], onChange(v){ mode = v; lastA = null; cuvette = null; flowing = false; sync(); } });
      ["lx", "col", "job", "tit", "plan"].forEach(k => boxes[k] = ctx.html(`<div></div>`));
      function sync(){ Object.keys(boxes).forEach(k => boxes[k].style.display = k === mode ? "" : "none"); if(mode === "lx"){ lastTest = null; drawLx(null); } else draw(); }

      // ligand exchange
      ctx.seg({ label:"Fresh sample of", value:ion, options:Object.keys(IONS).map(k => [k, IONS[k].name]), onChange(v){ ion = v; hclDone = false; lastTest = null; drawLx(null); }, parent:boxes.lx });
      const grid = ctx.html(`<div class="ctl" style="display:grid;gap:.35rem"></div>`, boxes.lx);
      TESTS.forEach(([k, name]) => { const b = ctx.el(`<button type="button" class="btn small" style="justify-content:flex-start;border-radius:10px;text-align:left">${esc(name)}</button>`); b.onclick = () => runTest(k, name); grid.appendChild(b); });
      const idb = ctx.html(`<div class="ctl"><div class="lbl"><span>Name the complex</span></div><div class="hint" data-q style="color:var(--txt);font-size:.85rem;margin-bottom:.4rem"></div>
        <div style="display:flex;gap:.4rem;margin-bottom:.4rem"><select class="inp" data-s="cx" aria-label="Formula"><option value="">Formula…</option>${ALLCX.map(c => `<option>${esc(c)}</option>`).join("")}</select>
        <select class="inp" data-s="sh" aria-label="Shape"><option value="">Shape…</option><option>linear</option><option>square planar</option><option>tetrahedral</option><option>octahedral</option></select></div>
        <div class="btns"><button class="btn small primary" type="button" data-a="c">Check</button><button class="btn small" type="button" data-a="n">New question</button></div><div data-fb style="margin-top:.4rem"></div></div>`, boxes.lx);
      function newPrompt(){
        let p; do{ p = PROMPTS[Math.floor(Math.random()*PROMPTS.length)]; }while(prompt && p === prompt); prompt = p;
        const I = IONS[p[0]], t = TESTS.find(x => x[0] === p[1]);
        idb.querySelector("[data-q]").textContent = p[1] === "start" ? `The complex in ${I.name} before any reagent is added.` : `The complex formed when ${I.name} reacts with ${t[1].replace(" (fume cupboard)", "").replace("Concentrated", "concentrated")}.`;
        idb.querySelectorAll("select").forEach(s => s.value = ""); idb.querySelector("[data-fb]").innerHTML = "";
      }
      idb.querySelector("[data-a=n]").onclick = newPrompt;
      idb.querySelector("[data-a=c]").onclick = () => {
        const cx = idb.querySelector("[data-s=cx]").value, sh = idb.querySelector("[data-s=sh]").value, fb = idb.querySelector("[data-fb]");
        if(!cx || !sh) return fb.innerHTML = `<div class="note bad">Choose a formula and a shape.</div>`;
        const I = IONS[prompt[0]], want = prompt[1] === "start" ? { cx:I.cx, shape:I.shape } : I.t[prompt[1]];
        const ok = cx === want.cx && sh === want.shape;
        if(ok && ++pr.n >= 3) ctx.complete("ident");
        fb.innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${ok ? `Correct (${pr.n} so far): ${esc(want.cx)}, ${want.shape}.` : `Formula ${cx === want.cx ? "✓" : "✗"} · shape ${sh === want.shape ? "✓" : "✗"}. Count the ligands: 6 → octahedral, 4 large Cl⁻ → tetrahedral.`}</div>`;
      };
      newPrompt();

      // colorimetry
      const filterSeg = parent => ctx.seg({ label:"Filter", value:filt, options:FILTERS.map(f => [f[0], f[1]]), onChange(v){ filt = v; lastA = null; draw(); syncFilt(v); }, parent });
      const fsegs = [];
      const syncFilt = v => fsegs.forEach(s => s.set(v));
      fsegs.push(filterSeg(boxes.col));
      ctx.seg({ label:"Sample", value:"std", options:[["std","Standard"],["unk","Unknown FB 5"]], onChange(v){ cSample = v; cuvette = null; lastA = null; draw(); }, parent:boxes.col });
      ctx.seg({ label:"Volume of 0.200 mol dm⁻³ stock made up to 10.0 cm³", value:cSel, options:[[2,"2.0"],[4,"4.0"],[6,"6.0"],[8,"8.0"],[10,"10.0"]], onChange(v){ cSel = v; cuvette = null; lastA = null; draw(); }, parent:boxes.col });
      const colBtns = parent => ctx.buttons([
        { label:"Zero with distilled water", onClick(){ zero[filt] = true; lastA = 0; cuvette = null; ctx.toast("Blank cuvette of distilled water: A set to 0.000"); draw(); } },
        { label:"Insert sample & read", primary:true, onClick(){ cuvette = true; lastA = Kit.round(Math.max(0, absorb()), 3); draw(); } }
      ], parent);
      colBtns(boxes.col);
      ctx.buttons([{ label:"Record this absorbance", block:true, onClick(){
        if(!cuvette || lastA === null) return ctx.toast("Insert the sample and read it first");
        const F = FILTERS.find(f => f[0] === filt)[1].toLowerCase(), z = zero[filt] ? "zeroed" : "not zeroed";
        if(cSample === "std") ctx.record({ part:"Calibration (" + F + ")", sample:`standard ${(.02*cSel).toFixed(3)}`, test:F, obs:z, c:Kit.round(.02*cSel, 3), A:lastA });
        else ctx.record({ part:"Unknown FB 5", sample:"FB 5", test:F, obs:z, A:lastA });
        const red = ctx.rows().filter(q => q.part === "Calibration (red)" && q.obs === "zeroed");
        if(new Set(red.map(q => q.c)).size >= 5) ctx.complete("calib");
      } }], boxes.col);
      Kit.answer(ctx, "[Cu²⁺] in FB 5 from your calibration line / mol dm⁻³", "e.g. 0.115", v => {
        const u = ctx.rows().filter(q => q.part === "Unknown FB 5").pop(); if(!u) return [false, "Record the absorbance of FB 5 first."];
        const pts = ctx.rows().filter(q => q.part === "Calibration (" + u.test + ")").map(q => [q.c, q.A]);
        if(new Set(pts.map(p => p[0])).size < 3) return [false, `Record at least three standards with the ${u.test} filter (the same filter as FB 5).`];
        const f = ctx.linFit(pts), est = (u.A - f.c)/f.m;
        if(Math.abs(v - est) <= .04*est + .002){ ctx.complete("unknown"); return [true, `Correct from your line: c = (A − intercept) ÷ gradient = (${u.A} ${f.c < 0 ? "+ " + (-f.c).toFixed(3) : "− " + f.c.toFixed(3)}) ÷ ${f.m.toFixed(2)} = ${est.toFixed(3)} mol dm⁻³. Hidden value: ${unkC.toFixed(3)} mol dm⁻³.${u.test !== "red" ? " A red filter would give a steeper line and a more precise answer." : ""}`]; }
        return [false, "Read across from the absorbance of FB 5 to your calibration line and down to the concentration axis (or use c = (A − intercept) ÷ gradient)."];
      }, boxes.col);

      // Job's method
      ctx.seg({ label:"Metal–ligand pair", value:jSys, options:[["fe","Fe³⁺ + SCN⁻"],["ni","Ni²⁺ + en"]], onChange(v){ jSys = v; cuvette = null; lastA = null; draw(); }, parent:boxes.job });
      fsegs.push(filterSeg(boxes.job));
      ctx.slider({ label:"Volume of metal solution (ligand = 10.0 − this)", min:.5, max:9.5, step:.5, value:jV, unit:"cm³", fmt:v => v.toFixed(1), onInput(v){ jV = v; cuvette = null; lastA = null; draw(); }, parent:boxes.job });
      colBtns(boxes.job);
      ctx.buttons([{ label:"Record this absorbance", block:true, onClick(){
        if(!cuvette || lastA === null) return ctx.toast("Insert the sample and read it first");
        if(!zero[filt]) ctx.toast("The colorimeter was not zeroed for this filter");
        const F = FILTERS.find(f => f[0] === filt)[1].toLowerCase();
        ctx.record({ part:"Job: " + JOB[jSys].name, sample:`${jV} cm³ M + ${10 - jV} cm³ L`, test:F, obs:zero[filt] ? "zeroed" : "not zeroed", xf:Kit.round((10 - jV)/10, 2), A:lastA });
      } }], boxes.job);
      Kit.answer(ctx, "n in the complex MLₙ (from the mole fraction at maximum A)", "e.g. 2", v => {
        const rows = ctx.rows().filter(q => q.part === "Job: " + JOB[jSys].name);
        if(new Set(rows.map(q => q.xf)).size < 7) return [false, `Record at least seven different mixtures for ${JOB[jSys].name}.`];
        const best = rows.reduce((a, b) => b.A > a.A ? b : a), J = JOB[jSys];
        if(v === J.n){ ctx.complete("job"); return [true, `Correct: A peaks near a ligand mole fraction of ${(J.n/(J.n + 1)).toFixed(2)} (your highest reading was at ${best.xf}), so ligand : metal = ${J.n} : 1 → ${J.cx}.${jSys === "fe" ? " The peak is rounded because Kstab for [Fe(SCN)]²⁺ is small, so the complex is only partly formed." : ""}`]; }
        return [false, "If the peak is at mole fraction x of ligand, then n = x ÷ (1 − x)."];
      }, boxes.job);

      // iodometry
      ctx.buttons([
        { label:"Fill burette", onClick(){ r = Kit.round(.1 + Math.random()*1.6, 3); initRead = null; rb1.clear(); drawTit(); } },
        { label:"Pipette 25.0 cm³ FB 6", onClick(){ if(TF.pip && TF.added === 0) return ctx.toast("The flask already has 25.0 cm³ in it"); TF = freshT(); TF.pip = true; drawTit(); } }
      ], boxes.tit);
      ctx.buttons([
        { label:"Add 10 cm³ KI(aq)", onClick(){ if(!TF.pip) return ctx.toast("Pipette FB 6 first"); TF.ki = true; drawTit(); } },
        { label:"Add starch", onClick(){ if(!TF.pip || TF.starch) return; TF.starch = true; const g = 1 - TF.added/Veq;
          if(TF.ki && g >= .25){ TF.early = true; ctx.toast("Starch added too early — the blue-black colour will be slow to clear"); } drawTit(); } }
      ], boxes.tit);
      ctx.html(`<div class="ctl"><div class="lbl"><span>Burette tap</span></div></div>`, boxes.tit);
      ctx.buttons([{ label:"+1.00 cm³", onClick:() => { add(1); drawTit(); } }, { label:"+0.10", onClick:() => { add(.1); drawTit(); } }, { label:"1 drop", onClick:() => { add(.05); drawTit(); } }], boxes.tit);
      const hold = ctx.buttons([{ label:"Hold to open tap", block:true, onClick(){} }], boxes.tit)[0];
      hold.addEventListener("pointerdown", e => { e.preventDefault(); flowing = true; }); ["pointerup","pointerleave","pointercancel"].forEach(ev => hold.addEventListener(ev, () => { flowing = false; drawTit(); })); hold.style.touchAction = "none";
      const rb1 = Kit.reading(ctx, "Initial burette reading / cm³ (2 d.p.)", "e.g. 0.85", () => mode !== "tit" || r === null || TF.added > 0 ? null : r, .05, v => { initRead = v; drawTit(); }, boxes.tit);
      const rb2 = Kit.reading(ctx, "Final burette reading / cm³ (2 d.p.)", "e.g. 24.30", () => mode !== "tit" || initRead === null || TF.added <= 0 ? null : r, .05, v => {
        const fs = flaskState();
        const mine = ctx.rows().filter(q => q.part === "Iodometry"), kind = mine.length ? "accurate" : "rough";
        if(!TF.ki) ctx.toast("No KI was added — this titre is meaningless");
        ctx.record({ part:"Iodometry", sample:"25.0 cm³ FB 6", test:kind + (TF.early ? ", starch early" : ""), obs:`${initRead.toFixed(2)} → ${v.toFixed(2)}; ${fs ? fs.name : ""}`, titre:Kit.round(v - initRead, 2) });
        rb1.clear(); rb2.clear(); initRead = null; TF = freshT();
        if(r > 40) ctx.toast("Refill the burette before the next titration");
        showConc(); drawTit();
      }, boxes.tit);
      function concordant(){
        const t = ctx.rows().filter(q => q.part === "Iodometry" && q.test.startsWith("accurate")).map(q => q.titre).sort((a, b) => a - b);
        let best = []; for(let i = 0; i < t.length; i++){ const set = t.filter(v => v >= t[i] && v - t[i] <= .10 + 1e-9); if(set.length > best.length) best = set; }
        return best.length >= 2 ? best : [];
      }
      const concBox = ctx.html(`<div class="ctl"><div class="hint" data-c></div></div>`, boxes.tit);
      function showConc(){ const c = concordant(); concBox.querySelector("[data-c]").innerHTML = c.length ? `Concordant titres: ${c.map(v => v.toFixed(2)).join(", ")} → mean <b>${Kit.mean(c).toFixed(2)} cm³</b>` : "Accurate titres within 0.10 cm³ of each other are concordant; average only those."; }
      Kit.answer(ctx, "Percentage by mass of copper in the brass / %", "e.g. 62", v => {
        const c = concordant(); if(!c.length) return [false, "Get two concordant accurate titres first."];
        const t = Kit.mean(c), want = .100*t/1000*10*63.5/brass.m*100;
        if(Math.abs(v - want)/want <= .015){ ctx.complete("iodo"); return [true, `Correct: n(S₂O₃²⁻) = 0.100 × ${t.toFixed(2)}/1000 = n(Cu²⁺) in 25.0 cm³; ×10 for 250 cm³; × 63.5 ÷ ${brass.m.toFixed(2)} × 100 = ${want.toFixed(1)}%. Hidden value: ${brass.P}%.`]; }
        return [false, "n(Cu²⁺) = n(S₂O₃²⁻) = 0.100 × titre ÷ 1000. Multiply by 10 (250 cm³ ÷ 25.0 cm³), then by 63.5, divide by the mass of brass, × 100."];
      }, boxes.tit);
      Kit.answer(ctx, "Percentage uncertainty in your last accurate titre / %", "e.g. 0.4", v => {
        const a = ctx.rows().filter(q => q.part === "Iodometry" && q.test.startsWith("accurate")).pop(); if(!a) return [false, "Record an accurate titre first."];
        const p = ChemKit.pct(.10, a.titre);
        if(Math.abs(v - p) <= .03*p + .01) return [true, `Correct: ±0.10 cm³ (two readings of ±0.05) ÷ ${a.titre.toFixed(2)} × 100 = ${p.toFixed(2)}%.`];
        return [false, "Each burette reading is ±0.05 cm³ and a titre uses two readings."];
      }, boxes.tit);

      // plan
      quiz(ctx, "Paper 5 planning questions", [
        { q:"Which filter should be used to measure the concentration of blue Cu²⁺(aq)?", opts:["Blue","Green","Red","Violet"], a:2, why:"Blue solutions absorb red/orange light most strongly, so a red filter gives the steepest calibration line." },
        { q:"Why is the colorimeter zeroed with distilled water in the same cuvette?", opts:["To warm up the lamp","So the absorbance of the cuvette and solvent is subtracted","To calibrate the concentration scale","To remove air bubbles"], a:1, why:"Only absorbance due to the coloured species is then measured." },
        { q:"In the calibration, the dependent variable is…", opts:["the concentration of each standard","the absorbance","the filter colour","the volume of water added"], a:1, why:"You set the concentration and measure A." },
        { q:"In Job's method, which condition is essential?", opts:["The metal solution is ten times more concentrated than the ligand","Metal and ligand solutions have equal concentrations and the total volume is constant","Only the metal solution is measured","The temperature is varied"], a:1, why:"Then mole fraction is set by volume alone, and A depends only on how much complex forms." },
        { q:"In the iodometric titration, when should starch be added?", opts:["Before adding KI","At the very start of the titration","When the solution is pale yellow (straw), near the end-point","After the end-point"], a:2, why:"Too much I₂ with starch forms a complex that releases iodine slowly, giving a late end-point." },
        { q:"Concentrated hydrochloric acid is added to Co²⁺(aq). The best precaution is…", opts:["Use a water bath","Work in a fume cupboard, with gloves and eye protection","No naked flames","Use a face mask for dust"], a:1, why:"Concentrated HCl gives off corrosive HCl gas." },
        { q:"The predicted calibration graph is…", opts:["A curve rising to a maximum","A straight line through the origin","A horizontal line","A straight line with negative gradient"], a:1, why:"Beer–Lambert: A = εcl, so A ∝ c at fixed path length." }
      ], () => ctx.complete("plan"), boxes.plan);
      sync();
    }
  });
})();
