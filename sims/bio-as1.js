"use strict";
/* ══════════════════════════════════════════════════════════════════
   BIOLOGY · AS LEVEL (9700 Paper 3) — part 1: microscopy
   Eyepiece graticule & stage micrometer · Slides and plan diagrams ·
   Mitotic index in a root tip squash
══════════════════════════════════════════════════════════════════ */

/* ───────────── EYEPIECE GRATICULE & STAGE MICROMETER ───────────── */
Lab.register({
  id:"graticule", subject:"biology", level:["as"], topic:"Cell structure · Microscopy", interactive:true,
  title:"Measuring cells with a graticule",
  summary:"Calibrate an eyepiece graticule against a stage micrometer at each objective, then measure onion cells, stomata and red blood cells and work out their actual size.",
  aim:"Calibrate an eyepiece graticule with a stage micrometer and use it to measure the actual sizes of cells.",
  variables:{ iv:"Objective lens and specimen", dv:"Length of a cell in eyepiece units (EPU), converted to µm", cv:["Calibrate again at every objective","Measure along the same axis of each cell","Measure several cells and find a mean"] },
  stageTitle:"View down the microscope", controlsTitle:"Microscope",
  thumb:`<svg viewBox="0 0 300 140"><circle cx="150" cy="70" r="60" fill="#F4EEDC" stroke="#A2ACBD" stroke-width="3"/><line x1="100" y1="70" x2="200" y2="70" stroke="#1F2937" stroke-width="1.5"/>${Array.from({length:21},(_, i) => `<line x1="${100 + i*5}" y1="70" x2="${100 + i*5}" y2="${i % 5 ? 64 : 58}" stroke="#1F2937"/>`).join("")}<rect x="112" y="78" width="60" height="22" rx="4" fill="none" stroke="#0F9A62" stroke-width="2"/></svg>`,
  challenges:[
    { id:"cal",  title:"Calibrate", text:"Find the size of one eyepiece unit at two different objectives." },
    { id:"five", title:"Five cells", text:"Measure five cells of the same specimen." },
    { id:"mag",  title:"Magnification", text:"Work out the magnification of a drawing from your mean cell length." }
  ],
  columns:[{key:"spec",label:"Specimen"},{key:"obj",label:"Objective"},{key:"epu",label:"Length / EPU",dp:0},{key:"k",label:"1 EPU / µm",dp:2},{key:"um",label:"Actual length / µm",dp:1}],
  questions:[
    { q:"Why must the graticule be calibrated again when you change objective lens?",
      a:"The eyepiece graticule stays the same size in the eyepiece, but the specimen is magnified more by a higher-power objective. So one eyepiece unit covers a smaller real distance at ×40 than at ×10." },
    { q:"40 eyepiece units line up with 0.10 mm on the stage micrometer. What is one eyepiece unit?",
      a:"0.10 mm = 100 µm. 100 µm ÷ 40 = 2.5 µm per eyepiece unit." },
    { q:"A red blood cell measures 3 eyepiece units. Why is the percentage uncertainty so large, and how could it be reduced?",
      a:"Reading to the nearest eyepiece unit gives ±0.5 EPU, which is ±17% of 3 EPU. Use a higher magnification, or measure across a row of several touching cells and divide by the number of cells." },
    { q:"How do you calculate the magnification of a drawing?",
      a:"Magnification = length of the drawing ÷ actual length, both in the same units (convert mm to µm by × 1000). For example a 60 mm drawing of a 250 µm cell is 60 000 ÷ 250 = ×240." },
    { q:"Suggest why the lengths of cells of the same type differ, and what you should do about it.",
      a:"Cells are at different stages of growth and are cut or orientated differently on the slide. Measure at least five randomly chosen cells and calculate a mean." }
  ],
  setup(ctx){
    const F = .9 + Math.random()*.2;
    const K = { 4:25*F, 10:10*F, 40:2.5*F };                    // true µm per eyepiece unit
    const CX = 330, CY = 260, R = 222, PX = 4;                  // graticule: 100 EPU = 400 px
    const cal = {};                                             // student's calibrations
    let obj = 10, mode = "cal", spec = "onion", sx = 0, ox = 0, oy = 0, cells = [], target = 0;
    const ppu = () => PX/K[obj];                                // px per µm

    function makeCells(){
      cells = [];
      if(spec === "onion"){
        let y = -260;
        while(y < 260){
          const h = 45 + Math.random()*30; let x = -700 + Math.random()*-120;
          while(x < 700){ const l = 170 + Math.random()*150; cells.push({ x, y, w:l, h, len:l }); x += l; }
          y += h;
        }
      }else if(spec === "stoma"){
        for(let i = 0; i < 9; i++){ const l = 26 + Math.random()*14; cells.push({ x:(i % 3 - 1)*70 + (Math.random() - .5)*20, y:(Math.floor(i/3) - 1)*55 + (Math.random() - .5)*16, len:l, a:(Math.random() - .5)*.4 }); }
      }else{
        for(let i = 0; i < 40; i++){ const d = 6.6 + Math.random()*1.8; cells.push({ x:(Math.random() - .5)*150, y:(Math.random() - .5)*110, len:d }); }
      }
      pickTarget();
    }
    function pickTarget(){
      const near = cells.map((c, i) => [i, Math.hypot(c.x + (c.w || 0)/2, c.y + (c.h || 0)/2)]).sort((a, b) => a[1] - b[1]);
      target = near[Math.floor(Math.random()*Math.min(6, near.length))][0];
    }

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="gr-svg"><defs>${Kit.DEFS}<clipPath id="gr-clip"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath></defs>
      <rect x="0" y="0" width="960" height="520" fill="#0A0D13"/>
      <circle cx="${CX}" cy="${CY}" r="${R + 6}" fill="#000"/>
      <g clip-path="url(#gr-clip)"><rect x="${CX - R}" y="${CY - R}" width="${2*R}" height="${2*R}" fill="#F6F1E3"/><g id="gr-spec"></g><g id="gr-mic"></g><g id="gr-grat"></g></g>
      <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="#333" stroke-width="3"/>
      <g transform="translate(600 40)"><rect width="330" height="200" rx="14" fill="#111827" stroke="#334155"/>
        <text x="16" y="28" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.06em">MICROSCOPE</text>
        <text x="16" y="62" style="font:600 22px 'Space Grotesk';fill:#E5E7EB" id="gr-obj"></text>
        <text x="16" y="92" style="font:500 12px Inter;fill:#9CA3AF" id="gr-slide"></text>
        <text x="16" y="124" style="font:500 12px Inter;fill:#7CFFB2" id="gr-cal"></text>
        <text x="16" y="150" style="font:500 11px Inter;fill:#9CA3AF" id="gr-tip1"></text>
        <text x="16" y="172" style="font:500 11px Inter;fill:#9CA3AF" id="gr-tip2"></text></g>
      <text x="24" y="34" class="k-status" id="gr-status" style="fill:#E5E7EB"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#gr-svg"), $ = s => svg.querySelector(s);

    function draw(){
      // eyepiece graticule (fixed in the eyepiece)
      const g0 = CX - 200, gy = CY;
      let g = `<line x1="${g0}" y1="${gy}" x2="${g0 + 400}" y2="${gy}" stroke="#111" stroke-width="1.2"/>`;
      for(let i = 0; i <= 100; i++){ const x = g0 + i*PX, L = i % 10 === 0 ? 18 : i % 5 === 0 ? 12 : 7;
        g += `<line x1="${x}" y1="${gy}" x2="${x}" y2="${gy - L}" stroke="#111" stroke-width="${i % 10 ? .8 : 1.2}"/>`;
        if(i % 10 === 0) g += `<text x="${x}" y="${gy - 22}" text-anchor="middle" style="font:600 10px 'JetBrains Mono';fill:#111">${i}</text>`; }
      $("#gr-grat").innerHTML = g;
      let m = "", s = "";
      if(mode === "cal"){
        // stage micrometer: 1 mm in 100 divisions of 10 µm, dragged sideways
        const p = ppu(), div = 10*p, x0 = CX - 200 + sx;
        const minor = [1, 5, 10].find(n => n*div >= 3) || 10, lab = [1, 2, 5, 10, 20, 50].find(n => n*div >= 40) || 50;
        m += `<rect x="${x0 - 30}" y="${gy + 2}" width="${100*div + 60}" height="56" fill="#E9E2CC" opacity=".7"/><line x1="${x0}" y1="${gy + 4}" x2="${x0 + 100*div}" y2="${gy + 4}" stroke="#374151" stroke-width="1.2"/>`;
        for(let i = 0; i <= 100; i += minor){ const x = x0 + i*div, L = i % 10 === 0 ? 20 : i % 5 === 0 ? 14 : 8;
          m += `<line x1="${x}" y1="${gy + 4}" x2="${x}" y2="${gy + 4 + L}" stroke="#374151" stroke-width="${i % 10 ? .8 : 1.2}"/>`;
          if(i % lab === 0) m += `<text x="${x}" y="${gy + 40}" text-anchor="middle" style="font:600 10px 'JetBrains Mono';fill:#374151">${(i/100).toFixed(2)}</text>`; }
        m += `<text x="${x0 + 50*div}" y="${gy + 56}" text-anchor="middle" style="font:500 10px Inter;fill:#374151">stage micrometer · mm</text>`;
        m += `<rect id="gr-micdrag" x="${CX - R}" y="${gy + 2}" width="${2*R}" height="60" fill="transparent" class="k-drag"/>`;
      }else{
        const p = ppu();
        const X = v => CX + (v + ox)*p, Y = v => CY + 40 + (v + oy)*p;
        cells.forEach((c, i) => {
          const hit = i === target;
          if(spec === "onion"){
            s += `<rect x="${X(c.x)}" y="${Y(c.y)}" width="${c.w*p}" height="${c.h*p}" fill="${hit ? "#E8F3D8" : "#EFE7CF"}" stroke="${hit ? "#0F9A62" : "#9C8F6A"}" stroke-width="${hit ? 3 : 1.4}"/>`;
            s += `<ellipse cx="${X(c.x + c.w*.35)}" cy="${Y(c.y + c.h*.5)}" rx="${9*p}" ry="${7*p}" fill="#C9B98C" opacity=".8"/>`;
          }else if(spec === "stoma"){
            const cx = X(c.x), cy = Y(c.y), a = c.len/2*p, b = c.len*.36*p;
            s += `<g transform="rotate(${c.a*57.3} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${a}" ry="${b}" fill="#BFD9A0" stroke="${hit ? "#0F9A62" : "#6E8B4E"}" stroke-width="${hit ? 3 : 1.4}"/>
              <ellipse cx="${cx}" cy="${cy}" rx="${a*.7}" ry="${b*.22}" fill="#F6F1E3" stroke="#6E8B4E"/>
              ${[-1, 1].map(k => `<circle cx="${cx + k*a*.2}" cy="${cy + k*b*.55}" r="${1.4*p}" fill="#3F7A2E"/><circle cx="${cx - k*a*.3}" cy="${cy + k*b*.6}" r="${1.4*p}" fill="#3F7A2E"/>`).join("")}</g>`;
          }else{
            const r = c.len/2*p;
            s += `<circle cx="${X(c.x)}" cy="${Y(c.y)}" r="${r}" fill="#E8A3A0" stroke="${hit ? "#0F9A62" : "#B5605B"}" stroke-width="${hit ? 2.4 : 1}"/><circle cx="${X(c.x)}" cy="${Y(c.y)}" r="${r*.45}" fill="#F0BDBA"/>`;
          }
        });
        s += `<rect id="gr-specdrag" x="${CX - R}" y="${CY - R}" width="${2*R}" height="${2*R}" fill="transparent" class="k-drag"/>`;
      }
      $("#gr-mic").innerHTML = m; $("#gr-spec").innerHTML = s;
      $("#gr-obj").textContent = `×${obj} objective · ×10 eyepiece`;
      $("#gr-slide").textContent = mode === "cal" ? "Slide: stage micrometer (1 mm in 100 divisions)" : "Slide: " + { onion:"onion epidermis", stoma:"leaf epidermis (stomata)", rbc:"blood smear" }[spec];
      $("#gr-cal").textContent = cal[obj] ? `Your calibration: 1 EPU = ${cal[obj]} µm` : `Not calibrated at ×${obj} yet`;
      $("#gr-tip1").textContent = mode === "cal" ? "Drag the micrometer so two lines coincide" : "Drag the slide to line the outlined cell";
      $("#gr-tip2").textContent = mode === "cal" ? "with graticule lines far apart." : "up with the graticule scale.";
      $("#gr-status").textContent = mode === "cal" ? "Calibrate: how many µm is one eyepiece unit?" : "Measure the outlined cell in eyepiece units";
      ctx.readout([["Objective", "×" + obj], ["Mode", mode === "cal" ? "calibrating" : "measuring"], ["1 EPU", cal[obj] ? cal[obj] + " µm" : "not calibrated"]]);
    }

    Kit.dragger(ctx, svg, {
      hit(tg, p){ if(tg.id === "gr-micdrag") return { k:"mic", x0:sx, p0:p }; if(tg.id === "gr-specdrag") return { k:"spec", x0:ox, y0:oy, p0:p }; return null; },
      move(h, p){
        if(h.k === "mic") sx = h.x0 + (p.x - h.p0.x);
        else { ox = h.x0 + (p.x - h.p0.x)/ppu(); oy = h.y0 + (p.y - h.p0.y)/ppu(); }
        draw();
      }
    });

    ctx.seg({ label:"Objective lens", value:10, options:[[4,"×4"],[10,"×10"],[40,"×40"]], onChange(v){ obj = v; sx = 0; draw(); } });
    ctx.seg({ label:"On the stage", value:"cal", options:[["cal","Stage micrometer"],["spec","Specimen"]], onChange(v){ mode = v; if(v === "spec" && !cells.length) makeCells(); draw(); } });
    ctx.seg({ label:"Specimen slide", value:"onion", options:[["onion","Onion epidermis"],["stoma","Stomata"],["rbc","Blood smear"]], onChange(v){ spec = v; ox = 0; oy = 0; makeCells(); draw(); } });
    Kit.answer(ctx, "1 eyepiece unit at this objective / µm", "e.g. 2.5", v => {
      if(mode !== "cal") return [false, "Put the stage micrometer on the stage first."];
      if(Math.abs(v - K[obj])/K[obj] <= .03){
        cal[obj] = Kit.round(v, 2); draw();
        ctx.record({ spec:"stage micrometer", obj:"×" + obj, epu:100, k:cal[obj], um:Kit.round(100*cal[obj], 1) });
        if(Object.keys(cal).length >= 2) ctx.complete("cal");
        return [true, `Calibrated: 1 EPU = ${cal[obj]} µm at ×${obj}.`];
      }
      return [false, "Line up the zeros, find where two lines coincide far along, then: 1 EPU = (stage distance in µm) ÷ (number of eyepiece units). Each stage division is 10 µm."];
    });
    const rd = Kit.reading(ctx, "Length of the outlined cell / eyepiece units", "e.g. 46", () => mode === "spec" && cells[target] ? cells[target].len/K[obj] : null,
      1, v => {
        if(!cal[obj]) return ctx.toast(`Calibrate the graticule at ×${obj} first`);
        const name = { onion:"onion epidermal cell", stoma:"stoma (guard cell pair)", rbc:"red blood cell" }[spec];
        ctx.record({ spec:name, obj:"×" + obj, epu:Math.round(v), k:cal[obj], um:Kit.round(Math.round(v)*cal[obj], 1) });
        rd.clear(); pickTarget(); draw();
        const counts = {}; ctx.rows().forEach(r => { if(r.spec !== "stage micrometer") counts[r.spec] = (counts[r.spec] || 0) + 1; });
        if(Object.values(counts).some(n => n >= 5)) ctx.complete("five");
      });
    Kit.answer(ctx, "A drawing of a mean cell is 60 mm long. Magnification?", "e.g. 240", v => {
      const rows = ctx.rows().filter(r => r.spec !== "stage micrometer"); if(!rows.length) return [false, "Measure some cells first."];
      const sp = rows[rows.length - 1].spec, same = rows.filter(r => r.spec === sp), mean = Kit.mean(same.map(r => r.um)), mag = 60000/mean;
      if(Math.abs(v - mag)/mag <= .04){ ctx.complete("mag"); return [true, `Correct: 60 mm = 60 000 µm, ÷ mean ${mean.toFixed(1)} µm (${sp}) = ×${Math.round(mag)}.`]; }
      return [false, `Use the mean of your ${sp} measurements: magnification = 60 000 µm ÷ mean actual length.`];
    });
    makeCells(); draw();
  }
});

/* ───────────── SLIDES & PLAN DIAGRAMS ───────────── */
(function(){
  const ring = (cx, cy, r1, r2) => `M${cx - r2} ${cy}a${r2} ${r2} 0 1 0 ${2*r2} 0a${r2} ${r2} 0 1 0 ${-2*r2} 0Z` + (r1 > 0 ? `M${cx - r1} ${cy}a${r1} ${r1} 0 1 1 ${2*r1} 0a${r1} ${r1} 0 1 1 ${-2*r1} 0Z` : "");
  const circ = (cx, cy, r) => ring(cx, cy, 0, r);
  const wedge = (cx, cy, r1, r2, a0, a1) => { const p = (r, a) => `${cx + r*Math.cos(a)} ${cy + r*Math.sin(a)}`;
    return `M${p(r1, a0)}L${p(r2, a0)}A${r2} ${r2} 0 0 1 ${p(r2, a1)}L${p(r1, a1)}A${r1} ${r1} 0 0 0 ${p(r1, a0)}Z`; };
  /* each slide: list of regions [tissue, path, fill, labelX, labelY]; later regions sit on top */
  const SLIDES = {
    stem:{ name:"TS dicotyledonous stem", tissues:["epidermis","cortex","phloem","cambium","xylem","pith"], regions(){
      const out = [["epidermis", ring(300, 250, 196, 204), "#C79BC4", 300, 40], ["cortex", ring(300, 250, 92, 196), "#EBD3E6", 300, 80], ["pith", circ(300, 250, 92), "#F3E3EE", 300, 250]];
      for(let i = 0; i < 8; i++){ const a = i*Math.PI/4 - Math.PI/2, d = .2;
        out.push(["phloem", wedge(300, 250, 124, 140, a - d, a + d), "#8E6BBF", 0, 0], ["cambium", wedge(300, 250, 117, 124, a - d, a + d), "#D9C7EF", 0, 0], ["xylem", wedge(300, 250, 92, 117, a - d*.8, a + d*.8), "#D2456E", 0, 0]); }
      out.find(r => r[0] === "phloem").splice(3, 2, 300, 108); out.find(r => r[0] === "cambium").splice(3, 2, 380, 165); out.find(r => r[0] === "xylem").splice(3, 2, 300, 150);
      return out; } },
    root:{ name:"TS dicotyledonous root", tissues:["epidermis","cortex","endodermis","pericycle","xylem","phloem"], regions(){
      const out = [["epidermis", ring(300, 250, 192, 200), "#C79BC4", 300, 40], ["cortex", ring(300, 250, 74, 192), "#EBD3E6", 300, 100], ["endodermis", ring(300, 250, 68, 74), "#7A4FA8", 380, 250], ["pericycle", circ(300, 250, 68), "#F1E4F2", 300, 200]];
      out.push(["xylem", "M300 190L312 238L360 250L312 262L300 310L288 262L240 250L288 238Z", "#D2456E", 300, 250]);
      [[338, 212], [262, 212], [262, 288], [338, 288]].forEach(([x, y]) => out.push(["phloem", circ(x, y, 13), "#8E6BBF", 0, 0]));
      out.find(r => r[0] === "phloem").splice(3, 2, 338, 212);
      return out; } },
    leaf:{ name:"TS dicotyledonous leaf", tissues:["upper epidermis","palisade mesophyll","spongy mesophyll","lower epidermis","xylem","phloem","guard cell"], regions(){
      const out = [["upper epidermis", "M40 110H560V124H40Z", "#C79BC4", 150, 105], ["palisade mesophyll", "M40 124H560V200H40Z", "#7FB069", 150, 165],
        ["spongy mesophyll", "M40 200H560V290H40Z", "#C5DFA4", 150, 250], ["lower epidermis", "M40 290H560V304H40Z", "#C79BC4", 150, 322]];
      out.push(["xylem", circ(400, 228, 18), "#D2456E", 400, 228], ["phloem", "M374 254a26 18 0 0 0 52 0Z", "#8E6BBF", 400, 278]);
      out.push(["guard cell", "M230 290a10 7 0 1 0 0.1 0Z", "#3F7A2E", 220, 322], ["guard cell", "M262 290a10 7 0 1 0 0.1 0Z", "#3F7A2E", 0, 0]);
      return out; } },
    marram:{ name:"TS xerophytic leaf (marram grass)", tissues:["thick waxy cuticle","sclerenchyma","mesophyll","vascular bundle","hinge cells","hairs","sunken stoma"], regions(){
      const out = [["thick waxy cuticle", ring(300, 250, 188, 200), "#E0B84C", 300, 40], ["sclerenchyma", ring(300, 250, 172, 188), "#C2607D", 300, 72], ["mesophyll", circ(300, 250, 172), "#9CC57E", 300, 110]];
      let furrow = "M300 250"; const n = 6;
      for(let i = 0; i < n; i++){ const a = i*2*Math.PI/n, b = a + Math.PI/n;
        furrow += `L${300 + 150*Math.cos(b - .08)} ${250 + 150*Math.sin(b - .08)}L${300 + 150*Math.cos(b + .08)} ${250 + 150*Math.sin(b + .08)}L300 250`; }
      out.push(["air space (rolled leaf)", furrow + "Z", "#F6F1E3", 0, 0]);
      for(let i = 0; i < n; i++){ const a = i*2*Math.PI/n, b = a + Math.PI/n;
        out.push(["vascular bundle", circ(300 + 110*Math.cos(a), 250 + 110*Math.sin(a), 14), "#B9516E", i ? 0 : 410, i ? 0 : 250]);
        out.push(["hinge cells", circ(300 + 40*Math.cos(b), 250 + 40*Math.sin(b), 9), "#B8D8F0", i ? 0 : 300 + 40*Math.cos(b), i ? 0 : 250 + 40*Math.sin(b) + 20]);
        out.push(["sunken stoma", circ(300 + 125*Math.cos(b), 250 + 125*Math.sin(b), 6), "#3F7A2E", i ? 0 : 300 + 125*Math.cos(b) + 30, i ? 0 : 250 + 125*Math.sin(b)]);
        for(let k = 1; k <= 3; k++){ const rr = 55 + k*24, aa = b + (k % 2 ? .06 : -.06);
          out.push(["hairs", `M${300 + rr*Math.cos(aa) - 3} ${250 + rr*Math.sin(aa) - 3}h6v6h-6Z`, "#F2F2F2", i || k > 1 ? 0 : 300 + rr*Math.cos(aa) - 40, i || k > 1 ? 0 : 250 + rr*Math.sin(aa) + 12]); }
      }
      return out; } },
    vessels:{ name:"TS artery, vein and capillary", tissues:["artery: lumen","artery: tunica intima","artery: tunica media","artery: tunica externa","vein: lumen","vein: tunica media","vein: tunica externa","capillary"], regions(){
      return [["capillary", ring(300, 430, 5, 10), "#9C5BA8", 300, 430], ["capillary lumen", circ(300, 430, 5), "#E0646A", 0, 0], ["artery: tunica externa", ring(180, 250, 98, 122), "#EAC4D2", 180, 112], ["artery: tunica media", ring(180, 250, 44, 98), "#C2607D", 180, 180],
        ["artery: tunica intima", ring(180, 250, 38, 44), "#7A2E4A", 180, 300], ["artery: lumen", circ(180, 250, 38), "#FBF4F7", 180, 254],
        ["vein: tunica externa", "M330 250c0-90 200-110 220-30c20 80-30 140-120 130c-80-8-100-50-100-100Z", "#EAC4D2", 440, 132],
        ["vein: tunica media", "M348 250c0-72 176-90 186-26c10 64-30 112-106 106c-64-6-80-40-80-80Z", "#D88AA4", 440, 370],
        ["vein: lumen", "M362 250c0-60 152-76 160-24c8 52-24 92-92 88c-52-4-68-34-68-64Z", "#FBF4F7", 440, 254]]; } },
    trachea:{ name:"TS trachea wall", tissues:["lumen","ciliated epithelium","goblet cells","glands","cartilage","smooth muscle"], regions(){
      const out = [["lumen", circ(300, 250, 92), "#FBF4F7", 300, 250], ["submucosa", ring(300, 250, 102, 150), "#F2D6E2", 0, 0], ["ciliated epithelium", ring(300, 250, 92, 102), "#9C5BA8", 300, 170]];
      out.push(["cartilage", "M" + [...Array(41)].map((_, i) => { const a = -Math.PI/2 + .5 + i*(2*Math.PI - 1)/40; return `${300 + 182*Math.cos(a)} ${250 + 182*Math.sin(a)}`; }).join("L") + "L" + [...Array(41)].map((_, i) => { const a = -Math.PI/2 + .5 + (40 - i)*(2*Math.PI - 1)/40; return `${300 + 156*Math.cos(a)} ${250 + 156*Math.sin(a)}`; }).join("L") + "Z", "#A9C3E0", 300, 420]);
      out.push(["smooth muscle", wedge(300, 250, 152, 176, -Math.PI/2 - .45, -Math.PI/2 + .45), "#C2607D", 300, 60]);
      [[-.9, 128], [-2.4, 132], [.6, 126], [2.2, 130]].forEach(([a, r], i) => out.push(["glands", circ(300 + r*Math.cos(a), 250 + r*Math.sin(a), 11), "#B887C9", i ? 0 : 300 + r*Math.cos(a) + 40, i ? 0 : 250 + r*Math.sin(a)]));
      for(let i = 0; i < 10; i++){ const a = i*.63 + .2; out.push(["goblet cells", circ(300 + 97*Math.cos(a), 250 + 97*Math.sin(a), 3.6), "#F7F7F7", i ? 0 : 300 + 97*Math.cos(a) + 50, i ? 0 : 250 + 97*Math.sin(a) + 30]); }
      return out; } },
    lung:{ name:"Lung tissue", tissues:["alveolus","squamous epithelium","capillary","bronchiole","smooth muscle","blood vessel"], regions(){
      const out = []; let s = 7;
      const rnd = () => { s = (s*9301 + 49297) % 233280; return s/233280; };
      for(let i = 0; i < 70; i++){ const x = 60 + rnd()*480, y = 60 + rnd()*380; if(Math.hypot(x - 230, y - 240) < 95 || Math.hypot(x - 430, y - 160) < 50) continue;
        out.push(["alveolus", circ(x, y, 18 + rnd()*12), "#FBF4F7", out.length ? 0 : x, out.length ? 0 : y]); }
      const alv = out.slice();
      out.unshift(["squamous epithelium", "M40 40H560V460H40Z", "#E1A9BE", 520, 455]);
      for(let i = 0, n = 0; i < 400 && n < 16; i++){ const x = 50 + rnd()*500, y = 50 + rnd()*400;
        if(Math.hypot(x - 230, y - 240) < 90 || Math.hypot(x - 430, y - 160) < 44) continue;
        if(alv.some(a => { const m = a[1].match(/^M([\d.]+) ([\d.]+)a([\d.]+)/); return m && Math.hypot(x - (+m[1] + +m[3]), y - +m[2]) < +m[3] + 4; })) continue;
        out.push(["capillary", circ(x, y, 4), "#D2343E", n ? 0 : x, n ? 0 : y]); n++; }
      out.push(["smooth muscle", ring(230, 240, 62, 82), "#C2607D", 230, 145], ["bronchiole", ring(230, 240, 46, 62), "#9C5BA8", 230, 240]);
      out.push(["bronchiole lumen", circ(230, 240, 46), "#FBF4F7", 0, 0]);
      out.push(["blood vessel", ring(430, 160, 26, 36), "#C2607D", 430, 160], ["blood vessel", circ(430, 160, 26), "#E0646A", 0, 0]);
      return out; } },
    bronchus:{ name:"TS bronchus wall", tissues:["lumen","ciliated epithelium","goblet cells","glands","cartilage","smooth muscle"], regions(){
      const out = [["lumen", circ(300, 250, 90), "#FBF4F7", 300, 250], ["submucosa", ring(300, 250, 108, 172), "#F2D6E2", 0, 0]];
      out.push(["smooth muscle", ring(300, 250, 106, 117), "#C2607D", 300, 128]);
      out.splice(1, 0, ["ciliated epithelium", ring(300, 250, 90, 103), "#9C5BA8", 222, 190]);
      [[-.4, 1], [.9, 1.1], [2.1, .9], [3.3, 1.2], [4.6, .8], [5.6, 1]].forEach(([a, w], i) => out.push(["cartilage", wedge(300, 250, 132, 166, a, a + .5*w), "#A9C3E0", i ? 0 : 300 + 150*Math.cos(a + .25), i ? 0 : 250 + 150*Math.sin(a + .25)]));
      [[.3, 124], [1.6, 124], [2.8, 124], [4.1, 124], [5.2, 124]].forEach(([a, r], i) => out.push(["glands", circ(300 + r*Math.cos(a + .3), 250 + r*Math.sin(a + .3), 6), "#B887C9", i ? 0 : 300 + r*Math.cos(a + .3) + 34, i ? 0 : 250 + r*Math.sin(a + .3) + 12]));
      for(let i = 0; i < 9; i++){ const a = i*.7 + .1; out.push(["goblet cells", circ(300 + 97*Math.cos(a), 250 + 95*Math.sin(a), 3.4), "#F7F7F7", i ? 0 : 300 + 97*Math.cos(a) + 48, i ? 0 : 250 + 95*Math.sin(a) + 20]); }
      return out; } },
    xylem:{ name:"LS xylem and phloem", tissues:["xylem vessel element","lignin thickening","sieve tube element","sieve plate","companion cell"], regions(){
      const out = [["parenchyma", "M40 40H560V460H40Z", "#EDE3C8", 0, 0]];
      out.push(["xylem vessel element", "M90 40H200V460H90Z", "#FBF4EA", 145, 250]);
      for(let y = 50; y < 460; y += 22) out.push(["lignin thickening", `M90 ${y}H200V${y + 6}H90Z`, "#C2416B", y === 116 ? 230 : 0, y === 116 ? y - 4 : 0]);
      out.push(["xylem vessel element", "M220 40H300V460H220Z", "#FBF4EA", 0, 0]);
      out.push(["lignin thickening", "M220 40H228V460H220Z", "#C2416B", 0, 0], ["lignin thickening", "M292 40H300V460H292Z", "#C2416B", 0, 0]);
      [[340, 40, 170], [340, 210, 150], [340, 360, 100]].forEach(([x, y, h], i) => out.push(["sieve tube element", `M${x} ${y}H${x + 90}V${y + h}H${x}Z`, "#E9F1DA", i ? 0 : x + 45, i ? 0 : y + 70]));
      [210, 360].forEach((y, i) => out.push(["sieve plate", `M340 ${y - 4}H430V${y + 4}H340Z`, "#6E8B4E", i ? 0 : 385, i ? 0 : y - 10]));
      [[440, 60, 120], [440, 210, 130], [440, 360, 90]].forEach(([x, y, h], i) => out.push(["companion cell", `M${x} ${y}H${x + 36}V${y + h}H${x}Z`, "#B9C98F", i ? 0 : x + 18, i ? 0 : y + 60]));
      [[458, 110], [458, 270], [458, 400]].forEach(([x, y]) => out.push(["companion cell", circ(x, y, 9), "#6B7F3E", 0, 0]));
      return out; } },
    blood:{ name:"Blood smear", tissues:["red blood cell","neutrophil","lymphocyte","monocyte"], regions(){
      const out = [["plasma", "M40 40H560V460H40Z", "#FBF1EE", 0, 0]]; let s = 11;
      const rnd = () => { s = (s*9301 + 49297) % 233280; return s/233280; };
      const W = [[150, 160, "neutrophil"], [420, 330, "lymphocyte"], [400, 130, "monocyte"], [200, 370, "neutrophil"]];
      for(let i = 0; i < 90; i++){ const x = 60 + rnd()*480, y = 60 + rnd()*380; if(W.some(w => Math.hypot(x - w[0], y - w[1]) < 44)) continue;
        out.push(["red blood cell", circ(x, y, 15), "#E8A3A0", 0, 0], ["red blood cell", circ(x, y, 6), "#F2C4C1", 0, 0]); }
      const r0 = out.find(r => r[0] === "red blood cell"), m0 = r0[1].match(/^M([\d.]+) ([\d.]+)/); r0[3] = +m0[1] + 15; r0[4] = +m0[2] - 20;
      W.forEach(([x, y, t], i) => {
        if(t === "neutrophil"){ out.push([t, circ(x, y, 24), "#EAD8EE", i ? 0 : x, i ? 0 : y - 30]); [[-9, -6], [2, -10], [10, 2], [-2, 9]].forEach(([dx, dy]) => out.push([t, circ(x + dx, y + dy, 6.5), "#6B2A80", 0, 0])); }
        if(t === "lymphocyte"){ out.push([t, circ(x, y, 18), "#D6E2F5", x, y - 24], [t, circ(x, y, 15), "#4B2A8A", 0, 0]); }
        if(t === "monocyte"){ out.push([t, circ(x, y, 28), "#E3DCEF", x, y - 34], [t, `M${x - 16} ${y - 4}c0-14 30-18 32-2c2 12-10 8-14 14c-6 8-18 4-18-12Z`, "#6B4AA0", 0, 0]); }
      });
      return out; } }
  };

  Lab.register({
    id:"planslides", subject:"biology", level:["as"], topic:"Microscopy · Plan diagrams", interactive:true,
    title:"Slides & plan diagrams",
    summary:"Find the tissues in sections of stems, roots, leaves, a xerophyte leaf, xylem and phloem, blood vessels, blood cells, the trachea, bronchus and lung, then check the rules for a Paper 3 plan diagram.",
    aim:"Identify tissues in transverse sections of plant organs, blood vessels and the gas exchange system, as you would before drawing a plan diagram.",
    variables:{ iv:"Slide", dv:"Tissues correctly identified", cv:["Low-power objective for plans","Plan diagram: outlines of tissue regions only, no cells"] },
    stageTitle:"Low-power view", controlsTitle:"Slide box",
    thumb:`<svg viewBox="0 0 300 140"><circle cx="150" cy="70" r="58" fill="#EBD3E6" stroke="#C79BC4" stroke-width="5"/><circle cx="150" cy="70" r="28" fill="#F3E3EE"/>${[0,1,2,3,4,5,6,7].map(i => { const a = i*Math.PI/4; return `<circle cx="${150 + 38*Math.cos(a)}" cy="${70 + 38*Math.sin(a)}" r="7" fill="#D2456E"/>`; }).join("")}</svg>`,
    challenges:[
      { id:"stem", title:"Stem", text:"Find every tissue in the stem." },
      { id:"root", title:"Root", text:"Find every tissue in the root." },
      { id:"leaf", title:"Leaf", text:"Find every tissue in the leaf." },
      { id:"marram", title:"Xerophyte", text:"Find the adaptations in the marram grass leaf." },
      { id:"vessels", title:"Artery & vein", text:"Find every layer in both vessels." },
      { id:"gas", title:"Gas exchange", text:"Finish the trachea, bronchus and lung." },
      { id:"xylem", title:"Xylem & phloem", text:"Find the cells in the LS of xylem and phloem." },
      { id:"blood", title:"Blood cells", text:"Find each type of blood cell in the smear." },
      { id:"rules", title:"Plan diagram rules", text:"Spot every mistake in the student plan diagram." }
    ],
    columns:[{key:"slide",label:"Slide"},{key:"asked",label:"Asked to find"},{key:"clicked",label:"You clicked"},{key:"ok",label:"Correct?"}],
    questions:[
      { q:"What is a plan diagram?",
        a:"A low-power drawing that shows only the outlines of the different tissue regions in their correct proportions. No individual cells are drawn." },
      { q:"List the rules for a good biological drawing in Paper 3.",
        a:"Use a sharp pencil; clear, continuous single lines with no sketching or shading; draw a large drawing using most of the space; keep correct proportions; label lines drawn with a ruler that touch the structure and do not cross; labels outside the drawing; no arrowheads." },
      { q:"How do you tell xylem from phloem in a stem section?",
        a:"Xylem vessels have thick, lignified walls (stain red with safranin or blue-green with toluidine blue) and wide empty lumens; in a stem they are towards the centre of each bundle. Phloem is on the outside of the bundle and has small, thin-walled cells." },
      { q:"State three features of a xerophytic leaf and how each reduces water loss.",
        a:"Thick waxy cuticle (less evaporation through the surface); rolled leaf with hinge cells (traps humid air next to the stomata); sunken stomata and hairs (trap moist air, so the water potential gradient is smaller and less water vapour diffuses out)." },
      { q:"How does the wall of an artery differ from that of a vein, and why?",
        a:"The artery has a thick tunica media of smooth muscle and elastic fibres and a narrow lumen: it withstands and evens out high, pulsing pressure. The vein has a thin tunica media and a wide lumen because blood pressure is low; it has valves to prevent backflow." },
      { q:"How do you tell the four blood cells apart in a smear?",
        a:"Red blood cells: small, biconcave (pale centre), no nucleus. Neutrophil: a nucleus with several (2–5) lobes and granular cytoplasm. Lymphocyte: small, with a large round nucleus that almost fills the cell and a thin rim of cytoplasm. Monocyte: the largest, with a kidney- or bean-shaped nucleus." },
      { q:"When you draw cells (not a plan), how should cell walls be shown?",
        a:"Draw each cell wall with two lines to show its thickness, and use three lines where two plant cells touch (the shared middle lamella between the two walls). Draw only what you can see, with the correct shapes and relative sizes, and no shading." },
      { q:"How do xylem vessel elements differ from phloem sieve tube elements in a longitudinal section?",
        a:"Xylem vessel elements are wide, dead, empty tubes with no end walls and lignin thickening (rings, spirals or pitted walls). Sieve tube elements are living, have sieve plates across their end walls, thin cellulose walls and a companion cell beside each one." },
      { q:"Why is the cartilage in the trachea C-shaped?",
        a:"It holds the trachea open so it doesn’t collapse when air pressure falls during inspiration, while the gap at the back lets the oesophagus expand when food is swallowed." }
    ],
    setup(ctx){
      let slide = "stem", target = null, found = {}, wrong = 0;
      Object.keys(SLIDES).forEach(k => found[k] = new Set());
      ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="ps2-svg"><defs>${Kit.DEFS}<clipPath id="ps2-clip"><rect x="20" y="20" width="580" height="460" rx="16"/></clipPath></defs>
        <rect x="20" y="20" width="580" height="460" rx="16" fill="#FBF8F2" stroke="var(--brd2)"/><g clip-path="url(#ps2-clip)" id="ps2-slide"></g><g id="ps2-labels"></g>
        <g transform="translate(624 20)"><rect width="316" height="460" rx="14" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="16" y="30" class="k-tag" id="ps2-name"></text><text x="16" y="66" class="k-status" id="ps2-ask"></text>
          <text x="16" y="92" class="k-lbl" id="ps2-sub"></text><g id="ps2-list" transform="translate(16 120)"></g></g></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector("#ps2-svg"), $ = s => svg.querySelector(s);
      css();
      function css(){ const st = document.createElement("style"); st.textContent = `#ps2-svg [data-t]{cursor:pointer}#ps2-svg [data-t]:hover{filter:brightness(1.08) drop-shadow(0 0 3px rgba(0,0,0,.35))}`; ctx.stage.appendChild(st); }
      function nextTarget(){
        const left = SLIDES[slide].tissues.filter(t => !found[slide].has(t));
        target = left.length ? left[Math.floor(Math.random()*left.length)] : null;
      }
      function draw(){
        const S = SLIDES[slide], regs = S.regions();
        $("#ps2-slide").innerHTML = regs.map(([t, d, f]) => `<path d="${d}" fill="${f}" fill-rule="evenodd" stroke="rgba(60,30,60,.35)" stroke-width="1" data-t="${t}"/>`).join("");
        $("#ps2-labels").innerHTML = regs.filter(r => found[slide].has(r[0]) && (r[3] || r[4])).map(([t, , , x, y]) =>
          `<g pointer-events="none"><circle cx="${x}" cy="${y}" r="3" fill="#111"/><text x="${x}" y="${y - 8}" text-anchor="middle" style="font:700 12px Inter;fill:#111;paint-order:stroke;stroke:#FBF8F2;stroke-width:4px">${t}</text></g>`).join("");
        $("#ps2-name").textContent = S.name;
        $("#ps2-ask").textContent = target ? "Click the " + target : "All tissues found ✓";
        $("#ps2-sub").textContent = `${found[slide].size} of ${S.tissues.length} found`;
        $("#ps2-list").innerHTML = S.tissues.map((t, i) => `<text y="${i*24}" style="font:600 12px Inter;fill:${found[slide].has(t) ? "var(--accent)" : "var(--txt3)"}">${found[slide].has(t) ? "✓" : "○"} ${t}</text>`).join("");
        ctx.readout([["Slide", S.name], ["Found", `${found[slide].size}/${S.tissues.length}`], ["Wrong clicks", String(wrong)]]);
      }
      svg.addEventListener("click", e => {
        const p = e.target.closest("[data-t]"); if(!p || !target) return;
        const t = p.dataset.t, ok = t === target;
        ctx.record({ slide:SLIDES[slide].name, asked:target, clicked:t, ok: ok ? "✓" : "✗" }, true);
        if(ok){ found[slide].add(t); ctx.toast("✓ " + t); nextTarget();
          if(!target){ const ch = { stem:"stem", root:"root", leaf:"leaf", marram:"marram", vessels:"vessels", xylem:"xylem", blood:"blood" }[slide]; if(ch) ctx.complete(ch);
            if(["trachea", "bronchus", "lung"].every(k => found[k].size === SLIDES[k].tissues.length)) ctx.complete("gas"); } }
        else { wrong++; ctx.toast(`That’s the ${t}. Look for the ${target}.`); }
        draw();
      });
      ctx.select({ label:"Slide", value:"stem", options:Object.entries(SLIDES).map(([k, s]) => [k, s.name]), onChange(v){ slide = v; nextTarget(); draw(); } });
      ctx.buttons([{ label:"Reset this slide", onClick(){ found[slide].clear(); nextTarget(); draw(); } }]);
      /* plan diagram critique */
      const FAULTS = [["cells","Individual cells are drawn inside the cortex"],["shade","The xylem is shaded in"],["sketch","Outlines are sketchy, with gaps and overlapping lines"],["arrow","A label line has an arrowhead"],["cross","Two label lines cross"],["small","The drawing is tiny, in a corner of the space"]];
      const DECOYS = [["ruler","Label lines are drawn with a ruler"],["pencil","Drawn in pencil"],["prop","Tissue regions are in proportion"]];
      const items = FAULTS.concat(DECOYS).sort(() => Math.random() - .5);
      const box = ctx.html(`<div class="ctl"><label><span>A student’s plan diagram of the stem: tick every mistake</span></label>
        <svg viewBox="0 0 280 160" style="width:100%;background:#fff;border-radius:10px;border:1px solid var(--brd)">
          <circle cx="60" cy="60" r="44" fill="none" stroke="#333" stroke-dasharray="9 3 14 4"/><circle cx="60" cy="60" r="40" fill="none" stroke="#333" stroke-width=".8"/>
          ${[...Array(8)].map((_, i) => { const a = i*Math.PI/4; return `<circle cx="${60 + 28*Math.cos(a)}" cy="${60 + 28*Math.sin(a)}" r="6" fill="#555"/>`; }).join("")}
          ${[[40,40],[78,44],[70,82],[44,78],[60,30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="none" stroke="#999"/>`).join("")}
          <line x1="104" y1="60" x2="200" y2="40" stroke="#333"/><path d="M104 60l8-5v8z" fill="#333"/><text x="204" y="44" style="font:11px Inter">epidermis</text>
          <line x1="88" y1="70" x2="200" y2="70" stroke="#333"/><line x1="86" y1="40" x2="200" y2="100" stroke="#333"/><text x="204" y="74" style="font:11px Inter">xylem</text><text x="204" y="104" style="font:11px Inter">phloem</text></svg>
        ${items.map(([k, t]) => `<label style="display:flex;gap:8px;align-items:center;font-size:.82rem;margin:5px 0;font-weight:500"><input type="checkbox" value="${k}"> ${t}</label>`).join("")}
        <button class="btn small" type="button">Check</button><div style="margin-top:8px"></div></div>`);
      box.querySelector("button").onclick = () => {
        const picked = new Set([...box.querySelectorAll("input:checked")].map(i => i.value)), faults = new Set(FAULTS.map(f => f[0]));
        const miss = [...faults].filter(k => !picked.has(k)).length, extra = [...picked].filter(k => !faults.has(k)).length;
        box.querySelector("div:last-child").innerHTML = !miss && !extra ? `<div class="note ok">All six mistakes found.</div>`
          : `<div class="note bad">${miss ? `${miss} mistake${miss > 1 ? "s" : ""} missed. ` : ""}${extra ? `${extra} ticked item${extra > 1 ? "s are" : " is"} actually correct practice.` : ""}</div>`;
        if(!miss && !extra) ctx.complete("rules");
      };
      nextTarget(); draw();
    }
  });
})();

/* ───────────── MITOTIC INDEX: ROOT TIP SQUASH ───────────── */
Lab.register({
  id:"mitosis", subject:"biology", level:["as"], topic:"Mitotic cell cycle", interactive:true,
  title:"Mitotic index in a root tip",
  summary:"Classify every cell in fields of a stained garlic root tip squash, calculate the mitotic index at different distances from the tip and estimate how long each stage lasts.",
  aim:"Identify the stages of mitosis in a root tip squash and investigate how the mitotic index changes with distance from the root tip.",
  variables:{ iv:"Distance of the field of view from the root tip (mm)", dv:"Mitotic index = cells in mitosis ÷ total cells", cv:["Same root, same stain","Count every cell in the field, including those touching two edges only","Same magnification (×40 objective)"] },
  stageTitle:"Squash at ×400", controlsTitle:"Counting",
  thumb:`<svg viewBox="0 0 300 140">${[...Array(18)].map((_, i) => `<rect x="${40 + (i % 6)*38}" y="${14 + Math.floor(i/6)*38}" width="38" height="38" fill="#F4E1EC" stroke="#9C5BA8"/>${i === 7 ? `<line x1="${59 + (i % 6)*38}" y1="${20 + 38}" x2="${59 + (i % 6)*38}" y2="${46 + 38}" stroke="#5B1F6E" stroke-width="5"/>` : `<circle cx="${59 + (i % 6)*38}" cy="${33 + Math.floor(i/6)*38}" r="8" fill="#B887C9"/>`}`).join("")}</svg>`,
  challenges:[
    { id:"acc",   title:"Sharp eyes", text:"Classify a whole field with at least 90% of cells correct." },
    { id:"three", title:"Along the root", text:"Record the mitotic index at three distances from the tip." },
    { id:"time",  title:"Stage duration", text:"Estimate how long metaphase lasts." }
  ],
  columns:[{key:"d",label:"Distance from tip / mm",dp:1},{key:"I",label:"Interphase",dp:0},{key:"P",label:"Prophase",dp:0},{key:"M",label:"Metaphase",dp:0},{key:"A",label:"Anaphase",dp:0},{key:"T",label:"Telophase",dp:0},{key:"n",label:"Total",dp:0},{key:"mi",label:"Mitotic index",dp:3},{key:"acc",label:"Correct / %",dp:0}],
  graph:{ x:["d"], y:["mi"], fit:"curve" },
  questions:[
    { q:"Why is the root tip warmed in dilute hydrochloric acid before staining?",
      a:"The acid hydrolyses the pectins of the middle lamella that hold the cells together, so the cells separate and can be squashed into a single layer. It also stops the cells dividing." },
    { q:"Why is the tissue squashed gently under the coverslip?",
      a:"To spread the cells into a layer one cell thick, so individual cells and chromosomes can be seen clearly without overlapping." },
    { q:"Why is the mitotic index highest near the tip?",
      a:"The meristem just behind the root cap is where cells divide. Further back, cells stop dividing and elongate and differentiate, so a smaller proportion are in mitosis." },
    { q:"How can the proportion of cells in a stage be used to estimate its duration?",
      a:"If cells divide at random times, the fraction of cells in a stage equals the fraction of the cell cycle spent in it. Duration = (cells in stage ÷ total cells) × length of the cell cycle." },
    { q:"Give two limitations of counting cells in one field of view, and an improvement.",
      a:"One field is a small sample and may not be typical; cells in transition are hard to classify; cells at the edge may be counted twice or missed. Count several fields at each distance (from several roots) and use a rule for edge cells." }
  ],
  setup(ctx){
    const COLS = 8, ROWS = 6, W = 66, H = 58, X0 = 30, Y0 = 70, CYCLE = 22;
    const STAGES = { I:"Interphase", P:"Prophase", M:"Metaphase", A:"Anaphase", T:"Telophase" }, KEYS = Object.keys(STAGES);
    const MI = d => .2*Math.exp(-d/1.6), SHARE = { P:.45, M:.15, A:.1, T:.3 };
    let d = .5, cells = [], pick = "P", checked = false;
    function field(){
      checked = false;
      cells = [];
      for(let i = 0; i < COLS*ROWS; i++){
        let s = "I"; if(Math.random() < MI(d)){ const r = Math.random(); let acc = 0; s = KEYS.slice(1).find(k => (acc += SHARE[k]) >= r) || "P"; }
        cells.push({ s, mark:null, w:W - 4 + Math.random()*6, h:H - 4 + Math.random()*6, flip:Math.random() < .5, j:Math.random() });
      }
    }
    function cellSvg(c, i){
      const x = X0 + (i % COLS)*W + (Math.floor(i/COLS) % 2)*8, y = Y0 + Math.floor(i/COLS)*H, cx = x + W/2, cy = y + H/2;
      let s = `<g data-c="${i}" style="cursor:pointer"><rect x="${x + 1}" y="${y + 1}" width="${c.w - 2}" height="${c.h - 2}" rx="5" fill="#F4E1EC" stroke="#9C5BA8" stroke-width="1.3"/>`;
      const v = c.flip ? -1 : 1;
      if(c.s === "I") s += `<circle cx="${cx + (c.j - .5)*8}" cy="${cy}" r="12" fill="#C99AD6" stroke="#8E4FA4"/><circle cx="${cx + (c.j - .5)*8 + 3}" cy="${cy - 2}" r="3.2" fill="#6B2A80"/>`;
      if(c.s === "P"){ s += `<circle cx="${cx}" cy="${cy}" r="13" fill="#E6C9EE" stroke="#8E4FA4" stroke-dasharray="3 2"/>`;
        for(let k = 0; k < 6; k++){ const a = k + c.j*3; s += `<path d="M${cx + 8*Math.cos(a)} ${cy + 8*Math.sin(a)}q${4*v} ${-5} ${-6*Math.cos(a + 1)} ${-7*Math.sin(a + 1)}" stroke="#5B1F6E" stroke-width="2.2" fill="none" stroke-linecap="round"/>`; } }
      if(c.s === "M") for(let k = 0; k < 6; k++) s += `<path d="M${cx - 4} ${cy - 16 + k*6.4}h8" stroke="#5B1F6E" stroke-width="3" stroke-linecap="round"/>`;
      if(c.s === "A") [-1, 1].forEach(sd => { for(let k = 0; k < 4; k++){ const yy = cy - 12 + k*8, xx = cx + sd*(12 + c.j*4); s += `<path d="M${xx + sd*4} ${yy - 4}L${xx} ${yy}L${xx + sd*4} ${yy + 4}" stroke="#5B1F6E" stroke-width="2.2" fill="none" stroke-linecap="round"/>`; } });
      if(c.s === "T"){ [-1, 1].forEach(sd => s += `<ellipse cx="${cx + sd*18}" cy="${cy}" rx="8" ry="11" fill="#B887C9" stroke="#6B2A80"/>`); s += `<line x1="${cx}" y1="${y + 6}" x2="${cx}" y2="${y + c.h - 6}" stroke="#9C5BA8" stroke-dasharray="3 2"/>`; }
      if(c.mark){ const bad = checked && c.mark !== c.s;
        s += `<rect x="${x + 4}" y="${y + 4}" width="16" height="15" rx="4" fill="${bad ? "#E0335A" : checked ? "#0F9A62" : "#1F2937"}"/><text x="${x + 12}" y="${y + 15}" text-anchor="middle" style="font:700 10px Inter;fill:#fff">${c.mark}</text>`;
        if(bad) s += `<text x="${x + c.w - 6}" y="${y + c.h - 6}" text-anchor="end" style="font:700 10px Inter;fill:#E0335A">${c.s}</text>`; }
      return s + `</g>`;
    }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 460" class="kb" id="mi-svg"><defs>${Kit.DEFS}</defs><rect width="960" height="460" fill="#0A0D13"/>
      <rect x="22" y="62" width="${COLS*W + 24}" height="${ROWS*H + 16}" rx="10" fill="#FBF3F7"/><g id="mi-cells"></g>
      <g transform="translate(600 62)"><rect width="340" height="364" rx="14" fill="#111827" stroke="#334155"/><g id="mi-key"></g></g>
      <text x="24" y="40" class="k-status" style="fill:#E5E7EB" id="mi-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#mi-svg"), $ = s => svg.querySelector(s);
    function counts(key){ const c = { I:0, P:0, M:0, A:0, T:0 }; cells.forEach(x => { if(x[key]) c[x[key]]++; }); return c; }
    function draw(){
      $("#mi-cells").innerHTML = cells.map(cellSvg).join("");
      const c = counts("mark"), n = cells.filter(x => x.mark).length;
      $("#mi-key").innerHTML = `<text x="16" y="28" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.06em">YOUR TALLY · ${d} mm FROM TIP</text>` +
        KEYS.map((k, i) => `<text x="16" y="${62 + i*30}" style="font:600 14px Inter;fill:${pick === k ? "#7CFFB2" : "#E5E7EB"}">${k} · ${STAGES[k]}</text><text x="320" y="${62 + i*30}" text-anchor="end" style="font:600 16px 'JetBrains Mono';fill:#E5E7EB">${c[k]}</text>`).join("") +
        `<text x="16" y="230" style="font:500 12px Inter;fill:#9CA3AF">classified ${n} of ${cells.length}</text>
         <text x="16" y="262" style="font:500 12px Inter;fill:#9CA3AF">mitotic index = (P+M+A+T) ÷ total</text>
         <text x="16" y="296" style="font:600 18px 'JetBrains Mono';fill:#7CFFB2">${n ? ((n - c.I)/n).toFixed(3) : "—"}</text>
         <text x="16" y="336" style="font:500 11px Inter;fill:#9CA3AF">${checked ? "Checked: red marks show the real stage" : "Pick a stage, then click cells"}</text>`;
      $("#mi-status").textContent = checked ? "Field checked — record it or take a new field" : `Classify every cell · placing: ${STAGES[pick]}`;
      ctx.readout([["Distance from tip", d + " mm"], ["Classified", `${n}/${cells.length}`], ["Placing", STAGES[pick]]]);
    }
    svg.addEventListener("click", e => {
      const g = e.target.closest("[data-c]"); if(!g || checked) return;
      const c = cells[+g.dataset.c]; c.mark = c.mark === pick ? null : pick; draw();
    });
    const sg = ctx.seg({ label:"Stage to place", value:"P", options:KEYS.map(k => [k, STAGES[k]]), onChange(v){ pick = v; draw(); } });
    ctx.seg({ label:"Field of view: distance from root tip", value:.5, options:[[.5,"0.5 mm"],[1.5,"1.5"],[3,"3"],[5,"5"]], onChange(v){ d = v; field(); draw(); } });
    ctx.buttons([{ label:"Mark the rest interphase", onClick(){ if(checked) return; cells.forEach(c => { if(!c.mark) c.mark = "I"; }); draw(); } },
      { label:"New field", onClick(){ field(); draw(); } }]);
    ctx.buttons([{ label:"Check & record this field", primary:true, block:true, onClick(){
      if(checked) return ctx.toast("Already recorded — take a new field");
      if(cells.some(c => !c.mark)) return ctx.toast("Classify every cell first");
      checked = true;
      const c = counts("mark"), n = cells.length, right = cells.filter(x => x.mark === x.s).length, acc = Math.round(right/n*100);
      ctx.record({ d, I:c.I, P:c.P, M:c.M, A:c.A, T:c.T, n, mi:Kit.round((n - c.I)/n, 3), acc });
      if(acc >= 90) ctx.complete("acc");
      if(new Set(ctx.rows().map(r => r.d)).size >= 3) ctx.complete("three");
      draw();
    } }]);
    Kit.answer(ctx, `Cell cycle = ${CYCLE} h. Duration of metaphase from all your counts / min`, "e.g. 40", v => {
      const rows = ctx.rows(); if(!rows.length) return [false, "Record some fields first."];
      const M = rows.reduce((s, r) => s + r.M, 0), N = rows.reduce((s, r) => s + r.n, 0), t = M/N*CYCLE*60;
      if(!M) return [false, "You haven’t counted any metaphase cells yet — try fields near the tip."];
      if(Math.abs(v - t) <= Math.max(1, .05*t)){ ctx.complete("time"); return [true, `Correct: ${M} ÷ ${N} × ${CYCLE} h × 60 = ${t.toFixed(0)} min.`]; }
      return [false, "Duration = (total metaphase cells ÷ total cells counted) × 22 h, then × 60 for minutes."];
    });
    field(); draw();
    window.addEventListener("keydown", onKey); ctx.cleanup(() => window.removeEventListener("keydown", onKey));
    function onKey(e){ const k = e.key.toUpperCase(); if(STAGES[k] && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){ pick = k; sg.set(k); draw(); } }
  }
});
