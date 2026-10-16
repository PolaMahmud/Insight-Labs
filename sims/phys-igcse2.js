"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · IGCSE — remaining syllabus practicals and demonstrations
   Density of a regular solid · Brownian motion · Dispersion by a prism ·
   Loudness and pitch on an oscilloscope · Evaporation · Gas pressure and temperature
══════════════════════════════════════════════════════════════════ */

/* ───────────── DENSITY OF A REGULAR SOLID ───────────── */
Lab.register({
  id:"regulardensity", subject:"physics", level:["igcse"], topic:"Density · Regular solids", interactive:true,
  title:"Density of a regular solid",
  summary:"Measure the length, width and height of a rectangular block with a ruler, weigh it, calculate its density and identify the material.",
  aim:"Determine the density of regularly shaped solids by measuring their dimensions with a ruler and their mass with a balance.",
  variables:{ iv:"Block (material)", dv:"Mass (g) and dimensions (cm)", cv:["Same balance and ruler","Read the ruler at right angles (no parallax)","Start measuring from the zero mark"] },
  stageTitle:"Block, ruler and balance", controlsTitle:"Measurements",
  thumb:`<svg viewBox="0 0 300 140"><path d="M90 50 h90 v50 h-90z" fill="#B4BCCB" stroke="#475569"/><path d="M90 50 l24 -18 h90 l-24 18z M180 50 l24 -18 v50 l-24 18z" fill="#94A3B8" stroke="#475569"/><rect x="80" y="106" width="150" height="14" fill="#D9B07A" stroke="#7B4F2C"/></svg>`,
  challenges:[
    { id:"one",   title:"First block", text:"Measure all three dimensions and the mass of a block." },
    { id:"three", title:"Three materials", text:"Find the density of three different blocks." },
    { id:"id",    title:"Identify it", text:"Use your density to name the material of three blocks." }
  ],
  columns:[{key:"blk",label:"Block",dp:0},{key:"l",label:"l / cm",dp:1},{key:"w",label:"w / cm",dp:1},{key:"h",label:"h / cm",dp:1},{key:"V",label:"V / cm³",dp:1},{key:"m",label:"m / g",dp:1},{key:"rho",label:"ρ / g cm⁻³",dp:2}],
  questions:[
    { q:"Describe how to find the density of a regularly shaped solid.",
      a:"Measure its mass on a balance. Measure its length, width and height with a ruler (or calipers for small sizes). Volume = l × w × h. Density = mass ÷ volume." },
    { q:"Why is it better to use vernier calipers than a ruler for a small block?",
      a:"A ruler reads to ±0.1 cm, which is a large percentage of a 1–2 cm dimension. Calipers read to ±0.01 cm, so the volume (which multiplies three readings) is much more accurate." },
    { q:"A block is 5.0 cm × 4.0 cm × 2.0 cm and has a mass of 108 g. What is it made of?",
      a:"V = 40 cm³, ρ = 108 ÷ 40 = 2.7 g/cm³ — aluminium." },
    { q:"Will a block of density 0.75 g/cm³ float in water? Explain.",
      a:"Yes — its density is less than that of water (1.0 g/cm³), so it floats." }
  ],
  setup(ctx){
    const MATS = [["Aluminium", 2.70], ["Brass", 8.50], ["Steel", 7.85], ["Oak", 0.75], ["Perspex", 1.19], ["Copper", 8.96]];
    const S = 40, X0 = 260, BY = 380;
    let blk = 0, B, dim = "l", got = {}, named = new Set();
    const r1 = (a, b) => Kit.round(a + Math.random()*(b - a), 1);
    function newBlock(){
      blk++;
      const [name, rho] = MATS[Math.floor(Math.random()*MATS.length)];
      B = { name, rho, l:r1(4, 8.5), w:r1(2, 5), h:r1(1.5, 4.5) };
      B.m = Kit.round(B.l*B.w*B.h*rho*(1 + (Math.random() - .5)*.01), 1);
      got = {};
    }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="rd-svg"><defs>${Kit.DEFS}<clipPath id="rd-clip"><circle r="62"/></clipPath></defs>
      ${Kit.bench(960, 480)}
      <rect x="560" y="430" width="220" height="50" rx="10" fill="#334155" stroke="#1F2937"/><rect x="580" y="440" width="130" height="30" rx="5" fill="#132A1F"/><text id="rd-bal" x="702" y="462" text-anchor="end" class="k-lcd" style="font-size:17px">0.0 g</text>
      <text x="670" y="508" text-anchor="middle" class="k-lbl">top-pan balance</text>
      <g id="rd-scene"></g>
      <g transform="translate(820 150)"><circle r="64" fill="#F7F9FC" stroke="var(--accent)" stroke-width="3"/><g clip-path="url(#rd-clip)" id="rd-zoom"></g></g><line id="rd-lline" stroke="var(--accent)" stroke-dasharray="3 3"/>
      <text x="24" y="34" class="k-status" id="rd-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#rd-svg"), $ = s => svg.querySelector(s);
    const L = () => ({ l:B.l, w:B.w, h:B.h })[dim], other = () => dim === "h" ? B.l : B.h;
    function draw(){
      const len = L()*S, oth = Math.min(other(), 5)*S*.6, y = BY - oth;
      let s = `<rect x="${X0}" y="${y}" width="${len}" height="${oth}" fill="${B.rho > 7 ? "url(#k-brass)" : B.rho < 1 ? "url(#k-wood)" : B.rho < 2 ? "rgba(186,230,253,.55)" : "url(#k-metal)"}" stroke="#334155" stroke-width="1.5"/>
        <text x="${X0 + len/2}" y="${y - 10}" text-anchor="middle" class="k-tag">measuring the ${{ l:"length", w:"width", h:"height" }[dim]}${dim === "h" ? " (block turned on its side)" : dim === "w" ? " (block turned round)" : ""}</text>`;
      // ruler under the edge, zero mark lined up with the left face
      s += `<rect x="${X0 - 20}" y="${BY + 2}" width="${16*S}" height="34" fill="url(#k-wood)" stroke="#7B4F2C"/>`;
      for(let mm = 0; mm <= 150; mm++){ const x = X0 + mm*S/10, L2 = mm % 10 === 0 ? 14 : mm % 5 === 0 ? 10 : 6; s += `<line x1="${x}" y1="${BY + 2}" x2="${x}" y2="${BY + 2 + L2}" stroke="#4B3621" stroke-width=".7"/>`; if(mm % 10 === 0) s += `<text x="${x}" y="${BY + 30}" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#4B3621">${mm/10}</text>`; }
      $("#rd-scene").innerHTML = s;
      // magnifier on the right-hand end
      const v = L(); let z = `<rect x="-64" y="-64" width="128" height="128" fill="#F7F9FC"/><rect x="${-64}" y="-40" width="64" height="40" fill="${B.rho > 7 ? "#D4B04A" : B.rho < 1 ? "#C69660" : "#A7B0BF"}"/><rect x="-64" y="2" width="128" height="62" fill="#DDB680"/>`;
      for(let mm = Math.floor((v - 1.6)*10); mm <= (v + 1.6)*10; mm++){ const x = (mm/10 - v)*40, big = mm % 10 === 0, half = mm % 5 === 0; z += `<line x1="${x}" y1="2" x2="${x}" y2="${big ? 26 : half ? 18 : 12}" stroke="#2B1D10" stroke-width="${big ? 1.6 : .9}"/>`; if(big) z += `<text x="${x}" y="44" text-anchor="middle" style="font:600 13px 'JetBrains Mono';fill:#2B1D10">${mm/10}</text>`; }
      $("#rd-zoom").innerHTML = z;
      const ll = $("#rd-lline"); ll.setAttribute("x1", 756); ll.setAttribute("y1", 150); ll.setAttribute("x2", X0 + L()*S); ll.setAttribute("y2", BY);
      $("#rd-bal").textContent = B.m.toFixed(1) + " g";
      const left = ["l","w","h"].filter(k => got[k] === undefined);
      $("#rd-status").textContent = left.length ? `Block ${blk}: read the ${{ l:"length", w:"width", h:"height" }[dim]} on the magnified ruler` : `Block ${blk}: all measured — record it`;
      ctx.readout([["Block", String(blk)], ["Length", got.l === undefined ? "—" : got.l + " cm"], ["Width", got.w === undefined ? "—" : got.w + " cm"], ["Height", got.h === undefined ? "—" : got.h + " cm"], ["Mass", B.m.toFixed(1) + " g"]]);
    }
    const dseg = ctx.seg({ label:"Edge to measure", value:"l", options:[["l","Length"],["w","Width"],["h","Height"]], onChange(v){ dim = v; draw(); } });
    const rd = Kit.reading(ctx, "Ruler reading at the end of the edge / cm", "e.g. 5.3", () => L(), .05, v => {
      got[dim] = v; rd.clear();
      const nx = ["l","w","h"].find(k => got[k] === undefined); if(nx){ dim = nx; dseg.set(nx); }
      draw();
    });
    ctx.buttons([{ label:"Record this block", primary:true, block:true, onClick(){
      if(["l","w","h"].some(k => got[k] === undefined)) return ctx.toast("Measure the length, width and height first");
      const V = Kit.round(got.l*got.w*got.h, 1);
      ctx.record({ blk, l:got.l, w:got.w, h:got.h, V, m:B.m, rho:Kit.round(B.m/V, 2) });
      ctx.complete("one");
      if(new Set(ctx.rows().map(r => Math.round(r.rho*2))).size >= 3) ctx.complete("three");
    } }, { label:"New block", onClick(){ newBlock(); dim = "l"; dseg.set("l"); draw(); } }]);
    const pick = ctx.select({ label:"This block is made of…", value:"", options:[["", "choose a material"]].concat(MATS.map(([n, r]) => [n, `${n} (${r} g/cm³)`])), onChange(v){
      if(!v) return;
      if(!ctx.rows().some(r => r.blk === blk)){ ctx.toast("Record this block first"); pick.set(""); return; }
      if(v === B.name){ named.add(blk); ctx.toast(`Correct — ${B.name}`); if(named.size >= 3) ctx.complete("id"); } else ctx.toast("Not quite — compare your density with the table");
      pick.set("");
    } });
    newBlock(); draw();
  }
});

/* ───────────── BROWNIAN MOTION IN A SMOKE CELL ───────────── */
Lab.register({
  id:"brownian", subject:"physics", level:["igcse"], topic:"Thermal physics · Brownian motion", interactive:true,
  title:"Brownian motion in a smoke cell",
  summary:"Look down a microscope at smoke particles lit from the side, focus on the tiny specks of light and watch their random, jerky motion.",
  aim:"Observe Brownian motion of smoke particles in air and explain it in terms of collisions with fast-moving air molecules.",
  variables:{ iv:"Temperature of the air in the cell", dv:"How vigorously the smoke particles jiggle", cv:["Same smoke cell","Same lighting and magnification"] },
  stageTitle:"Microscope view of a smoke cell", controlsTitle:"Microscope",
  thumb:`<svg viewBox="0 0 300 140"><circle cx="150" cy="70" r="62" fill="#0B1220" stroke="#64748B" stroke-width="3"/>${[[120,50],[170,60],[140,95],[190,90],[110,85],[160,40]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.5" fill="#FDF6C3"/>`).join("")}<path d="M140 95 l6 -4 l-3 7 l8 -2 l-2 6 l7 1" stroke="#FDE68A" fill="none" opacity=".6"/></svg>`,
  challenges:[
    { id:"focus", title:"Focus", text:"Switch on the lamp and focus until the smoke particles are sharp points of light." },
    { id:"trace", title:"Trace one particle", text:"Turn on the trail for one particle and watch its random path for 15 s." },
    { id:"warm",  title:"Warmer air", text:"Warm the cell and see the motion become more vigorous." },
    { id:"why",   title:"Why?", text:"Show the (invisible) air molecules to see what is pushing the smoke." }
  ],
  questions:[
    { q:"Describe what is seen in the smoke cell.",
      a:"Tiny bright specks (smoke particles reflecting light) moving about in a random, jerky, zig-zag way, constantly changing direction." },
    { q:"Explain the motion of the smoke particles.",
      a:"Air molecules, too small to see, move very fast in random directions. They collide with the much larger smoke particles unevenly from different sides, so the resultant force on a smoke particle keeps changing size and direction, making it move randomly." },
    { q:"What does Brownian motion tell us about air molecules?",
      a:"That air is made of tiny particles in constant, random, rapid motion — evidence for the kinetic particle model." },
    { q:"Why does the motion become more vigorous when the air is warmer?",
      a:"At a higher temperature the air molecules have more kinetic energy and move faster, so their collisions with the smoke particles are harder and more frequent." }
  ],
  setup(ctx){
    const C = { x:420, y:260, r:210 };
    let lamp = false, focus = .2, T = 20, trail = false, showMol = false, tTrail = 0;
    const parts = Array.from({ length:40 }, () => ({ x:(Math.random() - .5)*360, y:(Math.random() - .5)*360, b:.6 + Math.random()*.4, path:[] }));
    const mols = Array.from({ length:90 }, () => ({ x:(Math.random() - .5)*400, y:(Math.random() - .5)*400, a:Math.random()*Math.PI*2 }));
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="bm-svg"><defs>${Kit.DEFS}<clipPath id="bm-clip"><circle cx="${C.x}" cy="${C.y}" r="${C.r}"/></clipPath>
        <filter id="bm-blur"><feGaussianBlur id="bm-sd" stdDeviation="4"/></filter></defs>
      <circle cx="${C.x}" cy="${C.y}" r="${C.r + 14}" fill="#1F2937" stroke="#475569" stroke-width="3"/>
      <circle cx="${C.x}" cy="${C.y}" r="${C.r}" fill="#05080F"/>
      <g clip-path="url(#bm-clip)"><g id="bm-mols"></g><path id="bm-trail" fill="none" stroke="#FDE68A" stroke-width="1.4" opacity=".7"/><g id="bm-parts" filter="url(#bm-blur)"></g></g>
      <g transform="translate(720 150)"><rect width="200" height="140" rx="12" fill="color-mix(in srgb,var(--bg-card) 85%,transparent)" stroke="var(--brd2)"/>
        <text x="14" y="22" class="k-lbl">the smoke cell (side view)</text><rect x="30" y="62" width="70" height="50" rx="4" fill="rgba(200,210,225,.15)" stroke="var(--txt2)"/>
        <path d="M150 87 L100 87" stroke="#FDE68A" stroke-width="3" id="bm-beam"/><circle cx="165" cy="87" r="14" fill="#334155"/><text x="165" y="126" text-anchor="middle" class="k-lbl">lamp + lens</text>
        <path d="M65 62 V34" stroke="var(--txt2)" stroke-width="6"/><text x="76" y="46" class="k-lbl">microscope</text></g>
      <text x="24" y="34" class="k-status" id="bm-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#bm-svg"), $ = s => svg.querySelector(s);
    function draw(){
      const sd = Math.abs(focus - .72)*22;
      $("#bm-sd").setAttribute("stdDeviation", sd.toFixed(2));
      $("#bm-beam").setAttribute("opacity", lamp ? 1 : .1);
      $("#bm-parts").innerHTML = lamp ? parts.map(p => `<circle cx="${C.x + p.x}" cy="${C.y + p.y}" r="${2.4 + sd*.2}" fill="#FDF6C3" opacity="${p.b}"/>`).join("") : "";
      const tp = parts[0];
      $("#bm-trail").setAttribute("d", trail && lamp && tp.path.length ? "M" + tp.path.map(([x, y]) => `${(C.x + x).toFixed(1)} ${(C.y + y).toFixed(1)}`).join(" L") : "");
      $("#bm-mols").innerHTML = showMol ? mols.map(m => `<circle cx="${C.x + m.x}" cy="${C.y + m.y}" r="1.2" fill="#60A5FA" opacity=".7"/>`).join("") : "";
      const sharp = sd < 1.5;
      $("#bm-status").textContent = !lamp ? "Switch on the lamp" : !sharp ? "Turn the focus until the specks are sharp points" : "Sharp — watch the random, jerky movement";
      ctx.readout([["Lamp", lamp ? "on" : "off"], ["Focus", sharp ? "sharp" : "blurred", sharp ? "good" : "warn"], ["Air", T + " °C"]]);
    }
    ctx.frame(dt => {
      const k = Math.sqrt((T + 273)/293);
      parts.forEach(p => {
        if(Math.random() < dt*12){ p.x += (Math.random() - .5)*7*k; p.y += (Math.random() - .5)*7*k; }
        p.x += (-p.x)*.0006; p.y += (-p.y)*.0006 + .02*dt;          // slow drift/settling, kept in view
      });
      const tp = parts[0];
      if(trail){ tp.path.push([tp.x, tp.y]); if(tp.path.length > 900) tp.path.shift(); tTrail += dt; if(tTrail > 15 && lamp) ctx.complete("trace"); }
      if(showMol) mols.forEach(m => { m.x += Math.cos(m.a)*260*k*dt; m.y += Math.sin(m.a)*260*k*dt; if(Math.abs(m.x) > 220 || Math.abs(m.y) > 220 || Math.random() < dt*3) { m.a = Math.random()*Math.PI*2; m.x = Kit.clamp(m.x, -220, 220); m.y = Kit.clamp(m.y, -220, 220); } });
      if(lamp && Math.abs(focus - .72) < .07) ctx.complete("focus");
      draw();
    });
    ctx.buttons([{ label:"Lamp on / off", primary:true, block:true, onClick(){ lamp = !lamp; } }]);
    ctx.slider({ label:"Focus", min:0, max:1, step:.01, value:focus, fmt:v => Math.round(v*100), unit:"%", onInput(v){ focus = v; } });
    ctx.slider({ label:"Air temperature in the cell", min:10, max:60, step:5, value:T, unit:"°C", onInput(v){ T = v; if(v >= 40) ctx.complete("warm"); } });
    ctx.seg({ label:"Trail on one particle", value:false, options:[[false,"Off"],[true,"On"]], onChange(v){ trail = v; tTrail = 0; parts[0].path = []; } });
    ctx.seg({ label:"Air molecules (too small to see)", value:false, options:[[false,"Hide"],[true,"Show (model)"]], onChange(v){ showMol = v; if(v) ctx.complete("why"); } });
    draw();
  }
});

/* ───────────── DISPERSION OF WHITE LIGHT BY A PRISM ───────────── */
Lab.register({
  id:"prism", subject:"physics", level:["igcse"], topic:"Light · Dispersion", interactive:true,
  title:"Dispersion by a glass prism",
  summary:"Shine a narrow beam of white light into a glass prism, turn the prism until a spectrum appears on the screen and see which colour bends most.",
  aim:"Show that white light is dispersed into a spectrum by a glass prism because each colour has a different refractive index.",
  variables:{ iv:"Angle of the prism / colour of the light", dv:"Colours and their positions on the screen", cv:["Same prism","Narrow beam from the ray box","Dark room"] },
  stageTitle:"Ray box, prism and screen", controlsTitle:"Light",
  layout:"wide",
  thumb:`<svg viewBox="0 0 300 140"><path d="M150 20 L200 110 H100Z" fill="rgba(200,220,255,.25)" stroke="#A2ACBD" stroke-width="2"/><line x1="20" y1="70" x2="128" y2="62" stroke="#fff" stroke-width="3"/>${["#FF3B30","#FF9500","#FFCC00","#34C759","#0A84FF","#5E5CE6","#AF52DE"].map((c,i)=>`<line x1="172" y1="66" x2="280" y2="${70+i*7}" stroke="${c}" stroke-width="2"/>`).join("")}</svg>`,
  challenges:[
    { id:"spec",  title:"A spectrum", text:"Turn the prism until all seven colours reach the screen." },
    { id:"most",  title:"Most refracted", text:"Answer: which colour is refracted the most?" },
    { id:"filt",  title:"One colour", text:"Put a red filter in the beam — a single colour is not dispersed further." }
  ],
  questions:[
    { q:"What is meant by dispersion?",
      a:"The splitting of white light into its component colours (a spectrum) by refraction, because the refractive index of glass is slightly different for each colour." },
    { q:"List the colours of the visible spectrum in order of increasing frequency.",
      a:"Red, orange, yellow, green, blue, indigo, violet." },
    { q:"Why is violet light refracted more than red light?",
      a:"Violet light slows down more in glass than red light — glass has a larger refractive index for violet — so it changes direction more at each surface." },
    { q:"What happens if red light (from a filter) passes through the prism?",
      a:"It is refracted (deviated) but not split into more colours, because it is monochromatic — light of a single frequency." }
  ],
  setup(ctx){
    const COLS = [["Red",700,"#FF3B30"],["Orange",620,"#FF9500"],["Yellow",580,"#FFCC00"],["Green",530,"#34C759"],["Blue",470,"#0A84FF"],["Indigo",440,"#5E5CE6"],["Violet",400,"#AF52DE"]];
    const nOf = lam => 1.50 + 14000/(lam*lam);                           // glass with its dispersion exaggerated so the spectrum is wide
    const PC = { x:430, y:220 }, SIDE = 210, SCREEN = 880;
    let rot = 0, src = { x:90, y:340 }, aim = -4, filter = "none";
    const tri = () => [0, 1, 2].map(k => { const a = (rot - 90 + k*120)*Math.PI/180, r = SIDE/Math.sqrt(3); return [PC.x + r*Math.cos(a), PC.y + r*Math.sin(a)]; });
    function hit(p, d, poly){
      let best = null;
      for(let i = 0; i < 3; i++){
        const a = poly[i], b = poly[(i + 1) % 3], e = [b[0] - a[0], b[1] - a[1]], den = d[0]*e[1] - d[1]*e[0];
        if(Math.abs(den) < 1e-9) continue;
        const t = ((a[0] - p[0])*e[1] - (a[1] - p[1])*e[0])/den, u = ((a[0] - p[0])*d[1] - (a[1] - p[1])*d[0])/den;
        if(t > 1e-6 && u >= 0 && u <= 1 && (!best || t < best.t)){ const L = Math.hypot(...e); best = { t, n:[e[1]/L, -e[0]/L] }; }
      }
      return best;
    }
    function trace(n){
      const poly = tri(); let p = [src.x, src.y], d = [Math.cos(aim*Math.PI/180), Math.sin(aim*Math.PI/180)], inside = false;
      const pts = [p.slice()];
      for(let k = 0; k < 6; k++){
        const h = hit(p, d, poly);
        if(!h){ const t = d[0] > 0 ? (SCREEN - p[0])/d[0] : 900; pts.push([p[0] + d[0]*Math.max(0, Math.min(t, 1200)), p[1] + d[1]*Math.max(0, Math.min(t, 1200))]); return { pts, out:!inside && d[0] > 0, y:p[1] + d[1]*((SCREEN - p[0])/d[0]) }; }
        p = [p[0] + d[0]*h.t, p[1] + d[1]*h.t]; pts.push(p.slice());
        let N = h.n; if(N[0]*d[0] + N[1]*d[1] > 0) N = [-N[0], -N[1]];
        const n1 = inside ? n : 1, n2 = inside ? 1 : n, r = n1/n2, ci = -(N[0]*d[0] + N[1]*d[1]), s2 = r*r*(1 - ci*ci);
        if(s2 > 1){ d = [d[0] + 2*ci*N[0], d[1] + 2*ci*N[1]]; }
        else { const ct = Math.sqrt(1 - s2); d = [r*d[0] + (r*ci - ct)*N[0], r*d[1] + (r*ci - ct)*N[1]]; inside = !inside; }
      }
      return { pts, out:false, y:null };
    }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="pr-svg"><defs>${Kit.DEFS}</defs>
      <rect width="960" height="500" fill="#05080F" opacity=".55"/>
      <g id="pr-rays" style="mix-blend-mode:screen"></g>
      <path id="pr-tri" fill="rgba(200,220,255,.18)" stroke="#CBD5E1" stroke-width="2" class="k-drag"/>
      <g id="pr-box"></g>
      <rect x="${SCREEN}" y="40" width="14" height="420" fill="#E5E7EB" opacity=".9"/><g id="pr-spot"></g>
      <text x="${SCREEN - 6}" y="480" text-anchor="end" class="k-lbl">white screen</text>
      <text x="24" y="34" class="k-status" id="pr-status" style="fill:#F1F5F9"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#pr-svg"), $ = s => svg.querySelector(s);
    function draw(){
      const poly = tri();
      $("#pr-tri").setAttribute("d", "M" + poly.map(p => p.join(" ")).join(" L") + "Z");
      $("#pr-box").innerHTML = `<g transform="translate(${src.x} ${src.y}) rotate(${aim})"><rect x="-70" y="-18" width="70" height="36" rx="5" fill="#334155" stroke="#64748B"/><rect x="-4" y="-3" width="6" height="6" fill="#FDE68A"/>${filter === "red" ? `<rect x="2" y="-12" width="6" height="24" fill="#DC2626" opacity=".85"/>` : ""}</g><text x="${src.x - 34}" y="${src.y + 58}" text-anchor="middle" class="k-lbl">ray box</text>`;
      const list = filter === "red" ? [COLS[0]] : COLS;
      let r = "", spots = "", reached = 0;
      // white beam until the first surface
      const first = trace(nOf(550));
      r += `<line x1="${first.pts[0][0]}" y1="${first.pts[0][1]}" x2="${first.pts[1][0]}" y2="${first.pts[1][1]}" stroke="${filter === "red" ? "#FF3B30" : "#FFFFFF"}" stroke-width="3"/>`;
      list.forEach(([nm, lam, col]) => {
        const t = trace(nOf(lam));
        r += `<path d="M${t.pts.slice(1).map(p => p.join(" ")).join(" L")}" stroke="${col}" stroke-width="2" fill="none" opacity=".9"/>`;
        if(t.out && t.y > 40 && t.y < 460){ reached++; spots += `<rect x="${SCREEN}" y="${t.y - 3}" width="14" height="6" fill="${col}"/>`; }
      });
      $("#pr-rays").innerHTML = r; $("#pr-spot").innerHTML = spots;
      if(filter === "none" && reached === 7) ctx.complete("spec");
      $("#pr-status").textContent = reached === list.length ? (filter === "red" ? "Red light is deviated but not split" : "A spectrum on the screen — red at the top, violet at the bottom") : "Drag the prism to rotate it, or aim the ray box, until the light reaches the screen";
      ctx.readout([["Prism angle", Math.round(rot) + "°"], ["Beam", filter === "red" ? "red filter" : "white"], ["Colours on screen", `${reached} of ${list.length}`, reached === list.length ? "good" : "warn"]]);
    }
    Kit.dragger(ctx, svg, {
      hit(t, p){ return t.closest("#pr-tri") ? { a0:Math.atan2(p.y - PC.y, p.x - PC.x), r0:rot } : null; },
      move(h, p){ rot = h.r0 + (Math.atan2(p.y - PC.y, p.x - PC.x) - h.a0)*180/Math.PI; draw(); }
    });
    ctx.slider({ label:"Aim the ray box", min:-35, max:10, step:1, value:aim, unit:"°", onInput(v){ aim = v; draw(); } });
    ctx.seg({ label:"Filter", value:"none", options:[["none","None (white)"],["red","Red filter"]], onChange(v){ filter = v; if(v === "red") ctx.complete("filt"); draw(); } });
    ctx.seg({ label:"Which colour is refracted the most?", value:null, options:[["Red","Red"],["Green","Green"],["Violet","Violet"]], onChange(v){ if(v === "Violet"){ ctx.complete("most"); ctx.toast("Correct — violet has the largest refractive index"); } else ctx.toast("Look at which colour has changed direction the most"); } });
    draw();
  }
});

/* ───────────── LOUDNESS AND PITCH ON AN OSCILLOSCOPE ───────────── */
Lab.register({
  id:"oscilloscope", subject:"physics", level:["igcse","as"], topic:"Waves · Sound", interactive:true,
  title:"Loudness and pitch on an oscilloscope",
  summary:"Connect a signal generator to a loudspeaker, pick the sound up with a microphone and see on an oscilloscope how amplitude and frequency change loudness and pitch.",
  aim:"Investigate how changes in amplitude and frequency affect the loudness and pitch of a sound, and measure the frequency of a sound from an oscilloscope trace.",
  variables:{ iv:"Frequency (Hz) and amplitude of the signal", dv:"Number of waves on the screen and height of the trace", cv:["Same microphone position","Same oscilloscope settings when comparing traces"] },
  stageTitle:"Signal generator, loudspeaker and oscilloscope", controlsTitle:"Controls",
  thumb:`<svg viewBox="0 0 300 140"><rect x="70" y="10" width="160" height="120" rx="8" fill="#0B2A1C" stroke="#334155" stroke-width="3"/><path d="${Array.from({length:61},(_,i)=>`${i?'L':'M'}${80+i*2.33} ${70-35*Math.sin(i/60*Math.PI*6)}`).join(' ')}" stroke="#7CFFB2" stroke-width="2" fill="none"/></svg>`,
  challenges:[
    { id:"loud",  title:"Louder", text:"Turn up the amplitude and see the trace get taller." },
    { id:"pitch", title:"Higher pitch", text:"Turn up the frequency and see more waves on the screen." },
    { id:"freq",  title:"Measure a frequency", text:"Switch to the mystery signal and work out its frequency from the trace." }
  ],
  questions:[
    { q:"How does the trace change when the sound gets louder?",
      a:"The amplitude (height of the waves) increases; the number of waves on the screen stays the same." },
    { q:"How does the trace change when the pitch gets higher?",
      a:"The frequency increases, so more complete waves fit across the screen (each wave is narrower); the height stays the same." },
    { q:"One wave takes 4.0 divisions and the time-base is 0.5 ms/div. Find the frequency.",
      a:"Period T = 4.0 × 0.5 ms = 2.0 ms = 0.0020 s. f = 1/T = 500 Hz." },
    { q:"What is the range of frequencies a healthy human can hear?",
      a:"About 20 Hz to 20 000 Hz. Sound above 20 kHz is ultrasound." }
  ],
  setup(ctx){
    const DIV = 40, NX = 10, NY = 8, OX = 420, OY = 70;
    const TB = [.1, .2, .5, 1, 2, 5], YG = [.1, .2, .5, 1, 2];
    let f = 400, amp = .4, tb = 1, yg = .5, mystery = false, mf = 0, ma = 0, play = false, t = 0;
    let ac = null, osc = null, gain = null;
    const F = () => mystery ? mf : f, Aamp = () => mystery ? ma : amp;           // amplitude in volts at the microphone
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="os-svg"><defs>${Kit.DEFS}</defs>
      ${Kit.bench(960, 480)}
      <g transform="translate(30 140)"><rect width="200" height="130" rx="12" fill="#334155" stroke="#1F2937"/><text x="12" y="22" style="font:700 10px Inter;fill:#CBD5E1">SIGNAL GENERATOR</text>
        <rect x="12" y="32" width="176" height="40" rx="5" fill="#132A1F"/><text id="os-sg" x="180" y="60" text-anchor="end" class="k-lcd">400 Hz</text></g>
      <g id="os-spk" transform="translate(280 230)"></g>
      <g transform="translate(360 222)"><rect x="-6" y="-8" width="30" height="16" rx="6" fill="#64748B"/><circle cx="-6" r="8" fill="#475569"/><text x="0" y="28" text-anchor="middle" class="k-lbl">mic</text></g>
      <path d="M230 205 C 250 205 250 230 262 230" stroke="#DC2626" stroke-width="2" fill="none"/><path d="M384 222 C 400 222 400 ${OY + NY*DIV/2} ${OX - 10} ${OY + NY*DIV/2}" stroke="#64748B" stroke-width="2" fill="none"/>
      <rect x="${OX - 14}" y="${OY - 14}" width="${NX*DIV + 28}" height="${NY*DIV + 28}" rx="12" fill="#1F2937" stroke="#475569" stroke-width="2"/>
      <rect x="${OX}" y="${OY}" width="${NX*DIV}" height="${NY*DIV}" fill="#0B2A1C"/>
      ${(() => { let g = ""; for(let i = 0; i <= NX; i++) g += `<line x1="${OX + i*DIV}" y1="${OY}" x2="${OX + i*DIV}" y2="${OY + NY*DIV}" stroke="#1F5137" stroke-width="${i === NX/2 ? 1.4 : .8}"/>`; for(let j = 0; j <= NY; j++) g += `<line x1="${OX}" y1="${OY + j*DIV}" x2="${OX + NX*DIV}" y2="${OY + j*DIV}" stroke="#1F5137" stroke-width="${j === NY/2 ? 1.4 : .8}"/>`; return g; })()}
      <path id="os-tr" fill="none" stroke="#7CFFB2" stroke-width="2.2"/>
      <text x="${OX}" y="${OY + NY*DIV + 34}" class="k-lbl" id="os-set"></text>
      <text x="24" y="34" class="k-status" id="os-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#os-svg"), $ = s => svg.querySelector(s);
    function draw(){
      const fr = F(), A = Aamp(), per = 1/fr;
      let d = "";
      for(let i = 0; i <= 400; i++){ const x = i/400*NX*DIV, tt = i/400*NX*tb/1000, y = OY + NY*DIV/2 - Kit.clamp(A*Math.sin(2*Math.PI*fr*tt)/yg, -NY/2 - .3, NY/2 + .3)*DIV; d += (i ? "L" : "M") + (OX + x).toFixed(1) + " " + y.toFixed(1); }
      $("#os-tr").setAttribute("d", d);
      $("#os-sg").textContent = mystery ? "??? Hz" : Math.round(f) + " Hz";
      const cone = Math.sin(t*Math.min(fr, 30)*2*Math.PI*.2)*A*4;
      $("#os-spk").innerHTML = `<rect x="-30" y="-40" width="34" height="80" rx="4" fill="#334155"/><path d="M4 -16 L${26 + cone} -40 V40 L4 16Z" fill="#475569" stroke="#1F2937"/>${play ? [1, 2, 3].map(k => `<path d="M${40 + k*16} -20 q8 20 0 40" stroke="var(--txt3)" fill="none" opacity="${.8 - k*.2}"/>`).join("") : ""}<text x="0" y="62" text-anchor="middle" class="k-lbl">loudspeaker</text>`;
      $("#os-set").textContent = `time-base ${tb} ms/div · Y-gain ${yg} V/div`;
      const waves = fr*NX*tb/1000;
      $("#os-status").textContent = waves > 40 ? "Too many waves to see — choose a faster time-base" : waves < .8 ? "Less than one wave — choose a slower time-base" : mystery ? "Mystery signal: count the divisions for one wave" : `${waves.toFixed(1)} waves across the screen`;
      ctx.readout([["Frequency", mystery ? "?" : Math.round(f) + " Hz"], ["Amplitude", (A/yg).toFixed(1) + " div"], ["Waves on screen", waves.toFixed(1)]]);
    }
    function sound(){
      try{
        if(play && !ac){ ac = new (window.AudioContext || window.webkitAudioContext)(); osc = ac.createOscillator(); gain = ac.createGain(); osc.connect(gain); gain.connect(ac.destination); osc.start(); }
        if(ac){ osc.frequency.value = F(); gain.gain.value = play ? Math.min(.15, Aamp()*.08) : 0; }
      }catch(e){}
    }
    ctx.cleanup(() => { try{ if(ac){ osc.stop(); ac.close(); } }catch(e){} });
    ctx.frame(dt => { t += dt; draw(); });
    const fs = ctx.slider({ label:"Frequency", min:100, max:2000, step:10, value:f, unit:"Hz", onInput(v){ if(v > f + 100) ctx.complete("pitch"); f = v; sound(); } });
    ctx.slider({ label:"Amplitude (loudness)", min:.1, max:1.5, step:.05, value:amp, unit:"V", fmt:v => v.toFixed(2), onInput(v){ if(v > amp + .3) ctx.complete("loud"); amp = v; sound(); } });
    ctx.select({ label:"Time-base", value:"1", options:TB.map(v => [String(v), v + " ms/div"]), onChange(v){ tb = +v; } });
    ctx.select({ label:"Y-gain", value:"0.5", options:YG.map(v => [String(v), v + " V/div"]), onChange(v){ yg = +v; } });
    ctx.seg({ label:"Signal", value:false, options:[[false,"Generator"],[true,"Mystery"]], onChange(v){ mystery = v; if(v){ mf = 10*Math.round((250 + Math.random()*1200)/10); ma = .2 + Math.random()*.9; } fs.disable(v); sound(); } });
    ctx.seg({ label:"Hear it", value:false, options:[[false,"Silent"],[true,"Play sound"]], onChange(v){ play = v; sound(); } });
    Kit.answer(ctx, "Frequency of the mystery signal / Hz", "e.g. 650", v => !mystery ? [false, "Switch the signal to Mystery first."] : Math.abs(v - mf)/mf <= .05
      ? (ctx.complete("freq"), [true, `Correct — ${mf} Hz.`]) : [false, "Period = divisions for one wave × time-base. Frequency = 1 ÷ period (in seconds)."]);
    draw();
  }
});

/* ───────────── EVAPORATION ───────────── */
Lab.register({
  id:"evaporation", subject:"physics", level:["igcse"], topic:"Thermal physics · Evaporation", interactive:true,
  title:"What affects evaporation?",
  summary:"Weigh a dish of water before and after ten minutes while changing one factor at a time — temperature, surface area and air movement — and see evaporation cool a wet thermometer.",
  aim:"Investigate how temperature, surface area and air movement over a surface affect the rate of evaporation, and show that evaporation causes cooling.",
  variables:{ iv:"Water temperature / surface area / air movement (change one at a time)", dv:"Mass of water lost in 10 minutes (g)", cv:["Same starting volume of water","Same time","The other two factors"] },
  stageTitle:"Dish on a balance", controlsTitle:"Conditions",
  thumb:`<svg viewBox="0 0 300 140"><rect x="70" y="100" width="130" height="30" rx="5" fill="#334155"/><path d="M80 98 q55 18 110 0 v-12 h-110z" fill="#4C86C6" opacity=".6" stroke="#A2ACBD"/>${[0,1,2].map(i=>`<path d="M${110+i*25} 76 q-6 -10 0 -20 q6 -10 0 -20" stroke="#A2ACBD" fill="none" opacity=".6"/>`).join("")}<circle cx="245" cy="60" r="22" fill="none" stroke="#64748B" stroke-width="3"/></svg>`,
  challenges:[
    { id:"temp", title:"Temperature", text:"Record two runs that differ only in water temperature." },
    { id:"area", title:"Surface area", text:"Record two runs that differ only in surface area." },
    { id:"air",  title:"Air movement", text:"Record two runs that differ only in the fan." },
    { id:"cool", title:"Cooling by evaporation", text:"Wrap the thermometer in wet cotton wool and switch on the fan." }
  ],
  columns:[{key:"T",label:"Water / °C",dp:0},{key:"dish",label:"Dish"},{key:"fan",label:"Fan"},{key:"m0",label:"Start mass / g",dp:2},{key:"m1",label:"End mass / g",dp:2},{key:"loss",label:"Mass lost / g",dp:2}],
  questions:[
    { q:"Explain evaporation in terms of particles.",
      a:"The more energetic particles near the surface of the liquid have enough energy to escape into the air. This happens at any temperature, only from the surface." },
    { q:"Why does evaporation cool the remaining liquid?",
      a:"The most energetic particles escape, so the average kinetic energy of the particles left behind falls — and temperature depends on the average kinetic energy." },
    { q:"Why does a fan increase the rate of evaporation?",
      a:"Moving air carries escaped water particles away from the surface, so fewer return to the liquid." },
    { q:"Why must only one factor be changed at a time?",
      a:"So that any change in the mass lost can be put down to that one factor — a fair test." },
    { q:"How is evaporation different from boiling?",
      a:"Evaporation happens at any temperature and only at the surface. Boiling happens at one temperature (the boiling point) and throughout the liquid, with bubbles of vapour forming inside it." }
  ],
  setup(ctx){
    const AREA = { narrow:20, wide:80 };
    let T = 20, dish = "narrow", fan = false, wet = false, running = false, tRun = 0, m0 = 0, m = 0, last = null, spin = 0, wetT = 21;
    const start = () => (dish === "narrow" ? 112.4 : 134.8) + 50;
    const rate = () => 2.2e-5*AREA[dish]*Math.exp(.055*(T - 20))*(fan ? 2.4 : 1);         // g per simulated second
    m = start();
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="ev-svg"><defs>${Kit.DEFS}</defs>
      ${Kit.bench(960, 480)}
      <rect x="270" y="420" width="240" height="60" rx="10" fill="#334155" stroke="#1F2937"/><rect x="290" y="432" width="150" height="34" rx="5" fill="#132A1F"/><text id="ev-bal" x="432" y="457" text-anchor="end" class="k-lcd" style="font-size:18px">0.00 g</text>
      <rect x="300" y="408" width="180" height="12" rx="4" fill="url(#k-metal)"/>
      <g id="ev-dish"></g><g id="ev-steam"></g><g id="ev-fan"></g>
      <g transform="translate(640 120)"><rect width="270" height="160" rx="12" fill="color-mix(in srgb,var(--bg-card) 85%,transparent)" stroke="var(--brd2)"/>
        <text x="14" y="22" class="k-lbl">two thermometers in the room air</text>
        <text x="70" y="64" text-anchor="middle" class="k-tag">dry bulb</text><text id="ev-dry" x="70" y="104" text-anchor="middle" class="k-lcd" style="fill:var(--txt)">22.0</text>
        <text x="200" y="64" text-anchor="middle" class="k-tag" id="ev-wetl">bulb</text><text id="ev-wet" x="200" y="104" text-anchor="middle" class="k-lcd" style="fill:var(--txt)">22.0</text>
        <text x="135" y="140" text-anchor="middle" class="k-lbl">°C</text></g>
      <text x="24" y="34" class="k-status" id="ev-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ev-svg"), $ = s => svg.querySelector(s);
    function draw(){
      const w = dish === "narrow" ? 90 : 180, lvl = Kit.clamp((m - start() + 50)/50, 0, 1);
      $("#ev-dish").innerHTML = `<path d="M${390 - w/2} ${404 - 40} V404 H${390 + w/2} V${404 - 40}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><rect x="${392 - w/2}" y="${404 - 4 - 30*lvl*(dish === "narrow" ? 1 : .5)}" width="${w - 4}" height="${30*lvl*(dish === "narrow" ? 1 : .5) + 2}" fill="url(#k-water)"/>
        ${T > 20 ? `<text x="390" y="350" text-anchor="middle" class="k-lbl">water kept at ${T} °C</text>` : ""}`;
      const rr = rate()/2.2e-5/20;
      $("#ev-steam").innerHTML = running ? Array.from({ length:Math.min(9, Math.ceil(rr)) }, (_, i) => { const x = 390 - w/2 + 12 + (i + .5)*(w - 24)/Math.min(9, Math.ceil(rr)), ph = (tRun*3 + i*.7) % 1; return `<path d="M${x + (fan ? ph*60 : 0)} ${356 - ph*40} q-5 -8 0 -16 q5 -8 0 -16" stroke="var(--txt3)" fill="none" opacity="${.6*(1 - ph)}"/>`; }).join("") : "";
      $("#ev-fan").innerHTML = `<g transform="translate(140 330)"><rect x="-6" y="30" width="12" height="70" fill="url(#k-metal)"/><circle r="40" fill="none" stroke="#64748B" stroke-width="3"/>${[0, 120, 240].map(a => `<ellipse rx="30" ry="9" fill="#94A3B8" opacity=".85" transform="rotate(${a + spin})" />`).join("")}<circle r="6" fill="#334155"/></g><text x="140" y="456" text-anchor="middle" class="k-lbl">fan ${fan ? "on" : "off"}</text>`;
      $("#ev-bal").textContent = m.toFixed(2) + " g";
      $("#ev-dry").textContent = "22.0"; $("#ev-wet").textContent = (wet ? wetT : 22).toFixed(1); $("#ev-wetl").textContent = wet ? "wet bulb" : "bulb";
      $("#ev-status").textContent = running ? `Evaporating… ${Math.floor(tRun*100/6)} s of 600 s` : last ? `Lost ${last.toFixed(2)} g in 10 minutes — record it` : "Choose the conditions, then start a 10 minute run";
      ctx.readout([["Water", T + " °C"], ["Dish", dish === "narrow" ? "narrow (20 cm²)" : "wide (80 cm²)"], ["Fan", fan ? "on" : "off"], ["Balance", m.toFixed(2) + " g"]]);
    }
    ctx.frame(dt => {
      if(fan) spin += dt*900;
      const wetTarget = wet ? 22 - (fan ? 6.5 : 3) : 22; wetT += (wetTarget - wetT)*Math.min(1, dt/2.5);
      if(running){
        const sdt = dt*100; tRun += dt;
        m -= rate()*sdt*(1 + (Math.random() - .5)*.05);
        if(tRun >= 6){ running = false; last = m0 - m; }
      }
      draw();
    });
    const lock = () => { if(running){ ctx.toast("Wait for the run to finish"); return true; } return false; };
    ctx.seg({ label:"Water temperature", value:20, options:[[20,"20 °C"],[40,"40 °C"],[60,"60 °C"]], onChange(v){ if(lock()) return; T = v; m = start(); last = null; } });
    ctx.seg({ label:"Dish", value:"narrow", options:[["narrow","Narrow"],["wide","Wide"]], onChange(v){ if(lock()) return; dish = v; m = start(); last = null; } });
    ctx.seg({ label:"Fan", value:false, options:[[false,"Off"],[true,"On"]], onChange(v){ fan = v; if(fan && wet) ctx.complete("cool"); if(!running){ m = start(); last = null; } } });
    ctx.buttons([{ label:"Start a 10 minute run", primary:true, block:true, onClick(){ if(lock()) return; m = start(); m0 = m; tRun = 0; last = null; running = true; } }]);
    ctx.buttons([{ label:"Record the run", onClick(){
      if(last === null) return ctx.toast("Finish a run first");
      ctx.record({ T, dish:dish === "narrow" ? "Narrow" : "Wide", fan:fan ? "On" : "Off", m0:Kit.round(m0, 2), m1:Kit.round(m, 2), loss:Kit.round(last, 2) });
      last = null;
      const rows = ctx.rows(), same = (a, b, k) => ["T","dish","fan"].every(x => x === k ? a[x] !== b[x] : a[x] === b[x]);
      rows.forEach(a => rows.forEach(b => { if(same(a, b, "T")) ctx.complete("temp"); if(same(a, b, "dish")) ctx.complete("area"); if(same(a, b, "fan")) ctx.complete("air"); }));
    } }]);
    ctx.seg({ label:"Right-hand thermometer bulb", value:false, options:[[false,"Dry"],[true,"Wet cotton wool"]], onChange(v){ wet = v; if(wet && fan) ctx.complete("cool"); } });
    draw();
  }
});

/* ───────────── GAS PRESSURE AND TEMPERATURE (CONSTANT VOLUME) ───────────── */
Lab.register({
  id:"gaspt", subject:"physics", level:["igcse","as"], topic:"Thermal physics · Gas pressure", interactive:true,
  title:"Pressure and temperature of a gas",
  summary:"Heat a sealed flask of air in a water bath, read the thermometer and the pressure gauge, and extrapolate your graph to find absolute zero.",
  aim:"Investigate how the pressure of a fixed mass of gas at constant volume depends on its temperature, and estimate absolute zero.",
  variables:{ iv:"Temperature of the water bath θ (°C)", dv:"Pressure of the trapped air p (kPa)", cv:["Fixed mass of air (sealed flask)","Constant volume","Flask fully under water; stir and wait"] },
  stageTitle:"Flask of air in a water bath", controlsTitle:"Bath",
  thumb:`<svg viewBox="0 0 300 140"><path d="M60 30 V126 H200 V30" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="62" y="50" width="136" height="74" fill="#4C86C6" opacity=".5"/><circle cx="130" cy="96" r="24" fill="rgba(255,255,255,.15)" stroke="#CBD5E1"/><path d="M130 72 V30 H240 V52" stroke="#64748B" stroke-width="3" fill="none"/><circle cx="240" cy="72" r="20" fill="#F4F6FA" stroke="#334155" stroke-width="2"/></svg>`,
  challenges:[
    { id:"six",  title:"Six readings", text:"Record six or more readings spanning at least 60 °C." },
    { id:"zero", title:"Absolute zero", text:"Extrapolate your straight line to zero pressure to estimate absolute zero." },
    { id:"ice",  title:"Ice-cold start", text:"Take a reading below 5 °C." }
  ],
  columns:[{key:"th",label:"θ / °C",dp:0},{key:"p",label:"p / kPa",dp:1}],
  graph:{ x:["th"], y:["p"], fit:"linear" },
  questions:[
    { q:"Explain, using particles, why the pressure increases when the gas is heated at constant volume.",
      a:"The particles gain kinetic energy and move faster. They hit the walls more often and harder, so the force on each unit area of the walls — the pressure — increases." },
    { q:"What does the intercept on the temperature axis represent?",
      a:"Absolute zero (about −273 °C): the temperature at which the pressure of the gas would fall to zero, because the particles would have the least possible kinetic energy." },
    { q:"Why must the tube to the gauge be short and narrow?",
      a:"Air in the tube is not heated by the water bath, so it is not at the measured temperature. Keeping this volume small reduces the error." },
    { q:"Why should the water be stirred and the reading allowed to settle?",
      a:"So that the water is at an even temperature and the air in the flask has reached the temperature shown on the thermometer." },
    { q:"Convert 27 °C and −73 °C into kelvin.",
      a:"T = θ + 273: 300 K and 200 K." }
  ],
  setup(ctx){
    const T0 = 20, P0 = Kit.round(100 + Math.random()*2, 1), DEAD = .03;
    let Tw = T0, Ta = T0, Tm = T0, heat = false, stir = 0, ice = 0;
    const p = () => P0*(Ta + 273.15)/(T0 + 273.15)*(1 - DEAD) + P0*DEAD*1.0 + (Math.random() - .5)*.06;
    const th = Kit.thermometer("gp-th", 470, 70, 330, 0, 100, 10);
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="gp-svg"><defs>${Kit.DEFS}</defs>
      ${Kit.bench(960, 480)}
      <rect x="202" y="200" width="356" height="278" fill="url(#k-water)" opacity=".8"/><g id="gp-ice"></g>
      <circle cx="330" cy="360" r="70" fill="rgba(255,255,255,.12)" stroke="#CBD5E1" stroke-width="2"/><rect x="318" y="160" width="24" height="134" fill="rgba(255,255,255,.12)" stroke="#CBD5E1" stroke-width="2"/>
      <path d="M330 160 V110 H700 V140" stroke="#64748B" stroke-width="4" fill="none"/>
      <path d="M200 160 V480 H560 V160" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="2"/>
      <g id="gp-heater"></g>${th.svg}<g id="gp-stir"></g>
      <g transform="translate(620 140)"><rect width="200" height="110" rx="12" fill="#334155" stroke="#1F2937"/><text x="14" y="22" style="font:700 10px Inter;fill:#CBD5E1">PRESSURE GAUGE</text>
        <rect x="14" y="32" width="172" height="44" rx="5" fill="#132A1F"/><text id="gp-lcd" x="150" y="63" text-anchor="end" class="k-lcd">0.0</text><text x="180" y="63" text-anchor="end" style="font:600 11px Inter;fill:#5FBF8A">kPa</text></g>
      <text x="24" y="34" class="k-status" id="gp-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#gp-svg"), $ = s => svg.querySelector(s);
    let shown = P0;
    function draw(){
      th.set(svg, Tm);
      $("#gp-lcd").textContent = shown.toFixed(1);
      $("#gp-heater").innerHTML = `<rect x="226" y="190" width="10" height="260" rx="3" fill="url(#k-metal)"/><path d="M231 450 q-14 6 0 12 q14 6 0 12" stroke="${heat ? "#F97316" : "#64748B"}" stroke-width="5" fill="none"/><text x="214" y="184" class="k-lbl">heater</text>`;
      $("#gp-ice").innerHTML = ice > .05 ? Array.from({ length:Math.ceil(ice*7) }, (_, i) => `<rect x="${410 + (i % 3)*24}" y="${206 + Math.floor(i/3)*18}" width="20" height="15" rx="3" fill="#E0F2FE" opacity=".9" stroke="#93C5FD"/>`).join("") : "";
      $("#gp-stir").innerHTML = `<g transform="translate(${530 + Math.sin(stir*12)*6*Math.min(1, stir)} 0)"><path d="M0 150 V440" stroke="#CBD5E1" stroke-width="3"/><path d="M-12 440 h24" stroke="#CBD5E1" stroke-width="3"/></g>`;
      const steady = Math.abs(Ta - Tw) < .5 && Math.abs(Tm - Tw) < .5 && !heat;
      $("#gp-status").textContent = heat ? "Heater on — switch off, stir and wait before reading" : !steady ? "Stir and wait until the readings settle" : "Steady — read the thermometer and the gauge";
      ctx.readout([["Heater", heat ? "on" : "off", heat ? "warn" : ""], ["Readings", steady ? "steady" : "changing", steady ? "good" : "warn"]]);
    }
    ctx.frame(dt => {
      if(heat) Tw = Math.min(98, Tw + 1.2*dt);
      if(ice > 0){ const melt = Math.min(ice, dt*.05); ice -= melt; Tw = Math.max(.5, Tw - melt*170); }
      Tw += -(Tw - 20)*.0015*dt;
      const s = stir > .05;
      Ta += (Tw - Ta)*Math.min(1, dt/(s ? 3 : 10)); Tm += (Tw + (heat && !s ? 3 : 0) - Tm)*Math.min(1, dt/(s ? 2 : 8));
      stir = Math.max(0, stir - dt*.25);
      shown += (p() - shown)*Math.min(1, dt*3);
      draw();
    });
    ctx.buttons([{ label:"Heater on / off", primary:true, block:true, onClick(){ heat = !heat; } }]);
    ctx.buttons([{ label:"Stir", onClick(){ stir = 3; } }, { label:"Add ice", onClick(){ if(Tw < 4) return ctx.toast("The water is already ice-cold"); ice = Math.min(1, ice + .4); } }]);
    const rd = Kit.reading(ctx, "Thermometer reading θ / °C", "e.g. 45", () => Tm, 1, v => {
      ctx.record({ th:v, p:Kit.round(shown, 1) });
      if(heat || Math.abs(Ta - Tw) > 1.5) ctx.toast("Recorded — but the temperature was still changing");
      rd.clear();
      const ths = ctx.rows().map(r => r.th);
      if(new Set(ths).size >= 6 && Math.max(...ths) - Math.min(...ths) >= 60) ctx.complete("six");
      if(Math.min(...ths) < 5) ctx.complete("ice");
    });
    Kit.answer(ctx, "Absolute zero from your graph / °C", "e.g. −270", v => {
      const pts = ctx.rows().map(r => [r.th, r.p]); if(new Set(pts.map(q => q[0])).size < 4) return [false, "Record at least four temperatures first."];
      const f = ctx.linFit(pts), z = -f.c/f.m;
      if(Math.abs(v - z) <= Math.max(8, Math.abs(z)*.03)){ ctx.complete("zero"); return [true, `Correct for your line: ${z.toFixed(0)} °C (the accepted value is −273 °C).`]; }
      return [false, "Extend your line until p = 0: θ = −intercept ÷ gradient."];
    });
    draw();
  }
});
