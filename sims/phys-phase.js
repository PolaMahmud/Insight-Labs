"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · THERMAL — Melting & freezing curves · Thermal radiation
══════════════════════════════════════════════════════════════════ */

/* ───────────── MELTING & FREEZING ───────────── */
Lab.register({
  id:"melting", subject:"physics", level:["igcse"], topic:"Thermal physics · Change of state", interactive:true,
  title:"Melting & freezing curves",
  summary:"Melt stearic acid, salol or wax in a hot water bath, then lift it out and record its cooling curve. Spot the plateau — and supercooling.",
  aim:"Obtain a cooling curve for a substance as it changes from liquid to solid, and determine its melting (freezing) point.",
  variables:{ iv:"Time (s)", dv:"Temperature of the substance (°C)", cv:["Same mass of substance","Same room temperature","Thermometer bulb fully in the substance"] },
  stageTitle:"Water bath and boiling tube", controlsTitle:"Run",
  thumb:`<svg viewBox="0 0 300 140"><path d="M30 30 Q70 80 110 80 H190 Q230 80 270 120" fill="none" stroke="#4DA3FF" stroke-width="4"/><line x1="110" y1="80" x2="190" y2="80" stroke="#FBBF24" stroke-width="5"/><text x="150" y="70" text-anchor="middle" font-size="12" fill="#A2ACBD" font-family="sans-serif">plateau</text></svg>`,
  challenges:[
    { id:"curve", title:"A full cooling curve", text:"Record a stearic acid cooling curve lasting at least 12 minutes." },
    { id:"fp",    title:"Freezing point", text:"Find the freezing point of stearic acid or salol from your curve." },
    { id:"super", title:"Supercooling", text:"Catch salol cooling below its freezing point before it solidifies." },
    { id:"wax",   title:"No sharp melting point", text:"Record a wax cooling curve and see it has no flat plateau." }
  ],
  columns:[{key:"sub",label:"Substance / run"},{key:"t",label:"t / s",dp:0},{key:"T",label:"θ / °C",dp:1}],
  series:"sub",
  graph:{ x:["t"], y:["T"], fit:"none" },
  questions:[
    { q:"Why does the temperature stay constant while the substance freezes?",
      a:"Energy is released as the particles form bonds (latent heat of fusion). This balances the energy lost to the surroundings, so the temperature does not fall until all the liquid has solidified." },
    { q:"How do you find the melting point from a cooling curve?",
      a:"Read the temperature of the flat (horizontal) part of the curve. The melting point and freezing point are the same temperature." },
    { q:"Why does wax not give a flat section?",
      a:"Wax is a mixture of different compounds, so it solidifies over a range of temperatures rather than at one fixed point." },
    { q:"What is supercooling?",
      a:"The liquid cools below its freezing point without solidifying. When crystals start to form, latent heat is released and the temperature rises back to the freezing point." },
    { q:"Why is a water bath used rather than heating the tube directly in a flame?",
      a:"It heats the substance gently and evenly, and stops it overheating; stearic acid and salol are flammable and can decompose." }
  ],
  setup(ctx){
    const SUBS = { stearic:{ name:"Stearic acid", Tf:69.3, C:18, L:1500 }, salol:{ name:"Salol", Tf:42.0, C:15, L:1100, sc:true }, wax:{ name:"Paraffin wax", Tf:55, C:18, L:1500, range:[50, 61] } };
    const TA = 20, TB = 82;
    let sub = "stearic", T = TA, f = 1, inBath = false, t = 0, timing = false, speed = 20, nextRec = 0, run = 1, nucleated = true, scDepth = 0, minLiquid = 99;
    const tube = { x:640, y:440 }, RACK = [640, 440], BATH = [270, 345];
    const th = Kit.thermometer("mt-th", 0, 0, 240, 0, 100, 10, true);

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="mt-svg"><defs>${Kit.DEFS}<clipPath id="mt-tube"><path d="M-17 -200 V-14 A17 17 0 0 0 17 -14 V-200 Z"/></clipPath></defs>
      ${Kit.bench(960, 480)}
      <!-- bath on tripod with Bunsen -->
      <path d="M190 480 L210 360 M350 480 L330 360" stroke="url(#k-metal)" stroke-width="6"/><rect x="180" y="352" width="180" height="8" fill="url(#k-metal)"/>
      <rect x="180" y="190" width="180" height="162" rx="6" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><rect x="183" y="214" width="174" height="135" fill="url(#k-water)"/>
      <rect x="258" y="420" width="24" height="60" fill="url(#k-metal)"/><path id="mt-flame" d="M270 418 C256 400 262 382 270 368 C278 382 284 400 270 418Z" fill="#4A7DFF" opacity=".85"/>
      <text x="270" y="512" text-anchor="middle" class="k-lbl">water bath ≈ 82 °C</text>
      <!-- clamp stand at rack -->
      <rect x="720" y="120" width="8" height="360" fill="url(#k-metal)"/><rect x="${RACK[0] + 18}" y="230" width="92" height="8" fill="url(#k-metal)"/><rect x="690" y="474" width="80" height="8" fill="url(#k-metal)"/>
      <text x="${RACK[0]}" y="512" text-anchor="middle" class="k-lbl">clamp (cooling in air)</text>
      <g id="mt-tubeg" class="k-drag"></g>
      <g transform="translate(24 60)"><rect width="160" height="64" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="12" y="20" style="font:700 9px Inter;fill:#9CA3AF">TIMER</text><text x="148" y="50" text-anchor="end" class="k-lcd" id="mt-clock">0:00</text></g>
      <text x="24" y="34" class="k-status" id="mt-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#mt-svg"), $ = s => svg.querySelector(s);

    function draw(){
      const S = SUBS[sub], solid = sub === "wax" ? Kit.clamp((S.range[1] - T)/(S.range[1] - S.range[0]), 0, 1) : f;
      const liq = sub === "salol" ? "rgba(240,240,255,.55)" : "rgba(255,240,200,.55)";
      let g = `<g transform="translate(${tube.x} ${tube.y})">
        <g clip-path="url(#mt-tube)"><rect x="-17" y="-110" width="34" height="110" fill="${liq}"/>
          <rect x="-17" y="-110" width="${34*solid > 30 ? 34 : 6 + 12*solid}" height="110" fill="#F8FAFC" opacity=".95"/><rect x="${17 - (34*solid > 30 ? 34 : 6 + 12*solid)}" y="-110" width="${34*solid > 30 ? 34 : 6 + 12*solid}" height="110" fill="#F8FAFC" opacity=".95"/>
          <rect x="-17" y="${-10 - 30*solid}" width="34" height="${12 + 30*solid}" fill="#F8FAFC" opacity=".95"/></g>
        <path d="M-17 -200 V-14 A17 17 0 0 0 17 -14 V-200" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
        <g transform="translate(0 -268)">${th.svg}</g><rect x="-30" y="-290" width="70" height="300" fill="transparent"/></g>`;
      $("#mt-tubeg").innerHTML = g; th.set(svg, T);
      $("#mt-flame").setAttribute("opacity", (.6 + .3*Math.random()).toFixed(2));
      $("#mt-clock").textContent = `${Math.floor(t/60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
      const state = sub === "wax" ? (solid >= 1 ? "solid" : solid <= 0 ? "liquid" : "soft / partly solid") : f >= 1 ? "solid" : f <= 0 ? "liquid" : "solid + liquid (changing state)";
      $("#mt-status").textContent = inBath ? (f > 0 ? "Melting in the water bath…" : "Fully melted — move it to the clamp to cool") : timing ? "Cooling in air — readings every 30 s" : T > S.Tf + 5 && f <= 0 ? "Start the timer to record the cooling curve" : "Drag the tube into the hot water bath to melt it";
      ctx.readout([["Substance", S.name], ["Thermometer", (Math.round(T*2)/2).toFixed(1) + " °C"], ["State", state], ["Where", inBath ? "water bath" : "clamp, in air"]]);
    }
    ctx.frame(dt => {
      const S = SUBS[sub], sdt = dt*speed, steps = Math.ceil(sdt/.25), h = sdt/steps;
      for(let i = 0; i < steps; i++){
        let E = (inBath ? 0.55*(TB - T) : -0.07*(T - TA))*h;
        if(sub === "wax"){
          const inRange = T > S.range[0] && T < S.range[1];
          T += E/(S.C + (inRange ? S.L/(S.range[1] - S.range[0]) : 0));
        }else if(E > 0){                                 // heating
          if(T < S.Tf || f <= 0){ T += E/S.C; if(T > S.Tf && f > 0){ T = S.Tf; } }
          else { f = Math.max(0, f - E/S.L); if(f <= 0) nucleated = !S.sc; }
        }else{                                           // cooling
          if(f >= 1 || T > S.Tf){ T += E/S.C; if(T < S.Tf && f < 1 && nucleated) T = S.Tf; }
          else if(!nucleated){ T += E/S.C; minLiquid = Math.min(minLiquid, T); if(T < S.Tf - scDepth){ nucleated = true; } }
          else { if(T < S.Tf){ const back = (S.Tf - T)*S.C; T = S.Tf; f = Math.min(1, f + back/S.L); } else f = Math.min(1, f - E/S.L); if(f >= 1) T = S.Tf - .01; }
        }
      }
      if(timing){ t += sdt; while(t >= nextRec){ ctx.record({ sub:`${run}: ${S.name}`, t:nextRec, T:Math.round(T*2)/2 }, true); nextRec += 30; } }
      draw();
    });
    function checks(){
      const rows = ctx.rows(), runs = {};
      rows.forEach(r => (runs[r.sub] = runs[r.sub] || []).push(r));
      Object.entries(runs).forEach(([k, a]) => {
        const span = a[a.length - 1].t - a[0].t;
        if(k.includes("Stearic") && span >= 720) ctx.complete("curve");
        if(k.includes("Wax") && span >= 600) ctx.complete("wax");
        if(k.includes("Salol") && a.some(r => r.T <= SUBS.salol.Tf - 2) && a.some((r, i) => i > 0 && r.T > a[i - 1].T)) ctx.complete("super");
      });
    }
    Kit.dragger(ctx, svg, {
      hit(tg){ return tg.closest("#mt-tubeg") ? "tube" : null; },
      move(k, p){ tube.x = p.x; tube.y = p.y + 140; inBath = false; draw(); },
      end(){
        if(Math.abs(tube.x - BATH[0]) < 110 && tube.y > 200 && tube.y < 540){ tube.x = BATH[0]; tube.y = BATH[1]; inBath = true; if(timing){ timing = false; ctx.toast("Timing stopped — the tube is back in the bath"); } }
        else { tube.x = RACK[0]; tube.y = RACK[1]; inBath = false; }
        draw();
      }
    });
    ctx.seg({ label:"Substance", value:"stearic", options:[["stearic","Stearic acid"],["salol","Salol"],["wax","Paraffin wax"]], onChange(v){
      sub = v; T = TA; f = 1; timing = false; t = 0; nucleated = true; tube.x = RACK[0]; tube.y = RACK[1]; inBath = false; draw(); } });
    ctx.seg({ label:"Playback", value:20, options:[[5,"×5"],[20,"×20"],[60,"×60"]], onChange(v){ speed = v; } });
    ctx.buttons([{ label:"Start timer (records every 30 s)", primary:true, block:true, onClick(){
      if(inBath){ ctx.toast("Move the tube to the clamp first, so it cools in air"); return; }
      if(f > 0 && sub !== "wax" || (sub === "wax" && T < 62)){ ctx.toast("Melt it completely in the water bath first"); return; }
      timing = true; t = 0; nextRec = 0; run = Math.max(1, ...ctx.rows().map(r => parseInt(r.sub) + 1 || 1));
      scDepth = SUBS[sub].sc ? 3 + Math.random()*4 : 0; nucleated = !SUBS[sub].sc; minLiquid = 99;
    } }]);
    ctx.buttons([{ label:"Stop timer", onClick(){ timing = false; checks(); } }]);
    Kit.answer(ctx, "Freezing point / °C", "e.g. 69", v => {
      const rows = ctx.rows(); if(!rows.length) return [false, "Record a cooling curve first."];
      const last = rows[rows.length - 1].sub, S = Object.values(SUBS).find(s => last.includes(s.name));
      if(!S || S.range) return [false, "Wax has no single freezing point — use stearic acid or salol."];
      if(Math.abs(v - S.Tf) <= 1.0){ ctx.complete("fp"); return [true, `Correct — ${S.name} freezes at about ${S.Tf} °C (the flat part of your curve).`]; }
      return [false, "Read the temperature of the horizontal section of your cooling curve."];
    });
    ctx.frame(() => { if(timing && t > 0 && Math.floor(t) % 120 === 0) checks(); });
    draw();
  }
});

/* ───────────── THERMAL RADIATION ───────────── */
Lab.register({
  id:"radiation", subject:"physics", level:["igcse"], topic:"Thermal physics · Radiation", interactive:true,
  title:"Infrared radiation: Leslie cube & absorption",
  summary:"Rotate a Leslie cube of hot water in front of an infrared detector, move the detector, and race wax-stuck pins on black and shiny plates.",
  aim:"Investigate how the colour and texture of a surface affect how well it emits and absorbs infrared radiation.",
  variables:{ iv:"Type of surface (and distance from the detector)", dv:"Detector reading (mV) / time for the pin to drop (s)", cv:["Same temperature of water","Same distance from the detector or heater","Same detector"] },
  stageTitle:"Infrared bench", controlsTitle:"Experiment",
  thumb:`<svg viewBox="0 0 300 140"><path d="M90 40 L150 30 L150 110 L90 120Z" fill="#111827" stroke="#A2ACBD"/><path d="M150 30 L200 45 L200 115 L150 110Z" fill="#CBD5E1" stroke="#A2ACBD"/><path d="M210 80 l40 -14 v28z" fill="#64748B"/><path d="M205 80h-12" stroke="#FF5C7A" stroke-dasharray="3 3"/></svg>`,
  challenges:[
    { id:"rank",   title:"Rank the surfaces", text:"Measure all four faces at the same distance." },
    { id:"inv",    title:"Distance matters", text:"Measure one face at four or more distances." },
    { id:"absorb", title:"Which absorbs best?", text:"Run a fair absorption test (equal distances) with black and shiny plates." }
  ],
  columns:[{key:"exp",label:"Experiment"},{key:"surf",label:"Surface"},{key:"d",label:"Distance / cm",dp:0},{key:"read",label:"Reading",dp:2},{key:"unit",label:"Unit"},{key:"inv",label:"1/d² / m⁻²",dp:1}],
  series:"surf",
  graph:{ x:["inv","d"], y:["read"], fit:"linear" },
  questions:[
    { q:"Which surface is the best emitter of infrared and which is the worst?",
      a:"Dull (matt) black is the best emitter; shiny silver is the worst." },
    { q:"Why must the detector be the same distance from each face?",
      a:"The amount of radiation reaching the detector decreases with distance, so distance must be controlled for a fair comparison." },
    { q:"In the absorption experiment, which pin drops first and why?",
      a:"The pin on the matt black plate: dull black surfaces are good absorbers of infrared, so that plate heats up faster and its wax melts first." },
    { q:"Why are the insides of vacuum flasks silvered?",
      a:"Shiny surfaces are poor emitters (and good reflectors) of infrared radiation, reducing energy transfer by radiation." }
  ],
  setup(ctx){
    const FACES = [{ name:"Matt black", e:.95, fill:"#111827" }, { name:"Shiny black", e:.78, fill:"#1F2937", shine:true }, { name:"Matt white", e:.62, fill:"#F1F5F9" }, { name:"Shiny silver", e:.08, fill:"url(#k-metal)", shine:true }];
    const PL = { black:{ name:"Matt black", a:.95, fill:"#111827" }, white:{ name:"Matt white", a:.6, fill:"#F1F5F9" }, silver:{ name:"Shiny silver", a:.12, fill:"url(#k-metal)" } };
    const TA = 20;
    let mode = "emit", face = 0, Tw = 85, d = 10;
    let abs = { left:"black", right:"silver", dl:15, dr:15, on:false, t:0, Tl:TA, Tr:TA, dropL:null, dropR:null };
    let speed = 1;
    const CX = 260, DET0 = 330, PPC = 14;          // detector x for d=0, px per cm

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="ir-svg"><defs>${Kit.DEFS}<linearGradient id="ir-heat" x1="0" x2="1"><stop offset="0" stop-color="#FF6B35" stop-opacity="0"/><stop offset=".5" stop-color="#FF6B35"/><stop offset="1" stop-color="#FF6B35" stop-opacity="0"/></linearGradient></defs>
      ${Kit.bench(960, 440)}<g id="ir-scene"></g><text x="24" y="34" class="k-status" id="ir-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ir-svg"), $ = s => svg.querySelector(s);
    const reading = () => { const Tk = Tw + 273, Ta = TA + 273; return 4.65e-8*FACES[face].e*(Math.pow(Tk, 4) - Math.pow(Ta, 4))/(d*d)*(1 + .004*Math.sin(Date.now()/300)); };

    function drawEmit(){
      const f = FACES[face], left = FACES[(face + 1) % 4];
      let s = `<g transform="translate(${CX} 300)">
        <path d="M-120 -110 L-40 -130 L-40 60 L-120 80 Z" fill="${left.fill}" stroke="#64748B"/>${left.shine ? `<path d="M-110 -100 L-60 -112 L-60 -60 L-110 -48Z" fill="#fff" opacity=".18"/>` : ""}
        <path d="M-40 -130 L60 -110 L60 80 L-40 60 Z" fill="${f.fill}" stroke="#64748B"/>${f.shine ? `<path d="M-30 -118 L40 -104 L40 -40 L-30 -54Z" fill="#fff" opacity=".22"/>` : ""}
        <path d="M-120 -110 L-40 -130 L60 -110 L-20 -90 Z" fill="#94A3B8" stroke="#64748B"/><ellipse cx="-30" cy="-110" rx="16" ry="5" fill="#1F2937"/>
        <text x="10" y="110" text-anchor="middle" class="k-tag">facing detector: ${f.name}</text>
        <g id="ir-rot" class="k-btn" transform="translate(-40 140)"><rect x="-70" y="-16" width="140" height="30" rx="8" fill="var(--bg-card)" stroke="var(--accent)"/><text y="4" text-anchor="middle" class="k-hint">↻ rotate cube</text></g></g>`;
      // infrared waves
      const dx = DET0 + d*PPC;
      for(let k = 0; k < 4; k++){ const ph = ((Date.now()/700 + k/4) % 1); s += `<path d="M${CX + 64 + ph*(dx - CX - 70)} 250 q6 -8 0 -16 q-6 -8 0 -16" stroke="#FF6B35" fill="none" opacity="${(f.e*(1 - ph)*.8).toFixed(2)}" transform="translate(0 ${-5})"/>`; }
      // ruler
      for(let c = 0; c <= 40; c++){ const x = DET0 + c*PPC; s += `<line x1="${x}" y1="440" x2="${x}" y2="${c % 5 ? 446 : 452}" stroke="var(--txt2)"/>${c % 10 === 0 ? `<text x="${x}" y="466" text-anchor="middle" class="k-num">${c}</text>` : ""}`; }
      s += `<text x="${DET0 + 20*PPC}" y="486" text-anchor="middle" class="k-lbl">distance from cube face / cm</text>`;
      // detector
      s += `<g id="ir-det" class="k-drag" transform="translate(${dx} 260)"><path d="M0 -10 L54 -28 L54 28 L0 10 Z" fill="#475569" stroke="#1F2937"/><rect x="54" y="-20" width="40" height="40" rx="5" fill="#334155"/>
        <rect x="68" y="20" width="10" height="160" fill="url(#k-metal)"/><rect x="44" y="176" width="58" height="8" fill="url(#k-metal)"/><rect x="-10" y="-40" width="120" height="230" fill="transparent"/></g>
        <g transform="translate(720 70)"><rect width="200" height="80" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="14" y="22" style="font:700 9px Inter;fill:#9CA3AF">IR DETECTOR (thermopile)</text>
          <text x="186" y="62" text-anchor="end" class="k-lcd">${reading().toFixed(2)} mV</text></g>
        <g transform="translate(720 170)"><rect width="200" height="50" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="14" y="30" style="font:600 11px Inter;fill:#E5E7EB">Water: ${Tw.toFixed(1)} °C</text></g>`;
      return s;
    }
    function drawAbsorb(){
      const H = 480, PX = 12, xl = H - abs.dl*PX, xr = H + abs.dr*PX;
      let s = `<rect x="${H - 14}" y="170" width="28" height="200" rx="6" fill="#7C2D12"/><rect x="${H - 9}" y="178" width="18" height="184" rx="4" fill="${abs.on ? "#FF6B35" : "#4B5563"}"/>
        ${abs.on ? `<rect x="${H - 60}" y="170" width="120" height="200" fill="url(#ir-heat)" opacity=".35"/>` : ""}
        <rect x="${H - 30}" y="370" width="60" height="70" fill="url(#k-metal)"/><text x="${H}" y="160" text-anchor="middle" class="k-tag">radiant heater</text>`;
      [["left", xl, -1], ["right", xr, 1]].forEach(([side, x, dir]) => {
        const p = PL[abs[side]], drop = side === "left" ? abs.dropL : abs.dropR, Tp = side === "left" ? abs.Tl : abs.Tr;
        s += `<g data-plate="${side}" class="k-drag"><rect x="${x - 4}" y="190" width="8" height="160" fill="${p.fill}" stroke="#475569"/><rect x="${x - 3}" y="350" width="6" height="90" fill="url(#k-metal)"/>
          <rect x="${x - 30}" y="180" width="60" height="270" fill="transparent"/></g>`;
        const wy = 270, px = x + dir*8;
        s += `<ellipse cx="${px + dir*3}" cy="${wy}" rx="5" ry="7" fill="${Tp > 55 ? "rgba(250,240,200,.4)" : "#FEF3C7"}"/>`;
        const pinY = drop === null ? wy : Math.min(430, wy + Math.pow(Math.max(0, abs.t - drop), 2)*600);
        s += `<g transform="translate(${px + dir*10} ${pinY})"><circle r="6" fill="#DC2626"/><line x1="${-dir*6}" y1="0" x2="${-dir*14}" y2="0" stroke="#94A3B8" stroke-width="2"/></g>`;
        s += `<text x="${x}" y="470" text-anchor="middle" class="k-tag">${p.name} · ${side === "left" ? abs.dl : abs.dr} cm</text>`;
        s += `<text x="${x}" y="176" text-anchor="middle" class="k-read">${drop === null ? Tp.toFixed(0) + " °C" : "dropped " + drop.toFixed(0) + " s"}</text>`;
      });
      s += `<g transform="translate(24 60)"><rect width="150" height="64" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="12" y="20" style="font:700 9px Inter;fill:#9CA3AF">TIMER</text><text x="138" y="50" text-anchor="end" class="k-lcd">${abs.t.toFixed(0)} s</text></g>`;
      return s;
    }
    function draw(){
      $("#ir-scene").innerHTML = mode === "emit" ? drawEmit() : drawAbsorb();
      $("#ir-status").textContent = mode === "emit" ? "Rotate the cube and drag the detector — record readings" : abs.on ? "Heating… watch for the pins to drop" : "Drag the plates to set their distances, then switch on the heater";
      ctx.readout(mode === "emit" ? [["Face", FACES[face].name], ["Distance", d + " cm"], ["Reading", reading().toFixed(2) + " mV"]]
        : [["Left", PL[abs.left].name + ", " + abs.dl + " cm"], ["Right", PL[abs.right].name + ", " + abs.dr + " cm"], ["Fair test", abs.dl === abs.dr ? "yes — equal distances" : "no — distances differ", abs.dl === abs.dr ? "good" : "warn"]]);
    }
    ctx.frame(dt => {
      Tw -= 0.0012*(Tw - TA)*dt*speed;
      if(mode === "absorb" && abs.on){
        abs.t += dt*speed;
        ["left","right"].forEach(side => {
          const dd = side === "left" ? abs.dl : abs.dr, a = PL[abs[side]].a, key = side === "left" ? "Tl" : "Tr";
          const Pin = 9000*a/(dd*dd);
          abs[key] += (Pin - .9*(abs[key] - TA))/30*dt*speed;
          const dk = side === "left" ? "dropL" : "dropR";
          if(abs[dk] === null && abs[key] >= 55){ abs[dk] = abs.t; ctx.record({ exp:"Absorption", surf:PL[abs[side]].name + " plate", d:dd, read:Kit.round(abs.t, 0), unit:"s to drop", inv:Kit.round(1e4/(dd*dd), 1) }, true); ctx.toast(`${PL[abs[side]].name} pin dropped at ${abs.t.toFixed(0)} s`);
            if(abs.dropL !== null && abs.dropR !== null && abs.dl === abs.dr && [abs.left, abs.right].includes("black") && [abs.left, abs.right].includes("silver")) ctx.complete("absorb"); }
        });
      }
      draw();
    });
    Kit.dragger(ctx, svg, {
      hit(tg){
        if(tg.closest("#ir-rot")){ face = (face + 1) % 4; draw(); return null; }
        if(tg.closest("#ir-det")) return "det";
        const p = tg.closest("[data-plate]"); if(p && !abs.on) return p.dataset.plate;
        return null;
      },
      move(k, p){
        if(k === "det") d = Kit.clamp(Math.round((p.x - DET0)/PPC), 3, 40);
        else if(k === "left") abs.dl = Kit.clamp(Math.round((480 - p.x)/12), 5, 30);
        else abs.dr = Kit.clamp(Math.round((p.x - 480)/12), 5, 30);
        draw();
      }
    });
    const emitCtl = [], absCtl = [];
    ctx.seg({ label:"Experiment", value:"emit", options:[["emit","Emission (Leslie cube)"],["absorb","Absorption (pins)"]], onChange(v){ mode = v; emitCtl.forEach(e => e.style.display = v === "emit" ? "" : "none"); absCtl.forEach(e => e.style.display = v === "emit" ? "none" : ""); draw(); } });
    emitCtl.push(ctx.buttons([{ label:"Record reading", primary:true, onClick(){
      ctx.record({ exp:"Emission", surf:FACES[face].name, d, read:Kit.round(reading(), 2), unit:"mV", inv:Kit.round(1e4/(d*d), 1) });
      const rows = ctx.rows().filter(r => r.exp === "Emission"), byD = {};
      rows.forEach(r => (byD[r.d] = byD[r.d] || new Set()).add(r.surf));
      if(Object.values(byD).some(s => s.size >= 4)) ctx.complete("rank");
      const byF = {}; rows.forEach(r => (byF[r.surf] = byF[r.surf] || new Set()).add(r.d));
      if(Object.values(byF).some(s => s.size >= 4)) ctx.complete("inv");
    } }, { label:"Refill with hot water", onClick(){ Tw = 85; } }]).node);
    absCtl.push(ctx.seg({ label:"Left plate", value:"black", options:[["black","Matt black"],["white","Matt white"],["silver","Shiny silver"]], onChange(v){ abs.left = v; resetAbs(); } }).node);
    absCtl.push(ctx.seg({ label:"Right plate", value:"silver", options:[["black","Matt black"],["white","Matt white"],["silver","Shiny silver"]], onChange(v){ abs.right = v; resetAbs(); } }).node);
    absCtl.push(ctx.buttons([{ label:"Heater on", primary:true, onClick(){ if(abs.dropL !== null || abs.dropR !== null) resetAbs(); abs.on = true; } }, { label:"Reset (new wax)", onClick:resetAbs }]).node);
    absCtl.forEach(e => e.style.display = "none");
    ctx.seg({ label:"Playback", value:1, options:[[1,"×1"],[5,"×5"],[20,"×20"]], onChange(v){ speed = v; } });
    function resetAbs(){ Object.assign(abs, { on:false, t:0, Tl:TA, Tr:TA, dropL:null, dropR:null }); draw(); }
    draw();
  }
});
