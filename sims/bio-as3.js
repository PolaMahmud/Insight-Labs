"use strict";
/* ══════════════════════════════════════════════════════════════════
   BIOLOGY · AS LEVEL (9700 Paper 3) — part 3: membranes & transport
   Agar cubes (SA:V) · Visking tubing · Plasmolysis in onion cells ·
   Beetroot membrane permeability (colorimeter) · Potometer
══════════════════════════════════════════════════════════════════ */

/* ───────────── AGAR CUBES: SURFACE AREA TO VOLUME ───────────── */
Lab.register({
  id:"agarcubes", subject:"biology", level:["as"], topic:"Transport · Surface area to volume", interactive:true,
  title:"Diffusion into agar cubes",
  summary:"Cut cubes of blue thymolphthalein agar, drop them into acid and time how long each takes to go colourless. Plot time against surface area : volume ratio.",
  aim:"Investigate the effect of surface area to volume ratio on the time taken for acid to diffuse to the centre of agar cubes.",
  variables:{ iv:"Side length of cube (cm) → surface area : volume ratio", dv:"Time for the cube to become completely colourless (s)", cv:["Same agar (same alkali + indicator)","Same acid concentration and volume","Same temperature"] },
  stageTitle:"Cubes in acid", controlsTitle:"Cut & time",
  thumb:`<svg viewBox="0 0 300 140">${[[60,18],[120,26],[190,36]].map(([x, s], i) => `<rect x="${x}" y="${100 - s*1.6}" width="${s*1.6}" height="${s*1.6}" fill="${["#E6EEFA","#9DB9E8","#2F6FD6"][i]}" stroke="#3B5E99"/>`).join("")}</svg>`,
  challenges:[
    { id:"five", title:"Five sizes", text:"Time cubes of five different sizes." },
    { id:"sav",  title:"SA : V", text:"Calculate the surface area : volume ratio of a 1.5 cm cube." },
    { id:"rep",  title:"Repeat", text:"Repeat one size three times and look at the spread." }
  ],
  columns:[{key:"s",label:"Side / cm",dp:1},{key:"SA",label:"Surface area / cm²",dp:2},{key:"V",label:"Volume / cm³",dp:3},{key:"r",label:"SA : V / cm⁻¹",dp:1},{key:"t",label:"Time to decolourise / s",dp:1}],
  graph:{ x:["r","s"], y:["t"], fit:"curve" },
  questions:[
    { q:"Assess the risk: the agar contains sodium hydroxide and thymolphthalein, and the cubes go into hydrochloric acid.",
      a:"Low to medium. Dilute sodium hydroxide and hydrochloric acid are irritants (corrosive if more concentrated), and thymolphthalein is dissolved in flammable ethanol. Wear eye protection, handle cubes with forceps, keep the indicator away from flames, and cut on a white tile with the blade moving away from you." },
    { q:"Calculate the surface area : volume ratio of a 2 cm cube.",
      a:"Surface area = 6 × 2² = 24 cm². Volume = 2³ = 8 cm³. SA : V = 24 ÷ 8 = 3 : 1 (3 cm⁻¹). For any cube, SA : V = 6 ÷ side." },
    { q:"Explain why large cubes take much longer to go colourless.",
      a:"The acid has further to diffuse to reach the centre, and the cube has less surface area per unit volume for acid to enter. Time increases with the square of the distance, so doubling the side roughly quadruples the time." },
    { q:"Relate this to why large organisms need specialised exchange surfaces.",
      a:"As size increases, SA : V falls and diffusion distances increase, so diffusion across the body surface is too slow to supply the whole volume. Large organisms need exchange surfaces with a large area and short diffusion distance, and a transport system." },
    { q:"What is the main source of uncertainty in this experiment and how could it be reduced?",
      a:"Judging the moment the last trace of blue disappears. Use a white tile and good lighting, have the same person judge each end point, or cut each cube in half at set times to look at the remaining blue core." },
    { q:"Suggest two further limitations and improvements.",
      a:"Cubes are cut by hand so sides are not exact — use a template or cutter and measure with a ruler or calipers. Temperature varies — use a water bath. Cubes rest on the beaker bottom so one face is blocked — suspend them in a mesh, or stir gently." }
  ],
  setup(ctx){
    const D = .0011 + Math.random()*.0002, SPEED = 20;     // cm² s⁻¹ (effective)
    let side = 1, cube = null;
    const sw = Kit.stopwatch("ag-sw", 740, 300);
    const tEnd = s => (s/2)*(s/2)/(2*D)*.85;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="ag-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 440)}<g id="ag-scene"></g>${sw.svg}
      <text x="24" y="34" class="k-status" id="ag-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ag-svg"), $ = s => svg.querySelector(s);
    sw.bind(svg);
    function draw(){
      let s = `<rect x="140" y="160" width="300" height="280" rx="10" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><rect x="143" y="210" width="294" height="227" rx="8" fill="#E7F0F8" opacity=".75"/>
        <text x="290" y="150" text-anchor="middle" class="k-lbl">0.1 mol dm⁻³ hydrochloric acid</text>`;
      const S = (cube ? cube.s : side)*80, x = 290 - S/2, y = cube ? 436 - S : 120 - S/2;
      const f = cube ? Math.min(1, cube.t/cube.tEnd) : 0, core = Math.max(0, 1 - Math.sqrt(f));      // blue core shrinks
      s += `<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="#EEF3FA" stroke="#3B5E99" stroke-width="1.3"/>`;
      if(core > 0) s += `<rect x="${290 - S*core/2}" y="${y + S/2 - S*core/2}" width="${S*core}" height="${S*core}" rx="${S*core*.25}" fill="#2F6FD6" opacity="${(.55 + .45*core).toFixed(2)}"/>`;
      s += `<text x="${cube ? 520 : 290}" y="${cube ? 300 : 120 + S/2 + 22}" ${cube ? "" : `text-anchor="middle"`} class="k-tag">${(cube ? cube.s : side).toFixed(1)} cm cube${cube ? " (cut-away view)" : " — ready to drop in"}</text>`;
      $("#ag-scene").innerHTML = s;
      $("#ag-status").textContent = !cube ? "Choose a size, cut the cube and drop it in — start the stopwatch together" : f >= 1 ? "Completely colourless — stop the stopwatch" : "Watch for the last trace of blue";
      ctx.readout([["Cube", (cube ? cube.s : side).toFixed(1) + " cm"], ["Surface area", (6*side*side).toFixed(2) + " cm²"], ["Volume", Math.pow(side, 3).toFixed(3) + " cm³"]]);
    }
    ctx.frame(dt => { sw.tick(dt*SPEED); if(cube) cube.t += dt*SPEED; draw(); });
    ctx.seg({ label:"Side length", value:1, options:[[.5,"0.5 cm"],[1,"1.0"],[1.5,"1.5"],[2,"2.0"],[2.5,"2.5"]], onChange(v){ if(cube) return; side = v; draw(); } });
    ctx.buttons([{ label:"Cut & drop in acid", primary:true, onClick(){
      if(cube) return ctx.toast("Record or remove the cube in the beaker first");
      const s = side*(1 + .03*ctx.gauss()); cube = { s:side, t:0, tEnd:tEnd(s)*(1 + .05*ctx.gauss()) }; sw.reset(); ctx.toast("Start the stopwatch!");
    } }, { label:"Record time", onClick(){
      if(!cube) return; if(sw.running) return ctx.toast("Stop the stopwatch first");
      if(sw.t <= 0) return ctx.toast("You didn’t time it — remove it and try again");
      if(cube.t < cube.tEnd*.97) return ctx.toast("There’s still some blue in the middle — keep going (restart the stopwatch)");
      const s = cube.s;
      ctx.record({ s, SA:6*s*s, V:s*s*s, r:Kit.round(6/s, 1), t:Kit.round(sw.t, 1) });
      cube = null; sw.reset();
      const rows = ctx.rows(), by = {}; rows.forEach(r => by[r.s] = (by[r.s] || 0) + 1);
      if(Object.keys(by).length >= 5) ctx.complete("five");
      if(Object.values(by).some(n => n >= 3)) ctx.complete("rep");
    } }, { label:"Remove cube", onClick(){ cube = null; sw.reset(); } }]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Time runs ×${SPEED}. Big cubes take a while — the stopwatch shows experiment time.</p>`);
    Kit.answer(ctx, "SA : V of a 1.5 cm cube / cm⁻¹", "e.g. 4", v => {
      if(Math.abs(v - 4) <= .05){ ctx.complete("sav"); return [true, "Correct: 6 × 1.5² = 13.5 cm², 1.5³ = 3.375 cm³, 13.5 ÷ 3.375 = 4.0 cm⁻¹."]; }
      return [false, "SA = 6 × side², V = side³, then divide."];
    });
    draw();
  }
});

/* ───────────── VISKING TUBING ───────────── */
Lab.register({
  id:"visking", subject:"biology", level:["as"], topic:"Transport · Diffusion & osmosis", interactive:true,
  title:"Visking tubing: diffusion & osmosis",
  summary:"Fill dialysis tubing with sucrose and watch the level rise in a capillary tube, or fill it with starch and glucose and test the water outside to see which molecules get through.",
  aim:"Use Visking (dialysis) tubing as a model of a partially permeable membrane to investigate osmosis and diffusion.",
  variables:{ iv:"Sucrose concentration inside the tubing (mol dm⁻³)", dv:"Rise of liquid in the capillary tube in 10 min (mm)", cv:["Same length of tubing","Same volume of solution","Distilled water outside, same temperature"] },
  stageTitle:"Osmometer", controlsTitle:"Set-up",
  thumb:`<svg viewBox="0 0 300 140"><rect x="90" y="40" width="120" height="90" rx="6" fill="#E7F0F8" stroke="#A2ACBD" stroke-width="2"/><path d="M150 10v70" stroke="#A2ACBD" stroke-width="4"/><path d="M150 30v50" stroke="#4C86C6" stroke-width="3"/><ellipse cx="150" cy="95" rx="22" ry="28" fill="#F4E9C8" stroke="#B8962E"/></svg>`,
  challenges:[
    { id:"osm",  title:"Osmosis", text:"Measure the rise for four sucrose concentrations." },
    { id:"glu",  title:"Glucose passes", text:"Get a positive Benedict’s test on the water outside." },
    { id:"sta",  title:"Starch doesn’t", text:"Show the iodine test on the outside water stays negative." }
  ],
  columns:[{key:"inside",label:"Inside tubing"},{key:"c",label:"Sucrose / mol dm⁻³",dp:1},{key:"h",label:"Rise in 10 min / mm",dp:0},{key:"test",label:"Test on water outside"},{key:"res",label:"Result"}],
  graph:{ x:["c"], y:["h"], fit:"linear" },
  questions:[
    { q:"Explain why the liquid rises up the capillary tube.",
      a:"The sucrose solution inside has a lower water potential than the distilled water outside. Water moves into the tubing by osmosis, down the water potential gradient, through the partially permeable membrane, increasing the volume inside." },
    { q:"Why does glucose appear in the water outside but starch does not?",
      a:"The tubing has tiny pores. Glucose molecules are small enough to diffuse through them, down their concentration gradient; starch molecules are too large." },
    { q:"How is Visking tubing a good and a poor model of a cell membrane?",
      a:"Good: it is partially permeable, letting small molecules and water through. Poor: its pores are fixed holes; cell membranes have a phospholipid bilayer with channel and carrier proteins, active transport and can change permeability." },
    { q:"The capillary scale is in millimetres. State the uncertainty in a rise of 24 mm.",
      a:"Each reading is ±0.5 mm and a rise is the difference of two readings, so ±1 mm, about ±4%." }
  ],
  setup(ctx){
    const K = 26 + Math.random()*6, SPEED = 30;
    let mode = "osm", c = .5, t = 0, running = false, outside = 0;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="vk-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 450)}<g id="vk-scene"></g><text x="24" y="34" class="k-status" id="vk-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#vk-svg"), $ = s => svg.querySelector(s);
    const rise = () => mode === "osm" ? K*c*(1 - Math.exp(-t/900))*1.6 : 0;
    function draw(){
      const h = rise(), base = 250;
      let s = `<rect x="240" y="230" width="240" height="220" rx="10" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/><rect x="243" y="260" width="234" height="187" rx="8" fill="url(#k-water)"/>
        <path d="M330 300c-30 0-30 130 30 130s60-130 30-130z" fill="${mode === "osm" ? "#F4E9C8" : "#ECE7F7"}" stroke="#B8962E" stroke-width="1.6" opacity=".9"/>`;
      if(mode === "osm"){
        s += `<rect x="356" y="40" width="8" height="262" fill="url(#k-glass)" stroke="var(--txt2)"/><rect x="357.5" y="${base - h}" width="5" height="${300 - base + h}" fill="#C69B2F"/>`;
        for(let mm = 0; mm <= 200; mm += 2){ const y = base - mm; s += `<line x1="368" y1="${y}" x2="${mm % 10 ? 373 : 378}" y2="${y}" stroke="var(--txt2)" stroke-width=".7"/>`; if(mm % 20 === 0) s += `<text x="382" y="${y + 3}" class="k-num">${mm}</text>`; }
        s += `<text x="400" y="${base - h + 4}" class="k-read">${Math.round(h)} mm</text>`;
      }else{
        for(let k = 0; k < 18; k++){ const a = k*2.1, r = 20 + (k*13) % 30; s += `<circle cx="${360 + r*Math.cos(a)*.7}" cy="${370 + r*Math.sin(a)}" r="${k % 3 ? 2 : 4.5}" fill="${k % 3 ? "#B8962E" : "#6D3FD6"}"/>`; }
        for(let k = 0; k < Math.round(outside*14); k++) s += `<circle cx="${260 + (k*37) % 200}" cy="${290 + (k*23) % 140}" r="2" fill="#B8962E"/>`;
        s += `<text x="500" y="320" class="k-lbl">● starch (large) ● glucose (small)</text>`;
      }
      s += `<text x="520" y="360" class="k-tag">${Math.floor(t/60)} min</text>`;
      $("#vk-scene").innerHTML = s;
      $("#vk-status").textContent = running ? "Leaving to stand…" : mode === "osm" ? "Fill the tubing, set the level to 0 and start" : "Starch + glucose inside, distilled water outside";
      ctx.readout(mode === "osm" ? [["Inside", c + " mol dm⁻³ sucrose"], ["Time", Math.floor(t/60) + " min"], ["Rise", Math.round(rise()) + " mm"]] : [["Inside", "1% starch + 1% glucose"], ["Time", Math.floor(t/60) + " min"]]);
    }
    ctx.frame(dt => { if(running){ t += dt*SPEED; outside = Math.min(1, t/900); if(t >= 600){ t = 600; running = false; } } draw(); });
    ctx.seg({ label:"Inside the tubing", value:"osm", options:[["osm","Sucrose (osmometer)"],["dif","Starch + glucose"]], onChange(v){ mode = v; t = 0; running = false; outside = 0; draw(); } });
    ctx.seg({ label:"Sucrose concentration", value:.5, options:[[.2,"0.2"],[.4,"0.4"],[.5,"0.5"],[.6,"0.6"],[.8,"0.8"],[1,"1.0"]], onChange(v){ if(running) return; c = v; t = 0; draw(); } });
    ctx.buttons([{ label:"Start 10 min", primary:true, onClick(){ t = 0; outside = 0; running = true; } }]);
    const rd = Kit.reading(ctx, "Capillary reading after 10 min / mm", "e.g. 24", () => mode === "osm" && !running && t >= 600 ? rise() : null, 1, v => {
      ctx.record({ inside:"sucrose", c, h:Math.round(v), test:"—", res:"—" }); rd.clear(); t = 0; draw();
      if(new Set(ctx.rows().filter(r => r.inside === "sucrose").map(r => r.c)).size >= 4) ctx.complete("osm");
    });
    ctx.buttons([{ label:"Benedict’s on outside water", onClick(){ test("Benedict’s", t >= 120 ? "brick-red/orange: glucose present" : "stays blue (too soon)", t >= 120 ? "glu" : null); } },
      { label:"Iodine on outside water", onClick(){ test("iodine", "stays orange-brown: no starch", t >= 120 ? "sta" : null); } }]);
    function test(name, res, ch){ if(mode !== "dif") return ctx.toast("Switch to starch + glucose first"); if(t <= 0) return ctx.toast("Start the experiment first");
      ctx.record({ inside:"starch + glucose", c:null, h:null, test:name + " after " + Math.floor(t/60) + " min", res }); if(ch) ctx.complete(ch); }
    draw();
  }
});

/* ───────────── PLASMOLYSIS IN ONION CELLS ───────────── */
Lab.register({
  id:"plasmolysis", subject:"biology", level:["as"], topic:"Transport · Water potential", interactive:true,
  title:"Plasmolysis in red onion cells",
  summary:"Mount red onion epidermis in sucrose solutions, click the plasmolysed cells you can see, plot % plasmolysed and estimate the water potential of the cells at incipient plasmolysis.",
  aim:"Estimate the water potential of red onion epidermal cells by finding the sucrose concentration at which 50% of the cells are plasmolysed.",
  variables:{ iv:"Concentration of sucrose solution (mol dm⁻³)", dv:"Percentage of cells plasmolysed", cv:["Same onion, same layer of epidermis","Same time in solution (15 min)","Count the same number of cells (whole field)"] },
  stageTitle:"Field of view ×100", controlsTitle:"Sucrose solution",
  thumb:`<svg viewBox="0 0 300 140">${[...Array(12)].map((_, i) => { const x = 30 + (i % 6)*42, y = 20 + Math.floor(i/6)*52; return `<rect x="${x}" y="${y}" width="40" height="50" fill="none" stroke="#9C8F6A"/><rect x="${x + (i % 3 ? 2 : 8)}" y="${y + (i % 3 ? 2 : 10)}" width="${i % 3 ? 36 : 22}" height="${i % 3 ? 46 : 28}" rx="${i % 3 ? 2 : 10}" fill="#B23A72" opacity=".8"/>`; }).join("")}</svg>`,
  challenges:[
    { id:"six",  title:"Six solutions", text:"Count plasmolysed cells in six sucrose concentrations." },
    { id:"acc",  title:"Sharp eyes", text:"Count a whole field exactly right." },
    { id:"psi",  title:"Water potential", text:"Estimate the water potential of the onion cells." }
  ],
  columns:[{key:"c",label:"Sucrose / mol dm⁻³",dp:2},{key:"n",label:"Cells counted",dp:0},{key:"p",label:"Plasmolysed (your count)",dp:0},{key:"pct",label:"Plasmolysed / %",dp:0},{key:"true",label:"Actually plasmolysed",dp:0}],
  graph:{ x:["c"], y:["pct"], fit:"curve" },
  questions:[
    { q:"How should the onion epidermis be mounted to see plasmolysis clearly?",
      a:"Peel a single layer of epidermis from the inner surface of the onion scale leaf, lay it flat in a drop of the sucrose solution on a slide, lower a coverslip at an angle with a mounted needle to avoid air bubbles, and blot excess liquid. Red onion needs no stain because the cell sap is coloured." },
    { q:"What is incipient plasmolysis, and why is it taken as 50% of cells plasmolysed?",
      a:"The point at which the protoplast is just starting to pull away from the cell wall, so the water potential of the cells equals the water potential of the solution. Cells vary, so the concentration at which half of them are plasmolysed is used as the average cell’s incipient plasmolysis." },
    { q:"Explain what happens to a cell in a solution of lower water potential than its cytoplasm.",
      a:"Water leaves the vacuole and cytoplasm by osmosis through the partially permeable cell surface membrane. The protoplast shrinks and pulls away from the cell wall; the gap fills with the external solution." },
    { q:"Why doesn’t a plant cell burst in pure water?",
      a:"Water enters by osmosis and the protoplast swells and pushes against the cell wall. The strong cellulose wall resists expansion, so the cell becomes turgid rather than bursting; water stops entering once the water potential inside equals that outside. An animal cell has no wall, so it would burst." },
    { q:"Give two limitations of counting plasmolysed cells, and improvements.",
      a:"Deciding whether a cell is ‘just’ plasmolysed is subjective — agree a rule (e.g. any visible gap at a corner). Only one field is counted — count several fields/strips and find the mean. Peels may be more than one cell thick — use a thin single layer." }
  ],
  setup(ctx){
    const MEAN = .36 + Math.random()*.14, SD = .07, COLS = 7, ROWS = 6, W = 74, H = 62;
    const PSI = [[0,0],[.1,-260],[.2,-540],[.3,-860],[.4,-1120],[.5,-1450],[.6,-1800],[.7,-2180],[.8,-2580]];
    let c = .3, cells = [], marked = new Set(), checked = false;
    function mount(){
      checked = false; marked = new Set(); cells = [];
      for(let i = 0; i < COLS*ROWS; i++){ const thr = MEAN + SD*ctx.gauss(); const deg = Kit.clamp((c - thr)/.12, 0, 1); cells.push({ pl:c > thr, deg, j:Math.random(), k:Math.floor(Math.random()*4) }); }
    }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 460" class="kb" id="pl-svg"><defs>${Kit.DEFS}</defs><rect width="960" height="460" fill="#0A0D13"/>
      <rect x="24" y="56" width="${COLS*W + 20}" height="${ROWS*H + 20}" rx="12" fill="#F7F2E6"/><g id="pl-cells"></g>
      <g transform="translate(600 56)"><rect width="336" height="392" rx="14" fill="#111827" stroke="#334155"/><g id="pl-side"></g></g>
      <text x="24" y="38" class="k-status" style="fill:#E5E7EB" id="pl-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#pl-svg"), $ = s => svg.querySelector(s);
    function draw(){
      $("#pl-cells").innerHTML = cells.map((cl, i) => {
        const x = 34 + (i % COLS)*W + (Math.floor(i/COLS) % 2)*6, y = 66 + Math.floor(i/COLS)*H, w = W - 2, h = H - 2;
        const g = cl.pl ? 4 + cl.deg*14 : 1.5, corner = cl.pl && cl.deg < .35;
        let p;
        if(!cl.pl) p = `<rect x="${x + 1.5}" y="${y + 1.5}" width="${w - 3}" height="${h - 3}" rx="1.5" fill="#B23A72" opacity=".82"/>`;
        else if(corner){ const cx = [x + 2, x + w - 2][cl.k % 2], cy = [y + 2, y + h - 2][cl.k >> 1];
          p = `<rect x="${x + 1.5}" y="${y + 1.5}" width="${w - 3}" height="${h - 3}" rx="1.5" fill="#B23A72" opacity=".82"/><path d="M${cx} ${cy}l${(cl.k % 2 ? -1 : 1)*14} 0q${(cl.k % 2 ? 6 : -6)} ${(cl.k >> 1 ? -6 : 6)} 0 ${(cl.k >> 1 ? -1 : 1)*14}z" fill="#F7F2E6"/>`; }
        else p = `<rect x="${x + g}" y="${y + g*.8}" width="${w - 2*g}" height="${h - 1.6*g}" rx="${6 + cl.deg*12}" fill="#B23A72" opacity="${(.82 + cl.deg*.15).toFixed(2)}"/>`;
        const m = marked.has(i), bad = checked && m !== cl.pl;
        return `<g data-c="${i}" style="cursor:pointer"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#F7F2E6" stroke="#8D7E58" stroke-width="1.4"/>${p}
          ${m ? `<circle cx="${x + w - 12}" cy="${y + 12}" r="8" fill="${bad ? "#E0335A" : checked ? "#0F9A62" : "#1F2937"}"/><text x="${x + w - 12}" y="${y + 16}" text-anchor="middle" style="font:700 10px Inter;fill:#fff">P</text>` : bad ? `<circle cx="${x + w - 12}" cy="${y + 12}" r="8" fill="none" stroke="#E0335A" stroke-width="2"/>` : ""}</g>`;
      }).join("");
      $("#pl-side").innerHTML = `<text x="16" y="28" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.06em">SUCROSE ${c.toFixed(2)} mol dm⁻³ · 15 min</text>
        <text x="16" y="66" style="font:600 15px Inter;fill:#E5E7EB">Plasmolysed (marked): ${marked.size}</text><text x="16" y="92" style="font:500 13px Inter;fill:#9CA3AF">Cells in field: ${cells.length}</text>
        <text x="16" y="130" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.06em">WATER POTENTIAL OF SUCROSE SOLUTION</text>
        ${PSI.map(([k, v], i) => `<text x="16" y="${154 + i*22}" style="font:500 12px 'JetBrains Mono';fill:#E5E7EB">${k.toFixed(1)} mol dm⁻³</text><text x="320" y="${154 + i*22}" text-anchor="end" style="font:500 12px 'JetBrains Mono';fill:#7CFFB2">${v} kPa</text>`).join("")}`;
      $("#pl-status").textContent = checked ? "Checked — red rings are cells you got wrong" : "Click every cell where the protoplast has pulled away from the wall";
      ctx.readout([["Sucrose", c.toFixed(2) + " mol dm⁻³"], ["Marked", marked.size + " / " + cells.length]]);
    }
    svg.addEventListener("click", e => { const g = e.target.closest("[data-c]"); if(!g || checked) return; const i = +g.dataset.c; marked.has(i) ? marked.delete(i) : marked.add(i); draw(); });
    ctx.seg({ label:"Sucrose concentration (mol dm⁻³)", value:.3, options:[[0,"0"],[.2,"0.2"],[.3,"0.3"],[.35,"0.35"],[.4,"0.4"],[.45,"0.45"],[.5,"0.5"],[.6,"0.6"],[.8,"0.8"]], onChange(v){ c = v; mount(); draw(); } });
    ctx.buttons([{ label:"Count & record", primary:true, onClick(){
      if(checked) return ctx.toast("Already recorded — mount a fresh strip");
      checked = true;
      const truth = cells.filter(x => x.pl).length, right = cells.every((x, i) => marked.has(i) === x.pl);
      ctx.record({ c, n:cells.length, p:marked.size, pct:Math.round(marked.size/cells.length*100), true:truth });
      if(right) ctx.complete("acc");
      if(new Set(ctx.rows().map(r => r.c)).size >= 6) ctx.complete("six");
      draw();
    } }, { label:"Mount a fresh strip", onClick(){ mount(); draw(); } }]);
    Kit.answer(ctx, "Water potential of the onion cells / kPa", "e.g. -1100", v => {
      if(new Set(ctx.rows().map(r => r.c)).size < 5) return [false, "Record at least five concentrations so you can find 50% plasmolysed."];
      const lo = PSI.filter(p => p[0] <= MEAN).pop(), hi = PSI.find(p => p[0] > MEAN), psi = lo[1] + (hi[1] - lo[1])*(MEAN - lo[0])/(hi[0] - lo[0]);
      if(Math.abs(v - psi) <= 160){ ctx.complete("psi"); return [true, `Good — 50% plasmolysis is at about ${MEAN.toFixed(2)} mol dm⁻³, so the cells’ water potential ≈ ${Math.round(psi)} kPa.`]; }
      return [false, "Read the concentration at 50% plasmolysed from your curve, then convert it with the table (interpolate between rows). It should be negative."];
    });
    mount(); draw();
  }
});

/* ───────────── BEETROOT MEMBRANE PERMEABILITY ───────────── */
Lab.register({
  id:"beetroot", subject:"biology", level:["as"], topic:"Cell membranes · Permeability", interactive:true,
  title:"Beetroot membranes & the colorimeter",
  summary:"Cut and rinse beetroot discs, heat them (or soak in ethanol), then measure how much red pigment leaks out with a colorimeter you zero yourself.",
  aim:"Investigate the effect of temperature (or ethanol concentration) on the permeability of beetroot cell membranes, using a colorimeter to measure leakage of betalain pigment.",
  variables:{ iv:"Temperature of water (°C) or concentration of ethanol (%)", dv:"Absorbance of the surrounding solution (green filter)", cv:["Same number and size of discs (cork borer, same thickness)","Discs rinsed to remove pigment from cut cells","Same volume of liquid, same time (30 min)"] },
  stageTitle:"Discs & colorimeter", controlsTitle:"Method",
  thumb:`<svg viewBox="0 0 300 140">${[0,1,2,3,4].map(i => `<rect x="${50 + i*44}" y="30" width="26" height="90" rx="4" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="${52 + i*44}" y="60" width="22" height="58" rx="3" fill="#B0124F" opacity="${(.1 + i*.2).toFixed(2)}"/>`).join("")}</svg>`,
  challenges:[
    { id:"zero",  title:"Zero the colorimeter", text:"Set absorbance to 0 with a blank of distilled water." },
    { id:"temp",  title:"Temperature series", text:"Record absorbance at six temperatures." },
    { id:"eth",   title:"Ethanol series", text:"Record absorbance for four ethanol concentrations." }
  ],
  columns:[{key:"iv",label:"Treatment"},{key:"x",label:"T / °C or ethanol / %",dp:0},{key:"rinse",label:"Rinsed?"},{key:"A",label:"Absorbance",dp:2}],
  series:"iv",
  graph:{ x:["x"], y:["A"], fit:"curve" },
  questions:[
    { q:"Assess the risk of this practical.",
      a:"Medium. Cork borers and scalpels can cut; hot water baths up to 80 °C can scald; ethanol is highly flammable and harmful. Cut on a tile away from your hand, use tongs or a test-tube holder, and keep ethanol away from any flame." },
    { q:"Why does more pigment leak out above about 50 °C?",
      a:"The membrane proteins denature, leaving gaps in the membrane, and the phospholipids move more and the bilayer becomes more fluid. The tonoplast and cell surface membrane become more permeable, so betalain leaves the vacuole and the cells." },
    { q:"Why does ethanol increase leakage?",
      a:"Ethanol is a non-polar solvent that dissolves the lipids of the membrane, disrupting the phospholipid bilayer." },
    { q:"Why must the discs be rinsed before the experiment?",
      a:"Cutting breaks open cells, releasing pigment that is not due to membrane permeability. Rinsing until the water stays clear removes it; otherwise every absorbance is too high (a systematic error)." },
    { q:"Why is the colorimeter zeroed with distilled water, and why use a green filter?",
      a:"Zeroing with a blank cancels absorbance by the cuvette and the water. Betalain is red because it absorbs green light, so a green (complementary) filter gives the largest change in absorbance." },
    { q:"How could you compare samples if no colorimeter is available?",
      a:"Make a set of colour standards by diluting a known pigment extract, and match each sample to the nearest standard against a white background. This is less precise and subjective." }
  ],
  setup(ctx){
    const TM = 52 + Math.random()*6, EM = 35 + Math.random()*10;
    let iv = "temp", T = 30, E = 20, rinse = true, zero = false, stage = 0, sample = null;
    const absTrue = () => (iv === "temp" ? .05 + 1.1/(1 + Math.exp(-(T - TM)/4.5)) : .05 + 1.0/(1 + Math.exp(-(E - EM)/7))) + (rinse ? 0 : .18);
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 460" class="kb" id="bt-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 420)}<g id="bt-scene"></g><text x="24" y="34" class="k-status" id="bt-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#bt-svg"), $ = s => svg.querySelector(s);
    function draw(){
      const A = sample !== null ? sample : 0;
      let s = `<rect x="80" y="200" width="90" height="220" rx="12" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
        <rect x="83" y="250" width="84" height="167" rx="10" fill="rgba(176,18,79,${stage >= 2 ? Math.min(.85, A*.6).toFixed(2) : .04})"/>
        ${stage >= 1 ? [0, 1, 2, 3, 4].map(k => `<ellipse cx="${108 + (k % 3)*18}" cy="${330 + k*14}" rx="12" ry="4" fill="#7A0B33"/>`).join("") : ""}
        <text x="125" y="440" text-anchor="middle" class="k-lbl">${iv === "temp" ? `water at ${T} °C` : `${E}% ethanol`}</text>
        <g transform="translate(330 170)"><rect width="300" height="200" rx="16" fill="#1F2937" stroke="#4B5563"/><text x="20" y="30" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.06em">COLORIMETER · GREEN FILTER</text>
          <rect x="20" y="50" width="160" height="60" rx="8" fill="#132A1F"/><text x="170" y="92" text-anchor="end" class="k-lcd">${stage >= 3 ? sample.toFixed(2) : zero ? "0.00" : "—"}</text>
          <rect x="210" y="40" width="60" height="120" rx="8" fill="#0F172A"/><rect x="226" y="54" width="28" height="70" rx="2" fill="rgba(176,18,79,${stage >= 3 ? Math.min(.85, A*.6).toFixed(2) : .05})" stroke="#94A3B8"/>
          <text x="20" y="140" style="font:500 11px Inter;fill:#9CA3AF">${zero ? "zeroed with distilled water ✓" : "not zeroed"}</text></g>`;
      $("#bt-scene").innerHTML = s;
      $("#bt-status").textContent = ["Cut five discs with a cork borer", "Discs in the liquid — leave 30 min", "Pour some liquid into a cuvette and read", "Reading taken — record it"][stage];
      ctx.readout([["Treatment", iv === "temp" ? T + " °C water" : E + "% ethanol"], ["Rinsed", rinse ? "yes" : "no"], ["Colorimeter", zero ? "zeroed" : "not zeroed", zero ? "good" : "warn"]]);
    }
    ctx.seg({ label:"Investigate", value:"temp", options:[["temp","Temperature"],["eth","Ethanol"]], onChange(v){ iv = v; stage = 0; sample = null; draw(); } });
    ctx.slider({ label:"Water bath temperature", min:20, max:80, step:5, value:30, unit:"°C", onInput(v){ T = v; if(stage) { stage = 0; sample = null; } draw(); } });
    ctx.seg({ label:"Ethanol concentration", value:20, options:[[0,"0%"],[20,"20"],[40,"40"],[60,"60"],[80,"80"],[100,"100"]], onChange(v){ E = v; if(stage){ stage = 0; sample = null; } draw(); } });
    ctx.seg({ label:"Rinse discs until water is clear?", value:true, options:[[true,"Rinse"],[false,"Don’t rinse"]], onChange(v){ rinse = v; } });
    ctx.buttons([{ label:"1 · Cut discs & add", onClick(){ stage = 1; sample = null; draw(); } }, { label:"2 · Leave 30 min", onClick(){ if(stage !== 1) return; stage = 2; sample = absTrue()*(1 + .04*ctx.gauss()); draw(); } }]);
    ctx.buttons([{ label:"Zero with blank", onClick(){ zero = true; ctx.complete("zero"); draw(); } }, { label:"3 · Read sample", onClick(){
      if(stage !== 2) return ctx.toast(stage < 2 ? "Finish steps 1 and 2 first" : "Already read");
      if(!zero){ sample += .22; ctx.toast("Not zeroed: the reading includes the cuvette and water"); }
      stage = 3; draw(); } }]);
    ctx.buttons([{ label:"Record", primary:true, block:true, onClick(){
      if(stage !== 3) return ctx.toast("Take a colorimeter reading first");
      ctx.record({ iv: iv === "temp" ? "Temperature" : "Ethanol", x: iv === "temp" ? T : E, rinse: rinse ? "yes" : "no", A:Kit.round(sample, 2) });
      stage = 0; sample = null; draw();
      const rows = ctx.rows();
      if(new Set(rows.filter(r => r.iv === "Temperature").map(r => r.x)).size >= 6) ctx.complete("temp");
      if(new Set(rows.filter(r => r.iv === "Ethanol").map(r => r.x)).size >= 4) ctx.complete("eth");
    } }]);
    draw();
  }
});

/* ───────────── POTOMETER ───────────── */
Lab.register({
  id:"potometer", subject:"biology", level:["as"], topic:"Transport in plants · Transpiration", interactive:true,
  title:"Potometer: rate of water uptake",
  summary:"Read an air bubble moving along a capillary tube as a leafy shoot takes up water. Change the air movement, humidity, light and temperature and compare rates.",
  aim:"Use a potometer to investigate the effect of environmental factors on the rate of water uptake by a leafy shoot.",
  variables:{ iv:"Air movement, humidity, light intensity or temperature (change one)", dv:"Distance moved by the bubble in 2 min (mm) → volume of water taken up (mm³ min⁻¹)", cv:["Same shoot","Leave 5 min to acclimatise after each change","The other three factors"] },
  stageTitle:"Potometer", controlsTitle:"Conditions",
  thumb:`<svg viewBox="0 0 300 140"><path d="M60 30v60h200" stroke="#A2ACBD" stroke-width="6" fill="none"/><path d="M60 30c-10-20 10-20 0-30M60 30c10-20 30-10 20-28" stroke="#3BA34C" stroke-width="4" fill="none"/><circle cx="180" cy="90" r="5" fill="#fff" stroke="#4C86C6"/>${[...Array(11)].map((_, i) => `<line x1="${100 + i*14}" y1="98" x2="${100 + i*14}" y2="${i % 5 ? 104 : 108}" stroke="#A2ACBD"/>`).join("")}</svg>`,
  challenges:[
    { id:"wind",  title:"Air movement", text:"Compare still air, a gentle fan and a strong fan." },
    { id:"hum",   title:"Humidity", text:"Compare the shoot with and without a plastic bag over it." },
    { id:"vol",   title:"Volume", text:"Convert a rate in mm min⁻¹ to mm³ min⁻¹." }
  ],
  columns:[{key:"cond",label:"Conditions"},{key:"T",label:"T / °C",dp:0},{key:"x0",label:"Start / mm",dp:1},{key:"x1",label:"After 2 min / mm",dp:1},{key:"d",label:"Distance / mm",dp:1},{key:"rate",label:"Rate / mm min⁻¹",dp:2},{key:"vol",label:"Rate / mm³ min⁻¹",dp:2}],
  series:"cond",
  graph:{ x:["T"], y:["rate","vol"], fit:"curve" },
  questions:[
    { q:"Why does a potometer measure water uptake rather than transpiration?",
      a:"Some water taken up is used in photosynthesis or to keep cells turgid, so uptake is not exactly equal to the water lost by transpiration — but it is very close." },
    { q:"Why is the shoot cut, and fitted to the potometer, under water?",
      a:"To stop air entering the xylem vessels. An air bubble (air lock) would break the continuous column of water held by cohesion, so water could not be pulled up." },
    { q:"Explain why moving air increases the rate.",
      a:"Moving air removes water vapour from around the leaf, keeping the water vapour potential gradient between the air spaces and the outside air steep, so water vapour diffuses out of the stomata faster." },
    { q:"The capillary has a radius of 0.5 mm. Convert a rate of 8 mm min⁻¹ to a volume.",
      a:"Volume = πr² × distance = 3.14 × 0.5² × 8 = 6.3 mm³ min⁻¹." },
    { q:"Give two limitations and improvements.",
      a:"Seals may leak — smear joints with petroleum jelly. Conditions (light, temperature) vary in the lab — use a controlled environment and a heat filter between lamp and shoot. Different shoots have different leaf areas — divide the rate by the total leaf area (trace leaves on squared paper)." }
  ],
  setup(ctx){
    const BASE = 3.2 + Math.random()*.8, R = .5, SPEED = 12;
    let wind = 0, bag = false, light = "on", temp = 20, x = 10, timing = null, x0 = null, done = false;
    const rate = () => BASE*[1, 1.8, 2.6][wind]*(bag ? .35 : 1)*(light === "on" ? 1 : .45)*Math.pow(1.5, (temp - 20)/10);
    const cond = () => `${["still air","gentle fan","strong fan"][wind]}, ${bag ? "bag on" : "no bag"}, light ${light}`;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="pt-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 450)}<g id="pt-scene"></g><text x="24" y="34" class="k-status" id="pt-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#pt-svg"), $ = s => svg.querySelector(s);
    const SX = 280, PXMM = 5;                     // scale from 0 mm at SX, 5 px per mm
    function draw(){
      let s = `<path d="M150 380V200" stroke="var(--txt2)" stroke-width="10"/><path d="M150 380H${SX + 600}" stroke="var(--txt2)" stroke-width="7" fill="none"/><path d="M150 380H${SX + 600}" stroke="#BFD7EA" stroke-width="4"/>
        <rect x="230" y="250" width="40" height="80" rx="6" fill="url(#k-glass)" stroke="var(--txt2)"/><rect x="232" y="280" width="36" height="48" fill="#BFD7EA"/><path d="M250 330v50" stroke="var(--txt2)" stroke-width="4"/><text x="250" y="240" text-anchor="middle" class="k-lbl">reservoir</text>
        <rect x="${SX + x*PXMM - 9}" y="377" width="9" height="6" rx="3" fill="#F8FAFC" stroke="#1E3A5F" stroke-width="1.2"/><path d="M${SX + x*PXMM} 368v-10" stroke="var(--accent)" stroke-width="1.5"/><text x="${SX + x*PXMM}" y="352" text-anchor="middle" class="k-hint">bubble</text>`;
      for(let mm = 0; mm <= 110; mm++){ const xx = SX + mm*PXMM; s += `<line x1="${xx}" y1="390" x2="${xx}" y2="${mm % 10 ? (mm % 5 ? 395 : 399) : 404}" stroke="var(--txt2)" stroke-width=".7"/>`; if(mm % 10 === 0) s += `<text x="${xx}" y="418" text-anchor="middle" class="k-num">${mm}</text>`; }
      s += `<text x="${SX + 280}" y="440" text-anchor="middle" class="k-lbl">scale / mm · capillary radius 0.5 mm</text>`;
      s += `<path d="M150 200c-6-40 4-80-2-120" stroke="#3F7A2E" stroke-width="5" fill="none"/>`;
      [[150, 170, -1], [152, 140, 1], [148, 115, -1], [150, 95, 1]].forEach(([lx, ly, d]) => s += `<path d="M${lx} ${ly}q${d*40} ${-30} ${d*70} ${-6}q${-d*36} ${22} ${-d*70} ${6}z" fill="#4E9A3A" stroke="#2F6B22"/>`);
      if(bag) s += `<path d="M70 210C60 120 80 50 150 40C220 50 240 120 230 210Z" fill="rgba(220,235,250,.35)" stroke="var(--txt3)" stroke-dasharray="4 3"/>`;
      if(wind) for(let k = 0; k < wind*3; k++) s += `<path d="M${-40 + ((Date.now()/8 + k*90) % 300)} ${70 + k*30}h40" stroke="var(--txt3)" stroke-width="2" opacity=".6"/>`;
      if(light === "on") s += `<circle cx="420" cy="110" r="22" fill="#FFE27A"/><path d="M398 110h-40M420 88V60" stroke="#FFE27A" stroke-width="3"/>`;
      s += `<text x="560" y="120" class="k-tag">${temp} °C</text>`;
      if(timing !== null) s += `<text x="560" y="150" class="k-read">${Math.min(120, Math.floor(timing))} s</text>`;
      $("#pt-scene").innerHTML = s;
      $("#pt-status").textContent = x > 105 ? "Bubble near the end — open the reservoir tap to reset" : timing !== null ? (done ? "2 minutes up — read the new position" : "Timing 2 minutes…") : x0 === null ? "Read the start position of the right-hand end of the bubble" : "Start the 2-minute timing";
      ctx.readout([["Air", ["still","gentle fan","strong fan"][wind]], ["Bag", bag ? "on" : "off"], ["Light", light], ["Temp", temp + " °C"]]);
    }
    ctx.frame(dt => {
      if(timing !== null && !done){ const h = Math.min(dt*SPEED, 120 - timing); x += rate()/60*h; timing += h; if(timing >= 120){ timing = 120; done = true; } }
      draw();
    });
    const change = () => { timing = null; x0 = null; done = false; startRd.clear(); endRd.clear(); };
    ctx.seg({ label:"Air movement", value:0, options:[[0,"Still"],[1,"Gentle fan"],[2,"Strong fan"]], onChange(v){ wind = v; change(); } });
    ctx.seg({ label:"Plastic bag over shoot (humidity)", value:false, options:[[false,"Off"],[true,"On"]], onChange(v){ bag = v; change(); } });
    ctx.seg({ label:"Lamp", value:"on", options:[["on","On"],["off","Off"]], onChange(v){ light = v; change(); } });
    ctx.slider({ label:"Room temperature", min:15, max:35, step:5, value:20, unit:"°C", onInput(v){ temp = v; change(); } });
    ctx.buttons([{ label:"Open reservoir tap (reset bubble)", onClick(){ x = 5; change(); } }]);
    const startRd = Kit.reading(ctx, "Bubble position now / mm", "e.g. 12.5", () => timing === null ? x : null, .5, v => { x0 = v; ctx.toast("Start position noted — now start timing"); });
    ctx.buttons([{ label:"Start 2-minute timing", primary:true, block:true, onClick(){ if(x0 === null) return ctx.toast("Read the start position first"); if(x > 90) return ctx.toast("Reset the bubble first so it doesn’t run off the scale"); timing = 0; done = false; } }]);
    const endRd = Kit.reading(ctx, "Bubble position after 2 min / mm", "e.g. 20.0", () => done ? x : null, .5, v => {
      const d = v - x0, r = d/2;
      ctx.record({ cond:cond(), T:temp, x0, x1:v, d:Kit.round(d, 1), rate:Kit.round(r, 2), vol:Kit.round(Math.PI*R*R*r, 2) });
      change();
      const rows = ctx.rows();
      if(new Set(rows.map(r => r.cond.split(",")[0])).size >= 3) ctx.complete("wind");
      if(rows.some(r => r.cond.includes("bag on")) && rows.some(r => r.cond.includes("no bag"))) ctx.complete("hum");
    });
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Time runs ×${SPEED}. The bubble is shown frozen at the start and end of the 2 minutes so you can read it to the nearest 0.5 mm.</p>`);
    Kit.answer(ctx, "Your last rate as a volume / mm³ min⁻¹", "e.g. 4.5", v => {
      const r = ctx.rows(); if(!r.length) return [false, "Record a result first."];
      const last = r[r.length - 1], vol = Math.PI*R*R*last.rate;
      if(Math.abs(v - vol) <= .05*vol + .02){ ctx.complete("vol"); return [true, `Correct: π × 0.5² × ${last.rate} = ${vol.toFixed(2)} mm³ min⁻¹.`]; }
      return [false, "Volume = πr² × distance per minute, with r = 0.5 mm."];
    });
    draw();
  }
});
