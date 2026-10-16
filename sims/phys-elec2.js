"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · ELECTRICITY & MAGNETISM (IGCSE)
   Charging by friction · Force on a current-carrying wire · Transformer
══════════════════════════════════════════════════════════════════ */

/* ───────────── ELECTROSTATIC CHARGING BY FRICTION ───────────── */
Lab.register({
  id:"electrostatics", subject:"physics", level:["igcse"], topic:"Electricity · Electric charge", interactive:true,
  title:"Charging by friction",
  summary:"Rub polythene and acetate rods with a cloth, hang one from a thread and bring others near to see like charges repel and unlike charges attract.",
  aim:"Show that insulators can be charged by friction, that there are two kinds of charge, and that like charges repel while unlike charges attract.",
  variables:{ iv:"Which rods (or cloth) are brought together", dv:"Whether the hanging rod is attracted or repelled", cv:["Rods rubbed the same amount","Dry conditions","Rod brought to the same end of the hanging rod"] },
  stageTitle:"View from above: rod hanging on a thread", controlsTitle:"Charges",
  thumb:`<svg viewBox="0 0 300 140"><rect x="40" y="40" width="130" height="12" rx="6" fill="#1F2937" transform="rotate(-14 105 46)"/><circle cx="105" cy="46" r="5" fill="#CBD5E1" stroke="#334155"/>
    <rect x="180" y="20" width="100" height="12" rx="6" fill="#1F2937"/>${[0,1,2,3].map(i=>`<text x="${190+i*22}" y="16" font-size="12" fill="#2563EB" font-family="monospace">−</text><text x="${50+i*26}" y="${34 - i*6}" font-size="12" fill="#2563EB" font-family="monospace">−</text>`).join("")}<rect x="40" y="90" width="80" height="40" rx="6" fill="#B91C1C" opacity=".6"/></svg>`,
  challenges:[
    { id:"repel",   title:"Like charges", text:"Show two rods of the same material repel each other." },
    { id:"attract", title:"Unlike charges", text:"Show a charged polythene rod and a charged acetate rod attract." },
    { id:"cloth",   title:"The cloth is charged too", text:"Show the cloth attracts the rod it was rubbed against." },
    { id:"paper",   title:"Pick up paper", text:"Use a charged rod to pick up small pieces of paper." }
  ],
  columns:[{key:"hung",label:"Hanging rod"},{key:"held",label:"Brought near"},{key:"obs",label:"Observation"}],
  questions:[
    { q:"Explain how rubbing a polythene rod with a cloth charges it.",
      a:"Friction transfers electrons from the cloth to the polythene. The polythene gains electrons and becomes negatively charged; the cloth loses electrons and is left with an equal positive charge. No positive charge moves — only electrons." },
    { q:"How do you know that there are two kinds of charge?",
      a:"Two charged polythene rods repel, and two charged acetate rods repel, but a charged polythene rod attracts a charged acetate rod. So the rods must carry different kinds of charge." },
    { q:"Why does a charged rod attract small uncharged pieces of paper?",
      a:"The charged rod induces charges in the paper: opposite charge is pulled to the near side and like charge pushed to the far side. The near, opposite charge is attracted more strongly than the far charge is repelled, so there is a net attraction." },
    { q:"Why does the experiment work badly on a damp day?",
      a:"Water on the surface conducts, so the charge leaks away from the rods (to the air and through your hand) almost as fast as it is produced." },
    { q:"Why can’t you charge a metal rod by rubbing it while holding it in your hand?",
      a:"Metal is a conductor: any charge produced flows straight through the metal and your body to earth." }
  ],
  setup(ctx){
    const C = { x:470, y:190 }, L = 150;
    const KIND = { poly:{ name:"Polythene", sign:-1, col:"#4B5563" }, acet:{ name:"Acetate", sign:1, col:"#E9DFA8" } };
    let uid = 0, showQ = true, phi = .3, omega = 0, hung = null, held = null, damp = false;
    const items = [];
    const mk = (kind, x, y) => { const o = { id:++uid, kind, x, y, q:0, home:[x, y] }; items.push(o); return o; };
    const rods = [mk("poly", 140, 420), mk("poly", 140, 470), mk("acet", 340, 420), mk("acet", 340, 470)];
    const cloth = { id:++uid, kind:"cloth", x:620, y:440, q:0, home:[620, 440] }; items.push(cloth);
    const bits = []; for(let i = 0; i < 14; i++) bits.push({ x:780 + Math.random()*120, y:420 + Math.random()*60, r:Math.random()*90, on:null, ox:0, oy:0 });
    const nameOf = o => o.kind === "cloth" ? "Cloth" : KIND[o.kind].name;
    const ends = () => [[C.x + L*Math.cos(phi), C.y + L*Math.sin(phi), 1], [C.x - L*Math.cos(phi), C.y - L*Math.sin(phi), -1]];
    const pts = o => o.kind === "cloth" ? [[o.x, o.y, 1]] : [[o.x - 60, o.y, 1/3], [o.x, o.y, 1/3], [o.x + 60, o.y, 1/3]];
    function forceOnEnd(e, src){                         // force on one end (half the hung rod's charge) from a held object
      let fx = 0, fy = 0;
      const qh = hung.q/2, qs = src.q;
      pts(src).forEach(([x, y, w]) => {
        const dx = e[0] - x, dy = e[1] - y, r2 = dx*dx + dy*dy + 900, r = Math.sqrt(r2);
        const coul = 5e4*qh*qs*w/r2, ind = -1.2e4*Math.abs(qs)*w*(Math.abs(qh) < .05 ? 1 : .3)/r2;   // induction always attracts
        fx += (coul + ind)*dx/r; fy += (coul + ind)*dy/r;
      });
      return [fx, fy];
    }

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="es-svg"><defs>${Kit.DEFS}</defs>
      <rect x="0" y="0" width="960" height="520" class="k-bench" opacity=".5"/>
      <circle cx="${C.x}" cy="${C.y}" r="${L + 30}" fill="none" stroke="var(--brd2)" stroke-dasharray="4 6"/>
      <g id="es-hung"></g>
      <rect x="40" y="380" width="380" height="120" rx="12" fill="color-mix(in srgb,var(--bg-card) 75%,transparent)" stroke="var(--brd2)"/><text x="52" y="398" class="k-lbl">rods — drag to the cloth and rub; drop one on the stirrup to hang it</text>
      <rect x="760" y="400" width="170" height="100" rx="10" fill="color-mix(in srgb,var(--bg-card) 75%,transparent)" stroke="var(--brd2)"/><text x="772" y="416" class="k-lbl">scraps of paper</text>
      <g id="es-bits"></g><g id="es-items"></g>
      <text x="24" y="34" class="k-status" id="es-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#es-svg"), $ = s => svg.querySelector(s);
    const qMarks = (q, x0, x1, y) => { if(!showQ || Math.abs(q) < .05) return ""; const n = Math.max(1, Math.round(Math.abs(q)*6)); let s = ""; for(let i = 0; i < n; i++){ const x = x0 + (i + .5)/n*(x1 - x0); s += `<text x="${x}" y="${y}" text-anchor="middle" style="font:700 17px 'JetBrains Mono';fill:${q < 0 ? "#3B82F6" : "#EF4444"}">${q < 0 ? "−" : "+"}</text>`; } return s; };
    function rodSvg(o, x, y){
      const k = KIND[o.kind];
      return `<rect x="${x - 80}" y="${y - 7}" width="160" height="14" rx="7" fill="${k.col}" stroke="#334155"/>${qMarks(o.q, x - 70, x + 70, y - 12)}`;
    }
    function draw(){
      let h = `<g transform="translate(${C.x} ${C.y})"><circle r="16" fill="none" stroke="#94A3B8" stroke-width="3"/><circle r="4" fill="#CBD5E1" stroke="#334155"/></g>`;
      if(hung){
        const a = phi*180/Math.PI;
        h = `<g transform="translate(${C.x} ${C.y}) rotate(${a})"><rect x="${-L}" y="-8" width="${2*L}" height="16" rx="8" fill="${KIND[hung.kind].col}" stroke="#334155" data-hung="1" class="k-drag"/>
          <rect x="-14" y="-12" width="28" height="24" rx="3" fill="none" stroke="#94A3B8" stroke-width="3"/>${qMarks(hung.q, -L + 12, L - 12, -12)}</g><circle cx="${C.x}" cy="${C.y}" r="4" fill="#CBD5E1" stroke="#334155"/>`;
      }
      $("#es-hung").innerHTML = h;
      let s = "";
      items.forEach(o => {
        if(o === hung) return;
        if(o.kind === "cloth") s += `<g data-id="${o.id}" class="k-drag"><rect x="${o.x - 70}" y="${o.y - 45}" width="140" height="90" rx="10" fill="#B91C1C" opacity=".75" stroke="#7F1D1D"/><path d="M${o.x - 60} ${o.y - 20} h120 M${o.x - 60} ${o.y} h120 M${o.x - 60} ${o.y + 20} h120" stroke="#7F1D1D" opacity=".4"/>${qMarks(o.q, o.x - 55, o.x + 55, o.y + 5)}<text x="${o.x}" y="${o.y + 62}" text-anchor="middle" class="k-lbl">cloth</text></g>`;
        else s += `<g data-id="${o.id}" class="k-drag">${rodSvg(o, o.x, o.y)}<rect x="${o.x - 82}" y="${o.y - 18}" width="164" height="34" fill="transparent"/></g>`;
      });
      $("#es-items").innerHTML = s;
      $("#es-bits").innerHTML = bits.map(b => { const x = b.on ? b.on.x + b.ox : b.x, y = b.on ? b.on.y + b.oy : b.y; return `<rect x="${x - 4}" y="${y - 3}" width="8" height="6" fill="#F8FAFC" stroke="#94A3B8" stroke-width=".6" transform="rotate(${b.r} ${x} ${y})"/>`; }).join("");
      $("#es-status").textContent = !hung ? "Rub a rod on the cloth, then drop it on the stirrup to hang it" : held ? `${nameOf(held)} near the hanging ${KIND[hung.kind].name.toLowerCase()} rod` : `${KIND[hung.kind].name} rod hanging — bring something near one end`;
      ctx.readout([["Hanging", hung ? KIND[hung.kind].name : "—"], ["Held", held ? nameOf(held) : "—"], ["Air", damp ? "damp" : "dry", damp ? "warn" : "good"]]);
    }

    let lastObs = null;
    ctx.frame(dt => {
      // charge leaks away slowly (fast in damp air)
      const leak = Math.exp(-dt/(damp ? 2.5 : 400));
      items.forEach(o => o.q *= leak);
      let torque = 0; lastObs = null;
      if(hung && held && held !== hung){
        const es = ends();
        let best = null;
        es.forEach(e => {
          const [fx, fy] = forceOnEnd(e, held), tx = -Math.sin(phi)*e[2], ty = Math.cos(phi)*e[2];
          torque += fx*tx + fy*ty;
          const d = Math.hypot(e[0] - held.x, e[1] - held.y);
          if(!best || d < best.d) best = { d, rad:(fx*(held.x - e[0]) + fy*(held.y - e[1]))/Math.max(1, d), mag:Math.hypot(fx, fy) };
        });
        if(best && best.mag > .3) lastObs = best.rad > 0 ? "Attracted" : "Repelled";
      }
      const alpha = .05*torque - .6*Math.sin(phi - .3) - 1.5*omega;
      omega += alpha*dt; phi += omega*dt;
      // paper scraps jump up to a charged rod held over them
      bits.forEach(b => {
        if(b.on && Math.abs(b.on.q) < .08){ b.x = b.on.x + b.ox; b.y = Math.min(490, b.on.y + b.oy + 20); b.on = null; }
        if(!b.on && held && held.kind !== "cloth" && Math.abs(held.q) > .25 && Math.abs(held.x - b.x) < 80 && b.y - held.y < 70 && b.y > held.y){ b.on = held; b.ox = Kit.clamp(b.x - held.x, -70, 70); b.oy = 8 + Math.random()*4; ctx.complete("paper"); }
      });
      draw();
    });

    Kit.dragger(ctx, svg, {
      hit(t, p){
        if(t.closest("[data-hung]")){ const o = hung; hung = null; o.x = p.x; o.y = p.y; held = o; return { o, ox:0, oy:0 }; }
        const g = t.closest("[data-id]"); if(!g) return null;
        const o = items.find(i => i.id === +g.dataset.id); held = o; return { o, ox:o.x - p.x, oy:o.y - p.y };
      },
      move(h, p){
        const o = h.o, nx = p.x + h.ox, ny = p.y + h.oy;
        // rubbing: a rod dragged over the cloth picks up charge (cloth gets the opposite)
        if(o.kind !== "cloth" && Math.abs(nx - cloth.x) < 110 && Math.abs(ny - cloth.y) < 50){
          const d = Math.hypot(nx - o.x, ny - o.y), dq = Math.min(d/900, 1 - Math.abs(o.q));
          if(dq > 0){ o.q += KIND[o.kind].sign*dq; cloth.q = Kit.clamp(cloth.q - KIND[o.kind].sign*dq, -1, 1); }
        }
        o.x = nx; o.y = ny;
      },
      end(h){
        const o = h.o; held = null;
        if(o.kind !== "cloth" && !hung && Math.hypot(o.x - C.x, o.y - C.y) < 70){ hung = o; phi = .3; omega = 0; return; }
        if(o.y > 360){ o.x = Kit.clamp(o.x, 120, 860); o.y = Kit.clamp(o.y, 400, 480); return; }
        o.x = o.home[0]; o.y = o.home[1];
      }
    });
    const recordNow = () => {
      if(!hung || !held){ ctx.toast("Hang a rod, then hold something near one end"); return; }
      const obs = lastObs || "No effect";
      ctx.record({ hung:KIND[hung.kind].name + (Math.abs(hung.q) > .05 ? (hung.q < 0 ? " (−)" : " (+)") : " (uncharged)"), held:nameOf(held), obs });
      if(obs === "Repelled" && held.kind === hung.kind && Math.abs(held.q) > .1 && Math.abs(hung.q) > .1) ctx.complete("repel");
      if(obs === "Attracted" && held.kind !== "cloth" && held.kind !== hung.kind && Math.abs(held.q) > .1 && Math.abs(hung.q) > .1) ctx.complete("attract");
      if(obs === "Attracted" && held.kind === "cloth" && Math.abs(held.q) > .1 && hung.q*held.q < 0) ctx.complete("cloth");
    };
    const onKey = e => { if((e.key === "r" || e.key === "R") && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) recordNow(); };
    window.addEventListener("keydown", onKey); ctx.cleanup(() => window.removeEventListener("keydown", onKey));
    // holding an object near the hanging rod for a moment records the result
    let holdT = 0, lastKey = "";
    ctx.frame(dt => {
      if(hung && held && lastObs){
        const key = hung.id + ":" + held.id + ":" + lastObs;
        holdT += dt;
        if(holdT > 1.2 && key !== lastKey){ lastKey = key; recordNow(); }
      }else holdT = 0;
    });
    ctx.seg({ label:"Show charges", value:true, options:[[true,"Show"],[false,"Hide"]], onChange(v){ showQ = v; } });
    ctx.seg({ label:"Air", value:false, options:[[false,"Dry"],[true,"Damp"]], onChange(v){ damp = v; } });
    ctx.buttons([{ label:"Discharge everything", onClick(){ items.forEach(o => o.q = 0); } }]);
    ctx.html(`<p class="hint">Drag a rod back and forth over the cloth to rub it. Hold an object near one end of the hanging rod for a moment and the result is recorded automatically (or press R).</p>`);
    draw();
  }
});

/* ───────────── FORCE ON A CURRENT-CARRYING WIRE ───────────── */
Lab.register({
  id:"motoreffect", subject:"physics", level:["igcse","as"], topic:"Electromagnetism · Motor effect", interactive:true,
  title:"Force on a current-carrying wire",
  summary:"Clamp a stiff wire between magnets sitting on a top-pan balance, pass a current and read the force. Reverse the current or the field and predict the direction.",
  aim:"Show that a current-carrying conductor in a magnetic field experiences a force, find how its direction depends on the current and field, and how its size depends on the current and length of wire in the field.",
  variables:{ iv:"Current (A) / length of wire in the field (number of magnets)", dv:"Change in balance reading (g)", cv:["Same magnets and spacing","Wire at right angles to the field","Balance tared with no current"] },
  stageTitle:"Current balance", controlsTitle:"Circuit",
  thumb:`<svg viewBox="0 0 300 140"><rect x="90" y="96" width="120" height="34" rx="5" fill="#334155"/><rect x="100" y="102" width="70" height="16" rx="2" fill="#132A1F"/><text x="164" y="114" text-anchor="end" font-size="10" fill="#7CFFB2" font-family="monospace">+2.31</text>
    <rect x="110" y="58" width="80" height="34" rx="3" fill="#475569"/><rect x="116" y="62" width="30" height="26" fill="#DC2626"/><rect x="154" y="62" width="30" height="26" fill="#DC2626"/><line x1="30" y1="75" x2="270" y2="75" stroke="#C2703D" stroke-width="4"/><path d="M150 50 v-26" stroke="#16A34A" stroke-width="3"/><path d="M144 30 l6 -10 l6 10z" fill="#16A34A"/></svg>`,
  challenges:[
    { id:"predict", title:"Fleming’s left-hand rule", text:"Correctly predict the direction of the force on the wire three times." },
    { id:"current", title:"Force and current", text:"Record the force for five or more currents with the same magnets." },
    { id:"length",  title:"Force and length", text:"Record the force with 1, 2, 3 and 4 magnets at the same current." },
    { id:"B",       title:"Field strength", text:"Use F = BIL to find the magnetic flux density between the magnets." }
  ],
  columns:[{key:"I",label:"Current / A",dp:2},{key:"L",label:"Length in field / cm",dp:1},{key:"dm",label:"Balance change / g",dp:2},{key:"F",label:"Force / mN",dp:1}],
  graph:{ x:["I","L"], y:["F","dm"], fit:"linear" },
  questions:[
    { q:"State Fleming’s left-hand rule.",
      a:"Hold the thumb, first finger and second finger of the left hand at right angles. First finger points along the field (N to S), second finger along the conventional current, and the thumb gives the direction of the force (motion)." },
    { q:"The wire is clamped and cannot move. Why does the balance reading change?",
      a:"By Newton’s third law the wire pushes on the magnets with a force equal and opposite to the force the magnets exert on the wire. If the wire is pushed up, the magnets are pushed down and the balance reading increases." },
    { q:"State two ways of reversing the force on the wire.",
      a:"Reverse the direction of the current, or reverse the direction of the magnetic field (turn the magnets round). Reversing both leaves the force unchanged." },
    { q:"How does the force depend on the current and on the length of wire in the field?",
      a:"The force is proportional to the current and proportional to the length of wire in the field: F = BIL when the wire is at right angles to the field." },
    { q:"Why is the balance tared with no current flowing?",
      a:"So that the reading shows only the change caused by the force between the wire and the magnets, not the weight of the magnets and their holder." }
  ],
  setup(ctx){
    const B = Kit.round(.06 + Math.random()*.06, 3), SEG = 2.5, G = 9.81;
    const M0 = Kit.round(140 + Math.random()*30, 2);
    let n = 2, I = 2, on = false, revI = false, revB = false, tare = 0, noise = 0, guess = null, right = 0;
    const L = () => n*SEG;
    const up = () => (revI ? -1 : 1)*(revB ? -1 : 1);            // +1: force on wire upward
    const Fwire = () => on ? up()*B*I*L()/100 : 0;                // newtons, + up
    const reading = () => M0 + Fwire()/G*1000 - tare + noise;
    const MX = 480, WY = 250;

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="me-svg"><defs>${Kit.DEFS}<marker id="me-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#16A34A"/></marker><marker id="me-ai" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#F59E0B"/></marker></defs>
      ${Kit.bench(960, 480)}
      <rect x="360" y="420" width="240" height="60" rx="10" fill="#334155" stroke="#1F2937"/><rect x="380" y="432" width="140" height="34" rx="5" fill="#132A1F"/><text id="me-bal" x="510" y="457" text-anchor="end" class="k-lcd" style="font-size:18px">0.00 g</text>
      <g class="k-btn" id="me-tare"><rect x="530" y="434" width="56" height="30" rx="7" fill="#0F172A" stroke="#475569"/><text x="558" y="453" text-anchor="middle" style="font:700 10px Inter;fill:#E5E7EB">TARE</text></g>
      <rect x="400" y="404" width="160" height="14" rx="4" fill="url(#k-metal)"/>
      <g id="me-mag"></g>
      <rect x="120" y="70" width="12" height="410" fill="url(#k-metal)"/><rect x="828" y="70" width="12" height="410" fill="url(#k-metal)"/>
      <rect x="126" y="${WY - 10}" width="34" height="20" rx="4" fill="#475569"/><rect x="800" y="${WY - 10}" width="34" height="20" rx="4" fill="#475569"/>
      <g id="me-wire"></g>
      <g transform="translate(40 60)"><rect width="200" height="110" rx="10" fill="#334155" stroke="#1F2937"/><text x="12" y="20" style="font:700 10px Inter;fill:#CBD5E1">DC SUPPLY + AMMETER</text>
        <rect x="12" y="30" width="176" height="34" rx="4" fill="#132A1F"/><text id="me-amm" x="180" y="54" text-anchor="end" class="k-lcd" style="font-size:17px">0.00 A</text>
        <g class="k-btn" id="me-sw"><rect x="12" y="72" width="70" height="28" rx="8" fill="#0F172A" stroke="#475569"/><text id="me-swl" x="47" y="91" text-anchor="middle" style="font:700 11px Inter;fill:#fff">OFF</text></g></g>
      <g id="me-arrows"></g>
      <text x="24" y="34" class="k-status" id="me-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#me-svg"), $ = s => svg.querySelector(s);

    function draw(){
      // magnets: a steel cradle with n pairs of magnets, faces front and back, field into (or out of) the screen
      const w = n*44 + 16, x0 = MX - w/2;
      let m = `<rect x="${x0}" y="${WY + 20}" width="${w}" height="${404 - WY - 20}" rx="4" fill="url(#k-metal)" stroke="#475569"/>`;
      for(let i = 0; i < n; i++){
        const x = x0 + 8 + i*44;
        m += `<rect x="${x}" y="${WY - 34}" width="40" height="${404 - WY + 30}" rx="3" fill="${revB ? "#2563EB" : "#DC2626"}" stroke="#1F2937" opacity=".92"/><text x="${x + 20}" y="${WY - 14}" text-anchor="middle" style="font:700 12px Inter;fill:#fff">${revB ? "S" : "N"}</text>`;
        for(let k = 0; k < 2; k++){ const cx = x + 10 + k*20, cy = WY + 50; m += revB ? `<circle cx="${cx}" cy="${cy}" r="5" fill="none" stroke="#fff" stroke-width="1.4"/><circle cx="${cx}" cy="${cy}" r="1.6" fill="#fff"/>` : `<circle cx="${cx}" cy="${cy}" r="5" fill="none" stroke="#fff" stroke-width="1.4"/><path d="M${cx - 3} ${cy - 3}l6 6M${cx + 3} ${cy - 3}l-6 6" stroke="#fff" stroke-width="1.4"/>`; }
      }
      m += `<text x="${x0 + w + 14}" y="${WY + 54}" class="k-tag">field ${revB ? "out of" : "into"} the screen</text><text x="${x0 + w + 14}" y="${WY + 70}" class="k-lbl">${revB ? "S" : "N"} pole faces you</text>`;
      $("#me-mag").innerHTML = m;
      const flow = on ? `<path d="M${revI ? 760 : 200} ${WY - 14} h${revI ? -60 : 60}" stroke="#F59E0B" stroke-width="3" marker-end="url(#me-ai)"/><text x="${revI ? 690 : 200}" y="${WY - 22}" class="k-tag">current</text>` : "";
      $("#me-wire").innerHTML = `<line x1="150" y1="${WY}" x2="810" y2="${WY}" stroke="#C2703D" stroke-width="6" stroke-linecap="round"/>
        <path d="M150 ${WY} C 100 ${WY} 160 170 ${revI ? 200 : 180} 170" stroke="${revI ? "#64748B" : "#DC2626"}" stroke-width="2.4" fill="none"/><path d="M810 ${WY} C 880 ${WY} 900 120 240 140" stroke="${revI ? "#DC2626" : "#64748B"}" stroke-width="2.4" fill="none"/>
        ${flow}`;
      const F = Fwire();
      $("#me-arrows").innerHTML = on && Math.abs(F) > 1e-5 ? `<line x1="${MX}" y1="${WY + (F > 0 ? -16 : 16)}" x2="${MX}" y2="${WY + (F > 0 ? -70 : 70)}" stroke="#16A34A" stroke-width="4" marker-end="url(#me-ar)"/><text x="${MX + 12}" y="${WY + (F > 0 ? -60 : 74)}" class="k-tag" style="fill:#16A34A">force on wire</text>` : "";
      $("#me-bal").textContent = (reading() >= 0 ? "+" : "") + reading().toFixed(2) + " g";
      $("#me-amm").textContent = (on ? I : 0).toFixed(2) + " A";
      $("#me-swl").textContent = on ? "ON" : "OFF"; $("#me-sw rect").setAttribute("fill", on ? "#16A34A" : "#0F172A");
      $("#me-status").textContent = tare === 0 ? "Press TARE with the current off" : on ? "Current flowing — read the change on the balance" : "Predict the direction of the force, then switch on";
      ctx.readout([["Current", (on ? I : 0).toFixed(1) + " A"], ["Magnets", `${n} (${L().toFixed(1)} cm of wire)`], ["Field", revB ? "out of screen" : "into screen"], ["Balance", reading().toFixed(2) + " g", on ? "good" : ""]]);
    }
    ctx.every(500, () => { noise = (Math.random() - .5)*.02; draw(); });
    Kit.dragger(ctx, svg, {
      hit(t){
        if(t.closest("#me-tare")){ if(on){ ctx.toast("Tare with the current switched off"); return null; } tare = M0; draw(); return null; }
        if(t.closest("#me-sw")){
          if(!on && guess){ const ok = (guess === "up") === (up() > 0); if(ok){ right++; if(right >= 3) ctx.complete("predict"); } ctx.toast(ok ? "Prediction correct ✓" : "Not this time — use Fleming’s left-hand rule"); predict.set(null); guess = null; }
          on = !on; draw();
        }
        return null;
      }
    });
    const predict = ctx.seg({ label:"Predict: the wire will be pushed…", value:null, options:[["up","Up"],["down","Down"]], onChange(v){ guess = v; } });
    ctx.slider({ label:"Current", min:.5, max:5, step:.5, value:I, unit:"A", fmt:v => v.toFixed(1), onInput(v){ I = v; draw(); } });
    ctx.seg({ label:"Magnets in the cradle", value:2, options:[[1,"1"],[2,"2"],[3,"3"],[4,"4"]], onChange(v){ if(on){ ctx.toast("Switch off first"); return; } n = v; tare = 0; draw(); ctx.toast("Magnets changed — tare the balance again"); } });
    ctx.buttons([{ label:"Reverse current", onClick(){ revI = !revI; draw(); } }, { label:"Turn magnets round", onClick(){ if(on){ ctx.toast("Switch off first"); return; } revB = !revB; draw(); } }]);
    ctx.buttons([{ label:"Record reading", primary:true, block:true, onClick(){
      if(tare === 0){ ctx.toast("Tare the balance (current off) first"); return; }
      if(!on){ ctx.toast("Switch the current on"); return; }
      const dm = Kit.round(reading(), 2);
      ctx.record({ I, L:L(), dm, F:Kit.round(Math.abs(dm)*G, 1) });
      const rows = ctx.rows(), byL = {}, byI = {};
      rows.forEach(r => { (byL[r.L] = byL[r.L] || new Set()).add(r.I); (byI[r.I] = byI[r.I] || new Set()).add(r.L); });
      if(Object.values(byL).some(s => s.size >= 5)) ctx.complete("current");
      if(Object.values(byI).some(s => s.size >= 4)) ctx.complete("length");
    } }]);
    Kit.answer(ctx, "Magnetic flux density B / T", "e.g. 0.08", v => Math.abs(v - B)/B <= .06
      ? (ctx.complete("B"), [true, `Correct — B ≈ ${B.toFixed(3)} T.`]) : [false, "Plot F (in N) against I for one length: B = gradient ÷ L, with L in metres."]);
    draw();
  }
});

/* ───────────── THE TRANSFORMER ───────────── */
Lab.register({
  id:"transformer", subject:"physics", level:["igcse"], topic:"Electromagnetism · Transformers", interactive:true,
  title:"Transformer turns ratio",
  summary:"Slide coils with different numbers of turns onto a C-core, connect the primary to an a.c. supply and measure the secondary voltage. Try d.c. and an open core too.",
  aim:"Investigate how the output voltage of a transformer depends on the numbers of turns on the primary and secondary coils, and why it needs a.c. and an iron core.",
  variables:{ iv:"Number of turns on the secondary (and primary) coil", dv:"Secondary (output) voltage (V)", cv:["Same primary voltage","Closed laminated iron core","Same a.c. supply frequency"] },
  stageTitle:"Demountable transformer", controlsTitle:"Coils and supply",
  thumb:`<svg viewBox="0 0 300 140"><path d="M90 20 h120 v100 h-120z M110 40 v60 h80 v-60z" fill="#64748B" fill-rule="evenodd"/>${Array.from({length:8},(_,i)=>`<ellipse cx="100" cy="${42+i*8}" rx="18" ry="4" fill="none" stroke="#D97706" stroke-width="2.5"/>`).join("")}${Array.from({length:4},(_,i)=>`<ellipse cx="200" cy="${52+i*12}" rx="18" ry="4" fill="none" stroke="#2563EB" stroke-width="2.5"/>`).join("")}<circle cx="260" cy="70" r="12" fill="#FDE68A" stroke="#92400E"/></svg>`,
  challenges:[
    { id:"down",  title:"Step-down", text:"Record a step-down transformer (output voltage less than input)." },
    { id:"up",    title:"Step-up", text:"Record a step-up transformer." },
    { id:"ratio", title:"Turns ratio", text:"Record five or more different turns ratios with a closed core." },
    { id:"dc",    title:"Try d.c.", text:"Switch on with a d.c. supply and watch the output." },
    { id:"core",  title:"Why iron?", text:"Record the same coils with a closed core and with the top bar removed." },
    { id:"calc",  title:"Design one", text:"Work out the secondary turns needed for a 3.0 V lamp from 12 V with 400 primary turns." }
  ],
  columns:[{key:"core",label:"Core"},{key:"Np",label:"Np",dp:0},{key:"Ns",label:"Ns",dp:0},{key:"Vp",label:"Vp / V",dp:1},{key:"Vs",label:"Vs / V",dp:2},{key:"rn",label:"Ns/Np",dp:2},{key:"rv",label:"Vs/Vp",dp:2}],
  series:"core",
  graph:{ x:["rn"], y:["rv","Vs"], fit:"linear" },
  questions:[
    { q:"State the transformer equation.",
      a:"Vp/Vs = Np/Ns — the ratio of the voltages equals the ratio of the numbers of turns." },
    { q:"Explain why a transformer does not work with a steady d.c. supply.",
      a:"A steady current produces a steady magnetic field in the core. An e.m.f. is only induced in the secondary when the magnetic field through it changes, so there is an output only for an instant as the d.c. is switched on or off." },
    { q:"Why is the output much smaller when the top bar of the core is removed?",
      a:"The iron core links the magnetic field of the primary to the secondary. With a gap, much of the field spreads out into the air and does not pass through the secondary coil, so less e.m.f. is induced." },
    { q:"A transformer has 200 turns on the primary and 50 on the secondary. The input is 240 V. Find the output voltage.",
      a:"Vs = Vp × Ns/Np = 240 × 50/200 = 60 V. It is a step-down transformer." },
    { q:"Why are the measured output voltages slightly lower than the turns ratio predicts?",
      a:"Real transformers lose some energy — heating in the coil resistance, eddy currents in the core, and some magnetic field not linking both coils — so the efficiency is a little below 100%." }
  ],
  setup(ctx){
    const TURNS = [100, 200, 300, 400, 500, 600, 800, 1000];
    const EFF = { closed:.965, open:.42, none:.05 };
    let Np = 400, Ns = 200, Vp = 6, core = "closed", supply = "ac", on = false, kick = 0, t = 0, needle = 0;
    const ideal = () => Vp*Ns/Np*EFF[core]*(1 - .012*Vp/12);
    const Vs = () => !on ? 0 : supply === "ac" ? ideal() : 0;

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="tf-svg"><defs>${Kit.DEFS}
        <pattern id="tf-lam" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#6B7486"/><line x1="0" y1="0" x2="0" y2="6" stroke="#4B5563" stroke-width="1"/></pattern></defs>
      ${Kit.bench(960, 470)}
      <g id="tf-core"></g><g id="tf-flux"></g><g id="tf-coils"></g>
      <g transform="translate(30 150)"><rect width="180" height="150" rx="12" fill="#334155" stroke="#1F2937"/><text x="12" y="22" style="font:700 10px Inter;fill:#CBD5E1">LOW-VOLTAGE SUPPLY</text>
        <rect x="12" y="32" width="156" height="38" rx="5" fill="#132A1F"/><text id="tf-sup" x="160" y="59" text-anchor="end" class="k-lcd" style="font-size:18px">6 V a.c.</text>
        <g class="k-btn" id="tf-sw"><rect x="12" y="84" width="70" height="30" rx="8" fill="#0F172A" stroke="#475569"/><text id="tf-swl" x="47" y="104" text-anchor="middle" style="font:700 11px Inter;fill:#fff">OFF</text></g></g>
      <g transform="translate(700 80)"><rect width="190" height="104" rx="12" fill="#FACC15" stroke="#A16207"/><rect x="12" y="12" width="166" height="44" rx="5" fill="#132A1F"/>
        <text id="tf-vm" x="168" y="44" text-anchor="end" class="k-lcd">0.00</text><text x="20" y="78" style="font:700 11px Inter;fill:#422006">VOLTMETER · V a.c.</text><text x="20" y="94" style="font:500 9px Inter;fill:#713F12">across the secondary coil</text></g>
      <g id="tf-lamp" transform="translate(790 330)"></g>
      <path id="tf-wires" fill="none" stroke-width="2.4"/>
      <text x="24" y="34" class="k-status" id="tf-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#tf-svg"), $ = s => svg.querySelector(s);
    const LX = 330, RX = 590, TOP = 120, BOT = 420, LIMB = 46;
    function coil(x, N, col){
      const shown = Math.max(3, Math.round(N/40)), h = 150, y0 = 270 - h/2, sp = h/shown;
      let s = `<rect x="${x - LIMB/2 - 12}" y="${y0 - 8}" width="${LIMB + 24}" height="${h + 16}" rx="4" fill="#1F2937" opacity=".85"/>`;
      for(let k = 0; k < shown; k++) s += `<ellipse cx="${x}" cy="${y0 + (k + .5)*sp}" rx="${LIMB/2 + 10}" ry="5" fill="none" stroke="${col}" stroke-width="${Math.min(5, Math.max(1.5, sp*.7))}"/>`;
      return s;
    }
    function draw(){
      let c = "";
      if(core !== "none"){
        c += `<rect x="${LX - LIMB/2}" y="${TOP + 40}" width="${LIMB}" height="${BOT - TOP - 40}" fill="url(#tf-lam)"/><rect x="${RX - LIMB/2}" y="${TOP + 40}" width="${LIMB}" height="${BOT - TOP - 40}" fill="url(#tf-lam)"/>
          <rect x="${LX - LIMB/2}" y="${BOT - LIMB}" width="${RX - LX + LIMB}" height="${LIMB}" fill="url(#tf-lam)"/>`;
        c += core === "closed" ? `<rect x="${LX - LIMB/2}" y="${TOP}" width="${RX - LX + LIMB}" height="${LIMB}" fill="url(#tf-lam)"/><rect x="${LX - LIMB/2 - 6}" y="${TOP - 6}" width="${RX - LX + LIMB + 12}" height="8" rx="2" fill="#475569"/>`
          : `<rect x="${LX - LIMB/2}" y="482" width="${RX - LX + LIMB}" height="22" fill="url(#tf-lam)"/><text x="${RX + LIMB/2 + 10}" y="498" class="k-lbl">top bar (removed)</text>`;
      }else c += `<rect x="${LX - 12}" y="${TOP + 40}" width="24" height="${BOT - TOP - 40}" fill="#D9B07A" opacity=".5"/><rect x="${RX - 12}" y="${TOP + 40}" width="24" height="${BOT - TOP - 40}" fill="#D9B07A" opacity=".5"/>`;
      $("#tf-core").innerHTML = c;
      $("#tf-coils").innerHTML = coil(LX, Np, "#D97706") + coil(RX, Ns, "#2563EB") + `<text x="${LX}" y="100" text-anchor="middle" class="k-tag">primary · ${Np} turns</text><text x="${RX}" y="100" text-anchor="middle" class="k-tag">secondary · ${Ns} turns</text>`;
      // flux in the core (animated dashes, reversing with the a.c.)
      const fl = on && core !== "none" && (supply === "ac" || kick > .05);
      $("#tf-flux").innerHTML = fl ? `<rect x="${LX}" y="${TOP + LIMB/2}" width="${RX - LX}" height="${BOT - TOP - LIMB}" fill="none" stroke="#F97316" stroke-width="2" stroke-dasharray="10 8" stroke-dashoffset="${(supply === "ac" ? Math.sin(t*6)*40 : t*30).toFixed(1)}" opacity="${core === "closed" ? .9 : .35}"/>` : "";
      $("#tf-vm").textContent = needle.toFixed(needle < 100 ? 2 : 1);
      const glow = Kit.clamp(Math.pow(needle/6, 2), 0, 1.4);
      $("#tf-lamp").innerHTML = `${glow > .03 ? `<circle r="${30 + glow*30}" fill="url(#k-glow)" opacity="${Math.min(1, glow)}"/>` : ""}<circle r="20" fill="${glow > .05 ? "#FEF3C7" : "#E5E7EB"}" stroke="#92400E" stroke-width="1.5" opacity=".9"/><path d="M-6 6 q6 -14 12 0" stroke="#92400E" fill="none"/><rect x="-9" y="18" width="18" height="12" fill="#94A3B8"/><text y="48" text-anchor="middle" class="k-lbl">6 V lamp</text>`;
      $("#tf-wires").setAttribute("d", `M210 230 C 260 230 ${LX - 40} 200 ${LX - LIMB/2 - 12} 210 M210 260 C 260 260 ${LX - 40} 330 ${LX - LIMB/2 - 12} 330 M${RX + LIMB/2 + 12} 210 C 660 200 690 190 720 184 M${RX + LIMB/2 + 12} 330 C 700 340 760 370 770 340`);
      $("#tf-wires").setAttribute("stroke", "#DC2626");
      $("#tf-sup").textContent = `${Vp} V ${supply === "ac" ? "a.c." : "d.c."}`;
      $("#tf-swl").textContent = on ? "ON" : "OFF"; $("#tf-sw rect").setAttribute("fill", on ? "#16A34A" : "#0F172A");
      $("#tf-status").textContent = !on ? "Choose the coils, then switch on" : supply === "dc" ? "d.c. — the meter only flicks as you switch on or off" : `Output ${needle.toFixed(1)} V${needle > 30 ? " — over 30 V is not safe in a school lab: use fewer secondary turns" : needle > 9 ? " — the 6 V lamp is overrun!" : ""}`;
      ctx.readout([["Np", String(Np)], ["Ns", String(Ns)], ["Core", { closed:"closed iron", open:"top bar off", none:"no iron" }[core]], ["Supply", `${Vp} V ${supply === "ac" ? "a.c." : "d.c."}`], ["Output", on ? needle.toFixed(1) + " V" : "—", on ? "good" : ""]]);
    }
    ctx.frame(dt => {
      t += dt;
      kick *= Math.exp(-dt/.12);
      const target = Vs() + kick*ideal()*.6;
      needle += (target - needle)*Math.min(1, dt*8);
      draw();
    });
    Kit.dragger(ctx, svg, { hit(tg){
      if(tg.closest("#tf-sw")){ on = !on; if(supply === "dc"){ kick = 1; ctx.complete("dc"); } draw(); }
      return null;
    } });
    const offFirst = () => { if(on){ ctx.toast("Switch off before changing the coils or core"); return true; } return false; };
    const sel = (label, get, set) => { const c = ctx.select({ label, value:String(get()), options:TURNS.map(n => [String(n), n + " turns"]), onChange(v){ if(offFirst()){ c.set(String(get())); return; } set(+v); draw(); } }); return c; };
    sel("Primary coil", () => Np, v => Np = v);
    sel("Secondary coil", () => Ns, v => Ns = v);
    ctx.slider({ label:"Supply voltage", min:2, max:12, step:2, value:Vp, unit:"V", onInput(v){ Vp = v; draw(); } });
    ctx.seg({ label:"Supply", value:"ac", options:[["ac","a.c."],["dc","d.c."]], onChange(v){ if(on){ kick = 1; } supply = v; if(v === "dc" && on) ctx.complete("dc"); draw(); } });
    ctx.seg({ label:"Core", value:"closed", options:[["closed","Closed iron"],["open","Top bar off"],["none","No iron"]], onChange(v){ core = v; draw(); } });
    ctx.buttons([{ label:"Record output", primary:true, block:true, onClick(){
      if(!on){ ctx.toast("Switch on first"); return; }
      if(supply === "dc"){ ctx.toast("With d.c. there is no steady output to record — switch to a.c."); return; }
      const vs = Kit.round(Vs() + (Math.random() - .5)*.02*Math.max(1, Vs()), 2);
      const name = { closed:"Closed core", open:"Top bar off", none:"No iron" }[core];
      ctx.record({ core:name, Np, Ns, Vp, Vs:vs, rn:Kit.round(Ns/Np, 2), rv:Kit.round(vs/Vp, 2) });
      const rows = ctx.rows(), cl = rows.filter(r => r.core === "Closed core");
      if(cl.some(r => r.Vs < r.Vp)) ctx.complete("down");
      if(cl.some(r => r.Vs > r.Vp)) ctx.complete("up");
      if(new Set(cl.map(r => r.rn)).size >= 5) ctx.complete("ratio");
      const key = r => r.Np + "/" + r.Ns + "/" + r.Vp;
      if(cl.some(r => rows.some(o => o.core === "Top bar off" && key(o) === key(r)))) ctx.complete("core");
    } }]);
    Kit.answer(ctx, "Secondary turns for 3.0 V from 12 V (Np = 400)", "e.g. 100", v => v === 100
      ? (ctx.complete("calc"), [true, "Correct — Ns = 400 × 3/12 = 100 turns. Try it!"]) : [false, "Use Vs/Vp = Ns/Np, so Ns = Np × Vs/Vp."]);
    draw();
  }
});
