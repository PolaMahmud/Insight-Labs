"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · MOMENTS (IGCSE) — metre rule on a pivot
   Drag slotted masses onto the rule, slide them along, move the pivot.
   The rule tilts until the clockwise and anticlockwise moments balance.
══════════════════════════════════════════════════════════════════ */
Lab.register({
  id:"moments", subject:"physics", level:["igcse","as"], topic:"Forces · Moments", interactive:true,
  title:"Principle of moments",
  summary:"Hang masses on a metre rule balanced on a pivot, balance it, find an unknown mass and the rule’s centre of gravity.",
  aim:"Verify the principle of moments and use it to find an unknown mass and the centre of gravity of a metre rule.",
  variables:{ iv:"Position of the masses (distance from the pivot)", dv:"Whether the rule balances", cv:["Same metre rule","Masses hung from thin loops so distances are exact","Pivot position (unless finding the centre of gravity)"] },
  stageTitle:"Metre rule on a pivot", controlsTitle:"Moments",
  thumb:`<svg viewBox="0 0 300 140"><rect x="30" y="54" width="240" height="10" rx="2" fill="#D9B07A"/><path d="M150 64l-12 22h24z" fill="#64748B"/>
    <line x1="70" y1="64" x2="70" y2="86" stroke="#A2ACBD"/><rect x="58" y="86" width="24" height="18" rx="3" fill="#94A3B8"/><line x1="230" y1="64" x2="230" y2="86" stroke="#A2ACBD"/><rect x="222" y="86" width="16" height="12" rx="3" fill="#94A3B8"/></svg>`,
  challenges:[
    { id:"two",   title:"Balance two masses", text:"Balance the rule with one mass on each side of the centre pivot." },
    { id:"three", title:"Three masses", text:"Balance the rule with three or more masses." },
    { id:"x",     title:"Find mass X", text:"Use the principle of moments to find the unknown mass X." },
    { id:"cg",    title:"Centre of gravity", text:"Find the centre of gravity of the rule (no masses)." },
    { id:"off",   title:"Off-centre pivot", text:"Balance the rule with the pivot at least 10 cm from the centre — the rule’s own weight now matters." }
  ],
  columns:[{key:"left",label:"Left side"},{key:"mL",label:"Σ anticlockwise / g cm",dp:0},{key:"right",label:"Right side"},{key:"mR",label:"Σ clockwise / g cm",dp:0},{key:"p",label:"Pivot / cm",dp:1}],
  graph:{ x:["mL"], y:["mR"], fit:"linear" },
  questions:[
    { q:"State the principle of moments.",
      a:"For an object in equilibrium, the sum of the clockwise moments about any point equals the sum of the anticlockwise moments about that point." },
    { q:"A 100 g mass is 20 cm left of the pivot. Where must a 50 g mass go to balance it?",
      a:"100 × 20 = 50 × d, so d = 40 cm to the right of the pivot." },
    { q:"Why are moments measured in g cm here rather than N m?",
      a:"g is the same on both sides, so it cancels — mass × distance can be compared directly. To get N m, convert mass to weight (× 9.8 N/kg ÷ 1000) and cm to m." },
    { q:"When the pivot is not at the centre of gravity, why don’t the moments of the hung masses balance?",
      a:"The weight of the rule acts at its centre of gravity and also has a moment about the pivot. It must be included: Σ clockwise = Σ anticlockwise including the rule’s weight." },
    { q:"Give two conditions for an object to be in equilibrium.",
      a:"The resultant force is zero, and the resultant moment (turning effect) about any point is zero." }
  ],
  setup(ctx){
    const X0 = 80, S = 8, AY = 230, TOL = 20, RULE_M = 100;
    const cg = Kit.round(50 + (Math.random() < .5 ? -1 : 1)*(0.5 + Math.random()*1), 1);
    const xMass = 5*Math.round((60 + Math.random()*110)/5);
    let p = 50, theta = 0, hangers = [], uid = 0, showD = true;
    const SRC = [{ m:50, lbl:"50 g" }, { m:100, lbl:"100 g" }, { m:200, lbl:"200 g" }, { m:xMass, lbl:"X", isX:true }];
    const torque = () => hangers.reduce((t, h) => t + h.m*(h.x - p), 0) + RULE_M*(cg - p);
    const balanced = () => Math.abs(torque()) <= TOL;
    const th = () => theta*Math.PI/180;
    const at = x => { const dx = X0 + x*S - (X0 + p*S); return [X0 + p*S + dx*Math.cos(th()), AY + dx*Math.sin(th())]; };

    let ticks = "";
    for(let c = 0; c <= 100; c++){ const x = X0 + c*S, L = c % 10 === 0 ? 9 : c % 5 === 0 ? 6 : 3; ticks += `<line x1="${x}" y1="212" x2="${x}" y2="${212 + L}" stroke="#4B3621" stroke-width=".8"/>`; if(c % 10 === 0) ticks += `<text x="${x}" y="${226}" text-anchor="middle" style="font:600 7px 'JetBrains Mono';fill:#4B3621">${c}</text>`; }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="mo-svg"><defs>${Kit.DEFS}</defs>
      ${Kit.bench(960, 460)}
      <rect id="mo-stand" y="262" width="60" height="198" fill="url(#k-metal)"/>
      <g id="mo-rule"><rect x="${X0}" y="212" width="${100*S}" height="18" rx="2" fill="url(#k-wood)" stroke="#7B4F2C"/>${ticks}</g>
      <g id="mo-pivot" class="k-drag"><path id="mo-tri" fill="#64748B" stroke="#334155"/></g>
      <g id="mo-hang"></g>
      <g id="mo-tray"><rect x="90" y="368" width="440" height="78" rx="12" fill="color-mix(in srgb,var(--bg-card) 80%,transparent)" stroke="var(--brd2)"/>
        <text x="100" y="384" class="k-lbl">masses — drag onto the rule</text>
        ${SRC.map((s, i) => `<g data-src="${i}" class="k-drag" transform="translate(${150 + i*100} 400)"><rect x="-34" y="-14" width="68" height="62" rx="8" fill="transparent"/>${massSvg(s)}<text y="40" text-anchor="middle" class="k-tag">${s.lbl}</text></g>`).join("")}</g>
      <g id="mo-bubble" transform="translate(760 80)"><rect x="-80" y="-18" width="160" height="36" rx="18" fill="#D1FAE5" stroke="#6EE7B7" opacity=".9"/><circle id="mo-bub" r="11" fill="#fff" opacity=".9"/><line x1="-14" y1="-18" x2="-14" y2="18" stroke="#047857"/><line x1="14" y1="-18" x2="14" y2="18" stroke="#047857"/></g>
      <text x="24" y="34" class="k-status" id="mo-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#mo-svg"), $ = s => svg.querySelector(s);
    function massSvg(s){
      if(s.isX) return `<rect x="-16" y="0" width="32" height="26" rx="4" fill="#7C3AED" stroke="#4C1D95"/><text y="18" text-anchor="middle" style="font:700 12px Inter;fill:#fff">X</text>`;
      const n = s.m/50, h = 5;
      let g = `<line x1="0" y1="-6" x2="0" y2="0" stroke="#94A3B8" stroke-width="2"/>`;
      for(let i=0;i<n;i++) g += `<rect x="-15" y="${i*h}" width="30" height="${h - .6}" rx="1.5" fill="url(#k-metal)" stroke="#475569" stroke-width=".5"/>`;
      return g;
    }

    function draw(){
      $("#mo-rule").setAttribute("transform", `rotate(${theta} ${X0 + p*S} ${AY})`);
      const px = X0 + p*S;
      $("#mo-tri").setAttribute("d", `M${px} ${AY} L${px - 16} 262 H${px + 16} Z`);
      $("#mo-stand").setAttribute("x", px - 30);
      let h = "";
      hangers.forEach(g => {
        const [ax, ay] = g.drag ? [g.dx, g.dy - 40] : at(g.x);
        h += `<g data-hid="${g.id}" class="k-drag"><line x1="${ax}" y1="${ay}" x2="${ax}" y2="${ay + 36}" stroke="#CBD5E1" stroke-width="1.2"/><circle cx="${ax}" cy="${ay + 1}" r="3" fill="none" stroke="#CBD5E1"/>
          <g transform="translate(${ax} ${ay + 42})">${massSvg(g)}</g><rect x="${ax - 20}" y="${ay - 8}" width="40" height="${50 + g.m/10}" fill="transparent"/></g>`;
        if(showD && !g.drag) h += `<text x="${ax}" y="${ay + 62 + (g.isX ? 6 : g.m/50*5)}" text-anchor="middle" class="k-read" style="font-size:11px">${Math.abs(g.x - p).toFixed(1)} cm</text>`;
      });
      $("#mo-hang").innerHTML = h;
      const t = torque(), bal = Math.abs(t) <= TOL;
      $("#mo-bub").setAttribute("cx", Kit.clamp(-theta*7, -66, 66));
      $("#mo-status").textContent = bal ? "Balanced ✓ — the rule is level" : t > 0 ? "Clockwise moment is bigger — the right side goes down" : "Anticlockwise moment is bigger — the left side goes down";
      ctx.readout([["Pivot", p.toFixed(1) + " cm"], ["Masses", String(hangers.length)], ["Rule", bal ? "level" : "tilting", bal ? "good" : "warn"]]);
    }
    ctx.frame(dt => {
      const t = torque(), target = Math.abs(t) <= TOL ? 0 : Kit.clamp(t*0.022, -9, 9);
      const nt = theta + (target - theta)*Math.min(1, dt*5);
      if(Math.abs(nt - theta) > 1e-3){ theta = nt; draw(); }
    });

    Kit.dragger(ctx, svg, {
      hit(t){
        const hg = t.closest("[data-hid]"); if(hg) return { kind:"h", g:hangers.find(g => g.id === +hg.dataset.hid) };
        const sr = t.closest("[data-src]");
        if(sr){ const s = SRC[+sr.dataset.src]; const g = { id:++uid, m:s.m, isX:!!s.isX, x:50, drag:true, dx:0, dy:0 }; hangers.push(g); return { kind:"h", g, fresh:true }; }
        if(t.closest("#mo-pivot")) return { kind:"p" };
        return null;
      },
      move(hd, pt){
        if(hd.kind === "p"){ p = Kit.clamp(Kit.snap((pt.x - X0)/S, .5), 5, 95); draw(); return; }
        const g = hd.g; g.drag = true; g.dx = pt.x; g.dy = pt.y; g.x = Kit.clamp(Kit.snap((pt.x - X0)/S, .5), .5, 99.5); draw();
      },
      end(hd, pt, moved){
        if(hd.kind === "p"){ draw(); return; }
        const g = hd.g; g.drag = false;
        if(pt.y > 330 || pt.y < 120 || (!moved && hd.fresh)) hangers.splice(hangers.indexOf(g), 1);
        draw();
      }
    });

    function side(list){ return list.map(g => `${g.isX ? "X" : g.m + " g"} @ ${Math.abs(g.x - p).toFixed(1)} cm`).join(", ") || "—"; }
    ctx.buttons([{ label:"Record (when balanced)", primary:true, block:true, onClick(){
      if(!balanced()){ ctx.toast("The rule isn’t balanced yet"); return; }
      const L = hangers.filter(g => g.x < p), R = hangers.filter(g => g.x > p);
      if(L.some(g => g.isX) || R.some(g => g.isX)){ ctx.toast("Mass X is unknown — use the moments to calculate it (answer box)"); }
      const mL = L.filter(g => !g.isX).reduce((s, g) => s + g.m*(p - g.x), 0), mR = R.filter(g => !g.isX).reduce((s, g) => s + g.m*(g.x - p), 0);
      ctx.record({ left:side(L), mL:Kit.round(mL, 0), right:side(R), mR:Kit.round(mR, 0), p });
      if(L.length && R.length && hangers.length === 2 && Math.abs(p - 50) <= 1.5) ctx.complete("two");
      if(hangers.length >= 3 && L.length && R.length) ctx.complete("three");
      if(hangers.length && Math.abs(p - 50) >= 10) ctx.complete("off");
    } }]);
    ctx.seg({ label:"Distance labels", value:true, options:[[true,"Show"],[false,"Hide — read the scale"]], onChange(v){ showD = v; draw(); } });
    ctx.buttons([{ label:"Remove all masses", onClick(){ hangers = []; draw(); } }, { label:"Pivot to 50 cm", onClick(){ p = 50; draw(); } }]);
    Kit.answer(ctx, "Mass of X / g", "e.g. 120", v => Math.abs(v - xMass)/xMass <= .04
      ? (ctx.complete("x"), [true, `Correct — X is ${xMass} g.`]) : [false, "Not quite. Balance X against a known mass: m₁d₁ = X·d₂."]);
    Kit.answer(ctx, "Centre of gravity of the rule / cm", "e.g. 50.5", v => Math.abs(v - cg) <= .5
      ? (ctx.complete("cg"), [true, `Correct — the centre of gravity is at ${cg.toFixed(1)} cm.`]) : [false, "Remove all masses and move the pivot until the rule balances on its own."]);
    draw();
  }
});
