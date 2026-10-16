"use strict";
/* ══════════════════════════════════════════════════════════════════
   BIOLOGY · IGCSE (0610) — part 1: plants, gas exchange & exercise
   Testing a leaf for starch · Hydrogencarbonate indicator ·
   Water uptake by celery · Exercise, pulse rate & breathing
══════════════════════════════════════════════════════════════════ */

/* ───────────── TESTING A LEAF FOR STARCH ───────────── */
Lab.register({
  id:"leafstarch", subject:"biology", level:["igcse"], topic:"Plant nutrition · Photosynthesis", interactive:true,
  title:"Testing a leaf for starch",
  summary:"Destarch a plant, cover part of a leaf with foil, use a variegated leaf or seal a leaf in a flask with soda lime. After 6 hours in light, test the leaf for starch: boil in water, decolourise in ethanol, rinse, spread and add iodine.",
  aim:"Investigate the need for light, chlorophyll and carbon dioxide for photosynthesis by testing leaves for starch with iodine solution.",
  variables:{ iv:"Light, chlorophyll or carbon dioxide available to part of the leaf", dv:"Colour with iodine solution (blue-black = starch present, orange-brown = no starch)", cv:["Plant destarched for 48 hours in the dark","Same plant, left in light for the same time (6 h)","Same test method for every leaf"] },
  stageTitle:"Plant & test bench", controlsTitle:"Set up & test",
  thumb:`<svg viewBox="0 0 300 140"><rect x="40" y="20" width="220" height="104" rx="6" fill="#F4F6FA" stroke="#A2ACBD" stroke-width="2"/><path d="M70 72C110 30 190 30 230 72C190 114 110 114 70 72Z" fill="#1F1C3B"/><rect x="128" y="34" width="44" height="76" fill="#C47A2C"/><path d="M70 72C110 30 190 30 230 72C190 114 110 114 70 72Z" fill="none" stroke="#555" stroke-width="2"/></svg>`,
  steps:[
    { id:"light", text:"Leave the plant in light for 6 hours" },
    { id:"pick",  text:"Pick the test leaf" },
    { id:"water", text:"Boil the leaf in water for 1 minute" },
    { id:"off",   text:"Turn the Bunsen burner off" },
    { id:"eth",   text:"Put the leaf in ethanol in the hot water bath" },
    { id:"rinse", text:"Rinse the leaf in warm water" },
    { id:"tile",  text:"Spread the leaf on a white tile" },
    { id:"iodine",text:"Add iodine solution and look at the colours" }
  ],
  challenges:[
    { id:"light",   title:"Light needed", text:"With a destarched plant, show that the part of a leaf under a foil stencil makes no starch." },
    { id:"chl",     title:"Chlorophyll needed", text:"With a destarched variegated plant, show that only the green parts make starch." },
    { id:"co2",     title:"Carbon dioxide needed", text:"Compare a leaf in a flask with soda lime with a leaf in a control flask." },
    { id:"control", title:"Why destarch?", text:"Do a careful test on a plant that was NOT destarched and see why the result means nothing." }
  ],
  columns:[{key:"exp",label:"Experiment"},{key:"part",label:"Part of leaf"},{key:"ds",label:"Destarched?"},{key:"col",label:"Colour with iodine"},{key:"starch",label:"Starch present?"},{key:"faults",label:"Method faults"}],
  questions:[
    { q:"Why is the plant destarched by keeping it in the dark for 48 hours first?",
      a:"In the dark the plant cannot photosynthesise, so it uses up (and translocates away) the starch already stored in its leaves. Any starch found afterwards must have been made during the experiment, under the conditions being tested." },
    { q:"Give the reason for each step of the starch test.",
      a:"Boiling in water kills the cells, stops enzyme reactions and breaks the membranes so iodine can get in. Hot ethanol dissolves the chlorophyll, so the green colour no longer hides the iodine colour. Rinsing in warm water softens the leaf, which ethanol makes brittle. A white tile shows the colours clearly." },
    { q:"Assess the risk of heating the leaf in ethanol.",
      a:"High if done badly: ethanol is highly flammable and its vapour can catch fire. Turn the Bunsen burner off before the ethanol is brought out, heat the boiling tube of ethanol only in a beaker of hot water, keep the bottle stoppered and away from flames, and wear eye protection. Iodine solution is an irritant and stains." },
    { q:"In the carbon dioxide experiment, what is the soda lime for and what is the control?",
      a:"Soda lime (or potassium hydroxide solution) absorbs carbon dioxide from the air in the flask. The control is an identical flask with water (or sodium hydrogencarbonate) instead, so the only difference is carbon dioxide. Both leaves must be on the same plant, in the same light." },
    { q:"A variegated leaf has green and white parts. Explain the result of the test.",
      a:"The green parts turn blue-black because their cells contain chloroplasts with chlorophyll, which absorbs light energy for photosynthesis, so glucose is made and stored as starch. The white parts have no chlorophyll, cannot photosynthesise and stay orange-brown." },
    { q:"Suggest a limitation of this method and an improvement.",
      a:"It only shows whether starch is present, not how much photosynthesis took place, and starch may have moved from neighbouring parts. A stencil edge also lets some light leak in. Improve by using several leaves, a sharp-edged opaque stencil, or measure the rate instead (oxygen bubbles or hydrogencarbonate indicator)." }
  ],
  setup(ctx){
    const ORDER = ["water","eth","rinse","tile","iodine"];
    const EXP = { light:"Light (foil stencil)", chl:"Chlorophyll (variegated leaf)", co2:"Carbon dioxide (soda lime flask)" };
    const REG = { light:[["u","Uncovered parts"],["cov","Under the foil"]], chl:[["g","Green parts"],["w","White parts"]], co2:[["b","Leaf B: control flask"],["a","Leaf A: soda lime flask"]] };
    const FAULT = { water:"not boiled in water first", eth:"chlorophyll not removed", rinse:"not rinsed — leaf brittle and cracked" };
    let expt = "light", destarch = true, bunsen = false, heated = false, st, skipped, where, busy, marks;
    function fresh(){ st = {}; skipped = new Set(); where = "plant"; busy = null; marks = new Set(); ctx.resetSteps(); }
    fresh();
    const starch = r => destarch ? ["u","g","b"].includes(r) : true;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="ls-svg"><defs>${Kit.DEFS}
      <clipPath id="ls-c1"><path id="ls-cp1"/></clipPath><clipPath id="ls-c2"><path id="ls-cp2"/></clipPath></defs>${Kit.bench(960, 440)}
      <g id="ls-plant"></g><g id="ls-test"></g><g id="ls-tile"></g><text x="24" y="30" class="k-status" id="ls-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ls-svg"), $ = s => svg.querySelector(s);
    const leafD = (cx, cy, w, h) => `M${cx - w/2} ${cy}C${cx - w/4} ${cy - h/1.4} ${cx + w/4} ${cy - h/1.4} ${cx + w/2} ${cy}C${cx + w/4} ${cy + h/1.4} ${cx - w/4} ${cy + h/1.4} ${cx - w/2} ${cy}Z`;
    function colour(r){
      const white = r === "w";
      if(!st.iodine){
        if(st.eth) return skipped.has("water") ? (white ? "#E3E2C2" : "#9DB06A") : "#ECE4C4";
        if(st.water) return white ? "#DCE0BC" : "#3D7F31";
        return white ? "#F1F4DE" : "#4E9A3A";
      }
      const s = starch(r);
      if(skipped.has("eth")) return white ? (s ? "#3A3448" : "#C08A3A") : (s ? "#22341E" : "#3E5A26");
      if(skipped.has("water")) return s ? "#74647E" : "#C9A35B";
      return s ? "#1F1C3B" : "#C47A2C";
    }
    /* the big leaf on the tile, regions clickable once iodine is on */
    function bigLeaf(){
      const mk = (r, extra) => `data-r="${r}" fill="${colour(r)}" ${extra || ""}`;
      const ring = r => st.iodine && marks.has(r) ? `stroke="#F59E0B" stroke-width="4" stroke-dasharray="7 5"` : "";
      let s = "", cracks = skipped.has("rinse") && st.tile;
      const crack = (cx, cy) => cracks ? `<path d="M${cx - 50} ${cy - 20}l18 14l-6 14l22 10M${cx + 30} ${cy - 30}l-10 20l16 8l-4 24" stroke="#5B4A2A" stroke-width="1.6" fill="none"/>` : "";
      if(expt === "co2"){
        [["a", 720, "A · soda lime"], ["b", 860, "B · control"]].forEach(([r, cx, lab], i) => {
          s += `<path d="${leafD(cx, 300, 120, 90)}" ${mk(r)} stroke="#5B6B4A" stroke-width="1.5"/><path d="${leafD(cx, 300, 120, 90)}" fill="none" ${ring(r)} pointer-events="none"/>
            <line x1="${cx - 60}" y1="300" x2="${cx + 50}" y2="300" stroke="#00000033" pointer-events="none"/>${crack(cx, 300)}
            <text x="${cx}" y="372" text-anchor="middle" class="k-tag">${lab}</text>`;
        });
        return s;
      }
      const cx = 790, cy = 295, w = 240, h = 140;
      $("#ls-cp1").setAttribute("d", leafD(cx, cy, w, h));
      if(expt === "light"){
        s += `<g clip-path="url(#ls-c1)"><rect x="${cx - w/2}" y="${cy - h}" width="${w}" height="${2*h}" ${mk("u")}/><rect x="${cx - 30}" y="${cy - h}" width="60" height="${2*h}" ${mk("cov")}/>
          <rect x="${cx - w/2}" y="${cy - h}" width="${w}" height="${2*h}" fill="none" ${ring("u")} pointer-events="none"/><rect x="${cx - 30}" y="${cy - h}" width="60" height="${2*h}" fill="none" ${ring("cov")} pointer-events="none"/></g>`;
      }else{
        s += `<path d="${leafD(cx, cy, w, h)}" ${mk("w")}/><path d="${leafD(cx, cy, w*.62, h*.55)}" ${mk("g")}/>
          <path d="${leafD(cx, cy, w, h)}" fill="none" ${ring("w")} pointer-events="none"/><path d="${leafD(cx, cy, w*.62, h*.55)}" fill="none" ${ring("g")} pointer-events="none"/>`;
      }
      s += `<path d="${leafD(cx, cy, w, h)}" fill="none" stroke="#5B6B4A" stroke-width="1.6" pointer-events="none"/><line x1="${cx - w/2 - 26}" y1="${cy}" x2="${cx + w/2 - 8}" y2="${cy}" stroke="#00000040" stroke-width="2" pointer-events="none"/>${crack(cx, cy)}`;
      const tick = (x, y) => `<g pointer-events="none"><circle cx="${x}" cy="${y}" r="11" fill="#F59E0B" stroke="#fff" stroke-width="2"/><text x="${x}" y="${y + 4}" text-anchor="middle" style="font:700 12px Inter;fill:#111">✓</text></g>`;
      const TP = expt === "light" ? { u:[[cx - 75, cy - 30], [cx + 75, cy - 30]], cov:[[cx, cy + 34]] } : { g:[[cx, cy - 18]], w:[[cx - 92, cy]] };
      if(st.iodine) for(const r in TP) if(marks.has(r)) TP[r].forEach(([x, y]) => s += tick(x, y));
      return s;
    }
    function smallLeaf(x, y, sc){
      const c = colour(expt === "chl" ? "g" : "u");
      return `<g transform="translate(${x} ${y}) scale(${sc || 1})"><path d="${leafD(0, 0, 46, 26)}" fill="${c}" stroke="#4A5A3A"/>${expt === "chl" ? `<path d="${leafD(0, 0, 46, 26)}" fill="none" stroke="${colour("w")}" stroke-width="5"/>` : ""}</g>`;
    }
    function draw(){
      /* 1 · plant */
      const dark = !st.light;
      let p = `<rect x="20" y="50" width="270" height="390" rx="10" fill="${dark ? "#1B2030" : "#FFF8DC"}" opacity="${dark ? .9 : .5}"/>
        <text x="155" y="74" text-anchor="middle" class="k-tag" style="fill:${dark ? "#CBD5E1" : ""}">${dark ? (destarch ? "Destarched: 48 h in the dark" : "NOT destarched (kept in light)") : "6 hours in bright light"}</text>`;
      if(!dark) p += `<circle cx="250" cy="96" r="26" fill="url(#k-glow)"/><circle cx="250" cy="96" r="12" fill="#FFD24A"/>`;
      p += `<path d="M110 440l10-70h70l10 70z" fill="#B5643A"/><rect x="104" y="362" width="102" height="12" rx="3" fill="#9A522E"/><path d="M155 362V150" stroke="#4E7A2E" stroke-width="5"/>`;
      const leaves = [[115, 300, -1], [195, 260, 1], [118, 220, -1], [192, 180, 1]];
      leaves.forEach(([x, y, d], i) => {
        const test = i === 1, lw = 66, cx = x + d*8;
        if(test && st.pick) return;
        const var_ = expt === "chl";
        p += `<path d="M155 ${y + 10}L${cx} ${y}" stroke="#4E7A2E" stroke-width="3"/><path d="${leafD(cx + d*28, y, lw, 34)}" fill="${var_ ? "#EEF2D6" : "#4E9A3A"}" stroke="#3F6E2A"/>`;
        if(var_) p += `<path d="${leafD(cx + d*28, y, lw*.6, 18)}" fill="#4E9A3A"/>`;
        if(test && expt === "light") p += `<rect x="${cx + d*28 - 9}" y="${y - 20}" width="18" height="40" fill="url(#k-metal)" stroke="#555" stroke-width=".8"/><text x="${cx + d*28 + 44}" y="${y - 22}" text-anchor="middle" class="k-lbl">foil</text>`;
      });
      if(expt === "co2"){
        [[70, "A", "soda lime"], [240, "B", "water"]].forEach(([x, k, lab]) => {
          const pk = st.pick;
          p += `<path d="M${x - 14} 330v-40l-24 60h76l-24-60v40" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4" transform="translate(0 0)"/>
            <path d="M${x - 34} 352h68l-6 -14h-56z" fill="${k === "A" ? "#E8E8E0" : "#BFDBF7"}" opacity=".9"/>
            ${pk ? "" : `<path d="${leafD(x, 320, 34, 18)}" fill="#4E9A3A" stroke="#3F6E2A"/>`}
            <rect x="${x - 10}" y="282" width="20" height="10" fill="#C4A27A"/>
            <text x="${x}" y="276" text-anchor="middle" class="k-lbl">${k}: ${lab}</text>`;
        });
      }
      if(where === "bench") p += smallLeaf(250, 404, 1) + `<text x="250" y="428" text-anchor="middle" class="k-lbl">${expt === "co2" ? "leaves A and B" : "test leaf"} picked</text>`;
      $("#ls-plant").innerHTML = p;
      /* 2 · test bench */
      const hot = heated, ethGreen = st.eth && !skipped.has("water");
      let t = `<text x="455" y="74" text-anchor="middle" class="k-tag">Boiling water / water bath</text>
        <path d="M380 340h150M392 340l-18 100M518 340l18 100" stroke="#6B7280" stroke-width="4"/>
        <rect x="400" y="230" width="110" height="108" rx="6" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><rect x="403" y="252" width="104" height="84" rx="5" fill="url(#k-water)"/>`;
      if(bunsen) t += `<path d="M455 400c-14-22 0-40 0-52c10 14 16 32 0 52z" fill="#3B82F6" opacity=".85"/><path d="M455 396c-6-12 0-22 0-30c5 8 7 18 0 30z" fill="#BFDBFE"/>`;
      t += `<rect x="440" y="400" width="30" height="40" fill="url(#k-metal)"/><text x="455" y="462" text-anchor="middle" class="k-lbl">Bunsen ${bunsen ? "ON" : "off"}</text>`;
      if(bunsen && hot) for(let k = 0; k < 6; k++) t += `<circle cx="${412 + k*16}" cy="${270 + (k*23) % 50}" r="${2 + k % 3}" fill="#fff" opacity=".7"/>`;
      t += `<rect x="470" y="150" width="26" height="176" rx="12" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.3"/><rect x="473" y="230" width="20" height="92" rx="9" fill="${ethGreen ? "#6FBF4A" : "#F2F5E8"}" opacity=".8"/>
        <text x="532" y="172" class="k-lbl">ethanol</text><path d="M506 196l10 -16l10 16z" fill="#F59E0B" stroke="#7C4A03"/><text x="516" y="194" text-anchor="middle" style="font:700 9px Inter;fill:#7C2D12">!</text><text x="532" y="192" class="k-lbl">flammable</text>`;
      t += `<rect x="560" y="290" width="74" height="74" rx="5" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/><rect x="563" y="310" width="68" height="52" rx="4" fill="url(#k-water)" opacity=".7"/><text x="597" y="384" text-anchor="middle" class="k-lbl">warm water</text>`;
      if(where === "water") t += smallLeaf(455, 300, .9);
      if(where === "eth") t += smallLeaf(483, 280, .45);
      if(where === "rinse") t += smallLeaf(597, 335, .9);
      if(busy) t += `<text x="455" y="124" text-anchor="middle" class="k-hint">${{ water:"boiling in water…", eth:"heating in ethanol…", rinse:"rinsing…", tile:"spreading…", iodine:"adding iodine…" }[busy]}</text>`;
      $("#ls-test").innerHTML = t;
      /* 3 · tile */
      let w = `<rect x="650" y="190" width="290" height="200" rx="6" fill="#FAFAF7" stroke="#B8BEC8" stroke-width="2"/><text x="795" y="410" text-anchor="middle" class="k-lbl">white tile</text>
        <rect x="880" y="86" width="34" height="52" rx="6" fill="#7A4A1A" opacity=".85"/><rect x="890" y="70" width="14" height="18" fill="#222"/><text x="897" y="156" text-anchor="middle" class="k-lbl">iodine</text>`;
      if(st.tile) w += bigLeaf();
      if(st.iodine && !skipped.size) w += `<text x="795" y="182" text-anchor="middle" class="k-hint">Click every part that is blue-black, then record</text>`;
      $("#ls-tile").innerHTML = w;
      const next = !st.light ? "Choose the experiment, then leave the plant in light" : !st.pick ? "Pick the test leaf" : st.iodine ? (skipped.size ? "Faulty method: " + [...skipped].map(k => FAULT[k]).join("; ") : "Look at the colours on the tile") : "Test the leaf for starch";
      $("#ls-status").textContent = next;
      ctx.readout([["Experiment", EXP[expt]], ["Destarched", destarch ? "yes" : "no", destarch ? "good" : "warn"], ["Bunsen", bunsen ? "on" : "off"], ["Skipped", skipped.size ? [...skipped].join(", ") : "none", skipped.size ? "warn" : "good"]]);
    }
    svg.addEventListener("pointerdown", e => {
      const g = e.target.closest("[data-r]"); if(!g || !st.iodine) return;
      if(skipped.size) return ctx.toast("The colours can’t be trusted — the method had faults");
      const r = g.dataset.r; marks.has(r) ? marks.delete(r) : marks.add(r); draw();
    });
    function act(id){
      if(busy) return;
      if(!st.pick) return ctx.toast("Pick the test leaf first");
      if(st.iodine) return ctx.toast("Test finished — start a new leaf");
      if(st[id]) return ctx.toast("Already done");
      if(skipped.has(id)) return ctx.toast("Too late — that step was skipped");
      if(id === "water" && !bunsen) return ctx.toast("Light the Bunsen burner to boil the water");
      if(id === "eth" && bunsen) return ctx.toast("Danger: ethanol is highly flammable. Turn the Bunsen burner off first and heat the ethanol in the hot water bath.");
      if(id === "eth" && !heated) return ctx.toast("Heat the water bath first (light the Bunsen)");
      if(id === "iodine" && !st.tile) return ctx.toast("Spread the leaf on the white tile first");
      ORDER.slice(0, ORDER.indexOf(id)).forEach(k => { if(!st[k]) skipped.add(k); });
      busy = id; draw();
      ctx.after(id === "eth" ? 1400 : 900, () => {
        busy = null; st[id] = true; ctx.step(id);
        where = { water:"water", eth:"eth", rinse:"rinse", tile:"tile", iodine:"tile" }[id];
        if(id === "iodine" && skipped.size){
          ctx.record({ exp:EXP[expt], part:"whole leaf", ds:destarch ? "yes" : "no", col:"unclear", starch:"?", faults:[...skipped].map(k => FAULT[k]).join("; ") });
          ctx.toast("Method faults — repeat the test with a fresh leaf");
        }
        draw();
      });
    }
    const eseg = ctx.seg({ label:"Experiment", value:"light", options:[["light","Light"],["chl","Chlorophyll"],["co2","Carbon dioxide"]], onChange(v){ if(st.light){ eseg.set(expt); return ctx.toast("Start a new leaf to change the experiment"); } expt = v; draw(); } });
    const dseg = ctx.seg({ label:"Plant before the experiment", value:true, options:[[true,"Destarched (48 h dark)"],[false,"Not destarched"]], onChange(v){ if(st.light){ dseg.set(destarch); return ctx.toast("Start a new leaf to change this"); } destarch = v; draw(); } });
    ctx.buttons([{ label:"Leave in light for 6 h", onClick(){ if(st.light) return ctx.toast("Already done"); st.light = true; ctx.step("light"); draw(); } },
      { label:"Pick the test leaf", onClick(){ if(!st.light) return ctx.toast("Leave the plant in light first"); if(st.pick) return ctx.toast("Already picked"); st.pick = true; where = "bench"; ctx.step("pick"); draw(); } }]);
    const bb = ctx.buttons([{ label:"Light the Bunsen", onClick(){
      bunsen = !bunsen; if(bunsen) heated = true; else if(heated) ctx.step("off");
      bb[0].textContent = bunsen ? "Turn the Bunsen off" : "Light the Bunsen"; draw(); } },
      { label:"Boil in water (1 min)", onClick(){ act("water"); } }]);
    ctx.buttons([{ label:"Ethanol in water bath", onClick(){ act("eth"); } }, { label:"Rinse in warm water", onClick(){ act("rinse"); } }]);
    ctx.buttons([{ label:"Spread on white tile", onClick(){ act("tile"); } }, { label:"Add iodine solution", onClick(){ act("iodine"); } }]);
    ctx.buttons([{ label:"Record result", primary:true, onClick(){
      if(!st.iodine) return ctx.toast("Finish the starch test first");
      if(skipped.size) return ctx.toast("Faulty test already recorded — start a new leaf");
      if(st.rec) return ctx.toast("Already recorded — start a new leaf");
      const regs = REG[expt], wrong = regs.filter(([r]) => marks.has(r) !== starch(r));
      if(wrong.length) return ctx.toast("Look again at the colours: blue-black means starch");
      st.rec = true;
      regs.forEach(([r, lab]) => ctx.record({ exp:EXP[expt], part:lab, ds:destarch ? "yes" : "no", col:starch(r) ? "blue-black" : "orange-brown", starch:starch(r) ? "yes" : "no", faults:"none" }, true));
      ctx.toast("Results recorded");
      if(destarch) ctx.complete(expt);
      else{ ctx.complete("control"); ctx.toast("Every part is blue-black: the starch was already there before the experiment, so nothing can be concluded"); }
    } }, { label:"New leaf", onClick(){ fresh(); draw(); } }]);
    draw();
  }
});

/* ───────────── HYDROGENCARBONATE INDICATOR ───────────── */
Lab.register({
  id:"hco3", subject:"biology", level:["igcse"], topic:"Photosynthesis & respiration · Gas exchange", interactive:true,
  title:"Gas exchange with hydrogencarbonate indicator",
  summary:"Set up sealed tubes of hydrogencarbonate indicator with pondweed in bright light, dim light and darkness, with snails, and with no organism as a control. Leave them, then match each tube to the colour scale.",
  aim:"Investigate the effect of light intensity on net gas exchange in an aquatic plant, using hydrogencarbonate indicator to show changes in carbon dioxide concentration.",
  variables:{ iv:"Light intensity (bright, dim, dark) and the organisms in the tube", dv:"Colour of the indicator matched to the colour scale (carbon dioxide concentration)", cv:["Same volume of indicator, same length of pondweed","Same time left (bungs in)","Same distance from the lamp, with a heat shield, so temperature is constant"] },
  stageTitle:"Tubes & colour scale", controlsTitle:"Set up & read",
  thumb:`<svg viewBox="0 0 300 140">${["#E9D63A","#EA8A34","#D9443A","#A2318E","#6E2E8E"].map((c, i) => `<rect x="${40 + i*48}" y="20" width="26" height="100" rx="12" fill="${c}" stroke="#555"/>`).join("")}</svg>`,
  challenges:[
    { id:"light",   title:"Light vs dark", text:"Read the tubes of pondweed in bright light and in the dark." },
    { id:"range",   title:"Light intensity", text:"Read pondweed tubes in bright, dim and dark conditions." },
    { id:"control", title:"Control tube", text:"Read a tube with no organism and explain why it is needed." },
    { id:"animal",  title:"Animals respire", text:"Read a tube with snails in it." }
  ],
  columns:[{key:"n",label:"Tube",dp:0},{key:"cont",label:"Contents"},{key:"L",label:"Light intensity / %",dp:0},{key:"t",label:"Time / min",dp:0},{key:"sc",label:"Colour scale no.",dp:0},{key:"col",label:"Colour"},{key:"co2",label:"CO₂ compared with air"}],
  graph:{ x:["L"], y:["sc"], fit:"none" },
  questions:[
    { q:"Explain why the tube of pondweed in bright light turned purple.",
      a:"The rate of photosynthesis was greater than the rate of respiration, so the pondweed took in more carbon dioxide than it gave out. The carbon dioxide concentration fell below that of air, so the indicator turned from red to purple." },
    { q:"Explain the colour of the pondweed in the dark and the snails.",
      a:"In the dark there is no photosynthesis, only respiration, so carbon dioxide is released and builds up: the indicator turns orange then yellow. Snails respire all the time and never photosynthesise, so their tube also turns yellow." },
    { q:"Why is a tube with no organism included?",
      a:"It is a control. It shows that the colour change is caused by the organism and not by light, temperature or carbon dioxide getting in or out of the tube. It should stay red." },
    { q:"The dim-light tube stayed almost red. What does this show?",
      a:"At that light intensity the rate of photosynthesis was about equal to the rate of respiration (the compensation point), so there was no net uptake or release of carbon dioxide." },
    { q:"Suggest how to make the tubes a fair test, and a limitation of the method.",
      a:"Use the same volume of indicator and the same mass or length of pondweed, the same time and a heat shield (a beaker of water) between lamp and tubes. Rinse tubes with indicator first and use bungs. A limitation is that matching colours by eye is subjective — a colorimeter or pH probe would give a number." },
    { q:"Assess the risks of this investigation.",
      a:"Low. Hydrogencarbonate indicator is low hazard but avoid contact with eyes. The lamp gets hot and is mains-powered near water: keep water away from the lamp, dry hands, and let it cool. Treat snails humanely and return them to the tank afterwards." }
  ],
  setup(ctx){
    const SW = ["#E9D63A","#EDB43A","#EA8A34","#D9443A","#C9306E","#A2318E","#6E2E8E"];
    const SWN = ["yellow","orange-yellow","orange","red","magenta-red","magenta","purple"];
    const C = {
      pb:{ name:"Pondweed · bright light", short:"Pondweed, bright", plant:1, L:100, d:2.6 },
      pd:{ name:"Pondweed · dim light (gauze)", short:"Pondweed, dim", plant:1, L:30, d:.45 },
      p0:{ name:"Pondweed · dark (foil)", short:"Pondweed, dark", plant:1, L:0, d:-1.8 },
      nb:{ name:"No organism · light (control)", short:"No organism, light", L:100, d:0 },
      sb:{ name:"Snails · light", short:"Snails, light", snail:1, L:100, d:-2.3 },
      sp:{ name:"Pondweed + snails · light", short:"Pondweed + snails", plant:1, snail:1, L:100, d:.5 }
    };
    const hexMix = (a, b, f) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const ch = s => { const x = (pa >> s) & 255, y = (pb >> s) & 255; return Math.round(x + (y - x)*f); }; return `rgb(${ch(16)},${ch(8)},${ch(0)})`; };
    const col = v => { v = Kit.clamp(v, 0, 6); const i = Math.min(5, Math.floor(v)); return hexMix(SW[i], SW[i + 1], v - i); };
    let tubes = [], phase = "setup", tmin = 60, cond = "pb", sel = null, prog = 0;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="hc-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 440)}
      <g id="hc-scene"></g><g id="hc-scale"></g><text x="24" y="30" class="k-status" id="hc-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#hc-svg"), $ = s => svg.querySelector(s);
    const covered = () => phase !== "read";
    function draw(){
      let s = "";
      const lit = phase === "running";
      s += `<rect x="30" y="140" width="70" height="40" rx="8" fill="#334155"/><path d="M100 140l40 -20v100l-40 -20z" fill="#475569"/><circle cx="136" cy="170" r="14" fill="${lit ? "#FFE680" : "#CBD5E1"}"/><rect x="58" y="180" width="12" height="260" fill="#475569"/>
        <text x="80" y="128" text-anchor="middle" class="k-lbl">lamp</text>`;
      if(lit) s += `<path d="M150 150L900 90L900 290L150 190z" fill="#FFF3B0" opacity=".25"/>`;
      s += `<rect x="168" y="120" width="18" height="220" rx="4" fill="#BFDBF7" opacity=".6" stroke="#7CA3C8"/><text x="177" y="356" text-anchor="middle" class="k-lbl">heat shield</text>`;
      s += `<rect x="200" y="300" width="${6*110}" height="16" rx="3" fill="url(#k-wood)"/>`;
      for(let i = 0; i < 6; i++){
        const x = 230 + i*110, T = tubes[i];
        s += `<g data-t="${i}" style="cursor:pointer">`;
        if(T){
          const c = C[T.c], v = 3 + (T.fin - 3)*(phase === "setup" ? 0 : phase === "running" ? prog : 1);
          s += `<rect x="${x}" y="90" width="46" height="200" rx="20" fill="${col(v)}" opacity=".88"/>`;
          if(c.plant) s += `<path d="M${x + 23} 280C${x + 10} 240 ${x + 36} 200 ${x + 20} 150" stroke="#2F7A2A" stroke-width="4" fill="none"/>${[160, 190, 220, 250].map((y, k) => `<path d="M${x + 22} ${y}l${k % 2 ? 10 : -10} -6" stroke="#2F7A2A" stroke-width="3"/>`).join("")}`;
          if(c.snail) s += `<circle cx="${x + 23}" cy="${c.plant ? 268 : 262}" r="9" fill="#8B5A2B" stroke="#4A2E12"/><path d="M${x + 23} ${c.plant ? 268 : 262}m-4 0a4 4 0 1 1 4 4" stroke="#E7C9A0" fill="none"/>`;
          if(covered() && c.L === 0) s += `<rect x="${x - 2}" y="84" width="50" height="210" rx="20" fill="url(#k-metal)" stroke="#555"/><text x="${x + 23}" y="190" text-anchor="middle" style="font:700 10px Inter;fill:#1F2937">foil</text>`;
          if(covered() && T.c === "pd") s += `<rect x="${x - 2}" y="84" width="50" height="210" rx="20" fill="#6B7280" opacity=".55" stroke="#374151" stroke-dasharray="3 3"/><text x="${x + 23}" y="190" text-anchor="middle" style="font:700 10px Inter;fill:#F9FAFB">gauze</text>`;
          s += `<rect x="${x + 6}" y="70" width="34" height="24" rx="4" fill="#B45309"/>`;
          if(T.read !== null) s += `<circle cx="${x + 23}" cy="58" r="11" fill="#0F9A62"/><text x="${x + 23}" y="62" text-anchor="middle" style="font:700 11px Inter;fill:#fff">${T.read + 1}</text>`;
          s += `<text x="${x + 23}" y="334" text-anchor="middle" class="k-tag">${i + 1}</text>`;
          c.short.split(", ").forEach((ln, k) => s += `<text x="${x + 23}" y="${350 + k*13}" text-anchor="middle" class="k-lbl">${ln}</text>`);
        }else s += `<rect x="${x}" y="90" width="46" height="200" rx="20" fill="none" stroke="var(--brd2)" stroke-dasharray="5 4"/><text x="${x + 23}" y="334" text-anchor="middle" class="k-lbl">empty</text>`;
        s += `<rect x="${x}" y="90" width="46" height="200" rx="20" fill="url(#k-glass)" stroke="${sel === i ? "#F59E0B" : "var(--txt2)"}" stroke-width="${sel === i ? 4 : 1.4}"/></g>`;
      }
      $("#hc-scene").innerHTML = s;
      $("#hc-status").textContent = phase === "setup" ? "Add tubes to the rack, then leave them" : phase === "running" ? `Leaving the tubes… ${Math.round(prog*tmin)} min` : sel === null ? "Click a tube, then click the colour it matches on the scale" : `Tube ${sel + 1} selected — click the matching colour`;
      ctx.readout([["Tubes", String(tubes.length)], ["Time", tmin + " min"], ["Read", tubes.filter(t => t.read !== null).length + " of " + tubes.length]]);
    }
    function drawScale(){
      let s = `<text x="230" y="392" class="k-lbl">high CO₂</text><text x="${230 + 7*92 - 6}" y="392" text-anchor="end" class="k-lbl">low CO₂</text>`;
      SW.forEach((c, k) => { const x = 230 + k*92;
        s += `<g data-k="${k}" style="cursor:pointer"><rect x="${x}" y="398" width="86" height="34" rx="5" fill="${c}" stroke="#333"/><text x="${x + 43}" y="420" text-anchor="middle" style="font:700 13px Inter;fill:#111">${k + 1}</text></g>`; });
      s += `<text x="${230 + 3*92 + 43}" y="458" text-anchor="middle" class="k-lbl">▲ air (start)</text><text x="130" y="420" text-anchor="middle" class="k-tag">Colour scale</text>`;
      $("#hc-scale").innerHTML = s;
    }
    svg.addEventListener("click", e => {
      const t = e.target.closest("[data-t]"), k = e.target.closest("[data-k]");
      if(t){ const i = +t.dataset.t; if(!tubes[i]) return; if(phase !== "read") return ctx.toast("Leave the tubes first"); sel = i; draw(); return; }
      if(k){
        if(phase !== "read") return ctx.toast("Leave the tubes first, then read them");
        if(sel === null) return ctx.toast("Click a tube first");
        const T = tubes[sel], v = +k.dataset.k;
        if(T.read !== null) return ctx.toast("This tube has already been read");
        if(Math.abs(v - T.fin) > .6) return ctx.toast("Hold the tube against the scale and compare again");
        T.read = v; const c = C[T.c];
        ctx.record({ n:sel + 1, cont:c.short, L:c.L, t:tmin, sc:v + 1, col:SWN[v], co2: v < 3 ? "higher" : v > 3 ? "lower" : "about the same" });
        const got = cc => ctx.rows().some(r => r.cont === C[cc].short);
        if(got("pb") && got("p0")) ctx.complete("light");
        if(got("pb") && got("pd") && got("p0")) ctx.complete("range");
        if(got("nb")) ctx.complete("control");
        if(got("sb") || got("sp")) ctx.complete("animal");
        sel = null; draw();
      }
    });
    ctx.select({ label:"Tube contents", value:"pb", options:Object.entries(C).map(([k, c]) => [k, c.name]), onChange(v){ cond = v; } });
    ctx.buttons([{ label:"Add tube to rack", onClick(){
      if(phase !== "setup") return ctx.toast("Start a new rack to add tubes");
      if(tubes.length >= 6) return ctx.toast("The rack is full");
      const c = C[cond];
      tubes.push({ c:cond, fin:Kit.clamp(3 + c.d*Math.pow(tmin/60, .8) + ctx.gauss()*(c.d === 0 ? .12 : .28), 0, 6), read:null });
      draw();
    } }]);
    const tseg = ctx.seg({ label:"Leave for", value:60, options:[[30,"30 min"],[60,"60 min"]], onChange(v){
      if(phase !== "setup"){ tseg.set(tmin); return ctx.toast("Start a new rack to change the time"); }
      tmin = v; tubes.forEach(T => { const c = C[T.c]; T.fin = Kit.clamp(3 + c.d*Math.pow(tmin/60, .8) + ctx.gauss()*(c.d === 0 ? .12 : .28), 0, 6); }); } });
    ctx.buttons([{ label:"Bungs in — leave the tubes", primary:true, onClick(){
      if(phase !== "setup") return ctx.toast("Already left");
      if(!tubes.length) return ctx.toast("Add some tubes first");
      phase = "running"; prog = 0;
      ctx.frame(dt => { prog = Math.min(1, prog + dt/3); draw(); if(prog >= 1){ phase = "read"; draw(); ctx.toast("Foil and gauze removed — read the colours"); return false; } });
    } }, { label:"New rack", onClick(){ if(phase === "running") return; tubes = []; phase = "setup"; sel = null; draw(); } }]);
    drawScale(); draw();
  }
});

/* ───────────── WATER UPTAKE BY CELERY ───────────── */
Lab.register({
  id:"celery", subject:"biology", level:["igcse"], topic:"Transport in plants · Xylem", interactive:true,
  title:"Water uptake by a celery stalk",
  summary:"Stand celery stalks in dyed water, with leaves on or removed, in still air or in front of a fan. After a set time, cut a thin transverse section to find where the dye is, then measure how far it has risen against a ruler.",
  aim:"Investigate the pathway of water through a plant stem and how the rate of water movement is affected by leaves and air movement.",
  variables:{ iv:"Time in the dye; leaves on or removed; still air or fan", dv:"Height the dye has risen up the stalk (mm)", cv:["Same dye concentration and depth","Stalks of similar length and diameter, freshly cut","Same temperature and light"] },
  stageTitle:"Stalk, section & ruler", controlsTitle:"Run & measure",
  thumb:`<svg viewBox="0 0 300 140"><ellipse cx="150" cy="70" rx="100" ry="54" fill="#DDEBC4" stroke="#5E8A3A" stroke-width="3"/>${[60,90,120,150,180,210,240].map(a => `<circle cx="${150 + 78*Math.cos(a*Math.PI/180 + 1.6)}" cy="${70 + 38*Math.sin(a*Math.PI/180 + 1.6)}" r="9" fill="#C8243A"/>`).join("")}</svg>`,
  challenges:[
    { id:"xylem",   title:"Find the dye", text:"Click the tissue that is stained in the transverse section." },
    { id:"times",   title:"Over time", text:"Measure the dye height at four different times for one condition." },
    { id:"compare", title:"Compare conditions", text:"Record at least three times for two different conditions." },
    { id:"rate",    title:"Rate", text:"Calculate the rate of water movement in mm per minute." }
  ],
  columns:[{key:"cond",label:"Conditions"},{key:"t",label:"Time / min",dp:0},{key:"h",label:"Height of dye / mm",dp:0}],
  series:"cond",
  graph:{ x:["t"], y:["h"], fit:"linear" },
  questions:[
    { q:"In which tissue was the dye found, and what does this show?",
      a:"In the xylem vessels of the vascular bundles, which are arranged in a ring near the outside of the stalk (on the inner side of each bundle). This shows that water and dissolved mineral ions move up the stem in the xylem." },
    { q:"Explain why the dye rose faster with leaves on and in moving air.",
      a:"Water evaporates from the mesophyll cells and diffuses out of the stomata as water vapour (transpiration). This pulls water up the xylem. A fan removes water vapour from around the leaf, keeping a steep concentration gradient, so transpiration is faster. With no leaves there are few stomata, so little water is pulled up." },
    { q:"Calculate the rate of water movement if the dye rose 84 mm in 30 minutes.",
      a:"Rate = distance ÷ time = 84 ÷ 30 = 2.8 mm per minute." },
    { q:"Why should the stalk be cut under water or freshly cut just before the experiment?",
      a:"If the cut end is exposed to air, air bubbles can enter the xylem and block the column of water, so less dye is taken up and the results are lower than they should be." },
    { q:"Suggest a source of error and an improvement.",
      a:"The top of the dye is not a sharp line, so the height is hard to judge, and each stalk is different. Use several stalks for each time and calculate a mean, choose stalks of the same size, and use a hand lens to find where the dye ends." },
    { q:"Assess the risks of this investigation.",
      a:"Low. Dyes such as eosin stain skin and clothes — wear gloves and a lab coat. Cutting sections with a scalpel or razor blade: cut on a tile, away from your fingers. Keep the fan’s mains lead away from the water." }
  ],
  setup(ctx){
    const C = { still:{ name:"Leaves on, still air", r:1.6 }, fan:{ name:"Leaves on, fan", r:2.8 }, bare:{ name:"Leaves removed, still air", r:.6 } };
    let cond = "still", tsel = 20, phase = "ready", h = 0, disp = 0, clock = 0, tsOK = false, ring = null;
    const TCX = 475, TCY = 175;
    const bez = (t, a, b, c, d) => Math.pow(1 - t, 3)*a + 3*Math.pow(1 - t, 2)*t*b + 3*(1 - t)*t*t*c + t*t*t*d;
    const BUN = [...Array(9)].map((_, k) => { const t = .08 + k*.105, x = bez(t, 360, 360, 590, 590), y = bez(t, 130, 330, 330, 130);
      const dx = TCX - x, dy = TCY - 5 - y, L = Math.hypot(dx, dy), ux = dx/L, uy = dy/L, bx = x + ux*24, by = y + uy*24;
      return { xx:bx + ux*9, xy:by + uy*9, px:bx - ux*8, py:by - uy*8, ex:x + ux*5, ey:y + uy*5 }; });
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="ce-svg"><defs>${Kit.DEFS}</defs>
      <g id="ce-beaker"></g><g id="ce-ts"></g><g id="ce-ruler"></g><g id="ce-side"></g><text x="24" y="30" class="k-status" id="ce-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ce-svg"), $ = s => svg.querySelector(s);
    function drawBeaker(){
      const bare = cond === "bare", top = 124, base = 300, ppm = .85;
      let s = `<text x="165" y="56" text-anchor="middle" class="k-tag">In dyed water</text>`;
      if(phase !== "cut"){
        s += `<path d="M162 ${base}V${top}h22V${base}z" fill="#CFE3A8" stroke="#7FA65A"/>`;
        if(disp > 0) s += `<rect x="166" y="${base - disp*ppm}" width="4" height="${disp*ppm}" fill="#C8243A" opacity=".8"/><rect x="176" y="${base - disp*ppm}" width="4" height="${disp*ppm}" fill="#C8243A" opacity=".8"/>`;
        if(!bare) s += `<path d="M173 ${top}c-40-10-60-40-50-60c20 0 40 20 50 60zM173 ${top}c40-10 60-40 50-60c-20 0-40 20-50 60z" fill="#5FA343" stroke="#3F7A2E"/>`;
        else s += `<rect x="160" y="${top - 6}" width="26" height="8" rx="3" fill="#9DBB6E"/>`;
      }else s += `<text x="165" y="190" text-anchor="middle" class="k-lbl">stalk removed</text>`;
      s += `<rect x="110" y="230" width="110" height="100" rx="6" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><rect x="113" y="262" width="104" height="65" rx="5" fill="#D9445A" opacity=".55"/>
        <text x="165" y="348" text-anchor="middle" class="k-lbl">eosin solution</text>`;
      if(cond === "fan") s += `<g transform="translate(272 110)"><circle r="30" fill="none" stroke="#64748B" stroke-width="3"/>${[0, 120, 240].map(a => `<ellipse rx="22" ry="7" fill="#94A3B8" transform="rotate(${a + clock*40})" />`).join("")}<circle r="5" fill="#334155"/><rect x="-4" y="30" width="8" height="70" fill="#64748B"/></g>
        <path d="M236 92h-20M236 110h-26M236 128h-20" stroke="#94A3B8" stroke-width="2" stroke-dasharray="4 4"/>`;
      s += `<text x="165" y="374" text-anchor="middle" class="k-numb">${phase === "running" || phase === "stand" ? `t = ${Math.round(clock)} min` : ""}</text>`;
      $("#ce-beaker").innerHTML = s;
    }
    function drawTS(){
      let s = `<text x="${TCX}" y="56" text-anchor="middle" class="k-tag">Transverse section (hand lens)</text>`;
      if(phase === "cut"){
        s += `<path d="M360 130C360 330 590 330 590 130C560 98 520 116 ${TCX} 116C430 116 390 98 360 130Z" fill="#E6F0D2" stroke="#6E9A48" stroke-width="2.5" id="ce-shape"/>`;
        BUN.forEach(b => { s += `<circle cx="${b.ex}" cy="${b.ey}" r="6" fill="#8DB45E" opacity=".8"/><ellipse cx="${b.px}" cy="${b.py}" rx="9" ry="8" fill="#CFE3A8" stroke="#8DB45E"/><circle cx="${b.xx}" cy="${b.xy}" r="9" fill="#C8243A"/>`; });
        if(ring) s += `<circle cx="${ring[0]}" cy="${ring[1]}" r="15" fill="none" stroke="${ring[2] ? "#0F9A62" : "#E0335A"}" stroke-width="3"/>`;
        s += `<text x="${TCX}" y="318" text-anchor="middle" class="k-hint">${tsOK ? "✓ dye is in the xylem" : "Click where the dye shows"}</text>`;
      }else s += `<rect x="360" y="110" width="230" height="160" rx="10" fill="none" stroke="var(--brd2)" stroke-dasharray="6 5"/><text x="${TCX}" y="196" text-anchor="middle" class="k-lbl">cut a section after the time is up</text>`;
      $("#ce-ts").innerHTML = s;
    }
    function drawRuler(){
      const X0 = 70, PX = 4, Y = 392;
      let s = `<text x="${X0}" y="${Y - 14}" class="k-tag">Stalk on the ruler (cut end at 0)</text>`;
      if(phase === "cut"){
        s += `<rect x="${X0}" y="${Y}" width="${200*PX}" height="26" rx="5" fill="#CFE3A8" stroke="#7FA65A"/>`;
        [6, 13, 20].forEach((dy, k) => s += `<rect x="${X0}" y="${Y + dy - 1}" width="${h*PX + (k - 1)*3}" height="3" fill="#C8243A" opacity=".85"/>`);
        if(cond !== "bare") s += `<path d="M${X0 + 200*PX} ${Y + 13}c20-30 50-30 70-10c-20 20-50 30-70 10z" fill="#5FA343" stroke="#3F7A2E"/>`;
      }
      s += `<rect x="${X0 - 10}" y="${Y + 30}" width="${200*PX + 20}" height="40" rx="4" fill="#F2E6C2" stroke="#B8962E"/>`;
      for(let mm = 0; mm <= 200; mm++){ const x = X0 + mm*PX, L = mm % 10 === 0 ? 14 : mm % 5 === 0 ? 9 : 5;
        s += `<line x1="${x}" y1="${Y + 30}" x2="${x}" y2="${Y + 30 + L}" stroke="#4B3621" stroke-width=".8"/>`;
        if(mm % 10 === 0) s += `<text x="${x}" y="${Y + 58}" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#4B3621">${mm}</text>`; }
      s += `<text x="${X0 + 200*PX + 6}" y="${Y + 66}" style="font:500 9px Inter;fill:#4B3621">mm</text>`;
      $("#ce-ruler").innerHTML = s;
    }
    function drawSide(){
      $("#ce-side").innerHTML = `<g transform="translate(640 70)"><rect width="290" height="230" rx="12" fill="var(--bg2)" stroke="var(--brd2)"/>
        <text x="16" y="28" class="k-tag">${C[cond].name}</text>
        <text x="16" y="56" class="k-lbl">Time in dye: ${tsel} min</text>
        <text x="16" y="84" class="k-lbl">Stalks used: ${ctx.rows().length}</text>
        <text x="16" y="130" class="k-lbl">1. Leave the stalk in the dye</text><text x="16" y="150" class="k-lbl">2. Remove it and cut a thin section</text>
        <text x="16" y="170" class="k-lbl">3. Click where the dye shows</text><text x="16" y="190" class="k-lbl">4. Read the dye height on the ruler</text></g>`;
      $("#ce-status").textContent = phase === "ready" ? "Choose the conditions and time, then put a fresh stalk in the dye" : phase === "running" ? "Dye rising…" : phase === "stand" ? "Time up — remove the stalk and cut a section" : tsOK ? "Read the height of the dye on the ruler" : "Find the dye in the section";
      ctx.readout([["Conditions", C[cond].name], ["Time", tsel + " min"], ["Section", phase === "cut" ? (tsOK ? "xylem found" : "not yet") : "—", tsOK ? "good" : ""]]);
    }
    const draw = () => { drawBeaker(); drawTS(); drawRuler(); drawSide(); };
    svg.addEventListener("pointerdown", e => {
      if(phase !== "cut") return;
      const p = ctx.svgPoint(svg, e);
      if(p.y > 330 || p.x < 340 || p.x > 610) return;
      const near = (arr, kx, ky, r) => arr.find(b => Math.hypot(b[kx] - p.x, b[ky] - p.y) <= r);
      const x = near(BUN, "xx", "xy", 12), ph = near(BUN, "px", "py", 10);
      if(x){ ring = [x.xx, x.xy, true]; if(!tsOK){ tsOK = true; ctx.complete("xylem"); ctx.toast("Yes — the red dye is in the xylem of each vascular bundle"); } }
      else if(ph){ ring = [ph.px, ph.py, false]; ctx.toast("That’s phloem — it carries sucrose and is not stained"); }
      else{ ring = [p.x, p.y, false]; ctx.toast(e.target.id === "ce-shape" ? "That’s unstained tissue — look for the red spots in the vascular bundles" : "Click on the section"); }
      draw();
    });
    const lock = () => phase !== "ready";
    const cseg = ctx.seg({ label:"Conditions", value:"still", options:[["still","Leaves on"],["fan","Leaves on + fan"],["bare","Leaves removed"]], onChange(v){ if(lock()){ cseg.set(cond); return ctx.toast("Finish this stalk first"); } cond = v; draw(); } });
    const tsg = ctx.seg({ label:"Time in dye", value:20, options:[[10,"10 min"],[20,"20 min"],[30,"30 min"],[40,"40 min"]], onChange(v){ if(lock()){ tsg.set(tsel); return ctx.toast("Finish this stalk first"); } tsel = v; draw(); } });
    ctx.buttons([{ label:"Put fresh stalk in dye", primary:true, onClick(){
      if(phase !== "ready") return ctx.toast("Finish this stalk first");
      h = Kit.clamp(C[cond].r*(1 + ctx.gauss()*.07)*tsel + ctx.gauss()*1.2, 2, 196); disp = 0; clock = 0; phase = "running"; tsOK = false; ring = null; rd.clear();
      let f = 0;
      ctx.frame(dt => { f = Math.min(1, f + dt/2.5); disp = h*f; clock = tsel*f; drawBeaker(); if(f >= 1){ phase = "stand"; draw(); return false; } });
      draw();
    } }, { label:"Remove & cut section", onClick(){ if(phase !== "stand") return ctx.toast(phase === "running" ? "Wait until the time is up" : "Put a stalk in the dye first"); phase = "cut"; draw(); } }]);
    const rd = Kit.reading(ctx, "Height of dye / mm", "e.g. 46", () => phase === "cut" ? h : null, 2, v => {
      if(!tsOK) return ctx.toast("First click where the dye shows in the section");
      ctx.record({ cond:C[cond].name, t:tsel, h:Math.round(v) });
      phase = "ready"; disp = 0; rd.clear();
      const rows = ctx.rows(), by = {};
      rows.forEach(r => { (by[r.cond] = by[r.cond] || new Set()).add(r.t); });
      if(Object.values(by).some(s => s.size >= 4)) ctx.complete("times");
      if(Object.values(by).filter(s => s.size >= 3).length >= 2) ctx.complete("compare");
      draw();
    });
    Kit.answer(ctx, "Rate for the current conditions / mm per min (height ÷ time, longest time)", "e.g. 1.6", v => {
      const rows = ctx.rows().filter(r => r.cond === C[cond].name); if(!rows.length) return [false, "Record a result for these conditions first."];
      const r = rows.reduce((a, b) => b.t > a.t ? b : a), rate = r.h/r.t;
      if(Math.abs(v - rate) <= Math.max(.05, rate*.04)){ ctx.complete("rate"); return [true, `Correct: ${r.h} mm ÷ ${r.t} min = ${rate.toFixed(2)} mm per min.`]; }
      return [false, `Use your ${r.t} min result: height ÷ time.`];
    });
    draw();
  }
});

/* ───────────── EXERCISE: PULSE RATE & BREATHING ───────────── */
Lab.register({
  id:"exercise", subject:"biology", level:["igcse"], topic:"Gas exchange in humans · Effect of exercise", interactive:true,
  title:"Exercise, pulse rate & breathing",
  summary:"Count your partner’s pulse for 15 s, read breathing rate and depth from a chest trace, exercise for 1–3 minutes, then measure recovery every minute. Compare inspired and expired air by bubbling them through limewater.",
  aim:"Investigate the effect of physical activity on pulse rate, and on the rate and depth of breathing, and compare the carbon dioxide in inspired and expired air.",
  variables:{ iv:"Time after exercise (and intensity of exercise)", dv:"Pulse rate (beats per minute); breathing rate (breaths per minute) and depth (dm³)", cv:["Same person","Same type and length of exercise","Pulse counted at the same place (wrist) for the same time"] },
  stageTitle:"Pulse, breathing & limewater", controlsTitle:"Measure",
  thumb:`<svg viewBox="0 0 300 140"><path d="M150 46C140 22 96 26 98 60C100 92 140 108 150 124C160 108 200 92 202 60C204 26 160 22 150 46Z" fill="#E0334A"/><path d="M20 80h60l10-30l14 60l12-40h164" stroke="#334155" stroke-width="3" fill="none"/></svg>`,
  challenges:[
    { id:"rest",     title:"Resting pulse", text:"Count and record the resting pulse rate." },
    { id:"recovery", title:"Recovery curve", text:"Record the pulse at rest and every minute from 0 to 5 minutes after exercise." },
    { id:"breath",   title:"Rate and depth", text:"Read breathing rate and depth at rest and immediately after exercise." },
    { id:"lime",     title:"Limewater", text:"Find the time for expired air to turn limewater milky, and show inspired air does not." }
  ],
  columns:[{key:"run",label:"Run"},{key:"when",label:"When"},{key:"t",label:"Time / min",dp:0},{key:"pulse",label:"Pulse / beats per min",dp:0},{key:"br",label:"Breathing rate / per min",dp:0},{key:"dep",label:"Depth / dm³",dp:1}],
  series:"run",
  graph:{ x:["t"], y:["pulse","br","dep"], fit:"curve" },
  questions:[
    { q:"Why is the pulse counted for 15 s and multiplied by 4, instead of for a whole minute?",
      a:"The pulse rate is falling quickly after exercise, so a 1-minute count would average a changing rate and take up most of the gap between readings. A 15 s count gives a value close to that moment. Counting errors are multiplied by 4, so count carefully." },
    { q:"Explain why pulse rate and breathing increase during exercise.",
      a:"Muscles contract more, so they respire faster and need more oxygen and glucose, and produce more carbon dioxide. The heart beats faster to deliver blood more quickly; breathing becomes faster and deeper to take in more oxygen and remove carbon dioxide. Some anaerobic respiration produces lactic acid (an oxygen debt), so rates stay high for a while afterwards." },
    { q:"Calculate the recovery time from a set of results.",
      a:"Recovery time is the time from the end of exercise until the pulse returns to the resting rate (e.g. resting 72; after exercise 140, 118, 96, 82, 74, 72 at 0–5 min, so the recovery time is 5 minutes). A fitter person usually has a lower resting rate and recovers faster." },
    { q:"Explain the limewater results.",
      a:"Expired air contains about 4% carbon dioxide (from respiration) compared with about 0.04% in inspired air, so limewater with expired air bubbled through it turns milky much sooner. Inspired air contains too little to turn it milky in the same time." },
    { q:"Suggest two ways to improve the reliability of the pulse investigation.",
      a:"Repeat the whole investigation and calculate means; use a pulse oximeter or heart-rate monitor instead of counting by hand; let the person rest until the pulse is steady before starting; use several people of similar age and fitness." },
    { q:"Assess the risks of this investigation.",
      a:"Low to medium. Exercise can be dangerous for people with heart or breathing conditions — they should not take part, and anyone feeling dizzy should stop. Limewater is an irritant: blow and suck gently, never through the wrong tube, and wear eye protection. Use a fresh or disinfected mouthpiece for each person." }
  ],
  setup(ctx){
    const INT = { walk:{ name:"Walking", k:.35 }, jog:{ name:"Jogging", k:.65 }, sprint:{ name:"Star jumps", k:1 } };
    const R = Math.round(62 + Math.random()*16), BR = 12 + Math.round(Math.random()*2)*2, DEP = .45 + Math.random()*.15;
    let view = "pulse", inten = "jog", dur = 2, run = 1, pt = 0, exercised = false, tau = 1.2, P = 0, moving = 0;
    let cur = null, cnt = { on:false, t:0, beats:0, taps:0, done:false }, beatT = 0, nextBeat = .5, flash = 0;
    let lime = { on:false, t:0, A:0, B:0, nB:6 + Math.random()*3, tB:null, aDone:false, ph:0 };
    let breathOK = { rest:false, after:false };
    function point(){
      const after = pt - 1, ex = exercised && pt >= 1, f = ex ? Math.exp(-after/tau) : 0, fb = ex ? Math.exp(-after/(tau*.9)) : 0, k = INT[inten].k;
      const bpm = Math.round((ex ? R + (P - R)*f : R) + ctx.gauss()*1.5);
      const br = 2*Math.round((BR + k*(16 + 3*dur)*fb)/2), dep = Kit.round(DEP + k*(1.4 + .15*dur)*fb, 2);
      cur = { bpm, br, dep, pulse:null, brR:null, depR:null, rec:false, amp:[...Array(40)].map(() => 1 + ctx.gauss()*.03) };
      cnt = { on:false, t:0, beats:0, taps:0, done:false };
      pa.clear(); rb.clear(); rdp.clear(); drawTrace();
    }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="ex-svg"><defs>${Kit.DEFS}</defs>
      <g id="ex-pulse"><rect x="20" y="44" width="330" height="330" rx="12" fill="var(--bg2)" stroke="var(--brd2)"/>
        <g id="ex-heart" style="cursor:pointer"><g id="ex-hs"><path d="M0 -40C-14 -74 -78 -68 -76 -20C-74 24 -16 48 0 74C16 48 74 24 76 -20C78 -68 14 -74 0 -40Z" fill="#E0334A" stroke="#9F1239" stroke-width="3"/></g></g>
        <text x="185" y="76" text-anchor="middle" class="k-tag">Pulse at the wrist</text>
        <text x="185" y="290" text-anchor="middle" class="k-hint">Tap the heart (or Space) on each beat</text>
        <rect x="44" y="306" width="132" height="56" rx="8" fill="#132A1F"/><text x="160" y="344" text-anchor="end" class="k-lcd" id="ex-lcd">0.0</text><text x="52" y="322" style="font:600 8px Inter;fill:#5FBF8A">15 s COUNT</text>
        <rect x="194" y="306" width="132" height="56" rx="8" fill="#1F2937"/><text x="310" y="344" text-anchor="end" class="k-lcd" style="fill:#FDE68A" id="ex-taps">0</text><text x="202" y="322" style="font:600 8px Inter;fill:#FCD34D">CLICKER</text>
        <rect x="370" y="44" width="570" height="330" rx="12" fill="var(--bg2)" stroke="var(--brd2)"/><g id="ex-trace"></g>
        <g id="ex-line"></g></g>
      <g id="ex-lime" style="display:none"></g>
      <text x="24" y="30" class="k-status" id="ex-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ex-svg"), $ = s => svg.querySelector(s);
    $("#ex-heart").setAttribute("transform", "translate(185 175)");
    function drawTrace(){
      if(!cur) return;
      const X0 = 430, X1 = 910, Y0 = 330, YT = 90, sx = (X1 - X0)/30, sy = (Y0 - YT)/3;
      let s = `<text x="655" y="72" text-anchor="middle" class="k-tag">Chest volume trace (30 s)</text>`;
      for(let v = 0; v <= 3 + 1e-9; v += .1){ const y = Y0 - v*sy, maj = Math.abs(v*2 - Math.round(v*2)) < 1e-6;
        s += `<line x1="${X0}" y1="${y}" x2="${X1}" y2="${y}" stroke="${maj ? "var(--brd2)" : "var(--txt3)"}" stroke-width="${maj ? 1 : .5}" opacity="${maj ? 1 : .35}"/>`;
        if(maj) s += `<text x="${X0 - 8}" y="${y + 3}" text-anchor="end" class="k-num">${v.toFixed(1)}</text>`; }
      for(let t = 0; t <= 30; t += 5) s += `<text x="${X0 + t*sx}" y="${Y0 + 16}" text-anchor="middle" class="k-num">${t}</text>`;
      s += `<text x="${(X0 + X1)/2}" y="${Y0 + 34}" text-anchor="middle" class="k-lbl">time / s</text><text x="392" y="${(Y0 + YT)/2}" text-anchor="middle" class="k-lbl" transform="rotate(-90 392 ${(Y0 + YT)/2})">volume / dm³</text>`;
      const n = cur.br/2; let d = "";
      for(let i = 0; i <= 600; i++){ const t = i/20, ph = t*n/30, b = Math.floor(ph), a = cur.amp[b % 40] || 1, v = 1 + cur.dep*a*(1 - Math.cos(2*Math.PI*ph))/2;
        d += (i ? "L" : "M") + (X0 + t*sx).toFixed(1) + " " + (Y0 - v*sy).toFixed(1); }
      s += `<path d="${d}" stroke="var(--accent)" stroke-width="2" fill="none"/>`;
      $("#ex-trace").innerHTML = s;
    }
    function drawLine(){
      const lab = ["rest", "0", "1", "2", "3", "4", "5"];
      let s = `<text x="40" y="414" class="k-lbl">Readings:</text>`;
      lab.forEach((l, i) => { const x = 140 + i*70, done = i < pt || (i === pt && cur && cur.rec), now = i === pt;
        s += `<circle cx="${x}" cy="410" r="13" fill="${done ? "#0F9A62" : "none"}" stroke="${now ? "#F59E0B" : "var(--txt3)"}" stroke-width="${now ? 3 : 1.4}"/><text x="${x}" y="440" text-anchor="middle" class="k-lbl">${i ? l + " min" : l}</text>`; });
      s += `<text x="700" y="414" class="k-lbl">${INT[inten].name}, ${dur} min · run ${run}</text>`;
      if(moving > 0){ const sw = Math.sin(moving*14)*14; s += `<g transform="translate(900 444)"><circle cy="-46" r="8" fill="var(--txt2)"/><path d="M0 -38v24M0 -30l${-sw} 12M0 -30l${sw} 12M0 -14l${sw} 18M0 -14l${-sw} 18" stroke="var(--txt2)" stroke-width="4" stroke-linecap="round"/></g>`; }
      $("#ex-line").innerHTML = s;
    }
    function drawLime(){
      const tube = (x, lab, sub, turb, bub) => {
        let s = `<rect x="${x - 60}" y="150" width="120" height="230" rx="4" fill="#fff" stroke="#9AA3B2"/><path d="M${x - 40} 230l80 90M${x + 40} 230l-80 90" stroke="#111" stroke-width="10" opacity="${Kit.clamp(1 - turb, 0, 1).toFixed(2)}"/>
          <rect x="${x - 24}" y="140" width="48" height="230" rx="22" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/>
          <rect x="${x - 21}" y="200" width="42" height="166" rx="19" fill="#F1F5F9" opacity="${(.22 + .78*Kit.clamp(turb, 0, 1)).toFixed(2)}"/>`;
        if(bub) for(let k = 0; k < 6; k++){ const y = 360 - ((lime.t*90 + k*28) % 160); s += `<circle cx="${x + (k % 2 ? 6 : -6)}" cy="${y}" r="4" fill="none" stroke="#64748B"/>`; }
        s += `<text x="${x}" y="404" text-anchor="middle" class="k-tag">${lab}</text><text x="${x}" y="420" text-anchor="middle" class="k-lbl">${sub}</text>`;
        return s;
      };
      const inhale = lime.on && lime.ph < 2, exhale = lime.on && lime.ph >= 2;
      let s = `<rect x="20" y="44" width="920" height="400" rx="12" fill="var(--bg2)" stroke="var(--brd2)"/>
        <path d="M330 140V100h300v40M480 100V70" stroke="#64748B" stroke-width="6" fill="none"/><rect x="466" y="50" width="28" height="22" rx="6" fill="#334155"/><text x="510" y="66" class="k-lbl">mouthpiece</text>
        <path d="M330 140v190M630 140v190" stroke="#64748B" stroke-width="3"/>`;
      s += tube(330, "A", "air breathed IN through it", lime.A, inhale) + tube(630, "B", "air breathed OUT through it", lime.B, exhale);
      s += `<text x="480" y="210" text-anchor="middle" class="k-numb">${lime.on ? (inhale ? "breathe in" : "breathe out") : ""}</text>
        <rect x="760" y="70" width="150" height="56" rx="8" fill="#132A1F"/><text x="896" y="108" text-anchor="end" class="k-lcd">${Math.floor(lime.t)}</text><text x="768" y="86" style="font:600 8px Inter;fill:#5FBF8A">TIME / s</text>
        <text x="60" y="80" class="k-lbl">Watch the cross behind each tube.</text><text x="60" y="98" class="k-lbl">Stop B when you can no longer see it.</text>
        <text x="60" y="140" class="k-tag">${lime.tB !== null ? `B went milky after ${lime.tB} s` : ""}</text><text x="60" y="160" class="k-tag">${lime.aDone ? `A still clear after ${Math.floor(lime.aT)} s` : ""}</text>`;
      $("#ex-lime").innerHTML = s;
    }
    function status(){
      if(view === "lime"){ $("#ex-status").textContent = !lime.on && lime.t === 0 ? "Start breathing gently through the mouthpiece" : lime.tB !== null && lime.aDone ? "Limewater test complete" : "Breathing in and out…"; return; }
      const when = pt === 0 ? "At rest" : pt === 1 ? "Immediately after exercise" : `${pt - 1} min after exercise`;
      $("#ex-status").textContent = moving > 0 ? "Exercising…" : `${when}: ` + (cnt.on ? "counting…" : !cur.pulse ? "count the pulse for 15 s" : cur.rec ? (pt === 0 ? "now exercise" : pt < 6 ? "wait 1 minute" : "recovery done") : "record this reading");
      ctx.readout([["Reading", when], ["Pulse", cur.pulse ? cur.pulse + " /min" : "—"], ["Breathing", cur.brR ? cur.brR + " /min" : "—"], ["Depth", cur.depR ? cur.depR + " dm³" : "—"]]);
    }
    function tap(){
      if(view !== "pulse") return;
      if(!cnt.on) return ctx.toast("Start the 15 s count first");
      cnt.taps++; $("#ex-taps").textContent = cnt.taps;
    }
    $("#ex-heart").addEventListener("pointerdown", e => { e.preventDefault(); tap(); });
    const onKey = e => { if(e.code === "Space" && view === "pulse" && cnt.on && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){ e.preventDefault(); tap(); } };
    window.addEventListener("keydown", onKey); ctx.cleanup(() => window.removeEventListener("keydown", onKey));
    let lastS = "";
    ctx.frame(dt => {
      const bpm = moving > 0 ? 110 + 60*INT[inten].k : cur.bpm;
      beatT += dt;
      if(beatT >= nextBeat){ flash = 1; nextBeat = beatT + 60/bpm*(1 + ctx.gauss()*.025); if(cnt.on) cnt.beats++; }
      flash = Math.max(0, flash - dt*5);
      $("#ex-hs").setAttribute("transform", `scale(${(1 + .16*flash).toFixed(3)})`);
      if(cnt.on){ cnt.t += dt; if(cnt.t >= 15){ cnt.t = 15; cnt.on = false; cnt.done = true; ctx.toast("15 s — stop counting"); } }
      $("#ex-lcd").textContent = cnt.t.toFixed(1);
      if(moving > 0){ moving -= dt; drawLine(); if(moving <= 0){ moving = 0; exercised = true; pt = 1; point(); drawLine(); ctx.toast("Exercise over — measure straight away"); } }
      if(lime.on){
        lime.t += dt; lime.ph = (lime.ph + dt) % 4;
        if(lime.ph < 2) lime.A += dt/(2*260); else lime.B += dt/(2*lime.nB);
        if(view === "lime") drawLime();
      }
      const s = JSON.stringify([view, pt, cnt.on, cur && cur.pulse, cur && cur.rec, cur && cur.brR, cur && cur.depR, moving > 0, lime.on, lime.tB, lime.aDone]);
      if(s !== lastS){ lastS = s; status(); }
    });
    ctx.seg({ label:"Bench", value:"pulse", options:[["pulse","Pulse & breathing"],["lime","Limewater test"]], onChange(v){ view = v; $("#ex-pulse").style.display = v === "pulse" ? "" : "none"; $("#ex-lime").style.display = v === "lime" ? "" : "none"; drawLime(); status(); } });
    ctx.html(`<div class="hint" style="margin:4px 0 2px"><b>Pulse and breathing</b></div>`);
    const iseg = ctx.seg({ label:"Exercise", value:"jog", options:[["walk","Walking"],["jog","Jogging"],["sprint","Star jumps"]], onChange(v){ if(pt > 0 || (cur && cur.rec)){ iseg.set(inten); return ctx.toast("Start a new run to change the exercise"); } inten = v; drawLine(); } });
    const dsl = ctx.slider({ label:"Exercise time", min:1, max:3, step:1, value:2, unit:"min", onInput(v){ if(pt > 0 || (cur && cur.rec)){ dsl.set(dur); return ctx.toast("Start a new run to change the time"); } dur = v; drawLine(); } });
    ctx.buttons([{ label:"Start 15 s pulse count", primary:true, onClick(){
      if(view !== "pulse" || moving > 0) return;
      if(cnt.on) return ctx.toast("Already counting");
      if(cur.pulse) return ctx.toast("Pulse already counted for this reading");
      cnt = { on:true, t:0, beats:0, taps:0, done:false }; $("#ex-taps").textContent = "0";
    } }, { label:"Tap (beat)", onClick: tap }]);
    const pa = Kit.answer(ctx, "Pulse rate / beats per minute (beats in 15 s × 4)", "e.g. 72", v => {
      if(!cnt.done) return [false, "Count the pulse for 15 s first."];
      if(cur.pulse) return [true, `Already recorded: ${cur.pulse} beats per minute.`];
      const truth = cnt.beats*4;
      if(Math.abs(v - truth) <= 4){ cur.pulse = truth; return [true, `${cnt.beats} beats in 15 s × 4 = ${truth} beats per minute.`]; }
      if(v === cnt.taps*4) return [false, `Your clicker shows ${cnt.taps}, but you missed or added beats. Start a new 15 s count and tap on every beat.`];
      return [false, "Multiply the number of beats in 15 s by 4."];
    });
    const rb = Kit.reading(ctx, "Breathing rate / breaths per min (peaks in 30 s × 2)", "e.g. 14", () => cur ? cur.br : null, .5, v => { cur.brR = v; ctx.toast("Breathing rate noted"); });
    const rdp = Kit.reading(ctx, "Depth of breathing / dm³ (peak − trough)", "e.g. 0.5", () => cur ? cur.dep : null, .1, v => { cur.depR = Kit.round(v, 1); ctx.toast("Depth noted"); });
    ctx.buttons([{ label:"Record this reading", primary:true, onClick(){
      if(moving > 0) return;
      if(!cur.pulse) return ctx.toast("Count and enter the pulse rate first");
      if(cur.rec) return ctx.toast("Already recorded");
      cur.rec = true;
      ctx.record({ run:`${run}: ${INT[inten].name} ${dur} min`, when: pt === 0 ? "rest" : `${pt - 1} min after`, t: pt === 0 ? 0 : dur + pt - 1, pulse:cur.pulse, br:cur.brR, dep:cur.depR });
      if(pt === 0) ctx.complete("rest");
      if(cur.brR !== null && cur.depR !== null){ if(pt === 0) breathOK.rest = true; if(pt === 1) breathOK.after = true; }
      if(breathOK.rest && breathOK.after) ctx.complete("breath");
      if(pt === 6) ctx.complete("recovery");
      drawLine();
    } }]);
    ctx.buttons([{ label:"Exercise now", onClick(){
      if(moving > 0) return;
      if(exercised) return ctx.toast("Already exercised — wait and measure recovery, or start a new run");
      if(!cur.rec) return ctx.toast("Record the resting reading first");
      P = R + INT[inten].k*(70 + 12*dur); tau = 1 + Math.random()*.6; moving = 2.5; cnt.on = false;
    } }, { label:"Wait 1 minute", onClick(){
      if(!exercised || moving > 0) return ctx.toast("Exercise first");
      if(!cur.rec) return ctx.toast("Record this reading first");
      if(pt >= 6) return ctx.toast("Recovery recorded — start a new run");
      pt++; point(); drawLine();
    } }]);
    ctx.buttons([{ label:"New run (rest first)", onClick(){ if(moving > 0) return; run++; pt = 0; exercised = false; point(); drawLine(); } }]);
    ctx.html(`<div class="hint" style="margin:10px 0 2px"><b>Limewater test</b> (switch the bench view)</div>`);
    ctx.buttons([{ label:"Start / pause breathing", onClick(){ if(view !== "lime") return ctx.toast("Switch the bench to the limewater test"); lime.on = !lime.on; drawLime(); } },
      { label:"New limewater", onClick(){ lime = { on:false, t:0, A:0, B:0, nB:6 + Math.random()*3, tB:null, aDone:false, ph:0 }; drawLime(); } }]);
    ctx.buttons([{ label:"B: cross hidden", onClick(){
      if(view !== "lime") return;
      if(lime.tB !== null) return ctx.toast("Already noted");
      if(lime.B < 1) return ctx.toast("You can still see the cross through tube B — keep going");
      lime.tB = Math.floor(lime.t); drawLime(); if(lime.aDone) ctx.complete("lime");
    } }, { label:"A: still clear — stop", onClick(){
      if(view !== "lime") return;
      if(lime.t < 90) return ctx.toast("Keep breathing for at least 90 s to be sure");
      if(lime.aDone) return;
      lime.aDone = true; lime.aT = lime.t; lime.on = false; drawLime();
      if(lime.tB !== null) ctx.complete("lime"); else ctx.toast("Note when tube B went milky as well");
    } }]);
    point(); drawLine(); drawLime(); status();
  }
});
