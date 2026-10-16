"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMISTRY · IGCSE (0620) — part 5
   Tests for gases, water, alkenes, acids & alkalis, reactions of dilute
   acids, oxidising & reducing agents ·
   Empirical formula by experiment (MgO, copper oxide, hydrated CuSO₄)
══════════════════════════════════════════════════════════════════ */

/* small shared helpers for this file */
const IG5 = (function(){
  const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random()*(i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  /* a row of selects with a Check button and feedback */
  function checker(ctx, label, groups, onCheck, parent){
    const box = ctx.html(`<div class="ctl"><div class="lbl"><span>${ctx.esc(label)}</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px">${groups.map(([nm, opts], i) => `<select class="inp" data-i="${i}" aria-label="${ctx.esc(nm)}" style="flex:1 1 120px;min-width:0"><option value="">${ctx.esc(nm)}…</option>${opts.map(o => `<option value="${ctx.esc(Array.isArray(o) ? o[0] : o)}">${ctx.esc(Array.isArray(o) ? o[1] : o)}</option>`).join("")}</select>`).join("")}</div>
      <div class="btns"><button class="btn small primary" type="button">Check</button></div><div style="margin-top:6px" data-fb></div></div>`, parent);
    const fb = box.querySelector("[data-fb]"), sels = [...box.querySelectorAll("select")];
    box.querySelector("button").onclick = () => {
      const v = sels.map(s => s.value);
      if(v.some(x => !x)){ fb.innerHTML = `<div class="note bad">Make a choice in every box.</div>`; return; }
      const [ok, msg] = onCheck(v); fb.innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${msg}</div>`;
    };
    return { box, sels, clear(){ fb.innerHTML = ""; } };
  }
  const card = (x, y, w, h, title, body) => `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>${title ? `<text x="14" y="24" class="k-tag">${title}</text>` : ""}${body || ""}</g>`;
  const bunsen = (x, by, on, big) => `<g><rect x="${x - 7}" y="${by - 62}" width="14" height="56" fill="url(#k-metal)"/><rect x="${x - 24}" y="${by - 8}" width="48" height="8" rx="3" fill="url(#k-metal)"/>
    ${on ? `<path d="M${x} ${by - 62 - (big ? 70 : 46)} C${x - 16} ${by - 90} ${x - 12} ${by - 62} ${x - 6} ${by - 62} H${x + 6} C${x + 12} ${by - 62} ${x + 16} ${by - 90} ${x} ${by - 62 - (big ? 70 : 46)}Z" fill="${big ? "#4A7DFF" : "#FFB347"}" opacity=".85"/>` : ""}</g>`;
  return { shuffle, checker, card, bunsen };
})();

/* ───────────── TESTS FOR GASES, WATER, ALKENES, ACIDS · REDOX ───────────── */
(function(){
  const GAS = {
    H2:{ f:"H₂", n:"hydrogen" }, O2:{ f:"O₂", n:"oxygen" }, CO2:{ f:"CO₂", n:"carbon dioxide" },
    NH3:{ f:"NH₃", n:"ammonia" }, Cl2:{ f:"Cl₂", n:"chlorine", col:[200,215,90] }, SO2:{ f:"SO₂", n:"sulfur dioxide" }
  };
  const GT = { lit:"Lighted splint at the mouth", glow:"Glowing splint into the tube", lime:"Bubble through limewater", red:"Damp red litmus paper", blue:"Damp blue litmus paper", mno4:"Bubble through acidified KMnO₄(aq)" };
  function gasObs(g, t){
    switch(t){
      case "lit": return g === "H2" ? "lighted splint burns with a squeaky ‘pop’" : g === "O2" ? "splint burns more brightly" : "lighted splint goes out";
      case "glow": return g === "O2" ? "glowing splint relights" : "glowing splint goes out";
      case "lime": return g === "CO2" || g === "SO2" ? "limewater turns milky" : "no change";
      case "red": return g === "NH3" ? "damp red litmus paper turns blue" : g === "Cl2" ? "damp red litmus paper is bleached (turns white)" : "no change";
      case "blue": return g === "Cl2" ? "damp blue litmus paper turns red, then is bleached (white)" : g === "SO2" ? "damp blue litmus paper turns red" : g === "CO2" ? "damp blue litmus paper turns slightly red" : "no change";
      default: return g === "SO2" ? "acidified KMnO₄(aq) turns from purple to colourless" : "no change; stays purple";
    }
  }
  const LIQ = {
    dw:{ n:"distilled water", water:true, bp:100.0 }, salt:{ n:"aqueous sodium chloride", water:true, bp:101.0 },
    hex:{ n:"hexane", water:false, bp:69.0 }, prop:{ n:"propanone", water:false, bp:56.0 }
  };
  const SOLS = {
    hcl:{ f:"HCl", n:"hydrochloric acid", pH:1.0 }, eth:{ f:"CH₃COOH", n:"ethanoic acid", pH:2.9 }, h2o:{ f:"water", n:"distilled water", pH:7.0 },
    nacl:{ f:"NaCl", n:"sodium chloride", pH:7.0 }, naoh:{ f:"NaOH", n:"sodium hydroxide", pH:13.0 }, nh3:{ f:"NH₃", n:"aqueous ammonia", pH:11.1 }
  };
  const UI = [[200,20,40],[225,40,40],[235,70,40],[245,130,40],[245,180,40],[240,220,50],[190,220,60],[60,170,70],[40,160,130],[40,130,190],[40,90,200],[50,60,190],[90,50,170],[120,40,150],[110,30,120]];
  const IND = {
    ui:{ n:"universal indicator", col:p => { const i = Math.max(0, Math.min(14, p)), a = Math.floor(i), b = Math.min(14, a + 1); return [ChemKit.mix(UI[a], UI[b], i - a), p < 2.5 ? "red" : p < 4.5 ? "orange" : p < 6.5 ? "yellow" : p < 7.5 ? "green" : p < 10.5 ? "blue" : "purple"]; } },
    lit:{ n:"litmus solution", col:p => p < 5 ? [[214,60,70], "red"] : p > 8 ? [[60,100,200], "blue"] : [[130,80,160], "purple"] },
    mo:{ n:"methyl orange", col:p => p < 3.1 ? [[220,45,45], "red"] : p < 4.4 ? [[240,130,40], "orange"] : [[245,205,40], "yellow"] },
    tp:{ n:"thymolphthalein", col:p => p < 9.3 ? [null, "colourless"] : p < 10.5 ? [[120,160,230], "pale blue"] : [[40,80,200], "blue"] }
  };
  /* reactions of dilute acids (1.0 mol dm⁻³) */
  const ACIDS = { hcl:{ f:"dilute HCl", n:"hydrochloric acid" }, eth:{ f:"dilute CH₃COOH", n:"ethanoic acid" } };
  const AR = {
    mg:{ n:"Magnesium ribbon; test the gas with a lighted splint", obs:a => a === "hcl" ? "rapid effervescence; magnesium dissolves quickly; gas gives a squeaky ‘pop’ with a lighted splint (H₂)" : "slow effervescence; magnesium dissolves slowly; gas gives a squeaky ‘pop’ with a lighted splint (H₂)",
      eq:a => a === "hcl" ? "Mg + 2HCl → MgCl₂ + H₂" : "Mg + 2CH₃COOH → (CH₃COO)₂Mg + H₂" },
    caco3:{ n:"Calcium carbonate chips; bubble the gas through limewater", obs:a => a === "hcl" ? "rapid effervescence; chips dissolve; gas turns limewater milky (CO₂)" : "slow effervescence; gas turns limewater milky (CO₂)",
      eq:a => a === "hcl" ? "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂" : "CaCO₃ + 2CH₃COOH → (CH₃COO)₂Ca + H₂O + CO₂" },
    na2co3:{ n:"Sodium carbonate solution; bubble the gas through limewater", obs:a => a === "hcl" ? "effervescence; gas turns limewater milky (CO₂)" : "effervescence (less vigorous); gas turns limewater milky (CO₂)",
      eq:a => a === "hcl" ? "Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂" : "Na₂CO₃ + 2CH₃COOH → 2CH₃COONa + H₂O + CO₂" },
    cuo:{ n:"Copper(II) oxide, warm", obs:a => a === "hcl" ? "black solid dissolves on warming, giving a blue-green solution" : "black solid dissolves slowly on warming, giving a blue solution",
      eq:a => a === "hcl" ? "CuO + 2HCl → CuCl₂ + H₂O" : "CuO + 2CH₃COOH → (CH₃COO)₂Cu + H₂O" },
    naoh:{ n:"Sodium hydroxide with universal indicator", obs:a => a === "hcl" ? "indicator red → green at neutral → purple in excess NaOH; tube gets warm" : "indicator orange → green → purple in excess NaOH; tube gets warm",
      eq:a => a === "hcl" ? "NaOH + HCl → NaCl + H₂O" : "NaOH + CH₃COOH → CH₃COONa + H₂O" },
    ui:{ n:"Universal indicator (pH)", obs:a => a === "hcl" ? "universal indicator turns red (pH 0–1)" : "universal indicator turns orange (pH 2–3)", eq:() => "" }
  };
  /* oxidising and reducing agents */
  const RX = {
    fe:{ n:"aqueous iron(II) sulfate", sol:[195,225,190], k:"red" },
    so3:{ n:"aqueous sodium sulfite", sol:null, k:"red" },
    h2o2:{ n:"hydrogen peroxide", sol:null, k:"both" },
    cl2:{ n:"chlorine water", sol:[215,225,150], k:"ox" },
    cr:{ n:"acidified potassium dichromate(VI)", sol:[240,140,40], k:"ox" },
    w:{ n:"distilled water", sol:null, k:"none" }
  };
  const CLASS = [["ox","oxidising agent"],["red","reducing agent"],["both","both"],["none","neither"]];
  const RT = { mno4:"Acidified KMnO₄(aq), a few drops", ki:"Aqueous KI (acidified)", starch:"Aqueous KI, then starch" };
  function rxObs(k, t){
    const r = RX[k].k;
    if(t === "mno4") return r === "red" || r === "both" ? ["purple KMnO₄ turns colourless" + (k === "h2o2" ? "; effervescence (O₂)" : ""), null] : ["no change; stays purple", [130,40,140]];
    const ox = r === "ox" || r === "both";
    if(t === "ki") return ox ? ["colourless KI turns brown (iodine)", [150,80,25]] : ["no change", RX[k].sol];
    return ox ? ["colourless KI turns brown; with starch, blue-black", [25,25,70]] : ["no change; no blue-black colour", RX[k].sol];
  }

  Lab.register({
    id:"ig-tests", subject:"chemistry", level:["igcse"], topic:"Chemical analysis · Tests for gases, water & acids", interactive:true,
    title:"Tests for gases, water, alkenes and acids",
    summary:"The 0620 tests not covered by the salt lab: identify six unknown gases, test for water and its purity, reverse the hydration of copper(II) sulfate, tell an alkene from an alkane, use four indicators on strong and weak acids and alkalis, react dilute acids and classify oxidising and reducing agents.",
    aim:"Carry out the 0620 tests for gases, water, unsaturation, acidity and oxidising or reducing agents, record observations in the expected wording, and use them to identify unknowns.",
    variables:null,
    stageTitle:"Test bench", controlsTitle:"Tests",
    thumb:`<svg viewBox="0 0 300 140"><path d="M70 20 v90 a12 12 0 0 0 24 0 v-90" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M71 60 h22 v50 a11 11 0 0 1 -22 0z" fill="#E0334A"/>
      <path d="M140 20 v90 a12 12 0 0 0 24 0 v-90" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M141 60 h22 v50 a11 11 0 0 1 -22 0z" fill="#3C8F46"/>
      <path d="M210 20 v90 a12 12 0 0 0 24 0 v-90" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M211 60 h22 v50 a11 11 0 0 1 -22 0z" fill="#6A2E98"/><path d="M252 10 l-30 20" stroke="#C9A26B" stroke-width="5"/><circle cx="222" cy="30" r="5" fill="#FFB347"/></svg>`,
    challenges:[
      { id:"gases",  title:"Six gases", text:"Identify all six unknown gases A–F from your own test results." },
      { id:"water",  title:"Water and its purity", text:"Find which liquids contain water, then use boiling points to pick out the pure water." },
      { id:"rev",    title:"Reversible reaction", text:"Dehydrate blue copper(II) sulfate, show the liquid collected is water, then rehydrate the white solid." },
      { id:"alkene", title:"Alkene or alkane?", text:"Use bromine water to identify the alkene." },
      { id:"strong", title:"Strong or weak?", text:"Identify four unknown 0.10 mol dm⁻³ solutions: HCl, ethanoic acid, NaOH and ammonia." },
      { id:"acids",  title:"Reactions of dilute acids", text:"React both dilute acids with Mg, CaCO₃, Na₂CO₃, CuO and NaOH, then answer the strong–weak question." },
      { id:"redox",  title:"Oxidising or reducing?", text:"Classify all six unknowns R1–R6 as oxidising agent, reducing agent, both or neither." }
    ],
    columns:[{key:"sample",label:"Sample"},{key:"test",label:"Test / reagent"},{key:"obs",label:"Observation"},{key:"T",label:"Boiling point / °C",dp:1}],
    questions:[
      { q:"Describe the tests for hydrogen, oxygen and carbon dioxide.",
        a:"Hydrogen: a lighted splint burns with a squeaky ‘pop’. Oxygen: a glowing splint relights. Carbon dioxide: bubbled through limewater, it turns the limewater milky." },
      { q:"Gas X turns limewater milky. Why can you not be certain it is carbon dioxide, and what further test would you do?",
        a:"Sulfur dioxide also turns limewater milky. Bubble the gas through acidified aqueous potassium manganate(VII): SO₂ turns it from purple to colourless; CO₂ gives no change." },
      { q:"How do the tests for ammonia and chlorine differ, and what precaution is needed for both?",
        a:"Ammonia turns damp red litmus paper blue. Chlorine bleaches damp litmus paper (blue litmus turns red, then white). Both are toxic: use small amounts in a fume cupboard and never smell them directly." },
      { q:"Anhydrous copper(II) sulfate turns blue with a liquid. Does this show the liquid is pure water?",
        a:"No. It shows that water is present (any aqueous solution gives the same result). Pure water boils at exactly 100 °C (and freezes at 0 °C); dissolved substances raise the boiling point, and the temperature keeps rising slowly as the solution boils." },
      { q:"Write the equation for heating hydrated copper(II) sulfate and explain why the reaction is described as reversible.",
        a:"CuSO₄·5H₂O(s) ⇌ CuSO₄(s) + 5H₂O(l). Heating turns the blue crystals white and drives off water. Adding water to the white solid turns it blue again and gives out heat, so the reaction goes in both directions: endothermic forwards, exothermic backwards." },
      { q:"How does bromine water distinguish ethene from ethane? Why do alkanes not react in the same way?",
        a:"Ethene decolourises bromine water (orange to colourless) because Br₂ adds across the C=C double bond. Ethane is saturated (only C–C single bonds), so there is no change in the dark; it reacts only slowly by substitution in ultraviolet light." },
      { q:"Hydrochloric acid and ethanoic acid have the same concentration. Give two observations that show ethanoic acid is the weaker acid.",
        a:"Universal indicator is orange (pH about 3) rather than red (pH 1); magnesium ribbon or calcium carbonate effervesces more slowly. Ethanoic acid is only partly ionised in water, so the H⁺ concentration is lower." },
      { q:"How do you show a substance is a reducing agent or an oxidising agent?",
        a:"A reducing agent turns acidified aqueous potassium manganate(VII) from purple to colourless. An oxidising agent turns aqueous potassium iodide from colourless to brown (iodine), which gives a blue-black colour with starch. Hydrogen peroxide can do both." }
    ],
    setup(ctx){
      const LET = "ABCDEF", gasOrder = IG5.shuffle(Object.keys(GAS)), liqOrder = IG5.shuffle(Object.keys(LIQ)), LL = "PQRS";
      const alkOrder = IG5.shuffle(["hexane", "hex-1-ene"]), unkOrder = IG5.shuffle(["hcl", "eth", "naoh", "nh3"]), rxOrder = IG5.shuffle(Object.keys(RX));
      let mode = "gas", gi = 0, gt = "lit", G = null;
      let li = 0, wt = null, W = { T:20, heat:false, tb:0 }, wAnim = 0;
      const R = { w:1, heat:false, cond:0, dried:false, rehyd:false, tested:false, warm:0, T:20 };
      let ai = 0, A = [null, null];
      let phSet = "lab", indK = "ui", phInd = { lab:null, unk:null }, phMg = { lab:false, unk:false };
      let acid = "hcl", areag = "mg", AC = null, acidsDone = new Set();
      let ri = 0, rt = "mno4", RXc = null;
      const gasOk = new Set(), rxOk = new Set();

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="igt-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 460)}<g id="igt-scene"></g><text x="24" y="30" class="k-status" id="igt-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#igt-svg"), $ = s => svg.querySelector(s);
      const therm = Kit.thermometer("igt-th", 347, 110, 210, 0, 110, 10, true);
      const rgba = (c, a) => ChemKit.rgba(c, a);
      const mixA = (a, b, f) => a && b ? ChemKit.mix(a, b, f) : (f < .5 ? a : b);

      /* small stoppered tube for a rack */
      const smallTube = (x, y, col, lbl, on, open) => `<g>${on ? `<rect x="${x - 10}" y="${y - 14}" width="46" height="112" rx="8" fill="none" stroke="var(--accent)" stroke-width="2"/>` : ""}
        <path d="M${x} ${y} V${y + 66} a12 12 0 0 0 24 0 V${y}" fill="${col ? rgba(col, .35) : "rgba(210,225,240,.18)"}" stroke="var(--txt2)" stroke-width="1.3"/>
        ${open ? "" : `<rect x="${x - 2}" y="${y - 8}" width="28" height="12" rx="3" fill="#7A5A3A"/>`}<text x="${x + 12}" y="${y + 94}" text-anchor="middle" class="k-tag">${lbl}</text></g>`;
      const strip = (x, y, col) => `<rect x="${x}" y="${y}" width="14" height="48" rx="2" fill="rgb(${col})" stroke="rgba(0,0,0,.25)"/>`;
      const obsCard = (title, obs, extra) => IG5.card(560, 60, 380, 170, title, `<text x="14" y="50" class="k-lbl">Observation</text>${obs ? ChemKit.lines(obs, 46, 14, 74, 20, "k-numb") : `<text x="14" y="74" class="k-lbl">—</text>`}${extra || ""}`);
      const listCard = (y, h, title, items) => IG5.card(560, y, 380, h, title, items.slice(-Math.floor((h - 36)/18)).map((t, i) => `<text x="14" y="${48 + i*18}" class="k-lbl">${ctx.esc(t.length > 60 ? t.slice(0, 58) + "…" : t)}</text>`).join(""));
      const rowsFor = s => ctx.rows().filter(r => r.sample === s);

      function drawGas(){
        let s = "";
        gasOrder.forEach((g, i) => s += smallTube(60 + i*62, 70, GAS[g].col, LET[i], i === gi, false));
        const g = gasOrder[gi], f = G ? Math.min(1, G.t/1.6) : 0, col = GAS[g].col;
        s += ChemKit.tube({ id:"igt-g", x:150, y:250, sol:col || null, solA:col ? .38 : .12, fill:1, label:"gas " + LET[gi] });
        if(G){
          if(G.k === "lit" || G.k === "glow"){
            s += `<line x1="320" y1="180" x2="172" y2="252" stroke="#C9A26B" stroke-width="6" stroke-linecap="round"/>`;
            const tip = (sc, colr) => `<path d="M172 ${252 - 26*sc} C${160} ${248 - 8*sc} ${164} 258 172 258 C180 258 184 ${248 - 8*sc} 172 ${252 - 26*sc}Z" fill="${colr}" opacity=".9"/>`;
            if(G.k === "lit"){
              if(g === "H2"){ if(f < .35) s += tip(1, "#FFB347"); else if(f < .8) s += `<path d="M172 222 l8 18 l18 -6 l-10 16 l16 10 l-20 2 l2 20 l-14 -14 l-14 14 l2 -20 l-20 -2 l16 -10 l-10 -16 l18 6z" fill="#FFE07A" stroke="#FF8A3D"/><text x="200" y="215" class="k-hint">pop!</text>`; }
              else if(g === "O2") s += tip(1 + f*.9, "#FFB347");
              else s += f < .5 ? tip(1 - f*2, "#FFB347") : `<path d="M172 250 q-6 -12 0 -24 q6 -12 0 -24" stroke="#9AA3B2" stroke-width="3" fill="none" opacity="${1 - f}"/>`;
            }else{
              if(g === "O2") s += f < .3 ? `<circle cx="172" cy="252" r="4" fill="#FF8A3D"/>` : tip(.6 + f*.6, "#FFB347");
              else s += `<circle cx="172" cy="252" r="4" fill="${f < .5 ? "#FF8A3D" : "#3B3B3B"}"/>`;
            }
          }else if(G.k === "red" || G.k === "blue"){
            const red = [214,60,70], blue = [60,100,200], white = [238,238,232], c0 = G.k === "red" ? red : blue;
            let c1 = c0;
            if(g === "NH3" && G.k === "red") c1 = mixA(red, blue, f);
            if(g === "Cl2") c1 = G.k === "red" ? mixA(red, white, f) : f < .5 ? mixA(blue, red, f*2) : mixA(red, white, (f - .5)*2);
            if((g === "SO2" || g === "CO2") && G.k === "blue") c1 = mixA(blue, red, g === "CO2" ? f*.45 : f);
            s += `<line x1="167" y1="200" x2="230" y2="160" stroke="#64748B" stroke-width="3"/>` + strip(160, 205, c1);
          }else{
            const lime = G.k === "lime", c0 = lime ? [225,232,238] : [120,25,130];
            const on = lime ? (g === "CO2" || g === "SO2") : g === "SO2";
            const c1 = on ? (lime ? [244,244,244] : [215,225,240]) : c0, a = lime ? (on ? .3 + .6*f : .3) : (on ? .85 - .7*f : .85);
            s += `<path d="M167 250 V215 H346 V270" fill="none" stroke="var(--txt2)" stroke-width="3"/>`;
            s += ChemKit.tube({ id:"igt-r", x:330, y:250, sol:mixA(c0, c1, f), solA:a, fill:.7, bubbles:f < 1, label:lime ? "limewater" : "acidified KMnO₄" });
          }
        }
        const obs = G && f > .55 ? gasObs(g, G.k) : null;
        s += obsCard(`Gas ${LET[gi]} · ${G ? GT[G.k] : "choose a test"}`, obs, col ? `<text x="14" y="150" class="k-lbl">Appearance: pale yellow-green gas</text>` : `<text x="14" y="150" class="k-lbl">Appearance: colourless gas</text>`);
        s += listCard(250, 190, `Results so far for gas ${LET[gi]}`, rowsFor("gas " + LET[gi]).map(r => r.test + ": " + r.obs));
        return [s, G ? "Watch the result, then record and identify the gas" : "Choose a gas and a test, then do the test"];
      }

      function drawWater(){
        let s = "";
        liqOrder.forEach((k, i) => s += smallTube(60 + i*70, 70, null, "liquid " + LL[i], i === li, true));
        const k = liqOrder[li], L = LIQ[k], f = Math.min(1, wAnim/1.2);
        let obs = null;
        if(wt === "cuso4"){
          s += `<path d="M120 380 h200 v40 h-200z" fill="#F4F4F2" stroke="#C9CCD3"/><ellipse cx="220" cy="392" rx="50" ry="10" fill="rgb(${L.water ? ChemKit.mix([240,240,236],[70,130,225], f) : [240,240,236]})"/>
            <path d="M260 300 l-30 70" stroke="#9AA3B2" stroke-width="4"/><text x="220" y="445" text-anchor="middle" class="k-lbl">anhydrous copper(II) sulfate on a spotting tile + a few drops</text>`;
          if(f > .5) obs = L.water ? "white anhydrous copper(II) sulfate turns blue" : "no change; stays white";
        }else if(wt === "cocl"){
          s += ChemKit.tube({ id:"igt-w", x:150, y:250, fill:.5, sol:null, solA:.15, label:"liquid " + LL[li] });
          s += `<line x1="167" y1="230" x2="240" y2="180" stroke="#64748B" stroke-width="3"/>` + strip(160, 330, L.water ? ChemKit.mix([60,100,200],[235,140,170], f) : [60,100,200]);
          if(f > .5) obs = L.water ? "blue cobalt(II) chloride paper turns pink" : "no change; stays blue";
        }else if(wt === "bp"){
          const boil = W.T >= L.bp - .05;
          s += `<path d="M290 460 V195 M290 205 H330" stroke="url(#k-metalv)" stroke-width="6" fill="none"/>`;
          s += ChemKit.tube({ id:"igt-b", x:330, y:170, fill:.5, sol:null, solA:.15, bubbles:boil, label:"" });
          s += IG5.bunsen(347, 460, W.heat, false) + therm.svg;
          s += ChemKit.lens({ id:"igt-l", cx:480, cy:250, r:70, S:20, value:W.T, minor:1, major:5, down:false, tube:6, flat:true, liquid:"#E0334A", label:"magnifier on the thermometer" })
            + `<line x1="355" y1="${110 + 210 - W.T/110*210}" x2="410" y2="250" stroke="var(--accent)" stroke-dasharray="3 3"/>`;
          obs = boil ? "the liquid is boiling" + (W.rate > .02 ? "; the temperature is still rising slowly" : "; the temperature stays constant") : W.heat ? "heating; not boiling yet" : null;
        }
        s += obsCard(`Liquid ${LL[li]} · ${wt === "cuso4" ? "anhydrous CuSO₄" : wt === "cocl" ? "cobalt(II) chloride paper" : wt === "bp" ? "boiling point" : "choose a test"}`, obs,
          `<text x="14" y="150" class="k-lbl">All four liquids are colourless.</text>`);
        s += listCard(250, 190, `Results so far for liquid ${LL[li]}`, rowsFor("liquid " + LL[li]).map(r => r.test + ": " + r.obs + (typeof r.T === "number" ? " " + r.T.toFixed(1) + " °C" : "")));
        return [s, wt === "bp" ? (W.heat ? "When it boils, read the thermometer and enter the boiling point" : "Heat the liquid (anti-bumping granules added)") : "Choose a liquid and a test for water"];
      }

      function drawRev(){
        const blue = [60,130,220], white = [240,240,236], col = ChemKit.mix(white, blue, R.w);
        let s = `<path d="M90 460 V250 M90 300 H132" stroke="url(#k-metalv)" stroke-width="6" fill="none"/><rect x="135" y="418" width="70" height="42" rx="3" fill="url(#k-wood)"/>
          <g transform="translate(0 40) rotate(6 230 260)"><path d="M140 274 h-6 a14 14 0 0 1 0 -28 H350" fill="none"/><rect x="122" y="261" width="80" height="12" rx="4" fill="rgb(${col})"/>
          <path d="M350 246 H136 a14 14 0 0 0 0 28 H350" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
          ${R.heat ? [0,1,2,3].map(i => `<circle cx="${290 + i*14}" cy="${250 + (i % 2)*4}" r="2" fill="rgba(140,180,230,.8)"/>`).join("") : ""}
          ${R.warm > 0 ? `<path d="M140 236 q-6 -10 0 -20 M165 236 q-6 -10 0 -20 M190 236 q-6 -10 0 -20" stroke="#FF8A3D" stroke-width="2" fill="none" opacity="${R.warm}"/>` : ""}</g>
          <path d="M352 312 H440 V330" fill="none" stroke="var(--txt2)" stroke-width="3"/>
          <path d="${ChemKit.BEAKER(395, 460, 92, 110)}" fill="rgba(200,225,245,.35)" stroke="var(--txt2)" stroke-width="1.4"/>
          ${[0,1,2].map(i => `<rect x="${402 + i*26}" y="${380 + (i % 2)*16}" width="16" height="14" rx="3" fill="rgba(240,248,255,.9)" stroke="#9AB"/>`).join("")}
          ${ChemKit.tube({ id:"igt-c", x:423, y:290, fill:.02 + R.cond*.22, sol:R.cond > 0 ? [200,220,240] : null, solA:.4 })}
          <text x="441" y="482" text-anchor="middle" class="k-lbl">cold water and ice</text>
          ${IG5.bunsen(170, 418, R.heat, false)}
          ${R.tested ? `<line x1="440" y1="330" x2="500" y2="270" stroke="#64748B" stroke-width="3"/>` + strip(433, 380, [235,140,170]) : ""}`;
        const obs = R.rehyd ? "white solid turns blue; the tube gets hot" : R.w < .05 ? "blue crystals have turned white; colourless liquid has collected in the cooled tube" : R.heat ? "blue crystals turning white; condensation forms near the mouth" : null;
        s += obsCard("Hydrated copper(II) sulfate", obs, `<text x="14" y="150" class="k-lbl">CuSO₄·5H₂O(s) ⇌ CuSO₄(s) + 5H₂O(l)</text>`);
        s += listCard(250, 190, "Results so far", rowsFor("CuSO₄ crystals").concat(rowsFor("liquid collected")).map(r => r.test + ": " + r.obs));
        return [s, R.dried ? (R.rehyd ? "Reversed! Test the collected liquid if you have not yet" : "Let it cool, then add water drop by drop") : "Heat the blue crystals gently"];
      }

      function drawAlk(){
        let s = `<rect x="360" y="330" width="44" height="80" rx="6" fill="rgba(235,140,40,.6)" stroke="var(--txt2)"/><rect x="368" y="318" width="28" height="12" fill="#7A5A3A"/><text x="382" y="430" text-anchor="middle" class="k-lbl">bromine water</text>`;
        let obs = null;
        alkOrder.forEach((k, i) => {
          const a = A[i], f = a === null ? 0 : Math.min(1, a/1.4), ene = k === "hex-1-ene";
          const o = { id:"igt-a" + i, x:130 + i*120, y:250, fill:.55, sol:null, solA:.15, label:"liquid " + "XY"[i] };
          if(a !== null){ if(ene){ o.sol = [235,140,40]; o.solA = .6*(1 - f); } else { o.sol = [240,215,150]; o.solA = .4; o.layer = [235,140,40]; } }
          s += ChemKit.tube(o);
          if(i === ai){ s += `<rect x="${118 + i*120}" y="236" width="58" height="210" rx="10" fill="none" stroke="var(--accent)" stroke-width="2"/>`;
            if(a !== null && f > .5) obs = ene ? "bromine water turns from orange to colourless" : "no change; stays orange (in the dark)"; }
        });
        s += obsCard(`Liquid ${"XY"[ai]} + bromine water, shaken`, obs, `<text x="14" y="150" class="k-lbl">One is hexane, C₆H₁₄; one is hex-1-ene, C₆H₁₂.</text>`);
        s += listCard(250, 190, "Results so far", rowsFor("liquid X").concat(rowsFor("liquid Y")).map(r => r.sample + ": " + r.obs));
        return [s, "Add bromine water to each liquid and shake"];
      }

      const phKeys = () => phSet === "lab" ? Object.keys(SOLS) : unkOrder;
      const phLabel = i => phSet === "lab" ? SOLS[phKeys()[i]].f : "U" + (i + 1);
      function drawPh(){
        let s = "";
        const ind = phInd[phSet];
        phKeys().forEach((k, i) => {
          const p = SOLS[k].pH, c = ind ? IND[ind].col(p)[0] : null, x = 60 + i*72;
          s += ChemKit.tube({ id:"igt-p" + i, x, y:200, fill:.5, sol:c, solA:c ? .78 : .15, bubbles:phMg[phSet] && k === "hcl", label:phLabel(i) });
          if(phMg[phSet]) s += `<rect x="${x + 8}" y="${360}" width="18" height="5" fill="#9AA3B2"/>` + (k === "eth" ? [0,1,2].map(j => `<circle cx="${x + 12 + j*5}" cy="${340 - j*22}" r="2" fill="none" stroke="var(--txt2)"><animate attributeName="cy" from="${355 - j*10}" to="${290}" dur="${2 + j*.4}s" repeatCount="indefinite"/></circle>`).join("") : "");
        });
        s += `<text x="${60 + phKeys().length*36}" y="440" text-anchor="middle" class="k-lbl">${phSet === "lab" ? "all solutions 0.10 mol dm⁻³ (water and NaCl are neutral)" : "unknowns U1–U4: HCl, CH₃COOH, NaOH, NH₃ — all 0.10 mol dm⁻³"}</text>`;
        let chart = "";
        for(let p = 0; p <= 14; p++) chart += `<rect x="${14 + p*23}" y="40" width="22" height="22" fill="rgb(${UI[p]})"/><text x="${25 + p*23}" y="76" text-anchor="middle" class="k-num">${p}</text>`;
        s += IG5.card(560, 60, 380, 92, "Universal indicator colour chart (pH)", chart);
        const obs = ind ? phKeys().map((k, i) => `${phLabel(i)}: ${IND[ind].col(SOLS[k].pH)[1]}`).join(" · ") : phMg[phSet] ? phKeys().map((k, i) => `${phLabel(i)}: ${k === "hcl" ? "rapid effervescence" : k === "eth" ? "slow effervescence" : "no change"}`).join(" · ") : null;
        s += IG5.card(560, 170, 380, 200, ind ? "With " + IND[ind].n : phMg[phSet] ? "With magnesium ribbon" : "Add an indicator", obs ? ChemKit.lines(obs, 48, 14, 50, 20, "k-numb") : `<text x="14" y="50" class="k-lbl">—</text>`);
        return [s, ind || phMg[phSet] ? "Compare the colours with the chart, then find the pH" : "Add an indicator to every tube"];
      }

      function drawAcid(){
        let s = "";
        const f = AC ? Math.min(1, AC.t/1.6) : 0, slow = acid === "eth", r = AC ? AC.r : areag;
        const tubeSol = r === "cuo" && AC ? mixA([230,235,240], acid === "hcl" ? [70,170,170] : [70,140,225], f) : r === "naoh" && AC ? (f < .5 ? mixA(acid === "hcl" ? UI[1] : UI[3], UI[7], f*2) : mixA(UI[7], UI[13], (f - .5)*2)) : r === "ui" && AC ? (acid === "hcl" ? UI[1] : UI[3]) : null;
        s += ChemKit.tube({ id:"igt-q", x:150, y:250, fill:.5, sol:tubeSol, solA:tubeSol ? .7 : .15, bubbles:AC && ["mg","caco3","na2co3"].includes(r) && f < 1 && !(slow && f > .7), label:ACIDS[acid].f });
        if(AC && r === "mg") s += `<rect x="158" y="${392 - 20*(1 - f*(slow ? .3 : .9))}" width="18" height="${20*(1 - f*(slow ? .3 : .9))}" fill="#9AA3B2"/>`;
        if(AC && r === "caco3") s += [0,1,2].map(i => `<rect x="${156 + i*8}" y="${388 - i*4}" width="${9 - f*(slow ? 2 : 5)}" height="${8 - f*(slow ? 2 : 4)}" rx="2" fill="#EDEBE4" stroke="#B9B4A8"/>`).join("");
        if(AC && r === "cuo" && f < .9) s += `<ellipse cx="167" cy="392" rx="${12*(1 - f)}" ry="${4*(1 - f)}" fill="#1E1E1E"/>`;
        if(AC && r === "cuo") s += IG5.bunsen(167, 460, f < 1, false);
        if(AC && (r === "caco3" || r === "na2co3")){ s += `<path d="M167 250 V215 H346 V270" fill="none" stroke="var(--txt2)" stroke-width="3"/>` + ChemKit.tube({ id:"igt-lw", x:330, y:250, sol:[240,242,244], solA:.3 + .6*f, fill:.7, bubbles:f < 1, label:"limewater" }); }
        if(AC && r === "mg" && f > .5) s += `<line x1="320" y1="180" x2="172" y2="248" stroke="#C9A26B" stroke-width="6" stroke-linecap="round"/>` + (f < .8 ? `<text x="186" y="236" class="k-hint">pop!</text>` : "");
        const obs = AC && f > .55 ? AR[r].obs(acid) : null;
        s += obsCard(`${ACIDS[acid].f} (1.0 mol dm⁻³) + ${AC ? AR[r].n.split(";")[0].split(",")[0].toLowerCase() : "…"}`, obs, AC && AR[r].eq(acid) ? `<text x="14" y="158" class="k-lbl">${AR[r].eq(acid)}</text>` : "");
        s += listCard(250, 190, "Results so far", ctx.rows().filter(x => x.sample === ACIDS.hcl.f || x.sample === ACIDS.eth.f).map(x => x.sample.replace("dilute ", "") + " + " + x.test.split(";")[0].split(",")[0] + ": " + x.obs));
        return [s, "Choose an acid and a reagent; compare hydrochloric and ethanoic acid"];
      }

      function drawRedox(){
        let s = "";
        rxOrder.forEach((k, i) => s += smallTube(60 + i*62, 70, RX[k].sol, "R" + (i + 1), i === ri, true));
        const k = rxOrder[ri], f = RXc ? Math.min(1, RXc.t/1.4) : 0;
        let sol = RX[k].sol, sa = sol ? .5 : .15, obs = null;
        if(RXc){
          const [o, end] = rxObs(k, RXc.k);
          const start = RXc.k === "mno4" ? [130,40,140] : (RX[k].sol || [230,235,240]);
          sol = mixA(start, end || [230,235,240], f); sa = end ? .75 : .15 + (1 - f)*.5;
          if(f > .55) obs = o;
          s += `<rect x="330" y="320" width="40" height="80" rx="6" fill="${RXc.k === "mno4" ? "rgba(130,40,140,.75)" : "rgba(220,230,240,.4)"}" stroke="var(--txt2)"/><text x="350" y="420" text-anchor="middle" class="k-lbl">${RXc.k === "mno4" ? "KMnO₄ / H⁺" : "KI(aq)"}</text>`;
        }
        s += ChemKit.tube({ id:"igt-x", x:150, y:250, fill:.5, sol, solA:sa, bubbles:RXc && k === "h2o2" && RXc.k === "mno4" && f < 1, label:"R" + (ri + 1) });
        s += obsCard(`R${ri + 1} · ${RXc ? RT[RXc.k] : "choose a test"}`, obs, `<text x="14" y="150" class="k-lbl">Appearance of R${ri + 1}: ${RX[k].sol ? (k === "fe" ? "pale green solution" : k === "cr" ? "orange solution" : "pale yellow-green solution") : "colourless"}</text>`);
        s += listCard(250, 190, `Results so far for R${ri + 1}`, rowsFor("R" + (ri + 1)).map(r => r.test + ": " + r.obs));
        return [s, "Test each unknown with KMnO₄ and with KI, then classify it"];
      }

      function draw(){
        const [s, st] = mode === "gas" ? drawGas() : mode === "water" ? drawWater() : mode === "rev" ? drawRev() : mode === "alk" ? drawAlk() : mode === "ph" ? drawPh() : mode === "acid" ? drawAcid() : drawRedox();
        $("#igt-scene").innerHTML = s;
        if(mode === "water" && wt === "bp") therm.set(svg, W.T);
        $("#igt-status").textContent = st;
      }

      let tick = 0;
      ctx.frame(dt => {
        let busy = false;
        if(G && G.t < 1.7){ G.t += dt; busy = true; }
        if(AC && AC.t < 1.7){ AC.t += dt; busy = true; }
        if(RXc && RXc.t < 1.5){ RXc.t += dt; busy = true; }
        if(wAnim < 1.3 && wt && wt !== "bp"){ wAnim += dt; busy = true; }
        A.forEach((a, i) => { if(a !== null && a < 1.5){ A[i] += dt; busy = true; } });
        const L = LIQ[liqOrder[li]];
        if(W.heat){
          const T0 = W.T;
          if(W.T < L.bp - .05) W.T = Math.min(L.bp, W.T + (L.bp + 4 - W.T)*.4*dt);
          else { W.tb += dt; const target = L.bp + (liqOrder[li] === "salt" ? Math.min(1.2, W.tb*.04) : 0); W.T = target; }
          W.rate = (W.T - T0)/Math.max(dt, 1e-3); busy = true;
        }else if(W.T > 20.5){ W.T -= (W.T - 20)*.1*dt; W.rate = 0; busy = true; }
        if(R.heat){ R.w = Math.max(0, R.w - dt*.12); R.cond = Math.min(1, R.cond + dt*.1); if(R.w < .03){ R.w = 0; if(!R.dried){ R.dried = true; ctx.record({ sample:"CuSO₄ crystals", test:"heat gently", obs:"blue crystals turn white; condensation; colourless liquid collects", T:"" }, true); } } busy = true; }
        if(R.warm > 0){ R.warm = Math.max(0, R.warm - dt*.15); busy = true; }
        if(R.rehydT !== undefined && R.w < 1){ R.w = Math.min(1, R.w + dt*.8); busy = true; }
        tick += dt;
        if(busy || tick > .5){ tick = 0; draw(); }
        ctx.readout(mode === "water" && wt === "bp" ? [["Liquid", LL[li]], ["Burner", W.heat ? "on" : "off"]] : [["Section", MODES.find(m => m[0] === mode)[1]]]);
      });

      /* ── controls ── */
      const MODES = [["gas","Gases"],["water","Water"],["rev","CuSO₄ ⇌"],["alk","Alkenes"],["ph","Indicators"],["acid","Acid reactions"],["redox","Redox"]];
      const P = {};
      ctx.select({ label:"Section", value:mode, options:MODES.map(([k, n]) => [k, { gas:"Tests for gases", water:"Tests for water and purity", rev:"Hydrated CuSO₄: a reversible reaction", alk:"Alkane or alkene: bromine water", ph:"Indicators: strong and weak acids/alkalis", acid:"Reactions of dilute acids", redox:"Oxidising and reducing agents" }[k]]),
        onChange(v){ mode = v; Object.keys(P).forEach(k => P[k].style.display = k === mode ? "" : "none"); draw(); } });
      MODES.forEach(([k]) => P[k] = ctx.html(`<div></div>`));

      /* gases */
      ctx.select({ parent:P.gas, label:"Gas sample", value:"0", options:[...LET].map((l, i) => [String(i), "Gas " + l]), onChange(v){ gi = +v; G = null; draw(); } });
      ctx.select({ parent:P.gas, label:"Test", value:gt, options:Object.keys(GT).map(k => [k, GT[k]]), onChange(v){ gt = v; } });
      ctx.buttons([{ label:"Do the test", primary:true, block:true, onClick(){
        G = { k:gt, t:0 }; ctx.record({ sample:"gas " + LET[gi], test:GT[gt], obs:gasObs(gasOrder[gi], gt), T:"" }, true);
      } }], P.gas);
      IG5.checker(ctx, "Identify the gas sample", [["Sample", [...LET].map((l, i) => [String(i), "Gas " + l])], ["Gas", Object.keys(GAS).map(k => [k, GAS[k].n + " (" + GAS[k].f + ")"])]], ([i, g]) => {
        i = +i; if(!rowsFor("gas " + LET[i]).length) return [false, `Test gas ${LET[i]} before you identify it.`];
        if(gasOrder[i] !== g) return [false, `Not ${GAS[g].n}. Compare all your results for gas ${LET[i]} with the expected tests.`];
        gasOk.add(i); if(gasOk.size === 6) ctx.complete("gases");
        return [true, `Correct: gas ${LET[i]} is ${GAS[g].n}. ${gasOk.size}/6 identified.`];
      }, P.gas);

      /* water */
      ctx.select({ parent:P.water, label:"Liquid", value:"0", options:[...LL].map((l, i) => [String(i), "Liquid " + l]), onChange(v){ li = +v; W = { T:20, heat:false, tb:0, rate:0 }; wt = null; hb.textContent = "Heat to boiling"; draw(); } });
      ctx.buttons([
        { label:"Anhydrous CuSO₄", onClick(){ wt = "cuso4"; wAnim = 0; ctx.record({ sample:"liquid " + LL[li], test:"anhydrous CuSO₄", obs:LIQ[liqOrder[li]].water ? "white → blue" : "no change; stays white", T:"" }, true); draw(); } },
        { label:"Cobalt(II) chloride paper", onClick(){ wt = "cocl"; wAnim = 0; ctx.record({ sample:"liquid " + LL[li], test:"cobalt(II) chloride paper", obs:LIQ[liqOrder[li]].water ? "blue → pink" : "no change; stays blue", T:"" }, true); draw(); } }
      ], P.water);
      const [hb] = ctx.buttons([{ label:"Heat to boiling", block:true, onClick(){ wt = "bp"; W.heat = !W.heat; if(W.heat) W.tb = 0; hb.textContent = W.heat ? "Stop heating" : "Heat to boiling"; draw(); } }], P.water);
      Kit.reading(ctx, "Thermometer reading while boiling / °C (to 0.5 °C)", "e.g. 78.5", () => wt === "bp" && W.heat && W.T >= LIQ[liqOrder[li]].bp - .05 ? W.T : null, .5, v => {
        ctx.record({ sample:"liquid " + LL[li], test:"boiling point", obs:W.rate > .02 ? "boils; temperature still rising" : "boils; temperature constant", T:Kit.round(v, 1) });
      }, P.water);
      IG5.checker(ctx, "Which liquid is pure water?", [["Liquid", [...LL].map((l, i) => [String(i), "Liquid " + l])]], ([i]) => {
        i = +i; const k = liqOrder[i];
        if(k !== "dw") return [false, LIQ[k].water ? "That liquid contains water, but check its boiling point: pure water boils at exactly 100 °C and stays constant." : "That liquid does not contain water — look at your anhydrous CuSO₄ or cobalt chloride results."];
        const rs = rowsFor("liquid " + LL[i]), bp = rs.find(r => r.test === "boiling point"), wtest = rs.some(r => /CuSO₄|cobalt/.test(r.test));
        if(!bp || !wtest) return [false, "Right liquid — but prove it: test it for water and measure its boiling point."];
        ctx.complete("water"); return [true, `Correct: liquid ${LL[i]} contains water and boils at ${bp.T.toFixed(1)} °C, a constant temperature, so it is pure.`];
      }, P.water);

      /* reversible */
      ctx.buttons([
        { label:"Heat the crystals", primary:true, onClick(){ if(R.rehyd){ Object.assign(R, { w:1, cond:0, dried:false, rehyd:false, tested:false, warm:0 }); delete R.rehydT; } R.heat = true; draw(); } },
        { label:"Stop heating", onClick(){ R.heat = false; draw(); } }
      ], P.rev);
      ctx.buttons([
        { label:"Add water drop by drop", block:true, onClick(){
          if(R.heat) return ctx.toast("Stop heating and let the tube cool first");
          if(R.w > .5) return ctx.toast("The crystals are still blue — heat them first");
          R.rehydT = 0; R.rehyd = true; R.warm = 1; ctx.record({ sample:"CuSO₄ crystals", test:"add water to the white solid", obs:"white solid turns blue; tube gets hot", T:"" }, true);
          if(R.dried && R.tested) ctx.complete("rev"); draw(); } },
        { label:"Test the collected liquid with cobalt(II) chloride paper", block:true, onClick(){
          if(R.cond < .2) return ctx.toast("Not enough liquid has collected yet");
          R.tested = true; ctx.record({ sample:"liquid collected", test:"cobalt(II) chloride paper", obs:"blue → pink: the liquid is water", T:"" }, true);
          if(R.dried && R.rehyd) ctx.complete("rev"); draw(); } }
      ], P.rev);

      /* alkenes */
      ctx.seg({ parent:P.alk, label:"Tube", value:0, options:[[0,"Liquid X"],[1,"Liquid Y"]], onChange(v){ ai = v; draw(); } });
      ctx.buttons([{ label:"Add bromine water and shake", primary:true, block:true, onClick(){
        if(A[ai] !== null) return ctx.toast("Already tested — look at the result");
        A[ai] = 0; ctx.record({ sample:"liquid " + "XY"[ai], test:"bromine water, shake", obs:alkOrder[ai] === "hex-1-ene" ? "orange → colourless" : "no change; stays orange", T:"" }, true); draw();
      } }, { label:"Fresh tubes", block:true, onClick(){ A = [null, null]; draw(); } }], P.alk);
      IG5.checker(ctx, "Which liquid is the alkene?", [["Liquid", [["0","Liquid X"],["1","Liquid Y"]]]], ([i]) => {
        if(A[0] === null || A[1] === null) return [false, "Test both liquids with bromine water first."];
        if(alkOrder[+i] !== "hex-1-ene") return [false, "No — that one did not decolourise bromine water."];
        ctx.complete("alkene"); return [true, `Correct: liquid ${"XY"[+i]} is hex-1-ene. Br₂ adds across the C=C bond: C₆H₁₂ + Br₂ → C₆H₁₂Br₂.`];
      }, P.alk);

      /* indicators */
      ctx.seg({ parent:P.ph, label:"Tubes", value:phSet, options:[["lab","Labelled set"],["unk","Unknowns U1–U4"]], onChange(v){ phSet = v; draw(); refillTubes(); } });
      ctx.select({ parent:P.ph, label:"Indicator or reagent", value:indK, options:Object.keys(IND).map(k => [k, IND[k].n]).concat([["mg","magnesium ribbon"]]), onChange(v){ indK = v; } });
      ctx.buttons([{ label:"Add to every tube", primary:true, onClick(){
        if(indK === "mg"){ phMg[phSet] = true; phInd[phSet] = null; } else { phInd[phSet] = indK; phMg[phSet] = false; }
        phKeys().forEach((k, i) => ctx.record({ sample:phSet === "lab" ? SOLS[k].f + " (0.10)" : "U" + (i + 1), test:indK === "mg" ? "magnesium ribbon" : IND[indK].n, obs:indK === "mg" ? (k === "hcl" ? "rapid effervescence" : k === "eth" ? "slow effervescence" : "no change") : IND[indK].col(SOLS[k].pH)[1], T:"" }, true));
        ctx.toast("Results recorded"); draw();
      } }, { label:"Wash out the tubes", onClick(){ phInd[phSet] = null; phMg[phSet] = false; draw(); } }], P.ph);
      const tubeSel = ctx.select({ parent:P.ph, label:"Tube to read against the chart", value:"0", options:[] });
      function refillTubes(){ tubeSel.input.innerHTML = phKeys().map((k, i) => `<option value="${i}">${ctx.esc(phLabel(i))}</option>`).join(""); }
      refillTubes();
      Kit.answer(ctx, "pH of that tube from the universal indicator chart", "e.g. 3", v => {
        if(phInd[phSet] !== "ui") return [false, "Add universal indicator to the tubes first."];
        const p = SOLS[phKeys()[+tubeSel.get()]].pH;
        if(Math.abs(v - p) <= 1.01) return [true, `Good match: the pH is about ${Math.round(p)}.`];
        return [false, "Compare the tube with the chart again."];
      }, P.ph);
      IG5.checker(ctx, "Identify the unknowns", [0,1,2,3].map(i => ["U" + (i + 1), [["hcl","HCl"],["eth","ethanoic acid"],["naoh","NaOH"],["nh3","ammonia"]]]), v => {
        if(!ctx.rows().some(r => /^U\d/.test(r.sample))) return [false, "Test the unknowns first (switch to Unknowns U1–U4)."];
        const wrong = v.map((k, i) => k === unkOrder[i] ? null : "U" + (i + 1)).filter(Boolean);
        if(wrong.length) return [false, `Check ${wrong.join(", ")}. At the same concentration a strong acid has a lower pH than a weak acid, and a strong alkali a higher pH than a weak alkali.`];
        ctx.complete("strong"); return [true, "All correct. HCl (pH 1) and NaOH (pH 13) are fully ionised; ethanoic acid (pH ≈ 3) and ammonia (pH ≈ 11) are only partly ionised."];
      }, P.ph);

      /* acid reactions */
      ctx.seg({ parent:P.acid, label:"Dilute acid (1.0 mol dm⁻³)", value:acid, options:[["hcl","hydrochloric"],["eth","ethanoic"]], onChange(v){ acid = v; AC = null; draw(); } });
      ctx.select({ parent:P.acid, label:"Add", value:areag, options:Object.keys(AR).map(k => [k, AR[k].n]), onChange(v){ areag = v; } });
      ctx.buttons([{ label:"Do it", primary:true, block:true, onClick(){
        AC = { r:areag, t:0 }; acidsDone.add(acid + areag);
        ctx.record({ sample:ACIDS[acid].f, test:AR[areag].n, obs:AR[areag].obs(acid), T:"" }, true); draw();
      } }], P.acid);
      IG5.checker(ctx, "Why does ethanoic acid react more slowly?", [["Reason", [["a","it is more dilute"],["b","it is partly ionised, so [H⁺] is lower"],["c","it is an alkali"],["d","its molecules are larger"]]]], ([v]) => {
        const need = ["mg","caco3","na2co3","cuo","naoh"].every(r => acidsDone.has("hcl" + r) && acidsDone.has("eth" + r));
        if(v !== "b") return [false, "Both acids have the same concentration. Think about how much each acid ionises in water."];
        if(!need) return [true, "Correct. Now react both acids with all five reagents to complete the challenge."];
        ctx.complete("acids"); return [true, "Correct: ethanoic acid is a weak acid, only partly ionised (CH₃COOH ⇌ CH₃COO⁻ + H⁺), so the H⁺ concentration is lower and reactions are slower. It still gives the same products."];
      }, P.acid);

      /* redox */
      ctx.select({ parent:P.redox, label:"Unknown", value:"0", options:rxOrder.map((k, i) => [String(i), "R" + (i + 1)]), onChange(v){ ri = +v; RXc = null; draw(); } });
      ctx.select({ parent:P.redox, label:"Test", value:rt, options:Object.keys(RT).map(k => [k, RT[k]]), onChange(v){ rt = v; } });
      ctx.buttons([{ label:"Do the test", primary:true, block:true, onClick(){
        RXc = { k:rt, t:0 }; ctx.record({ sample:"R" + (ri + 1), test:RT[rt], obs:rxObs(rxOrder[ri], rt)[0], T:"" }, true); draw();
      } }], P.redox);
      IG5.checker(ctx, "Classify an unknown", [["Unknown", rxOrder.map((k, i) => [String(i), "R" + (i + 1)])], ["It is", CLASS]], ([i, c]) => {
        i = +i; const rs = rowsFor("R" + (i + 1));
        if(!rs.some(r => /KMnO/.test(r.test)) || !rs.some(r => /KI/.test(r.test))) return [false, `Test R${i + 1} with both acidified KMnO₄ and KI first.`];
        if(RX[rxOrder[i]].k !== c) return [false, "Not quite. Decolourising KMnO₄ shows a reducing agent; turning KI brown shows an oxidising agent."];
        rxOk.add(i); if(rxOk.size === 6) ctx.complete("redox");
        return [true, `Correct: R${i + 1} is ${RX[rxOrder[i]].n} — ${CLASS.find(x => x[0] === c)[1]}. ${rxOk.size}/6 classified.`];
      }, P.redox);

      Object.keys(P).forEach(k => P[k].style.display = k === mode ? "" : "none");
      draw();
    }
  });
})();

/* ───────────── EMPIRICAL FORMULA BY EXPERIMENT ───────────── */
(function(){
  const AR_ = { Mg:24.31, O:16.00, Cu:63.55, H2O:18.02, CuSO4:159.6 };
  const KIND = { mg:"Mg → MgO", cu:"Copper oxide → Cu", hyd:"CuSO₄·xH₂O" };
  const FORMS = {
    mg:[["MgO","MgO"],["Mg2O","Mg₂O"],["MgO2","MgO₂"],["Mg3O2","Mg₃O₂"]],
    cu:[["CuO","CuO"],["Cu2O","Cu₂O"],["CuO2","CuO₂"],["Cu3O2","Cu₃O₂"]],
    hyd:[["5","CuSO₄·5H₂O"],["3","CuSO₄·3H₂O"],["7","CuSO₄·7H₂O"],["1","CuSO₄·H₂O"]]
  };
  Lab.register({
    id:"ig-empirical", subject:"chemistry", level:["igcse"], topic:"Stoichiometry · Empirical formulae", interactive:true,
    title:"Empirical formula by experiment",
    summary:"Burn magnesium in a crucible to constant mass, reduce copper oxide in a stream of hydrogen or methane, and drive the water out of hydrated copper(II) sulfate. Weigh, work out mole ratios and plot mass of oxygen against mass of magnesium.",
    aim:"Use mass changes on heating to find the mole ratio of the elements (or of salt to water) and hence an empirical formula, and use a graph of several runs to find the combining ratio.",
    variables:{ iv:"Mass of magnesium used (length of ribbon)", dv:"Mass of oxygen that combines (g)", cv:["Same crucible and lid","Heat to constant mass","Cool before weighing","Same balance"] },
    stageTitle:"Crucible, combustion tube and balance", controlsTitle:"Procedure",
    thumb:`<svg viewBox="0 0 300 140"><path d="M110 50 h60 l-8 40 h-44 z" fill="#E7E2D8" stroke="#A2ACBD" stroke-width="2"/><path d="M106 44 h68 v6 h-68z" fill="#E7E2D8" stroke="#A2ACBD" transform="rotate(-10 140 47)"/><circle cx="140" cy="70" r="12" fill="#fff" opacity=".9"/><path d="M138 130 q2 -30 4 0" fill="#4A7DFF"/><path d="M200 110 l20 -16 l20 -12 l20 -10" stroke="#FF8A3D" stroke-width="3" fill="none"/><circle cx="200" cy="110" r="3" fill="#FF8A3D"/><circle cx="220" cy="94" r="3" fill="#FF8A3D"/><circle cx="240" cy="82" r="3" fill="#FF8A3D"/></svg>`,
    challenges:[
      { id:"mgo",   title:"Magnesium oxide", text:"Burn magnesium to constant mass and deduce the formula MgO from your own masses." },
      { id:"graph", title:"Combining ratio", text:"Plot mass of O against mass of Mg for at least three runs and find the gradient." },
      { id:"cu",    title:"Copper oxide", text:"Reduce copper oxide to copper and find its formula." },
      { id:"safe",  title:"Safe reduction", text:"Complete a reduction safely: flush the air out and test a sample before lighting, and cool the copper in the gas stream." },
      { id:"hyd",   title:"Water of crystallisation", text:"Heat hydrated copper(II) sulfate to constant mass and find x in CuSO₄·xH₂O." },
      { id:"unc",   title:"Uncertainty", text:"Calculate the percentage uncertainty in your mass of magnesium." },
      { id:"err",   title:"Spot the errors", text:"Find two sources of error: smoke escaping, weighing while hot, or letting hot copper meet air." }
    ],
    columns:[{key:"kind",label:"Experiment"},{key:"run",label:"Run"},{key:"step",label:"Weighing"},{key:"mass",label:"Mass / g",dp:2},
      {key:"m1",label:"Mass of Mg, Cu or anhydrous CuSO₄ / g",dp:2},{key:"m2",label:"Mass of O or H₂O / g",dp:2},{key:"note",label:"Note"}],
    series:"kind",
    graph:{ x:["m1"], y:["m2"], fit:"linear" },
    questions:[
      { q:"Why is the crucible lid lifted from time to time while the magnesium is heated, rather than left on or taken off?",
        a:"Lifting the lid lets in oxygen (air) so the magnesium can burn completely. Leaving it off lets white smoke of magnesium oxide escape, so the mass gained is too small; leaving it on starves the magnesium of oxygen." },
      { q:"Why is the crucible heated, cooled and reweighed until the mass is constant?",
        a:"Constant mass shows the reaction is complete: all the magnesium has reacted (or all the water has been driven off, or all the oxide reduced)." },
      { q:"Some magnesium reacts with nitrogen in the air to form magnesium nitride, Mg₃N₂. How does this affect the result, and how can it be corrected?",
        a:"Nitride gains less mass per gram of magnesium than oxide, so the mass of ‘oxygen’ is too small and the O:Mg ratio comes out below 1. Adding a few drops of water converts Mg₃N₂ to Mg(OH)₂ (ammonia is given off); reheating turns this into MgO." },
      { q:"0.24 g of magnesium gives 0.40 g of magnesium oxide. Find the empirical formula.",
        a:"Mass of O = 0.16 g. n(Mg) = 0.24 ÷ 24 = 0.010 mol; n(O) = 0.16 ÷ 16 = 0.010 mol. Ratio 1 : 1, so MgO." },
      { q:"In the reduction of copper oxide, why must the air be flushed out before the excess gas is lit or the oxide heated, and how do you know it has been?",
        a:"A mixture of hydrogen (or methane) and air is explosive. Collect a test tube of the gas from the outlet and light it: a squeaky pop means air is still present; when it burns quietly the air has gone. This is done as a teacher demonstration behind a safety screen." },
      { q:"Why is the gas kept flowing while the copper cools?",
        a:"Hot copper would react with oxygen in the air and turn back into copper oxide, increasing the mass and making the mass of oxygen removed too small." },
      { q:"Why does a graph of mass of oxygen against mass of magnesium for several runs give a more reliable result than one run?",
        a:"The gradient uses all the results, so random errors in individual weighings average out and anomalous points (e.g. a run where smoke escaped) can be seen and ignored. A gradient of 0.66 ≈ 16.00 ÷ 24.31 means one O for every Mg." },
      { q:"A balance reads to 0.01 g. Suggest how to reduce the percentage uncertainty in the mass of magnesium.",
        a:"Each reading is ±0.005 g and a mass by difference uses two readings, so ±0.01 g. Use a longer piece of magnesium ribbon (a larger mass) or a balance reading to 0.001 g." }
    ],
    setup(ctx){
      const nextRun = () => Math.max(0, ...ctx.rows().map(r => +String(r.run).replace(/\D/g, "") || 0)) + 1;
      let mode = "mg", len = 30, lid = "lift", gas = "H2";
      let S, C, flash = 0, smoke = 0, pop = 0;
      const oxide = Math.random() < .3 ? "Cu2O" : "CuO";
      const errs = new Set();
      function markErr(k){ errs.add(k); if(errs.size >= 2) ctx.complete("err"); }
      function newCrucible(){
        S = { run:"Run " + nextRun(), kind:mode, cruc:Kit.round(16.5 + Math.random()*6, 3), m0:0, mg:0, mgo:0, n3:0, w:1, wet:false, hot:false, onBalance:true, heats:0, last:null, done:false, flashed:false };
      }
      function newBoat(){
        C = { run:"Run " + nextRun(), boat:Kit.round(6 + Math.random()*3, 3), m0:0, r:0, hot:false, gasOn:false, flushT:0, tested:false, lit:false, heats:0, unsafe:false, reox:false, last:null, done:false, onBalance:true };
      }
      newCrucible(); newBoat();
      const fracO = oxide === "CuO" ? AR_.O/(AR_.Cu + AR_.O) : AR_.O/(2*AR_.Cu + AR_.O);
      function massS(){
        if(!S.m0) return S.cruc;
        if(S.kind === "mg") return S.cruc + S.mg + S.mgo + S.n3;
        const n = S.m0/(AR_.CuSO4 + 5*AR_.H2O); return S.cruc + n*AR_.CuSO4 + n*5*AR_.H2O*S.w;
      }
      const massC = () => C.boat + (C.m0 ? C.m0*(1 - C.r*fracO) : 0);
      const reading = () => Kit.round((mode === "cu" ? massC() : massS()) - ((mode === "cu" ? C.hot : S.hot) ? .03 + Math.random()*.02 : 0), 2);

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="ige-svg"><defs>${Kit.DEFS}<radialGradient id="ige-glow"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>${Kit.bench(960, 460)}<g id="ige-scene"></g><text x="24" y="30" class="k-status" id="ige-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#ige-svg"), $ = s => svg.querySelector(s);

      function crucible(x, y){
        let inner = "";
        if(S.m0 && S.kind === "mg"){
          const f = S.mg/S.m0;
          inner += `<path d="M-30 ${38 - 4} h60 l-1 6 h-58z" fill="rgba(245,245,240,${Math.min(1, (S.mgo + S.n3)/S.m0)})"/>`;
          if(f > .01) inner += `<path d="M-22 30 c6 -14 12 14 18 0 s12 14 18 0 s10 14 8 2" fill="none" stroke="#9AA3B2" stroke-width="${2 + 2*f}" opacity="${.35 + .65*f}"/>`;
          if(S.n3 > .002) inner += `<circle cx="14" cy="34" r="3" fill="#E8DC9A"/>`;
        }
        if(S.m0 && S.kind === "hyd") inner += `<path d="M-32 18 h64 l-4 20 h-56 z" fill="rgb(${ChemKit.mix([240,240,236],[60,130,220], S.w)})"/>`;
        const lidSvg = lid === "on" || !S.hot && lid !== "off" ? `<path d="M-46 -6 h92 v6 h-92z" fill="#E7E2D8" stroke="#A39C8E"/>`
          : lid === "lift" ? `<path d="M-46 -6 h92 v6 h-92z" fill="#E7E2D8" stroke="#A39C8E" transform="translate(10 -22) rotate(-14)"/><path d="M60 -60 L30 -26" stroke="#64748B" stroke-width="3"/>` : "";
        return `<g transform="translate(${x} ${y})">${S.hot && flash > 0 ? `<circle cx="0" cy="20" r="${50 + 30*flash}" fill="url(#ige-glow)" opacity="${flash}"/>` : ""}
          <path d="M-40 0 h80 l-9 46 h-62 z" fill="${S.hot ? "#E9B98F" : "#E7E2D8"}" stroke="#A39C8E" stroke-width="2"/>${inner}${lidSvg}
          ${smoke > 0 ? [0,1,2].map(i => `<path d="M${-20 + i*20} -10 q-10 -20 0 -40 q10 -20 0 -40" stroke="rgba(240,240,240,${.7*smoke})" stroke-width="8" fill="none" stroke-linecap="round"/>`).join("") : ""}</g>`;
      }
      function drawCrucible(){
        let s = `<g transform="translate(250 0)"><path d="M-90 300 h180 M-80 300 l-24 160 M80 300 l24 160" stroke="url(#k-metalv)" stroke-width="7"/>
          <path d="M-50 300 L0 286 L50 300" stroke="#D8CFC0" stroke-width="5" fill="none"/></g>`;
        s += IG5.bunsen(250, 460, flame > 0, true);
        if(!S.onBalance) s += crucible(250, 254);
        s += ChemKit.balance(580, 300, S.onBalance ? reading() : 0.00, "two-decimal-place balance");
        if(S.onBalance) s += crucible(665, 268);
        if(S.kind === "mg" && lid === "off") s += `<text x="250" y="230" text-anchor="middle" class="k-hint">${S.hot ? "lid off: white smoke escaping" : "lid off"}</text>`;
        const contents = !S.m0 ? "none yet" : S.kind === "mg" ? (S.mg/S.m0 > .98 ? "coil of magnesium ribbon" : S.mg/S.m0 > .01 ? "grey ribbon and white ash" : "white powder (magnesium oxide)") : (S.w > .98 ? "blue crystals" : S.w > .02 ? "pale blue, partly white" : "white powder (anhydrous)");
        s += IG5.card(560, 60, 370, 170, `${S.run} · ${S.kind === "mg" ? "magnesium ribbon" : "hydrated copper(II) sulfate"}`,
          `<text x="14" y="50" class="k-lbl">heatings so far: ${S.heats} · crucible is ${S.hot ? "HOT" : "cool"}</text>
           <text x="14" y="72" class="k-lbl">contents: ${contents}</text>
           <text x="14" y="94" class="k-lbl">lid: ${lid === "on" ? "on" : lid === "lift" ? "lifted occasionally with tongs" : "off"}</text>
           ${S.last !== null ? `<text x="14" y="116" class="k-lbl">last recorded mass: ${S.last.toFixed(2)} g</text>` : ""}
           <text x="14" y="150" class="k-lbl">${S.kind === "mg" ? "2Mg(s) + O₂(g) → 2MgO(s)" : "CuSO₄·xH₂O(s) → CuSO₄(s) + xH₂O(g)"}</text>`);
        return [s, !S.m0 ? "Weigh the empty crucible and lid, then add the sample" : S.heats === 0 ? "Weigh the crucible with the sample, then heat it" : S.hot ? "Let the crucible cool before weighing" : "Weigh it — then heat again until the mass is constant"];
      }
      function drawTube(){
        const black = oxide === "CuO" ? [30,30,30] : [150,50,35], cu = [196,110,70], col = ChemKit.mix(black, cu, C.r);
        let s = `<path d="M60 250 H110" stroke="#5B6B7F" stroke-width="8" fill="none"/>
          <rect x="20" y="150" width="44" height="120" rx="10" fill="${gas === "H2" ? "#C0392B" : "#6B7486"}" opacity=".8"/><text x="42" y="290" text-anchor="middle" class="k-lbl">${gas === "H2" ? "H₂ cylinder" : "gas tap (CH₄)"}</text>
          <text x="42" y="140" text-anchor="middle" class="k-tag">${C.gasOn ? "gas ON" : "gas off"}</text>
          <path d="M110 236 H470 a14 14 0 0 1 0 28 H110 z" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
          <circle cx="440" cy="236" r="3" fill="var(--bg2)" stroke="var(--txt2)"/>`;
        if(!C.onBalance){
          s += `<path d="M230 248 h80 l-6 12 h-68z" fill="#F0EDE6" stroke="#B9B4A8"/>${C.m0 ? `<path d="M238 248 h64 l-2 5 h-60z" fill="rgb(${col})"/>` : ""}`;
          if(C.hot) s += `<rect x="226" y="240" width="88" height="26" rx="6" fill="#FF8A3D" opacity=".18"/>`;
        }
        if(C.gasOn && C.lit) s += `<path d="M440 210 C432 222 434 232 440 233 C446 232 448 222 440 210Z" fill="${gas === "H2" ? "#9CC3FF" : "#4A7DFF"}" opacity=".9"/>`;
        if(pop > 0) s += `<text x="470" y="200" class="k-hint">${C.tested ? "burns quietly" : "squeaky pop!"}</text>`;
        if(C.gasOn && C.r > 0 && C.r < .99 && flame > 0) s += [0,1,2].map(i => `<circle cx="${380 + i*22}" cy="${242 + (i % 2)*6}" r="2" fill="rgba(140,180,230,.8)"/>`).join("");
        s += IG5.bunsen(270, 360, flame > 0, true) + `<rect x="235" y="360" width="70" height="100" fill="url(#k-wood)"/>`;
        s += ChemKit.balance(580, 300, C.onBalance ? reading() : 0.00, "two-decimal-place balance");
        if(C.onBalance) s += `<g transform="translate(625 290)"><path d="M0 0 h80 l-6 14 h-68z" fill="#F0EDE6" stroke="#B9B4A8"/>${C.m0 ? `<path d="M8 0 h64 l-2 6 h-60z" fill="rgb(${col})"/>` : ""}</g>`;
        s += `<text x="300" y="196" text-anchor="middle" class="k-lbl">TEACHER DEMONSTRATION · safety screen · hole near the end burns the excess gas</text>`;
        s += IG5.card(560, 60, 370, 200, `${C.run} · copper oxide in a porcelain boat`,
          `<text x="14" y="50" class="k-lbl">gas: ${gas === "H2" ? "hydrogen" : "methane"} · ${C.gasOn ? "flowing for ≈ " + Math.round(C.flushT*12) + " s" : "off"}</text>
           <text x="14" y="72" class="k-lbl">sample tested at outlet: ${C.tested ? "burns quietly — air flushed out" : "not yet"}</text>
           <text x="14" y="94" class="k-lbl">excess gas at the hole: ${C.lit ? "burning" : "not lit"} · boat is ${C.hot ? "HOT" : "cool"}</text>
           <text x="14" y="116" class="k-lbl">contents: ${!C.m0 ? "empty" : C.r < .02 ? (oxide === "CuO" ? "black powder" : "red-brown powder") : C.r < .98 ? "partly pink-brown" : "pink-brown copper"}</text>
           ${C.last !== null ? `<text x="14" y="138" class="k-lbl">last recorded mass: ${C.last.toFixed(2)} g</text>` : ""}
           <text x="14" y="176" class="k-lbl">${gas === "H2" ? "copper oxide + H₂ → Cu + H₂O" : "copper oxide + CH₄ → Cu + CO₂ + H₂O"}</text>`);
        return [s, !C.m0 ? "Weigh the empty boat, then add copper oxide" : !C.gasOn ? "Turn on the gas to flush out the air" : !C.tested ? "Test a sample of gas from the outlet" : !C.lit ? "Light the excess gas at the hole" : C.hot ? "Stop heating and let it cool in the gas stream" : "Heat the boat, then cool and weigh to constant mass"];
      }
      let flame = 0;
      function draw(){
        const [s, st] = mode === "cu" ? drawTube() : drawCrucible();
        $("#ige-scene").innerHTML = s; $("#ige-status").textContent = st;
        ctx.readout(mode === "cu" ? [["Experiment", "Copper oxide"], ["Boat", C.hot ? "hot" : "cool", C.hot ? "warn" : ""], ["Gas", C.gasOn ? "on" : "off"]]
          : [["Experiment", S.kind === "mg" ? "Magnesium" : "Hydrated CuSO₄"], ["Heatings", S.heats], ["Crucible", S.hot ? "hot" : "cool", S.hot ? "warn" : ""]]);
      }
      ctx.frame(dt => {
        let busy = false;
        if(flame > 0){ flame -= dt; busy = true; }
        if(flash > 0){ flash = Math.max(0, flash - dt*.8); busy = true; }
        if(smoke > 0){ smoke = Math.max(0, smoke - dt*.5); busy = true; }
        if(pop > 0){ pop = Math.max(0, pop - dt*.6); busy = true; }
        if(C.gasOn){ C.flushT += dt; if(mode === "cu") busy = true; }
        if(busy) draw();
      });

      /* ── crucible procedures ── */
      function heatCrucible(){
        if(!S.m0) return ctx.toast("Add the sample first");
        S.onBalance = false; S.hot = true; S.heats++; flame = 1.6;
        if(S.kind === "mg"){
          if(S.wet){ S.mgo += S.n3*3*(AR_.Mg + AR_.O)/(3*AR_.Mg + 2*14.01); S.n3 = 0; S.wet = false; ctx.toast("Mg(OH)₂ decomposes to MgO; ammonia was given off"); }
          const frac = lid === "on" ? .08 : lid === "lift" ? .8 : .9, nf = lid === "on" ? .10 : lid === "lift" ? .03 : .01;
          const reacted = S.mg*frac; S.mg -= reacted; if(S.mg < 2e-4) S.mg = 0;
          let made = reacted*(1 - nf)*(AR_.Mg + AR_.O)/AR_.Mg;
          S.n3 += reacted*nf*(3*AR_.Mg + 2*14.01)/(3*AR_.Mg);
          if(lid === "off" && reacted > 1e-4){ made *= .88; smoke = 1; ctx.toast("White smoke of magnesium oxide escapes!"); markErr("smoke"); }
          else if(lid === "lift") made *= .997;
          S.mgo += made;
          if(reacted > 1e-3){ flash = 1; if(!S.flashed){ S.flashed = true; ctx.toast("Brilliant white light — do not look directly at it"); } }
          if(lid === "on" && reacted > 1e-3) ctx.toast("Lid on: the magnesium glows but has little oxygen to burn");
        }else{
          S.w *= .3; if(S.w < .004) S.w = 0;
        }
        draw();
      }
      function weighCrucible(){
        S.onBalance = true;
        const m = reading(), lbl = S.kind === "mg" ? "Mg" : "hydrated CuSO₄";
        const step = !S.m0 ? "crucible + lid" : S.heats === 0 ? "crucible + lid + " + lbl : `after heating ${S.heats}`;
        if(S.hot) markErr("hot");
        ctx.record({ kind:KIND[S.kind], run:S.run, step, mass:m, m1:"", m2:"", note:S.hot ? "weighed hot!" : "" });
        S.last = m;
        const rs = ctx.rows().filter(r => r.run === S.run && r.kind === KIND[S.kind]), after = rs.filter(r => r.step.startsWith("after") && !r.note);
        if(!S.done && after.length >= 2 && Math.abs(after[after.length - 1].mass - after[after.length - 2].mass) <= .01 + 1e-9){
          S.done = true; ctx.toast("Constant mass reached ✓");
          const e = rs.find(r => r.step === "crucible + lid").mass, f = rs.find(r => r.step.startsWith("crucible + lid +")).mass, fin = after[after.length - 1].mass;
          const m1 = S.kind === "mg" ? f - e : fin - e, m2 = S.kind === "mg" ? fin - f : f - fin;
          ctx.record({ kind:KIND[S.kind], run:S.run, step:"result", mass:"", m1:Kit.round(m1, 2), m2:Kit.round(m2, 2), note:"constant mass" }, true);
        }
        draw();
      }
      /* ── copper oxide procedures ── */
      const unsafe = msg => { C.unsafe = true; ctx.toast("STOP: " + msg); };
      function weighBoat(){
        if(C.hot){ C.r = Math.max(0, C.r - .25); C.reox = true; markErr("reox"); ctx.toast("The hot copper darkens in air — it is re-oxidising"); C.hot = false; }
        C.onBalance = true;
        const m = reading(), step = !C.m0 ? "boat" : C.heats === 0 ? "boat + copper oxide" : `after heating ${C.heats}`;
        ctx.record({ kind:KIND.cu, run:C.run, step, mass:m, m1:"", m2:"", note:C.reox ? "re-oxidised" : "" });
        C.last = m;
        const rs = ctx.rows().filter(r => r.run === C.run && r.kind === KIND.cu), after = rs.filter(r => r.step.startsWith("after"));
        if(!C.done && after.length >= 2 && Math.abs(after[after.length - 1].mass - after[after.length - 2].mass) <= .01 + 1e-9){
          C.done = true; ctx.toast("Constant mass reached ✓");
          const e = rs.find(r => r.step === "boat").mass, f = rs.find(r => r.step === "boat + copper oxide").mass, fin = after[after.length - 1].mass;
          ctx.record({ kind:KIND.cu, run:C.run, step:"result", mass:"", m1:Kit.round(fin - e, 2), m2:Kit.round(f - fin, 2), note:"constant mass" }, true);
          if(!C.unsafe && !C.reox) ctx.complete("safe");
        }
        draw();
      }

      ctx.seg({ label:"Experiment", value:mode, options:[["mg","Burn Mg"],["cu","Reduce copper oxide"],["hyd","Hydrated CuSO₄"]], onChange(v){
        mode = v; if(v !== "cu"){ newCrucible(); } pc.style.display = v === "cu" ? "none" : ""; pt.style.display = v === "cu" ? "" : "none"; lenS.node.style.display = wd.style.display = v === "mg" ? "" : "none"; relabel(); draw(); } });
      const pc = ctx.html(`<div></div>`), pt = ctx.html(`<div></div>`);
      const lenS = ctx.slider({ parent:pc, label:"Length of magnesium ribbon", min:10, max:50, step:5, value:len, unit:"cm", onInput(v){ len = v; } });
      ctx.seg({ parent:pc, label:"Crucible lid while heating", value:lid, options:[["on","On"],["lift","Lift now and then"],["off","Off"]], onChange(v){ lid = v; draw(); } });
      ctx.buttons([
        { label:"Add sample", onClick(){
          if(S.m0) return ctx.toast("The sample is already in");
          if(!ctx.rows().some(r => r.run === S.run && r.kind === KIND[S.kind])) return ctx.toast("Weigh the empty crucible and lid first");
          S.m0 = S.kind === "mg" ? Kit.round(len*.0098*(.97 + Math.random()*.06), 4) : Kit.round(2.2 + Math.random()*.8, 3);
          if(S.kind === "mg") S.mg = S.m0;
          S.onBalance = true; ctx.toast(S.kind === "mg" ? "Ribbon cleaned with sandpaper, coiled and placed in the crucible" : "Blue crystals added"); draw(); } },
        { label:"Heat strongly 1 min", onClick:heatCrucible },
        { label:"Cool", onClick(){ S.hot = false; S.onBalance = true; draw(); } }
      ], pc);
      const wd = ctx.buttons([{ label:"Add a few drops of water (converts Mg₃N₂), then reheat", block:true, onClick(){
        if(!S.m0 || S.mg > S.m0*.05) return ctx.toast("Burn the magnesium completely first");
        if(S.hot) return ctx.toast("Let it cool first");
        S.wet = true; ctx.toast(S.n3 > .001 ? "A faint smell of ammonia: Mg₃N₂ + 6H₂O → 3Mg(OH)₂ + 2NH₃" : "No smell of ammonia"); draw();
      } }], pc).node;
      ctx.buttons([{ label:"Weigh and record", primary:true, block:true, onClick:weighCrucible }, { label:"New crucible · new run", block:true, onClick(){ newCrucible(); draw(); } }], pc);

      ctx.seg({ parent:pt, label:"Reducing gas", value:gas, options:[["H2","Hydrogen"],["CH4","Methane"]], onChange(v){ if(C.gasOn) return ctx.toast("Turn the gas off first"); gas = v; draw(); } });
      ctx.buttons([
        { label:"Add copper oxide", onClick(){
          if(C.m0) return ctx.toast("The oxide is already in the boat");
          if(!ctx.rows().some(r => r.run === C.run && r.kind === KIND.cu)) return ctx.toast("Weigh the empty boat first");
          C.m0 = Kit.round(1.6 + Math.random()*1.0, 3); C.onBalance = true; draw(); } },
        { label:"Gas on / off", onClick(){
          if(C.gasOn){ if(C.hot){ C.reox = true; C.r = Math.max(0, C.r - .2); markErr("reox"); ctx.toast("Gas off while hot: air gets in and the copper re-oxidises"); }
            C.gasOn = false; C.lit = false; C.tested = false; }
          else { C.gasOn = true; C.flushT = 0; C.onBalance = false; }
          draw(); } }
      ], pt);
      ctx.buttons([
        { label:"Test a sample from the outlet", onClick(){
          if(!C.gasOn) return ctx.toast("Turn the gas on first");
          C.tested = C.flushT >= 5; pop = 1; ctx.toast(C.tested ? "The sample burns quietly — the air has been flushed out" : "Squeaky pop — air is still mixed with the gas. Keep flushing and test again"); draw(); } },
        { label:"Light the excess gas", onClick(){
          if(!C.gasOn) return ctx.toast("No gas is flowing");
          if(!C.tested) return unsafe("a gas–air mixture could explode. Test a sample first.");
          C.lit = true; draw(); } }
      ], pt);
      ctx.buttons([
        { label:"Heat the boat 1 min", onClick(){
          if(!C.m0) return ctx.toast("Add copper oxide first");
          if(!C.gasOn) return ctx.toast("No reducing gas — the oxide just gets hot");
          if(!C.tested || !C.lit) return unsafe("never heat until the air is flushed out and the excess gas is burning.");
          C.onBalance = false; C.hot = true; C.heats++; flame = 1.6; C.r = C.r + (1 - C.r)*.65; if(C.r > .997) C.r = 1; draw(); } },
        { label:"Stop heating · cool in gas", onClick(){ if(!C.gasOn && C.hot){ C.reox = true; C.r = Math.max(0, C.r - .2); markErr("reox"); ctx.toast("No gas flowing — the hot copper re-oxidises"); } C.hot = false; draw(); } }
      ], pt);
      ctx.buttons([{ label:"Weigh and record", primary:true, block:true, onClick:weighBoat }, { label:"New boat · new run", block:true, onClick(){ newBoat(); draw(); } }], pt);

      /* ── analysis ── */
      function last(kind){
        const rs = ctx.rows().filter(r => r.kind === KIND[kind] && r.step === "result");
        return rs.length ? rs[rs.length - 1] : null;
      }
      const ratio = (kind, r) => kind === "mg" ? (r.m2/AR_.O)/(r.m1/AR_.Mg) : kind === "cu" ? (r.m2/AR_.O)/(r.m1/AR_.Cu) : (r.m2/AR_.H2O)/(r.m1/AR_.CuSO4);
      let ratioOk = {};
      const ans = Kit.answer(ctx, "", "", v => {
        const r = last(mode); if(!r) return [false, "Heat to constant mass first — your result row is recorded automatically."];
        const want = ratio(mode, r);
        if(Math.abs(v - want) <= .03*want + .01){ ratioOk[mode] = true;
          return [true, mode === "hyd" ? `Correct from your masses: n(H₂O) = ${(r.m2/AR_.H2O).toFixed(4)} mol, n(CuSO₄) = ${(r.m1/AR_.CuSO4).toFixed(4)} mol, x = ${want.toFixed(2)}. Now choose the formula.`
            : `Correct from your masses: n(O) = ${(r.m2/AR_.O).toFixed(4)} mol, n(${mode === "mg" ? "Mg" : "Cu"}) = ${(r.m1/(mode === "mg" ? AR_.Mg : AR_.Cu)).toFixed(4)} mol, ratio = ${want.toFixed(2)}. Now choose the formula.`]; }
        return [false, mode === "mg" ? "Mass of O = (crucible + oxide) − (crucible + Mg). Divide each mass by its Ar (Mg 24.3, O 16.0), then n(O) ÷ n(Mg)."
          : mode === "cu" ? "Mass of O = (boat + oxide) − (boat + copper). n(Cu) = mass of Cu ÷ 63.5; n(O) = mass of O ÷ 16.0; ratio n(O) ÷ n(Cu)."
          : "Mass of water = (crucible + crystals) − final mass. Mass of CuSO₄ = final − empty. x = (mass water ÷ 18.0) ÷ (mass CuSO₄ ÷ 159.6)."];
      });
      const fBox = ctx.html(`<div></div>`);
      function buildFormula(){
        fBox.innerHTML = "";
        IG5.checker(ctx, "Empirical formula", [["Formula", FORMS[mode]]], ([f]) => {
          if(!ratioOk[mode]) return [false, "Work out the mole ratio from your masses first."];
          const truth = mode === "mg" ? "MgO" : mode === "cu" ? oxide : "5";
          const r = last(mode), q = ratio(mode, r);
          const ideal = mode === "mg" ? 1 : mode === "cu" ? (oxide === "CuO" ? 1 : .5) : 5;
          if(Math.abs(q - ideal)/ideal > .15) return [false, `Your ratio is ${q.toFixed(2)}, too far from a simple whole-number ratio to trust. ${mode === "mg" ? "Did smoke escape (lid off) or did the magnesium not all burn? Repeat with the lid lifted only now and then." : mode === "cu" ? "Was the oxide fully reduced, or did hot copper meet air? Repeat, heating to constant mass in the gas stream." : "Heat to constant mass and repeat."}`];
          if(f !== truth) return [false, `Your ratio is ${q.toFixed(2)}. Round it to the nearest simple whole-number ratio.`];
          if(mode === "mg"){ ctx.complete("mgo"); return [true, `MgO. ${q < .97 ? "Your ratio is a little low: smoke escaping or Mg₃N₂ formation make the mass of O too small." : "The 1 : 1 ratio fits Mg²⁺ and O²⁻."}`]; }
          if(mode === "cu"){ ctx.complete("cu"); return [true, `${oxide === "CuO" ? "CuO, copper(II) oxide" : "Cu₂O, copper(I) oxide"}: ratio Cu : O = ${oxide === "CuO" ? "1 : 1" : "2 : 1"}.`]; }
          ctx.complete("hyd"); return [true, "CuSO₄·5H₂O. Heating to constant mass made sure all the water of crystallisation was removed."];
        }, fBox);
      }
      Kit.answer(ctx, "Gradient of your graph of mass of O against mass of Mg", "e.g. 0.66", v => {
        const pts = ctx.rows().filter(r => r.kind === KIND.mg && r.step === "result").map(r => [r.m1, r.m2]);
        if(pts.length < 3) return [false, `You need at least three Mg runs at constant mass (you have ${pts.length}). Use different lengths of ribbon.`];
        const fit = ctx.linFit(pts); if(!fit) return [false, "Use different lengths of ribbon so the points spread out."];
        if(Math.abs(v - fit.m) <= .06*Math.abs(fit.m) + .01){ ctx.complete("graph"); const q = fit.m*AR_.Mg/AR_.O;
          return [true, `Correct: gradient = ${fit.m.toFixed(3)}. n(O) ÷ n(Mg) = gradient × 24.3 ÷ 16.0 = ${q.toFixed(2)}${Math.abs(q - 1) < .1 ? " ≈ 1, so MgO" : ". That is well away from 1 — look for anomalous points (smoke lost, incomplete burning) and leave them out of the line"}. The theoretical gradient is 16.0 ÷ 24.3 = 0.658.`]; }
        return [false, "Choose ‘Straight line of best fit’ on the graph; gradient = rise ÷ run of the line, using two points far apart."];
      });
      Kit.answer(ctx, "Percentage uncertainty in your last mass of Mg / %", "e.g. 3.3", v => {
        const r = last("mg"); if(!r) return [false, "Finish a magnesium run first."];
        const p1 = ChemKit.pct(.01, r.m1), p2 = ChemKit.pct(.02, r.m1);
        if([p1, p2].some(p => Math.abs(v - p) <= .03*p + .05)){ ctx.complete("unc"); return [true, `Correct: two readings of ±0.005 g → ±0.01 g; 0.01 ÷ ${r.m1.toFixed(2)} × 100 = ${p1.toFixed(1)}% (or ${p2.toFixed(1)}% using ±0.01 g per reading). A longer ribbon reduces it.`]; }
        return [false, "The mass of Mg is a difference of two balance readings, each ±0.005 g."];
      });
      function relabel(){
        ans.box.querySelector("label span").textContent = mode === "mg" ? "Mole ratio n(O) ÷ n(Mg) from your last Mg run" : mode === "cu" ? "Mole ratio n(O) ÷ n(Cu) from your last copper run" : "Value of x from your last CuSO₄ run";
        ans.input.placeholder = mode === "hyd" ? "e.g. 4.9" : "e.g. 0.98"; ans.clear(); buildFormula();
      }
      pt.style.display = "none";
      relabel(); draw();
    }
  });
})();
