"use strict";
/* ══════════════════════════════════════════════════════════════════
   BIOLOGY · AS LEVEL (9700 Paper 3) — part 2: molecules & enzymes
   Serial dilutions & semi-quantitative Benedict’s (and non-reducing
   sugars) · Catalase: rate, Vmax, Km & inhibitors · Free vs
   immobilised enzyme
══════════════════════════════════════════════════════════════════ */

/* Benedict’s colour from the amount of reducing sugar that has reacted (% glucose equivalent) */
const BioCol = (function(){
  const STOPS = [[0, [40,100,220]], [.025, [60,150,170]], [.06, [90,170,70]], [.13, [215,200,40]], [.27, [235,135,30]], [.5, [170,50,30]]];
  function ben(R){
    for(let i = 1; i < STOPS.length; i++) if(R <= STOPS[i][0]){
      const [a, ca] = STOPS[i - 1], [b, cb] = STOPS[i], f = (R - a)/(b - a);
      return ca.map((v, k) => Math.round(v + (cb[k] - v)*f));
    }
    return STOPS[STOPS.length - 1][1];
  }
  const name = R => R < .025 ? "blue" : R < .05 ? "blue-green" : R < .12 ? "green" : R < .25 ? "yellow" : R < .5 ? "orange" : "brick-red";
  return { ben, name };
})();

/* ───────────── SEMI-QUANTITATIVE BENEDICT’S ───────────── */
Lab.register({
  id:"benedicts", subject:"biology", level:["as"], topic:"Biological molecules · Reducing sugars", interactive:true,
  title:"Semi-quantitative Benedict’s test",
  summary:"Make a serial dilution of glucose, time the first colour change in a water bath, then use your calibration curve to estimate an unknown — and hydrolyse sucrose to show a non-reducing sugar.",
  aim:"Use a standardised Benedict’s test on a dilution series of glucose to estimate the concentration of reducing sugar in an unknown solution, and test for a non-reducing sugar.",
  variables:{ iv:"Concentration of glucose solution (%)", dv:"Time to the first colour change (s)", cv:["2 cm³ of sugar solution + 2 cm³ of Benedict’s","Water bath at 80 °C","Same judgement of ‘first colour change’ (against a white tile)"] },
  stageTitle:"Dilutions & water bath", controlsTitle:"Make solutions",
  thumb:`<svg viewBox="0 0 300 140">${[[40,100,220],[90,170,70],[215,200,40],[235,135,30],[170,50,30]].map((c, i) => `<rect x="${60 + i*40}" y="22" width="22" height="92" rx="11" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="${62 + i*40}" y="62" width="18" height="50" rx="9" fill="rgb(${c})"/>`).join("")}</svg>`,
  challenges:[
    { id:"serial", title:"Serial dilution", text:"Make at least four dilutions, at least one from another dilution (not the stock)." },
    { id:"curve",  title:"Calibration", text:"Time the first colour change for five known concentrations." },
    { id:"unk",    title:"Unknown U", text:"Estimate the glucose concentration of U from your graph." },
    { id:"nrs",    title:"Non-reducing sugar", text:"Show that S contains a non-reducing sugar." }
  ],
  columns:[{key:"tube",label:"Tube"},{key:"c",label:"Glucose / %",dp:3},{key:"pre",label:"Treatment"},{key:"t",label:"Time to first change / s",dp:1},{key:"rate",label:"1000 ÷ t / s⁻¹",dp:2},{key:"col",label:"Colour after 5 min"}],
  graph:{ x:["c"], y:["t","rate"], fit:"curve" },
  questions:[
    { q:"How do you make a 0.5% solution from 1.0% stock, ending with 10 cm³?",
      a:"5 cm³ of 1.0% stock + 5 cm³ of distilled water. A serial dilution repeats this, each time diluting the previous solution by the same factor (here ×0.5): 1.0, 0.5, 0.25, 0.125…" },
    { q:"Why is time to first colour change better than the final colour for estimating concentration?",
      a:"It gives a number rather than a colour judgement, so results can be plotted and the unknown read from the curve. Final colours (colour standards) only place the unknown between two known concentrations." },
    { q:"What is the uncertainty in a volume measured with a 10 cm³ syringe marked every 0.2 cm³?",
      a:"± half the smallest division, ±0.1 cm³. For 2.0 cm³ that is ±5%, so a smaller syringe (or a graduated pipette) would reduce the percentage uncertainty." },
    { q:"Describe the test for a non-reducing sugar.",
      a:"First do Benedict’s test: it stays blue. Heat a fresh sample with dilute hydrochloric acid to hydrolyse glycosidic bonds, then neutralise with sodium hydrogencarbonate (until fizzing stops), and test again with Benedict’s. An orange/brick-red precipitate now shows a non-reducing sugar was present." },
    { q:"State three limitations of this method and an improvement for each.",
      a:"Judging the first colour change is subjective — compare against a white tile and a colour standard, or use a colorimeter. Reaction time when starting and stopping the stopwatch — repeat and take a mean. Tubes take different times to warm up — pre-warm both solutions in the water bath before mixing. Few concentrations near the unknown — make extra dilutions either side of it." },
    { q:"How could a colorimeter make the test fully quantitative?",
      a:"After heating, filter or centrifuge to remove the precipitate. Measure the absorbance (or % transmission) of the remaining blue solution with a red filter: the more reducing sugar, the less Cu²⁺ left, so the less red light absorbed. Read the unknown from a calibration curve." }
  ],
  setup(ctx){
    const U = Kit.round(.12 + Math.random()*.6, 2), SUC = .4, SPEED = 8, TAU = 300, TH = .025, MAXT = 300;
    const fixed = [{ id:"U", c:U, known:false, suc:0 }, { id:"S", c:0, known:false, suc:SUC }];
    let made = [], sel = null, test = null, pre = "none";
    const sw = Kit.stopwatch("bn-sw", 760, 380);
    const t1 = c => c > TH ? -TAU*Math.log(1 - TH/c) + 8 : Infinity;     // seconds to first visible change
    const R = (c, t) => t < 8 ? 0 : c*(1 - Math.exp(-(t - 8)/TAU));
    const tubes = () => made.concat(fixed);
    const eff = (tb, how) => how === "hydro" ? (tb.c + tb.suc*1.05)*.8 : tb.c;    // acid hydrolysis then NaHCO₃ dilutes ×0.8

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="bn-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 470)}
      <rect x="30" y="300" width="560" height="14" rx="4" fill="url(#k-wood)"/><rect x="40" y="314" width="10" height="156" fill="#A97B47"/><rect x="570" y="314" width="10" height="156" fill="#A97B47"/>
      <g id="bn-rack"></g>
      <g><rect x="620" y="150" width="300" height="200" rx="12" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><rect x="623" y="190" width="294" height="157" rx="10" fill="url(#k-water)"/>
        <text x="770" y="140" text-anchor="middle" class="k-tag">water bath · 80 °C</text><g id="bn-bath"></g></g>
      ${sw.svg}<rect x="600" y="384" width="140" height="80" rx="8" fill="#fff" stroke="#CBD5E1"/><text x="670" y="400" text-anchor="middle" class="k-lbl" style="fill:#475569">white tile</text><g id="bn-tile"></g>
      <text x="24" y="34" class="k-status" id="bn-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#bn-svg"), $ = s => svg.querySelector(s);
    sw.bind(svg);
    const tubeSvg = (x, yTop, h, col, label, on) => `<rect x="${x - 13}" y="${yTop}" width="26" height="${h}" rx="13" fill="url(#k-glass)" stroke="${on ? "var(--accent)" : "var(--txt2)"}" stroke-width="${on ? 3 : 1.5}"/>
      <rect x="${x - 11}" y="${yTop + h*.45}" width="22" height="${h*.55 - 2}" rx="11" fill="${col}"/><text x="${x}" y="${yTop + h + 18}" text-anchor="middle" class="k-tag">${label}</text>`;

    function draw(){
      let r = "";
      tubes().forEach((tb, i) => { const x = 62 + i*58;
        r += `<g data-tb="${tb.id}" style="cursor:pointer">${tubeSvg(x, 196, 120, "rgba(225,235,245,.7)", tb.id, sel === tb.id)}
          <text x="${x}" y="${352}" text-anchor="middle" class="k-lbl">${tb.known ? tb.c.toFixed(3).replace(/0+$/, "").replace(/\.$/, "") + "%" : "?"}</text><rect x="${x - 26}" y="186" width="52" height="180" fill="transparent"/></g>`; });
      if(r !== rackHtml) $("#bn-rack").innerHTML = rackHtml = r;
      let b = "";
      if(test){ const Rv = R(test.c, test.t); b = tubeSvg(770, 120, 170, `rgb(${BioCol.ben(Rv)})`, test.id + (test.pre === "hydro" ? " (hydrolysed)" : ""), true);
        if(Rv > .1) for(let k = 0; k < 16; k++) b += `<circle cx="${762 + (k*7) % 17}" cy="${282 - (k*5) % 12}" r="1.8" fill="rgb(${BioCol.ben(Rv*1.2)})"/>`;
        $("#bn-tile").innerHTML = `<circle cx="670" cy="432" r="18" fill="rgb(${BioCol.ben(Rv)})" stroke="#94A3B8"/>`; }
      else $("#bn-tile").innerHTML = "";
      $("#bn-bath").innerHTML = b;
      $("#bn-status").textContent = test ? (test.done ? `Heated 5 min: ${BioCol.name(R(test.c, test.t))}` : `Heating ${test.id}… stop the stopwatch at the first colour change`) : sel ? `Tube ${sel} selected` : "Make dilutions, then click a tube to select it";
      ctx.readout([["Selected", sel || "—"], ["In bath", test ? `${test.id}, ${Math.floor(test.t)} s` : "—"], ["Stopwatch", sw.t.toFixed(2) + " s"]]);
    }
    let rackHtml = "";
    svg.addEventListener("pointerdown", e => { const g = e.target.closest("[data-tb]"); if(!g) return; sel = g.dataset.tb; draw(); });
    ctx.frame(dt => {
      sw.tick(dt*SPEED);
      if(test && !test.done){ test.t += dt*SPEED; if(test.t >= MAXT){ test.t = MAXT; test.done = true; sw.stop(); finish(); } }
      draw();
    });
    function finish(){
      const tb = tubes().find(x => x.id === test.id), tt = test.stopped;
      const real = t1(test.c), t = tt !== null ? tt : null;
      ctx.record({ tube:test.id, c:tb.known ? tb.c : null, pre:test.pre === "hydro" ? "HCl, then NaHCO₃" : "none", t: t !== null ? Kit.round(t, 1) : (real > MAXT ? "> 300" : "missed"), rate: t ? Kit.round(1000/t, 2) : 0, col:BioCol.name(R(test.c, MAXT)) });
      const known = ctx.rows().filter(r => typeof r.c === "number" && typeof r.t === "number");
      if(new Set(known.map(r => r.c)).size >= 5) ctx.complete("curve");
      const sRows = ctx.rows().filter(r => r.tube === "S");
      if(sRows.some(r => r.pre === "none" && r.col === "blue") && sRows.some(r => r.pre !== "none" && r.col !== "blue")) ctx.complete("nrs");
    }

    /* making dilutions */
    const src = ctx.select({ label:"Take solution from", value:"stock", options:[["stock","Stock glucose 1.00%"]] });
    const vs = ctx.slider({ label:"Volume of that solution", min:.5, max:10, step:.5, value:5, unit:"cm³", fmt:v => v.toFixed(1), onInput(){ upd(); } });
    const info = ctx.html(`<p class="hint" style="font-size:.8rem;color:var(--txt2);margin:-4px 0 8px"></p>`);
    function srcConc(){ const v = src.get(); return v === "stock" ? 1 : made.find(m => m.id === v).c; }
    function upd(){ const c = srcConc()*vs.get()/10; info.innerHTML = `+ ${(10 - vs.get()).toFixed(1)} cm³ distilled water → 10 cm³ of <b>${c.toFixed(3)}%</b>`; }
    src.input.addEventListener("change", upd);
    ctx.buttons([{ label:"Make tube", onClick(){
      if(made.length >= 7) return ctx.toast("The rack is full — wash it first");
      const id = String.fromCharCode(65 + made.length), from = src.get();
      made.push({ id, c:Kit.round(srcConc()*vs.get()/10, 4), known:true, suc:0, from });
      src.input.insertAdjacentHTML("beforeend", `<option value="${id}">Tube ${id} (${made[made.length - 1].c}%)</option>`);
      sel = id; upd(); draw();
      if(made.length >= 4 && made.some(m => m.from !== "stock")) ctx.complete("serial");
    } }, { label:"Wash rack", onClick(){ if(test && !test.done) return; made = []; sel = null; src.input.innerHTML = `<option value="stock">Stock glucose 1.00%</option>`; upd(); draw(); } }]);
    ctx.html(`<h4 style="margin:14px 0 8px;font-size:.85rem">Benedict’s test</h4>`);
    ctx.seg({ label:"Before testing", value:"none", options:[["none","No treatment"],["hydro","Boil with HCl, neutralise"]], onChange(v){ pre = v; } });
    ctx.buttons([{ label:"Add 2 cm³ Benedict’s & put in bath", primary:true, block:true, onClick(){
      if(!sel) return ctx.toast("Click a tube in the rack first");
      if(test && !test.done) return ctx.toast("One test at a time — finish this one");
      const tb = tubes().find(x => x.id === sel);
      test = { id:sel, c:eff(tb, pre) * (1 + .03*ctx.gauss()), pre, t:0, done:false, stopped:null };
      sw.reset(); ctx.toast("Start the stopwatch now!");
    } }]);
    ctx.buttons([{ label:"I saw the first change: log stopwatch time", block:true, onClick(){
      if(!test || test.done) return;
      if(test.t < t1(test.c) - 4) return ctx.toast("Look again — it’s still blue against the white tile");
      if(sw.running) sw.stop();
      if(sw.t <= 0) return ctx.toast("Start the stopwatch when the tube goes in");
      test.stopped = sw.t; ctx.toast(`Logged ${sw.t.toFixed(1)} s — heating to 5 min for the final colour`);
      test.t = Math.max(test.t, MAXT - .01);
    } }]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">The bath runs ×${SPEED} fast. If nothing changes, let it run to 5 minutes and it records “> 300 s”.</p>`);
    Kit.answer(ctx, "Concentration of glucose in U / %", "e.g. 0.35", v => {
      if(!ctx.rows().some(r => r.tube === "U")) return [false, "Test U first, then read its concentration from your graph."];
      if(Math.abs(v - U) <= Math.max(.04, .15*U)){ ctx.complete("unk"); return [true, `Good estimate — U is ${U}% glucose.`]; }
      return [false, "Read across from U’s time on your curve of time against concentration. Make extra dilutions near U if the points are far apart."];
    });
    upd(); draw();
  }
});

/* ───────────── CATALASE ───────────── */
Lab.register({
  id:"catalase", subject:"biology", level:["as"], topic:"Enzymes · Rate, Vmax & Km", interactive:true,
  title:"Catalase: rate of reaction",
  summary:"Collect oxygen from hydrogen peroxide in an upturned measuring cylinder. Vary enzyme and substrate concentration, temperature and pH, then use two inhibitors to tell competitive from non-competitive.",
  aim:"Investigate the effects of enzyme concentration, substrate concentration, temperature, pH and inhibitors on the initial rate of the reaction catalysed by catalase.",
  variables:{ iv:"Choose one: enzyme %, H₂O₂ %, temperature, pH or inhibitor", dv:"Initial rate: volume of oxygen collected in the first 60 s (cm³ min⁻¹)", cv:["Total volume 10 cm³ (5 cm³ H₂O₂ + 5 cm³ enzyme/buffer)","Same source of catalase","Temperature (water bath) and pH (buffer)"] },
  stageTitle:"Gas collection by displacement", controlsTitle:"Conditions",
  thumb:`<svg viewBox="0 0 300 140"><rect x="40" y="50" width="30" height="70" rx="12" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="42" y="80" width="26" height="38" rx="10" fill="#E6D7A8"/><path d="M55 50V30H170V60" stroke="#A2ACBD" stroke-width="3" fill="none"/><rect x="140" y="80" width="140" height="44" rx="6" fill="#4C86C6" opacity=".55"/><rect x="155" y="20" width="30" height="96" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="157" y="22" width="26" height="40" fill="#E9F3FB"/></svg>`,
  challenges:[
    { id:"enz", title:"Enzyme concentration", text:"Record initial rates for five enzyme concentrations." },
    { id:"sub", title:"Substrate curve", text:"Record initial rates for six H₂O₂ concentrations (no inhibitor)." },
    { id:"km",  title:"Km", text:"Estimate Km from your substrate curve." },
    { id:"inh", title:"Inhibitors", text:"Decide which inhibitor is competitive." }
  ],
  columns:[{key:"E",label:"Catalase / %",dp:1},{key:"S",label:"H₂O₂ / %",dp:2},{key:"T",label:"T / °C",dp:0},{key:"pH",label:"pH",dp:0},{key:"inh",label:"Inhibitor"},{key:"v30",label:"V at 30 s / cm³",dp:1},{key:"v60",label:"V at 60 s / cm³",dp:1},{key:"v120",label:"V at 120 s / cm³",dp:1},{key:"rate",label:"Initial rate / cm³ min⁻¹",dp:1}],
  series:"inh",
  graph:{ x:["S","E","T","pH"], y:["rate"], fit:"curve" },
  questions:[
    { q:"Why is the initial rate used rather than the total volume collected?",
      a:"At the start, substrate concentration is at its known value. As the reaction continues, H₂O₂ is used up so the rate falls; the total volume depends on how much substrate there was, not on how fast the enzyme works." },
    { q:"Explain the shape of the graph of initial rate against substrate concentration.",
      a:"At low [S], active sites are often empty, so more substrate means more enzyme–substrate complexes per second and rate rises steeply. At high [S] all active sites are occupied (saturated), so rate approaches Vmax and the curve levels off." },
    { q:"What is Km and how is it found from the graph?",
      a:"The Michaelis–Menten constant: the substrate concentration that gives half the maximum rate (½Vmax). Read Vmax from the plateau, halve it, and read across and down to the substrate concentration. A low Km means high affinity of the enzyme for its substrate." },
    { q:"How does a competitive inhibitor change Vmax and Km? A non-competitive one?",
      a:"Competitive: binds the active site, competes with substrate; at high [S] it is outcompeted, so Vmax is unchanged but Km increases. Non-competitive: binds elsewhere and changes the active site shape; raising [S] can’t overcome it, so Vmax decreases and Km is unchanged." },
    { q:"What is the uncertainty in each volume reading, and how could the measurement be improved?",
      a:"The 50 cm³ cylinder is marked every 1 cm³, so ±0.5 cm³ — that is ±10% of a 5 cm³ reading. A gas syringe reads to 0.2 cm³ and collects gas without it dissolving in water, so it is more precise." },
    { q:"Suggest two sources of error in this set-up and how to reduce them.",
      a:"Some oxygen escapes before the bung is fitted — inject the enzyme through a sealed bung or tip in a tube of enzyme inside the flask. Temperature changes during the run — stand the flask in a thermostatically controlled water bath and pre-warm both solutions." }
  ],
  setup(ctx){
    const KM = Kit.round(.7 + Math.random()*.5, 2), VMAX = 26 + Math.random()*6, TOPT = 33 + Math.round(Math.random()*8), COMP = Math.random() < .5 ? "A" : "B";
    const SPEED = 6, VOL_PER_PCT = 17.6;
    let E = 1, S = 1, T = 30, pH = 7, inh = "none", run = null;
    const fT = T => T <= TOPT ? Math.pow(2, (T - TOPT)/10) : Math.max(0, 1 - Math.pow((T - TOPT)/(60 - TOPT), 2));
    const fpH = p => Math.exp(-Math.pow((p - 7)/2, 2));
    function v(sRem){                                         // cm³ per s
      let km = KM, vm = VMAX*E*fT(T)*fpH(pH);
      if(inh !== "none"){ if(inh === COMP) km *= 4; else vm *= .35; }
      return vm/60*sRem/(km + sRem);
    }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="ca-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 470)}<g id="ca-scene"></g>
      <g transform="translate(700 40)"><rect width="230" height="250" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="14" y="26" class="k-tag">Readings this run</text><text x="216" y="26" text-anchor="end" class="k-tag" id="ca-clock"></text><g id="ca-log"></g></g>
      <text x="24" y="34" class="k-status" id="ca-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ca-svg"), $ = s => svg.querySelector(s);
    function draw(){
      const V = run ? run.V : 0, CX = 520, top = 90, bot = 400, pxPerCm3 = (bot - top - 20)/50;
      let s = `<rect x="80" y="210" width="160" height="200" rx="10" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><rect x="83" y="250" width="154" height="157" rx="8" fill="#BFD7EA" opacity=".55"/>
        <text x="160" y="430" text-anchor="middle" class="k-lbl">water bath ${T} °C</text>
        <rect x="140" y="170" width="40" height="180" rx="16" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><rect x="142" y="${run ? 270 : 290}" width="36" height="${run ? 78 : 58}" rx="14" fill="${run ? "#F2E8C6" : "#E9F3FB"}"/>
        <rect x="136" y="160" width="48" height="16" rx="3" fill="#374151"/>
        <path d="M160 160V120H420V405H${CX - 8}V${bot - 30}" stroke="var(--txt2)" stroke-width="4" fill="none" stroke-linejoin="round"/>`;
      if(run && run.t > 3) for(let k = 0; k < 6; k++){ const ph = (run.t*.5 + k/6) % 1; s += `<circle cx="${150 + (k*7) % 20}" cy="${340 - ph*60}" r="2.2" fill="#fff" opacity="${(1 - ph).toFixed(2)}"/>`; }
      s += `<rect x="400" y="330" width="260" height="90" rx="8" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><rect x="403" y="345" width="254" height="72" rx="6" fill="url(#k-water)"/>
        <rect x="${CX - 26}" y="${top}" width="52" height="${bot - top}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
        <rect x="${CX - 24}" y="${top + 10 + V*pxPerCm3}" width="48" height="${bot - top - 12 - V*pxPerCm3}" fill="url(#k-water)"/>`;
      for(let m = 0; m <= 50; m++){ const y = top + 10 + m*pxPerCm3; s += `<line x1="${CX + 26}" y1="${y}" x2="${CX + 26 - (m % 5 ? 6 : 12)}" y2="${y}" stroke="var(--txt2)" stroke-width=".8"/>`; if(m % 10 === 0) s += `<text x="${CX + 32}" y="${y + 4}" class="k-num">${m}</text>`; }
      s += `<text x="${CX}" y="${top - 8}" text-anchor="middle" class="k-lbl">50 cm³ cylinder (upside down)</text>`;
      $("#ca-scene").innerHTML = s;
      $("#ca-clock").textContent = run ? Math.floor(run.t) + " s" : "";
      $("#ca-log").innerHTML = (run ? run.log : []).map(([t, vv], i) => `<text x="14" y="${54 + i*26}" style="font:600 13px 'JetBrains Mono';fill:var(--txt)">${String(t).padStart(3)} s   ${vv.toFixed(1)} cm³</text>`).join("");
      $("#ca-status").textContent = !run ? "Set the conditions, then add the enzyme" : run.done ? "Run finished — record it" : `Collecting oxygen… ${Math.floor(run.t)} s`;
      ctx.readout([["Catalase", E + " %"], ["H₂O₂", S + " %"], ["Temperature", T + " °C"], ["pH", String(pH)], ["Inhibitor", inh === "none" ? "none" : inh]]);
    }
    ctx.frame(dt => {
      if(run && !run.done){
        for(let k = 0; k < 10; k++){ const h = dt*SPEED/10; run.t += h; if(run.t > 3){ const sRem = S*(1 - run.V/(VOL_PER_PCT*S)); run.V = Math.min(50, run.V + v(Math.max(0, sRem))*h*run.noise); } }
        while(run.log.length < 6 && run.t >= (run.log.length + 1)*30) run.log.push([(run.log.length + 1)*30, Kit.round(Kit.snap(run.V, .5), 1)]);
        if(run.log.length >= 6 || run.V >= 50){ run.done = true; }
      }
      draw();
    });
    const locks = [];
    locks.push(ctx.seg({ label:"Catalase concentration", value:1, options:[[.2,"0.2%"],[.4,"0.4"],[.6,"0.6"],[.8,"0.8"],[1,"1.0"]], onChange(x){ E = x; } }));
    locks.push(ctx.seg({ label:"Hydrogen peroxide concentration", value:1, options:[[.25,"0.25%"],[.5,"0.5"],[1,"1"],[1.5,"1.5"],[2,"2"],[3,"3"],[4,"4"]], onChange(x){ S = x; } }));
    locks.push(ctx.slider({ label:"Water bath", min:10, max:60, step:5, value:30, unit:"°C", onInput(x){ T = x; draw(); } }));
    locks.push(ctx.slider({ label:"pH buffer", min:3, max:11, step:1, value:7, onInput(x){ pH = x; } }));
    locks.push(ctx.seg({ label:"Inhibitor (fixed concentration)", value:"none", options:[["none","None"],["A","Inhibitor A"],["B","Inhibitor B"]], onChange(x){ inh = x; } }));
    ctx.buttons([{ label:"Add enzyme & start", primary:true, onClick(){
      if(run && !run.done) return;
      run = { t:0, V:0, log:[], done:false, noise:1 + .04*ctx.gauss() };
    } }, { label:"Record run", onClick(){
      if(!run || !run.done) return ctx.toast("Wait for the 30-second readings to finish");
      const at = s => { const r = run.log.find(l => l[0] === s); return r ? r[1] : null; };
      ctx.record({ E, S, T, pH, inh: inh === "none" ? "none" : "Inhibitor " + inh, v30:at(30), v60:at(60), v120:at(120), rate:at(60) });
      const rows = ctx.rows();
      const same = (r, k) => ["E","S","T","pH"].filter(x => x !== k).every(x => r[x] === rows[rows.length - 1][x]);
      if(new Set(rows.filter(r => r.inh === "none" && same(r, "E")).map(r => r.E)).size >= 5) ctx.complete("enz");
      if(new Set(rows.filter(r => r.inh === "none" && same(r, "S")).map(r => r.S)).size >= 6) ctx.complete("sub");
      run = null;
    } }]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Time runs ×${SPEED}. Volumes are read every 30 s to the nearest 0.5 cm³. Initial rate = volume in the first 60 s.</p>`);
    Kit.answer(ctx, "Km of this catalase / % H₂O₂", "e.g. 0.8", x => {
      const pts = ctx.rows().filter(r => r.inh === "none").map(r => r.S); if(new Set(pts).size < 5) return [false, "Record at least five substrate concentrations with no inhibitor first."];
      if(Math.abs(x - KM)/KM <= .3){ ctx.complete("km"); return [true, `Good — the hidden Km is ${KM}% H₂O₂. Initial rates are only estimates, so ±30% is a fair reading from a sketch graph.`]; }
      return [false, "Find Vmax from the plateau, halve it, and read the H₂O₂ concentration that gives that rate."];
    });
    const ib = ctx.html(`<div class="ctl"><label><span>Which inhibitor is competitive?</span></label><div class="btns" style="display:flex;gap:6px"><button class="btn small" data-i="A" type="button">A</button><button class="btn small" data-i="B" type="button">B</button></div><div style="margin-top:8px"></div></div>`);
    ib.querySelectorAll("button").forEach(b => b.onclick = () => {
      const tested = new Set(ctx.rows().filter(r => r.inh !== "none").map(r => r.inh + "@" + r.S));
      if(tested.size < 4) return ib.lastElementChild.innerHTML = `<div class="note bad">Test both inhibitors at a low and a high H₂O₂ concentration first.</div>`;
      const ok = b.dataset.i === COMP;
      ib.lastElementChild.innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${ok ? `Yes — at high H₂O₂ the rate with ${COMP} recovers towards the uninhibited rate (same Vmax, higher Km).` : "Look again: which inhibitor’s effect is overcome at high substrate concentration?"}</div>`;
      if(ok) ctx.complete("inh");
    });
    draw();
  }
});

/* ───────────── FREE VS IMMOBILISED ENZYME ───────────── */
Lab.register({
  id:"immobilised", subject:"biology", level:["as"], topic:"Enzymes · Immobilised enzymes", interactive:true,
  title:"Free vs immobilised lactase",
  summary:"Trap lactase in alginate beads, run lactose through a column and test the product for glucose. Compare with free enzyme for speed, heat stability and reuse.",
  aim:"Investigate the difference in activity between lactase immobilised in alginate beads and the same enzyme free in solution.",
  variables:{ iv:"Free or immobilised; contact time, temperature or number of re-uses", dv:"Glucose concentration in the product (%)", cv:["Same mass of lactase in each","20 cm³ of 2% lactose","Same glucose measuring method"] },
  stageTitle:"Bead column & beaker", controlsTitle:"Set-up",
  thumb:`<svg viewBox="0 0 300 140"><rect x="120" y="10" width="40" height="90" rx="4" fill="none" stroke="#A2ACBD" stroke-width="2"/>${[...Array(24)].map((_, i) => `<circle cx="${128 + (i % 4)*8}" cy="${40 + Math.floor(i/4)*9}" r="4" fill="#E6C86A"/>`).join("")}<path d="M140 100v20" stroke="#A2ACBD" stroke-width="3"/><rect x="120" y="120" width="40" height="14" fill="#F3F4F6"/></svg>`,
  challenges:[
    { id:"time",  title:"Contact time", text:"Compare free and immobilised lactase at three contact times." },
    { id:"temp",  title:"Heat stability", text:"Compare both at 40, 55 and 65 °C." },
    { id:"reuse", title:"Re-use", text:"Run the same beads five times." }
  ],
  columns:[{key:"set",label:"Set-up"},{key:"T",label:"T / °C",dp:0},{key:"time",label:"Contact time / min",dp:1},{key:"run",label:"Use no.",dp:0},{key:"meth",label:"Measured with"},{key:"g",label:"Glucose / %",dp:2}],
  series:"set",
  graph:{ x:["time","T","run"], y:["g"], fit:"curve" },
  questions:[
    { q:"Give two advantages of immobilising an enzyme.",
      a:"The enzyme can be re-used many times and does not contaminate the product (so no separation is needed). Immobilised enzymes are often more stable at higher temperatures and extremes of pH because the alginate holds the molecule’s shape." },
    { q:"Why might immobilised lactase give less glucose than free lactase in the same contact time?",
      a:"Lactose must diffuse into the beads to reach the active sites, and some active sites face inwards, so fewer enzyme–substrate complexes form per second." },
    { q:"How does the flow rate through the column affect the product?",
      a:"A slower flow gives a longer contact time, so more lactose is hydrolysed and the glucose concentration of the product is higher — but less product is made per minute." },
    { q:"Why are glucose test strips only semi-quantitative?",
      a:"The strip’s colour is matched by eye to a chart with a few bands (e.g. 0, 0.1, 0.25, 0.5, 1, 2%), so the reading can only be placed in a band. A glucose meter (biosensor) gives a numerical reading." },
    { q:"Why are small beads more effective than large ones?",
      a:"For the same volume, small beads have a larger total surface area to volume ratio, so lactose has a shorter diffusion distance to the enzymes." }
  ],
  setup(ctx){
    const KF = .38 + Math.random()*.06, GMAX = 1.05, BANDS = [0, .1, .25, .5, 1, 2];
    let set = "imm", T = 40, time = 3, size = "small", meth = "strip", run = 1, last = null, busy = 0;
    const fT = (T, shift) => { const o = 40 + shift; return T <= o ? Math.pow(2, (T - o)/10) : Math.max(0, 1 - Math.pow((T - o)/(18 + shift*.4), 2)); };
    const k = () => set === "free" ? KF*fT(T, 0) : KF*(size === "small" ? .6 : .33)*fT(T, 12)*Math.pow(.97, run - 1);
    const strip = g => BANDS.reduce((b, x) => Math.abs(x - g) < Math.abs(b - g) ? x : b, 0);
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="im-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 450)}<g id="im-scene"></g>
      <g transform="translate(690 60)"><rect width="250" height="220" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="14" y="26" class="k-tag">Glucose test strip chart / %</text>
        ${BANDS.map((b, i) => `<rect x="${14 + i*38}" y="40" width="30" height="30" rx="4" fill="rgb(${Math.round(250 - b*60)},${Math.round(230 - b*70)},${Math.round(120 + b*40)})" stroke="#94A3B8"/><text x="${29 + i*38}" y="86" text-anchor="middle" class="k-num">${b}</text>`).join("")}
        <g id="im-strip"></g></g>
      <text x="24" y="34" class="k-status" id="im-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#im-svg"), $ = s => svg.querySelector(s);
    function draw(){
      let s = "";
      if(set === "imm"){
        s += `<rect x="150" y="70" width="70" height="250" rx="6" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><rect x="90" y="60" width="60" height="10" fill="url(#k-metal)"/>`;
        const r = size === "small" ? 4 : 7;
        for(let y = 140; y < 312; y += r*2) for(let x = 156 + r; x < 216; x += r*2) s += `<circle cx="${x}" cy="${y}" r="${r - .6}" fill="#E6C86A" stroke="#B8962E" stroke-width=".6"/>`;
        s += `<rect x="152" y="80" width="66" height="${busy ? 56 : 30}" fill="#F2F5FA" opacity=".9"/><path d="M185 320v40" stroke="var(--txt2)" stroke-width="5"/><rect x="172" y="336" width="26" height="10" rx="2" fill="#B91C1C"/>
          <text x="232" y="230" class="k-lbl">${size} alginate beads</text><text x="232" y="250" class="k-lbl">with lactase · use no. ${run}</text><text x="232" y="346" class="k-lbl">tap: ${time} min contact</text>`;
        if(busy) for(let k = 0; k < 3; k++) s += `<circle cx="185" cy="${364 + ((busy*40 + k*20) % 50)}" r="2.5" fill="#E2E8F0"/>`;
      }else{
        s += `<rect x="130" y="200" width="120" height="150" rx="8" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><rect x="133" y="250" width="114" height="97" rx="6" fill="#F2F5FA" opacity=".9"/>
          <text x="262" y="270" class="k-lbl">lactose + free lactase</text><text x="262" y="290" class="k-lbl">${time} min, then boil to stop</text>`;
        if(busy) s += `<path d="M190 330c-20-20 20-30 0-50" stroke="#94A3B8" fill="none" stroke-width="2"/>`;
      }
      s += `<rect x="140" y="380" width="90" height="70" rx="6" fill="url(#k-glass)" stroke="var(--txt2)"/><rect x="143" y="${last ? 400 : 440}" width="84" height="${last ? 47 : 7}" rx="4" fill="#F6F8FB"/><text x="185" y="470" text-anchor="middle" class="k-lbl">product</text>
        <rect x="400" y="200" width="200" height="140" rx="10" fill="#1F2937"/><text x="500" y="230" text-anchor="middle" style="font:700 10px Inter;fill:#9CA3AF">WATER BATH / COLUMN JACKET</text><text x="500" y="290" text-anchor="middle" class="k-lcd">${T} °C</text>`;
      $("#im-scene").innerHTML = s;
      $("#im-strip").innerHTML = last ? (last.meth === "strip" ? `<rect x="14" y="110" width="170" height="16" rx="3" fill="#F8FAFC" stroke="#CBD5E1"/><rect x="160" y="110" width="24" height="16" fill="rgb(${Math.round(250 - last.g*60)},${Math.round(230 - last.g*70)},${Math.round(120 + last.g*40)})"/><text x="14" y="160" class="k-tag">matches band: ${last.read}%</text>`
        : `<rect x="14" y="110" width="150" height="70" rx="10" fill="#111827"/><text x="150" y="155" text-anchor="end" class="k-lcd">${last.read.toFixed(2)}%</text><text x="14" y="200" class="k-lbl">glucose meter</text>`) : "";
      $("#im-status").textContent = busy ? "Reacting…" : last ? "Measured — record it" : "Choose a set-up and run 20 cm³ of 2% lactose";
      ctx.readout([["Set-up", set === "imm" ? "immobilised" : "free"], ["Temperature", T + " °C"], ["Contact time", time + " min"], ["Use", set === "imm" ? "no. " + run : "fresh enzyme"]]);
    }
    ctx.frame(dt => { if(busy){ busy -= dt; if(busy <= 0){ busy = 0; done(); } draw(); } });
    function done(){
      const g = GMAX*(1 - Math.exp(-k()*time))*(1 + .03*ctx.gauss());
      last = { g, meth, read: meth === "strip" ? strip(g) : Kit.round(g, 2), set, T, time, run };
    }
    ctx.seg({ label:"Enzyme", value:"imm", options:[["imm","Immobilised in beads"],["free","Free in solution"]], onChange(v){ set = v; last = null; draw(); } });
    ctx.seg({ label:"Bead size", value:"small", options:[["small","Small"],["large","Large"]], onChange(v){ size = v; run = 1; last = null; draw(); } });
    ctx.seg({ label:"Contact time (tap setting / time in beaker)", value:3, options:[[1.5,"1.5 min"],[3,"3"],[6,"6"],[10,"10"]], onChange(v){ time = v; draw(); } });
    ctx.slider({ label:"Temperature", min:20, max:70, step:5, value:40, unit:"°C", onInput(v){ T = v; draw(); } });
    ctx.seg({ label:"Measure glucose with", value:"strip", options:[["strip","Test strip"],["meter","Glucose meter"]], onChange(v){ meth = v; } });
    ctx.buttons([{ label:"Run 20 cm³ lactose", primary:true, onClick(){ if(busy) return; last = null; busy = 1.6; draw(); } },
      { label:"Record", onClick(){
        if(!last) return ctx.toast("Run the lactose first");
        ctx.record({ set:last.set === "imm" ? "Immobilised (" + size + ")" : "Free", T:last.T, time:last.time, run:last.set === "imm" ? last.run : 1, meth:last.meth === "strip" ? "test strip" : "glucose meter", g:last.read });
        if(last.set === "imm") run++;
        last = null; draw();
        const rows = ctx.rows(), both = f => ["Free", "Immobilised"].every(p => new Set(rows.filter(r => r.set.startsWith(p)).filter(f).map(r => r.time + "|" + r.T)).size >= 3);
        if(both(r => r.T === 40)) ctx.complete("time");
        if(["Free", "Immobilised"].every(p => [40, 55, 65].every(t => rows.some(r => r.set.startsWith(p) && r.T === t)))) ctx.complete("temp");
        if(rows.some(r => r.run >= 5)) ctx.complete("reuse");
      } }]);
    ctx.buttons([{ label:"Make fresh beads", onClick(){ run = 1; last = null; draw(); ctx.toast("New beads: use no. 1"); } }]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Beads are re-used each time you record. Free enzyme can’t be recovered from the product, so each free run uses fresh lactase.</p>`);
    draw();
  }
});
