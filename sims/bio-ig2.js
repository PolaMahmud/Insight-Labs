"use strict";
/* ══════════════════════════════════════════════════════════════════
   BIOLOGY · IGCSE (0610) — part 2: respiration, germination, tropisms
   Yeast respiration & temperature · Heat and oxygen from germinating
   peas · Conditions for germination · Phototropism & gravitropism
══════════════════════════════════════════════════════════════════ */

/* ───────────── YEAST: TEMPERATURE & ANAEROBIC RESPIRATION ───────────── */
Lab.register({
  id:"yeastresp", subject:"biology", level:["igcse"], topic:"Respiration · Anaerobic respiration", interactive:true,
  title:"Temperature and anaerobic respiration in yeast",
  summary:"Stand a tube of yeast and glucose under an oil layer in a water bath, then count the bubbles of carbon dioxide that come out of the delivery tube in one minute. Repeat at different temperatures and with boiled yeast.",
  aim:"Investigate the effect of temperature on the rate of anaerobic respiration in yeast by counting bubbles of carbon dioxide released per minute.",
  variables:{ iv:"Temperature of the water bath (°C)", dv:"Number of bubbles of carbon dioxide released per minute", cv:["Same mass of yeast and volume of glucose solution","Same concentration of glucose","Same depth of oil layer","Tube left to reach the bath temperature before counting","Same counting time (1 minute)"] },
  stageTitle:"Water bath & delivery tube", controlsTitle:"Set up & count",
  thumb:`<svg viewBox="0 0 300 140"><rect x="20" y="60" width="120" height="74" rx="6" fill="#8EC5F5" opacity=".5" stroke="#4C86C6"/><rect x="62" y="30" width="20" height="94" rx="10" fill="#fff" opacity=".6" stroke="#64748B"/><rect x="63" y="70" width="18" height="52" rx="8" fill="#E8D9B0"/><rect x="63" y="64" width="18" height="7" fill="#F2D35B"/><path d="M72 30V14H220V112" stroke="#64748B" stroke-width="4" fill="none"/><rect x="208" y="50" width="24" height="84" rx="12" fill="#EAF3F8" stroke="#64748B"/>${[118, 100, 82].map(y => `<circle cx="220" cy="${y}" r="4" fill="#fff" stroke="#4C86C6"/>`).join("")}</svg>`,
  steps:[
    { id:"set",   text:"Set the water bath temperature" },
    { id:"equil", text:"Leave the tube to reach the bath temperature" },
    { id:"count", text:"Count the bubbles released in 1 minute" },
    { id:"read",  text:"Read the thermometer in the bath" },
    { id:"record",text:"Record the rate" }
  ],
  challenges:[
    { id:"five",     title:"Five temperatures", text:"Record the rate with live yeast at five different temperatures." },
    { id:"control",  title:"Boiled yeast control", text:"Record a count with boiled yeast." },
    { id:"accurate", title:"Careful counter", text:"Count every bubble in a minute (within one) when at least 8 bubbles are released." },
    { id:"optimum",  title:"Optimum", text:"Use your results to state the optimum temperature." }
  ],
  columns:[{key:"cont",label:"Contents of tube"},{key:"T",label:"Temperature / °C",dp:1},{key:"n",label:"Bubbles counted",dp:0},{key:"t",label:"Time / s",dp:0},{key:"rate",label:"Rate / bubbles per minute",dp:1}],
  series:"cont",
  graph:{ x:["T"], y:["rate"], fit:"curve" },
  questions:[
    { q:"Why is a layer of oil put on top of the yeast and glucose mixture? Why is the glucose solution boiled and cooled before the yeast is added?",
      a:"Boiling removes dissolved oxygen from the solution, and the oil layer stops oxygen from the air dissolving back in. So the yeast must respire anaerobically. The solution is cooled first so the heat does not kill the yeast." },
    { q:"Why is the tube left in the water bath for several minutes before counting starts?",
      a:"So the mixture reaches the temperature of the bath. If you count straight away, the temperature of the yeast is not the one you recorded, and the air in the tube expands as it warms and gives bubbles that do not come from respiration." },
    { q:"Describe and explain the effect of temperature on the rate of bubbling.",
      a:"The rate increases up to an optimum of about 35–40 °C. Molecules have more kinetic energy, so enzymes and substrates collide more often and more enzyme–substrate complexes form. Above the optimum the rate falls quickly: the enzymes are denatured — the shape of the active site changes so glucose no longer fits. At about 60 °C there are no bubbles." },
    { q:"What is the purpose of the boiled yeast tube? Write the word equation for anaerobic respiration in yeast.",
      a:"Boiling kills the yeast (denatures its enzymes). No bubbles shows the carbon dioxide comes from respiration by living yeast, not from a chemical reaction or from air expanding. Glucose → ethanol + carbon dioxide. Limewater turns milky (cloudy), showing the gas is carbon dioxide." },
    { q:"A student counted 23 bubbles in 50 seconds. Calculate the rate in bubbles per minute.",
      a:"Rate = 23 ÷ 50 × 60 = 27.6 bubbles per minute (28 to 2 s.f.)." },
    { q:"Suggest limitations of this method and improvements. Assess the risk.",
      a:"Bubbles are not all the same size, so counting is not an accurate measure of volume — collect the gas in a gas syringe or an upturned measuring cylinder of water. Bubbles can be missed when they come fast — repeat each temperature three times and calculate a mean. Yeast settles — stir before each count. Risk is low: water at 60–70 °C can scald, so handle tubes with a holder; wipe up spills and wash hands after handling yeast." }
  ],
  setup(ctx){
    const SPEED = 2, K = 8.5*(0.9 + 0.2*Math.random());
    const CONT = { live:{ name:"Live yeast + glucose", f:1, col:"#E8D9B0" }, boiled:{ name:"Boiled yeast + glucose", f:0, col:"#D4C18E" }, noglu:{ name:"Live yeast, no glucose", f:.06, col:"#EADFC0" } };
    const rateAt = T => K*Math.pow(2, (T - 20)/10)/(1 + Math.exp((T - 46)/2.5));
    let cont = "live", set = 30, target = 20 + .4*ctx.gauss(), shown = target, tube = null;
    let count = 0, trueCount = 0, bubbles = [], Tread = null, lime = 0, flash = 0;
    const sw = Kit.stopwatch("yr-sw", 740, 330);
    const th = Kit.thermometer("yr-th", 392, 110, 240, 0, 80, 10);
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="yr-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 440)}
      <rect x="60" y="220" width="400" height="220" rx="8" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
      <rect x="63" y="250" width="394" height="187" rx="6" fill="url(#k-water)"/>
      <rect x="74" y="396" width="104" height="32" rx="5" fill="#1F2937" stroke="#4B5563"/><text x="126" y="417" text-anchor="middle" style="font:600 11px 'JetBrains Mono';fill:#7CFFB2" id="yr-set"></text>
      <text x="200" y="430" class="k-lbl">thermostatic water bath</text>
      <path d="M212 140V96H600V392" stroke="#94A3B8" stroke-width="7" fill="none" stroke-linejoin="round"/><path d="M212 140V96H600V392" stroke="#F8FAFC" stroke-width="3" fill="none" stroke-linejoin="round" opacity=".7"/>
      <rect x="192" y="150" width="40" height="262" rx="20" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
      <rect x="194" y="276" width="36" height="134" rx="17" id="yr-sus"/>
      <rect x="194" y="262" width="36" height="14" fill="#F2D35B" opacity=".9"/>
      <rect x="188" y="138" width="48" height="20" rx="4" fill="#6B4F3A"/>
      <line x1="236" y1="269" x2="290" y2="200" stroke="var(--txt3)"/><text x="294" y="198" class="k-lbl">oil layer</text>
      <line x1="192" y1="330" x2="150" y2="206" stroke="var(--txt3)"/><text x="66" y="200" class="k-lbl" id="yr-cl"></text>
      <rect x="580" y="210" width="40" height="212" rx="20" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
      <rect x="582" y="272" width="36" height="148" rx="17" fill="#EAF3F8" opacity=".85"/>
      <rect x="582" y="272" width="36" height="148" rx="17" fill="#FFFFFF" id="yr-lime" opacity="0"/>
      <text x="600" y="448" text-anchor="middle" class="k-lbl" style="fill:var(--txt2)">limewater</text>
      <g id="yr-bub"></g>
      ${th.svg}
      <g class="k-btn" id="yr-cnt"><rect x="740" y="190" width="168" height="120" rx="14" fill="#1F2937" stroke="#4B5563" stroke-width="1.5" id="yr-cntbg"/>
        <text x="824" y="216" text-anchor="middle" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.06em">TALLY COUNTER</text>
        <text x="824" y="262" text-anchor="middle" style="font:600 34px 'JetBrains Mono';fill:#E5E7EB" id="yr-n">0</text>
        <text x="824" y="294" text-anchor="middle" style="font:600 11px Inter;fill:#7CFFB2">tap for each bubble</text></g>
      ${sw.svg}
      <text x="24" y="34" class="k-status" id="yr-status"></text>
      <text x="24" y="56" class="k-lbl" id="yr-sub"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#yr-svg"), $ = s => svg.querySelector(s);
    sw.bind(svg, s => {
      if(s.running && s.t === 0){ count = 0; trueCount = 0; }
      if(!s.running && s.t === 0){ count = 0; trueCount = 0; }
      if(!s.running && s.t > 0) ctx.step("count");
    });
    $("#yr-cnt").addEventListener("pointerdown", e => {
      e.preventDefault();
      if(!sw.running) return ctx.toast("Start the stopwatch, then tap once for each bubble");
      count++; flash = .12;
    });
    function gap(){ const r = tube ? tube.r : 0; if(r < .05) return Infinity; return 60/r*(.6 + .8*Math.random()); }
    function statics(){
      $("#yr-set").textContent = "SET " + set + " °C";
      $("#yr-sus").setAttribute("fill", CONT[tube ? tube.cont : cont].col);
      $("#yr-cl").textContent = (tube ? CONT[tube.cont] : CONT[cont]).name.toLowerCase();
    }
    function status(){
      $("#yr-status").textContent = !tube ? "Set the bath, choose the contents and put the tube in" : !tube.eq ? "Leaving the tube for 10 minutes to reach the bath temperature…" : sw.running ? "Counting — tap the counter for every bubble" : sw.t > 0 ? "Read the thermometer, then record" : "Start the stopwatch and count bubbles for 1 minute";
      $("#yr-sub").textContent = `Time runs ×${SPEED} — stop the stopwatch at 60 s`;
    }
    ctx.frame(dt => {
      shown += (target - shown)*Math.min(1, dt*2.5);
      sw.tick(dt*SPEED);
      if(tube){
        if(!tube.eq){
          tube.eqT += dt;
          if(tube.eqT > 1.6){ tube.eq = true; shown = target; tube.clock = 0; tube.next = gap(); ctx.step("equil"); ctx.toast("10 minutes later: the tube is at the bath temperature"); }
        }else{
          tube.clock += dt*SPEED;
          while(tube.clock >= tube.next){ bubbles.push({ y:392, x:600 + (Math.random() - .5)*6, r:3.5 + Math.random()*1.5 }); if(sw.running) trueCount++; lime++; tube.next += gap(); }
        }
      }
      for(let i = bubbles.length - 1; i >= 0; i--){ bubbles[i].y -= dt*170; if(bubbles[i].y < 278) bubbles.splice(i, 1); }
      $("#yr-bub").innerHTML = bubbles.map(b => `<circle cx="${b.x.toFixed(1)}" cy="${b.y.toFixed(1)}" r="${b.r.toFixed(1)}" fill="#fff" fill-opacity=".7" stroke="#4C86C6" stroke-width="1"/>`).join("");
      th.set(svg, shown);
      $("#yr-lime").setAttribute("opacity", Math.min(.8, lime/90).toFixed(3));
      $("#yr-n").textContent = count;
      flash = Math.max(0, flash - dt);
      $("#yr-cntbg").setAttribute("stroke", flash > 0 ? "#7CFFB2" : "#4B5563");
      status();
    });
    function removeTube(){ tube = null; bubbles = []; sw.reset(); count = 0; trueCount = 0; Tread = null; rd.clear(); statics(); }
    ctx.slider({ label:"Water bath setting", min:10, max:70, step:5, value:30, unit:"°C", onInput(v){
      set = v; target = v + .5*ctx.gauss(); if(tube) ctx.toast("Tube taken out while the bath changes temperature");
      removeTube(); ctx.resetSteps(); ctx.step("set");
    } });
    ctx.seg({ label:"Contents of the tube", value:"live", options:[["live","Live yeast + glucose"],["boiled","Boiled yeast + glucose"],["noglu","Yeast, no glucose"]], onChange(v){
      cont = v; if(tube){ ctx.toast("New tube needed — put it in the bath again"); removeTube(); } statics();
    } });
    ctx.buttons([{ label:"Put tube in bath & leave 10 min", primary:true, onClick(){
      if(tube) return ctx.toast("The tube is already in the bath");
      ctx.step("set");
      tube = { cont, eq:false, eqT:0, clock:0, next:Infinity, r:Math.max(0, rateAt(target)*CONT[cont].f*(1 + .08*ctx.gauss())) };
      sw.reset(); count = 0; trueCount = 0; Tread = null; rd.clear(); statics();
    } }, { label:"Take tube out", onClick(){ removeTube(); } }]);
    const rd = Kit.reading(ctx, "Bath temperature from the thermometer / °C", "e.g. 35", () => Kit.round(shown, 1), 1, v => { Tread = v; ctx.step("read"); ctx.toast("Temperature noted: " + v + " °C"); });
    ctx.buttons([{ label:"Record rate", primary:true, block:true, onClick(){
      if(!tube || !tube.eq) return ctx.toast("Put the tube in the bath and let it reach the bath temperature first");
      if(sw.running) return ctx.toast("Stop the stopwatch first");
      if(sw.t < 55 || sw.t > 65) return ctx.toast("Count for 1 minute: stop the stopwatch at about 60 s (reset and try again)");
      if(Tread === null) return ctx.toast("Read the thermometer first");
      const rate = count/sw.t*60;
      ctx.record({ cont:CONT[tube.cont].name, T:Tread, n:count, t:Kit.round(sw.t, 0), rate:Kit.round(rate, 1) });
      ctx.step("record");
      if(trueCount >= 8 && Math.abs(count - trueCount) <= 1) ctx.complete("accurate");
      else if(Math.abs(count - trueCount) > 1) ctx.toast(`You counted ${count}, but ${trueCount} bubbles came out while the stopwatch ran`);
      const rows = ctx.rows();
      if(new Set(rows.filter(r => r.cont === CONT.live.name).map(r => Math.round(r.T/2.5))).size >= 5) ctx.complete("five");
      if(rows.some(r => r.cont === CONT.boiled.name)) ctx.complete("control");
      sw.reset(); count = 0; trueCount = 0; Tread = null; rd.clear();
      ctx.resetSteps(); ctx.step("set"); ctx.step("equil");
    } }]);
    Kit.answer(ctx, "Optimum temperature from your results / °C", "e.g. 40", v => {
      const live = ctx.rows().filter(r => r.cont === CONT.live.name);
      if(new Set(live.map(r => Math.round(r.T/2.5))).size < 5) return [false, "Record live yeast at five or more temperatures first."];
      const best = live.reduce((a, b) => b.rate > a.rate ? b : a);
      if(Math.abs(v - best.T) <= 5){ ctx.complete("optimum"); return [true, `Yes — your fastest rate was ${best.rate} bubbles per minute at ${best.T} °C. Narrow it down with more temperatures either side.`]; }
      return [false, "Look for the temperature with the highest rate in your table (or the peak of the curve)."];
    });
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">The thermostat setting is not exact — always read the thermometer in the bath.</p>`);
    statics(); ctx.step("set");
  }
});

/* ───────────── RESPIRATION: HEAT RELEASED & OXYGEN USED ───────────── */
Lab.register({
  id:"seedheat", subject:"biology", level:["igcse"], topic:"Respiration · Aerobic respiration", interactive:true,
  title:"Germinating peas: heat released and oxygen used",
  summary:"Read thermometers in vacuum flasks of germinating and boiled peas every day for a week. Then use a simple respirometer with soda lime and watch the coloured liquid move as the peas take in oxygen.",
  aim:"Show that germinating seeds release heat energy by respiration, and use a respirometer to show that they take in oxygen.",
  variables:{ iv:"Living (germinating) or dead (boiled) peas", dv:"Temperature in the flask (°C); distance moved by the coloured liquid (mm)", cv:["Same mass of peas in each flask","Same type of vacuum flask and cotton wool plug","Same room temperature","Respirometer kept at constant temperature"] },
  stageTitle:"Flasks & respirometer", controlsTitle:"Read & record",
  thumb:`<svg viewBox="0 0 300 140">${[80, 200].map((x, i) => `<rect x="${x - 34}" y="64" width="68" height="70" rx="12" fill="#9AA3B2" stroke="#475569"/><rect x="${x - 16}" y="48" width="32" height="18" fill="#CBD5E1"/><ellipse cx="${x}" cy="46" rx="20" ry="8" fill="#fff" stroke="#CBD5E1"/><rect x="${x - 3}" y="6" width="6" height="56" rx="3" fill="#fff" stroke="#94A3B8"/><rect x="${x - 1.5}" y="${i ? 34 : 18}" width="3" height="${i ? 28 : 44}" fill="#E0334A"/>`).join("")}</svg>`,
  challenges:[
    { id:"week",     title:"A week of readings", text:"Record both flasks on five different days, including day 4 or later." },
    { id:"microbes", title:"Why disinfect?", text:"Run flask B with boiled peas that were not disinfected and record three days." },
    { id:"oxygen",   title:"Oxygen uptake", text:"Measure the movement of the liquid with germinating peas and soda lime." },
    { id:"controls", title:"Respirometer controls", text:"Run a control tube (boiled peas or glass beads), and germinating peas without soda lime." }
  ],
  columns:[{key:"exp",label:"Apparatus"},{key:"cont",label:"Contents"},{key:"day",label:"Day",dp:0},{key:"T",label:"Temperature / °C",dp:1},{key:"dist",label:"Liquid moved in 5 min / mm"},{key:"rate",label:"Rate / mm per min",dp:1}],
  series:"cont",
  graph:{ x:["day"], y:["T"], fit:"curve" },
  questions:[
    { q:"Why are vacuum flasks used rather than beakers?",
      a:"A vacuum flask is insulated, so very little heat is lost to the surroundings. The small amount of heat released by respiration builds up and the temperature rise can be measured." },
    { q:"Why are the peas in flask B boiled, and why are they then washed in disinfectant?",
      a:"Boiling kills the peas (denatures their enzymes) so they cannot respire — flask B is the control. Bacteria and fungi on the surface of the dead peas would respire and decompose them, releasing heat. Disinfectant kills these microorganisms, so any temperature rise in flask A is due to respiration by the peas." },
    { q:"Why is the top of each flask plugged with cotton wool and not a rubber bung?",
      a:"Cotton wool lets gases pass: oxygen can get in for aerobic respiration and carbon dioxide can escape. It also holds the thermometer and reduces heat loss. A bung would let oxygen run out." },
    { q:"Explain why the coloured liquid in the respirometer moves towards the peas.",
      a:"The peas take in oxygen for aerobic respiration. The carbon dioxide they give out is absorbed by the soda lime. So the volume of gas in the tube decreases, the pressure falls and the liquid is pushed towards the peas. Without soda lime the volume of carbon dioxide released is about the same as the oxygen used, so the liquid hardly moves." },
    { q:"The liquid moved 24 mm in 5 minutes in a capillary of radius 0.5 mm. Calculate the rate of oxygen uptake in mm³ per minute.",
      a:"Volume = πr²l = 3.14 × 0.5² × 24 = 18.8 mm³ in 5 minutes. Rate = 18.8 ÷ 5 = 3.8 mm³ per minute." },
    { q:"Assess the risk and suggest improvements to the respirometer experiment.",
      a:"Soda lime is corrosive — wear eye protection and gloves, and keep it under the gauze so it doesn’t touch the peas. Keep the tubes in a water bath, because a change in temperature makes the air expand or contract and moves the liquid. Use a control tube of glass beads (same volume as the peas) and repeat three times to calculate a mean." }
  ],
  setup(ctx){
    let mode = "flask", disinf = true, day = 0, D = null, readA = null, readB = null, shA = 20, shB = 20, recDay = -1;
    let rcont = "germ", soda = true, run = null, dist = 0, tmin = 0, readD = null;
    const RC = { germ:"Germinating peas", boiled:"Boiled peas", beads:"Glass beads" };
    function newFlasks(){
      const Rmax = 9 + 3*Math.random(), tau = 1.6 + .5*Math.random(), room = [], A = [], B1 = [], B2 = [];
      for(let d = 0; d <= 7; d++){
        room[d] = 20.5 + .7*ctx.gauss();
        A[d] = Kit.round(room[d] + Rmax*(1 - Math.exp(-d/tau)) + .3*ctx.gauss(), 1);
        B1[d] = Kit.round(room[d] + .25*ctx.gauss(), 1);
        B2[d] = Kit.round(room[d] + Math.min(8, Math.max(0, d - 1.2)*1.9) + .3*ctx.gauss(), 1);
      }
      D = { A, B1, B2 }; day = 0; readA = readB = null; recDay = -1;
    }
    newFlasks(); shA = D.A[0]; shB = D.B1[0];
    const thA = Kit.thermometer("sh-ta", 220, 62, 178, 15, 40, 5), thB = Kit.thermometer("sh-tb", 490, 62, 178, 15, 40, 5);
    const S0 = 230, PX = 4;                // respirometer scale: 0 mm at x = 230, 4 px per mm
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="sh-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 440)}
      <g id="sh-flasks">${thA.svg}${thB.svg}<g id="sh-fl"></g>
        <g transform="translate(650 70)"><rect width="280" height="220" rx="14" fill="#111827" stroke="#334155"/>
          <text x="20" y="32" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.06em">VACUUM FLASKS</text>
          <text x="20" y="80" style="font:600 34px 'Space Grotesk';fill:#E5E7EB" id="sh-day"></text>
          <text x="20" y="118" style="font:500 12px Inter;fill:#9CA3AF">Read both thermometers each day</text>
          <text x="20" y="138" style="font:500 12px Inter;fill:#9CA3AF">at the same time.</text>
          <text x="20" y="178" style="font:500 12px Inter;fill:#9CA3AF" id="sh-rec"></text></g></g>
      <g id="sh-resp" style="display:none"><g id="sh-rs"></g><g id="sh-drop"></g>
        <g transform="translate(40 200)"><rect width="300" height="150" rx="14" fill="#111827" stroke="#334155"/>
          <text x="20" y="32" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.06em">RESPIROMETER</text>
          <text x="20" y="72" style="font:600 26px 'JetBrains Mono';fill:#7CFFB2" id="sh-clock">0.0 min</text>
          <text x="20" y="104" style="font:500 12px Inter;fill:#9CA3AF">Read the scale at the left edge</text>
          <text x="20" y="124" style="font:500 12px Inter;fill:#9CA3AF">of the coloured liquid.</text></g></g>
      <text x="24" y="30" class="k-status" id="sh-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#sh-svg"), $ = s => svg.querySelector(s);
    function peas(cx, cy, kind){
      let s = "";
      for(let i = 0; i < 26; i++){
        const x = cx - 52 + (i % 7)*17 + (Math.floor(i/7) % 2)*8, y = cy - 26 + Math.floor(i/7)*16;
        s += `<circle cx="${x}" cy="${y}" r="7.5" fill="${kind === "g" ? "#7FB24A" : "#C9C08A"}" stroke="${kind === "g" ? "#4D7A27" : "#8F8656"}"/>`;
        if(kind === "g" && i % 3 === 0) s += `<path d="M${x + 5} ${y + 4}q6 6 4 12" stroke="#F4F1E6" stroke-width="2" fill="none"/>`;
        if(kind === "m" && i % 2 === 0) s += `<circle cx="${x - 2}" cy="${y - 3}" r="4" fill="#E5E7EB" opacity=".85"/><circle cx="${x + 3}" cy="${y - 1}" r="3" fill="#9CA3AF" opacity=".7"/>`;
      }
      return s;
    }
    function flask(cx, lab, kind){
      return `<rect x="${cx - 34}" y="236" width="68" height="30" fill="url(#k-metal)" stroke="#475569"/>
        <rect x="${cx - 78}" y="262" width="156" height="176" rx="24" fill="url(#k-metal)" stroke="#475569" stroke-width="1.5"/>
        <rect x="${cx - 64}" y="300" width="128" height="96" rx="12" fill="#2A2F3A" stroke="#94A3B8" stroke-dasharray="4 3"/>
        ${peas(cx, 340, kind)}
        <text x="${cx}" y="414" text-anchor="middle" style="font:600 9px Inter;fill:#E5E7EB">cut-away view</text>
        <g>${[-26, -12, 2, 16, 28].map((dx, i) => `<circle cx="${cx + dx}" cy="${236 + (i % 2)*5}" r="11" fill="#FAFAFA" stroke="#D1D5DB"/>`).join("")}</g>
        <rect x="${cx - 3}" y="226" width="6" height="26" fill="#fff" stroke="#9AA3B2" stroke-width=".8"/>
        <text x="${cx}" y="462" text-anchor="middle" class="k-tag">${lab}</text>`;
    }
    function drawFlasks(){
      const bKind = disinf ? "b" : day >= 3 ? "m" : "b";
      $("#sh-fl").innerHTML = flask(220, "A: germinating peas", "g") + flask(490, disinf ? "B: boiled peas, disinfected" : "B: boiled peas, not disinfected", bKind)
        + `<line x1="256" y1="232" x2="300" y2="214" stroke="var(--txt3)"/><text x="304" y="212" class="k-lbl">cotton wool</text>`;
      $("#sh-day").textContent = "Day " + day;
      $("#sh-rec").textContent = recDay === day ? "Today’s readings recorded ✓" : "Not recorded yet today";
    }
    function drawResp(){
      let s = `<rect x="650" y="250" width="150" height="188" rx="8" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/><rect x="653" y="270" width="144" height="165" rx="6" fill="url(#k-water)"/>
        <text x="725" y="456" text-anchor="middle" class="k-lbl">water bath</text>
        <rect x="705" y="176" width="40" height="244" rx="20" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
      if(soda){ for(let i = 0; i < 18; i++) s += `<circle cx="${712 + (i % 6)*5.2}" cy="${405 - Math.floor(i/6)*7}" r="3" fill="#F8FAFC" stroke="#94A3B8" stroke-width=".7"/>`; s += `<line x1="745" y1="398" x2="830" y2="410" stroke="var(--txt3)"/><text x="834" y="414" class="k-lbl">soda lime</text>`; }
      s += `<line x1="707" y1="378" x2="743" y2="378" stroke="#64748B" stroke-width="3" stroke-dasharray="3 2"/><line x1="745" y1="378" x2="830" y2="370" stroke="var(--txt3)"/><text x="834" y="368" class="k-lbl">gauze</text>`;
      for(let i = 0; i < 12; i++){ const x = 715 + (i % 3)*10, y = 368 - Math.floor(i/3)*11;
        s += rcont === "beads" ? `<circle cx="${x}" cy="${y}" r="5" fill="#DBEAFE" stroke="#60A5FA"/>` : `<circle cx="${x}" cy="${y}" r="5.5" fill="${rcont === "germ" ? "#7FB24A" : "#C9C08A"}" stroke="${rcont === "germ" ? "#4D7A27" : "#8F8656"}"/>`; }
      s += `<line x1="745" y1="335" x2="830" y2="320" stroke="var(--txt3)"/><text x="834" y="318" class="k-lbl">${RC[rcont].toLowerCase()}</text>
        <rect x="700" y="164" width="50" height="18" rx="4" fill="#6B4F3A"/>
        <path d="M725 164V110H180" stroke="#94A3B8" stroke-width="8" fill="none" stroke-linejoin="round"/><path d="M725 164V110H180" stroke="#F8FAFC" stroke-width="4" fill="none" stroke-linejoin="round" opacity=".8"/>
        <path d="M740 164V136h40" stroke="#94A3B8" stroke-width="6" fill="none"/><rect x="778" y="128" width="20" height="16" rx="3" fill="#475569"/><text x="804" y="140" class="k-lbl">screw clip (closed)</text>
        <rect x="${S0 - 14}" y="118" width="${80*PX + 28}" height="36" rx="3" fill="#F2E6C2" stroke="#B8962E"/>`;
      for(let mm = 0; mm <= 80; mm++){ const x = S0 + mm*PX, L = mm % 10 === 0 ? 14 : mm % 5 === 0 ? 10 : 6;
        s += `<line x1="${x}" y1="118" x2="${x}" y2="${118 + L}" stroke="#4B3621" stroke-width=".8"/>`;
        if(mm % 10 === 0) s += `<text x="${x}" y="146" text-anchor="middle" style="font:600 10px 'JetBrains Mono';fill:#4B3621">${mm}</text>`; }
      s += `<text x="${S0 + 80*PX + 10}" y="170" text-anchor="end" style="font:500 10px Inter;fill:var(--txt3)">scale / mm</text>
        <text x="180" y="96" class="k-lbl">capillary tube</text>`;
      $("#sh-rs").innerHTML = s;
    }
    function draw(){
      $("#sh-flasks").style.display = mode === "flask" ? "" : "none";
      $("#sh-resp").style.display = mode === "resp" ? "" : "none";
      if(mode === "flask") drawFlasks(); else drawResp();
      $("#sh-status").textContent = mode === "flask" ? (recDay === day ? (day < 7 ? "Recorded — wait until tomorrow" : "Experiment over — set up new flasks to repeat") : "Read both thermometers and record today’s temperatures")
        : run ? "Clip closed — the peas are using oxygen…" : tmin >= 5 && readD === null ? "Five minutes up — read the distance moved" : "Choose the tube contents and close the clip to start";
    }
    ctx.frame(dt => {
      shA += (D.A[day] - shA)*Math.min(1, dt*3);
      const bT = disinf ? D.B1[day] : D.B2[day];
      shB += (bT - shB)*Math.min(1, dt*3);
      thA.set(svg, shA); thB.set(svg, shB);
      if(run){
        tmin = Math.min(5, tmin + dt*5/6);
        dist = Math.max(0, run.rate*tmin);
        $("#sh-clock").textContent = tmin.toFixed(1) + " min";
        if(tmin >= 5){ run = null; dist = Kit.round(dist, 1); draw(); }
      }
      $("#sh-drop").innerHTML = mode === "resp" ? `<rect x="${S0 + dist*PX}" y="106.5" width="22" height="7" rx="2" fill="#DC2626"/><line x1="${S0 + dist*PX}" y1="102" x2="${S0 + dist*PX}" y2="118" stroke="#DC2626" stroke-width="1"/>` : "";
    });
    ctx.seg({ label:"Apparatus", value:"flask", options:[["flask","Vacuum flasks"],["resp","Respirometer"]], onChange(v){ mode = v; fBox.style.display = v === "flask" ? "" : "none"; rBox.style.display = v === "resp" ? "" : "none"; draw(); } });
    const fBox = ctx.html(`<div></div>`), rBox = ctx.html(`<div style="display:none"></div>`);
    const dSeg = ctx.seg({ label:"Boiled peas in flask B", value:"yes", options:[["yes","Rinsed in disinfectant"],["no","Not disinfected"]], parent:fBox, onChange(v){
      if(day > 0){ dSeg.set(disinf ? "yes" : "no"); return ctx.toast("Set up new flasks to change this"); }
      disinf = v === "yes"; shB = disinf ? D.B1[0] : D.B2[0]; draw();
    } });
    const rdA = Kit.reading(ctx, "Thermometer in flask A / °C", "e.g. 24.5", () => D.A[day], .6, v => { readA = v; ctx.toast("Flask A noted"); }, fBox);
    const rdB = Kit.reading(ctx, "Thermometer in flask B / °C", "e.g. 21.0", () => disinf ? D.B1[day] : D.B2[day], .6, v => { readB = v; ctx.toast("Flask B noted"); }, fBox);
    ctx.buttons([{ label:"Record today", primary:true, onClick(){
      if(recDay === day) return ctx.toast("Already recorded today");
      if(readA === null || readB === null) return ctx.toast("Read both thermometers first");
      const bName = disinf ? "B: boiled peas, disinfected" : "B: boiled peas, not disinfected";
      ctx.record({ exp:"Vacuum flask", cont:"A: germinating peas", day, T:readA, dist:null, rate:null }, true);
      ctx.record({ exp:"Vacuum flask", cont:bName, day, T:readB, dist:null, rate:null });
      recDay = day;
      const rows = ctx.rows(), aDays = new Set(rows.filter(r => r.cont === "A: germinating peas").map(r => r.day));
      if(aDays.size >= 5 && [...aDays].some(d => d >= 4)) ctx.complete("week");
      if(new Set(rows.filter(r => r.cont === "B: boiled peas, not disinfected").map(r => r.day)).size >= 3) ctx.complete("microbes");
      draw();
    } }, { label:"Next day", onClick(){
      if(day >= 7) return ctx.toast("The experiment ran for a week — set up new flasks");
      if(recDay !== day) ctx.toast("You didn’t record day " + day);
      day++; readA = readB = null; rdA.clear(); rdB.clear(); draw();
    } }], fBox);
    ctx.buttons([{ label:"Set up new flasks", block:true, onClick(){ newFlasks(); rdA.clear(); rdB.clear(); draw(); } }], fBox);
    function resetDrop(){ run = null; dist = 0; tmin = 0; readD = null; rdD.clear(); $("#sh-clock").textContent = "0.0 min"; }
    ctx.seg({ label:"Tube contains", value:"germ", options:[["germ","Germinating peas"],["boiled","Boiled peas"],["beads","Glass beads"]], parent:rBox, onChange(v){ rcont = v; resetDrop(); draw(); } });
    ctx.seg({ label:"Soda lime", value:"yes", options:[["yes","Present"],["no","Absent"]], parent:rBox, onChange(v){ soda = v === "yes"; resetDrop(); draw(); } });
    ctx.buttons([{ label:"Close clip & run 5 min", primary:true, onClick(){
      if(run) return;
      if(tmin > 0) return ctx.toast("Open the clip to reset the liquid first");
      const G = 5.2*(.85 + .3*Math.random()), drift = .12*ctx.gauss();
      const rate = rcont === "germ" ? (soda ? G : .08*G + Math.abs(drift)) : Math.abs(drift);
      run = { rate }; draw();
    } }, { label:"Open clip (reset)", onClick(){ resetDrop(); draw(); } }], rBox);
    const rdD = Kit.reading(ctx, "Distance moved by the liquid / mm", "e.g. 26", () => run || tmin < 5 ? null : dist, 1, v => {
      if(readD !== null) return ctx.toast("Already recorded — open the clip to run again");
      readD = v;
      const name = RC[rcont] + (soda ? ", soda lime" : ", no soda lime");
      ctx.record({ exp:"Respirometer", cont:name, day:null, T:null, dist:v, rate:Kit.round(v/5, 1) });
      const rows = ctx.rows().filter(r => r.exp === "Respirometer");
      if(rows.some(r => r.cont === "Germinating peas, soda lime" && r.dist >= 10)) ctx.complete("oxygen");
      if(rows.some(r => /^(Boiled peas|Glass beads), soda lime/.test(r.cont)) && rows.some(r => r.cont === "Germinating peas, no soda lime")) ctx.complete("controls");
      draw();
    }, rBox);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Five minutes pass in about six seconds.</p>`, rBox);
    draw();
  }
});

/* ───────────── CONDITIONS NEEDED FOR GERMINATION ───────────── */
Lab.register({
  id:"germination", subject:"biology", level:["igcse"], topic:"Plant reproduction · Germination", interactive:true,
  title:"Conditions needed for germination",
  summary:"Set up tubes of 20 mung bean seeds with or without water, oxygen and warmth, and in light or dark. Wait a few days, then count the seeds that have germinated in each tube and work out the percentage.",
  aim:"Investigate the conditions needed for the germination of seeds: water, oxygen and a suitable temperature (and whether light is needed).",
  variables:{ iv:"Conditions in each tube: water, oxygen, temperature, light", dv:"Number of seeds germinated out of 20 → percentage germination", cv:["Same type and batch of seeds","Same number of seeds (20) per tube","Same volume of water on the cotton wool","Same number of days"] },
  stageTitle:"Tubes & close-up", controlsTitle:"Set up tubes",
  thumb:`<svg viewBox="0 0 300 140">${[0, 1, 2, 3].map(i => `<rect x="${50 + i*55}" y="20" width="30" height="110" rx="15" fill="#fff" fill-opacity=".5" stroke="#64748B"/><rect x="${52 + i*55}" y="96" width="26" height="30" rx="10" fill="${i === 1 ? "#E7DCC0" : "#EEF5FA"}"/>${i !== 1 ? `<path d="M${65 + i*55} 96v-${[30, 0, 10, 26][i]}" stroke="#5DA34A" stroke-width="3"/>` : ""}<ellipse cx="${65 + i*55}" cy="96" rx="6" ry="4" fill="#5E8F3E"/>`).join("")}</svg>`,
  challenges:[
    { id:"water",  title:"Water", text:"After 3 days or more, record a dry tube and a moist tube kept at the same temperature." },
    { id:"oxygen", title:"Oxygen", text:"After 3 days or more, record a tube of boiled water with an oil layer and a moist tube at the same temperature." },
    { id:"temp",   title:"Temperature", text:"After 3 days or more, record moist tubes at three different temperatures." },
    { id:"light",  title:"Is light needed?", text:"After 3 days or more, record moist tubes in the light and in the dark at the same temperature." }
  ],
  columns:[{key:"tube",label:"Tube"},{key:"water",label:"Water / oxygen"},{key:"temp",label:"Temperature / °C",dp:0},{key:"light",label:"Light"},{key:"day",label:"Days since set-up",dp:0},{key:"n",label:"Germinated (out of 20)",dp:0},{key:"pct",label:"Germination / %",dp:0}],
  series:"water",
  graph:{ x:["temp","day"], y:["pct"], fit:"none" },
  questions:[
    { q:"Why is the water in one tube boiled and cooled, and then covered with a layer of oil?",
      a:"Boiling removes dissolved oxygen. The oil layer stops oxygen from the air dissolving back into the water. So the seeds have water but no oxygen, and cannot respire aerobically to release the energy needed for growth." },
    { q:"Explain why seeds need water to germinate.",
      a:"Water makes the seed swell and split the testa, and activates enzymes. Amylase breaks down stored starch into maltose/glucose, which is transported to the embryo and used in respiration and to make new cells. Water is also needed for cells to expand." },
    { q:"Explain the results at 4 °C and at 50 °C.",
      a:"At 4 °C the molecules have little kinetic energy, so enzyme reactions are very slow and few seeds germinate in the time. At 50 °C the enzymes are denatured — the active sites change shape — and the embryos are killed, so none germinate." },
    { q:"What do the light and dark tubes show? How do the seedlings in the dark look different?",
      a:"Seeds germinate equally well in the light and the dark, so light is not needed for germination — the seed uses its food store. Seedlings grown in the dark are tall, thin and yellow (no chlorophyll), because they need light to photosynthesise once the food store is used up." },
    { q:"17 out of 20 seeds germinated in one tube. Calculate the percentage germination. Why use 20 seeds rather than 2?",
      a:"17 ÷ 20 × 100 = 85%. Some seeds are not viable, and seeds vary, so a larger sample gives a more representative result. Repeating each tube and calculating a mean would make the results more reliable." },
    { q:"Suggest limitations of this investigation and assess the risk.",
      a:"Deciding whether a seed has germinated is subjective — define germination as the radicle visible through the testa. The fridge is dark as well as cold, so two variables change — use a dark control at room temperature. Count all tubes on the same day. Risk is low: some seeds are coated with fungicide, so wash hands; the oven is hot, so use heat-proof gloves; mould may grow, so do not open sealed tubes near your face." }
  ],
  setup(ctx){
    const LET = "ABCDEFGH", WN = { moist:"moist, air", dry:"dry", flooded:"boiled water + oil" };
    const BASE = { 4:9, 20:1.8, 30:1.1, 50:Infinity }, GROW = { 4:4, 20:15, 30:21, 50:0 };
    let water = "moist", temp = 20, light = "light", day = 0, tubes = [], sel = -1, checked = false;
    function makeTube(){
      const via = .9 + .08*Math.random(), seeds = [];
      for(let i = 0; i < 20; i++){
        const c = i % 5, r = Math.floor(i/5);
        let tg = BASE[temp]*(.65 + .7*Math.random());
        if(water === "dry") tg = Infinity;
        if(water === "flooded") tg = Math.random() < .12 ? tg*2.5 : Infinity;
        if(Math.random() > via) tg = Infinity;
        seeds.push({ x:600 + c*70 + (Math.random() - .5)*22, y:160 + r*62 + (Math.random() - .5)*14, a:Math.random()*360, tg, bend:(Math.random() - .5)*.6 });
      }
      return { lab:LET[tubes.length], water, temp, light, day0:day, seeds, marks:new Set() };
    }
    const age = t => day - t.day0;
    const germ = (t, s) => age(t) >= s.tg;
    const len = (t, s) => germ(t, s) ? (age(t) - s.tg)*GROW[t.temp]*(t.light === "dark" ? 1.4 : 1) + 4 : 0;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="gm-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 440)}
      <g id="gm-rack"></g><g id="gm-zoom"></g><text x="24" y="34" class="k-status" id="gm-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#gm-svg"), $ = s => svg.querySelector(s);
    function sprout(x, y, l, dark, sc){
      if(l <= 0) return "";
      const r = Math.min(l, 50)*sc, sh = Math.max(0, l - 18)*.8*sc;
      let s = `<path d="M${x} ${y + 3*sc}q${4*sc} ${r*.5} ${-2*sc} ${r}" stroke="#F4F1E6" stroke-width="${2.6*sc}" fill="none" stroke-linecap="round"/><path d="M${x} ${y + 3*sc}q${4*sc} ${r*.5} ${-2*sc} ${r}" stroke="#C9C0A4" stroke-width="${.6*sc}" fill="none"/>`;
      if(sh > 0){
        const g = dark ? "#D8CC62" : "#5DA34A";
        s += `<path d="M${x} ${y - 3*sc}q${-5*sc} ${-sh*.5} ${1*sc} ${-sh}" stroke="${g}" stroke-width="${2.4*sc}" fill="none" stroke-linecap="round"/>`;
        if(sh > 10*sc) s += `<ellipse cx="${x - 4*sc}" cy="${y - 3*sc - sh}" rx="${5*sc}" ry="${2.6*sc}" fill="${g}"/><ellipse cx="${x + 6*sc}" cy="${y - 3*sc - sh}" rx="${5*sc}" ry="${2.6*sc}" fill="${g}"/>`;
      }
      return s;
    }
    function drawRack(){
      let s = `<text x="30" y="60" class="k-lbl">Click a tube to look at it closely</text>`;
      for(let i = 0; i < 8; i++){
        const x = 40 + i*56, t = tubes[i];
        if(!t){ s += `<rect x="${x}" y="100" width="34" height="200" rx="17" fill="none" stroke="var(--brd2)" stroke-dasharray="4 4"/>`; continue; }
        const on = i === sel;
        s += `<g data-t="${i}" style="cursor:pointer"><rect x="${x - 6}" y="68" width="46" height="286" rx="8" style="fill:${on ? "color-mix(in srgb,var(--accent) 14%,transparent)" : "transparent"};stroke:${on ? "var(--accent)" : "transparent"}"/>
          <text x="${x + 17}" y="84" text-anchor="middle" class="k-tag">${t.lab}</text>`;
        if(t.water === "flooded") s += `<rect x="${x + 2}" y="170" width="30" height="128" rx="14" fill="url(#k-water)"/><rect x="${x + 2}" y="160" width="30" height="11" fill="#F2D35B" opacity=".9"/>`;
        else s += `<rect x="${x + 2}" y="254" width="30" height="44" rx="13" fill="${t.water === "dry" ? "#E7DCC0" : "#EEF5FA"}" stroke="${t.water === "dry" ? "#CBB98C" : "#A9C4DA"}"/>`;
        const n = t.seeds.filter(z => germ(t, z)).length, top = t.water === "flooded" ? 288 : 252;
        for(let k = 0; k < 5; k++) s += `<ellipse cx="${x + 8 + k*4.5}" cy="${top - (k % 2)*3}" rx="3.5" ry="2.5" fill="#5E8F3E"/>`;
        const mx = Math.max(0, ...t.seeds.map(z => len(t, z)));
        if(n) for(let k = 0; k < Math.min(4, Math.ceil(n/5)); k++) s += `<path d="M${x + 10 + k*5} ${top - 3}v-${Math.min(120, mx*.6*(1 - k*.15)).toFixed(1)}" stroke="${t.light === "dark" ? "#D8CC62" : "#5DA34A"}" stroke-width="2"/>`;
        s += `<rect x="${x}" y="100" width="34" height="200" rx="17" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.3"/>
          <rect x="${x - 2}" y="94" width="38" height="10" rx="3" fill="#F8FAFC" stroke="#94A3B8"/>
          <text x="${x + 17}" y="318" text-anchor="middle" style="font:600 9px Inter;fill:var(--txt2)">${{ moist:"moist", dry:"dry", flooded:"no O₂" }[t.water]}</text>
          <text x="${x + 17}" y="332" text-anchor="middle" style="font:600 9px Inter;fill:${{ 4:"#3B82F6", 20:"var(--txt2)", 30:"#EA580C", 50:"#DC2626" }[t.temp]}">${t.temp} °C</text>
          <text x="${x + 17}" y="346" text-anchor="middle" style="font:600 9px Inter;fill:var(--txt3)">${t.light}</text></g>`;
      }
      $("#gm-rack").innerHTML = s;
    }
    function drawZoom(){
      let s = `<rect x="510" y="70" width="430" height="350" rx="14" fill="#111827" stroke="#334155"/>`;
      const t = tubes[sel];
      if(!t){ s += `<text x="725" y="250" text-anchor="middle" style="font:500 13px Inter;fill:#9CA3AF">Set up a tube, then click it to look closely</text>`; $("#gm-zoom").innerHTML = s; return; }
      const bg = t.water === "flooded" ? "#9CC6EA" : t.water === "dry" ? "#E7DCC0" : "#EEF5FA";
      s += `<rect x="530" y="112" width="390" height="294" rx="10" fill="${bg}"/>`;
      if(t.water === "flooded") s += `<rect x="530" y="112" width="390" height="16" rx="6" fill="#F2D35B" opacity=".9"/><text x="540" y="124" style="font:600 9px Inter;fill:#6B5A12">oil layer</text>`;
      if(t.water === "moist") for(let k = 0; k < 14; k++) s += `<path d="M${540 + k*28} 400q8 -6 16 0" stroke="#C9D7E3" fill="none"/>`;
      t.seeds.forEach((z, i) => {
        const m = t.marks.has(i), bad = checked && m !== germ(t, z);
        s += `<g data-s="${i}" style="cursor:pointer"><circle cx="${z.x}" cy="${z.y}" r="24" fill="transparent"/>${sprout(z.x, z.y, len(t, z), t.light === "dark", 1)}
          <ellipse cx="${z.x}" cy="${z.y}" rx="10" ry="7" fill="#5E8F3E" stroke="#3D6326" transform="rotate(${z.a.toFixed(0)} ${z.x} ${z.y})"/><ellipse cx="${z.x - 3}" cy="${z.y - 2}" rx="3" ry="1.6" fill="#86B86A" opacity=".8"/>
          ${m || bad ? `<circle cx="${z.x}" cy="${z.y}" r="17" fill="none" stroke="${bad ? "#E0335A" : "#0F9A62"}" stroke-width="3"/>` : ""}</g>`;
      });
      s += `<text x="530" y="96" style="font:700 11px Inter;fill:#E5E7EB">Tube ${t.lab} · ${WN[t.water]} · ${t.temp} °C · ${t.light} · day ${age(t)}</text>
        <text x="920" y="96" text-anchor="end" style="font:600 11px Inter;fill:#7CFFB2">marked: ${t.marks.size}</text>`;
      $("#gm-zoom").innerHTML = s;
    }
    function draw(){
      drawRack(); drawZoom();
      $("#gm-status").textContent = !tubes.length ? "Day 0 — set up your tubes" : `Day ${day} — click each seed whose radicle (root) has come out`;
      const t = tubes[sel];
      ctx.readout([["Day", String(day)], ["Tubes", tubes.length + " / 8"], ["Selected", t ? "Tube " + t.lab : "—"], ["Marked", t ? String(t.marks.size) : "—"]]);
    }
    svg.addEventListener("pointerdown", e => {
      const g = e.target.closest("[data-t]");
      if(g){ sel = +g.dataset.t; checked = false; draw(); return; }
      const sd = e.target.closest("[data-s]"), t = tubes[sel];
      if(sd && t){ const i = +sd.dataset.s; t.marks.has(i) ? t.marks.delete(i) : t.marks.add(i); checked = false; draw(); }
    });
    ctx.select({ label:"Water and oxygen", value:"moist", options:[["moist","Moist cotton wool (air)"],["dry","Dry cotton wool"],["flooded","Boiled, cooled water + oil layer"]], onChange(v){ water = v; } });
    ctx.select({ label:"Where the tube is kept", value:"20", options:[["4","Fridge (4 °C)"],["20","Lab bench (20 °C)"],["30","Incubator (30 °C)"],["50","Oven (50 °C)"]], onChange(v){ temp = +v; } });
    ctx.seg({ label:"Light", value:"light", options:[["light","Light"],["dark","Dark (foil-covered)"]], onChange(v){ light = v; } });
    ctx.buttons([{ label:"Set up tube", primary:true, onClick(){
      if(tubes.length >= 8) return ctx.toast("The rack is full (8 tubes)");
      tubes.push(makeTube()); sel = tubes.length - 1; checked = false;
      ctx.toast(`Tube ${tubes[sel].lab}: 20 seeds, ${WN[water]}, ${temp} °C, ${light}`); draw();
    } }, { label:"Wait 1 day", onClick(){
      if(!tubes.length) return ctx.toast("Set up some tubes first");
      if(day >= 7) return ctx.toast("A week is long enough — clear the rack to start again");
      day++; checked = false; draw();
    } }]);
    ctx.buttons([{ label:"Record count for this tube", primary:true, block:true, onClick(){
      const t = tubes[sel]; if(!t) return ctx.toast("Click a tube first");
      if(age(t) < 1) return ctx.toast("Wait at least a day before counting");
      const n = t.seeds.filter(z => germ(t, z)).length, wrong = t.seeds.filter((z, i) => t.marks.has(i) !== germ(t, z)).length;
      if(wrong){ checked = true; draw(); return ctx.toast(`Not quite — ${wrong} seed${wrong > 1 ? "s are" : " is"} marked wrongly (red rings). A seed has germinated when its radicle shows.`); }
      ctx.record({ tube:t.lab, water:WN[t.water], temp:t.temp, light:t.light, day:age(t), n, pct:n/20*100 });
      const rows = ctx.rows().filter(r => r.day >= 3), moist = rows.filter(r => r.water === WN.moist);
      if(rows.some(r => r.water === WN.dry && moist.some(m => m.temp === r.temp))) ctx.complete("water");
      if(rows.some(r => r.water === WN.flooded && moist.some(m => m.temp === r.temp))) ctx.complete("oxygen");
      if(new Set(moist.map(r => r.temp)).size >= 3) ctx.complete("temp");
      if(moist.some(r => r.light === "dark" && moist.some(m => m.light === "light" && m.temp === r.temp))) ctx.complete("light");
    } }]);
    ctx.buttons([{ label:"Clear the rack", block:true, onClick(){ if(tubes.length && !confirm("Remove all tubes and start again on day 0?")) return; tubes = []; sel = -1; day = 0; checked = false; draw(); } }]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Germination % = number germinated ÷ 20 × 100. Count only seeds with a visible radicle.</p>`);
    draw();
  }
});

/* ───────────── PHOTOTROPISM & GRAVITROPISM ───────────── */
Lab.register({
  id:"tropisms", subject:"biology", level:["igcse"], topic:"Coordination · Tropic responses", interactive:true,
  title:"Phototropism and gravitropism",
  summary:"Grow seedlings with light from one side, on a clinostat, in the dark, and turned on their side. Watch a time-lapse, then line up a protractor on the shoot and root to measure the angle of bending.",
  aim:"Investigate the responses of shoots and roots to light from one direction (phototropism) and to gravity (gravitropism).",
  variables:{ iv:"Direction of the stimulus (light from one side, gravity) and whether a clinostat is used", dv:"Angle of bending of the shoot and root (°)", cv:["Same species and age of seedling","Same temperature","Same light intensity and distance from the lamp","Same time"] },
  stageTitle:"Seedling box & protractor", controlsTitle:"Set up & measure",
  thumb:`<svg viewBox="0 0 300 140"><rect x="30" y="10" width="200" height="124" rx="6" fill="#1F2937" opacity=".15" stroke="#64748B"/><path d="M110 90V60q0-14 24-34" stroke="#5DA34A" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M110 94v34" stroke="#D9CFB6" stroke-width="4"/><ellipse cx="110" cy="92" rx="12" ry="8" fill="#B08A4F"/><circle cx="262" cy="50" r="18" fill="#FFD24A"/>${[30, 50, 70].map(y => `<line x1="240" y1="${y}" x2="200" y2="${y}" stroke="#FFD24A" stroke-width="2"/>`).join("")}</svg>`,
  challenges:[
    { id:"photo",  title:"Towards the light", text:"Measure and record the shoot angle with light from one side after 24 h or more." },
    { id:"clino",  title:"Clinostat control", text:"Record a seedling lit from one side on a clinostat after 24 h or more." },
    { id:"gravi",  title:"Gravitropism", text:"Record the shoot and root of a seedling turned on its side after 24 h or more." },
    { id:"course", title:"Time course", text:"Record one seedling at four or more different times." }
  ],
  columns:[{key:"setup",label:"Set-up"},{key:"t",label:"Time / h",dp:0},{key:"shoot",label:"Shoot bending / °"},{key:"root",label:"Root bending / °"}],
  series:"setup",
  graph:{ x:["t"], y:["shoot","root"], fit:"curve" },
  questions:[
    { q:"Explain how auxin causes a shoot to bend towards light from one side.",
      a:"Auxin is made in the shoot tip and diffuses down. Light from one side makes auxin move to the shaded side, so there is more auxin there. Auxin stimulates cell elongation, so cells on the shaded side grow longer and the shoot bends towards the light. This is positive phototropism." },
    { q:"What is a clinostat, and why is it used here?",
      a:"A clinostat slowly rotates the seedling so every side receives the stimulus (light or gravity) equally in turn. Auxin is spread evenly, so the seedling grows straight. It is a control: it shows that the bending is caused by the stimulus coming from one direction." },
    { q:"Explain the response of the shoot and the root of a seedling placed on its side.",
      a:"Gravity makes auxin collect on the lower side of both. In the shoot, auxin stimulates cell elongation on the lower side, so the shoot bends upwards (negative gravitropism). In the root, auxin inhibits elongation, so the upper side grows more and the root bends downwards (positive gravitropism)." },
    { q:"How do these responses help the plant survive?",
      a:"Shoots grow towards light, so the leaves absorb more light for photosynthesis. Roots grow down into the soil, which anchors the plant and lets it absorb water and mineral ions." },
    { q:"Why should several seedlings be used for each set-up? What is the uncertainty in each angle?",
      a:"Seedlings vary, so one seedling may not be typical. Use at least five and calculate a mean angle. A protractor reads to the nearest 1°, but lining it up on a curved shoot is harder, so the uncertainty is more like ±2–3°. A photograph with lines drawn on it, or time-lapse photography, makes the measurement easier." },
    { q:"Assess the risk and identify the main control variables.",
      a:"Low risk: lamps get hot, so do not touch the bulb and keep water away from the mains supply; the clinostat motor has moving parts. Keep the temperature, lamp distance and light intensity the same, use seedlings of the same species and age, and measure every seedling at the same time." }
  ],
  setup(ctx){
    const SET = {
      side:{ name:"Light from one side", lamp:true, clino:false, dark:false, horiz:false },
      clino:{ name:"Light from one side + clinostat", lamp:true, clino:true, dark:false, horiz:false },
      dark:{ name:"Dark", lamp:false, clino:false, dark:true, horiz:false },
      horiz:{ name:"On its side", lamp:false, clino:false, dark:true, horiz:true },
      hclino:{ name:"On its side + clinostat", lamp:false, clino:true, dark:true, horiz:true }
    };
    const SX = 280, SY = 260, R2D = 180/Math.PI;
    let key = "side", guides = true, st = { t:0 }, plant = null, rs = null, rr = null, rot = 0, pc = { x:770, y:420 }, arm = -30;
    const tw = Kit.tweens(ctx);
    function newPlant(){
      const S = SET[key];
      plant = {
        sMax: S.clino ? 0 : S.horiz ? Kit.clamp(80 + 8*Math.random(), 0, 90) : S.lamp ? 50 + 12*Math.random() : 0,
        rMax: S.clino ? 0 : S.horiz ? 68 + 15*Math.random() : 0,
        sRate: (S.dark && !S.horiz ? 3.2 : 2.7)*(.9 + .2*Math.random()), rRate:2*(.9 + .2*Math.random()), tau:10 + 4*Math.random()
      };
      st.t = 0; rs = rr = null; if(rdS){ rdS.clear(); rdR.clear(); }
    }
    const ang = (mx, t) => mx*(1 - Math.exp(-t/plant.tau));
    const sAng = () => Kit.round(ang(plant.sMax, st.t), 1), rAng = () => Kit.round(ang(plant.rMax, st.t), 1);
    function organ(a0, s, L0, g, th){
      const d0 = [Math.cos(a0), Math.sin(a0)], a1 = a0 + s*th/R2D, d1 = [Math.cos(a1), Math.sin(a1)];
      const P1 = [SX + d0[0]*L0, SY + d0[1]*L0], a = Math.min(g, 22), C = [P1[0] + d0[0]*a/2, P1[1] + d0[1]*a/2];
      const P2 = [C[0] + d1[0]*a/2, C[1] + d1[1]*a/2], tip = [C[0] + d1[0]*Math.max(a/2, g - a/2), C[1] + d1[1]*Math.max(a/2, g - a/2)];
      return { d:`M${SX} ${SY}L${P1[0].toFixed(1)} ${P1[1].toFixed(1)}Q${C[0].toFixed(1)} ${C[1].toFixed(1)} ${P2[0].toFixed(1)} ${P2[1].toFixed(1)}L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`, C, P1, tip, d0, a1 };
    }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="tp-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 440)}
      <g id="tp-scene"></g><g id="tp-prot"></g><g id="tp-arm"></g><text x="24" y="34" class="k-status" id="tp-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#tp-svg"), $ = s => svg.querySelector(s);
    let geo = null;
    function drawScene(){
      const S = SET[key], dark = S.dark;
      let s = `<rect x="60" y="50" width="440" height="380" rx="10" fill="${dark ? "#161A22" : "#EEF2F7"}" stroke="var(--txt2)" stroke-width="2"/>`;
      if(dark) s += `<text x="72" y="70" style="font:600 10px Inter;fill:#9CA3AF">light-proof box (cut-away view)</text>`;
      else s += `<text x="72" y="70" style="font:600 10px Inter;fill:#64748B">${S.lamp ? "box open on the lamp side only" : ""}</text>`;
      if(S.lamp){
        s += `<rect x="496" y="150" width="8" height="190" fill="#FFF4B8"/>`;
        for(let k = 0; k < 6; k++) s += `<line x1="560" y1="${180 + k*26}" x2="${380 - (k % 2)*30}" y2="${172 + k*28}" stroke="#FFD24A" stroke-width="2" opacity=".55" stroke-dasharray="10 6"/>`;
        s += `<circle cx="590" cy="245" r="60" fill="url(#k-glow)"/><circle cx="590" cy="245" r="20" fill="#FFE27A" stroke="#C9A227" stroke-width="2"/><rect x="606" y="232" width="40" height="26" rx="4" fill="#475569"/><text x="590" y="300" text-anchor="middle" class="k-lbl">lamp</text>`;
      }
      if(S.clino && S.horiz) s += `<circle cx="${SX}" cy="${SY}" r="150" fill="#C9A77A" opacity=".55" stroke="#8B6B3E" stroke-width="2"/><circle cx="${SX}" cy="${SY}" r="6" fill="#475569"/>
        <path d="M${SX + 120} ${SY - 110}a160 160 0 0 1 40 60" stroke="#F59E0B" stroke-width="3" fill="none" marker-end=""/><path d="M${SX + 160} ${SY - 50}l-2 -14l-10 8z" fill="#F59E0B"/>
        <text x="${SX}" y="420" text-anchor="middle" style="font:600 10px Inter;fill:#F5C26B">cork disc on clinostat — turns slowly about its centre</text>`;
      else if(S.clino) s += `<ellipse cx="${SX}" cy="400" rx="80" ry="14" fill="#94A3B8" stroke="#475569"/><rect x="${SX - 4}" y="${SY + 8}" width="8" height="${392 - SY}" fill="#64748B"/>
        <path d="M${SX - 60} 418a70 12 0 0 0 120 0" stroke="#F59E0B" stroke-width="3" fill="none"/><path d="M${SX + 60} 418l-12 -6l2 10z" fill="#F59E0B"/>
        <text x="${SX + 92}" y="404" style="font:600 10px Inter;fill:#B45309">clinostat turns slowly</text>`;
      const sh = organ(S.horiz ? Math.PI : -Math.PI/2, 1, 50, st.t*plant.sRate, ang(plant.sMax, st.t));
      const rt = organ(S.horiz ? 0 : Math.PI/2, 1, 52, st.t*plant.rRate, ang(plant.rMax, st.t));
      geo = { sh, rt };
      const ext = o => `<line x1="${o.P1[0]}" y1="${o.P1[1]}" x2="${o.P1[0] + o.d0[0]*150}" y2="${o.P1[1] + o.d0[1]*150}" stroke="${dark ? "#64748B" : "#94A3B8"}" stroke-width="1" stroke-dasharray="5 5"/>`;
      s += (guides ? ext(sh) + ext(rt) : "");
      const sc = S.dark && !S.horiz ? "#D8CC62" : "#5DA34A";
      s += `<path d="${rt.d}" stroke="#B8AE92" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${rt.d}" stroke="#F1EBDA" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${sh.d}" stroke="${sc}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      const [tx, ty] = sh.tip, la = sh.a1;
      s += `<ellipse cx="${tx + Math.cos(la - .9)*7}" cy="${ty + Math.sin(la - .9)*7}" rx="7" ry="3.5" fill="${sc}" transform="rotate(${((la - .9)*R2D).toFixed(0)} ${tx + Math.cos(la - .9)*7} ${ty + Math.sin(la - .9)*7})"/>
        <ellipse cx="${tx + Math.cos(la + .9)*7}" cy="${ty + Math.sin(la + .9)*7}" rx="7" ry="3.5" fill="${sc}" transform="rotate(${((la + .9)*R2D).toFixed(0)} ${tx + Math.cos(la + .9)*7} ${ty + Math.sin(la + .9)*7})"/>
        <ellipse cx="${SX}" cy="${SY}" rx="14" ry="10" fill="#B08A4F" stroke="#7A5C2E" transform="rotate(${S.horiz ? 90 : 0} ${SX} ${SY})"/>
        <path d="M${SX - 9} ${SY - 12}l18 24M${SX + 9} ${SY - 12}l-18 24" stroke="#94A3B8" stroke-width="1.5" opacity=".7"/>`;
      s += `<g transform="translate(640 60)"><rect width="290" height="150" rx="14" fill="#111827" stroke="#334155"/>
        <text x="20" y="30" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.06em">TIME-LAPSE</text>
        <text x="20" y="72" style="font:600 30px 'JetBrains Mono';fill:#7CFFB2">t = ${Math.round(st.t)} h</text>
        <text x="20" y="104" style="font:500 12px Inter;fill:#9CA3AF">${S.name}</text>
        <text x="20" y="126" style="font:500 11px Inter;fill:#9CA3AF">Bending angle = angle between the</text>
        <text x="20" y="142" style="font:500 11px Inter;fill:#9CA3AF">dashed original line and the tip.</text></g>`;
      $("#tp-scene").innerHTML = s;
      $("#tp-status").textContent = st.t === 0 ? "Grow the seedling, then measure the bending" : "Drag the protractor onto a bend, then drag the arm along the tip";
      ctx.readout([["Set-up", S.name], ["Time", Math.round(st.t) + " h"], ["Shoot reading", rs === null ? "—" : rs + "°"], ["Root reading", rr === null ? "—" : rr + "°"]]);
    }
    function drawProt(){
      const RP = 140;
      let p = `<path d="M-${RP} 0A${RP} ${RP} 0 0 1 ${RP} 0Z" fill="#DBEAFE" fill-opacity=".35" stroke="#2563EB" stroke-width="1.4"/><line x1="-${RP}" y1="0" x2="${RP}" y2="0" stroke="#2563EB" stroke-width="1"/>`;
      for(let a = 0; a <= 180; a++){
        const r = a*Math.PI/180, L = a % 10 === 0 ? 14 : a % 5 === 0 ? 9 : 5, c = Math.cos(r), sn = -Math.sin(r);
        p += `<line x1="${(RP*c).toFixed(2)}" y1="${(RP*sn).toFixed(2)}" x2="${((RP - L)*c).toFixed(2)}" y2="${((RP - L)*sn).toFixed(2)}" stroke="#1E3A8A" stroke-width="${a % 10 ? .6 : 1}"/>`;
        if(a % 10 === 0 && a % 180 !== 0){
          p += `<text x="${(114*c).toFixed(1)}" y="${(114*sn + 3.5).toFixed(1)}" text-anchor="middle" style="font:600 9.5px 'JetBrains Mono';fill:#1E3A8A">${a}</text>`;
          p += `<text x="${(94*c).toFixed(1)}" y="${(94*sn + 3).toFixed(1)}" text-anchor="middle" style="font:500 8px 'JetBrains Mono';fill:#B91C1C">${180 - a}</text>`;
        }
      }
      p += `<text x="${RP - 14}" y="-5" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#1E3A8A">0</text><text x="${-RP + 14}" y="-5" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#B91C1C">0</text>
        <circle r="3" fill="none" stroke="#B91C1C"/><line x1="-7" y1="0" x2="7" y2="0" stroke="#B91C1C"/><line x1="0" y1="-7" x2="0" y2="2" stroke="#B91C1C"/>
        <text x="0" y="-40" text-anchor="middle" style="font:600 9px Inter;fill:#1E3A8A">drag to move</text>`;
      $("#tp-prot").innerHTML = `<g transform="translate(${pc.x.toFixed(1)} ${pc.y.toFixed(1)}) rotate(${rot})" class="k-drag">${p}</g>`;
      const ar = arm/R2D, ex = pc.x + 190*Math.cos(ar), ey = pc.y + 190*Math.sin(ar);
      $("#tp-arm").innerHTML = `<line x1="${pc.x}" y1="${pc.y}" x2="${ex}" y2="${ey}" stroke="#B91C1C" stroke-width="1.6"/><g id="tp-handle" class="k-drag"><circle cx="${ex}" cy="${ey}" r="11" fill="#B91C1C" fill-opacity=".25" stroke="#B91C1C" stroke-width="2"/></g>`;
    }
    function draw(){ drawScene(); drawProt(); }
    Kit.dragger(ctx, svg, {
      hit(tg, p){ if(tg.closest("#tp-handle")) return { k:"arm" }; if(tg.closest("#tp-prot")) return { k:"move", x:pc.x, y:pc.y, p0:p }; return null; },
      move(h, p){
        if(h.k === "arm") arm = Math.atan2(p.y - pc.y, p.x - pc.x)*R2D;
        else{
          pc = { x:Kit.clamp(h.x + p.x - h.p0.x, 20, 940), y:Kit.clamp(h.y + p.y - h.p0.y, 20, 460) };
          if(geo) for(const o of [geo.sh, geo.rt]) if(Math.hypot(o.C[0] - pc.x, o.C[1] - pc.y) < 9) pc = { x:o.C[0], y:o.C[1] };
        }
        drawProt();
      }
    });
    function setKey(v){ key = v; newPlant(); draw(); }
    ctx.select({ label:"Set-up", value:"side", options:Object.entries(SET).map(([k, v]) => [k, v.name]), onChange:setKey });
    ctx.buttons([{ label:"Grow 6 hours", primary:true, onClick(){
      if(tw.busy(st)) return;
      if(st.t >= 48) return ctx.toast("48 hours is enough — set up a new seedling");
      rs = rr = null; rdS.clear(); rdR.clear();
      tw.add(st, { t:st.t + 6 }, .9, () => { st.t = Math.round(st.t); draw(); });
    } }, { label:"New seedling", onClick(){ newPlant(); draw(); } }]);
    tw.onFrame = drawScene;
    ctx.buttons([{ label:"Rotate protractor 90°", onClick(){ rot = (rot + 90) % 360; drawProt(); } }, { label:"Guide lines on/off", onClick(){ guides = !guides; drawScene(); } }]);
    const rdS = Kit.reading(ctx, "Shoot: angle of bending / °", "e.g. 40", () => st.t ? sAng() : null, 4, v => { rs = v; drawScene(); ctx.toast("Shoot angle noted"); });
    const rdR = Kit.reading(ctx, "Root: angle of bending / °", "e.g. 0", () => st.t ? rAng() : null, 4, v => { rr = v; drawScene(); ctx.toast("Root angle noted"); });
    ctx.buttons([{ label:"Record angles", primary:true, block:true, onClick(){
      if(tw.busy(st)) return;
      if(!st.t) return ctx.toast("Let the seedling grow first");
      if(rs === null || rr === null) return ctx.toast("Measure both the shoot and the root first (enter 0 if straight)");
      plant.recorded = plant.recorded || new Set();
      if(plant.recorded.has(Math.round(st.t))) return ctx.toast("Already recorded at this time — grow it further");
      ctx.record({ setup:SET[key].name, t:Math.round(st.t), shoot:rs, root:rr });
      plant.recorded.add(Math.round(st.t));
      if(st.t >= 24){
        if(key === "side" && rs > 15) ctx.complete("photo");
        if(key === "clino") ctx.complete("clino");
        if(key === "horiz") ctx.complete("gravi");
      }
      if(plant.recorded.size >= 4) ctx.complete("course");
    } }]);
    newPlant(); draw();
  }
});
