"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · ELECTROMAGNETISM — Electromagnet · Induction · Field patterns
══════════════════════════════════════════════════════════════════ */

/* ───────────── ELECTROMAGNET STRENGTH ───────────── */
Lab.register({
  id:"electromagnet", subject:"physics", level:["igcse"], topic:"Electromagnetism · Electromagnets", interactive:true,
  title:"Strength of an electromagnet",
  summary:"Wind more turns, turn up the current, swap the core, then lower the electromagnet into a pile of paperclips and count how many it lifts.",
  aim:"Investigate how the strength of an electromagnet depends on the number of turns, the current and the core material.",
  variables:{ iv:"Number of turns / current (A) / core", dv:"Number of paperclips picked up", cv:["Same paperclips","The other two factors","Lowered into the pile the same way"] },
  stageTitle:"Electromagnet", controlsTitle:"Electromagnet",
  thumb:`<svg viewBox="0 0 300 140"><rect x="144" y="10" width="12" height="90" fill="#94A3B8"/>${Array.from({length:10},(_,i)=>`<ellipse cx="150" cy="${30+i*6}" rx="16" ry="3" fill="none" stroke="#D97706" stroke-width="2"/>`).join("")}${Array.from({length:6},(_,i)=>`<rect x="${140 + (i%2)*8}" y="${102+i*6}" width="14" height="5" rx="2.5" fill="none" stroke="#CBD5E1" stroke-width="1.5"/>`).join("")}</svg>`,
  challenges:[
    { id:"turns",   title:"More turns", text:"Record the number of clips for 4 or more numbers of turns at the same current." },
    { id:"current", title:"More current", text:"Record clips for 4 or more currents with the same turns." },
    { id:"steel",   title:"Iron or steel?", text:"Switch off with a steel core and notice the clips that stay." }
  ],
  columns:[{key:"core",label:"Core"},{key:"N",label:"Turns",dp:0},{key:"I",label:"Current / A",dp:2},{key:"clips",label:"Clips lifted",dp:0},{key:"NI",label:"N × I",dp:0}],
  series:"core",
  graph:{ x:["N","I","NI"], y:["clips"], fit:"linear" },
  questions:[
    { q:"State three ways to make an electromagnet stronger.",
      a:"More turns on the coil, a larger current, and a soft iron core." },
    { q:"Why is soft iron used for the core rather than steel?",
      a:"Soft iron is magnetised strongly but loses its magnetism as soon as the current is switched off. Steel stays magnetised (it becomes a permanent magnet), so the clips would not drop." },
    { q:"Why might the number of paperclips not be a very precise measure of strength?",
      a:"Clips are discrete, they can hang in chains, and the result depends on how the electromagnet is lowered. Repeating and averaging helps." },
    { q:"Why should the current be switched off between readings?",
      a:"The coil heats up with current, which increases its resistance and could change the current or damage the insulation." }
  ],
  setup(ctx){
    let N = 20, I = 1.0, core = "iron", on = false, tipY = 250, held = 0, falling = [], dropKeep = 0, turnsSel = 20;
    const DISH = 450, X = 480;
    const strength = () => (core === "iron" ? 1 : core === "steel" ? .62 : .07)*40*(1 - Math.exp(-N*I/90));
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="em-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 480)}<g id="em-scene"></g><text x="24" y="34" class="k-status" id="em-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#em-svg"), $ = s => svg.querySelector(s);
    const clip = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-9" y="-3" width="18" height="6" rx="3" fill="none" stroke="#CBD5E1" stroke-width="1.6"/><rect x="-6" y="-1.5" width="12" height="3" rx="1.5" fill="none" stroke="#CBD5E1" stroke-width="1"/></g>`;
    const pile = []; for(let i = 0; i < 60; i++) pile.push([X + (Math.random() - .5)*120, DISH + 6 - Math.random()*14, Math.random()*180]);

    function draw(){
      let s = `<rect x="740" y="60" width="10" height="420" fill="url(#k-metal)"/><rect x="${X + 20}" y="${tipY - 250}" width="${750 - X - 20}" height="10" fill="url(#k-metal)"/><rect x="700" y="472" width="90" height="10" fill="url(#k-metal)"/>`;
      // dish of clips
      s += `<path d="M${X - 90} ${DISH - 6} Q${X} ${DISH + 34} ${X + 90} ${DISH - 6}" fill="#334155" stroke="#1F2937"/>`;
      pile.slice(0, 60 - held).forEach(([x, y, r]) => s += clip(x, y, r));
      // nail + coil (draggable vertically)
      const top = tipY - 240;
      s += `<g id="em-nail" class="k-drag"><rect x="${X - 18}" y="${top}" width="36" height="10" rx="3" fill="url(#k-metal)"/><rect x="${X - 7}" y="${top + 10}" width="14" height="222" fill="${core === "steel" ? "#7C8796" : core === "iron" ? "#A3ACBA" : "rgba(200,210,225,.2)"}" stroke="#475569"/>
        <path d="M${X - 7} ${tipY - 8} L${X} ${tipY} L${X + 7} ${tipY - 8}" fill="${core === "air" ? "none" : "#A3ACBA"}" stroke="#475569"/>`;
      const shown = Math.min(30, Math.round(N/2)), cy0 = top + 50, sp = 120/shown;
      for(let k = 0; k < shown; k++) s += `<ellipse cx="${X}" cy="${cy0 + k*sp}" rx="17" ry="4" fill="none" stroke="#D97706" stroke-width="${Math.max(1.4, sp*.7)}"/>`;
      s += `<rect x="${X - 40}" y="${top}" width="80" height="250" fill="transparent"/></g>`;
      s += `<path d="M${X - 17} ${cy0} C ${X - 120} ${cy0} 300 ${cy0 - 40} 230 290" stroke="#DC2626" stroke-width="2" fill="none"/><path d="M${X - 17} ${cy0 + 120} C ${X - 140} ${cy0 + 120} 300 ${cy0 + 160} 230 330" stroke="#111827" stroke-width="2" fill="none"/>`;
      // clips held
      for(let k = 0; k < held; k++){ const ring = Math.floor(k/6), a = (k % 6)/6*Math.PI*2; s += clip(X + Math.cos(a)*(8 + ring*5), tipY + 8 + ring*9 + Math.sin(a)*4, 70 + k*23); }
      falling.forEach(f => s += clip(f.x, f.y, f.r));
      // power supply + ammeter
      s += `<g transform="translate(40 250)"><rect width="190" height="120" rx="10" fill="#334155" stroke="#1F2937"/><text x="12" y="20" style="font:700 10px Inter;fill:#CBD5E1">VARIABLE DC SUPPLY</text>
        <rect x="12" y="30" width="166" height="34" rx="4" fill="#132A1F"/><text x="170" y="54" text-anchor="end" class="k-lcd" style="font-size:17px">${on ? I.toFixed(2) : "0.00"} A</text>
        <g id="em-sw" class="k-btn"><rect x="12" y="76" width="70" height="32" rx="8" fill="${on ? "#16A34A" : "#0F172A"}" stroke="#475569"/><text x="47" y="97" text-anchor="middle" style="font:700 11px Inter;fill:#fff">${on ? "ON" : "OFF"}</text></g></g>`;
      $("#em-scene").innerHTML = s;
      $("#em-status").textContent = held ? `Holding ${held} paperclip${held > 1 ? "s" : ""} — record, then switch off` : on ? "Drag the electromagnet down into the clips, then lift it" : "Switch on, then lower the electromagnet into the clips";
      ctx.readout([["Turns", String(N)], ["Current", on ? I.toFixed(2) + " A" : "off"], ["Core", { iron:"soft iron", steel:"steel", air:"none (air)" }[core]], ["Clips held", String(held), held ? "good" : ""]]);
    }
    ctx.frame(dt => {
      if(!falling.length) return;
      falling.forEach(f => { f.vy += 1500*dt; f.y += f.vy*dt; });
      falling = falling.filter(f => f.y < DISH);
      draw();
    });
    function release(keepFrac){
      const keep = Math.round(held*keepFrac);
      for(let k = keep; k < held; k++) falling.push({ x:X + (Math.random() - .5)*30, y:tipY + 10 + Math.random()*20, r:Math.random()*180, vy:0 });
      held = keep;
    }
    Kit.dragger(ctx, svg, {
      hit(tg, p){
        if(tg.closest("#em-sw")){ on = !on; if(!on && held){ release(core === "steel" ? .55 : 0); if(core === "steel") ctx.complete("steel"); } else if(on && core === "steel") held = Math.max(held, 0); draw(); return null; }
        if(tg.closest("#em-nail")){ return { oy: tipY - p.y }; }
        return null;
      },
      move(h, p){
        const ny = Kit.clamp(p.y + h.oy, 220, DISH + 4);
        if(ny >= DISH - 10 && on && !held){ held = Math.max(0, Math.round(strength() + (Math.random() - .5)*2)); }
        tipY = ny; draw();
      }
    });
    ctx.seg({ label:"Turns on the coil", value:20, options:[[10,"10"],[20,"20"],[30,"30"],[40,"40"],[50,"50"]], onChange(v){ if(on) return ctx.toast("Switch off to rewind the coil"); N = v; draw(); } });
    ctx.slider({ label:"Current", min:.2, max:2, step:.1, value:I, unit:"A", fmt:v => v.toFixed(1), onInput(v){ I = v; draw(); } });
    ctx.seg({ label:"Core", value:"iron", options:[["iron","Soft iron"],["steel","Steel"],["air","None"]], onChange(v){ if(held) return ctx.toast("Drop the clips first"); core = v; draw(); } });
    ctx.buttons([{ label:"Record clips lifted", primary:true, block:true, onClick(){
      if(tipY > DISH - 60) return ctx.toast("Lift the electromagnet clear of the dish first");
      if(!on) return ctx.toast("Switch on first");
      ctx.record({ core:{ iron:"Soft iron", steel:"Steel", air:"No core" }[core], N, I, clips:held, NI:Math.round(N*I) });
      const rows = ctx.rows();
      const byI = {}; rows.forEach(r => (byI[r.core + r.I] = byI[r.core + r.I] || new Set()).add(r.N));
      if(Object.values(byI).some(s => s.size >= 4)) ctx.complete("turns");
      const byN = {}; rows.forEach(r => (byN[r.core + r.N] = byN[r.core + r.N] || new Set()).add(r.I));
      if(Object.values(byN).some(s => s.size >= 4)) ctx.complete("current");
      release(0); draw();
    } }]);
    ctx.html(`<p class="hint">After recording, the clips are put back in the dish. Steel keeps some clips after switching off — that’s why electromagnets use soft iron.</p>`);
    draw();
  }
});

/* ───────────── ELECTROMAGNETIC INDUCTION ───────────── */
Lab.register({
  id:"induction", subject:"physics", level:["igcse"], topic:"Electromagnetism · Induction", interactive:true,
  title:"Electromagnetic induction",
  summary:"Push a bar magnet into a coil and watch the galvanometer. Change speed, turns, pole and direction — and spot Lenz’s law.",
  aim:"Investigate the factors that affect the size and direction of the e.m.f. induced when a magnet moves relative to a coil.",
  variables:{ iv:"Speed of the magnet / number of turns / strength of the magnet", dv:"Peak reading on the galvanometer (mV)", cv:["Same coil (when changing speed)","Same speed (when changing turns)","Same pole and direction"] },
  stageTitle:"Coil and galvanometer", controlsTitle:"Magnet and coil",
  thumb:`<svg viewBox="0 0 300 140"><rect x="40" y="50" width="70" height="26" fill="#DC2626"/><rect x="110" y="50" width="70" height="26" fill="#2563EB"/>${Array.from({length:8},(_,i)=>`<ellipse cx="${200+i*8}" cy="63" rx="4" ry="22" fill="none" stroke="#D97706" stroke-width="2"/>`).join("")}</svg>`,
  challenges:[
    { id:"dir",   title:"Which way?", text:"Get readings in both directions (push in and pull out)." },
    { id:"speed", title:"Faster means bigger", text:"Record auto-push peaks at three different speeds (same coil)." },
    { id:"turns", title:"More turns", text:"Record auto-push peaks for all three coils at the same speed." }
  ],
  columns:[{key:"turns",label:"Turns",dp:0},{key:"mags",label:"Magnets",dp:0},{key:"speed",label:"Speed / cm s⁻¹",dp:0},{key:"move",label:"Movement"},{key:"peak",label:"Peak / mV",dp:1}],
  series:"turns",
  graph:{ x:["speed"], y:["peak"], fit:"linear" },
  questions:[
    { q:"State three ways to increase the induced e.m.f.",
      a:"Move the magnet faster, use more turns on the coil, and use a stronger magnet." },
    { q:"What happens to the meter when the magnet is held still inside the coil? Why?",
      a:"It reads zero. An e.m.f. is only induced when the magnetic field through the coil is changing (there must be relative movement)." },
    { q:"Why does the needle deflect the other way when the magnet is pulled out?",
      a:"The direction of the induced e.m.f. depends on the direction of the change. Pulling out reverses the change, so the current reverses." },
    { q:"State Lenz’s law and apply it to pushing a north pole into the coil.",
      a:"The induced current flows in a direction that opposes the change producing it. The end of the coil facing the magnet becomes a north pole, repelling the incoming north pole — so you must do work to push it in." }
  ],
  setup(ctx){
    const CX = 600, CY = 220, ML = 180;
    let turns = 200, mags = 1, flip = false, mx = 150, lastX = mx, phi = 0, emf = 0, needle = 0, nv = 0, peak = 0, peakSigned = 0, maxSpeed = 0, auto = null, autoSpeed = 40;
    const flux = x => { const u = (x - CX)/110; return (flip ? -1 : 1)*mags/Math.pow(1 + u*u, 1.5); };
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="in-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 470)}<g id="in-scene"></g><text x="24" y="34" class="k-status" id="in-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#in-svg"), $ = s => svg.querySelector(s);
    function draw(){
      let s = "";
      const shown = turns/10;
      s += `<rect x="${CX - 110}" y="${CY - 44}" width="220" height="88" rx="10" fill="rgba(217,119,6,.08)" stroke="#92400E"/>`;
      for(let k = 0; k < shown; k++) s += `<ellipse cx="${CX - 104 + k*(208/shown)}" cy="${CY}" rx="5" ry="44" fill="none" stroke="#D97706" stroke-width="${Math.max(1, 6 - shown/8)}" opacity=".9"/>`;
      // induced pole labels (Lenz)
      if(Math.abs(emf) > .4){ const end = mx < CX ? CX - 128 : CX + 128, faceN = (mx < CX ? 1 : -1)*Math.sign(emf)*(flip ? -1 : 1) > 0; s += `<text x="${end}" y="${CY - 54}" text-anchor="middle" style="font:800 18px Inter;fill:${faceN ? "#DC2626" : "#2563EB"}">${faceN ? "N" : "S"}</text>`; }
      // magnet (N on the right end unless flipped)
      const nRight = !flip;
      s += `<g id="in-mag" class="k-drag" transform="translate(${mx} ${CY})">`;
      for(let m = 0; m < mags; m++) s += `<g transform="translate(0 ${m*30 - (mags - 1)*15})"><rect x="${-ML/2}" y="-13" width="${ML/2}" height="26" fill="${nRight ? "#2563EB" : "#DC2626"}"/><rect x="0" y="-13" width="${ML/2}" height="26" fill="${nRight ? "#DC2626" : "#2563EB"}"/>
        <text x="${-ML/4}" y="5" text-anchor="middle" style="font:800 13px Inter;fill:#fff">${nRight ? "S" : "N"}</text><text x="${ML/4}" y="5" text-anchor="middle" style="font:800 13px Inter;fill:#fff">${nRight ? "N" : "S"}</text></g>`;
      s += `<rect x="${-ML/2 - 10}" y="-40" width="${ML + 20}" height="80" fill="transparent"/></g>`;
      // wires + galvanometer
      s += `<path d="M${CX - 104} ${CY + 44} V330 H540 V346 M${CX + 104} ${CY + 44} V330 H660 V346" stroke="#111827" stroke-width="2" fill="none"/>
        <g transform="translate(600 390)"><rect x="-110" y="-44" width="220" height="122" rx="14" fill="#F8FAFC" stroke="#94A3B8"/>
        <path d="M-80 -20 A90 90 0 0 1 80 -20" fill="none" stroke="#334155" stroke-width="1.5"/>`;
      for(let k = -10; k <= 10; k++){ const a = k*6*Math.PI/180; s += `<line x1="${Math.sin(a)*82}" y1="${-Math.cos(a)*82 + 60}" x2="${Math.sin(a)*(k % 5 ? 76 : 70)}" y2="${-Math.cos(a)*(k % 5 ? 76 : 70) + 60}" stroke="#334155" stroke-width="${k % 5 ? 1 : 1.6}"/>`; if(k % 5 === 0) s += `<text x="${Math.sin(a)*60}" y="${-Math.cos(a)*60 + 64}" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#334155">${k*2}</text>`; }
      const na = Kit.clamp(needle, -64, 64)*Math.PI/180;
      s += `<line x1="0" y1="60" x2="${Math.sin(na)*86}" y2="${60 - Math.cos(na)*86}" stroke="#DC2626" stroke-width="2.4"/><circle cx="0" cy="60" r="6" fill="#334155"/><text y="2" text-anchor="middle" style="font:600 9px Inter;fill:#64748B">mV</text>
        <text y="-30" text-anchor="middle" style="font:700 10px Inter;fill:#334155">centre-zero galvanometer</text></g>`;
      $("#in-scene").innerHTML = s;
      $("#in-status").textContent = auto ? "Pushing at a steady speed…" : Math.abs(emf) > .3 ? `Induced e.m.f. ${emf.toFixed(1)} mV` : "Drag the magnet into and out of the coil";
      ctx.readout([["Coil", turns + " turns"], ["Magnets", String(mags)], ["Last peak", peakSigned.toFixed(1) + " mV"], ["Fastest push", Math.round(maxSpeed) + " cm/s"]]);
    }
    let lastT = performance.now();
    ctx.frame(dt => {
      if(auto){ mx += auto.dir*autoSpeed*10*dt; if((auto.dir > 0 && mx >= auto.to) || (auto.dir < 0 && mx <= auto.to)){ mx = auto.to; finishAuto(); } }
      const dx = mx - lastX; lastX = mx;
      const newPhi = flux(mx), dphi = (newPhi - phi)/Math.max(dt, 1e-3); phi = newPhi;
      emf = -turns*dphi*.0125;
      const sp = Math.abs(dx)/Math.max(dt, 1e-3)/10;
      if(sp > 1) maxSpeed = Math.max(maxSpeed, sp);
      if(Math.abs(emf) > Math.abs(peakSigned)) peakSigned = emf;
      nv += (-(needle - Kit.clamp(emf*3, -64, 64))*90 - nv*11)*dt; needle += nv*dt;
      draw();
    });
    function finishAuto(){
      const a = auto; auto = null;
      ctx.record({ turns, mags, speed:autoSpeed, move:a.label, peak:Kit.round(Math.abs(peakSigned), 1) }, true);
      ctx.toast(`Peak ${Math.abs(peakSigned).toFixed(1)} mV recorded`);
      const rows = ctx.rows();
      const s1 = {}; rows.forEach(r => (s1[r.turns + "-" + r.mags] = s1[r.turns + "-" + r.mags] || new Set()).add(r.speed));
      if(Object.values(s1).some(s => s.size >= 3)) ctx.complete("speed");
      const s2 = {}; rows.forEach(r => (s2[r.speed + "-" + r.mags] = s2[r.speed + "-" + r.mags] || new Set()).add(r.turns));
      if(Object.values(s2).some(s => s.size >= 3)) ctx.complete("turns");
    }
    let sawPos = false, sawNeg = false;
    ctx.frame(() => { if(emf > 2) sawPos = true; if(emf < -2) sawNeg = true; if(sawPos && sawNeg) ctx.complete("dir"); });
    Kit.dragger(ctx, svg, {
      hit(tg, p){ if(auto) return null; if(tg.closest("#in-mag")){ peakSigned = 0; maxSpeed = 0; return { ox: mx - p.x }; } return null; },
      move(h, p){ mx = Kit.clamp(p.x + h.ox, 80, 880); }
    });
    ctx.seg({ label:"Coil", value:200, options:[[100,"100 turns"],[200,"200 turns"],[400,"400 turns"]], onChange(v){ turns = v; } });
    ctx.seg({ label:"Magnets", value:1, options:[[1,"One"],[2,"Two (stronger)"]], onChange(v){ mags = v; phi = flux(mx); } });
    ctx.buttons([{ label:"Flip the magnet", onClick(){ flip = !flip; phi = flux(mx); } }]);
    ctx.seg({ label:"Auto-push speed", value:40, options:[[20,"20 cm/s"],[40,"40"],[60,"60"],[80,"80"]], onChange(v){ autoSpeed = v; } });
    ctx.buttons([{ label:"Push in", primary:true, onClick(){ if(auto) return; peakSigned = 0; mx = 150; lastX = mx; phi = flux(mx); auto = { dir:1, to:CX, label:"push in" }; } },
      { label:"Pull out", onClick(){ if(auto) return; peakSigned = 0; mx = CX; lastX = mx; phi = flux(mx); auto = { dir:-1, to:150, label:"pull out" }; } }]);
    ctx.html(`<p class="hint">Dragging by hand is fun, but the auto-push gives a steady, repeatable speed for a fair test.</p>`);
    draw();
  }
});

/* ───────────── MAGNETIC FIELD PATTERNS ───────────── */
Lab.register({
  id:"fields", subject:"physics", level:["igcse"], topic:"Magnetism · Field patterns", interactive:true,
  title:"Magnetic field patterns",
  summary:"Plot field lines with a compass, sprinkle iron filings, and explore two magnets, a straight wire and a solenoid.",
  aim:"Plot the magnetic field around bar magnets, a current-carrying wire and a solenoid using a plotting compass and iron filings.",
  stageTitle:"Paper on the bench", controlsTitle:"Field",
  thumb:`<svg viewBox="0 0 300 140"><rect x="110" y="58" width="40" height="24" fill="#DC2626"/><rect x="150" y="58" width="40" height="24" fill="#2563EB"/>${[20,34,48].map(r => `<path d="M190 70 C ${200+r} ${70-r*1.4} ${100-r} ${70-r*1.4} 110 70" fill="none" stroke="#A2ACBD"/><path d="M190 70 C ${200+r} ${70+r*1.4} ${100-r} ${70+r*1.4} 110 70" fill="none" stroke="#A2ACBD"/>`).join("")}</svg>`,
  challenges:[
    { id:"dots",    title:"Plot a field line", text:"Use the compass to plot 12 or more dots around a bar magnet." },
    { id:"neutral", title:"Neutral point", text:"Find the neutral point between two repelling north poles with the compass." },
    { id:"wire",    title:"Round the wire", text:"Plot 8 dots around the current-carrying wire." },
    { id:"solenoid",title:"Like a bar magnet", text:"Sprinkle filings round the solenoid." }
  ],
  questions:[
    { q:"Which way does a field line point?",
      a:"From the north pole to the south pole outside the magnet — the direction a compass north pole would point." },
    { q:"What is a neutral point?",
      a:"A point where the magnetic fields cancel, so the resultant field is zero and a compass does not settle in any particular direction." },
    { q:"Describe the field around a straight current-carrying wire.",
      a:"Concentric circles centred on the wire, closer together near the wire. The direction is given by the right-hand grip rule." },
    { q:"How is the field of a solenoid similar to a bar magnet?",
      a:"Outside it has the same shape as a bar magnet’s field, with a north pole at one end and a south pole at the other. Inside the field is strong and uniform." }
  ],
  setup(ctx){
    const W = 960, H = 540;
    let cfg = "bar", dots = [], filings = false, compass = { x:620, y:180 }, current = 1, lines = [];
    function poles(){
      if(cfg === "bar") return [{ x:530, y:270, q:1 }, { x:430, y:270, q:-1 }];
      if(cfg === "attract") return [{ x:390, y:270, q:1 }, { x:290, y:270, q:-1 }, { x:570, y:270, q:-1 }, { x:670, y:270, q:1 }];
      if(cfg === "repel") return [{ x:390, y:270, q:1 }, { x:290, y:270, q:-1 }, { x:570, y:270, q:1 }, { x:670, y:270, q:-1 }];
      if(cfg === "solenoid") return [{ x:580, y:270, q:1 }, { x:380, y:270, q:-1 }];
      return [];
    }
    function B(x, y){
      if(cfg === "wire"){ const dx = x - 480, dy = y - 270, r2 = dx*dx + dy*dy + 30; return [current*(-dy)/r2*400, current*dx/r2*400]; }
      let bx = 0, by = 0;
      poles().forEach(p => { const dx = x - p.x, dy = y - p.y, r2 = dx*dx + dy*dy + 40, r3 = Math.pow(r2, 1.5); bx += p.q*dx/r3*1e4; by += p.q*dy/r3*1e4; });
      if(cfg === "solenoid" && x > 382 && x < 578 && Math.abs(y - 270) < 34){ bx += 3; }
      return [bx, by];
    }
    function trace(){
      lines = [];
      const seeds = [];
      if(cfg === "wire"){ for(let r = 40; r <= 240; r += 28) seeds.push([480 + r, 270, 1]); }
      else{ poles().filter(p => p.q > 0).forEach(p => { for(let k = 0; k < 18; k++){ const a = k/18*2*Math.PI; seeds.push([p.x + 14*Math.cos(a), p.y + 14*Math.sin(a), 1]); } });
        if(cfg === "repel") poles().filter(p => p.q < 0).forEach(p => { for(let k = 0; k < 12; k++){ const a = k/12*2*Math.PI; seeds.push([p.x + 14*Math.cos(a), p.y + 14*Math.sin(a), -1]); } }); }
      seeds.forEach(([x, y, dir]) => {
        const pts = [[x, y]];
        for(let i = 0; i < 700; i++){
          let [bx, by] = B(x, y); const m = Math.hypot(bx, by) || 1e-9; bx /= m; by /= m;
          const [bx2, by2] = B(x + bx*2*dir, y + by*2*dir), m2 = Math.hypot(bx2, by2) || 1e-9;
          x += (bx + bx2/m2)*2*dir; y += (by + by2/m2)*2*dir;
          if(x < 20 || x > W - 20 || y < 20 || y > H - 20) break;
          if(cfg !== "wire" && poles().some(p => p.q*dir < 0 && Math.hypot(x - p.x, y - p.y) < 10)) break;
          if(cfg === "wire" && i > 50 && Math.hypot(x - pts[0][0], y - pts[0][1]) < 3) break;
          pts.push([x, y]);
        }
        lines.push(pts);
      });
    }
    ctx.stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="kb" id="mf-svg"><defs>${Kit.DEFS}</defs><rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="6" fill="#F8FAFC"/><g id="mf-static"></g><g id="mf-dyn"></g><text x="40" y="52" class="k-status" style="fill:#0F172A" id="mf-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#mf-svg"), $ = s => svg.querySelector(s);
    function magnet(x, y, nRight){ return `<rect x="${x - 50}" y="${y - 16}" width="50" height="32" fill="${nRight ? "#2563EB" : "#DC2626"}"/><rect x="${x}" y="${y - 16}" width="50" height="32" fill="${nRight ? "#DC2626" : "#2563EB"}"/>
      <text x="${x - 25}" y="${y + 5}" text-anchor="middle" style="font:800 14px Inter;fill:#fff">${nRight ? "S" : "N"}</text><text x="${x + 25}" y="${y + 5}" text-anchor="middle" style="font:800 14px Inter;fill:#fff">${nRight ? "N" : "S"}</text>`; }
    let staticSvg = "";
    function rebuild(){
      let s = "";
      if(filings) lines.forEach(pts => { for(let i = 0; i < pts.length - 4; i += 7) s += `<line x1="${pts[i][0].toFixed(1)}" y1="${pts[i][1].toFixed(1)}" x2="${pts[i + 3][0].toFixed(1)}" y2="${pts[i + 3][1].toFixed(1)}" stroke="#475569" stroke-width="1.3" opacity=".8"/>`; });
      if(cfg === "bar") s += magnet(480, 270, true);
      if(cfg === "attract") s += magnet(340, 270, true) + magnet(620, 270, true);
      if(cfg === "repel") s += magnet(340, 270, true) + magnet(620, 270, false);
      if(cfg === "wire") s += `<circle cx="480" cy="270" r="14" fill="#D97706" stroke="#92400E"/>${current > 0 ? `<circle cx="480" cy="270" r="4" fill="#111827"/>` : `<path d="M472 262 L488 278 M488 262 L472 278" stroke="#111827" stroke-width="2.5"/>`}<text x="480" y="306" text-anchor="middle" style="font:600 11px Inter;fill:#334155">current ${current > 0 ? "out of" : "into"} the page</text>`;
      if(cfg === "solenoid"){ for(let k = 0; k < 10; k++) s += `<ellipse cx="${390 + k*20}" cy="270" rx="6" ry="34" fill="none" stroke="#D97706" stroke-width="3"/>`; s += `<text x="480" y="326" text-anchor="middle" style="font:600 11px Inter;fill:#334155">solenoid (current on)</text>`; }
      dots.forEach(([x, y]) => s += `<circle cx="${x}" cy="${y}" r="3" fill="#0F172A"/>`);
      staticSvg = s; $("#mf-static").innerHTML = s;
      ctx.readout([["Setup", { bar:"bar magnet", attract:"two magnets N→S", repel:"two magnets N→N", wire:"straight wire", solenoid:"solenoid" }[cfg]], ["Dots plotted", String(dots.length)], ["Iron filings", filings ? "on" : "off"]]);
    }
    function draw(){
      const [bx, by] = B(compass.x, compass.y), m = Math.hypot(bx, by), weak = m < .015;
      const ang = weak ? Math.sin(Date.now()/400)*1.2 + .4 : Math.atan2(by, bx);
      $("#mf-dyn").innerHTML = `<g id="mf-comp" class="k-drag" transform="translate(${compass.x} ${compass.y})"><circle r="22" fill="#fff" stroke="#334155" stroke-width="2"/>
        <g transform="rotate(${ang*180/Math.PI})"><path d="M0 -4 L17 0 L0 4Z" fill="#DC2626"/><path d="M0 -4 L-17 0 L0 4Z" fill="#94A3B8"/></g><circle r="2.5" fill="#111827"/><rect x="-26" y="-26" width="52" height="52" fill="transparent"/></g>`;
      $("#mf-status").textContent = weak ? "The compass wobbles — the field here is very weak (neutral point?)" : "Drag the compass, then mark where its north end points";
      if(weak && cfg === "repel" && Math.abs(compass.x - 480) < 25 && Math.abs(compass.y - 270) < 25) ctx.complete("neutral");
    }
    ctx.frame(() => draw());
    Kit.dragger(ctx, svg, { hit(tg, p){ return tg.closest("#mf-comp") ? { ox:compass.x - p.x, oy:compass.y - p.y } : null; }, move(h, p){ compass.x = Kit.clamp(p.x + h.ox, 40, W - 40); compass.y = Kit.clamp(p.y + h.oy, 40, H - 40); } });
    ctx.seg({ label:"Arrangement", value:"bar", options:[["bar","Bar magnet"],["attract","N–S (attract)"],["repel","N–N (repel)"],["wire","Straight wire"],["solenoid","Solenoid"]], onChange(v){ cfg = v; dots = []; trace(); rebuild(); } });
    ctx.buttons([{ label:"Mark north end of needle", primary:true, onClick(){
      const [bx, by] = B(compass.x, compass.y), m = Math.hypot(bx, by) || 1;
      dots.push([compass.x + bx/m*18, compass.y + by/m*18]);
      compass.x += bx/m*36; compass.y += by/m*36;
      if(cfg === "bar" && dots.length >= 12) ctx.complete("dots");
      if(cfg === "wire" && dots.length >= 8) ctx.complete("wire");
      rebuild();
    } }, { label:"Clear dots", onClick(){ dots = []; rebuild(); } }]);
    ctx.seg({ label:"Iron filings", value:false, options:[[false,"Off"],[true,"Sprinkle"]], onChange(v){ filings = v; if(v && cfg === "solenoid") ctx.complete("solenoid"); rebuild(); } });
    ctx.buttons([{ label:"Reverse current (wire)", onClick(){ current = -current; trace(); rebuild(); } }]);
    ctx.html(`<p class="hint">Marking a dot also moves the compass along the line, so you can keep clicking to follow a field line — just like moving the compass on paper.</p>`);
    trace(); rebuild();
  }
});
