"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · AS LEVEL (9702 Paper 3) — part 3
   Oscillating metre rule · Thermistor in a potential divider ·
   Water draining from a container · Floating test tube
══════════════════════════════════════════════════════════════════ */

/* ───────────── OSCILLATING METRE RULE (COMPOUND PENDULUM) ───────────── */
Lab.register({
  id:"compound", subject:"physics", level:["as"], topic:"Oscillations · Compound pendulum", interactive:true,
  title:"Oscillating metre rule",
  summary:"Hang a metre rule on a pin through holes at different distances from its centre, time 10 swings twice and plot T²d against d² to find g.",
  aim:"Investigate how the period of a metre rule swinging about a pivot depends on the distance d from the pivot to its centre of mass, and determine g.",
  variables:{ iv:"Distance d from the pivot to the centre of the rule (m)", dv:"Period T (s), from 10 oscillations, repeated", cv:["Same metre rule","Small amplitude (under 10°)","Timing as the rule passes the vertical"] },
  stageTitle:"Metre rule on a pin", controlsTitle:"Timing",
  thumb:`<svg viewBox="0 0 300 140"><rect x="138" y="4" width="24" height="134" rx="2" fill="#D9B07A" stroke="#7B4F2C" transform="rotate(10 150 26)"/><circle cx="150" cy="26" r="4" fill="#334155"/><line x1="150" y1="26" x2="150" y2="138" stroke="#FF5C7A" stroke-dasharray="4 3"/><path d="M110 120 a50 50 0 0 0 80 0" fill="none" stroke="#4DA3FF" stroke-dasharray="3 3"/></svg>`,
  challenges:[
    { id:"six",  title:"Six holes", text:"Record T for six different values of d (two timings each)." },
    { id:"g",    title:"Find g", text:"Use the gradient of T²d against d² to find g." },
    { id:"min",  title:"Shortest period", text:"Find the hole that gives the shortest period — it is not the one nearest the end." }
  ],
  columns:[{key:"d",label:"d / m",dp:3},{key:"t1",label:"10T₁ / s",dp:2},{key:"t2",label:"10T₂ / s",dp:2},{key:"T",label:"T / s",dp:3},{key:"d2",label:"d² / m²",dp:4},{key:"T2d",label:"T²d / s² m",dp:4},{key:"dT2d",label:"Δ(T²d) / s² m",dp:4}],
  graph:{ x:["d2","d"], y:["T2d","T"], yErr:{ T2d:"dT2d" }, fit:"linear" },
  questions:[
    { q:"The period is T = 2π√((d² + L²/12)/(gd)). Show why T²d plotted against d² gives a straight line.",
      a:"Squaring: T² = 4π²(d² + L²/12)/(gd), so T²d = (4π²/g)d² + 4π²L²/(12g). This is y = mx + c with y = T²d and x = d². The gradient is 4π²/g and the intercept is 4π²L²/(12g)." },
    { q:"How can L be found from the graph?",
      a:"The intercept c = 4π²L²/(12g) = gradient × L²/12, so L = √(12c ÷ gradient). It should come out close to 1.00 m." },
    { q:"Why is the period long when the pivot is close to the centre of the rule?",
      a:"The moment of inertia about the pivot hardly falls, but the restoring torque (mgd sin θ) becomes very small as d → 0, so the rule swings back slowly." },
    { q:"Suggest two sources of uncertainty and an improvement for each.",
      a:"Reaction time when starting and stopping the stopwatch — time more oscillations or use a light gate / video. Difficulty judging the exact moment of the vertical — use a fiducial marker at the centre of the swing. Friction at the pivot — use a thin pin and a smooth hole." },
    { q:"Why must the amplitude be small?",
      a:"The formula assumes sin θ ≈ θ (simple harmonic motion). At large amplitudes the period increases slightly." }
  ],
  setup(ctx){
    const G = 9.81, L = 1.0, S = 3.4, PV = { x:420, y:200 };
    let d = .2, how = "gate", A = 0, t = 0, osc = false, trials = [], gateT = null, passes = 0, lastSign = 0, gateStart = null, gateCount = 0;
    const sw = Kit.stopwatch("cp-sw", 740, 330);
    const omega = () => Math.sqrt(G*d/(d*d + L*L/12));
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 560" class="kb" id="cp-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 530)}
      <rect x="230" y="40" width="12" height="490" fill="url(#k-metal)"/><rect x="236" y="${PV.y - 6}" width="${PV.x - 236}" height="12" rx="3" fill="url(#k-metal)"/>
      <g id="cp-rule"></g>
      <line x1="${PV.x}" y1="${PV.y + 10}" x2="${PV.x}" y2="526" stroke="#FF5C7A" stroke-dasharray="5 4" opacity=".7" style="pointer-events:none"/><text x="${PV.x + 8}" y="520" class="k-lbl" style="fill:#FF5C7A">fiducial line</text>
      <circle cx="${PV.x}" cy="${PV.y}" r="4" fill="#CBD5E1" stroke="#334155"/>
      ${sw.svg}
      <g transform="translate(740 170)"><rect width="168" height="110" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="12" y="22" style="font:700 9px Inter;fill:#9CA3AF">LIGHT GATE · 10 oscillations</text>
        <text x="156" y="62" text-anchor="end" class="k-lcd" id="cp-gate">—</text><text x="12" y="94" style="font:600 11px Inter;fill:#E5E7EB" id="cp-pass">passes: 0</text></g>
      <text x="24" y="34" class="k-status" id="cp-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#cp-svg"), $ = s => svg.querySelector(s);
    sw.bind(svg);
    const angle = () => A*Math.exp(-.02*t)*Math.cos(omega()*t);
    function draw(){
      const top = -(50 - d*100)*S, bot = (50 + d*100)*S;
      let r = `<g transform="translate(${PV.x} ${PV.y}) rotate(${angle()})" id="cp-grab" class="k-drag"><rect x="-13" y="${top}" width="26" height="${bot - top}" rx="2" fill="url(#k-wood)" stroke="#7B4F2C"/>`;
      for(let c = 0; c <= 100; c += 2){ const y = top + c*S, big = c % 10 === 0; r += `<line x1="-13" y1="${y}" x2="${big ? -4 : -8}" y2="${y}" stroke="#4B3621" stroke-width=".7"/>`; if(big && c % 20 === 0) r += `<text x="6" y="${y + 3}" style="font:600 7px 'JetBrains Mono';fill:#4B3621">${c}</text>`; }
      for(let k = 5; k <= 45; k += 5){ r += `<circle cx="0" cy="${top + (50 - k)*S}" r="3" fill="var(--bg2)" stroke="#7B4F2C"/>`; }
      r += `<circle cx="0" cy="${top + 50*S}" r="4" fill="none" stroke="#DC2626" stroke-width="1.5"/><path d="M-3 ${top + 50*S}h6" stroke="#DC2626"/></g>`;
      $("#cp-rule").innerHTML = r;
      $("#cp-pass").textContent = `passes: ${passes}`;
      $("#cp-gate").textContent = gateT ? gateT.toFixed(3) + " s" : osc ? "timing…" : "—";
      $("#cp-status").textContent = !osc ? "Drag the bottom of the rule sideways a little and let go" : trials.length ? `Trial ${trials.length} recorded — repeat for a second timing` : "Swinging — time 10 oscillations";
      ctx.readout([["d", (d*100).toFixed(0) + " cm"], ["Amplitude", Math.abs(A).toFixed(1) + "°", Math.abs(A) > 10 ? "warn" : ""], ["Trials at this hole", trials.length + " of 2"], ["Timing", how === "gate" ? "light gate" : "your stopwatch"]]);
    }
    ctx.frame(dt => {
      sw.tick(dt);
      if(osc){
        t += dt;
        const sgn = Math.sign(Math.cos(omega()*t));
        if(lastSign && sgn !== lastSign && Math.sin(omega()*t) > 0){
          passes++;
          if(gateStart === null){ gateStart = t; gateCount = 0; } else { gateCount++; if(gateCount === 10 && !gateT) gateT = (t - gateStart) + (Math.random() - .5)*.004; }
        }
        lastSign = sgn;
      }
      draw();
    });
    Kit.dragger(ctx, svg, {
      hit(tg){ if(!tg.closest("#cp-grab")) return null; osc = false; t = 0; return {}; },
      move(h, p){ const a = Math.atan2(PV.x - p.x, p.y - PV.y)*180/Math.PI; A = Kit.clamp(a, -15, 15); },
      end(){ if(Math.abs(A) > 1.5){ osc = true; t = 0; passes = 0; lastSign = 0; gateStart = null; gateT = null; if(Math.abs(A) > 10) ctx.toast("That amplitude is quite large — keep it under 10°"); } else A = 0; }
    });
    ctx.seg({ label:"Pivot hole: distance d from the centre", value:.2, options:[.05,.1,.15,.2,.25,.3,.35,.4,.45].map(v => [v, Math.round(v*100) + ""]), hint:"in cm", onChange(v){ d = v; trials = []; osc = false; A = 0; gateT = null; } });
    ctx.seg({ label:"Timing method", value:"gate", options:[["gate","Light gate"],["sw","My stopwatch"]], onChange(v){ how = v; } });
    ctx.buttons([{ label:"Record 10T (one trial)", primary:true, block:true, onClick(){
      let t10;
      if(how === "gate"){ if(!gateT) return ctx.toast("Let it complete 10 oscillations through the light gate"); t10 = gateT; }
      else { if(sw.running || sw.t <= 0) return ctx.toast("Start and stop your stopwatch over 10 oscillations"); t10 = sw.t; }
      trials.push(Kit.round(t10, 2)); sw.reset();
      if(trials.length === 2){
        const Tm = Kit.mean(trials)/10, dT = Math.max(Kit.halfRange(trials), how === "gate" ? .01 : .1)/10;
        ctx.record({ d, t1:trials[0], t2:trials[1], T:Kit.round(Tm, 3), d2:Kit.round(d*d, 4), T2d:Kit.round(Tm*Tm*d, 4), dT2d:Kit.round(2*Tm*dT*d, 4) });
        trials = [];
        const rows = ctx.rows(), ds = new Set(rows.map(r => r.d));
        if(ds.size >= 6) ctx.complete("six");
        if([.25, .3, .35].every(v => ds.has(v))){ const best = rows.reduce((a, b) => a.T < b.T ? a : b); if(Math.abs(best.d - .3) < .051) ctx.complete("min"); }
      }else ctx.toast(`Trial 1: ${t10.toFixed(2)} s — now repeat`);
      osc = false; A = 0; gateT = null;
    } }]);
    Kit.answer(ctx, "g / m s⁻²", "e.g. 9.8", v => {
      const pts = ctx.rows().map(r => [r.d2, r.T2d]); if(new Set(pts.map(p => p[0])).size < 4) return [false, "Record at least four holes first."];
      const f = ctx.linFit(pts), gg = 4*Math.PI*Math.PI/f.m;
      if(Math.abs(v - gg)/gg <= .03){ ctx.complete("g"); return [true, `Correct from your gradient: g = 4π² ÷ ${f.m.toFixed(3)} = ${gg.toFixed(2)} m s⁻².`]; }
      return [false, "g = 4π² ÷ gradient of T²d against d²."];
    });
    draw();
  }
});

/* ───────────── THERMISTOR IN A POTENTIAL DIVIDER ───────────── */
Lab.register({
  id:"thermistor", subject:"physics", level:["as"], topic:"D.C. circuits · Potential divider", interactive:true,
  title:"Thermistor in a potential divider",
  summary:"Put an NTC thermistor in a water bath, wire it in series with a fixed resistor and watch the voltmeter reading change as you heat, stir and add ice.",
  aim:"Investigate how the potential difference across a fixed resistor in a potential divider with a thermistor varies with temperature, and find the temperature at which the thermistor’s resistance equals the fixed resistance.",
  variables:{ iv:"Temperature of the water θ (°C)", dv:"Voltmeter reading V across the fixed resistor (V)", cv:["Same supply e.m.f. and fixed resistor","Thermistor fully immersed","Water stirred and steady before reading"] },
  stageTitle:"Water bath and potential divider", controlsTitle:"Bath",
  thumb:`<svg viewBox="0 0 300 140"><path d="M60 20 V126 H170 V20" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="62" y="44" width="106" height="80" fill="#4C86C6" opacity=".5"/><rect x="96" y="10" width="6" height="96" fill="#fff" stroke="#9AA3B2"/><circle cx="99" cy="110" r="6" fill="#E0334A"/><circle cx="140" cy="100" r="8" fill="#1F2937"/><rect x="200" y="40" width="80" height="40" rx="6" fill="#FACC15"/><text x="270" y="66" text-anchor="end" font-size="13" fill="#422006" font-family="monospace">2.31</text></svg>`,
  challenges:[
    { id:"six",  title:"Six temperatures", text:"Record V at six or more temperatures spanning at least 50 °C." },
    { id:"ice",  title:"Cold end", text:"Take a reading below 10 °C." },
    { id:"half", title:"Equal resistances", text:"Find the temperature at which the thermistor’s resistance equals the fixed resistor (V = E/2)." }
  ],
  columns:[{key:"th",label:"θ / °C",dp:0},{key:"V",label:"V / V",dp:2},{key:"R",label:"R_T / kΩ",dp:2}],
  graph:{ x:["th"], y:["V","R"], fit:"curve" },
  questions:[
    { q:"Explain why the voltmeter reading rises as the water gets hotter.",
      a:"The resistance of an NTC thermistor falls as temperature rises. The fixed resistor then takes a larger share of the e.m.f.: V = E × R/(R + R_T) increases as R_T decreases." },
    { q:"Show that R_T = R(E − V)/V.",
      a:"The current is the same in both: I = V/R. The p.d. across the thermistor is E − V, so R_T = (E − V)/I = R(E − V)/V." },
    { q:"Why should the water be stirred and the reading allowed to settle?",
      a:"Without stirring the water near the heater is hotter than elsewhere, so the thermometer and thermistor may be at different temperatures. Both also take time to reach the temperature of the water." },
    { q:"Suggest two limitations of this experiment and an improvement for each.",
      a:"Temperature keeps changing while readings are taken — switch the heater off and wait, or use a thermostatically controlled bath. The thermometer reads only to ±1 °C — use a digital thermometer. The thermistor heats itself when current flows — use a larger fixed resistor to keep the current small." },
    { q:"How would you use this circuit as a sensor to switch on a fan when a room gets hot?",
      a:"The output p.d. across the fixed resistor rises with temperature; connect it to a switching circuit (e.g. a transistor or comparator) that turns the fan on above a set voltage. A variable resistor in place of the fixed one sets the switching temperature." }
  ],
  setup(ctx){
    const E = 4.5, R = 4.7, B = 3950, R25 = Kit.round(10*(0.95 + Math.random()*.1), 2);
    const Rth = T => R25*Math.exp(B*(1/(T + 273.15) - 1/298.15));
    const thHalf = 1/(1/298.15 + Math.log(R/R25)/B) - 273.15;
    let Tw = 20 + Math.random()*2, Tt = Tw, Tm = Tw, heat = false, stir = 0, noise = 0;
    const V = () => E*R/(R + Rth(Tt)) + noise;
    const th = Kit.thermometer("tr-th", 300, 70, 330, 0, 100, 10);

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="tr-svg"><defs>${Kit.DEFS}</defs>
      ${Kit.bench(960, 480)}
      <rect x="182" y="210" width="236" height="268" fill="url(#k-water)" opacity=".8"/><g id="tr-ice"></g>
      <path d="M180 170 V480 H420 V170" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2"/>
      <g id="tr-heater"></g>
      ${th.svg}
      <g transform="translate(370 380)"><circle r="9" fill="#1F2937" stroke="#64748B"/><path d="M0 -9 V-300" stroke="#64748B" stroke-width="3" fill="none"/></g>
      <g id="tr-stir"></g>
      <g transform="translate(560 90)">
        <path d="M0 40 H40 M80 40 H180 V120 M180 200 V260 H0 V200 M0 120 V40" stroke="var(--txt2)" stroke-width="2" fill="none"/>
        <line x1="40" y1="28" x2="40" y2="52" stroke="var(--txt)" stroke-width="2.5"/><line x1="52" y1="34" x2="52" y2="46" stroke="var(--txt)" stroke-width="4"/><path d="M52 40 H80" stroke="var(--txt2)" stroke-width="2"/>
        <text x="46" y="18" text-anchor="middle" class="k-tag">E = ${E.toFixed(2)} V</text>
        <rect x="168" y="120" width="24" height="80" rx="2" fill="none" stroke="var(--txt)" stroke-width="2"/><text x="180" y="218" text-anchor="middle" class="k-tag">R = ${R} kΩ</text>
        <rect x="-12" y="120" width="24" height="80" rx="2" fill="none" stroke="var(--txt)" stroke-width="2"/><path d="M-20 210 L20 110 h8" stroke="var(--txt)" stroke-width="1.5" fill="none"/><text x="-20" y="230" text-anchor="end" class="k-tag">thermistor</text>
        <path d="M180 130 H260 V150 M180 190 H260 V172" stroke="var(--txt2)" stroke-width="2" fill="none"/><circle cx="260" cy="161" r="12" fill="none" stroke="var(--txt)" stroke-width="2"/><text x="260" y="166" text-anchor="middle" class="k-tag">V</text>
      </g>
      <g transform="translate(720 340)"><rect width="190" height="104" rx="12" fill="#FACC15" stroke="#A16207"/><rect x="12" y="12" width="166" height="44" rx="5" fill="#132A1F"/>
        <text id="tr-vm" x="168" y="44" text-anchor="end" class="k-lcd">0.00</text><text x="20" y="78" style="font:700 11px Inter;fill:#422006">VOLTMETER · V d.c.</text><text x="20" y="94" style="font:500 9px Inter;fill:#713F12">across the fixed resistor</text></g>
      <path d="M370 80 C 420 40 520 120 560 210" stroke="#64748B" stroke-width="2" fill="none"/>
      <text x="24" y="34" class="k-status" id="tr-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#tr-svg"), $ = s => svg.querySelector(s);
    let ice = 0;
    function draw(){
      th.set(svg, Tm);
      $("#tr-vm").textContent = V().toFixed(2);
      $("#tr-heater").innerHTML = `<rect x="226" y="200" width="10" height="250" rx="3" fill="url(#k-metal)"/><path d="M231 450 q-14 6 0 12 q14 6 0 12" stroke="${heat ? "#F97316" : "#64748B"}" stroke-width="5" fill="none"/>${heat ? `<circle cx="231" cy="440" r="22" fill="#F97316" opacity=".18"/>` : ""}<text x="200" y="196" class="k-lbl">heater</text>`;
      $("#tr-ice").innerHTML = ice > .05 ? Array.from({ length:Math.ceil(ice*6) }, (_, i) => `<rect x="${250 + i*22}" y="${214 + (i % 2)*6}" width="18" height="16" rx="3" fill="#E0F2FE" opacity=".9" stroke="#93C5FD"/>`).join("") : "";
      $("#tr-stir").innerHTML = `<g transform="translate(${400 + Math.sin(stir*12)*6*Math.min(1, stir)} 0)"><path d="M0 150 V440" stroke="#CBD5E1" stroke-width="3"/><path d="M-12 440 h24" stroke="#CBD5E1" stroke-width="3"/></g>`;
      const steady = Math.abs(Tt - Tw) < .5 && Math.abs(Tm - Tw) < .5;
      $("#tr-status").textContent = heat ? "Heater on — switch off, stir and wait before reading" : !steady ? "Stir and wait until the readings settle" : "Steady — read the thermometer and the voltmeter";
      ctx.readout([["Heater", heat ? "on" : "off", heat ? "warn" : ""], ["Stirring", stir > .05 ? "yes" : "no"], ["Readings", steady ? "steady" : "changing", steady ? "good" : "warn"]]);
    }
    ctx.frame(dt => {
      if(heat) Tw = Math.min(98, Tw + 1.1*dt);
      if(ice > 0){ const melt = Math.min(ice, dt*.04); ice -= melt; Tw = Math.max(0.5, Tw - melt*180); }
      Tw += -(Tw - 20)*.0015*dt;
      const tauT = stir > .05 ? 2.5 : 10, tauM = stir > .05 ? 2 : 8;
      // unstirred: hot water rises past the thermometer bulb first, so it reads high while heating
      const local = Tw + (heat && stir < .05 ? 3 : 0);
      Tt += (Tw - Tt)*Math.min(1, dt/tauT); Tm += (local - Tm)*Math.min(1, dt/tauM);
      stir = Math.max(0, stir - dt*.25);
      noise = (Math.random() - .5)*.006;
      draw();
    });
    ctx.buttons([{ label:"Heater on / off", primary:true, block:true, onClick(){ heat = !heat; draw(); } }]);
    ctx.buttons([{ label:"Stir", onClick(){ stir = 3; } }, { label:"Add ice", onClick(){ if(Tw < 4) return ctx.toast("The water is already ice-cold"); ice = Math.min(1, ice + .35); } }]);
    const rd = Kit.reading(ctx, "Thermometer reading θ / °C", "e.g. 42", () => Tm, 1, v => {
      const vv = Kit.round(V(), 2);
      ctx.record({ th:v, V:vv, R:Kit.round(R*(E - vv)/vv, 2) });
      if(heat || Math.abs(Tt - Tw) > 1.5) ctx.toast("Recorded — but the temperature was still changing, so θ and V may not match");
      rd.clear();
      const ths = ctx.rows().map(r => r.th);
      if(new Set(ths).size >= 6 && Math.max(...ths) - Math.min(...ths) >= 50) ctx.complete("six");
      if(Math.min(...ths) < 10) ctx.complete("ice");
    });
    ctx.html(`<p class="hint">Each recorded row uses the voltmeter reading at the moment you enter the thermometer reading.</p>`);
    Kit.answer(ctx, "Temperature where R_T = R / °C", "e.g. 45", v => Math.abs(v - thHalf) <= 2.5
      ? (ctx.complete("half"), [true, `Correct — about ${thHalf.toFixed(0)} °C, where V = E/2 = ${(E/2).toFixed(2)} V.`]) : [false, "Find where your V–θ graph crosses V = E/2 (or where R_T = 4.7 kΩ)."]);
    draw();
  }
});

/* ───────────── WATER DRAINING FROM A CONTAINER ───────────── */
Lab.register({
  id:"draining", subject:"physics", level:["as"], topic:"Measurement · Fluid flow", interactive:true,
  title:"Water draining through a tube",
  summary:"Time how long the water level in a cylinder takes to fall between two marks through outlet tubes of different diameters, and show that t ∝ 1/d².",
  aim:"Investigate how the time for the water level in a container to fall between two marks depends on the internal diameter d of the outlet tube.",
  variables:{ iv:"Internal diameter of the outlet tube d (mm)", dv:"Time t for the level to fall from the 30 cm mark to the 10 cm mark (s)", cv:["Same container","Same start and stop marks","Same length of outlet tube"] },
  stageTitle:"Container and outlet tube", controlsTitle:"Timing",
  thumb:`<svg viewBox="0 0 300 140"><rect x="110" y="10" width="60" height="120" rx="3" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="112" y="44" width="56" height="84" fill="#4C86C6" opacity=".55"/><line x1="104" y1="40" x2="176" y2="40" stroke="#DC2626"/><line x1="104" y1="100" x2="176" y2="100" stroke="#DC2626"/>
    <rect x="170" y="118" width="40" height="6" fill="#94A3B8"/><path d="M210 121 q30 2 40 18" stroke="#4C86C6" stroke-width="4" fill="none"/></svg>`,
  challenges:[
    { id:"five",  title:"Five tubes", text:"Record times (two each) for five different tube diameters." },
    { id:"line",  title:"t against 1/d²", text:"Plot t against 1/d² — a straight line shows t ∝ 1/d²." },
    { id:"pred",  title:"Predict", text:"Predict the time for a 4.5 mm tube." }
  ],
  columns:[{key:"d",label:"d / mm",dp:1},{key:"t1",label:"t₁ / s",dp:2},{key:"t2",label:"t₂ / s",dp:2},{key:"t",label:"t / s",dp:2},{key:"dt",label:"Δt / s",dp:2},{key:"inv",label:"1/d² / mm⁻²",dp:4}],
  graph:{ x:["inv","d"], y:["t"], yErr:{ t:"dt" }, fit:"linear" },
  questions:[
    { q:"Explain why a wider tube empties the container more quickly.",
      a:"The volume flowing out per second is roughly the cross-sectional area of the tube × the speed of the water. Area is πd²/4, so doubling d quadruples the flow rate and the time falls to a quarter: t ∝ 1/d²." },
    { q:"Why does the water level fall more slowly as the container empties?",
      a:"The speed of the water leaving depends on the pressure at the bottom, which is proportional to the depth h (speed ∝ √h). As h falls, the outflow slows." },
    { q:"How should the uncertainty in t be estimated?",
      a:"Half the range of the repeated readings — but not less than your reaction time (about 0.2 s), because you start and stop the stopwatch by eye at both marks." },
    { q:"Suggest two difficulties and an improvement for each.",
      a:"Judging the instant the meniscus passes each mark — view at eye level, or film it with a timer in shot. The internal diameter is hard to measure — use calipers on several tubes, or find d from the volume of water a known length holds. Water drips or swirls at the end — keep the tube horizontal and the same length." }
  ],
  setup(ctx){
    const S = 10, BOT = 470, X0 = 380, X1 = 500, Dc = 50, Cd = .8, G = 9.81;
    const D_OPTS = [4, 5, 6, 7, 8];
    let d = 6, h = 33, open = false, trials = [];
    const sw = Kit.stopwatch("dr-sw", 720, 300);
    const yOf = hh => BOT - hh*S;
    const tTrue = dd => (Dc/dd)*(Dc/dd)/Cd*Math.sqrt(2/G)*(Math.sqrt(.3) - Math.sqrt(.1));

    let scale = "";
    for(let c = 0; c <= 34; c++){ const y = yOf(c), L = c % 5 === 0 ? 12 : 6; scale += `<line x1="${X0 - 4}" y1="${y}" x2="${X0 - 4 - L}" y2="${y}" stroke="#4B3621" stroke-width=".8"/>`; if(c % 5 === 0) scale += `<text x="${X0 - 20}" y="${y + 3.5}" text-anchor="end" style="font:600 9px 'JetBrains Mono';fill:#4B3621">${c}</text>`; }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="dr-svg"><defs>${Kit.DEFS}<clipPath id="dr-clip"><rect x="${X0 + 2}" y="${yOf(36)}" width="${X1 - X0 - 4}" height="${36*S}"/></clipPath></defs>
      ${Kit.bench(960, 490)}
      <rect x="${X0 - 56}" y="${yOf(35) - 10}" width="46" height="${36*S + 6}" rx="3" fill="url(#k-wood)" stroke="#7B4F2C"/>${scale}
      <rect id="dr-w" x="${X0 + 2}" width="${X1 - X0 - 4}" fill="url(#k-water)" clip-path="url(#dr-clip)"/>
      ${[30, 10].map(m => `<line x1="${X0 - 8}" y1="${yOf(m)}" x2="${X1 + 8}" y2="${yOf(m)}" stroke="#DC2626" stroke-width="1.5"/><text x="${X1 + 12}" y="${yOf(m) + 4}" class="k-tag" style="fill:#DC2626">${m} cm mark</text>`).join("")}
      <path d="M${X0} ${yOf(36)} V${BOT + 4} H${X1} V${yOf(36)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2"/>
      <g id="dr-tube"></g><path id="dr-jet" fill="none" stroke="#4C86C6" stroke-linecap="round" opacity=".85"/>
      <path d="M560 470 h120 l-8 20 h-104z" fill="url(#k-glass)" stroke="var(--txt2)"/>
      ${sw.svg}
      <text x="24" y="34" class="k-status" id="dr-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#dr-svg"), $ = s => svg.querySelector(s);
    sw.bind(svg);
    function draw(){
      const y = yOf(h);
      $("#dr-w").setAttribute("y", y); $("#dr-w").setAttribute("height", Math.max(0, BOT - y));
      const tw = 4 + d*1.2;
      $("#dr-tube").innerHTML = `<rect x="${X1}" y="${BOT - 14 - tw/2}" width="110" height="${tw}" rx="2" fill="#CBD5E1" opacity=".8" stroke="#64748B"/>
        <g class="k-btn" id="dr-tap"><rect x="${X1 + 40}" y="${BOT - 46}" width="30" height="20" rx="4" fill="${open ? "#16A34A" : "#B91C1C"}"/><rect x="${X1 + 52}" y="${BOT - 26}" width="6" height="12" fill="#475569"/><text x="${X1 + 55}" y="${BOT - 52}" text-anchor="middle" class="k-lbl">${open ? "tap open" : "tap shut"}</text></g>`;
      const v = open && h > 0 ? Math.sqrt(2*G*h/100)*Cd : 0;
      $("#dr-jet").setAttribute("d", v > .05 ? `M${X1 + 110} ${BOT - 14} q ${v*40} 4 ${v*55} 30` : "");
      $("#dr-jet").setAttribute("stroke-width", Math.max(2, d*.9));
      $("#dr-status").textContent = open ? "Draining — start the stopwatch at the 30 cm mark, stop it at 10 cm" : h > 30 ? "Open the tap" : "Shut the tap and refill above 30 cm";
      ctx.readout([["Tube", d + " mm"], ["Water level", h.toFixed(1) + " cm"], ["Trials", trials.length + " of 2"]]);
    }
    ctx.frame(dt => {
      sw.tick(dt);
      if(open && h > 0){ const a = (d/Dc)*(d/Dc); h = Math.max(0, h - a*Cd*Math.sqrt(2*G*h/100)*100*dt); }
      draw();
    });
    Kit.dragger(ctx, svg, { hit(t){ if(t.closest("#dr-tap")){ open = !open; draw(); } return null; } });
    ctx.seg({ label:"Outlet tube diameter", value:6, options:D_OPTS.map(v => [v, v + " mm"]), onChange(v){ if(open) return ctx.toast("Shut the tap first"); d = v; trials = []; draw(); } });
    ctx.buttons([{ label:"Refill to 33 cm", onClick(){ if(open) return ctx.toast("Shut the tap first"); h = 33; sw.reset(); draw(); } }]);
    ctx.buttons([{ label:"Record this time (one trial)", primary:true, block:true, onClick(){
      if(sw.running || sw.t <= 0) return ctx.toast("Time the fall from the 30 cm mark to the 10 cm mark first");
      if(Math.abs(sw.t - tTrue(d))/tTrue(d) > .25) ctx.toast("That time looks a long way out — did you start and stop exactly at the marks?");
      trials.push(Kit.round(sw.t, 2)); sw.reset();
      if(trials.length === 2){
        const tm = Kit.mean(trials);
        ctx.record({ d, t1:trials[0], t2:trials[1], t:Kit.round(tm, 2), dt:Kit.round(Math.max(Kit.halfRange(trials), .2), 2), inv:Kit.round(1/(d*d), 4) });
        trials = [];
        const ds = new Set(ctx.rows().map(r => r.d));
        if(ds.size >= 5) ctx.complete("five");
        if(ds.size >= 4) ctx.complete("line");
      }else ctx.toast("Trial 1 noted — refill and repeat");
      draw();
    } }]);
    Kit.answer(ctx, "Predicted time for a 4.5 mm tube / s", "e.g. 20", v => Math.abs(v - tTrue(4.5))/tTrue(4.5) <= .07
      ? (ctx.complete("pred"), [true, `Good — the true time is about ${tTrue(4.5).toFixed(1)} s.`]) : [false, "Read t from your t–1/d² line at 1/d² = 1/4.5² = 0.0494 mm⁻²."]);
    ctx.html(`<p class="hint">Watch the meniscus at eye level. Start the stopwatch as it passes the 30 cm mark and stop it at the 10 cm mark.</p>`);
    draw();
  }
});

/* ───────────── FLOATING TEST TUBE ───────────── */
Lab.register({
  id:"floattube", subject:"physics", level:["as"], topic:"Oscillations · Floating tube", interactive:true,
  title:"Oscillations of a floating test tube",
  summary:"Load a test tube with lead shot, read how deep it floats, push it down and time 10 bobs. Plot T² against depth to find g.",
  aim:"Investigate how the period of vertical oscillation of a floating test tube depends on its depth of immersion d, and determine g.",
  variables:{ iv:"Depth of immersion d (cm), changed by adding lead shot", dv:"Period T (s), from 10 oscillations, repeated", cv:["Same test tube","Water at rest, same water","Small push down, tube kept vertical"] },
  stageTitle:"Test tube floating in water", controlsTitle:"Timing",
  thumb:`<svg viewBox="0 0 300 140"><rect x="90" y="30" width="120" height="104" fill="#4C86C6" opacity=".45"/><rect x="138" y="8" width="24" height="96" rx="12" fill="url(#none)" stroke="#A2ACBD" stroke-width="2"/><circle cx="146" cy="96" r="3" fill="#475569"/><circle cx="154" cy="94" r="3" fill="#475569"/><circle cx="150" cy="99" r="3" fill="#475569"/><path d="M170 20 v20 M170 60 v20" stroke="#FF5C7A" stroke-width="2"/></svg>`,
  challenges:[
    { id:"six", title:"Six depths", text:"Record T for six different loads (two timings each)." },
    { id:"g",   title:"Find g", text:"Use the gradient of T² against d to find g." },
    { id:"why", title:"Compare", text:"Compare your g with 9.81 m s⁻² and read the last question to see why it differs." }
  ],
  columns:[{key:"m",label:"m / g",dp:0},{key:"d",label:"d / cm",dp:1},{key:"t1",label:"10T₁ / s",dp:2},{key:"t2",label:"10T₂ / s",dp:2},{key:"T",label:"T / s",dp:3},{key:"T2",label:"T² / s²",dp:4},{key:"dT2",label:"Δ(T²) / s²",dp:4}],
  graph:{ x:["d"], y:["T2","T"], yErr:{ T2:"dT2" }, fit:"linear" },
  questions:[
    { q:"Show that the period of the floating tube is T = 2π√(d/g).",
      a:"Floating: mg = ρAdg, so m = ρAd. Pushed down by x, the extra upthrust ρAgx is a restoring force, so a = −(ρAg/m)x = −(g/d)x. This is SHM with ω² = g/d, so T = 2π√(d/g)." },
    { q:"How is g found from the graph?",
      a:"T² = (4π²/g)d, so a graph of T² against d is a straight line through the origin with gradient 4π²/g. g = 4π² ÷ gradient (with d in metres)." },
    { q:"How is the depth of immersion measured?",
      a:"A paper scale inside the tube (or a ruler held against it) is read where the water surface meets the tube, at eye level and with the tube at rest." },
    { q:"Suggest two limitations and an improvement for each.",
      a:"The tube can tilt or touch the side — use a wide container and a heavier base so it stays upright. Ten oscillations damp out quickly and are hard to count — use a light gate or video in slow motion. The meniscus makes d uncertain — read at eye level from several sides." },
    { q:"Why is the value of g usually a little lower than 9.81 m s⁻²?",
      a:"Some water moves with the tube, adding to the oscillating mass, so the period is slightly longer than 2π√(d/g) predicts. A longer period gives a larger gradient and so a smaller g." }
  ],
  setup(ctx){
    const G = 9.81, A = Math.PI*.0125*.0125, RHO = 1000, ADD = 1.05, S = 10;
    const WY = 200, CX = 470, TW = 26, TL = 18;
    let m = 30, X = 0, t = 0, osc = false, trials = [], depthRead = {};
    const sw = Kit.stopwatch("ft-sw", 720, 320);
    const depth = () => m/1000/(RHO*A)*100;                      // cm
    const omega = () => Math.sqrt(G/(ADD*depth()/100));
    const off = () => osc ? X*Math.exp(-.12*t)*Math.cos(omega()*t) : X;

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="ft-svg"><defs>${Kit.DEFS}<clipPath id="ft-lensclip"><circle r="62"/></clipPath></defs>
      ${Kit.bench(960, 490)}
      <rect x="352" y="${WY}" width="236" height="${488 - WY}" fill="url(#k-water)" opacity=".8"/>
      <g id="ft-tube"></g>
      <rect x="352" y="${WY}" width="236" height="${488 - WY}" fill="#4C86C6" opacity=".18" style="pointer-events:none"/>
      <path d="M350 120 V490 H590 V120" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2" style="pointer-events:none"/>
      <g id="ft-lens" style="pointer-events:none"><line id="ft-lline" stroke="var(--accent)" stroke-dasharray="3 3"/><g transform="translate(200 ${WY})"><circle r="64" fill="#F7F9FC" stroke="var(--accent)" stroke-width="3"/><g clip-path="url(#ft-lensclip)" id="ft-zoom"></g></g></g>
      ${sw.svg}
      <text x="24" y="34" class="k-status" id="ft-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ft-svg"), $ = s => svg.querySelector(s);
    sw.bind(svg);
    function draw(){
      const dpx = depth()*S, base = WY + dpx + off(), top = base - TL*S;
      let s = `<g id="ft-grab" class="k-drag"><rect x="${CX - TW/2}" y="${top}" width="${TW}" height="${TL*S}" rx="${TW/2}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
        <rect x="${CX - 6}" y="${top + 8}" width="12" height="${TL*S - 20}" fill="#FEFCE8" opacity=".9"/>`;
      for(let c = 0; c <= TL - 2; c++){ const y = base - c*S, big = c % 5 === 0; s += `<line x1="${CX - 6}" y1="${y}" x2="${CX - (big ? -2 : 1)}" y2="${y}" stroke="#111827" stroke-width=".6"/>`; }
      const shots = Math.round(m/4);
      for(let i = 0; i < shots; i++) s += `<circle cx="${CX - 8 + (i % 4)*5.3}" cy="${base - 8 - Math.floor(i/4)*5}" r="2.6" fill="#475569"/>`;
      s += `<rect x="${CX - 30}" y="${top - 10}" width="60" height="${TL*S + 20}" fill="transparent"/></g>`;
      $("#ft-tube").innerHTML = s;
      // magnified view of the tube's scale at the water surface
      const dd = depth() + off()/S;
      let z = `<rect x="-64" y="0" width="128" height="70" fill="rgba(110,170,230,.5)"/><rect x="-14" y="-70" width="28" height="140" fill="#FEFCE8"/>`;
      for(let mm = Math.ceil((dd - 1.7)*10); mm <= Math.floor((dd + 1.7)*10); mm++){
        if(mm < 0) continue;
        const yy = (dd - mm/10)*40, big = mm % 10 === 0, half = mm % 5 === 0;
        z += `<line x1="-14" y1="${yy}" x2="${big ? 4 : half ? -2 : -7}" y2="${yy}" stroke="#111827" stroke-width="${big ? 1.5 : .8}"/>`;
        if(big) z += `<text x="8" y="${yy + 4}" style="font:600 12px 'JetBrains Mono';fill:#111827">${mm/10}</text>`;
      }
      z += `<path d="M-64 0 H64" stroke="rgba(40,90,170,.9)" stroke-width="2"/>`;
      $("#ft-zoom").innerHTML = z;
      const ll = $("#ft-lline"); ll.setAttribute("x1", 264); ll.setAttribute("y1", WY); ll.setAttribute("x2", CX - TW/2); ll.setAttribute("y2", WY);
      $("#ft-status").textContent = osc ? "Bobbing — time 10 oscillations" : depthRead[m] === undefined ? "Read the depth of immersion on the tube’s scale (magnifier)" : "Push the tube down a little and let go";
      ctx.readout([["Tube + shot", m + " g"], ["Depth read", depthRead[m] === undefined ? "—" : depthRead[m].toFixed(1) + " cm", depthRead[m] === undefined ? "warn" : "good"], ["Trials", trials.length + " of 2"]]);
    }
    ctx.frame(dt => { sw.tick(dt); if(osc){ t += dt; if(Math.abs(off()) < .05 && t > 20){ osc = false; X = 0; } } draw(); });
    Kit.dragger(ctx, svg, {
      hit(tg, p){ if(!tg.closest("#ft-grab")) return null; osc = false; X = 0; return { y0:p.y }; },
      move(h, p){ X = Kit.clamp(p.y - h.y0, 0, 30); },
      end(){ if(X > 3){ osc = true; t = 0; } else X = 0; }
    });
    ctx.seg({ label:"Mass of tube + lead shot", value:30, options:[20,30,40,50,60,70].map(v => [v, v + " g"]), onChange(v){ m = v; trials = []; osc = false; X = 0; } });
    const rd = Kit.reading(ctx, "Depth of immersion d / cm (read the magnifier)", "e.g. 6.1", () => osc ? null : depth(), .15, v => { depthRead[m] = v; ctx.toast(`d = ${v.toFixed(1)} cm noted`); rd.clear(); });
    ctx.buttons([{ label:"Record 10T (one trial)", primary:true, block:true, onClick(){
      if(depthRead[m] === undefined) return ctx.toast("Read the depth of immersion first");
      if(sw.running || sw.t <= 0) return ctx.toast("Start and stop your stopwatch over 10 oscillations");
      trials.push(Kit.round(sw.t, 2)); sw.reset();
      if(trials.length === 2){
        const Tm = Kit.mean(trials)/10, dT = Math.max(Kit.halfRange(trials), .1)/10;
        ctx.record({ m, d:depthRead[m], t1:trials[0], t2:trials[1], T:Kit.round(Tm, 3), T2:Kit.round(Tm*Tm, 4), dT2:Kit.round(2*Tm*dT, 4) });
        trials = [];
        if(new Set(ctx.rows().map(r => r.m)).size >= 6) ctx.complete("six");
      }else ctx.toast(`Trial 1: ${trials[0].toFixed(2)} s — now repeat`);
      osc = false; X = 0;
    } }]);
    Kit.answer(ctx, "g / m s⁻²", "e.g. 9.5", v => {
      const pts = ctx.rows().map(r => [r.d/100, r.T2]); if(new Set(pts.map(p => p[0])).size < 4) return [false, "Record at least four loads first."];
      const f = ctx.linFit(pts), gg = 4*Math.PI*Math.PI/f.m;
      if(Math.abs(v - gg)/gg <= .04){ ctx.complete("g"); ctx.complete("why"); return [true, `Correct from your gradient: g = 4π² ÷ ${f.m.toFixed(2)} s² m⁻¹ = ${gg.toFixed(2)} m s⁻².`]; }
      return [false, "g = 4π² ÷ gradient of T² against d, with d in metres."];
    });
    draw();
  }
});
