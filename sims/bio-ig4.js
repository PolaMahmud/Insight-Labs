"use strict";
/* ══════════════════════════════════════════════════════════════════
   BIOLOGY · IGCSE (0610 Paper 5/6) — part 4
   Dissecting flowers and seeds · Continuous and discontinuous variation
══════════════════════════════════════════════════════════════════ */

/* ───────────── DISSECTING FLOWERS AND SEEDS ───────────── */
Lab.register({
  id:"flowers", subject:"biology", level:["igcse"], topic:"Plant reproduction · Flowers & seeds", interactive:true,
  title:"Dissecting flowers and seeds",
  summary:"Take apart an insect-pollinated flower and a grass flower with forceps, working from the outside in. Lay the parts out, label them and compare the two. Then open a soaked bean seed, find the embryo and work out the magnification of a drawing.",
  aim:"Dissect an insect-pollinated flower, a wind-pollinated flower and a soaked bean seed, identify and label their parts, and calculate the magnification of a drawing.",
  variables:{ iv:"Specimen (insect-pollinated flower, wind-pollinated flower, bean seed)", dv:"Number and arrangement of the parts; seed length and drawing magnification", cv:["Remove parts from the outside inwards","Lay parts out in order on a white tile","Measure lengths with a ruler to the nearest mm"] },
  stageTitle:"Dissection tile", controlsTitle:"Forceps & labels",
  thumb:`<svg viewBox="0 0 300 140">${[0,90,180,270].map(a => `<ellipse cx="150" cy="70" rx="40" ry="20" transform="rotate(${a} 150 70) translate(38 0)" fill="#F2B233" stroke="#B9761A"/>`).join("")}${[0,60,120,180,240,300].map(a => `<ellipse cx="150" cy="70" rx="5" ry="3" transform="rotate(${a} 150 70) translate(20 0)" fill="#E9D24A" stroke="#8A6D12"/>`).join("")}<circle cx="150" cy="70" r="7" fill="#8DBA5A"/></svg>`,
  challenges:[
    { id:"insect",  title:"Insect-pollinated flower", text:"Remove every part in order, then label all nine structures." },
    { id:"wind",    title:"Wind-pollinated flower", text:"Dissect the grass flower and label its anther, filament, stigma and ovary." },
    { id:"compare", title:"Insect or wind?", text:"Sort eight features into insect-pollinated or wind-pollinated." },
    { id:"seed",    title:"Inside a seed", text:"Label five parts of a bean seed and calculate the magnification of the drawing." }
  ],
  columns:[{key:"spec",label:"Specimen"},{key:"part",label:"Part or measurement"},{key:"n",label:"Number",dp:0},{key:"L",label:"Length / mm",dp:1},{key:"note",label:"Notes"}],
  questions:[
    { q:"Assess the risks of this dissection.",
      a:"Low. Scalpels and mounted needles can cut, so cut on a tile, away from your fingers. Pollen can trigger hay fever or asthma, so take care if you are allergic. Some flowers and raw beans are poisonous, so never eat the specimens. Wash your hands afterwards." },
    { q:"Why are the parts removed from the outside inwards and laid out in order?",
      a:"The flower is built in rings (whorls): sepals outside, then petals, stamens and carpel in the centre. If you work from the outside in, each part comes off whole and none is missed, and laying them out in rings shows the number and arrangement of each kind of part." },
    { q:"Use your dissection to explain how a grass flower is adapted to wind pollination.",
      a:"It has no large coloured petals, scent or nectar, because it doesn’t need to attract insects. The anthers hang outside the flower on long, thin filaments, so the wind can blow the pollen away. The stigmas are large and feathery and hang outside, which gives a big surface area to trap pollen from the air." },
    { q:"A student’s drawing of a bean seed is 66 mm long. The seed is 22 mm long. Calculate the magnification.",
      a:"Magnification = length of drawing ÷ actual length = 66 ÷ 22 = ×3. Both lengths must be in the same unit. A magnification has no units." },
    { q:"List four rules for a good biological drawing.",
      a:"Make it large, using at least half the space. Use clear, continuous lines with a sharp pencil and no shading. Keep the proportions correct. Draw label lines with a ruler so they touch the part, don’t cross each other and end outside the drawing." },
    { q:"Suggest limitations of this investigation and how to improve it.",
      a:"Only one flower of each kind was looked at, so dissect several flowers to check the numbers of parts. Small parts like ovules are hard to see, so use a hand lens. The seed is small, so ±0.5 mm on a ruler is a large percentage uncertainty. Measure several seeds and find the mean, or use calipers." }
  ],
  setup(ctx){
    const R = (a, b) => a + Math.random()*(b - a);
    const SPEC = {
      insect:{ name:"Insect-pollinated flower (wallflower)", short:"Insect-pollinated", order:["sepal","petal","stamen","carpel"], tot:{ sepal:4, petal:4, stamen:6, carpel:1 },
        labels:["sepal","petal","anther","filament","stigma","style","ovary","ovule","nectary"],
        notes:{ sepal:"green; protected the flower in bud", petal:"large and brightly coloured", stamen:"4 long, 2 short; anthers inside the flower", carpel:"stigma inside the flower; ovules inside the ovary" } },
      wind:{ name:"Wind-pollinated flower (grass)", short:"Wind-pollinated", order:["bract","stamen","carpel"], tot:{ bract:2, stamen:3, carpel:1 },
        labels:["anther","filament","stigma","ovary"],
        notes:{ bract:"small and green; no petals, scent or nectar", stamen:"anthers hang outside on long filaments", carpel:"two large, feathery stigmas outside the flower" } },
      seed:{ name:"Soaked bean seed", short:"Bean seed", labels:["testa","micropyle","cotyledon","plumule","radicle"] }
    };
    const PLUR = { sepal:"sepals", petal:"petals", stamen:"stamens", carpel:"carpel", bract:"bracts" };
    const FEAT = [["Large, brightly coloured petals","i"],["Scent and nectar","i"],["Anthers hang outside the flower on long filaments","w"],["Large, feathery stigmas outside the flower","w"],
      ["Small, light, smooth pollen made in large amounts","w"],["Larger pollen grains that are sticky or spiky","i"],["Anthers and stigma inside the flower","i"],["Petals small and green, or absent","w"]];
    let spec = "insect", tool = "forceps", S = {}, sort = FEAT.map(() => null);
    function fresh(k){
      if(k === "insect") S.insect = { rem:{ sepal:0, petal:0, stamen:0, carpel:0 }, labs:new Set(), rec:false, tilt:R(-8, 8) };
      if(k === "wind") S.wind = { rem:{ bract:0, stamen:0, carpel:0 }, labs:new Set(), rec:false };
      if(k === "seed") S.seed = { labs:new Set(), peeled:false, split:false, Ls:Kit.snap(R(17, 25), .5), Ld:Math.round(R(58, 84)), read:{}, mag:false };
    }
    fresh("insect"); fresh("wind"); fresh("seed");

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 490" class="kb" id="fl-svg"><defs>${Kit.DEFS}</defs>
      <style>#fl-svg .fl-p{cursor:pointer}#fl-svg .fl-p:hover{filter:drop-shadow(0 0 5px #FFD24A)}#fl-svg [data-lab]{cursor:pointer}
      #fl-svg .fl-t{font:600 11px Inter,sans-serif;fill:#1E293B}#fl-svg .fl-s{font:500 10px Inter,sans-serif;fill:#64748B}#fl-svg .fl-r{font:700 10px Inter,sans-serif;fill:#475569;letter-spacing:.05em}</style>
      <g id="fl-main"></g><text x="24" y="30" class="k-status" id="fl-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#fl-svg"), $ = s => svg.querySelector(s);

    /* label leader line + text */
    const lab = (name, px, py, tx, ty, anchor) => `<g pointer-events="none"><circle cx="${px}" cy="${py}" r="2" fill="#1E293B"/><line x1="${px}" y1="${py}" x2="${anchor === "end" ? tx + 4 : tx - 4}" y2="${ty - 4}" stroke="#1E293B" stroke-width="1"/><text x="${tx}" y="${ty}" class="fl-t" text-anchor="${anchor || "start"}">${name}</text></g>`;
    const bz = (a, b, c, d, t) => { const u = 1 - t; return [u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0], u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1]]; };
    function feather(a, b, c, d, attrs){
      let s = `<path d="M${a}C${b} ${c} ${d}" stroke="#CFC290" stroke-width="3" fill="none"/>` + (attrs ? `<path d="M${a}C${b} ${c} ${d}" stroke="transparent" stroke-width="20" fill="none"/>` : "");
      for(let t = .25; t <= 1.001; t += .06){
        const p = bz(a, b, c, d, t), q = bz(a, b, c, d, Math.min(1, t + .02)), dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, nx = -dy/L, ny = dx/L, tx = dx/L, ty = dy/L;
        s += `<path d="M${p[0] + nx*9 + tx*4} ${p[1] + ny*9 + ty*4}L${p[0]} ${p[1]}L${p[0] - nx*9 + tx*4} ${p[1] - ny*9 + ty*4}" stroke="#BFB27C" stroke-width="1.4" fill="none"/>`;
      }
      return `<g ${attrs || ""}>${s}</g>`;
    }
    const tile = (title) => `<rect x="480" y="50" width="462" height="424" rx="10" fill="#FBFBF8" stroke="#A2ACBD"/><text x="496" y="70" class="fl-r">${title}</text>`;

    /* ── insect-pollinated flower (face view) and its laid-out parts ── */
    function drawInsect(st){
      const cx = 240, cy = 270, all = st.rem.carpel >= 1;
      let s = `<circle cx="${cx}" cy="${cy}" r="30" fill="#A8C978" stroke="#5E8A35" stroke-width="2"/>`;
      s += `<g data-lab="nectary"><ellipse cx="${cx - 17}" cy="${cy + 2}" rx="7" ry="5" fill="#3E7A2A"/><ellipse cx="${cx + 17}" cy="${cy - 2}" rx="7" ry="5" fill="#3E7A2A"/><circle cx="${cx}" cy="${cy}" r="5" fill="#C5DCA0"/></g>`;
      [45, 135, 225, 315].forEach((a, i) => { if(i < st.rem.sepal) return;
        s += `<g class="fl-p" data-part="sepal"><ellipse cx="${cx + 95}" cy="${cy}" rx="72" ry="20" transform="rotate(${a + st.tilt} ${cx} ${cy})" fill="#7FB352" stroke="#3E6B22" stroke-width="2"/></g>`; });
      [0, 90, 180, 270].forEach((a, i) => { if(i < st.rem.petal) return;
        s += `<g class="fl-p" data-part="petal" transform="rotate(${a + st.tilt} ${cx} ${cy})"><ellipse cx="${cx + 92}" cy="${cy}" rx="88" ry="52" fill="#F2B233" stroke="#B9761A" stroke-width="2"/>
          <path d="M${cx + 20} ${cy}H${cx + 160}M${cx + 40} ${cy}l60 -26M${cx + 40} ${cy}l60 26" stroke="#D98E1E" stroke-width="1.2" fill="none"/></g>`; });
      [30, 90, 150, 210, 270, 330].forEach((a, i) => { if(i < st.rem.stamen) return;
        s += `<g class="fl-p" data-part="stamen" transform="rotate(${a} ${cx} ${cy})"><line x1="${cx}" y1="${cy}" x2="${cx + 36}" y2="${cy}" stroke="#E8E3B0" stroke-width="3"/><ellipse cx="${cx + 46}" cy="${cy}" rx="11" ry="5" fill="#E9D24A" stroke="#8A6D12" stroke-width="1.5"/><circle cx="${cx + 42}" cy="${cy}" r="13" fill="transparent"/></g>`; });
      if(!all) s += `<g class="fl-p" data-part="carpel"><circle cx="${cx}" cy="${cy}" r="15" fill="#8DBA5A" stroke="#4F7A2A" stroke-width="2"/><ellipse cx="${cx - 6}" cy="${cy}" rx="6" ry="4" fill="#5E8A35"/><ellipse cx="${cx + 6}" cy="${cy}" rx="6" ry="4" fill="#5E8A35"/></g>`;
      if(all){ s += `<text x="${cx}" y="${cy + 64}" text-anchor="middle" class="k-lbl">receptacle (flower base) left on the stalk</text>`;
        if(st.labs.has("nectary")) s += `<g pointer-events="none"><line x1="${cx + 22}" y1="${cy - 4}" x2="${cx + 96}" y2="${cy - 40}" stroke="var(--txt)" stroke-width="1"/><text x="${cx + 100}" y="${cy - 40}" style="font:600 12px Inter;fill:var(--txt)">nectary</text></g>`; }

      s += tile("PARTS LAID OUT IN ORDER");
      const row = (y, t) => `<text x="496" y="${y + 4}" class="fl-r">${t}</text>`;
      s += row(112, "SEPALS") + row(206, "PETALS") + row(300, "STAMENS") + row(404, "CARPEL");
      for(let i = 0; i < st.rem.sepal; i++){ const x = 600 + i*70, y = 110;
        s += `<path data-lab="sepal" d="M${x} ${y - 32}C${x + 13} ${y - 22} ${x + 12} ${y + 18} ${x} ${y + 32}C${x - 12} ${y + 18} ${x - 13} ${y - 22} ${x} ${y - 32}Z" fill="#7FB352" stroke="#3E6B22" stroke-width="1.5"/>`; }
      for(let i = 0; i < st.rem.petal; i++){ const x = 600 + i*70, y = 205;
        s += `<path data-lab="petal" d="M${x - 4} ${y + 36}L${x - 4} ${y + 8}C${x - 26} ${y} ${x - 24} ${y - 36} ${x} ${y - 38}C${x + 24} ${y - 36} ${x + 26} ${y} ${x + 4} ${y + 8}L${x + 4} ${y + 36}Z" fill="#F2B233" stroke="#B9761A" stroke-width="1.5"/>`; }
      for(let i = 0; i < st.rem.stamen; i++){ const x = 600 + i*45, b = 328, len = i < 2 ? 34 : 48, ay = b - len - 9;
        s += `<g><line x1="${x}" y1="${b}" x2="${x}" y2="${b - len}" stroke="#C9C08A" stroke-width="2.5"/><line data-lab="filament" x1="${x}" y1="${b}" x2="${x}" y2="${b - len}" stroke="transparent" stroke-width="12"/>
          <ellipse data-lab="anther" cx="${x}" cy="${ay}" rx="5" ry="10" fill="#E9D24A" stroke="#8A6D12" stroke-width="1.3"/></g>`; }
      if(st.rem.carpel){
        const x = 600, y = 400, c = 700;
        s += `<g><ellipse data-lab="ovary" cx="${x}" cy="${y + 22}" rx="11" ry="24" fill="#8DBA5A" stroke="#4F7A2A" stroke-width="1.5"/><line x1="${x}" y1="${y - 2}" x2="${x}" y2="${y - 30}" stroke="#8DBA5A" stroke-width="4"/>
          <line data-lab="style" x1="${x}" y1="${y - 2}" x2="${x}" y2="${y - 28}" stroke="transparent" stroke-width="12"/><ellipse data-lab="stigma" cx="${x}" cy="${y - 34}" rx="9" ry="5" fill="#5E8A35"/></g>
          <text x="${x}" y="${y + 64}" text-anchor="middle" class="fl-s">whole</text>`;
        s += `<g><ellipse data-lab="ovary" cx="${c}" cy="${y + 22}" rx="14" ry="26" fill="#E3F0CF" stroke="#5E8A35" stroke-width="3"/><line x1="${c}" y1="${y - 4}" x2="${c}" y2="${y - 30}" stroke="#8DBA5A" stroke-width="4"/>
          <line data-lab="style" x1="${c}" y1="${y - 4}" x2="${c}" y2="${y - 28}" stroke="transparent" stroke-width="12"/><ellipse data-lab="stigma" cx="${c}" cy="${y - 34}" rx="9" ry="5" fill="#5E8A35"/>
          ${[0, 1, 2, 3, 4].map(k => `<circle data-lab="ovule" cx="${c + (k % 2 ? 3 : -3)}" cy="${y + 6 + k*8.5}" r="3.6" fill="#F4F1D6" stroke="#6B8E3A"/>`).join("")}</g>
          <text x="${c}" y="${y + 64}" text-anchor="middle" class="fl-s">cut lengthways</text>`;
      }
      const L = st.labs;
      if(L.has("sepal")) s += lab("sepal", 818, 104, 872, 108);
      if(L.has("petal")) s += lab("petal", 828, 196, 872, 200);
      if(L.has("anther")) s += lab("anther", 830, 262, 872, 258);
      if(L.has("filament")) s += lab("filament", 825, 302, 872, 306);
      if(L.has("stigma")) s += lab("stigma", 708, 366, 872, 360);
      if(L.has("style")) s += lab("style", 702, 384, 872, 386);
      if(L.has("ovule")) s += lab("ovule", 703, 419, 872, 412);
      if(L.has("ovary")) s += lab("ovary", 713, 436, 872, 438);
      return s;
    }

    /* ── wind-pollinated grass flower (side view) ── */
    function drawWind(st){
      const cx = 240;
      let s = `<line x1="${cx}" y1="472" x2="${cx}" y2="350" stroke="#7A9A4A" stroke-width="5"/>`;
      const bracts = st.rem.bract >= 2, stam = st.rem.stamen >= 3;
      if(!st.rem.carpel){
        s += `<g class="fl-p" data-part="carpel">${feather([cx - 2, 284], [cx - 6, 230], [200, 150], [172, 92])}${feather([cx + 2, 284], [cx + 6, 230], [280, 150], [308, 92])}
          <ellipse cx="${cx}" cy="${302}" rx="13" ry="20" fill="#B9D58C" stroke="#5E8A35" stroke-width="1.5"/><rect x="${cx - 40}" y="90" width="80" height="230" fill="transparent"/></g>`;
      }
      [["M240 360C168 332 168 200 224 146C236 220 240 300 240 360Z"], ["M240 360C312 332 312 200 256 146C244 220 240 300 240 360Z"]].forEach(([d], i) => {
        if(i < st.rem.bract) return;
        s += `<g class="fl-p" data-part="bract"><path d="${d}" fill="#9CC26A" stroke="#4F7A2A" stroke-width="2"/><path d="${i ? "M252 160C280 220 268 300 244 350" : "M228 160C200 220 212 300 236 350"}" stroke="#6E9A3C" stroke-width="1.2" fill="none"/></g>`; });
      [[140, 340], [350, 352], [300, 410]].forEach(([ax, ay], i) => { if(i < st.rem.stamen) return;
        s += `<g class="fl-p" data-part="stamen"><path d="M${cx} 300Q${(cx + ax)/2} ${bracts ? 250 : 200} ${ax} ${ay - 20}" stroke="#E8E3B0" stroke-width="2" fill="none"/><ellipse cx="${ax}" cy="${ay}" rx="7" ry="19" fill="#D9B44A" stroke="#8A6D12" stroke-width="1.5"/><circle cx="${ax}" cy="${ay}" r="22" fill="transparent"/></g>`; });
      if(st.rem.carpel) s += `<text x="${cx}" y="330" text-anchor="middle" class="k-lbl">only the stalk is left</text>`;
      if(!bracts && !st.rem.bract) s += `<text x="${cx}" y="76" text-anchor="middle" class="k-lbl">a single grass flower (floret), side view</text>`;

      s += tile("PARTS LAID OUT IN ORDER");
      const row = (y, t) => `<text x="496" y="${y + 4}" class="fl-r">${t}</text>`;
      s += row(120, "BRACTS") + row(250, "STAMENS") + row(400, "CARPEL");
      for(let i = 0; i < st.rem.bract; i++){ const x = 600 + i*70, y = 120;
        s += `<path d="M${x} ${y - 42}C${x + 16} ${y - 20} ${x + 14} ${y + 24} ${x} ${y + 42}C${x - 14} ${y + 24} ${x - 16} ${y - 20} ${x} ${y - 42}Z" fill="#9CC26A" stroke="#4F7A2A" stroke-width="1.5"/>`; }
      for(let i = 0; i < st.rem.stamen; i++){ const x = 600 + i*60, y = 250;
        s += `<g><line x1="${x}" y1="${y + 46}" x2="${x}" y2="${y - 16}" stroke="#C9C08A" stroke-width="2"/><line data-lab="filament" x1="${x}" y1="${y + 46}" x2="${x}" y2="${y - 14}" stroke="transparent" stroke-width="12"/>
          <ellipse data-lab="anther" cx="${x}" cy="${y - 32}" rx="6" ry="17" fill="#D9B44A" stroke="#8A6D12" stroke-width="1.3"/></g>`; }
      if(st.rem.carpel){ const x = 600, y = 410;
        s += feather([x - 3, y - 16], [x - 6, y - 40], [x - 26, y - 64], [x - 38, y - 86], `data-lab="stigma"`) + feather([x + 3, y - 16], [x + 6, y - 40], [x + 26, y - 64], [x + 38, y - 86], `data-lab="stigma"`)
          + `<ellipse data-lab="ovary" cx="${x}" cy="${y}" rx="12" ry="18" fill="#B9D58C" stroke="#5E8A35" stroke-width="1.5"/>`; }
      const L = st.labs;
      if(L.has("anther")) s += lab("anther", 726, 218, 872, 212);
      if(L.has("filament")) s += lab("filament", 722, 268, 872, 272);
      if(L.has("stigma")) s += lab("stigma", 634, 330, 872, 346);
      if(L.has("ovary")) s += lab("ovary", 612, 412, 872, 416);
      return s;
    }

    /* ── bean seed ── */
    function drawSeed(st){
      const PX = 8, x0 = 130, cy = 190, w = st.Ls*PX, h = w*.62, cx = x0 + w/2, L = st.labs;
      const mx = cx - w*.16 - 8, my = cy + h/2 - 6;
      let s = `<rect x="16" y="50" width="452" height="424" rx="10" fill="#F7F4EC" stroke="#A2ACBD"/>`;
      if(!st.peeled){
        s += `<g class="fl-p" data-part="testa"><ellipse data-lab="testa" cx="${cx}" cy="${cy}" rx="${w/2}" ry="${h/2}" fill="#C9A26A" stroke="#7A4E2A" stroke-width="2"/>
          ${[[-.2, -.15], [.1, -.25], [.25, .05], [-.05, .1], [.3, -.18]].map(([a, b]) => `<ellipse cx="${cx + a*w}" cy="${cy + b*h}" rx="${w*.04}" ry="${h*.03}" fill="#A87E48" opacity=".7" pointer-events="none"/>`).join("")}
          <ellipse cx="${cx}" cy="${my}" rx="${w*.15}" ry="4.5" fill="#2E2218" pointer-events="none"/><circle cx="${mx}" cy="${my}" r="2.4" fill="#111"/><circle data-lab="micropyle" cx="${mx}" cy="${my}" r="9" fill="transparent"/></g>`;
        if(L.has("testa")) s += lab("testa", cx + w*.3, cy - h*.38, x0 + w + 26, cy - h*.42);
        if(L.has("micropyle")) s += lab("micropyle", mx, my, 104, my + 44, "end");
      }else if(!st.split){
        s += `<g class="fl-p" data-part="seam"><ellipse cx="${cx}" cy="${cy}" rx="${w/2 - 3}" ry="${h/2 - 3}" fill="#F1E6B8" stroke="#B59F5A" stroke-width="2"/>
          <path d="M${x0 + 6} ${cy + 4}C${cx - w*.2} ${cy - 6} ${cx + w*.2} ${cy + 8} ${x0 + w - 6} ${cy}" stroke="#8C7A3E" stroke-width="2" stroke-dasharray="5 3" fill="none"/>
          <path d="M${mx + 2} ${my - 6}l-8 4l8 3z" fill="#E8D58E" stroke="#9C8442"/></g>
          <text x="${cx}" y="${cy - h/2 - 12}" text-anchor="middle" style="font:600 11px Inter;fill:#7A4E2A">testa removed — the dashed line is the join between the two cotyledons</text>`;
      }else{
        const rx0 = cx - w*.24, ry0 = cy + h*.16;
        s += `<ellipse data-lab="cotyledon" cx="${cx}" cy="${cy}" rx="${w/2 - 3}" ry="${h/2 - 3}" fill="#F4EBC4" stroke="#B59F5A" stroke-width="2"/>
          <path data-lab="radicle" d="M${rx0} ${ry0 - 8}L${cx - w*.45} ${cy + h*.34}L${rx0 + 6} ${ry0 + 8}Z" fill="#E8D58E" stroke="#9C8442" stroke-width="1.5"/>
          <g data-lab="plumule"><path d="M${rx0 + 2} ${ry0 - 4}C${cx - w*.12} ${cy} ${cx - w*.05} ${cy - h*.06} ${cx + w*.02} ${cy - h*.1}C${cx - w*.02} ${cy + h*.08} ${cx - w*.12} ${cy + h*.14} ${rx0 + 6} ${ry0 + 4}Z" fill="#CFE29A" stroke="#7A9A4A" stroke-width="1.5"/>
          <circle cx="${cx - w*.08}" cy="${cy - h*.02}" r="12" fill="transparent"/></g>`;
        if(L.has("cotyledon")) s += lab("cotyledon", cx + w*.28, cy - h*.05, x0 + w + 20, cy + 2);
        if(L.has("plumule")) s += lab("plumule", cx - w*.04, cy - h*.07, 104, cy - h*.3, "end");
        if(L.has("radicle")) s += lab("radicle", cx - w*.4, cy + h*.3, 104, cy + h*.42 + 18, "end");
      }
      // ruler with its zero lined up with the left end of the seed
      const yr = cy + h/2 + 22;
      s += `<rect x="${x0 - 14}" y="${yr}" width="${30*PX + 44}" height="36" rx="3" fill="#F2E6C2" stroke="#B8962E"/>`;
      for(let mm = 0; mm <= 30; mm++){ const x = x0 + mm*PX, l = mm % 10 === 0 ? 15 : mm % 5 === 0 ? 11 : 7;
        s += `<line x1="${x}" y1="${yr}" x2="${x}" y2="${yr + l}" stroke="#4B3621" stroke-width="1"/>`; if(mm % 10 === 0) s += `<text x="${x}" y="${yr + 29}" text-anchor="middle" style="font:600 11px 'JetBrains Mono';fill:#4B3621">${mm/10}</text>`; }
      s += `<text x="${x0 + 30*PX + 26}" y="${yr + 30}" text-anchor="end" style="font:500 9px Inter;fill:#4B3621">cm</text>`;
      s += `<text x="242" y="${yr + 60}" text-anchor="middle" class="fl-s">${st.read.Ls ? `seed length recorded: ${st.read.Ls} mm` : "the left end of the seed is lined up with 0"}</text>`;

      if(st.split){
        const D = 4, Wd = st.Ld*D, hd = Wd*.62, xd = 540, cyd = 122 + hd/2, cxd = xd + Wd/2, rd = cxd - Wd*.24, rdy = cyd + hd*.16;
        s += `<rect x="480" y="50" width="462" height="424" rx="6" fill="#FFFFFF" stroke="#A2ACBD"/>
          <ellipse cx="${cxd}" cy="${cyd}" rx="${Wd/2}" ry="${hd/2}" fill="none" stroke="#111" stroke-width="1.4"/>
          <path d="M${rd} ${rdy - 8}L${cxd - Wd*.45} ${cyd + hd*.34}L${rd + 6} ${rdy + 8}Z" fill="none" stroke="#111" stroke-width="1.2"/>
          <path d="M${rd + 2} ${rdy - 4}C${cxd - Wd*.12} ${cyd} ${cxd - Wd*.05} ${cyd - hd*.06} ${cxd + Wd*.02} ${cyd - hd*.1}C${cxd - Wd*.02} ${cyd + hd*.08} ${cxd - Wd*.12} ${cyd + hd*.14} ${rd + 6} ${rdy + 4}Z" fill="none" stroke="#111" stroke-width="1.2"/>`;
        const ll = (t, px, py, tx) => `<line x1="${px}" y1="${py}" x2="${tx}" y2="96" stroke="#111" stroke-width=".9"/><text x="${tx}" y="90" text-anchor="middle" style="font:500 11px Inter;fill:#111">${t}</text>`;
        s += ll("radicle", cxd - Wd*.4, cyd + hd*.3, 512) + ll("plumule", cxd - Wd*.02, cyd - hd*.09, 610) + ll("cotyledon", cxd + Wd*.28, cyd - hd*.2, 760);
        const yr2 = cyd + hd/2 + 22;
        s += `<rect x="${xd - 14}" y="${yr2}" width="${90*D + 40}" height="36" rx="3" fill="#F2E6C2" stroke="#B8962E"/>`;
        for(let mm = 0; mm <= 90; mm++){ const x = xd + mm*D, l = mm % 10 === 0 ? 15 : mm % 5 === 0 ? 11 : 6;
          s += `<line x1="${x}" y1="${yr2}" x2="${x}" y2="${yr2 + l}" stroke="#4B3621" stroke-width=".8"/>`; if(mm % 10 === 0) s += `<text x="${x}" y="${yr2 + 29}" text-anchor="middle" style="font:600 10px 'JetBrains Mono';fill:#4B3621">${mm/10}</text>`; }
        s += `<text x="${xd + 90*D + 22}" y="${yr2 + 30}" text-anchor="end" style="font:500 9px Inter;fill:#4B3621">cm</text>
          <text x="711" y="${yr2 + 62}" text-anchor="middle" style="font:600 11px Inter;fill:#334155">Student’s drawing of the opened seed (one cotyledon)</text>
          <text x="711" y="${yr2 + 78}" text-anchor="middle" class="fl-s">measure the length of the drawing from end to end</text>`;
      }else s += `<text x="711" y="262" text-anchor="middle" class="k-lbl">the drawing appears here when the seed is open</text>`;
      return s;
    }

    function status(){
      const sp = SPEC[spec], st = S[spec];
      if(spec === "seed"){
        if(!st.peeled) return !st.labs.has("testa") || !st.labs.has("micropyle") ? "Label the testa and micropyle, then peel off the testa" : "Use the forceps to peel off the testa";
        if(!st.split) return "Use the forceps on the join to split the cotyledons";
        return ["cotyledon","plumule","radicle"].some(k => !st.labs.has(k)) ? "Label the cotyledon, plumule and radicle" : st.mag ? "Seed done — magnification calculated" : "Measure the drawing and calculate its magnification";
      }
      const next = sp.order.find(k => st.rem[k] < sp.tot[k]);
      if(next) return `Forceps: remove the ${PLUR[next]}` + (next === sp.order[0] ? " first (outermost)" : "");
      const left = sp.labels.filter(k => !st.labs.has(k));
      return left.length ? `Label the parts — ${left.length} still to label` : "All parts removed and labelled";
    }
    function draw(){
      const st = S[spec];
      $("#fl-main").innerHTML = spec === "insect" ? drawInsect(st) : spec === "wind" ? drawWind(st) : drawSeed(st);
      $("#fl-status").textContent = status();
      tools();
      const sp = SPEC[spec];
      ctx.readout(spec === "seed" ? [["Specimen", sp.name], ["Labelled", `${st.labs.size}/5`], ["Seed length", st.read.Ls ? st.read.Ls + " mm" : "—"], ["Drawing length", st.read.Ld ? st.read.Ld + " mm" : "—"]]
        : [["Specimen", sp.name], ["Removed", sp.order.map(k => `${st.rem[k]} ${PLUR[k]}`).join(" · ")], ["Labelled", `${st.labs.size}/${sp.labels.length}`]]);
      seedBox.style.display = spec === "seed" ? "" : "none";
    }

    function take(part){
      const sp = SPEC[spec], st = S[spec];
      if(spec === "seed"){
        if(part === "testa"){
          if(!st.labs.has("testa") || !st.labs.has("micropyle")) return ctx.toast("Label the testa and micropyle first — they come off with the testa");
          st.peeled = true; ctx.toast("Testa peeled off — the soaking made it soft and loose");
        }else if(part === "seam"){ st.split = true; ctx.toast("Seed split open along the join between the cotyledons"); }
        return draw();
      }
      const next = sp.order.find(k => st.rem[k] < sp.tot[k]);
      if(!next) return;
      if(part !== next) return ctx.toast(`Work from the outside in — remove the ${PLUR[next]} first`);
      st.rem[part]++;
      if(!sp.order.find(k => st.rem[k] < sp.tot[k]) && !st.rec){
        st.rec = true;
        sp.order.forEach(k => ctx.record({ spec:sp.short, part:PLUR[k], n:sp.tot[k], L:null, note:sp.notes[k] }, true));
        ctx.toast("All parts removed — numbers recorded. Now label them.");
      }
      draw();
    }
    function label(k){
      const sp = SPEC[spec], st = S[spec];
      if(tool === "forceps") return;
      if(!sp.labels.includes(k)) return;
      if(k !== tool) return ctx.toast(`That isn’t the ${tool}`);
      if(st.labs.has(k)) return ctx.toast("Already labelled");
      st.labs.add(k);
      const nxt = sp.labels.find(x => !st.labs.has(x));
      tool = "forceps";
      if(spec === "insect" && st.labs.size === 9) ctx.complete("insect");
      if(spec === "wind" && st.labs.size === 4) ctx.complete("wind");
      if(spec === "seed") seedCheck();
      draw();
      if(!nxt) ctx.toast("Every part labelled");
    }
    svg.addEventListener("pointerdown", e => {
      if(e.button) return;
      if(tool === "forceps"){ const g = e.target.closest("[data-part]"); if(g) take(g.dataset.part); return; }
      const t = e.target.closest("[data-lab]");
      if(t) label(t.dataset.lab); else ctx.toast(`Click on the ${tool}`);
    });

    /* controls */
    ctx.seg({ label:"Specimen", value:"insect", options:[["insect","Insect-pollinated"],["wind","Wind-pollinated"],["seed","Bean seed"]], onChange(v){ spec = v; tool = "forceps"; draw(); } });
    const toolBox = ctx.html(`<div class="ctl"><div class="lbl"><span>Tool — forceps, or choose a label then click the part</span></div><div id="fl-tools" style="display:flex;flex-wrap:wrap;gap:6px"></div></div>`);
    function tools(){
      const sp = SPEC[spec], st = S[spec];
      const b = (k, t, done) => `<button type="button" class="btn small${tool === k ? " primary" : ""}" data-k="${k}"${done ? " disabled" : ""}>${t}${done ? " ✓" : ""}</button>`;
      toolBox.querySelector("#fl-tools").innerHTML = b("forceps", "Forceps", false) + sp.labels.map(k => b(k, k, st.labs.has(k))).join("");
    }
    toolBox.addEventListener("click", e => { const t = e.target.closest("button[data-k]"); if(!t || t.disabled) return; tool = t.dataset.k; tools(); });

    const seedBox = ctx.html(`<div></div>`);
    const rdS = Kit.reading(ctx, "Actual length of the seed / mm (ruler under the seed)", "e.g. 21.5", () => spec === "seed" ? S.seed.Ls : null, .5, v => { S.seed.read.Ls = v; ctx.toast("Seed length noted"); draw(); }, seedBox);
    const rdD = Kit.reading(ctx, "Length of the drawing / mm", "e.g. 70", () => spec === "seed" && S.seed.split ? S.seed.Ld : null, 1, v => { S.seed.read.Ld = v; ctx.toast("Drawing length noted"); draw(); }, seedBox);
    const ans = Kit.answer(ctx, "Magnification of the drawing (×)", "e.g. 3.2", v => {
      const st = S.seed;
      if(!st.read.Ls || !st.read.Ld) return [false, "Measure the seed and the drawing first."];
      const m = st.read.Ld/st.read.Ls;
      if(Math.abs(v - m)/m > .03) return [false, "Magnification = length of drawing ÷ actual length, with both in mm."];
      if(!st.mag){
        st.mag = true;
        ctx.record({ spec:"Bean seed", part:"seed (actual)", n:1, L:st.read.Ls, note:"read from ruler, ±0.5 mm" }, true);
        ctx.record({ spec:"Bean seed", part:"drawing", n:null, L:st.read.Ld, note:`magnification ×${Number(m.toPrecision(2))}` });
      }
      seedCheck(); draw();
      return [true, `Correct: ${st.read.Ld} ÷ ${st.read.Ls} = ×${Number(m.toPrecision(2))}${st.labs.size < 5 ? ". Label all five parts to finish." : "."}`];
    }, seedBox);
    function seedCheck(){ if(S.seed.mag && S.seed.labs.size === 5) ctx.complete("seed"); }

    const cmp = ctx.html(`<div class="ctl"><div class="lbl"><span>Insect- or wind-pollinated?</span></div><div id="fl-cmp"></div>
      <button type="button" class="btn small" id="fl-cmpchk" style="margin-top:6px">Check sorting</button><div id="fl-cmpfb" style="margin-top:6px"></div></div>`);
    function drawCmp(marks){
      cmp.querySelector("#fl-cmp").innerHTML = FEAT.map(([t], i) => `<div style="display:flex;align-items:center;gap:6px;margin:4px 0;font-size:.8rem">
        <span style="flex:1${marks ? `;color:${marks[i] ? "var(--sec)" : "var(--hi)"}` : ""}">${t}</span>
        ${[["i","Insect"],["w","Wind"]].map(([v, l]) => `<button type="button" class="btn small${sort[i] === v ? " primary" : ""}" data-f="${i}" data-v="${v}">${l}</button>`).join("")}</div>`).join("");
    }
    cmp.addEventListener("click", e => { const t = e.target.closest("button[data-f]"); if(!t) return; sort[+t.dataset.f] = t.dataset.v; drawCmp(); });
    cmp.querySelector("#fl-cmpchk").onclick = () => {
      const fb = cmp.querySelector("#fl-cmpfb");
      if(sort.some(s => !s)){ fb.innerHTML = `<div class="note bad">Sort every feature first.</div>`; return; }
      const marks = FEAT.map(([, a], i) => sort[i] === a), n = marks.filter(Boolean).length;
      drawCmp(marks);
      if(n === FEAT.length){ fb.innerHTML = `<div class="note ok">All correct. Insect-pollinated flowers attract insects and keep anthers and stigma inside; wind-pollinated flowers expose them to the air.</div>`; ctx.complete("compare"); }
      else fb.innerHTML = `<div class="note bad">${n}/${FEAT.length} correct — the ones in red are wrong. Think about what each flower needs to do to move pollen.</div>`;
    };
    drawCmp();
    ctx.buttons([{ label:"Fresh specimen", block:true, onClick(){ fresh(spec); tool = "forceps"; if(spec === "seed"){ rdS.clear(); rdD.clear(); ans.clear(); } draw(); } }]);
    draw();
  }
});

/* ───────────── CONTINUOUS AND DISCONTINUOUS VARIATION ───────────── */
Lab.register({
  id:"variation", subject:"biology", level:["igcse"], topic:"Variation · Continuous & discontinuous", interactive:true,
  title:"Continuous and discontinuous variation",
  summary:"Sample a class of 30 students. Measure a continuous feature (height or hand span) from the scale and record a discontinuous one (tongue rolling, earlobes or blood group). Then draw a histogram and a bar chart. You can also measure leaves from one tree.",
  aim:"Investigate and describe examples of continuous and discontinuous variation in a sample of 30 individuals, and show them as a histogram and a bar chart.",
  variables:{ iv:"Individual sampled (student or leaf)", dv:"Value of a continuous feature; category of a discontinuous feature", cv:["Same measuring method for everyone (shoes off, same hand, same ruler)","Sample chosen at random","Same sample size (30)"] },
  stageTitle:"Sample & charts", controlsTitle:"Sampling",
  thumb:`<svg viewBox="0 0 300 140">${[10,22,38,52,40,24,12].map((h, i) => `<rect x="${40 + i*24}" y="${120 - h*1.8}" width="24" height="${h*1.8}" fill="#5B8DEF" stroke="#1E3A8A"/>`).join("")}<line x1="36" y1="120" x2="270" y2="120" stroke="#888" stroke-width="2"/></svg>`,
  challenges:[
    { id:"measure", title:"Measure five", text:"Measure five individuals yourself by reading the scale, and record their discontinuous feature." },
    { id:"hist",    title:"Histogram", text:"Draw a correct histogram of a continuous feature for a class of 30." },
    { id:"bar",     title:"Bar chart", text:"Draw a correct bar chart of a discontinuous feature." },
    { id:"leaves",  title:"Leaves from one tree", text:"Measure 30 leaves and draw a correct histogram of leaf length." }
  ],
  columns:[{key:"who",label:"Individual"},{key:"feat",label:"Continuous feature"},{key:"val",label:"Value",dp:0},{key:"trait",label:"Discontinuous feature"},{key:"cat",label:"Category"}],
  questions:[
    { q:"Explain why height shows continuous variation but blood group shows discontinuous variation.",
      a:"Height can be any value within a range, with no separate groups. It is controlled by many genes and is also affected by the environment, for example diet and health. Blood group falls into a few distinct categories (A, B, AB, O) with nothing in between. It is controlled by a single gene and the environment has no effect." },
    { q:"Why was a sample of 30 used, and how could you make sure it was random?",
      a:"A larger sample is more representative, and one unusual person has less effect on the pattern. To choose at random, give every student a number and use a random number generator. Don’t pick friends or people who look tall or short, because that adds bias." },
    { q:"Why is a histogram used for hand span but a bar chart for tongue rolling?",
      a:"Hand span is continuous data, grouped into classes of equal width. The bars touch because the scale on the x-axis is continuous. Tongue rolling is discontinuous: it has separate categories, so the bars are drawn with gaps and the categories can go in any order." },
    { q:"Suggest how to make the height measurements accurate and consistent.",
      a:"Take shoes off. Stand straight with heels against the wall, looking straight ahead. Rest a set square or ruler flat on the head at 90° to the wall, and read the scale at eye level. Measure everyone at the same time of day, with the same person doing the measuring." },
    { q:"All 30 leaves came from one tree. Suggest why their lengths still vary.",
      a:"Leaves from one tree have the same genes, so the variation is caused by the environment: how much light the leaf gets (shade leaves are often larger), its position, its age, water supply and damage. Leaf length is still continuous variation. To improve, pick leaves at random from all round the tree, of the same age (e.g. the fifth leaf from the tip)." },
    { q:"Assess the risks and ethical issues of this survey.",
      a:"Low risk. For blood groups, use simulated blood kits or groups from medical records, because handling real blood risks infection and lancets must never be shared. Some people are sensitive about their height, so ask for consent and keep the data anonymous by using numbers instead of names." }
  ],
  setup(ctx){
    const N = 30, G = () => ctx.gauss(), R = (a, b) => a + Math.random()*(b - a);
    const CONT = {
      height:{ name:"Height", unit:"cm", lab:"Height / cm", ph:"e.g. 158", widths:[5, 10], gen:() => Math.round(Kit.clamp(160 + 8*G(), 138, 188)) },
      span:{ name:"Hand span", unit:"mm", lab:"Hand span / mm", ph:"e.g. 196", widths:[5, 10], gen:() => Math.round(Kit.clamp(196 + 12*G(), 160, 236)) },
      leaf:{ name:"Leaf length", unit:"mm", lab:"Leaf length / mm", ph:"e.g. 84", widths:[10, 20], gen:() => Math.round(Kit.clamp(84 + 13*G(), 46, 124)) }
    };
    const DISC = {
      tongue:{ name:"Tongue rolling", cats:["can roll","cannot roll"], p:[.68, .32] },
      ear:{ name:"Earlobes", cats:["free","attached"], p:[.6, .4] },
      blood:{ name:"Blood group", cats:["A","B","AB","O"], p:[.42, .1, .04, .44] }
    };
    const pick = p => { let r = Math.random(), i = 0; for(; i < p.length - 1; i++){ r -= p[i]; if(r < 0) break; } return i; };
    let sample = "class", cont = "height", disc = "tongue", view = "measure", chart = "hist", wide = 0;
    let P = [], sel = -1, manual = 0, user = { hist:[], bar:[] }, checked = null;
    const C = () => CONT[sample === "leaves" ? "leaf" : cont], D = () => DISC[disc];
    function newSample(){
      const c = C(), d = D();
      P = []; for(let i = 0; i < N; i++) P.push({ v:c.gen(), cat:pick(d.p), off:R(-4, 4), m:false, read:null, catOk:false });
      sel = -1; manual = 0; user = { hist:[], bar:[] }; checked = null; ctx.clearRows(); rd.clear(); a1.clear(); a2.clear();
    }

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 490" class="kb" id="va-svg"><defs>${Kit.DEFS}</defs>
      <style>#va-svg .va-i{cursor:pointer}#va-svg .va-i:hover{filter:drop-shadow(0 0 5px var(--accent))}#va-svg .va-t{font:600 11px Inter,sans-serif;fill:#1E293B}#va-svg .va-s{font:500 10px Inter,sans-serif;fill:#475569}
      #va-svg .va-n{font:600 10px 'JetBrains Mono',monospace;fill:#4B3621}#va-svg .va-bar{cursor:ns-resize}</style>
      <g id="va-main"></g><text x="24" y="30" class="k-status" id="va-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#va-svg"), $ = s => svg.querySelector(s);

    /* ── the sample grid ── */
    function grid(){
      let s = "";
      P.forEach((p, i) => {
        const x = 52 + (i % 6)*56, y = 104 + Math.floor(i/6)*78, on = i === sel;
        const col = p.m ? "#3FB37F" : "#8A93A6";
        s += `<g class="va-i" data-i="${i}">${on ? `<rect x="${x - 26}" y="${y - 44}" width="52" height="72" rx="8" fill="none" stroke="var(--accent)" stroke-width="2"/>` : ""}<rect x="${x - 26}" y="${y - 44}" width="52" height="72" fill="transparent"/>`;
        if(sample === "leaves"){ const k = p.v/124;
          s += `<path d="M${x} ${y + 14}L${x} ${y + 6}C${x - 16*k} ${y - 4} ${x - 12*k} ${y - 26*k} ${x} ${y - 40*k}C${x + 12*k} ${y - 26*k} ${x + 16*k} ${y - 4} ${x} ${y + 6}" fill="${p.m ? "#6FB24A" : "#7E8B6A"}" stroke="${p.m ? "#2F6B1F" : "#4B5563"}" stroke-width="1.2"/>`;
        }else{ const k = cont === "height" ? .78 + (p.v - 138)/50*.3 : 1;
          s += `<g transform="translate(${x} ${y + 14}) scale(${k}) translate(${-x} ${-y - 14})"><circle cx="${x}" cy="${y - 28}" r="8" fill="${col}"/><path d="M${x - 12} ${y + 14}V${y - 8}a12 10 0 0 1 24 0V${y + 14}Z" fill="${col}"/></g>`; }
        s += `<text x="${x}" y="${y + 26}" text-anchor="middle" style="font:500 9px Inter;fill:var(--txt2)">${i + 1}</text></g>`;
      });
      return s;
    }
    /* ── close-up scales ── */
    function hScale(x, y, w, h, v, off, pxmm, fingertip){        // horizontal close-up, mm ticks, numbers in cm
      const c = v + off, lo = c - w/2/pxmm, X = mm => x + w/2 + (mm - c)*pxmm;
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#FBFAF6" stroke="#A2ACBD"/><clipPath id="va-hc"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/></clipPath><g clip-path="url(#va-hc)">
        <rect x="${x}" y="${y + h - 46}" width="${w}" height="46" fill="#F2E6C2" stroke="#B8962E"/>`;
      for(let mm = Math.ceil(lo); mm <= lo + w/pxmm; mm++){ const xx = X(mm), l = mm % 10 === 0 ? 20 : mm % 5 === 0 ? 14 : 8;
        s += `<line x1="${xx}" y1="${y + h - 46}" x2="${xx}" y2="${y + h - 46 + l}" stroke="#4B3621" stroke-width="1"/>`; if(mm % 10 === 0) s += `<text x="${xx}" y="${y + h - 8}" text-anchor="middle" class="va-n" style="font-size:12px">${mm/10}</text>`; }
      s += fingertip(X(v), y + h - 46) + `</g><text x="${x + 8}" y="${y + 14}" class="va-s">close-up of the end · ruler marked in cm and mm</text>`;
      return s;
    }
    function scene(){
      if(sel < 0) return `<text x="660" y="250" text-anchor="middle" class="k-lbl">Click someone in the sample to measure them</text>`;
      const p = P[sel], c = C();
      let s = `<rect x="384" y="50" width="558" height="424" rx="10" fill="#EEE8DA" stroke="#A2ACBD"/>`;
      if(sample === "leaves"){
        const x0 = 440, k = 3.2, L = p.v*k, y = 190, wd = L*.42;
        s += `<rect x="${x0 - 14}" y="${y + 52}" width="${132*k + 28}" height="30" fill="#F2E6C2" stroke="#B8962E"/>`;
        for(let mm = 0; mm <= 130; mm += 5){ const xx = x0 + mm*k; s += `<line x1="${xx}" y1="${y + 52}" x2="${xx}" y2="${y + 52 + (mm % 10 ? 6 : 11)}" stroke="#4B3621"/>`; if(mm % 50 === 0) s += `<text x="${xx}" y="${y + 77}" text-anchor="middle" class="va-n">${mm/10}</text>`; }
        s += `<path d="M${x0 - 40} ${y + 4}H${x0}" stroke="#4F7A2A" stroke-width="3"/><path d="M${x0} ${y + 4}C${x0 + L*.2} ${y - wd*.6} ${x0 + L*.7} ${y - wd*.55} ${x0 + L} ${y + 4}C${x0 + L*.7} ${y + wd*.55} ${x0 + L*.2} ${y + wd*.6} ${x0} ${y + 4}Z" fill="#6FB24A" stroke="#2F6B1F" stroke-width="1.5"/><path d="M${x0} ${y + 4}H${x0 + L}" stroke="#2F6B1F"/>
          <text x="${x0}" y="${y + 100}" class="va-s">lamina (blade) lined up with 0 — the stalk is not included</text>`;
        s += hScale(420, 330, 500, 132, p.v, p.off, 16, (xx, yb) => `<path d="M${xx - 200} ${yb - 40}C${xx - 120} ${yb - 30} ${xx - 40} ${yb - 14} ${xx} ${yb - 2}C${xx - 40} ${yb + 2} ${xx - 120} ${yb + 6} ${xx - 200} ${yb + 8}Z" fill="#6FB24A" stroke="#2F6B1F" stroke-width="1.5" opacity=".95"/>`);
        return s;
      }
      if(cont === "height"){
        const fl = 452, k = 1.75, top = fl - p.v*k, H = p.v*k, hx = 470, r = H*.07;
        s += `<rect x="520" y="${fl - 200*k}" width="18" height="${200*k}" fill="#FDFCF7" stroke="#8A7A55"/>`;
        for(let cm = 0; cm <= 200; cm += 10){ const yy = fl - cm*k; s += `<line x1="520" y1="${yy}" x2="${cm % 50 ? 527 : 532}" y2="${yy}" stroke="#4B3621"/>`; if(cm % 50 === 0 && cm) s += `<text x="541" y="${yy + 3}" class="va-n" style="font-size:9px">${cm}</text>`; }
        s += `<circle cx="${hx}" cy="${top + r}" r="${r}" fill="#E8B894" stroke="#9C6B48"/><path d="M${hx - r*1.4} ${top + 2.2*r}h${r*2.8}l${r*.4} ${H*.42}h${-r*3.6}Z" fill="#5B7FD6" stroke="#2F4FA8"/>
          <path d="M${hx - r*.9} ${top + 2.2*r + H*.42}V${fl}M${hx + r*.9} ${top + 2.2*r + H*.42}V${fl}" stroke="#334155" stroke-width="${r*1.1}"/>
          <rect x="${hx - 20}" y="${top - 5}" width="${520 - hx + 22}" height="5" fill="#A97B47"/><line x1="384" y1="${fl}" x2="700" y2="${fl}" stroke="#8A7A55" stroke-width="2"/>`;
        // vertical close-up
        const bx = 570, by = 64, bw = 130, bh = 396, pc = 22, cc = p.v + p.off, Y = cm => by + bh/2 - (cm - cc)*pc;
        s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="#FBFAF6" stroke="#A2ACBD"/><clipPath id="va-vc"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6"/></clipPath><g clip-path="url(#va-vc)">
          <rect x="${bx + 74}" y="${by}" width="56" height="${bh}" fill="#FDFCF7" stroke="#8A7A55"/>`;
        for(let cm = Math.ceil(cc - 10); cm <= cc + 10; cm++){ const yy = Y(cm); s += `<line x1="${bx + 74}" y1="${yy}" x2="${bx + 74 + (cm % 5 ? 12 : 22)}" y2="${yy}" stroke="#4B3621" stroke-width="1.2"/>`;
          s += `<line x1="${bx + 74}" y1="${yy - pc/2}" x2="${bx + 80}" y2="${yy - pc/2}" stroke="#4B3621" stroke-width=".7"/>`;
          if(cm % 5 === 0) s += `<text x="${bx + 100}" y="${yy + 4}" class="va-n" style="font-size:12px">${cm}</text>`; }
        s += `<path d="M${bx} ${Y(p.v) + 4}C${bx + 20} ${Y(p.v) - 2} ${bx + 50} ${Y(p.v) - 2} ${bx + 74} ${Y(p.v) + 30}V${by + bh}H${bx}Z" fill="#5A3E2B"/><rect x="${bx}" y="${Y(p.v) - 6}" width="${bw}" height="6" fill="#A97B47"/></g>
          <text x="${bx + 4}" y="${by - 4}" class="va-s">close-up · cm</text>`;
      }else{
        const x0 = 430, k = 1.6, sp = p.v*k, yb = 292, pc = x0 + sp*.55, skin = (d, w) => `<path d="${d}" stroke="#9C6B48" stroke-width="${w + 3}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="#E8B894" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
        s += `<rect x="${x0 - 12}" y="${yb + 8}" width="${250*k + 24}" height="28" fill="#F2E6C2" stroke="#B8962E"/>`;
        for(let mm = 0; mm <= 250; mm += 5){ const xx = x0 + mm*k; s += `<line x1="${xx}" y1="${yb + 8}" x2="${xx}" y2="${yb + 8 + (mm % 10 ? 5 : 9)}" stroke="#4B3621"/>`; if(mm % 50 === 0) s += `<text x="${xx}" y="${yb + 32}" text-anchor="middle" class="va-n">${mm/10}</text>`; }
        s += skin(`M${pc - 30} ${yb - 30}L${x0 + 8} ${yb - 2}`, 16) + skin(`M${pc + 30} ${yb - 30}L${x0 + sp - 7} ${yb - 2}`, 13) + skin(`M${pc - 16} ${yb - 50}L${pc - 40} ${yb - 140}`, 15) + skin(`M${pc} ${yb - 50}L${pc + 4} ${yb - 150}`, 15) + skin(`M${pc + 16} ${yb - 50}L${pc + 46} ${yb - 136}`, 14)
          + `<ellipse cx="${pc}" cy="${yb - 40}" rx="40" ry="34" fill="#E8B894" stroke="#9C6B48" stroke-width="1.5"/><text x="${x0}" y="${yb - 160}" class="va-s">thumb tip on 0, hand spread as wide as possible</text>`;
        s += hScale(420, 340, 500, 124, p.v, p.off, 16, (xx, yb2) => `<path d="M${xx - 240} ${yb2 - 32}H${xx - 16}A16 16 0 0 1 ${xx - 16} ${yb2 - 0}H${xx - 240}Z" fill="#E8B894" stroke="#9C6B48" stroke-width="1.5"/>`);
      }
      // discontinuous feature card
      const bx = cont === "height" ? 730 : 720, bw = cont === "height" ? 196 : 206, by = 62;
      s += `<rect x="${bx}" y="${by}" width="${bw}" height="150" rx="8" fill="#FFFFFF" stroke="#A2ACBD"/><text x="${bx + 10}" y="${by + 18}" class="va-t">${D().name}</text>`;
      const mx = bx + bw/2, my = by + 88, cat = D().cats[p.cat];
      if(disc === "tongue"){
        s += `<ellipse cx="${mx}" cy="${my}" rx="62" ry="40" fill="#7A2E2E"/><path d="M${mx - 60} ${my - 14}Q${mx} ${my - 34} ${mx + 60} ${my - 14}" stroke="#F5EDE5" stroke-width="10" fill="none"/>`;
        s += cat === "can roll" ? `<path d="M${mx - 26} ${my + 30}C${mx - 34} ${my - 2} ${mx - 18} ${my - 14} ${mx - 8} ${my - 2}Q${mx} ${my + 8} ${mx + 8} ${my - 2}C${mx + 18} ${my - 14} ${mx + 34} ${my - 2} ${mx + 26} ${my + 30}Z" fill="#E77F8A" stroke="#A33A4A" stroke-width="1.5"/><path d="M${mx - 8} ${my - 2}Q${mx} ${my + 14} ${mx + 8} ${my - 2}" fill="#B9505F"/>`
          : `<path d="M${mx - 40} ${my + 30}C${mx - 44} ${my + 6} ${mx - 30} ${my - 4} ${mx} ${my - 4}C${mx + 30} ${my - 4} ${mx + 44} ${my + 6} ${mx + 40} ${my + 30}Z" fill="#E77F8A" stroke="#A33A4A" stroke-width="1.5"/><path d="M${mx} ${my}V${my + 24}" stroke="#B9505F"/>`;
        s += `<text x="${mx}" y="${by + 144}" text-anchor="middle" class="va-s">trying to roll the tongue</text>`;
      }else if(disc === "ear"){
        const ex = mx - 4, ey = my - 16;
        s += `<path d="M${bx + 18} ${by + 26}C${bx + 26} ${by + 70} ${bx + 22} ${by + 110} ${bx + 34} ${by + 140}" stroke="#9C6B48" stroke-width="2" fill="none"/><rect x="${bx + 2}" y="${by + 24}" width="20" height="120" fill="#E8B894" opacity=".5"/>`;
        s += cat === "free" ? `<path d="M${ex - 30} ${ey - 30}C${ex - 10} ${ey - 60} ${ex + 44} ${ey - 50} ${ex + 40} ${ey}C${ex + 38} ${ey + 30} ${ex + 24} ${ey + 36} ${ex + 14} ${ey + 56}C${ex + 6} ${ey + 72} ${ex - 12} ${ey + 70} ${ex - 14} ${ey + 54}C${ex - 16} ${ey + 44} ${ex - 22} ${ey + 40} ${ex - 30} ${ey + 38}" fill="#E8B894" stroke="#9C6B48" stroke-width="2"/>`
          : `<path d="M${ex - 30} ${ey - 30}C${ex - 10} ${ey - 60} ${ex + 44} ${ey - 50} ${ex + 40} ${ey}C${ex + 38} ${ey + 30} ${ex + 20} ${ey + 40} ${ex + 6} ${ey + 50}L${ex - 30} ${ey + 60}" fill="#E8B894" stroke="#9C6B48" stroke-width="2"/>`;
        s += `<path d="M${ex - 4} ${ey - 26}C${ex + 22} ${ey - 32} ${ex + 26} ${ey + 6} ${ex + 6} ${ey + 14}" stroke="#9C6B48" stroke-width="1.5" fill="none"/><line x1="${ex - 30}" y1="${ey - 34}" x2="${ex - 30}" y2="${ey + 64}" stroke="#9C6B48" stroke-width="1.5" stroke-dasharray="3 3"/>
          <text x="${mx + 20}" y="${by + 144}" text-anchor="middle" class="va-s">dashed line = side of head</text>`;
      }else{
        const aggA = cat === "A" || cat === "AB", aggB = cat === "B" || cat === "AB";
        const well = (x, agg, t) => `<circle cx="${x}" cy="${my - 4}" r="30" fill="${agg ? "#F7E7E7" : "#C0393B"}" stroke="#94A3B8" stroke-width="2"/>${agg ? [...Array(14)].map((_, j) => `<circle cx="${x + Math.cos(j*2.4)*(6 + (j*7) % 18)}" cy="${my - 4 + Math.sin(j*2.4)*(6 + (j*5) % 18)}" r="${2.5 + (j % 3)}" fill="#9B1C1F"/>`).join("") : ""}<text x="${x}" y="${my + 44}" text-anchor="middle" class="va-t">${t}</text>`;
        s += well(mx - 46, aggA, "anti-A") + well(mx + 46, aggB, "anti-B");
      }
      return s;
    }

    /* ── charts ── */
    function classes(){
      const c = C(), w = c.widths[wide], vals = P.filter(p => p.m).map(p => p.v);
      if(!vals.length) return null;
      const a = Math.floor(Math.min(...vals)/w)*w, n = Math.floor((Math.max(...vals) - a)/w) + 1;
      const f = Array(n).fill(0); vals.forEach(v => f[Math.floor((v - a)/w)]++);
      return { a, w, n, f, names:f.map((_, k) => `${a + k*w}–${a + (k + 1)*w - 1}`) };
    }
    function cats(){ const d = D(), f = d.cats.map(() => 0); P.filter(p => p.m).forEach(p => f[p.cat]++); return { n:f.length, f, names:d.cats }; }
    const PL = 414, PR = 925, PT = 96, PB = 410;
    let cur = null;
    function chartSvg(){
      const isH = chart === "hist", k = isH ? classes() : cats();
      if(!k) return `<text x="480" y="250" text-anchor="middle" class="k-lbl">Measure the sample first</text>`;
      cur = k;
      const u = user[chart]; while(u.length < k.n) u.push(0); u.length = k.n;
      const ymax = Math.max(10, Math.ceil((Math.max(...k.f) + 2)/2)*2), py = v => PB - v/ymax*(PB - PT);
      // tally table
      let s = `<rect x="16" y="50" width="340" height="424" rx="10" fill="#FBFAF6" stroke="#A2ACBD"/><text x="30" y="72" class="va-t">${isH ? C().lab : D().name}</text><text x="190" y="72" class="va-t">Tally</text>`;
      const rh = Math.min(30, 380/k.n);
      k.f.forEach((f, i) => { const y = 92 + i*rh;
        s += `<line x1="24" y1="${y - rh*.5 + 2}" x2="348" y2="${y - rh*.5 + 2}" stroke="#E2E8F0"/><text x="30" y="${y + 4}" class="va-t" style="font-weight:500">${k.names[i]}</text>`;
        for(let j = 0; j < f; j++){ const g = Math.floor(j/5), q = j % 5, gx = 190 + g*30;
          s += q < 4 ? `<line x1="${gx + q*5}" y1="${y - 7}" x2="${gx + q*5}" y2="${y + 7}" stroke="#1E293B" stroke-width="1.6"/>` : `<line x1="${gx - 3}" y1="${y + 6}" x2="${gx + 19}" y2="${y - 6}" stroke="#1E293B" stroke-width="1.6"/>`; } });
      // axes
      s += `<rect x="368" y="50" width="574" height="424" rx="10" fill="#FFFFFF" stroke="#A2ACBD"/>`;
      for(let v = 0; v <= ymax; v += ymax > 12 ? 2 : 1){ s += `<line x1="${PL}" y1="${py(v)}" x2="${PR}" y2="${py(v)}" stroke="#EEF2F6"/><text x="${PL - 6}" y="${py(v) + 4}" text-anchor="end" class="va-s">${v}</text>`; }
      const bw = isH ? (PR - PL - 20)/k.n : Math.min(90, (PR - PL - 20)/(k.n*1.6)), gap = isH ? 0 : ((PR - PL - 20) - bw*k.n)/(k.n + 1);
      const bx = i => PL + 10 + (isH ? i*bw : gap + i*(bw + gap));
      u.forEach((v, i) => { const bad = checked && checked[i] === false, good = checked && checked[i] === true;
        s += `<rect x="${bx(i)}" y="${py(v)}" width="${bw}" height="${PB - py(v)}" fill="${good ? "#7CC8A0" : "#8FB2F2"}" stroke="${bad ? "#DC2626" : "#1E3A8A"}" stroke-width="${bad ? 3 : 1.2}"/>
          <rect class="va-bar" data-b="${i}" x="${bx(i)}" y="${PT - 6}" width="${bw}" height="${PB - PT + 6}" fill="transparent"/>`; });
      if(isH){ for(let i = 0; i <= k.n; i++){ const x = bx(i); s += `<line x1="${x}" y1="${PB}" x2="${x}" y2="${PB + 5}" stroke="#334155"/>`; if(k.n <= 10 || i % 2 === 0) s += `<text x="${x}" y="${PB + 18}" text-anchor="middle" class="va-s">${k.a + i*k.w}</text>`; } }
      else u.forEach((_, i) => { s += `<text x="${bx(i) + bw/2}" y="${PB + 18}" text-anchor="middle" class="va-t">${k.names[i]}</text>`; });
      s += `<line x1="${PL}" y1="${PB}" x2="${PR}" y2="${PB}" stroke="#334155" stroke-width="1.5"/><line x1="${PL}" y1="${PT - 8}" x2="${PL}" y2="${PB}" stroke="#334155" stroke-width="1.5"/>
        <text x="${(PL + PR)/2}" y="${PB + 40}" text-anchor="middle" class="va-t">${isH ? C().lab : D().name}</text>
        <text x="${PL - 30}" y="${(PT + PB)/2}" text-anchor="middle" class="va-t" transform="rotate(-90 ${PL - 30} ${(PT + PB)/2})">Frequency</text>
        <text x="${(PL + PR)/2}" y="${PT - 22}" text-anchor="middle" class="va-s">${isH ? "Histogram: equal class widths, bars touching" : "Bar chart: separate categories, gaps between bars"} · drag each bar to its height</text>`;
      cur.py = py; cur.ymax = ymax;
      return s;
    }

    function draw(){
      const nm = P.filter(p => p.m).length;
      $("#va-main").innerHTML = view === "chart" ? chartSvg() : `<rect x="16" y="50" width="356" height="424" rx="10" fill="none" stroke="var(--brd2)"/>${grid()}${scene()}`;
      $("#va-status").textContent = view === "chart" ? (nm < N ? `Only ${nm}/${N} measured — finish the sample before checking a chart` : chart === "hist" ? "Use the tally to draw the histogram" : "Use the tally to draw the bar chart")
        : sel < 0 ? `Sample of ${N}: click an individual to measure` : P[sel].m ? `${who(sel)}: done` : `${who(sel)}: read the scale${sample === "leaves" ? "" : " and record the " + D().name.toLowerCase()}`;
      ctx.readout([["Sample", sample === "leaves" ? "30 leaves, one tree" : "class of 30"], ["Measured", `${nm}/${N}`], ["By you", String(manual)], ["Class width", `${C().widths[wide]} ${C().unit}`]]);
      catBox.style.display = sample === "leaves" ? "none" : "";
      rd.box.querySelector("label span").textContent = C().lab + (sel >= 0 ? ` — ${who(sel)}` : "");
      rd.input.placeholder = C().ph;
      catBox.querySelector("#va-cats").innerHTML = D().cats.map((c, i) => `<button type="button" class="btn small${sel >= 0 && P[sel].catOk && P[sel].cat === i ? " primary" : ""}" data-c="${i}">${c}</button>`).join("");
      catBox.querySelector(".lbl span").textContent = "Record their " + D().name.toLowerCase();
    }
    const who = i => (sample === "leaves" ? "Leaf " : "Student ") + (i + 1);
    function finishOne(i, auto){
      const p = P[i]; p.m = true;
      ctx.record({ who:who(i), feat:C().lab, val:p.v, trait:sample === "leaves" ? "—" : D().name, cat:sample === "leaves" ? "—" : D().cats[p.cat] }, auto);
      if(!auto){ manual++; if(manual >= 5) ctx.complete("measure"); }
    }
    function tryFinish(){
      const p = P[sel];
      if(p.m || p.read === null || (sample !== "leaves" && !p.catOk)) return;
      finishOne(sel, false); rd.clear();
      const nx = P.findIndex(q => !q.m); if(nx >= 0 && manual < 5) sel = nx;
    }

    Kit.dragger(ctx, svg, {
      hit(t, p){
        if(view !== "chart"){ const g = t.closest("[data-i]"); if(g){ sel = +g.dataset.i; rd.clear(); draw(); } return null; }
        const b = t.closest("[data-b]"); return b ? +b.dataset.b : null;
      },
      start(i, p){ setBar(i, p); }, move(i, p){ setBar(i, p); }
    });
    function setBar(i, p){
      if(!cur) return;
      const v = Kit.clamp(Math.round((PB - p.y)/(PB - PT)*cur.ymax), 0, cur.ymax);
      if(user[chart][i] !== v){ user[chart][i] = v; checked = null; draw(); }
    }

    /* controls */
    const segS = ctx.seg({ label:"Sample", value:"class", options:[["class","Class of 30 students"],["leaves","30 leaves from one tree"]], onChange(v){ sample = v; if(v === "leaves") chart = "hist", segCh.set("hist"); newSample(); draw(); ctx.toast("New sample of 30"); } });
    ctx.seg({ label:"Continuous feature (class)", value:"height", options:[["height","Height"],["span","Hand span"]], onChange(v){ cont = v; if(sample === "class"){ newSample(); ctx.toast("New sample of 30"); } draw(); } });
    ctx.seg({ label:"Discontinuous feature (class)", value:"tongue", options:[["tongue","Tongue rolling"],["ear","Earlobes"],["blood","Blood group"]], onChange(v){ disc = v; if(sample === "class"){ newSample(); ctx.toast("New sample of 30"); } draw(); } });
    ctx.seg({ label:"View", value:"measure", options:[["measure","Measure"],["chart","Draw charts"]], onChange(v){ view = v; checked = null; draw(); } });
    const rd = Kit.reading(ctx, "Measurement", "e.g. 158", () => sel >= 0 && !P[sel].m ? P[sel].v : null, .5, v => { P[sel].read = v; ctx.toast("Reading noted"); tryFinish(); draw(); });
    const catBox = ctx.html(`<div class="ctl"><div class="lbl"><span>Record their feature</span></div><div id="va-cats" style="display:flex;flex-wrap:wrap;gap:6px"></div></div>`);
    catBox.addEventListener("click", e => {
      const b = e.target.closest("button[data-c]"); if(!b) return;
      if(sel < 0) return ctx.toast("Choose someone first");
      const p = P[sel]; if(p.m) return ctx.toast("Already recorded");
      if(+b.dataset.c !== p.cat) return ctx.toast("Look again at the picture");
      p.catOk = true; tryFinish(); draw();
    });
    ctx.buttons([{ label:"Measure the rest for me", onClick(){
      if(manual < 5) return ctx.toast("Measure at least five yourself first");
      P.forEach((p, i) => { if(!p.m) finishOne(i, true); }); ctx.toast("Whole sample recorded"); draw();
    } }, { label:"New sample", onClick(){ newSample(); draw(); } }]);
    const segCh = ctx.seg({ label:"Chart", value:"hist", options:[["hist","Histogram (continuous)"],["bar","Bar chart (discontinuous)"]], onChange(v){
      if(v === "bar" && sample === "leaves"){ segCh.set("hist"); return ctx.toast("Leaves have no discontinuous feature here — use the class sample"); }
      chart = v; view = "chart"; checked = null; draw(); } });
    ctx.seg({ label:"Class width", value:0, options:[[0,"Narrow"],[1,"Wide"]], onChange(v){ wide = v; user.hist = []; checked = null; draw(); } });
    ctx.buttons([{ label:"Check chart", primary:true, onClick(){
      if(view !== "chart") return ctx.toast("Switch the view to Draw charts");
      if(P.some(p => !p.m)) return ctx.toast("Measure all 30 first");
      const u = user[chart]; checked = cur.f.map((f, i) => u[i] === f);
      const n = checked.filter(x => !x).length;
      if(!n){ ctx.complete(chart === "bar" ? "bar" : sample === "leaves" ? "leaves" : "hist"); ctx.toast(chart === "hist" ? "Correct histogram" : "Correct bar chart"); }
      else ctx.toast(`${n} bar${n > 1 ? "s" : ""} wrong — count the tally marks again`);
      draw();
    } }, { label:"Clear bars", onClick(){ user[chart] = []; checked = null; draw(); } }]);
    const a1 = Kit.answer(ctx, "Mean of the continuous feature for all 30", "same unit", v => {
      if(P.some(p => !p.m)) return [false, "Measure all 30 first."];
      const m = Kit.mean(P.map(p => p.v));
      return Math.abs(v - m) <= Math.max(.005*m, .05) ? [true, `Correct: total ÷ 30 = ${m.toFixed(1)} ${C().unit}.`] : [false, "Add up all 30 values and divide by 30."];
    });
    const a2 = Kit.answer(ctx, "Percentage of the class in the most common category / %", "e.g. 60", v => {
      if(sample === "leaves") return [false, "Use the class sample for this."];
      if(P.some(p => !p.m)) return [false, "Measure all 30 first."];
      const f = cats().f, m = Math.max(...f)/N*100;
      return Math.abs(v - m) <= .6 ? [true, `Correct: ${Math.max(...f)} ÷ 30 × 100 = ${m.toFixed(1)}%.`] : [false, "Number in that category ÷ 30 × 100."];
    });
    newSample(); draw();
  }
});
