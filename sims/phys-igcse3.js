"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · IGCSE (0625) — part 3: items from the syllabus practical contexts
   Small distances by multiples (1.1.3) · Conductors and insulators (4.2.1) ·
   Transparent, translucent and opaque (practical contexts) ·
   Converging and diverging lenses on a parallel beam (3.2.3, apparatus list)
══════════════════════════════════════════════════════════════════ */

/* ───────────── SMALL DISTANCES BY MEASURING MULTIPLES ───────────── */
Lab.register({
  id:"multiples", subject:"physics", level:["igcse"], topic:"Measurement · Small distances", interactive:true,
  title:"Measuring small distances by multiples",
  summary:"Find the thickness of one sheet of paper by measuring a stack, and the diameter of a thin wire by winding it round a pencil and measuring the coil.",
  aim:"Determine an average value for a small distance by measuring a multiple of it with a millimetre ruler.",
  variables:{ iv:"Number of sheets or turns N", dv:"Length of the stack or coil (mm)", cv:["Same paper / same wire","Sheets pressed flat, turns tightly side by side"] },
  stageTitle:"Ruler and specimen", controlsTitle:"Measure",
  thumb:`<svg viewBox="0 0 300 140"><g fill="#F8FAFC" stroke="#94A3B8">${Array.from({ length:8 }, (_, i) => `<rect x="60" y="${40 + i*7}" width="120" height="6"/>`).join("")}</g><rect x="200" y="30" width="24" height="90" fill="#D9B07A" stroke="#7B4F2C"/><path d="M200 40 h10 M200 60 h10 M200 80 h10 M200 100 h10" stroke="#4B3621"/></svg>`,
  challenges:[
    { id:"paper", title:"One sheet of paper", text:"Measure a stack of at least 100 sheets and find the thickness of one sheet." },
    { id:"wire",  title:"Diameter of a wire", text:"Wind at least 20 turns, measure the coil and find the wire's diameter." },
    { id:"why",   title:"Why multiples?", text:"Compare the percentage uncertainty for 10 and 200 sheets." }
  ],
  columns:[{key:"what",label:"Specimen"},{key:"N",label:"N",dp:0},{key:"L",label:"Length / mm",dp:0},{key:"each",label:"One sheet or turn / mm",dp:3},{key:"pct",label:"% uncertainty",dp:1}],
  questions:[
    { q:"Why is it not sensible to measure one sheet of paper with a ruler?",
      a:"One sheet is about 0.1 mm thick, much smaller than the smallest division (1 mm). The reading would be 0 mm, or have an uncertainty many times larger than the thickness." },
    { q:"How does measuring 200 sheets reduce the uncertainty?",
      a:"The ruler's uncertainty (about ±1 mm) stays the same, but it is now shared between 200 sheets. The absolute uncertainty in one sheet is ±1 mm ÷ 200 = ±0.005 mm." },
    { q:"Why must the turns of wire be wound tightly with no gaps?",
      a:"Any gap adds to the coil length, so the calculated diameter would be too large." },
    { q:"Give another example of measuring multiples.",
      a:"Timing 20 swings of a pendulum to find the period of one swing, or weighing 100 drawing pins to find the mass of one." }
  ],
  setup(ctx){
    const T = Kit.round(.08 + Math.random()*.05, 3), D = Kit.round(.28 + Math.random()*.3, 2);
    let mode = "paper", N = 10;
    const L = () => (mode === "paper" ? T : D)*N;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="mu-svg"><defs>${Kit.DEFS}<clipPath id="mu-clip"><circle cx="0" cy="0" r="88"/></clipPath></defs>${Kit.bench(960, 470)}
      <g id="mu-scene"></g>
      <g transform="translate(760 210)"><circle r="92" fill="#F7F9FC" stroke="var(--accent)" stroke-width="3"/><g clip-path="url(#mu-clip)" id="mu-zoom"></g></g>
      <text x="760" y="324" text-anchor="middle" class="k-lbl">magnified: read the far end</text>
      <text x="24" y="34" class="k-status" id="mu-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#mu-svg"), $ = s => svg.querySelector(s);
    const PX = 6, X0 = 140, Y = 400;                                     // 6 px per mm on the bench ruler
    function draw(){
      const len = L()*PX;
      let s = `<rect x="${X0 - 14}" y="${Y}" width="${100*PX + 28}" height="36" fill="url(#k-wood)" stroke="#7B4F2C"/>`;
      for(let mm = 0; mm <= 100; mm++){ const x = X0 + mm*PX, big = mm % 10 === 0, mid = mm % 5 === 0; s += `<line x1="${x}" y1="${Y}" x2="${x}" y2="${Y + (big ? 14 : mid ? 10 : 6)}" stroke="#4B3621" stroke-width=".7"/>`; if(big) s += `<text x="${x}" y="${Y + 30}" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#4B3621">${mm/10}</text>`; }
      s += `<text x="${X0 + 100*PX + 20}" y="${Y + 30}" class="k-lbl">cm</text>`;
      if(mode === "paper"){
        // the stack lies on its side along the ruler
        s += `<rect x="${X0}" y="${Y - 120}" width="${Math.max(len, 1.5)}" height="118" fill="#F8FAFC" stroke="#94A3B8"/>`;
        if(N <= 60) for(let i = 1; i < N; i++) s += `<line x1="${X0 + i*T*PX}" y1="${Y - 120}" x2="${X0 + i*T*PX}" y2="${Y - 2}" stroke="#CBD5E1" stroke-width=".4"/>`;
        s += `<rect x="${X0 - 14}" y="${Y - 130}" width="14" height="130" fill="#64748B"/><text x="${X0 + len/2}" y="${Y - 134}" text-anchor="middle" class="k-tag">${N} sheets pressed together</text>`;
      } else {
        s += `<rect x="${X0 - 30}" y="${Y - 60}" width="${100*PX + 60}" height="40" rx="6" fill="#F59E0B" stroke="#92400E"/><text x="${X0 + 100*PX - 30}" y="${Y - 34}" style="font:600 10px Inter;fill:#78350F">pencil</text>`;
        const dpx = D*PX; for(let i = 0; i < N; i++) s += `<rect x="${X0 + i*dpx}" y="${Y - 64}" width="${dpx}" height="48" rx="${dpx/2}" fill="#B45309" stroke="#78350F" stroke-width=".4"/>`;
        s += `<text x="${X0 + len/2}" y="${Y - 74}" text-anchor="middle" class="k-tag">${N} turns of wire</text>`;
      }
      s += `<line x1="${X0 + len}" y1="${Y - 6}" x2="676" y2="250" stroke="var(--accent)" stroke-dasharray="3 3"/>`;
      $("#mu-scene").innerHTML = s;
      // magnifier: 1 mm = 24 px around the end
      const e = L();
      let z = `<rect x="-92" y="-92" width="184" height="184" fill="#F7F9FC"/><rect x="-92" y="${mode === "paper" ? -92 : -60}" width="92" height="${mode === "paper" ? 90 : 46}" fill="${mode === "paper" ? "#E2E8F0" : "#B45309"}"/><rect x="-92" y="0" width="184" height="92" fill="#DDB680"/>`;
      for(let mm = Math.floor(e - 4); mm <= e + 4; mm++){ const x = (mm - e)*24, big = mm % 10 === 0, mid = mm % 5 === 0; z += `<line x1="${x}" y1="0" x2="${x}" y2="${big ? 30 : mid ? 22 : 14}" stroke="#2B1D10" stroke-width="${big ? 1.8 : 1}"/>`; if(big) z += `<text x="${x}" y="50" text-anchor="middle" style="font:600 14px 'JetBrains Mono';fill:#2B1D10">${mm/10}</text>`; }
      $("#mu-zoom").innerHTML = z;
      $("#mu-status").textContent = mode === "paper" ? "Read the length of the stack in mm (to the nearest mm)" : "Read the length of the coil in mm (to the nearest mm)";
      ctx.readout([["Specimen", mode === "paper" ? "paper" : "wire"], ["N", String(N)]]);
    }
    ctx.seg({ label:"Specimen", value:"paper", options:[["paper","Stack of paper"],["wire","Wire on a pencil"]], onChange(v){ mode = v; if(v === "wire") N = Math.min(N, 60); sl.set(N); draw(); } });
    const sl = ctx.slider({ label:"Number of sheets or turns N", min:5, max:200, step:5, value:N, onInput(v){ N = mode === "wire" ? Math.min(v, 60) : v; draw(); } });
    const rd = Kit.reading(ctx, "Length of the stack or coil / mm", "e.g. 12", () => L(), .6, v => {
      rd.clear();
      if(v === 0) return ctx.toast("Too small to read — use more sheets or turns");
      const each = v/N, pct = 1/v*100;
      ctx.record({ what:mode === "paper" ? "paper" : "wire", N, L:v, each:Kit.round(each, 3), pct:Kit.round(pct, 1) });
      const rows = ctx.rows().filter(r => r.what === "paper").map(r => r.N);
      if(rows.some(n => n <= 20) && rows.some(n => n >= 150)) ctx.complete("why");
    });
    Kit.answer(ctx, "Thickness of one sheet / mm", "e.g. 0.10", v => Math.abs(v - T)/T <= .08 && ctx.rows().some(r => r.what === "paper" && r.N >= 100)
      ? (ctx.complete("paper"), [true, `Good — one sheet is ${T.toFixed(3)} mm thick.`]) : [false, "Measure at least 100 sheets, then divide the length by N."]);
    Kit.answer(ctx, "Diameter of the wire / mm", "e.g. 0.45", v => Math.abs(v - D)/D <= .08 && ctx.rows().some(r => r.what === "wire" && r.N >= 20)
      ? (ctx.complete("wire"), [true, `Good — the wire is ${D.toFixed(2)} mm in diameter.`]) : [false, "Wind at least 20 turns, then divide the coil length by N."]);
    draw();
  }
});

/* ───────────── CONDUCTORS AND INSULATORS ───────────── */
Lab.register({
  id:"conductors", subject:"physics", level:["igcse"], topic:"Electricity · Conductors and insulators", interactive:true,
  title:"Conductors and insulators",
  summary:"Clip different materials into a gap in a circuit with a lamp and an ammeter, and sort them into electrical conductors and insulators.",
  aim:"Distinguish between electrical conductors and insulators using a simple circuit.",
  variables:{ iv:"Material placed in the gap", dv:"Current (A) and whether the lamp lights", cv:["Same cell","Same lamp","Same length of sample between the clips"] },
  stageTitle:"Test circuit", controlsTitle:"Materials",
  thumb:`<svg viewBox="0 0 300 140"><path d="M40 30 H260 V110 H180 M120 110 H40 V30" stroke="#94A3B8" stroke-width="3" fill="none"/><circle cx="150" cy="30" r="14" fill="#FDE68A" stroke="#334155"/><rect x="120" y="102" width="60" height="16" fill="#B45309"/></svg>`,
  challenges:[
    { id:"eight", title:"Test eight", text:"Test and classify eight different materials." },
    { id:"all",   title:"All correct", text:"Classify every material correctly." },
    { id:"carbon", title:"The odd one", text:"Find the non-metal that conducts." }
  ],
  columns:[{key:"m",label:"Material"},{key:"I",label:"I / A",dp:2},{key:"lamp",label:"Lamp"},{key:"cls",label:"Your answer"},{key:"ok",label:"Correct?"}],
  questions:[
    { q:"Why is an ammeter useful as well as the lamp?",
      a:"A material that conducts poorly may let through a current too small to light the lamp. The ammeter shows that a small current is still flowing." },
    { q:"Explain, using electrons, why metals conduct and plastics do not.",
      a:"Metals contain free (delocalised) electrons that can move through the material when a p.d. is applied. In insulators the electrons are held in their atoms, so there are no free charges to carry a current." },
    { q:"Graphite is a non-metal. Why does it conduct?",
      a:"Each carbon atom in graphite has one electron that is free to move along the layers, so graphite has free electrons like a metal." },
    { q:"Name two uses of insulators in electrical equipment.",
      a:"The plastic coating on wires and the plastic case of a plug — they stop current flowing through a person who touches them." }
  ],
  setup(ctx){
    const MATS = [["Copper wire",.30,true,"#B45309"],["Aluminium foil",.30,true,"#CBD5E1"],["Steel paper clip",.29,true,"#94A3B8"],["Brass key",.30,true,"#D4B04A"],["Pencil graphite",.17,true,"#334155"],["Plastic ruler",0,false,"#38BDF8"],["Wooden splint",0,false,"#C69660"],["Glass rod",0,false,"#E0F2FE"],["Rubber band",0,false,"#EF4444"],["Paper",0,false,"#F8FAFC"],["Cotton thread",0,false,"#F1F5F9"]];
    let cur = null, answered = {};
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="cd-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 450)}
      <path d="M200 218 V120 H420 M480 120 H760 V340 H560 M340 340 H200 V242" stroke="#334155" stroke-width="3" fill="none"/>
      <g transform="translate(200 224)"><line x1="-16" y1="-6" x2="16" y2="-6" stroke="var(--txt)" stroke-width="2"/><line x1="-9" y1="12" x2="9" y2="12" stroke="var(--txt)" stroke-width="4"/><text x="-26" y="8" text-anchor="end" class="k-lbl">cell</text></g>
      <g id="cd-lamp" transform="translate(450 120)"></g>
      <g transform="translate(760 230)"><circle r="34" fill="#F8FAFC" stroke="#334155" stroke-width="2"/><text y="-10" text-anchor="middle" style="font:700 11px Inter;fill:#334155">A</text><text id="cd-I" y="14" text-anchor="middle" style="font:700 15px 'JetBrains Mono';fill:#0F172A">0.00</text></g>
      <g id="cd-gap"></g>
      <text x="450" y="420" text-anchor="middle" class="k-lbl">crocodile clips — put the sample across the gap</text>
      <text x="24" y="34" class="k-status" id="cd-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#cd-svg"), $ = s => svg.querySelector(s);
    function draw(){
      const I = cur ? cur[1]*(1 + (Math.random() - .5)*.02) : 0, glow = cur ? cur[1]/.3 : 0;
      $("#cd-lamp").innerHTML = `${glow > .05 ? `<circle r="${30 + 16*glow}" fill="#FDE68A" opacity="${.35*glow}"/>` : ""}<circle r="20" fill="${glow > .05 ? `rgba(253,230,138,${.4 + .6*glow})` : "#F8FAFC"}" stroke="#334155" stroke-width="2"/><path d="M-14 -14 L14 14 M14 -14 L-14 14" stroke="#334155" stroke-width="1.5"/><text y="-50" text-anchor="middle" class="k-lbl">lamp</text>`;
      $("#cd-I").textContent = I.toFixed(2);
      $("#cd-gap").innerHTML = `<path d="M340 340 l20 -8 v16z" fill="#DC2626"/><path d="M560 340 l-20 -8 v16z" fill="#111827"/>${cur ? `<rect x="352" y="334" width="196" height="12" rx="4" fill="${cur[3]}" stroke="#334155"/><text x="450" y="372" text-anchor="middle" class="k-tag">${cur[0]}</text>` : `<text x="450" y="372" text-anchor="middle" class="k-lbl">gap — no sample</text>`}`;
      $("#cd-status").textContent = !cur ? "Choose a material to clip into the gap" : answered[cur[0]] ? "Recorded — try another material" : "Is it a conductor or an insulator?";
      ctx.readout([["Sample", cur ? cur[0] : "none"], ["Lamp", cur && cur[1] > .2 ? "bright" : cur && cur[1] > 0 ? "dim" : "off"], ["Current", I.toFixed(2) + " A"]]);
    }
    ctx.frame(() => draw());
    ctx.select({ label:"Material in the gap", value:"", options:[["", "— nothing —"]].concat(MATS.map(m => [m[0], m[0]])), onChange(v){ cur = MATS.find(m => m[0] === v) || null; cls.set(null); } });
    const cls = ctx.seg({ label:"This material is…", value:null, options:[["c","a conductor"],["i","an insulator"]], onChange(v){
      if(!cur || !v) return; if(answered[cur[0]]) return ctx.toast("Already recorded this one");
      const ok = (v === "c") === cur[2];
      answered[cur[0]] = ok;
      ctx.record({ m:cur[0], I:cur[1], lamp:cur[1] > .2 ? "bright" : cur[1] > 0 ? "dim" : "off", cls:v === "c" ? "conductor" : "insulator", ok:ok ? "✓" : "✗" });
      if(cur[0] === "Pencil graphite" && ok) ctx.complete("carbon");
      const n = Object.keys(answered).length; if(n >= 8) ctx.complete("eight");
      if(n === MATS.length && Object.values(answered).every(x => x)) ctx.complete("all");
      ctx.toast(ok ? "Correct" : "Look at the ammeter again");
    } });
    draw();
  }
});

/* ───────────── TRANSPARENT, TRANSLUCENT AND OPAQUE ───────────── */
Lab.register({
  id:"transmission", subject:"physics", level:["igcse"], topic:"Light · Transmission", interactive:true,
  title:"Transparent, translucent and opaque",
  summary:"Put samples between a lamp and a light meter, look through each one at a picture, and sort them into transparent, translucent and opaque.",
  aim:"Investigate how much light different materials transmit, and whether an image can be seen clearly through them.",
  variables:{ iv:"Material of the sample", dv:"Light meter reading (lux) and how clearly the picture is seen", cv:["Same lamp and distance","Same position of the light meter","Samples of similar thickness"] },
  stageTitle:"Lamp, sample and light meter", controlsTitle:"Samples",
  thumb:`<svg viewBox="0 0 300 140"><circle cx="40" cy="70" r="16" fill="#FDE68A"/><path d="M56 70 H140" stroke="#FDE68A" stroke-width="10" opacity=".5"/><rect x="140" y="30" width="10" height="80" fill="#BAE6FD" opacity=".6" stroke="#94A3B8"/><path d="M150 70 H230" stroke="#FDE68A" stroke-width="6" opacity=".35"/><rect x="230" y="50" width="40" height="40" rx="6" fill="#334155"/></svg>`,
  challenges:[
    { id:"base",  title:"No sample", text:"Read the light meter with no sample in place." },
    { id:"six",   title:"Six samples", text:"Test and classify six samples." },
    { id:"three", title:"All three kinds", text:"Find at least one transparent, one translucent and one opaque material." }
  ],
  columns:[{key:"s",label:"Sample"},{key:"lux",label:"Reading / lux",dp:0},{key:"pct",label:"Transmitted / %",dp:0},{key:"cls",label:"Your answer"},{key:"ok",label:"Correct?"}],
  questions:[
    { q:"What is the difference between transparent and translucent?",
      a:"Both let light through. A transparent material lets light pass straight through so a clear image is seen. A translucent material scatters the light, so light gets through but no clear image can be seen." },
    { q:"Why is the reading with no sample needed?",
      a:"It is the reference value. The percentage transmitted is the reading with the sample ÷ the reading without it × 100." },
    { q:"Why should the room lights be off or the meter shielded?",
      a:"Light from the room would add to the meter reading and make the transmission seem larger, especially for opaque samples." },
    { q:"Give one use each of a translucent and an opaque material.",
      a:"Frosted glass in a bathroom window lets light in but keeps privacy. Curtains or blinds made of an opaque material block light completely." }
  ],
  setup(ctx){
    const S = [["Clear glass",.91,"t"],["Clear Perspex",.92,"t"],["Water in a clear tank",.88,"t"],["Frosted glass",.66,"tl"],["Tracing paper",.48,"tl"],["Greaseproof paper",.38,"tl"],["White card",0,"o"],["Aluminium foil",0,"o"],["Wood",0,"o"]];
    const BASE = 820;
    let cur = null, done = {};
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="tm-svg"><defs>${Kit.DEFS}<filter id="tm-blur"><feGaussianBlur id="tm-sd" stdDeviation="0"/></filter></defs>${Kit.bench(960, 450)}
      <g transform="translate(110 260)"><rect x="-40" y="-36" width="60" height="72" rx="8" fill="#334155"/><circle cx="20" r="20" fill="#FDE68A"/><text x="-10" y="64" text-anchor="middle" class="k-lbl">lamp</text></g>
      <path id="tm-beam1" d="M130 240 L430 230 V290 L130 280z" fill="#FDE68A" opacity=".25"/><path id="tm-beam2" d="M450 230 L720 225 V295 L450 290z" fill="#FDE68A"/>
      <g id="tm-sample"></g>
      <g transform="translate(720 220)"><rect width="90" height="80" rx="10" fill="#1F2937" stroke="#4B5563"/><rect x="10" y="10" width="70" height="30" rx="4" fill="#132A1F"/><text id="tm-lux" x="74" y="32" text-anchor="end" class="k-lcd" style="font-size:16px">0</text><text x="45" y="64" text-anchor="middle" style="font:600 9px Inter;fill:#94A3B8">LIGHT METER · lux</text></g>
      <g transform="translate(560 70)"><rect width="300" height="110" rx="12" fill="color-mix(in srgb,var(--bg-card) 88%,transparent)" stroke="var(--brd2)"/><text x="14" y="22" class="k-lbl">looking through the sample at a picture</text>
        <rect x="90" y="32" width="120" height="68" fill="#F8FAFC"/><g id="tm-pic" filter="url(#tm-blur)"><circle cx="150" cy="58" r="14" fill="#F59E0B"/><path d="M100 96 L130 70 L150 84 L175 62 L200 96z" fill="#22C55E"/><text x="150" y="58" text-anchor="middle" dy="4" style="font:700 10px Inter;fill:#0F172A">A</text></g><rect id="tm-cover" x="90" y="32" width="120" height="68" fill="#475569" opacity="0"/></g>
      <text x="24" y="34" class="k-status" id="tm-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#tm-svg"), $ = s => svg.querySelector(s);
    const lux = () => Math.round(BASE*(cur ? cur[1] : 1) + 2 + Math.random()*2);
    function draw(){
      const f = cur ? cur[1] : 1;
      $("#tm-sample").innerHTML = cur ? `<rect x="430" y="200" width="20" height="120" fill="${cur[2] === "t" ? "rgba(186,230,253,.45)" : cur[2] === "tl" ? "rgba(241,245,249,.8)" : cur[0] === "Wood" ? "#C69660" : cur[0] === "Aluminium foil" ? "#CBD5E1" : "#F8FAFC"}" stroke="#94A3B8"/><text x="440" y="344" text-anchor="middle" class="k-tag">${cur[0]}</text>` : `<text x="440" y="344" text-anchor="middle" class="k-lbl">no sample</text>`;
      $("#tm-beam2").setAttribute("opacity", .25*f);
      $("#tm-sd").setAttribute("stdDeviation", cur && cur[2] === "tl" ? 6 + (1 - cur[1])*8 : 0);
      $("#tm-cover").setAttribute("opacity", cur && cur[2] === "o" ? 1 : cur && cur[2] === "tl" ? .15 : 0);
      $("#tm-lux").textContent = lux();
      $("#tm-status").textContent = !cur ? "Read the meter with no sample, then choose a sample" : done[cur[0]] ? "Recorded — try another sample" : "Transparent, translucent or opaque?";
      ctx.readout([["Sample", cur ? cur[0] : "none"], ["Meter", lux() + " lux"]]);
    }
    ctx.frame(() => draw());
    ctx.buttons([{ label:"Record the reading with no sample", onClick(){ if(cur) return ctx.toast("Remove the sample first"); ctx.record({ s:"none", lux:lux(), pct:100, cls:"—", ok:"" }); ctx.complete("base"); } }]);
    ctx.select({ label:"Sample", value:"", options:[["", "— none —"]].concat(S.map(m => [m[0], m[0]])), onChange(v){ cur = S.find(m => m[0] === v) || null; cls.set(null); } });
    const cls = ctx.seg({ label:"This material is…", value:null, options:[["t","transparent"],["tl","translucent"],["o","opaque"]], onChange(v){
      if(!cur || !v) return; if(done[cur[0]]) return ctx.toast("Already recorded this one");
      const ok = v === cur[2], L = lux(); done[cur[0]] = cur[2];
      ctx.record({ s:cur[0], lux:L, pct:Math.round(L/BASE*100), cls:{ t:"transparent", tl:"translucent", o:"opaque" }[v], ok:ok ? "✓" : "✗" });
      if(Object.keys(done).length >= 6) ctx.complete("six");
      const kinds = new Set(Object.values(done)); if(kinds.size === 3) ctx.complete("three");
      ctx.toast(ok ? "Correct" : "Look at the meter and at the picture again");
    } });
    draw();
  }
});

/* ───────────── CONVERGING AND DIVERGING LENSES ON A PARALLEL BEAM ───────────── */
Lab.register({
  id:"lensbeam", subject:"physics", level:["igcse"], topic:"Light · Thin lenses", interactive:true,
  title:"Lenses and a parallel beam",
  summary:"Shine a ray box's parallel rays through converging and diverging lenses, find the principal focus and measure each focal length.",
  aim:"Describe the action of converging and diverging lenses on a parallel beam of light and measure their focal lengths.",
  variables:{ iv:"Type of lens", dv:"Focal length f (cm)", cv:["Rays parallel to the principal axis","Lens centred on the axis"] },
  stageTitle:"Ray box and lens on paper", controlsTitle:"Lens",
  thumb:`<svg viewBox="0 0 300 140"><path d="M20 40 H140 L230 70 M20 70 H230 M20 100 H140 L230 70" stroke="#FDE68A" stroke-width="2" fill="none"/><path d="M140 20 q14 50 0 100 q-14 -50 0 -100z" fill="#BAE6FD" opacity=".6" stroke="#38BDF8"/></svg>`,
  challenges:[
    { id:"conv",  title:"Converging lens", text:"Find the focal length of the converging lens (f = 10 cm or 15 cm)." },
    { id:"both",  title:"Two converging lenses", text:"Measure both converging lenses: which is more powerful?" },
    { id:"div",   title:"Diverging lens", text:"Trace the rays back to find the focal length of the diverging lens." }
  ],
  columns:[{key:"lens",label:"Lens"},{key:"f",label:"f / cm",dp:1}],
  questions:[
    { q:"What is the principal focus of a converging lens?",
      a:"The point on the principal axis where rays that were parallel to the axis meet after passing through the lens." },
    { q:"What does a diverging lens do to a parallel beam?",
      a:"It spreads the rays out so they appear to come from a point on the axis on the same side as the ray box. That point is its principal focus, and the focus is virtual." },
    { q:"Which converging lens is more powerful, and why?",
      a:"The f = 10 cm lens — it is fatter, bends the rays more and brings them to a focus closer to the lens." },
    { q:"Why do we draw the diverging rays back with dashed lines?",
      a:"No light actually travels back there. The dashed lines show where the rays appear to come from, which locates the virtual focus." }
  ],
  setup(ctx){
    const LENSES = { c10:["Converging, f = 10 cm",10], c15:["Converging, f = 15 cm",15], d15:["Diverging, f = −15 cm",-15] };
    const S = 14, LX = 380, AY = 250, NR = 5;
    let lens = "c10", mx = LX + 150, back = false;
    const f = () => LENSES[lens][1];
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="lb-svg"><defs>${Kit.DEFS}</defs>
      <rect width="960" height="500" fill="#F8FAFC" opacity=".05"/>
      <g id="lb-rule"></g><g id="lb-rays"></g><g id="lb-lens"></g><g id="lb-mark"></g>
      <g transform="translate(40 ${AY})"><rect x="0" y="-70" width="70" height="140" rx="8" fill="#334155"/><text x="35" y="90" text-anchor="middle" class="k-lbl">ray box</text></g>
      <line x1="40" y1="${AY}" x2="940" y2="${AY}" stroke="var(--txt3,#64748B)" stroke-dasharray="6 6"/>
      <text x="24" y="34" class="k-status" id="lb-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#lb-svg"), $ = s => svg.querySelector(s);
    let rule = `<rect x="${LX - 22*S}" y="${AY + 120}" width="${54*S}" height="30" fill="url(#k-wood)" stroke="#7B4F2C"/>`;
    for(let mm = -220; mm <= 320; mm += 5){ const x = LX + mm*S/10, big = mm % 50 === 0, cm = mm % 10 === 0; rule += `<line x1="${x}" y1="${AY + 120}" x2="${x}" y2="${AY + 120 + (big ? 13 : cm ? 9 : 5)}" stroke="#4B3621" stroke-width="${big ? 1 : .6}"/>`; if(mm % 50 === 0) rule += `<text x="${x}" y="${AY + 145}" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#4B3621">${mm/10}</text>`; }
    $("#lb-rule").innerHTML = rule + `<text x="${LX}" y="${AY + 166}" text-anchor="middle" class="k-lbl">0 at the centre of the lens · cm</text>`;
    function draw(){
      const F = f(), conv = F > 0;
      const h = conv ? (F === 10 ? 22 : 14) : 14;
      $("#lb-lens").innerHTML = conv
        ? `<path d="M${LX} ${AY - 100} q${h} 100 0 200 q${-h} -100 0 -200z" fill="rgba(186,230,253,.45)" stroke="#38BDF8" stroke-width="2"/>`
        : `<path d="M${LX - 12} ${AY - 100} h24 q-${h} 100 0 200 h-24 q${h} -100 0 -200z" fill="rgba(186,230,253,.45)" stroke="#38BDF8" stroke-width="2"/>`;
      let r = "";
      for(let i = 0; i < NR; i++){
        const y = AY + (i - (NR - 1)/2)*30, fx = LX + F*S;
        r += `<line x1="110" y1="${y}" x2="${LX}" y2="${y}" stroke="#F59E0B" stroke-width="2"/>`;
        // after the lens the ray heads towards (conv) or away from (div) the focus
        const dx = fx - LX, dy = AY - y, t = (940 - LX)/Math.abs(dx || 1);
        const ex = conv ? LX + dx*t : LX + Math.abs(dx)*t, ey = conv ? y + dy*t : y - dy*t;
        r += `<line x1="${LX}" y1="${y}" x2="${ex}" y2="${ey}" stroke="#F59E0B" stroke-width="2"/>`;
        if(!conv && back) r += `<line x1="${LX}" y1="${y}" x2="${fx}" y2="${AY}" stroke="#F59E0B" stroke-width="1.2" stroke-dasharray="5 4" opacity=".8"/>`;
      }
      $("#lb-rays").innerHTML = r;
      $("#lb-mark").innerHTML = `<g transform="translate(${mx} ${AY})" class="k-drag" id="lb-m"><line x1="0" y1="-30" x2="0" y2="118" stroke="#DC2626" stroke-width="2"/><circle r="7" fill="none" stroke="#DC2626" stroke-width="2"/><rect x="-14" y="-40" width="28" height="160" fill="transparent"/></g><text x="${mx}" y="${AY - 42}" text-anchor="middle" class="k-lbl">marker</text>`;
      $("#lb-status").textContent = conv ? "Drag the marker to where the rays meet, then read its position" : back ? "Drag the marker to where the dashed lines meet" : "The rays spread out — trace them back to see where they seem to come from";
      ctx.readout([["Lens", LENSES[lens][0]]]);
    }
    Kit.dragger(ctx, svg, { hit(t){ return t.closest("#lb-m") ? {} : null; }, move(_, p){ mx = Kit.clamp(p.x, LX - 21*S, LX + 31*S); draw(); } });
    ctx.seg({ label:"Lens", value:"c10", options:[["c10","Converging 10 cm"],["c15","Converging 15 cm"],["d15","Diverging"]], onChange(v){ lens = v; draw(); } });
    ctx.seg({ label:"Trace the rays back (dashed)", value:false, options:[[false,"Off"],[true,"On"]], onChange(v){ back = v; draw(); } });
    const rd = Kit.reading(ctx, "Marker position on the rule / cm (negative to the left)", "e.g. 10.0", () => (mx - LX)/S, .3, v => {
      rd.clear();
      if(Math.abs(v - f()) > 1) return ctx.toast(f() > 0 ? "That isn't where the rays meet — move the marker" : "Trace the rays back and put the marker where the dashed lines meet");
      ctx.record({ lens:LENSES[lens][0], f:v });
      const done = new Set(ctx.rows().map(r => r.lens));
      if(lens !== "d15") ctx.complete("conv");
      if(done.has(LENSES.c10[0]) && done.has(LENSES.c15[0])) ctx.complete("both");
      if(lens === "d15") ctx.complete("div");
    });
    draw();
  }
});
