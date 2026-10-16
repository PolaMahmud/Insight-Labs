"use strict";
/* ══════════════════════════════════════════════════════════════════
   BIOLOGY (0610, and 9700 AS for enzymes & osmosis) — Photosynthesis ·
                    Enzyme activity · Osmosis in potato
══════════════════════════════════════════════════════════════════ */

/* ───────────── PHOTOSYNTHESIS ───────────── */
Lab.register({
  id:"photosynthesis", subject:"biology", topic:"Plant nutrition", icon:"🌿",
  title:"Rate of photosynthesis",
  summary:"Move a lamp towards pondweed and count oxygen bubbles. Find out what limits the rate.",
  aim:"Investigate the effect of light intensity on the rate of photosynthesis in pondweed, and identify limiting factors.",
  variables:{
    iv:"Distance of the lamp from the pondweed (cm) → light intensity",
    dv:"Rate of photosynthesis (bubbles of oxygen per minute)",
    cv:["Carbon dioxide concentration (NaHCO₃)","Temperature (water bath)","Same piece of pondweed"]
  },
  columns:[{key:"cond",label:"Conditions"},{key:"d",label:"Distance / cm",dp:0},{key:"LI",label:"Light intensity (1/d² × 10⁴)",dp:1},{key:"rate",label:"Bubbles per min",dp:0}],
  series:"cond",
  graph:{ x:["d","LI"], y:["rate"], fit:"curve" },
  questions:[
    { q:"Write the word equation for photosynthesis.",
      a:"carbon dioxide + water → glucose + oxygen (in the presence of light and chlorophyll)." },
    { q:"Light intensity is proportional to 1/d². If the lamp moves from 20 cm to 10 cm, what happens to the light intensity?",
      a:"It increases four times: (20/10)² = 4." },
    { q:"Plot rate against light intensity. Why does the graph level off?",
      a:"At high light intensity another factor — carbon dioxide concentration or temperature — becomes the limiting factor, so increasing light no longer increases the rate." },
    { q:"Why should the lamp be an LED, or a heat filter (beaker of water) be placed between the lamp and the pondweed?",
      a:"A filament lamp also heats the water. Temperature is a control variable, so heat must not change as the lamp moves closer." },
    { q:"Why is counting bubbles not a very accurate way to measure the rate?",
      a:"Bubbles can be different sizes and may be hard to count when fast. Collecting the gas in a capillary tube / measuring its volume is more accurate." }
  ],
  setup(ctx){
    let d = 20, co2 = 0.2, temp = 25, counting = false, count = 0, tcount = 0;
    const LI = () => 10000/(d*d);
    const fT = T => T <= 35 ? Math.pow(2, (T - 35)/10) : Math.max(0, 1 - Math.pow((T - 35)/10, 2));
    const rate = () => Math.min(62*LI()/(LI() + 25), 70*co2/(co2 + 0.1))*fT(temp);
    const cond = () => `${co2}% NaHCO₃, ${temp} °C`;

    ctx.stage.innerHTML = `
    <svg viewBox="0 0 540 330" aria-label="Lamp shining on pondweed in a boiling tube inside a water bath">
      <defs>
        <radialGradient id="ps-glow"><stop offset="0" stop-color="#FFE27A" stop-opacity=".9"/><stop offset="1" stop-color="#FFE27A" stop-opacity="0"/></radialGradient>
        <clipPath id="ps-tube"><rect x="402" y="70" width="36" height="200" rx="18"/></clipPath>
      </defs>
      <line x1="40" y1="290" x2="500" y2="290" stroke="var(--brd)" stroke-width="2"/>
      <g id="ps-beam"></g>
      <rect x="360" y="110" width="120" height="175" rx="6" fill="var(--sec-lt)" stroke="var(--txt2)" stroke-width="1.4" opacity=".9"/>
      <text class="lbl" x="420" y="100" text-anchor="middle" id="ps-tlbl"></text>
      <rect x="402" y="70" width="36" height="200" rx="18" fill="rgba(200,225,240,.5)"/>
      <path d="M420 262 C412 240 428 222 416 200 C406 182 428 168 418 150" stroke="#2E8B3D" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M418 230 l-12 -6 M420 210 l12 -7 M414 185 l-11 -4 M421 165 l12 -6" stroke="#3BA34C" stroke-width="4" stroke-linecap="round"/>
      <g id="ps-bub" clip-path="url(#ps-tube)"></g>
      <rect x="402" y="70" width="36" height="200" rx="18" class="glass" fill="none"/>
      <g id="ps-lamp">
        <circle cx="0" cy="190" r="70" fill="url(#ps-glow)" id="ps-halo"/>
        <path d="M-22 160 L18 175 V205 L-22 220 Z" fill="var(--txt3)"/>
        <rect x="-34" y="180" width="14" height="20" fill="var(--txt3)"/>
        <rect x="-30" y="200" width="6" height="90" fill="var(--txt3)"/>
        <rect x="-50" y="284" width="46" height="8" rx="2" fill="var(--txt3)"/>
      </g>
      <g id="ps-dim"></g>
      <g transform="translate(20 20)"><rect width="150" height="60" rx="10" fill="var(--bg-card)" stroke="var(--brd)"/>
        <text class="lbl" x="12" y="22" id="ps-cl">Bubble counter</text><text class="lblb" id="ps-count" x="12" y="48" style="font-size:20px">—</text></g>
    </svg>`;
    const $ = s => ctx.stage.querySelector(s);
    const bubbles = [];
    let acc = 0;

    function draw(){
      const lx = 400 - d*6.4;
      $("#ps-lamp").setAttribute("transform", `translate(${lx} 0)`);
      $("#ps-halo").setAttribute("opacity", Math.min(1, .25 + LI()/80).toFixed(2));
      $("#ps-beam").innerHTML = `<path d="M${lx + 18} 175 L402 150 V230 L${lx + 18} 205 Z" fill="#FFE27A" opacity="${Math.min(.45, .06 + LI()/400).toFixed(2)}"/>`;
      $("#ps-dim").innerHTML = `<path d="M${lx + 18} 312 H402" stroke="var(--txt2)" stroke-width="1"/><path d="M${lx + 18} 306 v12 M402 306 v12" stroke="var(--txt2)"/>
        <text class="lbl" x="${(lx + 420)/2}" y="326" text-anchor="middle">d = ${d} cm</text>`;
      $("#ps-tlbl").textContent = `water bath ${temp} °C · ${co2}% NaHCO₃`;
      ctx.readout([["Distance", d + " cm"], ["Light intensity", LI().toFixed(1) + " a.u."], ["Temperature", temp + " °C"], ["CO₂ source", co2 + "% NaHCO₃"]]);
    }

    ctx.frame(dt => {
      // real-time bubbling (or 10× faster while counting a "minute")
      const speed = counting ? 10 : 1;
      acc += rate()/60*dt*speed*(0.6 + 0.8*Math.random());
      while(acc >= 1){ acc -= 1; bubbles.push({ y:150, x:418 + (Math.random() - .5)*4, r:2 + Math.random()*1.5 }); if(counting) count++; }
      for(let i = bubbles.length - 1; i >= 0; i--){ bubbles[i].y -= (counting ? 150 : 60)*dt; if(bubbles[i].y < 74) bubbles.splice(i, 1); }
      $("#ps-bub").innerHTML = bubbles.map(b => `<circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="rgba(255,255,255,.85)" stroke="var(--txt2)" stroke-width=".7"/>`).join("");
      if(counting){
        tcount += dt*speed;
        $("#ps-count").textContent = `${count} · ${Math.min(60, Math.floor(tcount))} s`;
        if(tcount >= 60){
          counting = false; lock(false);
          const n = Math.max(0, Math.round(count));
          $("#ps-count").textContent = n + " per min";
          ctx.record({ cond:cond(), d, LI:Number(LI().toFixed(1)), rate:n });
        }
      }
    });

    const ds = ctx.slider({ label:"Lamp distance", min:5, max:50, step:5, value:d, unit:"cm", onInput(v){ d = v; draw(); } });
    const cs = ctx.seg({ label:"Sodium hydrogencarbonate (CO₂ source)", value:co2, options:[[0.05,"0.05%"],[0.1,"0.1%"],[0.2,"0.2%"],[0.4,"0.4%"]], onChange(v){ co2 = v; draw(); } });
    const ts = ctx.slider({ label:"Water bath temperature", min:15, max:45, step:5, value:temp, unit:"°C", onInput(v){ temp = v; draw(); } });
    const [cb] = ctx.buttons([{ label:"Count bubbles for 1 minute", primary:true, block:true, onClick(){
      if(counting) return;
      counting = true; count = 0; tcount = 0; acc = Math.random(); lock(true);
    } }]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">The minute is sped up ×10. Leave the pondweed to adjust for a moment after moving the lamp, then count. Repeat each distance to spot anomalies.</p>`);
    function lock(on){ ds.disable(on); cs.disable(on); ts.disable(on); cb.disabled = on; }
    draw();
  }
});

/* ───────────── ENZYME ACTIVITY ───────────── */
Lab.register({
  id:"enzymes", subject:"biology", level:["igcse","as"], topic:"Enzymes", icon:"🧫",
  title:"Amylase activity: temperature & pH",
  summary:"Time how long amylase takes to digest starch, sampling with iodine on a spotting tile.",
  aim:"Investigate the effect of temperature and pH on the rate of starch digestion by amylase.",
  variables:{
    iv:"Temperature (°C) or pH — change one at a time",
    dv:"Time for starch to be fully digested (s), when iodine stays orange-brown",
    cv:["Volume and concentration of starch and amylase","The other variable (pH buffer or temperature)","Sampling interval of 30 s"]
  },
  columns:[{key:"T",label:"Temperature / °C",dp:0},{key:"pH",label:"pH",dp:0},{key:"t",label:"Time to digest / s"},{key:"rate",label:"Rate (1000 ÷ t) / s⁻¹",dp:2}],
  graph:{ x:["T","pH"], y:["rate"], fit:"curve" },
  questions:[
    { q:"Describe what the iodine test shows at each sample.",
      a:"Blue-black means starch is still present. Orange-brown (the colour of iodine) means all the starch has been digested to maltose." },
    { q:"Explain why the rate increases from 10 °C to about 40 °C.",
      a:"Enzyme and substrate molecules have more kinetic energy, so they collide more often and more enzyme–substrate complexes form per second." },
    { q:"Explain why no digestion happens at 60 °C.",
      a:"The enzyme is denatured: the shape of its active site changes permanently, so starch no longer fits (it is no longer complementary) and no enzyme–substrate complexes form." },
    { q:"Sampling every 30 s limits the accuracy. How could the method be improved?",
      a:"Sample more frequently (e.g. every 10 s), use a colorimeter to measure the colour change, and repeat each temperature three times to calculate a mean." },
    { q:"(AS) This method measures the disappearance of substrate. Name an enzyme investigation that measures the appearance of product instead.",
      a:"Catalase breaking down hydrogen peroxide: the volume of oxygen collected over time (gas syringe or upturned measuring cylinder) measures product formation." },
    { q:"(AS) Sampling every 30 s, what is the uncertainty in each end-point time, and why does it matter more at high temperatures?",
      a:"The end point lies somewhere in the 30 s since the last sample, so about ±15 s (half the interval). At the optimum the end point is only 60–90 s, so ±15 s is a large percentage uncertainty; at low rates it is small." }
  ],
  setup(ctx){
    let T = 35, pH = 7, running = false, t = 0, wells = [], doneAt = null;
    const STEP = 30, N = 20, TMAX = STEP*N;
    const fT = T => T <= 40 ? Math.pow(2, (T - 40)/10) : Math.max(0, 1 - Math.pow((T - 40)/20, 2));
    const fpH = p => Math.exp(-Math.pow((p - 7)/1.6, 2));
    const tc = () => { const a = fT(T)*fpH(pH); return a > 0.005 ? 80/a : Infinity; };
    let tcRun = tc();

    function colour(S){
      if(S <= 0) return [205,130,50];
      if(S >= 0.5) return [32,30,78];
      const f = (0.5 - S)/0.5;
      return [Math.round(32 + (140 - 32)*f), Math.round(30 + (85 - 30)*f), Math.round(78 + (70 - 78)*f)];
    }

    let wellsSvg = "";
    for(let i=0;i<N;i++){
      const x = 290 + (i % 5)*44, y = 70 + Math.floor(i/5)*58;
      wellsSvg += `<circle id="en-w${i}" cx="${x}" cy="${y}" r="16" fill="var(--bg)" stroke="var(--txt3)"/><text class="lbl" x="${x}" y="${y + 30}" text-anchor="middle" style="font-size:10px">${(i + 1)*STEP}s</text>`;
    }
    ctx.stage.innerHTML = `
    <svg viewBox="0 0 530 320" aria-label="Test tube of starch and amylase in a water bath, and a spotting tile">
      <rect x="20" y="110" width="170" height="170" rx="8" fill="var(--sec-lt)" stroke="var(--txt2)" stroke-width="1.3" id="en-bath"/>
      <rect x="70" y="40" width="30" height="210" rx="15" fill="rgba(225,230,240,.6)" stroke="var(--txt2)" stroke-width="1.4"/>
      <rect x="72" y="140" width="26" height="108" rx="12" id="en-liq" fill="rgba(210,215,230,.85)"/>
      <rect x="130" y="30" width="8" height="220" rx="4" fill="var(--bg-card)" stroke="var(--txt2)"/>
      <rect x="131.5" id="en-merc" width="5" fill="#E04040"/><circle cx="134" cy="252" r="8" fill="#E04040"/>
      <text class="lbl" x="105" y="300" text-anchor="middle" id="en-blbl"></text>
      <rect x="265" y="40" width="240" height="245" rx="10" fill="var(--bg-card)" stroke="var(--brd)"/>
      ${wellsSvg}
      <text class="lbl" x="385" y="306" text-anchor="middle">spotting tile with iodine</text>
      <g transform="translate(20 20)"><rect width="140" height="56" rx="10" fill="var(--bg-card)" stroke="var(--brd)"/>
        <text class="lbl" x="12" y="20">Stopwatch</text><text class="lblb" id="en-clock" x="12" y="44" style="font-size:20px">0 s</text></g>
    </svg>`;
    const $ = s => ctx.stage.querySelector(s);

    function draw(){
      const m = 245 - (T/80)*200;
      $("#en-merc").setAttribute("y", m); $("#en-merc").setAttribute("height", 250 - m);
      $("#en-blbl").textContent = `water bath ${T} °C · pH ${pH} buffer`;
      $("#en-bath").setAttribute("fill", T >= 45 ? "var(--hi-lt)" : "var(--sec-lt)");
      $("#en-clock").textContent = Math.floor(t) + " s";
      for(let i=0;i<N;i++){
        const w = wells[i], e = $("#en-w" + i);
        e.setAttribute("fill", w ? `rgb(${w})` : "var(--bg)");
      }
      ctx.readout([["Temperature", T + " °C"], ["pH", String(pH)], ["Time", Math.floor(t) + " s"],
        doneAt !== null ? ["End point", doneAt + " s", "good"] : running ? ["Status", "sampling…"] : ["Status", t >= TMAX ? "starch not digested in 10 min" : "ready", t >= TMAX ? "warn" : ""]]);
    }

    ctx.frame(dt => {
      if(!running) return;
      t += dt*75;                                    // 30 s of experiment every 0.4 s
      while(wells.length < N && t >= (wells.length + 1)*STEP){
        const ts = (wells.length + 1)*STEP, S = Math.max(0, 1 - ts/tcRun);
        wells.push(colour(S));
        if(S <= 0 && doneAt === null) doneAt = ts;
      }
      if(doneAt !== null && t >= doneAt + STEP || t >= TMAX){
        running = false; lock(false);
        if(doneAt !== null) ctx.record({ T, pH, t:doneAt, rate:Number((1000/doneAt).toFixed(2)) });
        else ctx.record({ T, pH, t:"> 600", rate:0 });
      }
      draw();
    });

    const tsl = ctx.slider({ label:"Temperature", min:10, max:70, step:5, value:T, unit:"°C", onInput(v){ T = v; reset(); } });
    const psl = ctx.slider({ label:"pH (buffer solution)", min:3, max:11, step:1, value:pH, onInput(v){ pH = v; reset(); } });
    const [go] = ctx.buttons([{ label:"Mix starch + amylase & start", primary:true, block:true, onClick(){
      reset(); tcRun = tc(); running = true; lock(true);
    } }]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">A drop of the mixture is added to iodine every 30 s. The result is recorded automatically when the iodine stays orange-brown.</p>`);
    function lock(on){ tsl.disable(on); psl.disable(on); go.disabled = on; }
    function reset(){ running = false; t = 0; wells = []; doneAt = null; draw(); }
    draw();
  }
});

/* ───────────── OSMOSIS ───────────── */
Lab.register({
  id:"osmosis", subject:"biology", level:["igcse","as"], topic:"Movement into and out of cells · Water potential", icon:"🥔",
  title:"Osmosis in potato cylinders",
  summary:"Soak potato in sucrose solutions, measure % change in mass and estimate the concentration of the cell sap.",
  aim:"Investigate the effect of sucrose concentration on the change in mass of potato tissue, and estimate the concentration of potato cell sap.",
  variables:{
    iv:"Concentration of sucrose solution (mol/dm³)",
    dv:"Percentage change in mass of the potato cylinder",
    cv:["Same potato, same length & diameter of cylinder","Same time in solution (30 min)","Same temperature","Blotted dry the same way"]
  },
  columns:[{key:"c",label:"Sucrose / mol/dm³",dp:1},{key:"m0",label:"Initial mass / g",dp:2},{key:"m1",label:"Final mass / g",dp:2},{key:"pct",label:"Change in mass / %",dp:1}],
  graph:{ x:["c"], y:["pct"], fit:"linear" },
  questions:[
    { q:"Why is percentage change in mass calculated, rather than just the change in mass?",
      a:"The cylinders start with slightly different masses. Percentage change lets you compare them fairly." },
    { q:"Explain why the cylinder in distilled water gains mass.",
      a:"Water moves into the potato cells by osmosis, from a dilute solution (high water potential) to a more concentrated solution (lower water potential) inside the cells, through the partially permeable cell membrane." },
    { q:"Use your graph to estimate the concentration of the potato cell sap.",
      a:"Read where the line crosses the x-axis (0% change). At that concentration there is no net movement of water, so the solution has the same concentration as the cell sap." },
    { q:"What happens if you forget to blot the cylinders dry?",
      a:"Surface solution is weighed as well, so final masses are too high — a systematic error that shifts all the results upwards." },
    { q:"(AS) Use water potential to explain the result at the x-intercept.",
      a:"At this concentration the water potential of the solution equals the water potential of the potato tissue, so there is no net movement of water by osmosis and no change in mass. So the water potential of the potato tissue is the same as the water potential of that sucrose solution." },
    { q:"(AS) The balance reads to 0.01 g. What is the percentage uncertainty in a mass change of 0.12 g?",
      a:"Each mass is ±0.005 g, and the change is a difference of two readings, so ±0.01 g. 0.01 ÷ 0.12 × 100 ≈ ±8%. Using larger cylinders, or more of them per tube, would reduce it." }
  ],
  setup(ctx){
    const ISO = 0.25 + Math.round(Math.random()*10)/100;            // unique cell-sap concentration per visit
    let c = 0.0, stage = 0, m0 = 0, m1 = 0, blot = true, soakT = 0;
    const pctTrue = c => -40*(c - ISO)/(1 + 1.5*c);

    ctx.stage.innerHTML = `
    <svg viewBox="0 0 520 300" aria-label="Potato cylinder in a beaker of sucrose solution next to a balance">
      <rect x="40" y="90" width="150" height="170" rx="6" class="glass"/>
      <rect x="42" y="130" width="146" height="128" id="os-sol" rx="4"/>
      <rect id="os-cyl" rx="10" fill="#E9D9A6" stroke="#B8A26A" stroke-width="1.4"/>
      <text class="lbl" x="115" y="282" text-anchor="middle" id="os-lbl"></text>
      <rect x="300" y="200" width="180" height="60" rx="8" fill="var(--txt3)"/>
      <rect x="320" y="214" width="140" height="34" rx="4" fill="#132A1F"/>
      <text id="os-bal" x="450" y="239" text-anchor="end" style="font:600 20px ui-monospace,Menlo,monospace;fill:#7CFFB2">0.00 g</text>
      <rect x="320" y="186" width="140" height="10" rx="3" fill="var(--txt2)"/>
      <rect id="os-cyl2" rx="8" fill="#E9D9A6" stroke="#B8A26A" stroke-width="1.2" opacity="0"/>
      <g transform="translate(300 40)"><rect width="180" height="100" rx="10" fill="var(--bg-card)" stroke="var(--brd)"/>
        <text class="lbl" x="12" y="24">Step</text><text class="lblb" id="os-step" x="12" y="50"></text>
        <text class="lbl" x="12" y="78" id="os-sub"></text></g>
    </svg>`;
    const $ = s => ctx.stage.querySelector(s);
    const STEPS = ["Cut a cylinder & weigh it", "Leave in solution for 30 min", "Blot dry & reweigh", "Record the result"];

    function draw(){
      const shade = Math.round(235 - c*90);
      $("#os-sol").setAttribute("fill", `rgba(${shade},${shade + 8},${Math.min(255, shade + 20)},.75)`);
      $("#os-lbl").textContent = `${c.toFixed(1)} mol/dm³ sucrose`;
      const ratio = stage >= 2 ? m1/m0 : 1 + (stage === 1 ? (pctTrue(c)/100)*Math.min(1, soakT) : 0);
      const L = 90*ratio, W = 22*Math.sqrt(ratio);
      $("#os-cyl").setAttribute("opacity", stage === 1 ? 1 : 0);
      $("#os-cyl").setAttribute("x", 115 - L/2); $("#os-cyl").setAttribute("y", 230 - W); $("#os-cyl").setAttribute("width", L); $("#os-cyl").setAttribute("height", W);
      const onBal = stage === 0 && m0 || stage >= 2;
      const c2 = $("#os-cyl2");
      c2.setAttribute("opacity", onBal ? 1 : 0);
      c2.setAttribute("x", 390 - L/2); c2.setAttribute("y", 186 - W); c2.setAttribute("width", L); c2.setAttribute("height", W);
      $("#os-bal").textContent = (onBal ? (stage >= 2 ? m1 : m0) : 0).toFixed(2) + " g";
      $("#os-step").textContent = STEPS[!m0 ? 0 : stage === 0 ? 1 : stage === 1 ? (soakT < 1 ? 1 : 2) : 3];
      $("#os-sub").textContent = stage === 1 ? `soaking… ${Math.round(Math.min(1, soakT)*30)} min` : m0 ? `initial ${m0.toFixed(2)} g` : "";
      ctx.readout([["Solution", c.toFixed(1) + " mol/dm³"], ["Initial mass", m0 ? m0.toFixed(2) + " g" : "—"], ["Final mass", stage >= 2 ? m1.toFixed(2) + " g" : "—"],
        ...(stage >= 2 ? [["Change", ((m1 - m0)/m0*100).toFixed(1) + " %", m1 >= m0 ? "good" : "warn"]] : [])]);
      btnCut.disabled = stage !== 0 || !!m0; btnSoak.disabled = !(stage === 0 && m0); btnWeigh.disabled = stage !== 1 || soakT < 1; btnRec.disabled = stage !== 2;
      csl.disable(stage !== 0 || !!m0);
    }

    ctx.frame(dt => {
      if(stage === 1 && soakT < 1){ soakT = Math.min(1, soakT + dt/3); draw(); }
    });

    const csl = ctx.seg({ label:"Sucrose concentration (mol/dm³)", value:0, options:[[0,"0.0"],[0.2,"0.2"],[0.4,"0.4"],[0.6,"0.6"],[0.8,"0.8"],[1.0,"1.0"]], onChange(v){ c = v; draw(); } });
    ctx.seg({ label:"Before reweighing", value:true, options:[[true,"Blot dry"],[false,"Don’t blot"]], onChange(v){ blot = v; } });
    const [btnCut, btnSoak] = ctx.buttons([
      { label:"1 · Cut & weigh", onClick(){ m0 = Math.round((2.2 + Math.random()*0.6)*100)/100; draw(); } },
      { label:"2 · Soak 30 min", onClick(){ stage = 1; soakT = 0; draw(); } }
    ]);
    const [btnWeigh, btnRec] = ctx.buttons([
      { label:"3 · Reweigh", onClick(){
        const pct = pctTrue(c) + 0.8*ctx.gauss();
        m1 = Math.round((m0*(1 + pct/100) + (blot ? 0 : 0.10 + Math.random()*0.06))*100)/100;
        stage = 2; draw(); } },
      { label:"4 · Record", primary:true, onClick(){
        ctx.record({ c, m0, m1, pct:Number(((m1 - m0)/m0*100).toFixed(1)) });
        stage = 0; m0 = 0; m1 = 0; soakT = 0; draw(); } }
    ]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Test every concentration (ideally twice). The x-intercept of the best-fit line estimates the cell-sap concentration.</p>`);
    draw();
  }
});
