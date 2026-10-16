"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · THERMAL (IGCSE) — Conduction · Convection · Gas pressure & volume
══════════════════════════════════════════════════════════════════ */

/* ───────────── CONDUCTION: WAX AND PINS ON RODS ───────────── */
Lab.register({
  id:"conduction", subject:"physics", level:["igcse"], topic:"Thermal physics · Conduction", interactive:true,
  title:"Good and bad thermal conductors",
  summary:"Heat one end of copper, aluminium, brass, steel and glass rods with pins stuck on with wax, and time how far along each rod the pins drop.",
  aim:"Compare how well different materials conduct thermal energy by timing when wax-mounted pins fall from rods heated at one end.",
  variables:{ iv:"Material of the rod", dv:"Time for each pin to drop / number of pins dropped", cv:["Same length and diameter of rod","Pins at the same distances, same wax","All rods heated equally at one end"] },
  stageTitle:"Conductivity rods", controlsTitle:"Heating",
  thumb:`<svg viewBox="0 0 300 140"><rect x="40" y="30" width="40" height="90" rx="4" fill="#64748B"/>${["#C2703D","#B4BCCB","#C9A227","#6B7486"].map((c,i)=>`<rect x="80" y="${36+i*22}" width="200" height="7" rx="3" fill="${c}"/>${[0,1,2,3].map(k=>`<line x1="${110+k*40}" y1="${43+i*22}" x2="${110+k*40}" y2="${53+i*22}" stroke="#CBD5E1" stroke-width="2" opacity="${k < 3 - i ? 0 : 1}"/>`).join("")}`).join("")}<path d="M52 130 q8 -24 8 -10 q8 -14 6 10z" fill="#3B82F6"/></svg>`,
  challenges:[
    { id:"run",   title:"Heat the rods", text:"Heat the rods until pins have dropped from at least two rods." },
    { id:"times", title:"Time the pins", text:"Record the drop times of eight or more pins." },
    { id:"rank",  title:"Rank the materials", text:"Put the materials in order, best conductor first." },
    { id:"glass", title:"An insulator", text:"Heat for at least 10 minutes and notice that no pin falls from the glass rod." }
  ],
  columns:[{key:"mat",label:"Rod"},{key:"d",label:"Pin distance / cm",dp:0},{key:"t",label:"Time to drop / s",dp:0}],
  series:"mat",
  graph:{ x:["t"], y:["d"], fit:"none" },
  questions:[
    { q:"Explain why metals are good thermal conductors.",
      a:"Atoms at the hot end vibrate more and pass energy to neighbouring atoms. Metals also have free (delocalised) electrons that move quickly through the metal and carry energy to the cooler parts — much faster than atomic vibrations alone." },
    { q:"Why must the rods be the same length and diameter, and the pins be stuck on with the same amount of wax?",
      a:"So the only variable affecting the result is the material. A thicker rod carries more energy; more wax takes longer to melt." },
    { q:"Why do no pins fall from the glass rod?",
      a:"Glass is a poor conductor (an insulator). Energy travels along it so slowly that the far parts never get hot enough to melt the wax before the energy is lost to the air." },
    { q:"Why are saucepans made of metal but given plastic or wooden handles?",
      a:"The metal pan conducts thermal energy quickly from the flame to the food. Plastic and wood are poor conductors, so the handle stays cool enough to hold." }
  ],
  setup(ctx){
    const MAT = [
      { k:"cu",    name:"Copper",    a:1.11e-4, col:"#C2703D" },
      { k:"al",    name:"Aluminium", a:9.7e-5,  col:"#B4BCCB" },
      { k:"brass", name:"Brass",     a:3.4e-5,  col:"#C9A227" },
      { k:"steel", name:"Steel",     a:1.2e-5,  col:"#6B7486" },
      { k:"glass", name:"Glass",     a:3.4e-7,  col:"#B9E3F0" }
    ];
    const N = 31, DX = .01, LOSS = .004, AIR = 20, WAX = 58, PINS = [4, 8, 12, 16, 20, 24], X0 = 250, S = 18;
    let on = false, speed = 20, t = 0, hot = AIR, camera = false;
    const rods = MAT.map(m => ({ ...m, T:new Array(N).fill(AIR), drop:PINS.map(() => null), fall:PINS.map(() => 0), logged:PINS.map(() => false) }));
    const rodY = i => 120 + i*66;

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="cd-svg"><defs>${Kit.DEFS}</defs>
      ${Kit.bench(960, 480)}
      <rect x="170" y="96" width="${X0 - 166}" height="${rodY(4) - 96 + 26}" rx="6" id="cd-block" stroke="#334155"/>
      <text x="160" y="${rodY(4) + 40}" text-anchor="end" class="k-lbl">heated block</text>
      <g id="cd-flame"></g>
      <rect x="196" y="438" width="28" height="42" fill="url(#k-metal)"/>
      <g id="cd-rods"></g>
      <g transform="translate(24 60)"><rect width="128" height="44" rx="8" fill="#1F2937" stroke="#4B5563"/><rect x="8" y="7" width="112" height="30" rx="5" fill="#132A1F"/><text id="cd-clock" x="112" y="30" text-anchor="end" class="k-lcd" style="font-size:18px">0:00</text></g>
      <text x="24" y="34" class="k-status" id="cd-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#cd-svg"), $ = s => svg.querySelector(s);
    const heatCol = T => { const f = Kit.clamp((T - AIR)/260, 0, 1); return `rgb(${Math.round(60 + 195*f)},${Math.round(70 + 120*f*(1 - f) + 30*(1 - f))},${Math.round(200*(1 - f))})`; };
    const clock = () => `${Math.floor(t/60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

    function draw(){
      $("#cd-block").setAttribute("fill", camera ? heatCol(hot) : `color-mix(in srgb, #64748B ${100 - Kit.clamp((hot - AIR)/3, 0, 60)}%, #F97316)`);
      $("#cd-flame").innerHTML = on ? `<path d="M210 438 q-14 -30 -2 -52 q4 18 10 10 q4 -20 -2 -34 q22 18 14 54 q-4 18 -20 22z" fill="#3B82F6" opacity=".85"/><path d="M210 438 q-6 -18 0 -30 q6 10 8 6 q4 12 -2 24z" fill="#BFDBFE"/>` : "";
      let s = "";
      rods.forEach((r, i) => {
        const y = rodY(i);
        if(camera){
          s += `<g>`; for(let k = 0; k < N - 1; k++) s += `<rect x="${X0 + k*S}" y="${y}" width="${S + .5}" height="10" fill="${heatCol((r.T[k] + r.T[k + 1])/2)}"/>`; s += `</g>`;
        }else s += `<rect x="${X0}" y="${y}" width="${(N - 1)*S}" height="10" rx="4" fill="${r.col}" stroke="#334155" stroke-width=".8"/>`;
        s += `<text x="${X0 + (N - 1)*S + 10}" y="${y + 9}" class="k-tag">${r.name}</text>`;
        PINS.forEach((d, j) => {
          const x = X0 + d*S, fy = r.fall[j];
          if(fy < 300){
            s += `<g transform="translate(${x} ${y + 10 + fy}) rotate(${fy ? fy*.8 : 0})"><ellipse cx="0" cy="1" rx="5" ry="3" fill="#F5E6B8" opacity="${r.drop[j] === null ? 1 : 0}"/><line x1="0" y1="0" x2="0" y2="20" stroke="#CBD5E1" stroke-width="1.6"/><circle cx="0" cy="0" r="3" fill="#94A3B8"/></g>`;
          }
        });
      });
      // centimetre ruler under the rods
      for(let c = 0; c <= 30; c += 2){ const x = X0 + c*S; s += `<line x1="${x}" y1="${rodY(4) + 40}" x2="${x}" y2="${rodY(4) + (c % 4 ? 46 : 50)}" stroke="var(--txt3)"/>`; if(c % 4 === 0) s += `<text x="${x}" y="${rodY(4) + 62}" text-anchor="middle" class="k-num">${c}</text>`; }
      s += `<text x="${X0 + 15*S}" y="${rodY(4) + 76}" text-anchor="middle" class="k-lbl">distance from the heated end / cm</text>`;
      $("#cd-rods").innerHTML = s;
      $("#cd-clock").textContent = clock();
      const fallen = rods.reduce((n, r) => n + r.drop.filter(d => d !== null).length, 0);
      $("#cd-status").textContent = on ? `Heating — ${fallen} pin${fallen === 1 ? "" : "s"} dropped` : t ? "Burner off" : "Light the burner to heat the block";
      ctx.readout([["Burner", on ? "on" : "off", on ? "warn" : ""], ["Time", clock()], ["Block", Math.round(hot) + " °C"], ["Pins dropped", String(fallen)]]);
    }

    ctx.frame(dt => {
      let busy = false;
      if(on || hot > AIR + .5 || rods.some(r => r.T[1] > AIR + .5)){
        let simDt = dt*speed;
        while(simDt > 1e-6){
          const h = Math.min(.1, simDt); simDt -= h;
          hot += on ? (300 - hot)*h/40 : -(hot - AIR)*h/240;
          rods.forEach(r => {
            const T = r.T, k = r.a*h/(DX*DX), nT = T.slice();
            nT[0] = hot;
            for(let i = 1; i < N - 1; i++) nT[i] = T[i] + k*(T[i - 1] - 2*T[i] + T[i + 1]) - LOSS*h*(T[i] - AIR);
            nT[N - 1] = T[N - 1] + k*(T[N - 2] - T[N - 1]) - LOSS*h*(T[N - 1] - AIR);
            r.T = nT;
            PINS.forEach((d, j) => { if(r.drop[j] === null && nT[d] >= WAX) r.drop[j] = Math.round(t + h); });
          });
          if(on) t += h;
        }
        busy = true;
      }
      rods.forEach(r => r.fall.forEach((f, j) => { if(r.drop[j] !== null && f < 300){ r.fall[j] = f + 260*dt + f*dt*3; busy = true; } }));
      if(rods.filter(r => r.drop.some(d => d !== null)).length >= 2) ctx.complete("run");
      if(t >= 600 && rods[4].drop.every(d => d === null)) ctx.complete("glass");
      if(busy) draw();
    });

    ctx.buttons([{ label:"Burner on / off", primary:true, block:true, onClick(){ on = !on; draw(); } }]);
    ctx.seg({ label:"Time speed", value:20, options:[[10,"×10"],[20,"×20"],[60,"×60"]], onChange(v){ speed = v; } });
    ctx.seg({ label:"View", value:false, options:[[false,"Normal"],[true,"Thermal camera"]], onChange(v){ camera = v; draw(); } });
    ctx.buttons([{ label:"Record pin times", onClick(){
      let n = 0;
      rods.forEach(r => PINS.forEach((d, j) => { if(r.drop[j] !== null && !r.logged[j]){ r.logged[j] = true; n++; ctx.record({ mat:r.name, d, t:r.drop[j] }, true); } }));
      ctx.toast(n ? `${n} pin time${n > 1 ? "s" : ""} recorded` : "No new pins have dropped yet");
      if(ctx.rows().length >= 8) ctx.complete("times");
    } }, { label:"Cool and re-wax", onClick(){
      on = false; t = 0; hot = AIR;
      rods.forEach(r => { r.T.fill(AIR); r.drop = PINS.map(() => null); r.fall = PINS.map(() => 0); r.logged = PINS.map(() => false); });
      draw();
    } }]);
    const order = ["Copper","Aluminium","Brass","Steel","Glass"];
    const pick = [];
    const box = ctx.html(`<div class="ctl"><div class="lbl"><span>Rank the materials (click best first)</span></div><div class="seg" id="cd-rank">${order.slice().sort(() => Math.random() - .5).map(m => `<button type="button" data-m="${m}">${m}</button>`).join("")}</div><div id="cd-rankfb" style="margin-top:8px"></div></div>`);
    box.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      if(pick.includes(b.dataset.m)) return;
      pick.push(b.dataset.m); b.classList.add("on"); b.textContent = pick.length + ". " + b.dataset.m;
      if(pick.length === order.length){
        const ok = pick.every((m, i) => m === order[i]);
        box.querySelector("#cd-rankfb").innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${ok ? "Correct: copper, aluminium, brass, steel, glass." : "Not quite — compare how far and how fast the pins dropped on each rod."}</div>`;
        if(ok) ctx.complete("rank");
        ctx.after(ok ? 4000 : 1800, () => { pick.length = 0; box.querySelectorAll("button").forEach(x => { x.classList.remove("on"); x.textContent = x.dataset.m; }); if(!ok) box.querySelector("#cd-rankfb").innerHTML = ""; });
      }
    }));
    draw();
  }
});

/* ───────────── CONVECTION CURRENTS IN WATER ───────────── */
Lab.register({
  id:"convection", subject:"physics", level:["igcse"], topic:"Thermal physics · Convection", interactive:true,
  title:"Convection currents in water",
  summary:"Drop a potassium manganate(VII) crystal into a beaker of water, heat one side and watch the purple dye trace out a convection current.",
  aim:"Show that heating a liquid from below sets up a convection current, and observe how the position of the heater affects its pattern.",
  variables:{ iv:"Position of the heating (or none)", dv:"Movement of the purple dye", cv:["Same beaker and volume of water","Crystal placed gently at the bottom","Water still before heating"] },
  stageTitle:"Beaker of water", controlsTitle:"Heating",
  thumb:`<svg viewBox="0 0 300 140"><path d="M90 14 V126 H210 V14" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="92" y="24" width="116" height="100" fill="#4C86C6" opacity=".35"/>
    <path d="M115 116 C 105 60 110 34 150 32 C 190 32 196 60 190 110" fill="none" stroke="#9333EA" stroke-width="5" stroke-linecap="round" opacity=".7"/><path d="M110 132 q-6 -10 2 -16 q2 8 6 4 q2 8 -8 12z" fill="#3B82F6"/></svg>`,
  challenges:[
    { id:"rise", title:"Hot water rises", text:"Heat the side with the crystal and watch purple water rise to the surface." },
    { id:"loop", title:"A full loop", text:"Keep heating until the dye sinks back down on the far side — a convection current." },
    { id:"still", title:"No heating", text:"Leave the crystal for 20 s with no heating — the dye barely spreads." },
    { id:"centre", title:"Heat the middle", text:"Heat under the centre and see two convection loops." }
  ],
  questions:[
    { q:"Explain why the purple water rises above the flame.",
      a:"The water there is heated, so its particles move faster and spread further apart. The water expands, its density decreases, and the less dense warm water rises. Cooler, denser water sinks to take its place." },
    { q:"Why can convection not happen in a solid?",
      a:"Convection needs the hot material itself to move (flow). Particles in a solid are fixed in place, so a solid cannot flow." },
    { q:"Why is a potassium manganate(VII) crystal used?",
      a:"It dissolves slowly to give a strongly coloured solution that moves with the water, making the otherwise invisible flow of water visible." },
    { q:"Why is the freezer compartment at the top of a fridge?",
      a:"Air cooled by the freezer becomes denser and sinks, setting up a convection current that circulates cold air through the whole fridge." }
  ],
  setup(ctx){
    const B = { x0:300, x1:660, top:120, bot:440 }, W = B.x1 - B.x0, H = B.bot - B.top;
    let heat = "off", A = 0, crystal = null, parts = [], t = 0, tStill = 0, arrows = false, centreSeen = 0;

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="cv-svg"><defs>${Kit.DEFS}</defs>
      ${Kit.bench(960, 490)}
      <rect x="${B.x0 + 2}" y="${B.top}" width="${W - 4}" height="${H}" fill="url(#k-water)" opacity=".7"/>
      <g id="cv-arrows"></g>
      <path id="cv-dye" fill="none" stroke="#A21CAF" stroke-width="6" stroke-linecap="round"/>
      <g id="cv-crys"></g>
      <path d="M${B.x0} 100 V${B.bot} H${B.x1} V100" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2"/>
      <rect x="${B.x0 - 20}" y="${B.bot}" width="${W + 40}" height="8" fill="url(#k-metal)"/>
      <rect x="${B.x0}" y="${B.bot + 8}" width="8" height="42" fill="url(#k-metal)"/><rect x="${B.x1 - 8}" y="${B.bot + 8}" width="8" height="42" fill="url(#k-metal)"/>
      <g id="cv-flame"></g>
      <g transform="translate(760 360)"><rect x="-50" y="-30" width="100" height="70" rx="10" fill="color-mix(in srgb,var(--bg-card) 80%,transparent)" stroke="var(--brd2)"/>
        <g class="k-drag" id="cv-src"><rect x="-20" y="-16" width="40" height="34" fill="transparent"/><path d="M-6 0 l6 -8 l7 3 l-1 9 l-8 3z" fill="#4A044E" stroke="#1E0326"/></g>
        <text y="30" text-anchor="middle" class="k-lbl">crystal — drag in</text></g>
      <text x="24" y="34" class="k-status" id="cv-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#cv-svg"), $ = s => svg.querySelector(s);

    /* stream function ψ = C·f(ξ)·sin(πy), y measured down, f = −sin(πξ)·sin(2πξ):
       two cells with the water rising at ξ = ½. ξ(x) stretches the beaker so that
       ξ = ½ falls directly above the flame (x = ¼, ½ or ¾). Returns px/s. */
    const CPS = 130*W/(3*Math.PI);
    function shape(x){
      const xi = heat === "left" ? Math.sqrt(x) : heat === "right" ? 1 - Math.sqrt(1 - x) : x;
      return -Math.sin(Math.PI*xi)*Math.sin(2*Math.PI*xi);
    }
    function vel(x, y){
      const e = 1e-4, x0 = Kit.clamp(x, e, 1 - e), f = shape(x0), df = (shape(x0 + e) - shape(x0 - e))/(2*e);
      return [A*CPS*f*Math.PI*Math.cos(Math.PI*y)/H, -A*CPS*df*Math.sin(Math.PI*y)/W];
    }
    function draw(){
      const fx = { left:B.x0 + W*.25, right:B.x1 - W*.25, centre:B.x0 + W/2 }[heat];
      $("#cv-flame").innerHTML = heat === "off" ? "" : `<g transform="translate(${fx} ${B.bot + 46})"><path d="M0 0 q-16 -24 -2 -40 q4 14 9 8 q4 -14 -2 -26 q20 16 12 44 q-4 12 -17 14z" fill="#3B82F6" opacity=".85"/><rect x="-10" y="0" width="20" height="30" fill="url(#k-metal)"/></g>`;
      $("#cv-dye").setAttribute("d", parts.map(p => `M${(B.x0 + p.x*W).toFixed(1)} ${(B.top + p.y*H).toFixed(1)}h.1`).join(""));
      $("#cv-dye").setAttribute("stroke-opacity", Kit.clamp(40/Math.max(40, parts.length), .3, .8));
      $("#cv-crys").innerHTML = crystal ? `<path transform="translate(${B.x0 + crystal.x*W} ${B.bot - 6}) scale(${Math.max(.3, 1 - crystal.used/600)})" d="M-6 0 l6 -8 l7 3 l-1 9 l-8 3z" fill="#4A044E"/>` : "";
      let a = "";
      if(arrows && A > .02){
        for(let i = 1; i < 8; i++) for(let j = 1; j < 6; j++){
          const x = i/8, y = j/6, [u, v] = vel(x, y), m = Math.hypot(u, v); if(m < 4) continue;
          const X = B.x0 + x*W, Y = B.top + y*H, L = Math.min(30, 8 + m*.3), dx = u/m*L, dy = v/m*L;
          a += `<line x1="${X - dx/2}" y1="${Y - dy/2}" x2="${X + dx/2}" y2="${Y + dy/2}" stroke="#E11D48" stroke-width="2.2" opacity=".7"/><circle cx="${X + dx/2}" cy="${Y + dy/2}" r="3.2" fill="#E11D48" opacity=".7"/>`;
        }
      }
      $("#cv-arrows").innerHTML = a;
      $("#cv-status").textContent = !crystal ? "Drag the crystal to the bottom of the beaker" : heat === "off" ? "No heating — the dye only spreads slowly" : `Heating ${heat === "centre" ? "the centre" : "the " + heat + " side"}`;
      ctx.readout([["Heating", heat === "off" ? "off" : heat, heat === "off" ? "" : "warn"], ["Flow", A < .02 ? "still" : A < .5 ? "building" : "steady"], ["Dye", crystal ? parts.length + " traces" : "no crystal"]]);
    }

    ctx.frame(dt => {
      t += dt;
      const goal = heat === "off" ? 0 : 1;
      A += (goal - A)*dt/(goal ? 4 : 6);
      if(crystal && crystal.used < 600){
        const n = Math.min(600 - crystal.used, Math.round(dt*40));
        for(let k = 0; k < n; k++) parts.push({ x:crystal.x + (Math.random() - .5)*.02, y:.97, side:crystal.x < .5 ? 0 : 1, rose:false });
        crystal.used += n;
      }
      const D = .0025;
      parts.forEach(p => {
        const [u, v] = vel(p.x, p.y);
        p.x += u*dt/W + (Math.random() - .5)*D*Math.sqrt(dt*60);
        p.y += v*dt/H + (Math.random() - .5)*D*Math.sqrt(dt*60);
        p.x = Kit.clamp(p.x, .01, .99); p.y = Kit.clamp(p.y, .01, .99);
        if(p.y < .15) p.rose = true;
        if(p.rose && p.y > .6 && (p.x < .5 ? 0 : 1) !== p.side && heat !== "centre") ctx.complete("loop");
      });
      if(heat !== "off" && heat !== "centre" && parts.some(p => p.rose && Math.abs(p.x - (heat === "left" ? .25 : .75)) < .3)) ctx.complete("rise");
      if(crystal && heat === "off" && A < .02){ tStill += dt; if(tStill > 20 && !parts.some(p => p.y < .6)) ctx.complete("still"); } else tStill = 0;
      if(heat === "centre" && A > .6){ centreSeen += dt; if(centreSeen > 8 && parts.some(p => p.rose)) ctx.complete("centre"); }
      draw();
    });

    Kit.dragger(ctx, svg, {
      hit(tg, p){ return tg.closest("#cv-src") ? { p } : null; },
      move(h, p){ $("#cv-src").setAttribute("transform", `translate(${p.x - 760} ${p.y - 360})`); },
      end(h, p){
        $("#cv-src").setAttribute("transform", "");
        if(p.x > B.x0 + 10 && p.x < B.x1 - 10 && p.y > B.top - 40 && p.y < B.bot + 10){ crystal = { x:(p.x - B.x0)/W, used:0 }; parts = []; tStill = 0; draw(); }
      }
    });
    ctx.seg({ label:"Heat under", value:"off", options:[["off","Off"],["left","Left"],["centre","Centre"],["right","Right"]], onChange(v){ heat = v; centreSeen = 0; draw(); } });
    ctx.seg({ label:"Flow arrows", value:false, options:[[false,"Hide"],[true,"Show"]], onChange(v){ arrows = v; } });
    ctx.buttons([{ label:"Fresh beaker of water", onClick(){ crystal = null; parts = []; heat = "off"; A = 0; draw(); ctx.toast("Fresh cold water — choose the heating again"); } }]);
    ctx.html(`<p class="hint">Place the crystal at the bottom, near one side, using a straw or tweezers so the water isn't stirred. Then heat gently under that side.</p>`);
    draw();
  }
});

/* ───────────── GAS PRESSURE AND VOLUME (BOYLE'S LAW) ───────────── */
Lab.register({
  id:"boyle", subject:"physics", level:["igcse","as"], topic:"Thermal physics · Gas pressure", interactive:true,
  title:"Pressure and volume of a gas",
  summary:"Push and pull the plunger of a sealed syringe connected to a pressure gauge, wait for the air to settle, and show that pV is constant.",
  aim:"Investigate how the pressure of a fixed mass of gas at constant temperature depends on its volume.",
  variables:{ iv:"Volume of the trapped air (cm³)", dv:"Pressure (kPa)", cv:["Same mass of air (no leaks)","Constant temperature — wait after each change","Same gauge"] },
  stageTitle:"Sealed syringe and gauge", controlsTitle:"Plunger",
  thumb:`<svg viewBox="0 0 300 140"><rect x="70" y="56" width="170" height="30" rx="4" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="170" y="58" width="8" height="26" fill="#334155"/><rect x="178" y="68" width="90" height="6" fill="#94A3B8"/><rect x="266" y="54" width="8" height="34" fill="#334155"/>
    <path d="M70 71 H40 V40" stroke="#334155" stroke-width="3" fill="none"/><circle cx="40" cy="30" r="22" fill="#F4F6FA" stroke="#334155" stroke-width="2"/><line x1="40" y1="30" x2="54" y2="18" stroke="#DC2626" stroke-width="2"/></svg>`,
  challenges:[
    { id:"six",   title:"Six readings", text:"Record six or more readings, from 25 cm³ or less up to 50 cm³ or more." },
    { id:"const", title:"pV is constant", text:"Enter the value of pV for the trapped air." },
    { id:"pred",  title:"Predict", text:"Predict the pressure when the air is squashed to 20 cm³." },
    { id:"fast",  title:"Too fast", text:"Push the plunger in quickly and watch the pressure drift down as the air cools back to room temperature." }
  ],
  columns:[{key:"V",label:"Volume / cm³",dp:1},{key:"p",label:"Pressure / kPa",dp:0},{key:"inv",label:"1/V / cm⁻³",dp:4},{key:"pV",label:"pV / kPa cm³",dp:0}],
  graph:{ x:["V","inv"], y:["p","pV"], fit:"curve" },
  questions:[
    { q:"State the relationship between the pressure and volume of a fixed mass of gas at constant temperature.",
      a:"Pressure is inversely proportional to volume: pV = constant (p₁V₁ = p₂V₂)." },
    { q:"Explain, using particles, why the pressure increases when the gas is compressed.",
      a:"The same number of particles is in a smaller space, so they hit the walls more often. More collisions per second on each unit area of wall means a larger force per unit area — a higher pressure." },
    { q:"Why must you wait after moving the plunger before taking a reading?",
      a:"Compressing the gas quickly does work on it and warms it, raising the pressure above its constant-temperature value. Waiting lets it cool back to room temperature." },
    { q:"How can you show from your results that p is inversely proportional to V?",
      a:"Plot p against 1/V: it is a straight line through the origin. Or show that p × V gives the same value for every reading." },
    { q:"A gas at 100 kPa occupies 60 cm³. What is its pressure at 40 cm³ (same temperature)?",
      a:"p₂ = p₁V₁/V₂ = 100 × 60 ÷ 40 = 150 kPa." }
  ],
  setup(ctx){
    const S = 6, NOZ = 220, VMAX = 60, VMIN = 12;
    const V0 = 50, P0 = Kit.round(100.5 + Math.random()*2, 1), K = P0*V0, GAM = 1.4;
    let V = V0, exc = 0, labels = true;
    const pres = () => K/V*(1 + exc);
    const plX = () => NOZ + V*S;

    let scale = "";
    for(let v = 0; v <= VMAX; v++){ const x = NOZ + v*S, L = v % 10 === 0 ? 12 : v % 5 === 0 ? 8 : 4; scale += `<line x1="${x}" y1="232" x2="${x}" y2="${232 + L}" stroke="var(--txt2)" stroke-width=".8"/>`; if(v % 10 === 0) scale += `<text x="${x}" y="${256}" text-anchor="middle" class="k-num">${v}</text>`; }
    let dial = "";
    for(let k = 0; k <= 400; k += 10){ const a = (-225 + k/400*270)*Math.PI/180, r1 = k % 50 === 0 ? 62 : 68, c = Math.cos(a), s = Math.sin(a); dial += `<line x1="${c*r1}" y1="${s*r1}" x2="${c*74}" y2="${s*74}" stroke="#111827" stroke-width="${k % 50 === 0 ? 1.6 : .8}"/>`; if(k % 50 === 0) dial += `<text x="${c*50}" y="${s*50 + 3.5}" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#111827">${k}</text>`; }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="by-svg"><defs>${Kit.DEFS}<clipPath id="by-clip"><rect id="by-cr" x="${NOZ}" y="176" height="48"/></clipPath></defs>
      ${Kit.bench(960, 440)}
      <path d="M100 200 H${NOZ - 30}" stroke="#475569" stroke-width="6" fill="none"/>
      <g transform="translate(100 150)"><circle r="84" fill="#F4F6FA" stroke="#334155" stroke-width="4"/>${dial}<text y="30" text-anchor="middle" style="font:700 10px Inter;fill:#334155">kPa</text><line id="by-needle" x1="0" y1="0" stroke="#DC2626" stroke-width="2.6" stroke-linecap="round"/><circle r="6" fill="#334155"/></g>
      <rect x="${NOZ - 30}" y="194" width="30" height="12" fill="#94A3B8" stroke="#475569"/>
      <g clip-path="url(#by-clip)"><g id="by-air"></g></g>
      <rect x="${NOZ}" y="174" width="${VMAX*S + 30}" height="52" rx="4" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2"/>
      <rect x="${NOZ + VMAX*S + 30}" y="160" width="10" height="80" rx="3" fill="#CBD5E1" stroke="#475569"/>
      <g id="by-plunger" class="k-drag"></g>
      ${scale}<text x="${NOZ + 30*S}" y="276" text-anchor="middle" class="k-lbl">volume of trapped air / cm³</text>
      <rect x="380" y="290" width="12" height="150" fill="url(#k-metal)"/><rect x="340" y="226" width="92" height="12" fill="url(#k-metal)"/>
      <text x="24" y="34" class="k-status" id="by-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#by-svg"), $ = s => svg.querySelector(s);
    const dots = []; for(let i = 0; i < 70; i++) dots.push([Math.random(), Math.random(), Math.random()*Math.PI*2]);

    function draw(){
      const p = pres(), x = plX();
      const a = (-225 + Kit.clamp(p, 0, 400)/400*270)*Math.PI/180;
      $("#by-needle").setAttribute("x2", Math.cos(a)*64); $("#by-needle").setAttribute("y2", Math.sin(a)*64);
      $("#by-cr").setAttribute("width", Math.max(0, x - NOZ));
      const ROD = (VMAX - VMIN)*S + 40;
      $("#by-plunger").innerHTML = `<rect x="${x}" y="176" width="10" height="48" fill="#1F2937"/><rect x="${x + 10}" y="194" width="${ROD}" height="12" fill="#94A3B8" stroke="#475569"/>
        <rect x="${x + 10 + ROD}" y="164" width="14" height="72" rx="4" fill="#334155"/>
        <rect x="${x - 10}" y="150" width="${ROD + 44}" height="100" fill="transparent"/>`;
      $("#by-air").innerHTML = dots.map(([u, v, ph]) => `<circle cx="${NOZ + 4 + u*(x - NOZ - 8)}" cy="${180 + v*40}" r="2.2" fill="#60A5FA" opacity=".8"/>`).join("") + (exc > .005 ? `<rect x="${NOZ}" y="176" width="${x - NOZ}" height="48" fill="#F97316" opacity="${Kit.clamp(exc*4, 0, .35)}"/>` : "");
      const settled = Math.abs(exc) < .004;
      $("#by-status").textContent = !settled ? (exc > 0 ? "Air warmed by compression — wait for the gauge to settle" : "Air cooled by expansion — wait for the gauge to settle") : `Trapped air: ${V.toFixed(0)} cm³ — gauge steady`;
      ctx.readout([["Volume", labels ? V.toFixed(0) + " cm³" : "read the syringe"], ["Pressure", labels ? Math.round(p) + " kPa" : "read the gauge", settled ? "good" : "warn"], ["Air", settled ? "room temperature" : exc > 0 ? "warm" : "cool"]]);
    }
    ctx.frame(dt => {
      if(Math.abs(exc) > 1e-5){ exc *= Math.exp(-dt/1.6); draw(); }
      if(exc > .05) ctx.complete("fast");
    });
    Kit.dragger(ctx, svg, {
      hit(t, p){ return t.closest("#by-plunger") ? { ox:plX() - p.x } : null; },
      move(h, p){
        const nV = Kit.clamp(Kit.snap((p.x + h.ox - NOZ)/S, 1), VMIN, VMAX);
        if(nV !== V){ exc += -(GAM - 1)*(nV - V)/V*.9; V = nV; draw(); }
      }
    });
    ctx.seg({ label:"Labels", value:true, options:[[true,"Show values"],[false,"Hide — read the scales"]], onChange(v){ labels = v; draw(); } });
    ctx.buttons([{ label:"Record reading", primary:true, block:true, onClick(){
      if(Math.abs(exc) > .004){ ctx.toast("The gauge is still changing — wait for the air to return to room temperature"); return; }
      const p = Math.round(pres() + (Math.random() - .5)*2);
      ctx.record({ V, p, inv:Kit.round(1/V, 4), pV:Math.round(p*V) });
      const vs = ctx.rows().map(r => r.V);
      if(new Set(vs).size >= 6 && Math.min(...vs) <= 25 && Math.max(...vs) >= 50) ctx.complete("six");
    } }]);
    Kit.answer(ctx, "pV for the trapped air / kPa cm³", "e.g. 5000", v => Math.abs(v - K)/K <= .03
      ? (ctx.complete("const"), [true, `Correct — pV ≈ ${Math.round(K)} kPa cm³ for every reading.`]) : [false, "Multiply each pressure by its volume — the products should all be about the same."]);
    Kit.answer(ctx, "Predicted pressure at 20 cm³ / kPa", "e.g. 250", v => Math.abs(v - K/20)/(K/20) <= .03
      ? (ctx.complete("pred"), [true, `Correct — ${Math.round(K/20)} kPa. Push the plunger to 20 cm³ to check.`]) : [false, "Use p₁V₁ = p₂V₂ with any one of your readings."]);
    ctx.html(`<p class="hint">Move the plunger slowly, then wait until the gauge stops moving before recording. The plunger snaps to 1 cm³ marks.</p>`);
    draw();
  }
});
