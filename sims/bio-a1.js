"use strict";
/* ══════════════════════════════════════════════════════════════════
   BIOLOGY · A LEVEL (9700 Paper 5) — part 1: respiration & photosynthesis
   Respirometer and RQ · Yeast respiration with methylene blue ·
   Chromatography of chloroplast pigments · Hill reaction with DCPIP
══════════════════════════════════════════════════════════════════ */
(function(){
  /* blend two hex colours, f = 0 → a, f = 1 → b */
  function mix(a, b, f){
    f = Math.max(0, Math.min(1, f));
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const A = p(a), B = p(b);
    return "#" + A.map((v, i) => Math.round(v + (B[i] - v)*f).toString(16).padStart(2, "0")).join("");
  }
  const mmss = s => Math.floor(s/60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");

  /* checks a stopwatch time against a tube that changes colour at tEnd (Infinity = never changes) */
  function judge(ctx, sw, rx, minWait){
    if(!rx) return ctx.toast("Set up and start a tube first"), null;
    if(sw.running) return ctx.toast("Stop the stopwatch first"), null;
    if(!isFinite(rx.tEnd)){
      if(sw.t < minWait) return ctx.toast(`No change yet — keep timing to at least ${minWait/60} min before you conclude “no change”`), null;
      return { t:null };
    }
    if(rx.t < rx.tEnd*.95) return ctx.toast("It doesn’t match the end-point tube yet — restart the stopwatch and keep watching"), null;
    if(sw.t < rx.tEnd*.85 || sw.t > rx.tEnd*1.2) return ctx.toast("Your stopwatch time doesn’t fit — start it as you add the indicator and stop it as the colours match. Repeat the tube."), null;
    return { t:Kit.round(sw.t, 1) };
  }

  /* ───────────── RESPIROMETER & RQ ───────────── */
  Lab.register({
    id:"respirometer", subject:"biology", level:["a"], topic:"Respiration · Respiratory quotient", interactive:true,
    title:"Respirometer: oxygen uptake & RQ",
    summary:"Set up a two-tube respirometer with a control tube, equilibrate it in a water bath, reset the index with the syringe and read how far it moves. Run with and without soda lime to find the RQ, and change the temperature.",
    aim:"Use a simple respirometer to measure the rate of oxygen uptake of germinating seeds or blowfly larvae, determine their respiratory quotient (RQ) and investigate the effect of temperature on the rate of respiration.",
    variables:{ iv:"Temperature of the water bath (°C); presence of soda lime (to find RQ)", dv:"Distance moved by the fluid index in the capillary (mm) → volume of gas (mm³) = πr²h", cv:["Same mass of organisms (5.0 g)","Same time interval","Capillary radius 0.50 mm","Same volume of soda lime and same total volume in A and B (glass beads in the control)","Equilibrate for 10 min before reading"] },
    stageTitle:"Respirometer in a water bath", controlsTitle:"Set up & run",
    thumb:`<svg viewBox="0 0 300 140"><rect x="150" y="70" width="130" height="62" fill="#8EC5F5" opacity=".5"/><rect x="170" y="44" width="22" height="80" rx="10" fill="#EEF3F8" stroke="#7C8BA0" stroke-width="2"/><rect x="236" y="44" width="22" height="80" rx="10" fill="#EEF3F8" stroke="#7C8BA0" stroke-width="2"/><circle cx="181" cy="80" r="5" fill="#7DBE4E"/><circle cx="181" cy="92" r="5" fill="#7DBE4E"/><path d="M247 44V30H20V50H181V44" fill="none" stroke="#7C8BA0" stroke-width="3"/><rect x="60" y="27" width="40" height="6" fill="#E0334A"/>${[...Array(14)].map((_, i) => `<line x1="${30 + i*10}" y1="16" x2="${30 + i*10}" y2="${i % 5 ? 21 : 24}" stroke="#555"/>`).join("")}</svg>`,
    steps:[
      { id:"eq",  text:"Leave in the water bath with the screw clip open to equilibrate" },
      { id:"set", text:"Close the clip and set the index to zero with the syringe" },
      { id:"run", text:"Leave for the chosen time interval" },
      { id:"read",text:"Read the distance moved by the index" }
    ],
    challenges:[
      { id:"vol",   title:"Volume of oxygen", text:"Convert your last soda-lime reading into a volume of oxygen in mm³." },
      { id:"rqc",   title:"RQ of peas", text:"Find the RQ of germinating peas (with and without soda lime, same temperature)." },
      { id:"rql",   title:"RQ of castor seeds", text:"Find the RQ of germinating castor oil seeds and compare it with peas." },
      { id:"temp",  title:"Temperature", text:"Measure oxygen uptake of one organism (with soda lime) at four or more temperatures." }
    ],
    columns:[{key:"org",label:"Organisms"},{key:"sl",label:"Soda lime"},{key:"T",label:"Temperature / °C",dp:0},{key:"t",label:"Time / min",dp:0},{key:"h",label:"Distance moved / mm",dp:1},{key:"hr",label:"Distance per minute / mm min⁻¹",dp:2},{key:"eq",label:"Equilibrated"}],
    series:"org",
    graph:{ x:["T"], y:["hr"], fit:"curve" },
    questions:[
      { q:"Explain why the index moves towards tube A when soda lime is present.",
        a:"Soda lime absorbs the carbon dioxide released, so only the oxygen taken up by the organisms changes the gas volume. Oxygen uptake lowers the pressure in tube A, so the higher pressure on the control side pushes the fluid towards A. The distance moved measures oxygen uptake." },
      { q:"A student’s index moved 42 mm in 10 min with soda lime and 12 mm in 10 min without it. Calculate the RQ and suggest the respiratory substrate. (Capillary radius 0.50 mm.)",
        a:"Oxygen taken up ∝ 42 mm. Without soda lime the movement is O₂ uptake minus CO₂ released, so CO₂ ∝ 42 − 12 = 30 mm. RQ = CO₂ ÷ O₂ = 30 ÷ 42 = 0.71, so lipid is being respired. (Volume of O₂ = π × 0.50² × 42 = 33 mm³; the radius cancels in the ratio.)" },
      { q:"What is the purpose of the control tube B, and what should it contain?",
        a:"It compensates for changes in temperature and atmospheric pressure, which act on both tubes equally, so any movement is due only to the organisms. It should contain glass beads (or boiled, dead seeds) of the same volume as the organisms, and the same volume of soda lime." },
      { q:"Why must the apparatus equilibrate in the water bath before the screw clip is closed?",
        a:"When the tubes are placed in the bath the gas inside warms (or cools) and expands (or contracts), which would move the index regardless of respiration. Leaving the clip open for about 10 min lets the temperature and pressure settle before readings begin." },
      { q:"Assess the risks of this investigation and how to reduce them.",
        a:"Soda lime is corrosive (contains sodium hydroxide): wear eye protection and gloves, and keep it separated from the organisms by gauze. Wash hands after handling seeds (may carry fungicide) and larvae. Use a thermostatically controlled bath and keep electrical equipment away from water. Treat animals ethically: use short runs, do not exceed 35–40 °C and return larvae afterwards." },
      { q:"Suggest two limitations of this method and an improvement for each.",
        a:"The index can stick or move unevenly — tap gently and use a fine capillary with a reliable scale, or a manometer with a calibrated syringe to measure the volume directly. Temperature in the bath varies — use a thermostatically controlled water bath and check with a thermometer. Only one reading per condition — repeat three times and calculate a mean, using fresh organisms of the same mass." }
    ],
    setup(ctx){
      const R = .5, AREA = Math.PI*R*R, MASS = 5, SPEED = 40;
      const ORG = {
        peas:   { name:"Germinating peas", rq:1.00, v:34, col:"#7DBE4E" },
        castor: { name:"Germinating castor oil seeds", rq:.71, v:26, col:"#8C6239" },
        larvae: { name:"Blowfly larvae", rq:.85, v:40, col:"#EFE6CF" }
      };
      let org = "peas", sl = true, T = 25, dur = 10, phase = "setup", eq = false, clock = 0, run = null;
      const X0 = 160, PX = 4;                        // capillary scale: 0 mm at x = 160, 4 px per mm
      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="rs-svg"><defs>${Kit.DEFS}<clipPath id="rs-clip"><rect x="80" y="236" width="460" height="92" rx="8"/></clipPath></defs>${Kit.bench(960, 450)}
        <g id="rs-fixed"></g><g id="rs-live"></g><text x="24" y="34" class="k-status" id="rs-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#rs-svg"), $ = s => svg.querySelector(s);
      function tube(x, inner){
        return `<path d="M${x - 28} 205V400a28 28 0 0 0 56 0V205" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>${inner}<rect x="${x - 32}" y="192" width="64" height="20" rx="3" fill="#3A3A3A"/>`;
      }
      function drawFixed(){
        const o = ORG[org];
        let s = `<rect x="580" y="236" width="340" height="212" rx="8" fill="url(#k-water)" stroke="var(--txt2)"/><text x="900" y="258" text-anchor="end" class="k-tag">water bath ${T} °C</text>`;
        const soda = x => sl ? [...Array(14)].map((_, i) => `<circle cx="${x - 18 + (i % 5)*9}" cy="${420 - Math.floor(i/5)*9}" r="4" fill="#F3F4F6" stroke="#9CA3AF" stroke-width=".7"/>`).join("") + `<line x1="${x - 26}" y1="392" x2="${x + 26}" y2="392" stroke="#6B7280" stroke-width="2" stroke-dasharray="3 2"/>` : "";
        let orgs = "";
        for(let i = 0; i < 12; i++){ const x = 790 - 16 + (i % 4)*11, y = 380 - Math.floor(i/4)*14;
          orgs += org === "larvae" ? `<ellipse cx="${x}" cy="${y}" rx="7" ry="3.5" fill="${o.col}" stroke="#A8996E" transform="rotate(${(i*37) % 60 - 30} ${x} ${y})"/>` : org === "castor" ? `<ellipse cx="${x}" cy="${y}" rx="6" ry="4.5" fill="${o.col}" stroke="#4A3320"/><ellipse cx="${x - 1}" cy="${y - 1}" rx="2" ry="1.2" fill="#C9A77C"/>` : `<circle cx="${x}" cy="${y}" r="5.5" fill="${o.col}" stroke="#3F7A2E"/>`; }
        let beads = "";
        for(let i = 0; i < 12; i++) beads += `<circle cx="${630 - 16 + (i % 4)*11}" cy="${380 - Math.floor(i/4)*14}" r="5" fill="#D9E2EC" stroke="#8896A8"/>`;
        s += tube(790, soda(790) + orgs) + tube(630, soda(630) + beads);
        s += `<text x="790" y="478" text-anchor="middle" class="k-tag">A · ${MASS.toFixed(1)} g organisms</text><text x="630" y="478" text-anchor="middle" class="k-tag">B · control (glass beads)</text>`;
        // capillary U-tube: top run joins A, bottom run joins B
        s += `<path d="M790 192V100H100V170H630V192" fill="none" stroke="#9AA6B8" stroke-width="7" stroke-linejoin="round"/><path d="M790 192V100H100V170H630V192" fill="none" stroke="#EEF3F8" stroke-width="3" stroke-linejoin="round"/>`;
        for(let mm = -10; mm <= 140; mm++){ const x = X0 + mm*PX, L = mm % 10 === 0 ? 14 : mm % 5 === 0 ? 10 : 6;
          s += `<line x1="${x}" y1="106" x2="${x}" y2="${106 + L}" stroke="var(--txt2)" stroke-width=".7"/>`;
          if(mm % 10 === 0) s += `<text x="${x}" y="132" text-anchor="middle" class="k-num">${mm}</text>`; }
        s += `<text x="${X0 + 140*PX}" y="146" text-anchor="end" class="k-lbl">capillary scale / mm · r = ${R.toFixed(2)} mm</text>`;
        // syringe and screw clip on the A side
        s += `<path d="M790 100H830" stroke="#9AA6B8" stroke-width="5"/><rect x="830" y="88" width="80" height="24" rx="3" fill="url(#k-glass)" stroke="var(--txt2)"/><rect id="rs-plunger" x="870" y="91" width="6" height="18" fill="#6B7280"/><path d="M876 100H930" stroke="#6B7280" stroke-width="4"/><text x="870" y="80" text-anchor="middle" class="k-lbl">syringe</text>`;
        s += `<path d="M740 100V62" stroke="#9AA6B8" stroke-width="5"/><text x="740" y="50" text-anchor="middle" class="k-lbl">screw clip</text>`;
        // magnified window frame
        s += `<rect x="80" y="236" width="460" height="92" rx="8" fill="#F7F9FC" stroke="var(--brd2)"/><text x="88" y="350" class="k-lbl">magnified view of the scale around the meniscus nearest A</text>`;
        $("#rs-fixed").innerHTML = s;
      }
      const hNow = () => run ? run.h*Math.min(1, run.t/(run.dur*60)) + (phase === "running" ? run.jit*Math.sin(run.t/7) : 0) : 0;
      function drawLive(){
        const h = hNow(), mx = X0 + h*PX;
        let s = `<rect x="${Math.max(102, mx - 90)}" y="96" width="${Math.max(0, mx - Math.max(102, mx - 90))}" height="8" fill="#E0334A"/>`;
        // clip
        s += `<rect x="728" y="${eq && phase !== "eq" ? 70 : 64}" width="24" height="${eq && phase !== "eq" ? 14 : 6}" rx="2" fill="#475569"/><text x="760" y="76" class="k-lbl">${phase === "running" || phase === "done" ? "closed" : "open"}</text>`;
        // magnified view: 20 px per mm
        const Z = 20, cx = 310, m0 = h;
        let z = `<rect x="80" y="252" width="460" height="22" fill="#EEF3F8"/><rect x="80" y="252" width="${Math.max(0, cx - 80)}" height="22" fill="#E0334A" opacity=".9"/><path d="M${cx} 252q-6 11 0 22" fill="none" stroke="#7A1022" stroke-width="2"/>`;
        for(let mm = Math.floor(m0 - 12); mm <= Math.ceil(m0 + 12); mm++){ const x = cx + (mm - m0)*Z;
          for(const half of [0, .5]){ const xx = x + half*Z, big = !half && mm % 5 === 0;
            z += `<line x1="${xx}" y1="278" x2="${xx}" y2="${278 + (half ? 6 : big ? 18 : 12)}" stroke="#334155" stroke-width="${big ? 1.4 : .9}"/>`; }
          if(mm % 5 === 0) z += `<text x="${x}" y="312" text-anchor="middle" style="font:600 12px 'JetBrains Mono',monospace;fill:#334155">${mm}</text>`;
        }
        s += `<g clip-path="url(#rs-clip)">${z}</g>`;
        s += `<text x="380" y="410" text-anchor="middle" class="k-numb" style="font-size:22px">${mmss(clock)}</text><text x="380" y="428" text-anchor="middle" class="k-lbl">${phase === "eq" ? "equilibrating" : phase === "running" ? `running · ${dur} min interval` : "clock"}</text>`;
        $("#rs-live").innerHTML = s;
        $("#rs-plunger").setAttribute("x", phase === "running" || phase === "done" ? 852 : 870);
        $("#rs-status").textContent = phase === "eq" ? "Equilibrating with the clip open…" : phase === "running" ? "Index moving — wait for the time interval" : phase === "done" ? "Time up — read the meniscus on the magnified scale" : eq ? "Equilibrated — close the clip and reset the index" : "Equilibrate first (clip open)";
        ctx.readout([["Organisms", ORG[org].name], ["Soda lime", sl ? "in both tubes" : "none"], ["Bath", T + " °C"], ["Equilibrated", eq ? "yes" : "no", eq ? "good" : "warn"]]);
      }
      function changed(){ if(phase === "running" || phase === "eq") return false; phase = "setup"; eq = false; run = null; clock = 0; rd.clear(); ctx.resetSteps(); drawFixed(); drawLive(); return true; }
      ctx.frame(dt => {
        if(phase === "eq"){ clock += dt*SPEED*1.5; if(clock >= 600){ clock = 600; phase = "setup"; eq = true; ctx.step("eq"); ctx.toast("Equilibrated — close the clip"); } drawLive(); }
        else if(phase === "running"){ run.t += dt*SPEED; clock = run.t;
          if(run.t >= run.dur*60){ run.t = run.dur*60; clock = run.t; phase = "done"; ctx.step("run"); }
          if(Math.abs(hNow()) >= 140){ phase = "done"; run.h = 140*Math.sign(run.h); run.t = run.dur*60; ctx.toast("The index reached the end of the scale — use a shorter time interval"); }
          drawLive(); }
      });
      const oSel = ctx.select({ label:"Organisms in tube A", value:org, options:Object.entries(ORG).map(([k, o]) => [k, o.name]), onChange(v){ const old = org; org = v; if(!changed()){ org = old; oSel.set(old); ctx.toast("Wait for the run to finish"); } } });
      const slSeg = ctx.seg({ label:"Soda lime (absorbs CO₂)", value:true, options:[[true,"In both tubes"],[false,"None"]], onChange(v){ const old = sl; sl = v; if(!changed()){ sl = old; slSeg.set(old); ctx.toast("Wait for the run to finish"); } } });
      const tSeg = ctx.seg({ label:"Water bath / °C", value:25, options:[10,15,20,25,30,35,40].map(v => [v, String(v)]), onChange(v){ const old = T; T = v; if(!changed()){ T = old; tSeg.set(old); ctx.toast("Wait for the run to finish"); } } });
      ctx.seg({ label:"Time interval", value:10, options:[[2,"2 min"],[5,"5 min"],[10,"10 min"]], onChange(v){ if(phase === "running") return; dur = v; } });
      ctx.buttons([{ label:"Equilibrate 10 min", onClick(){
        if(phase === "running" || phase === "eq") return; if(eq) return ctx.toast("Already equilibrated");
        phase = "eq"; clock = 0; run = null;
      } }, { label:"Close clip, zero with syringe & start", primary:true, onClick(){
        if(phase === "running" || phase === "eq") return ctx.toast("Wait for the clock");
        if(phase === "done") return ctx.toast("Read this run first, or change a setting for a new set-up");
        const o = ORG[org];
        let f = Math.pow(2, (T - 25)/10); if(org === "larvae" && T > 35) f *= .7;
        const vO2 = o.v*f*dur/10*(1 + .06*ctx.gauss());
        const rq = Math.min(1, o.rq + .025*ctx.gauss());
        let h = (sl ? vO2 : vO2*(1 - rq))/AREA + (sl ? 0 : .4*ctx.gauss());
        if(!eq){ h += (Math.random() < .5 ? -1 : 1)*(3 + 3*Math.abs(ctx.gauss())); ctx.toast("Not equilibrated — the gas is still warming up"); }
        run = { h:Kit.round(h, 1), t:0, dur, jit:.3, eq };
        phase = "running"; clock = 0; rd.clear(); ctx.step("set");
      } }]);
      ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Clock runs ×${SPEED}. Changing the organisms, soda lime or temperature means a new set-up that must equilibrate again.</p>`);
      const rd = Kit.reading(ctx, "Distance moved by the index towards A / mm (negative if away)", "e.g. 43.5", () => phase === "done" && run ? run.h : null, .5, v => {
        const o = ORG[org];
        ctx.record({ org:o.name, sl: sl ? "yes" : "no", T, t:run.dur, h:v, hr:Kit.round(v/run.dur, 2), eq: run.eq ? "yes" : "no" });
        ctx.step("read"); phase = "setup"; run = null; clock = 0; rd.clear(); drawLive();
        const rows = ctx.rows().filter(r => r.sl === "yes" && r.eq === "yes"), by = {};
        rows.forEach(r => { (by[r.org] = by[r.org] || new Set()).add(r.T); });
        if(Object.values(by).some(s => s.size >= 4)) ctx.complete("temp");
      });
      const last = (name, s, T) => ctx.rows().filter(r => r.org === name && r.sl === s && (T === undefined || r.T === T)).pop();
      Kit.answer(ctx, "Volume of O₂ taken up in your last soda-lime run / mm³", "e.g. 34", v => {
        const r = ctx.rows().filter(r => r.sl === "yes").pop(); if(!r) return [false, "Do a run with soda lime first."];
        const V = AREA*r.h;
        if(Math.abs(v - V) <= Math.max(.5, Math.abs(V)*.02)){ ctx.complete("vol"); return [true, `Correct: π × 0.50² × ${r.h} = ${V.toFixed(1)} mm³ in ${r.t} min = ${(V/(MASS*r.t)).toFixed(2)} mm³ g⁻¹ min⁻¹.`]; }
        return [false, "Volume = πr²h with r = 0.50 mm and h = the distance moved in mm."];
      });
      const rqOrg = ctx.select({ label:"RQ for", value:"peas", options:Object.entries(ORG).map(([k, o]) => [k, o.name]) });
      Kit.answer(ctx, "RQ = CO₂ released ÷ O₂ taken up", "e.g. 0.95", v => {
        const name = ORG[rqOrg.get()].name, a = last(name, "yes");
        if(!a) return [false, "Do a run with soda lime for these organisms first."];
        const b = last(name, "no", a.T); if(!b) return [false, `Now do a run without soda lime at ${a.T} °C.`];
        const x = a.hr, y = b.hr, rq = (x - y)/x;
        if(Math.abs(v - rq) <= .04){
          if(rqOrg.get() === "peas") ctx.complete("rqc");
          if(rqOrg.get() === "castor") ctx.complete("rql");
          const sub = rq > .9 ? "carbohydrate" : rq > .78 ? "protein (or a mixture)" : "lipid";
          return [true, `Correct: O₂ ∝ ${x.toFixed(2)}, CO₂ ∝ ${x.toFixed(2)} − ${y.toFixed(2)} = ${(x - y).toFixed(2)} mm min⁻¹, RQ = ${rq.toFixed(2)} → mainly ${sub}.`];
        }
        return [false, "Use distance per minute. With soda lime = O₂ uptake. Without = O₂ uptake − CO₂ released. So CO₂ = (with − without) and RQ = CO₂ ÷ O₂."];
      });
      drawFixed(); drawLive();
    }
  });

  /* ───────────── YEAST RESPIRATION WITH METHYLENE BLUE ───────────── */
  Lab.register({
    id:"redox", subject:"biology", level:["a"], topic:"Respiration · Redox indicators", interactive:true,
    title:"Yeast respiration with methylene blue",
    summary:"Add methylene blue to yeast and glucose in a water bath and time how long it takes to decolourise, matching against an end-point tube. Change the temperature or glucose concentration, plot rate = 1/t and calculate Q₁₀.",
    aim:"Use the redox indicator methylene blue to investigate the effect of temperature and substrate (glucose) concentration on the rate of respiration of yeast.",
    variables:{ iv:"Temperature (°C) or glucose concentration (%)", dv:"Time for methylene blue to decolourise (s) → rate = 1/t (s⁻¹)", cv:["Same volume and concentration of yeast suspension (from the same well-stirred stock)","Same volume of methylene blue (1 cm³)","Pre-incubate tubes at the bath temperature","Do not shake after mixing","Same end-point (match the end-point tube)"] },
    stageTitle:"Water bath & tubes", controlsTitle:"Set up & time",
    thumb:`<svg viewBox="0 0 300 140"><rect x="40" y="60" width="220" height="70" fill="#8EC5F5" opacity=".5"/>${[["#2F62C8",90],["#7F9AD0",150],["#E9DDB8",210]].map(([c, x]) => `<rect x="${x - 14}" y="20" width="28" height="100" rx="12" fill="${c}" stroke="#7C8BA0" stroke-width="2"/>`).join("")}</svg>`,
    steps:[
      { id:"pre", text:"Pre-incubate yeast + glucose in the bath" },
      { id:"add", text:"Add methylene blue, invert once and start the stopwatch" },
      { id:"stop",text:"Stop when the colour matches the end-point tube" }
    ],
    challenges:[
      { id:"temp", title:"Temperature", text:"Time five different temperatures at the same glucose concentration." },
      { id:"conc", title:"Substrate concentration", text:"Time five glucose concentrations at the same temperature." },
      { id:"q10",  title:"Q₁₀", text:"Calculate Q₁₀ between 25 °C and 35 °C from your rates." },
      { id:"ctrl", title:"Control", text:"Show that boiled yeast does not decolourise methylene blue." }
    ],
    columns:[{key:"yeast",label:"Yeast"},{key:"T",label:"Temperature / °C",dp:0},{key:"c",label:"Glucose / %",dp:1},{key:"t",label:"Time to decolourise / s",dp:1},{key:"rate",label:"Rate = 1/t / s⁻¹",dp:4},{key:"pre",label:"Pre-incubated"}],
    graph:{ x:["T","c"], y:["rate","t"], fit:"curve" },
    questions:[
      { q:"Explain why methylene blue loses its colour in respiring yeast.",
        a:"Dehydrogenase enzymes remove hydrogen from respiratory substrates (e.g. in glycolysis and the Krebs cycle). Methylene blue acts as an artificial hydrogen acceptor in place of NAD/FAD; when it is reduced it becomes colourless. The faster the rate of respiration, the faster it decolourises." },
      { q:"Why must the tube not be shaken after the methylene blue is added?",
        a:"Shaking dissolves oxygen from the air, which oxidises reduced methylene blue back to blue. This would increase the time and make results unreliable. A layer of liquid paraffin on the surface can also limit oxygen entering." },
      { q:"Describe a suitable control and explain its purpose.",
        a:"Boiled (denatured) yeast with glucose and methylene blue, at the same temperature. It should stay blue, showing that decolourisation is caused by enzyme activity in living yeast, not by glucose or temperature alone. An end-point tube (yeast + water instead of methylene blue) is used to judge when the colour has gone." },
      { q:"Rates at 25 °C and 35 °C were 0.0062 s⁻¹ and 0.0121 s⁻¹. Calculate Q₁₀ and explain what it shows.",
        a:"Q₁₀ = rate at (T + 10) ÷ rate at T = 0.0121 ÷ 0.0062 = 1.95 (≈ 2). The rate roughly doubles for a 10 °C rise, as expected for an enzyme-controlled process below its optimum temperature: more kinetic energy, more frequent successful collisions." },
      { q:"Identify the main source of error and suggest an improvement.",
        a:"Judging the end-point by eye is subjective. Compare against an end-point tube against a white background, use the same person each time, or use a colorimeter to measure absorbance at a set value. Also repeat each condition three times and calculate a mean, discarding anomalies." },
      { q:"Assess the risks of this investigation.",
        a:"Low. Methylene blue stains skin and clothing and is harmful if swallowed — wear gloves and eye protection. Hot water baths above 50 °C can scald. Yeast can cause allergic reactions in some people; wash hands afterwards and wipe spills." }
    ],
    setup(ctx){
      const SPEED = 15;
      let T = 30, c = 5, yeast = "live", pre = false, preT = 0, rx = null;
      const sw = Kit.stopwatch("rx-sw", 740, 330), th = Kit.thermometer("rx-th", 560, 120, 220, 0, 60, 10, true);
      ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="rx-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 450)}
        <rect x="160" y="200" width="480" height="248" rx="10" fill="url(#k-water)" stroke="var(--txt2)"/><text x="400" y="440" text-anchor="middle" class="k-tag" id="rx-bath"></text>
        <g id="rx-tubes"></g>${th.svg}${sw.svg}<text x="24" y="34" class="k-status" id="rx-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#rx-svg"), $ = s => svg.querySelector(s);
      sw.bind(svg);
      const BLUE = "#2A5BC4", CREAM = "#E9DDB8";
      function tEnd(){
        if(yeast === "boiled") return Infinity;
        let f = Math.pow(2, (T - 30)/10); if(T > 40) f *= Math.max(.05, 1 - (T - 40)/12);
        const r = .15 + c/(c + 1);
        return 120*.983/(r*f);
      }
      const tb = (x, fill, lbl, sub) => `<path d="M${x - 22} 90V330a22 22 0 0 0 44 0V90" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><path d="M${x - 20} 170V330a20 20 0 0 0 40 0V170z" fill="${fill}"/><text x="${x}" y="70" text-anchor="middle" class="k-tag">${lbl}</text><text x="${x}" y="84" text-anchor="middle" class="k-lbl">${sub}</text>`;
      function draw(){
        let blue = 0;
        if(rx){ blue = isFinite(rx.tEnd) ? Math.pow(Math.max(0, 1 - rx.t/rx.tEnd), .8) : 1 - Math.min(.06, rx.t/20000); }
        const fill = rx ? mix(CREAM, BLUE, blue) : yeast === "boiled" ? "#E4DCC6" : CREAM;
        $("#rx-tubes").innerHTML = tb(280, CREAM, "End-point tube", "yeast + glucose + water") + tb(470, fill, "Test tube", rx ? "+ methylene blue" : "yeast + glucose");
        $("#rx-bath").textContent = `water bath ${T} °C`;
        th.set(svg, T);
        $("#rx-status").textContent = !rx ? (pre ? "Ready — add methylene blue and start timing" : "Pre-incubate the tube in the bath first") : "Compare with the end-point tube";
        ctx.readout([["Yeast", yeast === "live" ? "live" : "boiled (control)"], ["Glucose", c + " %"], ["Bath", T + " °C"], ["Tube time", rx ? mmss(rx.t) : "—"]]);
      }
      ctx.frame(dt => { sw.tick(dt*SPEED); if(rx) rx.t += dt*SPEED; if(preT > 0){ preT -= dt*SPEED*2; if(preT <= 0){ pre = true; ctx.step("pre"); ctx.toast("Tube is at bath temperature"); } } draw(); });
      const newTube = () => { rx = null; pre = false; preT = 0; sw.reset(); ctx.resetSteps(); };
      ctx.seg({ label:"Yeast", value:"live", options:[["live","Live yeast"],["boiled","Boiled yeast (control)"]], onChange(v){ yeast = v; newTube(); } });
      ctx.seg({ label:"Water bath / °C", value:30, options:[20,25,30,35,40,45,50].map(v => [v, String(v)]), onChange(v){ T = v; newTube(); } });
      ctx.seg({ label:"Glucose concentration / %", value:5, options:[0,.5,1,2,5,10].map(v => [v, String(v)]), onChange(v){ c = v; newTube(); } });
      ctx.buttons([{ label:"Pre-incubate 10 min", onClick(){ if(rx) return ctx.toast("Record or discard this tube first"); if(pre || preT > 0) return; preT = 600; } },
        { label:"Add methylene blue & invert once", primary:true, onClick(){
          if(rx) return ctx.toast("This tube already has methylene blue");
          let te = tEnd()*(1 + .05*ctx.gauss());
          if(!pre){ te *= 1.25 + .15*Math.abs(ctx.gauss()); ctx.toast("Not pre-incubated — it starts below bath temperature"); }
          rx = { t:0, tEnd: te > 1500 ? Infinity : te, pre }; ctx.step("add"); ctx.toast("Start the stopwatch!");
        } }]);
      ctx.buttons([{ label:"Record time", primary:true, onClick(){
        const j = judge(ctx, sw, rx, 600); if(!j) return;
        ctx.record({ yeast: yeast === "live" ? "live" : "boiled", T, c, t:j.t, rate: j.t ? Kit.round(1/j.t, 5) : 0, pre: rx.pre ? "yes" : "no" });
        ctx.step("stop");
        if(yeast === "boiled" && j.t === null) ctx.complete("ctrl");
        const rows = ctx.rows().filter(r => r.yeast === "live" && r.t), tby = {}, cby = {};
        rows.forEach(r => { (tby[r.c] = tby[r.c] || new Set()).add(r.T); (cby[r.T] = cby[r.T] || new Set()).add(r.c); });
        if(Object.values(tby).some(s => s.size >= 5)) ctx.complete("temp");
        if(Object.values(cby).some(s => s.size >= 5)) ctx.complete("conc");
        newTube();
      } }, { label:"Shake the tube", onClick(){ if(!rx) return; rx.t = Math.max(0, rx.t - 120); ctx.toast("Oxygen dissolved — it turned blue again. Don’t shake!"); } }, { label:"Discard tube", onClick(){ newTube(); } }]);
      ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Time runs ×${SPEED}. If nothing has changed after 10 min, record “no change”.</p>`);
      Kit.answer(ctx, "Q₁₀ between 25 °C and 35 °C (same glucose)", "e.g. 2.0", v => {
        const rows = ctx.rows().filter(r => r.yeast === "live" && r.t);
        const pair = [...new Set(rows.map(r => r.c))].map(cc => [rows.filter(r => r.c === cc && r.T === 25).pop(), rows.filter(r => r.c === cc && r.T === 35).pop()]).find(([a, b]) => a && b);
        if(!pair) return [false, "Time tubes at 25 °C and at 35 °C with the same glucose concentration first."];
        const q = pair[1].rate/pair[0].rate;
        if(Math.abs(v - q) <= Math.max(.05, q*.03)){ ctx.complete("q10"); return [true, `Correct: ${pair[1].rate.toFixed(4)} ÷ ${pair[0].rate.toFixed(4)} = ${q.toFixed(2)}.`]; }
        return [false, "Q₁₀ = rate at 35 °C ÷ rate at 25 °C, with rate = 1/t."];
      });
      draw();
    }
  });

  /* ───────────── CHROMATOGRAPHY OF CHLOROPLAST PIGMENTS ───────────── */
  Lab.register({
    id:"chromatography", subject:"biology", level:["a"], topic:"Photosynthesis · Chloroplast pigments", interactive:true,
    title:"Chromatography of chloroplast pigments",
    summary:"Draw an origin line, grind a leaf with propanone and sand, build up a concentrated spot, run it in a sealed tank and mark the solvent front. Measure each band with a ruler and use Rf values to identify the pigments.",
    aim:"Separate the photosynthetic pigments in a leaf extract by paper chromatography and identify them from their Rf values.",
    variables:{ iv:"(Identification) the pigment band", dv:"Distance moved by the pigment and by the solvent (mm) → Rf = distance moved by pigment ÷ distance moved by solvent", cv:["Same solvent","Tank sealed so the atmosphere is saturated with solvent vapour","Origin above the solvent","Concentrated, small spot"] },
    stageTitle:"Chromatography tank", controlsTitle:"Prepare, run & measure",
    thumb:`<svg viewBox="0 0 300 140"><rect x="120" y="8" width="60" height="126" fill="#FAF8F2" stroke="#A2ACBD"/><line x1="120" y1="118" x2="180" y2="118" stroke="#888" stroke-dasharray="3 2"/>${[["#F28C1C",14],["#E8D21A",40],["#1F8A5B",54],["#8DB33A",66]].map(([c, y]) => `<ellipse cx="150" cy="${y}" rx="18" ry="4" fill="${c}"/>`).join("")}</svg>`,
    steps:[
      { id:"line",  text:"Draw an origin line 20 mm from the bottom" },
      { id:"grind", text:"Grind the leaf with propanone and sand" },
      { id:"spot",  text:"Spot the extract on the origin, drying between spots" },
      { id:"tank",  text:"Stand the paper in the solvent and seal the tank" },
      { id:"front", text:"Remove the paper and mark the solvent front" },
      { id:"meas",  text:"Measure distances and calculate Rf values" }
    ],
    challenges:[
      { id:"good",  title:"Clean chromatogram", text:"Produce a run with no faults and four clearly separated bands." },
      { id:"rf",    title:"Rf value", text:"Calculate the Rf value of one band from your own measurements." },
      { id:"all4",  title:"Identify all four", text:"Record and correctly identify all four pigments from one clean run." },
      { id:"faults",title:"What went wrong?", text:"Produce runs showing two different faults." }
    ],
    columns:[{key:"run",label:"Run",dp:0},{key:"band",label:"Band"},{key:"d",label:"Pigment distance / mm",dp:1},{key:"f",label:"Solvent distance / mm",dp:1},{key:"rf",label:"Rf",dp:2},{key:"id",label:"Identified as"},{key:"ok",label:"Correct?"}],
    questions:[
      { q:"Why is the origin line drawn in pencil, not pen?",
        a:"Pencil (graphite) is insoluble in the solvent, so it stays put. Ink contains dyes that dissolve and would separate into coloured spots, mixing with the pigment bands." },
      { q:"Why must the origin be above the level of the solvent?",
        a:"If the spot is below the surface the pigments dissolve into the solvent in the tank instead of moving up the paper, so no bands form." },
      { q:"Explain how the pigments separate.",
        a:"Pigments differ in how soluble they are in the moving solvent and how strongly they are attracted to (adsorbed on) the paper. More soluble, less strongly held pigments such as carotene move furthest; chlorophyll b moves least." },
      { q:"A band moved 52 mm when the solvent front moved 84 mm. Calculate its Rf and suggest the pigment.",
        a:"Rf = 52 ÷ 84 = 0.62, which matches chlorophyll a (blue-green). Rf values have no units and are always less than 1." },
      { q:"Why is the tank sealed and the spot made small and concentrated?",
        a:"Sealing saturates the air with solvent vapour, so the solvent does not evaporate from the paper; the front stays level and moves steadily, giving reproducible Rf values. A small, concentrated spot (many applications, dried between each) gives narrow, intense bands that separate clearly." },
      { q:"Assess the risks and suggest an improvement to the method.",
        a:"Propanone and chromatography solvents are highly flammable and their vapour is harmful and irritant: no naked flames, use a fume cupboard or well-ventilated room, wear eye protection and keep the tank sealed. Improvement: use thin-layer chromatography (TLC), which gives faster, sharper separation, and measure from the centre of each band; repeat to find a mean Rf." }
    ],
    setup(ctx){
      const PX = 3, PB = 490, OY = PB - 20*PX, TOPMM = 130;      // paper bottom y, origin y, max travel above origin
      const PIG = [
        { k:"car", name:"Carotene", col:"#F28C1C", colour:"orange-yellow", rf:.95, w:2.5, amt:.8 },
        { k:"xan", name:"Xanthophyll", col:"#E2C71A", colour:"yellow", rf:.71, w:3, amt:.55 },
        { k:"cha", name:"Chlorophyll a", col:"#1F8A5B", colour:"blue-green", rf:.62, w:3.5, amt:1 },
        { k:"chb", name:"Chlorophyll b", col:"#8DB33A", colour:"yellow-green", rf:.50, w:3.5, amt:.6 }
      ];
      let pen = "pencil", depth = 10, lid = true, dry = true, st, runNo = 0, seenFaults = new Set(), rulerX = 470, rulerY = 480, meas = {}, sel = 0;
      function fresh(){
        st = { line:false, grind:false, spots:0, wet:0, inTank:false, running:false, removed:false, front:0, t:0,
          rfs:PIG.map(p => Kit.clamp(p.rf + .015*ctx.gauss(), .3, .98)), faults:new Set(), recorded:new Set() };
        meas = {}; sel = 0;
      }
      fresh();
      ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="cg-svg"><defs>${Kit.DEFS}<filter id="cg-blur"><feGaussianBlur stdDeviation="2.2"/></filter></defs>${Kit.bench(960, 505)}
        <g id="cg-scene"></g><g id="cg-ruler" class="k-drag"></g><text x="560" y="50" class="k-status" id="cg-status"></text><g id="cg-side"></g></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#cg-svg"), $ = s => svg.querySelector(s);
      const vis = () => {                     // bands that can actually be seen
        const conc = Math.min(1, st.spots/8)*(depth > 20 ? .08 : 1);
        return PIG.map((p, i) => ({ p, i, op: conc*p.amt })).filter(b => b.op >= .22);
      };
      function bandY(i){ return OY - st.rfs[i]*st.front*PX; }
      function draw(){
        let s = "";
        const solventY = PB - depth*PX;
        if(!st.removed){
          s += `<rect x="250" y="${lid ? 30 : 40}" width="220" height="${lid ? 12 : 0}" rx="3" fill="#94A3B8" opacity=".9"/>`;
          s += `<rect x="256" y="42" width="208" height="458" rx="6" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>`;
          if(st.inTank) s += `<rect x="258" y="${solventY}" width="204" height="${500 - solventY - 2}" fill="${depth > 20 && st.spots ? "#B7D59A" : "#D7E7F7"}" opacity=".75"/>`;
          else s += `<rect x="258" y="${PB - 10*PX}" width="204" height="${500 - (PB - 10*PX) - 2}" fill="#D7E7F7" opacity=".75"/>`;
        }
        // paper
        const px0 = 300, pw = 120, ptop = PB - 150*PX;
        s += `<rect x="${px0}" y="${ptop}" width="${pw}" height="${150*PX}" fill="#FAF8F2" stroke="#BDB6A0"/>`;
        if(!st.removed){ const sy = st.inTank ? solventY : PB - 10*PX; if(st.inTank) s += `<rect x="${px0}" y="${sy}" width="${pw}" height="${PB - sy}" fill="#9CC3E6" opacity=".35"/>`; }
        if(st.front > 0){
          const fy = OY - st.front*PX;
          s += `<rect x="${px0 + 1}" y="${fy}" width="${pw - 2}" height="${OY - fy + 12}" fill="#E8F0F8" opacity=".55"/>`;
          if(st.removed) s += `<path d="M${px0} ${fy}H${px0 + pw}" stroke="#555" stroke-width="1.2" stroke-dasharray="${lid ? "0" : "5 3"}"/><text x="${px0 - 8}" y="${fy - 4}" text-anchor="end" class="k-lbl">solvent front</text>`;
          else if(!lid) s += `<path d="M${px0} ${fy}q30 10 60 0t60 0" stroke="#9BB5D0" fill="none" stroke-width="1.5"/>`;
        }
        if(st.line) s += `<path d="M${px0 + 6} ${OY}H${px0 + pw - 6}" stroke="${pen === "pen" ? "#3B3FD6" : "#666"}" stroke-width="1" ${pen === "pencil" ? `stroke-dasharray="1 0"` : ""}/>`;
        if(st.line && pen === "pen" && st.front > 8) s += `<g filter="url(#cg-blur)"><rect x="${px0 + 8}" y="${OY - st.front*.75*PX}" width="${pw - 16}" height="${st.front*.75*PX}" fill="#6D4CD6" opacity=".18"/><path d="M${px0 + 8} ${OY - st.front*.45*PX}H${px0 + pw - 8}" stroke="#C13BAA" stroke-width="5" opacity=".45"/></g>`;
        // spot / bands
        const wide = st.wet ? 1.8 : 1;
        if(st.spots && st.front < 3) s += `<ellipse cx="${px0 + pw/2}" cy="${OY}" rx="${(3 + st.spots*.3)*wide}" ry="${(3 + st.spots*.3)*wide}" fill="#2E6B34" opacity="${Math.min(1, .25 + st.spots*.1)}"/>`;
        if(st.spots && st.front >= 3){
          vis().forEach(({ p, i, op }) => {
            const y = bandY(i), w = (p.w + st.front*.03)*wide*PX/2;
            s += `<ellipse cx="${px0 + pw/2}" cy="${y}" rx="${(pw/2 - 14)*(wide > 1 ? 1.1 : 1)}" ry="${w}" fill="${p.col}" opacity="${Math.min(1, op).toFixed(2)}" filter="url(#cg-blur)"/>`;
          });
          if(st.removed) vis().forEach(({ i }, n) => s += `<text x="${px0 - 8}" y="${bandY(i) + 4}" text-anchor="end" class="k-tag">${n + 1}</text>`);
        }
        s += `<text x="${px0 + pw/2}" y="${PB + 14}" text-anchor="middle" class="k-lbl">${st.removed ? "chromatogram (dried)" : "chromatography paper"}</text>`;
        $("#cg-scene").innerHTML = s;
        // ruler (vertical, mm)
        let r = `<rect x="${rulerX}" y="${rulerY - 140*PX - 8}" width="40" height="${140*PX + 16}" rx="3" fill="#F2E6C2" stroke="#B8962E" opacity=".95"/>`;
        for(let mm = 0; mm <= 140; mm++){ const y = rulerY - mm*PX, L = mm % 10 === 0 ? 16 : mm % 5 === 0 ? 11 : 6;
          r += `<line x1="${rulerX}" y1="${y}" x2="${rulerX + L}" y2="${y}" stroke="#4B3621" stroke-width=".8"/>`;
          if(mm % 10 === 0) r += `<text x="${rulerX + 30}" y="${y + 3.5}" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#4B3621">${mm}</text>`; }
        $("#cg-ruler").innerHTML = st.removed ? r : "";
        const next = !st.line ? "Draw the origin line" : !st.grind ? "Grind the leaf to make an extract" : !st.spots ? "Spot the extract on the origin" : !st.inTank ? "Add more spots, or start the run" : st.running ? "Solvent rising — remove it before the top" : !st.removed ? "" : "Drag the ruler’s 0 to the origin line";
        $("#cg-status").textContent = next;
        const f = [...st.faults];
        $("#cg-side").innerHTML = `<g transform="translate(560 70)"><rect width="370" height="220" rx="12" fill="var(--bg2)" stroke="var(--brd2)"/>
          <text x="16" y="28" class="k-tag">Run ${runNo + 1} · ${pen} origin · solvent ${depth} mm deep</text>
          <text x="16" y="52" class="k-lbl">Spots applied: ${st.spots}${st.wet ? " (not dried between — spot spread)" : ""}</text>
          <text x="16" y="74" class="k-lbl">Tank: ${lid ? "sealed with lid" : "open"} · front: ${st.front ? st.front.toFixed(0) + " mm from origin" : "—"}</text>
          <text x="16" y="104" class="k-tag">${st.removed ? (f.length ? "Faults:" : "No faults seen") : ""}</text>
          ${f.map((t, i) => `<text x="16" y="${126 + i*20}" class="k-lbl" style="fill:var(--warn,#C2410C)">• ${t}</text>`).join("")}</g>`;
        ctx.readout([["Spots", String(st.spots)], ["Front", st.front ? st.front.toFixed(0) + " mm" : "—"], ["Bands visible", st.front >= 3 && st.spots ? String(vis().length) : "—"]]);
      }
      Kit.dragger(ctx, svg, {
        hit(tg, p){ return st.removed && tg.closest("#cg-ruler") ? { x:rulerX, y:rulerY, p0:p } : null; },
        move(h, p){ rulerX = Kit.clamp(h.x + p.x - h.p0.x, 200, 900); rulerY = Kit.clamp(h.y + p.y - h.p0.y, 140*PX + 8, 525); draw(); }
      });
      ctx.frame(dt => {
        if(!st.running) return;
        st.t += dt;
        const rate = lid ? 1 : .7;
        st.front = Math.min(TOPMM, 130*Math.sqrt(st.t*rate/40));
        if(st.front >= TOPMM){ st.running = false; st.faults.add("solvent front ran off the top of the paper"); ctx.toast("The solvent reached the top — you can’t measure the front now"); }
        draw();
      });
      const penSeg = ctx.seg({ label:"Origin line drawn in", value:"pencil", options:[["pencil","Pencil"],["pen","Ballpoint pen"]], onChange(v){ if(st.line){ penSeg.set(pen); return ctx.toast("Start a new paper to change this"); } pen = v; draw(); } });
      const dSeg = ctx.seg({ label:"Solvent depth in tank", value:10, options:[[10,"10 mm (below origin)"],[30,"30 mm (above origin)"]], onChange(v){ if(st.inTank){ dSeg.set(depth); return ctx.toast("Start a new paper to change this"); } depth = v; draw(); } });
      const lSeg = ctx.seg({ label:"Tank", value:true, options:[[true,"Sealed with lid"],[false,"Open"]], onChange(v){ if(st.inTank){ lSeg.set(lid); return ctx.toast("Start a new paper to change this"); } lid = v; draw(); } });
      ctx.seg({ label:"Between spots", value:true, options:[[true,"Dry each spot"],[false,"Don’t dry"]], onChange(v){ dry = v; } });
      ctx.buttons([{ label:"Draw origin line", onClick(){ if(st.line) return; st.line = true; ctx.step("line"); draw(); } },
        { label:"Grind leaf + propanone + sand", onClick(){ if(st.grind) return; st.grind = true; ctx.step("grind"); ctx.toast("Dark green extract ready"); draw(); } },
        { label:"Add a spot", onClick(){ if(!st.line || !st.grind) return ctx.toast("Draw the line and make the extract first"); if(st.inTank) return ctx.toast("The paper is already in the tank");
          st.spots++; if(!dry) st.wet = 1; ctx.step("spot"); draw(); } }]);
      ctx.buttons([{ label:"Stand in tank & run", primary:true, onClick(){
        if(!st.spots) return ctx.toast("Spot the extract first"); if(st.inTank) return;
        st.inTank = true; st.running = true; ctx.step("tank"); draw();
      } }, { label:"Remove & mark front", onClick(){
        if(!st.inTank || st.removed) return; if(st.front < 30) return ctx.toast("Let the solvent run further first");
        st.running = false; st.removed = true; ctx.step("front");
        if(pen === "pen") st.faults.add("ink from the pen line ran with the solvent");
        if(depth > 20) st.faults.add("origin below the solvent — pigments dissolved into the tank");
        if(st.spots < 4) st.faults.add("too few spots — bands too faint");
        if(st.wet) st.faults.add("spot not dried — bands wide and overlapping");
        if(!lid) st.faults.add("tank not sealed — uneven front, solvent evaporated");
        st.faults.forEach(f => seenFaults.add(f.split(" —")[0]));
        if(seenFaults.size >= 2) ctx.complete("faults");
        if(!st.faults.size && vis().length === 4) ctx.complete("good");
        draw();
      } }, { label:"New paper", onClick(){ if(st.removed || st.inTank) runNo++; fresh(); ctx.resetSteps(); rdF.clear(); rdB.clear(); ans.clear(); draw(); } }]);
      ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Once the paper is out, drag the ruler and line its 0 up with the origin line. Bands are numbered from the top.</p>`);
      const rdF = Kit.reading(ctx, "Distance moved by solvent front / mm", "e.g. 96", () => st.removed && !st.faults.has("solvent front ran off the top of the paper") ? st.front : null, 1, v => { meas.f = v; ctx.toast("Solvent front noted"); });
      const bandSel = ctx.select({ label:"Band (numbered from the top)", value:"0", options:[0,1,2,3].map(i => [String(i), "Band " + (i + 1)]), onChange(v){ sel = +v; rdB.clear(); ans.clear(); } });
      const curBand = () => { const b = vis()[sel]; return b ? b.i : null; };
      const rdB = Kit.reading(ctx, "Distance moved by the centre of this band / mm", "e.g. 60", () => st.removed && curBand() !== null ? st.rfs[curBand()]*st.front : null, 1.5, v => { meas["b" + sel] = v; ctx.toast("Band distance noted"); });
      const ans = Kit.answer(ctx, "Rf of this band", "e.g. 0.62", v => {
        if(!meas.f || meas["b" + sel] === undefined) return [false, "Measure the solvent front and this band first."];
        const rf = meas["b" + sel]/meas.f;
        if(Math.abs(v - rf) <= .02){ meas["rf" + sel] = v; ctx.complete("rf"); return [true, `Correct: ${meas["b" + sel]} ÷ ${meas.f} = ${rf.toFixed(2)}. Now identify it and record.`]; }
        return [false, "Rf = distance moved by the pigment ÷ distance moved by the solvent, both from the origin."];
      });
      const idSel = ctx.select({ label:"Pigment", value:"car", options:PIG.map(p => [p.k, p.name]) });
      ctx.buttons([{ label:"Record band", primary:true, block:true, onClick(){
        if(meas["rf" + sel] === undefined) return ctx.toast("Calculate this band’s Rf first");
        const i = curBand(), ok = PIG[i].k === idSel.get();
        ctx.record({ run:runNo + 1, band:"Band " + (sel + 1), d:meas["b" + sel], f:meas.f, rf:meas["rf" + sel], id:PIG.find(p => p.k === idSel.get()).name, ok: ok ? "✓" : "✗" });
        if(!ok) ctx.toast(`Check the colour and Rf: this band is ${PIG[i].colour}`);
        else st.recorded.add(i);
        ctx.step("meas");
        if(!st.faults.size && st.recorded.size === 4) ctx.complete("all4");
      } }]);
      draw();
    }
  });

  /* ───────────── HILL REACTION WITH DCPIP ───────────── */
  Lab.register({
    id:"hill", subject:"biology", level:["a"], topic:"Photosynthesis · Light-dependent reactions", interactive:true,
    title:"Hill reaction: chloroplasts & DCPIP",
    summary:"Isolate chloroplasts in ice-cold medium, add blue DCPIP and time how long it takes to decolourise with the lamp at different distances or behind red, blue and green filters. Run dark, no-chloroplast and boiled controls.",
    aim:"Use DCPIP and a suspension of isolated chloroplasts to investigate the effect of light intensity and light wavelength on the rate of the light-dependent reactions of photosynthesis.",
    variables:{ iv:"Light intensity (lamp distance d → 1/d²) or wavelength (coloured filter)", dv:"Time for DCPIP to decolourise (s) → rate = 1/t (s⁻¹)", cv:["Same volume of chloroplast suspension and DCPIP","Temperature: heat shield between lamp and tube; suspension kept on ice","Same lamp, room darkened","Same end-point (match the end-point tube)"] },
    stageTitle:"Lamp, heat shield & tubes", controlsTitle:"Set up & time",
    thumb:`<svg viewBox="0 0 300 140"><circle cx="50" cy="60" r="22" fill="#FFE07A" stroke="#B8962E"/><rect x="110" y="36" width="20" height="56" fill="#8EC5F5" opacity=".6" stroke="#7C8BA0"/><rect x="180" y="20" width="28" height="100" rx="12" fill="#2B7E88" stroke="#7C8BA0" stroke-width="2"/><rect x="230" y="20" width="28" height="100" rx="12" fill="#5D9B3A" stroke="#7C8BA0" stroke-width="2"/></svg>`,
    challenges:[
      { id:"dist",  title:"Light intensity", text:"Time live chloroplasts (no filter) at five lamp distances." },
      { id:"colour",title:"Wavelength", text:"Time red, blue and green filters at the same distance." },
      { id:"ctrl",  title:"Controls", text:"Run the dark, no-chloroplast and boiled-chloroplast controls." },
      { id:"cold",  title:"Ice-cold medium", text:"Compare chloroplasts isolated in warm medium with ice-cold at the same distance." }
    ],
    columns:[{key:"tube",label:"Tube"},{key:"prep",label:"Isolation medium"},{key:"filter",label:"Filter"},{key:"d",label:"Lamp distance / cm",dp:0},{key:"I",label:"Light intensity 1/d² × 10⁴ / cm⁻²",dp:1},{key:"t",label:"Time to decolourise / s",dp:1},{key:"rate",label:"Rate = 1/t / s⁻¹",dp:4}],
    series:"filter",
    graph:{ x:["I","d"], y:["rate","t"], fit:"curve" },
    questions:[
      { q:"Explain why DCPIP turns from blue to colourless in illuminated chloroplasts.",
        a:"Light is absorbed by chlorophyll in photosystems; excited electrons from photolysis of water are passed along the electron transport chain. DCPIP acts as an artificial electron (hydrogen) acceptor in place of NADP, and when reduced it becomes colourless. This is the Hill reaction." },
      { q:"Why is the chloroplast suspension prepared in ice-cold isolation medium of the same water potential as the cells?",
        a:"Cold slows enzymes released from broken cells (e.g. proteases) that would damage chloroplasts, and reduces their activity. A medium with the same water potential (and buffered pH) stops the chloroplasts gaining or losing water by osmosis and bursting or shrinking." },
      { q:"State the purpose of each control: tube wrapped in foil, no chloroplasts, boiled chloroplasts.",
        a:"Foil: shows that light is needed. No chloroplasts: shows light alone does not reduce DCPIP. Boiled chloroplasts: shows that functioning (non-denatured) proteins/photosystems are needed. All three should stay blue." },
      { q:"Why does green light give a much slower rate than red or blue?",
        a:"Chlorophylls absorb mainly red and blue light and reflect or transmit green, so little green light energy is absorbed to excite electrons, and less DCPIP is reduced per second." },
      { q:"Why is light intensity taken as proportional to 1/d², and what limits this method?",
        a:"Light spreads out from a point source over a sphere of area 4πd², so intensity ∝ 1/d² (inverse square law). Limits: the lamp is not a point source, background light in the room, and the lamp heats the tube — darken the room, use a heat shield (water tank) or LED, and measure intensity with a light meter." },
      { q:"Assess the risks of this investigation.",
        a:"Low. DCPIP is harmful if swallowed and stains — gloves and eye protection. The lamp gets hot and is near water: keep cables dry, do not touch the bulb. Blenders have sharp blades — keep the lid on and unplug before removing. Take care with glassware on ice." }
    ],
    setup(ctx){
      const SPEED = 15, TX = 790, PXCM = 10;
      const FILT = { none:{ name:"none (white)", k:1, col:"#FFF1A8" }, red:{ name:"red", k:.72, col:"#F05A4A" }, blue:{ name:"blue", k:.78, col:"#4A7BF0" }, green:{ name:"green", k:.12, col:"#4FBF5A" } };
      const TUBE = { live:"Chloroplasts + DCPIP", dark:"Foil-wrapped (dark)", none:"No chloroplasts", boiled:"Boiled chloroplasts" };
      let d = 20, filter = "none", tube = "live", prep = "ice", rx = null;
      const sw = Kit.stopwatch("hl-sw", 40, 340);
      ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="hl-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 450)}
        <g id="hl-scene"></g>${sw.svg}<text x="24" y="34" class="k-status" id="hl-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#hl-svg"), $ = s => svg.querySelector(s);
      sw.bind(svg);
      function tEnd(){
        if(tube !== "live") return Infinity;
        const I = 10000/(d*d)*FILT[filter].k, rate = (prep === "ice" ? 1 : .42)*I/(I + 25);
        return Math.min(Infinity, 60/rate);
      }
      const BLUE = "#1E4FA0", GREEN = "#5D9B3A";
      function draw(){
        const lx = TX - d*PXCM;
        let s = `<rect x="220" y="418" width="${TX + 20 - 220}" height="30" fill="#F2E6C2" stroke="#B8962E"/>`;
        for(let cm = 0; cm <= 55; cm++){ const x = TX - cm*PXCM; if(x < 222) break; s += `<line x1="${x}" y1="418" x2="${x}" y2="${cm % 5 ? 424 : 430}" stroke="#4B3621" stroke-width=".8"/>`; if(cm % 10 === 0) s += `<text x="${x}" y="443" text-anchor="middle" class="k-num" style="fill:#4B3621">${cm}</text>`; }
        s += `<text x="${TX + 26}" y="438" class="k-lbl">cm</text>`;
        // light beam
        s += `<path d="M${lx + 20} 230L${TX - 24} 190V330L${lx + 20} 270z" fill="${FILT[filter].col}" opacity=".18"/>`;
        // lamp (draggable)
        s += `<g id="hl-lamp" class="k-drag"><rect x="${lx - 34}" y="226" width="22" height="48" rx="4" fill="#475569"/><circle cx="${lx}" cy="250" r="20" fill="url(#k-glow)"/><circle cx="${lx}" cy="250" r="11" fill="#FFF4B8" stroke="#B8962E"/><path d="M${lx} 262V418" stroke="#475569" stroke-width="5"/><text x="${lx}" y="210" text-anchor="middle" class="k-hint">drag lamp</text></g>`;
        // heat shield and filter (fixed just before the tube)
        s += `<rect x="${TX - 80}" y="196" width="22" height="120" rx="3" fill="url(#k-water)" stroke="var(--txt2)"/><text x="${TX - 69}" y="186" text-anchor="middle" class="k-lbl">heat shield</text>`;
        if(filter !== "none") s += `<rect x="${TX - 50}" y="200" width="6" height="110" fill="${FILT[filter].col}" opacity=".8"/>`;
        // tubes
        let blue = 1;
        if(rx){ blue = isFinite(rx.tEnd) ? Math.pow(Math.max(0, 1 - rx.t/rx.tEnd), .8) : 1 - Math.min(.05, rx.t/20000); }
        const base = tube === "none" ? "#DCE8F2" : tube === "boiled" ? "#8C9A5A" : GREEN, dyed = tube === "none" ? "#3567C4" : tube === "boiled" ? "#3D5F86" : BLUE;
        const fill = rx ? mix(base, dyed, blue) : base;
        const tb = (x, f, foil, lbl) => `<path d="M${x - 20} 150V320a20 20 0 0 0 40 0V150" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><path d="M${x - 18} 200V320a18 18 0 0 0 36 0V200z" fill="${f}"/>${foil ? `<path d="M${x - 22} 150V320a22 22 0 0 0 44 0V150z" fill="url(#k-metal)" opacity=".95"/>` : ""}<text x="${x}" y="138" text-anchor="middle" class="k-tag">${lbl}</text>`;
        s += tb(TX, fill, tube === "dark", "test tube") + tb(TX + 100, GREEN, false, "end point");
        s += `<text x="${TX + 100}" y="392" text-anchor="middle" class="k-lbl">chloroplasts + water</text><text x="${TX}" y="372" text-anchor="middle" class="k-lbl">${TUBE[tube]}</text>`;
        // ice bath with suspension
        s += `<rect x="600" y="70" width="110" height="60" rx="8" fill="#E6F2FB" stroke="var(--txt2)"/>${[...Array(7)].map((_, i) => `<rect x="${608 + i*14}" y="${92 + (i % 2)*10}" width="10" height="10" rx="2" fill="#fff" stroke="#9CC3E6"/>`).join("")}<rect x="640" y="56" width="26" height="60" rx="6" fill="${prep === "ice" ? GREEN : "#7FA25C"}" stroke="var(--txt2)"/><text x="655" y="50" text-anchor="middle" class="k-lbl">${prep === "ice" ? "suspension on ice" : "suspension (warm medium)"}</text>`;
        $("#hl-scene").innerHTML = s;
        $("#hl-status").textContent = !rx ? "Set the lamp, add DCPIP and start the stopwatch" : rx.t > 20 && isFinite(rx.tEnd) ? "Compare with the end-point tube" : "Timing…";
        ctx.readout([["Tube", TUBE[tube]], ["Lamp", d + " cm"], ["Filter", FILT[filter].name], ["Tube time", rx ? mmss(rx.t) : "—"]]);
      }
      Kit.dragger(ctx, svg, {
        hit(tg, p){ return tg.closest("#hl-lamp") ? { d, p0:p } : null; },
        move(h, p){ if(rx) return; d = Kit.clamp(Math.round(h.d - (p.x - h.p0.x)/PXCM), 12, 55); draw(); },
        end(h){ if(rx && h) ctx.toast("Don’t move the lamp during a run"); }
      });
      ctx.frame(dt => { sw.tick(dt*SPEED); if(rx) rx.t += dt*SPEED; draw(); });
      const busy = () => { if(rx){ ctx.toast("Record or discard this tube first"); return true; } return false; };
      const tSel = ctx.select({ label:"Tube", value:"live", options:Object.entries(TUBE), onChange(v){ if(busy()) return tSel.set(tube); tube = v; draw(); } });
      const pSeg = ctx.seg({ label:"Isolation medium", value:"ice", options:[["ice","Ice-cold"],["warm","Room temperature"]], onChange(v){ if(busy()) return pSeg.set(prep); prep = v; draw(); } });
      const fSeg = ctx.seg({ label:"Filter", value:"none", options:[["none","None"],["red","Red"],["blue","Blue"],["green","Green"]], onChange(v){ if(busy()) return fSeg.set(filter); filter = v; draw(); } });
      ctx.buttons([{ label:"Add DCPIP & mix", primary:true, onClick(){
        if(rx) return ctx.toast("This tube already has DCPIP");
        const te = tEnd()*(1 + .05*ctx.gauss());
        rx = { t:0, tEnd: te > 1500 ? Infinity : te }; sw.reset(); ctx.toast("Start the stopwatch!");
      } }, { label:"Record time", onClick(){
        const j = judge(ctx, sw, rx, 600); if(!j) return;
        ctx.record({ tube:TUBE[tube], prep: prep === "ice" ? "ice-cold" : "room temp.", filter:FILT[filter].name, d, I:Kit.round(10000/(d*d), 1), t:j.t, rate: j.t ? Kit.round(1/j.t, 5) : 0 });
        rx = null; sw.reset();
        const rows = ctx.rows(), live = rows.filter(r => r.tube === TUBE.live && r.t && r.prep === "ice-cold");
        if(new Set(live.filter(r => r.filter === FILT.none.name).map(r => r.d)).size >= 5) ctx.complete("dist");
        if([...new Set(live.map(r => r.d))].some(dd => ["red","blue","green"].every(f => live.some(r => r.d === dd && r.filter === FILT[f].name)))) ctx.complete("colour");
        if(["dark","none","boiled"].every(k => rows.some(r => r.tube === TUBE[k]))) ctx.complete("ctrl");
        const warm = rows.filter(r => r.tube === TUBE.live && r.t && r.prep === "room temp.");
        if(warm.some(w => live.some(r => r.d === w.d && r.filter === w.filter))) ctx.complete("cold");
      } }, { label:"Discard tube", onClick(){ rx = null; sw.reset(); } }]);
      ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Drag the lamp along the rule (12–55 cm). Time runs ×${SPEED}; controls need 10 min with no change.</p>`);
      draw();
    }
  });
})();
