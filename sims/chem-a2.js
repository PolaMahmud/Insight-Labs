"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMISTRY · A LEVEL (9701) — part 2
   Reaction kinetics: initial rates (iodination of propanone, colorimeter),
   half-life (bromine + methanoic acid), activation energy (iodine clock) ·
   Equilibria: pH curves and Ka, buffers, Kc (ester hydrolysis),
   partition coefficient (ammonia), Ksp of Ca(OH)₂ ·
   Paper 5 planning and evaluation built into both benches
══════════════════════════════════════════════════════════════════ */
(function(){
  const RG = 8.314;

  /* Paper 5 planning card: one drop-down per planning point */
  function quiz(ctx, items, onDone, parent){
    const wrap = ctx.html(`<div class="ctl"><div class="hint" style="margin-top:0">Choose the best answer for each planning point. All correct completes the challenge.</div></div>`, parent);
    const ok = new Set();
    items.forEach((it, i) => {
      const d = ctx.el(`<div style="margin-top:12px"><div class="qz-q" style="font-size:.8rem;font-weight:600;margin-bottom:5px">${i + 1}. ${ctx.esc(it.q)}</div>
        <select class="inp"><option value="">— choose —</option>${it.o.map((o, j) => `<option value="${j}">${ctx.esc(o)}</option>`).join("")}</select><div class="qz-fb" style="margin-top:6px"></div></div>`);
      wrap.appendChild(d);
      const s = d.querySelector("select"), fb = d.querySelector(".qz-fb");
      s.addEventListener("change", () => {
        if(s.value === ""){ fb.innerHTML = ""; ok.delete(i); return; }
        const good = +s.value === it.a; if(good) ok.add(i); else ok.delete(i);
        fb.innerHTML = `<div class="note ${good ? "ok" : "bad"}">${good ? ctx.esc(it.why) : "Not the best choice — think about it again."}</div>`;
        if(ok.size === items.length) onDone();
      });
    });
    return wrap;
  }
  /* a collapsible group in the controls */
  const group = (ctx, title, open) => {
    const d = ctx.html(`<details class="ctl"${open ? " open" : ""}><summary style="cursor:pointer;font-weight:600;font-size:.84rem">${ctx.esc(title)}</summary><div></div></details>`);
    return d.querySelector("div");
  };
  /* parts of a multi-part bench: a container per part, shown one at a time */
  function partBoxes(ctx, keys){
    const o = {}; keys.forEach(k => o[k] = ctx.html(`<div></div>`));
    o.show = k => keys.forEach(x => o[x].style.display = x === k ? "" : "none");
    return o;
  }

/* ───────────────────────── A-KINETICS ───────────────────────── */
  const KP = { P:{ name:"propanone", stock:2.00, short:"[propanone]", order:1, sp:"CH₃COCH₃" },
               I:{ name:"iodine (in KI)", stock:.0100, short:"[I₂]", order:0, sp:"I₂" },
               H:{ name:"HCl (H⁺ catalyst)", stock:1.00, short:"[H⁺]", order:1, sp:"H⁺" } };
  const SET = { P:"Vary [propanone]", I:"Vary [I₂]", H:"Vary [H⁺]" };
  const EPS_I = 250, EPS_BR = 180;          // A = ε[X] for a 1.00 cm cell (blue filter)

  Lab.register({
    id:"a-kinetics", subject:"chemistry", level:["a"], topic:"Reaction kinetics · Rate equations and Ea", interactive:true,
    title:"Orders, rate equations and activation energy",
    summary:"Follow the acid-catalysed iodination of propanone with a colorimeter to find orders by the initial-rates method, measure constant half-lives for bromine and methanoic acid, then time an iodine clock at several temperatures to find Ea from ln(1/t) against 1/T.",
    aim:"Deduce the rate equation and rate constant for the iodination of propanone by the initial-rates method, show that a first-order reaction has a constant half-life, and determine an activation energy from the effect of temperature on rate.",
    variables:{ iv:"Initial concentration of propanone, I₂ or H⁺ (total volume fixed at 50.0 cm³) · temperature of the water bath", dv:"Initial rate from the gradient of absorbance against time · time for the clock reaction, t", cv:["Total volume 50.0 cm³ (water added)","Concentrations of the other reagents","Temperature (thermostatted water bath)","Same colorimeter, filter and cell"] },
    stageTitle:"Colorimeter, data logger and water bath", controlsTitle:"Experiment",
    thumb:`<svg viewBox="0 0 300 140"><rect x="20" y="20" width="120" height="100" rx="8" fill="#1F2937"/><rect x="62" y="34" width="34" height="56" rx="3" fill="#C98A2E" opacity=".75"/><rect x="34" y="96" width="90" height="16" rx="3" fill="#132A1F"/><rect x="160" y="18" width="124" height="104" rx="6" fill="#F4F7FB" stroke="#A2ACBD"/><path d="M172 34 L272 92" stroke="#E0334A" stroke-width="3"/><path d="M172 34 Q200 90 272 104" stroke="#4A7DFF" stroke-width="3" fill="none"/></svg>`,
    challenges:[
      { id:"plan",   title:"Plan it (Paper 5)", text:"Answer every planning point correctly: variables, control, quenching, prediction, hazards and units." },
      { id:"orders", title:"Orders by initial rates", text:"Measure initial rates at three or more concentrations of each reagent and deduce the order with respect to propanone, iodine and H⁺." },
      { id:"k",      title:"Rate equation and k", text:"Write the rate equation and calculate k from your initial rates." },
      { id:"half",   title:"Constant half-life", text:"Read two successive half-lives from a bromine trace and use t½ to find k." },
      { id:"ea",     title:"Activation energy", text:"Time the iodine clock at four or more temperatures and find Ea from the gradient of ln(1/t) against 1/T." },
      { id:"anom",   title:"Spot the anomaly", text:"Mix one run without letting the tubes reach the bath temperature, then find that anomalous point on your graph." }
    ],
    columns:[{key:"set",label:"Experiment"},{key:"c",label:"Varied conc. / mol dm⁻³",dp:4},{key:"rate",label:"Initial rate / 10⁻⁶ mol dm⁻³ s⁻¹",dp:2},
      {key:"t",label:"t / s",dp:1},{key:"A",label:"Absorbance",dp:3},{key:"T",label:"T / °C",dp:1},{key:"invT",label:"10³/T / K⁻¹",dp:4},{key:"lnr",label:"ln(1/t)",dp:3}],
    series:"set",
    graph:{ x:["c","t","invT"], y:["rate","A","lnr"], fit:"linear" },
    questions:[
      { q:"The iodination of propanone is zero order with respect to iodine. What does this tell you about the mechanism?",
        a:"Iodine is not involved in the rate-determining step. The slow step involves propanone and H⁺ (acid-catalysed formation of the enol, CH₂=C(OH)CH₃); iodine reacts with the enol in a later, fast step. Rate = k[CH₃COCH₃][H⁺], overall second order." },
      { q:"Why is the initial rate used, and how is it found from the absorbance–time graph?",
        a:"Only at t = 0 are all the concentrations known exactly. Draw a tangent at t = 0 (here the line is straight because the reaction is zero order in I₂) and find its gradient ΔA/Δt. Divide by the calibration constant (A = 250[I₂]) to convert to mol dm⁻³ s⁻¹." },
      { q:"How do the units of k follow from rate = k[CH₃COCH₃][H⁺]?",
        a:"k = rate ÷ ([CH₃COCH₃][H⁺]) = mol dm⁻³ s⁻¹ ÷ (mol dm⁻³)² = dm³ mol⁻¹ s⁻¹." },
      { q:"How do half-lives show the order of a reaction?",
        a:"First order: successive half-lives are constant and independent of the starting concentration (t½ = 0.693/k). Zero order: each half-life is shorter than the last. Second order: each half-life is longer than the last (it doubles)." },
      { q:"In the iodine clock, why can 1/t be used in place of k when plotting the Arrhenius graph?",
        a:"Every run uses the same starting concentrations and the colour appears when the same amount of iodine has been made, so rate ∝ 1/t and rate ∝ k. ln k = ln A − Ea/RT, so ln(1/t) against 1/T is a straight line of gradient −Ea/R." },
      { q:"Plan: how could you follow the iodination by titration instead of a colorimeter?",
        a:"Mix the reagents in a thermostatted flask and start a clock. At timed intervals pipette 10.0 cm³ portions into excess NaHCO₃(aq), which neutralises the H⁺ catalyst and quenches the reaction. Titrate the remaining iodine with standard sodium thiosulfate using starch near the end point. Plot [I₂] against time." },
      { q:"State the hazards in these experiments and the precautions.",
        a:"Propanone is highly flammable: no naked flames. Iodine and bromine water are harmful; bromine vapour is toxic — use a fume hood and gloves. Hydrochloric acid is an irritant: eye protection. Potassium peroxodisulfate is an oxidiser and a sensitiser: avoid skin contact." },
      { q:"Evaluate the activation-energy experiment: give sources of error and improvements.",
        a:"Hot mixtures cool while reacting; short times at high temperature have a large percentage error from reaction time; tubes not at the bath temperature give anomalous points. Pre-warm both tubes in a thermostatted bath, record the temperature at the start and end and use the mean, use more dilute solutions so times are longer, or use a colorimeter, and repeat each temperature." }
    ],
    setup(ctx){
      /* hidden values */
      const k25 = 2.8e-5*(.88 + .24*Math.random());          // dm³ mol⁻¹ s⁻¹ at lab temperature
      const kBr = .006 + .005*Math.random();                   // s⁻¹ (pseudo-first-order in Br₂)
      const Ea = Math.round(46 + Math.random()*12)*1000, t20 = 60*(.9 + .2*Math.random());
      let part = "init", vary = "P", Vv = 10, brV = 25, run = null, speed = 1, runN = 0;
      const vols = () => ({ P:vary === "P" ? Vv : 10, I:vary === "I" ? Vv : 10, H:vary === "H" ? Vv : 10 });
      const concs = v => ({ P:KP.P.stock*v.P/50, I:KP.I.stock*v.I/50, H:KP.H.stock*v.H/50 });
      /* water bath / clock */
      const E = { set:20, bath:20.3, pre:false, running:false, ended:false, t:0, tc:0, Tmix:20, Tread:null };
      const sw = Kit.stopwatch("akn-sw", 650, 352);

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="akn-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 460)}<g id="akn-scene"></g><g id="akn-cross" pointer-events="none"></g><g id="akn-swg">${sw.svg}</g><text x="24" y="30" class="k-status" id="akn-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#akn-svg"), $ = s => svg.querySelector(s);
      sw.bind(svg);
      const LG = { x:478, y:46, w:462, h:400 };
      const plotBox = () => ({ X0:LG.x + 56, X1:LG.x + LG.w - 16, Y0:LG.y + 34, Y1:LG.y + LG.h - 44 });
      const tMax = () => part === "half" ? 600 : 300;

      function loggerSvg(){
        const P = plotBox(), tm = tMax(), tMin = part === "half" ? 20 : 10, tMaj = part === "half" ? 100 : 50;
        const px = t => P.X0 + t/tm*(P.X1 - P.X0), py = A => P.Y1 - A*(P.Y1 - P.Y0);
        let s = `<g><rect x="${LG.x}" y="${LG.y}" width="${LG.w}" height="${LG.h}" rx="12" fill="#1F2937" stroke="#4B5563"/>
          <text x="${LG.x + 14}" y="${LG.y + 22}" style="font:600 12px Inter;fill:#E5E7EB">Data logger · absorbance against time</text>
          <rect x="${P.X0}" y="${P.Y0}" width="${P.X1 - P.X0}" height="${P.Y1 - P.Y0}" fill="#FBFCFE"/>`;
        for(let t = 0; t <= tm + 1e-9; t += tMin){ const maj = Math.abs(t/tMaj - Math.round(t/tMaj)) < 1e-9;
          s += `<line x1="${px(t)}" y1="${P.Y0}" x2="${px(t)}" y2="${P.Y1}" stroke="${maj ? "#9DB2CF" : "#DCE6F2"}" stroke-width="${maj ? 1 : .7}"/>`;
          if(maj) s += `<text x="${px(t)}" y="${P.Y1 + 15}" text-anchor="middle" style="font:500 10px 'JetBrains Mono';fill:#CBD5E1">${t}</text>`; }
        for(let i = 0; i <= 50; i++){ const A = i/50, maj = i % 5 === 0;
          s += `<line x1="${P.X0}" y1="${py(A)}" x2="${P.X1}" y2="${py(A)}" stroke="${maj ? "#9DB2CF" : "#DCE6F2"}" stroke-width="${maj ? 1 : .7}"/>`;
          if(maj) s += `<text x="${P.X0 - 6}" y="${py(A) + 3.5}" text-anchor="end" style="font:500 10px 'JetBrains Mono';fill:#CBD5E1">${A.toFixed(1)}</text>`; }
        s += `<text x="${(P.X0 + P.X1)/2}" y="${P.Y1 + 34}" text-anchor="middle" style="font:500 11px Inter;fill:#CBD5E1">time / s</text>
          <text transform="translate(${LG.x + 16} ${(P.Y0 + P.Y1)/2}) rotate(-90)" text-anchor="middle" style="font:500 11px Inter;fill:#CBD5E1">absorbance</text>`;
        if(run && run.kind === part && run.pts.length > 1)
          s += `<polyline points="${run.pts.map(([t, A]) => px(t).toFixed(1) + "," + py(Math.max(0, Math.min(1, A))).toFixed(1)).join(" ")}" fill="none" stroke="${part === "half" ? "#D9480F" : "#7048E8"}" stroke-width="2"/>`;
        return s + `</g>`;
      }
      function colorimeter(A, col){
        const a = Math.max(0, Math.min(.9, A*.75));
        return `<g transform="translate(40 262)"><rect width="400" height="180" rx="14" fill="#2B3240" stroke="#4B5563"/>
          <rect x="34" y="-40" width="46" height="96" rx="4" fill="url(#k-glass)" stroke="#CBD5E1" stroke-width="1.4"/>
          <rect x="36" y="-12" width="42" height="66" fill="rgba(${col},${a.toFixed(3)})"/>
          <rect x="22" y="40" width="70" height="26" rx="4" fill="#111827"/>
          <rect x="124" y="28" width="250" height="56" rx="8" fill="#132A1F"/><text x="360" y="68" text-anchor="end" class="k-lcd" style="font-size:26px">${A === null ? "—.———" : Math.max(0, A).toFixed(3)}</text>
          <text x="136" y="46" style="font:600 9px Inter;fill:#5FBF8A">ABSORBANCE</text>
          <text x="22" y="104" style="font:600 11px Inter;fill:#CBD5E1">blue filter (470 nm) · 1.00 cm cell · zeroed with water</text>
          <text x="22" y="128" style="font:500 11px Inter;fill:#94A3B8">${part === "half" ? "A is proportional to [Br₂]" : "calibration: A = 250 × [I₂] / mol dm⁻³"}</text>
          <text x="22" y="152" style="font:500 11px Inter;fill:#94A3B8">${run && run.kind === part ? (run.done ? "run finished" : "logging…  t = " + Math.floor(run.t) + " s") : "no run yet"}</text></g>`;
      }
      function infoCard(lines, title){
        return `<g transform="translate(40 50)"><rect width="410" height="${42 + lines.length*20}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="14" y="24" class="k-tag">${title}</text>${lines.map((l, i) => `<text x="14" y="${48 + i*20}" class="k-lbl">${l}</text>`).join("")}</g>`;
      }
      function bathScene(){
        const T = E.bath, done = (E.running || E.ended) && E.t >= E.tc, blue = done ? Math.min(1, (E.t - E.tc)/.5) : 0;
        const colA = `rgba(${Math.round(225 - 205*blue)},${Math.round(232 - 207*blue)},${Math.round(240 - 165*blue)},${(.18 + .8*blue).toFixed(2)})`;
        let s = `<path d="M40 250 h380 v190 q0 12 -12 12 h-356 q-12 0 -12 -12z" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
          <rect x="42" y="282" width="376" height="168" fill="rgba(110,170,235,.35)"/>
          <text x="48" y="472" class="k-lbl">thermostatted water bath · set to ${E.set} °C</text>`;
        const tubeAt = (x, lbl, col) => `<path d="M${x} 196 V410 a15 15 0 0 0 30 0 V196" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/>
          <path d="M${x + 1.5} 300 V410 a13.5 13.5 0 0 0 27 0 V300z" fill="${col}"/><text x="${x + 15}" y="190" text-anchor="middle" class="k-tag">${lbl}</text>`;
        s += tubeAt(90, E.running || E.ended ? "A + B" : "A", E.running || E.ended ? colA : "rgba(225,232,240,.25)");
        if(!(E.running || E.ended)) s += tubeAt(150, "B", "rgba(225,232,240,.25)");
        s += th.svg;
        s += `<g transform="translate(470 46)"><rect width="460" height="168" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="14" y="24" class="k-tag">Iodine clock: S₂O₈²⁻ + 2I⁻ → 2SO₄²⁻ + I₂</text>
          <text x="14" y="48" class="k-lbl">A: 10.0 cm³ KI (0.500) + 5.0 cm³ Na₂S₂O₃ (0.0100) + 1 cm³ starch</text>
          <text x="14" y="68" class="k-lbl">B: 10.0 cm³ K₂S₂O₈ (0.0400 mol dm⁻³)</text>
          <text x="14" y="92" class="k-lbl">Start the stop-clock as B is poured into A; stop it at blue-black.</text>
          <text x="14" y="114" class="k-lbl">tubes: ${E.pre ? "at the bath temperature ✓" : "NOT yet left in the bath to equilibrate"}</text>
          <text x="14" y="136" class="k-lbl">thermometer reading entered: ${E.Tread === null ? "—" : E.Tread.toFixed(1) + " °C"}</text>
          <text x="14" y="156" class="k-lbl">same concentrations every run, so rate ∝ 1/t ∝ k</text></g>`;
        s += ChemKit.lens({ id:"akn-tl", cx:560, cy:296, r:72, S:22, value:T, minor:1, major:1, down:false, tube:6, flat:true, liquid:"#E0334A", label:"magnifier on the thermometer" });
        s += `<line x1="${336}" y1="${thY(T)}" x2="488" y2="296" stroke="var(--accent)" stroke-dasharray="3 3"/>`;
        return s;
      }
      const th = Kit.thermometer("akn-th", 330, 110, 300, 0, 70, 10, true);
      const thY = T => 110 + 300 - T/70*300;

      function curA(){
        if(!run || run.kind !== part) return null;
        return run.pts.length ? run.pts[run.pts.length - 1][1] : run.A0;
      }
      function draw(){
        let s = "";
        if(part === "ea"){ s = bathScene(); }
        else{
          const v = vols(), c = concs(v), w = 50 - v.P - v.I - v.H;
          s += part === "init" ? infoCard([
              `propanone, 2.00 mol dm⁻³: ${v.P.toFixed(1)} cm³ → ${c.P.toFixed(3)} mol dm⁻³`,
              `iodine in KI, 0.0100 mol dm⁻³: ${v.I.toFixed(1)} cm³ → ${c.I.toFixed(4)} mol dm⁻³`,
              `HCl, 1.00 mol dm⁻³: ${v.H.toFixed(1)} cm³ → ${c.H.toFixed(3)} mol dm⁻³`,
              `distilled water: ${w.toFixed(1)} cm³  (total 50.0 cm³)`,
              `CH₃COCH₃ + I₂ → CH₃COCH₂I + HI   (H⁺ catalyst)`,
              `rate = −Δ[I₂]/Δt = −(ΔA/Δt) ÷ 250`], "Initial-rates mixture · " + SET[vary])
            : infoCard([
              `bromine water, 0.0100 mol dm⁻³: ${brV.toFixed(1)} cm³`,
              `distilled water: ${(25 - brV).toFixed(1)} cm³`,
              `methanoic acid, 1.00 mol dm⁻³: 25.0 cm³ (large excess)`,
              `Br₂ + HCOOH → 2Br⁻ + 2H⁺ + CO₂`,
              `[HCOOH] stays almost constant during the run.`,
              `Read t½ from the trace: A₀ → A₀/2 → A₀/4.`], "Continuous monitoring · bromine and methanoic acid");
          s += colorimeter(curA(), part === "half" ? "205,110,25" : "150,85,20");
          s += loggerSvg();
        }
        $("#akn-scene").innerHTML = s;
        if(part === "ea") th.set(svg, E.bath);
        $("#akn-swg").style.display = part === "ea" ? "" : "none";
        $("#akn-status").textContent = part === "ea"
          ? (!E.pre && !E.running && !E.ended ? "Stand tubes A and B in the bath until they reach its temperature" : E.running && E.t < E.tc ? "Watching for the blue-black colour…" : E.running || E.ended ? "Blue-black! Stop your stop-clock and record" : "Read the thermometer, then pour B into A")
          : !run || run.kind !== part ? "Choose the mixture, then mix and start logging" : run.done ? "Run finished — read the gradient or the half-lives from the trace" : "Logging absorbance…";
        if(part === "ea") ctx.readout([["Bath setting", E.set + " °C"], ["Tubes", E.pre ? "equilibrated" : "not equilibrated", E.pre ? "" : "warn"], ["Hidden Ea", "find it!"]]);
        else ctx.readout([["Part", part === "init" ? "Initial rates" : "Half-life"], ["Absorbance", curA() === null ? "—" : Math.max(0, curA()).toFixed(3)], ["Logger time", run && run.kind === part ? Math.floor(run.t) + " s" : "—"]]);
      }
      /* hover crosshair on the logger screen */
      svg.addEventListener("pointermove", e => {
        const g = $("#akn-cross"); if(part === "ea"){ g.innerHTML = ""; return; }
        const p = ctx.svgPoint(svg, e), P = plotBox();
        if(p.x < P.X0 || p.x > P.X1 || p.y < P.Y0 || p.y > P.Y1){ g.innerHTML = ""; return; }
        const t = (p.x - P.X0)/(P.X1 - P.X0)*tMax(), A = (P.Y1 - p.y)/(P.Y1 - P.Y0);
        g.innerHTML = `<line x1="${p.x}" y1="${P.Y0}" x2="${p.x}" y2="${P.Y1}" stroke="#E0334A" stroke-dasharray="3 3"/><line x1="${P.X0}" y1="${p.y}" x2="${P.X1}" y2="${p.y}" stroke="#E0334A" stroke-dasharray="3 3"/>
          <rect x="${P.X1 - 150}" y="${P.Y0 + 6}" width="144" height="22" rx="5" fill="#1F2937" opacity=".9"/><text x="${P.X1 - 78}" y="${P.Y0 + 21}" text-anchor="middle" style="font:600 11px 'JetBrains Mono';fill:#FDE68A">t ${t.toFixed(0)} s · A ${A.toFixed(3)}</text>`;
      });
      svg.addEventListener("pointerleave", () => { $("#akn-cross").innerHTML = ""; });

      function trueA(r, t){
        if(r.kind === "init") return Math.max(0, r.A0 - EPS_I*r.rate*t);
        return r.A0*Math.exp(-kBr*t);
      }
      ctx.frame(dt => {
        sw.tick(dt);
        if(run && !run.done){
          const sp = run.kind === "half" ? 15 : 20;
          const t1 = Math.min(run.kind === "half" ? 600 : 300, run.t + dt*sp*speed);
          while(run.next <= t1){ run.pts.push([run.next, trueA(run, run.next) + .0025*ctx.gauss()]); run.next += 2; }
          run.t = t1; if(t1 >= (run.kind === "half" ? 600 : 300)) run.done = true;
          if(part === run.kind) draw();
        }
        if(E.running){ E.t += dt; if(E.t > E.tc + 3){ E.running = false; E.ended = true; } if(part === "ea") draw(); }
      });

      /* ── controls ── */
      ctx.seg({ label:"Part", value:part, options:[["init","(a) Initial rates"],["half","(b) Half-life"],["ea","(c) Activation energy"]], onChange(v){ part = v; P.show(v); $("#akn-cross").innerHTML = ""; draw(); } });
      const P = partBoxes(ctx, ["init", "half", "ea"]);

      /* (a) initial rates */
      ctx.seg({ label:"Reagent to vary (the other two stay at 10.0 cm³)", value:vary, parent:P.init, options:[["P","Propanone"],["I","Iodine"],["H","HCl"]], onChange(v){ vary = v; draw(); } });
      ctx.seg({ label:"Volume of the varied reagent / cm³ (water makes 50.0 cm³)", value:Vv, parent:P.init, options:[[4,"4.0"],[8,"8.0"],[10,"10.0"],[12,"12.0"],[16,"16.0"],[20,"20.0"]], onChange(v){ Vv = v; draw(); } });
      ctx.seg({ label:"Logger speed", value:1, parent:P.init, options:[[1,"Normal (×20)"],[3,"Fast (×60)"]], onChange(v){ speed = v; } });
      const start = kind => {
        if(run && !run.done) return ctx.toast("A run is still logging");
        runN++;
        if(kind === "init"){
          const v = vols(), c = concs(v), rate = k25*Math.pow(c.P, 1)*Math.pow(c.H, 1)*(1 + .015*ctx.gauss());
          run = { kind, t:0, next:0, pts:[], A0:EPS_I*c.I, rate, set:SET[vary], cv:c[vary], c, n:runN, recorded:false, done:false };
        }else{ run = { kind, t:0, next:0, pts:[], A0:EPS_BR*.0100*brV/50, n:runN, done:false }; hOK = 0; tHalfStudent = []; }
        ansRate.clear(); h1.clear(); h2.clear(); draw();
      };
      ctx.buttons([{ label:"Mix, fill the cell and start logging", primary:true, block:true, onClick:() => start("init") }], P.init);
      const ansRate = Kit.answer(ctx, "Initial rate from your gradient / 10⁻⁶ mol dm⁻³ s⁻¹", "e.g. 2.25", v => {
        if(!run || run.kind !== "init" || run.t < 150) return [false, "Log at least 150 s of this run first."];
        const want = run.rate*1e6;
        if(Math.abs(v - want) <= .08*want){
          if(!run.recorded){ run.recorded = true; ctx.record({ set:run.set, c:Kit.round(run.cv, 4), rate:v, cP:run.c.P, cI:run.c.I, cH:run.c.H }); }
          return [true, `Correct: gradient ≈ −${(EPS_I*run.rate).toExponential(2)} s⁻¹ ÷ 250 = ${want.toFixed(2)} × 10⁻⁶ mol dm⁻³ s⁻¹. Recorded.`];
        }
        return [false, "Pick two points far apart on the straight trace (use the cross-hair). Gradient = ΔA ÷ Δt. Rate = |gradient| ÷ 250, then express it in units of 10⁻⁶ mol dm⁻³ s⁻¹."];
      }, P.init);
      const doneOrders = new Set();
      Kit.answer(ctx, "Order with respect to the reagent you are varying", "0, 1 or 2", v => {
        const rs = ctx.rows().filter(r => r.set === SET[vary] && typeof r.rate === "number");
        if(new Set(rs.map(r => r.c)).size < 3) return [false, `Record initial rates at three or more different ${KP[vary].short} first.`];
        const n = KP[vary].order;
        if(v === n){ doneOrders.add(vary); if(doneOrders.size === 3) ctx.complete("orders");
          return [true, n === 0 ? "Correct: the rate does not change when [I₂] changes — zero order. Your traces are parallel lines." : `Correct: doubling ${KP[vary].short} doubles the rate — first order (straight line through the origin).`
            + (doneOrders.size < 3 ? ` Now find the other order${3 - doneOrders.size > 1 ? "s" : ""}.` : " All three orders found.")]; }
        return [false, "Compare rates: if the concentration doubles and the rate is unchanged → 0; doubles → 1; quadruples → 2. Or plot rate against concentration."];
      }, P.init);
      Kit.answer(ctx, "Rate constant k from your data / dm³ mol⁻¹ s⁻¹", "e.g. 2.8e-5", v => {
        const rs = ctx.rows().filter(r => typeof r.rate === "number" && r.cP);
        if(rs.length < 3) return [false, "Record at least three initial rates first."];
        if(doneOrders.size < 3) return [false, "Find all three orders first so you know the rate equation."];
        const ks = rs.map(r => r.rate*1e-6/(r.cP*r.cH)), k = Kit.mean(ks);
        if(Math.abs(v - k) <= .08*k){ ctx.complete("k"); return [true, `Correct: rate = k[CH₃COCH₃][H⁺]; mean k = ${k.toExponential(2)} dm³ mol⁻¹ s⁻¹ from ${rs.length} runs.`]; }
        return [false, "Use rate = k[CH₃COCH₃][H⁺] (zero order in I₂): k = rate ÷ ([CH₃COCH₃][H⁺]) for each run (rate in mol dm⁻³ s⁻¹, so × 10⁻⁶), then take the mean."];
      }, P.init);
      ctx.buttons([{ label:"Copy this trace to the results (every 30 s)", onClick(){ copyTrace(30); } }], P.init);
      function copyTrace(step){
        if(!run || run.kind !== part || !run.done) return ctx.toast("Finish a run first");
        if(run.copied) return ctx.toast("This trace is already in the results");
        run.copied = true;
        const name = run.kind === "init" ? `I₂ trace, run ${run.n}` : `Br₂ trace, run ${run.n} (A₀ ${run.A0.toFixed(2)})`;
        run.pts.filter(p => Math.abs(p[0]/step - Math.round(p[0]/step)) < 1e-6).forEach(p => ctx.record({ set:name, t:p[0], A:Kit.round(Math.max(0, p[1]), 3) }, true));
        ctx.toast("Trace copied — plot absorbance against t");
      }

      /* (b) half-life */
      ctx.seg({ label:"Bromine water / cm³ (water makes it up to 25.0 cm³)", value:brV, parent:P.half, options:[[25,"25.0"],[20,"20.0"],[15,"15.0"]], onChange(v){ brV = v; draw(); } });
      ctx.seg({ label:"Logger speed", value:1, parent:P.half, options:[[1,"Normal (×15)"],[3,"Fast (×45)"]], onChange(v){ speed = v; } });
      ctx.buttons([{ label:"Mix, fill the cell and start logging", primary:true, block:true, onClick:() => start("half") }], P.half);
      const tHalf = () => Math.LN2/kBr;
      let hOK = 0, tHalfStudent = [];
      const hCheck = (which) => v => {
        if(!run || run.kind !== "half" || run.t < tHalf()*(which + 1.2)) return [false, "Let the trace run long enough to fall to " + (which ? "A₀/4." : "A₀/2.")];
        if(Math.abs(v - tHalf()) <= .07*tHalf()){ hOK |= (1 << which); tHalfStudent[which] = v;
          return [true, which ? `Correct: the second half-life is the same as the first (≈ ${tHalf().toFixed(0)} s) — constant half-life, so first order in Br₂.` : `Correct: A falls from ${run.A0.toFixed(2)} to ${(run.A0/2).toFixed(2)} in about ${tHalf().toFixed(0)} s.`]; }
        return [false, which ? `Read the time when A = ${(run.A0/4).toFixed(3)} and subtract the time when A = ${(run.A0/2).toFixed(3)}.` : `Read the time when A has fallen to ${(run.A0/2).toFixed(3)} (half of A₀ = ${run.A0.toFixed(3)}).`];
      };
      const h1 = Kit.answer(ctx, "First half-life, A₀ → A₀/2 / s", "e.g. 90", hCheck(0), P.half);
      const h2 = Kit.answer(ctx, "Second half-life, A₀/2 → A₀/4 / s", "e.g. 90", hCheck(1), P.half);
      Kit.answer(ctx, "Rate constant k = 0.693 / t½  / s⁻¹", "e.g. 0.0080", v => {
        if(hOK !== 3) return [false, "Read both half-lives from the trace first."];
        const want = .693/Kit.mean(tHalfStudent);
        if(Math.abs(v - want) <= .04*want){ ctx.complete("half"); return [true, `Correct: k = 0.693 ÷ ${Kit.mean(tHalfStudent).toFixed(0)} s = ${want.toExponential(2)} s⁻¹. Rate = k[Br₂]. Try a different starting volume — t½ does not change.`]; }
        return [false, "k = 0.693 ÷ (your mean half-life in seconds)."];
      }, P.half);
      ctx.buttons([{ label:"Copy this trace to the results (every 50 s)", onClick(){ copyTrace(50); } }], P.half);

      /* (c) activation energy */
      const bs = ctx.slider({ label:"Water-bath thermostat setting", min:15, max:55, step:1, value:20, unit:"°C", parent:P.ea, onInput(v){
        if(E.running) return; E.set = v; E.bath = Kit.round(v + .2 + .5*Math.random() - .25, 1); E.pre = false; E.Tread = null; E.ended = false; tr.clear(); draw(); } });
      ctx.buttons([{ label:"Leave tubes A and B in the bath (10 min)", onClick(){ if(E.running) return; if(E.ended) return ctx.toast("Record or rinse first"); E.pre = true; ctx.toast("Ten minutes later — both tubes are at the bath temperature"); draw(); } }], P.ea);
      const tr = Kit.reading(ctx, "Thermometer reading in the bath / °C (to 0.5 °C)", "e.g. 35.5", () => E.bath, .5, v => { E.Tread = v; draw(); }, P.ea);
      ctx.buttons([{ label:"Pour B into A — start your stop-clock", primary:true, block:true, onClick(){
        if(E.running || E.ended) return ctx.toast("Record this run or rinse the tubes first");
        E.Tmix = E.pre ? E.bath : E.bath + .6*(20 - E.bath);
        E.tc = t20*Math.exp(Ea/RG*(1/(E.Tmix + 273.15) - 1/293.15))*(1 + .02*ctx.gauss()); E.t = 0; E.running = true; draw(); } }], P.ea);
      ctx.buttons([{ label:"Record T and my stop-clock time", block:true, onClick(){
        if(!E.running && !E.ended) return ctx.toast("Run the reaction first");
        if(E.Tread === null) return ctx.toast("Enter the thermometer reading first");
        if(sw.running || sw.t <= 0) return ctx.toast("Stop your stop-clock at the blue-black colour");
        const t = Kit.round(sw.t, 1);
        if(Math.abs(sw.t - E.tc) > Math.max(2, .15*E.tc)) ctx.toast(`Hmm — the colour appeared at about ${E.tc.toFixed(0)} s. Recording your time anyway.`);
        ctx.record({ set:"Iodine clock", T:E.Tread, t, invT:Kit.round(1000/(E.Tread + 273), 4), lnr:Kit.round(Math.log(1/t), 3), pw:E.pre });
        E.running = false; E.ended = false; E.pre = false; sw.reset(); draw();
      } }, { label:"Rinse tubes", onClick(){ E.running = false; E.ended = false; E.pre = false; sw.reset(); draw(); } }], P.ea);
      const clockRows = () => ctx.rows().filter(r => r.set === "Iodine clock" && typeof r.lnr === "number");
      const eaFit = rs => rs.length >= 2 ? ctx.linFit(rs.map(r => [r.invT, r.lnr])) : null;
      Kit.answer(ctx, "Activation energy from your gradient / kJ mol⁻¹", "e.g. 52", v => {
        const good = clockRows().filter(r => r.pw), all = clockRows();
        if(new Set(good.map(r => Math.round(r.T))).size < 4) return [false, "Record pre-warmed runs at four or more different temperatures first."];
        const fg = eaFit(good), Eg = -fg.m*RG, fa = eaFit(all), Eall = fa ? -fa.m*RG : null;
        if(Math.abs(v - Eg) <= .08*Eg){ ctx.complete("ea"); return [true, `Correct: gradient = ${fg.m.toFixed(2)} K (with 10³/T on the x-axis), so Ea = −gradient × R = ${Eg.toFixed(1)} kJ mol⁻¹. Hidden value: ${(Ea/1000).toFixed(0)} kJ mol⁻¹.`]; }
        if(Eall && all.length > good.length && Math.abs(v - Eall) <= .05*Eall) return [false, "That matches a line through every point, including a run that was not pre-warmed. Leave out the anomalous point and draw the line again."];
        return [false, "Plot ln(1/t) against 10³/T. Gradient = −Ea/(1000R) with Ea in J mol⁻¹, so Ea = −gradient × 8.314 kJ mol⁻¹."];
      }, P.ea);
      Kit.answer(ctx, "Temperature of the anomalous point on your graph / °C", "e.g. 45", v => {
        const bad = clockRows().filter(r => !r.pw);
        if(!bad.length) return [false, "Every run so far was pre-warmed. Do one run without leaving the tubes in the bath, then look at your graph."];
        if(clockRows().filter(r => r.pw).length < 3) return [false, "Record at least three good runs too, so the anomaly stands out from the line."];
        if(bad.some(r => Math.abs(r.T - v) <= .6)){ ctx.complete("anom"); return [true, "Correct: that run was mixed before the tubes reached the bath temperature, so the mixture was cooler than the thermometer showed, t was too long and the point lies below the line. Ignore it when drawing the line of best fit."]; }
        return [false, "Look for the point furthest from the straight line on ln(1/t) against 10³/T."];
      }, P.ea);

      /* Paper 5 planning */
      const plan = group(ctx, "Paper 5 planning and evaluation");
      quiz(ctx, [
        { q:"Finding the order with respect to propanone, the independent variable is…", o:["the absorbance", "the initial concentration of propanone", "the time taken", "the total volume"], a:1, why:"Yes — vary [propanone] by its volume; measure the initial rate (dependent); keep the other concentrations, total volume and temperature constant." },
        { q:"Why is water added so the total volume is always 50.0 cm³?", o:["To slow the reaction down", "To cool the mixture", "So each concentration is proportional to its volume and the others stay constant", "So the colorimeter can be zeroed"], a:2, why:"Right: with a fixed total volume, only the varied concentration changes between runs." },
        { q:"Predicted graph of initial rate against [propanone] if the reaction is first order in propanone:", o:["A horizontal line", "A curve getting steeper (rate ∝ c²)", "A straight line through the origin", "A straight line with a positive intercept"], a:2, why:"Rate = k′[propanone]: a straight line through the origin." },
        { q:"If you sampled the iodination mixture and titrated it, how would you quench each sample?", o:["Run it into excess NaHCO₃(aq) to remove the H⁺ catalyst", "Add starch", "Run it into dilute HCl", "Warm it in a water bath"], a:0, why:"Correct: neutralising the acid catalyst stops the reaction; then titrate the I₂ with thiosulfate." },
        { q:"Best way to keep the temperature constant:", o:["Do it at room temperature", "Stand the flask on a hot plate", "Thermostatted water bath, with each reagent equilibrated before mixing", "Add ice to the mixture"], a:2, why:"Yes — and record the temperature at the start and end of each run." },
        { q:"Main hazard of propanone, and the precaution:", o:["Toxic gas — use a face mask", "Highly flammable — no naked flames", "Corrosive — wear a lab coat", "No significant hazard"], a:1, why:"Correct: propanone is highly flammable; iodine is harmful, so wear gloves too." },
        { q:"Units of k for rate = k[CH₃COCH₃][H⁺]:", o:["s⁻¹", "mol dm⁻³ s⁻¹", "dm³ mol⁻¹ s⁻¹", "dm⁶ mol⁻² s⁻¹"], a:2, why:"Right: (mol dm⁻³ s⁻¹) ÷ (mol dm⁻³)² = dm³ mol⁻¹ s⁻¹." },
        { q:"In the Ea experiment, which point is most likely to be unreliable?", o:["The lowest temperature, because the time is longest", "The highest temperature, because the time is short and the mixture cools", "None — all are equally reliable", "The room-temperature run"], a:1, why:"Yes: a short time has the largest percentage error, and a hot mixture loses heat fastest." }
      ], () => ctx.complete("plan"), plan);

      P.show(part); draw();
    }
  });

/* ───────────────────────── A-EQUILIBRIA ───────────────────────── */
  const KW = 1e-14;
  /* pH from the charge balance [H⁺] + [Na⁺] = [OH⁻] + [A⁻] + [Cl⁻] (weak acid HA, total cA) */
  function pHof(cA, Ka, cNa, cCl){
    let lo = 0, hi = 14.5;
    for(let i = 0; i < 60; i++){
      const m = (lo + hi)/2, H = Math.pow(10, -m);
      const f = H + cNa - KW/H - (cA ? cA*Ka/(Ka + H) : 0) - cCl;
      if(f > 0) lo = m; else hi = m;
    }
    return (lo + hi)/2;
  }
  const UNK = [["methanoic acid", 3.75], ["phenylethanoic acid", 4.31], ["ethanoic acid", 4.76]];
  const BUF = { "10":[10,40], "20":[20,30], "25":[25,25], "30":[30,20], "40":[40,10], water:[0,0] };
  const BOT = { B1:{ e:5, w:0 }, B2:{ e:4, w:1 }, B3:{ e:3, w:2 }, B4:{ e:2, w:3 } };
  const DAYS = { "1":1, "7":7, "14":14 };
  const W_IN_ACID = 4.79;                                    // g of water in 5.00 cm³ of 2.00 mol dm⁻³ HCl
  const nEst = e => e*.902/88.0, nWat = w => (w*1.00 + W_IN_ACID)/18.0;

  Lab.register({
    id:"a-equilibria", subject:"chemistry", level:["a"], topic:"Equilibria · Acids, buffers, Kc, Kpc, Ksp", interactive:true,
    title:"Acids, buffers and equilibrium constants",
    summary:"Plot a pH curve for a weak acid with a pH meter and find pKa at half-neutralisation; make and test a buffer against a water control; titrate equilibrium mixtures of ethyl ethanoate and water to find Kc; find a partition coefficient for ammonia and the Ksp of calcium hydroxide.",
    aim:"Use titrations and a pH meter to determine Ka of a weak acid, test the action of a buffer, and measure the equilibrium constants Kc (ester hydrolysis), Kpc (partition of ammonia) and Ksp (calcium hydroxide).",
    variables:{ iv:"Volume of NaOH added · buffer composition · starting amounts in each equilibrium bottle", dv:"pH (pH meter) · titres (cm³)", cv:["Temperature (all equilibrium constants depend on it)","Same burette, pipette and indicator","pH meter calibrated with pH 4.00 and 7.00 buffers"] },
    stageTitle:"Burette, pH meter and equilibrium mixtures", controlsTitle:"Experiment",
    thumb:`<svg viewBox="0 0 300 140"><rect x="34" y="10" width="12" height="90" rx="3" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M20 120 h60" stroke="#A2ACBD" stroke-width="3"/><rect x="120" y="14" width="160" height="112" rx="6" fill="#F4F7FB" stroke="#A2ACBD"/><path d="M130 104 C150 96 170 86 196 78 C206 74 210 66 214 40 C218 26 240 22 272 20" stroke="#7048E8" stroke-width="3" fill="none"/></svg>`,
    challenges:[
      { id:"plan",   title:"Plan it (Paper 5)", text:"Answer every planning point: indicator, calibration, controls, equilibrium time and hazards." },
      { id:"curve",  title:"Weak acid pH curve", text:"Record a full pH curve for a weak acid (twelve or more points, well past the equivalence point) and find its concentration." },
      { id:"pka",    title:"pKa and Ka", text:"Find pKa from the pH at half-neutralisation, then Ka. Identify FB 2." },
      { id:"buffer", title:"Buffer action", text:"Calculate the pH of your buffer, then add acid (or alkali) to the buffer and to a water control." },
      { id:"kc",     title:"Kc for ester hydrolysis", text:"Titrate a bottle at equilibrium and the HCl blank, then calculate Kc." },
      { id:"kpc",    title:"Partition coefficient", text:"Titrate both layers and calculate Kpc for ammonia between water and trichloromethane." },
      { id:"ksp",    title:"Ksp of Ca(OH)₂", text:"Titrate filtered saturated calcium hydroxide and calculate Ksp." }
    ],
    columns:[{key:"set",label:"Experiment"},{key:"item",label:"Detail"},{key:"V",label:"V added / cm³",dp:2},{key:"pH",label:"pH",dp:2},{key:"titre",label:"Titre / cm³",dp:2}],
    series:"set",
    graph:{ x:["V"], y:["pH"], fit:"none" },
    questions:[
      { q:"Describe and explain the shape of the pH curve for ethanoic acid titrated with sodium hydroxide.",
        a:"It starts near pH 3 (weak acid, partly dissociated), rises quickly then levels into a buffer region where CH₃COOH and CH₃COO⁻ are both present. The vertical section is short, about pH 7–11, and the equivalence point is above 7 (about 8.7) because CH₃COO⁻ is a weak base. After it the pH levels off near 12–13." },
      { q:"Why is the pH at half-neutralisation equal to pKa?",
        a:"Half the acid has become CH₃COO⁻, so [CH₃COOH] = [CH₃COO⁻]. Ka = [H⁺][CH₃COO⁻]/[CH₃COOH] = [H⁺], so pH = pKa." },
      { q:"Which indicator should be used for a weak acid–strong base titration, and why not methyl orange?",
        a:"Phenolphthalein (range about 8.3–10): it changes within the steep section. Methyl orange changes at pH 3.1–4.4, in the buffer region, long before the equivalence point. For a strong acid–strong base titration either indicator works because the vertical section covers pH 3–11." },
      { q:"Explain, with equations, how an ethanoic acid–sodium ethanoate buffer resists a change in pH.",
        a:"The buffer has large amounts of CH₃COOH and CH₃COO⁻. Added H⁺: CH₃COO⁻ + H⁺ → CH₃COOH. Added OH⁻: CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O. The ratio [CH₃COO⁻]/[CH₃COOH] barely changes, so pH = pKa + log([CH₃COO⁻]/[CH₃COOH]) barely changes. In blood the HCO₃⁻/H₂CO₃ system works the same way." },
      { q:"Write Kc for the hydrolysis of ethyl ethanoate. Why can amounts in moles be used instead of concentrations, and why is the mixture titrated quickly?",
        a:"Kc = [CH₃COOH][C₂H₅OH] / ([CH₃COOC₂H₅][H₂O]). There are equal numbers of moles on each side, so the volume cancels. Titrate quickly (and cold) because NaOH hydrolyses the remaining ester, which would use extra NaOH and make the titre too large." },
      { q:"Define the partition coefficient. Why does ammonia have a large Kpc between water and trichloromethane?",
        a:"Kpc is the ratio of the concentrations of a solute in two immiscible solvents at equilibrium (here [NH₃ in water]/[NH₃ in CHCl₃]) at a stated temperature. Ammonia is polar and forms hydrogen bonds with water, so it is much more soluble in water than in the less polar trichloromethane." },
      { q:"Write the Ksp expression for calcium hydroxide and explain why it is less soluble in aqueous sodium hydroxide.",
        a:"Ksp = [Ca²⁺][OH⁻]² (units mol³ dm⁻⁹). With s mol dm⁻³ dissolved, Ksp = s(2s)² = 4s³. In NaOH(aq) [OH⁻] is already high, so [Ca²⁺] must be smaller to keep the product equal to Ksp: the common ion effect lowers the solubility." },
      { q:"Evaluate these experiments: suggest sources of error and improvements.",
        a:"Equilibrium constants depend on temperature: keep the bottles and funnel in a water bath and record T. NaOH absorbs CO₂ from the air: use it fresh and keep it stoppered. In the Kc experiment, not leaving the bottles long enough gives a low titre; check by titrating again after a further week. Unfiltered Ca(OH)₂ contains suspended solid that dissolves during the titration, giving a high titre. Repeat titrations until concordant." }
    ],
    setup(ctx){
      /* hidden values */
      const unkI = Math.floor(Math.random()*UNK.length);
      const conc = { eth:Kit.round(.08 + .04*Math.random(), 4), hcl:Kit.round(.08 + .04*Math.random(), 4), unk:Kit.round(.08 + .04*Math.random(), 4) };
      const KA = { eth:Math.pow(10, -4.76), unk:Math.pow(10, -UNK[unkI][1]) };
      const ACN = { eth:"Ethanoic acid", hcl:"Hydrochloric acid", unk:"FB 2 (unknown acid)" };
      const cal = Kit.round(.03*(Math.random()*2 - 1), 2);                   // pH-meter calibration offset
      const Kc = .24 + .06*Math.random(), cHCl = 2.00*(1 + .004*ctx.gauss());
      const Kpc = 23 + 4*Math.random(), solCa = .0205*(1 + .03*ctx.gauss());
      const BX = 200, Y0 = 50, PX = 6;

      let part = "ph", acid = "eth", bufK = "25", reag = "HCl", bot = "B1", days = "7", nh3 = 1.00, layer = "aq", filt = "yes";
      let r = null, init = null, burSol = null, flowing = false, drops = [];
      let F = { kind:null };
      const B = { made:false, n:0 };
      const D = { shaken:false, settled:false };

      const burInfo = () => part === "ph" ? ["NaOH, 0.100 mol dm⁻³", .100] : part === "kc" ? ["NaOH, 1.00 mol dm⁻³", 1.00]
        : part === "kpc" ? (layer === "aq" ? ["HCl, 0.500 mol dm⁻³", .500] : ["HCl, 0.0200 mol dm⁻³", .0200]) : ["HCl, 0.0500 mol dm⁻³", .0500];
      const burCol = () => "rgba(200,215,235,.45)";

      /* equilibrium amount of acid formed in a bottle */
      function xEq(b){ const nE = nEst(BOT[b].e), nW = nWat(BOT[b].w); let lo = 0, hi = Math.min(nE, nW);
        for(let i = 0; i < 60; i++){ const m = (lo + hi)/2; if(m*m - Kc*(nE - m)*(nW - m) > 0) hi = m; else lo = m; } return (lo + hi)/2; }
      const xAt = (b, d) => xEq(b)*(1 - Math.exp(-d/1.4));

      /* pH in the beaker (part a) */
      function phA(){
        const Vt = 25 + F.added, cA = conc[F.acid]*25/Vt, cNa = .100*F.added/Vt;
        return F.acid === "hcl" ? pHof(0, 1, cNa, cA) : pHof(cA, KA[F.acid], cNa, 0);
      }
      function phB(){
        const [va, vs] = BUF[bufK], add = B.n*1.00, Vt = 50 + add;
        if(bufK === "water") return pHof(2e-6*50/Vt, 4.5e-7, reag === "NaOH" ? .1*add/Vt : 0, reag === "HCl" ? .1*add/Vt : 0);
        return pHof(.1*(va + vs)/Vt, KA.eth, .1*vs/Vt + (reag === "NaOH" ? .1*add/Vt : 0), reag === "HCl" ? .1*add/Vt : 0);
      }
      const meter = () => part === "ph" ? (F.kind === "ph" ? Kit.round(phA() + cal, 2) : null) : part === "buf" ? (B.made ? Kit.round(phB() + cal, 2) : null) : null;

      function flaskColour(){
        if(!F.kind || F.kind === "ph") return ["rgba(210,225,240,.28)", "colourless"];
        const d = F.added - F.Veq;
        if(F.kind === "kpc"){
          if(d < -.05) return ["rgba(245,205,40,.75)", "yellow"];
          if(d <= .12) return ["rgba(240,140,40,.8)", "orange"];
          return ["rgba(220,45,45,.75)", "red"];
        }
        if(F.kind === "ksp"){
          if(d >= 0) return ["rgba(210,225,240,.28)", "colourless"];
          const a = Math.min(.8, .12 + (-d)*1.2);
          return [`rgba(225,80,170,${a.toFixed(2)})`, -d < .4 ? "pale pink" : "pink"];
        }
        if(d < 0) return ["rgba(210,225,240,.28)", "colourless"];
        return [`rgba(225,80,170,${Math.min(.85, .15 + d*1.5).toFixed(2)})`, d < .25 ? "pale pink (permanent)" : "pink"];
      }

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="aeq-svg"><defs>${Kit.DEFS}<clipPath id="aeq-bur"><rect x="${BX - 9}" y="40" width="18" height="312"/></clipPath>
        <clipPath id="aeq-fl"><path d="${ChemKit.FLASK(BX, 470, .95)} Z"/></clipPath><clipPath id="aeq-bk"><path d="${ChemKit.BEAKER(BX - 70, 470, 140, 104)} Z"/></clipPath></defs>
        ${Kit.bench(960, 470)}<g id="aeq-scene"></g><g id="aeq-lens"></g><text x="24" y="30" class="k-status" id="aeq-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#aeq-svg"), $ = s => svg.querySelector(s);
      let ticks = "";
      for(let v = 0; v <= 50; v++){ const y = Y0 + v*PX; ticks += `<line x1="${BX - 10}" y1="${y}" x2="${BX - 10 + (v % 5 ? 4 : 8)}" y2="${y}" stroke="var(--txt2)" stroke-width=".8"/>${v % 10 ? "" : `<text x="${BX - 14}" y="${y + 3.5}" text-anchor="end" class="k-num">${v}</text>`}`; }

      function pHMeter(x, y, val){
        return `<g transform="translate(${x} ${y})"><rect width="236" height="112" rx="12" fill="#2B3240" stroke="#4B5563"/>
          <rect x="16" y="16" width="204" height="50" rx="6" fill="#132A1F"/><text x="208" y="54" text-anchor="end" class="k-lcd" style="font-size:28px">${val === null ? "—.——" : val.toFixed(2)}</text>
          <text x="26" y="32" style="font:600 9px Inter;fill:#5FBF8A">pH</text>
          <text x="16" y="86" style="font:600 10px Inter;fill:#CBD5E1">pH meter · calibrated at pH 4.00 and 7.00</text>
          <text x="16" y="102" style="font:500 10px Inter;fill:#94A3B8">resolution 0.01 · 20 °C</text></g>`;
      }
      function card(title, lines){
        return `<g transform="translate(540 40)"><rect width="400" height="${40 + lines.length*19}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="14" y="24" class="k-tag">${title}</text>${lines.map((l, i) => `<text x="14" y="${46 + i*19}" class="k-lbl">${l}</text>`).join("")}</g>`;
      }
      function station(){
        let s = "";
        if(part === "ph" || part === "buf"){
          s += pHMeter(700, 300, meter());
          s += `<path d="M700 356 C640 356 ${BX + 80} 300 ${BX + 34} 300" stroke="#334155" stroke-width="3" fill="none"/>`;
        }else if(part === "kc"){
          Object.keys(BOT).forEach((k, i) => { const x = 560 + i*95, on = k === bot, b = BOT[k];
            const top = 430 - (5 + b.e + b.w)*5.6;
            s += `<g><rect x="${x}" y="${top - 26}" width="62" height="${430 - top + 26}" rx="8" fill="url(#k-glass)" stroke="${on ? "var(--accent)" : "var(--txt2)"}" stroke-width="${on ? 2.5 : 1.3}"/>
              <rect x="${x + 2}" y="${top}" width="58" height="${428 - top}" rx="6" fill="rgba(200,215,235,.4)"/>
              <rect x="${x + 16}" y="${top - 40}" width="30" height="16" rx="4" fill="#3A4252"/>
              <text x="${x + 31}" y="452" text-anchor="middle" class="k-tag">${k}</text></g>`; });
        }else if(part === "kpc"){
          const x = 760, y = 260, mixd = D.shaken && !D.settled;
          s += `<path d="M${x - 12} ${y} h24 v14 C${x + 70} ${y + 60} ${x + 60} ${y + 150} ${x + 6} ${y + 170} v34 h-12 v-34 C${x - 60} ${y + 150} ${x - 70} ${y + 60} ${x - 12} ${y + 14}z" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
            <rect x="${x - 14}" y="${y - 14}" width="28" height="14" rx="3" fill="#3A4252"/><rect x="${x - 16}" y="${y + 186}" width="32" height="8" rx="3" fill="#3B4A63"/>`;
          s += mixd ? `<path d="M${x - 46} ${y + 70} C${x - 52} ${y + 120} ${x - 30} ${y + 150} ${x} ${y + 166} C${x + 30} ${y + 150} ${x + 52} ${y + 120} ${x + 46} ${y + 70}z" fill="rgba(215,215,200,.6)"/>`
            : `<path d="M${x - 46} ${y + 70} L${x + 46} ${y + 70} C${x + 52} ${y + 92} ${x + 50} ${y + 104} ${x + 46} ${y + 116} L${x - 46} ${y + 116} C${x - 50} ${y + 104} ${x - 52} ${y + 92} ${x - 46} ${y + 70}z" fill="rgba(170,205,240,.45)"/>
               <path d="M${x - 46} ${y + 116} L${x + 46} ${y + 116} C${x + 40} ${y + 140} ${x + 24} ${y + 156} ${x} ${y + 166} C${x - 24} ${y + 156} ${x - 40} ${y + 140} ${x - 46} ${y + 116}z" fill="rgba(235,225,190,.6)"/>
               <text x="${x + 62}" y="${y + 96}" class="k-lbl">aqueous (upper)</text><text x="${x + 44}" y="${y + 150}" class="k-lbl">CHCl₃ (lower, denser)</text>`;
          s += `<text x="${x - 200}" y="${y + 196}" class="k-lbl">${!D.shaken ? "not shaken yet" : mixd ? "shaken — wait for the layers to separate" : "layers separated"}</text>`;
        }else{
          const x = 800, y = 270;
          s += `<path d="M${x - 60} ${y} L${x - 8} ${y + 70} V${y + 110} H${x + 8} V${y + 70} L${x + 60} ${y}z" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
            <path d="M${x - 50} ${y + 6} L${x} ${y + 64} L${x + 50} ${y + 6}z" fill="#F4F1E8" stroke="#C9C2B0"/><path d="M${x - 26} ${y + 36} L${x} ${y + 60} L${x + 26} ${y + 36}z" fill="#FFFFFF"/>
            <path d="${ChemKit.FLASK(x, 452, .6)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.3"/><rect x="${x - 36}" y="${428}" width="72" height="22" fill="rgba(215,225,235,${filt === "yes" ? .35 : .7})"/>
            <text x="${x - 190}" y="${y + 20}" class="k-lbl">${filt === "yes" ? "filtered: clear filtrate" : "not filtered: cloudy,"}</text>
            <text x="${x - 190}" y="${y + 38}" class="k-lbl">${filt === "yes" ? "white solid left on the paper" : "suspended Ca(OH)₂(s)"}</text>`;
        }
        return s;
      }
      function infoLines(){
        if(part === "ph") return ["25.0 cm³ of the acid in a beaker with the pH probe", `burette: ${burSol ? burSol : "empty"}`, `acid: ${ACN[acid]}`,
          "Record pH after each addition; use small additions near", "the end point. Plot pH against volume of NaOH added."];
        if(part === "buf") { const [va, vs] = BUF[bufK]; return [bufK === "water" ? "Control: 50.0 cm³ distilled water" : `${va.toFixed(1)} cm³ CH₃COOH (0.100) + ${vs.toFixed(1)} cm³ CH₃COONa (0.100)`,
          "Ka(CH₃COOH) = 1.74 × 10⁻⁵ mol dm⁻³ (pKa 4.76)", `test reagent: 0.100 mol dm⁻³ ${reag}, 1.00 cm³ portions`, `added so far: ${(B.n*1).toFixed(2)} cm³`]; }
        if(part === "kc"){ const b = BOT[bot]; return [`${bot}: 5.00 cm³ HCl (2.00) + ${b.e.toFixed(2)} cm³ ester + ${b.w.toFixed(2)} cm³ water`,
          "CH₃COOC₂H₅ + H₂O ⇌ CH₃COOH + C₂H₅OH", "ester: density 0.902 g cm⁻³, Mr 88.0 · water: Mr 18.0, 1.00 g cm⁻³",
          "5.00 cm³ of the HCl contains 4.79 g of water", `left stoppered at room temperature for ${days === "1" ? "1 day" : days === "7" ? "1 week" : "2 weeks"}`, "burette: NaOH 1.00 mol dm⁻³ · indicator: phenolphthalein"]; }
        if(part === "kpc") return [`25.0 cm³ NH₃(aq), ${nh3.toFixed(2)} mol dm⁻³ + 25.0 cm³ trichloromethane`, "Shake, venting often; let the layers separate.",
          "Titrate 10.0 cm³ of each layer with HCl (methyl orange):", "aqueous layer: 0.500 mol dm⁻³ HCl", "organic layer (+ 20 cm³ water): 0.0200 mol dm⁻³ HCl", "Fume hood and gloves: CHCl₃ vapour is harmful."];
        return ["Ca(OH)₂(s) ⇌ Ca²⁺(aq) + 2OH⁻(aq)", "Saturated solution, left to settle at 20 °C.", "Titrate 25.0 cm³ with 0.0500 mol dm⁻³ HCl", "(phenolphthalein: pink → colourless)."];
      }

      function draw(){
        const [col, cname] = flaskColour();
        let s = "";
        if(part !== "buf"){
          s += `<rect x="${BX - 80}" y="470" width="160" height="0"/><rect x="${BX - 70}" y="468" width="140" height="6" fill="#F4F4F2" stroke="#C9CCD3"/>
            <rect x="80" y="30" width="9" height="440" rx="3" fill="url(#k-metal)"/><rect x="60" y="462" width="80" height="10" rx="3" fill="url(#k-metal)"/><rect x="80" y="150" width="${BX - 90}" height="8" rx="3" fill="url(#k-metal)"/>`;
          if(r !== null && r < 50) s += `<rect x="${BX - 9}" y="${Y0 + r*PX}" width="18" height="${352 - Y0 - r*PX}" fill="${burCol()}" clip-path="url(#aeq-bur)"/>`;
          s += `<rect x="${BX - 10}" y="40" width="20" height="312" rx="3" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/>${ticks}
            <path d="M${BX - 4} 352 L${BX - 2} 384 H${BX + 2} L${BX + 4} 352" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.3"/>
            <rect x="${BX - 14}" y="356" width="28" height="10" rx="4" fill="${flowing ? "var(--accent)" : "#3B4A63"}"/>`;
          s += drops.map(d => `<ellipse cx="${BX}" cy="${d.y}" rx="2.4" ry="3.4" fill="${burCol()}"/>`).join("");
        }
        if(part === "ph" || part === "buf"){
          const vol = part === "ph" ? (F.kind === "ph" ? 25 + F.added : 0) : (B.made ? 50 + B.n : 0), lvl = 470 - vol*1.0;
          if(vol) s += `<rect x="${BX - 70}" y="${lvl}" width="140" height="${470 - lvl}" fill="rgba(200,215,235,.35)" clip-path="url(#aeq-bk)"/>`;
          s += `<path d="${ChemKit.BEAKER(BX - 70, 470, 140, 104)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
          s += `<rect x="${BX + 26}" y="300" width="16" height="150" rx="6" fill="#E5E7EB" stroke="#6B7280"/><rect x="${BX + 28}" y="436" width="12" height="14" rx="6" fill="#9DB2CF"/>`;
          if(part === "buf") s += `<g transform="translate(110 150)"><rect width="10" height="130" rx="3" fill="url(#k-glass)" stroke="var(--txt2)"/><text x="5" y="-8" text-anchor="middle" class="k-tag">HCl</text></g>
            <g transform="translate(270 150)"><rect width="10" height="130" rx="3" fill="url(#k-glass)" stroke="var(--txt2)"/><text x="5" y="-8" text-anchor="middle" class="k-tag">NaOH</text></g>
            <text x="100" y="304" class="k-lbl">1 cm³ graduated pipettes</text>`;
        }else{
          if(F.kind){ const vol = F.base + F.added, lvl = 470 - Math.min(80, vol*.55);
            s += `<g clip-path="url(#aeq-fl)"><rect x="${BX - 70}" y="${lvl}" width="140" height="${470 - lvl}" fill="${col}"/></g>`; }
          s += `<path d="${ChemKit.FLASK(BX, 470, .95)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
        }
        const head = { ph:"(a) pH titration curve", buf:"(b) Making and testing a buffer", kc:"(c) Kc: hydrolysis of ethyl ethanoate", kpc:"(d) Partition of ammonia", ksp:"(e) Ksp of calcium hydroxide" }[part];
        s += card(head, infoLines());
        s += station();
        if(part !== "ph" && part !== "buf") s += `<text x="${BX + 70}" y="452" class="k-lbl">flask: ${F.kind ? cname : "empty"}</text>`;
        $("#aeq-scene").innerHTML = s;
        $("#aeq-lens").innerHTML = part === "buf" ? "" : r === null ? `<g transform="translate(420 200)"><circle r="80" fill="var(--bg-card)" stroke="var(--brd2)" stroke-dasharray="5 4"/><text text-anchor="middle" y="4" class="k-lbl">fill the burette</text></g>`
          : ChemKit.lens({ id:"aeq-l", cx:420, cy:200, r:80, S:60, value:Math.min(r, 50.6), minor:.1, major:1, half:.5, down:true, liquid:burCol(), label:"magnifier on the meniscus" })
            + `<line x1="${BX + 12}" y1="${Y0 + Math.min(r, 50)*PX}" x2="340" y2="200" stroke="var(--accent)" stroke-dasharray="3 3"/>`;
        $("#aeq-status").textContent = part === "buf" ? (!B.made ? "Make up 50.0 cm³ of the solution in the beaker" : "Add 1.00 cm³ portions and record the pH each time")
          : r === null ? "Fill the burette" : !F.kind ? (part === "ph" ? "Pipette 25.0 cm³ of acid into the beaker" : part === "kpc" && !D.settled ? "Shake the funnel, then let the layers separate" : "Prepare the flask")
          : init === null ? "Read the burette and enter the initial reading"
          : part === "ph" ? "Add NaOH, read the burette and record each point" : "Titrate to the end point, then read the burette";
        const m = meter();
        ctx.readout(part === "ph" || part === "buf" ? [["pH meter", m === null ? "—" : m.toFixed(2)], ["NaOH added", part === "ph" && F.kind ? F.added.toFixed(2) + " cm³" : "—"]]
          : [["Burette", burSol || "empty"], ["Flask", F.kind ? cname : "empty"], ["Added", F.kind ? F.added.toFixed(2) + " cm³" : "—"]]);
      }

      function add(v){
        if(part === "buf") return false;
        if(r === null){ ctx.toast("Fill the burette first"); return false; }
        if(!F.kind){ ctx.toast(part === "ph" ? "Pipette the acid into the beaker first" : "Prepare the flask first"); return false; }
        if(init === null){ ctx.toast("Enter the initial burette reading first"); return false; }
        if(r + v > 50.6){ ctx.toast("The burette is empty — refill it"); return false; }
        r += v; F.added = Kit.round(F.added + v, 4); drops.push({ y:384, vy:0 }); if(!flowing) draw(); return true;
      }
      ctx.frame(dt => {
        if(flowing && !add(1.6*dt)) flowing = false;
        for(let k = drops.length - 1; k >= 0; k--){ const d = drops[k]; d.vy += 900*dt; d.y += d.vy*dt; if(d.y > 440) drops.splice(k, 1); }
        if(flowing || drops.length) draw();
      });

      /* ── controls ── */
      const fillBur = () => { const [n] = burInfo(); r = Kit.round(.1 + Math.random()*1.4, 3); init = null; burSol = n; rbI.clear(); rbN.clear(); draw(); };
      const emptyFlask = () => { F = { kind:null }; init = null; rbI.clear(); rbN.clear(); };
      ctx.seg({ label:"Part", value:part, options:[["ph","(a) pH curve"],["buf","(b) Buffer"],["kc","(c) Kc"],["kpc","(d) Kpc"],["ksp","(e) Ksp"]], onChange(v){
        part = v; emptyFlask(); r = null; burSol = null; S.show(v); A.show(v); burBox.style.display = v === "buf" ? "none" : ""; relabel(); draw(); } });
      const S = partBoxes(ctx, ["ph", "buf", "kc", "kpc", "ksp"]);
      const burBox = ctx.html(`<div></div>`);
      const A = partBoxes(ctx, ["ph", "buf", "kc", "kpc", "ksp"]);

      /* setup per part */
      ctx.seg({ label:"Acid in the beaker", value:acid, parent:S.ph, options:[["eth","Ethanoic acid"],["hcl","HCl (strong)"],["unk","FB 2 (unknown)"]], onChange(v){ acid = v; emptyFlask(); draw(); } });
      ctx.buttons([{ label:"Pipette 25.0 cm³ of acid · insert pH probe", block:true, onClick(){ if(F.kind === "ph" && F.added > 0) return ctx.toast("Record or rinse first"); F = { kind:"ph", acid, added:0 }; init = null; rbI.clear(); draw(); } }], S.ph);

      ctx.seg({ label:"Solution in the beaker (acid + salt, cm³)", value:bufK, parent:S.buf, options:[["10","10+40"],["20","20+30"],["25","25+25"],["30","30+20"],["40","40+10"],["water","Water (control)"]], onChange(v){ bufK = v; B.made = false; B.n = 0; draw(); } });
      ctx.seg({ label:"Test reagent (1.00 cm³ portions)", value:reag, parent:S.buf, options:[["HCl","0.100 M HCl"],["NaOH","0.100 M NaOH"]], onChange(v){ reag = v; B.made = false; B.n = 0; draw(); } });
      const bufName = () => (bufK === "water" ? "Water" : `Buffer ${BUF[bufK][0]}:${BUF[bufK][1]}`) + " + " + reag;
      ctx.buttons([{ label:"Make up fresh 50.0 cm³", onClick(){ B.made = true; B.n = 0; B.id = Math.random(); draw(); } },
        { label:"Add 1.00 cm³", onClick(){ if(!B.made) return ctx.toast("Make up the solution first"); if(B.n >= 5) return ctx.toast("Five portions is enough — make up a fresh solution"); B.n++; draw(); } }], S.buf);
      ctx.buttons([{ label:"Record pH", primary:true, block:true, onClick(){
        if(!B.made) return ctx.toast("Make up the solution first");
        const name = bufName();
        if(ctx.rows().some(x => x.set === name && x.V === B.n && x.run === B.id)) return ctx.toast("Already recorded — add another portion");
        ctx.record({ set:name, item:`${(B.n*1).toFixed(2)} cm³ ${reag} added`, V:B.n*1, pH:meter(), run:B.id }); bufCheck(); } }], S.buf);
      B.id = Math.random();
      const bufDone = { calc:false };
      function bufCheck(){
        const rows = ctx.rows(), byS = {}; rows.forEach(x => { if(/^(Buffer|Water) /.test(x.set)) (byS[x.set] = byS[x.set] || new Set()).add(x.V); });
        const ok = ["HCl", "NaOH"].some(rg => Object.keys(byS).some(k => k.startsWith("Buffer") && k.endsWith(rg) && byS[k].size >= 3) && byS["Water + " + rg] && byS["Water + " + rg].size >= 3);
        if(ok && bufDone.calc) ctx.complete("buffer");
        return ok;
      }

      ctx.seg({ label:"Bottle", value:bot, parent:S.kc, options:Object.keys(BOT).map(k => [k, k]), onChange(v){ bot = v; emptyFlask(); draw(); } });
      ctx.seg({ label:"Time left to equilibrate", value:days, parent:S.kc, options:[["1","1 day"],["7","1 week"],["14","2 weeks"]], onChange(v){ days = v; emptyFlask(); draw(); } });
      ctx.buttons([{ label:"Wash bottle contents into flask + phenolphthalein", block:true, onClick(){
        const x = xAt(bot, DAYS[days]); F = { kind:"kc", added:0, base:15, Veq:(cHCl*5/1000 + x)/1.00*1000, item:`${bot} · ${days === "1" ? "1 day" : days === "7" ? "1 week" : "2 weeks"}`, bot, days:DAYS[days] }; init = null; rbI.clear(); draw(); } },
        { label:"Blank: 5.00 cm³ of the HCl alone + phenolphthalein", block:true, onClick(){ F = { kind:"kc", added:0, base:5, Veq:cHCl*5, item:"blank (5.00 cm³ HCl only)", blank:true }; init = null; rbI.clear(); draw(); } }], S.kc);

      ctx.seg({ label:"Starting ammonia concentration", value:nh3, parent:S.kpc, options:[[1,"1.00 mol dm⁻³"],[.5,"0.50 mol dm⁻³"]], onChange(v){ nh3 = v; D.shaken = false; D.settled = false; emptyFlask(); draw(); } });
      ctx.buttons([{ label:"Shake, venting often", onClick(){ D.shaken = true; D.settled = false; emptyFlask(); draw(); } },
        { label:"Let the layers separate", onClick(){ if(!D.shaken) return ctx.toast("Shake the funnel first"); D.settled = true; draw(); } }], S.kpc);
      ctx.seg({ label:"Layer to titrate", value:layer, parent:S.kpc, options:[["aq","Aqueous (upper)"],["org","Organic (lower)"]], onChange(v){ layer = v; emptyFlask(); r = null; burSol = null; draw(); ctx.toast("Different HCl for this layer — refill the burette"); } });
      ctx.buttons([{ label:"Pipette 10.0 cm³ of the layer + methyl orange", block:true, onClick(){
        if(!D.shaken) return ctx.toast("Shake the funnel first — the ammonia has not partitioned yet");
        if(!D.settled) return ctx.toast("Wait for the layers to separate completely");
        const cAq = nh3*Kpc/(Kpc + 1), cOrg = nh3/(Kpc + 1), c = layer === "aq" ? cAq : cOrg, cB = layer === "aq" ? .500 : .0200;
        F = { kind:"kpc", added:0, base:layer === "aq" ? 10 : 30, Veq:c*10/cB, item:`${layer === "aq" ? "aqueous" : "organic"} layer · ${nh3.toFixed(2)} M start`, layer, start:nh3 }; init = null; rbI.clear(); draw(); } }], S.kpc);

      ctx.seg({ label:"Saturated Ca(OH)₂", value:filt, parent:S.ksp, options:[["yes","Filtered"],["no","Not filtered (cloudy)"]], onChange(v){ filt = v; emptyFlask(); draw(); } });
      ctx.buttons([{ label:"Pipette 25.0 cm³ + phenolphthalein", block:true, onClick(){
        F = { kind:"ksp", added:0, base:25, Veq:2*solCa*25/.0500*(filt === "yes" ? 1 : 1.12 + .05*Math.random()), item:filt === "yes" ? "filtered, 25.0 cm³" : "unfiltered, 25.0 cm³", filt }; init = null; rbI.clear(); draw(); } }], S.ksp);

      /* burette (shared) */
      ctx.buttons([{ label:"Fill burette", block:true, onClick:fillBur }], burBox);
      const rbI = Kit.reading(ctx, "Initial burette reading / cm³ (2 d.p.)", "e.g. 0.85", () => r === null || !F.kind || F.added > 0 ? null : r, .05, v => { init = v; draw(); }, burBox);
      ctx.buttons([{ label:"+5.00", onClick:() => add(5) }, { label:"+1.00", onClick:() => add(1) }, { label:"+0.50", onClick:() => add(.5) }, { label:"+0.10", onClick:() => add(.1) }, { label:"1 drop", onClick:() => add(.05) }], burBox);
      const hold = ctx.buttons([{ label:"Hold to open tap", block:true, onClick(){} }], burBox)[0];
      const on = e => { e.preventDefault(); flowing = true; }, off = () => { flowing = false; };
      hold.addEventListener("pointerdown", on); ["pointerup","pointerleave","pointercancel"].forEach(ev => hold.addEventListener(ev, off)); hold.style.touchAction = "none";
      const rbN = Kit.reading(ctx, "Burette reading now / cm³", "e.g. 12.35", () => init === null || !F.kind ? null : r, .05, v => {
        if(part === "ph"){
          const V = Kit.round(v - init, 2), name = ACN[F.acid];
          ctx.record({ set:name, item:"", V, pH:meter() }, true); ctx.toast(`Recorded: ${V.toFixed(2)} cm³, pH ${meter().toFixed(2)}`); rbN.clear(); return;
        }
        const titre = Kit.round(v - init, 2), [bn] = burInfo();
        const row = { set:{ kc:"Kc (ester)", kpc:"Kpc (ammonia)", ksp:"Ksp Ca(OH)₂" }[part], item:F.item, titre };
        Object.assign(row, { bot:F.bot, days:F.days, blank:!!F.blank, layer:F.layer, start:F.start, filt:F.filt, bur:bn });
        ctx.record(row);
        if(Math.abs(F.added - F.Veq) > .3) ctx.toast(F.added > F.Veq ? "Overshot — the end point was passed by more than 0.3 cm³" : "That was before the end point");
        emptyFlask(); if(r > 46) ctx.toast("Refill the burette before the next titration"); draw();
      }, burBox);
      function relabel(){
        rbN.box.querySelector("label span").textContent = part === "ph" ? "Burette reading now / cm³ (records V and pH)" : "Final burette reading / cm³ (records the titre)";
      }

      /* answers per part */
      const acidRows = k => ctx.rows().filter(x => x.set === ACN[k] && typeof x.pH === "number").sort((a, b) => a.V - b.V);
      const VeqOf = k => conc[k]*25/.100;
      Kit.answer(ctx, "Concentration of the acid in the beaker / mol dm⁻³", "e.g. 0.0985", v => {
        const rs = acidRows(acid), Ve = VeqOf(acid);
        if(rs.length < 6 || rs[rs.length - 1].V < Ve + 1) return [false, "Record the pH curve beyond the equivalence point first."];
        if(Math.abs(v - conc[acid]) > .03*conc[acid]) return [false, "Find the equivalence volume (middle of the steep section). c(acid) = 0.100 × V(eq) ÷ 25.0."];
        const steep = rs.filter(x => x.pH > 6 && x.pH < 11).length;
        const full = acid !== "hcl" && rs.length >= 12 && rs[rs.length - 1].V >= Ve + 3 && steep >= 1;
        if(full) ctx.complete("curve");
        return [true, `Correct: V(eq) ≈ ${Ve.toFixed(2)} cm³, so c = 0.100 × ${Ve.toFixed(2)} ÷ 25.0 = ${conc[acid].toFixed(4)} mol dm⁻³.` + (acid === "hcl" ? " Now compare with a weak acid curve." : full ? "" : " For the challenge, record at least 12 points including one in the steep section and go 3 cm³ past the equivalence point.")];
      }, A.ph);
      let pkaOK = null;
      const interp = (rs, V) => { for(let i = 1; i < rs.length; i++) if(rs[i].V >= V && rs[i - 1].V <= V){ const a = rs[i - 1], b = rs[i]; return b.V === a.V ? a.pH : a.pH + (b.pH - a.pH)*(V - a.V)/(b.V - a.V); } return null; };
      Kit.answer(ctx, "pKa (pH at half-neutralisation)", "e.g. 4.76", v => {
        if(acid === "hcl") return [false, "HCl is a strong acid — fully dissociated, so it has no half-neutralisation buffer region. Choose a weak acid."];
        const rs = acidRows(acid), Ve = VeqOf(acid), ip = interp(rs, Ve/2);
        if(ip === null || rs[rs.length - 1].V < Ve + 1) return [false, "Record the curve past the equivalence point so you know V(eq) and V(eq)/2."];
        const pk = acid === "eth" ? 4.76 : UNK[unkI][1];
        if(Math.abs(v - ip) <= .1 || Math.abs(v - pk - cal) <= .1){ pkaOK = { k:acid, v };
          return [true, `Correct: at ${(Ve/2).toFixed(2)} cm³ the pH is ${ip.toFixed(2)}, so pKa ≈ ${v.toFixed(2)}.` + (acid === "unk" ? ` Data-book values: methanoic 3.75, phenylethanoic 4.31, ethanoic 4.76 — FB 2 is ${UNK[unkI][0]}.` : " Now find Ka.")]; }
        return [false, "Find V(eq) from the steep section, halve it, and read the pH at that volume from your graph."];
      }, A.ph);
      Kit.answer(ctx, "Ka = 10^(−pKa) / mol dm⁻³", "e.g. 1.7e-5", v => {
        if(!pkaOK || pkaOK.k !== acid) return [false, "Find pKa for this acid first."];
        const want = Math.pow(10, -pkaOK.v);
        if(Math.abs(v - want) <= .06*want){ ctx.complete("pka"); return [true, `Correct: Ka = 10^(−${pkaOK.v}) = ${want.toExponential(2)} mol dm⁻³.`]; }
        return [false, "Ka = 10 to the power of minus pKa, e.g. 10^(−4.76) = 1.74 × 10⁻⁵."];
      }, A.ph);

      Kit.answer(ctx, "Calculated pH of your buffer (before any additions)", "e.g. 4.76", v => {
        if(bufK === "water") return [false, "Choose one of the buffer mixtures."];
        const [va, vs] = BUF[bufK], want = 4.76 + Math.log10(vs/va);
        if(Math.abs(v - want) <= .03){ bufDone.calc = true; const ok = bufCheck();
          return [true, `Correct: pH = pKa + log([CH₃COO⁻]/[CH₃COOH]) = 4.76 + log(${vs}/${va}) = ${want.toFixed(2)}.` + (ok ? "" : " Now record the pH as you add 1.00 cm³ portions to the buffer and to the water control (three or more readings each).")]; }
        return [false, "Both solutions are 0.100 mol dm⁻³, so the concentration ratio equals the volume ratio. pH = 4.76 + log(V salt ÷ V acid)."];
      }, A.buf);

      Kit.answer(ctx, "Kc for the last bottle you titrated", "e.g. 0.27", v => {
        const rs = ctx.rows().filter(x => x.set === "Kc (ester)"), bl = rs.filter(x => x.blank).pop(), t = rs.filter(x => !x.blank).pop();
        if(!bl || !t) return [false, "Titrate a bottle and the blank (HCl alone)."];
        const x = (t.titre - bl.titre)*1.00/1000, b = BOT[t.bot], nE = nEst(b.e) - x, nW = nWat(b.w) - x;
        if(x <= 0 || nE <= 0) return [false, "Your titres give no ester hydrolysed — check the titres."];
        const want = x*x/(nE*nW);
        if(Math.abs(v - want) <= .05*want){
          if(t.days < 7) return [false, `Your arithmetic is right (${want.toFixed(3)}), but after 1 day the mixture is not at equilibrium yet. Titrate a bottle left for a week or more.`];
          ctx.complete("kc"); return [true, `Correct: n(acid formed) = (${t.titre.toFixed(2)} − ${bl.titre.toFixed(2)}) × 1.00 ÷ 1000 = ${x.toFixed(4)} mol = n(ethanol). Kc = ${want.toFixed(3)} (no units). Hidden value: ${Kc.toFixed(3)}.`]; }
        return [false, "n(CH₃COOH) = n(C₂H₅OH) = (titre − blank)/1000. n(ester) = initial − that; n(water) = initial (including the 4.79 g in the acid) − that. Kc = (n acid × n ethanol)/(n ester × n water)."];
      }, A.kc);

      Kit.answer(ctx, "Kpc = [NH₃ in water] / [NH₃ in CHCl₃]", "e.g. 25", v => {
        const rs = ctx.rows().filter(x => x.set === "Kpc (ammonia)"), a = rs.filter(x => x.layer === "aq").pop(), o = rs.filter(x => x.layer === "org" && a && x.start === a.start).pop();
        if(!a || !o) return [false, "Titrate both layers from the same starting concentration."];
        const ca = a.titre*.500/10.0, co = o.titre*.0200/10.0, want = ca/co;
        if(Math.abs(v - want) <= .05*want){ ctx.complete("kpc"); return [true, `Correct: [NH₃(aq)] = ${ca.toFixed(3)}, [NH₃(CHCl₃)] = ${co.toFixed(4)} mol dm⁻³, Kpc = ${want.toFixed(1)}. Repeat with the other starting concentration — Kpc stays the same.`]; }
        return [false, "c(aqueous) = titre × 0.500 ÷ 10.0; c(organic) = titre × 0.0200 ÷ 10.0 (NH₃ + HCl → NH₄Cl, 1 : 1). Kpc = c(aqueous) ÷ c(organic)."];
      }, A.kpc);

      Kit.answer(ctx, "Ksp of Ca(OH)₂ / mol³ dm⁻⁹", "e.g. 3.4e-5", v => {
        const t = ctx.rows().filter(x => x.set === "Ksp Ca(OH)₂").pop();
        if(!t) return [false, "Titrate the saturated solution first."];
        const oh = t.titre*.0500/25.0, ca = oh/2, want = ca*oh*oh;
        if(Math.abs(v - want) <= .06*want){
          if(t.filt === "no") return [false, `Arithmetic right (${want.toExponential(2)}), but the solution was not filtered: suspended Ca(OH)₂ dissolved during the titration, so the titre and Ksp are too high. Filter and repeat.`];
          ctx.complete("ksp"); return [true, `Correct: [OH⁻] = ${oh.toFixed(4)}, [Ca²⁺] = ${ca.toFixed(4)} mol dm⁻³, Ksp = [Ca²⁺][OH⁻]² = ${want.toExponential(2)} mol³ dm⁻⁹.`]; }
        return [false, "[OH⁻] = titre × 0.0500 ÷ 25.0. [Ca²⁺] = ½[OH⁻]. Ksp = [Ca²⁺][OH⁻]²."];
      }, A.ksp);

      /* Paper 5 planning */
      const plan = group(ctx, "Paper 5 planning and evaluation");
      quiz(ctx, [
        { q:"Indicator for titrating ethanoic acid with NaOH:", o:["Methyl orange (3.1–4.4)", "Phenolphthalein (8.3–10.0)", "Either works equally well", "No indicator can be used"], a:1, why:"Yes: the steep section for a weak acid–strong base titration is about pH 7–11." },
        { q:"Before recording pH values, the pH meter should be…", o:["calibrated with buffer solutions of known pH, e.g. 4.00 and 7.00", "rinsed with the NaOH solution", "warmed in a water bath", "zeroed in air"], a:0, why:"Correct: then rinse the probe with distilled water between solutions." },
        { q:"At half-neutralisation of a weak acid, the pH equals…", o:["7.00", "½ pKw", "pKa", "pKa + 1"], a:2, why:"Right: [HA] = [A⁻], so Ka = [H⁺]." },
        { q:"Near the equivalence point you should add the NaOH in…", o:["larger portions to save time", "small portions (about 0.10–0.20 cm³)", "one large portion", "5 cm³ portions"], a:1, why:"Yes: the pH changes rapidly there, so small additions locate V(eq) precisely." },
        { q:"In the Kc experiment, why titrate 5.00 cm³ of the HCl alone?", o:["To standardise the NaOH", "To find Kc for HCl", "The HCl catalyst also reacts with NaOH, so its titre must be subtracted", "To check the indicator"], a:2, why:"Correct: the acid formed by hydrolysis = total titre − blank titre." },
        { q:"Why are the ester bottles stoppered and left for a week?", o:["So the HCl is used up", "To reach equilibrium, and stop volatile ester and ethanol evaporating", "To let the ester crystallise", "To keep the mixture warm"], a:1, why:"Right: check equilibrium by titrating again later — the titre should not change." },
        { q:"Shaking trichloromethane and ammonia in a separating funnel, you must…", o:["heat it gently", "invert and open the tap often to release pressure; fume hood and gloves", "leave the stopper out", "use a naked flame to warm it"], a:1, why:"Yes: vapour builds up pressure; CHCl₃ is harmful and ammonia is an irritant." },
        { q:"The control for the buffer test is…", o:["the same additions to the same volume of distilled water", "no additions at all", "a different buffer", "tap water with indicator"], a:0, why:"Correct: it shows the small pH change is due to the buffer, not to the small volume added." }
      ], () => ctx.complete("plan"), plan);

      S.show(part); A.show(part); relabel(); draw();
    }
  });
})();
