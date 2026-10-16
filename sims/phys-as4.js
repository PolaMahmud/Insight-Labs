"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · AS LEVEL (9702) — part 4: experiments named in the AS content
   Free fall (2.1.8) · Resonance tube (8.1.2) · Microwaves (8.1–8.3) ·
   Potentiometer and null method (9.3.3)
══════════════════════════════════════════════════════════════════ */

/* ───────────── ACCELERATION OF FREE FALL ───────────── */
Lab.register({
  id:"freefall", subject:"physics", level:["as"], topic:"Kinematics · Free fall", interactive:true,
  title:"Acceleration of free fall",
  summary:"Drop a steel ball from an electromagnet through a trapdoor that stops an electronic timer, and plot h against t² to find g.",
  aim:"Determine the acceleration of free fall g by timing a ball falling from rest through measured heights.",
  variables:{ iv:"Height h of fall (m)", dv:"Time of fall t (s), repeated", cv:["Same ball","Ball released from rest","h measured from the bottom of the ball to the trapdoor"] },
  stageTitle:"Electromagnet, ball and trapdoor", controlsTitle:"Drop",
  thumb:`<svg viewBox="0 0 300 140"><rect x="40" y="10" width="10" height="124" fill="#D9B07A"/><rect x="120" y="10" width="40" height="16" rx="3" fill="#64748B"/><circle cx="140" cy="62" r="8" fill="#94A3B8"/><path d="M140 72 v40" stroke="#4DA3FF" stroke-dasharray="3 3"/><rect x="110" y="118" width="60" height="6" fill="#334155"/><rect x="200" y="40" width="70" height="36" rx="6" fill="#132A1F"/><text x="262" y="64" text-anchor="end" style="font:700 14px monospace;fill:#5FBF8A">0.452</text></svg>`,
  challenges:[
    { id:"six",   title:"Six heights", text:"Record t for six heights spread over at least 60 cm (two drops each)." },
    { id:"g",     title:"Find g", text:"Plot h against t² and use the gradient to find g." },
    { id:"delay", title:"Systematic error", text:"Answer: what does the intercept of the h–t² line tell you?" }
  ],
  columns:[{key:"h",label:"h / m",dp:3},{key:"t1",label:"t₁ / s",dp:3},{key:"t2",label:"t₂ / s",dp:3},{key:"t",label:"t / s",dp:3},{key:"t2s",label:"t² / s²",dp:4},{key:"dt2",label:"Δ(t²) / s²",dp:4}],
  graph:{ x:["t2s","t"], y:["h"], fit:"linear" },
  questions:[
    { q:"Show that a graph of h against t² is a straight line through the origin, and give its gradient.",
      a:"From s = ut + ½at² with u = 0 and a = g: h = ½gt². So h against t² is a straight line through the origin with gradient g/2, and g = 2 × gradient." },
    { q:"The line does not pass through the origin: it cuts the t² axis at a small positive value. Explain.",
      a:"The magnet does not release the ball the instant the current is switched off (residual magnetism), so the timer has already been running for a few milliseconds. Every time is too long by the same amount: a systematic error. Using the gradient, not a single h ÷ t² value, removes its effect." },
    { q:"Why are heights below about 20 cm avoided?",
      a:"The times are short, so the fixed delay and the timer resolution are a large percentage of the time. The percentage uncertainty in t (and so in t²) becomes large." },
    { q:"Suggest two improvements.",
      a:"Use a small dense ball so air resistance is negligible. Use light gates a known distance apart so that the release delay does not matter. Measure h with a set square so the rule is read at eye level, perpendicular to the scale." }
  ],
  setup(ctx){
    const G = 9.81, DELAY = .004 + Math.random()*.006, S = 380, TOP = 70, TRAP = 470, R = 9;
    let h = .5, phase = "held", tf = 0, y = 0, trials = [], measured = null, shown = 0;
    const tTrue = () => Math.sqrt(2*h/G) + DELAY;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 560" class="kb" id="ff-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 530)}
      <rect x="150" y="40" width="14" height="490" fill="url(#k-metal)"/><rect x="120" y="520" width="80" height="12" fill="#475569"/>
      <g id="ff-rule"></g><g id="ff-scene"></g>
      <g transform="translate(560 80)"><rect width="250" height="120" rx="12" fill="#334155" stroke="#1F2937"/><text x="16" y="24" style="font:700 10px Inter;fill:#CBD5E1">ELECTRONIC TIMER</text>
        <rect x="16" y="34" width="218" height="52" rx="6" fill="#132A1F"/><text id="ff-lcd" x="200" y="72" text-anchor="end" class="k-lcd" style="font-size:26px">0.000</text><text x="226" y="72" text-anchor="end" style="font:600 11px Inter;fill:#5FBF8A">s</text>
        <text x="16" y="108" style="font:500 10px Inter;fill:#94A3B8">starts when the magnet is switched off · stops at the trapdoor</text></g>
      <g transform="translate(560 250)"><circle r="70" cx="70" cy="70" fill="#F7F9FC" stroke="var(--accent)" stroke-width="3"/><clipPath id="ff-clip"><circle cx="70" cy="70" r="68"/></clipPath><g clip-path="url(#ff-clip)" id="ff-zoom"></g>
        <text x="70" y="160" text-anchor="middle" class="k-lbl">bottom of the ball against the rule</text></g>
      <text x="24" y="34" class="k-status" id="ff-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ff-svg"), $ = s => svg.querySelector(s);
    const yOf = hh => TRAP - hh*S;                                   // svg y of the ball's bottom when h above the trapdoor
    let rule = `<rect x="200" y="${yOf(1.05)}" width="34" height="${1.05*S + 6}" fill="url(#k-wood)" stroke="#7B4F2C"/>`;
    for(let c = 0; c <= 105; c++){ const yy = yOf(c/100), big = c % 10 === 0, mid = c % 5 === 0; rule += `<line x1="200" y1="${yy}" x2="${200 + (big ? 14 : mid ? 10 : 6)}" y2="${yy}" stroke="#4B3621" stroke-width=".7"/>`; if(big) rule += `<text x="218" y="${yy + 3}" style="font:600 8px 'JetBrains Mono';fill:#4B3621">${c}</text>`; }
    $("#ff-rule").innerHTML = rule + `<text x="217" y="${yOf(0) + 22}" text-anchor="middle" class="k-lbl">cm</text>`;
    function draw(){
      const by = phase === "held" ? yOf(h) : Math.min(yOf(h) + y*S, TRAP);
      $("#ff-scene").innerHTML = `<rect x="164" y="${yOf(h) - 2*R - 24}" width="16" height="10" fill="#475569"/>
        <rect x="236" y="${yOf(h) - 2*R - 30}" width="60" height="28" rx="4" fill="#64748B" stroke="#334155" class="k-drag" id="ff-mag"/><text x="266" y="${yOf(h) - 2*R - 12}" text-anchor="middle" style="font:700 9px Inter;fill:#F1F5F9" pointer-events="none">MAGNET</text>
        <rect x="180" y="${yOf(h) - 2*R - 22}" width="56" height="6" fill="#475569"/>
        <circle cx="266" cy="${by - R}" r="${R}" fill="url(#k-metal)" stroke="#334155"/>
        <path d="M236 ${TRAP} h${phase === "open" ? 4 : 60}" stroke="#334155" stroke-width="5"/>${phase === "open" ? `<path d="M240 ${TRAP} l-6 40" stroke="#334155" stroke-width="5"/>` : ""}
        <rect x="296" y="${TRAP - 6}" width="20" height="14" fill="#475569"/><text x="306" y="${TRAP + 26}" text-anchor="middle" class="k-lbl">trapdoor</text>
        <path d="M296 ${TRAP} C380 ${TRAP} 480 300 560 180" stroke="#64748B" stroke-width="2" fill="none"/><path d="M296 ${yOf(h) - 2*R - 16} C400 ${yOf(h)} 500 160 560 140" stroke="#DC2626" stroke-width="2" fill="none"/>`;
      // magnifier: rule around the ball's bottom
      const hv = (TRAP - by)/S*100; let z = `<rect width="140" height="140" fill="#F7F9FC"/><rect x="0" y="0" width="60" height="140" fill="#D9B07A"/>`;
      for(let mm = Math.floor((hv - 2.2)*10); mm <= (hv + 2.2)*10; mm++){ const yy = 70 - (mm/10 - hv)*30, big = mm % 10 === 0, mid = mm % 5 === 0; z += `<line x1="0" y1="${yy}" x2="${big ? 30 : mid ? 22 : 14}" y2="${yy}" stroke="#2B1D10" stroke-width="${big ? 1.6 : .9}"/>`; if(big) z += `<text x="34" y="${yy + 5}" style="font:600 14px 'JetBrains Mono';fill:#2B1D10">${mm/10}</text>`; }
      z += `<circle cx="100" cy="${70 - R*3.3}" r="${R*3.3}" fill="url(#k-metal)" stroke="#334155"/><line x1="0" y1="70" x2="140" y2="70" stroke="var(--accent)" stroke-dasharray="4 3"/>`;
      $("#ff-zoom").innerHTML = z;
      $("#ff-lcd").textContent = shown.toFixed(3);
      $("#ff-status").textContent = phase === "held" ? (measured === null ? "Drag the magnet to a height, then read h on the rule" : "Switch off the magnet to drop the ball") : phase === "fall" ? "Falling…" : "Timer stopped — note the time, then reset";
      ctx.readout([["h (your reading)", measured === null ? "—" : measured.toFixed(3) + " m"], ["Drops at this height", `${trials.length} of 2`], ["Last time", trials.length ? trials[trials.length - 1].toFixed(3) + " s" : "—"]]);
    }
    ctx.frame(dt => {
      if(phase === "fall"){
        tf += dt*.5;                                                  // shown at half speed
        shown = Math.min(tf, tTrue());
        y = Math.max(0, .5*G*Math.max(0, tf - DELAY)**2);
        if(tf >= tTrue()){ phase = "open"; shown = Kit.round(tTrue() + (Math.random() - .5)*.004, 3); trials.push(shown); }
      }
      draw();
    });
    Kit.dragger(ctx, svg, {
      hit(t){ return t.closest("#ff-mag") && phase === "held" ? {} : null; },
      move(_, p){ const nh = Kit.clamp(Kit.round((TRAP - p.y - 2*R - 14)/S, 3), .15, 1.0); if(Math.abs(nh - h) > 1e-4){ h = nh; measured = null; trials = []; } }
    });
    const rd = Kit.reading(ctx, "Height h from the bottom of the ball / m", "e.g. 0.512", () => phase === "held" ? h : null, .002, v => { measured = v; rd.clear(); });
    ctx.buttons([{ label:"Switch off the magnet", primary:true, block:true, onClick(){
      if(phase !== "held") return ctx.toast("Reset the ball first");
      if(measured === null) return ctx.toast("Read the height on the rule first");
      if(trials.length >= 2) return ctx.toast("Two drops done — record them, or move the magnet");
      phase = "fall"; tf = 0; y = 0; shown = 0;
    } }, { label:"Reset ball and timer", onClick(){ if(phase === "fall") return; phase = "held"; y = 0; shown = 0; } }]);
    ctx.buttons([{ label:"Record this height", onClick(){
      if(trials.length < 2) return ctx.toast("Drop the ball twice at this height first");
      const tm = Kit.mean(trials), dt = Math.max(Kit.halfRange(trials), .001);
      ctx.record({ h:measured, t1:trials[0], t2:trials[1], t:Kit.round(tm, 3), t2s:Kit.round(tm*tm, 4), dt2:Kit.round(2*tm*dt, 4) });
      trials = [];
      const hs = ctx.rows().map(r => r.h);
      if(new Set(hs).size >= 6 && Math.max(...hs) - Math.min(...hs) >= .6) ctx.complete("six");
    } }]);
    Kit.answer(ctx, "g from your gradient / m s⁻²", "e.g. 9.8", v => {
      const pts = ctx.rows().map(r => [r.t2s, r.h]); if(pts.length < 4) return [false, "Record at least four heights first."];
      const f = ctx.linFit(pts), g = 2*f.m;
      if(Math.abs(v - g)/g <= .03){ ctx.complete("g"); return [true, `Correct for your line: g = ${g.toFixed(2)} m s⁻² (gradient ${f.m.toFixed(3)} m s⁻², × 2).`]; }
      return [false, "h = ½gt², so the gradient of h against t² is g/2."];
    });
    ctx.seg({ label:"The h–t² line cuts the t² axis just to the right of zero. This shows…", value:null, options:[["air","air resistance"],["delay","a release delay"],["g","g is changing"]], onChange(v){
      if(v === "delay"){ ctx.complete("delay"); ctx.toast("Right — every time includes the same short delay before the ball is released"); } else ctx.toast("Think about an error that adds the same amount to every time"); } });
    draw();
  }
});

/* ───────────── RESONANCE TUBE: SPEED OF SOUND ───────────── */
Lab.register({
  id:"resonancetube", subject:"physics", level:["as"], topic:"Superposition · Stationary waves in air", interactive:true,
  title:"Resonance tube: speed of sound",
  summary:"Hold a sounding tuning fork over a tube in water and raise it until the air column resonates. Find the first and second resonance lengths and work out the speed of sound.",
  aim:"Use stationary waves in an air column closed at one end to measure the speed of sound.",
  variables:{ iv:"Frequency of the tuning fork f (Hz)", dv:"Resonance lengths l₁ and l₂ (cm)", cv:["Same tube (same end correction)","Same room temperature","Fork held just above the open end"] },
  stageTitle:"Tube in a tall jar of water", controlsTitle:"Tuning fork",
  thumb:`<svg viewBox="0 0 300 140"><rect x="120" y="20" width="60" height="118" fill="#7DD3FC" opacity=".35"/><rect x="138" y="8" width="24" height="120" fill="none" stroke="#CBD5E1" stroke-width="2"/><rect x="139" y="80" width="22" height="48" fill="#38BDF8" opacity=".6"/><path d="M150 12 q-10 34 0 68 M150 12 q10 34 0 68" stroke="#4DA3FF" fill="none"/><path d="M140 4 v-6 M160 4 v-6" stroke="#94A3B8" stroke-width="4"/></svg>`,
  challenges:[
    { id:"first",  title:"First resonance", text:"Find l₁, the shortest air column that resonates, for one fork." },
    { id:"second", title:"Second resonance", text:"Find l₂ for the same fork and use v = 2f(l₂ − l₁)." },
    { id:"forks",  title:"Five forks", text:"Record l₁ (and l₂ where you can) for five forks, then plot l₁ against 1/f." },
    { id:"v",      title:"Speed of sound", text:"Enter the speed of sound you found." }
  ],
  columns:[{key:"f",label:"f / Hz",dp:0},{key:"inv",label:"(1/f) / ms",dp:3},{key:"l1",label:"l₁ / cm",dp:1},{key:"l2",label:"l₂ / cm",dp:1},{key:"v",label:"2f(l₂ − l₁) / m s⁻¹",dp:0}],
  graph:{ x:["inv"], y:["l1","l2"], fit:"linear" },
  questions:[
    { q:"Why does the air column resonate at l₁ ≈ λ/4 and l₂ ≈ 3λ/4?",
      a:"The closed end (water surface) must be a node and the open end an antinode. The shortest column with a node at one end and an antinode at the other is a quarter-wavelength; the next is three quarters." },
    { q:"What is the end correction, and how does using l₂ − l₁ remove it?",
      a:"The antinode forms slightly above the open end, so l₁ + e = λ/4 and l₂ + e = 3λ/4. Subtracting gives l₂ − l₁ = λ/2, and e cancels, so v = fλ = 2f(l₂ − l₁)." },
    { q:"What do the gradient and intercept of l₁ against 1/f give?",
      a:"l₁ = (v/4)(1/f) − e. The gradient is v/4 and the intercept on the l₁ axis is −e." },
    { q:"Why should the tube be raised slowly near resonance, and approached from both sides?",
      a:"The loud region is narrow. Approaching from above and below and taking the mean reduces the uncertainty in where the loudest point is." }
  ],
  setup(ctx){
    const FORKS = [256, 288, 320, 384, 426.7, 480, 512];
    const T = 18 + Math.round(Math.random()*8), V = 331.3*Math.sqrt(1 + T/273.15), D = 3.6, E = .6*D/2;   // cm; end correction 0.3 d
    const S = 3.4, TX = 340, TW = D*S*1.6, BOTJ = 560, TUBE = 100;   // 3.4 px per cm, 100 cm tube
    let f = 384, l = 40, struck = 0, found = {};
    const lam = () => V*100/f;                                           // cm
    const loud = () => { const k = 2*Math.PI/lam(), x = l + E; return struck*Math.min(1, 1/(1 + 400*Math.cos(k*x)**2)) * (1 - Math.exp(-l/6)); };
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 600" class="kb" id="rt-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 562)}
      <rect x="${TX - 50}" y="520" width="100" height="${BOTJ - 520}" fill="url(#k-water)" opacity=".75"/>
      <path d="M${TX - 52} 480 V${BOTJ + 2} H${TX + 52} V480" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2"/>
      <g id="rt-tube"></g><g id="rt-scale"></g><g id="rt-fork"></g>
      <g transform="translate(560 120)"><rect width="300" height="120" rx="12" fill="color-mix(in srgb,var(--bg-card) 88%,transparent)" stroke="var(--brd2)"/>
        <text x="16" y="26" class="k-lbl">how loud it sounds</text><rect x="16" y="40" width="268" height="22" rx="6" fill="var(--bg-inset,#0F172A)" stroke="var(--brd2)"/><rect id="rt-bar" x="18" y="42" height="18" rx="5" fill="#22C55E"/>
        <text x="16" y="100" class="k-lbl">room temperature</text><text x="284" y="100" text-anchor="end" class="k-tag">${T} °C</text></g>
      <text x="24" y="34" class="k-status" id="rt-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#rt-svg"), $ = s => svg.querySelector(s);
    const WL = 520;                                                       // water level in the jar (fixed)
    function draw(){
      const top = WL - l*S, bot = top + TUBE*S;
      $("#rt-tube").innerHTML = `<rect x="${TX - TW/2}" y="${top}" width="${TW}" height="${Math.min(bot, BOTJ) - top}" fill="rgba(255,255,255,.08)" stroke="#E2E8F0" stroke-width="2" class="k-drag" id="rt-t"/>
        <rect x="${TX - TW/2 + 2}" y="${WL}" width="${TW - 4}" height="${Math.min(bot, BOTJ) - WL}" fill="#38BDF8" opacity=".5" pointer-events="none"/>
        <line x1="${TX - 50}" y1="${WL}" x2="${TX + 50}" y2="${WL}" stroke="#7DD3FC" stroke-width="1.5" pointer-events="none"/>`;
      let sc = `<rect x="${TX + 60}" y="${WL - 105*S}" width="36" height="${105*S + 8}" fill="url(#k-wood)" stroke="#7B4F2C"/>`;
      for(let c = 0; c <= 105; c++){ const yy = WL - c*S, big = c % 10 === 0, mid = c % 5 === 0; sc += `<line x1="${TX + 60}" y1="${yy}" x2="${TX + 60 + (big ? 14 : mid ? 10 : 6)}" y2="${yy}" stroke="#4B3621" stroke-width=".7"/>`; if(big) sc += `<text x="${TX + 78}" y="${yy + 3}" style="font:600 8px 'JetBrains Mono';fill:#4B3621">${c}</text>`; }
      sc += `<line x1="${TX + TW/2}" y1="${top}" x2="${TX + 60}" y2="${top}" stroke="var(--accent)" stroke-dasharray="3 3"/><text x="${TX + 104}" y="${WL + 4}" class="k-lbl">0 at the water surface</text><text x="${TX + 104}" y="${top + 4}" class="k-lbl">top of the tube</text>`;
      $("#rt-scale").innerHTML = sc;
      const wob = struck > .02 ? Math.sin(performance.now()/18)*2*struck : 0;
      $("#rt-fork").innerHTML = `<g transform="translate(${TX} ${top - 16})" pointer-events="none"><path d="M${-8 - wob} -70 V0 M${8 + wob} -70 V0" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/><path d="M-8 0 Q0 10 8 0" stroke="#94A3B8" stroke-width="5" fill="none"/><path d="M0 8 v30" stroke="#64748B" stroke-width="6"/><text x="16" y="-56" class="k-tag">${f} Hz</text></g>`;
      $("#rt-bar").setAttribute("width", 264*Kit.clamp(loud(), 0, 1));
      $("#rt-bar").setAttribute("fill", loud() > .8 ? "#22C55E" : loud() > .3 ? "#F59E0B" : "#64748B");
      $("#rt-status").textContent = struck < .05 ? "Strike the fork, hold it over the tube, then drag the tube up or down" : loud() > .85 ? "Loud! The air column is resonating" : "Move the tube slowly to find where the sound is loudest";
      ctx.readout([["Fork", f + " Hz"], ["Sound", struck < .05 ? "silent" : loud() > .85 ? "resonance" : "quiet", loud() > .85 ? "good" : ""]]);
    }
    ctx.frame(dt => { struck = Math.max(0, struck - dt*.06); draw(); });
    Kit.dragger(ctx, svg, {
      hit(t, p){ return t.closest("#rt-t") ? { y0:p.y, l0:l } : null; },
      move(h, p){ l = Kit.clamp(h.l0 + (h.y0 - p.y)/S, 2, 95); }
    });
    ctx.select({ label:"Tuning fork", value:"384", options:FORKS.map(v => [String(v), v + " Hz"]), onChange(v){ f = +v; struck = 0; } });
    ctx.buttons([{ label:"Strike the fork", primary:true, block:true, onClick(){ struck = 1; } }]);
    const isRes = n => { const target = (2*n - 1)*lam()/4 - E; return Math.abs(l - target) <= .6 ? target : null; };
    const rd = Kit.reading(ctx, "Length of the air column l / cm", "e.g. 21.4", () => l, .3, v => {
      rd.clear();
      if(struck < .05) return ctx.toast("Strike the fork first so you can hear the resonance");
      if(loud() < .7) return ctx.toast("Recorded the length — but this isn't a resonance. Find where it is loudest.");
      const n = isRes(1) !== null ? 1 : isRes(2) !== null ? 2 : null; if(!n) return ctx.toast("That's a higher resonance — use the first two");
      found[f] = found[f] || {}; found[f]["l" + n] = v;
      ctx.complete(n === 1 ? "first" : "second");
      ctx.toast(`l${n === 1 ? "₁" : "₂"} = ${v.toFixed(1)} cm for the ${f} Hz fork`);
    });
    ctx.buttons([{ label:"Record this fork", onClick(){
      const r = found[f]; if(!r || r.l1 === undefined) return ctx.toast("Find l₁ for this fork first");
      ctx.record({ f, inv:Kit.round(1000/f, 3), l1:r.l1, l2:r.l2 === undefined ? "" : r.l2, v:r.l2 === undefined ? "" : Kit.round(2*f*(r.l2 - r.l1)/100, 0) });
      if(new Set(ctx.rows().map(r => r.f)).size >= 5) ctx.complete("forks");
    } }]);
    Kit.answer(ctx, "Speed of sound / m s⁻¹", "e.g. 340", v => Math.abs(v - V)/V <= .03
      ? (ctx.complete("v"), [true, `Good — the speed of sound at ${T} °C is ${V.toFixed(0)} m s⁻¹.`])
      : [false, "Use v = 2f(l₂ − l₁), or 4 × the gradient of l₁ against 1/f."]);
    draw();
  }
});

/* ───────────── MICROWAVES: STATIONARY WAVES, INTERFERENCE, DIFFRACTION, POLARISATION ───────────── */
Lab.register({
  id:"microwaves", subject:"physics", level:["as"], topic:"Superposition · Microwaves", interactive:true,
  title:"Microwave experiments",
  summary:"Use a 3 cm microwave transmitter and probe receiver to find nodes in a stationary wave, two-slit interference fringes, diffraction at a gap and polarisation.",
  aim:"Measure the wavelength of microwaves using a stationary wave and a double slit, and observe diffraction and polarisation.",
  variables:{ iv:"Probe position / slit separation / gap width / receiver angle", dv:"Receiver signal (meter reading)", cv:["Same transmitter frequency","Same distances between parts"] },
  stageTitle:"Microwave bench (view from above)", controlsTitle:"Arrangement",
  thumb:`<svg viewBox="0 0 300 140"><path d="M20 50 h30 l20 -16 v72 l-20 -16 h-30z" fill="#64748B"/><path d="M90 30 q20 40 0 80 M110 30 q20 40 0 80 M130 30 q20 40 0 80" stroke="#4DA3FF" fill="none"/><rect x="250" y="20" width="10" height="100" fill="#94A3B8"/><circle cx="190" cy="70" r="8" fill="#F59E0B"/></svg>`,
  challenges:[
    { id:"nodes", title:"Stationary wave", text:"Measure the distance across several nodes and find λ." },
    { id:"slits", title:"Two slits", text:"Find the fringe spacing and use λ = ax/D." },
    { id:"gap",   title:"Diffraction", text:"Make the gap narrower than about 2λ and see the beam spread widely." },
    { id:"pol",   title:"Polarisation", text:"Turn the receiver until the signal drops to almost zero." }
  ],
  questions:[
    { q:"Why does a stationary wave form between the transmitter and the metal plate?",
      a:"The plate reflects the microwaves. The incident and reflected waves have the same frequency and travel in opposite directions, so they superpose to give fixed nodes and antinodes." },
    { q:"How is λ found from the nodes?",
      a:"Adjacent nodes are λ/2 apart. Measure the distance across many nodes (say n spacings) and λ = 2 × distance ÷ n, which reduces the percentage uncertainty." },
    { q:"In the two-slit experiment, why are there maxima and minima?",
      a:"The slits act as coherent sources. Where the path difference is a whole number of wavelengths the waves arrive in phase (maximum); where it is a half-odd number they arrive in antiphase (minimum)." },
    { q:"What does the polarisation experiment show about microwaves?",
      a:"The transmitter emits plane-polarised waves. The signal follows cos²θ as the receiver turns and is zero at 90°, which can only happen with a transverse wave." }
  ],
  setup(ctx){
    const F = 10.5e9, LAM = 3e8/F*100;                                  // cm
    const S = 10, TXX = 90, Y0 = 270;                                    // 10 px per cm
    let mode = "stand", px = 40, py = 0, a = 8, w = 6, ang = 0, D = 35, plate = 70;
    const ruler = (x0, len, y) => { let s = `<rect x="${x0}" y="${y}" width="${len*S}" height="22" fill="url(#k-wood)" stroke="#7B4F2C"/>`; for(let mm = 0; mm <= len*10; mm++){ const x = x0 + mm*S/10, big = mm % 10 === 0, mid = mm % 5 === 0; s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + (big ? 10 : mid ? 7 : 4)}" stroke="#4B3621" stroke-width=".6"/>`; if(big && (mm/10) % 5 === 0) s += `<text x="${x}" y="${y + 20}" text-anchor="middle" style="font:600 8px 'JetBrains Mono';fill:#4B3621">${mm/10}</text>`; } return s; };
    function signal(){
      if(mode === "stand"){ const d = plate - px, k = 2*Math.PI/LAM; return 100*(.55 + .45*Math.cos(2*k*d))*(.9 + .1*Math.exp(-px/60)) * .9 + 3; }
      if(mode === "pol") return 95*Math.cos(ang*Math.PI/180)**2 + .8;
      const th = Math.atan2(py, D), s = Math.sin(th);
      const env = w => { const b = Math.PI*w*s/LAM; return Math.abs(b) < 1e-6 ? 1 : (Math.sin(b)/b)**2; };
      if(mode === "slits") return 96*Math.cos(Math.PI*a*s/LAM)**2*env(1.5) + 1.5;
      return 96*env(w) + 1;
    }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="mw-svg"><defs>${Kit.DEFS}</defs>
      <rect width="960" height="540" fill="var(--bg-inset,#0B1220)" opacity=".35"/>
      <g id="mw-scene"></g>
      <g transform="translate(760 40)"><rect width="180" height="110" rx="12" fill="#334155" stroke="#1F2937"/><text x="14" y="22" style="font:700 10px Inter;fill:#CBD5E1">RECEIVER METER</text>
        <rect x="14" y="32" width="152" height="42" rx="5" fill="#132A1F"/><text id="mw-lcd" x="140" y="62" text-anchor="end" class="k-lcd">0</text><text x="160" y="62" text-anchor="end" style="font:600 11px Inter;fill:#5FBF8A">µA</text>
        <rect x="14" y="84" width="152" height="10" rx="4" fill="#0F172A"/><rect id="mw-bar" x="14" y="84" height="10" rx="4" fill="#22C55E"/></g>
      <text x="24" y="34" class="k-status" id="mw-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#mw-svg"), $ = s => svg.querySelector(s);
    const tx = `<path d="M${TXX - 60} ${Y0 - 18} h36 l26 -22 v80 l-26 -22 h-36z" fill="#64748B" stroke="#334155"/><text x="${TXX - 40}" y="${Y0 + 56}" text-anchor="middle" class="k-lbl">transmitter</text>`;
    const probe = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot || 0})" class="k-drag" id="mw-probe"><rect x="-6" y="-22" width="12" height="44" rx="4" fill="#F59E0B" stroke="#92400E"/><circle r="16" fill="transparent"/></g>`;
    function draw(){
      let s = tx; const sig = signal();
      if(mode === "stand"){
        const X = x => TXX + x*S;
        s += ruler(TXX, 75, Y0 + 70) + `<rect x="${X(plate)}" y="${Y0 - 80}" width="10" height="160" fill="url(#k-metal)" stroke="#475569"/><text x="${X(plate) + 5}" y="${Y0 - 90}" text-anchor="middle" class="k-lbl">metal plate</text>`;
        s += probe(X(px), Y0) + `<line x1="${X(px)}" y1="${Y0 + 22}" x2="${X(px)}" y2="${Y0 + 70}" stroke="var(--accent)" stroke-dasharray="3 3"/><text x="${X(px)}" y="${Y0 - 34}" text-anchor="middle" class="k-lbl">probe</text>`;
      } else if(mode === "pol"){
        s += `<path d="M${TXX} ${Y0} H470" stroke="#4DA3FF" stroke-dasharray="6 6"/><path d="M540 ${Y0 - 18} h36 v36 h-36 l-26 22 v-80z" fill="#F59E0B" stroke="#92400E"/><text x="545" y="${Y0 + 60}" text-anchor="middle" class="k-lbl">receiver</text>
          <g transform="translate(320 ${Y0 + 150})"><circle r="56" fill="#F8FAFC" stroke="#334155"/><g transform="rotate(${ang})"><rect x="-34" y="-12" width="68" height="24" fill="#F59E0B" stroke="#92400E"/></g><line x1="0" y1="-50" x2="0" y2="50" stroke="#4DA3FF" stroke-width="2" stroke-dasharray="4 3"/>
            <text x="80" y="-24" class="k-lbl">receiver seen end-on, turned ${ang}°</text><text x="80" y="-6" class="k-lbl">blue line: plane of the transmitted wave</text></g>`;
      } else {
        const BX = TXX + 20*S, RX = BX + D*S;
        const gaps = mode === "slits" ? [[-a/2 - .75, -a/2 + .75], [a/2 - .75, a/2 + .75]] : [[-w/2, w/2]];
        let edges = [-12]; gaps.forEach(g => edges.push(g[0], g[1])); edges.push(12);
        for(let i = 0; i < edges.length; i += 2) s += `<rect x="${BX - 4}" y="${Y0 + edges[i]*S}" width="8" height="${(edges[i + 1] - edges[i])*S}" fill="url(#k-metal)" stroke="#475569"/>`;
        s += `<text x="${BX}" y="${Y0 - 130}" text-anchor="middle" class="k-lbl">${mode === "slits" ? "double slit" : "single gap"}</text>`;
        let curve = "";
        for(let yy = -20; yy <= 20; yy += .25){ py = yy; const v = signal(); curve += (curve ? " L" : "M") + `${RX + 40 + v*.9} ${Y0 + yy*S}`; }
                s += `<path d="${curve}" stroke="#4DA3FF" stroke-width="1.4" fill="none" opacity="${pattern ? .8 : 0}"/>`;
        s += `<g>${(() => { let r = `<rect x="${RX + 18}" y="${Y0 - 20*S}" width="22" height="${40*S}" fill="url(#k-wood)" stroke="#7B4F2C"/>`; for(let mm = -200; mm <= 200; mm++){ const yy = Y0 + mm*S/10, big = mm % 10 === 0, mid = mm % 5 === 0; r += `<line x1="${RX + 40}" y1="${yy}" x2="${RX + 40 - (big ? 10 : mid ? 7 : 4)}" y2="${yy}" stroke="#4B3621" stroke-width=".6"/>`; if(big && (mm/10) % 5 === 0) r += `<text x="${RX + 22}" y="${yy + 3}" style="font:600 7px 'JetBrains Mono';fill:#4B3621">${mm/10}</text>`; } return r; })()}</g>`;
        s += `<path d="M${BX} ${Y0} L${RX} ${Y0}" stroke="var(--txt3,#64748B)" stroke-dasharray="2 4"/><text x="${(BX + RX)/2}" y="${Y0 + 16}" text-anchor="middle" class="k-lbl">D = ${D} cm</text>`;
        py = probeY;
        s += probe(RX, Y0 + probeY*S, 90);
      }
      $("#mw-scene").innerHTML = s;
      $("#mw-lcd").textContent = Math.round(sig);
      $("#mw-bar").setAttribute("width", 1.52*Kit.clamp(sig, 0, 100));
      $("#mw-status").textContent = { stand:"Drag the probe along the beam: the signal rises and falls", slits:"Drag the receiver along its rule to find the maxima", gap:"Drag the receiver: how far does the beam spread?", pol:"Turn the receiver about the beam" }[mode];
      ctx.readout([["Signal", Math.round(sig) + " µA"], ["Arrangement", { stand:"stationary wave", slits:`two slits, a = ${a} cm`, gap:`gap ${w} cm`, pol:"polarisation" }[mode]]]);
    }
    let probeY = 0, pattern = false;
    Kit.dragger(ctx, svg, {
      hit(t, p){ return t.closest("#mw-probe") ? {} : null; },
      move(_, p){ if(mode === "stand") px = Kit.clamp((p.x - TXX)/S, 10, plate - 1.5); else if(mode !== "pol") probeY = Kit.clamp((p.y - Y0)/S, -20, 20); py = probeY; draw(); }
    });
    const ctrls = [];
    ctx.seg({ label:"Arrangement", value:"stand", options:[["stand","Stationary wave"],["slits","Two slits"],["gap","Single gap"],["pol","Polarisation"]], onChange(v){ mode = v; probeY = 0; py = 0; draw(); } });
    ctx.slider({ label:"Slit separation a (two slits)", min:4, max:10, step:.5, value:a, unit:"cm", onInput(v){ a = v; draw(); } });
    ctx.slider({ label:"Gap width (single gap)", min:2, max:14, step:.5, value:w, unit:"cm", onInput(v){ w = v; if(v <= 2*LAM) ctx.complete("gap"); draw(); } });
    ctx.slider({ label:"Receiver angle (polarisation)", min:0, max:90, step:5, value:ang, unit:"°", onInput(v){ ang = v; if(v >= 85 && mode === "pol") ctx.complete("pol"); draw(); } });
    ctx.seg({ label:"Show the intensity pattern", value:false, options:[[false,"Hide"],[true,"Show"]], onChange(v){ pattern = v; draw(); } });
    Kit.answer(ctx, "Wavelength from the stationary wave / cm", "e.g. 2.9", v => Math.abs(v - LAM)/LAM <= .03
      ? (ctx.complete("nodes"), [true, `Correct — λ = ${LAM.toFixed(2)} cm, so f = c/λ ≈ 10.5 GHz.`])
      : [false, "Nodes are λ/2 apart. Measure across several nodes and divide."]);
    Kit.answer(ctx, "Wavelength from the two slits / cm", "e.g. 2.9", v => {
      const x = LAM*D/a; if(Math.abs(v - LAM)/LAM <= .06){ ctx.complete("slits"); return [true, `Correct — fringe spacing x ≈ ${x.toFixed(1)} cm, λ = ax/D = ${LAM.toFixed(2)} cm.`]; }
      return [false, "Measure the distance x between neighbouring maxima on the rule, then λ = ax/D."];
    });
    draw();
  }
});

/* ───────────── POTENTIOMETER: COMPARING E.M.F.s BY A NULL METHOD ───────────── */
Lab.register({
  id:"potentiometer", subject:"physics", level:["as"], topic:"D.C. circuits · Potentiometer", interactive:true,
  title:"Potentiometer and null method",
  summary:"Slide a jockey along a metre wire until the galvanometer reads zero. Compare the balance length for a standard cell with those for two unknown cells to find their e.m.f.s.",
  aim:"Use a potentiometer and a galvanometer as a null detector to compare e.m.f.s.",
  variables:{ iv:"Cell connected to the jockey", dv:"Balance length l (cm)", cv:["Same driver cell and rheostat setting (same p.d. per cm of wire)","Same wire"] },
  stageTitle:"Metre wire, driver cell and galvanometer", controlsTitle:"Circuit",
  thumb:`<svg viewBox="0 0 300 140"><rect x="30" y="90" width="240" height="10" fill="#D9B07A"/><line x1="40" y1="88" x2="260" y2="88" stroke="#B45309" stroke-width="2"/><path d="M150 88 l-6 -20 h12z" fill="#334155"/><circle cx="150" cy="40" r="20" fill="#F8FAFC" stroke="#334155"/><line x1="150" y1="40" x2="150" y2="24" stroke="#DC2626" stroke-width="2"/></svg>`,
  challenges:[
    { id:"std",  title:"Balance the standard", text:"Find the balance length for the standard cell (1.018 V)." },
    { id:"x",    title:"Cell X", text:"Find the balance length for cell X and work out its e.m.f." },
    { id:"y",    title:"Cell Y", text:"Do the same for cell Y." },
    { id:"prot", title:"Protect the galvanometer", text:"Start with the protective resistor in, then short it out near balance." }
  ],
  columns:[{key:"cell",label:"Cell"},{key:"l",label:"l / cm",dp:1},{key:"E",label:"E = 1.018 × l / l_s / V",dp:3}],
  questions:[
    { q:"Why does a potentiometer measure e.m.f. rather than terminal p.d.?",
      a:"At balance no current flows through the cell being tested, so there is no p.d. across its internal resistance. The p.d. across length l of the wire equals the cell's e.m.f." },
    { q:"Show that E_X = E_s × l_X / l_s.",
      a:"The driver current is the same, so the p.d. along the wire is proportional to length: E_s = kl_s and E_X = kl_X. Dividing: E_X / E_s = l_X / l_s." },
    { q:"Why is a high resistance put in series with the galvanometer at first?",
      a:"Far from balance a large current could flow and damage the galvanometer (or the standard cell). Once near balance it is shorted out so the galvanometer is sensitive enough to find the exact null point." },
    { q:"What happens if the driver cell's e.m.f. is less than the e.m.f. being measured?",
      a:"The p.d. across the whole wire is smaller than the cell's e.m.f., so there is no balance point on the wire." },
    { q:"Why should the jockey be tapped on the wire, not dragged?",
      a:"Dragging scrapes the wire and changes its cross-section, so the p.d. per cm would no longer be uniform." }
  ],
  setup(ctx){
    const ES = 1.018, CELLS = { S:ES, X:Kit.round(1.20 + Math.random()*.2, 3), Y:Kit.round(.55 + Math.random()*.3, 3) };
    const ED = 2.05, RD = .4, RW = 5.0, X0 = 140, LW = 680;               // wire from x = 140 to 820 (100 cm)
    let cell = "S", rh = 3, jx = 50, down = false, prot = true, found = {};
    const k = () => ED*RW/(RW + RD + rh)/100;                            // V per cm
    const defl = () => { if(!down) return 0; const V = k()*jx - CELLS[cell]; return Kit.clamp(V/(prot ? 1.5 : .02), -1, 1); };
    const bal = () => CELLS[cell]/k();
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="pm-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 490)}
      <rect x="${X0 - 20}" y="400" width="${LW + 40}" height="40" fill="url(#k-wood)" stroke="#7B4F2C"/><g id="pm-scale"></g>
      <line x1="${X0}" y1="396" x2="${X0 + LW}" y2="396" stroke="#B45309" stroke-width="2.5"/>
      <text x="${X0 - 10}" y="390" text-anchor="end" class="k-tag">A</text><text x="${X0 + LW + 10}" y="390" class="k-tag">B</text>
      <path d="M${X0} 396 V120 H330 M380 120 H560 M620 120 H${X0 + LW} V396" stroke="#334155" stroke-width="2.5" fill="none"/>
      <g transform="translate(330 120)"><line x1="0" y1="-16" x2="0" y2="16" stroke="var(--txt)" stroke-width="2"/><line x1="12" y1="-9" x2="12" y2="9" stroke="var(--txt)" stroke-width="4"/><line x1="12" y1="0" x2="50" y2="0" stroke="#334155" stroke-width="2.5"/><text x="6" y="-26" text-anchor="middle" class="k-lbl">driver cell 2 V</text></g>
      <g transform="translate(560 120)"><rect x="0" y="-10" width="60" height="20" fill="url(#k-metal)" stroke="#334155"/><path d="M10 -20 L50 20" stroke="#DC2626" stroke-width="2"/><text x="30" y="-26" text-anchor="middle" class="k-lbl">rheostat</text></g>
      <g id="pm-test"></g><g id="pm-galv"></g><g id="pm-jockey"></g>
      <text x="24" y="34" class="k-status" id="pm-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#pm-svg"), $ = s => svg.querySelector(s);
    let sc = ""; for(let mm = 0; mm <= 1000; mm += 5){ const x = X0 + mm*LW/1000, big = mm % 100 === 0, cm = mm % 10 === 0; sc += `<line x1="${x}" y1="400" x2="${x}" y2="${400 + (big ? 14 : cm ? 9 : 5)}" stroke="#4B3621" stroke-width="${big ? 1 : .5}"/>`; if(big) sc += `<text x="${x}" y="432" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#4B3621">${mm/10}</text>`; }
    $("#pm-scale").innerHTML = sc;
    function draw(){
      const JX = X0 + jx*LW/100, d = defl();
      $("#pm-test").innerHTML = `<path d="M${X0} 396 V250 H200" stroke="#334155" stroke-width="2.5" fill="none"/>
        <g transform="translate(200 250)"><line x1="0" y1="-14" x2="0" y2="14" stroke="var(--txt)" stroke-width="2"/><line x1="10" y1="-8" x2="10" y2="8" stroke="var(--txt)" stroke-width="4"/><text x="5" y="-22" text-anchor="middle" class="k-tag">${cell === "S" ? "standard 1.018 V" : "cell " + cell}</text></g>
        <path d="M210 250 H300" stroke="#334155" stroke-width="2.5"/>${prot ? `<rect x="300" y="242" width="50" height="16" fill="#F8FAFC" stroke="#334155"/><text x="325" y="276" text-anchor="middle" class="k-lbl">protective R</text>` : `<path d="M300 250 H350" stroke="#334155" stroke-width="2.5"/>`}<path d="M350 250 H410" stroke="#334155" stroke-width="2.5"/>`;
      $("#pm-galv").innerHTML = `<g transform="translate(450 250)"><circle r="40" fill="#F8FAFC" stroke="#334155" stroke-width="2"/><path d="M-30 -8 A32 32 0 0 1 30 -8" stroke="#94A3B8" fill="none"/><text y="24" text-anchor="middle" style="font:700 13px Inter;fill:#334155">G</text>
        <line x1="0" y1="10" x2="${28*Math.sin(d*1.1)}" y2="${10 - 34*Math.cos(d*1.1)}" stroke="#DC2626" stroke-width="2.4"/><circle cy="10" r="3" fill="#334155"/><text x="56" y="-30" class="k-lbl">centre-zero galvanometer</text></g>
        <path d="M450 290 V325 H${JX} V${down ? 350 : 330}" stroke="#334155" stroke-width="2.5" fill="none"/>`;
      $("#pm-jockey").innerHTML = `<g transform="translate(${JX} ${down ? 396 : 376})" class="k-drag" id="pm-j"><path d="M0 0 l-8 -24 h16z" fill="#334155"/><rect x="-10" y="-46" width="20" height="24" rx="4" fill="#475569"/><rect x="-22" y="-50" width="44" height="54" fill="transparent"/></g>`;
      $("#pm-status").textContent = !down ? "Drag the jockey, and press (hold) it on the wire to see the galvanometer" : Math.abs(d) < .02 ? "No deflection — balance point" : `Deflection to the ${d > 0 ? "right" : "left"}`;
      ctx.readout([["Cell", cell === "S" ? "standard" : cell], ["Protective resistor", prot ? "in" : "shorted"], ["Galvanometer", down ? (Math.abs(d) < .02 ? "zero" : d > 0 ? "right" : "left") : "—"]]);
    }
    ctx.frame(() => draw());
    Kit.dragger(ctx, svg, {
      hit(t, p){ return t.closest("#pm-j") || (p.y > 360 && p.y < 410 && p.x > X0 - 10 && p.x < X0 + LW + 10) ? {} : null; },
      start(_, p){ down = true; jx = Kit.clamp((p.x - X0)/LW*100, 0, 100); },
      move(_, p){ jx = Kit.clamp(Kit.round((p.x - X0)/LW*100, 1), 0, 100); },
      end(){ down = false; }
    });
    ctx.seg({ label:"Cell connected to the galvanometer", value:"S", options:[["S","Standard"],["X","Cell X"],["Y","Cell Y"]], onChange(v){ cell = v; } });
    ctx.seg({ label:"Protective resistor", value:true, options:[[true,"In"],[false,"Shorted out"]], onChange(v){ prot = v; if(!v && Math.abs(jx - bal()) < 5) ctx.complete("prot"); else if(!v) ctx.toast("Careful — far from balance, the galvanometer current is large"); } });
    ctx.slider({ label:"Rheostat", min:1, max:6, step:.5, value:rh, unit:"Ω", onInput(v){ if(ctx.rows().length) ctx.toast("Keep the rheostat fixed once you start: it sets the p.d. per cm"); rh = v; } });
    const rd = Kit.reading(ctx, "Balance length l / cm", "e.g. 54.3", () => jx, .15, v => {
      rd.clear();
      if(bal() > 100) return ctx.toast("There is no balance point on the wire — lower the rheostat resistance so the wire has a bigger p.d.");
      if(Math.abs(jx - bal()) > (prot ? 1.5 : .3)) return ctx.toast(prot ? "Not balanced yet — find where the needle doesn't move" : "Not quite at balance — the needle still moves");
      if(prot) return ctx.toast("Near balance — now short out the protective resistor and fine-tune");
      found[cell] = v;
      const ls = found.S, E = ls ? Kit.round(ES*v/ls, 3) : "";
      ctx.record({ cell:cell === "S" ? "standard" : cell, l:v, E:cell === "S" ? ES : E });
      ctx.complete(cell === "S" ? "std" : cell.toLowerCase());
    });
    Kit.answer(ctx, "E.m.f. of cell X / V", "e.g. 1.35", v => Math.abs(v - CELLS.X) <= .02 ? (ctx.complete("x"), [true, `Correct — E_X = ${CELLS.X.toFixed(3)} V.`]) : [false, "E_X = 1.018 × l_X / l_s, using the same rheostat setting for both."]);
    Kit.answer(ctx, "E.m.f. of cell Y / V", "e.g. 0.70", v => Math.abs(v - CELLS.Y) <= .02 ? (ctx.complete("y"), [true, `Correct — E_Y = ${CELLS.Y.toFixed(3)} V.`]) : [false, "E_Y = 1.018 × l_Y / l_s."]);
    draw();
  }
});
