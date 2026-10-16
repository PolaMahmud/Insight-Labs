"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · AS LEVEL (9702 Paper 3) — part 1
   Spring–mass oscillations · Young modulus · EMF & internal resistance ·
   Projectile from a ramp
══════════════════════════════════════════════════════════════════ */

/* ───────────── SPRING–MASS OSCILLATIONS ───────────── */
Lab.register({
  id:"springmass", subject:"physics", level:["as"], topic:"Oscillations · SHM", interactive:true,
  title:"Mass–spring oscillations",
  summary:"Load a spring, pull it down and release. Time 10 oscillations twice per mass, plot T² against m with error bars and find k.",
  aim:"Determine the spring constant k by investigating how the period of a mass–spring system depends on the mass.",
  variables:{ iv:"Mass m on the spring (kg)", dv:"Period T (s), from 10 oscillations, repeated", cv:["Same spring","Small amplitude","Timing from the equilibrium (fiducial) position"] },
  stageTitle:"Oscillating spring", controlsTitle:"Timing",
  thumb:`<svg viewBox="0 0 300 140"><path d="M150 10 v10 l-12 5 l24 8 l-24 8 l24 8 l-24 8 l24 8 l-12 5 v8" fill="none" stroke="#4DA3FF" stroke-width="2.5"/><rect x="134" y="84" width="32" height="30" rx="4" fill="#94A3B8"/><line x1="100" y1="99" x2="200" y2="99" stroke="#FF5C7A" stroke-dasharray="4 3"/></svg>`,
  challenges:[
    { id:"six", title:"Six masses", text:"Record T for six different masses (two timings each)." },
    { id:"k",   title:"Spring constant", text:"Use the gradient of T² against m to find k." },
    { id:"sw",  title:"Reaction time", text:"Time with your stopwatch at least once and compare with the light gate." }
  ],
  columns:[{key:"m",label:"m / kg",dp:3},{key:"t1",label:"10T₁ / s",dp:2},{key:"t2",label:"10T₂ / s",dp:2},{key:"T",label:"T / s",dp:3},{key:"T2",label:"T² / s²",dp:3},{key:"dT2",label:"Δ(T²) / s²",dp:3},{key:"how",label:"Timing"}],
  graph:{ x:["m"], y:["T2","T"], yErr:{ T2:"dT2" }, fit:"linear" },
  questions:[
    { q:"Show that T² against m should give a straight line.",
      a:"T = 2π√(m/k), so T² = (4π²/k)m — a straight line through the origin with gradient 4π²/k. So k = 4π² ÷ gradient." },
    { q:"Why might the line not pass through the origin?",
      a:"The spring itself (and the hanger) has mass that also oscillates. This adds an effective mass, giving a positive intercept on the T² axis." },
    { q:"Why time from the equilibrium position rather than the top or bottom?",
      a:"The mass moves fastest there, so the moment it passes the marker is most precisely defined; at the turning points it is momentarily at rest." },
    { q:"How is the uncertainty in T² found?",
      a:"ΔT is half the range of the repeated 10T values divided by 10 (at least the reaction-time uncertainty ÷ 10). Then Δ(T²) = 2T·ΔT, because the percentage uncertainty doubles when squaring." }
  ],
  setup(ctx){
    const k = Kit.round(18 + Math.random()*12, 1), MS = .025, PXM = 600, TOP = 50, L0 = 110;
    let m = .2, how = "gate", A = 0, t = 0, osc = false, trials = [], gateT = null, passes = 0, lastSign = 0, swStart = null;
    const sw = Kit.stopwatch("sm-sw", 740, 300);
    const omega = () => Math.sqrt(k/(m + MS)), yEq = () => TOP + L0 + m*9.81/k*PXM*.25;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="sm-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 480)}
      <rect x="300" y="20" width="10" height="460" fill="url(#k-metal)"/><rect x="300" y="${TOP - 12}" width="140" height="10" fill="url(#k-metal)"/><rect x="260" y="472" width="100" height="10" fill="url(#k-metal)"/>
      <g id="sm-scene"></g>${sw.svg}
      <g transform="translate(740 140)"><rect width="168" height="110" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="12" y="22" style="font:700 9px Inter;fill:#9CA3AF">LIGHT GATE · 10 oscillations</text>
        <text x="156" y="62" text-anchor="end" class="k-lcd" id="sm-gate">—</text><text x="12" y="94" style="font:600 11px Inter;fill:#E5E7EB" id="sm-pass">passes: 0</text></g>
      <text x="24" y="34" class="k-status" id="sm-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#sm-svg"), $ = s => svg.querySelector(s);
    sw.bind(svg, s => { if(s.running){ swStart = passes; } });
    function draw(){
      const y = yEq() + A*Math.exp(-.03*t)*Math.cos(omega()*t);
      let d = `M430 ${TOP - 2} V${TOP + 8}`; const n = 16, h = (y - 10 - TOP - 8)/n;
      for(let i = 0; i < n; i++) d += ` L${i % 2 ? 418 : 442} ${TOP + 8 + h*(i + .5)}`;
      d += ` L430 ${y - 10} V${y}`;
      let s = `<path d="${d}" fill="none" stroke="#4DA3FF" stroke-width="2.2"/>`;
      const discs = Math.round((m - .1)/.05);
      s += `<g id="sm-mass" class="k-drag"><line x1="430" y1="${y}" x2="430" y2="${y + 14}" stroke="#94A3B8" stroke-width="2"/><rect x="410" y="${y + 14}" width="40" height="8" rx="2" fill="url(#k-metal)"/>`;
      for(let i = 0; i < discs; i++) s += `<rect x="408" y="${y + 22 + i*7}" width="44" height="6" rx="2" fill="url(#k-metal)" stroke="#475569" stroke-width=".5"/>`;
      s += `<rect x="395" y="${y}" width="70" height="${40 + discs*7}" fill="transparent"/></g>`;
      s += `<line x1="360" y1="${yEq() + 18}" x2="500" y2="${yEq() + 18}" stroke="#FF5C7A" stroke-dasharray="5 4"/><text x="506" y="${yEq() + 22}" class="k-lbl" style="fill:#FF5C7A">fiducial marker</text>`;
      $("#sm-scene").innerHTML = s;
      $("#sm-pass").textContent = `passes: ${passes}${swStart !== null && sw.running ? ` (since start: ${Math.floor((passes - swStart)/1)})` : ""}`;
      $("#sm-gate").textContent = gateT ? gateT.toFixed(3) + " s" : osc ? "timing…" : "—";
      $("#sm-status").textContent = !osc ? "Drag the mass down a little and let go" : trials.length ? `Trial ${trials.length} recorded — repeat for a second timing` : "Oscillating — time 10 oscillations";
      ctx.readout([["Mass", (m*1000).toFixed(0) + " g"], ["Trials at this mass", trials.length + " of 2"], ["Timing", how === "gate" ? "light gate" : "your stopwatch"]]);
    }
    let gateStart = null, gateCount = 0;
    ctx.frame(dt => {
      sw.tick(dt);
      if(osc){
        t += dt;
        const sgn = Math.sign(Math.cos(omega()*t));
        if(lastSign && sgn !== lastSign && Math.sin(omega()*t) > 0){                 // passing equilibrium moving down
          passes++;
          if(gateStart === null){ gateStart = t; gateCount = 0; } else { gateCount++; if(gateCount === 10 && !gateT){ gateT = (t - gateStart) + (Math.random() - .5)*.004; } }
        }
        lastSign = sgn;
      }
      draw();
    });
    Kit.dragger(ctx, svg, {
      hit(tg, p){ if(!tg.closest("#sm-mass")) return null; osc = false; t = 0; A = 0; return { y0:p.y }; },
      move(h, p){ A = Kit.clamp(p.y - h.y0, 0, 45); },
      end(){ if(A > 4){ osc = true; t = 0; passes = 0; lastSign = 0; gateStart = null; gateT = null; } else A = 0; }
    });
    ctx.seg({ label:"Mass on the spring", value:.2, options:[[.1,"100 g"],[.15,"150"],[.2,"200"],[.25,"250"],[.3,"300"],[.35,"350"],[.4,"400"],[.45,"450"],[.5,"500"]], onChange(v){ m = v; trials = []; osc = false; A = 0; gateT = null; } });
    ctx.seg({ label:"Timing method", value:"gate", options:[["gate","Light gate"],["sw","My stopwatch"]], onChange(v){ how = v; } });
    ctx.buttons([{ label:"Record 10T (one trial)", primary:true, block:true, onClick(){
      let t10;
      if(how === "gate"){ if(!gateT) return ctx.toast("Let it complete 10 oscillations through the light gate"); t10 = gateT; }
      else { if(sw.running || sw.t <= 0) return ctx.toast("Start and stop your stopwatch over 10 oscillations"); t10 = sw.t; ctx.complete("sw"); }
      trials.push(Kit.round(t10, 2)); sw.reset();
      if(trials.length === 2){
        const Tm = Kit.mean(trials)/10, dT = Math.max(Kit.halfRange(trials), how === "gate" ? .01 : .1)/10;
        ctx.record({ m, t1:trials[0], t2:trials[1], T:Kit.round(Tm, 3), T2:Kit.round(Tm*Tm, 3), dT2:Kit.round(2*Tm*dT, 3), how: how === "gate" ? "light gate" : "stopwatch" });
        trials = [];
        if(new Set(ctx.rows().map(r => r.m)).size >= 6) ctx.complete("six");
      }else ctx.toast(`Trial 1: ${t10.toFixed(2)} s — now repeat`);
      osc = false; A = 0; gateT = null;
    } }]);
    Kit.answer(ctx, "Spring constant k / N m⁻¹", "e.g. 24", v => {
      const pts = ctx.rows().map(r => [r.m, r.T2]); if(new Set(pts.map(p => p[0])).size < 4) return [false, "Record at least four masses first."];
      const f = ctx.linFit(pts), kk = 4*Math.PI*Math.PI/f.m;
      if(Math.abs(v - kk)/kk <= .03){ ctx.complete("k"); return [true, `Correct from your gradient: k = 4π² ÷ ${f.m.toFixed(3)} = ${kk.toFixed(1)} N/m (hidden value ${k} N/m).`]; }
      return [false, "k = 4π² ÷ gradient of T² against m (m in kg)."];
    });
    draw();
  }
});

/* ───────────── YOUNG MODULUS ───────────── */
Lab.register({
  id:"youngmodulus", subject:"physics", level:["as"], topic:"Materials · Young modulus", interactive:true,
  title:"Young modulus of a copper wire",
  summary:"Load a long wire over a pulley, read a marker against a millimetre scale through a magnifier, and find the Young modulus — then unload it.",
  aim:"Determine the Young modulus of copper by measuring the extension of a long wire under increasing load.",
  variables:{ iv:"Load F (N)", dv:"Extension x (mm)", cv:["Same wire, original length L = 2.000 m","Dead load kept on to straighten the wire","Diameter measured with a micrometer"] },
  stageTitle:"Wire over a pulley", controlsTitle:"Loading",
  thumb:`<svg viewBox="0 0 300 140"><line x1="20" y1="50" x2="250" y2="50" stroke="#D97706" stroke-width="2"/><circle cx="256" cy="56" r="10" fill="none" stroke="#A2ACBD" stroke-width="3"/><line x1="266" y1="56" x2="266" y2="100" stroke="#D97706" stroke-width="2"/><rect x="254" y="100" width="24" height="26" fill="#94A3B8"/><rect x="200" y="44" width="6" height="12" fill="#FF5C7A"/></svg>`,
  challenges:[
    { id:"load",   title:"Load the wire", text:"Record at least six loads." },
    { id:"E",      title:"Young modulus", text:"Find E from the gradient of F against x." },
    { id:"unload", title:"Unload", text:"Record readings while unloading. Do they retrace the loading line?" }
  ],
  columns:[{key:"dir",label:"Loading / unloading"},{key:"m",label:"Added mass / kg",dp:1},{key:"F",label:"F / N",dp:2},{key:"R",label:"Scale reading / mm",dp:1},{key:"x",label:"x / mm",dp:1}],
  series:"dir",
  graph:{ x:["x"], y:["F"], fit:"linear" },
  questions:[
    { q:"Write an expression for the Young modulus.",
      a:"E = stress ÷ strain = (F/A) ÷ (x/L) = FL ÷ (Ax). So E = gradient (F/x) × L/A." },
    { q:"Why is a long, thin wire used?",
      a:"For a given load, extension is proportional to L/A, so a long thin wire gives an extension large enough to measure accurately." },
    { q:"Why is the diameter measured at several places with a micrometer?",
      a:"The wire may not be uniform. The diameter has the largest percentage uncertainty and is squared in A = πd²/4, so averaging several readings is important." },
    { q:"What does it mean if the unloading readings do not return to zero?",
      a:"The wire has been loaded beyond its elastic limit and has a permanent (plastic) extension." }
  ],
  setup(ctx){
    const E = Kit.round((1.15 + Math.random()*.1)*1e11, -8), L = 2.000, D = .274e-3, A = Math.PI*D*D/4, R0 = Kit.round(10 + Math.random()*5, 1);
    const MIC = [0.27, 0.28, 0.27, 0.28, 0.27];
    let mAdd = 0, maxF = 0, dir = "loading";
    const Fe = 14;
    const ext = F => F*L/(A*E)*1000 + .12*Math.pow(Math.max(0, maxF - Fe), 2);   // elastic + permanent (plastic) part
    const reading = () => R0 + ext(mAdd*9.81);
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="ym-svg"><defs>${Kit.DEFS}<clipPath id="ym-clip"><circle r="80"/></clipPath></defs>${Kit.bench(960, 480)}<g id="ym-scene"></g><text x="24" y="34" class="k-status" id="ym-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ym-svg"), $ = s => svg.querySelector(s);
    function draw(){
      const R = reading(), mx = 720 + (R - 12)*3;
      let s = `<rect x="40" y="150" width="40" height="80" fill="url(#k-metal)"/><rect x="60" y="230" width="20" height="250" fill="url(#k-metal)"/>
        <line x1="80" y1="190" x2="860" y2="190" stroke="#D97706" stroke-width="1.6"/><text x="300" y="180" class="k-lbl">copper wire, L = 2.000 m (drawn shorter)</text>
        <circle cx="870" cy="200" r="12" fill="none" stroke="url(#k-metalv)" stroke-width="6"/><rect x="866" y="200" width="8" height="280" fill="url(#k-metal)" opacity=".5"/>
        <line x1="882" y1="200" x2="882" y2="300" stroke="#D97706" stroke-width="1.6"/>
        <rect x="868" y="300" width="28" height="10" rx="2" fill="url(#k-metal)"/><text x="908" y="308" class="k-tag">1 kg dead load</text>`;
      const discs = Math.round(mAdd/.2);
      for(let i = 0; i < discs; i++) s += `<rect x="864" y="${312 + i*8}" width="36" height="7" rx="2" fill="url(#k-metal)" stroke="#475569" stroke-width=".5"/>`;
      s += `<rect x="620" y="196" width="220" height="16" fill="url(#k-wood)" stroke="#7B4F2C"/>`;
      s += `<rect x="${mx - 3}" y="182" width="6" height="16" fill="#FF5C7A"/><text x="${mx}" y="176" text-anchor="middle" class="k-lbl" style="fill:#FF5C7A">marker</text>`;
      // magnifier showing the millimetre scale under the marker
      const cx = 560, cy = 340, S = 22;
      let z = `<rect x="-80" y="-80" width="160" height="160" fill="#F1E3C8"/>`;
      for(let mm = Math.floor(R - 4); mm <= Math.ceil(R + 4); mm++){ const x = (mm - R)*S; z += `<line x1="${x}" y1="10" x2="${x}" y2="${mm % 10 === 0 ? -26 : mm % 5 === 0 ? -16 : -8}" stroke="#4B3621" stroke-width="1.3"/>`; if(mm % 5 === 0) z += `<text x="${x}" y="-32" text-anchor="middle" style="font:600 12px 'JetBrains Mono';fill:#4B3621">${mm}</text>`; }
      z += `<rect x="-5" y="-60" width="10" height="70" fill="#FF5C7A" opacity=".9"/><line x1="0" y1="-60" x2="0" y2="14" stroke="#7F1D1D" stroke-width="1.2"/><text y="44" text-anchor="middle" style="font:600 11px Inter;fill:#4B3621">mm scale</text>`;
      s += `<line x1="${cx + 60}" y1="${cy - 60}" x2="${mx}" y2="205" stroke="var(--accent)" stroke-dasharray="3 3"/><g transform="translate(${cx} ${cy})"><circle r="82" fill="none" stroke="var(--accent)" stroke-width="3"/><g clip-path="url(#ym-clip)">${z}</g></g>`;
      s += `<g transform="translate(110 300)"><rect width="250" height="130" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="14" y="24" class="k-tag">Micrometer readings of diameter / mm</text>
        <text x="14" y="52" style="font:600 13px 'JetBrains Mono';fill:var(--txt)">${MIC.map(v => v.toFixed(2)).join("  ")}</text><text x="14" y="82" class="k-lbl">zero error: 0.00 mm</text><text x="14" y="108" class="k-lbl">L = 2.000 m (tape measure, ±1 mm)</text></g>`;
      $("#ym-scene").innerHTML = s;
      $("#ym-status").textContent = maxF > Fe && mAdd*9.81 < maxF ? "Unloading — the wire has a permanent extension" : maxF > Fe ? "Past the elastic limit — the extension grows faster" : `Added load ${(mAdd*9.81).toFixed(2)} N`;
      ctx.readout([["Added mass", mAdd.toFixed(1) + " kg"], ["Load", (mAdd*9.81).toFixed(2) + " N"], ["Direction", dir]]);
    }
    ctx.buttons([{ label:"+ 0.2 kg", onClick(){ if(mAdd >= 2.4) return; mAdd = Kit.round(mAdd + .2, 1); dir = "loading"; maxF = Math.max(maxF, mAdd*9.81); rb.clear(); draw(); } },
      { label:"− 0.2 kg", onClick(){ if(mAdd <= 0) return; mAdd = Kit.round(mAdd - .2, 1); dir = "unloading"; rb.clear(); draw(); } }]);
    const rb = Kit.reading(ctx, "Marker reading / mm (estimate to 0.1 mm)", "e.g. 13.4", () => reading(), .25, v => {
      const zero = ctx.rows().find(r => r.m === 0 && r.dir === "Loading");
      const R0read = zero ? zero.R : (mAdd === 0 ? v : null);
      if(R0read === null) return ctx.toast("Take the zero-load reading first");
      ctx.record({ dir: dir === "loading" ? "Loading" : "Unloading", m:mAdd, F:Kit.round(mAdd*9.81, 2), R:Kit.round(v, 1), x:Kit.round(v - R0read, 1) });
      rb.clear();
      if(ctx.rows().filter(r => r.dir === "Loading").length >= 6) ctx.complete("load");
      if(ctx.rows().filter(r => r.dir === "Unloading").length >= 3) ctx.complete("unload");
    });
    Kit.answer(ctx, "Young modulus E / 10¹¹ Pa", "e.g. 1.2", v => {
      const pts = ctx.rows().filter(r => r.dir === "Loading" && r.F <= Fe && r.x > 0).map(r => [r.x, r.F]);
      if(pts.length < 4) return [false, "Record at least four loads in the straight (elastic) region."];
      const f = ctx.linFit(pts), d = Kit.mean(MIC)*1e-3, EE = f.m*1000*L/(Math.PI*d*d/4)/1e11;
      if(Math.abs(v - EE)/EE <= .04){ ctx.complete("E"); return [true, `Correct from your data: E = ${(f.m*1000).toFixed(0)} N/m × ${L} m ÷ ${(Math.PI*d*d/4*1e8).toFixed(2)}×10⁻⁸ m² = ${EE.toFixed(2)}×10¹¹ Pa (hidden ${(E/1e11).toFixed(2)}).`]; }
      return [false, "E = gradient × L ÷ A. Convert the gradient from N/mm to N/m (× 1000) and use the mean diameter in A = πd²/4."];
    });
    draw();
  }
});

/* ───────────── EMF & INTERNAL RESISTANCE ───────────── */
Lab.register({
  id:"internalr", subject:"physics", level:["as"], topic:"D.C. circuits · Internal resistance", interactive:true,
  title:"EMF and internal resistance of a cell",
  summary:"Slide the rheostat contact, read the terminal p.d. and current, and use the V–I graph to find the cell’s e.m.f. and internal resistance.",
  aim:"Determine the e.m.f. E and internal resistance r of a cell from a graph of terminal p.d. against current.",
  variables:{ iv:"Current I (A), changed with the rheostat", dv:"Terminal p.d. V (V)", cv:["Same cell","Switch off between readings so the cell doesn’t run down","Same meters"] },
  stageTitle:"Circuit", controlsTitle:"Readings",
  thumb:`<svg viewBox="0 0 300 140"><path d="M40 30 L260 120" stroke="#4DA3FF" stroke-width="3"/>${[50,90,130,170,210,250].map((x,i)=>`<path d="M${x-4} ${34+i*17.6} l8 8 m0 -8 l-8 8" stroke="#E9EDF5" stroke-width="2"/>`).join("")}</svg>`,
  challenges:[
    { id:"six",  title:"Six readings", text:"Record V and I for six or more rheostat settings." },
    { id:"Er",   title:"E and r", text:"Find both the e.m.f. and the internal resistance from your graph." },
    { id:"care", title:"Look after the cell", text:"Leave the switch on for a long time and notice the e.m.f. falling." }
  ],
  columns:[{key:"R",label:"Rheostat / Ω",dp:1},{key:"I",label:"I / A",dp:3},{key:"V",label:"V / V",dp:3}],
  graph:{ x:["I"], y:["V"], fit:"linear" },
  questions:[
    { q:"Why does the terminal p.d. fall as the current increases?",
      a:"Some of the e.m.f. is ‘lost’ across the internal resistance: V = E − Ir. More current means a larger lost volts Ir." },
    { q:"How do you get E and r from the graph of V against I?",
      a:"V = −rI + E is a straight line: the y-intercept is E and the gradient is −r." },
    { q:"Why should the switch be opened between readings?",
      a:"A large current drains the cell and heats it, changing E and r during the experiment." },
    { q:"What is the maximum current the cell can supply?",
      a:"When R = 0 (short circuit), I = E/r — the x-intercept of the graph. Never actually short a cell." }
  ],
  setup(ctx){
    let E0 = Kit.round(1.52 + Math.random()*.08, 3), Ecur = E0;
    const r = Kit.round(.55 + Math.random()*.9, 2), RA = .1;
    let R = 8, on = false, onTime = 0;
    const I = () => on ? Ecur/(R + r + RA) : 0, V = () => on ? Ecur - I()*r : Ecur;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="ir-svg2"><defs>${Kit.DEFS}</defs><g id="ir-scene"></g><text x="24" y="34" class="k-status" id="ir-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ir-svg2"), $ = s => svg.querySelector(s);
    const RX0 = 380, RX1 = 780;
    function draw(){
      const cx = RX0 + (R - .5)/19.5*(RX1 - RX0);
      let s = `<path d="M150 110 H330 M430 110 H560 M640 110 H850 V420 H${cx} M150 110 V420 H${RX0}" stroke="var(--txt)" stroke-width="2.4" fill="none"/>`;
      s += `<g transform="translate(150 260)"><rect x="-34" y="-20" width="68" height="40" fill="var(--bg2)"/><line x1="-14" y1="-8" x2="14" y2="-8" stroke="var(--txt)" stroke-width="5"/><line x1="-26" y1="8" x2="26" y2="8" stroke="var(--txt)" stroke-width="2.5"/>
        <rect x="-52" y="-46" width="104" height="92" rx="10" fill="none" stroke="var(--txt3)" stroke-dasharray="5 4"/><text x="62" y="-30" class="k-lbl">cell (E, r)</text><text x="34" y="14" style="font:700 12px Inter;fill:var(--hi)">+</text></g>`;
      s += `<g id="ir-sw" class="k-btn" transform="translate(380 110)"><circle cx="-50" r="5" fill="var(--txt)"/><circle cx="50" r="5" fill="var(--txt)"/><line x1="-50" y1="0" x2="${on ? 50 : 40}" y2="${on ? 0 : -30}" stroke="${on ? "var(--sec)" : "var(--hi)"}" stroke-width="4" stroke-linecap="round"/><rect x="-60" y="-44" width="120" height="60" fill="transparent"/><text y="34" text-anchor="middle" class="k-hint">click switch</text></g>`;
      s += `<g transform="translate(600 110)"><circle r="40" fill="var(--bg-card)" stroke="var(--txt)" stroke-width="2.4"/><text y="-8" text-anchor="middle" style="font:800 13px Inter;fill:var(--txt)">A</text><text y="16" text-anchor="middle" class="k-numb">${I().toFixed(3)}</text></g>`;
      s += `<rect x="${RX0}" y="400" width="${RX1 - RX0}" height="40" rx="6" fill="url(#k-metal)" stroke="#475569"/>`;
      for(let k = 0; k < 40; k++) s += `<line x1="${RX0 + 6 + k*10}" y1="402" x2="${RX0 + 6 + k*10}" y2="438" stroke="#7C2D12" stroke-width="2"/>`;
      s += `<g id="ir-slider" class="k-drag" transform="translate(${cx} 400)"><rect x="-12" y="-34" width="24" height="30" rx="5" fill="#1F2937"/><path d="M0 -4 L-8 4 H8 Z" fill="#1F2937"/><rect x="-24" y="-44" width="48" height="60" fill="transparent"/></g>`;
      s += `<text x="${(RX0 + RX1)/2}" y="466" text-anchor="middle" class="k-lbl">rheostat — drag the sliding contact (${R.toFixed(1)} Ω in circuit)</text>`;
      s += `<path d="M110 260 H60 V40 H230 M270 40 H310 V110" stroke="var(--txt)" stroke-width="2" fill="none"/><g transform="translate(250 40)"><circle r="26" fill="var(--bg-card)" stroke="var(--txt)" stroke-width="2"/><text y="-4" text-anchor="middle" style="font:800 12px Inter;fill:var(--txt)">V</text><text y="14" text-anchor="middle" class="k-numb" style="font-size:11px">${V().toFixed(3)}</text></g>`;
      $("#ir-scene").innerHTML = s;
      $("#ir-status").textContent = on ? `Switch closed — current flowing (${onTime.toFixed(0)} s)` : "Switch open — close it to take a reading, then open it again";
      ctx.readout([["Rheostat", R.toFixed(1) + " Ω"], ["Ammeter", I().toFixed(3) + " A"], ["Voltmeter", V().toFixed(3) + " V"], ["Switch", on ? "closed" : "open", on && onTime > 30 ? "warn" : ""]]);
    }
    ctx.frame(dt => {
      if(on){ onTime += dt; Ecur -= .0009*I()*dt; if(Ecur < E0 - .02) ctx.complete("care"); }
      else Ecur += (E0 - Ecur)*.02*dt;
      draw();
    });
    Kit.dragger(ctx, svg, {
      hit(tg){ if(tg.closest("#ir-sw")){ on = !on; if(on) onTime = 0; return null; } return tg.closest("#ir-slider") ? "s" : null; },
      move(k, p){ R = Kit.round(Kit.clamp(.5 + (p.x - RX0)/(RX1 - RX0)*19.5, .5, 20), 1); }
    });
    ctx.buttons([{ label:"Record V and I", primary:true, block:true, onClick(){
      if(!on) return ctx.toast("Close the switch to take a reading");
      ctx.record({ R, I:Kit.round(I()*(1 + .001*ctx.gauss()), 3), V:Kit.round(V()*(1 + .0005*ctx.gauss()), 3) });
      if(ctx.rows().length >= 6) ctx.complete("six");
    } }]);
    let gotE = false, gotR = false;
    const check = () => { if(gotE && gotR) ctx.complete("Er"); };
    Kit.answer(ctx, "E.m.f. E / V", "e.g. 1.55", v => {
      const pts = ctx.rows().map(x => [x.I, x.V]); if(pts.length < 4) return [false, "Record at least four readings."];
      const f = ctx.linFit(pts); if(Math.abs(v - f.c)/f.c <= .02){ gotE = true; check(); return [true, `Correct — the y-intercept is ${f.c.toFixed(3)} V.`]; } return [false, "E is the y-intercept of V against I."];
    });
    Kit.answer(ctx, "Internal resistance r / Ω", "e.g. 0.9", v => {
      const pts = ctx.rows().map(x => [x.I, x.V]); if(pts.length < 4) return [false, "Record at least four readings."];
      const f = ctx.linFit(pts); if(Math.abs(v + f.m)/Math.abs(f.m) <= .06){ gotR = true; check(); return [true, `Correct — gradient ${f.m.toFixed(3)} V/A, so r = ${(-f.m).toFixed(2)} Ω (hidden ${r} Ω).`]; } return [false, "r = − gradient of V against I."];
    });
    draw();
  }
});

/* ───────────── PROJECTILE FROM A RAMP ───────────── */
Lab.register({
  id:"projectile", subject:"physics", level:["as"], topic:"Kinematics · Projectiles", interactive:true,
  title:"Ball launched from a ramp",
  summary:"Release a ball from different heights on a curved ramp at the edge of a bench. Measure where it lands (three repeats), plot R² against h.",
  aim:"Investigate how the horizontal distance R travelled by a ball leaving a ramp depends on its release height h.",
  variables:{ iv:"Release height h above the end of the ramp (m)", dv:"Horizontal range R on the floor (m) — mean of three", cv:["Same ball and ramp","Same bench height H","Ball released from rest, not pushed"] },
  stageTitle:"Ramp at the edge of a bench", controlsTitle:"Launch",
  thumb:`<svg viewBox="0 0 300 140"><path d="M40 20 Q60 80 120 80" fill="none" stroke="#D9B07A" stroke-width="5"/><rect x="30" y="80" width="92" height="8" fill="#A97B47"/><path d="M120 80 Q190 82 240 126" fill="none" stroke="#FBBF24" stroke-dasharray="4 4"/><circle cx="240" cy="126" r="5" fill="#334155"/></svg>`,
  challenges:[
    { id:"five", title:"Five heights", text:"Record R (three repeats each) for five release heights." },
    { id:"H",    title:"Bench height from the graph", text:"Use the gradient of R² against h to find H." }
  ],
  columns:[{key:"h",label:"h / m",dp:3},{key:"r1",label:"R₁ / m",dp:3},{key:"r2",label:"R₂ / m",dp:3},{key:"r3",label:"R₃ / m",dp:3},{key:"R",label:"R / m",dp:3},{key:"R2",label:"R² / m²",dp:4},{key:"dR2",label:"Δ(R²) / m²",dp:4}],
  graph:{ x:["h"], y:["R2","R"], yErr:{ R2:"dR2" }, fit:"linear" },
  questions:[
    { q:"Show that R² should be proportional to h.",
      a:"Energy: the speed leaving the ramp v² ∝ h. Time of flight t = √(2H/g) is constant. R = vt, so R² = v²t² ∝ h. For a rolling solid ball v² = (10/7)gh, giving R² = (20/7)Hh." },
    { q:"Why is the ball released rather than pushed?",
      a:"It must start from rest so that its speed at the bottom depends only on h." },
    { q:"How can the landing position be found precisely?",
      a:"Put carbon paper on white paper so the ball leaves a mark. Measure from a plumb line below the end of the ramp." },
    { q:"Why are three readings taken for each height?",
      a:"The ball doesn’t land in exactly the same place each time (random error). The mean reduces the effect, and the spread gives the uncertainty." }
  ],
  setup(ctx){
    const H = Kit.round(.78 + Math.random()*.1, 3), G = 9.81;
    let h = .10, ball = null, marks = [], tries = [], lens = null;
    const PXM_R = 380, FX = 330, FLOOR = 470, PXM_H = (FLOOR - 250)/H;     // floor scale 380 px/m from the plumb line
    const rangeFor = hh => Math.sqrt(10/7*G*hh*(1 - .02 - .04*Math.random()))*Math.sqrt(2*H/G);
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="pj-svg"><defs>${Kit.DEFS}<clipPath id="pj-lc"><circle r="70"/></clipPath></defs><g id="pj-scene"></g><text x="24" y="34" class="k-status" id="pj-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#pj-svg"), $ = s => svg.querySelector(s);
    const rampPt = hh => { const a = Math.min(1, hh/.25); return [FX - 170*Math.pow(a, .7), 250 - hh*800]; };
    function draw(){
      let s = `<rect x="0" y="${FLOOR}" width="960" height="70" fill="color-mix(in srgb,var(--bg-card) 85%,#5a4630 15%)"/>
        <rect x="60" y="250" width="${FX - 60}" height="14" fill="url(#k-wood)"/><rect x="70" y="264" width="12" height="${FLOOR - 264}" fill="#7B4F2C"/><rect x="${FX - 24}" y="264" width="12" height="${FLOOR - 264}" fill="#7B4F2C"/>
        <path d="M${FX - 170} 50 Q${FX - 160} 250 ${FX} 250" fill="none" stroke="#D9B07A" stroke-width="7"/>
        <line x1="${FX}" y1="250" x2="${FX}" y2="${FLOOR}" stroke="var(--txt3)" stroke-dasharray="4 4"/><text x="${FX + 6}" y="${FLOOR - 8}" class="k-lbl">plumb line</text>
        <text x="40" y="${(250 + FLOOR)/2}" class="k-lbl" transform="rotate(-90 40 ${(250 + FLOOR)/2})">bench (H unknown)</text>`;
      for(let c = 0; c <= 25; c++){ const y = 250 - c*.01*800; s += `<line x1="${FX - 200}" y1="${y}" x2="${FX - 200 + (c % 5 ? 5 : 10)}" y2="${y}" stroke="var(--txt2)"/>${c % 5 === 0 ? `<text x="${FX - 206}" y="${y + 3}" text-anchor="end" class="k-num">${(c/100).toFixed(2)}</text>` : ""}`; }
      s += `<text x="${FX - 200}" y="36" class="k-lbl">h / m</text>`;
      s += `<rect x="${FX + 40}" y="${FLOOR - 2}" width="420" height="6" fill="#111827" opacity=".7"/><text x="${FX + 250}" y="${FLOOR + 40}" text-anchor="middle" class="k-lbl">carbon paper on the floor; metre rule from the plumb line</text>`;
      for(let c = 0; c <= 140; c += 1){ const x = FX + c*.01*PXM_R; if(x > 940) break; s += `<line x1="${x}" y1="${FLOOR + 6}" x2="${x}" y2="${FLOOR + (c % 10 ? 10 : 16)}" stroke="var(--txt2)" stroke-width=".6"/>${c % 10 === 0 ? `<text x="${x}" y="${FLOOR + 28}" text-anchor="middle" class="k-num">${(c/100).toFixed(1)}</text>` : ""}`; }
      marks.forEach((r, i) => s += `<circle cx="${FX + r*PXM_R}" cy="${FLOOR + 1}" r="3.5" fill="${i === marks.length - 1 ? "#FF5C7A" : "#94A3B8"}"/>`);
      const p0 = rampPt(h);
      if(ball) s += `<circle cx="${ball.x}" cy="${ball.y}" r="9" fill="url(#k-metal)" stroke="#334155"/>`;
      else s += `<g id="pj-ball" class="k-drag"><circle cx="${p0[0]}" cy="${p0[1] - 8}" r="9" fill="url(#k-metal)" stroke="#334155"/><rect x="${p0[0] - 20}" y="${p0[1] - 30}" width="40" height="40" fill="transparent"/></g><line x1="${FX - 200}" y1="${p0[1]}" x2="${p0[0] - 10}" y2="${p0[1]}" stroke="var(--accent)" stroke-dasharray="3 3"/>`;
      if(lens !== null){
        const lx = FX + lens*PXM_R; let z = `<rect x="-70" y="-70" width="140" height="140" fill="#F8FAFC"/><rect x="-70" y="-6" width="140" height="10" fill="#111827" opacity=".7"/>`;
        const S = 4000;
        for(let mm = Math.floor((lens - .02)*1000); mm <= Math.ceil((lens + .02)*1000); mm++){ const x = (mm/1000 - lens)*S; z += `<line x1="${x}" y1="10" x2="${x}" y2="${mm % 10 === 0 ? 34 : mm % 5 === 0 ? 26 : 18}" stroke="#334155" stroke-width="${mm % 10 ? .8 : 1.4}"/>`; if(mm % 10 === 0) z += `<text x="${x}" y="50" text-anchor="middle" style="font:600 11px 'JetBrains Mono';fill:#334155">${(mm/1000).toFixed(2)}</text>`; }
        z += `<circle cx="0" cy="0" r="5" fill="#FF5C7A"/>`;
        s += `<g transform="translate(${Math.min(860, Math.max(100, lx))} 360)"><circle r="72" fill="none" stroke="var(--accent)" stroke-width="3"/><g clip-path="url(#pj-lc)">${z}</g></g><line x1="${lx}" y1="${FLOOR}" x2="${Math.min(860, Math.max(100, lx))}" y2="432" stroke="var(--accent)" stroke-dasharray="3 3"/>`;
      }
      $("#pj-scene").innerHTML = s;
      $("#pj-status").textContent = ball ? "…" : lens !== null ? "Read the landing mark through the magnifier" : "Drag the ball up the ramp to set h, then release";
      ctx.readout([["Release height h", h.toFixed(3) + " m"], ["Throws at this height", tries.length + " of 3"]]);
    }
    ctx.frame(dt => {
      if(!ball) return;
      ball.t += dt;
      if(ball.phase === "ramp"){ const a = Math.min(1, ball.t/.55); const p = rampPt(h*(1 - a)); ball.x = p[0]; ball.y = p[1] - 8; if(a >= 1){ ball.phase = "fly"; ball.t = 0; } }
      else{ const T = Math.sqrt(2*H/G), a = Math.min(1, ball.t/(T*1.4)); ball.x = FX + ball.R*a*PXM_R; ball.y = 242 + (FLOOR - 250)*a*a; if(a >= 1){ marks.push(ball.R); lens = ball.R; ball = null; } }
      draw();
    });
    Kit.dragger(ctx, svg, {
      hit(tg){ return !ball && tg.closest("#pj-ball") ? "b" : null; },
      move(k, p){ const hh = Kit.clamp(Kit.snap((250 - p.y)/800, .005), .02, .25); if(hh !== h){ h = hh; tries = []; lens = null; } draw(); }
    });
    ctx.buttons([{ label:"Release", primary:true, onClick(){ if(ball) return; if(tries.length >= 3) return ctx.toast("Three throws done — choose a new height"); lens = null; ball = { phase:"ramp", t:0, R:rangeFor(h), x:0, y:0 }; } },
      { label:"Clear marks", onClick(){ marks = []; lens = null; draw(); } }]);
    const rd = Kit.reading(ctx, "Landing distance R / m (to the nearest mm)", "e.g. 0.512", () => lens, .0025, v => {
      tries.push(Kit.round(v, 3)); lens = null; rd.clear();
      if(tries.length === 3){
        const R = Kit.mean(tries), dR = Kit.halfRange(tries);
        ctx.record({ h, r1:tries[0], r2:tries[1], r3:tries[2], R:Kit.round(R, 3), R2:Kit.round(R*R, 4), dR2:Kit.round(2*R*Math.max(dR, .002), 4) });
        if(new Set(ctx.rows().map(r => r.h)).size >= 5) ctx.complete("five");
      }else ctx.toast(`Throw ${tries.length} recorded — release again`);
      draw();
    });
    Kit.answer(ctx, "Bench height H from the gradient / m", "e.g. 0.82", v => {
      const pts = ctx.rows().map(r => [r.h, r.R2]); if(pts.length < 4) return [false, "Record at least four heights first."];
      const f = ctx.linFit(pts), HH = f.m*7/20;
      if(Math.abs(v - HH)/HH <= .04){ ctx.complete("H"); return [true, `Correct from your gradient: H = 7 × ${f.m.toFixed(3)} ÷ 20 = ${HH.toFixed(3)} m (actual ${H} m — friction makes it slightly lower).`]; }
      return [false, "For a rolling ball R² = (20/7)Hh, so H = (7/20) × gradient."];
    });
    draw();
  }
});
