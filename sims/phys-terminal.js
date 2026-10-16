"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · TERMINAL VELOCITY (IGCSE + AS)
   IGCSE: stacks of paper cake cases falling through air (drag ∝ v²)
   AS:    steel balls falling through glycerol (Stokes’ law, drag ∝ v)
   Drag the markers, then time with light gates or your own stopwatch.
══════════════════════════════════════════════════════════════════ */
Lab.register({
  id:"terminal", subject:"physics", level:["igcse","as"], topic:"Forces · Terminal velocity", interactive:true,
  title:"Terminal velocity",
  summary:"Drop cake cases through air or ball bearings through glycerol. Time them between markers and see how terminal velocity depends on weight and size.",
  aim:"Investigate how the terminal velocity of a falling object depends on its weight (cake cases) or its radius (ball bearings in glycerol), and determine the viscosity of glycerol.",
  variables:{ iv:"Number of cake cases / radius of the ball", dv:"Terminal velocity (m/s)", cv:["Same drop height / same liquid at the same temperature","Same distance between the markers","Markers below the point where terminal velocity is reached"] },
  stageTitle:"Fall tube", controlsTitle:"Setup",
  thumb:`<svg viewBox="0 0 300 140"><rect x="135" y="8" width="30" height="128" rx="4" fill="#FBBF24" opacity=".25" stroke="#A2ACBD" stroke-width="2"/><rect x="133" y="50" width="34" height="3" fill="#FF5C7A"/><rect x="133" y="100" width="34" height="3" fill="#FF5C7A"/><circle cx="150" cy="74" r="5" fill="#B4BCCB"/></svg>`,
  challenges:[
    { id:"air",    title:"Cake cases", text:"Record terminal velocity for 4 or more different numbers of cases." },
    { id:"stokes", title:"Stokes’ law", text:"Record terminal velocity for 4 or more ball radii in glycerol." },
    { id:"eta",    title:"Viscosity of glycerol", text:"Use the gradient of v against r² to find η." },
    { id:"swatch", title:"Human timing", text:"Record a time using your own stopwatch and compare it with the light gates." }
  ],
  columns:[{key:"setup",label:"Setup"},{key:"n",label:"Cases n",dp:0},{key:"r",label:"r / mm",dp:1},{key:"d",label:"d / m",dp:2},{key:"t",label:"t / s",dp:2},{key:"timing",label:"Timing"},
    {key:"v",label:"v / m s⁻¹",dp:3},{key:"sqrtn",label:"√n",dp:3},{key:"r2",label:"r² / mm²",dp:2}],
  series:"setup",
  graph:{ x:["n","sqrtn","r2"], y:["v"], fit:"linear" },
  questions:[
    { q:"Explain why a falling object reaches terminal velocity.",
      a:"As it speeds up, air resistance (drag) increases. Eventually drag equals weight, so the resultant force is zero and it stops accelerating — it falls at constant (terminal) velocity." },
    { q:"Why is the top marker placed some distance below the release point?",
      a:"So the object has already reached terminal velocity before the timing starts; otherwise you would measure an average speed that includes the accelerating part." },
    { q:"For cake cases, drag ∝ v². Why should terminal velocity be proportional to √n?",
      a:"At terminal velocity weight = drag: nmg = kv². Stacked cases have the same shape, so k is the same, giving v = √(nmg/k) ∝ √n." },
    { q:"Stokes’ law gives terminal velocity v = 2r²(ρs − ρf)g / 9η. What graph gives a straight line?",
      a:"v against r² is a straight line through the origin with gradient 2(ρs − ρf)g/9η, so η = 2(ρs − ρf)g / (9 × gradient). Use r in metres." },
    { q:"Why does glycerol’s viscosity need the temperature to be kept constant?",
      a:"Viscosity of glycerol falls sharply as temperature rises, which would increase the terminal velocity." }
  ],
  setup(ctx){
    const G = 9.81, RS = 7850, RF = 1260, ETA = Kit.round(1.15 + Math.random()*.35, 2), CASE_M = .55e-3, K = .55e-3*G/1.21;
    let mode = "air", n = 1, r = 2, timing = "gates", speed = 1;
    let m1 = 1.40, m2 = .40;                 // air: marker heights above the floor (m)
    let g1 = .25, g2 = .85;                  // glycerol: marker depths below the surface (m)
    let st = null;                           // falling state
    const sw = Kit.stopwatch("tv-sw", 740, 300);
    const AIR = { top:40, floor:440, ppm:200, x:470 }, GLY = { surf:70, ppm:380, x:470 };
    const yAir = h => AIR.floor - h*AIR.ppm, yGly = d => GLY.surf + d*GLY.ppm;
    const tau = () => 2*RS*Math.pow(r/1000, 2)/(9*ETA), vtGly = () => 2*Math.pow(r/1000, 2)*(RS - RF)*G/(9*ETA);

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="tv-svg"><defs>${Kit.DEFS}
        <linearGradient id="tv-gly" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDE68A" stop-opacity=".35"/><stop offset="1" stop-color="#F59E0B" stop-opacity=".45"/></linearGradient></defs>
      ${Kit.bench(960, 470)}<g id="tv-scene"></g>${sw.svg}
      <g transform="translate(740 140)"><rect width="168" height="120" rx="12" fill="#1F2937" stroke="#4B5563"/>
        <text x="12" y="22" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.08em">LIGHT GATES</text>
        <text x="12" y="50" style="font:600 11px Inter;fill:#E5E7EB">Top</text><text x="156" y="50" text-anchor="end" class="k-lcd" style="font-size:14px" id="tv-ga">—</text>
        <text x="12" y="76" style="font:600 11px Inter;fill:#E5E7EB">Bottom</text><text x="156" y="76" text-anchor="end" class="k-lcd" style="font-size:14px" id="tv-gb">—</text>
        <text x="12" y="104" style="font:600 11px Inter;fill:#E5E7EB">Between</text><text x="156" y="104" text-anchor="end" class="k-lcd" style="font-size:14px" id="tv-gd">—</text></g>
      <text x="24" y="34" class="k-status" id="tv-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#tv-svg"), $ = s => svg.querySelector(s);
    sw.bind(svg, () => { if(sw.running && st && !st.swUsed) st.swUsed = true; });

    function casesSvg(x, y){
      const h = 9 + (n - 1)*2.2;
      return `<path d="M${x - 24} ${y - h} L${x + 24} ${y - h} L${x + 16} ${y} L${x - 16} ${y} Z" fill="#F472B6" stroke="#9D174D"/>` +
        Array.from({ length:7 }, (_, i) => `<line x1="${x - 20 + i*6.7}" y1="${y - h}" x2="${x - 14 + i*4.7}" y2="${y}" stroke="#9D174D" stroke-width=".6"/>`).join("");
    }
    function draw(){
      let s = "";
      if(mode === "air"){
        for(let c = 0; c <= 200; c += 5){ const y = yAir(c/100), L = c % 50 === 0 ? 16 : c % 10 === 0 ? 10 : 5; s += `<line x1="360" y1="${y}" x2="${360 - L}" y2="${y}" stroke="var(--txt2)" stroke-width=".8"/>${c % 20 === 0 ? `<text x="${364}" y="${y + 3.5}" class="k-num">${(c/100).toFixed(1)}</text>` : ""}`; }
        s += `<rect x="352" y="${AIR.top - 6}" width="8" height="${AIR.floor - AIR.top + 6}" fill="url(#k-wood)"/><text x="330" y="${AIR.top - 12}" class="k-lbl">height / m</text>`;
        s += `<rect x="560" y="${AIR.top - 10}" width="10" height="${AIR.floor - AIR.top + 10}" fill="url(#k-metal)"/><rect x="${AIR.x - 40}" y="${AIR.top - 14}" width="130" height="8" fill="url(#k-metal)"/>`;
        [["m1", m1], ["m2", m2]].forEach(([id, h]) => { const y = yAir(h); s += marker(id, y, 410, 540, h.toFixed(2) + " m"); });
        const h = st ? st.y : 2.0; s += casesSvg(AIR.x, yAir(h));
      }else{
        s += `<rect x="${GLY.x - 30}" y="${GLY.surf}" width="60" height="${yGly(1.0) - GLY.surf + 16}" fill="url(#tv-gly)"/>
          <path d="M${GLY.x - 32} ${GLY.surf - 20} V${yGly(1.0) + 18} Q${GLY.x - 32} ${yGly(1.0) + 28} ${GLY.x - 22} ${yGly(1.0) + 28} H${GLY.x + 22} Q${GLY.x + 32} ${yGly(1.0) + 28} ${GLY.x + 32} ${yGly(1.0) + 18} V${GLY.surf - 20}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
          <text x="${GLY.x}" y="${GLY.surf - 26}" text-anchor="middle" class="k-lbl">glycerol</text>`;
        for(let c = 0; c <= 100; c += 2){ const y = yGly(c/100), L = c % 10 === 0 ? 14 : 6; s += `<line x1="400" y1="${y}" x2="${400 - L}" y2="${y}" stroke="var(--txt2)" stroke-width=".8"/>${c % 20 === 0 ? `<text x="352" y="${y + 3.5}" class="k-num">${(c/100).toFixed(1)}</text>` : ""}`; }
        s += `<rect x="400" y="${GLY.surf}" width="7" height="${yGly(1) - GLY.surf}" fill="url(#k-wood)"/><text x="330" y="${GLY.surf - 10}" class="k-lbl">depth / m</text>`;
        [["g1", g1], ["g2", g2]].forEach(([id, d]) => { s += marker(id, yGly(d), GLY.x - 34, GLY.x + 34, d.toFixed(2) + " m"); });
        const d = st ? st.y : -0.04; const rp = Math.max(2.5, r*2.6);
        s += `<circle cx="${GLY.x}" cy="${yGly(d)}" r="${rp}" fill="url(#k-metal)" stroke="#334155"/>`;
      }
      $("#tv-scene").innerHTML = s;
      const vNow = st ? st.v : 0;
      $("#tv-status").textContent = !st ? "Drag the markers, choose the size, then release" : st.done ? "Landed — record the time" : `Falling at ${vNow.toFixed(3)} m/s`;
      ctx.readout([["Setup", mode === "air" ? `${n} cake case${n > 1 ? "s" : ""} in air` : `${r.toFixed(1)} mm radius ball in glycerol`], ["Marker gap", sep().toFixed(2) + " m"],
        ["Timing", timing === "gates" ? "light gates" : "your stopwatch"], ["Playback", speed === 1 ? "real time" : speed < 1 ? "slow ×" + speed : "fast ×" + speed]]);
    }
    function marker(id, y, x0, x1, lbl){
      return `<g data-m="${id}" class="k-drag"><line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#FF5C7A" stroke-width="3"/>
        ${timing === "gates" ? `<rect x="${x0 - 12}" y="${y - 7}" width="12" height="14" rx="2" fill="#0F172A"/><rect x="${x1}" y="${y - 7}" width="12" height="14" rx="2" fill="#0F172A"/>` : ""}
        <rect x="${x1 + 16}" y="${y - 11}" width="64" height="22" rx="6" fill="var(--bg-card)" stroke="#FF5C7A"/><text x="${x1 + 48}" y="${y + 4}" text-anchor="middle" class="k-tag">${lbl}</text>
        <rect x="${x0 - 14}" y="${y - 12}" width="${x1 - x0 + 110}" height="24" fill="transparent"/></g>`;
    }
    const sep = () => mode === "air" ? Math.abs(m1 - m2) : Math.abs(g2 - g1);
    function gates(){
      const a = st && st.ta, b = st && st.tb;
      $("#tv-ga").textContent = a !== undefined && a !== null ? a.toFixed(3) + " s" : "—";
      $("#tv-gb").textContent = b !== undefined && b !== null ? b.toFixed(3) + " s" : "—";
      $("#tv-gd").textContent = a != null && b != null ? (b - a).toFixed(3) + " s" : "—";
    }

    ctx.frame(dt => {
      const sdt = dt*speed; sw.tick(sdt);
      if(!st || st.done) return;
      const prev = st.y, tPrev = st.t;
      if(mode === "air"){
        const m = n*CASE_M, steps = 20, h = sdt/steps;
        for(let i = 0; i < steps; i++){ st.v += (G - K/m*st.v*st.v)*h; st.y -= st.v*h; }
        st.t += sdt;
        const hi = Math.max(m1, m2), lo = Math.min(m1, m2);
        if(st.ta == null && st.y <= hi) st.ta = tPrev + sdt*(prev - hi)/(prev - st.y);
        if(st.tb == null && st.y <= lo) st.tb = tPrev + sdt*(prev - lo)/(prev - st.y);
        if(st.y <= 0){ st.y = 0; st.done = true; st.v = 0; }
      }else{
        st.t += sdt; const T = tau(), vt = vtGly();
        st.y = vt*(st.t - T*(1 - Math.exp(-st.t/T))); st.v = vt*(1 - Math.exp(-st.t/T));
        const a = Math.min(g1, g2), b = Math.max(g1, g2);
        if(st.ta == null && st.y >= a) st.ta = tPrev + sdt*(a - prev)/(st.y - prev);
        if(st.tb == null && st.y >= b) st.tb = tPrev + sdt*(b - prev)/(st.y - prev);
        if(st.y >= 1.0){ st.y = 1.0; st.done = true; }
      }
      draw(); gates();
    });

    Kit.dragger(ctx, svg, {
      hit(t){ if(st && !st.done) return null; const m = t.closest("[data-m]"); return m ? m.dataset.m : null; },
      move(id, p){
        if(mode === "air"){ const h = Kit.clamp(Kit.snap((AIR.floor - p.y)/AIR.ppm, .05), .1, 1.9); if(id === "m1") m1 = h; else m2 = h; }
        else{ const d = Kit.clamp(Kit.snap((p.y - GLY.surf)/GLY.ppm, .01), .05, .97); if(id === "g1") g1 = d; else g2 = d; }
        st = null; draw(); gates();
      }
    });

    ctx.seg({ label:"Experiment", value:"air", options:[["air","Cake cases in air (IGCSE)"],["gly","Balls in glycerol (AS)"]], onChange(v){
      mode = v; st = null; speed = v === "air" ? 1 : 5; spSeg.set(speed); nSeg.node.style.display = v === "air" ? "" : "none"; rSeg.node.style.display = v === "air" ? "none" : ""; draw(); gates(); } });
    const nSeg = ctx.seg({ label:"Number of stacked cases", value:1, options:[1,2,3,4,5,6].map(k => [k, String(k)]), onChange(v){ n = v; st = null; draw(); } });
    const rSeg = ctx.seg({ label:"Ball radius", value:2, options:[[1,"1.0 mm"],[1.5,"1.5"],[2,"2.0"],[2.5,"2.5"],[3,"3.0"]], onChange(v){ r = v; st = null; draw(); } });
    rSeg.node.style.display = "none";
    ctx.seg({ label:"Timing", value:"gates", options:[["gates","Light gates"],["sw","My stopwatch"]], onChange(v){ timing = v; draw(); } });
    const spSeg = ctx.seg({ label:"Playback speed", value:1, options:[[.25,"×0.25"],[1,"×1"],[5,"×5"],[20,"×20"]], onChange(v){ speed = v; draw(); } });
    ctx.buttons([{ label:"Release", primary:true, onClick(){ st = { t:0, y: mode === "air" ? 2.0 : 0, v:0, ta:null, tb:null }; draw(); gates(); } },
      { label:"Reset", onClick(){ st = null; draw(); gates(); } }]);
    ctx.buttons([{ label:"Record time between markers", block:true, onClick(){
      let t;
      if(timing === "gates"){ if(!st || st.ta == null || st.tb == null){ ctx.toast("Let it pass both markers first"); return; } t = st.tb - st.ta; }
      else{ if(sw.running || sw.t <= 0){ ctx.toast("Start and stop your stopwatch as it passes the markers"); return; } t = sw.t; }
      const d = Kit.round(sep(), 2), v = Kit.round(d/t, 3);
      ctx.record({ setup: mode === "air" ? "Cake cases" : "Glycerol", n: mode === "air" ? n : null, r: mode === "air" ? null : r, d, t:Kit.round(t, 2), timing: timing === "gates" ? "gates" : "stopwatch",
        v, sqrtn: mode === "air" ? Kit.round(Math.sqrt(n), 3) : null, r2: mode === "air" ? null : Kit.round(r*r, 2) });
      if(timing === "sw"){ ctx.complete("swatch"); sw.reset(); }
      const rows = ctx.rows();
      if(new Set(rows.filter(x => x.setup === "Cake cases").map(x => x.n)).size >= 4) ctx.complete("air");
      if(new Set(rows.filter(x => x.setup === "Glycerol").map(x => x.r)).size >= 4) ctx.complete("stokes");
    } }]);
    Kit.answer(ctx, "Viscosity of glycerol η / Pa s", "e.g. 1.3", v => {
      const pts = ctx.rows().filter(x => x.setup === "Glycerol").map(x => [x.r2, x.v]);
      if(new Set(pts.map(p => p[0])).size < 3) return [false, "Record at least three ball radii in glycerol first."];
      const f = ctx.linFit(pts), eta = 2*(RS - RF)*G/(9*f.m*1e6);
      if(Math.abs(v - eta)/eta <= .05){ ctx.complete("eta"); return [true, `Correct from your gradient: η = ${eta.toFixed(2)} Pa s (the hidden value was ${ETA.toFixed(2)} Pa s).`]; }
      return [false, "η = 2(ρs − ρf)g ÷ (9 × gradient). Your gradient is in m s⁻¹ per mm² — multiply by 10⁶ to get m s⁻¹ per m². ρs = 7850, ρf = 1260 kg m⁻³."];
    });
    ctx.html(`<p class="hint">Steel ρ = 7850 kg m⁻³ · glycerol ρ = 1260 kg m⁻³ · g = 9.81 m s⁻²</p>`);
    draw(); gates();
  }
});
