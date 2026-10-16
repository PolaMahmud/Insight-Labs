"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · STATICS & FLUIDS (IGCSE)
   Centre of gravity of a lamina · Pressure in a liquid · Density of a liquid
══════════════════════════════════════════════════════════════════ */

/* ───────────── CENTRE OF GRAVITY OF AN IRREGULAR LAMINA ───────────── */
Lab.register({
  id:"lamina", subject:"physics", level:["igcse"], topic:"Forces · Centre of gravity", interactive:true,
  title:"Centre of gravity of a lamina",
  summary:"Hang a card shape from a pin, let it settle, draw along the plumb line, repeat from other holes and find where the lines cross.",
  aim:"Determine the position of the centre of gravity of an irregularly shaped plane lamina using a plumb line.",
  variables:{ iv:"Hole the lamina is hung from", dv:"Line of the plumb line across the lamina", cv:["Same lamina","Lamina free to swing on the pin","Wait until the lamina and plumb line are still"] },
  stageTitle:"Lamina on a pin", controlsTitle:"Plumb line",
  thumb:`<svg viewBox="0 0 300 140"><rect x="140" y="12" width="20" height="8" fill="#64748B"/><path d="M120 22 L195 30 L210 85 L170 128 L105 110 L92 60Z" fill="#E7D3AE" stroke="#8B6B3E"/>
    <line x1="150" y1="20" x2="150" y2="132" stroke="#111827" stroke-dasharray="3 2"/><line x1="110" y1="28" x2="196" y2="112" stroke="#DC2626"/><circle cx="150" cy="70" r="3" fill="#DC2626"/><circle cx="150" cy="134" r="4" fill="#64748B"/></svg>`,
  challenges:[
    { id:"two",     title:"Two lines", text:"Hang the lamina from two different holes and draw a line each time." },
    { id:"three",   title:"Check with a third", text:"A third line from another hole passes within 2 mm of where the first two cross." },
    { id:"balance", title:"Balance test", text:"Balance the lamina on a pencil tip at the point you found." },
    { id:"shapes",  title:"Another shape", text:"Pass the balance test on two different laminas." }
  ],
  columns:[{key:"shape",label:"Lamina",dp:0},{key:"n",label:"Lines drawn",dp:0},{key:"spread",label:"Lines meet within / mm",dp:1},{key:"bal",label:"Balance test"}],
  questions:[
    { q:"Why does the centre of gravity lie on the plumb line?",
      a:"When the lamina hangs freely and is still, it is in equilibrium. Its weight acts through the centre of gravity, so the centre of gravity must be directly below the pivot — otherwise the weight would have a moment about the pin and the lamina would turn." },
    { q:"Why should the lamina be hung from holes far apart, near the edge?",
      a:"The lines then cross at a large angle, so a small error in drawing a line moves the crossing point only a little. Lines that are nearly parallel give a very uncertain crossing point." },
    { q:"Why is a third line drawn?",
      a:"As a check: if the method was done carefully, the third line passes through (or very close to) the point where the first two cross." },
    { q:"Give two precautions in this experiment.",
      a:"Make sure the lamina swings freely on the pin (holes large enough, no friction) and wait for it and the plumb line to stop moving before marking the line. Mark the line with fine pencil dots close to the thread." },
    { q:"How does the position of the centre of gravity affect stability?",
      a:"An object is more stable when its centre of gravity is low and its base is wide. It topples when its centre of gravity moves beyond the edge of its base, because the weight then has a moment that turns it over." }
  ],
  setup(ctx){
    const PIN = { x:420, y:96 }, MM = .5;
    let shapeNo = 0, poly, holes, cog, hole, theta, omega = 0, lines = [], balanced = [], test = null;

    function newShape(){
      shapeNo++;
      const n = 9, a0 = Math.random()*Math.PI*2; poly = [];
      for(let i = 0; i < n; i++){
        const a = a0 + i/n*Math.PI*2 + (Math.random() - .5)*.35, r = 95 + Math.random()*90;
        poly.push([Math.cos(a)*r*1.15, Math.sin(a)*r]);
      }
      // area centroid of the polygon
      let A = 0, cx = 0, cy = 0;
      for(let i = 0; i < n; i++){ const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % n], c = x0*y1 - x1*y0; A += c; cx += (x0 + x1)*c; cy += (y0 + y1)*c; }
      A /= 2; cog = [cx/(6*A), cy/(6*A)];
      // four holes near well-separated corners, set in towards the centre
      const far = poly.map((p, i) => [i, Math.hypot(p[0] - cog[0], p[1] - cog[1])]).sort((a, b) => b[1] - a[1]);
      const pick = [];
      far.forEach(([i]) => { if(pick.length < 4 && pick.every(j => Math.min(Math.abs(i - j), n - Math.abs(i - j)) >= 2)) pick.push(i); });
      holes = pick.map(i => { const [x, y] = poly[i], d = Math.hypot(x - cog[0], y - cog[1]); return [x - (x - cog[0])/d*16, y - (y - cog[1])/d*16]; });
      hole = 0; theta = .9; omega = 0; lines = []; test = null;
    }
    const target = () => { const v = [cog[0] - holes[hole][0], cog[1] - holes[hole][1]]; return Math.PI/2 - Math.atan2(v[1], v[0]); };
    function crossings(){
      const pts = [];
      for(let i = 0; i < lines.length; i++) for(let j = i + 1; j < lines.length; j++){
        const a = lines[i], b = lines[j], den = a.d[0]*b.d[1] - a.d[1]*b.d[0];
        if(Math.abs(den) < .12) continue;
        const t = ((b.p[0] - a.p[0])*b.d[1] - (b.p[1] - a.p[1])*b.d[0])/den;
        pts.push([a.p[0] + a.d[0]*t, a.p[1] + a.d[1]*t]);
      }
      return pts;
    }
    function estimate(){
      const pts = crossings(); if(!pts.length) return null;
      let spread = 0; pts.forEach(p => pts.forEach(q => spread = Math.max(spread, Math.hypot(p[0] - q[0], p[1] - q[1]))));
      return { p:[Kit.mean(pts.map(p => p[0])), Kit.mean(pts.map(p => p[1]))], spread:spread*MM, n:pts.length };
    }

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="cg-svg"><defs>${Kit.DEFS}<clipPath id="cg-clip" clipPathUnits="userSpaceOnUse"><path id="cg-clipp"/></clipPath></defs>
      ${Kit.bench(960, 500)}
      <rect x="120" y="40" width="12" height="460" fill="url(#k-metal)"/><rect x="70" y="490" width="120" height="12" rx="3" fill="url(#k-metal)"/>
      <rect x="126" y="78" width="${PIN.x - 120}" height="14" rx="3" fill="url(#k-metal)"/><rect x="${PIN.x - 6}" y="74" width="16" height="22" rx="3" fill="#475569"/>
      <g id="cg-lam"></g>
      <line id="cg-thread" x1="${PIN.x}" y1="${PIN.y}" x2="${PIN.x}" stroke="#111827" stroke-width="1.2"/><path id="cg-bob" fill="#64748B" stroke="#334155"/>
      <circle cx="${PIN.x}" cy="${PIN.y}" r="4.5" fill="#CBD5E1" stroke="#334155"/>
      <g id="cg-test"></g>
      <text x="24" y="34" class="k-status" id="cg-status"></text>
      <text x="700" y="470" class="k-lbl">Click a hole to hang the card from it</text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#cg-svg"), $ = s => svg.querySelector(s);

    function draw(){
      const h = holes[hole], tf = `translate(${PIN.x} ${PIN.y}) rotate(${theta*180/Math.PI}) translate(${-h[0]} ${-h[1]})`;
      const d = "M" + poly.map(p => p.join(" ")).join(" L") + "Z";
      $("#cg-clipp").setAttribute("d", d);
      let s = `<g transform="${tf}"><path d="${d}" fill="#E7D3AE" stroke="#8B6B3E" stroke-width="1.6" filter="url(#k-shadow)"/>
        <g clip-path="url(#cg-clip)">${lines.map(l => `<line x1="${l.p[0] - l.d[0]*600}" y1="${l.p[1] - l.d[1]*600}" x2="${l.p[0] + l.d[0]*600}" y2="${l.p[1] + l.d[1]*600}" stroke="#DC2626" stroke-width="1.3"/>`).join("")}</g>`;
      const e = estimate();
      if(e) s += `<g transform="translate(${e.p[0]} ${e.p[1]})"><circle r="${Math.max(3, e.spread/MM/2)}" fill="none" stroke="#DC2626" stroke-dasharray="2 2"/><path d="M-5 0H5M0 -5V5" stroke="#7F1D1D" stroke-width="1.5"/></g>`;
      holes.forEach((p, i) => s += `<g class="k-btn" data-hole="${i}"><circle cx="${p[0]}" cy="${p[1]}" r="11" fill="transparent"/><circle cx="${p[0]}" cy="${p[1]}" r="5" fill="var(--bg2)" stroke="#8B6B3E" stroke-width="1.4"/><text x="${p[0]}" y="${p[1] - 9}" text-anchor="middle" style="font:700 10px Inter;fill:#5B4526">${"ABCD"[i]}</text></g>`);
      s += `</g>`;
      $("#cg-lam").innerHTML = s;
      const bobY = PIN.y + 360;
      $("#cg-thread").setAttribute("y2", bobY);
      $("#cg-bob").setAttribute("d", `M${PIN.x - 8} ${bobY} H${PIN.x + 8} L${PIN.x} ${bobY + 20}Z`);
      const still = Math.abs(omega) < .01 && Math.abs(theta - target()) < .01;
      $("#cg-status").textContent = test ? test.msg : !still ? `Hanging from hole ${"ABCD"[hole]} — wait for it to stop swinging` : `Hanging from hole ${"ABCD"[hole]} — still. Draw along the plumb line`;
      ctx.readout([["Hole", "ABCD"[hole]], ["Lamina", still ? "still" : "swinging", still ? "good" : "warn"], ["Lines", String(lines.length)], ["Lines meet within", e ? e.spread.toFixed(1) + " mm" : "—"]]);
      // balance-test inset: the card from above, sitting on a pencil tip
      if(test){
        const ox = 810, oy = 230, k = .55, off = [(cog[0] - test.at[0])*k, (cog[1] - test.at[1])*k];
        const tilt = test.ok ? 0 : Kit.clamp(Math.hypot(...off)*2, 8, 25)*(off[0] >= 0 ? 1 : -1);
        $("#cg-test").innerHTML = `<rect x="${ox - 130}" y="${oy - 120}" width="260" height="250" rx="14" fill="color-mix(in srgb,var(--bg-card) 88%,transparent)" stroke="var(--brd2)"/>
          <text x="${ox - 116}" y="${oy - 98}" class="k-lbl">balance test — side view</text>
          <g transform="rotate(${tilt} ${ox} ${oy + 30})"><rect x="${ox - 110}" y="${oy + 24}" width="220" height="6" rx="2" fill="#E7D3AE" stroke="#8B6B3E"/></g>
          <path d="M${ox - 5} ${oy + 120} L${ox} ${oy + 31} L${ox + 5} ${oy + 120}Z" fill="#F59E0B" stroke="#92400E"/>
          <text x="${ox}" y="${oy - 40}" text-anchor="middle" class="k-tag" style="fill:${test.ok ? "var(--sec)" : "var(--hi)"}">${test.ok ? "Balances ✓" : "Topples"}</text>`;
      }else $("#cg-test").innerHTML = "";
    }

    ctx.frame(dt => {
      const tg = target();
      let moved = false;
      for(let k = 0; k < 4; k++){
        const h = dt/4, alpha = -22*Math.sin(theta - tg) - 3.2*omega;
        omega += alpha*h; theta += omega*h;
      }
      if(Math.abs(omega) > 1e-4) moved = true;
      if(moved) draw();
    });

    Kit.dragger(ctx, svg, {
      hit(t){
        const g = t.closest("[data-hole]");
        if(g && +g.dataset.hole !== hole){
          // re-hang from another hole, keeping the card's orientation — it then swings to its new rest position
          hole = +g.dataset.hole; omega = 0; test = null;
          draw();
        }
        return null;
      }
    });

    ctx.buttons([{ label:"Draw along the plumb line", primary:true, block:true, onClick(){
      const err = (Math.random() - .5)*.012;               // a careful pencil line, ±0.35°
      const th = theta + err;
      if(lines.some(l => l.hole === hole && Math.abs(l.th - th) < .02)){ ctx.toast("You already drew this line — hang it from another hole"); return; }
      lines.push({ hole, th, p:holes[hole].slice(), d:[Math.sin(th), Math.cos(th)] });
      if(Math.abs(omega) > .03) ctx.toast("It was still swinging — that line may be off");
      test = null; draw();
      const holesUsed = new Set(lines.map(l => l.hole)).size, e = estimate();
      if(holesUsed >= 2) ctx.complete("two");
      if(holesUsed >= 3 && e && e.spread <= 2) ctx.complete("three");
    } }]);
    ctx.buttons([{ label:"Balance on a pencil tip", onClick(){
      const e = estimate(); if(!e){ ctx.toast("Draw at least two lines that cross first"); return; }
      const off = Math.hypot(e.p[0] - cog[0], e.p[1] - cog[1])*MM;
      test = { at:e.p, ok:off <= 2.5, msg: off <= 2.5 ? "The lamina balances on the pencil — that is its centre of gravity" : `It topples — the point is about ${Math.round(off)} mm from the centre of gravity` };
      ctx.record({ shape:shapeNo, n:lines.length, spread:Kit.round(e.spread, 1), bal:test.ok ? "Balances" : "Topples" });
      if(test.ok){ ctx.complete("balance"); if(!balanced.includes(shapeNo)) balanced.push(shapeNo); if(balanced.length >= 2) ctx.complete("shapes"); }
      draw();
    } }, { label:"Rub out lines", onClick(){ lines = []; test = null; draw(); } }]);
    ctx.buttons([{ label:"New lamina", onClick(){ newShape(); draw(); } }]);
    ctx.html(`<p class="hint">Hang the card, wait until it is completely still, then mark the line of the thread. Use holes far apart so the lines cross at a wide angle.</p>`);
    newShape(); draw();
  }
});

/* ───────────── PRESSURE IN A LIQUID ───────────── */
Lab.register({
  id:"liquidpressure", subject:"physics", level:["igcse"], topic:"Pressure · Liquids", interactive:true,
  title:"Pressure in a liquid",
  summary:"Lower a pressure probe into a tall tank, turn it to face different ways, swap the liquid and find how pressure depends on depth and density.",
  aim:"Investigate how the pressure in a liquid depends on depth, direction and the density of the liquid, and use Δp = ρgΔh to find an unknown density.",
  variables:{ iv:"Depth below the surface (cm) / liquid", dv:"Pressure (kPa)", cv:["Same liquid (when varying depth)","Same probe and sensor","Liquid at rest, room temperature"] },
  stageTitle:"Tank and pressure sensor", controlsTitle:"Probe",
  thumb:`<svg viewBox="0 0 300 140"><rect x="110" y="10" width="90" height="124" rx="3" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="112" y="24" width="86" height="108" fill="#4C86C6" opacity=".55"/>
    <path d="M155 6 V90" stroke="#334155" stroke-width="3" fill="none"/><circle cx="155" cy="94" r="6" fill="#94A3B8" stroke="#334155"/><rect x="214" y="30" width="70" height="36" rx="5" fill="#334155"/><text x="278" y="54" text-anchor="end" font-size="11" fill="#7CFFB2" font-family="monospace">104.2</text></svg>`,
  challenges:[
    { id:"depth", title:"Pressure and depth", text:"Record the pressure at five or more depths in one liquid." },
    { id:"dir",   title:"Every direction", text:"At one depth, record with the probe facing up, sideways and down." },
    { id:"two",   title:"Denser liquid", text:"Record depth readings in two different liquids." },
    { id:"rho",   title:"Mystery liquid", text:"Use the gradient of your graph to find the density of the mystery liquid." }
  ],
  columns:[{key:"liq",label:"Liquid"},{key:"face",label:"Probe faces"},{key:"h",label:"Depth / cm",dp:1},{key:"p",label:"Pressure / kPa",dp:2}],
  series:"liq",
  graph:{ x:["h"], y:["p"], fit:"linear" },
  questions:[
    { q:"How does the pressure in a liquid change with depth?",
      a:"It increases with depth — in a liquid of uniform density the increase in pressure is proportional to the increase in depth (Δp = ρgΔh)." },
    { q:"Why is the graph of pressure against depth a straight line that does not go through the origin?",
      a:"The sensor measures total pressure. At the surface (zero depth) it already reads atmospheric pressure, about 100 kPa. The liquid adds ρgh on top of that." },
    { q:"What does turning the probe show?",
      a:"At a given depth the pressure is the same in all directions — the reading does not change when the probe faces up, sideways or down." },
    { q:"The gradient of a pressure–depth graph is 0.098 kPa/cm. Find the density of the liquid.",
      a:"0.098 kPa/cm = 98 Pa per 0.01 m = 9800 Pa/m. ρ = gradient ÷ g = 9800 ÷ 9.8 = 1000 kg/m³ (water)." },
    { q:"Why is a dam built thicker at the bottom than at the top?",
      a:"Water pressure increases with depth, so the force on each square metre of the dam is greatest at the bottom." }
  ],
  setup(ctx){
    const T = { x0:360, x1:600, surf:120, bot:470 }, PX = 9, G = 9.8;
    const PATM = Kit.round(100.6 + Math.random()*1.2, 2);
    const mystery = 10*Math.round((1180 + Math.random()*260)/10);
    const LIQ = { water:{ name:"Water", rho:998, col:"#4C86C6" }, salt:{ name:"Salt solution", rho:1150, col:"#5E9BCB" }, oil:{ name:"Cooking oil", rho:915, col:"#D9B44A" }, myst:{ name:"Mystery liquid", rho:mystery, col:"#7C5BC4" } };
    let liq = "water", face = "down", px = 470, py = 60, labels = true, noise = 0;
    const depth = () => Math.max(0, (py - T.surf)/PX);
    const reading = () => PATM + LIQ[liq].rho*G*depth()/100/1000 + noise;

    let ruler = "";
    for(let c = 0; c <= 38; c++){ const y = T.surf + c*PX, L = c % 5 === 0 ? 12 : 6; ruler += `<line x1="${T.x0 - 4}" y1="${y}" x2="${T.x0 - 4 - L}" y2="${y}" stroke="#4B3621" stroke-width=".8"/>`; if(c % 5 === 0) ruler += `<text x="${T.x0 - 20}" y="${y + 3.5}" text-anchor="end" style="font:600 9px 'JetBrains Mono';fill:#4B3621">${c}</text>`; }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="lp-svg"><defs>${Kit.DEFS}</defs>
      ${Kit.bench(960, 480)}
      <rect x="${T.x0 - 56}" y="${T.surf - 16}" width="46" height="${38*PX + 26}" rx="3" fill="url(#k-wood)" stroke="#7B4F2C"/>${ruler}
      <text x="${T.x0 - 34}" y="${T.surf - 22}" text-anchor="middle" class="k-lbl">cm</text>
      <rect id="lp-liq" x="${T.x0 + 2}" y="${T.surf}" width="${T.x1 - T.x0 - 4}" height="${T.bot - T.surf}" opacity=".55"/>
      <line x1="${T.x0 + 2}" y1="${T.surf}" x2="${T.x1 - 2}" y2="${T.surf}" stroke="#fff" stroke-opacity=".6"/>
      <path d="M${T.x0} 90 V${T.bot} H${T.x1} V90" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2"/>
      <g id="lp-probe"></g>
      <g transform="translate(700 120)"><rect width="200" height="128" rx="12" fill="#334155" stroke="#1F2937"/><text x="14" y="22" style="font:700 10px Inter;fill:#CBD5E1">PRESSURE SENSOR</text>
        <rect x="14" y="32" width="172" height="44" rx="5" fill="#132A1F"/><text id="lp-lcd" x="150" y="63" text-anchor="end" class="k-lcd">0.00</text><text x="178" y="63" text-anchor="end" style="font:600 11px Inter;fill:#5FBF8A">kPa</text>
        <text x="14" y="102" style="font:500 10px Inter;fill:#94A3B8">absolute pressure</text></g>
      <text x="24" y="34" class="k-status" id="lp-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#lp-svg"), $ = s => svg.querySelector(s);

    function draw(){
      $("#lp-liq").setAttribute("fill", LIQ[liq].col);
      const rot = { down:0, side:-90, up:180 }[face];
      const tube = `M700 200 C 640 200 ${px + 40} 40 ${px} 40 V${py - 12}`;
      $("#lp-probe").innerHTML = `<path d="${tube}" stroke="#64748B" stroke-width="4" fill="none"/>
        <g class="k-drag" id="lp-head" transform="translate(${px} ${py})"><rect x="-30" y="-30" width="60" height="60" fill="transparent"/>
          <g transform="rotate(${rot})"><path d="M-4 -12 H4 V0 L12 8 H-12 L-4 0Z" fill="#94A3B8" stroke="#334155"/><rect x="-13" y="8" width="26" height="4" rx="1" fill="#F59E0B"/></g></g>
        ${labels && depth() > 0 ? `<text x="${px + 26}" y="${py + 4}" class="k-read">${depth().toFixed(1)} cm</text>` : ""}
        <line x1="${T.x0 - 4}" y1="${py}" x2="${px - 14}" y2="${py}" stroke="var(--accent)" stroke-dasharray="3 3" opacity="${depth() > 0 ? .7 : 0}"/>`;
      $("#lp-lcd").textContent = reading().toFixed(2);
      $("#lp-status").textContent = depth() <= 0 ? "Drag the probe down into the liquid" : `Probe ${depth().toFixed(1)} cm below the surface, facing ${face === "side" ? "sideways" : face}`;
      ctx.readout([["Liquid", LIQ[liq].name], ["Depth", labels ? depth().toFixed(1) + " cm" : "read the ruler"], ["Sensor", reading().toFixed(2) + " kPa", "good"]]);
    }
    ctx.every(400, () => { noise = (Math.random() - .5)*.02; draw(); });
    Kit.dragger(ctx, svg, {
      hit(t, p){ return t.closest("#lp-head") ? { ox:px - p.x, oy:py - p.y } : null; },
      move(h, p){ px = Kit.clamp(p.x + h.ox, T.x0 + 24, T.x1 - 24); const y = p.y + h.oy; py = y <= T.surf ? Kit.clamp(y, 60, T.surf) : Math.min(T.bot - 16, T.surf + Kit.snap((y - T.surf)/PX, .5)*PX); draw(); }
    });
    ctx.select({ label:"Liquid in the tank", value:"water", options:Object.keys(LIQ).map(k => [k, LIQ[k].name]), onChange(v){ liq = v; draw(); } });
    ctx.seg({ label:"Probe faces", value:"down", options:[["down","Down"],["side","Sideways"],["up","Up"]], onChange(v){ face = v; draw(); } });
    ctx.seg({ label:"Depth label", value:true, options:[[true,"Show"],[false,"Hide — read the ruler"]], onChange(v){ labels = v; draw(); } });
    ctx.buttons([{ label:"Record reading", primary:true, block:true, onClick(){
      ctx.record({ liq:LIQ[liq].name, face:{ down:"Down", side:"Sideways", up:"Up" }[face], h:Kit.round(depth(), 1), p:Kit.round(reading(), 2) });
      const rows = ctx.rows(), by = {};
      rows.forEach(r => (by[r.liq] = by[r.liq] || new Set()).add(r.h));
      if(Object.values(by).some(s => s.size >= 5)) ctx.complete("depth");
      if(Object.values(by).filter(s => s.size >= 3).length >= 2) ctx.complete("two");
      const dirs = {}; rows.filter(r => r.h > 0).forEach(r => (dirs[r.liq + r.h] = dirs[r.liq + r.h] || new Set()).add(r.face));
      if(Object.values(dirs).some(s => s.size >= 3)) ctx.complete("dir");
    } }]);
    Kit.answer(ctx, "Density of the mystery liquid / kg m⁻³", "e.g. 1300", v => Math.abs(v - mystery)/mystery <= .04
      ? (ctx.complete("rho"), [true, `Correct — about ${mystery} kg/m³.`]) : [false, "Plot pressure against depth for the mystery liquid. Convert the gradient to Pa per metre, then ρ = gradient ÷ g."]);
    draw();
  }
});

/* ───────────── DENSITY OF A LIQUID ───────────── */
Lab.register({
  id:"liquiddensity", subject:"physics", level:["igcse"], topic:"Density · Liquids", interactive:true,
  title:"Density of a liquid",
  summary:"Tare a measuring cylinder on a balance, pour in a liquid, read the volume and mass, and find its density from a mass–volume graph.",
  aim:"Determine the density of a liquid by measuring the mass of a known volume using a measuring cylinder and a top-pan balance.",
  variables:{ iv:"Volume of liquid (cm³)", dv:"Mass of liquid (g)", cv:["Same liquid","Balance tared with the empty, dry cylinder","Read the bottom of the meniscus at eye level"] },
  stageTitle:"Balance and measuring cylinder", controlsTitle:"Readings",
  thumb:`<svg viewBox="0 0 300 140"><rect x="70" y="104" width="110" height="30" rx="5" fill="#334155"/><rect x="80" y="110" width="66" height="16" rx="2" fill="#132A1F"/><text x="140" y="122" text-anchor="end" font-size="10" fill="#7CFFB2" font-family="monospace">63.1 g</text>
    <rect x="110" y="16" width="34" height="86" rx="3" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="112" y="52" width="30" height="48" fill="#D9B44A" opacity=".7"/><path d="M200 40 l30 0 l-4 50 h-22z" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="205" y="60" width="22" height="28" fill="#D9B44A" opacity=".7"/></svg>`,
  challenges:[
    { id:"tare",    title:"Tare first", text:"Zero the balance with the empty cylinder on it before pouring." },
    { id:"graph",   title:"Mass–volume graph", text:"Record four or more volumes of one liquid; the gradient is its density." },
    { id:"three",   title:"Three liquids", text:"Find the density of three different liquids." },
    { id:"mystery", title:"Mystery liquid", text:"Find the density of the mystery liquid." }
  ],
  columns:[{key:"liq",label:"Liquid"},{key:"V",label:"Volume / cm³",dp:1},{key:"m",label:"Mass / g",dp:1},{key:"rho",label:"Density / g cm⁻³",dp:2}],
  series:"liq",
  graph:{ x:["V"], y:["m"], fit:"linear" },
  questions:[
    { q:"Describe how to find the density of a liquid.",
      a:"Put an empty measuring cylinder on a balance and record its mass (or tare the balance). Pour in some liquid, read the volume at the bottom of the meniscus, and read the new mass. Mass of liquid = full − empty. Density = mass ÷ volume." },
    { q:"Why is it better to plot mass against volume for several volumes than to use one reading?",
      a:"Each reading has some uncertainty. A line of best fit through several points averages them out, and the gradient (density) is not affected by a constant error such as a balance that was not quite zeroed." },
    { q:"Why does a larger volume of liquid give a more accurate density?",
      a:"The reading uncertainties (±0.5 cm³ and ±0.1 g) are the same size, so they are a smaller percentage of a larger volume and mass." },
    { q:"Ethanol has a density of 0.79 g/cm³. What mass of ethanol has a volume of 50 cm³?",
      a:"m = ρV = 0.79 × 50 = 39.5 g." }
  ],
  setup(ctx){
    const CYL = { x0:300, x1:352, top:130, bot:420 }, Vy = V => 414 - V*2.7, EMPTY = Kit.round(58 + Math.random()*20, 1);
    const myst = Kit.round(1.25 + Math.random()*.3, 2);
    const LIQ = { water:{ name:"Water", rho:.998, col:"#4C86C6" }, ethanol:{ name:"Ethanol", rho:.789, col:"#B9D6F2" }, oil:{ name:"Olive oil", rho:.911, col:"#C9A227" }, salt:{ name:"Salt solution", rho:1.12, col:"#5E9BCB" }, myst:{ name:"Mystery liquid", rho:myst, col:"#7C5BC4" } };
    let liq = "water", V = 0, tare = 0, pouring = false, taredEmpty = false;
    const mass = () => EMPTY + V*LIQ[liq].rho - tare;

    let scale = "";
    for(let v = 0; v <= 100; v++){ const y = Vy(v), L = v % 10 === 0 ? 14 : v % 5 === 0 ? 10 : 6; scale += `<line x1="${CYL.x1}" y1="${y}" x2="${CYL.x1 - L}" y2="${y}" stroke="var(--txt2)" stroke-width=".7"/>`; if(v % 10 === 0) scale += `<text x="${CYL.x1 + 4}" y="${y + 3.5}" class="k-num">${v}</text>`; }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="ld-svg"><defs>${Kit.DEFS}<clipPath id="ld-cyl"><rect x="${CYL.x0 + 2}" y="${CYL.top}" width="${CYL.x1 - CYL.x0 - 4}" height="${CYL.bot - CYL.top}"/></clipPath><clipPath id="ld-lensclip"><circle r="62"/></clipPath></defs>
      ${Kit.bench(960, 480)}
      <rect x="216" y="436" width="220" height="44" rx="10" fill="#334155" stroke="#1F2937"/>
      <rect x="236" y="444" width="130" height="28" rx="5" fill="#132A1F"/><text id="ld-bal" x="358" y="465" text-anchor="end" class="k-lcd" style="font-size:17px">0.0 g</text>
      <g class="k-btn" id="ld-tare"><rect x="376" y="444" width="48" height="28" rx="7" fill="#0F172A" stroke="#475569"/><text x="400" y="462" text-anchor="middle" style="font:700 10px Inter;fill:#E5E7EB">TARE</text></g>
      <rect x="256" y="424" width="140" height="10" rx="4" fill="url(#k-metal)"/>
      <g id="ld-cylg"><rect id="ld-w" x="${CYL.x0 + 2}" width="${CYL.x1 - CYL.x0 - 4}" clip-path="url(#ld-cyl)" opacity=".7"/>
        <path d="M${CYL.x0} 116 V${CYL.bot} H${CYL.x1} V116" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
        <path d="M${CYL.x0 - 18} 424 L${CYL.x0 - 10} ${CYL.bot} H${CYL.x1 + 10} L${CYL.x1 + 18} 424Z" fill="url(#k-glass)" stroke="var(--txt2)"/>${scale}</g>
      <g id="ld-stream"></g>
      <g id="ld-beaker"></g>
      <g id="ld-lens" style="pointer-events:none"><line id="ld-lline" stroke="var(--accent)" stroke-dasharray="3 3"/><g id="ld-lin"><circle r="64" fill="#F7F9FC" stroke="var(--accent)" stroke-width="3"/><g clip-path="url(#ld-lensclip)" id="ld-zoom"></g></g></g>
      <g transform="translate(620 300)">
        <g class="k-btn" id="ld-pour"><rect width="130" height="40" rx="10" fill="#0F172A" stroke="#475569"/><text x="65" y="25" text-anchor="middle" style="font:700 12px Inter;fill:#E5E7EB">HOLD TO POUR</text></g>
        <g class="k-btn" id="ld-drop" transform="translate(140 0)"><rect width="110" height="40" rx="10" fill="#0F172A" stroke="#475569"/><text x="55" y="25" text-anchor="middle" style="font:700 12px Inter;fill:#E5E7EB">+0.5 cm³</text></g>
        <text x="0" y="62" class="k-lbl">pour from the beaker · top up with a dropper</text></g>
      <text x="24" y="34" class="k-status" id="ld-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ld-svg"), $ = s => svg.querySelector(s);
    function draw(){
      const L = LIQ[liq], y = Vy(V);
      $("#ld-w").setAttribute("fill", L.col); $("#ld-w").setAttribute("y", y); $("#ld-w").setAttribute("height", Math.max(0, CYL.bot - y));
      $("#ld-beaker").innerHTML = `<g transform="translate(470 ${pouring ? 120 : 300}) rotate(${pouring ? -62 : 0})"><path d="M0 0 h80 l-6 110 h-68z" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><rect x="8" y="40" width="64" height="68" fill="${L.col}" opacity=".7"/><text x="40" y="130" text-anchor="middle" class="k-lbl">${L.name}</text></g>`;
      $("#ld-stream").innerHTML = pouring ? `<path d="M410 128 Q 340 120 ${(CYL.x0 + CYL.x1)/2} ${y}" stroke="${L.col}" stroke-width="5" fill="none" opacity=".8"/>` : "";
      $("#ld-bal").textContent = mass().toFixed(1) + " g";
      const cy = Kit.clamp(y, 160, 380), cx = 170;
      $("#ld-lin").setAttribute("transform", `translate(${cx} ${cy})`);
      const ll = $("#ld-lline"); ll.setAttribute("x1", cx + 64); ll.setAttribute("y1", cy); ll.setAttribute("x2", CYL.x0); ll.setAttribute("y2", y);
      let z = `<rect x="-64" y="0" width="128" height="80" fill="${L.col}" opacity=".45"/><path d="M-64 -7 Q0 7 64 -7 V0 H-64Z" fill="${L.col}" opacity=".45"/><path d="M-64 -7 Q0 7 64 -7" fill="none" stroke="#1F2937" stroke-width="2"/>`;
      for(let v = Math.ceil(V - 5); v <= Math.floor(V + 5); v++){ if(v < 0) continue; const yy = (V - v)*13, major = v % 5 === 0; z += `<line x1="${major ? -38 : -24}" y1="${yy}" x2="10" y2="${yy}" stroke="#111827" stroke-width="${major ? 1.6 : 1}"/>`; if(major) z += `<text x="16" y="${yy + 5}" style="font:600 13px 'JetBrains Mono';fill:#111827">${v}</text>`; }
      $("#ld-zoom").innerHTML = z;
      $("#ld-status").textContent = !taredEmpty && V === 0 ? "Press TARE with the empty cylinder on the balance" : V === 0 ? "Hold POUR to add liquid" : "Read the volume (magnifier) and the mass, then enter the volume";
      ctx.readout([["Liquid", L.name], ["Balance", mass().toFixed(1) + " g"], ["Tared", taredEmpty ? "yes" : "no", taredEmpty ? "good" : "warn"]]);
    }
    ctx.frame(dt => { if(pouring){ V = Math.min(100, V + dt*9); draw(); } });
    Kit.dragger(ctx, svg, {
      hit(t){
        if(t.closest("#ld-tare")){ tare = EMPTY + V*LIQ[liq].rho; taredEmpty = V === 0; if(taredEmpty) ctx.complete("tare"); draw(); return null; }
        if(t.closest("#ld-pour")){ pouring = true; draw(); return { pour:true }; }
        if(t.closest("#ld-drop")){ V = Math.min(100, V + .5); draw(); return null; }
        return null;
      },
      end(h){ if(h.pour){ pouring = false; V = Kit.round(V, 1); draw(); } }
    });
    ctx.select({ label:"Liquid", value:"water", options:Object.keys(LIQ).map(k => [k, LIQ[k].name]), onChange(v){ liq = v; V = 0; draw(); ctx.toast("Fresh, clean, dry cylinder"); } });
    const vol = Kit.reading(ctx, "Volume of liquid / cm³ (read the magnifier)", "e.g. 42.5", () => V > 0 ? V : null, .5, v => {
      if(!taredEmpty){ ctx.toast("Tare the balance with the empty cylinder first, so the reading is the mass of liquid only"); return; }
      const m = Kit.round(mass(), 1);
      ctx.record({ liq:LIQ[liq].name, V:v, m, rho:Kit.round(m/v, 2) });
      vol.clear();
      const rows = ctx.rows(), by = {};
      rows.forEach(r => (by[r.liq] = by[r.liq] || new Set()).add(Math.round(r.V)));
      if(Object.values(by).some(s => s.size >= 4)) ctx.complete("graph");
      if(Object.keys(by).length >= 3) ctx.complete("three");
    });
    ctx.buttons([{ label:"Empty the cylinder", onClick(){ V = 0; draw(); } }]);
    Kit.answer(ctx, "Density of the mystery liquid / g cm⁻³", "e.g. 1.30", v => Math.abs(v - myst) <= .03
      ? (ctx.complete("mystery"), [true, `Correct — ${myst.toFixed(2)} g/cm³.`]) : [false, "Plot mass against volume for the mystery liquid — the gradient is its density."]);
    ctx.html(`<p class="hint">You can keep pouring and record after each top-up — every reading is the total volume and total mass of liquid in the cylinder.</p>`);
    draw();
  }
});
