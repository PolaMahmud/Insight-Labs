"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMISTRY · IGCSE (0620) — part 3
   Energetics: exothermic and endothermic reactions in a polystyrene cup ·
   Reactivity series: metals with water, steam and acid · metal
   displacement grid with an unknown metal X · halogen displacement ·
   rusting and sacrificial protection
══════════════════════════════════════════════════════════════════ */

/* small shared helpers for this file */
const IG3 = (function(){
  const note = (ok, msg) => `<div class="note ${ok ? "ok" : "bad"}">${msg}</div>`;
  /* a typed value box whose handler returns [ok, msg] */
  function box(ctx, label, ph, onEnter, btn){
    const b = ctx.html(`<div class="ctl"><label><span>${label}</span></label>
      <div style="display:flex;gap:6px"><input class="inp" type="number" step="any" placeholder="${ph}"><button class="btn small" type="button">${btn || "Enter"}</button></div>
      <div style="margin-top:6px"></div></div>`);
    const input = b.querySelector("input"), fb = b.lastElementChild;
    const go = () => {
      const v = parseFloat(input.value);
      if(!isFinite(v)){ fb.innerHTML = note(false, "Enter a number."); return; }
      const [ok, msg] = onEnter(v);
      fb.innerHTML = msg ? note(ok, msg) : "";
    };
    b.querySelector("button").onclick = go;
    input.addEventListener("keydown", e => { if(e.key === "Enter") go(); });
    return { box:b, input, fb, clear(){ fb.innerHTML = ""; input.value = ""; } };
  }
  /* rank items: n selects, most → least */
  function rankBox(ctx, label, items, onCheck, parent){
    const b = ctx.html(`<div class="ctl"><div class="lbl"><span>${label}</span></div>
      <div style="display:grid;grid-template-columns:repeat(${Math.min(items.length, 3)},1fr);gap:.35rem;margin-bottom:.4rem">${items.map((_, i) => `<select class="inp" aria-label="Position ${i + 1}"><option value="">${i === 0 ? "Most" : i === items.length - 1 ? "Least" : (i + 1) + "."}…</option>${items.map(o => `<option>${o}</option>`).join("")}</select>`).join("")}</div>
      <div class="btns"><button class="btn small primary" type="button">Check order</button></div><div style="margin-top:.5rem"></div></div>`, parent);
    const sels = [...b.querySelectorAll("select")], fb = b.lastElementChild;
    b.querySelector("button").onclick = () => {
      const v = sels.map(s => s.value);
      if(v.some(x => !x) || new Set(v).size !== v.length){ fb.innerHTML = note(false, "Use every item exactly once."); return; }
      const [ok, msg] = onCheck(v); fb.innerHTML = note(ok, msg);
    };
    return { box:b, sels, fb };
  }
  /* a select + check button */
  function choice(ctx, label, opts, onCheck, parent, btn){
    const b = ctx.html(`<div class="ctl"><label><span>${label}</span></label>
      <select class="inp" style="margin-bottom:.4rem"><option value="">Choose…</option>${opts.map((o, i) => `<option value="${i}">${ctx.esc(o)}</option>`).join("")}</select>
      <div class="btns"><button class="btn small primary" type="button">${btn || "Check"}</button></div><div style="margin-top:.5rem"></div></div>`, parent);
    const sel = b.querySelector("select"), fb = b.lastElementChild;
    b.querySelector("button").onclick = () => {
      if(sel.value === ""){ fb.innerHTML = note(false, "Make a choice first."); return; }
      const [ok, msg] = onCheck(+sel.value, opts[+sel.value]); fb.innerHTML = msg ? note(ok, msg) : "";
    };
    return { box:b, sel, fb, clear(){ fb.innerHTML = ""; sel.value = ""; } };
  }
  const rgb = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a === undefined ? .6 : a})`;
  return { note, box, rankBox, choice, rgb };
})();

/* ───────────── EXOTHERMIC AND ENDOTHERMIC REACTIONS ───────────── */
(function(){
  const C = 4.18, P = "ig-energy";
  /* liq = volume (cm³ ≈ g) in the cup before adding; H = enthalpy change per mol of n() in kJ mol⁻¹ */
  const RX = {
    neut:  { short:"HCl + NaOH", cup:"25.0 cm³ of 2.00 mol dm⁻³ NaOH", what:"dilute hydrochloric acid, 2.00 mol dm⁻³", kind:"vol", min:5, max:40, step:5, def:25, liq:25,
             n:v => Math.min(2*v, 50)/1000, nTxt:"moles of water formed = moles of HCl (or NaOH if the acid is in excess)", H:-57.1, tau:2.5,
             eq:"HCl + NaOH → NaCl + H₂O", reac:"HCl + NaOH", prod:"NaCl + H₂O", sol:[215,228,240,.45] },
    nh4no3:{ short:"NH₄NO₃ dissolving", cup:"50.0 cm³ of distilled water", what:"ammonium nitrate (white crystals)", kind:"mass", min:1, max:10, step:1, def:5, liq:50,
             n:m => m/80.0, nTxt:"moles of NH₄NO₃ = mass ÷ 80", H:25.7, tau:7, eq:"NH₄NO₃(s) → NH₄⁺(aq) + NO₃⁻(aq)", solid:[250,250,250], sol:[215,228,240,.45] },
    nh4cl: { short:"NH₄Cl dissolving", cup:"50.0 cm³ of distilled water", what:"ammonium chloride (white crystals)", kind:"mass", min:1, max:10, step:1, def:5, liq:50,
             n:m => m/53.5, nTxt:"moles of NH₄Cl = mass ÷ 53.5", H:14.8, tau:7, eq:"NH₄Cl(s) → NH₄⁺(aq) + Cl⁻(aq)", solid:[250,250,250], sol:[215,228,240,.45] },
    zn:    { short:"Zn + CuSO₄", cup:"25.0 cm³ of 0.500 mol dm⁻³ CuSO₄(aq)", what:"zinc powder (grey)", kind:"mass", min:.2, max:3, step:.2, def:2, liq:25,
             n:m => Math.min(m/65.4, .0125), nTxt:"moles of the limiting reactant: CuSO₄ = 0.0125 mol unless less than 0.82 g of zinc is used (then mass ÷ 65.4)", H:-217, tau:12,
             eq:"Zn + CuSO₄ → ZnSO₄ + Cu", solid:[150,155,165], sol:[70,140,225,.7] },
    mg:    { short:"Mg + HCl", cup:"50.0 cm³ of 1.00 mol dm⁻³ HCl", what:"magnesium ribbon", kind:"mass", min:.05, max:.3, step:.05, def:.2, liq:50,
             n:m => Math.min(m/24.3, .025), nTxt:"moles of Mg = mass ÷ 24.3 (the acid is in excess)", H:-462, tau:9, eq:"Mg + 2HCl → MgCl₂ + H₂", solid:[200,205,212], sol:[215,228,240,.45] },
    cit:   { short:"Citric acid + NaHCO₃", cup:"50.0 cm³ of 1.00 mol dm⁻³ citric acid", what:"sodium hydrogencarbonate (white powder)", kind:"mass", min:1, max:10, step:1, def:5, liq:50,
             n:m => Math.min(m/84.0, .15), nTxt:"moles of NaHCO₃ = mass ÷ 84 (the citric acid is in excess)", H:25.0, tau:6,
             eq:"C₆H₈O₇ + 3NaHCO₃ → Na₃C₆H₅O₇ + 3CO₂ + 3H₂O", solid:[250,250,250], sol:[215,228,240,.45] },
    cuso4: { short:"Anhydrous CuSO₄ dissolving", cup:"50.0 cm³ of distilled water", what:"anhydrous copper(II) sulfate (white powder)", kind:"mass", min:1, max:8, step:1, def:5, liq:50,
             n:m => m/159.6, nTxt:"moles of CuSO₄ = mass ÷ 159.6", H:-66.5, tau:6, eq:"CuSO₄(s) → Cu²⁺(aq) + SO₄²⁻(aq)", solid:[238,240,236], sol:[215,228,240,.45] }
  };
  const ORDER = Object.keys(RX);
  const BONDS = [
    { eq:"H₂ + Cl₂ → 2HCl", brk:[["H–H",1,436],["Cl–Cl",1,242]], mk:[["H–Cl",2,431]] },
    { eq:"CH₄ + 2O₂ → CO₂ + 2H₂O", brk:[["C–H",4,413],["O=O",2,498]], mk:[["C=O",2,805],["O–H",4,464]] },
    { eq:"N₂ + 3H₂ → 2NH₃", brk:[["N≡N",1,945],["H–H",3,436]], mk:[["N–H",6,391]] },
    { eq:"2H₂ + O₂ → 2H₂O", brk:[["H–H",2,436],["O=O",1,498]], mk:[["O–H",4,464]] }
  ];
  const sum = l => l.reduce((s, [, n, e]) => s + n*e, 0);
  const yOf = T => 380 - (T + 10)/70*330;            // thermometer scale −10 … 60 °C

  Lab.register({
    id:P, subject:"chemistry", level:["igcse"], topic:"Chemical energetics", interactive:true,
    title:"Exothermic and endothermic reactions",
    summary:"Polystyrene cup and thermometer: neutralisation, dissolving ammonium nitrate, ammonium chloride and anhydrous copper(II) sulfate, zinc + copper(II) sulfate, magnesium + acid and citric acid + sodium hydrogencarbonate. Read the temperatures, classify, plot ΔT and calculate Q = mcΔT.",
    aim:"Measure the temperature change for several reactions, classify them as exothermic or endothermic, investigate how ΔT depends on the amount of reactant, and (extended) calculate the energy change and the molar enthalpy change.",
    variables:{ iv:"Mass of solid (g) or volume of acid (cm³)", dv:"Temperature change ΔT (°C)", cv:["Same volume of liquid in the cup","Same starting temperature (room temperature)","Stir the same way; lid on the cup"] },
    stageTitle:"Polystyrene cup calorimeter", controlsTitle:"Experiment",
    thumb:`<svg viewBox="0 0 300 140"><path d="M100 50 L110 128 H160 L170 50 Z" fill="#F4F6FA" stroke="#A2ACBD" stroke-width="2"/><rect x="132" y="8" width="6" height="110" rx="3" fill="#fff" stroke="#A2ACBD"/><rect x="133.5" y="58" width="3" height="60" fill="#E0334A"/><path d="M200 40 v80 M200 120 h80" stroke="#A2ACBD" stroke-width="2"/><path d="M206 60 h20 q12 0 18 30 q6 20 14 20 h18" fill="none" stroke="#FF8A3D" stroke-width="3"/></svg>`,
    challenges:[
      { id:"exo",      title:"Temperature rise", text:"Read the initial and maximum temperature for an exothermic reaction and record ΔT." },
      { id:"classify", title:"Exo or endo?", text:"Correctly classify all seven reactions from your own readings." },
      { id:"vary",     title:"Vary the amount", text:"Do at least four runs of one reaction with different masses or volumes, then plot ΔT against the amount." },
      { id:"q",        title:"Q = mcΔT", text:"Extended: calculate the energy change for one of your runs." },
      { id:"neut",     title:"Molar enthalpy", text:"Extended: calculate the molar enthalpy change of neutralisation from your data." },
      { id:"bonds",    title:"Bond energies", text:"Extended: use bond energies to calculate ΔH for a reaction." }
    ],
    columns:[{key:"run",label:"Run"},{key:"rx",label:"Reaction"},{key:"m",label:"Mass of solid / g",dp:2},{key:"V",label:"Volume of HCl / cm³",dp:1},
      {key:"T1",label:"Initial T / °C",dp:1},{key:"T2",label:"Max or min T / °C",dp:1},{key:"dT",label:"ΔT / °C",dp:1}],
    series:"rx",
    graph:{ x:["m","V"], y:["dT"], fit:"linear" },
    questions:[
      { q:"How do you know from your readings whether a reaction is exothermic or endothermic?",
        a:"Exothermic: the temperature of the mixture rises (energy is transferred to the surroundings). Endothermic: the temperature falls (energy is taken in from the surroundings)." },
      { q:"Why is a polystyrene cup with a lid used instead of a glass beaker?",
        a:"Polystyrene is a poor conductor (good insulator) and the lid reduces heat loss by convection and evaporation, so the measured temperature change is closer to the true value." },
      { q:"The thermometer is read to the nearest 0.5 °C. What is the uncertainty in ΔT, and how could it be reduced?",
        a:"Each reading is ±0.5 °C and ΔT uses two readings, so up to ±1 °C. Use a thermometer with finer divisions (0.1 °C, digital) or larger amounts to give a bigger ΔT." },
      { q:"For zinc + copper(II) sulfate, ΔT stops increasing once more than about 0.8 g of zinc is used. Explain.",
        a:"Above 0.82 g the zinc is in excess: all 0.0125 mol of CuSO₄ has reacted, so no more energy can be released. The copper(II) sulfate is the limiting reactant." },
      { q:"Explain in terms of bonds why a reaction is exothermic.",
        a:"Bond breaking is endothermic and bond making is exothermic. A reaction is exothermic when more energy is released making the new bonds in the products than is taken in breaking the bonds in the reactants." },
      { q:"Draw and label the energy level diagram for an endothermic reaction.",
        a:"Products drawn higher than reactants; an upward arrow from reactants to products labelled ΔH (positive). The curve rises to a peak; the activation energy Ea is the height from the reactants to the peak." },
      { q:"State two sources of error in this experiment and an improvement for each.",
        a:"Heat lost to (or gained from) the surroundings — use a lid and a beaker round the cup, or extrapolate a cooling curve. The maximum temperature may be missed — stir and read every few seconds, or use a data logger. Some solid may stick to the weighing boat — weigh by difference." },
      { q:"Suggest a hazard and a precaution for these reactions.",
        a:"Hydrochloric acid and sodium hydroxide are irritant/corrosive and copper(II) sulfate is harmful: wear eye protection and gloves. Hydrogen from magnesium + acid is flammable: no naked flames nearby." }
    ],
    setup(ctx){
      const Tamb = Kit.round(19 + Math.random()*4, 2);
      const H = {}; ORDER.forEach(k => H[k] = RX[k].H*(.95 + Math.random()*.06));
      const k = .003;
      let rx = "neut", amt = RX.neut.def, speed = 1, paused = false, S;
      let run = Math.max(0, ...ctx.rows().map(r => +String(r.run).replace(/\D/g, "") || 0));
      const classified = new Set();

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="${P}-svg"><defs>${Kit.DEFS}<clipPath id="${P}-cupc"><path d="M140 280 L152 430 H268 L280 280 Z"/></clipPath></defs>${Kit.bench(960, 450)}
        <g id="${P}-static"></g><g id="${P}-dyn"></g><g id="${P}-lens"></g><text x="24" y="30" class="k-status" id="${P}-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector(`#${P}-svg`), $ = s => svg.querySelector(s);
      const mmss = t => `${Math.floor(t/60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

      function newRun(){
        run++;
        const R = RX[rx];
        const actual = R.kind === "vol" ? amt : Math.max(.01, Kit.round(amt*(1 + (Math.random() - .5)*.05), 2));
        S = { rx, R, amt:actual, T:Tamb + (Math.random() - .5)*.6, t:0, tAdd:null, src:[], m:R.liq, T1:null, T2:null, Tx:null, rate:0, done:false, cls:false, label:"Run " + run, Q:0 };
        drawStatic();
      }
      const prog = () => S.tAdd === null ? 0 : 1 - Math.exp(-(S.t - S.tAdd)/S.R.tau);

      function energyCard(){
        let s = `<g transform="translate(680 240)"><rect width="265" height="200" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>`;
        if(!S.cls) return s + `<text x="14" y="24" class="k-tag">Energy level diagram</text>${ChemKit.lines("Record the maximum or minimum temperature, then classify this run to draw its energy level diagram.", 40, 14, 50, 17)}</g>`;
        const exo = S.Q > 0, yR = exo ? 85 : 155, yP = exo ? 155 : 100, pk = Math.min(yR, yP) - 45;
        s += ChemKit.lines(S.R.eq, 40, 14, 18, 14, "k-lbl");
        s += `<line x1="22" y1="190" x2="22" y2="38" stroke="var(--txt2)" stroke-width="1.4"/><path d="M18 44 L22 36 L26 44" fill="none" stroke="var(--txt2)" stroke-width="1.4"/>
          <text x="16" y="120" transform="rotate(-90 16 120)" text-anchor="middle" class="k-lbl" style="font-size:10px">energy</text>
          <text x="140" y="194" text-anchor="middle" class="k-lbl" style="font-size:10px">progress of reaction</text>
          <path d="M30 ${yR} H95 C115 ${yR} 115 ${pk} 130 ${pk} C145 ${pk} 150 ${yP} 165 ${yP} H215" fill="none" stroke="var(--accent)" stroke-width="2.4"/>
          <line x1="95" y1="${yR}" x2="245" y2="${yR}" stroke="var(--txt3)" stroke-dasharray="3 3"/>
          <line x1="238" y1="${yR}" x2="238" y2="${yP + (exo ? -6 : 6)}" stroke="var(--txt)" stroke-width="1.5"/><path d="M233 ${yP + (exo ? -8 : 8)} L238 ${yP} L243 ${yP + (exo ? -8 : 8)}" fill="none" stroke="var(--txt)" stroke-width="1.5"/>
          <text x="232" y="${(yR + yP)/2 + 4}" text-anchor="end" class="k-tag">ΔH ${exo ? "−" : "+"}</text>
          <line x1="55" y1="${pk}" x2="130" y2="${pk}" stroke="var(--txt3)" stroke-dasharray="3 3"/>
          <line x1="62" y1="${yR}" x2="62" y2="${pk + 6}" stroke="var(--txt2)" stroke-width="1.2"/><path d="M58 ${pk + 8} L62 ${pk} L66 ${pk + 8}" fill="none" stroke="var(--txt2)" stroke-width="1.2"/>
          <text x="56" y="${(yR + pk)/2 + 4}" text-anchor="end" class="k-lbl">Ea</text>
          <text x="30" y="${yR + 14}" class="k-lbl">reactants</text><text x="170" y="${yP - 5}" class="k-lbl">products</text></g>`;
        return s;
      }
      function drawStatic(){
        const R = S.R, added = S.tAdd !== null;
        let s = `<path d="M120 262 V440 Q120 448 128 448 H292 Q300 448 300 440 V262" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
          <rect id="${P}-liq" x="140" y="300" width="140" height="140" clip-path="url(#${P}-cupc)"/>
          <g id="${P}-fx" clip-path="url(#${P}-cupc)">${added && (S.rx === "mg" || S.rx === "cit") ? Array.from({ length:16 }, (_, i) => `<circle cx="${160 + (i*37) % 100}" cy="420" r="${2 + (i % 3)}" fill="none" stroke="var(--txt2)" stroke-width="1"><animate attributeName="cy" from="${425 - (i % 5)*4}" to="320" dur="${.7 + (i % 4)*.2}s" repeatCount="indefinite"/></circle>`).join("") : ""}</g>
          <path d="M140 280 L152 430 H268 L280 280 Z" fill="rgba(250,250,252,.35)" stroke="#C9CDD6" stroke-width="2"/>
          <rect x="134" y="272" width="152" height="10" rx="3" fill="#F4F6FA" stroke="#C9CDD6"/>
          <text x="210" y="468" text-anchor="middle" class="k-lbl">polystyrene cup with lid, in a beaker</text>`;
        /* thermometer drawn by hand so its scale card does not cover the cup */
        s += `<rect x="205" y="42" width="10" height="358" rx="5" fill="#fff" stroke="#9AA3B2"/><circle cx="210" cy="404" r="8" fill="#E0334A"/><rect id="${P}-col" x="208" width="4" fill="#E0334A"/>`;
        for(let T = -10; T <= 60; T += 5){ const y = yOf(T); s += `<line x1="215" y1="${y}" x2="${T % 10 === 0 ? 222 : 219}" y2="${y}" stroke="#334155" stroke-width=".9"/>`;
          if(T % 10 === 0) s += `<text x="225" y="${y + 3}" style="font:500 9px 'JetBrains Mono',monospace;fill:var(--txt2)">${T}</text>`; }
        /* the reactant to add */
        if(R.kind === "vol"){
          const h = 160*S.amt/40;
          s += `<g transform="translate(330 260)"><rect x="0" y="0" width="34" height="180" rx="3" fill="url(#k-glass)" stroke="var(--txt2)"/>
            ${added ? "" : `<rect x="2" y="${178 - h}" width="30" height="${h}" fill="rgba(200,220,240,.55)"/>`}<rect x="-6" y="178" width="46" height="6" rx="2" fill="var(--txt3)"/>
            <text x="17" y="200" text-anchor="middle" class="k-lbl">${added ? "emptied" : S.amt.toFixed(1) + " cm³ HCl"}</text></g>`;
        }else{
          s += ChemKit.balance(300, 330, added ? 0 : S.amt, added ? "tipped into the cup" : "solid on the balance");
          if(!added) s += `<ellipse cx="385" cy="345" rx="34" ry="7" fill="rgba(220,230,240,.6)" stroke="var(--txt3)"/>` + (S.rx === "mg"
            ? `<path d="M360 341 q12 -6 25 0 t25 0" fill="none" stroke="rgb(${R.solid})" stroke-width="3"/>`
            : `<ellipse cx="385" cy="340" rx="${10 + 12*Math.min(1, S.amt/R.max)}" ry="5" fill="${IG3.rgb(R.solid, 1)}" stroke="rgba(0,0,0,.2)"/>`);
        }
        s += `<g transform="translate(680 50)"><rect width="265" height="175" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="14" y="22" class="k-tag">${ctx.esc(S.label)} · ${ctx.esc(R.short)}</text>
          ${ChemKit.lines("In the cup: " + R.cup, 40, 14, 42, 15)}
          ${ChemKit.lines("To add: " + (R.kind === "vol" ? S.amt.toFixed(1) + " cm³ of " : S.amt.toFixed(2) + " g of ") + R.what, 40, 14, 76, 15)}
          <text x="14" y="122" class="k-lbl">initial T: ${S.T1 === null ? "—" : S.T1.toFixed(1) + " °C"}</text>
          <text x="140" y="122" class="k-lbl">max / min T: ${S.T2 === null ? "—" : S.T2.toFixed(1) + " °C"}</text>
          <text x="14" y="144" class="k-lbl" id="${P}-clock"></text>
          <text x="14" y="164" class="k-lbl">room temperature ≈ ${Math.round(Tamb)} °C</text></g>`;
        s += energyCard();
        $(`#${P}-static`).innerHTML = s;
        dyn();
      }
      function dyn(){
        const R = S.R, p = prog(), added = S.tAdd !== null;
        const vol = added && R.kind === "vol" ? 25 + S.amt : R.liq, top = 430 - vol*2.0;
        let col = R.sol;
        if(S.rx === "zn" && added){ const f = p*Math.min(1, S.amt/65.4/.0125); col = [...ChemKit.mix([70,140,225], [225,232,240], f), .7 - .45*f]; }
        if(S.rx === "cuso4" && added) col = [...ChemKit.mix([225,232,240], [90,160,230], p), .45 + .2*p];
        const liq = $(`#${P}-liq`); liq.setAttribute("y", top); liq.setAttribute("height", 440 - top); liq.setAttribute("fill", IG3.rgb(col, col[3]));
        /* undissolved solid / deposits at the bottom of the cup */
        let fx = "";
        if(added && R.kind === "mass"){
          const left = S.rx === "zn" ? 1 : 1 - p;
          for(let i = 0; i < 18; i++){ const r = ((i*53) % 71)/71;
            const c = S.rx === "zn" ? ChemKit.mix([150,155,165], [170,90,45], p*Math.min(1, .0125*65.4/S.amt*1.2)) : R.solid;
            if(r < left || S.rx === "zn") fx += `<circle cx="${165 + (i*41) % 92}" cy="${424 - (i % 4)*3}" r="${S.rx === "mg" ? 0 : 2.6}" fill="rgb(${c})"/>`; }
          if(S.rx === "mg" && p < .97) fx += `<path d="M180 ${top + 14} q15 -5 30 0 t30 0" fill="none" stroke="rgb(${R.solid})" stroke-width="${3*(1 - p) + .5}"/>`;
        }
        const g = $(`#${P}-fx`), old = g.querySelectorAll(".dep"); old.forEach(n => n.remove());
        if(fx){ const tmp = document.createElementNS("http://www.w3.org/2000/svg", "g"); tmp.setAttribute("class", "dep"); tmp.innerHTML = fx; g.appendChild(tmp); }
        const c = $(`#${P}-col`), y = yOf(Math.max(-10, Math.min(60, S.T))); c.setAttribute("y", y); c.setAttribute("height", 400 - y);
        $(`#${P}-clock`).textContent = `clock ${mmss(S.t)}${paused ? " · paused" : ""}${speed > 1 ? " · ×" + speed : ""}`;
        $(`#${P}-lens`).innerHTML = ChemKit.lens({ id:`${P}-l`, cx:520, cy:190, r:100, S:30, value:S.T, minor:1, major:1, down:false, tube:6, flat:true, liquid:"#E0334A", label:"magnifier (thermometer graduated in 1 °C)" })
          + `<line x1="216" y1="${y}" x2="420" y2="190" stroke="var(--accent)" stroke-dasharray="3 3"/>`;
        $(`#${P}-status`).textContent = S.done ? "Run complete — classify it, calculate, or start a new run"
          : S.T1 === null ? "Read and enter the initial temperature" : !added ? "Now add the reactant and stir"
          : "Stir and watch: enter the highest (or lowest) temperature reached";
      }

      function step(dt){
        const n = Math.ceil(dt/.25), h = dt/n, T0 = S.T;
        for(let i = 0; i < n; i++){
          let Pw = 0; S.src.forEach(q => { const a = S.t - q.t0; if(a >= 0) Pw += q.Q/q.tau*Math.exp(-a/q.tau); });
          S.T += (Pw/(S.m*C) - k*(S.T - Tamb))*h; S.t += h;
        }
        S.rate = dt > 0 ? (S.T - T0)/dt : 0;
        if(S.tAdd !== null) S.Tx = S.Q > 0 ? Math.max(S.Tx, S.T) : Math.min(S.Tx, S.T);
      }
      let acc = 0;
      ctx.frame(dt => { if(!paused) step(dt*speed); acc += dt; if(acc > .08){ acc = 0; dyn(); } });

      function readErr(v){
        if(Math.abs(v*2 - Math.round(v*2)) > 1e-6) return "Read to the nearest 0.5 °C (for example 21.0 or 21.5).";
        if(Math.abs(v - S.T) > .5 + 1e-9) return "Look again — that doesn’t match the thermometer.";
        return null;
      }

      /* ── controls ── */
      ctx.select({ label:"Reaction", value:rx, options:ORDER.map(k => [k, RX[k].short]), onChange(v){ rx = v; amt = RX[v].def; syncAmt(); if(!S.done) run--; newRun(); } });
      const amtWrap = ctx.html(`<div></div>`);
      let amtSl;
      function syncAmt(){
        amtWrap.innerHTML = ""; const R = RX[rx];
        amtSl = ctx.slider({ parent:amtWrap, label:R.kind === "vol" ? "Volume of HCl to add" : "Mass of solid to add", unit:R.kind === "vol" ? "cm³" : "g", min:R.min, max:R.max, step:R.step, value:amt,
          fmt:v => R.kind === "vol" ? v.toFixed(1) : v.toFixed(2), onInput(v){ amt = v; if(!S.done) run--; newRun(); } });
      }
      syncAmt();
      const [addBtn] = ctx.buttons([{ label:"Add and stir", primary:true, onClick(){
        if(S.tAdd !== null) return ctx.toast("Already added — start a new run");
        if(S.T1 === null) return ctx.toast("Read the initial temperature first");
        const R = S.R; S.tAdd = S.t; S.Tx = S.T;
        if(R.kind === "vol") S.m = 25 + S.amt;
        S.Q = R.n(S.amt)*(-H[S.rx])*1000; S.src.push({ t0:S.t, Q:S.Q, tau:R.tau });
        drawStatic();
      } }, { label:"Empty cup · new run", onClick(){ if(!S.done) run--; newRun(); } }]);
      ctx.seg({ label:"Clock", value:1, options:[[1,"×1"],[4,"×4"],["p","Pause"]], onChange(v){ if(v === "p") paused = true; else { paused = false; speed = v; } } });

      IG3.box(ctx, "Initial temperature / °C (to 0.5 °C)", "e.g. 21.5", v => {
        if(S.tAdd !== null) return [false, "The reactant is already in — start a new run to read a fresh initial temperature."];
        const e = readErr(v); if(e) return [false, e];
        S.T1 = v; drawStatic(); return [true, `Initial temperature ${v.toFixed(1)} °C. Now add the reactant.`];
      });
      IG3.box(ctx, "Maximum or minimum temperature / °C", "e.g. 34.0", v => {
        if(S.done) return [false, "Already recorded — start a new run."];
        if(S.tAdd === null) return [false, "Add the reactant first."];
        const e = readErr(v); if(e) return [false, e];
        if((S.Q > 0 && S.rate > .02) || (S.Q < 0 && S.rate < -.02)) return [false, "The temperature is still changing — keep stirring and wait for the highest or lowest reading."];
        S.T2 = v; S.done = true;
        const dT = Kit.round(v - S.T1, 1), R = S.R;
        ctx.record({ run:S.label, rx:R.short, m:R.kind === "mass" ? S.amt : "", V:R.kind === "vol" ? S.amt : "", T1:S.T1, T2:v, dT });
        if(dT >= 1) ctx.complete("exo");
        const same = ctx.rows().filter(r => r.rx === R.short), amts = new Set(same.map(r => R.kind === "vol" ? r.V : r.m));
        if(amts.size >= 4) ctx.complete("vary");
        drawStatic();
        const late = Math.abs(v - S.Tx) > 1 ? ` Note: the ${S.Q > 0 ? "highest" : "lowest"} temperature reached was about ${S.Tx.toFixed(1)} °C — read it sooner next time.` : "";
        return [true, `Recorded: ΔT = ${dT > 0 ? "+" : "−"}${Math.abs(dT).toFixed(1)} °C.${late}`];
      });

      const clsBox = ctx.html(`<div class="ctl"><div class="lbl"><span>Classify this run</span></div><div class="btns"><button class="btn small" type="button" data-c="exo">Exothermic</button><button class="btn small" type="button" data-c="endo">Endothermic</button></div><div style="margin-top:.5rem"></div></div>`);
      clsBox.querySelectorAll("button").forEach(b => b.onclick = () => {
        const fb = clsBox.lastElementChild;
        if(!S.done){ fb.innerHTML = IG3.note(false, "Finish the run first: initial and maximum / minimum temperature."); return; }
        const dT = S.T2 - S.T1, exo = dT > 0, pick = b.dataset.c === "exo";
        if(Math.abs(dT) < .5){ fb.innerHTML = IG3.note(false, "ΔT is too small to decide — use more reactant."); return; }
        if(pick !== exo){ fb.innerHTML = IG3.note(false, `Look at your readings: the temperature ${exo ? "rose" : "fell"}.`); return; }
        S.cls = true; classified.add(S.rx); drawStatic();
        if(ORDER.every(k => classified.has(k))) ctx.complete("classify");
        fb.innerHTML = IG3.note(true, `Correct — ${exo ? "exothermic: energy is given out to the surroundings, so ΔH is negative" : "endothermic: energy is taken in from the surroundings, so ΔH is positive"}. Classified ${classified.size} of 7 reactions.`);
      });

      ctx.html(`<div class="ctl"><div class="lbl"><span>Extended: calculations</span></div><div class="hint">Use c = 4.18 J g⁻¹ °C⁻¹ and take 1 cm³ of solution as 1 g. Use the mass of liquid in the cup (the solid's mass is ignored).</div></div>`);
      const cur = () => S.done ? S : null;
      IG3.box(ctx, "Energy change Q for this run / J", "e.g. 2850", v => {
        const s = cur(); if(!s) return [false, "Finish a run first."];
        const m = s.m, dT = s.T2 - s.T1, want = m*C*Math.abs(dT);
        if(Math.abs(Math.abs(v) - want) <= Math.max(.02*want, 5)){ ctx.complete("q"); return [true, `Correct: Q = m c ΔT = ${m} × 4.18 × ${Math.abs(dT).toFixed(1)} = ${want.toFixed(0)} J.`]; }
        if(Math.abs(Math.abs(v)*1000 - want) <= .02*want) return [false, "That looks like kJ — give the answer in joules."];
        return [false, `Q = m × c × ΔT, with m = ${m} g (the liquid in the cup).`];
      }, "Check");
      IG3.box(ctx, "Molar enthalpy change ΔH for this run / kJ mol⁻¹", "e.g. −57", v => {
        const s = cur(); if(!s) return [false, "Finish a run first."];
        const dT = s.T2 - s.T1, n = s.R.n(s.amt), want = -(s.m*C*dT)/n/1000;
        if(Math.abs(v - want) <= .04*Math.abs(want)){ if(s.rx === "neut") ctx.complete("neut");
          return [true, `Correct: n = ${n.toFixed(4)} mol, ΔH = −Q ÷ n = ${want > 0 ? "+" : "−"}${Math.abs(want).toFixed(1)} kJ mol⁻¹.${s.rx === "neut" ? " (Data-book value about −57 kJ mol⁻¹; yours is lower because of heat loss.)" : ""}`]; }
        if(Math.abs(v + want) <= .04*Math.abs(want)) return [false, "Check the sign: an exothermic reaction has a negative ΔH."];
        return [false, `ΔH = −Q ÷ n, in kJ (divide joules by 1000). Here n is the ${s.R.nTxt}.`];
      }, "Check");

      ctx.html(`<div class="ctl"><div class="lbl"><span>Bond energies / kJ mol⁻¹</span></div><div class="hint">H–H 436 · Cl–Cl 242 · H–Cl 431 · C–H 413 · O=O 498 · C=O 805 · O–H 464 · N≡N 945 · N–H 391</div></div>`);
      let bq = 0;
      ctx.select({ label:"Reaction for the bond-energy calculation", value:"0", options:BONDS.map((b, i) => [String(i), b.eq]), onChange(v){ bq = +v; bAns.clear(); } });
      const bAns = IG3.box(ctx, "ΔH = bonds broken − bonds made / kJ mol⁻¹", "e.g. −184", v => {
        const b = BONDS[bq], br = sum(b.brk), mk = sum(b.mk), want = br - mk;
        const how = `Broken: ${b.brk.map(([x, n, e]) => `${n}×${x} (${e})`).join(" + ")} = ${br}. Made: ${b.mk.map(([x, n, e]) => `${n}×${x} (${e})`).join(" + ")} = ${mk}.`;
        if(Math.abs(v - want) <= 1){ ctx.complete("bonds"); return [true, `Correct: ${how} ΔH = ${br} − ${mk} = ${String(want).replace("-", "−")} kJ mol⁻¹ (exothermic: more energy is released making bonds than is taken in breaking them).`]; }
        if(Math.abs(v + want) <= 1) return [false, "Check the sign: ΔH = energy to break bonds − energy released making bonds."];
        return [false, "Count every bond in the balanced equation, including the numbers in front of each formula."];
      }, "Check");

      newRun();
    }
  });
})();

/* ───────────── REACTIVITY SERIES ───────────── */
(function(){
  const P = "ig-reactivity";
  const METALS = ["K","Na","Ca","Mg","Zn","Fe","Cu"];
  const MNAME = { K:"potassium", Na:"sodium", Ca:"calcium", Mg:"magnesium", Zn:"zinc", Fe:"iron", Cu:"copper", X:"metal X" };
  const MCOL = { K:[200,205,212], Na:[205,208,214], Ca:[215,215,210], Mg:[200,205,212], Zn:[170,175,185], Fe:[120,125,132], Cu:[190,110,70], X:[160,165,172] };
  /* rate 0..1 drives the bubbles; h2 = hydrogen produced; ui = universal indicator colour afterwards */
  const OBS = {
    water:{
      K:{ o:"floats, melts into a ball, moves rapidly on the surface with effervescence; lilac flame; disappears", rate:1, h2:1, demo:1, ui:"purple" },
      Na:{ o:"floats, melts into a silvery ball, moves around on the surface with effervescence; gets smaller and disappears", rate:.9, h2:1, demo:1, ui:"purple" },
      Ca:{ o:"sinks; steady effervescence; calcium dissolves slowly; solution turns cloudy (milky) and warm", rate:.6, h2:1, demo:1, ui:"blue-purple", cloudy:1 },
      Mg:{ o:"very slow reaction: only a few bubbles form on the magnesium after a long time", rate:.04, h2:0, ui:"green" },
      Zn:{ o:"no reaction (no change)", rate:0, ui:"green" }, Fe:{ o:"no reaction (no change)", rate:0, ui:"green" }, Cu:{ o:"no reaction (no change)", rate:0, ui:"green" }
    },
    steam:{
      K:{ never:"Not done — potassium reacts explosively; it is only ever reacted with cold water as a demonstration." },
      Na:{ never:"Not done — sodium reacts violently; it is only ever reacted with cold water as a demonstration." },
      Ca:{ never:"Not done — calcium already reacts readily with cold water; heating it with steam would be dangerous." },
      Mg:{ o:"magnesium glows and burns with a bright white flame; white solid (magnesium oxide) left; gas burns at the end of the tube", h2:1, glow:[255,255,255], prod:[245,245,245] },
      Zn:{ o:"hot zinc reacts: solid is yellow when hot and white when cold (zinc oxide); gas burns at the end of the tube", h2:1, glow:[255,210,120], prod:[240,230,170] },
      Fe:{ o:"red-hot iron reacts slowly: black solid forms (Fe₃O₄); a small amount of gas burns at the end of the tube", h2:1, glow:[255,120,60], prod:[40,40,45] },
      Cu:{ o:"no reaction (no change)", h2:0 }
    },
    acid:{
      K:{ never:"Never done — potassium reacts explosively with dilute acids." },
      Na:{ never:"Never done — sodium reacts explosively with dilute acids." },
      Ca:{ o:"very vigorous effervescence; calcium dissolves rapidly; tube becomes hot (teacher demonstration only)", rate:.95, h2:1, demo:1, ui:"red" },
      Mg:{ o:"rapid effervescence; magnesium dissolves quickly; tube becomes warm; colourless solution", rate:.75, h2:1, ui:"red" },
      Zn:{ o:"steady effervescence; zinc dissolves slowly; colourless solution", rate:.35, h2:1, ui:"red" },
      Fe:{ o:"slow effervescence; a few bubbles; solution slowly turns pale green", rate:.12, h2:1, ui:"red", green:1 },
      Cu:{ o:"no reaction (no change)", rate:0, h2:0, ui:"red" }
    }
  };
  const UI = { purple:[110,40,160], "blue-purple":[80,60,190], green:[60,160,80], red:[210,50,50] };
  const RG = { water:"Cold water", steam:"Steam", acid:"Dilute HCl" }, RGL = { water:"cold water", steam:"steam", acid:"dilute HCl" };

  /* displacement */
  const DM = ["Mg","Zn","Fe","Cu","X"];
  const SOLN = { Mg:"MgSO₄(aq)", Zn:"ZnSO₄(aq)", Fe:"FeSO₄(aq)", Cu:"CuSO₄(aq)", X:"XSO₄(aq)" };
  const SOLC = { Mg:null, Zn:null, Fe:[185,220,170], Cu:[70,140,225], X:null };
  const DOPTS = ["no change", "metal coated with brown solid; blue colour fades", "metal coated with dark grey solid; pale green colour fades",
    "metal coated with grey solid; solution stays colourless", "effervescence; metal dissolves", "white ppt."];
  const DEP = { Cu:[160,80,45], Fe:[60,60,66], Zn:[120,122,128], Mg:[120,122,128], X:[120,122,128] };

  /* halogens */
  const HAL = ["Cl","Br","I"], HR = { Cl:3, Br:2, I:1 };
  const HW = { Cl:"chlorine water", Br:"bromine water", I:"iodine solution" }, HK = { Cl:"KCl(aq)", Br:"KBr(aq)", I:"KI(aq)" };
  const HC = { Cl:[215,230,170], Br:[235,150,40], I:[140,80,30] }, HL = { Cl:[220,235,180], Br:[235,140,40], I:[150,60,170] };
  const HOPTS = ["no change", "colourless solution turns orange", "colourless solution turns brown", "white ppt.", "cream ppt.", "effervescence"];

  /* rusting tubes */
  const RT = [
    { k:"A", name:"Air and water", rate:.10 },
    { k:"B", name:"Boiled water, oil layer", rate:0, oil:1, stop:1 },
    { k:"C", name:"Dry air, anhydrous CaCl₂", rate:0, dry:1, stop:1 },
    { k:"D", name:"Salt water and air", rate:.22, salt:1 },
    { k:"E", name:"Painted nail, water and air", rate:0, paint:1 },
    { k:"F", name:"Galvanised nail, water and air", rate:0, zinc:1 },
    { k:"G", name:"Nail + magnesium ribbon", rate:0, mg:1 },
    { k:"H", name:"Nail + copper wire", rate:.16, cu:1 }
  ];

  Lab.register({
    id:P, subject:"chemistry", level:["igcse"], topic:"Metals · Reactivity series", interactive:true,
    title:"The reactivity series",
    summary:"Metals with cold water, steam and dilute acid (K, Na and Ca as demonstrations), a metal displacement grid with an unknown metal X, halogen displacement with KCl, KBr and KI, and a rusting experiment run over several days including painted, galvanised and sacrificially protected nails.",
    aim:"Put metals in order of reactivity from their reactions with water, steam and acid and from displacement reactions; compare the reactivity of the halogens; and find the conditions needed for iron to rust and how it can be prevented.",
    variables:{ iv:"The metal (or halogen, or the conditions round the nail)", dv:"Rate of effervescence, whether displacement happens, amount of rust", cv:["Same size and surface area of metal","Same concentration and volume of acid or solution","Same temperature; same time"] },
    stageTitle:"Reactivity bench", controlsTitle:"Experiments",
    thumb:`<svg viewBox="0 0 300 140"><path d="M50 15 v90 a14 14 0 0 0 28 0 v-90" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M51 55 h26 v50 a13 13 0 0 1 -26 0z" fill="#4C86C6" opacity=".6"/><rect x="60" y="30" width="8" height="85" fill="#9AA0A8"/><rect x="60" y="80" width="8" height="35" fill="#A0522D"/><path d="M150 15 v90 a14 14 0 0 0 28 0 v-90" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M151 55 h26 v50 a13 13 0 0 1 -26 0z" fill="#8EC5F5" opacity=".5"/><rect x="161" y="25" width="6" height="85" fill="#7A7F88"/><circle cx="168" cy="95" r="3" fill="#B5652B"/><circle cx="162" cy="85" r="4" fill="#B5652B"/><text x="220" y="80" font-size="34" fill="#FF8A3D">K›Cu</text></svg>`,
    challenges:[
      { id:"acid",    title:"Rate of effervescence", text:"Test Mg, Zn, Fe and Cu with dilute HCl and rank them by rate of effervescence." },
      { id:"h2",      title:"Test the gas", text:"Show the gas from a metal and acid (or water) is hydrogen with a lighted splint." },
      { id:"steam",   title:"Steam", text:"React magnesium with steam and identify the white solid." },
      { id:"order",   title:"Displacement grid", text:"Complete the 20-cell displacement grid with correct observations and place the unknown metal X in the series." },
      { id:"halogen", title:"Halogen displacement", text:"Complete the halogen grid and deduce the order of reactivity of Cl₂, Br₂ and I₂." },
      { id:"rust",    title:"Conditions for rusting", text:"After at least 5 days, say which nails rusted and state the conditions needed." },
      { id:"sac",     title:"Sacrificial protection", text:"Scratch the coatings and explain why the galvanised nail still does not rust." }
    ],
    columns:[{key:"part",label:"Part"},{key:"metal",label:"Metal / tube"},{key:"test",label:"Reagent / solution"},{key:"obs",label:"Observation"}],
    questions:[
      { q:"Write the reactivity series for K, Na, Ca, Mg, Zn, Fe, Cu, with hydrogen, and explain where hydrogen goes.",
        a:"K > Na > Ca > Mg > Zn > Fe > (H) > Cu. Metals above hydrogen react with dilute acids to give hydrogen; copper, below hydrogen, does not." },
      { q:"Write the word and symbol equations for magnesium with steam, and calcium with water.",
        a:"Mg + H₂O → MgO + H₂ (magnesium + steam → magnesium oxide + hydrogen). Ca + 2H₂O → Ca(OH)₂ + H₂ (calcium + water → calcium hydroxide + hydrogen)." },
      { q:"Zinc is added to copper(II) sulfate solution. Describe what you see and write the ionic equation. Which species is oxidised?",
        a:"Zinc becomes coated with a brown solid and the blue colour fades; the mixture gets warm. Zn + Cu²⁺ → Zn²⁺ + Cu. Zinc is oxidised (loses electrons); Cu²⁺ is reduced." },
      { q:"Chlorine water is added to aqueous potassium bromide. State what you see and write the ionic equation.",
        a:"The colourless solution turns orange. Cl₂ + 2Br⁻ → 2Cl⁻ + Br₂. Chlorine is more reactive than bromine, so it displaces bromine from the bromide." },
      { q:"Why is bromine water added to potassium chloride solution ‘no change’?",
        a:"Bromine is less reactive than chlorine, so it cannot displace chloride ions. The mixture is orange only because of the bromine water added." },
      { q:"In the rusting tubes, what is the purpose of (a) boiling the water and adding oil, (b) anhydrous calcium chloride?",
        a:"(a) Boiling removes dissolved air (oxygen); the oil layer stops air dissolving again. (b) It is a drying agent that absorbs water vapour, so the air is dry. They show that both water and oxygen are needed for rusting." },
      { q:"Explain why a scratched galvanised nail does not rust but a scratched painted nail does.",
        a:"Zinc is more reactive than iron, so where the iron is exposed the zinc is oxidised (corrodes) instead of the iron: sacrificial protection. Paint is only a barrier; once scratched, water and oxygen reach the iron." },
      { q:"Suggest two risks in these experiments and a precaution for each.",
        a:"Potassium and sodium react violently with water — teacher demonstration behind a safety screen, small pieces, eye protection. Hydrogen is flammable — keep flames away except for the splint test. Chlorine water releases a toxic gas — use small volumes in a well-ventilated room or fume cupboard." }
    ],
    setup(ctx){
      let part = "a", metal = "Mg", reag = "acid", A = null;
      ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="${P}-svg"><defs>${Kit.DEFS}
        <clipPath id="${P}-tc"><path d="M180 140 V360 A40 40 0 0 0 260 360 V140 Z"/></clipPath>
        <clipPath id="${P}-sc"><path d="M150 150 V350 A30 30 0 0 0 210 350 V150 Z"/></clipPath>
        <radialGradient id="${P}-glow"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#FFF6D0" stop-opacity=".8"/><stop offset="1" stop-color="#FFF6D0" stop-opacity="0"/></radialGradient>
        </defs>${Kit.bench(960, 440)}<g id="${P}-g"></g><text x="24" y="30" class="k-status" id="${P}-s"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector(`#${P}-svg`), $ = s => svg.querySelector(s);
      const status = t => { $(`#${P}-s`).textContent = t; };
      const obsCard = (title, text, x, y, w) => { x = x || 520; y = y || 70; w = w || 410; const n = Math.floor((w - 32)/7.2), L = ChemKit.wrap(text, n).length;
        return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${48 + L*19}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="16" y="24" class="k-tag">${ctx.esc(title)}</text>${ChemKit.lines(text, n, 16, 48, 19, "k-numb")}</g>`; };

      /* ═══ PART A: water, steam, acid ═══ */
      function drawA(){
        const o = OBS[reag][metal];
        let s = "";
        if(o.never){ s += `<g transform="translate(120 160)"><rect width="300" height="150" rx="14" fill="none" stroke="var(--hi)" stroke-width="2" stroke-dasharray="6 5"/><text x="150" y="70" text-anchor="middle" class="k-status">Not carried out</text><text x="150" y="96" text-anchor="middle" class="k-lbl">${MNAME[metal]} + ${RGL[reag]}</text></g>` + obsCard("Safety", o.never); }
        else if(reag === "steam") s += steamScene(o);
        else if((metal === "K" || metal === "Na") && reag === "water") s += troughScene(o);
        else s += tubeScene(o);
        if(o.demo) s += `<rect x="90" y="110" width="12" height="320" rx="3" fill="rgba(160,200,255,.25)" stroke="var(--txt3)"/><text x="96" y="104" text-anchor="middle" class="k-lbl">safety screen</text>`;
        $(`#${P}-g`).innerHTML = s;
        status(A && A.on ? `${MNAME[metal]} + ${RGL[reag]}${o.demo ? " — teacher demonstration" : ""}` : "Choose a metal and a reagent, then add the metal");
      }
      function tubeScene(o){
        const on = A && A.on, t = on ? A.t : 0;
        let s = `<g clip-path="url(#${P}-tc)">`;
        let sol = reag === "acid" ? [215,228,240] : [190,215,240];
        if(on && o.green) sol = ChemKit.mix(sol, [175,225,165], Math.min(1, t/25));
        let solA = .45; if(on && o.cloudy){ sol = [240,240,240]; solA = .3 + Math.min(.5, t/30); }
        if(A && A.ui) { sol = UI[A.ui]; solA = .75; }
        s += `<rect x="180" y="220" width="80" height="200" fill="${IG3.rgb(sol, solA)}"/>`;
        const left = !on ? 1 : metal === "Mg" && reag === "acid" ? Math.max(0, 1 - t/30) : metal === "Ca" ? Math.max(0, 1 - t/(reag === "acid" ? 12 : 40)) : metal === "Zn" && reag === "acid" ? Math.max(.4, 1 - t/120) : 1;
        if(left > 0) s += metal === "Mg" ? `<path d="M195 385 q12 -8 25 0 t25 0" fill="none" stroke="${IG3.rgb(MCOL.Mg, 1)}" stroke-width="${4*left + .5}" stroke-linecap="round"/>`
          : `<rect x="${206 - 14*left}" y="${392 - 18*left}" width="${28*left + 2}" height="${16*left + 2}" rx="3" fill="${IG3.rgb(metal === "Fe" ? MCOL.Fe : MCOL[metal], 1)}" stroke="rgba(0,0,0,.25)"/>`;
        const n = on ? Math.round(o.rate*30*Math.min(1, left + .15)) : 0;
        for(let i = 0; i < n; i++){ const r = ((i*53) % 71)/71, q = ((i*29) % 61)/61;
          s += `<circle cx="${190 + q*60}" cy="380" r="${1.6 + r*2.2}" fill="none" stroke="var(--txt2)" stroke-width="1"><animate attributeName="cy" from="${388 - r*20}" to="224" dur="${(1.6 - o.rate)*(1 + r*.6)}s" begin="${-r*2}s" repeatCount="indefinite"/></circle>`; }
        s += `</g><path d="M180 140 V360 A40 40 0 0 0 260 360 V140" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2"/>
          <text x="220" y="430" text-anchor="middle" class="k-tag">${MNAME[metal]} in ${RGL[reag]}</text>`;
        if(A && A.splint) s += splint(A.splint);
        s += obsCard("Observation", on ? o.o : "The metal has not been added yet.");
        if(A && A.note) s += obsCard("Test", A.note, 520, 280);
        return s;
      }
      function troughScene(o){
        const on = A && A.on, life = metal === "K" ? 6 : 9, left = on ? Math.max(0, 1 - A.t/life) : 1;
        let s = `<path d="M130 250 V400 Q130 410 140 410 H440 Q450 410 450 400 V250" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2"/><rect x="132" y="290" width="316" height="118" fill="${IG3.rgb(A && A.ui ? UI[A.ui] : [140,190,240], .45)}"/>`;
        if(on && left > 0){ const r = 8*left + 2;
          s += `<g><circle cx="290" cy="${289 - r*.4}" r="${r}" fill="#E8EBF0" stroke="#8A93A2"><animate attributeName="cx" values="290;360;220;400;180;290" dur="${metal === "K" ? 2.2 : 3.2}s" repeatCount="indefinite"/></circle>
            ${metal === "K" ? `<ellipse cx="290" cy="${270 - r}" rx="${r*.9}" ry="${r*2}" fill="rgba(190,120,255,.7)"><animate attributeName="cx" values="290;360;220;400;180;290" dur="2.2s" repeatCount="indefinite"/></ellipse>` : ""}</g>`;
          for(let i = 0; i < 10; i++) s += `<circle cx="${200 + i*22}" cy="288" r="2" fill="none" stroke="var(--txt2)"><animate attributeName="cy" values="292;276" dur="${.4 + (i % 3)*.2}s" repeatCount="indefinite"/></circle>`;
        }else if(!on) s += `<rect x="270" y="200" width="22" height="14" rx="2" fill="#D9DCE2" stroke="#8A93A2"/><text x="281" y="194" text-anchor="middle" class="k-lbl">small piece, cut under oil</text>`;
        s += `<text x="290" y="430" text-anchor="middle" class="k-tag">${MNAME[metal]} on cold water (trough)</text>`;
        if(A && A.splint) s += splint(A.splint, 300, 250);
        s += obsCard("Observation", on ? o.o : "The metal has not been added yet.");
        if(A && A.note) s += obsCard("Test", A.note, 520, 280);
        return s;
      }
      function steamScene(o){
        const on = A && A.on, p = on ? Math.min(1, A.t/8) : 0;
        let s = `<rect x="110" y="230" width="360" height="36" rx="18" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2"/>
          <ellipse cx="150" cy="248" rx="26" ry="14" fill="#F2F2EE" stroke="#BBB"/><text x="150" y="290" text-anchor="middle" class="k-lbl">mineral wool soaked in water</text>
          <rect x="${280}" y="240" width="50" height="16" rx="3" fill="${IG3.rgb(on ? ChemKit.mix(MCOL[metal], o.prod || MCOL[metal], p) : MCOL[metal], 1)}"/>
          <text x="305" y="290" text-anchor="middle" class="k-lbl">${MNAME[metal]}</text>
          <path d="M470 248 H520" stroke="var(--txt2)" stroke-width="5"/>`;
        if(on && o.glow) s += `<circle cx="305" cy="248" r="${metal === "Mg" ? 48 : 26}" fill="url(#${P}-glow)" opacity=".9"><animate attributeName="opacity" values=".6;1;.7" dur=".5s" repeatCount="indefinite"/></circle>`;
        if(on && o.h2) s += `<path d="M522 248 q14 -10 10 -30 q8 12 6 30 z" fill="rgba(120,170,255,.55)"/>`;
        /* Bunsen burners under the wool and the metal */
        [150, 305].forEach(x => { s += `<rect x="${x - 8}" y="330" width="16" height="90" fill="url(#k-metal)"/><rect x="${x - 24}" y="418" width="48" height="10" rx="3" fill="url(#k-metal)"/>`;
          if(on) s += `<path d="M${x - 8} 330 Q${x} 280 ${x + 8} 330 Z" fill="rgba(80,130,255,.7)"/>`; });
        if(A && A.splint) s += splint(A.splint, 540, 210);
        s += obsCard("Observation", on ? o.o : "Heat the wool and the metal: the steam passes over the hot metal.");
        if(A && A.note) s += obsCard("Test", A.note, 520, 280);
        return s;
      }
      function splint(kind, x, y){ x = x || 300; y = y || 120;
        return `<g transform="translate(${x} ${y}) rotate(-35)"><rect x="-4" y="-80" width="8" height="80" fill="#C9A26B"/>${kind === "pop" ? `<circle cx="0" cy="-86" r="16" fill="url(#k-glow)"/><text x="22" y="-92" class="k-hint">POP!</text>` : `<ellipse cx="0" cy="-88" rx="5" ry="9" fill="#FFB347"/>`}</g>`; }

      /* ═══ PART B: displacement grid ═══ */
      const xr = [3.5, 2.5, 1][Math.floor(Math.random()*3)];
      const RANK = { Mg:4, Zn:3, Fe:2, Cu:0, X:xr };
      const grid = {}; let cell = null, cellT = 0;
      const truth = (m, s) => RANK[m] > RANK[s] ? (s === "Cu" ? 1 : s === "Fe" ? 2 : 3) : 0;
      function drawB(){
        let s = "";
        if(cell){ const [m, so] = cell, react = truth(m, so) > 0, p = react ? Math.min(1, cellT/4) : 0, sc = SOLC[so];
          const col = sc ? ChemKit.mix(sc, [225,232,240], p) : [225,232,240], dep = DEP[so];
          s += `<g clip-path="url(#${P}-sc)"><rect x="150" y="200" width="60" height="200" fill="${IG3.rgb(col, sc ? .7 - .4*p : .35)}"/></g>
            <rect x="174" y="110" width="12" height="260" rx="2" fill="${IG3.rgb(MCOL[m], 1)}" stroke="rgba(0,0,0,.25)"/>
            ${react ? `<rect x="172" y="200" width="16" height="170" rx="3" fill="${IG3.rgb(dep, .95)}" opacity="${p}"/>` + Array.from({ length:12 }, (_, i) => `<circle cx="${171 + (i % 2)*18}" cy="${210 + i*13}" r="3" fill="${IG3.rgb(dep, 1)}" opacity="${p}"/>`).join("") : ""}
            <path d="M150 150 V350 A30 30 0 0 0 210 350 V150" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2"/>
            <text x="180" y="400" text-anchor="middle" class="k-tag">${MNAME[m]} in ${SOLN[so]}</text>
            ${ChemKit.lines(`${SOLN[so]} is ${sc ? (so === "Cu" ? "blue" : "pale green") : "colourless"} at the start`, 30, 60, 420, 14)}`;
        }else s += ChemKit.lines("Click a cell in the grid to put that metal into that solution.", 30, 60, 250, 18, "k-tag");
        /* the grid */
        const gx = 290, gy = 60, cw = 112, ch = 62, lw = 0;
        s += `<g transform="translate(${gx} ${gy})"><text x="0" y="18" class="k-tag">metal ↓ / solution →</text>`;
        DM.forEach((so, j) => s += `<text x="${100 + j*cw + cw/2}" y="18" text-anchor="middle" class="k-tag">${SOLN[so]}</text>`);
        DM.forEach((m, i) => {
          s += `<text x="0" y="${32 + i*ch + ch/2 + 4}" class="k-tag">${MNAME[m]}</text>`;
          DM.forEach((so, j) => { const x = 100 + j*cw + lw, y = 32 + i*ch, key = m + so, g = grid[key], sel = cell && cell[0] === m && cell[1] === so;
            if(m === so){ s += `<rect x="${x + 3}" y="${y + 3}" width="${cw - 6}" height="${ch - 6}" rx="8" fill="var(--bg2)" stroke="var(--brd)"/><text x="${x + cw/2}" y="${y + ch/2 + 4}" text-anchor="middle" class="k-lbl">—</text>`; return; }
            s += `<g class="k-btn" data-cell="${key}"><rect x="${x + 3}" y="${y + 3}" width="${cw - 6}" height="${ch - 6}" rx="8" fill="${g === undefined ? "var(--bg-card)" : g ? "color-mix(in srgb,var(--sec) 22%,var(--bg-card))" : "var(--bg-card)"}" stroke="${sel ? "var(--accent)" : "var(--brd2)"}" stroke-width="${sel ? 2.5 : 1}"/>
              <text x="${x + cw/2}" y="${y + ch/2 + 4}" text-anchor="middle" class="${g === undefined ? "k-lbl" : "k-numb"}" style="pointer-events:none">${g === undefined ? "?" : g ? "✓ reaction" : "✗ no change"}</text></g>`; });
        });
        s += `</g><text x="${gx}" y="${gy + 32 + 5*ch + 24}" class="k-lbl">Done ${Object.keys(grid).length} of 20 cells. XSO₄(aq) is colourless; metal X is a grey solid.</text>`;
        $(`#${P}-g`).innerHTML = s;
        status(cell ? "Observe the tube, then choose your observation" : "Displacement: metals in solutions of their sulfates");
      }
      svg.addEventListener("click", e => { if(part !== "b") return; const g = e.target.closest("[data-cell]"); if(!g) return;
        const k = g.dataset.cell; cell = [k.replace(/(Mg|Zn|Fe|Cu|X)$/, ""), k.match(/(Mg|Zn|Fe|Cu|X)$/)[1]]; cellT = 0; dObs.clear(); drawB(); });

      /* ═══ PART D: halogen displacement ═══ */
      const hgrid = {}; let hcell = null, hT = 0, solvent = false;
      const htruth = (h, x) => HR[h] > HR[x] ? (x === "Br" ? 1 : 2) : 0;
      function drawD(){
        let s = "";
        if(hcell){ const [h, x] = hcell, r = htruth(h, x) > 0, p = r ? Math.min(1, hT/2.5) : 1;
          const free = r ? x : h, col = r ? ChemKit.mix(HC[h], HC[x], p) : HC[h];
          s += `<g clip-path="url(#${P}-sc)"><rect x="150" y="200" width="60" height="200" fill="${IG3.rgb(col, h === "Cl" && !r ? .35 : .7)}"/>
            ${solvent ? `<rect x="150" y="170" width="60" height="30" fill="${IG3.rgb(HL[free], free === "Cl" ? .35 : .8)}"/>` : ""}</g>
            <path d="M150 150 V350 A30 30 0 0 0 210 350 V150" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2"/>
            <text x="180" y="400" text-anchor="middle" class="k-tag">${HW[h]} + ${HK[x]}</text>
            ${solvent ? ChemKit.lines(`top layer: organic solvent (shaken) — ${free === "Cl" ? "very pale yellow-green" : free === "Br" ? "orange" : "purple"}`, 30, 60, 420, 14) : ChemKit.lines(`${HW[h]} is ${h === "Cl" ? "very pale yellow-green" : h === "Br" ? "orange" : "brown"}; ${HK[x]} is colourless`, 30, 60, 420, 14)}`;
        }else s += ChemKit.lines("Click a cell to add that halogen solution to that potassium halide solution.", 30, 60, 250, 18, "k-tag");
        const gx = 300, gy = 80, cw = 165, ch = 74;
        s += `<g transform="translate(${gx} ${gy})"><text x="0" y="18" class="k-tag">added ↓ / to →</text>`;
        HAL.forEach((x, j) => s += `<text x="${130 + j*cw + cw/2}" y="18" text-anchor="middle" class="k-tag">${HK[x]}</text>`);
        HAL.forEach((h, i) => {
          s += `<text x="0" y="${32 + i*ch + ch/2 + 4}" class="k-tag">${HW[h]}</text>`;
          HAL.forEach((x, j) => { const X0 = 130 + j*cw, y = 32 + i*ch, key = h + x, g = hgrid[key], sel = hcell && hcell[0] === h && hcell[1] === x;
            if(h === x){ s += `<rect x="${X0 + 3}" y="${y + 3}" width="${cw - 6}" height="${ch - 6}" rx="8" fill="var(--bg2)" stroke="var(--brd)"/><text x="${X0 + cw/2}" y="${y + ch/2 + 4}" text-anchor="middle" class="k-lbl">—</text>`; return; }
            s += `<g class="k-btn" data-hcell="${key}"><rect x="${X0 + 3}" y="${y + 3}" width="${cw - 6}" height="${ch - 6}" rx="8" fill="${g ? "color-mix(in srgb,var(--sec) 22%,var(--bg-card))" : "var(--bg-card)"}" stroke="${sel ? "var(--accent)" : "var(--brd2)"}" stroke-width="${sel ? 2.5 : 1}"/>
              <text x="${X0 + cw/2}" y="${y + ch/2 + 4}" text-anchor="middle" class="${g === undefined ? "k-lbl" : "k-numb"}" style="pointer-events:none">${g === undefined ? "?" : g === 1 ? "turns orange" : g === 2 ? "turns brown" : "no change"}</text></g>`; });
        });
        s += `</g><text x="${gx}" y="${gy + 32 + 3*ch + 30}" class="k-lbl">Done ${Object.keys(hgrid).length} of 6 cells.</text>`;
        $(`#${P}-g`).innerHTML = s;
        status(hcell ? "Observe the colour, then choose your observation" : "Halogen displacement: halogen + potassium halide");
      }
      svg.addEventListener("click", e => { if(part !== "d") return; const g = e.target.closest("[data-hcell]"); if(!g) return;
        const k = g.dataset.hcell; hcell = [k.slice(0, k.length - (k.endsWith("Cl") || k.endsWith("Br") ? 2 : 1)), k.endsWith("Cl") ? "Cl" : k.endsWith("Br") ? "Br" : "I"]; hT = 0; hObs.clear(); drawD(); });

      /* ═══ PART C: rusting ═══ */
      let day = 0, scratched = false;
      const rateOf = t => t.paint ? (scratched ? .05 : 0) : t.rate;
      const rustOf = t => 1 - Math.exp(-rateOf(t)*day);
      function rustObs(t){
        const r = rustOf(t);
        let o = r < .03 ? "no rust; nail still grey and shiny" : r < .4 ? "some orange-brown rust on the nail" : "nail covered in orange-brown rust; orange-brown solid in the water";
        if(t.paint && r < .03) o = scratched ? "no rust yet; scratch visible in the paint" : "no rust; paint intact";
        if(t.paint && r >= .03) o = "orange-brown rust where the paint is scratched";
        if(t.zinc) o = scratched && day >= 3 ? "no rust; a little white solid on the zinc near the scratch" : "no rust; zinc coating intact";
        if(t.mg) o = day >= 3 ? "no rust; magnesium ribbon corroding (white solid)" : "no rust";
        if(t.salt && r >= .4) o = "nail heavily covered in orange-brown rust; lots of orange-brown solid in the water";
        return o;
      }
      function drawC(){
        let s = `<text x="936" y="30" text-anchor="end" class="k-status">Day ${day}</text>`;
        RT.forEach((t, i) => {
          const x = 30 + i*116, w = 46, top = 120, h = 220, r = rustOf(t);
          const path = `M${x} ${top} V${top + h} A${w/2} ${w/2} 0 0 0 ${x + w} ${top + h} V${top}`;
          s += `<defs><clipPath id="${P}-r${i}"><path d="${path} Z"/></clipPath></defs><g clip-path="url(#${P}-r${i})">`;
          if(!t.dry) s += `<rect x="${x}" y="${top + 90}" width="${w}" height="${h}" fill="${IG3.rgb(t.salt ? [200,220,240] : [140,190,240], .45)}"/>`;
          if(t.oil) s += `<rect x="${x}" y="${top + 74}" width="${w}" height="16" fill="rgba(240,210,90,.75)"/>`;
          if(t.dry) s += Array.from({ length:16 }, (_, k) => `<circle cx="${x + 6 + (k*13) % (w - 10)}" cy="${top + h + 14 - (k % 4)*7}" r="4" fill="#F4F4F4" stroke="#BBB"/>`).join("") + `<rect x="${x}" y="${top + 160}" width="${w}" height="12" fill="#EDEDED"/>`;
          if(r > .2 && !t.dry) s += `<rect x="${x}" y="${top + h + 10}" width="${w}" height="20" fill="rgba(165,82,40,${Math.min(.85, r)})"/>`;
          s += `</g>`;
          /* nail */
          const nx = x + w/2 - 3, ny0 = t.dry ? top + 30 : top + 30, ny1 = t.dry ? top + 150 : top + h + 8;
          const nc = t.paint ? "#3E7BC4" : t.zinc ? "#B9C1C9" : "#7A7F88";
          s += `<rect x="${nx - 5}" y="${ny0 - 4}" width="16" height="5" rx="1" fill="${nc}"/><rect x="${nx}" y="${ny0}" width="6" height="${ny1 - ny0}" fill="${nc}"/><path d="M${nx} ${ny1} L${nx + 3} ${ny1 + 8} L${nx + 6} ${ny1}" fill="${nc}"/>`;
          if(t.paint && scratched) s += `<line x1="${nx - 1}" y1="${top + 140}" x2="${nx + 7}" y2="${top + 128}" stroke="#7A7F88" stroke-width="2.5"/>`;
          if(t.zinc && scratched) s += `<line x1="${nx - 1}" y1="${top + 140}" x2="${nx + 7}" y2="${top + 128}" stroke="#7A7F88" stroke-width="2.5"/>${day >= 3 ? `<circle cx="${nx + 3}" cy="${top + 134}" r="4" fill="#F5F5F5" stroke="#ccc"/>` : ""}`;
          if(t.mg) s += `<path d="M${nx - 2} ${top + 120} l10 8 l-10 8 l10 8 l-10 8" fill="none" stroke="${day >= 3 ? "#E8E8E8" : "#C8CDD4"}" stroke-width="3"/>`;
          if(t.cu) s += `<path d="M${nx - 2} ${top + 120} l10 8 l-10 8 l10 8 l-10 8" fill="none" stroke="#C0703C" stroke-width="2.5"/>`;
          if(r > .03){ const n = Math.round(4 + r*26), y0 = t.paint ? top + 126 : ny0 + 10, span = t.paint ? 18 : ny1 - ny0 - 10;
            for(let k = 0; k < n; k++){ const a = ((k*53) % 71)/71, b = ((k*29) % 61)/61; s += `<circle cx="${nx + b*6}" cy="${y0 + a*span}" r="${1.4 + a*2}" fill="#A5522A"/>`; } }
          if(t.stop) s += `<rect x="${x - 4}" y="${top - 18}" width="${w + 8}" height="22" rx="4" fill="${t.dry ? "#B08850" : "#B08850"}"/>`;
          if(t.dry) s += `<rect x="${x + 4}" y="${top + 4}" width="${w - 8}" height="10" fill="#fff" opacity=".8"/>`;
          s += `<path d="${path}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><text x="${x + w/2}" y="${top + h + 50}" text-anchor="middle" class="k-numb">${t.k}</text>`
            + ChemKit.lines(t.name, 15, x - 22, top + h + 66, 13, "k-lbl").replace(/<text /g, `<text style="font-size:10px" `);
        });
        $(`#${P}-g`).innerHTML = s;
        status(`Rusting: iron nails in different conditions${scratched ? " (coatings scratched)" : ""}`);
      }

      function draw(){ ({ a:drawA, b:drawB, c:drawC, d:drawD })[part](); }
      let acc = 0;
      ctx.frame(dt => {
        if(part === "a" && A && A.on){ A.t += dt; acc += dt; if(acc > .5){ acc = 0; if(A.t < 45) drawA(); } }
        if(part === "b" && cell && cellT < 4.2){ cellT += dt; acc += dt; if(acc > .1){ acc = 0; drawB(); } }
        if(part === "d" && hcell && hT < 2.7){ hT += dt; acc += dt; if(acc > .1){ acc = 0; drawD(); } }
      });

      /* ── controls ── */
      const boxes = {};
      ctx.seg({ label:"Part", value:part, options:[["a","Water / steam / acid"],["b","Metal displacement"],["d","Halogens"],["c","Rusting"]], onChange(v){ part = v; sync(); } });
      ["a","b","d","c"].forEach(k => boxes[k] = ctx.html(`<div></div>`));

      /* part A controls */
      ctx.select({ parent:boxes.a, label:"Metal", value:metal, options:METALS.map(m => [m, MNAME[m] + (["K","Na","Ca"].includes(m) ? " (demonstration)" : "")]), onChange(v){ metal = v; A = null; drawA(); } });
      ctx.seg({ parent:boxes.a, label:"Reagent", value:reag, options:Object.entries(RG), onChange(v){ reag = v; A = null; drawA(); } });
      ctx.buttons([
        { label:"Add the metal", primary:true, onClick(){
          const o = OBS[reag][metal]; if(o.never){ drawA(); return ctx.toast("Not carried out — too dangerous"); }
          if(A && A.on) return ctx.toast("Already reacting — choose another metal or reagent");
          A = { on:true, t:0 }; drawA();
          ctx.record({ part:"(a) " + RG[reag], metal:MNAME[metal], test:RG[reag], obs:o.o }, true);
          ctx.readout([["Metal", MNAME[metal]], ["Reagent", RG[reag]]]);
        } },
        { label:"Lighted splint", onClick(){
          const o = OBS[reag][metal]; if(!A || !A.on) return ctx.toast("Add the metal first");
          let msg;
          if(o.h2){ A.splint = reag === "steam" ? null : "pop"; msg = reag === "steam" ? "the gas burns at the end of the tube; collected, it gives a squeaky pop with a lighted splint: hydrogen" : "lighted splint gives a squeaky pop: hydrogen"; ctx.complete("h2"); }
          else { A.splint = reag === "steam" ? null : "flame"; msg = o.rate > 0 ? "too little gas collected to test" : "no gas given off; the splint keeps burning"; }
          A.note = msg; ctx.record({ part:"(a) gas test", metal:MNAME[metal], test:RG[reag] + " · lighted splint", obs:msg }, true);
          drawA();
        } },
        { label:"Universal indicator", onClick(){
          const o = OBS[reag][metal]; if(!A || !A.on) return ctx.toast("Add the metal first");
          if(reag === "steam") return ctx.toast("Not used here — test the solid and the gas instead");
          A.ui = o.ui; const msg = { purple:"turns purple: strongly alkaline (metal hydroxide formed)", "blue-purple":"turns blue / purple: alkaline (calcium hydroxide formed)", green:"stays green: neutral", red:"turns red: acidic (excess acid)" }[o.ui];
          A.note = "universal indicator " + msg; ctx.record({ part:"(a) indicator", metal:MNAME[metal], test:RG[reag] + " · universal indicator", obs:msg }, true); drawA();
        } }
      ], boxes.a);
      IG3.choice(ctx, "Magnesium + steam: what is the white solid?", ["magnesium hydroxide", "magnesium oxide", "magnesium carbonate", "hydrogen"], (i) => {
        if(!ctx.rows().some(r => r.metal === "magnesium" && r.test === "Steam")) return [false, "Heat magnesium in steam first."];
        if(i !== 1) return [false, "With steam (not cold water) magnesium forms its oxide: Mg + H₂O → MgO + H₂."];
        ctx.complete("steam"); return [true, "Correct: Mg(s) + H₂O(g) → MgO(s) + H₂(g). With cold water it would form Mg(OH)₂, very slowly."];
      }, boxes.a);
      IG3.rankBox(ctx, "Rank by rate of effervescence with dilute HCl", ["magnesium","zinc","iron","copper"], v => {
        const need = ["Mg","Zn","Fe","Cu"].filter(m => !ctx.rows().some(r => r.metal === MNAME[m] && r.test === "Dilute HCl"));
        if(need.length) return [false, "Test these with dilute HCl first: " + need.map(m => MNAME[m]).join(", ") + "."];
        const ok = v.join() === "magnesium,zinc,iron,copper"; if(ok) ctx.complete("acid");
        return ok ? [true, "Correct: Mg (rapid) > Zn (steady) > Fe (slow) > Cu (none — below hydrogen)."] : [false, "Compare the bubbles: which fizzed most, and which not at all?"];
      }, boxes.a);

      /* part B controls */
      const dObs = IG3.choice(ctx, "Observation for the selected cell", DOPTS, (i, txt) => {
        if(!cell) return [false, "Click a cell in the grid first."];
        if(cellT < 3) return [false, "Wait a few seconds and watch the metal and the colour."];
        const [m, so] = cell, t = truth(m, so);
        if(i !== t) return [false, "Look again at the surface of the metal and the colour of the solution."];
        grid[m + so] = t > 0;
        ctx.record({ part:"(b) displacement", metal:MNAME[m], test:SOLN[so], obs:txt }, true);
        drawB();
        return [true, t ? `Correct — ${MNAME[m]} is more reactive than ${so === "X" ? "X" : MNAME[so]}, so it displaces it.` : `Correct — ${MNAME[m]} is less reactive than ${so === "X" ? "X" : MNAME[so]}, so no displacement.`];
      }, boxes.b, "Record");
      IG3.rankBox(ctx, "Deduce the order of reactivity (most → least)", DM.map(m => MNAME[m]), v => {
        if(Object.keys(grid).length < 20) return [false, `Complete the grid first (${Object.keys(grid).length} of 20 cells).`];
        const want = [...DM].sort((a, b) => RANK[b] - RANK[a]).map(m => MNAME[m]);
        const ok = v.join() === want.join(); if(ok) ctx.complete("order");
        return ok ? [true, `Correct: ${want.join(" > ")}. A metal displaces any metal below it from a solution of its salt.`] : [false, "Count how many metals each one displaces: the most reactive displaces all the others."];
      }, boxes.b);
      ctx.html(`<div class="ctl"><div class="hint">Ionic equation, e.g. Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s): zinc loses electrons (oxidised), copper(II) ions gain electrons (reduced).</div></div>`, boxes.b);

      /* part D controls */
      ctx.seg({ parent:boxes.d, label:"Organic solvent layer", value:false, options:[[false,"None"],[true,"Shake with cyclohexane"]], onChange(v){ solvent = v; drawD(); } });
      const hObs = IG3.choice(ctx, "Observation for the selected cell", HOPTS, (i, txt) => {
        if(!hcell) return [false, "Click a cell in the grid first."];
        if(hT < 2) return [false, "Wait a moment and watch the colour."];
        const [h, x] = hcell, t = htruth(h, x);
        if(i !== t) return [false, `Compare the colour with the ${HW[h]} you added. Has a new halogen formed?`];
        hgrid[h + x] = t;
        ctx.record({ part:"(d) halogens", metal:HW[h], test:HK[x], obs:txt + (solvent ? `; organic layer ${t === 1 ? "orange" : t === 2 ? "purple" : h === "Br" ? "orange" : h === "I" ? "purple" : "pale"}` : "") }, true);
        drawD();
        const X2 = { Br:"Br₂", I:"I₂" }[x], H2 = { Cl:"Cl₂", Br:"Br₂" }[h];
        return [true, t ? `Correct — ${H2} + 2${x}⁻ → 2${h}⁻ + ${X2}.` : `Correct — ${{ Cl:"chlorine", Br:"bromine", I:"iodine" }[h]} is less reactive than ${{ Cl:"chlorine", Br:"bromine", I:"iodine" }[x]}, so no displacement.`];
      }, boxes.d, "Record");
      IG3.rankBox(ctx, "Order of reactivity of the halogens (most → least)", ["chlorine","bromine","iodine"], v => {
        if(Object.keys(hgrid).length < 6) return [false, `Complete the grid first (${Object.keys(hgrid).length} of 6 cells).`];
        const ok = v.join() === "chlorine,bromine,iodine"; if(ok) ctx.complete("halogen");
        return ok ? [true, "Correct: Cl₂ > Br₂ > I₂ — reactivity decreases down Group VII. Cl₂ + 2Br⁻ → 2Cl⁻ + Br₂; Cl₂ + 2I⁻ → 2Cl⁻ + I₂; Br₂ + 2I⁻ → 2Br⁻ + I₂."] : [false, "A halogen displaces the halides of the halogens below it. Which displaced both others?"];
      }, boxes.d);

      /* part C controls */
      ctx.seg({ parent:boxes.c, label:"Painted and galvanised nails", value:false, options:[[false,"Coating intact"],[true,"Coating scratched"]], onChange(v){ scratched = v; day = 0; drawC(); } });
      ctx.buttons([{ label:"+1 day", primary:true, onClick(){ day++; drawC(); } }, { label:"+3 days", onClick(){ day += 3; drawC(); } }, { label:"Restart", onClick(){ day = 0; drawC(); } }], boxes.c);
      ctx.buttons([{ label:"Record observations (all tubes)", onClick(){ RT.forEach(t => ctx.record({ part:`(c) rusting, day ${day}`, metal:"Tube " + t.k + ": " + t.name, test:scratched && (t.paint || t.zinc) ? "coating scratched" : "—", obs:rustObs(t) }, true)); ctx.toast(`Day ${day} observations recorded`); } }], boxes.c);
      const rustBox = ctx.html(`<div class="ctl"><div class="lbl"><span>Which nails have rusted?</span></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.3rem">${RT.map(t => `<label style="display:flex;gap:.3rem;align-items:center;font-size:.85rem"><input type="checkbox" value="${t.k}">${t.k}</label>`).join("")}</div></div>`, boxes.c);
      IG3.choice(ctx, "Conditions needed for iron to rust", ["water only", "oxygen (air) only", "water and oxygen (air)", "salt and water", "heat and oxygen"], i => {
        if(day < 5) return [false, "Leave the tubes for at least 5 days first."];
        const ticked = [...rustBox.querySelectorAll("input:checked")].map(c => c.value).sort().join(), want = RT.filter(t => rustOf(t) >= .03).map(t => t.k).sort().join();
        if(ticked !== want) return [false, "Check your ticked tubes against what you can see."];
        if(i !== 2) return [false, "Tube B has water but no air; tube C has air but no water. Neither rusted."];
        ctx.complete("rust"); return [true, `Correct: rusted tubes ${want}. Iron needs both water and oxygen to rust; salt water speeds it up, and contact with a less reactive metal (copper) makes it faster.`];
      }, boxes.c);
      IG3.choice(ctx, "Why does the scratched galvanised nail not rust?", ["the zinc layer still keeps out water and air", "zinc is more reactive than iron, so zinc is oxidised (corrodes) instead of the iron", "zinc is less reactive than iron", "zinc reacts with the rust and removes it"], i => {
        if(!scratched || day < 5) return [false, "Scratch the coatings and leave the tubes at least 5 days."];
        if(i !== 1) return [false, "The scratch exposes the iron, yet it does not rust. Compare E (painted) with F and G."];
        ctx.complete("sac"); return [true, "Correct — sacrificial protection. Zinc (and magnesium in tube G) lose electrons more readily than iron, so they corrode instead. Paint is only a barrier, so the scratched painted nail rusts."];
      }, boxes.c);

      function sync(){ Object.entries(boxes).forEach(([k, b]) => b.style.display = k === part ? "" : "none"); draw(); }
      sync();
    }
  });
})();
