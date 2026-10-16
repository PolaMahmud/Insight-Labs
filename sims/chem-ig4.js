"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMISTRY · IGCSE (0620) — part 4
   Preparing salts (excess insoluble base/carbonate · titration ·
   precipitation) · Effect of a catalyst on the rate of decomposition
   of hydrogen peroxide (gas syringe)
══════════════════════════════════════════════════════════════════ */

/* ───────────── PREPARING SALTS ───────────── */
(function(){
  const SALTS = {
    cuo:{ route:"base", name:"Copper(II) sulfate from copper(II) oxide", short:"CuSO₄·5H₂O", solid:"copper(II) oxide", solidShort:"CuO", solidCol:[30,30,32], carb:false,
      start:"25.0 cm³ of 1.00 mol dm⁻³ H₂SO₄", eq:"CuO(s) + H₂SO₄(aq) → CuSO₄(aq) + H₂O(l)", solCol:[40,125,215], formula:"CuSO₄·5H₂O", Mr:250, anhMr:160, hydrate:true,
      prodCol:[35,110,225], anhCol:[236,236,228], kind:"rhomb", look:"blue crystals", n:.025, data:"Mr(CuSO₄·5H₂O) = 250" },
    cuco3:{ route:"base", name:"Copper(II) sulfate from copper(II) carbonate", short:"CuSO₄·5H₂O", solid:"copper(II) carbonate", solidShort:"CuCO₃", solidCol:[70,160,120], carb:true,
      start:"25.0 cm³ of 1.00 mol dm⁻³ H₂SO₄", eq:"CuCO₃(s) + H₂SO₄(aq) → CuSO₄(aq) + H₂O(l) + CO₂(g)", solCol:[40,125,215], formula:"CuSO₄·5H₂O", Mr:250, anhMr:160, hydrate:true,
      prodCol:[35,110,225], anhCol:[236,236,228], kind:"rhomb", look:"blue crystals", n:.025, data:"Mr(CuSO₄·5H₂O) = 250" },
    mgco3:{ route:"base", name:"Magnesium sulfate from magnesium carbonate", short:"MgSO₄·7H₂O", solid:"magnesium carbonate", solidShort:"MgCO₃", solidCol:[246,246,246], carb:true,
      start:"25.0 cm³ of 1.00 mol dm⁻³ H₂SO₄", eq:"MgCO₃(s) + H₂SO₄(aq) → MgSO₄(aq) + H₂O(l) + CO₂(g)", solCol:null, formula:"MgSO₄·7H₂O", Mr:246, anhMr:120, hydrate:true,
      prodCol:[250,250,252], anhCol:[244,244,244], kind:"needle", look:"colourless crystals", n:.025, data:"Mr(MgSO₄·7H₂O) = 246" },
    nacl:{ route:"titr", name:"Sodium chloride by titration", short:"NaCl", start:"25.0 cm³ of 1.00 mol dm⁻³ NaOH", eq:"NaOH(aq) + HCl(aq) → NaCl(aq) + H₂O(l)",
      solCol:null, formula:"NaCl", Mr:58.5, hydrate:false, prodCol:[250,250,250], kind:"cube", look:"white crystals", n:.025, data:"Mr(NaCl) = 58.5" },
    baso4:{ route:"ppt", name:"Barium sulfate by precipitation", short:"BaSO₄", start:"25.0 cm³ of 0.500 mol dm⁻³ BaCl₂(aq)", reagent:"Na₂SO₄(aq)", sol:"BaCl₂(aq)",
      eq:"BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s) + 2NaCl(aq)", formula:"BaSO₄", Mr:233, n:.0125, pptCol:[250,250,250], obs:"white ppt.", by:"sodium chloride", byF:"NaCl",
      kind:"powder", look:"white powder", data:"Mr(BaSO₄) = 233" },
    pbi2:{ route:"ppt", name:"Lead(II) iodide by precipitation", short:"PbI₂", start:"25.0 cm³ of 0.200 mol dm⁻³ Pb(NO₃)₂(aq)", reagent:"KI(aq)", sol:"Pb(NO₃)₂(aq)",
      eq:"Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s) + 2KNO₃(aq)", formula:"PbI₂", Mr:461, n:.005, pptCol:[248,212,40], obs:"yellow ppt.", by:"potassium nitrate", byF:"KNO₃",
      kind:"powder", look:"yellow powder", data:"Mr(PbI₂) = 461" }
  };
  const METH = { base:"Excess base / carbonate", titr:"Titration", ppt:"Precipitation" };
  const ACTS = {
    base:[["measure","Measure 25 cm³ of dilute H₂SO₄ into a beaker"],["warm","Warm the acid gently"],["add","Add a spatula of SOLID and stir"],["filter","Filter the mixture"],
      ["heat","Heat the filtrate in an evaporating basin"],["rod","Dip a cold glass rod in, then take it out"],["dryness","Evaporate to dryness"],["cool","Leave to cool and crystallise"],
      ["fcryst","Filter off the crystals"],["dpaper","Dry between filter papers"],["doven","Dry in a hot oven"],["weigh","Weigh the product"]],
    titr:[["pipette","Pipette 25.0 cm³ of NaOH into a conical flask"],["ind","Add a few drops of methyl orange"],["b1","Add 1.00 cm³ of HCl from the burette"],["bd","Add HCl dropwise (0.10 cm³) and swirl"],
      ["repeat","Repeat: fresh 25.0 cm³ NaOH (no indicator)"],["runin","Run in your titre of HCl"],["heat","Heat in an evaporating basin"],["rod","Dip a cold glass rod in, then take it out"],
      ["dryness","Evaporate to dryness"],["cool","Leave to cool and crystallise"],["fcryst","Filter off the crystals"],["dpaper","Dry between filter papers"],["weigh","Weigh the product"]],
    ppt:[["measure","Measure 25 cm³ of SOL into a beaker"],["add","Add excess REAGENT and stir"],["filter","Filter the mixture"],["heat","Heat the filtrate to crystallisation point"],
      ["wash","Wash the residue with distilled water"],["doven","Dry the residue in a warm oven"],["dpaper","Dry between filter papers"],["weigh","Weigh the product"]]
  };
  const QUIZ = [["zinc sulfate","base","Zinc oxide (or zinc carbonate) is insoluble: add it in excess to dilute sulfuric acid and filter."],
    ["copper(II) chloride","base","Copper(II) oxide is insoluble: add it in excess to dilute hydrochloric acid."],
    ["magnesium nitrate","base","Magnesium carbonate (or the metal) is insoluble: add it in excess to dilute nitric acid."],
    ["potassium nitrate","titr","All potassium compounds are soluble, so an excess could not be filtered off — titrate KOH with HNO₃."],
    ["sodium sulfate","titr","Sodium hydroxide is soluble: titrate it with dilute sulfuric acid, then repeat without indicator."],
    ["ammonium chloride","titr","Ammonia solution is soluble: titrate it with hydrochloric acid."],
    ["silver chloride","ppt","Silver chloride is insoluble: mix silver nitrate solution with sodium chloride solution."],
    ["barium sulfate","ppt","Barium sulfate is insoluble: mix barium chloride (or nitrate) with a soluble sulfate."],
    ["lead(II) iodide","ppt","Lead(II) iodide is insoluble: mix lead(II) nitrate with potassium iodide solution."],
    ["calcium carbonate","ppt","Calcium carbonate is insoluble: mix calcium chloride with sodium carbonate solution."],
    ["lead(II) sulfate","ppt","Lead(II) sulfate is insoluble: mix lead(II) nitrate with dilute sulfuric acid or sodium sulfate."]];
  const WHY = [["fast","To make the reaction go faster"],["acid","So all the acid reacts — the leftover solid is easy to filter off, leaving only the salt solution"],
    ["more","So that more salt is made than the acid could make"],["lim","So that the base is the limiting reactant"]];

  Lab.register({
    id:"ig-salts", subject:"chemistry", level:["igcse"], topic:"Acids, bases & salts · Preparing salts", interactive:true,
    title:"Preparing salts: three methods",
    summary:"Carry out each preparation step by step: copper(II) or magnesium sulfate from an insoluble base or carbonate in excess, sodium chloride by titration, and barium sulfate or lead(II) iodide by precipitation. Your mistakes show up in the product. Then weigh it and work out the percentage yield.",
    aim:"Prepare pure, dry samples of soluble and insoluble salts by choosing the right method, and calculate the percentage yield.",
    variables:null,
    stageTitle:"Salt preparation", controlsTitle:"Method",
    thumb:`<svg viewBox="0 0 300 140"><path d="M70 60 Q110 120 150 60" fill="#3C7FD6" fill-opacity=".55" stroke="#A2ACBD" stroke-width="2"/><path d="M100 78 l8 -8 l8 8 l-8 8z M118 82 l7 -7 l7 7 l-7 7z" fill="#2E6FD8"/><path d="M190 30 h70 l-35 45z" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M200 36 h50 l-25 30z" fill="#F2D23C" opacity=".85"/><line x1="225" y1="75" x2="225" y2="110" stroke="#A2ACBD" stroke-width="2"/></svg>`,
    challenges:[
      { id:"excess", title:"Excess base", text:"Make crystals of copper(II) sulfate or magnesium sulfate from an insoluble base or carbonate with no mistakes." },
      { id:"titr",   title:"Titration method", text:"Make sodium chloride crystals by titration, then repeat without the indicator." },
      { id:"ppt",    title:"Precipitation", text:"Make a pure, dry insoluble salt by precipitation." },
      { id:"choose", title:"Choose the method", text:"Pick the correct method for four named salts in a row." },
      { id:"why",    title:"Why excess?", text:"Explain why the base or carbonate is added in excess." },
      { id:"yield",  title:"Percentage yield", text:"Use your balance readings to calculate the percentage yield." }
    ],
    columns:[{key:"run",label:"Run"},{key:"salt",label:"Salt"},{key:"meth",label:"Method"},{key:"look",label:"Product"},{key:"m",label:"Mass / g",dp:2},{key:"err",label:"Mistakes",dp:0}],
    questions:[
      { q:"Why is copper(II) oxide added to the acid until no more dissolves?",
        a:"So that all the acid reacts. The excess oxide is insoluble, so it is removed by filtration and the filtrate contains only copper(II) sulfate and water. If acid were left over, the crystals would be contaminated with acid." },
      { q:"How do you know when the carbonate is in excess?",
        a:"Effervescence stops and some solid remains undissolved at the bottom of the beaker, even after stirring." },
      { q:"Why is the filtrate heated only to the crystallisation point and not to dryness?",
        a:"Heating to dryness removes the water of crystallisation from hydrated salts (blue CuSO₄·5H₂O becomes white anhydrous CuSO₄) and the hot solid spits. Crystals that form slowly on cooling are larger and purer, and soluble impurities stay in the solution." },
      { q:"How can you tell that the crystallisation point has been reached?",
        a:"Dip a cold glass rod into the solution and take it out: small crystals form on the rod as it cools. Or a few crystals appear at the edge of the solution." },
      { q:"Why is sodium chloride made by titration and not by adding excess base?",
        a:"Sodium hydroxide and sodium chloride are both soluble, so any excess alkali could not be filtered off. Titration finds the exact volume of acid; the titration is then repeated with the same volumes and no indicator, so the salt is not contaminated." },
      { q:"Why is the precipitate washed with distilled water, and why is the filtrate not kept?",
        a:"The residue is the insoluble salt. Washing removes the soluble by-product (e.g. sodium chloride or potassium nitrate) left on it. The filtrate contains only that soluble by-product." },
      { q:"Give two reasons why the percentage yield of crystals is less than 100%.",
        a:"Some salt stays dissolved in the solution left after crystallisation; some is lost on the filter paper, the glass rod and the basin; and some solution is lost by spitting. (Reading a balance to ±0.01 g is not a significant cause.)" },
      { q:"State a hazard in these preparations and a precaution.",
        a:"Hot dilute acid and spitting solution can burn skin and eyes: wear eye protection and heat gently. Barium chloride and lead(II) compounds are toxic: wear gloves, avoid ingestion and wash hands; dispose of lead waste properly." }
    ],
    setup(ctx){
      let sk = "cuo", S, run = Math.max(0, ...ctx.rows().map(r => +String(r.run).replace(/\D/g, "") || 0));
      let flameT = 0, quizI = Math.floor(Math.random()*QUIZ.length), streak = 0;
      const salt = () => SALTS[S.salt];
      function fresh(){
        run++;
        S = { salt:sk, phase:"start", log:[], bad:0, acid:1, warm:false, adds:0, excess:0, acidLeft:0, water:1, sat:.3 + Math.random()*.08,
          rod:false, rodShow:false, dryness:false, dried:null, wet:false, washed:false, ppt:false, ind:false, V:0, Veq:Kit.round(25/(.92 + Math.random()*.18), 2),
          titre:null, over:0, rep:false, indRep:false, wg:Kit.round(18 + Math.random()*6, 2), mass:null, weighed:false, obs:"", eff:0 };
      }
      fresh();

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="ig-salts-svg"><defs>${Kit.DEFS}</defs><style>.kb text.ig-salts-bad{fill:#D9483B}.kb text.ig-salts-ok{fill:var(--txt2)}</style>${Kit.bench(960, 460)}<g id="ig-salts-scene"></g><text x="24" y="30" class="k-status" id="ig-salts-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#ig-salts-svg"), $ = q => svg.querySelector(q);
      const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;

      /* ── drawing pieces ── */
      const tripod = cx => `<path d="M${cx - 70} 330 h140 M${cx - 58} 330 l-16 130 M${cx + 58} 330 l16 130 M${cx} 330 v130" stroke="url(#k-metalv)" stroke-width="6" fill="none"/><rect x="${cx - 72}" y="324" width="144" height="7" fill="#9AA3AD" stroke="#6B7486"/>`;
      const burner = (cx, on, big) => `<rect x="${cx - 9}" y="384" width="18" height="70" fill="url(#k-metal)"/><rect x="${cx - 30}" y="452" width="60" height="8" rx="3" fill="url(#k-metal)"/>`
        + (on ? `<path d="M${cx} ${big ? 336 : 350} C${cx - 16} 362 ${cx - 12} 384 ${cx - 7} 384 H${cx + 7} C${cx + 12} 384 ${cx + 16} 362 ${cx} ${big ? 336 : 350}Z" fill="${big ? "#4A7DFF" : "#FFB347"}" opacity=".85"><animate attributeName="opacity" values=".7;.95;.7" dur=".5s" repeatCount="indefinite"/></path>` : "");
      function beaker(cx, by, w, h, o){
        const x = cx - w/2, top = by - h*(o.fill || .45);
        let s = `<defs><clipPath id="ig-salts-bk"><path d="${ChemKit.BEAKER(x, by, w, h)} Z"/></clipPath></defs><g clip-path="url(#ig-salts-bk)">`;
        if(o.liquid) s += `<rect x="${x}" y="${top}" width="${w}" height="${by - top}" fill="${ChemKit.rgba(o.col, o.col ? .55 : .3)}"/>`;
        if(o.solid) for(let i = 0; i < o.solid; i++){ const q = ((i*37) % 53)/53, r = ((i*17) % 29)/29;
          s += `<circle cx="${x + 10 + q*(w - 20)}" cy="${by - 4 - r*7}" r="${2.4 + r*1.6}" fill="${rgb(o.solidCol)}" stroke="rgba(0,0,0,.25)" stroke-width=".4"/>`; }
        if(o.ppt) for(let i = 0; i < 90; i++){ const q = ((i*41) % 89)/89, r = ((i*73) % 97)/97;
          s += `<circle cx="${x + 6 + q*(w - 12)}" cy="${by - 4 - Math.pow(r, 1.6)*(by - top - 8)}" r="${1.3 + r*1.5}" fill="${rgb(o.ppt)}" stroke="rgba(0,0,0,.18)" stroke-width=".4"/>`; }
        if(o.bubbles) for(let i = 0; i < 12; i++){ const r = ((i*53) % 71)/71, q = ((i*29) % 61)/61;
          s += `<circle cx="${x + 12 + q*(w - 24)}" cy="${by - 8}" r="${1.8 + r*2}" fill="none" stroke="var(--txt2)" stroke-width=".9"><animate attributeName="cy" from="${by - 8 - r*10}" to="${top + 3}" dur="${.8 + r*.8}s" repeatCount="indefinite"/></circle>`; }
        s += `</g><path d="${ChemKit.BEAKER(x, by, w, h)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
        for(let v = 1; v <= 4; v++) s += `<line x1="${x + 8}" y1="${by - v*h/5}" x2="${x + 20}" y2="${by - v*h/5}" stroke="var(--txt2)" stroke-width=".8"/>`;
        return s;
      }
      function crystals(cx, cy, w, col, kind, n){
        let s = "";
        for(let i = 0; i < n; i++){
          const q = ((i*37) % 61)/61 - .5, r = ((i*23) % 41)/41, x = cx + q*w, y = cy - r*12, a = ((i*47) % 90) - 45, z = 4 + ((i*13) % 7);
          const f = rgb(col), st = `stroke="rgba(0,0,0,.35)" stroke-width=".6"`;
          if(kind === "rhomb") s += `<path d="M${x} ${y - z} l${z*.8} ${z} l${-z*.8} ${z} l${-z*.8} ${-z}z" fill="${f}" ${st} transform="rotate(${a/3} ${x} ${y})"/>`;
          else if(kind === "needle") s += `<rect x="${x - z}" y="${y - 1.6}" width="${z*2.4}" height="3.2" fill="${f}" ${st} transform="rotate(${a} ${x} ${y})"/>`;
          else if(kind === "cube") s += `<rect x="${x - z/2}" y="${y - z/2}" width="${z*.9}" height="${z*.9}" fill="${f}" ${st} transform="rotate(${a/4} ${x} ${y})"/>`;
          else s += `<circle cx="${x}" cy="${y + 4}" r="${1.4 + r*1.6}" fill="${f}" stroke="rgba(0,0,0,.2)" stroke-width=".4"/>`;
        }
        return s;
      }
      const basinPath = (cx, y) => `M${cx - 80} ${y} Q${cx} ${y + 90} ${cx + 80} ${y}`;
      function basin(cx, y, level, col, extra){
        const yl = y + 45 - level*42;
        return `<defs><clipPath id="ig-salts-bs"><path d="${basinPath(cx, y)} Z"/></clipPath></defs><g clip-path="url(#ig-salts-bs)">${level > 0 ? `<rect x="${cx - 80}" y="${yl}" width="160" height="${60}" fill="${ChemKit.rgba(col, col ? .6 : .3)}"/>` : ""}</g>${extra || ""}
          <path d="${basinPath(cx, y)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><path d="${basinPath(cx, y)}" fill="none" stroke="#E7E2D8" stroke-width="4" opacity=".55"/>`;
      }
      function funnel(cx, y, residue, resCol, kind){
        let s = `<path d="M${cx - 160} 460 V${y - 40} M${cx - 160} ${y + 10} H${cx - 50}" stroke="url(#k-metalv)" stroke-width="6" fill="none"/><rect x="${cx - 190}" y="452" width="70" height="8" rx="2" fill="url(#k-metal)"/>
          <path d="M${cx - 62} ${y} L${cx} ${y + 70} L${cx + 62} ${y}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><path d="M${cx - 6} ${y + 64} V${y + 120} M${cx + 6} ${y + 64} V${y + 120}" stroke="var(--txt2)" stroke-width="1.5"/>
          <path d="M${cx - 54} ${y + 5} L${cx} ${y + 64} L${cx + 54} ${y + 5}Z" fill="#F5F3EC" stroke="#C9C3B5"/>`;
        if(residue) s += `<path d="M${cx - 30} ${y + 38} L${cx} ${y + 62} L${cx + 30} ${y + 38}Z" fill="${rgb(resCol)}" opacity=".95"/>` + (kind ? crystals(cx, y + 46, 40, resCol, kind, 10) : "");
        return s;
      }
      function balance(prod){
        const rd = S.mass === null ? null : Kit.round(S.wg + S.mass, 2);
        let s = ChemKit.balance(120, 330, rd, "two-decimal-place balance");
        s += `<ellipse cx="205" cy="345" rx="52" ry="8" fill="url(#k-glass)" stroke="var(--txt2)"/>` + crystals(205, 342, 60, prod.col, prod.kind, 22);
        return s;
      }
      function product(){
        const s = salt();
        if(s.route === "ppt") return { col:s.pptCol, kind:"powder" };
        if(s.hydrate && (S.dryness || S.dried === "oven")) return { col:S.dryness || s.formula.startsWith("Mg") ? s.anhCol : [200,215,235], kind:"powder" };
        if(S.indRep) return { col:[245,190,120], kind:s.kind };
        return { col:s.prodCol, kind:s.kind };
      }
      function titrScene(){
        const s = salt(), V = S.rep ? 0 : S.V, yv = v => 60 + v/50*230;
        let col = null;
        if(!S.rep && S.ind){ const d = S.V - S.Veq; col = d < -1e-9 ? [245,205,40,.75] : d < .1 + 1e-9 ? [245,140,40,.8] : [220,45,45,.8]; }
        if(S.rep && S.indRep) col = [245,205,40,.75];
        let g = `<path d="M60 460 V40 M60 140 H190" stroke="url(#k-metalv)" stroke-width="6" fill="none"/><rect x="30" y="452" width="70" height="8" rx="2" fill="url(#k-metal)"/>
          <rect x="190" y="50" width="20" height="250" rx="3" fill="url(#k-glass)" stroke="var(--txt2)"/><rect x="192" y="${yv(V)}" width="16" height="${300 - yv(V)}" fill="rgba(200,215,235,.45)"/>
          <rect x="186" y="300" width="28" height="10" rx="2" fill="#3A4252"/><path d="M200 310 V334" stroke="var(--txt2)" stroke-width="3"/>`;
        for(let v = 0; v <= 50; v += 5) g += `<line x1="190" y1="${yv(v)}" x2="${v % 10 ? 197 : 202}" y2="${yv(v)}" stroke="var(--txt2)" stroke-width=".8"/>`;
        if(S.phase !== "start"){
          const FL = ChemKit.FLASK(200, 460, .9);
          g += `<defs><clipPath id="ig-salts-fl"><path d="${FL} Z"/></clipPath></defs><rect x="140" y="425" width="120" height="35" fill="${ChemKit.rgba(col, col ? col[3] : .3)}" clip-path="url(#ig-salts-fl)"/><path d="${FL}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
        }
        g += ChemKit.lens({ id:"ig-salts-l", cx:400, cy:190, r:82, S:58, value:Math.min(V, 50), minor:.1, major:1, half:.5, down:true, liquid:"rgba(200,215,235,.6)", label:"magnifier on the burette (cm³)" });
        g += `<text x="260" y="70" class="k-lbl">HCl(aq), concentration unknown</text>`;
        return g;
      }
      function draw(){
        const s = salt(), ph = S.phase, r = s.route; let g = "";
        const solCol = r === "base" ? (s.solCol ? ChemKit.mix([225,235,245], s.solCol, (1 - Math.max(0, S.acid))) : null) : null;
        if(ph === "weigh") g += balance(product());
        else if(r === "titr" && (ph === "start" || ph === "flask")) g += titrScene();
        else if(ph === "start" || ph === "beaker" || ph === "ppt"){
          if(r === "base") g += tripod(220) + burner(220, S.warm && ph === "beaker", false) + (ph === "start" ? "" : beaker(220, 324, 120, 120, { liquid:true, col:solCol, fill:.42, solid:S.excess ? 6 + Math.min(10, S.excess*3) : 0, solidCol:s.solidCol, bubbles:s.carb && S.adds && S.acid > 0 && flameT > 0 }));
          else g += ph === "start" ? "" : beaker(220, 460, 130, 140, { liquid:true, col:null, fill:.4, ppt:S.ppt ? s.pptCol : null });
          if(ph === "start" && r !== "titr") g += `<text x="220" y="${r === "base" ? 300 : 430}" text-anchor="middle" class="k-hint">empty beaker — measure out the ${r === "base" ? "acid" : "solution"}</text>`;
        }
        else if(ph === "filtrate" || ph === "residue"){
          const res = r === "ppt" ? s.pptCol : s.solidCol;
          g += funnel(220, 200, true, res, null);
          if(r === "ppt"){ const FL = ChemKit.FLASK(220, 460, .85); g += `<rect x="170" y="430" width="100" height="30" fill="rgba(210,225,240,.3)" clip-path="url(#ig-salts-fl2)"/><defs><clipPath id="ig-salts-fl2"><path d="${FL} Z"/></clipPath></defs><path d="${FL}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
            g += `<g transform="translate(330 360)"><path d="M0 100 V20 q0 -12 14 -12 h22 q14 0 14 12 V100z" fill="rgba(210,225,240,.35)" stroke="var(--txt2)"/><path d="M25 8 V-20 L-50 -95" stroke="var(--txt2)" stroke-width="3" fill="none"/><text x="25" y="62" text-anchor="middle" class="k-num">H₂O</text></g>`;
            if(S.washed) g += `<text x="300" y="300" class="k-hint">washed ✓</text>`; }
          else g += basin(220, 412, .8 - S.acidLeft*.2, ChemKit.mix([225,235,245], s.solCol || [225,235,245], 1 - S.acidLeft));
        }
        else if(ph === "solution") g += basin(220, 412, .85, null);
        else if(ph === "evap" || ph === "dryres"){
          const lvl = Math.max(0, .85*S.water), col = s.solCol ? ChemKit.mix([225,235,245], s.solCol, Math.min(1, .7 + (1 - S.water)*.4)) : null;
          let extra = "";
          if(S.dryness) extra = crystals(220, 322, 70, product().col, "powder", 40);
          else if(S.water < S.sat - .12) extra = crystals(166, 300, 16, s.prodCol, s.kind, 4) + crystals(274, 300, 16, s.prodCol, s.kind, 4);
          g += tripod(220) + burner(220, flameT > 0, true) + basin(220, 285, lvl, col, extra);
          if(flameT > 0 && S.water > 0) for(let i = 0; i < 3; i++) g += `<path d="M${195 + i*25} 268 q-8 -16 0 -30 q8 -14 0 -28" fill="none" stroke="var(--txt3)" stroke-width="4" stroke-linecap="round" opacity=".5"><animate attributeName="opacity" values=".1;.6;.1" dur="${1.4 + i*.3}s" repeatCount="indefinite"/></path>`;
          if(S.rodShow) g += `<g><line x1="360" y1="150" x2="420" y2="330" stroke="#C8D3E0" stroke-width="7" stroke-linecap="round"/>${S.water <= S.sat ? crystals(412, 318, 14, s.prodCol, s.kind === "needle" ? "cube" : s.kind, 6) : ""}<text x="430" y="300" class="k-lbl">glass rod</text></g>`;
        }
        else if(ph === "cryst") g += basin(220, 412, .45, s.solCol ? ChemKit.mix([225,235,245], s.solCol, .8) : null, crystals(220, 448, 80, s.prodCol, s.kind, 30));
        else if(ph === "wet" || ph === "dry"){
          const p = product();
          g += `<ellipse cx="220" cy="440" rx="110" ry="16" fill="#F5F3EC" stroke="#C9C3B5"/>` + crystals(220, 440, 120, p.col, p.kind, 34);
          if(ph === "wet") g += `<ellipse cx="220" cy="440" rx="80" ry="10" fill="rgba(120,160,210,.25)"/>`;
          g += `<text x="220" y="400" text-anchor="middle" class="k-lbl">${ph === "wet" ? "crystals still wet" : S.dried === "oven" ? "dried in an oven" : "dry"}</text>`;
        }
        /* reagent bottles for the first steps */
        if(["start", "beaker", "ppt"].includes(ph) && r !== "titr"){
          const b1 = r === "base" ? "H₂SO₄(aq)" : s.sol, b2 = r === "base" ? s.solidShort : s.reagent;
          g += `<g transform="translate(400 360)"><path d="M0 100 V24 q0 -12 14 -14 v-12 h24 v12 q14 2 14 14 V100z" fill="rgba(210,225,240,.35)" stroke="var(--txt2)"/><rect x="4" y="50" width="44" height="22" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="26" y="65" text-anchor="middle" class="k-num"${b1.replace("(aq)", "").length > 6 ? ' style="font-size:8px"' : ""}>${b1.replace("(aq)", "")}</text></g>
            <g transform="translate(470 390)"><rect x="0" y="10" width="56" height="60" rx="6" fill="${r === "base" ? rgb(s.solidCol) : "rgba(210,225,240,.35)"}" opacity=".85" stroke="var(--txt2)"/><rect x="-2" y="0" width="60" height="12" rx="3" fill="#3A4252"/><rect x="5" y="30" width="46" height="20" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="28" y="44" text-anchor="middle" class="k-num">${b2.replace("(aq)", "")}</text></g>`;
        }
        /* info card + method log */
        g += `<g transform="translate(580 40)"><rect width="360" height="112" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="14" y="24" class="k-tag">${ctx.esc(s.name)} · run ${run}</text>${ChemKit.lines(s.eq, 58, 14, 46, 15)}
          ${ChemKit.lines(s.start + (r === "ppt" ? ", excess " + s.reagent : r === "titr" ? ", HCl in the burette" : "") + " · " + s.data, 58, 14, 76, 15)}</g>`;
        const L = [];
        S.log.forEach(e => ChemKit.wrap((e.ok ? "✓ " : "✗ ") + e.t, 54).forEach((l, i) => L.push({ l, ind:i > 0, ok:e.ok })));
        const shown = L.slice(-12);
        g += `<g transform="translate(580 162)"><rect width="360" height="292" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="14" y="22" class="k-tag">Method log${S.bad ? ` — ${S.bad} mistake${S.bad > 1 ? "s" : ""}` : ""}</text>
          ${shown.length ? shown.map((o, i) => `<text x="${o.ind ? 26 : 14}" y="${44 + i*15}" class="k-lbl ${o.ok ? "ig-salts-ok" : "ig-salts-bad"}">${ctx.esc(o.l)}</text>`).join("") : `<text x="14" y="44" class="k-lbl">No steps yet — choose your first step.</text>`}
          <line x1="14" y1="222" x2="346" y2="222" stroke="var(--brd2)"/><text x="14" y="240" class="k-tag">Observation</text>${ChemKit.lines(S.obs || "—", 56, 14, 258, 14)}</g>`;
        $("#ig-salts-scene").innerHTML = g;
        $("#ig-salts-status").textContent = S.weighed ? "Read the balance and enter the mass of product" : ph === "start" ? "Choose your first step" : "Choose the next step";
        ctx.readout([["Salt", s.formula], ["Method", METH[r]], ["Steps", S.log.length], ["Mistakes", S.bad, S.bad ? "warn" : ""]]);
      }
      ctx.frame(dt => { if(flameT > 0){ flameT -= dt; if(flameT <= 0) draw(); } });

      /* ── the state machine ── */
      const fb = ctx.html(`<div class="ctl"><div id="ig-salts-fb"></div></div>`);
      const say = (m, ok) => { fb.firstElementChild.innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${m}</div>`; };
      const log = (t, k) => { const last = S.log[S.log.length - 1]; if(k && last && last.k === k) last.t = t; else S.log.push({ t, ok:true, k }); };
      const bad = (t, m) => { S.log.push({ t, ok:false }); S.bad++; say(m || t); };
      const obs = t => { S.obs = t; };
      const heatLog = () => log(`Heated the solution to evaporate water (${S.heats || 0}×)${S.rod0 ? `; glass-rod test${S.rod0 > 1 ? "s" : ""}: no crystals yet` : ""}`, "heat");
      function act(k){
        const s = salt(), r = s.route, ph = S.phase;
        fb.firstElementChild.innerHTML = "";
        if(S.weighed) return say("This preparation is finished. Enter the mass, or start a new preparation.");
        switch(k){
          case "measure":
            if(ph !== "start") return say("You have already measured it out.");
            S.phase = "beaker"; log(`Measured ${s.start} into a beaker`); obs(r === "base" ? "colourless solution (dilute sulfuric acid)" : `colourless solution of ${s.sol}`); break;
          case "warm":
            if(ph !== "beaker") return say(ph === "start" ? "Measure out the acid first." : "There is no need to warm it at this stage.");
            if(S.warm) return say("It is already warm. Don't boil the acid — it would spit and evaporate.");
            S.warm = true; log("Warmed the acid gently (not boiling)"); obs("the acid is warm — the reaction will be faster"); break;
          case "add":
            if(r === "ppt"){
              if(ph === "start") return say("Measure out the first solution first.");
              if(S.ppt) return say(`The ${s.reagent} is already in excess — the precipitation is complete.`);
              S.ppt = true; S.phase = "ppt"; log(`Added excess ${s.reagent} and stirred: ${s.obs}`); obs(`${s.obs} forms immediately`); break;
            }
            if(ph !== "beaker") return say(ph === "start" ? "Measure out the acid first." : "You can't add more solid now.");
            S.adds++; flameT = Math.max(flameT, 2.5);
            if(S.acid > 0){
              const d = (.2 + Math.random()*.1)*(S.warm || s.carb ? 1 : .45);
              S.acid -= d;
              if(S.acid <= 0){ S.acid = 0; S.excess = 1;
                obs(s.carb ? "no more effervescence; some solid stays undissolved — the acid is used up" : "no more black solid dissolves; it stays at the bottom of the blue solution"); }
              else obs(s.carb ? `effervescence; the ${s.solidShort === "MgCO₃" ? "white" : "green"} solid dissolves${s.solCol ? " and the solution turns blue" : ""}` : `black solid dissolves; the solution turns blue${S.warm ? "" : " (slowly — the acid is cold)"}`);
              if(!S.warm && !s.carb) say("Copper(II) oxide reacts only slowly with cold acid — warm the acid to speed it up.", false);
            }else{ S.excess++; obs(`no change — the extra ${s.solidShort} stays at the bottom (excess)`); if(S.excess > 4) say("You have plenty in excess now — more just wastes the solid.", true); }
            log(`Added ${S.adds} spatula${S.adds > 1 ? "s" : ""} of ${s.solidShort}, stirring`, "add"); break;
          case "filter":
            if(r === "ppt"){
              if(!S.ppt) return say(ph === "start" ? "There is nothing to filter yet." : `Add the ${s.reagent} first to form the precipitate.`);
              if(ph !== "ppt") return say("You have already filtered it.");
              S.phase = "residue"; log(`Filtered: ${s.formula} is the residue`); obs(`${s.look.split(" ")[0]} residue on the filter paper; colourless filtrate (${s.by} solution)`); break;
            }
            if(ph !== "beaker" || !S.adds) return say(ph === "beaker" ? `Add the ${s.solid} first.` : "There is nothing to filter now.");
            S.acidLeft = S.acid; S.phase = "filtrate";
            if(S.acid > 0) bad("Filtered before the solid was in excess — acid is left in the filtrate, so the crystals will be contaminated and the yield is lower",
              s.carb ? "Not yet in excess: the mixture was still effervescing. Keep adding until effervescence stops and solid remains." : "Not yet in excess: all the solid had dissolved. Keep adding until some remains undissolved.");
            else log(`Filtered off the excess ${s.solidShort}; filtrate collected in an evaporating basin`);
            obs(`residue: excess ${s.solid}; filtrate: ${s.solCol ? "blue" : "colourless"} solution of ${s.formula.split("·")[0]}`); break;
          case "heat":
            if(r === "ppt"){
              if(ph !== "residue") return say("There is no filtrate yet.");
              bad("Heated the filtrate — it only holds the soluble by-product", `The filtrate contains ${s.by} (${s.byF}), not your salt. ${s.formula} is insoluble: it is the residue on the filter paper.`); break;
            }
            if(!(ph === "filtrate" || ph === "solution" || ph === "evap")) return say(r === "titr" ? "Make the neutral salt solution first: titrate, then repeat without indicator." : "Filter the mixture first.");
            if(S.dryness) return say("It is already dry.");
            S.phase = "evap"; S.water = Math.max(0, S.water - .16); flameT = 2.2; S.rodShow = false;
            S.heats = (S.heats || 0) + 1; heatLog();
            if(S.water <= .06){ S.water = 0; S.dryness = true; S.phase = "dryres";
              s.hydrate ? bad("Heated to dryness — the hydrated salt lost its water of crystallisation and spat out of the basin", `Overheated! ${s.formula.split("·")[0]} is now ${s.formula.startsWith("Cu") ? "a white" : "a"} anhydrous powder.`)
                : bad("Heated to dryness — the hot solid spat out of the basin; crystallising gives purer crystals"); }
            else obs(S.water < S.sat - .12 ? "crystals are appearing at the edge of the solution — stop heating" : "steam is given off; the solution becomes more concentrated");
            break;
          case "rod":
            if(ph !== "evap") return say("Use the glass rod while you are heating the solution.");
            S.rodShow = true;
            if(S.water <= S.sat){ S.rod = true; obs("small crystals form on the rod as it cools — the crystallisation point has been reached"); log("Tested with a glass rod: crystals form — crystallisation point"); }
            else{ obs("no crystals form on the rod — the solution is not saturated yet"); S.rod0 = (S.rod0 || 0) + 1; heatLog(); }
            break;
          case "dryness":
            if(!(ph === "filtrate" || ph === "solution" || ph === "evap")) return say("There is no salt solution to evaporate.");
            S.water = 0; S.dryness = true; S.phase = "dryres"; flameT = 2;
            s.hydrate ? bad("Evaporated to dryness — the hydrated salt lost its water of crystallisation and spat", `Wrong for a hydrated salt: ${s.formula.startsWith("Cu") ? "blue crystals turn into white anhydrous CuSO₄ powder" : "you get anhydrous powder, not MgSO₄·7H₂O crystals"}. Heat only to the crystallisation point.`)
              : bad("Evaporated to dryness — hot NaCl spits and the crystals are less pure", "Heat only to the crystallisation point, then let the crystals form on cooling.");
            obs(`${s.hydrate && s.formula.startsWith("Cu") ? "white" : "white"} powder left in the basin; it spat while heating`); break;
          case "cool":
            if(ph !== "evap") return say(ph === "dryres" ? "It is already dry." : "Heat the solution first.");
            if(S.water > S.sat){ obs("the solution cools but no crystals form — it was not saturated; heat it more"); return say("No crystals: the solution is too dilute. Heat it more and test with a glass rod."); }
            S.phase = "cryst"; S.rodShow = false; log("Left the saturated solution to cool: crystals formed");
            obs(`${s.look} form as the solution cools`);
            if(!S.rod) say("Crystals formed — next time test with a cold glass rod so you know you are at the crystallisation point.", true); break;
          case "fcryst":
            if(ph !== "cryst") return say(ph === "dryres" ? "There is nothing to filter — it is dry powder." : "There are no crystals to filter yet.");
            S.phase = "wet"; log("Filtered off the crystals"); obs(`${s.look} on the filter paper, still wet`); break;
          case "wash":
            if(ph !== "residue") return say("Filter first — then wash the residue on the filter paper.");
            if(S.washed) return say("It has already been washed.");
            S.washed = true; log(`Washed the residue with distilled water to remove ${s.byF}`); obs(`${s.look.split(" ")[0]} residue; washings run through`); break;
          case "dpaper": case "doven":
            if(r === "ppt"){
              if(ph !== "residue") return say(ph === "ppt" ? "Filter it first." : "There is no residue to dry yet.");
              if(!S.washed) bad(`Dried without washing — soluble ${s.byF} stays on the ${s.formula}`, `Wash the residue with distilled water first to remove the soluble ${s.by}.`);
              S.phase = "dry"; S.dried = k === "doven" ? "oven" : "paper"; log(k === "doven" ? "Dried the residue in a warm oven" : "Dried the residue between filter papers"); obs(s.look); break;
            }
            if(ph !== "wet") return say(ph === "dryres" ? "It is already dry." : "Filter off the crystals first.");
            S.phase = "dry"; S.dried = k === "doven" ? "oven" : "paper";
            if(k === "doven" && s.hydrate) bad("Dried in a hot oven — the crystals lost water of crystallisation", `Too hot: ${s.formula.startsWith("Cu") ? "the blue crystals turn pale and powdery" : "the crystals turn to white powder"}. Pat them dry between filter papers.`);
            else log(k === "doven" ? "Dried in a warm oven (fine: NaCl has no water of crystallisation)" : "Dried the crystals between filter papers");
            obs(k === "doven" && s.hydrate ? "pale, powdery solid" : `dry ${s.look}`); break;
          case "weigh": {
            if(!(ph === "dry" || ph === "dryres" || ph === "wet")) return say("Make and dry the product first.");
            if(ph === "dryres" && S.water > 0) return say("Let it cool first.");
            if(ph === "wet") bad("Weighed the product while still wet — the mass is too high", "The crystals are still wet: the mass will be too high. Dry them between filter papers first.");
            const nOK = s.n*(1 - S.acidLeft);
            let m;
            if(r === "ppt") m = s.n*s.Mr*(.88 + Math.random()*.08) + (S.washed ? 0 : .06 + Math.random()*.06);
            else if(S.dryness) m = nOK*.94*(s.hydrate ? s.anhMr : s.Mr);
            else{ const eff = .6 + Math.random()*.2; m = nOK*eff*(S.dried === "oven" && s.hydrate ? s.anhMr + (s.Mr - s.anhMr)*.35 : s.Mr); }
            if(ph === "wet") m += .3 + Math.random()*.2;
            if(S.indRep) m += .01;
            S.mass = Kit.round(m, 2); S.weighed = true; S.phase = "weigh";
            log(`Weighed on a watch glass (empty watch glass: ${S.wg.toFixed(2)} g)`); obs("read the balance; subtract the mass of the empty watch glass");
            mr.clear(); break; }
          /* titration route */
          case "pipette":
            if(ph !== "start") return say("You already have NaOH in the flask.");
            S.phase = "flask"; log("Pipetted 25.0 cm³ of 1.00 mol dm⁻³ NaOH into a conical flask"); obs("colourless solution"); break;
          case "ind":
            if(ph !== "flask") return say(ph === "start" ? "Pipette the alkali into the flask first." : "There is no titration in progress.");
            if(S.rep){ if(S.indRep) return say("Indicator has already been added.");
              S.indRep = true; bad("Added indicator to the repeat — it contaminates the salt", "Not in the repeat! The indicator would stay in the salt. Now you know the volume, leave it out."); obs("yellow (methyl orange in alkali)"); break; }
            if(S.ind) return say("You've already added the indicator — only a few drops are needed.");
            S.ind = true; log("Added a few drops of methyl orange"); obs("methyl orange is yellow in the alkali"); break;
          case "b1": case "bd":
            if(ph !== "flask") return say(ph === "start" ? "Pipette the alkali into the flask first." : "The titration is over.");
            if(S.rep) return say("For the repeat, run in exactly your titre in one go — use 'Run in your titre of HCl'.");
            if(!S.ind) return say("Add the indicator first, otherwise you can't see the end point.");
            if(S.titre !== null) return say("You have your titre. Now repeat with fresh NaOH and no indicator.");
            S.V = Kit.round(S.V + (k === "b1" ? 1 : .1), 2);
            { const d = S.V - S.Veq; obs(d < -1e-9 ? "yellow" : d < .1 + 1e-9 ? "orange — the end point" : "red — you have gone past the end point"); }
            log(`Titrated: ${S.V.toFixed(2)} cm³ of HCl added`, "tit"); break;
          case "repeat":
            if(S.titre === null) return say(S.ind ? "Read your titre from the burette first." : "First do a titration with indicator to find the volume of acid needed.");
            if(S.rep) return say("You have already started the repeat.");
            S.rep = true; S.phase = "flask"; log("Refilled the burette; pipetted fresh 25.0 cm³ NaOH — no indicator"); obs("colourless solution"); break;
          case "runin":
            if(!S.rep || ph !== "flask") return say(S.titre === null ? "Find the titre first." : "Set up the repeat with fresh NaOH first.");
            S.phase = "solution"; log(`Ran in ${S.titre.toFixed(2)} cm³ of HCl — neutral NaCl(aq); poured into an evaporating basin`); obs("colourless solution of sodium chloride"); break;
        }
        draw();
      }

      /* ── controls ── */
      ctx.select({ label:"Salt to prepare", value:sk, options:Object.keys(SALTS).map(k => [k, SALTS[k].name + " (" + METH[SALTS[k].route].toLowerCase() + ")"]),
        onChange(v){ sk = v; fresh(); build(); draw(); fb.firstElementChild.innerHTML = ""; } });
      const actBox = ctx.html(`<div></div>`);
      let tr = null;
      function build(){
        actBox.innerHTML = "";
        const s = SALTS[sk];
        const list = ACTS[s.route].map(([k, l]) => ({ label:l.replace("SOLID", s.solidShort || "").replace("REAGENT", s.reagent || "").replace("SOL", s.sol || ""), onClick:() => act(k) }));
        ctx.buttons(list, actBox).node.classList.add("ig-salts-acts");
        tr = null;
        if(s.route === "titr") tr = Kit.reading(ctx, "Titre: burette reading at the end point / cm³ (started at 0.00)", "e.g. 24.60", () => S.phase === "flask" && !S.rep && S.ind && S.V > 0 && S.titre === null ? S.V : null, .05, v => {
          if(S.V < S.Veq - 1e-9) return say("The indicator is still yellow — you haven't reached the end point yet.");
          S.titre = Kit.round(v, 2); S.over = S.V - S.Veq;
          if(S.over > .25) bad(`Titre ${S.titre.toFixed(2)} cm³ — overshot the end point (red)`, "You went well past the end point: too much acid. Next time add dropwise near the end and swirl."); else log(`Titre recorded: ${S.titre.toFixed(2)} cm³`);
          draw();
        }, actBox);
      }
      ctx.buttons([{ label:"New preparation", block:true, onClick(){ fresh(); fb.firstElementChild.innerHTML = ""; mr.clear(); if(tr) tr.clear(); draw(); } }]);
      const mr = Kit.reading(ctx, "Mass of product / g (balance reading − watch glass)", "e.g. 4.12", () => S.weighed ? Kit.round(S.wg + S.mass, 2) - S.wg : null, .011, v => {
        const s = salt();
        if(S.recorded) return say("Already recorded — start a new preparation.");
        S.recorded = true;
        const p = product(), look = s.route === "ppt" ? s.look + (S.washed ? "" : " (unwashed)") : S.dryness || (S.dried === "oven" && s.hydrate) ? "white/pale powder" : S.indRep ? s.look + " (tinted)" : s.look;
        ctx.record({ run:"Run " + run, salt:s.short, meth:METH[s.route], look, m:Kit.round(v, 2), err:S.bad, n:s.n, Mr:s.Mr });
        if(!S.bad){
          if(s.route === "base") ctx.complete("excess");
          if(s.route === "titr") ctx.complete("titr");
          if(s.route === "ppt") ctx.complete("ppt");
          say(`Well done — a clean preparation. Mass of ${s.formula} = ${v.toFixed(2)} g. Now work out the percentage yield.`, true);
        }else say(`Recorded, but with ${S.bad} mistake${S.bad > 1 ? "s" : ""} — see the method log. Try again for a clean run.`);
        void p; draw();
      });
      ctx.html(`<div class="hint" style="margin:-4px 0 10px">Percentage yield = mass obtained ÷ theoretical mass × 100. Theoretical mass = moles of limiting reactant × Mr (see the card).</div>`);
      Kit.answer(ctx, "Percentage yield of your last product / %", "e.g. 72", v => {
        const r = ctx.rows().pop(); if(!r || !r.Mr) return [false, "Make, weigh and record a product first."];
        const th = r.n*r.Mr, py = r.m/th*100;
        if(Math.abs(v - py) <= Math.max(.6, .015*py)){ ctx.complete("yield"); return [true, `Correct: theoretical = ${r.n} mol × ${r.Mr} = ${Kit.round(th, 2)} g; ${r.m.toFixed(2)} ÷ ${Kit.round(th, 2)} × 100 = ${py.toFixed(1)}%.${py > 100 ? " Over 100% — the product is impure or wet." : ""}`]; }
        return [false, `Moles of limiting reactant = volume (dm³) × concentration = ${r.n} mol; 1 mol gives 1 mol of salt. Theoretical mass = ${r.n} × Mr.`];
      });

      /* choose-the-method quiz */
      const qz = ctx.html(`<div class="ctl"><label><span id="ig-salts-qn"></span></label><div class="btns" style="display:flex;flex-wrap:wrap;gap:6px"></div><div style="margin-top:6px"></div></div>`);
      const qName = () => { qz.querySelector("#ig-salts-qn").textContent = `Which method would you use to make ${QUIZ[quizI][0]}?`; };
      Object.keys(METH).forEach(m => { const b = document.createElement("button"); b.type = "button"; b.className = "btn small"; b.textContent = METH[m];
        b.onclick = () => { const q = QUIZ[quizI], ok = q[1] === m, out = qz.lastElementChild;
          streak = ok ? streak + 1 : 0;
          out.innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${ok ? "Correct" : "Not quite"} — ${q[2]}${ok ? ` (${streak} in a row)` : ""}</div>`;
          if(streak >= 4) ctx.complete("choose");
          let n; do{ n = Math.floor(Math.random()*QUIZ.length); }while(n === quizI); quizI = n; qName(); };
        qz.querySelector(".btns").appendChild(b); });
      qName();

      const why = ctx.select({ label:"Why is the insoluble base or carbonate added in excess?", value:"", options:[["", "— choose a reason —"]].concat(WHY) });
      const whyOut = ctx.html(`<div style="margin:-6px 0 10px"></div>`);
      ctx.buttons([{ label:"Check reason", onClick(){
        const v = why.get(), M = { fast:"No — warming does that. Excess is about using up all of the acid.", more:"No — the acid is the limiting reactant, so it fixes the amount of salt.", lim:"No — the base is in excess, so the acid is the limiting reactant.",
          acid:"Correct: all the acid is neutralised, the excess insoluble solid is removed by filtration, and the filtrate contains only the salt and water — so the crystals are not contaminated with acid." };
        if(!v) return whyOut.innerHTML = `<div class="note bad">Choose a reason first.</div>`;
        whyOut.innerHTML = `<div class="note ${v === "acid" ? "ok" : "bad"}">${M[v]}</div>`; if(v === "acid") ctx.complete("why"); } }]);
      build(); draw();
    }
  });
})();

/* ───────────── CATALYSTS AND THE RATE OF DECOMPOSITION OF H₂O₂ ───────────── */
(function(){
  const CATS = {
    mno2:{ name:"manganese(IV) oxide", short:"MnO₂", k:.10, col:[38,32,30], solid:true },
    cuo: { name:"copper(II) oxide", short:"CuO", k:.016, col:[28,28,32], solid:true },
    sand:{ name:"sand", short:"sand", k:.0001, col:[214,190,140], solid:true },
    none:{ name:"no solid (control)", short:"no solid", k:.0001, solid:false }
  };
  const TEND = 180;

  function lensH(o){
    const r = o.r, S = o.S, value = o.value, span = r/S + o.minor;
    const k0 = Math.ceil((value - span)/o.minor), k1 = Math.floor((value + span)/o.minor), per = Math.round(o.major/o.minor);
    let s = `<defs><clipPath id="${o.id}-c"><circle r="${r}"/></clipPath></defs><g transform="translate(${o.cx} ${o.cy})"><circle r="${r}" fill="#F4F7FB"/><g clip-path="url(#${o.id}-c)">
      <rect x="${-r}" y="-22" width="${r}" height="44" fill="rgba(200,215,235,.5)"/><rect x="0" y="-26" width="10" height="52" fill="#64748B"/>
      <line x1="${-r}" y1="-26" x2="${r}" y2="-26" stroke="#9AA3B2" stroke-width="2"/><line x1="${-r}" y1="26" x2="${r}" y2="26" stroke="#9AA3B2" stroke-width="2"/>`;
    for(let k = k0; k <= k1; k++){ if(k < 0) continue; const x = (k*o.minor - value)*S, big = k % per === 0, mid = k % (per/2) === 0;
      s += `<line x1="${x}" y1="26" x2="${x}" y2="${26 - (big ? 22 : mid ? 15 : 9)}" stroke="#334155" stroke-width="${big ? 1.6 : 1}"/>`;
      if(big) s += `<text x="${x}" y="46" text-anchor="middle" style="font:600 13px 'JetBrains Mono',monospace;fill:#334155">${Math.round(k*o.minor)}</text>`; }
    return s + `</g><circle r="${r}" fill="none" stroke="var(--accent)" stroke-width="3"/><text y="${r + 18}" text-anchor="middle" class="k-lbl">${o.label}</text></g>`;
  }

  Lab.register({
    id:"ig-catalyst", subject:"chemistry", level:["igcse"], topic:"Chemical reactions · Rates & catalysts", interactive:true,
    title:"Catalysts and the decomposition of hydrogen peroxide",
    summary:"Add manganese(IV) oxide, copper(II) oxide, sand or nothing to hydrogen peroxide and collect the oxygen in a gas syringe. Read the syringe at regular times, plot volume against time and compare the initial gradients. Then filter, dry and reweigh the catalyst.",
    aim:"Investigate the effect of different solids, and of the mass and particle size of a catalyst, on the rate of decomposition of hydrogen peroxide, and show that a catalyst is not used up.",
    variables:{ iv:"Solid added (MnO₂, CuO, sand, none); mass or particle size of MnO₂", dv:"Volume of oxygen collected at regular times (cm³)",
      cv:["Volume and concentration of H₂O₂ (25.0 cm³, 0.30 mol dm⁻³)","Temperature","Mass of solid (when comparing solids)","Same apparatus"] },
    stageTitle:"Gas syringe", controlsTitle:"Experiment",
    thumb:`<svg viewBox="0 0 300 140"><path d="M50 40 v22 l-26 52 h64 l-26 -52 v-22z" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M30 106 h52 l4 8 h-60z" fill="#C9DDF2" opacity=".7"/><circle cx="45" cy="110" r="3" fill="#222"/><circle cx="58" cy="108" r="3" fill="#222"/><path d="M56 40 V26 H120" stroke="#A2ACBD" stroke-width="3" fill="none"/><rect x="120" y="16" width="130" height="20" rx="4" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="122" y="18" width="70" height="16" fill="#9EC9F0" opacity=".6"/><path d="M150 120 Q190 60 280 56" stroke="#E07B39" stroke-width="3" fill="none"/></svg>`,
    challenges:[
      { id:"four",  title:"Four conditions", text:"Record runs with MnO₂, CuO, sand and no solid (at least four readings each)." },
      { id:"read",  title:"Read it yourself", text:"In 'you read the syringe' mode, enter six correct readings in one run." },
      { id:"grad",  title:"Initial rates", text:"Find the initial rate from your graph for MnO₂ and for CuO, and compare them." },
      { id:"o2",    title:"Test the gas", text:"Use the correct test to show the gas is oxygen." },
      { id:"mass",  title:"Not used up", text:"Filter, wash, dry and reweigh a catalyst to show its mass is unchanged." },
      { id:"vary",  title:"Mass and surface area", text:"Compare MnO₂ runs with different masses, or powder with lumps." }
    ],
    columns:[{key:"run",label:"Run"},{key:"t",label:"t / s",dp:0},{key:"V",label:"V(O₂) / cm³",dp:1}],
    series:"run",
    graph:{ x:["t"], y:["V"], fit:"curve" },
    questions:[
      { q:"Write the equation for the decomposition of hydrogen peroxide and give the test for the gas.",
        a:"2H₂O₂(aq) → 2H₂O(l) + O₂(g). Oxygen relights a glowing splint." },
      { q:"What is a catalyst, and how does it increase the rate?",
        a:"A substance that increases the rate of a reaction and is unchanged in mass and chemically at the end. It provides an alternative reaction pathway with a lower activation energy, so a greater fraction of collisions have energy equal to or greater than the activation energy: more successful collisions per second." },
      { q:"Sketch the energy profile for the catalysed and uncatalysed reaction.",
        a:"Both start at the reactants and end at the lower energy of the products (exothermic). The catalysed curve has a lower peak: smaller activation energy, Ea. The enthalpy change ΔH is the same for both." },
      { q:"Why do the MnO₂ and CuO curves level off at the same final volume?",
        a:"The same amount of H₂O₂ was used each time. The catalyst does not change how much oxygen is made — only how fast. The curve levels off when all the H₂O₂ has decomposed." },
      { q:"How do you compare the rates using your graph?",
        a:"Draw a tangent to each curve at t = 0 and find its gradient (cm³ s⁻¹). The steeper the initial gradient, the faster the reaction. The gradient decreases with time as the concentration of H₂O₂ falls." },
      { q:"Why is powdered MnO₂ faster than lumps of the same mass, and why does more MnO₂ give a faster rate?",
        a:"Powder has a larger surface area, so more H₂O₂ particles collide with the catalyst surface per second. More catalyst also means more surface for collisions — the collision frequency on the surface increases." },
      { q:"Why are a run with sand and a run with no solid included?",
        a:"They are controls. They show that the faster rate is due to the catalyst itself, not just to adding a solid (sand is inert) and that H₂O₂ decomposes only very slowly on its own." },
      { q:"Suggest two sources of error and an improvement. Give a hazard and a precaution.",
        a:"Gas escapes before the bung is put in; the syringe plunger can stick; the reaction is exothermic so the temperature rises. Improvement: put the catalyst in a small tube inside the sealed flask and tip it, or use a data logger / measure the loss in mass on a balance. Hazard: hydrogen peroxide irritates the eyes and skin — wear eye protection; avoid breathing in MnO₂ dust." }
    ],
    setup(ctx){
      const Vmax0 = 90*(1 + (Math.random() - .5)*.06);
      let C, run = Math.max(0, ...ctx.rows().map(r => +String(r.run).replace(/R(\d+).*/, "$1") || 0));
      let cat = "mno2", mass = .5, form = "powder", mode = "read", every = 20, speed = 5;
      const gradDone = new Set();
      function fresh(){ C = { cat, mass, form, m0:null, running:false, ended:false, t:0, V:0, k:0, Vmax:0, next:0, waiting:false, reads:0, label:"", recovered:false, paper:Kit.round(.80 + Math.random()*.15, 2), loss:0, splint:null, g0:0 }; }
      fresh();
      const sw = { t:0 };
      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="ig-catalyst-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 460)}<g id="ig-catalyst-scene"></g><text x="24" y="30" class="k-status" id="ig-catalyst-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#ig-catalyst-svg"), $ = q => svg.querySelector(q);
      const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
      const kOf = () => { const c = CATS[C.cat]; return c.k*(c.solid && c.k > .001 ? (C.m0 || C.mass)*(C.form === "lumps" ? .25 : 1) : 1)*(1 + .04*ctx.gauss()); };
      const Vat = t => C.Vmax*(1 - Math.exp(-C.k*t));
      function draw(){
        const c = CATS[C.cat], rate = C.running ? C.Vmax*C.k*Math.exp(-C.k*C.t) : 0;
        const FL = ChemKit.FLASK(160, 460, 1.05);
        let g = `<defs><clipPath id="ig-catalyst-fl"><path d="${FL} Z"/></clipPath></defs><g clip-path="url(#ig-catalyst-fl)"><rect x="80" y="412" width="160" height="50" fill="rgba(200,215,235,.45)"/>`;
        if(c.solid && (C.running || C.ended) && !C.recovered){
          const n = C.form === "lumps" ? 5 : Math.round(16 + C.mass*30);
          for(let i = 0; i < n; i++){ const q = ((i*37) % 53)/53, r = ((i*17) % 29)/29;
            g += C.form === "lumps" ? `<path d="M${112 + q*92} ${452 - r*3} l7 -8 l9 2 l3 8z" fill="${rgb(c.col)}" stroke="rgba(0,0,0,.3)"/>` : `<circle cx="${102 + q*116}" cy="${455 - r*5}" r="${1.6 + r*1.4}" fill="${rgb(c.col)}"/>`; }
        }
        const nb = Math.min(16, Math.round(rate*3));
        for(let i = 0; i < nb; i++){ const r = ((i*53) % 71)/71, q = ((i*29) % 61)/61;
          g += `<circle cx="${108 + q*104}" cy="455" r="${1.6 + r*1.8}" fill="none" stroke="var(--txt2)" stroke-width=".9"><animate attributeName="cy" from="${456 - r*8}" to="${414}" dur="${.6 + r*.7}s" repeatCount="indefinite"/></circle>`; }
        g += `</g><path d="${FL}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><rect x="144" y="346" width="32" height="16" rx="3" fill="#3A4252"/>
          <path d="M160 346 V255 H300" stroke="var(--txt2)" stroke-width="3" fill="none"/>`;
        /* gas syringe */
        const px = 3.6, x0 = 300, L = 100*px, Vd = Math.min(C.V, 100);
        g += `<rect x="${x0}" y="240" width="${L + 10}" height="30" rx="5" fill="url(#k-glass)" stroke="var(--txt2)"/><rect x="${x0 + 2}" y="243" width="${Vd*px}" height="24" fill="rgba(200,215,235,.4)"/>
          <rect x="${x0 + 2 + Vd*px}" y="241" width="8" height="28" fill="#64748B"/><rect x="${x0 + 10 + Vd*px}" y="251" width="${Math.max(0, L - Vd*px + 30)}" height="8" fill="#64748B"/>`;
        for(let v = 0; v <= 100; v += 5) g += `<line x1="${x0 + 2 + v*px}" y1="270" x2="${x0 + 2 + v*px}" y2="${v % 10 ? 275 : 280}" stroke="var(--txt2)"/>${v % 20 ? "" : `<text x="${x0 + 2 + v*px}" y="293" text-anchor="middle" class="k-num">${v}</text>`}`;
        g += `<text x="${x0 + L/2}" y="314" text-anchor="middle" class="k-lbl">100 cm³ gas syringe, graduated in 1 cm³</text>`;
        g += lensH({ id:"ig-catalyst-l", cx:480, cy:122, r:78, S:26, value:Vd, minor:1, major:10, label:"magnifier on the syringe scale (cm³)" });
        /* balance for weighing the solid */
        if(c.solid && (C.m0 !== null && !C.running && !C.ended || C.recovered)){
          const rd = C.recovered ? C.paper + C.m0 - C.loss : C.m0;
          g += ChemKit.balance(330, 330, Kit.round(rd, 2), C.recovered ? "filter paper + dried solid" : "solid on a tared weighing boat");
          g += C.recovered ? `<ellipse cx="415" cy="345" rx="50" ry="7" fill="#F5F3EC" stroke="#C9C3B5"/><ellipse cx="415" cy="342" rx="22" ry="4" fill="${rgb(c.col)}"/>` : `<path d="M385 348 h60 l-6 -10 h-48z" fill="#E8EDF5" stroke="#9AA3B2"/><ellipse cx="415" cy="340" rx="18" ry="4" fill="${rgb(c.col)}"/>`;
        }
        /* splint test */
        if(C.splint){
          const relit = C.splint === "glow" && C.V >= 15;
          g += `<g transform="translate(600 330)"><path d="M0 0 V110 a17 17 0 0 0 34 0 V0" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><text x="60" y="20" class="k-lbl">gas from the syringe</text>
            <line x1="34" y1="-24" x2="20" y2="60" stroke="#C49A5B" stroke-width="5" stroke-linecap="round"/>`;
          if(C.splint === "lime") g += `<rect x="2" y="70" width="30" height="56" fill="rgba(230,235,240,.6)"/><text x="60" y="100" class="k-lbl">limewater</text>`;
          else if(relit || C.splint === "lit") g += `<path d="M20 60 C10 44 14 30 22 18 C30 32 32 46 20 60Z" fill="#FFB347" opacity=".9"><animate attributeName="opacity" values=".6;1;.6" dur=".4s" repeatCount="indefinite"/></path>`;
          else g += `<circle cx="20" cy="60" r="4" fill="${C.splint === "glow" ? "#3A3A3A" : "#FF6A2A"}"/>`;
          g += `</g>`;
        }
        /* clock + info card */
        const tt = C.waiting ? C.next : C.t;
        g += `<g transform="translate(740 40)"><rect width="200" height="70" rx="12" fill="#1F2937" stroke="#4B5563"/><rect x="12" y="10" width="176" height="38" rx="6" fill="#132A1F"/>
          <text x="178" y="38" text-anchor="end" class="k-lcd">${Math.floor(tt)}</text><text x="20" y="26" style="font:600 9px Inter;fill:#5FBF8A">stop-clock / s</text>
          <text x="100" y="63" text-anchor="middle" style="font:600 9px Inter;fill:#9CA3AF">${C.running ? (C.waiting ? "PAUSED FOR READING" : "RUNNING ×" + speed) : C.ended ? "STOPPED" : "READY"}</text></g>`;
        const info = [`Solid: ${c.name}`, c.solid ? `Mass: ${C.m0 !== null ? C.m0.toFixed(2) + " g" : "not weighed yet"} · ${C.form}` : "Nothing added (control)",
          "H₂O₂: 25.0 cm³ of 0.30 mol dm⁻³", `Readings every ${every} s for ${TEND} s`, mode === "read" ? "You read the syringe at each time" : "Readings recorded automatically",
          C.label ? `This run: ${C.label}` : "", C.recovered ? `Dry filter paper: ${C.paper.toFixed(2)} g` : "", C.running && !C.waiting ? `Next reading at ${C.next} s` : C.waiting ? `Read the syringe now (t = ${C.next} s)` : ""].filter(Boolean);
        const IL = []; info.forEach(l => ChemKit.wrap(l, 31).forEach((w, i) => IL.push((i ? "  " : "") + w)));
        g += `<g transform="translate(740 122)"><rect width="200" height="${32 + IL.length*16}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="12" y="22" class="k-tag">2H₂O₂ → 2H₂O + O₂</text>
          ${IL.map((l, i) => `<text x="12" y="${42 + i*16}" class="k-lbl">${ctx.esc(l)}</text>`).join("")}</g>`;
        $("#ig-catalyst-scene").innerHTML = g;
        $("#ig-catalyst-status").textContent = C.waiting ? `t = ${C.next} s — read the syringe` : C.running ? "Oxygen being collected…" : C.ended ? "Run over — test the gas or recover the solid" : c.solid && C.m0 === null ? "Weigh the solid, then add it and start the clock" : "Add the solid and start the clock";
        ctx.readout([["Solid", c.short], ["Mass", c.solid ? (C.m0 !== null ? C.m0.toFixed(2) + " g" : "—") : "—"], ["Form", c.solid ? C.form : "—"], ["t", Math.floor(tt) + " s"]]);
      }
      function endRun(){
        C.running = false; C.ended = true; C.waiting = false; lock(false);
        const rows = ctx.rows(), by = {};
        rows.forEach(r => { (by[r.run] = by[r.run] || { cat:r.cat, mass:r.mass, form:r.form, n:0 }).n++; });
        const runs = Object.values(by).filter(r => r.n >= 5);
        if(new Set(runs.map(r => r.cat)).size >= 4) ctx.complete("four");
        const mn = runs.filter(r => r.cat === "mno2");
        if(new Set(mn.map(r => r.mass + r.form)).size >= 2) ctx.complete("vary");
      }
      let last = performance.now();
      ctx.frame(dt => {
        if(C.running && !C.waiting){
          C.t += dt*speed;
          if(C.t >= C.next){
            if(mode === "read"){ C.t = C.next; C.waiting = true; }
            else{ ctx.record({ run:C.label, t:C.next, V:Kit.round(Math.round(Vat(C.next)*2)/2, 1), cat:C.cat, mass:C.m0, form:C.form }, true); C.next += every; }
          }
          C.V = Vat(C.t);
          if(C.V >= 100){ C.V = 100; ctx.toast("The syringe is full — the plunger has reached the end."); endRun(); }
          else if(!C.waiting && C.t >= TEND){ C.t = TEND; endRun(); }
          draw();
        }
      });
      void last; void sw;
      const lock = d => { [cs, ms, fs, md, ev].forEach(x => x.disable(d)); };
      const cs = ctx.seg({ label:"Solid added", value:cat, options:[["mno2","MnO₂"],["cuo","CuO"],["sand","Sand"],["none","None"]], onChange(v){ cat = v; fresh(); draw(); } });
      const ms = ctx.seg({ label:"Mass of solid", value:mass, options:[[.25,"0.25 g"],[.5,"0.50 g"],[1,"1.00 g"]], onChange(v){ mass = v; fresh(); draw(); } });
      const fs = ctx.seg({ label:"Particle size", value:form, options:[["powder","Powder"],["lumps","Lumps"]], onChange(v){ form = v; fresh(); draw(); } });
      const md = ctx.seg({ label:"Readings", value:mode, options:[["read","You read the syringe"],["auto","Auto-record"]], onChange(v){ mode = v; draw(); } });
      const ev = ctx.seg({ label:"Reading interval", value:every, options:[[10,"10 s"],[20,"20 s"],[30,"30 s"]], onChange(v){ every = v; draw(); } });
      ctx.seg({ label:"Clock speed", value:speed, options:[[1,"Real time"],[5,"×5"],[10,"×10"]], onChange(v){ speed = v; draw(); } });
      ctx.buttons([
        { label:"Weigh the solid", onClick(){ const c = CATS[C.cat]; if(!c.solid) return ctx.toast("Nothing to weigh in the control run");
          if(C.running || C.ended) return ctx.toast("Start a new run first"); C.m0 = Kit.round(C.mass*(1 + (Math.random() - .5)*.06), 2); draw(); } },
        { label:"Add solid, bung in, start clock", primary:true, onClick(){
          const c = CATS[C.cat];
          if(C.running) return; if(C.ended) return ctx.toast("Start a new run (empty the flask) first");
          if(c.solid && C.m0 === null) return ctx.toast("Weigh the solid first");
          run++; C.label = `R${run} ${c.short}${c.solid ? " " + C.m0.toFixed(2) + " g " + C.form : ""}`;
          C.Vmax = Vmax0*(1 + .01*ctx.gauss()); C.k = kOf(); C.g0 = C.Vmax*C.k; C.t = 0; C.V = 0; C.next = every; C.running = true; C.reads = 0; C.splint = null;
          ctx.record({ run:C.label, t:0, V:0, cat:C.cat, mass:C.m0, form:C.form }, true); lock(true); rd.clear(); draw(); } },
        { label:"Stop run", onClick(){ if(C.running) endRun(); draw(); } }
      ]);
      const rd = Kit.reading(ctx, "Syringe reading at this time / cm³", "e.g. 42", () => C.waiting ? Kit.round(C.V, 3) : null, .51, v => {
        ctx.record({ run:C.label, t:C.next, V:Kit.round(v, 1), cat:C.cat, mass:C.m0, form:C.form }, true);
        C.reads++; if(C.reads >= 6) ctx.complete("read");
        C.next += every; C.waiting = false; rd.input.value = "";
        if(C.t >= TEND) endRun();
        draw();
      });
      ctx.buttons([
        { label:"Glowing splint", onClick(){ test("glow"); } }, { label:"Lighted splint", onClick(){ test("lit"); } }, { label:"Limewater", onClick(){ test("lime"); } }
      ]);
      function test(k){
        if(!C.running && !C.ended) return ctx.toast("Collect some gas first");
        C.splint = k;
        const enough = C.V >= 15;
        if(k === "glow"){ if(enough){ ctx.toast("The glowing splint relights — the gas is oxygen"); ctx.complete("o2"); } else ctx.toast("Too little gas collected — the splint doesn't relight. Use a catalyst."); }
        else if(k === "lit") ctx.toast("A lighted splint just keeps burning (brighter). The squeaky pop test is for hydrogen — use a glowing splint for oxygen.");
        else ctx.toast("Limewater stays colourless — no CO₂. Limewater is the test for carbon dioxide.");
        draw();
      }
      ctx.buttons([
        { label:"Filter, wash and dry the solid, then weigh", onClick(){
          const c = CATS[C.cat]; if(!c.solid) return ctx.toast("There is no solid to recover in the control");
          if(!C.ended) return ctx.toast("Finish the run first"); if(C.recovered) return;
          C.recovered = true; C.loss = Math.random() < .5 ? 0 : .01; draw(); } },
        { label:"Empty the flask · new run", onClick(){ if(C.running) return ctx.toast("Stop the run first"); fresh(); rd.clear(); draw(); } }
      ]);
      ctx.html(`<div class="hint" style="margin:-4px 0 10px">The dry filter paper was weighed first; the balance now shows paper + solid.</div>`);
      const pAns = Kit.answer(ctx, "Mass of solid recovered / g", "e.g. 0.50", v => {
        if(!C.recovered) return [false, "Recover the solid after a run first."];
        const m = Kit.round(Kit.round(C.paper + C.m0 - C.loss, 2) - C.paper, 2);
        if(Math.abs(v - m) <= .011){ ctx.complete("mass");
          return [true, `Correct: ${(C.paper + C.m0 - C.loss).toFixed(2)} − ${C.paper.toFixed(2)} (paper) = ${m.toFixed(2)} g; before: ${C.m0.toFixed(2)} g. The same within the balance resolution (±0.01 g)${C.cat === "sand" ? " — but sand did not speed up the reaction, so it is not a catalyst" : ` — the ${CATS[C.cat].short} is not used up: it is a catalyst`}.`]; }
        return [false, `Subtract the mass of the dry filter paper (${C.paper.toFixed(2)} g) from the balance reading.`];
      });
      void pAns;
      Kit.answer(ctx, "Initial rate for your latest run (gradient of the tangent at t = 0) / cm³ s⁻¹", "e.g. 4.5", v => {
        if(!C.label || !C.ended) return [false, "Finish a run first, plot V against t, and draw a tangent at t = 0."];
        const n = ctx.rows().filter(r => r.run === C.label).length; if(n < 4) return [false, "You need at least four readings in this run."];
        const g0 = C.g0, ok = g0 < .05 ? Math.abs(v) <= .05 : v >= .55*g0 && v <= 1.3*g0;
        if(ok){
          if(C.cat === "mno2" || C.cat === "cuo") gradDone.add(C.cat);
          if(gradDone.has("mno2") && gradDone.has("cuo")) ctx.complete("grad");
          const ratio = CATS.mno2.k/CATS.cuo.k;
          return [true, `Good: the true initial rate was about ${g0.toFixed(g0 < 1 ? 2 : 1)} cm³ s⁻¹.${g0 < .05 ? " Almost no reaction without a catalyst." : ""} For the same mass of powder, MnO₂ is about ${ratio.toFixed(0)} times faster than CuO — it is the better catalyst.${gradDone.size < 2 && C.cat !== "sand" && C.cat !== "none" ? " Now do the same for the other oxide." : ""}`]; }
        return [false, v < .55*g0 ? "Too small — use the steepest part at the very start. With long intervals the first reading underestimates the initial rate; try 10 s intervals." : "Too large — the tangent should touch the curve at t = 0, not cut through it."];
      });
      draw();
    }
  });
})();
