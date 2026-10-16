"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMISTRY · A LEVEL (9701 Papers 4 & 5) — part 3
   Organic preparation and purification (aspirin / ethyl ethanoate:
   reflux, Buchner filtration, recrystallisation, separating funnel,
   drying, distillation, melting point, TLC and Rf, percentage yield) ·
   A Level organic reactions and tests (phenol, phenylamine, amines,
   acyl chlorides, amides, diazotisation and azo dyes, oxidisable acids)
══════════════════════════════════════════════════════════════════ */

/* ───────────── ORGANIC PREPARATION AND PURIFICATION ───────────── */
(function(){
  const P = "a-synthesis";
  const WATER = "rgba(120,170,230,.55)";
  const ROUTES = {
    aspirin:{ name:"Aspirin from 2-hydroxybenzoic acid", short:"aspirin",
      R:{ name:"2-hydroxybenzoic acid", Mr:138.12, lo:1.80, hi:2.20 }, Pd:{ name:"aspirin", Mr:180.16 },
      steps:[["weigh","Weigh the 2-hydroxybenzoic acid"],["add","Add ethanoic anhydride + catalyst"],["reflux","Heat under reflux"],
        ["crude","Destroy excess anhydride; crystallise"],["filter","Filter under reduced pressure"],["recryst","Recrystallise (minimum hot solvent)"],
        ["filter2","Cool, filter, wash with ice-cold water"],["dryc","Dry the crystals"],["weighP","Weigh the product"],["mp","Melting point"],["tlc","Thin-layer chromatography"]] },
    ester:{ name:"Ethyl ethanoate from ethanoic acid", short:"ethyl ethanoate",
      R:{ name:"ethanoic acid", Mr:60.05, lo:5.50, hi:6.50 }, Pd:{ name:"ethyl ethanoate", Mr:88.10 },
      steps:[["weigh","Weigh the ethanoic acid"],["add","Add ethanol + conc. H₂SO₄"],["reflux","Heat under reflux"],["distil1","Distil off the crude ester"],
        ["wash","Wash with Na₂CO₃(aq) (separating funnel)"],["drym","Dry with anhydrous MgSO₄"],["distil2","Redistil: collect 74–79 °C"],["weighP","Weigh the product"]] }
  };
  const MP_DATA = 135, BP_DATA = 77;

  /* ── apparatus pieces ── */
  function rbf(id, cx, cy, r, frac, col, solid){
    const lvl = cy + r - 2*r*Math.max(0, Math.min(1, frac));
    return `<defs><clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r - 1.5}"/></clipPath></defs>
      ${frac > 0 ? `<rect x="${cx - r}" y="${lvl}" width="${2*r}" height="${cy + r - lvl}" fill="${col}" clip-path="url(#${id})"/>` : ""}
      ${solid ? `<path d="M${cx - r*.55} ${cy + r*.8} Q${cx} ${cy + r*.5} ${cx + r*.55} ${cy + r*.8} Z" fill="${solid}" clip-path="url(#${id})"/>` : ""}
      <path d="M${cx - 9} ${cy - r - 42} V${cy - r + 2.5} A${r} ${r} 0 1 0 ${cx + 9} ${cy - r + 2.5} V${cy - r - 42}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>`;
  }
  function bath(cx, by, w, h, hot, label){
    return `<path d="${ChemKit.BEAKER(cx - w/2, by, w, h)}" fill="none" stroke="var(--txt2)" stroke-width="1.6"/>
      <rect x="${cx - w/2 + 2}" y="${by - h*.62}" width="${w - 4}" height="${h*.62 - 2}" fill="${WATER}"/>
      <rect x="${cx - w/2 - 14}" y="${by}" width="${w + 28}" height="20" rx="4" fill="#3A4252" stroke="#4B5563"/>
      <circle cx="${cx + w/2}" cy="${by + 10}" r="5" fill="${hot ? "#F25C3B" : "#6B7280"}"/>
      ${label ? `<text x="${cx}" y="${by + 36}" text-anchor="middle" class="k-lbl">${label}</text>` : ""}`;
  }
  function bunsen(cx, by, on){
    return `<rect x="${cx - 7}" y="${by - 70}" width="14" height="70" fill="url(#k-metal)"/><rect x="${cx - 26}" y="${by - 8}" width="52" height="8" rx="2" fill="url(#k-metal)"/>
      ${on ? `<path d="M${cx} ${by - 120} C${cx - 16} ${by - 90} ${cx - 12} ${by - 70} ${cx - 6} ${by - 70} H${cx + 6} C${cx + 12} ${by - 70} ${cx + 16} ${by - 90} ${cx} ${by - 120}Z" fill="#4A7DFF" opacity=".8"/>` : ""}`;
  }
  /* vertical Liebig condenser between y0 (top) and y1 (bottom) */
  function condenser(cx, y0, y1, waterIn, vapour, sealed){
    const full = waterIn === "bottom", h = y1 - y0, wTop = full ? y0 + 6 : y1 - h*.3;
    return `<rect x="${cx - 17}" y="${y0}" width="34" height="${h}" rx="6" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
      <rect x="${cx - 15}" y="${wTop}" width="30" height="${y1 - wTop - 2}" rx="4" fill="${WATER}"/>
      <rect x="${cx - 6}" y="${y0 - 14}" width="12" height="${h + 28}" fill="rgba(240,244,250,.55)" stroke="var(--txt2)" stroke-width="1.1"/>
      ${vapour ? `<rect x="${cx - 5}" y="${y1 - h*.55}" width="10" height="${h*.25}" fill="rgba(255,255,255,.75)"><animate attributeName="opacity" values=".3;.9;.3" dur="1.4s" repeatCount="indefinite"/></rect>` : ""}
      <path d="M${cx + 17} ${y1 - 16} h26 M${cx - 17} ${y0 + 16} h-26" stroke="var(--txt2)" stroke-width="5" stroke-linecap="round"/>
      <text x="${cx + 48}" y="${y1 - 12}" class="k-lbl">water ${full ? "in" : "out"} ${full ? "→" : "←"}</text>
      <text x="${cx - 48}" y="${y0 + 20}" text-anchor="end" class="k-lbl">${full ? "← water out" : "water in →"}</text>
      ${sealed ? `<rect x="${cx - 9}" y="${y0 - 26}" width="18" height="14" rx="3" fill="#C7B08A" stroke="#8C7550"/><text x="${cx + 14}" y="${y0 - 14}" class="k-hint">stoppered!</text>` : `<text x="${cx + 12}" y="${y0 - 16}" class="k-lbl">open to the air</text>`}`;
  }
  function buchner(cx, by, cake, liquid){
    return `<path d="M${cx - 55} ${by} L${cx - 22} ${by - 110} V${by - 140} H${cx + 22} V${by - 110} L${cx + 55} ${by} Z" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
      <path d="M${cx + 14} ${by - 125} h46" stroke="var(--txt2)" stroke-width="7"/><path d="M${cx + 60} ${by - 125} q40 0 50 30" fill="none" stroke="#5B6B7E" stroke-width="5"/>
      <text x="${cx + 116}" y="${by - 84}" class="k-lbl">to water pump</text>
      ${liquid ? `<path d="M${cx - 50} ${by - 4} L${cx - 44} ${by - 26} H${cx + 44} L${cx + 50} ${by - 4} Z" fill="${liquid}"/>` : ""}
      <rect x="${cx - 14}" y="${by - 152}" width="28" height="14" fill="#2F2F33"/>
      <rect x="${cx - 4}" y="${by - 186}" width="8" height="40" fill="url(#k-glass)" stroke="var(--txt2)"/>
      <path d="M${cx - 50} ${by - 236} H${cx + 50} L${cx + 46} ${by - 186} H${cx - 46} Z" fill="#F2F0EA" stroke="#A39C8E" stroke-width="1.6"/>
      <line x1="${cx - 44}" y1="${by - 196}" x2="${cx + 44}" y2="${by - 196}" stroke="#A39C8E" stroke-dasharray="2 4"/>
      ${cake ? `<rect x="${cx - 44}" y="${by - 206}" width="88" height="9" fill="${cake}"/>` : ""}
      <text x="${cx}" y="${by - 246}" text-anchor="middle" class="k-lbl">Buchner funnel + filter paper</text>`;
  }
  function sepFunnel(cx, top, layers, stopper, inverted){
    const body = `M${cx - 8} ${top} V${top + 20} Q${cx - 70} ${top + 80} ${cx - 50} ${top + 150} Q${cx - 30} ${top + 190} ${cx - 6} ${top + 215} V${top + 270} H${cx + 6} V${top + 215} Q${cx + 30} ${top + 190} ${cx + 50} ${top + 150} Q${cx + 70} ${top + 80} ${cx + 8} ${top + 20} V${top}`;
    let s = `<defs><clipPath id="${P}-sf"><path d="${body} Z"/></clipPath></defs><g ${inverted ? `transform="rotate(180 ${cx} ${top + 135})"` : ""}>`;
    let y = top + 215;
    layers.slice().reverse().forEach(l => { const hh = l.h; s += `<rect x="${cx - 80}" y="${y - hh}" width="160" height="${hh}" fill="${l.col}" clip-path="url(#${P}-sf)"/>`; y -= hh; });
    s += `<path d="${body}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><rect x="${cx - 18}" y="${top + 232}" width="36" height="9" rx="3" fill="#3A6DD8"/>
      ${stopper ? `<rect x="${cx - 10}" y="${top - 14}" width="20" height="16" rx="4" fill="#E6E6E6" stroke="#8D96A6"/>` : ""}</g>`;
    return s;
  }
  function distillation(o){
    /* flask in water bath (left), still head with thermometer, sloping condenser, receiver */
    let s = bath(230, 440, 170, 90, o.on, "electric water bath") + rbf(`${P}-df`, 230, 380, 48, o.frac, o.col);
    s += `<rect x="221" y="210" width="18" height="128" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/>
      <path d="M239 236 L430 330" stroke="var(--txt2)" stroke-width="12" stroke-linecap="round"/><path d="M239 236 L430 330" stroke="rgba(240,244,250,.9)" stroke-width="8" stroke-linecap="round"/>
      <path d="M270 242 L410 312" stroke="${WATER}" stroke-width="26" stroke-linecap="round" opacity=".9"/><path d="M270 242 L410 312" stroke="var(--txt2)" stroke-width="27" stroke-linecap="round" fill="none" opacity=".25"/>
      <path d="M430 330 v40" stroke="var(--txt2)" stroke-width="4"/>
      <path d="${ChemKit.FLASK(440, 450, .6)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
      ${o.collected ? `<path d="M410 446 h60 l-8 -18 h-44z" fill="rgba(240,236,210,.8)"/>` : ""}
      ${o.on && o.drip ? `<circle cx="432" cy="380" r="3" fill="rgba(200,215,235,.9)"><animate attributeName="cy" from="372" to="420" dur=".9s" repeatCount="indefinite"/></circle>` : ""}
      <text x="440" y="476" text-anchor="middle" class="k-lbl">receiver</text>`;
    /* thermometer through the still head */
    const bulbY = o.bulb === "arm" ? 238 : 392;
    s += `<rect x="227" y="${bulbY - 170}" width="6" height="170" rx="3" fill="#fff" stroke="#9AA3B2" stroke-width=".8"/><circle cx="230" cy="${bulbY}" r="5" fill="#E0334A"/>
      <rect x="228.6" y="${bulbY - 60 - Math.min(100, (o.T - 20)*1.2)}" width="2.8" height="${60 + Math.min(100, (o.T - 20)*1.2)}" fill="#E0334A"/>
      <rect x="216" y="${bulbY - 180}" width="28" height="12" rx="3" fill="#2F2F33"/>`;
    return s;
  }
  function balanceScene(mass, label, holder){
    return ChemKit.balance(120, 300, mass, label) + holder;
  }

  Lab.register({
    id:P, subject:"chemistry", level:["a"], topic:"Organic synthesis · Preparation, purification & purity", interactive:true,
    title:"Organic preparation and purification",
    summary:"Make aspirin or ethyl ethanoate: weigh, heat under reflux, then purify by recrystallisation and Buchner filtration, or by washing in a separating funnel, drying and distilling. Check purity by melting point and TLC (Rf), and find the percentage yield from your own masses.",
    aim:"Prepare and purify an organic product, assess its purity using melting point (or boiling point) and thin-layer chromatography, and calculate the percentage yield.",
    variables:{ iv:"Purification method / volume of recrystallisation solvent", dv:"Mass of product (percentage yield); melting range; Rf values", cv:["Same mass of starting material","Reflux time and temperature","Same TLC solvent and plate"] },
    stageTitle:"Fume cupboard bench", controlsTitle:"Procedure",
    thumb:`<svg viewBox="0 0 300 140"><circle cx="110" cy="100" r="26" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M86 108 a26 26 0 0 0 48 0z" fill="#E9E2C8"/><rect x="102" y="12" width="16" height="64" rx="3" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="104" y="20" width="12" height="52" fill="#8EC5F5" opacity=".6"/><rect x="190" y="20" width="56" height="100" rx="3" fill="#F4F2EC" stroke="#A2ACBD"/><circle cx="206" cy="70" r="5" fill="#7A5AC8"/><circle cx="230" cy="52" r="5" fill="#7A5AC8"/><circle cx="230" cy="84" r="4" fill="#7A5AC8" opacity=".5"/><line x1="192" y1="104" x2="244" y2="104" stroke="#555" stroke-dasharray="3 2"/></svg>`,
    challenges:[
      { id:"pure",  title:"Pure aspirin", text:"Recrystallise aspirin and read a melting range of 2 °C or less, within 2 °C of the data value (135 °C)." },
      { id:"mp",    title:"Crude vs pure", text:"Read the melting range of both the crude and the recrystallised aspirin." },
      { id:"rf",    title:"Rf value", text:"Develop a TLC plate, measure a spot and the solvent front, and calculate the Rf value." },
      { id:"yield", title:"Percentage yield", text:"Calculate the percentage yield from your own recorded masses." },
      { id:"ester", title:"Liquid product", text:"Wash, separate, dry and redistil ethyl ethanoate, reading its boiling point." },
      { id:"mist",  title:"Spot the mistakes", text:"Find three faults: e.g. no anti-bumping granules, sealed apparatus, condenser water the wrong way, too much solvent, not releasing pressure, solvent above the TLC baseline." },
      { id:"safe",  title:"Paper 5: safe working", text:"Complete a whole preparation using the fume cupboard, gloves and goggles, and no naked flames." }
    ],
    columns:[{key:"run",label:"Run"},{key:"step",label:"Step"},{key:"val",label:"Reading"},{key:"note",label:"Note"}],
    questions:[
      { q:"Why is the mixture heated under reflux rather than in an open flask?",
        a:"The vapour condenses in the vertical condenser and drips back, so the mixture can be heated for a long time at its boiling point without losing volatile reactants or products. The top must be open so pressure cannot build up." },
      { q:"Why are anti-bumping granules added, and why does the condenser water go in at the bottom?",
        a:"Granules give small bubbles a surface to form on, so the liquid boils smoothly instead of ‘bumping’ (sudden violent boiling). Water in at the bottom fills the jacket completely, so cooling is efficient; in at the top, it runs straight out and the jacket is half empty." },
      { q:"Why is the minimum volume of hot solvent used in recrystallisation, and why is the solution cooled slowly?",
        a:"The product is more soluble hot than cold. With the minimum volume, the solution is saturated when hot, so most product crystallises on cooling. Excess solvent keeps product dissolved and lowers the yield. Slow cooling gives larger, purer crystals; soluble impurities stay in solution and are removed in the filtrate." },
      { q:"How does the melting point show whether a solid is pure?",
        a:"A pure solid melts sharply (range ≤ 1–2 °C) at the data-book value. Impurities lower the melting point and make it melt over a wider range. Heat slowly near the melting point, or the thermometer lags and the reading is too high." },
      { q:"A spot moved 3.1 cm and the solvent front 6.2 cm. Find Rf. Why do aspirin and 2-hydroxybenzoic acid differ?",
        a:"Rf = 3.1 ÷ 6.2 = 0.50. Each compound has a different balance between adsorption to the polar stationary phase and solubility in the mobile phase. The compound held more strongly by the stationary phase moves a shorter distance (lower Rf). A product lane with only the aspirin spot shows that no starting material remains." },
      { q:"Why must the baseline be drawn in pencil and be above the solvent level in the tank?",
        a:"Ink would dissolve and move up the plate as extra spots. If the solvent is above the baseline, the spots dissolve into the solvent in the tank instead of moving up the plate. The tank lid keeps the atmosphere saturated with solvent vapour." },
      { q:"In the separating funnel, why is the tap opened frequently, and which layer is the ester?",
        a:"Na₂CO₃ reacts with acid impurities to give CO₂; pressure builds up and can blow the stopper out, so invert and open the tap to release it. Ethyl ethanoate (density 0.90 g cm⁻³) is less dense than the aqueous layer, so it is the upper layer; run off and discard the lower aqueous layer." },
      { q:"Paper 5: identify the main hazards and precautions in these preparations.",
        a:"Ethanoic anhydride and concentrated H₂SO₄/H₃PO₄ are corrosive; ethanoic anhydride and ethyl ethanoate vapours are irritant and flammable; ethanol is highly flammable. Work in a fume cupboard, wear gloves and goggles, heat with a water bath or electric heater (no naked flames), add concentrated acid slowly with swirling, and never heat a closed system." },
      { q:"Suggest why the percentage yield is less than 100%.",
        a:"Esterification is an equilibrium so the reaction is incomplete; product is lost on transfer, stays dissolved in the recrystallisation solvent or washings, and some is lost when collecting the distillation fraction. Side reactions may also occur." }
    ],
    setup(ctx){
      let route = "aspirin", hood = "no", ppe = "no";
      let run = Math.max(0, ...ctx.rows().map(r => +String(r.run).replace(/\D/g, "") || 0));
      const mistakes = new Set(), mpDone = {};
      let S, yieldBox = null, rfBox = null;
      function newRun(){
        run++; if(yieldBox){ yieldBox.clear(); rfBox.clear(); }
        const R = ROUTES[route];
        S = { route, label:`Prep ${run} (${R.short})`, i:0, max:0, tared:false, cont:Kit.round(route === "aspirin" ? 1.1 + Math.random()*.5 : 92 + Math.random()*20, 2), pan:0,
          mR:null, mRtrue:0, gran:"no", water:"bottom", top:"open", heat:"bath", loss:1, anim:0, animKind:"", added:false, refluxed:false,
          pure:0, crude:0, V:0, Vmin:0, recovered:0, pumped:false, mPtrue:0, mP:null, unsafe:false, flame:false, ptared:false, ptransfer:false,
          mp:{ sample:"rec", T:110, mode:"off", start:null, end:null, Tc:{ rec:[133.8 + Math.random()*.8, 0], crude:[125.5 + Math.random()*2.5, 0] } },
          tlc:{ state:"new", depth:"below", line:"pencil", dF:Kit.round(5.8 + Math.random()*.8, 2), rfS:.65 + Math.random()*.04, rfA:.43 + Math.random()*.04, sel:null, front:null, spot:null, spotName:"" },
          sep:{ added:false, shakes:0, unvented:0, settled:false, inv:false }, mg:{ n:0, need:2 + Math.floor(Math.random()*3) },
          dist:{ T:21, on:false, collected:false, bulb:"arm", bp:Kit.round(76.8 + Math.random()*.6, 2), read:null } };
        S.mp.Tc.rec[1] = S.mp.Tc.rec[0] + .9 + Math.random()*.6; S.mp.Tc.crude[1] = S.mp.Tc.crude[0] + 4 + Math.random()*2;
        S.mp.T = 110;
      }
      newRun();
      const steps = () => ROUTES[S.route].steps, stepId = () => steps()[S.i][0];
      const rec = (step, val, note) => ctx.record({ run:S.label, step, val, note:note || "" }, true);
      const mistake = (k, msg) => { mistakes.add(k); ctx.toast(msg); if(mistakes.size >= 3) ctx.complete("mist"); };
      function advance(){ S.i = Math.min(steps().length - 1, S.i + 1); S.max = Math.max(S.max, S.i); build(); }

      /* ── stage ── */
      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="${P}-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 460)}
        <rect x="8" y="44" width="944" height="416" rx="10" fill="none" stroke="var(--brd2)" stroke-dasharray="6 6" id="${P}-hood"/>
        <g id="${P}-scene"></g><g id="${P}-lens"></g><g id="${P}-card"></g><text x="24" y="30" class="k-status" id="${P}-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#" + P + "-svg"), $ = s => svg.querySelector(s);
      const mpTherm = Kit.thermometer(`${P}-mpt`, 300, 90, 300, 100, 160, 10);

      function card(title, text){
        const ls = ChemKit.wrap(text, 44);
        return `<g transform="translate(610 60)"><rect width="330" height="${44 + ls.length*18}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="14" y="24" class="k-tag">${ctx.esc(title)}</text>${ChemKit.lines(text, 44, 14, 46, 18)}</g>`;
      }
      const balShown = () => Kit.round(S.pan - (S.tared ? S.cont : 0), 2);
      function draw(){
        const id = stepId(), R = ROUTES[S.route];
        let s = "", lens = "", info = "", status = "";
        $(`#${P}-hood`).setAttribute("stroke", hood === "yes" ? "var(--accent)" : "var(--brd2)");
        const crystals = "#F2EFE6";
        switch(id){
          case "weigh": {
            const holder = S.route === "aspirin"
              ? `<path d="M152 318 h106 l-10 -14 h-86z" fill="#D9D3C4" stroke="#A39C8E"/>${S.pan > S.cont ? `<path d="M178 308 q27 -14 54 0z" fill="${crystals}" stroke="#C8C2B4"/>` : ""}`
              : `<path d="${ChemKit.FLASK(205, 318, .55)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/>${S.pan > S.cont ? `<path d="M175 316 h60 l-6 -${Math.min(24, (S.pan - S.cont)*4)} h-48z" fill="rgba(220,230,240,.7)"/>` : ""}`;
            s = balanceScene(S.tared || S.pan ? balShown() : 0, "two-decimal-place balance", holder);
            s += `<g transform="translate(400 330)"><rect width="70" height="100" rx="8" fill="#E9EEF5" stroke="#9AA3B2"/><rect x="18" y="-14" width="34" height="16" rx="3" fill="#6B7280"/>
              <text x="35" y="44" text-anchor="middle" class="k-lbl" style="font-size:9px">${S.route === "aspirin" ? "2-hydroxy-" : "glacial"}</text><text x="35" y="58" text-anchor="middle" class="k-lbl" style="font-size:9px">${S.route === "aspirin" ? "benzoic acid" : "ethanoic acid"}</text></g>`;
            info = card(`${R.R.name} (limiting reagent)`, `Tare the balance with the empty ${S.route === "aspirin" ? "weighing boat" : "flask"}, then add between ${R.R.lo.toFixed(2)} and ${R.R.hi.toFixed(2)} g. Read the balance and record the mass. Mr = ${R.R.Mr}.`);
            status = !S.tared ? "Place the container on the balance and tare it" : "Add the reactant, then read and record the mass";
            break; }
          case "add": case "reflux": case "crude": {
            const hot = S.anim > 0 && S.animKind === "reflux";
            const col = S.route === "aspirin" ? "rgba(235,232,215,.75)" : "rgba(220,230,240,.7)";
            if(S.heat === "bunsen" && id === "reflux") s += bunsen(260, 500, hot) + `<path d="M200 416 h120 M210 416 l-20 44 M310 416 l20 44" stroke="url(#k-metalv)" stroke-width="5"/>`;
            else s += bath(260, 440, 200, 110, hot || S.animKind === "warmc", "electric water bath (no naked flame)");
            s += rbf(`${P}-rf`, 260, 360, 52, id === "crude" && S.crude ? .45 : S.added ? .32 : .1, col, id === "crude" && S.crude ? crystals : null);
            if(S.gran === "yes") for(let k = 0; k < 4; k++) s += `<circle cx="${240 + k*12}" cy="${404 - (k % 2)*3}" r="3" fill="#5B6270"/>`;
            if(hot) for(let k = 0; k < 9; k++) s += `<circle cx="${236 + (k*13) % 50}" cy="390" r="${S.gran === "yes" ? 1.8 : 4}" fill="none" stroke="var(--txt2)"><animate attributeName="cy" from="${400 - (k % 3)*6}" to="340" dur="${S.gran === "yes" ? .6 + k*.05 : 1.6}s" repeatCount="indefinite"/></circle>`;
            if(id === "reflux" || S.refluxed && id !== "crude") s += condenser(260, 90, 262, S.water, hot, S.top === "stoppered");
            if(hot && S.gran !== "yes") s += `<text x="340" y="320" class="k-hint">BUMPING!</text>`;
            info = id === "add" ? card("Reagents (fume cupboard)", S.route === "aspirin"
                ? "Add 4.0 cm³ ethanoic anhydride (an excess) and 5 drops of 85% phosphoric acid catalyst. Ethanoic anhydride is corrosive and its vapour is irritant and flammable."
                : "Add 10 cm³ ethanol (an excess) then, slowly with swirling, 1 cm³ concentrated sulfuric acid (catalyst, corrosive). Ethanol is highly flammable.")
              : id === "reflux" ? card("Set up for reflux", "Choose the anti-bumping granules, the condenser water direction, whether the top is open, and the heat source. Then heat under reflux for 20 minutes.")
              : card("Crystallise the crude product", "Add 20 cm³ of cold water slowly (fume cupboard — it reacts with the excess anhydride to give ethanoic acid), then cool in an ice bath until crystals form.");
            status = id === "add" ? "Add the other reagents" : id === "reflux" ? (S.anim > 0 ? "Heating under reflux…" : "Set up the apparatus, then heat") : "Hydrolyse the excess anhydride and crystallise";
            break; }
          case "filter": case "filter2": {
            const done = id === "filter" ? S.crudeFiltered : S.recFiltered;
            s += buchner(300, 450, done ? crystals : null, done ? "rgba(225,232,240,.7)" : null);
            s += `<path d="${ChemKit.BEAKER(470, 450, 80, 90)}" fill="none" stroke="var(--txt2)" stroke-width="1.5"/>${done ? "" : `<rect x="472" y="400" width="76" height="48" fill="rgba(235,232,215,.7)"/><path d="M482 444 q28 -12 56 0z" fill="${crystals}"/>`}
              <text x="510" y="476" text-anchor="middle" class="k-lbl">${id === "filter" ? "crude mixture" : "cold recrystallised mixture"}</text>`;
            info = card("Filtration under reduced pressure", "Fit a filter paper that covers all the holes, wet it with solvent and turn on the pump so it seals. Then pour in the mixture and wash the crystals with a little ice-cold water.");
            status = !S.pumped ? "Wet the filter paper and turn on the pump" : done ? "Crystals collected" : "Pour in the mixture";
            break; }
          case "recryst": {
            const frac = S.Vmin ? Math.min(1, S.V/S.Vmin) : 0;
            s += bath(260, 440, 200, 110, true, "hot water bath (solvent contains ethanol)");
            s += `<path d="${ChemKit.FLASK(260, 420, .9)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
              <path d="M${222 - S.V*.2} ${420 - Math.min(64, 8 + S.V*1.4)} h${76 + S.V*.4} L${314} 418 H206 Z" fill="rgba(235,235,225,.55)"/>
              ${frac < 1 ? `<path d="M${240 + frac*16} 418 q${20 - frac*16} -${22*(1 - frac)} ${40 - frac*32} 0z" fill="${crystals}" stroke="#C8C2B4"/>` : ""}`;
            info = card(`Hot solvent added: ${S.V} cm³`, frac < 1 ? "Add hot ethanol–water solvent in small portions, swirling in the hot water bath, until the solid just dissolves." : "All the solid has dissolved. Now cool slowly to room temperature, then in ice.");
            status = frac < 1 ? "Some solid is still undissolved" : "Saturated hot solution — cool it slowly";
            break; }
          case "dryc": {
            s += `<ellipse cx="300" cy="420" rx="110" ry="18" fill="#E7EBF1" stroke="#9AA3B2"/><ellipse cx="300" cy="414" rx="60" ry="10" fill="${S.dried ? crystals : "#E3E7DC"}"/>`;
            if(!S.dried) s += `<text x="300" y="384" text-anchor="middle" class="k-lbl">damp crystals on filter paper</text>`;
            s += `<rect x="460" y="300" width="120" height="140" rx="10" fill="url(#k-glass)" stroke="var(--txt2)"/><text x="520" y="460" text-anchor="middle" class="k-lbl" dy="14">desiccator</text>`;
            info = card("Dry the product", "Dry the crystals between filter papers, then in a desiccator (or a warm oven below the melting point). Weighing damp crystals would make the yield too high.");
            status = S.dried ? "Dry — now weigh the product" : "Dry the crystals";
            break; }
          case "weighP": {
            const holder = S.route === "aspirin" ? `<ellipse cx="205" cy="312" rx="56" ry="9" fill="#E7EBF1" stroke="#9AA3B2"/>${S.ptransfer ? `<ellipse cx="205" cy="306" rx="30" ry="7" fill="${crystals}"/>` : ""}`
              : `<rect x="180" y="248" width="50" height="70" rx="6" fill="url(#k-glass)" stroke="var(--txt2)"/>${S.ptransfer ? `<rect x="182" y="286" width="46" height="30" fill="rgba(240,236,210,.8)"/>` : ""}`;
            s = balanceScene(S.ptared || S.ptransfer ? Kit.round((S.ptransfer ? S.mPtrue : 0) + (S.ptared ? 0 : S.cont), 2) : 0, "two-decimal-place balance", holder);
            info = card("Weigh the dry product", `Tare the balance with the empty ${S.route === "aspirin" ? "watch glass" : "sample bottle"}, transfer all the product and record its mass. Mr(${R.Pd.name}) = ${R.Pd.Mr}.`);
            status = !S.ptared ? "Tare the balance" : !S.ptransfer ? "Transfer the product" : "Read and record the mass";
            break; }
          case "mp": {
            const m = S.mp, f = meltFrac();
            s += `<rect x="150" y="250" width="120" height="180" rx="10" fill="#4A5160" stroke="#2F3542"/><rect x="164" y="270" width="92" height="56" rx="6" fill="#1A1F29"/>
              <circle cx="210" cy="298" r="18" fill="${m.mode === "off" ? "#2B3240" : "#F2A93B"}" opacity=".7"/><text x="210" y="452" text-anchor="middle" class="k-lbl">melting-point apparatus</text>`;
            s += `<line x1="236" y1="120" x2="236" y2="300" stroke="#9AA3B2" stroke-width="3"/>` + mpTherm.svg;
            /* magnified capillary */
            s += `<g transform="translate(400 120)"><rect width="150" height="240" rx="10" fill="#1A1F29" stroke="var(--brd2)"/>
              <rect x="64" y="20" width="22" height="200" rx="11" fill="rgba(240,244,250,.18)" stroke="#9AA3B2"/>
              ${f < 1 ? `<rect x="66" y="${150}" width="18" height="68" fill="${S.mp.sample === "rec" ? crystals : "#E7E1CF"}" opacity="${1 - f*.85}"/>` : ""}
              ${f > 0 ? `<rect x="66" y="${218 - 68*Math.min(1, f)*.85}" width="18" height="${68*Math.min(1, f)*.85}" fill="rgba(200,220,240,.75)"/>` : ""}
              <text x="75" y="14" text-anchor="middle" style="font:600 10px Inter;fill:#C9D1DD">capillary ×10</text>
              <text x="75" y="236" text-anchor="middle" style="font:600 10px Inter;fill:#C9D1DD">${f <= 0 ? "solid" : f < 1 ? "melting…" : "all liquid"}</text></g>`;
            lens = ChemKit.lens({ id:`${P}-ml`, cx:760, cy:300, r:110, S:24, value:m.T, minor:1, major:5, down:false, tube:6, flat:true, liquid:"#E0334A", label:"magnifier on the thermometer (1 °C divisions)" });
            info = `<g transform="translate(610 40)"><rect width="330" height="100" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="14" y="24" class="k-tag">Sample: ${m.sample === "rec" ? "recrystallised aspirin" : "crude aspirin"}</text>
              ${ChemKit.lines(`Data value ${MP_DATA} °C. Heat quickly to about 125 °C, then slowly. Pause to read when melting starts and when it is complete.`, 44, 14, 46, 18)}</g>`;
            status = m.mode === "off" ? "Paused — read the thermometer" : m.mode === "fast" ? "Heating quickly…" : "Heating slowly…";
            break; }
          case "tlc": s = drawTlc(); lens = tlcLens(); info = ""; status = S.tlc.state === "new" ? "Prepare and develop the plate" : S.tlc.state === "dev" ? "Developing…" : "Click a spot or the solvent front to measure it"; break;
          case "distil1": case "distil2": {
            const d = S.dist;
            s += distillation({ on:d.on, frac:id === "distil1" ? .45 : .3, col:"rgba(225,232,240,.7)", collected:d.collected, drip:d.on && d.T > 70, bulb:id === "distil1" ? "arm" : d.bulb, T:d.T });
            if(id === "distil2") lens = ChemKit.lens({ id:`${P}-dl`, cx:760, cy:330, r:110, S:24, value:d.T, minor:1, major:5, down:false, tube:6, flat:true, liquid:"#E0334A", label:"magnifier on the thermometer (1 °C divisions)" })
              + `<line x1="236" y1="${(d.bulb === "arm" ? 238 : 392) - 80}" x2="650" y2="330" stroke="var(--accent)" stroke-dasharray="3 3"/>`;
            info = id === "distil1" ? card("Distil off the crude ester", "Rearrange for distillation and collect everything boiling below about 85 °C. The crude distillate contains ester, ethanol, water and some ethanoic acid.")
              : `<g transform="translate(610 40)"><rect width="330" height="100" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="14" y="24" class="k-tag">Redistil the dried ester</text>${ChemKit.lines(`Data: boiling point ${BP_DATA} °C. Read the steady thermometer reading, then collect the fraction boiling between 74 and 79 °C.`, 44, 14, 46, 18)}</g>`;
            status = d.collected ? "Fraction collected" : d.on ? "Heating…" : "Turn on the water bath";
            break; }
          case "wash": {
            const sp = S.sep, ester = "rgba(240,236,210,.85)", aq = "rgba(170,200,235,.7)";
            const layers = !sp.added ? [{ col:ester, h:46 }] : sp.settled || sp.shakes === 0 ? [{ col:ester, h:46 }, { col:aq, h:52 }] : [{ col:"rgba(210,220,225,.8)", h:98 }];
            if(sp.ranOff) layers.splice(1, 1);
            s += `<path d="M300 150 h70 M300 150 v300 M270 450 h80" stroke="url(#k-metalv)" stroke-width="5"/><circle cx="360" cy="150" r="14" fill="none" stroke="url(#k-metalv)" stroke-width="4"/>`;
            s += sepFunnel(360, 120, layers, sp.added && !sp.settled, sp.inv);
            if(sp.added && sp.shakes > 0 && sp.shakes <= 2 && !sp.settled) s += `<text x="420" y="${sp.inv ? 160 : 260}" class="k-hint">effervescence (CO₂)</text>`;
            s += `<path d="${ChemKit.BEAKER(330, 450, 60, 50)}" fill="none" stroke="var(--txt2)" stroke-width="1.4"/>${sp.ranOff ? `<rect x="332" y="420" width="56" height="28" fill="${aq}"/>` : ""}`;
            info = card("Washing with Na₂CO₃(aq)", "Removes acid impurities (ethanoic and sulfuric acid). Stopper, invert and shake gently; invert and open the tap often to release CO₂. Let the layers settle, remove the stopper and run off the layer you want to discard.");
            status = !sp.added ? "Add the crude ester and Na₂CO₃(aq)" : !sp.settled ? `Shaken ${sp.shakes} time${sp.shakes === 1 ? "" : "s"} — release the pressure` : sp.ranOff ? "Washed ester left in the funnel" : "Layers settled — run off the waste layer";
            break; }
          case "drym": {
            const dry = S.mg.n >= S.mg.need;
            s += `<path d="${ChemKit.FLASK(300, 440, 1.2)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
              <path d="M236 438 h128 l-18 -36 h-92z" fill="${dry ? "rgba(240,236,210,.8)" : "rgba(235,232,215,.55)"}"/>`;
            for(let k = 0; k < S.mg.n*5; k++) s += `<circle cx="${250 + (k*17) % 100}" cy="${432 - (k % 3)*4}" r="${k < S.mg.need*5 - 3 ? 4 : 2}" fill="#FAFAFA" stroke="#B9BEC7" stroke-width=".6"/>`;
            info = card(`Anhydrous MgSO₄ added: ${S.mg.n} spatula${S.mg.n === 1 ? "" : "s"}`, S.mg.n === 0 ? "Add the drying agent a spatula at a time and swirl." : dry ? "Some powder now stays free-flowing and the liquid is clear: it is dry. Filter off the drying agent." : "The powder clumps together and the liquid is still cloudy: water remains.");
            status = dry ? "Dry — filter off the MgSO₄" : "Add anhydrous MgSO₄ and swirl";
            break; }
        }
        $(`#${P}-scene`).innerHTML = s;
        $(`#${P}-lens`).innerHTML = lens;
        $(`#${P}-card`).innerHTML = info;
        $(`#${P}-status`).textContent = status;
        if(id === "mp") mpTherm.set(svg, S.mp.T);
        ctx.readout([["Run", S.label], ["Step", `${S.i + 1}/${steps().length}`], ["Fume cupboard", hood === "yes" ? "in use" : "not used", hood === "yes" ? "" : "warn"], ["Gloves + goggles", ppe === "yes" ? "on" : "off", ppe === "yes" ? "" : "warn"]]);
      }

      /* ── melting point ── */
      const LAG = { fast:3.5, slow:.3, off:0 };
      let lagNow = 0;
      function meltFrac(){
        const [a, b] = S.mp.Tc[S.mp.sample], Ts = S.mp.T - lagNow;
        return Math.max(0, Math.min(1, (Ts - a)/(b - a)));
      }
      /* ── TLC ── */
      const TL = { x:250, y0:430, cm:44, lanes:["2-hydroxy­benzoic acid","crude","product","pure aspirin"] };
      const yOf = d => TL.y0 - (1 + d)*TL.cm;
      function spots(){
        const t = S.tlc, out = [];
        if(t.state !== "done" || t.depth === "above") return out;
        const purity = S.recFiltered ? 1 : 0;
        const lanes = [[["2-hydroxybenzoic acid", t.rfS, 1]], [["aspirin", t.rfA, 1], ["2-hydroxybenzoic acid", t.rfS, .55]], purity ? [["aspirin", t.rfA, 1]] : [["aspirin", t.rfA, 1], ["2-hydroxybenzoic acid", t.rfS, .55]], [["aspirin", t.rfA, 1]]];
        lanes.forEach((l, i) => l.forEach(([name, rf, a]) => out.push({ lane:i, name, d:Kit.round(rf*t.dF, 2), a })));
        return out;
      }
      function drawTlc(){
        const t = S.tlc, x = TL.x, w = 220, top = yOf(7);
        let s = "";
        if(t.state !== "done") s += `<path d="M${x - 30} ${top - 20} V${TL.y0 + 6} H${x + w + 30} V${top - 20}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
          <rect x="${x - 36}" y="${top - 30}" width="${w + 72}" height="10" rx="3" fill="rgba(200,210,225,.6)" stroke="var(--txt2)"/>
          <rect x="${x - 28}" y="${yOf(t.depth === "above" ? .4 : -.5)}" width="${w + 56}" height="${TL.y0 + 4 - yOf(t.depth === "above" ? .4 : -.5)}" fill="rgba(200,215,235,.45)"/>`;
        s += `<rect x="${x}" y="${top}" width="${w}" height="${TL.y0 - top}" fill="#F7F5EF" stroke="#B9B2A2"/>`;
        if(t.state !== "new"){
          const fy = t.state === "dev" ? yOf(-.5) + (yOf(t.dF) - yOf(-.5))*(1 - S.anim/3) : yOf(t.dF);
          s += `<rect x="${x + 1}" y="${fy}" width="${w - 2}" height="${TL.y0 - fy - 1}" fill="rgba(180,200,225,.25)"/>`;
          if(t.state === "done") s += `<line x1="${x}" y1="${fy}" x2="${x + w}" y2="${fy}" stroke="#555" stroke-dasharray="4 3" class="k-btn" data-front="1" stroke-width="2"/><rect x="${x}" y="${fy - 6}" width="${w}" height="12" fill="transparent" data-front="1" style="cursor:pointer"/>`;
        }
        s += `<line x1="${x}" y1="${yOf(0)}" x2="${x + w}" y2="${yOf(0)}" stroke="${t.line === "ink" ? "#2340C8" : "#666"}" stroke-width="1.2"/>`;
        TL.lanes.forEach((nm, i) => {
          const cx = x + 30 + i*53;
          if(t.state !== "done") s += `<circle cx="${cx}" cy="${yOf(0)}" r="4" fill="#B9A6E8" opacity=".7"/>`;
          s += `<text x="${cx}" y="${TL.y0 + 18}" text-anchor="middle" class="k-lbl" style="font-size:9.5px">${["SA","crude","product","aspirin"][i]}</text>`;
        });
        if(t.state === "done" && t.line === "ink") s += `<rect x="${x + 2}" y="${yOf(t.dF*.9)}" width="${w - 4}" height="${yOf(0) - yOf(t.dF*.9)}" fill="rgba(60,80,200,.12)"/>`;
        spots().forEach((p, k) => {
          const cx = x + 30 + p.lane*53, cy = yOf(p.d), sel = t.sel === k;
          s += `<ellipse cx="${cx}" cy="${cy}" rx="9" ry="6" fill="rgba(110,70,200,${.75*p.a})" stroke="${sel ? "var(--accent)" : "rgba(80,50,160,.6)"}" stroke-width="${sel ? 2.5 : 1}" data-spot="${k}" style="cursor:pointer"/>`;
        });
        /* ruler: 0 at the baseline */
        const rx = x + w + 50;
        s += `<rect x="${rx}" y="${yOf(7.2)}" width="34" height="${yOf(-1) - yOf(7.2)}" fill="#FBF6E6" stroke="#B9B2A2"/>`;
        for(let mm = -10; mm <= 72; mm++){
          const yy = yOf(mm/10), big = mm % 10 === 0;
          s += `<line x1="${rx}" y1="${yy}" x2="${rx + (big ? 14 : mm % 5 === 0 ? 10 : 6)}" y2="${yy}" stroke="#444" stroke-width="${big ? 1 : .5}"/>`;
          if(big && mm >= 0) s += `<text x="${rx + 17}" y="${yy + 3.5}" style="font:500 9px 'JetBrains Mono',monospace;fill:#444">${mm/10}</text>`;
        }
        s += `<text x="${rx + 17}" y="${yOf(7.2) - 6}" text-anchor="middle" class="k-lbl">cm</text>`;
        if(t.state === "done" && t.depth !== "above") s += `<text x="${x + w/2}" y="${top - 10}" text-anchor="middle" class="k-lbl">viewed under a UV lamp; spots ringed in pencil</text>`;
        return s;
      }
      function tlcLens(){
        const t = S.tlc; if(t.state !== "done" || t.sel === null) return `<g transform="translate(610 120)"><rect width="320" height="${t.state === "done" ? 92 : 126}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="14" y="24" class="k-tag">${t.state === "done" ? "Measure from the baseline" : "TLC (silica, UV indicator)"}</text>
          ${ChemKit.lines(t.state === "done" ? "Click the solvent front line or a spot to bring the magnifier to it." : "Spot 2-hydroxybenzoic acid (SA), crude, your product and pure aspirin on a baseline. Develop in a covered tank of ethyl ethanoate–hexane.", 42, 14, 46, 18)}</g>`;
        const d = t.sel === "front" ? t.dF : spots()[t.sel].d, yy = yOf(d);
        return ChemKit.lens({ id:`${P}-tl`, cx:760, cy:270, r:110, S:60, value:d, minor:.1, major:1, half:.5, down:false, tube:40, fmt:v => v.toFixed(0), label:"magnifier on the ruler (mm divisions)" })
          + `<line x1="${TL.x}" y1="${yy}" x2="650" y2="270" stroke="var(--accent)" stroke-dasharray="3 3"/><line x1="652" y1="270" x2="868" y2="270" stroke="#7A5AC8" stroke-width="2" opacity=".8"/>`;
      }
      svg.addEventListener("click", e => {
        if(stepId() !== "tlc" || S.tlc.state !== "done") return;
        const sp = e.target.closest("[data-spot]"), fr = e.target.closest("[data-front]");
        if(sp){ S.tlc.sel = +sp.dataset.spot; draw(); }
        else if(fr){ S.tlc.sel = "front"; draw(); }
      });

      ctx.frame(dt => {
        let redraw = false;
        if(S.anim > 0){ S.anim -= dt; redraw = true; if(S.anim <= 0){ S.anim = 0; const k = S.animKind; S.animKind = ""; finishAnim(k); } }
        const id = stepId();
        if(id === "mp" && S.mp.mode !== "off"){ const rate = S.mp.mode === "fast" ? 3 : .45; S.mp.T = Math.min(160, S.mp.T + rate*dt); lagNow += (LAG[S.mp.mode] - lagNow)*Math.min(1, dt*2); redraw = true; }
        if(id === "mp" && S.mp.mode === "off" && lagNow > 0){ lagNow = Math.max(0, lagNow - dt*1.5); redraw = true; }
        if((id === "distil1" || id === "distil2") && S.dist.on){
          const target = id === "distil2" && S.dist.bulb === "liquid" ? S.dist.bp + 5.5 : S.dist.bp;
          const old = S.dist.T; S.dist.T += (target - S.dist.T)*Math.min(1, dt*.5); if(Math.abs(S.dist.T - target) < .05) S.dist.T = target; if(Math.abs(old - S.dist.T) > 1e-3) redraw = true;
        }
        if(redraw) draw();
      });
      function finishAnim(k){
        if(k === "reflux"){ S.refluxed = true; rec("heated under reflux 20 min", `${S.heat === "bath" ? "water bath" : "Bunsen"}`, [S.gran === "no" ? "bumped" : "", S.water === "top" ? "condenser half empty: vapour lost" : ""].filter(Boolean).join("; ")); ctx.toast("Reflux complete"); advance(); }
        if(k === "tlc"){ S.tlc.state = "done"; rec("TLC developed", `solvent front marked`, S.tlc.depth === "above" ? "spots dissolved into the solvent" : S.tlc.line === "ink" ? "ink baseline ran" : ""); if(S.tlc.depth === "above") mistake("tlc", "No spots on the plate — the solvent was above the baseline, so the samples dissolved into the solvent in the tank."); if(S.tlc.line === "ink") mistake("ink", "The ink baseline has run up the plate as a blue streak — always use pencil."); build(); }
      }

      /* ── controls ── */
      ctx.seg({ label:"Preparation", value:route, options:[["aspirin","Aspirin (solid)"],["ester","Ethyl ethanoate (liquid)"]], onChange(v){ route = v; newRun(); build(); } });
      ctx.seg({ label:"Fume cupboard", value:hood, options:[["no","Open bench"],["yes","Fume cupboard"]], onChange(v){ hood = v; if(v === "no" && S.max > 0) S.unsafe = true; draw(); } });
      ctx.seg({ label:"Gloves and goggles", value:ppe, options:[["no","Not worn"],["yes","Worn"]], onChange(v){ ppe = v; if(v === "no" && S.max > 0) S.unsafe = true; draw(); } });
      const listHost = ctx.html(`<div class="ctl"></div>`);
      const host = ctx.html(`<div></div>`);
      const calcHost = ctx.html(`<div><div class="ctl"><div class="lbl"><span>Calculations (from your recorded data)</span></div></div></div>`);
      ctx.buttons([{ label:"Start a new preparation", onClick(){ newRun(); build(); } }]);

      function stepList(){
        listHost.innerHTML = `<div class="lbl"><span>${ctx.esc(ROUTES[S.route].name)}</span></div><ol style="margin:.3rem 0 0;padding-left:1.3rem;font-size:.84rem;line-height:1.55">${steps().map(([k, t], i) =>
          `<li style="${i === S.i ? "font-weight:700;color:var(--accent)" : i <= S.max ? "opacity:.8" : "opacity:.5"}">${(k === "mp" || k === "tlc") && i <= S.max && i !== S.i ? `<a href="javascript:void 0" data-go="${i}">${ctx.esc(t)}</a>` : ctx.esc(t)}${i < S.i && k !== "mp" && k !== "tlc" ? " ✓" : ""}</li>`).join("")}</ol>`;
        listHost.querySelectorAll("[data-go]").forEach(a => a.onclick = () => { S.i = +a.dataset.go; build(); });
      }
      const btns = (list) => ctx.buttons(list, host);
      const seg = (o) => ctx.seg(Object.assign({ parent:host }, o));
      const needSafe = (what) => { if(hood !== "yes" || ppe !== "yes"){ S.unsafe = true; ctx.toast(`${what}: use the fume cupboard and wear gloves and goggles`); } };

      function build(){
        host.innerHTML = ""; stepList();
        const id = stepId(), R = ROUTES[S.route];
        switch(id){
          case "weigh":
            btns([{ label:`Tare with empty ${S.route === "aspirin" ? "boat" : "flask"}`, onClick(){ S.pan = Math.max(S.pan, S.cont); S.tared = true; draw(); } },
              { label:S.route === "aspirin" ? "Add a spatula" : "Add ≈1 cm³ (dropping pipette)", onClick(){ if(!S.tared) return ctx.toast("Tare the balance with the empty container first"); S.pan += S.route === "aspirin" ? .28 + Math.random()*.2 : 1.0 + Math.random()*.1; draw(); } },
              { label:"Remove a little", onClick(){ S.pan = Math.max(S.cont, S.pan - (S.route === "aspirin" ? .05 + Math.random()*.08 : .12 + Math.random()*.15)); draw(); } }]);
            Kit.reading(ctx, `Mass of ${R.R.name} / g`, "e.g. 2.04", () => S.tared && S.pan > S.cont + .001 ? balShown() : null, .005, v => {
              if(v < R.R.lo || v > R.R.hi) return ctx.toast(`Aim for ${R.R.lo.toFixed(2)}–${R.R.hi.toFixed(2)} g`);
              S.mR = Kit.round(v, 2); S.mRtrue = S.pan - S.cont; rec(`mass of ${R.R.name} / g`, S.mR.toFixed(2)); advance();
            }, host);
            break;
          case "add":
            btns([{ label:S.route === "aspirin" ? "Add ethanoic anhydride + H₃PO₄" : "Add ethanol, then conc. H₂SO₄ slowly", primary:true, onClick(){
              needSafe(S.route === "aspirin" ? "Ethanoic anhydride is corrosive and its vapour irritant" : "Concentrated H₂SO₄ is corrosive; ethanol is flammable");
              S.added = true; rec("reagents added", S.route === "aspirin" ? "4.0 cm³ (CH₃CO)₂O + 5 drops H₃PO₄" : "10 cm³ ethanol + 1 cm³ conc. H₂SO₄", hood === "yes" && ppe === "yes" ? "fume cupboard, gloves, goggles" : "unsafe: open bench / no PPE"); advance(); } }]);
            break;
          case "reflux":
            seg({ label:"Anti-bumping granules", value:S.gran, options:[["yes","Add 2–3"],["no","None"]], onChange(v){ S.gran = v; draw(); } });
            seg({ label:"Condenser water", value:S.water, options:[["bottom","In at the bottom"],["top","In at the top"]], onChange(v){ S.water = v; draw(); } });
            seg({ label:"Top of condenser", value:S.top, options:[["open","Open"],["stoppered","Stoppered"]], onChange(v){ S.top = v; draw(); } });
            seg({ label:"Heat source", value:S.heat, options:[["bath","Electric water bath"],["bunsen","Bunsen burner"]], onChange(v){ S.heat = v; draw(); } });
            btns([{ label:"Heat under reflux for 20 min", primary:true, onClick(){
              if(S.anim) return;
              if(S.top === "stoppered") return mistake("sealed", "STOP — never heat a closed system: the pressure builds up and the apparatus can explode. Leave the top of the condenser open.");
              if(S.heat === "bunsen"){ S.flame = true; return mistake("flame", "No naked flames: the reagents and vapours are flammable. Use an electric water bath or heating mantle."); }
              if(S.gran === "no"){ S.loss *= .9; mistake("bump", "The mixture is bumping violently — add anti-bumping granules (to a cool mixture) next time."); }
              if(S.water === "top"){ S.loss *= .82; mistake("water", "Water in at the top runs straight out: the jacket is half empty, so vapour escapes from the top."); }
              S.anim = 3; S.animKind = "reflux"; draw(); } }]);
            break;
          case "crude":
            btns([{ label:"Add 20 cm³ cold water; cool in ice", primary:true, onClick(){
              const n = S.mRtrue/ROUTES.aspirin.R.Mr; S.pure = n*ROUTES.aspirin.Pd.Mr*.86*S.loss; S.crude = S.pure + .12 + Math.random()*.05;
              S.Vmin = Math.round(S.crude*5.6*(.9 + Math.random()*.2)); S.crudeFiltered = false; rec("crude product", "white crystals formed on cooling"); draw(); ctx.after(600, advance); } }]);
            break;
          case "filter": case "filter2":
            btns([{ label:"Wet filter paper; turn on the pump", onClick(){ S.pumped = true; draw(); } },
              { label:id === "filter" ? "Pour in; wash with ice-cold water" : "Pour in; wash with a little ice-cold water", primary:true, onClick(){
                if(!S.pumped){ ctx.toast("Turn on the pump first — the paper must be sucked flat or crystals pass under it"); return; }
                if(id === "filter") S.crudeFiltered = true; else S.recFiltered = true;
                rec(id === "filter" ? "crude filtered (Buchner)" : "recrystallised product filtered", "white crystals", "reduced pressure"); S.pumped = false; draw(); ctx.after(500, advance); } }]);
            break;
          case "recryst":
            btns([{ label:"Add 2 cm³ hot solvent", onClick(){ S.V += 2; draw(); } }, { label:"Add 10 cm³ hot solvent", onClick(){ S.V += 10; draw(); } }]);
            btns([{ label:"Cool slowly, then in ice", primary:true, onClick(){
              if(S.V < S.Vmin*.97) return ctx.toast("Solid is still undissolved — add a little more hot solvent");
              S.recovered = Math.max(.15, S.pure - .022*S.V);
              if(S.V > S.Vmin*1.6) mistake("solvent", `Too much solvent (${S.V} cm³ for about ${S.Vmin} cm³ needed): much of the aspirin stays dissolved, so only a few crystals form.`);
              rec("recrystallised from hot solvent", `${S.V} cm³`, S.V > S.Vmin*1.6 ? "too much solvent: few crystals" : "crystals formed on cooling"); advance(); } }]);
            break;
          case "dryc":
            btns([{ label:"Dry between filter papers, then in a desiccator", primary:true, onClick(){ S.dried = true; S.mPtrue = S.recovered + .004; rec("product dried", "desiccator"); draw(); ctx.after(500, advance); } }]);
            break;
          case "weighP":
            btns([{ label:"Tare with empty container", onClick(){ S.ptared = true; draw(); } }, { label:"Transfer all the product", onClick(){ if(!S.ptared) return ctx.toast("Tare the balance with the empty container first"); S.ptransfer = true; draw(); } }]);
            Kit.reading(ctx, `Mass of ${R.Pd.name} / g`, "e.g. 1.85", () => S.ptared && S.ptransfer ? Kit.round(S.mPtrue, 2) : null, .005, v => {
              S.mP = Kit.round(v, 2); rec(`mass of ${R.Pd.name} / g`, S.mP.toFixed(2));
              if(!S.unsafe && !S.flame && hood === "yes" && ppe === "yes") ctx.complete("safe");
              if(S.route === "ester" && S.dist.read !== null) ctx.complete("ester");
              if(S.route === "aspirin"){ S.max = steps().length - 1; advance(); } else { ctx.toast("Product weighed — now calculate the percentage yield"); draw(); }
              calc();
            }, host);
            break;
          case "mp": {
            lagNow = 0;
            seg({ label:"Sample in the capillary", value:S.mp.sample, options:[["crude","Crude (kept back)"],["rec","Recrystallised"]], onChange(v){ S.mp.sample = v; S.mp.T = 110; S.mp.mode = "off"; S.mp.start = S.mp.end = null; modeSeg.set("off"); draw(); } });
            const modeSeg = seg({ label:"Heating", value:S.mp.mode, options:[["off","Pause"],["fast","Fast (≈ 3 °C/s)"],["slow","Slow (≈ 0.5 °C/s)"]], onChange(v){ S.mp.mode = v; draw(); } });
            btns([{ label:"Cool and reset to 110 °C", onClick(){ S.mp.T = 110; S.mp.mode = "off"; modeSeg.set("off"); S.mp.start = S.mp.end = null; draw(); } }]);
            Kit.reading(ctx, "Melting starts at / °C (pause, then read)", "e.g. 134.0", () => S.mp.mode === "off" ? S.mp.T : null, .5, v => {
              if(meltFrac() <= 0) return ctx.toast("No liquid in the capillary yet — keep heating slowly");
              S.mp.start = v; rec(`m.p. starts (${S.mp.sample === "rec" ? "recrystallised" : "crude"}) / °C`, v.toFixed(1)); }, host);
            Kit.reading(ctx, "Completely melted at / °C", "e.g. 135.5", () => S.mp.mode === "off" ? S.mp.T : null, .5, v => {
              if(S.mp.start === null) return ctx.toast("Record where melting starts first");
              if(meltFrac() < 1) return ctx.toast("Some solid is still visible — it has not completely melted");
              S.mp.end = v; const range = v - S.mp.start;
              rec(`m.p. complete (${S.mp.sample === "rec" ? "recrystallised" : "crude"}) / °C`, v.toFixed(1), `range ${S.mp.start.toFixed(1)}–${v.toFixed(1)} °C`);
              mpDone[S.mp.sample] = true; if(mpDone.rec && mpDone.crude) ctx.complete("mp");
              if(S.mp.sample === "rec" && range <= 2 && Math.abs(S.mp.start - MP_DATA) <= 2 && Math.abs(v - MP_DATA) <= 2) ctx.complete("pure");
              else if(S.mp.sample === "rec" && S.mp.start > MP_DATA + 1.5) mistake("fast", "Your reading is above the data value — heating too fast makes the thermometer lag behind the sample. Heat slowly near the melting point.");
              ctx.toast(`Melting range ${S.mp.start.toFixed(1)}–${v.toFixed(1)} °C (data value ${MP_DATA} °C)`); }, host);
            break; }
          case "tlc": {
            const t = S.tlc;
            seg({ label:"Baseline drawn in", value:t.line, options:[["pencil","Pencil"],["ink","Ink"]], onChange(v){ t.line = v; draw(); } });
            seg({ label:"Solvent depth in the tank", value:t.depth, options:[["below","Below the baseline"],["above","Above the baseline"]], onChange(v){ t.depth = v; draw(); } });
            btns([{ label:"Spot the plate, develop (lid on)", primary:true, onClick(){ if(S.anim) return; t.state = "dev"; t.sel = null; S.anim = 3; S.animKind = "tlc"; draw(); } },
              { label:"New plate", onClick(){ t.state = "new"; t.sel = null; t.front = t.spot = null; t.dF = Kit.round(5.8 + Math.random()*.8, 2); build(); } }]);
            if(t.state === "done" && t.depth !== "above"){
              Kit.reading(ctx, "Distance from baseline to the magnified line / cm", "e.g. 3.4", () => t.sel === null ? null : t.sel === "front" ? t.dF : spots()[t.sel].d, .06, v => {
                if(t.sel === "front"){ t.front = v; rec("TLC: solvent front distance / cm", String(v)); }
                else { const p = spots()[t.sel]; t.spot = v; t.spotName = `${["SA","crude","product","aspirin"][p.lane]} lane`; t.spotTrue = p; rec(`TLC: spot distance, ${t.spotName} / cm`, String(v)); }
                ctx.toast("Distance recorded"); calc(); }, host);
            }
            break; }
          case "distil1": case "distil2": {
            const d = S.dist; d.on = false; d.T = 21; d.collected = false; d.read = null;
            if(id === "distil2") seg({ label:"Thermometer bulb", value:d.bulb, options:[["arm","Level with the side arm"],["liquid","In the liquid"]], onChange(v){ d.bulb = v; if(v === "liquid") mistake("bulb", "The bulb must be level with the side arm to read the temperature of the vapour that distils, not the liquid."); draw(); } });
            seg({ label:"Heat source", value:"bath", options:[["bath","Electric water bath"],["bunsen","Bunsen burner"]], onChange(v){ if(v === "bunsen"){ S.flame = true; mistake("flame", "No naked flames — ethyl ethanoate and ethanol vapours are highly flammable."); } } });
            btns([{ label:"Turn on the water bath", onClick(){ d.on = true; draw(); } },
              { label:id === "distil1" ? "Collect everything below 85 °C" : "Collect the 74–79 °C fraction", primary:true, onClick(){
                if(!d.on || d.T < 70) return ctx.toast("Nothing is distilling yet");
                if(id === "distil2" && d.read === null) return ctx.toast("Read and record the thermometer first");
                if(id === "distil2" && (d.T < 74 || d.T > 79)) return ctx.toast("The thermometer is not reading 74–79 °C — check where the bulb is");
                S.loss *= .9; d.collected = true; d.on = false; rec(id === "distil1" ? "crude distillate collected" : "pure fraction collected", id === "distil1" ? "below 85 °C" : "74–79 °C"); draw(); ctx.after(700, advance); } }]);
            if(id === "distil2") Kit.reading(ctx, "Steady thermometer reading / °C (to 0.5 °C)", "e.g. 77.0", () => d.on && d.T > 70 ? d.T : null, .5, v => { d.read = v; rec("boiling temperature / °C", v.toFixed(1), d.bulb === "arm" ? `data value ${BP_DATA} °C` : "bulb in the liquid!"); ctx.toast("Recorded"); }, host);
            break; }
          case "wash": {
            const sp = S.sep;
            btns([{ label:"Add crude ester + 10 cm³ Na₂CO₃(aq)", onClick(){ sp.added = true; draw(); } },
              { label:"Stopper, invert and shake", onClick(){
                if(!sp.added) return ctx.toast("Add the liquids first"); if(sp.settled) return ctx.toast("Already settled");
                sp.inv = true; sp.shakes++;
                if(sp.unvented >= 1 && sp.shakes <= 3){ S.loss *= .75; sp.unvented = 0; mistake("pressure", "Pop! CO₂ pressure blew the stopper out and some liquid sprayed out. Invert and open the tap after every shake."); }
                else sp.unvented++;
                draw(); } },
              { label:"Invert and open the tap (vent)", onClick(){ if(!sp.added) return; sp.inv = true; ctx.toast(sp.shakes <= 2 && sp.unvented ? "Hiss — CO₂ released" : "Little gas released"); sp.unvented = 0; draw(); } },
              { label:"Stand upright; remove stopper; settle", onClick(){ if(sp.shakes < 2) return ctx.toast("Shake (and vent) at least twice first"); sp.inv = false; sp.settled = true; draw(); } }]);
            seg({ label:"Run off and discard", value:"lower", options:[["lower","Lower layer"],["upper","Upper layer"]], onChange(v){ sp.discard = v; } });
            btns([{ label:"Open the tap and run off", primary:true, onClick(){
              if(!sp.settled) return ctx.toast("Let the layers settle (stopper removed) first");
              if((sp.discard || "lower") === "upper"){ mistake("layer", "That was the ester! Ethyl ethanoate (0.90 g cm⁻³) floats on the aqueous layer. Start the preparation again."); newRun(); build(); return; }
              sp.ranOff = true; S.loss *= .92; rec("washed with Na₂CO₃(aq)", "effervescence; lower aqueous layer discarded"); draw(); ctx.after(700, advance); } }]);
            break; }
          case "drym":
            btns([{ label:"Add a spatula of anhydrous MgSO₄; swirl", onClick(){ S.mg.n++; draw(); } },
              { label:"Filter off the drying agent", primary:true, onClick(){
                if(S.mg.n < S.mg.need) return ctx.toast("The powder is still clumping and the liquid is cloudy — it is not dry yet");
                S.loss *= .95; rec("dried with anhydrous MgSO₄", `${S.mg.n} spatulas`, "free-flowing powder, clear liquid"); advance(); } }]);
            break;
        }
        if(id === "weighP" && S.route === "ester") S.mPtrue = Math.max(.3, S.mRtrue/ROUTES.ester.R.Mr*ROUTES.ester.Pd.Mr*.66*S.loss);
        draw(); calc();
      }

      /* ── calculations from the student's own data ── */
      function calc(){
        if(!yieldBox){
          yieldBox = Kit.answer(ctx, "Percentage yield / %", "from your masses", v => {
            if(S.mR === null || S.mP === null) return [false, "Record the reactant and product masses first."];
            const R = ROUTES[S.route], theo = S.mR/R.R.Mr*R.Pd.Mr, y = S.mP/theo*100;
            if(Math.abs(v - y) <= .6){ ctx.complete("yield"); rec("percentage yield / %", y.toFixed(1)); return [true, `Correct: theoretical yield = ${S.mR.toFixed(2)} ÷ ${R.R.Mr} × ${R.Pd.Mr} = ${theo.toFixed(2)} g; yield = ${S.mP.toFixed(2)} ÷ ${theo.toFixed(2)} × 100 = ${y.toFixed(1)}%.`]; }
            return [false, `Moles of ${R.R.name} = mass ÷ ${R.R.Mr}; 1 : 1 ratio; theoretical mass = moles × ${R.Pd.Mr}. Then actual ÷ theoretical × 100.`];
          }, calcHost);
          rfBox = Kit.answer(ctx, "Rf of the spot you last measured", "e.g. 0.45", v => {
            const t = S.tlc; if(t.front === null || t.spot === null) return [false, "Measure the solvent front and a spot first."];
            const rf = t.spot/t.front;
            if(Math.abs(v - rf) <= .015){ ctx.complete("rf"); rec(`Rf (${t.spotName})`, rf.toFixed(2), t.spotTrue ? t.spotTrue.name : ""); return [true, `Rf = ${t.spot} ÷ ${t.front} = ${rf.toFixed(2)} — this spot is ${t.spotTrue.name}.`]; }
            return [false, "Rf = distance moved by the spot ÷ distance moved by the solvent front (both from the baseline)."];
          }, calcHost);
        }
        rfBox.box.style.display = S.route === "aspirin" ? "" : "none";
      }
      build();
    }
  });
})();

/* ───────────── A LEVEL ORGANIC REACTIONS AND TESTS ───────────── */
(function(){
  const P = "a-organic-tests";
  const W = [245,245,245], BR = [235,150,40], PURPLE = [150,40,160], BLUE = [60,110,220], REDP = [190,60,30], ORANGE = [240,145,30], FUME = [235,235,235];
  const PH = { 1:[220,40,40], 2:[235,80,40], 3:[240,130,40], 5:[240,210,60], 7:[80,170,80], 8:[60,150,170], 12:[90,70,190] };
  const OIL = { sol:[235,220,190], solA:.55, fill:.25 };
  const H2 = ["effervescence; gas pops with a lighted splint (H₂)", { bubbles:1 }];
  const CO2 = ["effervescence; gas turns limewater milky (CO₂)", { bubbles:1 }];
  const WARM = ["no visible change; the tube gets warm (neutralisation)"];
  const MIRROR = ["silver mirror / black ppt. forms", { mirror:1, ppt:[60,60,60], pptAmount:.4 }];
  const FEHPOS = ["blue solution gives an orange / red-brown ppt.", { sol:BLUE, ppt:REDP }];
  const DECOL = ["purple solution turns colourless", { sol:null }];
  const DEF = {
    water:["mixes completely with water; no visible change"], br:["orange bromine water stays orange; no ppt.", { sol:BR }], naoh:["no visible change"], hcl:["no visible change"],
    co3:["no effervescence"], na:["no reaction"], agno3:["no ppt."], etoh:["no visible change"], nh3:["no visible change"], mno4:["stays purple", { sol:PURPLE }],
    tol:["no silver mirror; stays colourless"], feh:["stays blue; no ppt.", { sol:BLUE }], naohw:["no gas; damp red litmus paper stays red"],
    diazo:["no coloured ppt.; the solution stays colourless"], couple:["no coloured ppt.; pale yellow solution", { sol:[245,235,190] }]
  };
  const C = {
    "phenol":{ cls:"phenol", form:"colourless crystals (some pink)",
      water:["partly dissolves; a cloudy mixture forms; antiseptic smell", { sol:[240,240,235], solA:.75 }], ph:["pH 5–6: weakly acidic", { sol:PH[5] }],
      br:["orange bromine water decolourised; white ppt. (2,4,6-tribromophenol)", { ppt:W, sol:[245,245,240], solA:.3 }],
      naoh:["dissolves completely, giving a colourless solution (sodium phenoxide)"], co3:["no effervescence (phenol is too weak an acid to react with carbonate)"], na:H2,
      mno4:["purple colour fades; solution turns brown", { sol:[150,95,50] }], couple:["yellow-orange ppt. (an azo dye) forms", { ppt:ORANGE, sol:[245,190,60] }] },
    "phenylamine":{ cls:"aromatic amine", form:"colourless to pale brown oily liquid",
      water:["does not dissolve: oily drops that do not mix (only slightly soluble)", OIL], ph:["pH 8–9: only very weakly alkaline", { sol:PH[8] }],
      br:["orange bromine water decolourised; white ppt. (2,4,6-tribromophenylamine)", { ppt:W, sol:[245,245,240], solA:.3 }],
      naoh:["does not dissolve; oily drops remain", OIL], hcl:["oily drops dissolve, giving a colourless solution (phenylammonium chloride)"],
      mno4:["purple colour disappears; a dark brown / black colour forms", { sol:[70,45,30] }], diazo:["orange-red ppt. (an azo dye) forms", { ppt:[205,60,30], sol:[230,120,50] }] },
    "ethylamine (aq)":{ cls:"aliphatic amine", form:"colourless aqueous solution with a fishy smell",
      water:["mixes completely; strong fishy smell"], ph:["pH 11–12: alkaline", { sol:PH[12] }], br:["orange colour disappears (Br₂ reacts with the alkaline solution); no ppt.", { sol:null }],
      hcl:WARM, na:["effervescence — but this is the water in the solution reacting, so the test is not valid", { bubbles:1 }],
      agno3:["brown ppt. (silver oxide, from the OH⁻ ions in the alkaline solution)", { ppt:[110,70,40] }],
      naohw:["fishy smell; damp red litmus paper turns blue (ethylamine vapour is alkaline)"], diazo:["effervescence (N₂ given off); no coloured ppt. — aliphatic diazonium ions decompose at once", { bubbles:1 }] },
    "ethanoyl chloride":{ cls:"acyl chloride", form:"colourless liquid (kept in a stoppered bottle)",
      water:["violent reaction; steamy white fumes (HCl); tube gets hot; colourless solution", { fumes:FUME }], ph:["steamy fumes; pH 1: strongly acidic (HCl + ethanoic acid formed)", { sol:PH[1], fumes:FUME }],
      br:["steamy fumes (it reacts with the water); orange colour stays", { sol:BR, fumes:FUME }], naoh:["vigorous reaction; tube gets hot; colourless solution", { fumes:FUME }],
      co3:["vigorous effervescence (CO₂, from the HCl formed); steamy fumes", { bubbles:1, fumes:FUME }], na:["not done — it reacts violently with sodium"],
      agno3:["steamy fumes, then a white ppt. (AgCl) at once", { ppt:W, fumes:FUME }],
      etoh:["steamy fumes (HCl); tube gets warm; sweet, fruity smell of an ester (ethyl ethanoate)", { fumes:FUME }],
      nh3:["violent reaction; dense white smoke (NH₄Cl) and a white solid (ethanamide)", { fumes:[250,250,250], ppt:W }], mno4:["stays purple; steamy fumes", { sol:PURPLE, fumes:FUME }] },
    "benzoyl chloride":{ cls:"acyl chloride", form:"colourless liquid with a sharp smell",
      water:["does not mix; oily drops; slowly a smell of HCl and some white solid (benzoic acid) on shaking", OIL], ph:["pH 1–2 after shaking for a while (HCl formed slowly)", { sol:PH[2] }],
      co3:["slow effervescence as it hydrolyses", { bubbles:1 }], naoh:["oily drops slowly disappear on shaking"], na:["not done — it reacts violently with sodium"],
      agno3:["white ppt. (AgCl) forms slowly as it hydrolyses", { ppt:W, pptAmount:.5 }],
      etoh:["steamy fumes on warming; fruity smell of an ester (ethyl benzoate)", { fumes:FUME }],
      nh3:["vigorous reaction; white smoke and a white solid (benzamide)", { fumes:[250,250,250], ppt:W }] },
    "ethanamide":{ cls:"amide", form:"white crystalline solid",
      water:["dissolves; no visible change"], ph:["pH 7: neutral", { sol:PH[7] }],
      naohw:["ammonia given off on warming: smell of ammonia; damp red litmus paper turns blue", { bubbles:1 }] },
    "methanoic acid":{ cls:"carboxylic acid (reducing)", form:"colourless liquid with a sharp smell",
      ph:["pH 2–3: acidic", { sol:PH[2] }], co3:CO2, na:H2, naoh:WARM, br:["orange colour slowly fades; slight effervescence", { sol:[245,215,160] }],
      mno4:["purple solution turns colourless; effervescence (CO₂)", { sol:null, bubbles:1 }], tol:MIRROR, feh:FEHPOS },
    "ethanedioic acid":{ cls:"dicarboxylic acid (reducing)", form:"white crystalline solid",
      water:["dissolves; no visible change"], ph:["pH 1–2: acidic", { sol:PH[1] }], co3:CO2, na:H2, naoh:WARM,
      mno4:["no change in the cold; on warming to about 60 °C the purple solution turns colourless with effervescence (CO₂)", { sol:null, bubbles:1 }] },
    "ethanoic acid":{ cls:"carboxylic acid", form:"colourless liquid; smell of vinegar",
      ph:["pH 3: weakly acidic", { sol:PH[3] }], co3:CO2, na:H2, naoh:WARM },
    "benzoic acid":{ cls:"aromatic carboxylic acid", form:"white crystalline solid",
      water:["white solid barely dissolves in cold water", { ppt:W, pptAmount:.6 }], ph:["pH 3–4 (saturated solution): weakly acidic", { sol:PH[3] }],
      naoh:["dissolves, giving a colourless solution (sodium benzoate)"], co3:["dissolves with effervescence; gas turns limewater milky (CO₂)", { bubbles:1 }], na:H2 },
    "ethanol":{ cls:"alcohol", form:"colourless liquid",
      ph:["pH 7: neutral", { sol:PH[7] }], na:H2, mno4:DECOL },
    "ethanal":{ cls:"aldehyde", form:"colourless, very volatile liquid",
      ph:["pH 7: neutral", { sol:PH[7] }], mno4:DECOL, tol:MIRROR, feh:FEHPOS },
    "benzaldehyde":{ cls:"aromatic aldehyde", form:"colourless liquid; smell of almonds",
      water:["does not mix: oily drops; smell of almonds", OIL], ph:["pH 7: neutral", { sol:PH[7] }],
      mno4:["purple colour fades on warming (oxidised to benzoic acid)", { sol:[220,190,215] }], tol:MIRROR,
      feh:["stays blue; no ppt. (aromatic aldehydes do not reduce Fehling’s solution)", { sol:BLUE }] }
  };
  const NAMES = Object.keys(C);
  const TESTS = [
    ["water","Add to water; shake; smell cautiously"], ["ph","Universal indicator paper (with water)"], ["br","Bromine water, room temperature"],
    ["naoh","Dilute NaOH(aq), shake"], ["hcl","Dilute HCl(aq), shake"], ["co3","Na₂CO₃(aq)"], ["na","Sodium metal (dry sample)"],
    ["agno3","Add to water, then AgNO₃(aq)"], ["etoh","Add ethanol (fume cupboard)"], ["nh3","Concentrated NH₃(aq) (fume cupboard)"],
    ["mno4","Acidified KMnO₄(aq), warm"], ["tol","Tollens’ reagent, warm (water bath)"], ["feh","Fehling’s solution, warm (water bath)"],
    ["naohw","Warm with NaOH(aq); damp red litmus at the mouth"],
    ["diazo","Dil. HCl, below 10 °C add NaNO₂(aq), then alkaline 2-naphthol"], ["couple","Add to cold benzenediazonium chloride, then NaOH(aq)"]
  ];
  function result(c, k){
    const o = C[c][k] || DEF[k] || ["no visible change"];
    return Object.assign({ obs:o[0] }, o[1] || {});
  }

  Lab.register({
    id:P, subject:"chemistry", level:["a"], topic:"Organic chemistry · Phenols, amines, acyl chlorides, azo dyes", interactive:true,
    title:"A Level organic reactions and tests",
    summary:"Phenol and phenylamine with bromine water, acids and alkalis; acyl chlorides with water, alcohols and ammonia; amide hydrolysis; amine basicity; oxidation of methanoic and ethanedioic acids; Tollens’ and Fehling’s. Make an azo dye by diazotisation below 10 °C and see what happens if it is warmed. Identify unknown A Level compounds.",
    aim:"Carry out the A Level organic reactions in 9701 topics 32–34 and use the observations to identify unknown organic compounds.",
    variables:null,
    stageTitle:"Test tubes", controlsTitle:"Tests",
    thumb:`<svg viewBox="0 0 300 140"><path d="M80 10 v100 a14 14 0 0 0 28 0 v-100" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M81 60 h26 v50 a13 13 0 0 1 -26 0z" fill="#F2F2F2"/><circle cx="90" cy="112" r="3" fill="#ddd"/><path d="M146 10 v100 a14 14 0 0 0 28 0 v-100" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M147 60 h26 v50 a13 13 0 0 1 -26 0z" fill="#E8862C"/><path d="M212 10 v100 a14 14 0 0 0 28 0 v-100" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M216 4 q-6 -10 0 -18 M226 4 q-6 -10 0 -18" stroke="#ccc" stroke-width="3" fill="none"/><path d="M213 70 h26 v40 a13 13 0 0 1 -26 0z" fill="#CFE0F0"/></svg>`,
    challenges:[
      { id:"five",  title:"Five unknowns", text:"Correctly identify five unknown compounds." },
      { id:"phph",  title:"Phenol or phenylamine?", text:"Both give a white ppt. with bromine water. Identify an unknown phenol and an unknown phenylamine." },
      { id:"acyl",  title:"Acyl chloride", text:"React ethanoyl chloride with water, with ethanol and with concentrated ammonia." },
      { id:"acid",  title:"Acidity ladder", text:"Test ethanoic acid, phenol and ethanol with Na₂CO₃(aq), NaOH(aq) and sodium (all nine)." },
      { id:"ox",    title:"Oxidisable acids", text:"Show that methanoic and ethanedioic acids both decolourise warm acidified KMnO₄, but only methanoic acid reduces Tollens’ reagent." },
      { id:"azo",   title:"Azo dye", text:"Diazotise phenylamine below 10 °C (read the thermometer) and couple it with phenol in NaOH(aq)." },
      { id:"warm",  title:"Too warm", text:"Show what happens to benzenediazonium chloride above 10 °C." }
    ],
    columns:[{key:"n",label:"Sample"},{key:"test",label:"Test"},{key:"obs",label:"Observation"}],
    questions:[
      { q:"Phenol and phenylamine both give a white ppt. with bromine water. Give two tests that distinguish them.",
        a:"Phenol dissolves in NaOH(aq) (forming sodium phenoxide) but not in dilute HCl; phenylamine dissolves in dilute HCl (forming phenylammonium chloride) but not in NaOH(aq). Also, phenylamine can be diazotised below 10 °C and coupled with alkaline 2-naphthol/phenol to give an orange-red azo dye." },
      { q:"Why does phenol react with bromine water at room temperature when benzene needs Br₂ with an FeBr₃ catalyst?",
        a:"A lone pair on the oxygen is delocalised into the ring, increasing its electron density. The ring is activated, so it polarises Br₂ without a catalyst; substitution occurs at the 2-, 4- and 6-positions." },
      { q:"Put ethanoic acid, phenol, ethanol and water in order of acidity and explain using your test results.",
        a:"Ethanoic acid > phenol > water > ethanol. Only the carboxylic acid reacts with Na₂CO₃ (effervescence). Phenol reacts with NaOH but not Na₂CO₃. Ethanol reacts with neither — only with sodium. The carboxylate ion is stabilised by delocalisation over two O atoms; the phenoxide ion's charge is partly delocalised into the ring; the ethoxide ion's charge is intensified by the electron-donating ethyl group." },
      { q:"Why must the diazotisation of phenylamine be carried out below 10 °C, and why is the coupling done in NaOH(aq)?",
        a:"Benzenediazonium chloride is unstable: above about 10 °C it decomposes, giving off N₂ and forming phenol, so little dye forms. In NaOH(aq) phenol is present as the phenoxide ion, which is more strongly activated, so coupling at the 4-position is faster." },
      { q:"Explain the order of base strength: ethylamine > ammonia > phenylamine.",
        a:"The ethyl group is electron-donating, so the lone pair on N is more available to accept a proton. In phenylamine the lone pair is delocalised into the benzene ring, so it is less available. This is why phenylamine solution is only very weakly alkaline (pH 8–9), and why amides (lone pair delocalised onto C=O) are not basic at all." },
      { q:"Why does ethanoyl chloride fume in moist air while chlorobenzene does not react with water even on boiling?",
        a:"In the acyl chloride the carbonyl carbon is bonded to two electronegative atoms (O and Cl), so it is very δ+ and is attacked rapidly by water (addition–elimination), releasing HCl fumes. In chlorobenzene a lone pair of Cl overlaps with the ring, strengthening the C–Cl bond. Halogenoalkanes are in between." },
      { q:"Which acids reduce acidified KMnO₄, and why does only methanoic acid give a silver mirror?",
        a:"Methanoic acid (HCOOH) and ethanedioic acid (HOOC–COOH, warm to about 60 °C) are both oxidised to CO₂. Methanoic acid contains an H–C=O group, like an aldehyde, so it is a strong enough reducing agent for Tollens’ and Fehling’s; ethanedioic acid is not." },
      { q:"Paper 5: a student's ¹H NMR spectrum of an unknown has a broad peak at δ 4.5–7.0 that disappears on shaking with D₂O. What does this show, and how could you confirm it chemically?",
        a:"The peak is an exchangeable proton: O–H of a phenol (Ar–OH, δ 4.5–7.0). D₂O replaces the H with D, which gives no ¹H signal. Confirm with bromine water (white ppt., decolourised) and NaOH(aq) (dissolves) but no effervescence with Na₂CO₃." },
      { q:"Paper 5: state the hazards and precautions when testing acyl chlorides and amines.",
        a:"Acyl chlorides are corrosive, react violently with water and release HCl fumes; amines (and phenylamine, which is toxic by skin absorption) are harmful. Use a fume cupboard, gloves and goggles, add small amounts dropwise, and keep away from flames (ethanoyl chloride and ethylamine are flammable)." }
    ],
    setup(ctx){
      let unk, num = Math.max(0, ...ctx.rows().map(r => +String(r.n).replace(/\D/g, "") || 0)), ok = 0, sample = "unknown", mode = "tests";
      const got = new Set(), done = new Set();
      ctx.stage.innerHTML = `<svg viewBox="0 0 960 420" class="kb" id="${P}-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 390)}<g id="${P}-g"></g><text x="24" y="30" class="k-status" id="${P}-s"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#" + P + "-svg"), g = svg.querySelector(`#${P}-g`);
      function show(tube, title, obs, sub){
        let s = ChemKit.tube(Object.assign({ id:`${P}-t`, x:190, y:150 }, tube));
        const ls = ChemKit.wrap(obs, 50);
        s += `<g transform="translate(420 70)"><rect width="510" height="${78 + ls.length*20}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="16" y="26" class="k-tag">Observation</text>${ChemKit.lines(obs, 50, 16, 52, 20, "k-numb")}
          ${sub ? `<text x="16" y="${62 + ls.length*20}" class="k-lbl">${ctx.esc(sub)}</text>` : ""}</g>`;
        g.innerHTML = s; svg.querySelector(`#${P}-s`).textContent = title;
      }
      const cur = () => sample === "unknown" ? unk : sample, curLabel = () => sample === "unknown" ? "FA " + num : sample;

      /* ── mode ── */
      ctx.seg({ label:"Bench", value:mode, options:[["tests","Test-tube reactions"],["diazo","Diazotisation & azo dye"]], onChange(v){ mode = v; sync(); } });
      const testsBox = ctx.html(`<div></div>`), dzBox = ctx.html(`<div></div>`);
      ctx.select({ parent:testsBox, label:"Sample", value:"unknown", options:[["unknown","Unknown (FA)"]].concat(NAMES.map(n => [n, "Known: " + n])), onChange(v){ sample = v; idle(); } });
      ctx.html(`<div class="ctl"><div class="lbl"><span>Tests (a fresh portion each time)</span></div></div>`, testsBox);
      const grid = ctx.html(`<div class="ctl" style="display:grid;gap:.35rem"></div>`, testsBox);
      TESTS.forEach(([k, name]) => {
        const b = ctx.el(`<button type="button" class="btn small" style="justify-content:flex-start;border-radius:10px;text-align:left">${ctx.esc(name)}</button>`);
        b.onclick = () => runTest(k, name); grid.appendChild(b);
      });
      function runTest(k, name){
        const c = cur(), r = result(c, k);
        show(Object.assign({ label:curLabel() }, r), `${curLabel()} + ${name}`, r.obs, sample === "unknown" ? `${curLabel()}: ${look(c)}` : "");
        ctx.readout([["Sample", curLabel()], ["Test", name]]);
        ctx.record({ n:curLabel(), test:name, obs:r.obs }, true);
        done.add(c + "|" + k);
        if(["water","etoh","nh3"].every(t => done.has("ethanoyl chloride|" + t))) ctx.complete("acyl");
        if(["ethanoic acid","phenol","ethanol"].every(x => ["co3","naoh","na"].every(t => done.has(x + "|" + t)))) ctx.complete("acid");
        if(["methanoic acid|mno4","ethanedioic acid|mno4","methanoic acid|tol","ethanedioic acid|tol"].every(x => done.has(x))) ctx.complete("ox");
      }
      /* identify */
      const idb = ctx.html(`<div class="ctl"><div class="lbl"><span>Identify the unknown</span></div>
        <select class="inp" aria-label="Compound" style="margin-bottom:.4rem;width:100%"><option value="">Compound…</option>${NAMES.map(n => `<option>${n}</option>`).join("")}</select>
        <div class="btns"><button class="btn small primary" type="button" data-a="check">Check</button><button class="btn small" type="button" data-a="new">New unknown</button></div><div style="margin-top:.5rem" data-fb></div></div>`, testsBox);
      const fb = idb.querySelector("[data-fb]"), sel = idb.querySelector("select");
      idb.querySelector("[data-a=check]").onclick = () => {
        const v = sel.value; if(!v){ fb.innerHTML = `<div class="note bad">Choose a compound.</div>`; return; }
        if(v !== unk){ fb.innerHTML = `<div class="note bad">${C[v].cls === C[unk].cls ? "Right functional group, wrong compound — look for a test that separates them." : "Not that one. Which functional group do your results show?"}</div>`; return; }
        ok++; if(ok >= 5) ctx.complete("five"); got.add(unk); if(got.has("phenol") && got.has("phenylamine")) ctx.complete("phph");
        ctx.record({ n:"FA " + num, test:"identified", obs:`${unk} (${C[unk].cls})` }, true);
        fb.innerHTML = `<div class="note ok">Correct — FA ${num} is ${unk} (${C[unk].cls}).</div>`;
      };
      idb.querySelector("[data-a=new]").onclick = () => { sel.value = ""; fb.innerHTML = ""; next(); };
      function next(){ let n; do{ n = NAMES[Math.floor(Math.random()*NAMES.length)]; }while(n === unk); unk = n; num++; sample = "unknown"; testsBox.querySelector("select").value = "unknown"; idle(); }
      const look = c => C[c].form.split(/;| with /)[0];
      function idle(){ show({ sol:null, label:curLabel() }, sample === "unknown" ? `Unknown FA ${num}` : sample, sample === "unknown" ? `FA ${num}: ${look(unk)}. Choose a test.` : `${sample}: ${C[sample].form}. Choose a test.`); }

      /* ── diazotisation bench ── */
      const BATH = { ice:{ T:2, name:"ice–water bath" }, tap:{ T:19, name:"tap-water bath" }, warm:{ T:50, name:"warm-water bath (50 °C)" } };
      const D = { bath:"ice", T:19, Tset:2, dissolved:false, read:null, dz:null, made:null, couple:"phenol", dye:null, gas:false };
      function dzReset(){ Object.assign(D, { T:19, dissolved:false, read:null, dz:null, made:null, dye:null, gas:false, obs:"Dissolve phenylamine in dilute HCl in a boiling tube standing in the bath." }); D.Tset = BATH[D.bath].T + (Math.random() - .5)*1.2; }
      const therm = Kit.thermometer(`${P}-th`, 360, 80, 260, -10, 60, 10);
      function dzDraw(){
        if(mode !== "diazo") return;
        const sol = D.dz === null ? (D.dissolved ? [235,235,225] : null) : D.dye ? null : [235,235,215];
        let s = `<path d="${ChemKit.BEAKER(130, 380, 170, 150)}" fill="none" stroke="var(--txt2)" stroke-width="1.6"/><rect x="132" y="${380 - 110}" width="166" height="108" fill="${D.bath === "warm" ? "rgba(235,170,120,.35)" : "rgba(120,170,230,.45)"}"/>`;
        if(D.bath === "ice") for(let i = 0; i < 6; i++) s += `<rect x="${140 + i*25}" y="${275 + (i % 2)*8}" width="16" height="14" rx="3" fill="rgba(240,248,255,.9)" stroke="#B9C7D8"/>`;
        s += ChemKit.tube(Object.assign({ id:`${P}-dt`, x:198, y:120, sol, fill:D.dissolved ? .5 : .02, bubbles:D.gas ? 1 : 0, layer:D.gas && !D.dye ? [235,225,200] : null }, D.dye ? { ppt:D.dye.col, pptAmount:D.dye.amt, sol:[245,200,120] } : {}));
        s += `<line x1="236" y1="300" x2="356" y2="${80 + 260 - (Math.max(-10, D.T) + 10)/70*260}" stroke="var(--accent)" stroke-dasharray="3 3"/>` + therm.svg;
        s += `<text x="215" y="410" text-anchor="middle" class="k-lbl">${BATH[D.bath].name}</text>`;
        s += ChemKit.lens({ id:`${P}-dl`, cx:560, cy:220, r:100, S:22, value:D.T, minor:1, major:5, down:false, tube:6, flat:true, liquid:"#E0334A", label:"magnifier on the thermometer (1 °C divisions)" });
        const ls = ChemKit.wrap(D.obs, 30);
        s += `<g transform="translate(690 60)"><rect width="250" height="${46 + ls.length*18}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="14" y="24" class="k-tag">Observation</text>${ChemKit.lines(D.obs, 30, 14, 46, 18, "k-numb")}</g>`;
        g.innerHTML = s; therm.set(svg, D.T);
        svg.querySelector(`#${P}-s`).textContent = !D.dissolved ? "Phenylamine + dilute HCl" : D.dz === null ? "Read the temperature, then add NaNO₂(aq)" : D.dye ? "Coupled" : "Benzenediazonium chloride solution";
      }
      ctx.frame(dt => {
        if(mode !== "diazo") return;
        const old = D.T; D.T += (D.Tset - D.T)*Math.min(1, dt*.35);
        if(Math.abs(D.T - D.Tset) < .02) D.T = D.Tset;
        if(D.dz !== null && D.dz > 0 && D.T > 10 && !D.dye){ D.dz = Math.max(0, D.dz - dt*(D.T - 10)/40); if(!D.gas){ D.gas = true; D.obs = "effervescence (N₂); oily drops and a smell of phenol: the diazonium salt is decomposing"; ctx.record({ n:"diazonium salt", test:`warmed in ${BATH[D.bath].name}`, obs:D.obs }, true); ctx.complete("warm"); } }
        if(Math.abs(old - D.T) > .005) dzDraw();
      });
      ctx.seg({ parent:dzBox, label:"Bath around the boiling tube", value:D.bath, options:[["ice","Ice–water"],["tap","Tap water"],["warm","Warm water (50 °C)"]], onChange(v){ D.bath = v; D.Tset = BATH[v].T + (Math.random() - .5)*1.2; dzDraw(); } });
      ctx.buttons([{ label:"Dissolve phenylamine in dilute HCl", onClick(){ D.dissolved = true; D.obs = "oily phenylamine dissolves in the acid, giving a colourless solution of phenylammonium chloride"; dzDraw(); } }], dzBox);
      Kit.reading(ctx, "Temperature of the solution / °C (to 0.5 °C)", "e.g. 3.5", () => D.dissolved ? D.T : null, .5, v => { D.read = v; ctx.record({ n:"phenylamine in HCl(aq)", test:"temperature before adding NaNO₂", obs:`${v.toFixed(1)} °C` }, true); ctx.toast("Temperature recorded"); }, dzBox);
      ctx.buttons([{ label:"Add NaNO₂(aq) dropwise, stirring", primary:true, onClick(){
        if(!D.dissolved) return ctx.toast("Dissolve the phenylamine in dilute HCl first");
        if(D.read === null) return ctx.toast("Read and record the temperature first — you must show it is below 10 °C");
        if(D.dz !== null) return ctx.toast("Already added");
        D.made = D.T; D.read = null;
        if(D.T < 10){ D.dz = 1; D.obs = "colourless solution; no gas: benzenediazonium chloride formed (HNO₂ made in situ from NaNO₂ + HCl)"; }
        else { D.dz = D.T < 30 ? .3 : 0; D.gas = true; D.obs = D.T < 30 ? "some effervescence (N₂); oily drops and a smell of phenol: some diazonium salt decomposes" : "vigorous effervescence (N₂); oily drops of phenol: the diazonium salt decomposes as it forms"; ctx.complete("warm"); }
        ctx.record({ n:"phenylamine in HCl(aq)", test:`NaNO₂(aq) added at ${D.T.toFixed(1)} °C`, obs:D.obs }, true); dzDraw(); } }], dzBox);
      ctx.seg({ parent:dzBox, label:"Couple with", value:D.couple, options:[["phenol","Phenol in NaOH(aq)"],["naph","2-naphthol in NaOH(aq)"],["neutral","Phenol in water (no NaOH)"]], onChange(v){ D.couple = v; } });
      ctx.buttons([{ label:"Pour into the cold coupling solution", primary:true, onClick(){
        if(D.dz === null) return ctx.toast("Make the diazonium salt first");
        if(D.dye) return ctx.toast("Already coupled — start again");
        const amt = D.dz*(D.couple === "neutral" ? .15 : 1), col = D.couple === "naph" ? [205,55,30] : [240,145,30];
        D.dye = { col, amt:Math.max(.05, amt) };
        D.obs = amt > .7 ? (D.couple === "naph" ? "orange-red ppt. of an azo dye forms at once" : "yellow-orange ppt. of an azo dye (4-hydroxyazobenzene) forms at once")
          : amt > .1 ? "only a little pale yellow-orange ppt.: not much dye" : "little or no dye; mainly a cloudy, pale yellow mixture";
        if(D.couple === "neutral" && D.dz > .5) D.obs += " (phenol is far less reactive than the phenoxide ion)";
        ctx.record({ n:"benzenediazonium chloride", test:`added to ${D.couple === "naph" ? "2-naphthol in NaOH(aq)" : D.couple === "neutral" ? "phenol in water" : "phenol in NaOH(aq)"}`, obs:D.obs }, true);
        if(amt > .7 && D.couple === "phenol") ctx.complete("azo");
        dzDraw(); } }], dzBox);
      ctx.buttons([{ label:"Warm the diazonium solution to 50 °C", onClick(){ if(D.dz === null) return ctx.toast("Make the diazonium salt first"); if(D.dye) return ctx.toast("It has already been coupled"); D.bath = "warm"; D.Tset = 50; dzBox.querySelector(".seg button[data-v=warm]").click(); } },
        { label:"Start again", onClick(){ dzReset(); dzDraw(); } }], dzBox);
      dzReset();
      function sync(){ testsBox.style.display = mode === "tests" ? "" : "none"; dzBox.style.display = mode === "diazo" ? "" : "none"; if(mode === "tests") idle(); else dzDraw(); }
      next(); sync();
    }
  });
})();
