"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS (0625) — I–V characteristics · Hooke’s law · Refraction
   Hands-on: drag components into the clips, masses onto the hanger and
   the ray box round the block; read the meters, ruler and protractor.
══════════════════════════════════════════════════════════════════ */

/* ───────────── I–V CHARACTERISTICS ───────────── */
Lab.register({
  id:"iv-characteristics", subject:"physics", level:["igcse","as"], topic:"Electricity · I–V characteristics", interactive:true,
  title:"I–V characteristics",
  summary:"Clip a resistor, filament lamp, diode or thermistor into the circuit, slide the potential divider and reverse the supply to plot I–V graphs.",
  aim:"Investigate how the current in a fixed resistor, a filament lamp, a diode and a thermistor depends on the potential difference across it.",
  variables:{ iv:"Potential difference across the component (V), set with the potential divider", dv:"Current through the component (A)", cv:["Same component","Room temperature","Switch off between readings"] },
  stageTitle:"Circuit board", controlsTitle:"Readings",
  thumb:`<svg viewBox="0 0 300 140"><line x1="40" y1="70" x2="260" y2="70" stroke="#334155"/><line x1="150" y1="10" x2="150" y2="130" stroke="#334155"/><line x1="70" y1="120" x2="230" y2="20" stroke="#4DA3FF" stroke-width="3"/><path d="M60 100 Q150 70 240 40" stroke="#FBBF24" stroke-width="3" fill="none"/><path d="M40 70 H170 Q190 70 200 10" stroke="#FF5C7A" stroke-width="3" fill="none"/></svg>`,
  challenges:[
    { id:"res",   title:"Fixed resistor", text:"Six or more readings including negative p.d.s." },
    { id:"lamp",  title:"Filament lamp", text:"Six or more readings including negative p.d.s." },
    { id:"diode", title:"Diode", text:"Readings both ways round — find where it starts to conduct." },
    { id:"therm", title:"Thermistor", text:"Six or more readings — watch its resistance fall as it warms." },
    { id:"R",     title:"Find R", text:"Use the gradient of your resistor graph to find its resistance." }
  ],
  columns:[{key:"comp",label:"Component"},{key:"V",label:"p.d. / V",dp:2},{key:"I",label:"Current / A"},{key:"R",label:"Resistance / Ω"}],
  series:"comp",
  graph:{ x:["V"], y:["I","R"], fit:"none" },
  questions:[
    { q:"Use your graph for the fixed resistor to find its resistance.",
      a:"The graph is a straight line through the origin. Gradient = I/V = 1/R, so R = 1 ÷ gradient." },
    { q:"Describe and explain the shape of the I–V graph for the filament lamp.",
      a:"It curves, becoming less steep as p.d. increases. A larger current heats the filament, so its resistance increases." },
    { q:"Why is there a 10 Ω resistor in series with the component?",
      a:"To protect it: it limits the current, especially for the diode, whose resistance drops sharply once it conducts." },
    { q:"How does a potential divider let you set the p.d. down to zero?",
      a:"The component is connected between one end of the rheostat and the sliding contact. Moving the contact from one end to the other varies the p.d. smoothly from 0 to the full supply." },
    { q:"Why does the thermistor’s resistance fall as the current increases?",
      a:"The current heats the thermistor; an NTC thermistor’s resistance decreases as its temperature rises." }
  ],
  setup(ctx){
    const RFIX = [10, 15, 22, 33, 47][Math.floor(Math.random()*5)], EMF = 6.0, RP = 20, RPROT = 10;
    const COMPS = {
      resistor:{ name:"Fixed resistor", I:V => V/RFIX },
      lamp:{ name:"Filament lamp", I:V => Math.sign(V)*.3*Math.pow(Math.abs(V)/6, .6) },
      diode:{ name:"Diode", I:V => V > 0 ? 2e-9*(Math.exp(V/.0434) - 1) : -1e-9 },
      therm:{ name:"Thermistor", I:V => { let R = 220; for(let k = 0; k < 20; k++){ const P = V*V/R, T = 20 + 90*P; R = .5*R + .5*220*Math.exp(-.04*(T - 20)); } return V/R; } }
    };
    let comp = null, s = .3, on = false, rev = false, drag = null, glowP = 0;
    const SX = 520, ST = 160, SB = 400;                     // rheostat (potential divider) on x = 520
    function solve(){
      if(!on || !comp) return { V:0, I:0 };
      const Vth = (rev ? -1 : 1)*EMF*s, Rth = s*(1 - s)*RP + RPROT + .1, f = COMPS[comp].I;
      let lo = Math.min(0, Vth), hi = Math.max(0, Vth);
      for(let k = 0; k < 60; k++){ const V = (lo + hi)/2, g = f(V) - (Vth - V)/Rth; if((g > 0) === (Vth > 0)) hi = V; else lo = V; if(Vth < 0){ if(g < 0) lo = V; else hi = V; } }
      const V = (lo + hi)/2; return { V, I:f(V) };
    }
    ctx.stage.innerHTML = `<svg viewBox="0 0 1000 520" class="kb" id="iv-svg"><defs>${Kit.DEFS}</defs><rect x="20" y="20" width="960" height="480" rx="18" fill="color-mix(in srgb,var(--bg-card) 70%,transparent)" stroke="var(--brd2)"/><g id="iv-scene"></g><text x="40" y="54" class="k-status" id="iv-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#iv-svg"), $ = q => svg.querySelector(q);
    const TRAY = { resistor:[640, 80], lamp:[730, 80], diode:[820, 80], therm:[910, 80] };
    function sym(c, glow){
      if(c === "resistor") return `<rect x="-10" y="-24" width="20" height="48" rx="2" fill="var(--bg2)" stroke="var(--txt)" stroke-width="2"/>`;
      if(c === "lamp") return `<circle r="${22 + 18*glow}" fill="url(#k-glow)" opacity="${Math.min(.95, glow*1.4).toFixed(2)}"/><circle r="16" fill="var(--bg2)" stroke="var(--txt)" stroke-width="2"/><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="${glow > .05 ? "#FFD24A" : "var(--txt)"}" stroke-width="2"/>`;
      if(c === "diode") return `<path d="M-13 -12 H13 L0 12 Z" fill="var(--bg2)" stroke="var(--txt)" stroke-width="2"/><line x1="-14" y1="12" x2="14" y2="12" stroke="var(--txt)" stroke-width="2.6"/>`;
      return `<rect x="-10" y="-24" width="20" height="48" rx="2" fill="var(--bg2)" stroke="var(--txt)" stroke-width="2"/><path d="M-16 18 L12 -18 H20" stroke="var(--hi)" stroke-width="2" fill="none"/>`;
    }
    function draw(){
      const { V, I } = solve(), ys = SB - s*(SB - ST);
      let g = `<path d="M90 245 V120 H230 M290 120 H${SX} V${ST} M${SX} ${SB} V440 H90 V315" class="ink"/>
        <path d="M${SX + 22} ${ys} H600 V280 H620 M680 280 H720 M780 280 H850 V316 M850 404 V440 H${SX}" class="ink"/>
        <path d="M850 300 H950 V336 M950 384 V420 H850" class="ink2"/>`;
      // battery pack + reversing switch
      g += `<g transform="translate(90 280)"><line x1="-18" y1="-35" x2="18" y2="-35" stroke="var(--txt)" stroke-width="2.4"/><line x1="-10" y1="-25" x2="10" y2="-25" stroke="var(--txt)" stroke-width="5"/><line x1="-18" y1="25" x2="18" y2="25" stroke="var(--txt)" stroke-width="2.4"/><line x1="-10" y1="35" x2="10" y2="35" stroke="var(--txt)" stroke-width="5"/>
        <line x1="0" y1="-25" x2="0" y2="25" stroke="var(--txt)" stroke-dasharray="3 4"/><text x="24" y="4" class="k-lbl">6.0 V</text></g>
        <g id="iv-rev" class="k-btn" transform="translate(150 190)"><rect x="-38" y="-16" width="76" height="32" rx="8" fill="${rev ? "var(--hi-lt)" : "var(--bg-hov)"}" stroke="${rev ? "var(--hi)" : "var(--brd2)"}"/><text y="5" text-anchor="middle" style="font:700 10px Inter;fill:${rev ? "var(--hi)" : "var(--txt2)"}">${rev ? "REVERSED" : "REVERSE"}</text></g>`;
      g += `<g id="iv-sw" class="k-btn" transform="translate(260 120)"><circle cx="-30" r="4" fill="var(--txt)"/><circle cx="30" r="4" fill="var(--txt)"/><line x1="-30" y1="0" x2="${on ? 30 : 22}" y2="${on ? 0 : -22}" stroke="${on ? "var(--sec)" : "var(--hi)"}" stroke-width="3.4" stroke-linecap="round"/><rect x="-40" y="-36" width="80" height="50" fill="transparent"/><text y="34" text-anchor="middle" class="k-hint">switch</text></g>`;
      // potential divider
      g += `<rect x="${SX - 14}" y="${ST}" width="28" height="${SB - ST}" rx="4" fill="url(#k-metal)" stroke="#475569"/>`;
      for(let k = 0; k < 24; k++) g += `<line x1="${SX - 12}" y1="${ST + 6 + k*10}" x2="${SX + 12}" y2="${ST + 6 + k*10}" stroke="#7C2D12" stroke-width="2"/>`;
      g += `<g id="iv-slide" class="k-drag" transform="translate(${SX} ${ys})"><path d="M14 0 L32 -10 V10 Z" fill="#1F2937"/><rect x="30" y="-12" width="20" height="24" rx="4" fill="#1F2937"/><rect x="0" y="-24" width="70" height="48" fill="transparent"/></g>
        <text x="${SX - 24}" y="${SB + 28}" text-anchor="end" class="k-lbl">potential divider — drag the slider</text>`;
      // ammeter, protective resistor
      g += `<g transform="translate(650 280)"><circle r="30" fill="var(--bg-card)" stroke="var(--txt)" stroke-width="2"/><text y="-6" text-anchor="middle" style="font:800 12px Inter;fill:var(--txt)">A</text><text y="12" text-anchor="middle" class="k-numb" style="font-size:11px">${Math.abs(I) < 1 ? (I*1000).toFixed(1) + " mA" : I.toFixed(3) + " A"}</text></g>
        <rect x="720" y="270" width="60" height="20" rx="2" fill="var(--bg2)" stroke="var(--txt)" stroke-width="2"/><text x="750" y="262" text-anchor="middle" class="k-lbl">10 Ω protective</text>`;
      // component slot with crocodile clips
      g += `<path d="M842 316 l8 -10 l8 10 M842 404 l8 10 l8 -10" fill="#DC2626"/>`;
      if(comp && !(drag && drag.k === comp)) g += `<g data-c="${comp}" class="k-drag" transform="translate(850 360)">${sym(comp, glowP)}<rect x="-24" y="-30" width="48" height="60" fill="transparent"/></g><text x="816" y="364" text-anchor="end" class="k-tag">${COMPS[comp].name}</text>`;
      else g += `<rect x="826" y="322" width="48" height="76" rx="8" fill="none" stroke="var(--accent)" stroke-dasharray="5 4" class="pulse"/><text x="816" y="364" text-anchor="end" class="k-hint">drop a component here</text>`;
      g += `<g transform="translate(950 360)"><circle r="26" fill="var(--bg-card)" stroke="var(--txt)" stroke-width="2"/><text y="-5" text-anchor="middle" style="font:800 11px Inter;fill:var(--txt)">V</text><text y="11" text-anchor="middle" class="k-numb" style="font-size:10px">${V.toFixed(2)}</text></g>`;
      // tray
      g += `<text x="600" y="56" class="k-lbl">components — drag into the clips</text>`;
      Object.entries(TRAY).forEach(([c, [x, y]]) => { if(c === comp) return; const pos = drag && drag.k === c ? [drag.x, drag.y] : [x, y + 24]; g += `<g data-c="${c}" class="k-drag" transform="translate(${pos[0]} ${pos[1]})">${sym(c, 0)}<rect x="-30" y="-32" width="60" height="70" fill="transparent"/></g>${drag && drag.k === c ? "" : `<text x="${x}" y="${y + 72}" text-anchor="middle" class="k-lbl" style="font-size:10px">${COMPS[c].name}</text>`}`; });
      $("#iv-scene").innerHTML = g;
      $("#iv-status").textContent = !comp ? "Drag a component into the clips" : !on ? "Close the switch, then slide the potential divider" : `${COMPS[comp].name}: ${V.toFixed(2)} V, ${(I*1000).toFixed(1)} mA`;
      ctx.readout([["Component", comp ? COMPS[comp].name : "none"], ["Voltmeter", V.toFixed(2) + " V"], ["Ammeter", (I*1000).toFixed(1) + " mA"], ["Supply", rev ? "reversed" : "normal", rev ? "warn" : ""]]);
    }
    ctx.frame(dt => { const { V, I } = solve(), target = comp === "lamp" ? Math.min(1, Math.abs(V*I)/1.8) : 0; if(Math.abs(target - glowP) > .002){ glowP += (target - glowP)*Math.min(1, dt*6); draw(); } });
    Kit.dragger(ctx, svg, {
      hit(tg){
        if(tg.closest("#iv-sw")){ on = !on; draw(); return null; }
        if(tg.closest("#iv-rev")){ rev = !rev; draw(); return null; }
        if(tg.closest("#iv-slide")) return { k:"slide" };
        const c = tg.closest("[data-c]"); if(!c) return null;
        if(c.dataset.c === comp){ if(on) { ctx.toast("Switch off before changing the component"); return null; } comp = null; }
        return { k:c.dataset.c, x:0, y:0 };
      },
      move(h, p){ if(h.k === "slide") s = Kit.clamp((SB - p.y)/(SB - ST), 0, 1); else { h.x = p.x; h.y = p.y; drag = h; } draw(); },
      end(h, p){ drag = null; if(h.k !== "slide" && Math.abs(p.x - 850) < 70 && Math.abs(p.y - 360) < 80) comp = h.k; draw(); }
    });
    ctx.buttons([{ label:"Record reading", primary:true, block:true, onClick(){
      if(!comp) return ctx.toast("Put a component in the clips");
      if(!on) return ctx.toast("Close the switch first");
      const { V, I } = solve(), Im = Math.abs(I) < 1e-6 ? 0 : Number((I*(1 + .003*ctx.gauss())).toPrecision(3));
      ctx.record({ comp:COMPS[comp].name, V:Kit.round(V, 2), I:Im, R: Math.abs(Im) > 1e-6 ? Number((V/Im).toPrecision(3)) : null });
      const rows = ctx.rows().filter(r => r.comp === COMPS[comp].name), neg = rows.some(r => r.V < -.2);
      const key = { resistor:"res", lamp:"lamp", diode:"diode", therm:"therm" }[comp];
      if(rows.length >= 6 && (neg || comp === "therm")) ctx.complete(key);
    } }]);
    ctx.buttons([{ label:"◀ fine", onClick(){ s = Math.max(0, s - .01); draw(); } }, { label:"fine ▶", onClick(){ s = Math.min(1, s + .01); draw(); } }]);
    Kit.answer(ctx, "Resistance of the fixed resistor / Ω", "e.g. 22", v => {
      const pts = ctx.rows().filter(r => r.comp === "Fixed resistor").map(r => [r.V, r.I]);
      if(pts.length < 4) return [false, "Record at least four readings for the resistor."];
      const f = ctx.linFit(pts), R = 1/f.m;
      if(Math.abs(v - R)/R <= .04){ ctx.complete("R"); return [true, `Correct — 1 ÷ gradient = ${R.toFixed(1)} Ω (it is a ${RFIX} Ω resistor).`]; }
      return [false, "R = 1 ÷ gradient of the I–V graph (I in A, V in V)."];
    });
    draw();
  }
});

/* ───────────── HOOKE'S LAW ───────────── */
Lab.register({
  id:"hookes-law", subject:"physics", level:["igcse","as"], topic:"Forces · Springs", interactive:true,
  title:"Hooke’s law",
  summary:"Drag slotted masses onto the hanger, read the pointer against the ruler through a magnifier, and compare two springs with a rubber band.",
  aim:"Investigate how the extension of a spring (and a rubber band) depends on the load, and find the limit of proportionality.",
  variables:{ iv:"Load on the spring (N) — mass × 9.8 N/kg", dv:"Extension (cm) = length − original length", cv:["Same spring","Ruler read at eye level, vertical","Original length measured first"] },
  stageTitle:"Spring and ruler", controlsTitle:"Readings",
  thumb:`<svg viewBox="0 0 300 140"><path d="M150 10 v8 l-12 5 l24 8 l-24 8 l24 8 l-24 8 l24 8 l-12 5 v8" fill="none" stroke="#4DA3FF" stroke-width="2.5"/>${[0,1,2].map(i=>`<rect x="134" y="${82+i*9}" width="32" height="7" rx="2" fill="#94A3B8"/>`).join("")}<rect x="200" y="6" width="22" height="126" fill="#D9B07A"/></svg>`,
  challenges:[
    { id:"lin",   title:"Spring A to 1 kg", text:"Record spring A from 0 to 1000 g in 100 g steps." },
    { id:"k",     title:"Spring constant", text:"Find k for spring A from the straight part of the graph." },
    { id:"band",  title:"Rubber band", text:"Load and unload the rubber band — it doesn’t retrace its path." },
    { id:"limit", title:"Limit of proportionality", text:"Find the load where spring A’s graph stops being straight." }
  ],
  columns:[{key:"spring",label:"Spring / run"},{key:"m",label:"Mass / g",dp:0},{key:"F",label:"Load / N",dp:2},{key:"L",label:"Length / cm",dp:1},{key:"x",label:"Extension / cm",dp:1}],
  series:"spring",
  graph:{ x:["F"], y:["x","L"], fit:"linear" },
  questions:[
    { q:"How do you calculate extension from your ruler readings?",
      a:"Extension = stretched length − original (unloaded) length." },
    { q:"Use the straight part of your graph to find the spring constant of spring A.",
      a:"k = F ÷ x. The gradient of extension against load is x/F (cm per N), so k = 1 ÷ gradient, then × 100 for N/m." },
    { q:"What is the limit of proportionality?",
      a:"The point beyond which extension is no longer proportional to load — the graph curves away from the straight line." },
    { q:"Why should the ruler be read with your eye level with the pointer?",
      a:"To avoid parallax error, which would make every reading too high or too low." },
    { q:"How does the rubber band behave differently from the spring?",
      a:"Its graph is curved from the start (it doesn’t obey Hooke’s law) and the unloading curve lies above the loading curve — it doesn’t return along the same path (hysteresis)." }
  ],
  setup(ctx){
    const SPR = { A:{ name:"Spring A", k:40, lp:6.0 }, B:{ name:"Spring B", k:80, lp:15 }, band:{ name:"Rubber band" } };
    const L0 = { A:5.0, B:5.0, band:8.0 }, PX = 7, Y0 = 50;
    let sp = "A", mass = 0, maxF = 0, dir = "loading", run = 1;
    const F = () => mass/1000*9.8;
    function len(){
      const f = F();
      if(sp === "band"){ const xl = q => 9*Math.pow(q/9.8, .55); return L0.band + xl(f) + (dir === "unloading" ? .18*xl(maxF)*(1 - f/Math.max(maxF, 1e-6)) : 0); }
      const s = SPR[sp], set = Math.max(0, maxF - 1.1*s.lp)*.8;
      const x = f <= s.lp ? f/s.k : s.lp/s.k + (f - s.lp)/s.k*(1 + 1.5*(f - s.lp)/s.lp);
      return L0[sp] + x*100 + set;
    }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="hk-svg"><defs>${Kit.DEFS}<clipPath id="hk-lc"><circle r="76"/></clipPath></defs>${Kit.bench(960, 500)}<g id="hk-scene"></g><text x="24" y="34" class="k-status" id="hk-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#hk-svg"), $ = q => svg.querySelector(q);
    let dragDisc = null;
    function draw(){
      const L = len(), yb = Y0 + L*PX, X = 300;
      let g = `<rect x="140" y="20" width="10" height="480" fill="url(#k-metal)"/><rect x="140" y="${Y0 - 14}" width="${X - 130}" height="9" fill="url(#k-metal)"/><rect x="100" y="492" width="110" height="10" fill="url(#k-metal)"/>`;
      g += `<rect x="372" y="${Y0 - 6}" width="34" height="${50*PX + 12}" fill="url(#k-wood)" stroke="#7B4F2C"/>`;
      for(let c = 0; c <= 50; c++){ const y = Y0 + c*PX; g += `<line x1="372" y1="${y}" x2="${372 + (c % 5 ? 7 : 13)}" y2="${y}" stroke="#4B3621"/>${c % 5 === 0 ? `<text x="388" y="${y + 3.5}" style="font:600 8px 'JetBrains Mono';fill:#4B3621">${c}</text>` : ""}`; }
      if(sp === "band") g += `<path d="M${X} ${Y0 - 5} Q${X - 12} ${(Y0 + yb)/2} ${X} ${yb} Q${X + 12} ${(Y0 + yb)/2} ${X} ${Y0 - 5}" fill="none" stroke="#B45309" stroke-width="4"/>`;
      else{ let d = `M${X} ${Y0 - 5} V${Y0 + 4}`; const n = 14, h = (yb - 6 - (Y0 + 4))/n; for(let i = 0; i < n; i++) d += ` L${i % 2 ? X - 13 : X + 13} ${Y0 + 4 + h*(i + .5)}`; d += ` L${X} ${yb - 6} V${yb}`; g += `<path d="${d}" fill="none" stroke="#4DA3FF" stroke-width="2.4" stroke-linejoin="round"/>`; }
      g += `<line x1="${X}" y1="${yb}" x2="372" y2="${yb}" stroke="#FF5C7A" stroke-width="2"/><path d="M${X} ${yb} v14" stroke="#94A3B8" stroke-width="2"/>`;
      const discs = mass/100;
      g += `<g id="hk-stack">`;
      for(let i = 0; i < discs; i++) g += `<rect x="${X - 18}" y="${yb + 14 + i*7}" width="36" height="6" rx="2" fill="url(#k-metal)" stroke="#475569" stroke-width=".5"/>`;
      g += `<rect x="${X - 30}" y="${yb + 6}" width="60" height="${Math.max(30, 18 + discs*7)}" fill="transparent"/></g>`;
      // magnifier on the pointer
      const cx = 560, cy = Kit.clamp(yb, 140, 400), S = 40;
      let z = `<rect x="-80" y="-80" width="160" height="160" fill="#E9CFA0"/>`;
      for(let mm = Math.floor((L - 2)*10); mm <= Math.ceil((L + 2)*10); mm++){ const y = (mm/10 - L)*S, w = mm % 10 === 0 ? 46 : mm % 5 === 0 ? 30 : 18; z += `<line x1="-40" y1="${y}" x2="${-40 + w}" y2="${y}" stroke="#4B3621" stroke-width="${mm % 10 ? .9 : 1.6}"/>`; if(mm % 10 === 0) z += `<text x="12" y="${y + 5}" style="font:600 14px 'JetBrains Mono';fill:#4B3621">${mm/10}</text>`; }
      z += `<line x1="-80" y1="0" x2="-30" y2="0" stroke="#DC2626" stroke-width="2.4"/>`;
      g += `<line x1="406" y1="${yb}" x2="${cx - 78}" y2="${cy}" stroke="var(--accent)" stroke-dasharray="3 3"/><g transform="translate(${cx} ${cy})"><circle r="78" fill="none" stroke="var(--accent)" stroke-width="3"/><g clip-path="url(#hk-lc)">${z}</g></g>`;
      // tray of slotted masses
      g += `<g transform="translate(760 360)"><rect x="-70" y="-40" width="140" height="120" rx="12" fill="color-mix(in srgb,var(--bg-card) 80%,transparent)" stroke="var(--brd2)"/><text y="-50" text-anchor="middle" class="k-lbl">100 g masses — drag onto the hanger</text>`;
      for(let i = 0; i < 6; i++) g += `<rect x="-22" y="${40 - i*7}" width="44" height="6" rx="2" fill="url(#k-metal)" stroke="#475569" stroke-width=".5"/>`;
      g += `<rect id="hk-src" x="-50" y="-30" width="100" height="90" fill="transparent" class="k-drag"/></g>`;
      if(dragDisc) g += `<rect x="${dragDisc.x - 22}" y="${dragDisc.y - 3}" width="44" height="6" rx="2" fill="url(#k-metal)" stroke="var(--accent)"/>`;
      $("#hk-scene").innerHTML = g;
      $("#hk-status").textContent = `${SPR[sp].name}: ${mass} g on the hanger (${dir})`;
      ctx.readout([["Load", F().toFixed(2) + " N"], ["Original length", L0[sp].toFixed(1) + " cm"], ["Direction", dir]]);
    }
    Kit.dragger(ctx, svg, {
      hit(tg, p){ if(tg.closest("#hk-src")){ if(mass >= 1000){ ctx.toast("1000 g is the maximum"); return null; } return { k:"add" }; } if(tg.closest("#hk-stack") && mass > 0) return { k:"remove" }; return null; },
      move(h, p){ dragDisc = { x:p.x, y:p.y }; draw(); },
      end(h, p){
        dragDisc = null;
        if(h.k === "add" && Math.abs(p.x - 300) < 90 && p.y > 80){ mass += 100; dir = "loading"; maxF = Math.max(maxF, F()); rd.clear(); }
        if(h.k === "remove" && (Math.abs(p.x - 300) > 90 || p.y > 470)){ mass -= 100; dir = "unloading"; rd.clear(); }
        draw();
      }
    });
    ctx.seg({ label:"Spring", value:"A", options:[["A","Spring A"],["B","Spring B"],["band","Rubber band"]], onChange(v){ sp = v; mass = 0; maxF = 0; dir = "loading"; run++; rd.clear(); draw(); } });
    const rd = Kit.reading(ctx, "Pointer reading / cm (read the magnifier, to 0.1 cm)", "e.g. 12.4", () => len(), .1, v => {
      const L = Kit.round(v, 1), label = sp === "band" ? `Rubber band ${dir}` : SPR[sp].name;
      ctx.record({ spring:label, m:mass, F:Kit.round(F(), 2), L, x:Kit.round(L - L0[sp], 1) });
      rd.clear();
      const rows = ctx.rows(), a = new Set(rows.filter(r => r.spring === "Spring A").map(r => r.m));
      if([0,100,200,300,400,500,600,700,800,900,1000].every(m => a.has(m))) ctx.complete("lin");
      if(rows.some(r => r.spring === "Rubber band unloading") && rows.some(r => r.spring === "Rubber band loading")) ctx.complete("band");
    });
    Kit.answer(ctx, "Spring constant of spring A / N m⁻¹", "e.g. 40", v => {
      const pts = ctx.rows().filter(r => r.spring === "Spring A" && r.F <= 5.9).map(r => [r.F, r.x]);
      if(pts.length < 4) return [false, "Record at least four loads below the limit of proportionality."];
      const f = ctx.linFit(pts), k = 100/f.m;
      if(Math.abs(v - k)/k <= .05){ ctx.complete("k"); return [true, `Correct — k = 1 ÷ ${f.m.toFixed(3)} cm/N × 100 = ${k.toFixed(0)} N/m.`]; }
      return [false, "Gradient of x (cm) against F (N) is cm per N; k = 100 ÷ gradient in N/m."];
    });
    Kit.answer(ctx, "Limit of proportionality of spring A / N", "e.g. 6", v => Math.abs(v - 6) <= .8 ? (ctx.complete("limit"), [true, "Correct — about 6 N (600 g)."]) : [false, "Look for where the points leave the straight line through the origin."]);
    draw();
  }
});

/* ───────────── REFRACTION & TIR ───────────── */
Lab.register({
  id:"refraction", subject:"physics", level:["igcse","as"], topic:"Light · Refraction", interactive:true,
  title:"Refraction & total internal reflection",
  summary:"Swing a ray box round a rectangular or semicircular glass block, read the angles on a protractor, and find the refractive index and critical angle.",
  aim:"Investigate refraction through a glass block, determine the refractive index of the glass, and find its critical angle.",
  variables:{ iv:"Angle of incidence i (°)", dv:"Angle of refraction r (°)", cv:["Same block","Angles measured from the normal","Thin ray, pins or pencil dots to mark it"] },
  stageTitle:"Glass block on paper", controlsTitle:"Measure",
  thumb:`<svg viewBox="0 0 300 140"><rect x="90" y="60" width="140" height="60" fill="#7DD3FC" opacity=".35" stroke="#7DD3FC"/><path d="M60 10 L130 60 L160 120 L200 150" stroke="#EF4444" stroke-width="3" fill="none"/></svg>`,
  challenges:[
    { id:"rect",     title:"Air into glass", text:"Record five angles with the rectangular block." },
    { id:"n",        title:"Refractive index", text:"Find n from the gradient of sin i against sin r." },
    { id:"critical", title:"Critical angle", text:"With the semicircular block, find the critical angle." },
    { id:"tir",      title:"Total internal reflection", text:"Make the ray totally internally reflect." }
  ],
  columns:[{key:"mat",label:"Block / direction"},{key:"i",label:"i / °",dp:0},{key:"r",label:"r / °",dp:0},{key:"si",label:"sin i",dp:3},{key:"sr",label:"sin r",dp:3}],
  series:"mat",
  graph:{ x:["sr","i"], y:["si","r"], fit:"linear" },
  questions:[
    { q:"Light travels from air into glass. Plot sin i against sin r. What does the gradient tell you?",
      a:"A straight line through the origin whose gradient is the refractive index n = sin i ÷ sin r." },
    { q:"Why does the ray leave the rectangular block parallel to the incident ray?",
      a:"The two faces are parallel, so the refraction at the second face exactly reverses the first. The ray is displaced sideways but not deviated." },
    { q:"Why does the ray not bend as it enters the curved face of the semicircular block?",
      a:"It is aimed at the centre, so it travels along a radius and meets the curved surface along the normal (i = 0)." },
    { q:"How is the critical angle related to the refractive index?",
      a:"sin c = 1/n. At the critical angle the refracted ray travels along the surface (r = 90°); beyond it, total internal reflection occurs." },
    { q:"State the conditions for total internal reflection.",
      a:"Light travels from a denser to a less dense medium, and the angle of incidence is greater than the critical angle." }
  ],
  setup(ctx){
    const n = Kit.round(1.47 + Math.random()*.08, 3), rad = d => d*Math.PI/180, deg = r => r*180/Math.PI, C = deg(Math.asin(1/n));
    let mode = "rect", i = 40, showP = true;
    const P = () => mode === "rect" ? [480, 240] : [480, 250];
    const refr = () => mode === "rect" ? deg(Math.asin(Math.sin(rad(i))/n)) : (n*Math.sin(rad(i)) > 1 ? null : deg(Math.asin(n*Math.sin(rad(i)))));
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="rr-svg"><defs>${Kit.DEFS}</defs><rect x="30" y="30" width="900" height="490" rx="6" fill="#F8FAFC"/><g id="rr-scene"></g><text x="48" y="60" class="k-status" style="fill:#0F172A" id="rr-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#rr-svg"), $ = q => svg.querySelector(q);
    function protractor(p){
      let g = `<circle cx="${p[0]}" cy="${p[1]}" r="150" fill="rgba(125,211,252,.08)" stroke="#0EA5E9" stroke-width="1"/>`;
      for(let a = 0; a < 360; a++){
        const fromN = a <= 90 ? a : a <= 180 ? 180 - a : a <= 270 ? a - 180 : 360 - a, L = fromN % 10 === 0 ? 14 : fromN % 5 === 0 ? 9 : 5;
        const s = Math.sin(rad(a)), c = Math.cos(rad(a));
        g += `<line x1="${p[0] + 150*s}" y1="${p[1] - 150*c}" x2="${p[0] + (150 - L)*s}" y2="${p[1] - (150 - L)*c}" stroke="#0369A1" stroke-width="${fromN % 10 ? .5 : .9}"/>`;
        if(fromN % 10 === 0 && fromN < 90 && fromN > 0) g += `<text x="${p[0] + 128*s}" y="${p[1] - 128*c + 3}" text-anchor="middle" style="font:600 8px 'JetBrains Mono';fill:#0369A1">${fromN}</text>`;
      }
      return g;
    }
    function draw(){
      const p = P(), r = refr();
      let g = "";
      if(mode === "rect"){
        g += `<rect x="250" y="${p[1]}" width="460" height="170" fill="rgba(125,211,252,.28)" stroke="#0EA5E9" stroke-width="1.6"/>`;
        const B = [p[0] - 200*Math.sin(rad(i)), p[1] - 200*Math.cos(rad(i))], Q = [p[0] + 170*Math.tan(rad(r)), p[1] + 170];
        g += `<line x1="${p[0]}" y1="${p[1] - 200}" x2="${p[0]}" y2="${p[1] + 200}" stroke="#64748B" stroke-dasharray="6 5"/>`;
        if(showP) g += protractor(p);
        g += `<line x1="${B[0]}" y1="${B[1]}" x2="${p[0]}" y2="${p[1]}" stroke="#EF4444" stroke-width="3"/><line x1="${p[0]}" y1="${p[1]}" x2="${Q[0]}" y2="${Q[1]}" stroke="#EF4444" stroke-width="3"/>
          <line x1="${Q[0]}" y1="${Q[1]}" x2="${Q[0] + 160*Math.sin(rad(i))}" y2="${Q[1] + 160*Math.cos(rad(i))}" stroke="#EF4444" stroke-width="3"/>
          <line x1="${p[0]}" y1="${p[1]}" x2="${p[0] + 200*Math.sin(rad(i))}" y2="${p[1] - 200*Math.cos(rad(i))}" stroke="#EF4444" stroke-width="1.5" opacity=".25"/>`;
        g += box(B, 270 - i);
      }else{
        g += `<path d="M${p[0] - 180} ${p[1]} A180 180 0 0 0 ${p[0] + 180} ${p[1]} Z" fill="rgba(125,211,252,.28)" stroke="#0EA5E9" stroke-width="1.6"/>`;
        g += `<line x1="${p[0]}" y1="${p[1] - 220}" x2="${p[0]}" y2="${p[1] + 200}" stroke="#64748B" stroke-dasharray="6 5"/>`;
        if(showP) g += protractor(p);
        const B = [p[0] - 250*Math.sin(rad(i)), p[1] + 250*Math.cos(rad(i))];
        g += `<line x1="${B[0]}" y1="${B[1]}" x2="${p[0]}" y2="${p[1]}" stroke="#EF4444" stroke-width="3"/>`;
        g += `<line x1="${p[0]}" y1="${p[1]}" x2="${p[0] + 220*Math.sin(rad(i))}" y2="${p[1] + 220*Math.cos(rad(i))}" stroke="#EF4444" stroke-width="${r === null ? 3 : 1.5}" opacity="${r === null ? 1 : .3}"/>`;
        if(r !== null) g += `<line x1="${p[0]}" y1="${p[1]}" x2="${p[0] + 220*Math.sin(rad(r))}" y2="${p[1] - 220*Math.cos(rad(r))}" stroke="#EF4444" stroke-width="3"/>`;
        g += box(B, i + 90);
      }
      $("#rr-scene").innerHTML = g;
      $("#rr-status").textContent = mode === "semi" && r === null ? "Total internal reflection — no ray escapes into the air" : "Drag the ray box round; read the angles from the normal on the protractor";
      ctx.readout([["i", i + "°"], ["Block", mode === "rect" ? "rectangular (air → glass)" : "semicircular (glass → air)"], ["Ray", r === null ? "totally internally reflected" : "refracted", r === null ? "warn" : ""]]);
    }
    function box(B, rot){                               // the beam leaves the box's left end, pointing at P
      return `<g id="rr-box" class="k-drag" transform="translate(${B[0]} ${B[1]}) rotate(${rot})"><rect x="-44" y="-17" width="70" height="34" rx="6" fill="#1F2937"/><rect x="-52" y="-4" width="8" height="8" fill="#FDE68A"/><text x="-9" y="4" text-anchor="middle" style="font:700 9px Inter;fill:#E5E7EB">RAY BOX</text><rect x="-60" y="-30" width="96" height="60" fill="transparent"/></g>`;
    }
    Kit.dragger(ctx, svg, {
      hit(tg){ return tg.closest("#rr-box") ? "b" : null; },
      move(k, q){ const p = P(); const a = mode === "rect" ? Math.atan2(p[0] - q.x, p[1] - q.y) : Math.atan2(p[0] - q.x, q.y - p[1]); i = Kit.clamp(Math.round(deg(a)), 0, 85); if(mode === "semi" && refr() === null) ctx.complete("tir"); draw(); }
    });
    ctx.seg({ label:"Block", value:"rect", options:[["rect","Rectangular"],["semi","Semicircular"]], onChange(v){ mode = v; i = v === "rect" ? 40 : 25; draw(); } });
    ctx.seg({ label:"Protractor", value:true, options:[[true,"Show"],[false,"Hide"]], onChange(v){ showP = v; draw(); } });
    ctx.slider({ label:"Fine adjust i", min:0, max:85, step:1, value:i, unit:"°", onInput(v){ i = v; if(mode === "semi" && refr() === null) ctx.complete("tir"); draw(); } });
    Kit.reading(ctx, "Angle of refraction r / ° (read the protractor)", "nearest degree", () => { const r = refr(); return r === null ? null : r; }, 1, v => {
      const r = Math.round(v);
      ctx.record({ mat: mode === "rect" ? "Air → glass (rectangular)" : "Glass → air (semicircular)", i, r, si:Kit.round(Math.sin(rad(i)), 3), sr:Kit.round(Math.sin(rad(r)), 3) });
      if(ctx.rows().filter(x => x.mat.startsWith("Air")).length >= 5) ctx.complete("rect");
    });
    Kit.answer(ctx, "Refractive index n", "e.g. 1.50", v => {
      const pts = ctx.rows().filter(x => x.mat.startsWith("Air")).map(x => [x.sr, x.si]); if(pts.length < 4) return [false, "Record at least four angles with the rectangular block."];
      const f = ctx.linFit(pts); if(Math.abs(v - f.m)/f.m <= .03){ ctx.complete("n"); return [true, `Correct — gradient ${f.m.toFixed(3)} (this glass has n = ${n}).`]; } return [false, "n = gradient of sin i (y) against sin r (x)."];
    });
    Kit.answer(ctx, "Critical angle c / °", "e.g. 42", v => Math.abs(v - C) <= 1.5 ? (ctx.complete("critical"), [true, `Correct — c = ${C.toFixed(1)}°.`]) : [false, "Use the semicircular block: increase i until the refracted ray just grazes the flat surface."]);
    draw();
  }
});
