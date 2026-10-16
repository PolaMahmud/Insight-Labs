"use strict";
/* ══════════════════════════════════════════════════════════════════
   BIOLOGY · AS LEVEL (9700 Paper 3) — part 4: microscope skills
   Making a temporary slide · Scale bars & micrographs ·
   Counting stomata with fields of view (sampling)
══════════════════════════════════════════════════════════════════ */

/* ───────────── MAKING A TEMPORARY SLIDE ───────────── */
Lab.register({
  id:"tempslide", subject:"biology", level:["igcse","as"], topic:"Cell structure · Microscopy", interactive:true,
  title:"Making a temporary slide",
  summary:"Peel onion epidermis, stain it, lower the coverslip, blot, then set up the microscope from low to high power. Mistakes show up in the view: bubbles, overlapping layers or invisible nuclei.",
  aim:"Make a temporary stained preparation of onion epidermis and set up a light microscope to observe the cells at high power.",
  variables:{ iv:"Technique choices (peel, stain, coverslip, focusing order)", dv:"Quality of the image: cells in one layer, nuclei visible, no air bubbles", cv:["Same onion","Same microscope (×10 eyepiece, ×10 and ×40 objectives)"] },
  stageTitle:"Bench & microscope view", controlsTitle:"Prepare the slide",
  thumb:`<svg viewBox="0 0 300 140"><rect x="40" y="56" width="220" height="30" rx="3" fill="#E6EEF7" stroke="#A2ACBD" stroke-width="2"/><rect x="120" y="52" width="60" height="38" fill="#C9DDF2" opacity=".7" stroke="#7C93AE"/><rect x="132" y="62" width="36" height="18" fill="#D9A441" opacity=".6"/></svg>`,
  steps:[
    { id:"peel",  text:"Peel a piece of epidermis" },
    { id:"stain", text:"Add a drop of stain to the slide" },
    { id:"mount", text:"Lay the tissue flat in the drop" },
    { id:"cover", text:"Lower a coverslip" },
    { id:"blot",  text:"Blot away excess stain" },
    { id:"low",   text:"Focus at low power (×10 objective)" },
    { id:"high",  text:"Switch to high power (×40) and fine focus" }
  ],
  challenges:[
    { id:"perfect", title:"Perfect slide", text:"Make a slide with no faults and see the nuclei at ×400." },
    { id:"faults",  title:"What went wrong?", text:"Make a slide with at least two different faults and see how each one looks." },
    { id:"stains",  title:"Compare stains", text:"Make good slides with iodine and with methylene blue." }
  ],
  columns:[{key:"stain",label:"Stain"},{key:"peel",label:"Tissue"},{key:"cover",label:"Coverslip"},{key:"faults",label:"Faults seen"},{key:"ok",label:"Good slide?"}],
  questions:[
    { q:"Why must the epidermis be a single layer of cells?",
      a:"Light has to pass through the specimen. A thick piece has cells on top of each other, so the image is dark and the outlines overlap and can’t be followed." },
    { q:"Why is the coverslip lowered at an angle with a mounted needle?",
      a:"It pushes the air out ahead of the liquid, so no air bubbles are trapped. Bubbles appear as dark-edged circles that hide cells and can be mistaken for structures." },
    { q:"Why do you focus at low power first?",
      a:"The low-power objective has a large working distance and field of view, so the specimen is easy to find and centre, and there’s no risk of the lens hitting the slide. At high power, use only the fine focus." },
    { q:"What does each stain show in onion cells?",
      a:"Iodine stains the nucleus (and any starch) yellow-brown and makes the cell walls clearer. Methylene blue stains the nucleus and cytoplasm blue. Without a stain the cells are almost transparent." },
    { q:"Assess the risk of making this slide.",
      a:"Low. Iodine and methylene blue stain skin and clothing and are irritant to eyes; razor blades or scalpels can cut; coverslips can break. Wear eye protection, cut away from your fingers on a tile, and dispose of broken glass safely." }
  ],
  setup(ctx){
    let peel = "thin", stain = "iodine", cover = "angle", st = {}, obj = 0, faults = new Set(), log = [];
    const ORDER = ["peel","stain","mount","cover","blot","low","high"];
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="ts-svg"><defs>${Kit.DEFS}<clipPath id="ts-clip"><circle cx="720" cy="230" r="190"/></clipPath>
      <filter id="ts-blur"><feGaussianBlur stdDeviation="3"/></filter></defs>${Kit.bench(960, 440)}
      <g id="ts-bench"></g><circle cx="720" cy="230" r="196" fill="#0A0D13"/><g clip-path="url(#ts-clip)" id="ts-view"></g><circle cx="720" cy="230" r="190" fill="none" stroke="#333" stroke-width="3"/>
      <text x="24" y="34" class="k-status" id="ts-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ts-svg"), $ = s => svg.querySelector(s);
    const sCol = () => stain === "iodine" ? "#D9A441" : stain === "mb" ? "#5B7FD6" : "#DDE6EE";
    function draw(){
      let b = `<rect x="60" y="300" width="380" height="60" rx="4" fill="#E6EEF7" stroke="var(--txt2)" stroke-width="1.5" opacity=".9"/><text x="250" y="390" text-anchor="middle" class="k-lbl">microscope slide</text>`;
      if(st.stain) b += `<ellipse cx="250" cy="330" rx="${st.blot ? 50 : 80}" ry="${st.blot ? 18 : 26}" fill="${sCol()}" opacity=".55"/>`;
      if(st.mount) b += `<rect x="${peel === "thin" ? 215 : 205}" y="318" width="${peel === "thin" ? 70 : 90}" height="${peel === "thin" ? 24 : 26}" rx="4" fill="#EFE3B8" opacity="${peel === "thin" ? .6 : .95}" stroke="#B8A26A"/>`;
      if(st.cover) b += `<rect x="180" y="296" width="140" height="68" fill="#C9DDF2" opacity=".55" stroke="#7C93AE"/>${faults.has("bubbles") ? [0, 1, 2].map(k => `<circle cx="${210 + k*40}" cy="${316 + (k % 2)*22}" r="7" fill="none" stroke="#475569" stroke-width="2"/>`).join("") : ""}`;
      if(!st.blot && st.cover) b += `<text x="250" y="420" text-anchor="middle" class="k-hint">excess stain around the coverslip</text>`;
      b += `<text x="250" y="270" text-anchor="middle" class="k-tag">${obj ? `on the stage · ×${obj} objective` : "on the bench"}</text>`;
      $("#ts-bench").innerHTML = b;
      let v = `<rect x="530" y="40" width="380" height="380" fill="#F6F1E3"/>`;
      if(obj){
        const sc = obj === 40 ? 2.6 : 1, nuc = stain !== "none", blur = !st.high && obj === 40 || !st.low;
        let cells = "";
        for(let r = -6; r <= 6; r++) for(let c = -4; c <= 4; c++){
          const w = 70*sc, h = 26*sc, x = 720 + c*w + (r % 2)*w/3, y = 230 + r*h;
          if(Math.abs(x - 720) > 240 || Math.abs(y - 230) > 240) continue;
          cells += `<rect x="${x - w/2}" y="${y - h/2}" width="${w}" height="${h}" fill="${stain === "none" ? "#F3EEDF" : stain === "iodine" ? "#F1DFAE" : "#DCE6F6"}" stroke="${stain === "none" ? "#D8CFB6" : "#8C7A4C"}" stroke-width="${1.2*sc/1.5 + .4}"/>`;
          if(nuc) cells += `<ellipse cx="${x - w*.2}" cy="${y}" rx="${7*sc}" ry="${5*sc}" fill="${stain === "iodine" ? "#9C6A1E" : "#2F4FA8"}" opacity=".85"/>`;
        }
        if(peel === "thick") cells += `<g opacity=".55" transform="translate(${18*sc} ${9*sc}) rotate(8 720 230)">${cells}</g><rect x="530" y="40" width="380" height="380" fill="#5A4A2A" opacity=".35"/>`;
        if(faults.has("bubbles")) cells += [[650, 170, 46], [800, 300, 34], [700, 330, 22]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r*sc*.7}" fill="#FBF9F3" stroke="#1F2937" stroke-width="${5*sc*.5}"/>`).join("");
        if(faults.has("cracked")) cells += `<path d="M560 80L700 220L660 300L860 420" stroke="#111" stroke-width="2" fill="none"/>`;
        v += `<g ${blur ? `filter="url(#ts-blur)"` : ""}>${cells}</g>`;
      }else v += `<text x="720" y="236" text-anchor="middle" class="k-lbl">put the slide on the stage to view it</text>`;
      $("#ts-view").innerHTML = v;
      const next = ORDER.find(k => !st[k]);
      $("#ts-status").textContent = st.high ? (faults.size ? "Faults: " + [...faults].join(", ") : "Clear view at ×400 — nuclei visible") : next ? "Next: " + ctx.def.steps.find(s => s.id === next).text.toLowerCase() : "";
      ctx.readout([["Stain", { iodine:"iodine", mb:"methylene blue", none:"none (water)" }[stain]], ["Objective", obj ? "×" + obj : "—"], ["Faults so far", faults.size ? [...faults].join(", ") : "none", faults.size ? "warn" : "good"]]);
    }
    function act(id){
      if(st[id] || st.high) return ctx.toast(st.high ? "Start a new slide" : "Already done");
      const i = ORDER.indexOf(id), before = ORDER.slice(0, i).filter(k => !["low", "high", "blot"].includes(k));   // blotting can be skipped (a fault); focusing order is checked below
      if(id === "high" && !st.low){ faults.add("cracked"); ctx.toast("Turned straight to ×40 and focused down — the lens hit the coverslip"); }
      else if(before.some(k => !st[k])) return ctx.toast("Do the earlier steps first");
      st[id] = true; ctx.step(id);
      if(id === "cover" && cover === "flat") faults.add("bubbles");
      if(id === "mount" && peel === "thick") faults.add("overlapping layers");
      if(id === "low"){ obj = 10; if(!st.blot) faults.add("stain on the stage"); }
      if(id === "high"){ obj = 40; finish(); }
      draw();
    }
    function finish(){
      if(stain === "none") faults.add("nuclei not visible (no stain)");
      const ok = !faults.size;
      ctx.record({ stain:{ iodine:"iodine", mb:"methylene blue", none:"none" }[stain], peel: peel === "thin" ? "single layer" : "thick piece", cover: cover === "angle" ? "at 45°" : "dropped flat", faults: ok ? "none" : [...faults].join("; "), ok: ok ? "✓" : "✗" });
      if(ok) ctx.complete("perfect");
      const rows = ctx.rows(), kinds = new Set(); rows.forEach(r => r.faults !== "none" && r.faults.split("; ").forEach(f => kinds.add(f)));
      if(kinds.size >= 2) ctx.complete("faults");
      if(["iodine", "methylene blue"].every(s => rows.some(r => r.stain === s && r.ok === "✓"))) ctx.complete("stains");
    }
    ctx.seg({ label:"Peel", value:"thin", options:[["thin","Thin single layer"],["thick","Thick piece"]], onChange(v){ if(!st.mount) peel = v; } });
    ctx.seg({ label:"Stain", value:"iodine", options:[["iodine","Iodine"],["mb","Methylene blue"],["none","Water only"]], onChange(v){ if(!st.stain) stain = v; } });
    ctx.seg({ label:"Coverslip", value:"angle", options:[["angle","Lower at 45° on a needle"],["flat","Drop it flat"]], onChange(v){ if(!st.cover) cover = v; } });
    ctx.buttons([{ label:"Peel", onClick(){ act("peel"); } }, { label:"Add stain", onClick(){ act("stain"); } }, { label:"Mount tissue", onClick(){ act("mount"); } }]);
    ctx.buttons([{ label:"Coverslip", onClick(){ act("cover"); } }, { label:"Blot", onClick(){ act("blot"); } }]);
    ctx.buttons([{ label:"×10 + coarse focus", onClick(){ if(!st.cover) return ctx.toast("Finish the slide first"); act("low"); } }, { label:"×40 + fine focus", onClick(){ if(!st.cover) return ctx.toast("Finish the slide first"); act("high"); } }]);
    ctx.buttons([{ label:"Start a new slide", primary:true, block:true, onClick(){ st = {}; obj = 0; faults = new Set(); ctx.resetSteps(); draw(); } }]);
    draw();
  }
});

/* ───────────── SCALE BARS & MICROGRAPHS ───────────── */
Lab.register({
  id:"scalebars", subject:"biology", level:["igcse","as"], topic:"Cell structure · Magnification", interactive:true,
  title:"Scale bars & micrographs",
  summary:"Drag a ruler over light and electron micrographs, measure the image and its scale bar, then work out actual sizes in µm or nm and the magnification.",
  aim:"Calculate actual sizes and magnifications from photomicrographs and electron micrographs using scale bars or a stated magnification.",
  variables:{ iv:"Micrograph", dv:"Actual size (µm or nm) and magnification", cv:["Measure with a ruler in mm","Measure along the line shown","Convert units before dividing"] },
  stageTitle:"Micrograph & ruler", controlsTitle:"Measure & calculate",
  thumb:`<svg viewBox="0 0 300 140"><ellipse cx="150" cy="60" rx="90" ry="34" fill="#D8D8D8" stroke="#555" stroke-width="3"/><path d="M80 60c20-20 30 20 50 0s30 20 50 0s20 20 40 0" stroke="#555" fill="none" stroke-width="2"/><rect x="60" y="110" width="60" height="6" fill="#111"/><rect x="20" y="124" width="260" height="14" fill="#F2E6C2"/></svg>`,
  challenges:[
    { id:"lm",  title:"Light micrograph", text:"Find the actual length of the palisade cell in µm." },
    { id:"tem", title:"Electron micrograph", text:"Find the actual length of the mitochondrion in nm." },
    { id:"mag", title:"Magnification", text:"Calculate a magnification from a scale bar." },
    { id:"given", title:"Given magnification", text:"Find the actual size of the red blood cell from a stated magnification." }
  ],
  columns:[{key:"img",label:"Micrograph"},{key:"L",label:"Image length / mm",dp:0},{key:"bar",label:"Scale bar / mm",dp:0},{key:"what",label:"Calculated"},{key:"ans",label:"Answer",dp:1}],
  questions:[
    { q:"What are the relationships between mm, µm and nm?",
      a:"1 mm = 1000 µm and 1 µm = 1000 nm. So 1 mm = 1 000 000 nm. Convert both lengths into the same unit before dividing." },
    { q:"Write the formula linking magnification, image size and actual size.",
      a:"Magnification = image size ÷ actual size. Rearranged: actual size = image size ÷ magnification." },
    { q:"How do you use a scale bar to find the magnification?",
      a:"Measure the scale bar on the page in mm, convert to the same unit as its label (e.g. 30 mm = 30 000 µm), and divide by the length it represents (e.g. 30 000 ÷ 10 µm = ×3000)." },
    { q:"How many significant figures should the answer have?",
      a:"The same as, or one more than, the smallest number of significant figures in the data used. A ruler reading of 46 mm (2 s.f.) with a 10 µm bar should give an answer to 2 or 3 s.f." },
    { q:"Why are electron micrographs used for organelles such as mitochondria?",
      a:"Electrons have a much shorter wavelength than light, so the resolution is much higher (about 0.5 nm compared with 200 nm). Structures smaller than about 200 nm, like cristae and ribosomes, cannot be resolved with a light microscope." }
  ],
  setup(ctx){
    const R = (a, b) => Math.round(a + Math.random()*(b - a));
    const IMGS = {
      lm:  { name:"Palisade cell (light micrograph)", L:R(78, 104), bar:R(22, 34), val:20, unit:"µm", ask:"um" },
      tem: { name:"Mitochondrion (TEM)", L:R(84, 112), bar:R(24, 36), val:.5, unit:"µm", ask:"nm" },
      chl: { name:"Chloroplast (TEM)", L:R(90, 116), bar:R(20, 30), val:1, unit:"µm", ask:"mag" },
      rbc: { name:"Red blood cell (×6000 stated)", L:R(40, 50), bar:0, mag:6000, ask:"um" }
    };
    const PX = 4, X0 = 120, Y0 = 220;           // 4 px per mm in the drawing
    let img = "lm", rx = 100, ry = 330;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 470" class="kb" id="sb-svg"><defs>${Kit.DEFS}</defs><rect x="60" y="40" width="840" height="270" rx="10" fill="#FBFAF6" stroke="var(--brd2)"/>
      <g id="sb-img"></g><g id="sb-ruler" class="k-drag"></g><text x="24" y="28" class="k-status" id="sb-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#sb-svg"), $ = s => svg.querySelector(s);
    function draw(){
      const I = IMGS[img], w = I.L*PX, x0 = X0, y = 170;
      let s = "";
      if(img === "lm") s += `<rect x="${x0}" y="${y - 40}" width="${w}" height="80" rx="30" fill="#CFE5B0" stroke="#3F7A2E" stroke-width="3"/>${[...Array(Math.round(w/26))].map((_, k) => `<ellipse cx="${x0 + 18 + k*26}" cy="${y + (k % 2 ? 18 : -18)}" rx="9" ry="6" fill="#3F9A3A"/>`).join("")}`;
      if(img === "tem") s += `<ellipse cx="${x0 + w/2}" cy="${y}" rx="${w/2}" ry="44" fill="#D4D4D4" stroke="#333" stroke-width="5"/><path d="M${x0 + 16} ${y}${[...Array(Math.round(w/30))].map((_, k) => `q8 ${k % 2 ? 40 : -40} 16 0q7 ${k % 2 ? -30 : 30} 14 0`).join("")}" stroke="#444" stroke-width="3" fill="none"/>`;
      if(img === "chl") s += `<ellipse cx="${x0 + w/2}" cy="${y}" rx="${w/2}" ry="52" fill="#CFCFCF" stroke="#333" stroke-width="5"/>${[...Array(6)].map((_, k) => `<g transform="translate(${x0 + 40 + k*(w - 80)/5} ${y})">${[...Array(6)].map((_, j) => `<rect x="-12" y="${-18 + j*6}" width="24" height="4" fill="#333"/>`).join("")}</g>`).join("")}<circle cx="${x0 + w*.3}" cy="${y + 28}" r="7" fill="#111"/>`;
      if(img === "rbc") s += `<circle cx="${x0 + w/2}" cy="${y}" r="${w/2}" fill="#E8A3A0" stroke="#B5605B" stroke-width="3"/><circle cx="${x0 + w/2}" cy="${y}" r="${w/4}" fill="#F2C4C1"/>`;
      s += `<path d="M${x0} ${y + 70}v14M${x0 + w} ${y + 70}v14M${x0} ${y + 77}H${x0 + w}" stroke="#B91C1C" stroke-width="1.5" stroke-dasharray="4 3"/><text x="${x0 + w/2}" y="${y + 100}" text-anchor="middle" style="font:600 11px Inter;fill:#B91C1C">measure along this line</text>`;
      if(I.bar) s += `<rect x="640" y="250" width="${I.bar*PX}" height="8" fill="#111"/><text x="${640 + I.bar*PX/2}" y="244" text-anchor="middle" style="font:700 13px Inter;fill:#111">${I.val} ${I.unit}</text>`;
      else s += `<text x="840" y="290" text-anchor="end" style="font:700 14px Inter;fill:#111">× ${I.mag.toLocaleString()}</text>`;
      s += `<text x="80" y="64" style="font:600 12px Inter;fill:#475569">${I.name}</text>`;
      $("#sb-img").innerHTML = s;
      let r = `<rect x="${rx}" y="${ry}" width="${160*PX + 20}" height="44" rx="4" fill="#F2E6C2" stroke="#B8962E" opacity=".95"/>`;
      for(let mm = 0; mm <= 160; mm++){ const x = rx + 10 + mm*PX, L = mm % 10 === 0 ? 16 : mm % 5 === 0 ? 11 : 6; r += `<line x1="${x}" y1="${ry}" x2="${x}" y2="${ry + L}" stroke="#4B3621" stroke-width=".9"/>`; if(mm % 10 === 0) r += `<text x="${x}" y="${ry + 30}" text-anchor="middle" style="font:600 10px 'JetBrains Mono';fill:#4B3621">${mm/10}</text>`; }
      r += `<text x="${rx + 160*PX - 10}" y="${ry + 40}" text-anchor="end" style="font:500 9px Inter;fill:#4B3621">cm · drag me</text>`;
      $("#sb-ruler").innerHTML = r;
      $("#sb-status").textContent = { um:"Find the actual length in µm", nm:"Find the actual length in nm", mag:"Find the magnification of this micrograph" }[I.ask];
      ctx.readout([["Micrograph", I.name], ["Asked for", { um:"actual length / µm", nm:"actual length / nm", mag:"magnification" }[I.ask]]]);
    }
    Kit.dragger(ctx, svg, {
      hit(tg, p){ return tg.closest("#sb-ruler") ? { x:rx, y:ry, p0:p } : null; },
      move(h, p){ rx = Kit.clamp(h.x + p.x - h.p0.x, -300, 880); ry = Kit.clamp(h.y + p.y - h.p0.y, 40, 420); draw(); }
    });
    ctx.select({ label:"Micrograph", value:"lm", options:Object.entries(IMGS).map(([k, v]) => [k, v.name]), onChange(v){ img = v; rdL.clear(); rdB.clear(); fb.clear(); draw(); } });
    const got = {};
    const rdL = Kit.reading(ctx, "Image length along the line / mm", "e.g. 92", () => IMGS[img].L, 1, v => { got[img] = Object.assign(got[img] || {}, { L:v }); ctx.toast("Image length noted"); });
    const rdB = Kit.reading(ctx, "Scale bar length / mm (skip if magnification is given)", "e.g. 30", () => IMGS[img].bar || null, 1, v => { got[img] = Object.assign(got[img] || {}, { bar:v }); ctx.toast("Scale bar noted"); });
    const fb = Kit.answer(ctx, "Your answer (µm, nm or ×)", "e.g. 61", v => {
      const I = IMGS[img], g = got[img] || {};
      if(!g.L || (I.bar && !g.bar)) return [false, "Measure the image" + (I.bar ? " and the scale bar" : "") + " with the ruler first."];
      const um = I.bar ? g.L/g.bar*I.val : g.L*1000/I.mag, truth = I.ask === "nm" ? um*1000 : I.ask === "mag" ? g.bar*1000/I.val : um;
      const ok = Math.abs(v - truth)/truth <= .03;
      const what = { um:"actual length / µm", nm:"actual length / nm", mag:"magnification" }[I.ask];
      if(ok){ ctx.record({ img:I.name, L:g.L, bar:g.bar || null, what, ans:Kit.round(v, 1) }); ctx.complete({ lm:"lm", tem:"tem", chl:"mag", rbc:"given" }[img]); return [true, `Correct: ${I.ask === "mag" ? "×" + Number(truth.toPrecision(3)).toLocaleString() : Number(truth.toPrecision(3)).toLocaleString() + (I.ask === "nm" ? " nm" : " µm")}.`]; }
      return [false, I.ask === "mag" ? "Magnification = scale bar length (convert mm to µm: × 1000) ÷ the length on the bar’s label." : I.bar ? `Actual = image length ÷ scale bar length × ${I.val} ${I.unit}${I.ask === "nm" ? ", then × 1000 for nm" : ""}.` : "Actual = image length (mm × 1000 = µm) ÷ magnification."];
    });
    draw();
  }
});

/* ───────────── STOMATA: SAMPLING WITH FIELDS OF VIEW ───────────── */
Lab.register({
  id:"stomata", subject:"biology", level:["as"], topic:"Microscopy · Sampling", interactive:true,
  title:"Counting stomata in fields of view",
  summary:"Count stomata in nail-varnish impressions of both leaf surfaces, sample five fields of view each, and calculate stomatal density per mm².",
  aim:"Estimate and compare the number of stomata per mm² on the upper and lower surfaces of a leaf by sampling several fields of view.",
  variables:{ iv:"Leaf surface (upper or lower)", dv:"Number of stomata per field of view → stomata per mm²", cv:["Same leaf, same magnification (×400)","Fields chosen at random, avoiding the midrib","Same counting rule for stomata on the edge"] },
  stageTitle:"Field of view ×400", controlsTitle:"Sampling",
  thumb:`<svg viewBox="0 0 300 140"><circle cx="150" cy="70" r="62" fill="#F3F0E6" stroke="#A2ACBD" stroke-width="3"/>${[[120,40],[170,52],[140,90],[190,96],[105,80]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="7" fill="#C5DFA4" stroke="#3F7A2E"/>`).join("")}</svg>`,
  challenges:[
    { id:"five",  title:"Five fields", text:"Count five fields of view on one surface." },
    { id:"both",  title:"Both surfaces", text:"Count at least three fields on each surface." },
    { id:"dens",  title:"Density", text:"Calculate the mean stomatal density of the lower surface per mm²." }
  ],
  columns:[{key:"surf",label:"Surface"},{key:"field",label:"Field",dp:0},{key:"n",label:"Stomata counted",dp:0},{key:"true",label:"Actual count",dp:0},{key:"d",label:"Stomata per mm²",dp:0}],
  series:"surf",
  graph:{ x:["field"], y:["n","d"], fit:"none" },
  questions:[
    { q:"How do you find the area of the field of view?",
      a:"Measure its diameter with a stage micrometer (here 0.30 mm), so radius r = 0.15 mm. Area = πr² = 3.14 × 0.15² = 0.0707 mm². Density = mean number per field ÷ area." },
    { q:"Why count several fields, chosen at random?",
      a:"Stomata are not evenly spread. A single field might be unusually dense or sparse. Several random fields give a representative mean and show the variation (range or standard deviation)." },
    { q:"Why is a counting rule needed for stomata cut by the edge of the field?",
      a:"Otherwise some are counted in two neighbouring fields or missed, and different people count differently. A common rule: count those touching the top or left edge, not those touching the bottom or right." },
    { q:"Why are there usually more stomata on the lower surface?",
      a:"The lower surface is shaded and cooler, with less air movement, so less water vapour is lost by transpiration while gas exchange still occurs." },
    { q:"Suggest an improvement to make the comparison more reliable.",
      a:"Sample more fields (e.g. ten) from several leaves of the same plant and of the same age, and calculate means with standard deviation. Use the same position on each leaf, avoiding the midrib and veins." }
  ],
  setup(ctx){
    const DIAM = .30, AREA = Math.PI*Math.pow(DIAM/2, 2), DENS = { lower:Kit.round(230 + Math.random()*60, 0), upper:Kit.round(50 + Math.random()*30, 0) };
    const CX = 330, CY = 245, RR = 205;
    let surf = "lower", stom = [], marked = new Set(), checked = false, fieldNo = { lower:0, upper:0 };
    function pois(l){ let L = Math.exp(-l), k = 0, p = 1; do{ k++; p *= Math.random(); } while(p > L); return k - 1; }
    function field(){
      checked = false; marked = new Set(); stom = [];
      const n = pois(DENS[surf]*AREA*1.25);       // includes some just outside the circle, cut by the edge
      for(let i = 0, tries = 0; i < n && tries < 2000; tries++){ const a = Math.random()*2*Math.PI, r = Math.sqrt(Math.random())*RR*1.12, x = CX + r*Math.cos(a), y = CY + r*Math.sin(a);
        if(stom.some(s => Math.hypot(s.x - x, s.y - y) < 36)) continue;   // guard cells don’t overlap
        stom.push({ x, y, a:(Math.random() - .5)*1.2 }); i++; }
    }
    const inside = s => Math.hypot(s.x - CX, s.y - CY) <= RR;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 490" class="kb" id="st-svg"><defs>${Kit.DEFS}<clipPath id="st-clip"><circle cx="${CX}" cy="${CY}" r="${RR}"/></clipPath></defs><rect width="960" height="490" fill="#0A0D13"/>
      <g clip-path="url(#st-clip)"><rect x="${CX - RR}" y="${CY - RR}" width="${2*RR}" height="${2*RR}" fill="#F3F0E6"/><g id="st-cells"></g><g id="st-stom"></g></g>
      <circle cx="${CX}" cy="${CY}" r="${RR}" fill="none" stroke="#333" stroke-width="3"/>
      <g transform="translate(590 40)"><rect width="340" height="300" rx="14" fill="#111827" stroke="#334155"/><g id="st-side"></g></g>
      <text x="24" y="30" class="k-status" style="fill:#E5E7EB" id="st-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#st-svg"), $ = s => svg.querySelector(s);
    let cells = "";
    for(let i = 0; i < 70; i++){ const x = CX - RR + (i % 10)*44 + (Math.floor(i/10) % 2)*20, y = CY - RR + Math.floor(i/10)*62; cells += `<path d="M${x} ${y}c14 -8 30 6 44 0l4 30c-10 14 -2 26 -6 32c-14 4 -30 -6 -42 0c-6 -10 4 -22 -2 -32z" fill="none" stroke="#C9C0A4" stroke-width="1.2"/>`; }
    $("#st-cells").innerHTML = cells;
    function draw(){
      $("#st-stom").innerHTML = stom.map((s, i) => { const m = marked.has(i), bad = checked && m !== inside(s);
        return `<g data-s="${i}" style="cursor:pointer" transform="rotate(${s.a*57.3} ${s.x} ${s.y})"><ellipse cx="${s.x}" cy="${s.y}" rx="15" ry="10" fill="${m ? "#9AD27A" : "#C5DFA4"}" stroke="${bad ? "#E0335A" : m ? "#0F9A62" : "#3F7A2E"}" stroke-width="${m || bad ? 3 : 1.4}"/><ellipse cx="${s.x}" cy="${s.y}" rx="9" ry="2.4" fill="#F3F0E6" stroke="#3F7A2E" stroke-width=".8"/></g>`; }).join("");
      $("#st-side").innerHTML = `<text x="16" y="28" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.06em">${surf.toUpperCase()} SURFACE · FIELD ${fieldNo[surf] + 1}</text>
        <text x="16" y="66" style="font:600 16px Inter;fill:#E5E7EB">Counted: ${marked.size}</text>
        <text x="16" y="104" style="font:500 12px Inter;fill:#9CA3AF">field diameter = ${DIAM.toFixed(2)} mm</text>
        <text x="16" y="126" style="font:500 12px Inter;fill:#9CA3AF">(measured with a stage micrometer)</text>
        <text x="16" y="168" style="font:500 12px Inter;fill:#9CA3AF">Count a stoma if its centre is inside</text>
        <text x="16" y="188" style="font:500 12px Inter;fill:#9CA3AF">the circle. Click to mark it.</text>
        <text x="16" y="240" style="font:500 12px Inter;fill:#9CA3AF">${checked ? "Checked: red outlines were wrong" : ""}</text>`;
      $("#st-status").textContent = checked ? "Recorded — move to a new field" : "Click every stoma whose centre lies inside the field";
      ctx.readout([["Surface", surf], ["Fields done", `${fieldNo.lower} lower · ${fieldNo.upper} upper`], ["Counted", String(marked.size)]]);
    }
    svg.addEventListener("click", e => { const g = e.target.closest("[data-s]"); if(!g || checked) return; const i = +g.dataset.s; marked.has(i) ? marked.delete(i) : marked.add(i); draw(); });
    ctx.seg({ label:"Leaf surface (nail-varnish impression)", value:"lower", options:[["lower","Lower"],["upper","Upper"]], onChange(v){ surf = v; field(); draw(); } });
    ctx.buttons([{ label:"Record this field", primary:true, onClick(){
      if(checked) return ctx.toast("Move to a new field first");
      checked = true; fieldNo[surf]++;
      ctx.record({ surf: surf === "lower" ? "Lower" : "Upper", field:fieldNo[surf], n:marked.size, true:stom.filter(inside).length, d:Math.round(marked.size/AREA) });
      if(fieldNo[surf] >= 5) ctx.complete("five");
      if(fieldNo.lower >= 3 && fieldNo.upper >= 3) ctx.complete("both");
      draw();
    } }, { label:"Move to a new field", onClick(){ field(); draw(); } }]);
    Kit.answer(ctx, "Mean stomatal density, lower surface / per mm²", "e.g. 250", v => {
      const rows = ctx.rows().filter(r => r.surf === "Lower"); if(rows.length < 3) return [false, "Count at least three fields on the lower surface first."];
      const mean = Kit.mean(rows.map(r => r.n))/AREA;
      if(Math.abs(v - mean)/mean <= .04){ ctx.complete("dens"); return [true, `Correct from your counts: mean ${Kit.mean(rows.map(r => r.n)).toFixed(1)} per field ÷ ${AREA.toFixed(4)} mm² = ${Math.round(mean)} per mm².`]; }
      return [false, "Mean number per field ÷ field area (π × 0.15² mm²)."];
    });
    field(); draw();
  }
});
