"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMISTRY · AS LEVEL (9701 Paper 3) — part 2
   Heating to constant mass (water of crystallisation, carbonate) ·
   Gas collection (Ar of Mg, Mr of a carbonate) ·
   Thiosulfate clock reaction (concentration and temperature)
══════════════════════════════════════════════════════════════════ */

/* ───────────── HEATING TO CONSTANT MASS ───────────── */
(function(){
  const SAMPLES = {
    mgso4:{ name:"FA 7 · MgSO₄·xH₂O", x:7, anh:120.4, kind:"hydrate", col:[245,245,245], colEnd:[250,250,250] },
    cuso4:{ name:"FA 8 · CuSO₄·xH₂O", x:5, anh:159.6, kind:"hydrate", col:[60,130,220], colEnd:[236,236,232], decomp:true },
    bacl2:{ name:"FA 9 · BaCl₂·xH₂O", x:2, anh:208.2, kind:"hydrate", col:[245,245,245], colEnd:[250,250,250] },
    xco3: { name:"FA 10 · Group 2 carbonate XCO₃", Mr:84.3, kind:"carbonate", col:[240,240,236], colEnd:[248,248,244] }
  };
  Lab.register({
    id:"as-heating", subject:"chemistry", level:["as","a"], topic:"Stoichiometry · Gravimetric analysis", interactive:true,
    title:"Heating to constant mass",
    summary:"Weigh a crucible, heat a hydrated salt or a carbonate, cool, reweigh and repeat to constant mass. Find x in a hydrate or the Mr of a carbonate.",
    aim:"Use mass changes on heating to find the number of moles of water of crystallisation in a hydrated salt, or the relative formula mass of a carbonate.",
    variables:{ iv:"Number of heatings", dv:"Mass of crucible and contents (g)", cv:["Same crucible and lid","Cool before every weighing","Same balance"] },
    stageTitle:"Crucible, tripod and balance", controlsTitle:"Procedure",
    thumb:`<svg viewBox="0 0 300 140"><path d="M120 50 h60 l-8 40 h-44 z" fill="#E7E2D8" stroke="#A2ACBD" stroke-width="2"/><path d="M130 58 h40 l-4 20 h-32z" fill="#4C8FE0"/><path d="M138 128 q12 -40 24 0" fill="#4A7DFF" opacity=".7"/><path d="M100 96 h100 M110 96 l-10 34 M190 96 l10 34" stroke="#A2ACBD" stroke-width="3"/></svg>`,
    challenges:[
      { id:"const", title:"Constant mass", text:"Heat until two successive weighings agree within 0.01 g." },
      { id:"x",     title:"Water of crystallisation", text:"Find x for one of the hydrated salts." },
      { id:"mr",    title:"Identify the carbonate", text:"Find the Mr of XCO₃ and identify X." },
      { id:"unc",   title:"Uncertainty", text:"Calculate the percentage uncertainty in a mass loss." },
      { id:"err",   title:"Spot the errors", text:"Find out what goes wrong if you weigh while hot, heat a hydrate strongly with no lid, or overheat CuSO₄." }
    ],
    columns:[{key:"run",label:"Run"},{key:"step",label:"Weighing"},{key:"mass",label:"Mass / g",dp:2},{key:"note",label:"Note"}],
    questions:[
      { q:"Why is the crucible heated, cooled and reweighed until the mass is constant?",
        a:"Constant mass shows that all the water (or CO₂) has been driven off, so the reaction is complete." },
      { q:"Why must the crucible cool before it is weighed?",
        a:"A hot crucible sets up convection currents that push up on the balance pan, so it reads low. Hot objects can also damage the balance." },
      { q:"Why is a lid used, and why is the hydrate heated gently at first?",
        a:"Strong heating at first makes the crystals spit, losing solid as well as water and making the mass loss too large. The lid (slightly ajar) stops solid escaping but lets water vapour out." },
      { q:"Hydrated copper(II) sulfate is heated very strongly for a long time. How does this affect the value of x?",
        a:"Anhydrous CuSO₄ decomposes (CuSO₄ → CuO + SO₃, turning black). The extra mass loss is counted as water, so x comes out too high." },
      { q:"A balance reads to 0.01 g. What is the percentage uncertainty in a mass loss of 0.85 g?",
        a:"Each reading is ±0.005 g (some schemes use ±0.01 g); the loss uses two readings, so ±0.01 g. 0.01 ÷ 0.85 × 100 = 1.2% (or 2.4% with ±0.01 g per reading)." },
      { q:"Anhydrous MgSO₄ is left to cool in the open air instead of a desiccator. Suggest the effect.",
        a:"It absorbs water vapour from the air, so the final mass is too high, the calculated mass of water too low, and x too small. Cool it in a desiccator." }
    ],
    setup(ctx){
      let sk = "mgso4", run = Math.max(0, ...ctx.rows().map(r => +String(r.run).replace(/\D/g, "") || 0)), heat = "gentle", lid = "on";
      let S;
      function newRun(){
        run++;
        S = { run:`Run ${run}`, sample:sk, cruc:Kit.round(17.5 + Math.random()*6, 3), m0:0, w:1, d:0, carb:1, hot:false, onBalance:true, heats:0, spat:0, last:null };
      }
      newRun();
      const sp = () => SAMPLES[S.sample];
      function mass(){
        if(!S.m0) return S.cruc;
        const s = sp();
        if(s.kind === "hydrate"){
          const molar = s.anh + 18.02*s.x, n = S.m0/molar;
          const water = n*18.02*s.x*S.w, anh = n*s.anh*(1 - S.d*.4985);   // CuSO₄ → CuO loses 49.85% of its mass
          return S.cruc + anh + water - S.spat;
        }
        const n = S.m0/s.Mr; return S.cruc + n*(s.Mr - 44.01*(1 - S.carb)) - S.spat;
      }
      const reading = () => Kit.round(mass() - (S.hot ? .035 + Math.random()*.02 : 0), 2);

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="hm-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 460)}<g id="hm-scene"></g><text x="24" y="30" class="k-status" id="hm-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#hm-svg"), $ = s => svg.querySelector(s);
      let flame = 0;
      function crucible(x, y){
        const s = sp(), f = s.kind === "hydrate" ? 1 - S.w : 1 - S.carb;
        let col = ChemKit.mix(s.col, s.colEnd, f); if(S.d > .05) col = ChemKit.mix(col, [30,30,30], Math.min(1, S.d*3));
        return `<g transform="translate(${x} ${y})"><path d="M-40 0 h80 l-9 46 h-62 z" fill="${S.hot ? "#E9B98F" : "#E7E2D8"}" stroke="#A39C8E" stroke-width="2"/>
          ${S.m0 ? `<path d="M-33 14 h66 l-5 24 h-56 z" fill="rgb(${col})"/>` : ""}
          ${lid === "on" ? `<path d="M-46 -6 h92 v6 h-92z" fill="#E7E2D8" stroke="#A39C8E" transform="rotate(-6)"/>` : ""}
          ${S.hot ? `<path d="M-30 -18 q-6 -12 0 -22 M0 -20 q-6 -12 0 -22 M28 -18 q-6 -12 0 -22" stroke="#FF8A3D" stroke-width="2" fill="none" opacity=".6"/>` : ""}</g>`;
      }
      function draw(){
        let s = `<g transform="translate(250 0)"><path d="M-90 300 h180 M-80 300 l-24 160 M80 300 l24 160 M0 300 v160" stroke="url(#k-metalv)" stroke-width="7"/>
          <path d="M-50 300 L0 280 L50 300" stroke="#D8CFC0" stroke-width="5" fill="none"/>
          <rect x="-14" y="380" width="28" height="80" fill="url(#k-metal)"/><rect x="-40" y="452" width="80" height="10" rx="3" fill="url(#k-metal)"/>`;
        if(flame > 0) s += `<path d="M0 ${380 - (heat === "strong" ? 85 : 55)} C-22 340 -18 380 -10 380 H10 C18 380 22 340 0 ${380 - (heat === "strong" ? 85 : 55)}Z" fill="${heat === "strong" ? "#4A7DFF" : "#FFB347"}" opacity=".8"/>`;
        s += `</g>`;
        if(!S.onBalance) s += crucible(250, 254);
        s += ChemKit.balance(580, 300, S.onBalance ? reading() : 0.00, "two-decimal-place balance");
        if(S.onBalance) s += crucible(665, 268);
        s += `<g transform="translate(560 60)"><rect width="370" height="170" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="14" y="24" class="k-tag">${ctx.esc(S.run)} · ${ctx.esc(sp().name)}</text>
          <text x="14" y="50" class="k-lbl">heatings so far: ${S.heats}  ·  crucible is ${S.hot ? "HOT" : "cool"}</text>
          <text x="14" y="72" class="k-lbl">contents: ${S.m0 ? (sp().kind === "hydrate" ? (S.w > .98 ? "hydrated crystals" : S.w > .02 ? "partly dehydrated" : S.d > .05 ? "anhydrous, darkening" : "anhydrous") : (S.carb > .98 ? "carbonate" : S.carb > .02 ? "partly decomposed" : "oxide")) : "none yet"}</text>
          <text x="14" y="94" class="k-lbl">burner: ${heat} heat · lid ${lid}</text>
          ${S.last !== null ? `<text x="14" y="120" class="k-lbl">last recorded mass: ${S.last.toFixed(2)} g</text>` : ""}
          <text x="14" y="150" class="k-lbl">${sp().kind === "carbonate" ? "XCO₃(s) → XO(s) + CO₂(g)" : "MX·xH₂O(s) → MX(s) + xH₂O(g)"}</text></g>`;
        $("#hm-scene").innerHTML = s;
        $("#hm-status").textContent = !S.m0 ? "Weigh the empty crucible and lid, then add the sample" : S.heats === 0 ? "Weigh the crucible with the sample, then heat it" : S.hot ? "Let the crucible cool before weighing" : "Weigh it — then heat again until the mass is constant";
        ctx.readout([["Sample", sp().name], ["Heatings", S.heats], ["Crucible", S.hot ? "hot" : "cool", S.hot ? "warn" : ""]]);
      }
      ctx.frame(dt => { if(flame > 0){ flame -= dt; if(flame <= 0) draw(); } });

      function heatFor(){
        if(!S.m0) return ctx.toast("Add the sample first");
        const s = sp(), strong = heat === "strong", mins = 2;
        S.onBalance = false; S.hot = true; S.heats++; flame = 1.6;
        if(s.kind === "hydrate"){
          if(strong && lid === "off" && S.w > .7){ S.spat += Kit.round(.02 + Math.random()*.04, 3); ctx.toast("Spitting! Some crystals jumped out of the crucible"); markErr("spit"); }
          S.w *= Math.exp(-(strong ? 1.1 : .45)*mins);
          if(S.w < .002) S.w = 0;
          if(s.decomp && strong && S.w < .05){ S.d = Math.min(1, S.d + .03*mins); if(S.d > .05){ ctx.toast("The solid is turning black — CuSO₄ is decomposing"); markErr("decomp"); } }
        }else{
          S.carb *= Math.exp(-(strong ? .9 : .04)*mins); if(S.carb < .002) S.carb = 0;
          if(!strong) ctx.toast("Gentle heat barely decomposes a carbonate — use strong heat");
        }
        draw();
      }
      const errs = new Set();
      function markErr(k){ errs.add(k); if(errs.size >= 2) ctx.complete("err"); }

      ctx.select({ label:"Sample", value:sk, options:Object.keys(SAMPLES).map(k => [k, SAMPLES[k].name]), onChange(v){ sk = v; newRun(); draw(); } });
      ctx.seg({ label:"Burner", value:heat, options:[["gentle","Gentle heat"],["strong","Strong heat"]], onChange(v){ heat = v; draw(); } });
      ctx.seg({ label:"Lid", value:lid, options:[["on","Lid on (ajar)"],["off","No lid"]], onChange(v){ lid = v; draw(); } });
      ctx.buttons([
        { label:"Add sample (≈2 g)", onClick(){ if(S.m0) return ctx.toast("The sample is already in"); if(!ctx.rows().some(r => r.run.startsWith(S.run + " ·"))) return ctx.toast("Weigh the empty crucible and lid first");
          S.m0 = Kit.round(1.8 + Math.random()*.6, 3); S.onBalance = true; draw(); } },
        { label:"Heat for 2 min", onClick:heatFor },
        { label:"Cool in desiccator", onClick(){ S.hot = false; S.onBalance = true; draw(); } }
      ]);
      ctx.buttons([{ label:"Weigh and record", primary:true, block:true, onClick(){
        S.onBalance = true;
        const m = reading(), steps = ctx.rows().filter(r => r.run === S.run);
        const step = !S.m0 ? "crucible + lid" : S.heats === 0 ? "crucible + lid + sample" : `after heating ${S.heats}`;
        if(S.hot) markErr("hot");
        ctx.record({ run:S.run + " · " + sp().name.split(" · ")[0], step, mass:m, note:S.hot ? "weighed hot!" : "" });
        const after = ctx.rows().filter(r => r.run.startsWith(S.run + " ·") && r.step.startsWith("after") && !r.note);
        if(after.length >= 2 && Math.abs(after[after.length - 1].mass - after[after.length - 2].mass) <= .01 + 1e-9){ ctx.complete("const"); ctx.toast("Constant mass reached ✓"); }
        S.last = m; draw();
      } }, { label:"New crucible · new run", onClick(){ newRun(); draw(); } }]);

      function runData(){
        const tag = S.run + " ·", rs = ctx.rows().filter(r => String(r.run).startsWith(tag));
        const e = rs.find(r => r.step === "crucible + lid"), f = rs.find(r => r.step === "crucible + lid + sample"), a = rs.filter(r => r.step.startsWith("after") && !r.note);
        if(!e || !f || !a.length) return null;
        return { empty:e.mass, full:f.mass, fin:a[a.length - 1].mass };
      }
      let lastLoss = null;
      const ans = Kit.answer(ctx, "", "", v => {
        const d = runData(); if(!d) return [false, "Record the empty crucible, the crucible with sample, and at least one cool weighing after heating — in this run."];
        const s = sp(), loss = d.full - d.fin; lastLoss = loss;
        if(s.kind === "hydrate"){
          const x = (loss/18.0)/((d.fin - d.empty)/s.anh);
          if(Math.abs(v - x) <= .03*x + .05){ ctx.complete("x"); return [true, `Correct from your masses: n(H₂O) = ${(loss/18).toFixed(4)} mol, n(salt) = ${((d.fin - d.empty)/s.anh).toFixed(4)} mol, x = ${x.toFixed(2)} (accepted value ${s.x}).`]; }
          return [false, "Mass of water = (crucible + sample) − final mass. Mass of anhydrous salt = final − empty crucible. x = (mol water) ÷ (mol anhydrous salt)."];
        }
        const Mr = (d.full - d.empty)/(loss/44.0);
        if(Math.abs(v - Mr)/Mr <= .04){ ctx.complete("mr"); return [true, `Correct: Mr = ${Mr.toFixed(1)}, so Ar(X) ≈ ${(Mr - 60).toFixed(1)} — X is magnesium (MgCO₃, Mr 84.3).`]; }
        return [false, "Mass lost = CO₂. n(CO₂) = loss ÷ 44.0 = n(XCO₃). Mr = mass of XCO₃ ÷ n."];
      });
      Kit.answer(ctx, "Percentage uncertainty in your mass loss / %", "e.g. 1.2", v => {
        if(lastLoss === null) return [false, "Check your x or Mr answer first so the mass loss is known."];
        const p1 = ChemKit.pct(.01, lastLoss), p2 = ChemKit.pct(.02, lastLoss);
        if([p1, p2].some(p => Math.abs(v - p) <= .03*p + .02)){ ctx.complete("unc"); return [true, `Correct: two balance readings, ±0.005 g each (±0.01 g total) → ${p1.toFixed(2)}%, or ±0.01 g each → ${p2.toFixed(2)}%.`]; }
        return [false, "A mass loss is the difference of two balance readings, each ±0.005 g on a two-decimal-place balance."];
      });
      const relabel = () => { ans.box.querySelector("label span").textContent = sp().kind === "hydrate" ? "Value of x in the hydrate" : "Mr of XCO₃"; ans.input.placeholder = sp().kind === "hydrate" ? "e.g. 6.9" : "e.g. 85"; };
      ctx.controls.querySelector("select").addEventListener("change", relabel);
      relabel(); draw();
    }
  });
})();

/* ───────────── GAS COLLECTION ───────────── */
(function(){
  const GS = {
    mg:   { name:"Magnesium ribbon + excess HCl", gas:"H₂", M:24.3, lo:.04, hi:.12, tau:14, sol:0 },
    xco3: { name:"FA 11 (XCO₃) + excess HCl", gas:"CO₂", lo:.15, hi:.45, tau:7, sol:.03 },
    mix:  { name:"FA 17 (Na₂CO₃/NaCl mixture) + excess HCl", gas:"CO₂", lo:.20, hi:.60, tau:6, sol:.03 }
  };
  const XS = [["Mg", 84.3], ["Ca", 100.1], ["Sr", 147.6]];

  function lensH(o){
    const r = o.r, S = o.S, value = o.value, span = r/S + o.minor;
    const k0 = Math.ceil((value - span)/o.minor), k1 = Math.floor((value + span)/o.minor), per = Math.round(o.major/o.minor);
    let s = `<defs><clipPath id="${o.id}-c"><circle r="${r}"/></clipPath></defs><g transform="translate(${o.cx} ${o.cy})"><circle r="${r}" fill="#F4F7FB"/><g clip-path="url(#${o.id}-c)">
      <rect x="${-r}" y="-22" width="${r}" height="44" fill="rgba(200,215,235,.5)"/><rect x="0" y="-26" width="10" height="52" fill="#64748B"/>
      <line x1="${-r}" y1="-26" x2="${r}" y2="-26" stroke="#9AA3B2" stroke-width="2"/><line x1="${-r}" y1="26" x2="${r}" y2="26" stroke="#9AA3B2" stroke-width="2"/>`;
    for(let k = k0; k <= k1; k++){ const x = (k*o.minor - value)*S, big = k % per === 0, mid = k % (per/2) === 0;
      s += `<line x1="${x}" y1="26" x2="${x}" y2="${26 - (big ? 22 : mid ? 15 : 9)}" stroke="#334155" stroke-width="${big ? 1.6 : 1}"/>`;
      if(big) s += `<text x="${x}" y="46" text-anchor="middle" style="font:600 13px 'JetBrains Mono';fill:#334155">${Math.round(k*o.minor)}</text>`; }
    return s + `</g><circle r="${r}" fill="none" stroke="var(--accent)" stroke-width="3"/><text y="${r + 18}" text-anchor="middle" class="k-lbl">${o.label}</text></g>`;
  }

  Lab.register({
    id:"as-gasvolume", subject:"chemistry", level:["as","a"], topic:"Stoichiometry · Molar gas volume", interactive:true,
    title:"Gas collection: Ar and Mr from gas volumes",
    summary:"React weighed samples with excess acid and collect the gas in a gas syringe or over water. Plot volume against mass to find Ar of magnesium, Mr of an unknown carbonate, or the percentage of sodium carbonate in a mixture.",
    aim:"Use the volume of gas produced at room temperature and pressure (24.0 dm³ mol⁻¹) to find the relative atomic mass of magnesium, the identity of a Group 2 carbonate and the composition of a carbonate mixture.",
    variables:{ iv:"Mass of solid (g)", dv:"Volume of gas collected (cm³)", cv:["Acid in excess","Same temperature and pressure","Wait until no more gas is given off"] },
    stageTitle:"Gas collection", controlsTitle:"Procedure",
    thumb:`<svg viewBox="0 0 300 140"><path d="M60 50 v20 l-25 50 h60 l-25 -50 v-20z" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M70 50 V30 H150" stroke="#A2ACBD" stroke-width="3" fill="none"/><rect x="150" y="22" width="110" height="18" rx="4" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="152" y="24" width="60" height="14" fill="#9EC9F0" opacity=".6"/></svg>`,
    challenges:[
      { id:"five", title:"Five masses", text:"Record the gas volume for five different masses of one solid." },
      { id:"ar",   title:"Ar of magnesium", text:"Use the gradient of V against m to find Ar(Mg)." },
      { id:"mr",   title:"Identify X", text:"Find the Mr of FA 11 and identify the Group 2 metal." },
      { id:"pct",  title:"Composition of a mixture", text:"Find the percentage by mass of Na₂CO₃ in FA 17." },
      { id:"unc",  title:"Uncertainty", text:"Calculate the percentage uncertainty in one gas volume." },
      { id:"loss", title:"Lost gas", text:"Compare dropping the solid in with tipping it from a small tube inside the sealed flask." }
    ],
    columns:[{key:"s",label:"Reaction"},{key:"how",label:"Collection"},{key:"m",label:"m / g",dp:2},{key:"V",label:"V / cm³",dp:1}],
    series:"s",
    graph:{ x:["m"], y:["V"], fit:"linear" },
    questions:[
      { q:"Why should the graph of V against m be a straight line through the origin?",
        a:"With excess acid, the moles of gas are proportional to the moles (so the mass) of the solid. Zero mass gives zero gas." },
      { q:"How do you get Ar(Mg) from the gradient?",
        a:"Mg + 2HCl → MgCl₂ + H₂, so n(H₂) = n(Mg). Gradient = V/m = 24 000 ÷ Ar, so Ar = 24 000 ÷ gradient (V in cm³, m in g)." },
      { q:"Why is the volume of CO₂ collected over water usually too small?",
        a:"Carbon dioxide is slightly soluble in water. Use a gas syringe, or water saturated with CO₂." },
      { q:"Suggest why some gas may be lost and how to prevent it.",
        a:"Gas escapes in the moment between adding the solid and inserting the bung. Put the solid in a small tube inside the flask, seal, then tip it over." },
      { q:"Why must you wait before taking the final reading?",
        a:"The reaction must be complete, and the exothermic reaction warms the gas, so it expands. Let it return to room temperature." },
      { q:"A 100 cm³ gas syringe is graduated every 1 cm³. What is the percentage uncertainty in 64.0 cm³?",
        a:"Half a division: ±0.5 cm³. 0.5 ÷ 64.0 × 100 = 0.78%." },
      { q:"FA 17 is a mixture of Na₂CO₃ and NaCl. How do you get the percentage of Na₂CO₃ from the gradient of V against m?",
        a:"Only Na₂CO₃ gives CO₂: n(CO₂) = n(Na₂CO₃). Mass of Na₂CO₃ in 1 g = gradient ÷ 24 000 × 106.0. Percentage = that × 100." },
      { q:"Is losing gas before the bung goes in a random or a systematic error? What about CO₂ dissolving in the water?",
        a:"Both are systematic: every volume is too small, so the gradient and Ar or Mr are biased the same way each time. Random errors (reading the scale, small mass errors) scatter points either side of the line and are reduced by repeats." }
    ],
    setup(ctx){
      const Mg = 24.3 + (Math.random() - .5)*.2, X = XS[Math.floor(Math.random()*XS.length)];
      const P = Kit.round(45 + Math.random()*30, 1);   // % Na₂CO₃ in FA 17
      let sk = "mg", how = "syringe", start = "drop", running = false, t = 0, Vfin = 0, Vnow = 0, m = null, boat = null;
      const R = { syringe:{ max:100, minor:1, major:10, half:.5, name:"gas syringe (100 cm³)" }, cyl:{ max:250, minor:2, major:20, half:1, name:"measuring cylinder over water (250 cm³)" } };
      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="gv-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 460)}<g id="gv-scene"></g><text x="24" y="30" class="k-status" id="gv-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#gv-svg"), $ = s => svg.querySelector(s);
      const FL = ChemKit.FLASK(150, 460, 1);
      function draw(){
        let s = `<path d="${FL}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><rect x="92" y="430" width="116" height="30" fill="rgba(200,215,235,.45)"/>`;
        if(running) for(let i = 0; i < 10; i++) s += `<circle cx="${110 + (i*23) % 80}" cy="440" r="2.4" fill="none" stroke="var(--txt2)"><animate attributeName="cy" from="455" to="425" dur="${.7 + i*.06}s" repeatCount="indefinite"/></circle>`;
        if(start === "tube" && m && !running && t === 0) s += `<rect x="160" y="390" width="12" height="36" rx="4" fill="url(#k-glass)" stroke="var(--txt2)"/><rect x="161" y="410" width="10" height="14" fill="#9AA3AD"/>`;
        s += `<rect x="134" y="356" width="32" height="14" rx="3" fill="#3A4252"/><path d="M150 356 V300 H330" stroke="var(--txt2)" stroke-width="3" fill="none"/>`;
        if(how === "syringe"){
          const px = 3.6, x0 = 340, L = 100*px;
          s += `<rect x="${x0}" y="285" width="${L + 10}" height="30" rx="5" fill="url(#k-glass)" stroke="var(--txt2)"/><rect x="${x0 + 2}" y="288" width="${Vnow*px}" height="24" fill="rgba(200,215,235,.4)"/>
            <rect x="${x0 + 2 + Vnow*px}" y="286" width="8" height="28" fill="#64748B"/><rect x="${x0 + 10 + Vnow*px}" y="296" width="${L - Vnow*px + 40}" height="8" fill="#64748B"/>`;
          for(let v = 0; v <= 100; v += 5) s += `<line x1="${x0 + 2 + v*px}" y1="315" x2="${x0 + 2 + v*px}" y2="${v % 10 ? 320 : 325}" stroke="var(--txt2)"/>${v % 20 ? "" : `<text x="${x0 + 2 + v*px}" y="338" text-anchor="middle" class="k-num">${v}</text>`}`;
          s += lensH({ id:"gv-l", cx:600, cy:150, r:90, S:26, value:Math.min(Vnow, 100), minor:1, major:10, label:"magnifier on the syringe scale" });
        }else{
          s += `<path d="M330 300 H520 V430" stroke="var(--txt2)" stroke-width="3" fill="none"/>${`<path d="${ChemKit.BEAKER(440, 460, 170, 80)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><rect x="442" y="400" width="166" height="58" fill="rgba(140,190,240,.35)"/>`}
            <rect x="500" y="90" width="44" height="360" rx="4" fill="rgba(140,190,240,.35)" stroke="var(--txt2)"/><rect x="502" y="94" width="40" height="${Vnow*1.4}" fill="var(--bg2)" opacity=".85"/>`;
          for(let v = 0; v <= 250; v += 10) s += `<line x1="544" y1="${94 + v*1.4}" x2="${v % 50 ? 538 : 532}" y2="${94 + v*1.4}" stroke="var(--txt2)"/>${v % 50 ? "" : `<text x="550" y="${98 + v*1.4}" class="k-num">${v}</text>`}`;
          s += ChemKit.lens({ id:"gv-l", cx:720, cy:200, r:90, S:12, value:Math.min(Vnow, 250), minor:2, major:10, half:10, down:true, liquid:"rgba(140,190,240,.5)", label:"magnifier on the water level" });
        }
        s += `<g transform="translate(700 348)"><rect width="240" height="104" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="12" y="22" class="k-tag">${GS[sk].name.replace(" + excess HCl", " + HCl")}</text><text x="12" y="46" class="k-lbl">boat + solid: ${boat ? boat.full.toFixed(2) + " g" : "—"}</text>
          <text x="12" y="66" class="k-lbl">boat after tipping: ${boat && t > 0 ? boat.empty.toFixed(2) + " g" : "—"}</text><text x="12" y="90" class="k-lbl">time: ${Math.floor(t)} s</text></g>`;
        $("#gv-scene").innerHTML = s;
        $("#gv-status").textContent = !m ? "Weigh a sample of the solid" : t === 0 ? "Add the solid to the acid and seal the flask" : running ? "Gas being given off…" : "Reaction over — read the volume";
        ctx.readout([["Solid", GS[sk].name], ["Mass", m ? m.toFixed(2) + " g" : "—"], ["Collecting in", R[how].name]]);
      }
      function moles(mm){ return sk === "mg" ? mm/Mg : sk === "mix" ? mm*P/100/106.0 : mm/X[1]; }
      ctx.frame(dt => {
        if(running){ t += dt*6; Vnow = Vfin*(1 - Math.exp(-t/GS[sk].tau)) - (start === "drop" ? Math.min(Vfin*.04, 3) : 0)*Math.min(1, t/2);
          if(how === "syringe" && Vnow > 100){ Vnow = 100; running = false; ctx.toast("The plunger reached the end — gas escaped. Use a smaller mass."); }
          if(t > GS[sk].tau*6){ running = false; Vnow = Math.max(0, Vnow*(1 - (how === "cyl" ? GS[sk].sol : 0))); } }
        draw();
      });
      const reset = () => { running = false; t = 0; Vnow = 0; m = null; boat = null; rb.clear(); draw(); };
      ctx.seg({ label:"Reaction", value:sk, options:[["mg","Mg ribbon"],["xco3","FA 11 carbonate"],["mix","FA 17 mixture"]], onChange(v){ sk = v; reset(); } });
      ctx.seg({ label:"Collect gas in", value:how, options:[["syringe","Gas syringe"],["cyl","Cylinder over water"]], onChange(v){ how = v; reset(); } });
      ctx.seg({ label:"Starting the reaction", value:start, options:[["drop","Drop in, then bung"],["tube","Tip from small tube"]], onChange(v){ start = v; reset(); } });
      const ms = ctx.slider({ label:"Mass to weigh out (approx.)", min:GS.mg.lo, max:GS.mg.hi, step:.01, value:.08, unit:"g" });
      ctx.buttons([{ label:"Weigh sample", onClick(){ if(running) return; reset();
          const g = GS[sk], target = Kit.clamp(ms.get(), g.lo, g.hi), mm = Kit.round(target*(1 + (Math.random() - .5)*.08), 3);
          const b = Kit.round(1.2 + Math.random()*.6, 2); boat = { full:Kit.round(b + mm, 2), empty:b }; m = Kit.round(boat.full - boat.empty, 2); draw(); } },
        { label:"Add solid & seal", primary:true, onClick(){ if(!m) return ctx.toast("Weigh a sample first"); if(running || t > 0) return;
          Vfin = moles(m)*24000; running = true; draw(); } }]);
      const relim = () => { const g = GS[sk]; ms.input.min = g.lo; ms.input.max = g.hi; ms.set((g.lo + g.hi)/2); };
      ctx.controls.querySelectorAll(".seg")[0].addEventListener("click", () => setTimeout(relim));
      const rb = Kit.reading(ctx, "Volume of gas / cm³", "e.g. 64", () => !m || running || t === 0 ? null : Vnow, { valueOf:() => R[how].half + .01 }, v => {   // tolerance follows the apparatus
        ctx.record({ s:GS[sk].name.split(" +")[0], how: (how === "syringe" ? "syringe" : "over water") + (start === "drop" ? "" : ", tube"), m, V:v });
        const mine = ctx.rows().filter(r => r.s === GS[sk].name.split(" +")[0]);
        if(new Set(mine.map(r => r.m)).size >= 5) ctx.complete("five");
        if(new Set(ctx.rows().map(r => r.how.includes("tube"))).size === 2) ctx.complete("loss");
        reset();
      });
      const fitOf = name => { const pts = ctx.rows().filter(r => r.s === name).map(r => [r.m, r.V]); return pts.length >= 3 ? { f:ctx.linFit(pts.concat([[0, 0]])), n:pts.length } : null; };
      Kit.answer(ctx, "Ar of magnesium (from your gradient)", "e.g. 24.5", v => {
        const q = fitOf("Magnesium ribbon"); if(!q) return [false, "Record at least three masses of magnesium."];
        const Ar = 24000/q.f.m;
        if(Math.abs(v - Ar)/Ar <= .03){ ctx.complete("ar"); return [true, `Correct: gradient ${q.f.m.toFixed(0)} cm³ g⁻¹ → Ar = 24 000 ÷ ${q.f.m.toFixed(0)} = ${Ar.toFixed(1)} (data-book value 24.3).`]; }
        return [false, "n(H₂) = n(Mg). Ar = 24 000 ÷ gradient of V (cm³) against m (g)."];
      });
      Kit.answer(ctx, "Mr of FA 11 (XCO₃)", "e.g. 100", v => {
        const q = fitOf("FA 11 (XCO₃)"); if(!q) return [false, "Record at least three masses of FA 11."];
        const Mr = 24000/q.f.m;
        if(Math.abs(v - Mr)/Mr <= .04){ ctx.complete("mr"); return [true, `Correct: Mr ≈ ${Mr.toFixed(0)}, so Ar(X) ≈ ${(Mr - 60).toFixed(0)}. Hidden: ${X[0]}CO₃ (Mr ${X[1]}).`]; }
        return [false, "n(CO₂) = n(XCO₃). Mr = 24 000 ÷ gradient. Then Ar(X) = Mr − 60."];
      });
      Kit.answer(ctx, "Percentage by mass of Na₂CO₃ in FA 17", "e.g. 60", v => {
        const q = fitOf("FA 17 (Na₂CO₃/NaCl mixture)"); if(!q) return [false, "Record at least three masses of FA 17."];
        const pc = q.f.m/24000*106.0*100;
        if(Math.abs(v - pc) <= .04*pc){ ctx.complete("pct"); return [true, `Correct: gradient ${q.f.m.toFixed(0)} cm³ g⁻¹ → ${ctx.sig(q.f.m/24000, 3)} mol of Na₂CO₃ per gram × 106.0 × 100 = ${pc.toFixed(1)}%. Hidden value: ${P}%.`]; }
        return [false, "Only Na₂CO₃ gives CO₂. Mass of Na₂CO₃ per gram of FA 17 = gradient ÷ 24 000 × 106.0."];
      });
      Kit.answer(ctx, "Percentage uncertainty in your last volume / %", "e.g. 0.8", v => {
        const r = ctx.rows().pop(); if(!r) return [false, "Record a volume first."];
        const half = r.how.startsWith("syringe") ? .5 : 1, p = ChemKit.pct(half, r.V);
        if(Math.abs(v - p) <= .03*p + .02){ ctx.complete("unc"); return [true, `Correct: ±${half} cm³ (half a division) ÷ ${r.V} × 100 = ${p.toFixed(2)}%.`]; }
        return [false, "Use half the smallest division of the apparatus: 0.5 cm³ for the syringe, 1 cm³ for the 250 cm³ cylinder."];
      });
      draw();
    }
  });
})();

/* ───────────── CLOCK REACTIONS: THIOSULFATE + ACID · IODINE CLOCK ───────────── */
(function(){
const RX = {
  thio:{ name:"Thiosulfate + acid", key:"Disappearing cross", k:24, vLbl:"FA 12", vSol:"FA 12 (0.150 mol dm⁻³ Na₂S₂O₃)", fixed:["FA 13 (2.00 mol dm⁻³ HCl): 10.0 cm³"],
    act:"Add 10.0 cm³ acid", start:"Start your stop-clock as you add the acid,", stop:"stop it when you can no longer see the cross.", watch:"Watching the cross from above…", done:"Cross gone — record your time" },
  iod:{ name:"Iodine clock", key:"Iodine clock", k:30, vLbl:"FA 14", vSol:"FA 14 (0.0400 mol dm⁻³ K₂S₂O₈)", fixed:["FA 15 (0.200 mol dm⁻³ KI): 10.0 cm³","FA 16 (0.0100 mol dm⁻³ Na₂S₂O₃): 5.0 cm³","starch: 1 cm³"],
    act:"Add 10.0 cm³ KI(aq)", start:"Start your stop-clock as you add the iodide,", stop:"stop it when the blue-black colour appears.", watch:"Watching for the blue-black colour…", done:"Blue-black — record your time" }
};
Lab.register({
  id:"as-clock", subject:"chemistry", level:["as","a"], topic:"Reaction kinetics · Rates", interactive:true,
  title:"Clock reactions: disappearing cross and iodine clock",
  summary:"Two Paper 3 rate experiments: thiosulfate with acid (time until the cross disappears) and the peroxydisulfate–iodide clock (time until the starch turns blue-black). Plot 1000/t against volume, then repeat at higher temperatures.",
  aim:"Investigate how concentration and temperature affect the rate of a reaction by timing a clock reaction, and deduce the order with respect to the reagent you vary.",
  variables:{ iv:"Volume of the varied solution (FA 12 or FA 14) or temperature", dv:"Time for the cross to disappear or the blue-black colour to appear, t (s)", cv:["Total volume kept the same by adding water","Same volumes of the other reagents","Same beaker, same observer"] },
  stageTitle:"View from above the beaker", controlsTitle:"Run",
  thumb:`<svg viewBox="0 0 300 140"><ellipse cx="150" cy="70" rx="56" ry="56" fill="#EDE6B8" fill-opacity=".8" stroke="#A2ACBD" stroke-width="2"/><path d="M125 45 l50 50 M175 45 l-50 50" stroke="#111" stroke-width="7" opacity=".35"/></svg>`,
  challenges:[
    { id:"five",  title:"Five concentrations", text:"Time five different volumes of thiosulfate at room temperature." },
    { id:"order", title:"Order of reaction", text:"Use your graph to deduce the order with respect to thiosulfate." },
    { id:"iodine", title:"Iodine clock", text:"Time five volumes of peroxydisulfate at room temperature and deduce its order." },
    { id:"temp",  title:"Temperature", text:"Time one mixture at three or more temperatures." },
    { id:"unc",   title:"Uncertainty", text:"Calculate the percentage uncertainty in your shortest time." }
  ],
  columns:[{key:"rx",label:"Reaction"},{key:"Vt",label:"Varied solution / cm³",dp:1},{key:"Vw",label:"Water / cm³",dp:1},{key:"T",label:"T / °C",dp:0},{key:"t",label:"t / s",dp:0},{key:"r",label:"1000/t / s⁻¹",dp:1}],
  series:"rx",
  graph:{ x:["Vt","T"], y:["r","t"], fit:"linear" },
  questions:[
    { q:"Write the equation and explain why the cross disappears.",
      a:"Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + S(s) + SO₂(g) + H₂O(l). A fine yellow precipitate of sulfur forms and makes the mixture opaque." },
    { q:"Why is the total volume kept at 50 cm³ by adding water?",
      a:"Then the concentration of thiosulfate is proportional to its volume, and the depth of liquid the observer looks through stays the same." },
    { q:"Why is 1000/t used as a measure of rate?",
      a:"Each run makes the same amount of sulfur by the time the cross disappears, so rate ∝ 1/t. Multiplying by 1000 gives convenient numbers." },
    { q:"A straight line through the origin for 1000/t against V(thiosulfate) shows what?",
      a:"Rate ∝ [S₂O₃²⁻], so the reaction is first order with respect to thiosulfate." },
    { q:"Give two limitations and an improvement.",
      a:"Judging when the cross disappears is subjective; temperature falls during warm runs; the stop-clock is started by hand. Use a light sensor/colorimeter, keep the beaker in a water bath and record the temperature at the start and end." },
    { q:"Why must the experiment be done in a well-ventilated room?",
      a:"Sulfur dioxide gas is produced; it is toxic and an irritant to anyone with asthma." },
    { q:"In the iodine clock, what is the thiosulfate for, and why does the blue-black colour appear suddenly?",
      a:"S₂O₈²⁻ + 2I⁻ → 2SO₄²⁻ + I₂. The small fixed amount of thiosulfate turns the iodine straight back into iodide (I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻). When it is all used up, free iodine builds up and forms the blue-black complex with starch. Every run makes the same amount of iodine by then, so rate ∝ 1/t." },
    { q:"Is starting the stop-clock late a random or a systematic error?",
      a:"If you always start it slightly late, every time is too short: a systematic error that repeats cannot remove. Judging the end point differently from run to run is a random error; repeating runs and averaging reduces it." }
  ],
  setup(ctx){
    let rx = "thio", Vt = 50, T = 20, running = false, t = 0, tc = 0, ended = false;
    const sw = Kit.stopwatch("ck-sw", 700, 330);
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="ck-svg"><defs>${Kit.DEFS}</defs><g id="ck-scene"></g>${sw.svg}<text x="24" y="30" class="k-status" id="ck-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ck-svg"), $ = s => svg.querySelector(s);
    sw.bind(svg);
    function draw(){
      const R = RX[rx], go = running || ended;
      const turb = go ? (rx === "thio" ? Math.pow(t/tc, 2) : t >= tc ? Math.min(1, (t - tc)/.4) : 0) : 0, vis = Math.max(0, 1 - turb);
      const fill = rx === "thio" ? `rgba(238,226,150,${Math.min(.97, .1 + .9*Math.min(1, turb))})` : `rgba(${Math.round(225 - 205*turb)},${Math.round(232 - 207*turb)},${Math.round(240 - 165*turb)},${.15 + .82*turb})`;
      let s = `<rect x="140" y="60" width="400" height="400" rx="8" fill="#FBFBF7" stroke="var(--brd2)"/><path d="M250 170 L430 350 M430 170 L250 350" stroke="#111" stroke-width="18" stroke-linecap="round" opacity="${.9*vis + .02}"/>
        <circle cx="340" cy="260" r="170" fill="${fill}" stroke="#9AA3B2" stroke-width="4"/>
        <circle cx="340" cy="260" r="170" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="10" stroke-dasharray="80 900"/>`;
      const L = [`${R.vSol}: ${Vt.toFixed(1)} cm³`, `distilled water: ${(50 - Vt).toFixed(1)} cm³`].concat(R.fixed, [`water bath: ${T} °C`]);
      s += `<g transform="translate(590 60)"><rect width="340" height="${86 + L.length*22}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="14" y="26" class="k-tag">${R.name}</text>
        ${L.map((l, i) => `<text x="14" y="${52 + i*22}" class="k-lbl">${l}</text>`).join("")}
        <text x="14" y="${62 + L.length*22}" class="k-lbl">${R.start}</text><text x="14" y="${80 + L.length*22}" class="k-lbl">${R.stop}</text></g>`;
      $("#ck-scene").innerHTML = s;
      $("#ck-status").textContent = !running && !ended ? "Set the volumes, then a" + R.act.slice(1) : running && !(rx === "iod" && t >= tc) ? R.watch : R.done;
      ctx.readout([["Reaction", R.key], [R.vLbl, Vt + " cm³"], ["Water", (50 - Vt) + " cm³"], ["Temperature", T + " °C"]]);
    }
    ctx.frame(dt => { sw.tick(dt); if(running){ t += dt; if(t > tc*1.6){ running = false; ended = true; } draw(); } });
    const lock = d => { vs.disable(d); ts.disable(d); rs.disable(d); };
    const rs = ctx.seg({ label:"Reaction", value:rx, options:[["thio","Disappearing cross"],["iod","Iodine clock"]], onChange(v){ rx = v; actBtn.textContent = RX[rx].act; draw(); } });
    const vs = ctx.seg({ label:"Volume of varied solution (rest water, total 50 cm³)", value:50, options:[[10,"10"],[20,"20"],[25,"25"],[30,"30"],[40,"40"],[50,"50"]], onChange(v){ Vt = v; draw(); } });
    const ts = ctx.seg({ label:"Temperature", value:20, options:[[20,"Room (20 °C)"],[30,"30 °C"],[40,"40 °C"],[50,"50 °C"]], onChange(v){ T = v; draw(); } });
    const [actBtn] = ctx.buttons([{ label:"Add 10.0 cm³ acid", primary:true, onClick(){
        if(running) return; t = 0; ended = false;
        tc = RX[rx].k*(50/Vt)*Math.pow(2, -(T - 20)/10)*(1 + .03*ctx.gauss());
        running = true; lock(true); draw(); } },
      { label:"Rinse beaker", onClick(){ running = false; ended = false; t = 0; lock(false); sw.reset(); draw(); } }]);
    ctx.buttons([{ label:"Record my stop-clock time", block:true, onClick(){
      if(!running && !ended) return ctx.toast("Run the reaction first");
      if(sw.running || sw.t <= 0) return ctx.toast("Stop your stop-clock when the cross disappears");
      const tt = Math.round(sw.t);
      if(Math.abs(sw.t - tc) > Math.max(3, .2*tc)) ctx.toast(`Hmm — the end point was at about ${Math.round(tc)} s. Recording your time anyway.`);
      ctx.record({ rx:RX[rx].key, Vt, Vw:50 - Vt, T, t:tt, r:Kit.round(1000/tt, 1) });
      const rows = ctx.rows(), five = k => new Set(rows.filter(r => r.rx === RX[k].key && r.T === 20).map(r => r.Vt)).size >= 5;
      if(five("thio")) ctx.complete("five");
      const byV = {}; rows.forEach(r => (byV[r.rx + r.Vt] = byV[r.rx + r.Vt] || new Set()).add(r.T)); if(Object.values(byV).some(s => s.size >= 3)) ctx.complete("temp");
      running = false; ended = false; t = 0; lock(false); sw.reset(); draw();
    } }]);
    Kit.answer(ctx, "Order of reaction with respect to the varied reagent (the selected reaction)", "0, 1 or 2", v => {
      const k = RX[rx].key, n = new Set(ctx.rows().filter(r => r.rx === k && r.T === 20).map(r => r.Vt)).size;
      if(n < 4) return [false, `Time at least four volumes in the ${k.toLowerCase()} at room temperature, then plot 1000/t against volume.`];
      if(v === 1){
        if(rx === "thio") ctx.complete("order"); else if(n >= 5) ctx.complete("iodine");
        return [true, `Correct: 1000/t against volume is a straight line through the origin, so rate ∝ [${rx === "thio" ? "S₂O₃²⁻" : "S₂O₈²⁻"}]: first order.${rx === "iod" && n < 5 ? " Time a fifth volume to complete the challenge." : ""}`]; }
      return [false, "Look at the shape of 1000/t against volume. A straight line through the origin means rate ∝ concentration."];
    });
    Kit.answer(ctx, "Percentage uncertainty in your shortest time / %", "e.g. 4", v => {
      const ts = ctx.rows().map(r => r.t); if(!ts.length) return [false, "Record a time first."];
      const tm = Math.min(...ts), p1 = ChemKit.pct(1, tm), p2 = ChemKit.pct(.5, tm);
      if([p1, p2].some(p => Math.abs(v - p) <= .04*p + .05)){ ctx.complete("unc"); return [true, `Correct: ±1 s (or ±0.5 s) on ${tm} s → ${p1.toFixed(1)}% (or ${p2.toFixed(1)}%). Your reaction time makes the real uncertainty larger.`]; }
      return [false, "Use the stop-clock resolution (±1 s, or ±0.5 s) divided by the time × 100."];
    });
    draw();
  }
});
})();
