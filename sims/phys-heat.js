"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · THERMAL — Specific heat capacity · Cooling & insulation
══════════════════════════════════════════════════════════════════ */

/* ───────────── SPECIFIC HEAT CAPACITY ───────────── */
Lab.register({
  id:"shc", subject:"physics", level:["igcse"], topic:"Thermal physics · Specific heat capacity", interactive:true,
  title:"Specific heat capacity",
  summary:"Put a heater and thermometer into a metal block, add oil and insulation, switch on and measure how fast it warms to find c.",
  aim:"Determine the specific heat capacity of a metal (or water) by heating it with an electrical heater of known power.",
  variables:{ iv:"Time of heating (s) → energy supplied E = Pt", dv:"Temperature of the block (°C)", cv:["Mass of the block","Heater power (V and I)","Insulation"] },
  stageTitle:"Heating a block", controlsTitle:"Run",
  thumb:`<svg viewBox="0 0 300 140"><rect x="110" y="40" width="80" height="90" rx="6" fill="url(#none)" style="fill:#9AA3B2"/><ellipse cx="150" cy="40" rx="40" ry="8" fill="#CBD5E1"/>
    <rect x="128" y="10" width="8" height="60" fill="#FF8A3D"/><rect x="160" y="2" width="6" height="72" rx="3" fill="#fff"/><rect x="161.5" y="40" width="3" height="34" fill="#E0334A"/></svg>`,
  steps:[
    { id:"heater", text:"Drag the <b>heater</b> into the larger hole in the block." },
    { id:"thermo", text:"Add a drop of <b>oil</b> to the small hole, then put in the <b>thermometer</b>." },
    { id:"lag",    text:"Wrap the block in <b>insulation</b> (optional — compare with and without)." },
    { id:"on",     text:"Switch on the power supply — readings are taken every 60 s." },
    { id:"ten",    text:"Heat for at least 10 minutes, then use the gradient to find <b>c</b>." }
  ],
  challenges:[
    { id:"c",     title:"Find c", text:"Calculate the specific heat capacity within 5% of your data." },
    { id:"lagcmp",title:"Does insulation help?", text:"Record full runs with and without insulation for the same material." },
    { id:"two",   title:"Compare materials", text:"Record runs for two different materials." }
  ],
  columns:[{key:"run",label:"Run"},{key:"t",label:"t / s",dp:0},{key:"T",label:"θ / °C",dp:1},{key:"E",label:"E = Pt / J",dp:0}],
  series:"run",
  graph:{ x:["t","E"], y:["T"], fit:"linear" },
  questions:[
    { q:"Define specific heat capacity.",
      a:"The energy needed to raise the temperature of 1 kg of a substance by 1 °C. c = ΔE ÷ (m Δθ), units J/(kg °C)." },
    { q:"How do you find c from a graph of θ against t?",
      a:"Gradient = Δθ/Δt. Power P = VI = ΔE/Δt, so c = P ÷ (m × gradient)." },
    { q:"Why is the value of c obtained usually higher than the true value?",
      a:"Some energy is lost to the surroundings (and heats the heater and thermometer), so the temperature rise is smaller than it would be — making the calculated c too large." },
    { q:"Why is a drop of oil put in the thermometer hole?",
      a:"Oil improves thermal contact between the block and the thermometer bulb, so the thermometer reads the block temperature more quickly and accurately." },
    { q:"Why does the temperature continue to rise for a short time after the heater is switched off?",
      a:"The heater is hotter than the block, so energy keeps flowing from it into the block until they reach the same temperature." }
  ],
  setup(ctx){
    const MATS = { al:{ name:"Aluminium", c:900, m:1.00 }, cu:{ name:"Copper", c:385, m:1.00 }, fe:{ name:"Iron", c:450, m:1.00 }, water:{ name:"Water", c:4200, m:0.50 } };
    const V = 12.0, I = Kit.round(4.0 + Math.random()*.4, 2), P = V*I, TA = Kit.round(19 + Math.random()*3, 1);
    let mat = "al", heaterIn = false, thermoIn = false, oil = false, lag = false, on = false, speed = 30, auto = true;
    let Tb = TA, Th = TA, Tth = TA, t = 0, nextRec = 0, runNo = 1, maxTh = TA;
    const th = Kit.thermometer("sh-th", 0, 0, 240, 0, 80, 10);
    const pos = { heater:{ x:150, y:460, home:[150, 460] }, thermo:{ x:800, y:150, home:[800, 150] }, oil:{ x:760, y:440, home:[760, 440] }, lagj:{ x:640, y:440, home:[640, 440] } };
    const HOLE_H = [455, 250], HOLE_T = [525, 250];
    const runLabel = () => `${runNo}: ${MATS[mat].name}${lag ? ", insulated" : ""}`;

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="sh-svg"><defs>${Kit.DEFS}
        <pattern id="sh-foam" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#FDE68A"/><circle cx="3" cy="3" r="1.4" fill="#F59E0B" opacity=".5"/><circle cx="8" cy="7" r="1.1" fill="#F59E0B" opacity=".5"/></pattern></defs>
      ${Kit.bench(960, 490)}<g id="sh-scene"></g>
      <text x="24" y="34" class="k-status" id="sh-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#sh-svg"), $ = s => svg.querySelector(s);

    function draw(){
      const water = mat === "water";
      let s = "";
      // power supply
      s += `<g transform="translate(40 300)"><rect width="200" height="110" rx="10" fill="#334155" stroke="#1F2937"/>
        <text x="12" y="20" style="font:700 10px Inter;fill:#CBD5E1">POWER SUPPLY 12 V</text>
        <rect x="12" y="30" width="80" height="30" rx="4" fill="#132A1F"/><text x="86" y="52" text-anchor="end" class="k-lcd" style="font-size:16px">${on && heaterIn ? V.toFixed(1) : "0.0"} V</text>
        <rect x="104" y="30" width="84" height="30" rx="4" fill="#132A1F"/><text x="182" y="52" text-anchor="end" class="k-lcd" style="font-size:16px">${on && heaterIn ? I.toFixed(2) : "0.00"} A</text>
        <g id="sh-switch" class="k-btn"><rect x="12" y="70" width="70" height="30" rx="8" fill="${on ? "#16A34A" : "#0F172A"}" stroke="#475569"/><text x="47" y="90" text-anchor="middle" style="font:700 11px Inter;fill:#fff">${on ? "ON" : "OFF"}</text></g>
        <circle cx="170" cy="85" r="6" fill="${on ? "#FF5C7A" : "#4B5563"}"/></g>`;
      // block or beaker
      if(water) s += `<rect x="400" y="250" width="180" height="240" rx="6" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><rect x="403" y="290" width="174" height="197" fill="url(#k-water)"/>`;
      else s += `<rect x="400" y="250" width="180" height="240" rx="10" fill="url(#k-metal)" stroke="#475569"/><ellipse cx="490" cy="250" rx="90" ry="14" fill="#CBD5E1" stroke="#475569"/>
        <ellipse cx="${HOLE_H[0]}" cy="250" rx="14" ry="5" fill="#1F2937"/><ellipse cx="${HOLE_T[0]}" cy="250" rx="7" ry="3" fill="#1F2937"/>${oil ? `<ellipse cx="${HOLE_T[0]}" cy="250" rx="6" ry="2" fill="#FBBF24" opacity=".8"/>` : ""}
        <text x="490" y="420" text-anchor="middle" style="font:700 14px Inter;fill:#1F2937">${MATS[mat].name}</text><text x="490" y="440" text-anchor="middle" style="font:600 11px Inter;fill:#334155">mass 1.00 kg</text>`;
      if(water) s += `<text x="490" y="470" text-anchor="middle" style="font:600 11px Inter;fill:#0F172A">0.50 kg water</text>`;
      if(lag) s += `<rect x="388" y="262" width="204" height="228" rx="14" fill="url(#sh-foam)" opacity=".92" stroke="#B45309"/><text x="490" y="380" text-anchor="middle" style="font:700 12px Inter;fill:#92400E">insulation</text>`;
      else s += objLag();
      // heater
      const hp = heaterIn ? { x:HOLE_H[0], y:HOLE_H[1] + 110 } : pos.heater;
      const glow = on && heaterIn ? Math.min(.8, (Th - Tb)/20) : on ? .9 : 0;
      s += `<g data-k="heater" class="k-drag" transform="translate(${hp.x} ${hp.y})"><rect x="-10" y="-120" width="20" height="120" rx="4" fill="#94A3B8" stroke="#475569"/><rect x="-10" y="-120" width="20" height="120" rx="4" fill="#FF6B35" opacity="${glow.toFixed(2)}"/>
        <rect x="-14" y="-134" width="28" height="18" rx="3" fill="#1F2937"/><text x="0" y="${heaterIn ? -142 : 16}" text-anchor="middle" class="k-tag">heater</text><rect x="-24" y="-140" width="48" height="150" fill="transparent"/></g>`;
      const hx = hp.x, hy = hp.y - 134;
      s += `<path d="M240 340 C 300 340 ${hx - 60} ${hy - 60} ${hx - 6} ${hy}" stroke="#DC2626" stroke-width="2.5" fill="none"/><path d="M240 360 C 310 360 ${hx - 40} ${hy - 40} ${hx + 6} ${hy}" stroke="#111827" stroke-width="2.5" fill="none"/>`;
      // oil + thermometer
      if(!oil) s += `<g data-k="oil" class="k-drag" transform="translate(${pos.oil.x} ${pos.oil.y})"><path d="M-14 -40 H14 V0 H-14Z" fill="#FBBF24" opacity=".85" stroke="#92400E"/><rect x="-4" y="-62" width="8" height="24" fill="#E5E7EB"/><rect x="-7" y="-72" width="14" height="12" rx="5" fill="#111827"/><text y="16" text-anchor="middle" class="k-tag">oil</text><rect x="-24" y="-76" width="48" height="96" fill="transparent"/></g>`;
      const tp = thermoIn ? { x:HOLE_T[0] - 0, y:HOLE_T[1] + 40 } : pos.thermo;
      s += `<g data-k="thermo" class="k-drag" transform="translate(${tp.x} ${tp.y - 252})">${th.svg}<rect x="-14" y="-16" width="60" height="290" fill="transparent"/></g>`;
      if(!thermoIn) s += `<text x="${pos.thermo.x + 16}" y="${pos.thermo.y + 30}" class="k-tag">thermometer</text>`;
      // clock
      s += `<g transform="translate(760 40)"><rect width="170" height="70" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="12" y="20" style="font:700 9px Inter;fill:#9CA3AF;letter-spacing:.08em">TIME SINCE SWITCH-ON</text>
        <text x="158" y="54" text-anchor="end" class="k-lcd">${fmtT(t)}</text></g>`;
      $("#sh-scene").innerHTML = s;
      th.set(svg, Tth);
      $("#sh-status").textContent = !heaterIn ? "Put the heater into the block" : !thermoIn ? "Oil, then thermometer in the small hole" : !on ? "Switch on to start heating" : `Heating… P = ${P.toFixed(1)} W`;
      if(on && !heaterIn) $("#sh-status").textContent = "⚠ The heater is on in air — put it in the block!";
      ctx.readout([["Material", MATS[mat].name], ["Power", on && heaterIn ? `${V.toFixed(1)} V × ${I.toFixed(2)} A = ${P.toFixed(1)} W` : "off"], ["Thermometer", (Math.round(Tth*2)/2).toFixed(1) + " °C"],
        ["Time", fmtT(t)], ["Insulation", lag ? "on" : "off"]]);
    }
    const fmtT = s => `${Math.floor(s/60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    function objLag(){ return `<g data-k="lagj" class="k-drag" transform="translate(${pos.lagj.x} ${pos.lagj.y})"><rect x="-36" y="-50" width="72" height="50" rx="8" fill="url(#sh-foam)" stroke="#B45309"/><text y="16" text-anchor="middle" class="k-tag">insulation</text></g>`; }

    ctx.frame(dt => {
      const sdt = dt*speed, steps = Math.ceil(sdt/0.2), h = sdt/steps, M = MATS[mat], C = M.m*M.c;
      const k = (lag ? .12 : .55)*(mat === "water" ? 1.4 : 1), G = heaterIn ? 6 : .4, tau = thermoIn ? (oil || mat === "water" ? 6 : 28) : 8;
      for(let i = 0; i < steps; i++){
        const p = on ? P : 0;
        Th += (p - G*(Th - (heaterIn ? Tb : TA)))/45*h;
        if(heaterIn) Tb += (G*(Th - Tb) - k*(Tb - TA))/C*h; else Tb += -k*(Tb - TA)/C*h;
        Tth += ((thermoIn ? Tb : TA) - Tth)/tau*h;
        if(on) t += h;
      }
      maxTh = Math.max(maxTh, Th);
      if(on && auto && thermoIn && t >= nextRec){ record(nextRec); nextRec += 60; }
      if(on && !heaterIn && Th > 200){ on = false; ctx.toast("Heater switched off — it overheated in air"); }
      if(t >= 600) ctx.step("ten");
      draw();
    });
    function record(tt){
      ctx.record({ run:runLabel(), t:Math.round(tt), T:Math.round(Tth*2)/2, E:Math.round(P*tt) }, true);
      const rows = ctx.rows(), runs = {};
      rows.forEach(r => (runs[r.run] = runs[r.run] || []).push(r));
      const full = Object.entries(runs).filter(([, a]) => a.length >= 8).map(([k]) => k);
      const matsDone = new Set(full.map(k => k.split(": ")[1].split(",")[0]));
      if(matsDone.size >= 2) ctx.complete("two");
      for(const mname of matsDone) if(full.some(k => k.includes(mname + ", insulated")) && full.some(k => k.endsWith(": " + mname))) ctx.complete("lagcmp");
    }

    Kit.dragger(ctx, svg, {
      hit(tg){
        if(tg.closest("#sh-switch")){ if(!on && !thermoIn) ctx.toast("Put the thermometer in first so you can take readings"); on = !on; if(on){ ctx.step("on"); nextRec = Math.ceil(t/60 - 1e-9)*60; } draw(); return null; }
        const g = tg.closest("[data-k]"); if(!g) return null; const k = g.dataset.k;
        if(on && (k === "heater" || k === "thermo")){ ctx.toast("Switch off before moving the apparatus"); return null; }
        if(k === "heater" && heaterIn){ heaterIn = false; }
        if(k === "thermo" && thermoIn){ thermoIn = false; }
        return k;
      },
      start(k, p){ pos[k].ox = pos[k].x - p.x; pos[k].oy = pos[k].y - p.y; },
      move(k, p){ pos[k].x = p.x + pos[k].ox; pos[k].y = p.y + pos[k].oy; draw(); },
      end(k){
        const P0 = pos[k], over = (hx, lo, hi, w) => Math.abs(P0.x - hx) < (w || 55) && P0.y > lo && P0.y < hi;
        if(k === "heater" && over(HOLE_H[0], 200, 480)){ heaterIn = true; ctx.step("heater"); }
        else if(k === "thermo" && over(HOLE_T[0], 200, 480)){ thermoIn = true; if(oil || mat === "water") ctx.step("thermo"); else ctx.toast("Tip: a drop of oil gives better thermal contact"); }
        else if(k === "oil" && over(HOLE_T[0], 120, 330, 70)){ oil = true; if(thermoIn) ctx.step("thermo"); ctx.toast("Oil added to the thermometer hole"); }
        else if(k === "lagj" && P0.x > 380 && P0.x < 600 && P0.y > 240){ lag = true; ctx.step("lag"); }
        P0.x = P0.home[0]; P0.y = P0.home[1];
        draw();
      }
    });

    ctx.seg({ label:"Material", value:mat, options:[["al","Aluminium"],["cu","Copper"],["fe","Iron"],["water","Water"]], onChange(v){ mat = v; reset(); } });
    ctx.seg({ label:"Playback", value:30, options:[[1,"×1"],[10,"×10"],[30,"×30"],[60,"×60"]], onChange(v){ speed = v; } });
    ctx.seg({ label:"Readings", value:true, options:[[true,"Auto every 60 s"],[false,"Manual"]], onChange(v){ auto = v; } });
    ctx.buttons([{ label:"Record reading now", onClick(){ if(!thermoIn){ ctx.toast("No thermometer in the block"); return; } record(t); ctx.toast("Reading recorded"); } },
      { label:"Remove insulation", onClick(){ lag = false; draw(); } }]);
    ctx.buttons([{ label:"New run (cool the block)", block:true, onClick:reset }]);
    function reset(){ on = false; Tb = Th = Tth = TA; t = 0; nextRec = 0; runNo = Math.max(runNo, ...ctx.rows().map(r => parseInt(r.run) + 1 || 1)); draw(); }
    Kit.answer(ctx, "Specific heat capacity c / J kg⁻¹ °C⁻¹", "e.g. 950", v => {
      const rows = ctx.rows(); if(!rows.length) return [false, "Record a heating run first."];
      const last = rows[rows.length - 1].run, pts = rows.filter(r => r.run === last && r.t >= 120).map(r => [r.t, r.T]);
      if(pts.length < 4) return [false, "Heat for longer — you need readings beyond 2 minutes."];
      const f = ctx.linFit(pts), m = MATS[last.includes("Water") ? "water" : last.includes("Copper") ? "cu" : last.includes("Iron") ? "fe" : "al"];
      const c = P/(m.m*f.m);
      if(Math.abs(v - c)/c <= .05){ ctx.complete("c"); return [true, `Correct from your run: c = ${P.toFixed(1)} ÷ (${m.m.toFixed(2)} × ${f.m.toFixed(4)}) = ${Math.round(c)} J/(kg °C). Book value ${m.c}.`]; }
      return [false, `c = P ÷ (m × gradient). P = VI, and use the gradient of θ against t for your latest run (${last}).`];
    });
    reset();
  }
});

/* ───────────── COOLING & INSULATION ───────────── */
Lab.register({
  id:"cooling", subject:"physics", level:["igcse","as"], topic:"Thermal physics · Energy transfer", interactive:true,
  title:"Cooling curves & insulation",
  summary:"Fill two beakers from the kettle, wrap them in different materials or add lids, and compare their cooling curves.",
  aim:"Investigate how insulation, a lid and the colour of a surface affect the rate of cooling of hot water.",
  variables:{ iv:"Insulating material / lid / surface", dv:"Temperature of the water over time (°C)", cv:["Same volume of water","Same starting temperature","Same room temperature and beaker"] },
  stageTitle:"Two beakers", controlsTitle:"Run",
  thumb:`<svg viewBox="0 0 300 140"><rect x="70" y="40" width="60" height="80" rx="4" fill="#4C86C6" opacity=".6"/><rect x="170" y="40" width="60" height="80" rx="4" fill="#4C86C6" opacity=".6"/><rect x="164" y="34" width="72" height="92" rx="8" fill="none" stroke="#FDE68A" stroke-width="6" stroke-dasharray="4 3"/><path d="M80 30q6-10 0-20M110 30q6-10 0-20" stroke="#A2ACBD" fill="none"/></svg>`,
  challenges:[
    { id:"three", title:"Best insulator", text:"Record cooling curves for three different wrappings." },
    { id:"lid",   title:"Lid or no lid", text:"Compare two beakers that differ only by a lid." },
    { id:"colour",title:"Black or shiny", text:"Compare black paper with shiny foil." }
  ],
  columns:[{key:"b",label:"Beaker"},{key:"t",label:"t / min",dp:1},{key:"T",label:"θ / °C",dp:1}],
  series:"b",
  graph:{ x:["t"], y:["T"], fit:"none" },
  questions:[
    { q:"Why do both beakers need the same volume and starting temperature?",
      a:"Rate of cooling depends on the temperature difference with the surroundings and on the mass of water. Keeping these the same makes it a fair test of the insulation." },
    { q:"Why does the water cool more quickly at the start?",
      a:"The rate of energy transfer depends on the temperature difference between the water and the room. It is largest at the start." },
    { q:"How does a lid reduce energy loss?",
      a:"It reduces evaporation and stops convection currents carrying warm air away from the surface." },
    { q:"Why do bubble wrap and cotton wool insulate well?",
      a:"They trap air, which is a poor conductor; trapped air cannot form convection currents." },
    { q:"Why does the beaker wrapped in black paper cool faster than one wrapped in shiny foil?",
      a:"Dull black surfaces are good emitters of infrared radiation; shiny surfaces are poor emitters." }
  ],
  setup(ctx){
    const TA = 20, MAT = { none:["No wrap",1], cotton:["Cotton wool",.45], bubble:["Bubble wrap",.5], foam:["Foam",.38], foil:["Shiny foil",.8], black:["Black paper",1.18] };
    const B = [{ x:330, wrap:"none", lid:false, T:TA, full:false }, { x:560, wrap:"none", lid:false, T:TA, full:false }];
    let t = 0, running = false, speed = 30, nextRec = 0, vol = 200;
    const thA = Kit.thermometer("cl-a", 0, 0, 220, 0, 100, 10), thB = Kit.thermometer("cl-b", 0, 0, 220, 0, 100, 10);
    const ths = [thA, thB];
    const SHELF = ["cotton","bubble","foam","foil","black","lid"];
    let kettle = { x:110, y:300, home:[110, 300] }, drag = null;
    const label = (b, i) => `${"AB"[i]}: ${MAT[b.wrap][0]}${b.lid ? " + lid" : ""}`;

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="cl-svg"><defs>${Kit.DEFS}
      <pattern id="cl-cotton" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#F8FAFC"/><circle cx="4" cy="4" r="3" fill="#E2E8F0"/><circle cx="10" cy="9" r="2.5" fill="#E2E8F0"/></pattern>
      <pattern id="cl-bubble" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#DBEAFE" opacity=".6"/><circle cx="6" cy="6" r="4" fill="none" stroke="#93C5FD"/></pattern>
      <linearGradient id="cl-foil" x1="0" x2="1"><stop offset="0" stop-color="#9CA3AF"/><stop offset=".4" stop-color="#F3F4F6"/><stop offset="1" stop-color="#9CA3AF"/></linearGradient></defs>
      ${Kit.bench(960, 480)}<g id="cl-scene"></g><text x="24" y="34" class="k-status" id="cl-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#cl-svg"), $ = s => svg.querySelector(s);
    const wrapFill = w => ({ cotton:"url(#cl-cotton)", bubble:"url(#cl-bubble)", foam:"#FDE68A", foil:"url(#cl-foil)", black:"#111827" }[w]);

    function draw(){
      let s = "";
      // shelf of materials
      s += `<rect x="700" y="160" width="230" height="8" rx="3" fill="url(#k-wood)"/><text x="700" y="150" class="k-lbl">drag onto a beaker</text>`;
      SHELF.forEach((k, i) => {
        const x = 730 + (i % 3)*76, y = i < 3 ? 230 : 320;
        const art = k === "lid" ? `<rect x="-30" y="-10" width="60" height="10" rx="3" fill="#94A3B8"/>` : `<rect x="-26" y="-36" width="52" height="36" rx="6" fill="${wrapFill(k)}" stroke="#64748B"/>`;
        s += `<g data-src="${k}" class="k-drag" transform="translate(${x} ${y})">${art}<text y="18" text-anchor="middle" class="k-tag" style="font-size:10px">${k === "lid" ? "Lid" : MAT[k][0]}</text><rect x="-34" y="-44" width="68" height="70" fill="transparent"/></g>`;
      });
      // kettle
      s += `<g data-k="kettle" class="k-drag" transform="translate(${kettle.x} ${kettle.y})"><path d="M-40 0 Q-46 -60 0 -64 Q46 -60 40 0 Z" fill="#E5E7EB" stroke="#64748B"/><path d="M40 -40 L70 -60 L66 -50 L40 -26" fill="#CBD5E1" stroke="#64748B"/><path d="M-40 -46 Q-66 -36 -40 -14" fill="none" stroke="#64748B" stroke-width="6"/>
        <text y="16" text-anchor="middle" class="k-tag">kettle (90 °C)</text><rect x="-50" y="-70" width="130" height="90" fill="transparent"/></g>`;
      B.forEach((b, i) => {
        const lvl = 470 - vol*.75;
        s += `<g transform="translate(${b.x} 0)">`;
        if(b.wrap !== "none") s += `<rect x="-62" y="${lvl - 10}" width="124" height="${480 - lvl + 10}" rx="12" fill="${wrapFill(b.wrap)}" stroke="#64748B" opacity=".96"/>`;
        s += `<rect x="-50" y="300" width="100" height="180" rx="4" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
        if(b.full) s += `<rect x="-47" y="${lvl}" width="94" height="${477 - lvl}" fill="url(#k-water)"/>`;
        if(b.lid) s += `<rect x="-58" y="292" width="116" height="10" rx="3" fill="#94A3B8" stroke="#475569"/>`;
        if(b.full && b.T > 40) for(let k = 0; k < 3; k++) s += `<path d="M${-20 + k*20} ${280 - ((t*3 + k*20) % 30)} q6 -10 0 -20" stroke="var(--txt2)" fill="none" opacity="${b.lid ? .1 : .35}"/>`;
        s += `<text x="0" y="510" text-anchor="middle" class="k-tag">${label(b, i)}</text>`;
        s += `<g transform="translate(18 120)">${ths[i].svg}</g></g>`;
      });
      s += `<g transform="translate(24 60)"><rect width="150" height="64" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="12" y="20" style="font:700 9px Inter;fill:#9CA3AF">CLOCK</text><text x="138" y="50" text-anchor="end" class="k-lcd">${Math.floor(t/60)}:${String(Math.floor(t % 60)).padStart(2, "0")}</text></g>`;
      $("#cl-scene").innerHTML = s;
      B.forEach((b, i) => ths[i].set(svg, b.T));
      $("#cl-status").textContent = !B.every(b => b.full) ? "Drag the kettle over each beaker to fill it" : running ? "Cooling… readings every minute" : "Wrap or lid the beakers, then start the clock";
      ctx.readout(B.map((b, i) => ["Beaker " + "AB"[i], (Math.round(b.T*2)/2).toFixed(1) + " °C"]).concat([["Volume", vol + " cm³ each"]]));
    }
    ctx.frame(dt => {
      const sdt = dt*speed;
      if(running){
        t += sdt;
        B.forEach(b => { const k = 0.00095*MAT[b.wrap][1]*(b.lid ? .72 : 1)*Math.pow(200/vol, 1/3); b.T = TA + (b.T - TA)*Math.exp(-k*sdt); });
        if(t >= nextRec){ B.forEach((b, i) => ctx.record({ b:label(b, i), t:Kit.round(nextRec/60, 1), T:Math.round(b.T*2)/2 }, true)); nextRec += 60; checks(); }
        if(t >= 20*60){ running = false; ctx.toast("20 minutes done"); }
      }
      draw();
    });
    function checks(){
      const rows = ctx.rows(), runs = {}; rows.forEach(r => runs[r.b] = (runs[r.b] || 0) + 1);
      const full = Object.keys(runs).filter(k => runs[k] >= 6).map(k => k.slice(3));
      if(new Set(full.map(k => k.replace(" + lid", "")).filter(k => k !== "No wrap")).size >= 3) ctx.complete("three");
      if(full.some(k => full.includes(k + " + lid"))) ctx.complete("lid");
      if(full.some(k => k.startsWith("Black paper")) && full.some(k => k.startsWith("Shiny foil"))) ctx.complete("colour");
    }

    Kit.dragger(ctx, svg, {
      hit(tg){ const k = tg.closest("[data-k]"), src = tg.closest("[data-src]"); if(k) return { k:"kettle" }; if(src){ if(running){ ctx.toast("Stop the clock to change the setup"); return null; } return { k:"mat", m:src.dataset.src, x:0, y:0 }; } return null; },
      move(h, p){ if(h.k === "kettle"){ kettle.x = p.x; kettle.y = p.y + 30; } else { h.x = p.x; h.y = p.y; ghost(h); } if(h.k === "kettle") draw(); },
      end(h, p){
        $("#cl-ghost") && $("#cl-ghost").remove();
        const b = B.find(b => Math.abs(p.x - b.x) < 80 && p.y > 220 && p.y < 500);
        if(h.k === "kettle"){
          if(b){ if(running){ ctx.toast("Already running"); } else { b.full = true; b.T = 90; ctx.toast("Filled with " + vol + " cm³ of hot water"); } }
          kettle.x = kettle.home[0]; kettle.y = kettle.home[1];
        }else if(b){ if(h.m === "lid") b.lid = !b.lid; else b.wrap = b.wrap === h.m ? "none" : h.m; }
        draw();
      }
    });
    function ghost(h){
      let g = $("#cl-ghost"); if(!g){ g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.id = "cl-ghost"; svg.appendChild(g); }
      g.setAttribute("transform", `translate(${h.x} ${h.y})`);
      g.innerHTML = h.m === "lid" ? `<rect x="-30" y="-6" width="60" height="10" rx="3" fill="#94A3B8" opacity=".8"/>` : `<rect x="-26" y="-18" width="52" height="36" rx="6" fill="${wrapFill(h.m)}" stroke="var(--accent)" opacity=".85"/>`;
    }
    ctx.seg({ label:"Volume of water (each)", value:200, options:[[100,"100 cm³"],[150,"150 cm³"],[200,"200 cm³"]], onChange(v){ vol = v; draw(); } });
    ctx.seg({ label:"Playback", value:30, options:[[10,"×10"],[30,"×30"],[60,"×60"]], onChange(v){ speed = v; } });
    ctx.buttons([{ label:"Start clock", primary:true, onClick(){
      if(!B.every(b => b.full)){ ctx.toast("Fill both beakers first"); return; }
      if(B.some(b => b.T < 85)){ ctx.toast("Refill with hot water so both start at the same temperature"); return; }
      running = true; t = 0; nextRec = 0;
    } }, { label:"Stop", onClick(){ running = false; } }]);
    ctx.buttons([{ label:"Empty & reset beakers", block:true, onClick(){ running = false; t = 0; B.forEach(b => { b.full = false; b.T = TA; }); draw(); } }]);
    ctx.html(`<p class="hint">Change one thing at a time. Click the same material again on a beaker to remove it.</p>`);
    draw();
  }
});
