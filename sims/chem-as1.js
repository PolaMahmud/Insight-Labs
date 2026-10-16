"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMISTRY · AS LEVEL (9701 Paper 3) — part 1
   Titrations (weak acid–alkali with indicator choice · KMnO₄ with Fe²⁺,
   H₂O₂ and ethanedioate · iodine–thiosulfate · back titration) ·
   Thermometry (neutralisation · displacement with extrapolation ·
   Hess's law · thermometric titration)
══════════════════════════════════════════════════════════════════ */

/* ───────────── AS TITRATIONS ───────────── */
(function(){
  const KMNO4 = { bur:"FA 1 is 0.0200 mol dm⁻³ KMnO₄", burCol:"rgba(120,25,130,.85)", cB:.0200, ind:null, redox:true };
  /* indicators listed in the 9701 syllabus (p. 67) */
  const IND = {
    tp:{ name:"thymolphthalein", lo:9.3, hi:10.5, a:[232,238,246,.25], b:[40,80,200,.8], an:"colourless", mid:"pale blue", bn:"blue" },
    tb:{ name:"thymol blue", lo:8.0, hi:9.6, a:[240,210,60,.75], b:[50,90,200,.8], an:"yellow", mid:"green", bn:"blue" },
    mo:{ name:"methyl orange", lo:2.9, hi:4.6, a:[220,45,45,.75], b:[245,205,40,.8], an:"red", mid:"orange", bn:"yellow" },
    bb:{ name:"bromophenol blue", lo:3.0, hi:4.5, a:[240,210,60,.75], b:[60,70,190,.8], an:"yellow", mid:"green", bn:"blue" }
  };
  const TM = {
    weak:{ short:"Weak acid / NaOH", name:"Acid–alkali: ethanoic acid and NaOH",
      bur:"FA 3 is 0.100 mol dm⁻³ NaOH", burCol:"rgba(200,215,235,.45)", cB:.100,
      flask:"FA 2: 25.0 cm³ of FA 1 (ethanoic acid) made up to 250 cm³ in a volumetric flask", reagent:null, ind:"Add the chosen indicator", dilute:true,
      gen:() => Kit.round(.85 + Math.random()*.3, 3), Veq:c => c/10*25/.100,
      ans:"Concentration of ethanoic acid in FA 1 / mol dm⁻³", from:t => 10*.100*t/25, ph:"e.g. 0.985",
      how:"n(NaOH) = 0.100 × titre ÷ 1000 = n(CH₃COOH) in 25.0 cm³ of FA 2. c(FA 2) = n ÷ 0.0250; FA 1 is 10 times more concentrated (250 ÷ 25.0)." },
    mno4:Object.assign({ short:"KMnO₄ / Fe²⁺", name:"Redox: KMnO₄ into Fe²⁺",
      flask:"FA 4 is aqueous iron(II) ammonium sulfate", reagent:"Add 20 cm³ dilute H₂SO₄",
      gen:() => Kit.round(.085 + Math.random()*.035, 4), Veq:c => c*25/(5*.0200),
      ans:"Concentration of Fe²⁺ in FA 4 / mol dm⁻³", from:t => 5*.0200*t/25, ph:"e.g. 0.0960",
      how:"n(MnO₄⁻) = 0.0200 × titre ÷ 1000. MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O, so n(Fe²⁺) = 5 × n(MnO₄⁻) in 25.0 cm³." }, KMNO4),
    h2o2:Object.assign({ short:"KMnO₄ / H₂O₂", name:"Redox: KMnO₄ into hydrogen peroxide",
      flask:"FA 5 is dilute aqueous hydrogen peroxide", reagent:"Add 20 cm³ dilute H₂SO₄",
      gen:() => Kit.round(.044 + Math.random()*.014, 4), Veq:c => c*25*2/5/.0200,
      ans:"Concentration of H₂O₂ in FA 5 / mol dm⁻³", from:t => .0200*t/1000*5/2/.025, ph:"e.g. 0.0500",
      how:"2MnO₄⁻ + 5H₂O₂ + 6H⁺ → 2Mn²⁺ + 5O₂ + 8H₂O, so n(H₂O₂) = 5/2 × n(MnO₄⁻) in 25.0 cm³." }, KMNO4),
    c2o4:Object.assign({ short:"KMnO₄ / C₂O₄²⁻", name:"Redox: KMnO₄ into ethanedioate (warm)",
      flask:"FA 6 is aqueous sodium ethanedioate, Na₂C₂O₄", reagent:"Add 20 cm³ dilute H₂SO₄ and warm to about 60 °C", warm:true,
      gen:() => Kit.round(.044 + Math.random()*.014, 4), Veq:c => c*25*2/5/.0200,
      ans:"Concentration of C₂O₄²⁻ in FA 6 / mol dm⁻³", from:t => .0200*t/1000*5/2/.025, ph:"e.g. 0.0500",
      how:"2MnO₄⁻ + 5C₂O₄²⁻ + 16H⁺ → 2Mn²⁺ + 10CO₂ + 8H₂O, so n(C₂O₄²⁻) = 5/2 × n(MnO₄⁻) in 25.0 cm³." }, KMNO4),
    io3:{ short:"I₂ / S₂O₃²⁻", name:"Iodine–thiosulfate",
      bur:"FA 7 is 0.100 mol dm⁻³ Na₂S₂O₃", burCol:"rgba(200,215,235,.45)", cB:.100,
      flask:"FA 8 is aqueous potassium iodate(V), KIO₃", reagent:"Add excess KI(aq) and dilute H₂SO₄", ind:"Add starch indicator",
      gen:() => Kit.round(.0130 + Math.random()*.0045, 5), Veq:c => 6*c*25/.100,
      ans:"Concentration of IO₃⁻ in FA 8 / mol dm⁻³", from:t => .100*t/1000/6/.025, ph:"e.g. 0.0150",
      how:"IO₃⁻ + 5I⁻ + 6H⁺ → 3I₂ + 3H₂O and I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻, so n(IO₃⁻) = n(S₂O₃²⁻) ÷ 6." },
    back:{ short:"Back titration", name:"Back titration: purity of CaCO₃",
      bur:"FA 9 is 0.100 mol dm⁻³ NaOH", burCol:"rgba(200,215,235,.45)", cB:.100,
      flask:"FA 10: limestone dissolved in 50.0 cm³ of 1.00 mol dm⁻³ HCl, made up to 250 cm³", reagent:null, ind:"Add methyl orange",
      gen:() => ({ m:Kit.round(1.80 + Math.random()*.4, 2), P:Kit.round(80 + Math.random()*15, 1) }),
      Veq:u => (.0500 - 2*u.m*u.P/100/100.1)/10/.100*1000,
      ans:"Percentage by mass of CaCO₃ in the limestone", ph:"e.g. 88.5",
      how:"n(NaOH) = n(HCl left in 25.0 cm³). × 10 for 250 cm³. HCl used by CaCO₃ = 0.0500 − that. n(CaCO₃) = ½ × HCl used; × 100.1 g mol⁻¹; ÷ mass × 100." }
  };
  const short = k => TM[k].short;

  Lab.register({
    id:"as-titrations", subject:"chemistry", level:["as","a"], topic:"Titrations · Acid–alkali, redox & back titration", interactive:true,
    title:"Redox, weak acid and back titrations",
    summary:"Every Paper 3 titration in the 9701 syllabus: a weak acid with NaOH and a choice of the listed indicators, KMnO₄ with iron(II), hydrogen peroxide or ethanedioate, iodine–thiosulfate with starch, and a back titration. Read the burette yourself.",
    aim:"Carry out a rough and accurate titrations to concordance, calculate a concentration or a percentage purity, and estimate the uncertainty in the titre.",
    variables:{ iv:"Volume of titrant added from the burette (cm³)", dv:"Colour change at the end point", cv:["25.0 cm³ of the flask solution by pipette","Same indicator (or none for KMnO₄)","Swirl after each addition; add drop by drop near the end point"] },
    stageTitle:"Titration bench", controlsTitle:"Titration",
    thumb:`<svg viewBox="0 0 300 140"><rect x="141" y="6" width="14" height="90" rx="3" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="143" y="30" width="10" height="64" fill="#7A1F86" fill-opacity=".8"/>
      <path d="M142 96h12M148 96v12" stroke="#A2ACBD" stroke-width="2"/><path d="M138 104v8L112 132h72l-26-20v-8" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M121 125h54l9 7h-72z" fill="#F0A6DA"/></svg>`,
    challenges:[
      { id:"rough",  title:"Rough first", text:"Do a rough titration, then accurate ones." },
      { id:"conc",   title:"Concordant", text:"Get two accurate titres within 0.10 cm³ of each other." },
      { id:"calc",   title:"Calculate", text:"Work out the concentration or purity from your mean titre." },
      { id:"unc",    title:"Uncertainty", text:"Calculate the percentage uncertainty in one accurate titre." },
      { id:"starch", title:"Starch at the right time", text:"In the iodine titration, add starch only when the solution is pale yellow." },
      { id:"indic",  title:"Choose the indicator", text:"Titrate the weak acid with an indicator from each pH range and compare the titres." },
      { id:"all",    title:"Three kinds", text:"Reach concordance in three different titrations." }
    ],
    columns:[{key:"mode",label:"Titration"},{key:"kind",label:"Rough / accurate"},{key:"start",label:"Initial / cm³",dp:2},{key:"end",label:"Final / cm³",dp:2},{key:"titre",label:"Titre / cm³",dp:2}],
    questions:[
      { q:"Why is no indicator needed in a manganate(VII) titration?",
        a:"MnO₄⁻ is intensely purple and is reduced to almost colourless Mn²⁺. The first excess drop gives a permanent pale pink colour, so the reagent is self-indicating." },
      { q:"Why must dilute sulfuric acid be added before titrating with KMnO₄? Why not hydrochloric acid?",
        a:"H⁺ ions are needed for MnO₄⁻ to be reduced to Mn²⁺; with too little acid a brown precipitate of MnO₂ forms. HCl cannot be used because MnO₄⁻ would oxidise Cl⁻ to Cl₂, using up extra titrant." },
      { q:"Why is starch added only near the end point of an iodine–thiosulfate titration?",
        a:"At high iodine concentration starch forms a complex that releases iodine only slowly, so the blue-black colour fades gradually and the end point is overshot. Near the end point (pale yellow) the blue-black → colourless change is sharp." },
      { q:"A burette reading has an uncertainty of ±0.05 cm³. What is the percentage uncertainty in a titre of 24.20 cm³?",
        a:"Two readings are used, so the titre is ±0.10 cm³. Percentage uncertainty = 0.10 ÷ 24.20 × 100 = 0.41%." },
      { q:"FA 2 was made by diluting 25.0 cm³ of a stock solution to 250 cm³ in a volumetric flask. How do you find the stock concentration?",
        a:"Multiply the FA 2 concentration by the dilution factor, 250 ÷ 25.0 = 10. Make up to the mark with distilled water and invert the flask several times to mix." },
      { q:"Which of the syllabus indicators should be used for ethanoic acid with sodium hydroxide, and why not methyl orange?",
        a:"Thymolphthalein (pH 9.3–10.5) or thymol blue (8.0–9.6). The equivalence point of a weak acid with a strong alkali is about pH 8.7 and the pH changes sharply between about 7 and 11. Methyl orange and bromophenol blue change at pH 3–4.6, while the buffer region is still rising slowly, so the colour change is gradual and far too early." },
      { q:"Why is the ethanedioate solution warmed to about 60 °C before titrating with KMnO₄?",
        a:"The reaction is very slow at room temperature (it is catalysed by the Mn²⁺ formed). Warming makes each drop decolourise quickly, so the first permanent pink shows the true end point." },
      { q:"How do you know when the hydrogen peroxide titration is complete?",
        a:"Small bubbles of oxygen form while MnO₄⁻ is being reduced. The end point is the first permanent pale pink colour." },
      { q:"Distinguish a systematic error from a random error in titration.",
        a:"Systematic: affects every reading the same way, e.g. a burette that is wrongly calibrated, or reading the top of the meniscus throughout. Random: varies from run to run, e.g. judging the exact colour change. Concordant repeats reduce the effect of random errors only." },
      { q:"Why is a back titration used for limestone rather than titrating the solid directly?",
        a:"CaCO₃ is insoluble and reacts slowly, so there is no sharp end point. Dissolving it in a known excess of acid and titrating the acid left over gives an accurate result." },
      { q:"Suggest one improvement to reduce the percentage uncertainty in the titre.",
        a:"Use a larger titre: a more dilute titrant or a larger volume of the flask solution (e.g. 50.0 cm³ pipette). The absolute burette uncertainty stays the same, so the percentage falls." }
    ],
    setup(ctx){
      const BX = 250, Y0 = 50, PX = 6, FL = ChemKit.FLASK(BX, 500, 1);
      const unk = {}; Object.keys(TM).forEach(k => unk[k] = TM[k].gen());
      let mode = "weak", indK = "tp", madeUp = false, r = null, flowing = false, plume = 0, warnedMn = false, initRead = null;
      let F = null;                               // flask contents
      const drops = [];
      const M = () => TM[mode], Veq = () => M().Veq(unk[mode]);
      const freshFlask = () => ({ pip:false, reagent:false, ind:false, indK:null, starchAt:null, added:0 });
      const label = k => TM[k].short + (k === "weak" ? ` (${IND[indK].name})` : "");
      function weakPH(added){
        const c = unk.weak/10, nA = c*.025, nB = .100*added/1000, V = (25 + added)/1000, pKa = 4.757;
        const hyd = 14 - .5*(9.243 - Math.log10(nA/V));
        if(nB < 1e-9) return .5*(pKa - Math.log10(c));
        if(nB < nA) return Math.min(hyd, pKa + Math.log10(nB/(nA - nB)));
        return Math.max(hyd, nB > nA ? 14 + Math.log10((nB - nA)/V) : 0);
      }
      F = freshFlask();
      const extra = () => mode === "io3" && F.starchAt !== null && F.starchAt < .75 ? .25 : 0;

      function flaskColour(){
        if(!F.pip) return null;
        const V = Veq() + extra(), d = F.added - V, f = F.added/V;
        if(mode === "weak"){
          if(!F.ind) return ["rgba(210,225,240,.28)", "colourless"];
          const I = IND[F.indK], p = weakPH(F.added), f = (p - I.lo)/(I.hi - I.lo);
          const c = f <= 0 ? I.a : f >= 1 ? I.b : ChemKit.mix(I.a, I.b, f).concat([I.a[3] + (I.b[3] - I.a[3])*f]);
          return [`rgba(${c[0]},${c[1]},${c[2]},${c[3] === undefined ? .8 : c[3]})`, f <= 0 ? I.an : f >= 1 ? I.bn : I.mid];
        }
        if(M().redox){
          if(!F.reagent && F.added > .3) return ["rgba(140,95,45,.55)", "brown (MnO₂)"];
          if(d <= 0) { const c = ChemKit.mix([210,235,210],[238,232,195], f); return [`rgba(${c},.35)`, "very pale green-yellow"]; }
          return [`rgba(225,105,190,${Math.min(.85, .2 + d*1.6)})`, d < .2 ? "pale pink (permanent)" : "pink-purple"];
        }
        if(mode === "io3"){
          if(!F.reagent) return ["rgba(210,225,240,.28)", "colourless"];
          const g = Math.max(0, 1 - f);
          if(F.ind) return g > 0 ? [`rgba(25,25,70,${.35 + .55*Math.min(1, g*12)})`, "blue-black"] : ["rgba(210,225,240,.28)", "colourless"];
          if(g <= 0) return ["rgba(210,225,240,.28)", "colourless"];
          const c = ChemKit.mix([246,236,170],[140,60,15], Math.min(1, g*1.6));
          return [`rgba(${c},${.25 + .6*Math.min(1, g*3)})`, g > .45 ? "brown" : g > .12 ? "yellow" : "pale yellow"];
        }
        if(!F.ind) return ["rgba(210,225,240,.28)", "colourless"];
        return d < 0 ? ["rgba(220,45,45,.75)", "red"] : d < .10 ? ["rgba(240,130,40,.8)", "orange"] : ["rgba(245,205,40,.8)", "yellow"];
      }

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="at-svg"><defs>${Kit.DEFS}<clipPath id="at-fl"><path d="${FL} Z"/></clipPath><clipPath id="at-bur"><rect x="${BX - 9}" y="40" width="18" height="312"/></clipPath></defs>
        ${Kit.bench(960, 500)}<g id="at-scene"></g><g id="at-lens"></g><text x="24" y="30" class="k-status" id="at-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#at-svg"), $ = s => svg.querySelector(s);
      let ticks = "";
      for(let v = 0; v <= 50; v++){ const y = Y0 + v*PX; ticks += `<line x1="${BX - 10}" y1="${y}" x2="${BX - 10 + (v % 5 ? 4 : 8)}" y2="${y}" stroke="var(--txt2)" stroke-width=".8"/>${v % 10 ? "" : `<text x="${BX - 14}" y="${y + 3.5}" text-anchor="end" class="k-num">${v}</text>`}`; }

      function draw(){
        const [col, cname] = flaskColour() || [null, "—"];
        const vol = F.pip ? 25 + (F.reagent ? (M().redox ? 20 : 10) : 0) + F.added : 0, lvl = 488 - vol*.42;
        let s = `<rect x="110" y="488" width="160" height="12" rx="3" fill="url(#k-metal)"/><rect x="130" y="30" width="9" height="460" rx="3" fill="url(#k-metal)"/><rect x="130" y="150" width="${BX - 140}" height="8" rx="3" fill="url(#k-metal)"/>
          <rect x="${BX - 70}" y="492" width="140" height="8" fill="#F4F4F2" stroke="#C9CCD3"/>`;
        if(r !== null && r < 50) s += `<rect x="${BX - 9}" y="${Y0 + r*PX}" width="18" height="${352 - Y0 - r*PX}" fill="${M().burCol}" clip-path="url(#at-bur)"/>`;
        s += `<rect x="${BX - 10}" y="40" width="20" height="312" rx="3" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/>${ticks}
          <path d="M${BX - 4} 352 L${BX - 2} 392 H${BX + 2} L${BX + 4} 352" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.3"/>
          <rect x="${BX - 14}" y="356" width="28" height="10" rx="4" fill="${flowing ? "var(--accent)" : "#3B4A63"}"/>`;
        s += drops.map(d => `<ellipse cx="${BX}" cy="${d.y}" rx="2.4" ry="3.4" fill="${M().burCol}"/>`).join("");
        if(col) s += `<g clip-path="url(#at-fl)"><rect x="${BX - 70}" y="${lvl}" width="140" height="${500 - lvl}" fill="${col}"/>${plume > 0 && M().redox ? `<ellipse cx="${BX}" cy="${lvl + 6}" rx="${14 + 10*(1 - plume)}" ry="6" fill="rgba(120,25,130,${.7*plume})"/>` : ""}</g>`;
        s += `<path d="${FL}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
        s += `<text x="${BX + 80}" y="${Y0 + 10}" class="k-tag">burette: ${ctx.esc(M().bur)}</text>`;
        s += `<g transform="translate(640 300)"><rect width="300" height="170" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="14" y="24" class="k-tag">${ctx.esc(M().name)}</text>
          ${ChemKit.lines(M().flask, 46, 14, 48, 16)}
          ${mode === "back" ? `<text x="14" y="84" class="k-lbl">mass of limestone used = ${unk.back.m.toFixed(2)} g</text>` : ""}
          ${mode === "weak" ? `<text x="14" y="88" class="k-lbl">volumetric flask: ${madeUp ? "FA 2 made up to the mark ✓" : "not made up yet"}</text>` : ""}
          <text x="14" y="108" class="k-lbl">flask: ${F.pip ? "25.0 cm³ pipetted" : "empty"}${F.reagent ? " + reagent" : ""}${F.ind ? (mode === "io3" ? " + starch" : mode === "weak" ? " + " + IND[F.indK].name : " + indicator") : ""}</text>
          <text x="14" y="130" class="k-lbl">colour: ${cname}</text>
          <text x="14" y="154" class="k-lbl">initial reading entered: ${initRead === null ? "—" : initRead.toFixed(2) + " cm³"}</text></g>`;
        $("#at-scene").innerHTML = s;
        $("#at-lens").innerHTML = r === null ? `<g transform="translate(470 190)"><circle r="85" fill="var(--bg-card)" stroke="var(--brd2)" stroke-dasharray="5 4"/><text text-anchor="middle" y="4" class="k-lbl">fill the burette</text></g>`
          : ChemKit.lens({ id:"at-l", cx:470, cy:190, r:85, S:60, value:Math.min(r, 50.6), minor:.1, major:1, half:.5, down:true, liquid:M().burCol, label:"magnifier on the meniscus (eye level)" })
            + `<line x1="${BX + 12}" y1="${Y0 + Math.min(r, 50)*PX}" x2="385" y2="190" stroke="var(--accent)" stroke-dasharray="3 3"/>`;
        $("#at-status").textContent = r === null ? "Fill the burette, then pipette the flask solution"
          : !F.pip ? "Pipette 25.0 cm³ into the conical flask" : initRead === null ? "Read the burette and enter the initial reading"
          : "Open the tap, swirl, and stop at the first permanent colour change";
        ctx.readout([["Titration", M().short], ["Flask colour", cname], ["Added so far", F.added.toFixed(2) + " cm³"]]);
      }

      function add(v){
        if(r === null) { ctx.toast("Fill the burette first"); return false; }
        if(!F.pip){ ctx.toast("Pipette the solution into the flask first"); return false; }
        if(initRead === null){ ctx.toast("Enter the initial burette reading before you start"); return false; }
        if(r + v > 50.6){ ctx.toast("The burette is empty — refill it"); return false; }
        r += v; F.added = Kit.round(F.added + v, 4); plume = 1; drops.push({ y:392, vy:0 });
        if(M().redox && !F.reagent && F.added > .3 && !warnedMn){ warnedMn = true; ctx.toast("Brown precipitate! No acid was added — MnO₂ forms"); }
        return true;
      }
      ctx.frame(dt => {
        if(flowing && !add(1.6*dt)) flowing = false;
        plume = Math.max(0, plume - dt*1.2);
        for(let k = drops.length - 1; k >= 0; k--){ const d = drops[k]; d.vy += 900*dt; d.y += d.vy*dt; if(d.y > 470) drops.splice(k, 1); }
        draw();
      });

      ctx.select({ label:"Titration", value:mode, options:Object.keys(TM).map(k => [k, TM[k].name]), onChange(v){ mode = v; F = freshFlask(); r = null; initRead = null; rb1.clear(); rb2.clear(); calc.clear(); relabel(); showConc(); draw(); } });
      const indSel = ctx.select({ label:"Indicator (weak acid titration)", value:indK, options:Object.keys(IND).map(k => [k, `${IND[k].name} (pH ${IND[k].lo}–${IND[k].hi})`]), onChange(v){ indK = v; showConc(); } });
      const makeBtn = ctx.buttons([{ label:"Make up FA 2: 25.0 cm³ FA 1 → 250 cm³", block:true, onClick(){ madeUp = true; ctx.toast("Pipetted 25.0 cm³ of FA 1 into the volumetric flask, made up to the mark and inverted to mix"); draw(); } }]);
      ctx.buttons([
        { label:"Fill burette", onClick(){ r = Kit.round(.1 + Math.random()*1.6, 3); initRead = null; rb1.clear(); draw(); } },
        { label:"Pipette 25.0 cm³", onClick(){ if(M().dilute && !madeUp) return ctx.toast("Make up FA 2 in the volumetric flask first"); if(F.pip) return ctx.toast("The flask already has 25.0 cm³ in it"); F = freshFlask(); F.pip = true; draw(); } }
      ]);
      const reagentBtns = ctx.buttons([
        { label:"Add reagent", onClick(){ if(!F.pip) return ctx.toast("Pipette the solution first"); if(!M().reagent) return ctx.toast("No extra reagent is needed here"); F.reagent = true; draw(); } },
        { label:"Add indicator", onClick(){
          if(!F.pip) return ctx.toast("Pipette the solution first");
          if(!M().ind) return ctx.toast("KMnO₄ is self-indicating — no indicator needed");
          if(F.ind) return;
          F.ind = true; F.indK = indK;
          if(mode === "io3"){ F.starchAt = F.added/Veq(); const g = 1 - F.starchAt;
            if(F.reagent && g > .03 && g < .25) ctx.complete("starch"); else if(F.reagent && g >= .25) ctx.toast("Starch added early — the blue-black colour will be slow to clear"); }
          draw(); } }
      ]);
      ctx.html(`<div class="hint">Reagent: <span id="at-rg"></span> · Indicator: <span id="at-in"></span></div>`);
      const syncHints = () => { ctx.controls.querySelector("#at-rg").textContent = M().reagent || "none"; ctx.controls.querySelector("#at-in").textContent = M().ind || "none (self-indicating)"; };
      ctx.html(`<div class="ctl"><div class="lbl"><span>Burette tap</span></div></div>`);
      ctx.buttons([{ label:"+1.00 cm³", onClick:() => add(1) }, { label:"+0.10", onClick:() => add(.1) }, { label:"1 drop", onClick:() => add(.05) }]);
      const hold = ctx.buttons([{ label:"Hold to open tap", block:true, onClick(){} }])[0];
      const on = e => { e.preventDefault(); flowing = true; }, off = () => { flowing = false; };
      hold.addEventListener("pointerdown", on); ["pointerup","pointerleave","pointercancel"].forEach(ev => hold.addEventListener(ev, off)); hold.style.touchAction = "none";

      const rb1 = Kit.reading(ctx, "Initial burette reading / cm³ (2 d.p.)", "e.g. 0.85", () => r === null || F.added > 0 ? null : r, .05, v => { initRead = v; draw(); });
      const rb2 = Kit.reading(ctx, "Final burette reading / cm³ (2 d.p.)", "e.g. 24.30", () => initRead === null || F.added <= 0 ? null : r, .05, v => {
        const mine = ctx.rows().filter(x => x.mode === label(mode)), kind = mine.length ? "accurate" : "rough";
        ctx.record({ mode:label(mode), kind, start:initRead, end:v, titre:Kit.round(v - initRead, 2) });
        if(kind === "rough") ctx.complete("rough");
        rb1.clear(); rb2.clear(); initRead = null; F = freshFlask();
        if(r > 40) ctx.toast("Titre recorded — refill the burette before the next run");
        showConc(); draw();
      });

      function concordant(k){
        const t = ctx.rows().filter(x => x.mode === label(k) && x.kind === "accurate").map(x => x.titre).sort((a, b) => a - b);
        let best = [];
        for(let i = 0; i < t.length; i++){ const set = t.filter(v => v >= t[i] && v - t[i] <= .10 + 1e-9); if(set.length > best.length) best = set; }
        return best.length >= 2 ? best : [];
      }
      const concBox = ctx.html(`<div class="ctl"><div class="hint" id="at-conc"></div></div>`);
      function showConc(){
        const c = concordant(mode);
        concBox.querySelector("#at-conc").innerHTML = c.length ? `Concordant titres: ${c.map(v => v.toFixed(2)).join(", ")} → mean <b>${Kit.mean(c).toFixed(2)} cm³</b>` : "Accurate titres within 0.10 cm³ of each other are concordant; average only those.";
        if(c.length) ctx.complete("conc");
        if(Object.keys(TM).filter(k => concordant(k).length).length >= 3) ctx.complete("all");
        const wk = new Set(ctx.rows().filter(x => x.mode.startsWith(short("weak"))).map(x => /methyl orange|bromophenol/.test(x.mode) ? "acid" : "alk"));
        if(wk.size === 2) ctx.complete("indic");
      }
      const calc = Kit.answer(ctx, "Your answer from the mean titre", "see the question", v => {
        const c = concordant(mode); if(!c.length) return [false, "Get two concordant accurate titres first."];
        const t = Kit.mean(c);
        let want;
        if(mode === "back"){ const left = .100*t/1000*10, n = (.0500 - left)/2; want = n*100.1/unk.back.m*100; }
        else want = M().from(t);
        if(Math.abs(v - want)/want <= .015){
          const truth = mode === "back" ? unk.back.P : unk[mode];
          if(mode === "weak" && (indK === "mo" || indK === "bb")) return [false, `Your arithmetic is right (${ctx.sig(want, 3)} mol dm⁻³), but ${IND[indK].name} changes colour at pH 3–4.6, long before the equivalence point of a weak acid. Repeat with an indicator that changes in the alkaline range.`];
          ctx.complete("calc");
          return [true, `Correct from your titre (${t.toFixed(2)} cm³): ${ctx.sig(want, 3)}${mode === "back" ? "%" : " mol dm⁻³"}. Hidden value: ${truth}${mode === "back" ? "%" : ""}.`];
        }
        return [false, M().how];
      });
      const ansLbl = calc.box.querySelector("label span");
      Kit.answer(ctx, "Percentage uncertainty in your last accurate titre / %", "e.g. 0.42", v => {
        const a = ctx.rows().filter(x => x.kind === "accurate").pop(); if(!a) return [false, "Record an accurate titre first."];
        const p = ChemKit.pct(.10, a.titre);
        if(Math.abs(v - p) <= .02*p + .01){ ctx.complete("unc"); return [true, `Correct: ±0.10 cm³ (two readings of ±0.05) ÷ ${a.titre.toFixed(2)} × 100 = ${p.toFixed(2)}%.`]; }
        return [false, "Each reading is ±0.05 cm³ and a titre uses two readings."];
      });
      function relabel(){ ansLbl.textContent = M().ans; calc.input.placeholder = M().ph; syncHints(); indSel.node.style.display = makeBtn.node.style.display = mode === "weak" ? "" : "none"; }
      reagentBtns.node.style.marginTop = "4px";
      relabel(); showConc(); draw();
    }
  });
})();

/* ───────────── THERMOMETRY: ENTHALPY CHANGES ───────────── */
(function(){
  const C = 4.18, MR = { K2CO3:138.2, KHCO3:100.1 };
  const EM = {
    neut:{ short:"Neutralisation", act:"Pour in 25.0 cm³ NaOH", cup:"25.0 cm³ of 2.00 mol dm⁻³ HCl", add:"25.0 cm³ of 2.00 mol dm⁻³ NaOH",
      ans:"ΔH neutralisation / kJ mol⁻¹", ph:"e.g. −56",
      how:"q = m c ΔT with m = 50.0 g (both solutions) and c = 4.18 J g⁻¹ K⁻¹. n(H₂O) = 0.0500 mol. ΔH = −q ÷ n, in kJ mol⁻¹." },
    disp:{ short:"Zn + CuSO₄", act:"Add zinc powder", cup:"25.0 cm³ of 0.500 mol dm⁻³ CuSO₄", add:"about 6 g zinc powder (excess)",
      ans:"ΔH for Zn + CuSO₄ / kJ mol⁻¹", ph:"e.g. −210",
      how:"Extrapolate the cooling line back to the time of mixing to find ΔT. q = 25.0 × 4.18 × ΔT; n(CuSO₄) = 0.0125 mol; ΔH = −q ÷ n." },
    hess:{ short:"Hess's law", act:"Tip in the solid", cup:"30.0 cm³ of 2.0 mol dm⁻³ HCl (excess)", add:"about 3 g of solid, weighed by difference",
      ans:"ΔH for 2KHCO₃ → K₂CO₃ + CO₂ + H₂O / kJ mol⁻¹", ph:"e.g. +80",
      how:"For each solid ΔH = −(30.0 × 4.18 × ΔT) ÷ n, with n = mass ÷ Mr. ΔH₁: K₂CO₃ + 2HCl; ΔH₂: KHCO₃ + HCl. The decomposition is 2ΔH₂ − ΔH₁." },
    ttit:{ short:"Thermometric titration", act:"Add 5.00 cm³ NaOH", cup:"25.0 cm³ of HCl of unknown concentration", add:"2.00 mol dm⁻³ NaOH from a burette",
      ans:"Concentration of the HCl / mol dm⁻³", ph:"e.g. 1.85",
      how:"Draw a line through the rising points and one through the falling points. Where they cross is the end point volume V. c(HCl) = 2.00 × V ÷ 25.0." }
  };

  Lab.register({
    id:"as-enthalpy", subject:"chemistry", level:["as","a"], topic:"Energetics · Thermometry", interactive:true,
    title:"Enthalpy changes by thermometry",
    summary:"Polystyrene cup, thermometer and stop-clock: neutralisation, a displacement reaction with a cooling-curve extrapolation, a Hess's law pair and a thermometric titration.",
    aim:"Measure temperature changes in a polystyrene cup, use q = mcΔT to find enthalpy changes, and use graphs to correct for heat loss or to find an end point.",
    variables:{ iv:"Time (min) or volume of alkali added (cm³)", dv:"Temperature of the mixture (°C)", cv:["Same volume of solution in the cup","Stir before each reading","Lid on the cup"] },
    stageTitle:"Calorimetry bench", controlsTitle:"Experiment",
    thumb:`<svg viewBox="0 0 300 140"><path d="M120 50 L128 128 H172 L180 50 Z" fill="#F4F6FA" stroke="#A2ACBD" stroke-width="2"/><rect x="146" y="10" width="6" height="104" rx="3" fill="#fff" stroke="#A2ACBD"/><rect x="147.5" y="62" width="3" height="52" fill="#E0334A"/><path d="M200 100 l20 -40 l20 10 l20 -6" fill="none" stroke="#FF8A3D" stroke-width="3"/></svg>`,
    challenges:[
      { id:"neut",  title:"Neutralisation", text:"Find ΔH of neutralisation from your temperature rise." },
      { id:"extra", title:"Extrapolate", text:"Correct the zinc displacement ΔT for heat loss by extrapolating the cooling line." },
      { id:"hess",  title:"Hess cycle", text:"Run both potassium salts and find ΔH for the decomposition of KHCO₃." },
      { id:"ttit",  title:"Thermometric end point", text:"Find the acid concentration from the intersection of two lines." },
      { id:"unc",   title:"Uncertainty in ΔT", text:"Calculate the percentage uncertainty in a temperature change." }
    ],
    columns:[{key:"set",label:"Run · section"},{key:"m",label:"Mass of solid / g",dp:2},{key:"t",label:"t / min",dp:2},{key:"V",label:"NaOH added / cm³",dp:2},{key:"T",label:"T / °C",dp:1}],
    series:"set",
    graph:{ x:["t","V"], y:["T"], fit:"none" },
    questions:[
      { q:"Why is the temperature recorded for a few minutes before the zinc is added?",
        a:"To establish a steady starting temperature. The best-fit line through these points is extended to the time of mixing." },
      { q:"Why is the cooling line extrapolated back to the time of mixing?",
        a:"Heat is lost to the surroundings while the reaction is still going on, so the highest temperature reached is lower than it would be with no heat loss. Extrapolating estimates the temperature at the instant of mixing as if no heat were lost." },
      { q:"State two assumptions made when calculating q = mcΔT.",
        a:"The solution has the density of water (1.00 g cm⁻³) and the specific heat capacity of water (4.18 J g⁻¹ K⁻¹); the cup absorbs no heat; the mass of a solid added is ignored." },
      { q:"The thermometer reads to ±0.5 °C. What is the percentage uncertainty in a temperature rise of 12.5 °C?",
        a:"Two readings, so ΔT is ±1.0 °C. 1.0 ÷ 12.5 × 100 = 8.0%." },
      { q:"Suggest two improvements to the calorimetry.",
        a:"Use a lid and stand the cup in a beaker (or use a vacuum flask) to cut heat loss; use a thermometer graduated in 0.2 °C (or a data logger) to reduce the reading uncertainty; use larger amounts to give a larger ΔT." },
      { q:"Why can ΔH for 2KHCO₃ → K₂CO₃ + CO₂ + H₂O not be measured directly?",
        a:"The decomposition needs strong heating and does not happen at a measurable temperature in a cup. Both salts react quickly with acid, so Hess’s law gives it indirectly: ΔH = 2ΔH₂ − ΔH₁." },
      { q:"In a thermometric titration, why does the temperature fall after the end point?",
        a:"No more acid is left to react, so no more heat is released. The cooler alkali being added and heat loss to the surroundings lower the temperature." }
    ],
    setup(ctx){
      const Tamb = Kit.round(19.5 + Math.random()*3, 2);
      const H = { neut:-(54.5 + Math.random()*2.5), disp:-(200 + Math.random()*20), K2CO3:-(31 + Math.random()*4), KHCO3:23 + Math.random()*4 };
      const cHCl = Kit.round(1.6 + Math.random()*.6, 3);
      let mode = "neut", solid = "K2CO3", speed = 5, auto = false, run = Math.max(0, ...ctx.rows().map(r => +String(r.set).replace(/\D.*$/, "") || 0));
      let S;                                       // the current run
      const k = .0007;
      function newRun(){
        run++;
        const mass = mode === "hess" ? Kit.round(2.85 + Math.random()*.35, 2) : null;
        S = { label:`Run ${run} ${EM[mode].short}${mode === "hess" ? " (" + (solid === "K2CO3" ? "K₂CO₃" : "KHCO₃") + ")" : ""}`, mode, solid,
          T:Tamb + (Math.random() - .5)*.3, t:0, on:false, tAdd:null, src:[], m: mode === "hess" ? 30 : 25, V:0, nAcid: mode === "ttit" ? cHCl*.025 : 0,
          bottle:Kit.round(10.5 + Math.random()*2, 2), mass, resid:mode === "hess" ? Kit.round(.01 + Math.random()*.03, 2) : 0, prog:0, lastT:null, nextAuto:0 };
        S.bottle0 = S.bottle + (mass || 0) + S.resid;
      }
      newRun();

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="th-svg"><defs>${Kit.DEFS}<clipPath id="th-cup"><path d="M190 230 L204 440 H316 L330 230 Z"/></clipPath></defs>${Kit.bench(960, 480)}
        <g id="th-scene"></g><g id="th-lens"></g><text x="24" y="30" class="k-status" id="th-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#th-svg"), $ = s => svg.querySelector(s);
      const therm = Kit.thermometer("th-th", 262, 60, 330, 0, 60, 10);
      const mmss = t => `${Math.floor(t/60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

      function cupColour(){
        if(S.mode === "disp"){ const p = S.prog; return `rgba(${ChemKit.mix([70,140,225],[215,228,240], p)},${.7 - .4*p})`; }
        return "rgba(200,220,240,.45)";
      }
      function draw(){
        let s = `<path d="M170 210 V470 Q170 480 180 480 H340 Q350 480 350 470 V210" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
        s += `<rect x="180" y="${S.m > 40 ? 280 : 330}" width="160" height="200" fill="${cupColour()}" clip-path="url(#th-cup)"/>`;
        if(S.mode === "disp" && S.tAdd !== null) for(let i = 0; i < 26; i++) s += `<circle cx="${212 + (i*37) % 96}" cy="${432 - (i % 4)*3}" r="2.6" fill="${S.prog > .5 ? "#B5652B" : "#8E959E"}" clip-path="url(#th-cup)"/>`;
        if(S.mode === "hess" && S.tAdd !== null && S.t - S.tAdd < 60) for(let i = 0; i < 10; i++) s += `<circle cx="${215 + (i*29) % 90}" cy="${350 + (i*17) % 80}" r="2.4" fill="none" stroke="var(--txt2)" clip-path="url(#th-cup)"><animate attributeName="cy" from="${430 - i*6}" to="${335}" dur="${.8 + i*.07}s" repeatCount="indefinite"/></circle>`;
        s += `<path d="M190 230 L204 440 H316 L330 230 Z" fill="rgba(250,250,252,.5)" stroke="#C9CDD6" stroke-width="2"/><rect x="184" y="222" width="152" height="10" rx="3" fill="#F4F6FA" stroke="#C9CDD6"/>
          <text x="260" y="500" text-anchor="middle" class="k-lbl">polystyrene cup with lid, in a beaker</text>${therm.svg}`;
        if(S.mode === "ttit") s += `<rect x="372" y="40" width="16" height="230" rx="3" fill="url(#k-glass)" stroke="var(--txt2)"/><rect x="374" y="${50 + S.V*4}" width="12" height="${Math.max(0, 210 - S.V*4)}" fill="rgba(200,215,235,.6)"/>
          <path d="M376 270 L378 300 H382 L384 270" fill="none" stroke="var(--txt2)"/><path d="M380 300 Q380 320 330 330" fill="none" stroke="var(--txt3)" stroke-dasharray="3 3"/><text x="300" y="34" class="k-lbl">NaOH 2.00 mol dm⁻³ · added ${S.V.toFixed(2)} cm³</text>`;
        else s += `<g transform="translate(420 330)"><rect width="200" height="96" rx="10" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="12" y="22" class="k-tag">${S.tAdd === null ? "To add" : "Added at " + mmss(S.tAdd)}</text>
          <text x="12" y="44" class="k-lbl">${ctx.esc(EM[S.mode].add)}</text>${S.mode === "hess" ? `<text x="12" y="66" class="k-lbl">bottle + solid: ${S.bottle0.toFixed(2)} g</text><text x="12" y="84" class="k-lbl">bottle after tipping: ${S.tAdd === null ? "—" : (S.bottle + S.resid).toFixed(2) + " g"}</text>` : ""}</g>`;
        s += `<g transform="translate(420 60)"><rect width="200" height="80" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="12" y="22" style="font:700 9px Inter;fill:#9CA3AF">STOP-CLOCK  min:s</text><text x="186" y="62" text-anchor="end" class="k-lcd" style="font-size:28px">${mmss(S.t)}</text></g>`;
        s += `<g transform="translate(420 160)"><rect width="200" height="150" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="12" y="22" class="k-tag">${ctx.esc(S.label)}</text>
          ${ChemKit.lines("in the cup: " + EM[S.mode].cup, 34, 12, 46, 16)}
          <text x="12" y="90" class="k-lbl">room temperature ≈ ${Math.round(Tamb)} °C</text><text x="12" y="112" class="k-lbl">readings this run: ${ctx.rows().filter(r => r.set.startsWith(S.label)).length}</text>
          <text x="12" y="134" class="k-lbl">speed ×${speed}${auto ? " · auto-reading every 0.5 min" : ""}</text></g>`;
        $("#th-scene").innerHTML = s;
        therm.set(svg, S.T);
        $("#th-lens").innerHTML = ChemKit.lens({ id:"th-l", cx:770, cy:220, r:110, S:30, value:S.T, minor:1, major:1, down:false, tube:6, flat:true, liquid:"#E0334A", label:"magnifier on the thermometer (graduated in 1 °C)" })
          + `<line x1="270" y1="${60 + 330 - (S.T/60)*330}" x2="660" y2="220" stroke="var(--accent)" stroke-dasharray="3 3"/>`;
        $("#th-status").textContent = S.mode === "ttit" ? (S.V ? "Stir, read the highest temperature, then add the next portion" : "Read the starting temperature, then add NaOH in 5.00 cm³ portions")
          : !S.on ? "Start the clock and read the temperature every 0.5 min" : S.tAdd === null ? "Take steady readings, then add the reactant at about 2.5–3 min" : "Keep reading every 0.5 min as the mixture cools";
      }

      function step(dt){
        const n = Math.ceil(dt/.5), h = dt/n;
        for(let i = 0; i < n; i++){
          let P = 0;
          S.src.forEach(q => { const a = S.t - q.t0; if(a >= 0) P += q.Q/q.tau*Math.exp(-a/q.tau); });
          S.T += (P/(S.m*C) - k*(S.T - Tamb))*h;
          S.t += h;
        }
        if(S.mode === "disp" && S.tAdd !== null) S.prog = 1 - Math.exp(-(S.t - S.tAdd)/22);
      }
      ctx.frame(dt => {
        if(S.on || S.mode === "ttit"){ step(dt*(S.mode === "ttit" ? 2 : speed));
          if(auto && S.mode !== "ttit" && S.t >= S.nextAuto){ rec(Math.round(S.T*2)/2, Kit.round(S.nextAuto/60, 2), true); S.nextAuto += 30; } }
        draw();
      });

      function rec(T, tmin, quiet){
        let sect;
        if(S.mode === "ttit"){ sect = S.lastT === null || T >= S.lastT - .25 ? "rising" : "falling"; S.lastT = Math.max(S.lastT === null ? -99 : S.lastT, T); }
        else sect = S.tAdd === null ? "before" : "after";
        ctx.record({ set:`${S.label} · ${sect}`, m:S.mode === "hess" ? Kit.round(S.mass, 2) : "", t:S.mode === "ttit" ? "" : tmin, V:S.mode === "ttit" ? S.V : "", T }, quiet);
      }

      const modeSeg = ctx.seg({ label:"Experiment", value:mode, options:Object.keys(EM).map(k => [k, EM[k].short]), onChange(v){ mode = v; newRun(); relabel(); draw(); } });
      const solidSeg = ctx.seg({ label:"Solid (Hess's law)", value:solid, options:[["K2CO3","K₂CO₃"],["KHCO3","KHCO₃"]], onChange(v){ solid = v; if(mode === "hess"){ newRun(); relabel(); draw(); } } });
      ctx.seg({ label:"Clock speed", value:5, options:[[1,"×1"],[5,"×5"],[10,"×10"]], onChange(v){ speed = v; } });
      ctx.seg({ label:"Readings", value:false, options:[[false,"I read the thermometer"],[true,"Auto every 0.5 min"]], onChange(v){ auto = v; S.nextAuto = Math.ceil(S.t/30)*30; } });
      const [actBtn] = ctx.buttons([{ label:"Start clock", primary:true, onClick(){
        if(S.mode === "ttit"){
          if(S.V >= 50) return ctx.toast("That is enough — 50 cm³ added");
          const nAdd = 2.00*5/1000, mAdd = 5, Tn = (S.m*S.T + mAdd*Tamb)/(S.m + mAdd);
          S.m += mAdd; S.T = Tn; S.V = Kit.round(S.V + 5, 2);
          const react = Math.min(nAdd, S.nAcid); S.nAcid -= react;
          if(react > 0) S.src.push({ t0:S.t, Q:react*(-H.neut)*1000, tau:3 });
          return;
        }
        if(!S.on){ S.on = true; S.nextAuto = 0; actBtn.textContent = EM[S.mode].act; return; }
        if(S.tAdd !== null) return ctx.toast("Already added — keep taking readings");
        S.tAdd = S.t;
        if(S.mode === "neut"){ S.T = (S.T*25 + Tamb*25)/50; S.m = 50; S.src.push({ t0:S.t, Q:.0500*(-H.neut)*1000, tau:2.5 }); }
        if(S.mode === "disp") S.src.push({ t0:S.t, Q:.0125*(-H.disp)*1000, tau:22 });
        if(S.mode === "hess"){ const n = S.mass/MR[S.solid]; S.src.push({ t0:S.t, Q:-n*H[S.solid]*1000, tau:14 }); }
        actBtn.textContent = "Added ✓";
      } }, { label:"Empty cup · new run", onClick(){ newRun(); relabel(); draw(); } }]);

      Kit.reading(ctx, "Thermometer reading / °C (to 0.5 °C)", "e.g. 21.5", () => S.mode !== "ttit" && !S.on ? null : S.T, .5, v => {
        rec(Kit.round(v, 1), Kit.round(S.t/60, 2));
      });

      /* analysis from the student's own rows */
      const rowsOf = lbl => ctx.rows().filter(r => String(r.set).startsWith(lbl + " · "));
      const latest = pred => { const labels = [...new Set(ctx.rows().map(r => String(r.set).split(" · ")[0]))].filter(pred); return labels.length ? labels[labels.length - 1] : null; };
      function deltaT(lbl){
        const rs = rowsOf(lbl), b = rs.filter(r => r.set.endsWith("before")), a = rs.filter(r => r.set.endsWith("after"));
        if(!b.length || !a.length) return null;
        const T0 = Kit.mean(b.map(r => r.T)), ext = a.reduce((p, r) => Math.abs(r.T - T0) > Math.abs(p.T - T0) ? r : p);
        return { T0, ext:ext.T, dT:ext.T - T0, a, b };
      }
      let lastDT = null;
      function answerFor(v){
        const m = mode;
        if(m === "neut"){
          const l = latest(x => x.includes("Neutralisation")); const d = l && deltaT(l); if(!d) return [false, "Record readings before and after adding the NaOH."];
          lastDT = Math.abs(d.dT); const want = -(50*C*d.dT)/.0500/1000;
          if(Math.abs(v - want)/Math.abs(want) <= .03){ ctx.complete("neut"); return [true, `Correct from your data: ΔT = ${d.dT.toFixed(1)} °C, q = ${(50*C*d.dT).toFixed(0)} J, ΔH = ${want.toFixed(1)} kJ mol⁻¹.`]; }
        }
        if(m === "disp"){
          const l = latest(x => x.includes("Zn")); const d = l && deltaT(l); if(!d) return [false, "Record readings before and after adding the zinc."];
          const ai = d.a.indexOf(d.a.reduce((p, r) => r.T > p.T ? r : p)), cool = d.a.slice(ai).map(r => [r.t, r.T]);
          if(cool.length < 3) return [false, "Record at least three readings on the cooling part of the curve."];
          const f = ctx.linFit(cool), tA = (Math.max(...d.b.map(r => r.t)) + Math.min(...d.a.map(r => r.t)))/2, Tx = f.m*tA + f.c, dT = Tx - d.T0;
          lastDT = Math.abs(dT); const want = -(25*C*dT)/.0125/1000;
          if(Math.abs(v - want)/Math.abs(want) <= .06){ ctx.complete("extra"); return [true, `Correct from your graph: extrapolated ΔT ≈ ${dT.toFixed(1)} °C (the highest reading gave only ${d.dT.toFixed(1)} °C). ΔH ≈ ${want.toFixed(0)} kJ mol⁻¹.`]; }
        }
        if(m === "hess"){
          const l1 = latest(x => x.includes("K₂CO₃")), l2 = latest(x => x.includes("KHCO₃"));
          const d1 = l1 && deltaT(l1), d2 = l2 && deltaT(l2); if(!d1 || !d2) return [false, "Do a run with each solid (readings before and after tipping it in)."];
          const m1 = rowsOf(l1)[0].m, m2 = rowsOf(l2)[0].m;
          const h1 = -(30*C*d1.dT)/(m1/MR.K2CO3)/1000, h2 = -(30*C*d2.dT)/(m2/MR.KHCO3)/1000, want = 2*h2 - h1;
          lastDT = Math.abs(d2.dT);
          if(Math.abs(v - want)/Math.abs(want) <= .06){ ctx.complete("hess"); return [true, `Correct: ΔH₁ = ${h1.toFixed(1)}, ΔH₂ = ${h2.toFixed(1)} kJ mol⁻¹, so 2ΔH₂ − ΔH₁ = ${want > 0 ? "+" : ""}${want.toFixed(1)} kJ mol⁻¹.`]; }
        }
        if(m === "ttit"){
          const l = latest(x => x.includes("Thermometric")); if(!l) return [false, "Add NaOH in portions and record the temperature after each."];
          const rs = rowsOf(l), up = rs.filter(r => r.set.endsWith("rising") && r.V > 0).map(r => [r.V, r.T]), dn = rs.filter(r => r.set.endsWith("falling")).map(r => [r.V, r.T]);
          if(up.length < 2 || dn.length < 2) return [false, "You need at least two points on each side of the peak."];
          const a = ctx.linFit(up), b = ctx.linFit(dn), Ve = (b.c - a.c)/(a.m - b.m), want = 2.00*Ve/25.0;
          if(Math.abs(v - want)/want <= .05){ ctx.complete("ttit"); return [true, `Correct from your lines: end point at ${Ve.toFixed(1)} cm³, so c = ${want.toFixed(2)} mol dm⁻³ (hidden ${cHCl.toFixed(2)}).`]; }
        }
        return [false, EM[m].how];
      }
      const ans = Kit.answer(ctx, "", "", answerFor);
      Kit.answer(ctx, "Percentage uncertainty in your last ΔT / %", "e.g. 7.5", v => {
        if(!lastDT) return [false, "Check an enthalpy answer first so your ΔT is known."];
        const p = ChemKit.pct(1.0, lastDT);
        if(Math.abs(v - p) <= .03*p + .05){ ctx.complete("unc"); return [true, `Correct: ±1.0 °C (two readings of ±0.5 °C) ÷ ${lastDT.toFixed(1)} °C × 100 = ${p.toFixed(1)}%.`]; }
        return [false, "Each thermometer reading is ±0.5 °C; ΔT uses two readings."];
      });
      function relabel(){
        ans.box.querySelector("label span").textContent = EM[mode].ans; ans.input.placeholder = EM[mode].ph;
        actBtn.textContent = mode === "ttit" ? EM.ttit.act : "Start clock";
        solidSeg.node.style.display = mode === "hess" ? "" : "none";
      }
      relabel(); draw();
    }
  });
})();
