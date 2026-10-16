"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · LIGHT — Plane mirror reflection · Converging lens
══════════════════════════════════════════════════════════════════ */

/* ───────────── REFLECTION IN A PLANE MIRROR ───────────── */
Lab.register({
  id:"reflection", subject:"physics", level:["igcse"], topic:"Light · Reflection", interactive:true,
  title:"Reflection in a plane mirror",
  summary:"Swing a ray box round a mirror and read the reflected angle on a protractor; then find the image of a pin using sight lines.",
  aim:"Show that the angle of reflection equals the angle of incidence, and that the image in a plane mirror is as far behind the mirror as the object is in front.",
  variables:{ iv:"Angle of incidence i (°) / object distance", dv:"Angle of reflection r (°) / image distance", cv:["Angles measured from the normal","Thin ray from the ray box","Mirror along the drawn line"] },
  stageTitle:"Mirror on paper", controlsTitle:"Measure",
  thumb:`<svg viewBox="0 0 300 140"><line x1="40" y1="30" x2="260" y2="30" stroke="#CBD5E1" stroke-width="5"/><line x1="150" y1="30" x2="150" y2="130" stroke="#A2ACBD" stroke-dasharray="4 4"/><path d="M70 120 L150 30 L230 120" fill="none" stroke="#FF5C7A" stroke-width="3"/></svg>`,
  challenges:[
    { id:"law",   title:"Law of reflection", text:"Record r for five different angles of incidence." },
    { id:"image", title:"Locate the image", text:"Find the image position (no parallax) for three object distances." }
  ],
  columns:[{key:"mode",label:"Part"},{key:"i",label:"i / ° or u / cm",dp:1},{key:"r",label:"r / ° or v / cm",dp:1}],
  series:"mode",
  graph:{ x:["i"], y:["r"], fit:"linear" },
  questions:[
    { q:"State the law of reflection.",
      a:"The angle of incidence equals the angle of reflection, both measured from the normal." },
    { q:"Describe the image formed by a plane mirror.",
      a:"Virtual, upright, the same size as the object, laterally inverted, and as far behind the mirror as the object is in front." },
    { q:"Why is the image called virtual?",
      a:"The rays do not actually pass through it — they only appear to come from it, so it cannot be formed on a screen." },
    { q:"What is meant by ‘no parallax’ when locating an image with pins?",
      a:"When the image and the search pin are in the same place, they stay lined up as you move your head from side to side." }
  ],
  setup(ctx){
    const P = [480, 150], R = 300;
    const MY = 290;                                   // mirror line in the image part
    let mode = "law", i = 35, obj = { x:420, y:420 }, img = { x:600, y:150 }, eyes = [{ x:280, y:505 }, { x:700, y:505 }], showProt = true;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 540" class="kb" id="rf-svg"><defs>${Kit.DEFS}
      <pattern id="rf-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#64748B" stroke-width="2"/></pattern></defs>
      <rect x="40" y="40" width="880" height="480" rx="6" fill="#F8FAFC" opacity=".96"/><g id="rf-scene"></g><text x="56" y="70" class="k-status" style="fill:#0F172A" id="rf-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#rf-svg"), $ = s => svg.querySelector(s);
    const rad = d => d*Math.PI/180;
    const image = () => ({ x:obj.x, y:2*MY - obj.y + 60 });   // pin heads (30 px above the base) mirror in the line

    function drawLaw(){
      const B = [P[0] - R*Math.sin(rad(i)), P[1] + R*Math.cos(rad(i))], Rf = [P[0] + R*Math.sin(rad(i)), P[1] + R*Math.cos(rad(i))];
      let s = `<rect x="160" y="120" width="640" height="30" fill="url(#rf-hatch)"/><line x1="160" y1="150" x2="800" y2="150" stroke="#334155" stroke-width="4"/>
        <text x="808" y="146" style="font:600 11px Inter;fill:#334155">mirror</text>
        <line x1="${P[0]}" y1="150" x2="${P[0]}" y2="500" stroke="#64748B" stroke-dasharray="6 5"/><text x="${P[0] + 6}" y="496" style="font:500 11px Inter;fill:#64748B">normal</text>`;
      if(showProt){
        s += `<path d="M${P[0] - 160} 150 A160 160 0 0 0 ${P[0] + 160} 150 Z" fill="rgba(125,211,252,.12)" stroke="#0EA5E9" stroke-width="1.2"/>`;
        for(let a = 0; a <= 90; a++){
          [-1, 1].forEach(sg => {
            const L = a % 10 === 0 ? 16 : a % 5 === 0 ? 10 : 5, x1 = P[0] + sg*160*Math.sin(rad(a)), y1 = 150 + 160*Math.cos(rad(a)), x2 = P[0] + sg*(160 - L)*Math.sin(rad(a)), y2 = 150 + (160 - L)*Math.cos(rad(a));
            s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0369A1" stroke-width="${a % 10 ? .6 : 1}"/>`;
            if(a % 10 === 0 && a < 90) s += `<text x="${P[0] + sg*136*Math.sin(rad(a))}" y="${154 + 136*Math.cos(rad(a))}" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#0369A1">${a}</text>`;
          });
        }
      }
      s += `<line x1="${B[0]}" y1="${B[1]}" x2="${P[0]}" y2="${P[1]}" stroke="#EF4444" stroke-width="3"/><line x1="${P[0]}" y1="${P[1]}" x2="${Rf[0]}" y2="${Rf[1]}" stroke="#EF4444" stroke-width="3"/>
`;
      s += `<g id="rf-box" class="k-drag" transform="translate(${B[0]} ${B[1]}) rotate(${i - 90})"><rect x="-26" y="-18" width="70" height="36" rx="6" fill="#1F2937"/><rect x="40" y="-4" width="8" height="8" fill="#FDE68A"/><text x="8" y="5" text-anchor="middle" style="font:700 9px Inter;fill:#E5E7EB">RAY BOX</text><rect x="-40" y="-30" width="100" height="60" fill="transparent"/></g>`;
      return s;
    }
    function drawImage(){
      const I = image();
      let s = `<rect x="160" y="${MY - 30}" width="640" height="30" fill="url(#rf-hatch)"/><line x1="160" y1="${MY}" x2="800" y2="${MY}" stroke="#334155" stroke-width="4"/>
        <rect x="160" y="50" width="640" height="${MY - 80}" fill="rgba(148,163,184,.12)"/><text x="790" y="${MY - 40}" text-anchor="end" style="font:500 11px Inter;fill:#64748B">behind the mirror</text>`;
      eyes.forEach((e, k) => {
        const oh = obj.y - 30, M = [obj.x + (e.x - obj.x)*(oh - MY)/((oh - MY) + (e.y - MY)), MY];
        s += `<line x1="${obj.x}" y1="${oh}" x2="${M[0]}" y2="${M[1]}" stroke="#EF4444" stroke-width="2"/><line x1="${M[0]}" y1="${M[1]}" x2="${e.x}" y2="${e.y}" stroke="#EF4444" stroke-width="2"/>
          <line x1="${M[0]}" y1="${M[1]}" x2="${M[0] + (M[0] - e.x)*.9}" y2="${M[1] + (M[1] - e.y)*.9}" stroke="#EF4444" stroke-width="1.4" stroke-dasharray="5 4"/>
          <line x1="${e.x}" y1="${e.y}" x2="${img.x}" y2="${img.y - 30}" stroke="#2563EB" stroke-width="1" opacity=".55"/>`;
        s += `<g data-eye="${k}" class="k-drag" transform="translate(${e.x} ${e.y})"><ellipse rx="18" ry="10" fill="#fff" stroke="#334155"/><circle r="6" fill="#1E3A8A"/><rect x="-24" y="-16" width="48" height="32" fill="transparent"/></g>`;
      });
      s += `<g id="rf-obj" class="k-drag" transform="translate(${obj.x} ${obj.y})"><line x1="0" y1="-30" x2="0" y2="0" stroke="#334155" stroke-width="2"/><circle cy="-30" r="6" fill="#EF4444"/><text x="10" y="4" style="font:600 11px Inter;fill:#334155">object pin</text><rect x="-16" y="-40" width="32" height="44" fill="transparent"/></g>`;
      s += `<g id="rf-img" class="k-drag" transform="translate(${img.x} ${img.y})"><line x1="0" y1="-30" x2="0" y2="0" stroke="#334155" stroke-width="2"/><circle cy="-30" r="6" fill="#2563EB"/><text x="10" y="4" style="font:600 11px Inter;fill:#334155">search pin</text><rect x="-16" y="-40" width="32" height="44" fill="transparent"/></g>`;
      s += `<line x1="${obj.x}" y1="${obj.y - 30}" x2="${obj.x}" y2="${MY}" stroke="#94A3B8" stroke-dasharray="2 4"/><text x="${obj.x + 6}" y="${(obj.y + MY)/2}" style="font:600 10px 'JetBrains Mono';fill:#475569">u = ${((obj.y - 30 - MY)/10).toFixed(1)} cm</text>`;
      return s;
    }
    function draw(){
      $("#rf-scene").innerHTML = mode === "law" ? drawLaw() : drawImage();
      const I = image(), hit = Math.hypot(img.x - I.x, img.y - I.y) < 7;
      $("#rf-status").textContent = mode === "law" ? "Drag the ray box round — read the reflected angle on the protractor" : hit ? "No parallax — the search pin lines up from both eyes ✓" : "Drag the blue search pin until it lines up with both sight lines";
      ctx.readout(mode === "law" ? [["Angle of incidence", i + "°"], ["Protractor", showProt ? "on" : "off"]] : [["Object distance u", ((obj.y - 30 - MY)/10).toFixed(1) + " cm"], ["Search pin", ((MY - img.y + 30)/10).toFixed(1) + " cm behind", hit ? "good" : ""]]);
    }
    Kit.dragger(ctx, svg, {
      hit(t){ if(t.closest("#rf-box")) return "box"; if(t.closest("#rf-obj")) return "obj"; if(t.closest("#rf-img")) return "img"; const e = t.closest("[data-eye]"); return e ? "e" + e.dataset.eye : null; },
      move(k, p){
        if(k === "box"){ i = Kit.clamp(Math.round(Math.atan2(P[0] - p.x, p.y - P[1])*180/Math.PI), 0, 80); }
        else if(k === "obj"){ obj.x = Kit.clamp(p.x, 220, 740); obj.y = Kit.clamp(Kit.snap(p.y + 15, 5), MY + 70, 470); }
        else if(k === "img"){ img.x = Kit.clamp(p.x, 180, 780); img.y = Kit.clamp(p.y + 15, 90, MY - 2); }
        else { const e = eyes[+k[1]]; e.x = Kit.clamp(p.x, 180, 780); e.y = Kit.clamp(p.y, 480, 520); }
        draw();
      }
    });
    ctx.seg({ label:"Part", value:"law", options:[["law","Law of reflection"],["image","Image position"]], onChange(v){ mode = v; draw(); } });
    ctx.seg({ label:"Protractor", value:true, options:[[true,"Show"],[false,"Hide"]], onChange(v){ showProt = v; draw(); } });
    Kit.reading(ctx, "Angle of reflection r / °", "read the protractor", () => mode === "law" ? i : null, 1, v => {
      ctx.record({ mode:"Reflection angles", i, r:v }); ctx.toast("Recorded");
      if(new Set(ctx.rows().filter(r => r.mode === "Reflection angles").map(r => r.i)).size >= 5) ctx.complete("law");
    });
    ctx.buttons([{ label:"Record image position", block:true, onClick(){
      if(mode !== "image") return ctx.toast("Switch to the image-position part");
      const I = image(); if(Math.hypot(img.x - I.x, img.y - I.y) >= 7) return ctx.toast("There is still parallax — move the search pin");
      ctx.record({ mode:"Image distances", i:Kit.round((obj.y - 30 - MY)/10, 1), r:Kit.round((MY - img.y + 30)/10, 1) });
      if(new Set(ctx.rows().filter(r => r.mode === "Image distances").map(r => r.i)).size >= 3) ctx.complete("image");
    } }]);
    ctx.html(`<p class="hint">In the image part, move the eyes too: the dashed lines (where the rays seem to come from) all meet at the image.</p>`);
    draw();
  }
});

/* ───────────── CONVERGING LENS ───────────── */
Lab.register({
  id:"lens", subject:"physics", level:["igcse","as"], topic:"Light · Lenses", interactive:true,
  title:"Converging lens on an optical bench",
  summary:"Slide the lens and screen until the image of the illuminated object is sharp. Measure u and v, and find the focal length.",
  aim:"Investigate how the image distance v depends on the object distance u for a converging lens, and determine its focal length.",
  variables:{ iv:"Object distance u (cm)", dv:"Image distance v (cm) for a sharp image", cv:["Same lens","Object and lens centres on the same axis","Distances measured from the centre of the lens"] },
  stageTitle:"Optical bench", controlsTitle:"Measure",
  thumb:`<svg viewBox="0 0 300 140"><line x1="20" y1="110" x2="280" y2="110" stroke="#D9B07A" stroke-width="6"/><rect x="34" y="50" width="20" height="50" rx="3" fill="#FBBF24"/><path d="M150 40 Q162 75 150 108 Q138 75 150 40Z" fill="#7DD3FC" opacity=".7"/><rect x="246" y="40" width="8" height="66" fill="#F8FAFC"/><path d="M54 62 L150 75 L250 92" stroke="#FDE68A" fill="none"/></svg>`,
  challenges:[
    { id:"five", title:"Five sharp images", text:"Record u and v for five different object distances." },
    { id:"f",    title:"Focal length", text:"Find f using 1/u + 1/v = 1/f (or a graph)." },
    { id:"virt", title:"Magnifying glass", text:"Move the lens closer than f and look through it." }
  ],
  columns:[{key:"u",label:"u / cm",dp:1},{key:"v",label:"v / cm",dp:1},{key:"iu",label:"1/u / cm⁻¹",dp:4},{key:"iv",label:"1/v / cm⁻¹",dp:4},{key:"m",label:"Magnification v/u",dp:2}],
  graph:{ x:["iu","u"], y:["iv","v"], fit:"linear" },
  questions:[
    { q:"How do you find the focal length roughly before starting?",
      a:"Focus the image of a distant object (e.g. a window) on a screen. The lens-to-screen distance is approximately f." },
    { q:"What does a graph of 1/v against 1/u look like and how do you get f?",
      a:"A straight line with gradient −1. Both intercepts equal 1/f, so f = 1 ÷ intercept." },
    { q:"Describe the image when u is between f and 2f.",
      a:"Real, inverted and magnified (larger than the object), formed beyond 2f on the other side." },
    { q:"What happens when the object is closer than f?",
      a:"No real image forms on a screen. Looking through the lens you see a virtual, upright, magnified image — a magnifying glass." },
    { q:"Why is it difficult to find the exact position of the sharpest image?",
      a:"The image looks sharp over a small range of screen positions. Move the screen from both sides and take the middle, or repeat and average." }
  ],
  setup(ctx){
    const f = Kit.round(10 + Math.random()*8, 1), OBJ = 5;
    const X0 = 60, PPC = 8.4, AXIS = 260;
    let lensAt = 30, screenAt = 70, look = false;
    const X = c => X0 + c*PPC;
    const u = () => lensAt - OBJ, vTrue = () => { const uu = u(); return uu > f ? 1/(1/f - 1/uu) : null; }, v = () => screenAt - lensAt;

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="ln-svg"><defs>${Kit.DEFS}<filter id="ln-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur id="ln-fb" stdDeviation="0"/></filter>
        <radialGradient id="ln-spot"><stop offset="0" stop-color="#FFF7D6"/><stop offset="1" stop-color="#FFF7D6" stop-opacity="0"/></radialGradient></defs>
      ${Kit.bench(960, 420)}
      <rect x="${X0 - 10}" y="330" width="${100*PPC + 20}" height="22" rx="3" fill="url(#k-wood)" stroke="#7B4F2C"/>
      ${(() => { let t = ""; for(let c = 0; c <= 100; c++){ const x = X(c), L = c % 10 === 0 ? 12 : c % 5 === 0 ? 8 : 4; t += `<line x1="${x}" y1="330" x2="${x}" y2="${330 + L}" stroke="#4B3621" stroke-width=".8"/>`; if(c % 10 === 0) t += `<text x="${x}" y="350" text-anchor="middle" style="font:600 8px 'JetBrains Mono';fill:#4B3621">${c}</text>`; } return t; })()}
      <g id="ln-scene"></g>
      <g transform="translate(700 40)"><rect width="230" height="180" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="12" y="20" style="font:700 9px Inter;fill:#9CA3AF;letter-spacing:.06em" id="ln-viewlbl">VIEW OF THE SCREEN</text>
        <rect x="15" y="30" width="200" height="138" rx="4" fill="#F1F5F9"/><g id="ln-view" filter="url(#ln-blur)"></g></g>
      <text x="24" y="34" class="k-status" id="ln-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ln-svg"), $ = s => svg.querySelector(s);
    const F = (sc, inv) => `<g transform="translate(115 99) scale(${sc}) ${inv ? "rotate(180)" : ""}"><path d="M-6 26 V-26 H18 V-16 H4 V-4 H14 V6 H4 V26 Z" fill="#111827"/></g>`;

    function draw(){
      const uu = u(), vt = vTrue(), vv = v();
      let s = `<g transform="translate(${X(OBJ)} ${AXIS})"><rect x="-40" y="-40" width="34" height="80" rx="6" fill="#334155"/><circle cx="-23" cy="0" r="12" fill="url(#ln-spot)"/><rect x="-6" y="-26" width="6" height="52" fill="#FDE68A"/><text x="-23" y="58" text-anchor="middle" class="k-tag">lamp + object</text>
          <rect x="-10" y="40" width="8" height="30" fill="url(#k-metal)"/></g>`;
      // light rays to lens
      s += `<path d="M${X(OBJ)} ${AXIS - 20} L${X(lensAt)} ${AXIS - 40} M${X(OBJ)} ${AXIS - 20} L${X(lensAt)} ${AXIS + 40}" stroke="#FDE68A" opacity=".35" stroke-width="2"/>`;
      if(vt){
        const xi = X(lensAt + vt), yi = AXIS + 26*vt/uu, xe = Math.min(X(screenAt), xi), fr = (xe - X(lensAt))/(xi - X(lensAt));
        [AXIS - 40, AXIS + 40].forEach(y0 => { s += `<line x1="${X(lensAt)}" y1="${y0}" x2="${xe}" y2="${y0 + (yi - y0)*fr}" stroke="#FDE68A" opacity=".4" stroke-width="2"/>`; });
      }
      s += `<g id="ln-lens" class="k-drag" transform="translate(${X(lensAt)} ${AXIS})"><path d="M0 -62 Q16 0 0 62 Q-16 0 0 -62Z" fill="rgba(125,211,252,.45)" stroke="#0EA5E9" stroke-width="1.5"/>
          <rect x="-4" y="62" width="8" height="8" fill="#334155"/><rect x="-3" y="66" width="6" height="64" fill="url(#k-metal)"/><rect x="-14" y="128" width="28" height="8" rx="2" fill="#334155"/>
          <text y="-72" text-anchor="middle" class="k-tag">lens</text><rect x="-24" y="-80" width="48" height="220" fill="transparent"/></g>`;
      s += `<g id="ln-screen" class="k-drag" transform="translate(${X(screenAt)} ${AXIS})"><rect x="-4" y="-70" width="8" height="140" fill="#F8FAFC" stroke="#94A3B8"/><rect x="-3" y="70" width="6" height="60" fill="url(#k-metal)"/><rect x="-14" y="128" width="28" height="8" rx="2" fill="#334155"/>
          <text y="-80" text-anchor="middle" class="k-tag">screen</text><rect x="-24" y="-90" width="48" height="230" fill="transparent"/></g>`;
      s += `<text x="${X(lensAt)}" y="410" text-anchor="middle" class="k-read">${lensAt.toFixed(1)}</text><text x="${X(screenAt)}" y="410" text-anchor="middle" class="k-read">${screenAt.toFixed(1)}</text><text x="${X(OBJ)}" y="410" text-anchor="middle" class="k-read">${OBJ.toFixed(1)}</text>`;
      $("#ln-scene").innerHTML = s;
      // the screen view: an inverted F, blurred by how far the screen is from the sharp position
      let view = "", blur = 0;
      if(look){ view = uu < f ? F(Math.min(2.4, f/(f - uu))*0.8, false) : `<text x="115" y="104" text-anchor="middle" style="font:600 12px Inter;fill:#64748B">blurred, inverted, far away</text>`; $("#ln-viewlbl").textContent = "LOOKING THROUGH THE LENS"; }
      else{
        $("#ln-viewlbl").textContent = "VIEW OF THE SCREEN";
        if(vt){ const m = vt/uu, d = Math.abs(vv - vt); blur = Math.min(14, d*d*.5 + d*1.2); view = F(Kit.clamp(m*.8, .15, 2.6), true) + (blur > 10 ? `<circle cx="115" cy="99" r="40" fill="#FDE68A" opacity=".5"/>` : ""); }
        else view = `<circle cx="115" cy="99" r="${30 + 30*Math.min(1, (f - uu)/f)}" fill="#FDE68A" opacity=".35"/>`;
      }
      $("#ln-view").innerHTML = view; $("#ln-fb").setAttribute("stdDeviation", blur.toFixed(2));
      const sharp = vt && Math.abs(vv - vt) < .6;
      $("#ln-status").textContent = look ? (uu < f ? "Virtual image: upright and magnified — a magnifying glass" : "Too far — no magnified virtual image") : !vt ? "No sharp image anywhere — the object is inside the focal length" : sharp ? "Sharp image ✓ — record u and v" : "Slide the screen until the image is sharp";
      ctx.readout([["u", uu.toFixed(1) + " cm"], ["Screen − lens", vv.toFixed(1) + " cm"], ["Image", look ? "looking through" : sharp ? "sharp" : vt ? "blurred" : "none on screen", sharp ? "good" : ""]]);
    }
    Kit.dragger(ctx, svg, {
      hit(t){ return t.closest("#ln-lens") ? "lens" : t.closest("#ln-screen") ? "screen" : null; },
      move(k, p){ const c = Kit.snap((p.x - X0)/PPC, .1); if(k === "lens") lensAt = Kit.clamp(c, OBJ + 3, screenAt - 2); else screenAt = Kit.clamp(c, lensAt + 2, 100); draw(); }
    });
    ctx.seg({ label:"View", value:false, options:[[false,"Screen"],[true,"Look through the lens"]], onChange(vv){ look = vv; if(vv && u() < f) ctx.complete("virt"); draw(); } });
    ctx.buttons([{ label:"Record u and v", primary:true, block:true, onClick(){
      const vt = vTrue(); if(!vt || Math.abs(v() - vt) >= .6) return ctx.toast("The image isn’t sharp — adjust the screen");
      const uu = Kit.round(u(), 1), vv = Kit.round(v(), 1);
      ctx.record({ u:uu, v:vv, iu:Kit.round(1/uu, 4), iv:Kit.round(1/vv, 4), m:Kit.round(vv/uu, 2) });
      if(new Set(ctx.rows().map(r => r.u)).size >= 5) ctx.complete("five");
    } }]);
    ctx.buttons([{ label:"◀ screen 0.1 cm", onClick(){ screenAt = Math.max(lensAt + 2, Kit.round(screenAt - .1, 1)); draw(); } }, { label:"screen 0.1 cm ▶", onClick(){ screenAt = Math.min(100, Kit.round(screenAt + .1, 1)); draw(); } }]);
    Kit.answer(ctx, "Focal length f / cm", "e.g. 12.5", val => {
      if(ctx.rows().length < 3) return [false, "Record at least three sharp images first."];
      if(Math.abs(val - f) <= .5){ ctx.complete("f"); return [true, `Correct — f = ${f.toFixed(1)} cm.`]; }
      return [false, "Use 1/f = 1/u + 1/v for each pair and average, or read the intercepts of the 1/v against 1/u graph."];
    });
    draw();
  }
});
