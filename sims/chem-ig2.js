"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMISTRY · IGCSE (0620) — part 2
   Electrolysis (molten PbBr₂, NaCl(aq), dilute acid, CuSO₄(aq) with
   carbon and copper electrodes, electroplating) ·
   Simple chemical cells and the reactivity series (+ hydrogen fuel cell)
══════════════════════════════════════════════════════════════════ */

/* ───────────── ELECTROLYSIS ───────────── */
(function(){
  const F = 96485, VM = 24000, CAP = 50;          // C mol⁻¹, cm³ mol⁻¹ at r.t.p., tube capacity / cm³
  const SET = {
    pbbr2:{ name:"Molten lead(II) bromide (graphite electrodes)", short:"PbBr₂(l)", kind:"melt", cat:"lead", an:"bromine", ce:"pb", ae:"br" },
    naclc:{ name:"Concentrated aqueous sodium chloride (carbon electrodes)", short:"conc. NaCl(aq)", kind:"gas", cat:"hydrogen", an:"chlorine", ce:"h2", ae:"cl", gc:"H₂", ga:"Cl₂" },
    nacld:{ name:"Dilute aqueous sodium chloride (carbon electrodes)", short:"dil. NaCl(aq)", kind:"gas", cat:"hydrogen", an:"oxygen", ce:"h2", ae:"oh", gc:"H₂", ga:"O₂" },
    h2so4:{ name:"Dilute sulfuric acid (carbon electrodes)", short:"dil. H₂SO₄(aq)", kind:"gas", cat:"hydrogen", an:"oxygen", ce:"h2", ae:"oh", gc:"H₂", ga:"O₂" },
    cuc:  { name:"Copper(II) sulfate(aq), carbon electrodes", short:"CuSO₄ | C", kind:"cu", cat:"copper", an:"oxygen", ce:"cu", ae:"oh", ga:"O₂", cathM:"carbon", anM:"carbon" },
    cucu: { name:"Copper(II) sulfate(aq), copper electrodes", short:"CuSO₄ | Cu", kind:"cu", cat:"copper", an:"cu2", ce:"cu", ae:"cuox", cathM:"copper", anM:"copper" },
    plate:{ name:"Electroplating an iron key with copper", short:"Cu plating", kind:"cu", cat:"copper", an:"cu2", ce:"cu", ae:"cuox", cathM:"key", anM:"copper" }
  };
  const PROD = [["lead","lead"],["sodium","sodium"],["hydrogen","hydrogen"],["copper","copper"],["bromine","bromine"],["chlorine","chlorine"],["oxygen","oxygen"],["cu2","copper(II) ions — the anode dissolves"],["so2","sulfur dioxide"]];
  const EQ = { pb:"Pb²⁺ + 2e⁻ → Pb", br:"2Br⁻ → Br₂ + 2e⁻", h2:"2H⁺ + 2e⁻ → H₂", cl:"2Cl⁻ → Cl₂ + 2e⁻", oh:"4OH⁻ → O₂ + 2H₂O + 4e⁻",
    cu:"Cu²⁺ + 2e⁻ → Cu", cuox:"Cu → Cu²⁺ + 2e⁻", na:"Na⁺ + e⁻ → Na", pbw:"Pb²⁺ → Pb + 2e⁻", brw:"Br⁻ + e⁻ → Br", so4:"SO₄²⁻ → SO₄ + 2e⁻", cuw:"Cu → Cu²⁺ − 2e⁻" };
  const CSULF = [40,110,235], PALE = [228,236,244];

  function gasObs(g, test){
    if(!g) return "No gas is given off at this electrode.";
    if(g === "Br₂") return "Red-brown fumes of bromine — keep the sash down; no test needed.";
    const T = {
      "H₂": { lit:"Lighted splint: squeaky pop.", glow:"Glowing splint: does not relight.", lit2:"", blue:"Damp blue litmus: no change." },
      "O₂": { lit:"Lighted splint: burns more brightly.", glow:"Glowing splint: relights.", blue:"Damp blue litmus: no change." },
      "Cl₂":{ lit:"Lighted splint: goes out.", glow:"Glowing splint: does not relight.", blue:"Damp blue litmus: turns red, then is bleached white." }
    };
    return T[g][test];
  }

  Lab.register({
    id:"ig-electrolysis", subject:"chemistry", level:["igcse"], topic:"Electrochemistry · Electrolysis", interactive:true,
    title:"Electrolysis",
    summary:"Electrolyse molten lead(II) bromide, brine, dilute acid and copper(II) sulfate. Test the gases, collect H₂ and O₂ in a 2 : 1 ratio, weigh copper electrodes before and after, and electroplate a key.",
    aim:"Identify the products of electrolysis at each electrode, write the half-equations, and show that the mass of copper deposited is proportional to the time (and charge) at constant current.",
    variables:{ iv:"Time the current flows (or charge passed)", dv:"Change in mass of the cathode (g) or volume of gas (cm³)", cv:["Same current (adjust the variable resistor)","Same electrolyte and concentration","Same electrodes, same distance apart and depth"] },
    stageTitle:"Electrolysis cell and d.c. power supply", controlsTitle:"Procedure",
    thumb:`<svg viewBox="0 0 300 140"><path d="M90 40 v85 h120 v-85" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="92" y="62" width="116" height="62" fill="#4C8FE0" opacity=".55"/><rect x="118" y="30" width="12" height="80" fill="#C77B4E"/><rect x="170" y="30" width="12" height="80" fill="#C77B4E"/><path d="M124 30 V14 H60 M176 30 V8 H250" stroke="#A2ACBD" stroke-width="2.5" fill="none"/><text x="52" y="30" fill="#A2ACBD" font-size="16">−</text><text x="252" y="26" fill="#A2ACBD" font-size="16">+</text><circle cx="176" cy="80" r="3" fill="none" stroke="#fff"/><circle cx="178" cy="66" r="2.5" fill="none" stroke="#fff"/></svg>`,
    challenges:[
      { id:"molten", title:"Melt it first", text:"Try to electrolyse solid lead(II) bromide, then melt it and electrolyse it safely in the fume cupboard." },
      { id:"tests",  title:"Test the gases", text:"Get a positive test for hydrogen, oxygen and chlorine." },
      { id:"ratio",  title:"Two to one", text:"Read both gas volumes from dilute sulfuric acid or dilute NaCl and find the ratio." },
      { id:"products", title:"Products and half-equations", text:"Name both products and choose both half-equations for four different electrolytes." },
      { id:"mass",   title:"Copper electrodes", text:"Show the anode loses the same mass as the cathode gains (CuSO₄ with copper electrodes)." },
      { id:"graph",  title:"Mass against charge", text:"Record at least four copper runs and use your line to predict a mass." },
      { id:"plate",  title:"Electroplate", text:"Copper-plate the iron key." }
    ],
    columns:[{key:"run",label:"Run"},{key:"setup",label:"Electrolyte"},{key:"I",label:"I / A",dp:2},{key:"t",label:"t / min",dp:0},{key:"Q",label:"Q / C",dp:0},
      {key:"dmC",label:"Δm cathode / g",dp:2},{key:"dmA",label:"Δm anode / g",dp:2},{key:"Vc",label:"V cathode gas / cm³",dp:1},{key:"Va",label:"V anode gas / cm³",dp:1},{key:"note",label:"Note"}],
    series:"setup",
    graph:{ x:["Q","t"], y:["dmC","dmA","Vc","Va"], fit:"linear" },
    questions:[
      { q:"Why does solid lead(II) bromide not conduct, but molten lead(II) bromide does?",
        a:"In the solid the ions are held in a lattice and cannot move. When molten the ions are free to move to the electrodes and carry the charge." },
      { q:"Write the half-equations for the electrolysis of molten lead(II) bromide, and say which is oxidation.",
        a:"Cathode: Pb²⁺ + 2e⁻ → Pb (reduction, gain of electrons). Anode: 2Br⁻ → Br₂ + 2e⁻ (oxidation, loss of electrons)." },
      { q:"Concentrated NaCl(aq) gives hydrogen, not sodium, at the cathode. Explain why.",
        a:"Sodium is more reactive than hydrogen, so H⁺ ions (from water) are discharged instead of Na⁺. At the anode the Cl⁻ ions are concentrated, so chlorine is given off." },
      { q:"Why is the volume of hydrogen twice the volume of oxygen when dilute sulfuric acid is electrolysed?",
        a:"2H⁺ + 2e⁻ → H₂ and 4OH⁻ → O₂ + 2H₂O + 4e⁻. The same number of electrons flows at both electrodes, so 4e⁻ give 2H₂ but only 1O₂: a 2 : 1 ratio by volume. The oxygen volume is often slightly low because oxygen is a little more soluble." },
      { q:"Why does the blue colour fade with carbon electrodes but not with copper electrodes?",
        a:"With carbon electrodes Cu²⁺ ions are removed as copper on the cathode and not replaced (oxygen forms at the anode and the solution becomes acidic). With copper electrodes the anode dissolves, Cu → Cu²⁺ + 2e⁻, replacing the Cu²⁺ as fast as it is deposited." },
      { q:"How is a metal object electroplated with copper?",
        a:"Make the object the cathode (negative) and a piece of copper the anode, in an electrolyte of a copper salt such as CuSO₄(aq). Copper dissolves from the anode and deposits on the object. Electroplating improves appearance and resists corrosion." },
      { q:"Why are the copper electrodes washed with distilled water and dried with propanone before weighing?",
        a:"To remove the electrolyte and water, which would add mass. Propanone evaporates quickly. Weighing a wet electrode makes the mass gain too large." },
      { q:"State two hazards in these experiments and the precautions.",
        a:"Bromine and lead compounds are toxic: use a fume cupboard and gloves. Chlorine is toxic: small volumes, good ventilation. Hot crucible: tongs and heat-proof mat. Wear eye protection throughout." },
      { q:"The balance reads to 0.01 g. What is the uncertainty in a mass change, and how could it be reduced?",
        a:"Each reading is ±0.005 g, so a difference is ±0.01 g. Use a larger current or a longer time to get a larger mass change, or a balance reading to 0.001 g." }
    ],
    setup(ctx){
      let sk = "pbbr2", I = .5, tset = 10, loc = "fume", keyPol = "neg", onBal = "c", heating = false, simT = 0;
      let run = Math.max(0, ...ctx.rows().map(r => +String(r.run).replace(/\D/g, "") || 0));
      let triedSolid = false, posTests = new Set(), prodOK = new Set(), S;
      const sp = () => SET[S.set];
      function newRun(){
        run++;
        const s = SET[sk];
        S = { run:"Run " + run, set:sk, el:0, Q:0, on:false, done:false, molten:false, melt:0, eff:.97 + Math.random()*.03,
          c0: s.kind === "cu" ? Kit.round(s.cathM === "key" ? 9 + Math.random()*3 : s.cathM === "carbon" ? 4 + Math.random()*1.5 : 6 + Math.random()*2.5, 3) : 0,
          a0: s.kind === "cu" ? Kit.round(s.anM === "carbon" ? 4 + Math.random()*1.5 : 6 + Math.random()*2.5, 3) : 0,
          wetC:0, wetA:0, before:{}, after:{}, vC:null, vA:null, testMsg:"", keyPol, I, tset };
      }
      newRun();

      /* amounts produced so far */
      const nE = () => S.Q/F;
      const dep = () => nE()/2*63.55*S.eff;
      const keyAnode = () => S.set === "plate" && S.keyPol === "pos";
      function massC(){ const s = sp(); if(s.kind !== "cu") return 0; return (keyAnode() ? S.a0 : S.c0) + dep() + S.wetC; }
      function massA(){ const s = sp(); if(s.kind !== "cu") return 0;
        if(s.anM === "carbon") return S.a0 + S.wetA;
        return (keyAnode() ? S.c0 : S.a0) - (keyAnode() ? nE()/2*55.85 : nE()/2*63.55*S.eff) + S.wetA; }
      function vols(){
        const s = sp(); if(s.kind !== "gas") return [0, 0];
        const h = nE()/2*VM, a = s.ga === "Cl₂" ? nE()/2*VM*.55 : nE()/4*VM*.975;
        return [Math.min(CAP, h), Math.min(CAP, a)];
      }
      const gasAt = which => {
        const s = sp(); if(S.el <= 0) return null;
        if(which === "c") return s.gc || null;
        if(s.kind === "melt") return "Br₂";
        if(s.kind === "cu") return s.anM === "carbon" ? "O₂" : null;
        return s.ga;
      };
      function obsText(){
        const s = sp(), k = S.el > 0;
        if(s.kind === "melt") return [
          S.molten ? "Electrolyte: molten, pale yellow liquid." : "Electrolyte: white solid (not yet melted).",
          "Cathode (−): " + (k ? "silvery-grey beads of molten lead collect under the electrode." : "nothing yet."),
          "Anode (+): " + (k ? "red-brown vapour (bromine) is given off." : "nothing yet.")];
        if(s.kind === "gas") return [
          "Electrolyte: colourless solution" + (k && S.set === "naclc" ? "; it becomes alkaline (NaOH forms)." : "."),
          "Cathode (−): " + (k ? "effervescence; colourless gas collects." : "nothing yet."),
          "Anode (+): " + (k ? (s.ga === "Cl₂" ? "effervescence; pale yellow-green gas." : "effervescence; colourless gas collects (about half the volume).") : "nothing yet.")];
        const fade = s.anM === "carbon";
        return [
          "Electrolyte: blue" + (k ? (fade ? ", fading as Cu²⁺ ions are used up." : ", colour stays the same.") : "."),
          "Cathode (−): " + (k ? (keyAnode() ? "copper plate: pink-brown copper deposited." : "pink-brown copper coats the " + (s.cathM === "key" ? "key." : "electrode.")) : "nothing yet."),
          "Anode (+): " + (k ? (fade ? "effervescence; colourless gas (oxygen)." : keyAnode() ? "the iron key slowly dissolves; no copper on it." : "the copper anode gets thinner; no gas.") : "nothing yet.")];
      }

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="ig-electrolysis-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 460)}<g id="ig-electrolysis-scene"></g><text x="24" y="30" class="k-status" id="ig-electrolysis-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#ig-electrolysis-svg"), $ = s => svg.querySelector(s);

      const lcd = (x, y, w, v, unit) => `<rect x="${x}" y="${y}" width="${w}" height="34" rx="5" fill="#132A1F"/><text x="${x + w - 26}" y="${y + 25}" text-anchor="end" class="k-lcd">${v}</text><text x="${x + w - 20}" y="${y + 24}" style="font:600 10px Inter;fill:#5FBF8A">${unit}</text>`;
      function bubbles(x, w, yTop, yBot, n, rate){
        let s = ""; const H = yBot - yTop; if(H <= 4) return s;
        for(let i = 0; i < n; i++){
          const ph = ((i*37) % 100)/100, xo = (((i*53) % 11)/10 - .5)*w, y = yBot - ((simT*rate + ph*H) % H);
          s += `<circle cx="${x + xo}" cy="${y}" r="${1.4 + ((i*29) % 7)/5}" fill="none" stroke="var(--txt2)" stroke-width=".9"/>`;
        }
        return s;
      }
      function powerPack(){
        const amps = S.on ? (S.I + (Math.random() - .5)*.01).toFixed(2) : "0.00";
        const m = Math.floor(S.el), sec = Math.floor((S.el - m)*60);
        return `<g><rect x="30" y="250" width="200" height="200" rx="12" fill="#2B3240" stroke="#4B5563"/>
          <text x="44" y="270" style="font:600 10px Inter;fill:#CBD5E1">d.c. supply · ammeter · clock</text>
          ${lcd(44, 280, 150, amps, "A")}${lcd(44, 324, 150, String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0"), "")}
          <text x="44" y="380" style="font:500 10px Inter;fill:#94A3B8">I set: ${S.I.toFixed(2)} A · t set: ${S.tset} min</text>
          <circle cx="60" cy="420" r="9" fill="${S.on ? "#22C55E" : "#475569"}"/><text x="76" y="424" style="font:600 10px Inter;fill:#CBD5E1">${S.on ? "ON" : "OFF"}</text>
          <circle cx="230" cy="300" r="7" fill="#111"/><text x="214" y="296" style="font:700 13px Inter;fill:#E5E7EB" text-anchor="end">−</text>
          <circle cx="230" cy="360" r="7" fill="#D23B3B"/><text x="214" y="364" style="font:700 13px Inter;fill:#E5E7EB" text-anchor="end">+</text></g>`;
      }
      function topWires(xc, xa, yc, ya){
        return `<path d="M230 300 H255 V170 H${xc} V${yc}" stroke="#9AA3B2" stroke-width="4.5" fill="none"/><path d="M230 300 H255 V170 H${xc} V${yc}" stroke="#1A1A1A" stroke-width="2.5" fill="none"/>
          <path d="M230 360 H265 V155 H${xa} V${ya}" stroke="#C0392B" stroke-width="2.5" fill="none"/>`;
      }
      function drawMelt(){
        const fume = S.set === "pbbr2" && loc === "fume";
        let s = "";
        if(fume) s += `<rect x="280" y="40" width="340" height="420" rx="6" fill="color-mix(in srgb,var(--bg-card) 60%,transparent)" stroke="var(--brd2)" stroke-width="2"/>
          <rect x="284" y="44" width="332" height="120" fill="rgba(170,200,230,.18)" stroke="#9AA3B2"/><text x="450" y="60" text-anchor="middle" class="k-lbl">fume cupboard (sash lowered)</text>`;
        else s += `<text x="450" y="70" text-anchor="middle" class="k-lbl">open bench</text>`;
        s += `<path d="M370 360 h160 M380 360 l-22 100 M520 360 l22 100" stroke="url(#k-metalv)" stroke-width="6"/>
          <path d="M405 360 L450 344 L495 360" stroke="#D8CFC0" stroke-width="4" fill="none"/>
          <rect x="438" y="400" width="24" height="60" fill="url(#k-metal)"/><rect x="420" y="452" width="60" height="8" rx="3" fill="url(#k-metal)"/>`;
        if(heating) s += `<path d="M450 352 C428 380 434 400 442 400 H458 C466 400 472 380 450 352Z" fill="#4A7DFF" opacity=".8"/>`;
        const col = S.molten ? "rgb(240,205,120)" : "rgb(244,240,228)";
        s += `<path d="M395 290 h110 l-12 52 h-86 z" fill="#E7E2D8" stroke="#A39C8E" stroke-width="2"/>
          <path d="M401 304 h98 l-8 34 h-82 z" fill="${col}"/>`;
        if(S.molten && heating) s += `<path d="M401 304 h98 l-8 34 h-82 z" fill="#FF8A3D" opacity=".18"/>`;
        if(!S.molten) for(let i = 0; i < 18; i++) s += `<circle cx="${408 + (i*37) % 84}" cy="${308 + (i*13) % 26}" r="1.6" fill="#D8D2C0"/>`;
        const pb = Math.min(1, nE()*400);   // grows with lead deposited
        if(S.el > 0) s += `<ellipse cx="425" cy="334" rx="${4 + pb*10}" ry="${2 + pb*3}" fill="url(#k-metal)" stroke="#5A6272"/>`;
        s += `<rect x="419" y="200" width="12" height="130" fill="#3A3F48"/><rect x="469" y="200" width="12" height="130" fill="#3A3F48"/>`;
        s += topWires(425, 475, 200, 200);
        if(S.el > 0){ const a = Math.min(.85, .25 + nE()*60);
          for(let i = 0; i < 4; i++) s += `<path d="M${470 + i*4} ${300 - ((simT*20 + i*15) % 20)} q-10 -20 0 -40 q10 -20 0 -40 q-8 -18 2 -36" fill="none" stroke="rgba(150,55,20,${a})" stroke-width="${5 - i*.6}" stroke-linecap="round"/>`; }
        if(S.on) s += bubbles(475, 6, 306, 330, 5, 18);
        s += `<text x="413" y="214" text-anchor="end" class="k-tag">− cathode</text><text x="487" y="214" class="k-tag">+ anode</text>`;
        return s;
      }
      function drawAq(){
        const s0 = sp(); let s = "";
        let col = s0.kind === "cu" ? CSULF : [215,228,240];
        if(s0.kind === "cu" && s0.anM === "carbon") col = ChemKit.mix(CSULF, PALE, Math.min(.9, dep()/63.55/.005));
        const a = s0.kind === "cu" ? .72 : .3;
        s += `<path d="${ChemKit.BEAKER(300, 440, 300, 200)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
          <rect x="301" y="270" width="298" height="168" fill="${ChemKit.rgba(col, a)}"/>`;
        if(s0.kind === "gas"){
          const [vc, va] = vols(), y0 = 125, k = 5;
          [[390, vc, s0.gc], [510, va, s0.ga]].forEach(([x, v, g]) => {
            s += `<rect x="${x - 18}" y="${y0 - 5}" width="36" height="${400 - y0 + 5}" rx="8" fill="${ChemKit.rgba(col, a)}"/>
              <rect x="${x - 16}" y="${y0}" width="32" height="${v*k}" fill="${g === "Cl₂" ? "rgba(190,215,80,.45)" : "var(--bg2)"}" opacity="${g === "Cl₂" ? 1 : .85}"/>
              <path d="M${x - 18} 400 V${y0 + 3} Q${x - 18} ${y0 - 5} ${x} ${y0 - 5} Q${x + 18} ${y0 - 5} ${x + 18} ${y0 + 3} V400" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
            for(let u = 0; u <= CAP; u += 5) s += `<line x1="${x + 18}" y1="${y0 + u*k}" x2="${x + (u % 10 ? 12 : 8)}" y2="${y0 + u*k}" stroke="var(--txt2)" stroke-width=".8"/>`;
            s += `<rect x="${x - 4}" y="380" width="8" height="60" fill="#3A3F48"/>`;
            if(S.on) s += bubbles(x, 10, y0 + v*k, 380, 9, 70);
          });
          s += `<path d="M230 300 H272 V450 H390 V440" stroke="#9AA3B2" stroke-width="4.5" fill="none"/><path d="M230 300 H272 V450 H390 V440" stroke="#1A1A1A" stroke-width="2.5" fill="none"/><path d="M230 360 H262 V456 H510 V440" stroke="#C0392B" stroke-width="2.5" fill="none"/>
            <path d="M354 120 H620 M612 120 V460" stroke="url(#k-metalv)" stroke-width="5"/>
            <text x="390" y="112" text-anchor="middle" class="k-tag">− cathode</text><text x="510" y="112" text-anchor="middle" class="k-tag">+ anode</text>`;
        }else{
          const d = dep(), cC = s0.cathM === "carbon" ? [60,64,72] : s0.cathM === "key" ? [120,124,132] : [196,116,78];
          const keyNeg = !keyAnode();
          const cathCol = keyNeg ? ChemKit.mix(cC, [196,116,78], Math.min(1, d/.03)) : [196,116,78];
          s += `<path d="M340 225 H560" stroke="url(#k-metalv)" stroke-width="5"/>`;
          // cathode (left) and anode (right)
          const plate = (x, colr, thick, label) => `<rect x="${x - 12 - thick}" y="230" width="${24 + thick*2}" height="180" rx="2" fill="rgb(${colr})" stroke="rgba(0,0,0,.3)"/><text x="${x}" y="484" text-anchor="middle" class="k-tag">${label}</text>`;
          const key = (x, colr) => `<g transform="translate(${x} 230)"><rect x="-3" y="0" width="6" height="40" fill="#888"/><circle cx="0" cy="62" r="22" fill="rgb(${colr})" stroke="rgba(0,0,0,.35)"/><circle cx="0" cy="62" r="8" fill="${ChemKit.rgba(col, a)}" stroke="rgba(0,0,0,.35)"/>
            <rect x="-6" y="82" width="12" height="96" fill="rgb(${colr})" stroke="rgba(0,0,0,.35)"/><rect x="6" y="140" width="14" height="9" fill="rgb(${colr})"/><rect x="6" y="160" width="10" height="9" fill="rgb(${colr})"/></g>`;
          const anCol = s0.anM === "carbon" ? [60,64,72] : [196,116,78];
          const thinA = s0.anM === "copper" && keyNeg ? -Math.min(5, d*30) : 0;
          if(s0.cathM === "key"){
            if(keyNeg){ s += key(380, cathCol) + `<text x="380" y="484" text-anchor="middle" class="k-tag">− iron key</text>` + plate(520, anCol, thinA, "+ copper"); }
            else{ s += plate(380, [196,116,78], Math.min(4, d*25), "− copper") + key(520, ChemKit.mix([120,124,132], [90,80,70], Math.min(1, nE()*40))) + `<text x="520" y="484" text-anchor="middle" class="k-tag">+ iron key</text>`; }
          }else s += plate(380, cathCol, s0.cathM === "copper" ? Math.min(4, d*25) : Math.min(3, d*20), "− cathode") + plate(520, anCol, thinA, "+ anode");
          s += topWires(380, 520, 230, 230);
          if(S.on && s0.anM === "carbon") s += bubbles(520, 26, 272, 400, 12, 60);
        }
        return s;
      }
      function rightPanel(){
        const s0 = sp(); let s = `<g transform="translate(640 44)"><rect width="300" height="206" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="14" y="22" class="k-tag">${ctx.esc(S.run)} · ${ctx.esc(s0.short)}</text>`;
        let y = 44;
        obsText().forEach(t => { const L = ChemKit.wrap(t, 46); s += ChemKit.lines(t, 46, 14, y, 15); y += L.length*15 + 5; });
        if(S.testMsg){ s += ChemKit.lines(S.testMsg, 46, 14, y + 2, 15, "k-hint"); }
        s += `</g>`;
        if(s0.kind === "gas"){
          const [vc, va] = vols();
          s += ChemKit.lens({ id:"ig-electrolysis-lc", cx:715, cy:350, r:62, S:14, value:vc, minor:.5, major:2, half:1, down:true, liquid:"rgba(140,190,240,.5)", label:"cathode tube (cm³)" });
          s += ChemKit.lens({ id:"ig-electrolysis-la", cx:870, cy:350, r:62, S:14, value:va, minor:.5, major:2, half:1, down:true, liquid:"rgba(140,190,240,.5)", label:"anode tube (cm³)" });
        }else if(s0.kind === "cu"){
          const inCell = S.on, m = inCell ? null : onBal === "c" ? massC() : massA();
          s += ChemKit.balance(700, 300, m === null ? 0 : Kit.round(m, 2), "two-decimal-place balance");
          if(!inCell){
            const which = onBal === "c" ? (s0.cathM === "key" && !keyAnode() ? "key" : "plate") : (keyAnode() ? "key" : "plate");
            const colr = onBal === "c" ? (s0.cathM === "carbon" ? [60,64,72] : [196,116,78]) : (s0.anM === "carbon" ? [60,64,72] : [196,116,78]);
            const c2 = which === "key" ? ChemKit.mix([120,124,132], [196,116,78], keyAnode() ? 0 : Math.min(1, dep()/.03)) : colr;
            s += `<rect x="730" y="${308}" width="110" height="10" rx="2" fill="rgb(${c2})" stroke="rgba(0,0,0,.3)"/>`;
            s += `<text x="785" y="420" text-anchor="middle" class="k-lbl">on the pan: ${onBal === "c" ? "cathode" : "anode"}${(onBal === "c" ? S.wetC : S.wetA) ? " (still wet!)" : ""}</text>`;
          }else s += `<text x="785" y="420" text-anchor="middle" class="k-lbl">electrodes are in the cell</text>`;
        }else{
          s += `<g transform="translate(640 280)"><rect width="300" height="150" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="14" y="22" class="k-tag">Hazards and precautions</text>
            ${ChemKit.lines("Lead compounds are toxic; bromine vapour is toxic and corrosive. Work in a fume cupboard with the sash down, wear gloves and eye protection, and handle the hot crucible with tongs.", 46, 14, 46, 16)}</g>`;
        }
        return s;
      }
      function status(){
        const s0 = sp();
        if(S.on) return "Current flowing — watch both electrodes";
        if(s0.kind === "melt") return !S.molten ? "Heat the lead(II) bromide until it melts" : S.done ? "Switched off — note what formed at each electrode" : "Molten — switch on the current";
        if(s0.kind === "cu"){
          if(!S.done) return S.before.c === undefined || S.before.a === undefined ? "Weigh both clean, dry electrodes" : "Set the current and time, then switch on";
          if(S.wetC || S.wetA) return "Rinse with distilled water and dry with propanone";
          return "Weigh both electrodes again";
        }
        return S.done ? "Switched off — read both gas volumes and test the gases" : "Set the current and time, then switch on";
      }
      function draw(){
        let s = powerPack() + (sp().kind === "melt" ? drawMelt() : drawAq()) + rightPanel();
        $("#ig-electrolysis-scene").innerHTML = s;
        $("#ig-electrolysis-status").textContent = status();
        ctx.readout([["Electrolyte", sp().short], ["Current", S.I.toFixed(2) + " A"], ["Time", S.el.toFixed(1) + " min"], ["Charge", Math.round(S.Q) + " C"]]);
      }
      let redraw = 0;
      ctx.frame(dt => {
        if(heating && sp().kind === "melt" && !S.molten){ S.melt += dt; if(S.melt > 1.6){ S.molten = true; ctx.toast("The lead(II) bromide has melted"); draw(); } }
        if(S.on){
          simT += dt;
          const dm = Math.min(S.tset - S.el, dt*2.5);     // 1 simulated minute ≈ 0.4 s
          S.el += dm; S.Q += S.I*dm*60;
          if(S.el >= S.tset - 1e-9){ S.on = false; S.done = true; if(sp().kind === "cu"){ S.wetC = Kit.round(.03 + Math.random()*.04, 3); S.wetA = Kit.round(.03 + Math.random()*.04, 3); }
            ctx.toast(`Switched off after ${S.tset} min`); endRun(); }
          redraw += dt; if(redraw > .05 || !S.on){ redraw = 0; draw(); }
        }else if(heating || (sp().kind === "melt" && S.el > 0)){ simT += dt; redraw += dt; if(redraw > .08){ redraw = 0; draw(); } }
      });

      function endRun(){
        if(sp().kind === "melt"){
          ctx.record({ run:S.run, setup:sp().short, I:S.I, t:S.tset, Q:Kit.round(S.Q, 0), dmC:"", dmA:"", Vc:"", Va:"", note:"lead (cathode), bromine (anode)" });
          if(triedSolid && loc === "fume") ctx.complete("molten");
        }
      }
      function switchOn(){
        const s0 = sp();
        if(S.on) return;
        if(S.done) return ctx.toast("This run is finished — start a new run");
        if(s0.kind === "melt"){
          if(loc === "bench") return ctx.toast("Bromine vapour is toxic — move the crucible into the fume cupboard");
          if(!S.molten){ triedSolid = true; return ctx.toast("Ammeter reads 0.00 A: solid PbBr₂ does not conduct — its ions cannot move"); }
          if(!heating) return ctx.toast("Keep heating — the lead(II) bromide must stay molten");
        }
        if(s0.kind === "cu" && (S.before.c === undefined || S.before.a === undefined)) return ctx.toast("Weigh both electrodes before you switch on");
        S.I = I; S.tset = tset; S.keyPol = keyPol; S.on = true; draw();
      }

      /* ── controls ── */
      const sel = ctx.select({ label:"Electrolyte", value:sk, options:Object.keys(SET).map(k => [k, SET[k].name]), onChange(v){ sk = v; heating = false; newRun(); relabel(); draw(); } });
      const locSeg = ctx.seg({ label:"Where (PbBr₂ only)", value:loc, options:[["fume","Fume cupboard"],["bench","Open bench"]], onChange(v){ if(S.on) return; loc = v; draw(); } });
      const keySeg = ctx.seg({ label:"Connect the iron key to", value:keyPol, options:[["neg","negative (−) terminal"],["pos","positive (+) terminal"]], onChange(v){ if(S.on || S.el > 0 || S.before.c !== undefined || S.before.a !== undefined){ keySeg.set(keyPol); return ctx.toast("Start a new run to change the connections"); } keyPol = v; S.keyPol = v; draw(); } });
      ctx.slider({ label:"Current (variable resistor)", min:.1, max:1, step:.05, value:I, unit:"A", fmt:v => v.toFixed(2), onInput(v){ I = v; if(!S.on && !S.done){ S.I = v; draw(); } } });
      ctx.slider({ label:"Time to pass the current", min:1, max:20, step:1, value:tset, unit:"min", onInput(v){ tset = v; if(!S.on && !S.done){ S.tset = v; draw(); } } });
      const heatBtn = ctx.buttons([{ label:"Heat with Bunsen", onClick(){ if(sp().kind !== "melt") return ctx.toast("Only the lead(II) bromide needs heating"); heating = !heating; heatBtn[0].textContent = heating ? "Turn Bunsen off" : "Heat with Bunsen";
          if(!heating && S.molten && !S.on){ S.molten = false; S.melt = 0; ctx.toast("It has solidified again"); } draw(); } }]);
      ctx.buttons([{ label:"Switch on", primary:true, onClick:switchOn }, { label:"New run", onClick(){ if(S.on) return; heating = sp().kind === "melt" && heating; const keepMolten = S.molten; newRun(); if(heating){ S.molten = keepMolten; } draw(); } }]);

      /* gas tests */
      const testWrap = ctx.html(`<div></div>`);
      const elSeg = ctx.seg({ label:"Test the gas from the", value:"c", options:[["c","cathode (−)"],["a","anode (+)"]], parent:testWrap });
      ctx.buttons([["lit","Lighted splint"],["glow","Glowing splint"],["blue","Damp blue litmus"]].map(([k, l]) => ({ label:l, onClick(){
        if(S.el <= 0) return ctx.toast("Pass the current first");
        const g = gasAt(elSeg.get()), msg = gasObs(g, k);
        S.testMsg = (elSeg.get() === "c" ? "Cathode gas — " : "Anode gas — ") + msg; draw();
        if(g === "H₂" && k === "lit") posTests.add("H₂");
        if(g === "O₂" && k === "glow") posTests.add("O₂");
        if(g === "Cl₂" && k === "blue") posTests.add("Cl₂");
        if(posTests.size >= 3) ctx.complete("tests");
      } })), testWrap);

      /* weighing */
      const wWrap = ctx.html(`<div></div>`);
      ctx.seg({ label:"Put on the balance", value:onBal, options:[["c","cathode"],["a","anode"]], parent:wWrap, onChange(v){ onBal = v; draw(); } });
      ctx.buttons([{ label:"Rinse (distilled water) & dry (propanone)", onClick(){ if(S.on) return; S.wetC = 0; S.wetA = 0; ctx.toast("Electrodes rinsed and dried"); draw(); } }], wWrap);
      const wRead = Kit.reading(ctx, "Balance reading / g", "e.g. 7.43", () => (sp().kind !== "cu" || S.on) ? null : Kit.round(onBal === "c" ? massC() : massA(), 2), .005, v => {
        const tag = onBal;
        if(!S.done){ S.before[tag] = v; ctx.toast((tag === "c" ? "Cathode" : "Anode") + " mass before: " + v.toFixed(2) + " g"); }
        else{
          S.after[tag] = v; if(tag === "c") S.wetCrec = !!S.wetC; else S.wetArec = !!S.wetA;
          ctx.toast((tag === "c" ? "Cathode" : "Anode") + " mass after: " + v.toFixed(2) + " g");
          if(S.after.c !== undefined && S.after.a !== undefined && !S.recorded){
            S.recorded = true;
            const dmC = Kit.round(S.after.c - S.before.c, 2), dmA = Kit.round(S.after.a - S.before.a, 2), wet = S.wetCrec || S.wetArec;
            ctx.record({ run:S.run, setup:sp().short, I:S.I, t:S.tset, Q:Kit.round(S.Q, 0), dmC, dmA, Vc:"", Va:"", note:(wet ? "weighed wet! " : "") + (keyAnode() ? "key on + : not plated" : "") });
            if(S.set === "cucu" && !wet && dmC > .03 && Math.abs(dmC + dmA) <= .02) ctx.complete("mass");
            if(S.set === "plate"){ if(keyAnode()) ctx.toast("The key was the anode: iron dissolved and no copper coated it. The object must be the cathode."); else if(dmC > .02) ctx.complete("plate"); }
          }
        }
        wRead.clear(); draw();
      }, wWrap);

      /* gas volumes */
      const gWrap = ctx.html(`<div></div>`);
      const vRead = (lbl, idx, key) => Kit.reading(ctx, lbl, "e.g. 12.5", () => sp().kind !== "gas" || !S.done ? null : vols()[idx], .26, v => {
        S[key] = v; ctx.toast("Volume entered: " + v + " cm³");
        if(S.vC !== null && S.vA !== null && !S.recorded){
          S.recorded = true;
          ctx.record({ run:S.run, setup:sp().short, I:S.I, t:S.tset, Q:Kit.round(S.Q, 0), dmC:"", dmA:"", Vc:S.vC, Va:S.vA, note:vols().some(x => x >= CAP) ? "tube full!" : "" });
        }
      }, gWrap);
      vRead("Gas volume in the cathode tube / cm³", 0, "vC"); vRead("Gas volume in the anode tube / cm³", 1, "vA");
      Kit.answer(ctx, "Ratio: cathode gas volume ÷ anode gas volume", "e.g. 2.0", v => {
        const r = ctx.rows().filter(r => typeof r.Vc === "number" && typeof r.Va === "number" && r.Va > 0).pop();
        if(!r) return [false, "Record both gas volumes for a run first."];
        const ratio = r.Vc/r.Va;
        if(Math.abs(v - ratio) > .05*ratio + .02) return [false, `Divide your cathode volume by your anode volume from ${r.run}.`];
        if(r.setup === "conc. NaCl(aq)") return [true, `Correct: ${ratio.toFixed(2)}. Chlorine is expected 1 : 1 with hydrogen but is quite soluble in water, so less collects. Now try dilute H₂SO₄ or dilute NaCl.`];
        ctx.complete("ratio");
        return [true, `Correct: ${ratio.toFixed(2)} ≈ 2 : 1. 4e⁻ make 2H₂ at the cathode but only 1O₂ at the anode. Slightly over 2 because oxygen is a little soluble.`];
      }, gWrap);

      /* products and half-equations */
      const pWrap = ctx.html(`<div class="ctl"><label><span>Identify the products</span></label></div>`);
      const pc = ctx.select({ label:"Product at the cathode", value:"", options:[["","— choose —"]].concat(PROD), parent:pWrap });
      const pa = ctx.select({ label:"Product at the anode", value:"", options:[["","— choose —"]].concat(PROD), parent:pWrap });
      const eqOpts = [["","— choose —"]].concat(Object.keys(EQ).map(k => [k, EQ[k]]));
      const ec = ctx.select({ label:"Half-equation at the cathode", value:"", options:eqOpts, parent:pWrap });
      const ea = ctx.select({ label:"Half-equation at the anode", value:"", options:eqOpts, parent:pWrap });
      const pfb = ctx.html(`<div></div>`, pWrap);
      ctx.buttons([{ label:"Check products", onClick(){
        const s0 = sp();
        if(S.el <= 0){ pfb.innerHTML = `<div class="note bad">Pass the current first and look at both electrodes.</div>`; return; }
        if(keyAnode()){ pfb.innerHTML = `<div class="note bad">Connect the key to the negative terminal for this one.</div>`; return; }
        const okP = pc.get() === s0.cat && pa.get() === s0.an, okE = ec.get() === s0.ce && ea.get() === s0.ae;
        if(okP && okE){
          prodOK.add(S.set);
          pfb.innerHTML = `<div class="note ok">Correct for ${ctx.esc(s0.short)}: reduction (gain of electrons) at the cathode, oxidation (loss of electrons) at the anode. Electrolytes done: ${prodOK.size} (4 needed).</div>`;
          if(prodOK.size >= 4) ctx.complete("products");
        }else{
          const hint = !okP ? "Check the products: use your observations and gas tests. Reactive metals (like Na) stay in solution as ions; H₂ forms instead." : "Check the half-equations: cations gain electrons at the cathode; anions (or a copper anode) lose electrons at the anode.";
          pfb.innerHTML = `<div class="note bad">${hint}</div>`;
        }
      } }], pWrap);

      /* graph prediction */
      let Qp = 400 + 100*Math.floor(Math.random()*7);
      const pred = Kit.answer(ctx, `From your line: mass gained by the cathode when ${Qp} C passes / g`, "e.g. 0.13", v => {
        const pts = ctx.rows().filter(r => /CuSO|plating/.test(r.setup) && typeof r.dmC === "number" && !/wet|not plated/.test(r.note)).map(r => [r.Q, r.dmC]);
        if(pts.length < 4) return [false, "Record at least four copper runs (clean, dry electrodes) with different times or currents. Plot Δm cathode against Q."];
        const f = ctx.linFit(pts), y = f.m*Qp + f.c;
        if(Math.abs(v - y) <= Math.max(.012, .08*y)){ ctx.complete("graph"); return [true, `Correct: your line gives ${y.toFixed(3)} g. The mass deposited is proportional to the charge (Q = I × t), so the line passes through (close to) the origin.`]; }
        return [false, "Read the cathode mass change at that charge from your straight line (gradient × Q + intercept)."];
      });

      function relabel(){
        const k = sp().kind;
        locSeg.node.style.display = k === "melt" ? "" : "none";
        heatBtn.node.style.display = k === "melt" ? "" : "none";
        keySeg.node.style.display = S.set === "plate" ? "" : "none";
        wWrap.style.display = k === "cu" ? "" : "none";
        gWrap.style.display = k === "gas" ? "" : "none";
        heatBtn[0].textContent = heating ? "Turn Bunsen off" : "Heat with Bunsen";
      }
      relabel(); draw();
    }
  });
})();

/* ───────────── SIMPLE CHEMICAL CELLS ───────────── */
(function(){
  /* effective electrode values for simple cells (V); differences match typical school readings */
  const E = { Mg:-1.70, Zn:-0.76, Fe:-0.44, Pb:-0.13, Cu:0.32, Ag:0.78 };
  const NAME = { Mg:"magnesium", Zn:"zinc", Fe:"iron", Pb:"lead", Cu:"copper", Ag:"silver", X:"metal X" };
  const COL = { Mg:[205,208,214], Zn:[160,172,186], Fe:[105,106,112], Pb:[96,102,118], Cu:[198,116,78], Ag:[228,230,236], X:[150,138,168] };
  const XPOS = [[-1.22, "between Mg and Zn"], [-0.29, "between Fe and Pb"], [0.10, "between Pb and Cu"], [0.56, "between Cu and Ag"]];
  const ORDER = ["Mg","Zn","Fe","Pb","Cu","Ag"];
  const SPOTS = [["above Mg","more reactive than Mg"],["between Mg and Zn","between Mg and Zn"],["between Zn and Fe","between Zn and Fe"],["between Fe and Pb","between Fe and Pb"],["between Pb and Cu","between Pb and Cu"],["between Cu and Ag","between Cu and Ag"],["below Ag","less reactive than Ag"]];
  const ELEC = { acid:{ name:"dilute sulfuric acid", f:1 }, salt:{ name:"sodium chloride solution", f:.95 }, sugar:{ name:"sugar solution (non-electrolyte)", f:0 } };
  const VMAX = 3;

  Lab.register({
    id:"ig-cells", subject:"chemistry", level:["igcse"], topic:"Electrochemistry · Chemical cells", interactive:true,
    title:"Simple chemical cells",
    summary:"Dip two different metals into an electrolyte and read the voltmeter. Find the negative terminal, link the voltage to the reactivity series, place an unknown metal X, and compare with a hydrogen fuel cell.",
    aim:"Measure the voltage of simple cells made from pairs of metals and use the readings to put the metals, including an unknown metal X, in order of reactivity.",
    variables:{ iv:"Pair of metals", dv:"Voltage (V)", cv:["Same electrolyte and concentration","Same depth and distance apart of the strips","Clean strips (sandpaper) each time"] },
    stageTitle:"Simple cell and voltmeter", controlsTitle:"Build the cell",
    thumb:`<svg viewBox="0 0 300 140"><path d="M40 50 v75 h110 v-75" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="42" y="80" width="106" height="44" fill="#8EC5F5" opacity=".45"/><rect x="62" y="34" width="10" height="80" fill="#A0ACBA"/><rect x="118" y="34" width="10" height="80" fill="#C6744E"/><path d="M67 34 V18 H200 M123 34 V26 H190" stroke="#A2ACBD" stroke-width="2" fill="none"/><circle cx="230" cy="70" r="42" fill="none" stroke="#A2ACBD" stroke-width="2.5"/><path d="M230 70 L252 44" stroke="#E0334A" stroke-width="2.5"/><text x="222" y="98" fill="#A2ACBD" font-size="14">V</text></svg>`,
    challenges:[
      { id:"read",    title:"First reading", text:"Read the voltmeter for a zinc–copper cell." },
      { id:"neg",     title:"Negative terminal", text:"Say which metal is the negative terminal of a cell you have measured." },
      { id:"series",  title:"Against copper", text:"Measure Mg, Zn, Fe, Pb and Ag each paired with copper." },
      { id:"predict", title:"Predict", text:"Predict the voltage of a magnesium–zinc cell from your readings, then measure it." },
      { id:"unknown", title:"Metal X", text:"Use voltages to place the unknown metal X in the reactivity series." },
      { id:"nonel",   title:"No cell", text:"Show that you get no voltage with a non-electrolyte or with two strips of the same metal." },
      { id:"fuel",    title:"Fuel cell", text:"Choose the overall reaction in a hydrogen–oxygen fuel cell." }
    ],
    columns:[{key:"n",label:"Cell"},{key:"neg",label:"Metal on black (−) lead"},{key:"pos",label:"Metal on red (+) lead"},{key:"el",label:"Electrolyte"},{key:"V",label:"Voltage / V",dp:2}],
    questions:[
      { q:"Why does a larger voltage mean the two metals are further apart in the reactivity series?",
        a:"The more reactive metal loses electrons more readily. The bigger the difference in how easily the two metals lose electrons, the bigger the push on the electrons round the circuit, so the larger the voltage." },
      { q:"Which metal is the negative terminal of a simple cell, and why?",
        a:"The more reactive metal. It is oxidised, losing electrons (for example Zn → Zn²⁺ + 2e⁻), and these electrons flow from it through the external circuit to the less reactive metal." },
      { q:"Why does the voltmeter needle move to the left of zero when silver is on the black lead and copper is on the red lead?",
        a:"Copper is more reactive than silver, so copper is the negative terminal. The leads are the wrong way round; swap them to get a positive reading." },
      { q:"Why do two strips of copper, or a sugar solution, give no voltage?",
        a:"Two identical metals have the same tendency to lose electrons, so there is no difference to drive a current. Sugar solution has no ions, so it is not an electrolyte and cannot complete the circuit inside the cell." },
      { q:"State the controlled variables and one way to make the readings more reliable.",
        a:"Same electrolyte and concentration, same depth and spacing of strips, same temperature. Clean each strip with sandpaper to remove oxide, and repeat each reading with fresh electrolyte." },
      { q:"Describe how a hydrogen–oxygen fuel cell produces electricity.",
        a:"Hydrogen is fed to one electrode and oxygen (air) to the other, with an electrolyte between them. Hydrogen is oxidised and oxygen is reduced; electrons flow through the external circuit. Overall: 2H₂ + O₂ → 2H₂O. The only product is water." },
      { q:"Give one advantage and one disadvantage of hydrogen fuel cells compared with petrol engines.",
        a:"Advantages: only water is produced (no CO₂, CO or NOₓ at the point of use); more efficient. Disadvantages: hydrogen is hard to store and transport (a flammable gas needing high pressure); it is often made from fossil fuels; fuel cells are expensive." },
      { q:"The voltmeter scale is marked every 0.1 V. What is the uncertainty in a reading?",
        a:"Half a division: ±0.05 V." }
    ],
    setup(ctx){
      const X = XPOS[Math.floor(Math.random()*XPOS.length)], EX = Object.assign({}, E, { X:X[0] });
      const noise = {}; const nz = (a, b) => { const k = [a, b].sort().join(); if(noise[k] === undefined) noise[k] = (Math.random() - .5)*.04; return noise[k]; };
      let black = "Zn", red = "Cu", el = "acid", view = "cell";
      let n = Math.max(0, ...ctx.rows().map(r => +String(r.n).replace(/\D/g, "") || 0));
      const trueV = () => { if(black === red || !ELEC[el].f) return 0; const d = (EX[red] - EX[black])*ELEC[el].f; return d + Math.sign(d)*nz(black, red); };
      const needle = () => Math.max(-.15, Math.min(VMAX + .1, trueV()));

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="ig-cells-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 460)}<g id="ig-cells-scene"></g><text x="24" y="30" class="k-status" id="ig-cells-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#ig-cells-svg"), $ = s => svg.querySelector(s);
      const CX = 715, CY = 300, R = 190, A0 = -60, A1 = 60;
      const ang = v => (A0 + (v/VMAX)*(A1 - A0))*Math.PI/180;
      const pt = (v, r) => [CX + r*Math.sin(ang(v)), CY - r*Math.cos(ang(v))];
      function scale(){
        let s = "";
        for(let k = 0; k <= VMAX*10; k++){
          const v = k/10, big = k % 5 === 0, [x1, y1] = pt(v, R), [x2, y2] = pt(v, R - (big ? 22 : k % 5 === 0 ? 16 : 11));
          s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#334155" stroke-width="${big ? 1.8 : 1}"/>`;
          if(big){ const [tx, ty] = pt(v, R - 38); s += `<text x="${tx.toFixed(1)}" y="${(ty + 5).toFixed(1)}" text-anchor="middle" style="font:600 13px 'JetBrains Mono',monospace;fill:#334155">${v.toFixed(1)}</text>`; }
        }
        const [ax, ay] = pt(0, R), [bx, by] = pt(VMAX, R);
        s += `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)} A${R} ${R} 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)}" fill="none" stroke="#334155" stroke-width="1.2"/>`;
        const [nx, ny] = pt(needle(), R + 4);
        s += `<line x1="${CX}" y1="${CY}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#D0213A" stroke-width="2"/><circle cx="${CX}" cy="${CY}" r="7" fill="#334155"/>`;
        return s;
      }
      function meter(){
        const sc = scale(), [tx, ty] = pt(needle(), R - 8);
        let s = `<rect x="${CX - 225}" y="70" width="450" height="290" rx="16" fill="#2B3240" stroke="#4B5563"/>
          <rect x="${CX - 210}" y="84" width="420" height="250" rx="10" fill="#F4F1E8"/>
          <defs><clipPath id="ig-cells-face"><rect x="${CX - 210}" y="84" width="420" height="250" rx="10"/></clipPath></defs>
          <g clip-path="url(#ig-cells-face)">${sc}</g>
          <text x="${CX - 175}" y="318" style="font:700 24px Inter;fill:#334155">V</text>
          <text x="${CX + 195}" y="322" text-anchor="end" style="font:500 10px Inter;fill:#64748B">0–3 V · 0.1 V per division</text>
          <circle cx="${CX - 120}" cy="350" r="9" fill="#111" stroke="#666"/><text x="${CX - 133}" y="384" text-anchor="end" class="k-tag">− COM (black)</text>
          <circle cx="${CX + 120}" cy="350" r="9" fill="#D23B3B" stroke="#666"/><text x="${CX + 133}" y="384" class="k-tag">+ (red)</text>`;
        // magnifier on the needle tip
        s += `<defs><clipPath id="ig-cells-lc"><circle r="38"/></clipPath></defs>
          <g transform="translate(${CX} 410)"><circle r="38" fill="#F4F1E8"/><g clip-path="url(#ig-cells-lc)"><g transform="scale(2.4) translate(${(-tx).toFixed(1)} ${(-ty).toFixed(1)})">${sc}</g></g>
          <circle r="38" fill="none" stroke="var(--accent)" stroke-width="3"/></g><text x="${CX}" y="485" text-anchor="middle" class="k-lbl">magnifier on the needle tip</text>`;
        return s;
      }
      function cell(){
        const liq = el === "sugar" ? [235,232,215] : el === "salt" ? [205,225,245] : [200,222,245];
        let s = `<path d="${ChemKit.BEAKER(80, 440, 300, 190)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
          <rect x="81" y="300" width="298" height="138" fill="${ChemKit.rgba(liq, .45)}"/>
          <text x="230" y="476" text-anchor="middle" class="k-lbl">${ELEC[el].name}</text>`;
        const strip = (x, m, sign) => `<rect x="${x - 12}" y="210" width="24" height="200" rx="2" fill="rgb(${COL[m]})" stroke="rgba(0,0,0,.35)"/>
          <text x="${x}" y="300" text-anchor="middle" style="font:700 13px Inter;fill:#1F2937" transform="rotate(-90 ${x} 300)">${m}</text>
          <path d="M${x - 9} 200 l9 16 l9 -16 z" fill="${sign === "-" ? "#222" : "#C0392B"}"/>`;
        s += strip(160, black, "-") + strip(300, red, "+");
        const bw = `M160 200 V135 Q160 120 175 120 H435 Q450 120 450 135 V430 Q450 445 465 445 H${CX - 135} Q${CX - 120} 445 ${CX - 120} 430 V359`;
        const rw = `M300 200 V175 Q300 160 315 160 H405 Q420 160 420 175 V440 Q420 455 435 455 H${CX + 105} Q${CX + 120} 455 ${CX + 120} 440 V359`;
        s += `<path d="${bw}" stroke="#9AA3B2" stroke-width="5" fill="none"/><path d="${bw}" stroke="#1A1A1A" stroke-width="3" fill="none"/>
          <path d="${rw}" stroke="#C0392B" stroke-width="3" fill="none"/>`;
        const V = trueV();
        if(el === "acid" && Math.abs(V) > .1){
          const pos = V > 0 ? 300 : 160;
          for(let i = 0; i < 10; i++) s += `<circle cx="${pos + ((i*37) % 2 ? 15 : -15)}" cy="${400 - (i*17) % 90}" r="${1.6 + (i % 3)*.6}" fill="none" stroke="var(--txt2)"><animate attributeName="cy" from="${405 - (i*17) % 90}" to="305" dur="${1.2 + (i % 4)*.3}s" repeatCount="indefinite"/></circle>`;
        }
        if(el === "acid" && (black === "Mg" || red === "Mg")){ const mx = black === "Mg" ? 160 : 300;
          for(let i = 0; i < 6; i++) s += `<circle cx="${mx + (i % 2 ? 14 : -14)}" cy="${330 + i*12}" r="1.5" fill="none" stroke="var(--txt2)"/>`; }
        return s;
      }
      function fuel(){
        let s = `<g transform="translate(70 70)"><rect width="440" height="360" rx="14" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="20" y="28" class="k-tag">Hydrogen–oxygen fuel cell</text>
          <rect x="60" y="90" width="320" height="180" rx="8" fill="rgba(200,222,245,.35)" stroke="var(--txt2)"/>
          <rect x="120" y="90" width="18" height="180" fill="#5A6272"/><rect x="302" y="90" width="18" height="180" fill="#5A6272"/>
          <text x="220" y="185" text-anchor="middle" class="k-lbl">electrolyte</text>
          <path d="M0 140 H120" stroke="var(--accent)" stroke-width="3" marker-end=""/><text x="8" y="130" class="k-tag">H₂ in</text>
          <path d="M440 140 H320" stroke="var(--accent)" stroke-width="3"/><text x="370" y="130" class="k-tag">O₂ (air) in</text>
          <path d="M380 240 H440" stroke="var(--txt2)" stroke-width="3"/><text x="388" y="232" class="k-lbl">H₂O out</text>
          <path d="M129 90 V50 H311 V90" stroke="var(--txt2)" stroke-width="2.5" fill="none"/><circle cx="220" cy="50" r="16" fill="#FFF4B8" stroke="var(--txt2)"/><text x="220" y="55" text-anchor="middle" style="font:700 11px Inter;fill:#333">M</text>
          <text x="129" y="300" text-anchor="middle" class="k-tag">− electrode</text><text x="311" y="300" text-anchor="middle" class="k-tag">+ electrode</text>
          ${ChemKit.lines("Electrons flow through the motor from the hydrogen electrode to the oxygen electrode.", 64, 20, 330, 15)}</g>`;
        s += `<g transform="translate(560 70)"><rect width="370" height="360" rx="14" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="18" y="28" class="k-tag">How it works</text>
          ${ChemKit.lines("Hydrogen and oxygen are fed in continuously. Hydrogen is oxidised at one electrode and oxygen is reduced at the other. The chemical energy of the reaction is transferred directly as electrical energy.", 54, 18, 56, 17)}
          ${ChemKit.lines("Advantages: water is the only product; no CO₂ at the point of use; efficient. Disadvantages: hydrogen is flammable and hard to store; it is often made from fossil fuels.", 54, 18, 180, 17)}
          ${ChemKit.lines("Choose the overall equation in the controls.", 54, 18, 300, 17, "k-hint")}</g>`;
        return s;
      }
      function draw(){
        if(view === "fuel"){
          $("#ig-cells-scene").innerHTML = fuel();
          $("#ig-cells-status").textContent = "A hydrogen fuel cell (not a simple cell)";
          ctx.readout([["View", "Fuel cell"]]);
          return;
        }
        let s = cell() + meter();
        s += `<g transform="translate(24 50)"><text class="k-lbl" y="0">black lead: ${NAME[black]} · red lead: ${NAME[red]}</text></g>`;
        $("#ig-cells-scene").innerHTML = s;
        const V = trueV();
        $("#ig-cells-status").textContent = V < -.02 ? "Needle hits the stop left of zero — swap the leads" : "Read the voltmeter";
        ctx.readout([["Black (−) lead", NAME[black]], ["Red (+) lead", NAME[red]], ["Electrolyte", ELEC[el].name]]);
      }

      const cellWrap = ctx.html(`<div></div>`);
      const metals = ORDER.concat(["X"]).map(m => [m, m === "X" ? "unknown metal X" : NAME[m] + " (" + m + ")"]);
      const sb = ctx.select({ label:"Metal on the black (COM, −) lead", value:black, options:metals, parent:cellWrap, onChange(v){ black = v; fbNeg.innerHTML = ""; draw(); } });
      const sr = ctx.select({ label:"Metal on the red (+) lead", value:red, options:metals, parent:cellWrap, onChange(v){ red = v; fbNeg.innerHTML = ""; draw(); } });
      ctx.select({ label:"Electrolyte", value:el, options:Object.keys(ELEC).map(k => [k, ELEC[k].name]), parent:cellWrap, onChange(v){ el = v; draw(); } });
      ctx.buttons([{ label:"Swap the leads", onClick(){ [black, red] = [red, black]; sb.set(black); sr.set(red); draw(); } }], cellWrap);

      /* the student's reading */
      const rbox = ctx.html(`<div class="ctl"><label><span>Voltmeter reading / V</span></label>
        <div style="display:flex;gap:6px"><input class="inp" type="number" step="any" placeholder="e.g. 1.05"><button class="btn small" type="button">Enter</button></div><div style="margin-top:6px"></div></div>`, cellWrap);
      const rin = rbox.querySelector("input"), rfb = rbox.querySelector("div:last-child");
      const enter = () => {
        const v = parseFloat(rin.value), t = trueV();
        if(t < -.02){ rfb.innerHTML = `<div class="note bad">The needle is pressed against the stop below zero — you can’t read it. Swap the leads.</div>`; return; }
        if(!isFinite(v) || Math.abs(v - Math.max(0, t)) > .05 + 1e-9){ rfb.innerHTML = `<div class="note bad">Look again — that doesn’t match the scale. Use the magnifier: each small division is 0.1 V.</div>`; return; }
        rfb.innerHTML = ""; rin.value = "";
        n++;
        ctx.record({ n:"Cell " + n, neg:NAME[black], pos:NAME[red], el:ELEC[el].name, V:v });
        if(el !== "sugar" && ((black === "Zn" && red === "Cu") || (black === "Cu" && red === "Zn"))) ctx.complete("read");
        if(el === "sugar" || black === red){ ctx.complete("nonel"); }
        const vsCu = new Set(ctx.rows().filter(r => (r.neg === "copper" || r.pos === "copper") && r.V > .05 && !/sugar/.test(r.el)).map(r => r.neg === "copper" ? r.pos : r.neg));
        if(["magnesium","zinc","iron","lead","silver"].every(m => vsCu.has(m))) ctx.complete("series");
        draw();
      };
      rbox.querySelector("button").onclick = enter;
      rin.addEventListener("keydown", e => { if(e.key === "Enter") enter(); });

      /* negative terminal */
      const negBox = ctx.html(`<div></div>`, cellWrap);
      const sNeg = ctx.select({ label:"Which metal is the negative terminal of this cell?", value:"", options:[["","— choose —"]].concat(metals), parent:negBox });
      const fbNeg = ctx.html(`<div></div>`, negBox);
      ctx.buttons([{ label:"Check terminal", onClick(){
        if(black === red || el === "sugar"){ fbNeg.innerHTML = `<div class="note bad">This arrangement gives no voltage — build a cell with two different metals in an electrolyte.</div>`; return; }
        const recorded = ctx.rows().some(r => (r.neg === NAME[black] && r.pos === NAME[red]) || (r.neg === NAME[red] && r.pos === NAME[black]));
        if(!recorded){ fbNeg.innerHTML = `<div class="note bad">Record a reading for this pair of metals first.</div>`; return; }
        const neg = EX[black] < EX[red] ? black : red;
        if(sNeg.get() === neg){ ctx.complete("neg"); fbNeg.innerHTML = `<div class="note ok">Correct: ${NAME[neg]} is more reactive, loses electrons and is the negative terminal. The reading is positive when the negative terminal is on the black (COM) lead.</div>`; }
        else fbNeg.innerHTML = `<div class="note bad">The more reactive metal is the negative terminal. Hint: the needle reads forwards when the negative terminal is on the black lead.</div>`;
      } }], negBox);

      /* predictions and X */
      const pairV = (a, b) => { const r = ctx.rows().filter(r => !/sugar/.test(r.el) && ((r.neg === NAME[a] && r.pos === NAME[b]) || (r.neg === NAME[b] && r.pos === NAME[a])) && r.V > 0).pop(); return r ? r.V : null; };
      Kit.answer(ctx, "Predicted voltage of a Mg–Zn cell / V", "e.g. 0.9", v => {
        const a = pairV("Mg", "Cu"), b = pairV("Zn", "Cu");
        if(a === null || b === null) return [false, "Record a Mg–Cu cell and a Zn–Cu cell first."];
        const p = a - b;
        if(Math.abs(v - p) <= .1){ ctx.complete("predict"); return [true, `Good: ${a.toFixed(2)} − ${b.toFixed(2)} = ${p.toFixed(2)} V. Now build Mg–Zn and check it: magnesium will be the negative terminal.`]; }
        return [false, "Both cells share copper. The Mg–Zn voltage ≈ V(Mg–Cu) − V(Zn–Cu)."];
      }, cellWrap);
      const xs = ctx.select({ label:"Where does metal X go in the reactivity series?", value:"", options:[["","— choose —"]].concat(SPOTS), parent:cellWrap });
      const xfb = ctx.html(`<div></div>`, cellWrap);
      ctx.buttons([{ label:"Check X", onClick(){
        const used = ctx.rows().filter(r => (r.neg === NAME.X || r.pos === NAME.X) && !/sugar/.test(r.el));
        if(used.length < 2){ xfb.innerHTML = `<div class="note bad">Measure X against at least two different known metals first.</div>`; return; }
        if(xs.get() === X[1]){ ctx.complete("unknown"); xfb.innerHTML = `<div class="note ok">Correct: X is ${X[1]}. Compare which metal is the negative terminal and the size of each voltage.</div>`; }
        else xfb.innerHTML = `<div class="note bad">Not quite. Pair X with copper: is X the negative terminal? Compare its voltage with the voltages of the known metals against copper.</div>`;
      } }], cellWrap);

      /* fuel cell */
      const fuelWrap = ctx.html(`<div></div>`);
      const fq = ctx.select({ label:"Overall reaction in a hydrogen–oxygen fuel cell", value:"", parent:fuelWrap, options:[["","— choose —"],["a","2H₂ + O₂ → 2H₂O"],["b","2H₂O → 2H₂ + O₂"],["c","H₂ + O₂ → H₂O₂"],["d","CH₄ + 2O₂ → CO₂ + 2H₂O"]] });
      const ffb = ctx.html(`<div></div>`, fuelWrap);
      ctx.buttons([{ label:"Check", onClick(){
        if(fq.get() === "a"){ ctx.complete("fuel"); ffb.innerHTML = `<div class="note ok">Correct: hydrogen and oxygen combine to form water only. Hydrogen is oxidised (loses electrons) at the negative electrode; oxygen is reduced at the positive electrode.</div>`; }
        else ffb.innerHTML = `<div class="note bad">${fq.get() === "b" ? "That is the electrolysis of water — the reverse process, which uses electricity." : "The fuel is hydrogen, the oxidant is oxygen, and water is the only product."}</div>`;
      } }], fuelWrap);

      ctx.seg({ label:"View", value:view, options:[["cell","Simple cell"],["fuel","Hydrogen fuel cell"]], parent:ctx.controls, onChange(v){ view = v; show(); } });
      ctx.controls.insertBefore(ctx.controls.lastChild, ctx.controls.firstChild);
      function show(){ cellWrap.style.display = view === "cell" ? "" : "none"; fuelWrap.style.display = view === "fuel" ? "" : "none"; draw(); }
      show();
    }
  });
})();
