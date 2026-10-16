"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS AS & A LEVEL (9702)
   AS: Resistivity of a wire · Simple pendulum (g)
   A : Capacitor discharge
   These add the AS skills: repeat readings, uncertainties, error bars
   and worst acceptable lines (handled by the core graph via graph.yErr).
══════════════════════════════════════════════════════════════════ */

/* small shared helper: an answer box that checks a typed value */
function answerBox(ctx, label, placeholder, check){
  const box = ctx.html(`<div class="ctl"><label><span>${label}</span></label>
    <div style="display:flex;gap:.4rem"><input class="inp" type="number" step="any" placeholder="${placeholder}"><button class="btn small" type="button">Check</button></div>
    <div style="margin-top:.5rem"></div></div>`);
  const input = box.querySelector("input"), fb = box.querySelector("div:last-child");
  const run = () => {
    const v = parseFloat(input.value);
    if(!isFinite(v)){ fb.innerHTML = `<div class="note bad">Enter a number.</div>`; return; }
    const [ok, msg] = check(v);
    fb.innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${msg}</div>`;
  };
  box.querySelector("button").onclick = run;
  input.addEventListener("keydown", e => { if(e.key === "Enter") run(); });
  return { clear(){ fb.innerHTML = ""; } };
}
const mean = a => a.reduce((s, v) => s + v, 0)/a.length;
const halfRange = a => (Math.max(...a) - Math.min(...a))/2;

/* ───────────── AS · RESISTIVITY ───────────── */
Lab.register({
  id:"resistivity", subject:"physics", level:["igcse","as"], topic:"D.C. circuits · Resistivity", icon:"🧵",
  title:"Resistivity of a metal wire",
  summary:"Measure resistance against length with a multimeter and the diameter with a micrometer — including its zero error.",
  aim:"Determine the resistivity of the metal of a wire by measuring how its resistance R varies with length L.",
  variables:{
    iv:"Length L of wire between the clips (m), measured with a metre rule",
    dv:"Resistance R (Ω), measured with a digital multimeter — three repeats",
    cv:["Same wire (same material and diameter)","Small current so the wire doesn’t heat","Clips pressed firmly the same way"]
  },
  columns:[{key:"L",label:"L / m",dp:3},{key:"R1",label:"R₁ / Ω",dp:2},{key:"R2",label:"R₂ / Ω",dp:2},{key:"R3",label:"R₃ / Ω",dp:2},
    {key:"R",label:"mean R / Ω",dp:2},{key:"dR",label:"ΔR / Ω",dp:2}],
  graph:{ x:["L"], y:["R"], yErr:{ R:"dR" }, fit:"linear" },
  questions:[
    { q:"Show that the gradient of the R–L graph equals ρ/A.",
      a:"R = ρL/A. Comparing with y = mx + c, a graph of R against L is a straight line with gradient ρ/A, so ρ = gradient × A = gradient × πd²/4." },
    { q:"Why does the line not pass through the origin?",
      a:"There is extra resistance from the contacts between the clips and the wire (and the leads). This adds a constant to every reading — a systematic error that shows up as a y-intercept but does not change the gradient." },
    { q:"Why is the diameter measured at several points along the wire, in different orientations?",
      a:"The wire may not be perfectly uniform or circular. Averaging several readings reduces the effect of random variation and gives a better value for the mean diameter." },
    { q:"The diameter is 0.28 ± 0.01 mm. What is the percentage uncertainty in the cross-sectional area?",
      a:"%Δd = 0.01/0.28 × 100 = 3.6%. A ∝ d², so %ΔA = 2 × 3.6 = 7.1%. The diameter is usually the largest source of uncertainty in this experiment." },
    { q:"Calculate the percentage uncertainty in ρ.",
      a:"%Δρ = %Δ(gradient) + %ΔA. Take the gradient uncertainty from the best and worst acceptable lines and add it to 2 × %Δd." }
  ],
  setup(ctx){
    const rho = (4.6 + Math.random()*0.6)*1e-7;                         // Ω m, hidden
    const d = [0.254, 0.274, 0.315, 0.345][Math.floor(Math.random()*4)]; // mm, hidden
    const zero = [-0.02, -0.01, 0, 0.01, 0.02][Math.floor(Math.random()*5)];
    const rc = 0.08 + Math.random()*0.08;                                // contact resistance
    let Lmm = 500, diam = [], zeroSeen = false, pending = [], shown = null;
    const A = dm => Math.PI*Math.pow(dm/2000, 2);                      // mm → m², area
    const Rtrue = () => rho*(Lmm/1000)/A(d) + rc;
    const meter = () => Math.round((Rtrue() + 0.015*ctx.gauss())*100)/100;

    let ticks = "";
    for(let c = 0; c <= 100; c++){
      const x = 40 + c*4.8, h = c % 10 === 0 ? 12 : c % 5 === 0 ? 8 : 4;
      ticks += `<line x1="${x}" y1="150" x2="${x}" y2="${150 + h}" stroke="var(--txt2)" stroke-width=".7"/>`;
      if(c % 10 === 0) ticks += `<text class="lbl" x="${x}" y="176" text-anchor="middle" style="font-size:10px">${c}</text>`;
    }
    ctx.stage.innerHTML = `
    <svg viewBox="0 0 560 330" aria-label="Resistance wire on a metre rule connected to a multimeter, with a micrometer">
      <rect x="30" y="140" width="500" height="44" rx="3" fill="#E9D9A6" stroke="#B8A26A"/>
      ${ticks}
      <line x1="40" y1="134" x2="520" y2="134" stroke="#B87333" stroke-width="2"/>
      <g><rect x="34" y="122" width="12" height="18" rx="2" fill="#333"/></g>
      <g id="rs-jockey"><rect x="-6" y="122" width="12" height="18" rx="2" fill="#C0392B"/></g>
      <path id="rs-lead1" fill="none" stroke="#333" stroke-width="2"/>
      <path id="rs-lead2" fill="none" stroke="#C0392B" stroke-width="2"/>
      <g transform="translate(220 220)">
        <rect width="120" height="90" rx="10" fill="#E8B400" stroke="var(--txt2)"/>
        <rect x="12" y="10" width="96" height="36" rx="4" fill="#C9D4B8"/>
        <text id="rs-ohm" x="100" y="36" text-anchor="end" style="font:600 20px ui-monospace,Menlo,monospace;fill:#1a1a1a"></text>
        <circle cx="40" cy="70" r="5" fill="#333"/><circle cx="80" cy="70" r="5" fill="#C0392B"/>
        <text x="60" y="58" text-anchor="middle" style="font:9px sans-serif;fill:#333">Ω 20</text>
      </g>
      <g transform="translate(395 205)" id="rs-mic">
        <path d="M0 10 h10 v-20 h50 v40 h-50 v-20" fill="none" stroke="var(--txt2)" stroke-width="5"/>
        <rect x="60" y="2" width="40" height="16" fill="var(--txt3)"/><rect x="100" y="-4" width="34" height="28" rx="3" fill="var(--txt2)"/>
        <text class="lbl" x="0" y="52">micrometer</text>
        <text class="lblb" id="rs-micr" x="0" y="72"></text>
      </g>
      <text class="lbl" x="40" y="205" id="rs-L"></text>
    </svg>`;
    const $ = s => ctx.stage.querySelector(s);

    function draw(){
      const x = 40 + Lmm/10*4.8;
      $("#rs-jockey").setAttribute("transform", `translate(${x} 0)`);
      $("#rs-lead1").setAttribute("d", `M40 122 C40 60 220 60 260 290`);
      $("#rs-lead2").setAttribute("d", `M${x} 122 C${x} 70 300 70 300 290`);
      $("#rs-ohm").textContent = shown === null ? "-.--" : shown.toFixed(2);
      $("#rs-L").textContent = `L = ${(Lmm/1000).toFixed(3)} m`;
      ctx.readout([["L", (Lmm/1000).toFixed(3) + " m"], ["Multimeter", "fluctuates ±0.02 Ω"],
        ["Repeats so far", pending.length + " of 3"], ["Diameter readings", String(diam.length)]]);
    }

    ctx.slider({ label:"Length L (move the clip)", min:100, max:900, step:5, value:Lmm, fmt:v => (v/1000).toFixed(3), unit:"m",
      onInput(v){ Lmm = v; pending = []; shown = null; draw(); } });
    ctx.buttons([{ label:"Take R reading (×3 then record)", primary:true, block:true, onClick(){
      shown = meter(); pending.push(shown);
      if(pending.length === 3){
        ctx.record({ L:Lmm/1000, R1:pending[0], R2:pending[1], R3:pending[2],
          R:Number(mean(pending).toFixed(2)), dR:Number(Math.max(0.01, halfRange(pending)).toFixed(2)) });
        pending = [];
      }else ctx.toast(`Reading ${pending.length} of 3: ${pending[pending.length - 1].toFixed(2)} Ω`);
      draw();
    } }]);

    const dbox = ctx.html(`<div class="ctl"><div class="lbl"><span>Diameter (micrometer)</span></div><div id="rs-d" class="hint"></div></div>`);
    ctx.buttons([
      { label:"Close jaws (zero check)", onClick(){ zeroSeen = true; $("#rs-micr").textContent = `closed: ${zero >= 0 ? "+" : "−"}${Math.abs(zero).toFixed(2)} mm`; showD(); } },
      { label:"Measure diameter", onClick(){
        const r = Math.round((d + zero + 0.004*ctx.gauss())*100)/100; diam.push(r);
        $("#rs-micr").textContent = `reading: ${r.toFixed(2)} mm`; showD(); draw(); } }
    ]);
    function showD(){
      dbox.querySelector("#rs-d").innerHTML = (diam.length ? `Readings: ${diam.map(v => v.toFixed(2)).join(", ")} mm<br>Mean = <b>${mean(diam).toFixed(3)} mm</b>, ± ${Math.max(0.01, halfRange(diam)).toFixed(2)} mm` : "Take at least 3 readings at different points.")
        + (zeroSeen ? `<br>Zero reading: ${zero >= 0 ? "+" : "−"}${Math.abs(zero).toFixed(2)} mm` : "");
    }
    answerBox(ctx, "Resistivity ρ (× 10⁻⁷ Ω m)", "e.g. 4.9", v => {
      const rows = ctx.rows().filter(r => typeof r.R === "number");
      if(rows.length < 4) return [false, "Record at least 4 lengths first."];
      if(diam.length < 3) return [false, "Take at least 3 diameter readings."];
      const f = ctx.linFit(rows.map(r => [r.L, r.R]));
      const good = f.m*A(mean(diam) - zero)*1e7, raw = f.m*A(mean(diam))*1e7;
      if(Math.abs(v - good)/good <= 0.05)
        return [true, `Correct from your data: ρ = ${good.toFixed(2)} × 10⁻⁷ Ω m (gradient ${f.m.toFixed(3)} Ω/m). True value: ${(rho*1e7).toFixed(2)} × 10⁻⁷ Ω m.`];
      if(zero !== 0 && Math.abs(v - raw)/raw <= 0.05)
        return [false, "Close — but you haven’t corrected the diameter for the micrometer’s zero error. Check the zero reading."];
      return [false, "Not quite. ρ = gradient × A, where A = πd²/4 with d in metres. Use the straight-line gradient, not one reading."];
    });
    showD(); draw();
  }
});

/* ───────────── AS · SIMPLE PENDULUM ───────────── */
Lab.register({
  id:"pendulum", subject:"physics", level:["igcse","as"], topic:"Oscillations · Measurement", icon:"🕰️",
  title:"Simple pendulum: finding g",
  summary:"Time 20 oscillations twice for each length, plot T² against L with error bars and calculate g.",
  aim:"Determine the acceleration of free fall g using a simple pendulum, with an estimate of its uncertainty.",
  variables:{
    iv:"Length L of the pendulum (m), from the pivot to the centre of the bob",
    dv:"Period T (s), from the time for 20 oscillations",
    cv:["Small amplitude (< 10°)","Same bob","Timing from the centre of the swing using a fiducial marker"]
  },
  columns:[{key:"L",label:"L / m",dp:3},{key:"t1",label:"20T₁ / s",dp:2},{key:"t2",label:"20T₂ / s",dp:2},{key:"T",label:"T / s",dp:3},
    {key:"T2",label:"T² / s²",dp:3},{key:"dT2",label:"Δ(T²) / s²",dp:3}],
  graph:{ x:["L"], y:["T2","T"], yErr:{ T2:"dT2" }, fit:"linear" },
  questions:[
    { q:"Why time 20 oscillations rather than one?",
      a:"Human reaction time (≈ 0.1–0.2 s) is a fixed absolute uncertainty. Timing many oscillations makes it a much smaller percentage of the measured time, so T is more precise." },
    { q:"Why plot T² against L rather than T against L?",
      a:"T = 2π√(L/g), so T² = (4π²/g)L. A graph of T² against L is a straight line through the origin with gradient 4π²/g, so g = 4π² ÷ gradient." },
    { q:"How is the uncertainty in T² found from the uncertainty in T?",
      a:"%Δ(T²) = 2 × %ΔT, so Δ(T²) = 2T·ΔT. ΔT comes from half the range of the repeat timings, divided by 20." },
    { q:"Suggest two improvements to this experiment.",
      a:"Use a fiducial marker at the centre of the swing; use a light gate and timer instead of a stopwatch; take more repeats; use longer lengths so T is larger; measure L to the centre of mass of the bob." }
  ],
  setup(ctx){
    const g = 9.81;
    let Lmm = 600, timing = false, tt = 0, swings = [], th = 0;
    const T = () => 2*Math.PI*Math.sqrt(Lmm/1000/g);
    const SPEED = 4;

    ctx.stage.innerHTML = `
    <svg viewBox="0 0 520 380" aria-label="Pendulum bob on a string swinging from a clamp">
      <rect x="40" y="365" width="200" height="10" rx="3" fill="var(--txt3)"/><rect x="50" y="20" width="8" height="350" fill="var(--txt3)"/>
      <rect x="50" y="22" width="220" height="8" fill="var(--txt3)"/>
      <rect x="250" y="16" width="28" height="22" rx="3" fill="var(--txt2)"/>
      <line x1="264" y1="40" x2="264" y2="370" stroke="var(--txt3)" stroke-dasharray="4 5"/>
      <text class="lbl" x="270" y="360">fiducial marker</text>
      <g id="pd-p"><line x1="0" y1="0" id="pd-s" stroke="var(--txt)" stroke-width="1.4"/><circle id="pd-b" r="11" fill="var(--accent)"/></g>
      <g transform="translate(340 40)"><rect width="160" height="90" rx="10" fill="var(--bg-card)" stroke="var(--brd)"/>
        <text class="lbl" x="12" y="22">Stopwatch (0.01 s)</text><text class="lblb" id="pd-clock" x="12" y="50" style="font-size:22px">0.00</text>
        <text class="lbl" x="12" y="76" id="pd-n"></text></g>
    </svg>`;
    const $ = s => ctx.stage.querySelector(s);
    const PX = 300/1.0;                                        // px per metre

    ctx.frame(dt => {
      th += dt*(timing ? SPEED : 1);
      const ang = 0.13*Math.cos(2*Math.PI*th/T());
      const len = Lmm/1000*PX, bx = 264 + len*Math.sin(ang), by = 38 + len*Math.cos(ang);
      const s = $("#pd-s"); s.setAttribute("x1", 264); s.setAttribute("y1", 38); s.setAttribute("x2", bx); s.setAttribute("y2", by);
      $("#pd-b").setAttribute("cx", bx); $("#pd-b").setAttribute("cy", by);
      if(timing){
        tt += dt*SPEED;
        const n = Math.min(20, Math.floor(tt/T()));
        $("#pd-clock").textContent = tt.toFixed(2); $("#pd-n").textContent = `oscillations: ${n}`;
        if(tt >= 20*T()){
          timing = false;
          const t = Math.round((20*T() + 0.12*ctx.gauss())*100)/100;      // reaction-time error
          swings.push(t); $("#pd-clock").textContent = t.toFixed(2);
          lock(false);
          if(swings.length === 2){
            const Tm = mean(swings)/20, dT = Math.max(0.1, halfRange(swings))/20;
            ctx.record({ L:Lmm/1000, t1:swings[0], t2:swings[1], T:Number(Tm.toFixed(3)), T2:Number((Tm*Tm).toFixed(3)), dT2:Number((2*Tm*dT).toFixed(3)) });
            swings = [];
          }else ctx.toast(`Trial 1: ${t.toFixed(2)} s — now repeat`);
          info();
        }
      }
    });
    function info(){ ctx.readout([["L", (Lmm/1000).toFixed(3) + " m"], ["Trials at this length", swings.length + " of 2"], ["Timing", "×" + SPEED + " speed"]]); }

    const sl = ctx.slider({ label:"Length L", min:200, max:1000, step:5, value:Lmm, fmt:v => (v/1000).toFixed(3), unit:"m",
      onInput(v){ Lmm = v; swings = []; info(); } });
    const [go] = ctx.buttons([{ label:"Time 20 oscillations", primary:true, block:true, onClick(){
      if(timing) return; timing = true; tt = 0; th = 0; lock(true);
    } }]);
    function lock(on){ sl.disable(on); go.disabled = on; }
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Each length is timed twice; ΔT comes from the half-range (at least 0.1 s for reaction time). Use at least 6 lengths spread over the range.</p>`);
    answerBox(ctx, "g (m s⁻²)", "e.g. 9.8", v => {
      const rows = ctx.rows().filter(r => typeof r.T2 === "number");
      if(rows.length < 4) return [false, "Record at least 4 lengths first."];
      const f = ctx.linFit(rows.map(r => [r.L, r.T2])), gg = 4*Math.PI*Math.PI/f.m;
      return Math.abs(v - gg)/gg <= 0.03
        ? [true, `Correct from your data: g = 4π² ÷ ${f.m.toFixed(3)} = ${gg.toFixed(2)} m s⁻². Accepted value 9.81 m s⁻² (${(Math.abs(gg - 9.81)/9.81*100).toFixed(1)}% difference).`]
        : [false, "Not quite. g = 4π² ÷ gradient of the T²–L graph (with L in metres)."];
    });
    info();
  }
});

/* ───────────── A LEVEL · CAPACITOR DISCHARGE ───────────── */
Lab.register({
  id:"capacitor", subject:"physics", level:"a", topic:"Capacitance · Exponential decay", icon:"🔋",
  title:"Capacitor discharge & time constant",
  summary:"Discharge a capacitor through a resistor, linearise with ln V and find the time constant RC.",
  aim:"Investigate how the p.d. across a capacitor decreases with time as it discharges through a resistor, and determine the time constant.",
  variables:{
    iv:"Time t since the switch was moved (s)",
    dv:"p.d. V across the capacitor (V), on a high-resistance voltmeter",
    cv:["Same capacitor and resistor during a run","Capacitor fully charged to the same p.d. each time"]
  },
  columns:[{key:"run",label:"Circuit"},{key:"t",label:"t / s",dp:0},{key:"V",label:"V / V",dp:2},{key:"lnV",label:"ln (V / V)",dp:3}],
  series:"run",
  graph:{ x:["t"], y:["lnV","V"], fit:"linear" },
  questions:[
    { q:"Show that a graph of ln V against t is a straight line, and state its gradient.",
      a:"V = V₀e^(−t/RC). Taking natural logs: ln V = ln V₀ − t/RC. This is y = c + mx with gradient −1/RC and y-intercept ln V₀." },
    { q:"What is the time constant, and what fraction of V₀ is left after one time constant?",
      a:"τ = RC, the time for the p.d. (or charge, or current) to fall to 1/e ≈ 37% of its initial value." },
    { q:"Why must the voltmeter have a very high resistance?",
      a:"Otherwise the capacitor also discharges through the voltmeter, which acts as a resistor in parallel with R. The time constant would appear smaller than RC." },
    { q:"Your gradient gives τ = 47 s with R = 47 kΩ. Calculate C.",
      a:"C = τ/R = 47 / 47 000 = 1.0 × 10⁻³ F = 1000 µF." },
    { q:"Capacitors often have a tolerance of ±20%. How would this show in your results?",
      a:"The experimental time constant may differ from the nominal RC by up to about 20%. The experimental value is the real one for that component." }
  ],
  setup(ctx){
    const CS = { 470:470e-6, 1000:1000e-6, 2200:2200e-6 }, RS = { 10:10e3, 22:22e3, 47:47e3 };
    const tolC = {}, tolR = {};
    Object.keys(CS).forEach(k => tolC[k] = 1 + (Math.random() - .5)*0.3);   // hidden ±15%
    Object.keys(RS).forEach(k => tolR[k] = 1 + (Math.random() - .5)*0.08);  // hidden ±4%
    let cKey = "1000", rKey = "22", every = 5, speed = 5, running = false, t = 0, nextRec = 0, charged = true;
    const V0 = 6.00;
    const tau = () => CS[cKey]*tolC[cKey]*RS[rKey]*tolR[rKey];
    const V = tt => V0*Math.exp(-tt/tau());
    const label = () => `${cKey} µF, ${rKey} kΩ`;
    const read = tt => Math.max(0, Math.round((V(tt) + 0.004*ctx.gauss())*100)/100);

    ctx.stage.innerHTML = `
    <svg viewBox="0 0 540 320" aria-label="Capacitor discharge circuit with a two-way switch, resistor and voltmeter">
      <path class="ink" d="M60 70 H120 M132 70 H200 M60 70 V250 H340 V200 M340 120 V70 H300"/>
      <line x1="120" y1="58" x2="120" y2="82" stroke="var(--txt)" stroke-width="2"/><line x1="132" y1="63" x2="132" y2="77" stroke="var(--txt)" stroke-width="5"/>
      <text class="lbl" x="118" y="48">6.0 V</text>
      <circle cx="200" cy="70" r="4" fill="var(--txt)"/><circle cx="300" cy="70" r="4" fill="var(--txt)"/><circle cx="250" cy="120" r="4" fill="var(--txt)"/>
      <line id="cp-sw" x1="250" y1="120" stroke="var(--txt)" stroke-width="3"/>
      <path class="ink" d="M250 120 V160"/>
      <line x1="226" y1="160" x2="274" y2="160" stroke="var(--txt)" stroke-width="3"/><line x1="226" y1="172" x2="274" y2="172" stroke="var(--txt)" stroke-width="3"/>
      <path class="ink" d="M250 172 V250 M250 140 H170 V182 M170 218 V250"/>
      <circle cx="250" cy="140" r="3.5" fill="var(--txt)"/><circle cx="170" cy="250" r="3.5" fill="var(--txt)"/><circle cx="250" cy="250" r="3.5" fill="var(--txt)"/>
      <text class="lbl" x="244" y="200" text-anchor="end" id="cp-cl"></text>
      <rect x="326" y="120" width="28" height="80" class="ink" fill="var(--bg-card)"/>
      <text class="lbl" x="362" y="165" id="cp-rl"></text>
      <circle cx="170" cy="200" r="18" class="ink" fill="var(--bg-card)"/><text class="lblb" x="170" y="205" text-anchor="middle">V</text>
      <rect id="cp-q" x="228" y="150" width="44" height="6" fill="var(--accent)"/>
      <g transform="translate(400 40)"><rect width="125" height="110" rx="10" fill="var(--bg-card)" stroke="var(--brd)"/>
        <text class="lbl" x="12" y="22">Voltmeter</text><text class="lblb" id="cp-v" x="12" y="50" style="font-size:22px"></text>
        <text class="lbl" x="12" y="76">Timer</text><text class="lblb" id="cp-t" x="12" y="98" style="font-size:16px"></text></g>
    </svg>`;
    const $ = s => ctx.stage.querySelector(s);

    function draw(){
      const v = running || !charged ? V(t) : V0;
      const sw = running || !charged ? [300, 70] : [200, 70];
      $("#cp-sw").setAttribute("x2", sw[0]); $("#cp-sw").setAttribute("y2", sw[1]);
      $("#cp-q").setAttribute("opacity", (v/V0).toFixed(2));
      $("#cp-v").textContent = (running || !charged ? read(t) : V0).toFixed(2) + " V";
      $("#cp-t").textContent = Math.floor(t) + " s";
      $("#cp-cl").textContent = cKey + " µF"; $("#cp-rl").textContent = rKey + " kΩ";
      ctx.readout([["Circuit", label()], ["Nominal RC", (CS[cKey]*RS[rKey]).toFixed(1) + " s"], ["Speed", "×" + speed],
        ["Switch", running || !charged ? "discharging through R" : "charging from cell"]]);
    }
    ctx.frame(dt => {
      if(!running) return;
      t += dt*speed;
      while(t >= nextRec){
        const v = read(nextRec);
        if(v > 0.05) ctx.record({ run:label(), t:nextRec, V:v, lnV:Number(Math.log(v).toFixed(3)) }, true);
        nextRec += every;
      }
      if(t > Math.min(300, 4*tau())){ running = false; lock(false); ctx.toast("Discharge run complete"); }
      draw();
    });

    const cs = ctx.seg({ label:"Capacitor (nominal)", value:cKey, options:[["470","470 µF"],["1000","1000 µF"],["2200","2200 µF"]], onChange(v){ cKey = v; reset(); } });
    const rs = ctx.seg({ label:"Resistor", value:rKey, options:[["10","10 kΩ"],["22","22 kΩ"],["47","47 kΩ"]], onChange(v){ rKey = v; reset(); } });
    const es = ctx.seg({ label:"Reading interval", value:every, options:[[2,"2 s"],[5,"5 s"],[10,"10 s"]], onChange(v){ every = v; } });
    ctx.seg({ label:"Simulation speed", value:speed, options:[[1,"×1"],[5,"×5"],[20,"×20"]], onChange(v){ speed = v; } });
    const [go] = ctx.buttons([{ label:"Flip switch — start discharge", primary:true, onClick(){
      if(running) return; t = 0; nextRec = 0; charged = false; running = true; lock(true);
    } }, { label:"Recharge", onClick(){ reset(); } }]);
    function lock(on){ cs.disable(on); rs.disable(on); es.disable(on); go.disabled = on; }
    function reset(){ running = false; charged = true; t = 0; nextRec = 0; lock(false); draw(); }
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Readings are logged automatically. Plot <b>ln V</b> against t: gradient = −1/RC.</p>`);
    answerBox(ctx, "Time constant τ of your latest run (s)", "e.g. 22", v => {
      const rows = ctx.rows(); if(!rows.length) return [false, "Run a discharge first."];
      const last = rows[rows.length - 1].run, pts = rows.filter(r => r.run === last && typeof r.lnV === "number").map(r => [r.t, r.lnV]);
      if(pts.length < 4) return [false, "Need at least 4 readings from that run."];
      const f = ctx.linFit(pts), tt = -1/f.m;
      return Math.abs(v - tt)/tt <= 0.04
        ? [true, `Correct: τ = −1 ÷ (${f.m.toFixed(4)}) = ${tt.toFixed(1)} s for ${last}. Nominal RC was ${(parseFloat(last)*1e-6*parseFloat(last.split(", ")[1])*1e3).toFixed(1)} s — the difference is component tolerance.`]
        : [false, "Not quite. τ = −1 ÷ gradient of ln V against t, for the run you just did."];
    });
    draw();
  }
});
