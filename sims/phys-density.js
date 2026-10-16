"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · DENSITY (IGCSE + AS) — balance + measuring cylinder
   Drag objects onto the balance pan and into the measuring cylinder;
   read the water level through the magnifier.
══════════════════════════════════════════════════════════════════ */
Lab.register({
  id:"density", subject:"physics", level:["igcse","as"], topic:"Density", interactive:true,
  title:"Density by displacement",
  summary:"Weigh objects on a balance, drop them into a measuring cylinder and read the rise in water level to find density.",
  aim:"Determine the density of solids by measuring mass with a balance and volume by displacement of water.",
  variables:{ iv:"Object (material and size)", dv:"Mass (g) and volume of water displaced (cm³)", cv:["Same measuring cylinder","Read the bottom of the meniscus at eye level","No air bubbles on the object"] },
  stageTitle:"Bench", controlsTitle:"Readings",
  thumb:`<svg viewBox="0 0 300 140"><rect x="128" y="14" width="44" height="116" rx="4" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="130" y="58" width="40" height="70" fill="#4C86C6" opacity=".6"/><path d="M138 112l10-14 14 4 4 14-12 8z" fill="#8A93A6"/>
    <rect x="30" y="98" width="70" height="30" rx="4" fill="#334155"/><rect x="38" y="104" width="54" height="14" rx="2" fill="#132A1F"/><text x="88" y="115" text-anchor="end" font-size="10" fill="#7CFFB2" font-family="monospace">27.4 g</text><rect x="36" y="90" width="58" height="6" rx="2" fill="#94A3B8"/></svg>`,
  challenges:[
    { id:"three", title:"Three materials", text:"Record the density of three different materials." },
    { id:"plast", title:"Mass–volume graph", text:"Record four or more different-sized lumps of plasticine; the gradient of mass against volume is the density." },
    { id:"wood",  title:"Floating object", text:"Find the density of the wooden block (it floats — push it under with a pin)." }
  ],
  columns:[{key:"obj",label:"Object"},{key:"mat",label:"Material"},{key:"m",label:"Mass / g",dp:1},{key:"v1",label:"V₁ / cm³",dp:1},{key:"v2",label:"V₂ / cm³",dp:1},{key:"V",label:"Volume / cm³",dp:1},{key:"rho",label:"Density / g cm⁻³",dp:2}],
  series:"mat",
  graph:{ x:["V"], y:["m"], fit:"linear" },
  questions:[
    { q:"Describe how to find the density of an irregular solid such as a stone.",
      a:"Measure its mass on a balance. Partly fill a measuring cylinder with water and read the volume V₁. Lower the stone in gently (tied to thread) and read V₂. Volume = V₂ − V₁. Density = mass ÷ volume." },
    { q:"Why is it hard to measure the volume of the brass key accurately?",
      a:"Its volume is small (about 3 cm³), so the ±0.5 cm³ reading uncertainty is a large percentage. A narrower measuring cylinder (or a displacement can with a smaller cylinder) would help." },
    { q:"The wooden block floats. Why does the rise in water level not give its volume?",
      a:"A floating object only displaces its own weight of water, not its whole volume. Pushing it under with a thin pin makes it displace its full volume." },
    { q:"What does the gradient of a mass–volume graph represent?",
      a:"Density = mass ÷ volume, so the gradient (Δm/ΔV) is the density of the material. A straight line through the origin shows density is constant for that material." },
    { q:"Convert 2.7 g/cm³ into kg/m³.",
      a:"Multiply by 1000: 2700 kg/m³." }
  ],
  setup(ctx){
    const CYL = { x0:450, x1:510, top:110, bot:466 }, Vy = V => 460 - V*3.4;
    const PAN = { x:180, y:404 };
    const V0 = [40, 45, 50, 55][Math.floor(Math.random()*4)];
    const rnd = (a, b, dp) => Kit.round(a + Math.random()*(b - a), dp === undefined ? 1 : dp);
    let uid = 0;
    const objs = [];
    function make(kind, mass){
      const K = KINDS[kind], m = mass || rnd(K.m[0], K.m[1]);
      const o = { id:++uid, kind, name:K.name, mat:K.mat, rho:K.rho*(1 + (Math.random() - .5)*.03), m, x:0, y:0, place:"tray", slot:objs.length, sink:0 };
      o.V = o.m/o.rho; objs.push(o); return o;
    }
    const KINDS = {
      stone:{ name:"Stone", mat:"Stone", rho:2.6, m:[22,40] },
      key:{ name:"Brass key", mat:"Brass", rho:8.5, m:[22,34] },
      marble:{ name:"5 glass marbles", mat:"Glass", rho:2.5, m:[24,30] },
      al:{ name:"Aluminium block", mat:"Aluminium", rho:2.7, m:[20,30] },
      wood:{ name:"Wooden block", mat:"Wood", rho:.62, m:[6,9] },
      plast:{ name:"Plasticine", mat:"Plasticine", rho:1.6, m:[10,10] }
    };
    ["stone","key","marble","al","wood"].forEach(k => make(k));
    let plastSize = 20;
    make("plast", 20);
    let pinned = false, tare = 0;
    const meas = {};                        // object id → {m, v1, v2}
    let v1 = null;

    const trayX = i => 600 + (i % 4)*84, trayY = i => i < 4 ? 462 : 392;
    function home(o){ o.place = "tray"; o.x = trayX(o.slot); o.y = trayY(o.slot); }
    objs.forEach(home);
    const inCyl = () => objs.find(o => o.place === "cyl");
    const onPan = () => objs.find(o => o.place === "pan");
    const displaced = () => { const o = inCyl(); if(!o || o.sink < .99) return 0; return o.rho < 1 && !pinned ? o.m/1.0 : o.V; };
    const level = () => V0 + displaced();

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="dn-svg"><defs>${Kit.DEFS}
        <clipPath id="dn-cyl"><rect x="${CYL.x0 + 2}" y="${CYL.top}" width="${CYL.x1 - CYL.x0 - 4}" height="${CYL.bot - CYL.top}"/></clipPath>
        <clipPath id="dn-lensclip"><circle r="64"/></clipPath></defs>
      ${Kit.bench(960, 480)}
      <!-- balance -->
      <rect x="70" y="420" width="220" height="60" rx="10" fill="#334155" stroke="#1F2937"/>
      <rect x="96" y="434" width="130" height="32" rx="5" fill="#132A1F"/><text id="dn-bal" x="218" y="457" text-anchor="end" class="k-lcd">0.0 g</text>
      <g class="k-btn" id="dn-tare"><rect x="234" y="436" width="44" height="28" rx="7" fill="#0F172A" stroke="#475569"/><text x="256" y="454" text-anchor="middle" style="font:700 10px Inter;fill:#E5E7EB">TARE</text></g>
      <rect x="174" y="408" width="12" height="14" fill="#64748B"/><rect x="110" y="400" width="140" height="10" rx="4" fill="url(#k-metal)"/>
      <text x="180" y="508" text-anchor="middle" class="k-lbl">top-pan balance</text>
      <!-- measuring cylinder -->
      <rect id="dn-wrect" x="${CYL.x0 + 2}" width="${CYL.x1 - CYL.x0 - 4}" fill="url(#k-water)" clip-path="url(#dn-cyl)"/>
      <g id="dn-incyl" clip-path="url(#dn-cyl)"></g>
      <path d="M${CYL.x0} 96 V${CYL.bot} H${CYL.x1} V96" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
      <path d="M${CYL.x0 - 22} 480 L${CYL.x0 - 14} ${CYL.bot} H${CYL.x1 + 14} L${CYL.x1 + 22} 480 Z" fill="url(#k-glass)" stroke="var(--txt2)"/>
      ${(() => { let t = ""; for(let v = 0; v <= 100; v++){ const y = Vy(v), L = v % 10 === 0 ? 14 : v % 5 === 0 ? 10 : 6; t += `<line x1="${CYL.x1}" y1="${y}" x2="${CYL.x1 - L}" y2="${y}" stroke="var(--txt2)" stroke-width=".7"/>`; if(v % 10 === 0) t += `<text x="${CYL.x1 + 4}" y="${y + 3.5}" class="k-num">${v}</text>`; } return t; })()}
      <text x="${(CYL.x0 + CYL.x1)/2}" y="508" text-anchor="middle" class="k-lbl">100 cm³ cylinder</text>
      <!-- magnifier -->
      <g id="dn-lens" style="pointer-events:none"><line id="dn-lline" stroke="var(--accent)" stroke-dasharray="3 3"/>
        <g id="dn-lin"><circle r="66" fill="#F7F9FC" stroke="var(--accent)" stroke-width="3"/><g clip-path="url(#dn-lensclip)" id="dn-zoom"></g></g></g>
      <text x="${trayX(0) - 30}" y="330" class="k-lbl" id="dn-traylbl">objects — drag onto the balance or into the cylinder</text>
      <g id="dn-objs"></g>
      <text x="24" y="34" class="k-status" id="dn-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#dn-svg"), $ = s => svg.querySelector(s);

    function shape(o, s){
      const k = o.kind; s = s || 1;
      const w = Math.cbrt(o.V)*16*s;
      if(k === "stone") return `<path d="M${-w*.5} ${-w*.1} L${-w*.2} ${-w*.55} L${w*.35} ${-w*.45} L${w*.55} ${w*.05} L${w*.2} ${w*.5} L${-w*.4} ${w*.42} Z" fill="#8A93A6" stroke="#475569"/>`;
      if(k === "key") return `<circle cx="${-w*.5}" cy="0" r="${w*.42}" fill="url(#k-brass)" stroke="#7A5A10"/><circle cx="${-w*.5}" cy="0" r="${w*.14}" fill="var(--bg2)"/><rect x="${-w*.1}" y="${-w*.12}" width="${w*1.2}" height="${w*.24}" fill="url(#k-brass)" stroke="#7A5A10"/><rect x="${w*.75}" y="${w*.1}" width="${w*.12}" height="${w*.2}" fill="url(#k-brass)"/>`;
      if(k === "marble") return [[-.35,.2],[.05,.25],[.45,.2],[-.15,-.15],[.25,-.12]].map(([a, b]) => `<circle cx="${a*w}" cy="${b*w}" r="${w*.22}" fill="#9AD0F5" stroke="#3B82F6" stroke-width=".8" opacity=".9"/>`).join("");
      if(k === "al") return `<rect x="${-w*.6}" y="${-w*.4}" width="${w*1.2}" height="${w*.8}" rx="2" fill="url(#k-metal)" stroke="#475569"/>`;
      if(k === "wood") return `<rect x="${-w*.65}" y="${-w*.38}" width="${w*1.3}" height="${w*.76}" rx="2" fill="url(#k-wood)" stroke="#7B4F2C"/><path d="M${-w*.5} ${-w*.1} q${w*.5} ${-w*.2} ${w} 0" stroke="#7B4F2C" fill="none" opacity=".5"/>`;
      return `<path d="M${-w*.55} ${w*.1} Q${-w*.6} ${-w*.45} ${-w*.05} ${-w*.42} Q${w*.6} ${-w*.5} ${w*.55} ${w*.05} Q${w*.5} ${w*.45} 0 ${w*.4} Q${-w*.5} ${w*.45} ${-w*.55} ${w*.1}Z" fill="#22C55E" stroke="#15803D"/>`;
    }
    const halfH = o => Math.cbrt(o.V)*16*.45;

    function draw(){
      const L = level(), y = Vy(L);
      $("#dn-wrect").setAttribute("y", y); $("#dn-wrect").setAttribute("height", CYL.bot - y);
      // objects: in the cylinder they are drawn small enough to fit
      let inside = "", out = "";
      objs.forEach(o => {
        if(o.place === "cyl"){
          const sc = Math.min(1, 46/(Math.cbrt(o.V)*16*1.3)), hh = halfH(o)*sc;
          const floatY = Vy(V0 + (o.rho < 1 && !pinned ? o.m : o.V)) + hh*.25;
          const restY = o.rho < 1 && !pinned ? floatY : CYL.bot - hh - 2;
          const yy = 70 + (restY - 70)*o.sink;
          inside += `<g data-id="${o.id}" class="k-drag" transform="translate(${(CYL.x0 + CYL.x1)/2} ${yy})">${shape(o, sc)}</g>`;
          if(o.rho < 1 && pinned && o.sink > .99) inside += `<line x1="${(CYL.x0 + CYL.x1)/2 + 6}" y1="40" x2="${(CYL.x0 + CYL.x1)/2 + 2}" y2="${yy}" stroke="#94A3B8" stroke-width="1.5"/>`;
        }else{
          out += `<g data-id="${o.id}" class="k-drag" transform="translate(${o.x} ${o.y - halfH(o)})">${shape(o)}<rect x="-34" y="-30" width="68" height="60" fill="transparent"/></g>`;
          if(o.place === "tray") out += `<text x="${o.x}" y="${o.y + 18}" text-anchor="middle" class="k-lbl" style="font-size:9.5px">${o.kind === "plast" ? "Plasticine " + Math.round(o.m) + " g" : o.name}</text>`;
        }
      });
      $("#dn-incyl").innerHTML = inside; $("#dn-objs").innerHTML = out;
      const p = onPan(); $("#dn-bal").textContent = (p ? p.m - tare : -tare).toFixed(1) + " g";
      // magnifier tracks the water surface
      const cy = Kit.clamp(y, 150, 400), cx = 370;
      $("#dn-lin").setAttribute("transform", `translate(${cx} ${cy})`);
      const ll = $("#dn-lline"); ll.setAttribute("x1", cx + 66); ll.setAttribute("y1", cy); ll.setAttribute("x2", CYL.x0); ll.setAttribute("y2", y);
      let z = `<rect x="-66" y="0" width="132" height="80" fill="rgba(110,170,230,.5)"/><path d="M-66 -7 Q0 7 66 -7 V0 H-66Z" fill="rgba(110,170,230,.5)"/><path d="M-66 -7 Q0 7 66 -7" fill="none" stroke="rgba(40,90,170,.9)" stroke-width="2"/>`;
      const S = 14;
      for(let v = Math.ceil(L - 5); v <= Math.floor(L + 5); v++){
        const yy = (L - v)*S, major = v % 5 === 0;
        z += `<line x1="${major ? -40 : -25}" y1="${yy}" x2="10" y2="${yy}" stroke="#111827" stroke-width="${major ? 1.6 : 1}"/>`;
        if(v % 5 === 0) z += `<text x="16" y="${yy + 5}" style="font:600 13px 'JetBrains Mono';fill:#111827">${v}</text>`;
      }
      $("#dn-zoom").innerHTML = z;
      const ic = inCyl();
      $("#dn-status").textContent = !onPan() && !ic ? "Drag an object onto the balance, then into the cylinder" : ic && v1 === null ? "Take the water level BEFORE adding the object — remove it first" : ic ? `${ic.name} in the cylinder — read the new water level` : `${onPan().name} on the balance`;
      ctx.readout([["Balance", (p ? (p.m - tare).toFixed(1) : (-tare).toFixed(1)) + " g", p ? "good" : ""], ["Cylinder", ic ? ic.name + (ic.rho < 1 ? (pinned ? " (pushed under)" : " (floating!)") : "") : "water only", ic && ic.rho < 1 && !pinned ? "warn" : ""],
        ["V₁ recorded", v1 === null ? "—" : v1.toFixed(1) + " cm³"]]);
    }

    const tw = Kit.tweens(ctx); tw.onFrame = draw;
    ctx.frame(dt => { objs.forEach(o => { if(o.place === "cyl" && o.sink < 1){ o.sink = Math.min(1, o.sink + dt*1.6); draw(); } }); });

    Kit.dragger(ctx, svg, {
      hit(t){ const g = t.closest("[data-id]"); if(g) return objs.find(o => o.id === +g.dataset.id); if(t.closest("#dn-tare")){ const p = onPan(); tare = p ? p.m : 0; draw(); } return null; },
      start(o, p){
        if(o.place === "cyl"){ o.x = p.x; o.y = p.y; o.sink = 0; pinned = false; }
        o.ox = o.x - p.x; o.oy = o.y - p.y; o.place = "drag"; draw();
      },
      move(o, p){ o.x = p.x + (o.ox || 0); o.y = p.y + (o.oy || 0); draw(); },
      end(o){
        if(o.x > CYL.x0 - 30 && o.x < CYL.x1 + 30 && o.y < CYL.bot && o.y > 40){
          const prev = inCyl(); if(prev){ home(prev); }
          o.place = "cyl"; o.sink = 0;
          if(v1 === null) ctx.toast("Tip: read V₁ before putting the object in");
        }else if(Math.abs(o.x - PAN.x) < 80 && o.y > 330 && o.y < 440){
          const prev = onPan(); if(prev && prev !== o) { home(prev); }
          o.place = "pan"; o.x = PAN.x; o.y = 400;
          (meas[o.id] = meas[o.id] || {}).m = Kit.round(o.m - tare, 1);
        }else{
          const hx = trayX(o.slot), hy = trayY(o.slot); o.place = "tray";
          tw.add(o, { x:hx, y:hy }, .3);
        }
        o.ox = o.oy = 0; draw();
      }
    });

    /* readings panel */
    const water = Kit.reading(ctx, "Water level / cm³ (read the magnifier)", "e.g. 50.0", () => inCyl() && inCyl().sink < 1 ? null : level(), 0.5, v => {
      const o = inCyl();
      if(!o){ v1 = v; ctx.toast("V₁ = " + v.toFixed(1) + " cm³ noted"); water.clear(); draw(); return; }
      if(v1 === null){ ctx.toast("Remove the object and read V₁ (water alone) first"); return; }
      const mm = meas[o.id] && meas[o.id].m;
      if(mm === undefined){ ctx.toast("Weigh this object on the balance first"); return; }
      const V = Kit.round(v - v1, 1);
      if(V <= 0){ ctx.toast("The volume must be positive"); return; }
      ctx.record({ obj: o.kind === "plast" ? `Plasticine (${Math.round(o.m)} g)` : o.name, mat:o.mat, m:mm, v1, v2:v, V, rho:Kit.round(mm/V, 2) });
      water.clear();
      const rows = ctx.rows();
      if(new Set(rows.map(r => r.mat)).size >= 3) ctx.complete("three");
      if(new Set(rows.filter(r => r.mat === "Plasticine").map(r => r.obj)).size >= 4) ctx.complete("plast");
      if(rows.some(r => r.mat === "Wood" && Math.abs(r.rho - .62) < .1)) ctx.complete("wood");
    });
    ctx.buttons([{ label:"Push floating object under (pin)", onClick(){ const o = inCyl(); if(!o || o.rho >= 1){ ctx.toast("Only needed for an object that floats"); return; } pinned = !pinned; draw(); } }]);
    ctx.seg({ label:"New plasticine lump", value:20, options:[[10,"10 g"],[20,"20 g"],[30,"30 g"],[40,"40 g"],[55,"55 g"]], onChange(v){ plastSize = v; } });
    ctx.buttons([{ label:"Make lump", onClick(){
      const old = objs.find(o => o.kind === "plast" && o.place === "tray"); if(old) objs.splice(objs.indexOf(old), 1);
      const o = make("plast", Kit.round(plastSize*(0.97 + Math.random()*.06), 1)); o.slot = 5; home(o); draw();
    } }]);
    ctx.html(`<p class="hint">Weigh the object, read V₁ with the cylinder holding water only, add the object, then read V₂. Each completed pair is recorded.</p>`);
    draw();
  }
});
