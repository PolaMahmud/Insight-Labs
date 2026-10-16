"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMISTRY · AS LEVEL (9701 Paper 3) — part 3
   Qualitative analysis (9701 notes: cations, anions, gases) ·
   Organic functional-group tests · Group 2 & Group 17 reactions ·
   Equilibrium shifts and strong/weak acids
══════════════════════════════════════════════════════════════════ */
(function(){
  /* stage with test tubes on the left and an observation card on the right */
  function tubeStage(ctx, id){
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 400" class="kb" id="${id}"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 370)}<g id="${id}-g"></g><text x="24" y="30" class="k-status" id="${id}-s"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#" + id);
    return {
      show(tubes, title, obs, extra){
        let s = tubes.map((t, i) => ChemKit.tube(Object.assign({ id:`${id}-t${i}`, x:150 + i*130, y:140 }, t))).join("");
        if(obs) s += `<g transform="translate(480 70)"><rect width="450" height="${46 + ChemKit.wrap(obs, 56).length*20}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>
          <text x="16" y="26" class="k-tag">Observation</text>${ChemKit.lines(obs, 56, 16, 50, 20, "k-numb")}</g>`;
        if(extra) s += extra;
        svg.querySelector(`#${id}-g`).innerHTML = s;
        svg.querySelector(`#${id}-s`).textContent = title || "";
      }
    };
  }
  /* a grid of test buttons in the controls */
  function testGrid(ctx, label, tests, onTest){
    ctx.html(`<div class="ctl"><div class="lbl"><span>${label}</span></div></div>`);
    const grid = ctx.html(`<div class="ctl" style="display:grid;gap:.35rem"></div>`);
    tests.forEach(([k, name]) => {
      const b = ctx.el(`<button type="button" class="btn small" style="justify-content:flex-start;border-radius:10px;text-align:left">${ctx.esc(name)}</button>`);
      b.onclick = () => onTest(k, name); grid.appendChild(b);
    });
    return grid;
  }
  function idBox(ctx, label, groups, onCheck, onNew){
    const box = ctx.html(`<div class="ctl"><div class="lbl"><span>${label}</span></div>
      <div style="display:flex;gap:.4rem;margin-bottom:.4rem">${groups.map(([nm, opts], i) => `<select class="inp" data-i="${i}" aria-label="${nm}"><option value="">${nm}…</option>${opts.map(o => `<option>${o}</option>`).join("")}</select>`).join("")}</div>
      <div class="btns"><button class="btn small primary" type="button" data-a="check">Check</button><button class="btn small" type="button" data-a="new">New unknown</button></div><div style="margin-top:.5rem" data-fb></div></div>`);
    const fb = box.querySelector("[data-fb]"), sels = [...box.querySelectorAll("select")];
    box.querySelector("[data-a=check]").onclick = () => { const v = sels.map(s => s.value); if(v.some(x => !x)) { fb.innerHTML = `<div class="note bad">Make a choice in every box.</div>`; return; } const [ok, msg] = onCheck(v); fb.innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${msg}</div>`; };
    box.querySelector("[data-a=new]").onclick = () => { sels.forEach(s => s.value = ""); fb.innerHTML = ""; onNew(); };
    return box;
  }

  /* ───────────── AS QUALITATIVE ANALYSIS ───────────── */
  const W = [245,245,245];
  const CAT = {
    "Al³⁺":{ naoh:["white ppt.","white ppt., soluble in excess",W,"dis"], nh3:["white ppt.","white ppt., insoluble in excess",W] },
    "NH₄⁺":{ naoh:["no ppt.","no ppt.",null], nh3:["no ppt.","no ppt.",null], warm:true },
    "Ba²⁺":{ naoh:["faint white ppt. (observed unless [Ba²⁺] is very low)","faint white ppt.",W,"faint"], nh3:["no ppt.","no ppt.",null] },
    "Ca²⁺":{ naoh:["white ppt. (unless [Ca²⁺] is very low)","white ppt., insoluble in excess",W], nh3:["no ppt.","no ppt.",null] },
    "Cr³⁺":{ sol:[100,150,110], naoh:["grey-green ppt.","grey-green ppt. dissolves in excess, giving a dark green solution",[115,140,115],"green"], nh3:["grey-green ppt.","grey-green ppt., insoluble in excess",[115,140,115]] },
    "Cu²⁺":{ sol:[80,150,230], naoh:["pale blue ppt.","pale blue ppt., insoluble in excess",[120,175,235]], nh3:["pale blue ppt.","pale blue ppt. soluble in excess, giving a dark blue solution",[120,175,235],"dblue"] },
    "Fe²⁺":{ sol:[200,230,195], naoh:["green ppt., turning brown on contact with air","green ppt., insoluble in excess; turns brown at the surface",[95,135,85]], nh3:["green ppt., turning brown on contact with air","green ppt., insoluble in excess",[95,135,85]] },
    "Fe³⁺":{ sol:[220,175,80], naoh:["red-brown ppt.","red-brown ppt., insoluble in excess",[160,70,30]], nh3:["red-brown ppt.","red-brown ppt., insoluble in excess",[160,70,30]] },
    "Mg²⁺":{ naoh:["white ppt.","white ppt., insoluble in excess",W], nh3:["white ppt.","white ppt., insoluble in excess",W] },
    "Mn²⁺":{ sol:[245,225,232], naoh:["off-white ppt., rapidly turning brown on contact with air","off-white ppt. turning brown, insoluble in excess",[190,160,120]], nh3:["off-white ppt., rapidly turning brown on contact with air","off-white ppt. turning brown, insoluble in excess",[190,160,120]] },
    "Zn²⁺":{ naoh:["white ppt.","white ppt., soluble in excess",W,"dis"], nh3:["white ppt.","white ppt., soluble in excess",W,"dis"] },
    "Na⁺":{ naoh:["no ppt.","no ppt.",null], nh3:["no ppt.","no ppt.",null] }
  };
  const ANIONS = ["CO₃²⁻","Cl⁻","Br⁻","I⁻","NO₃⁻","NO₂⁻","SO₄²⁻","SO₃²⁻","S₂O₃²⁻"];
  const SALTS = [["Al³⁺","SO₄²⁻"],["Al³⁺","NO₃⁻"],["NH₄⁺","Cl⁻"],["NH₄⁺","CO₃²⁻"],["NH₄⁺","NO₃⁻"],["NH₄⁺","SO₄²⁻"],["Ba²⁺","Cl⁻"],["Ba²⁺","NO₂⁻"],["Ba²⁺","Br⁻"],
    ["Ca²⁺","Cl⁻"],["Ca²⁺","NO₃⁻"],["Cr³⁺","SO₄²⁻"],["Cr³⁺","Cl⁻"],["Cu²⁺","SO₄²⁻"],["Cu²⁺","NO₃⁻"],["Fe²⁺","SO₄²⁻"],["Fe³⁺","Cl⁻"],["Fe³⁺","NO₃⁻"],
    ["Mg²⁺","SO₄²⁻"],["Mg²⁺","Br⁻"],["Mn²⁺","SO₄²⁻"],["Mn²⁺","Cl⁻"],["Zn²⁺","SO₄²⁻"],["Zn²⁺","I⁻"],["Na⁺","CO₃²⁻"],["Na⁺","SO₃²⁻"],["Na⁺","NO₂⁻"],["Na⁺","I⁻"],["Na⁺","Br⁻"],["Na⁺","S₂O₃²⁻"],["NH₄⁺","S₂O₃²⁻"]];
  const GASES = {
    NH3:{ red:"turns blue", blue:"no change", lime:"no change", lit:"no pop; splint goes out", glow:"no change", mno4:"stays purple" },
    CO2:{ red:"no change", blue:"turns red", lime:"white ppt. (milky)", lit:"splint goes out", glow:"no change", mno4:"stays purple" },
    Cl2:{ red:"bleached (turns white)", blue:"turns red, then bleached", lime:"no white ppt.", lit:"splint goes out", glow:"no change", mno4:"stays purple" },
    H2: { red:"no change", blue:"no change", lime:"no change", lit:"squeaky ‘pop’", glow:"no change", mno4:"stays purple" },
    O2: { red:"no change", blue:"no change", lime:"no change", lit:"burns more brightly", glow:"glowing splint relights", mno4:"stays purple" },
    SO2:{ red:"no change", blue:"turns red", lime:"white ppt. (milky)", lit:"splint goes out", glow:"no change", mno4:"purple → colourless" }
  };
  const GAS_NAMES = { NH3:"ammonia", CO2:"carbon dioxide", Cl2:"chlorine", H2:"hydrogen", O2:"oxygen", SO2:"sulfur dioxide" };

  Lab.register({
    id:"as-qualitative", subject:"chemistry", level:["as"], topic:"Qualitative analysis · Ions & gases", interactive:true,
    title:"Qualitative analysis: ions and gases",
    summary:"Every cation, anion, gas and element test in the 9701 (2025–2027) qualitative analysis notes, including Mn²⁺, Cr³⁺, nitrite, sulfite, thiosulfate, high [Ca²⁺] for sulfate and starch for iodine, plus heating a solid in a hard-glass tube. Chlorine and sulfur dioxide are included as extras.",
    aim:"Carry out the tests in the Cambridge 9701 qualitative analysis notes, record observations in the expected wording, and identify the ions in an unknown salt and an unknown gas.",
    variables:null,
    stageTitle:"Test tubes", controlsTitle:"Tests",
    thumb:`<svg viewBox="0 0 300 140"><path d="M90 10 v100 a14 14 0 0 0 28 0 v-100" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M91 60 h26 v50 a13 13 0 0 1 -26 0z" fill="#B4642B"/><path d="M180 10 v100 a14 14 0 0 0 28 0 v-100" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M181 60 h26 v50 a13 13 0 0 1 -26 0z" fill="#2846C8"/></svg>`,
    challenges:[
      { id:"salt3", title:"Three salts", text:"Correctly identify three unknown salts." },
      { id:"tm",    title:"Air oxidation", text:"Identify a salt of Fe²⁺ or Mn²⁺ from the ppt. turning brown." },
      { id:"hal",   title:"Halides", text:"Use aqueous ammonia to tell Cl⁻, Br⁻ and I⁻ apart." },
      { id:"gas3",  title:"Three gases", text:"Identify three unknown gases." },
      { id:"no2",   title:"Nitrite or nitrate?", text:"Identify a nitrite: both give NH₃ with Al foil, but only nitrite decolourises acidified KMnO₄." },
      { id:"s2o3",  title:"Thiosulfate", text:"Identify a thiosulfate from the slow off-white / pale yellow ppt. with acid." },
      { id:"i2",    title:"Iodine with starch", text:"Oxidise an iodide with acidified KMnO₄, then show the iodine with starch." }
    ],
    columns:[{key:"n",label:"Unknown"},{key:"test",label:"Test"},{key:"obs",label:"Observation"}],
    questions:[
      { q:"FA 1 gives a white ppt. with NaOH(aq) that dissolves in excess, and a white ppt. with NH₃(aq) that is insoluble in excess. Identify the cation.",
        a:"Al³⁺. Zn²⁺ would also dissolve in excess NH₃(aq)." },
      { q:"How do you distinguish Mg²⁺ from Ca²⁺ and Ba²⁺?",
        a:"Add NH₃(aq): Mg²⁺ gives a white ppt.; Ca²⁺ and Ba²⁺ give none. With NaOH(aq), Ca²⁺ gives a white ppt. but Ba²⁺ only a faint one. Dilute H₂SO₄ gives a dense white ppt. with Ba²⁺." },
      { q:"Why is the aluminium foil test for nitrate not conclusive if NH₄⁺ is present?",
        a:"Warming NH₄⁺ with NaOH(aq) gives ammonia by itself. Warm with NaOH(aq) first until no more NH₃ is given off, then add the foil." },
      { q:"How do sulfate and sulfite differ with Ba²⁺(aq)?",
        a:"Both give a white ppt. BaSO₄ is insoluble in excess dilute strong acid; BaSO₃ dissolves. Sulfite also gives SO₂ on warming with dilute acid, which turns acidified KMnO₄(aq) colourless." },
      { q:"How do you tell a nitrite from a nitrate?",
        a:"Both give NH₃ when warmed with NaOH(aq) and aluminium foil. Only nitrite decolourises acidified aqueous KMnO₄. (With dilute acid a nitrite also gives colourless NO, which turns pale brown in air.)" },
      { q:"How do you test for sulfate without a barium salt, and what does thiosulfate do with acid?",
        a:"Sulfate gives a white ppt. with a high concentration of Ca²⁺(aq). Thiosulfate gives an off-white / pale yellow ppt. of sulfur slowly with H⁺." },
      { q:"After adding acidified KMnO₄(aq) to FA 3 the solution turns brown. How do you confirm iodine?",
        a:"Add starch solution: iodine gives a blue-black colour. This shows FA 3 contained iodide, which was oxidised to I₂." },
      { q:"Why heat a solid in a hard-glass test-tube, and what safety step does the syllabus mention?",
        a:"Hard glass withstands strong heating. Hold the tube in a test-tube holder, point it away from people, and heat gently at first. Look for condensation (water of crystallisation), gases (test them) and colour changes." },
      { q:"Why do you write ‘ppt.’ and describe colour, and say ‘no change’ rather than leaving a blank?",
        a:"Examiners need a full observation: colour, what forms (ppt., solution, gas) and whether it dissolves in excess. ‘No change’ or ‘no ppt.’ is itself an observation and earns credit." }
    ],
    setup(ctx){
      let mode = "salt", unknown, num = 0, gas, gnum = 0, afterAg = false, afterBa = false, afterMn = false, salts = 0, gasesOk = 0;
      const HYD = ["Al³⁺","Cr³⁺","Cu²⁺","Fe²⁺","Fe³⁺","Mg²⁺","Mn²⁺","Zn²⁺","Ca²⁺"];
      const st = tubeStage(ctx, "qa-svg");
      const solOf = () => CAT[unknown[0]].sol || null;
      function result(k){
        const [cat, an] = unknown, c = CAT[cat], out = { sol:solOf() };
        switch(k){
          case "naoh1": case "naoh2": case "nh31": case "nh32": {
            const d = c[k.slice(0, -1)], ex = k.endsWith("2"); out.obs = d[ex ? 1 : 0];
            if(d[2] && !(ex && (d[3] === "dis" || d[3] === "green" || d[3] === "dblue"))){ out.ppt = d[2]; out.pptAmount = d[3] === "faint" ? .15 : 1; }
            if(ex && d[3] === "green") out.sol = [40,110,60]; if(ex && d[3] === "dblue") out.sol = [25,60,200]; if(ex && d[3] === "dis") out.sol = null;
            break; }
          case "warm": out.obs = c.warm ? "gas given off; it turns damp red litmus blue (NH₃)" : "no ammonia given off (damp red litmus stays red)"; if(c.warm) out.fumes = [200,200,210];
            if(c.naoh[2]){ out.ppt = c.naoh[2]; out.obs = c.naoh[0] + "; " + out.obs; } break;
          case "acid":
            if(an === "CO₃²⁻"){ out.bubbles = true; out.obs = "effervescence; gas gives a white ppt. with limewater (CO₂)"; }
            else if(an === "NO₂⁻"){ out.bubbles = true; out.fumes = [190,120,60]; out.obs = "colourless gas given off, turning pale brown in air (NO → NO₂)"; }
            else if(an === "SO₃²⁻"){ out.bubbles = true; out.obs = "on warming, gas given off that turns acidified KMnO₄(aq) from purple to colourless (SO₂)"; }
            else if(an === "S₂O₃²⁻"){ out.ppt = [245,235,170]; out.suspend = true; out.pptAmount = .7; out.obs = "off-white / pale yellow ppt. forms slowly (sulfur)"; }
            else out.obs = "no effervescence, no change";
            break;
          case "ag": afterAg = true;
            if(an === "Cl⁻"){ out.ppt = W; out.obs = "white ppt."; } else if(an === "Br⁻"){ out.ppt = [240,228,185]; out.obs = "cream / off-white ppt."; } else if(an === "I⁻"){ out.ppt = [245,222,90]; out.obs = "pale yellow ppt."; }
            else if(an === "S₂O₃²⁻"){ out.ppt = [245,235,170]; out.suspend = true; out.pptAmount = .5; out.obs = "slowly turns cloudy off-white / pale yellow (the nitric acid makes sulfur); no silver halide ppt."; } else out.obs = "no ppt.";
            break;
          case "agnh3":
            if(!afterAg){ out.obs = "Do the AgNO₃ test first, then add NH₃(aq) to the ppt."; break; }
            if(an === "Cl⁻"){ out.sol = null; out.obs = "white ppt. dissolves in NH₃(aq), giving a colourless solution"; }
            else if(an === "Br⁻"){ out.ppt = [240,228,185]; out.pptAmount = .45; out.obs = "cream / off-white ppt. is partially soluble in NH₃(aq)"; }
            else if(an === "I⁻"){ out.ppt = [245,222,90]; out.obs = "pale yellow ppt. is insoluble in NH₃(aq)"; }
            else out.obs = "no ppt. to test";
            break;
          case "ba": afterBa = true;
            if(an === "SO₄²⁻" || an === "SO₃²⁻" || an === "CO₃²⁻"){ out.ppt = W; out.obs = "white ppt."; } else out.obs = "no ppt.";
            break;
          case "baacid":
            if(!afterBa){ out.obs = "Do the Ba²⁺(aq) test first, then add excess dilute HCl."; break; }
            if(an === "SO₄²⁻"){ out.ppt = W; out.obs = "white ppt. is insoluble in excess dilute strong acid"; }
            else if(an === "SO₃²⁻"){ out.obs = "white ppt. dissolves in excess dilute strong acid"; }
            else if(an === "CO₃²⁻"){ out.bubbles = true; out.obs = "white ppt. dissolves with effervescence"; }
            else out.obs = "no ppt. to test";
            break;
          case "ca":
            if(an === "SO₄²⁻" || an === "SO₃²⁻" || an === "CO₃²⁻"){ out.ppt = W; out.obs = "white ppt."; } else out.obs = "no ppt.";
            break;
          case "al":
            out.obs = an === "NO₃⁻" || an === "NO₂⁻" || cat === "NH₄⁺" ? "on warming, gas given off that turns damp red litmus blue (NH₃)" : "no ammonia given off";
            if(c.naoh[2]){ out.ppt = c.naoh[2]; out.obs = c.naoh[1] + "; " + out.obs; }
            break;
          case "mno4":
            afterMn = true;
            if(an === "SO₃²⁻" || an === "NO₂⁻" || an === "S₂O₃²⁻" || cat === "Fe²⁺"){ out.sol = cat === "Fe²⁺" ? [225,200,110] : null; out.obs = "acidified KMnO₄(aq) is decolourised (purple → colourless)" + (cat === "Fe²⁺" ? "; solution turns pale yellow (Fe³⁺)" : ""); }
            else if(an === "I⁻"){ out.sol = [150,75,20]; out.obs = "purple colour goes; solution turns brown (I₂ formed)"; }
            else { out.sol = [150,40,160]; out.obs = "stays purple"; }
            break;
          case "starch":
            if(afterMn && an === "I⁻"){ out.sol = [20,25,75]; out.solA = .92; out.obs = "blue-black colour (I₂ present)"; }
            else if(afterMn){ out.sol = [150,40,160]; out.obs = "no blue-black colour (no I₂)"; }
            else out.obs = "no blue-black colour (no I₂). Try adding acidified KMnO₄(aq) first, then starch.";
            break;
          case "heat": out.sol = null; out.fill = .1; {
            const hyd = HYD.includes(cat) && an !== "CO₃²⁻";
            if(cat === "NH₄⁺") out.obs = { "Cl⁻":"white solid sublimes and re-forms on the cooler part of the tube", "NO₃⁻":"solid melts, then gives off a colourless gas, leaving no residue", "CO₃²⁻":"solid disappears; gases turn damp red litmus blue (NH₃) and limewater milky (CO₂)", "S₂O₃²⁻":"gives off NH₃ (damp red litmus turns blue); yellow sulfur residue" }[an] || "gives off NH₃ (damp red litmus turns blue)";
            else if(an === "NO₃⁻") out.obs = `${hyd ? "condensation at the top of the tube; " : ""}brown gas given off (NO₂) and a glowing splint relights (O₂)${cat === "Cu²⁺" ? "; black residue (CuO)" : cat === "Fe³⁺" ? "; red-brown residue (Fe₂O₃)" : ""}`;
            else if(cat === "Cu²⁺" && an === "SO₄²⁻") out.obs = "blue crystals turn white; condensation (water) at the top of the tube";
            else if(hyd) out.obs = "condensation (water of crystallisation) forms at the top of the tube";
            else if(an === "S₂O₃²⁻") out.obs = "crystals melt in their own water of crystallisation; condensation at the top of the tube";
            else out.obs = "no change";
            if(out.obs.startsWith("condensation") || out.obs.includes("condensation")) out.fumes = [225,232,240];
            break; }
        }
        return out;
      }
      const TESTS = [["naoh1","NaOH(aq), a few drops"],["naoh2","NaOH(aq), in excess"],["warm","Warm with NaOH(aq); damp red litmus"],["nh31","NH₃(aq), a few drops"],["nh32","NH₃(aq), in excess"],
        ["acid","Dilute HCl (warm); test any gas"],["ag","Dilute HNO₃ then AgNO₃(aq)"],["agnh3","…then NH₃(aq) to the silver ppt."],["ba","Ba(NO₃)₂(aq) or BaCl₂(aq)"],["baacid","…then excess dilute HCl"],["ca","Ca²⁺(aq), high concentration"],
        ["al","NaOH(aq) + Al foil, warm; damp red litmus"],["mno4","Acidified KMnO₄(aq), a few drops"],["starch","…then starch solution"],["heat","Heat the solid in a hard-glass test-tube"]];
      const GTESTS = [["red","Damp red litmus"],["blue","Damp blue litmus"],["lime","Bubble through limewater"],["lit","Lighted splint"],["glow","Glowing splint"],["mno4","Acidified KMnO₄(aq) paper"]];
      const saltBox = ctx.html(`<div></div>`), gasBox = ctx.html(`<div></div>`);
      ctx.controls.insertBefore(ctx.seg({ label:"Unknown", value:mode, options:[["salt","Salt solution"],["gas","Gas sample"]], onChange(v){ mode = v; sync(); } }).node, saltBox);
      testGrid(ctx, "Tests on the solution", TESTS, (k, name) => {
        const r = result(k);
        st.show([{ sol:r.sol, solA:r.solA, fill:r.fill, ppt:r.ppt, pptAmount:r.pptAmount, suspend:r.suspend, bubbles:r.bubbles, fumes:r.fumes, label:"FA " + num }], `Unknown salt FA ${num}`, r.obs);
        ctx.readout([["Test", name], ["Observation", r.obs]]);
        ctx.record({ n:"FA " + num, test:name, obs:r.obs }, true);
      });
      const saltParts = [...ctx.controls.children].slice(-2); saltParts.forEach(n => saltBox.appendChild(n));
      idBox(ctx, "Identify the salt", [["Cation", Object.keys(CAT)], ["Anion", ANIONS]], ([c, a]) => {
        const ok = c === unknown[0] && a === unknown[1];
        if(ok){ salts++; if(salts >= 3) ctx.complete("salt3"); if(c === "Fe²⁺" || c === "Mn²⁺") ctx.complete("tm"); if(["Cl⁻","Br⁻","I⁻"].includes(a) && ctx.rows().some(r => r.n === "FA " + num && r.test.startsWith("…then NH₃"))) ctx.complete("hal"); if(a === "NO₂⁻") ctx.complete("no2"); if(a === "S₂O₃²⁻") ctx.complete("s2o3"); if(a === "I⁻" && ctx.rows().some(r => r.n === "FA " + num && r.test.startsWith("…then starch") && r.obs.startsWith("blue-black"))) ctx.complete("i2"); }
        return ok ? [true, `Correct — FA ${num} contains ${unknown[0]} and ${unknown[1]}.`] : [false, `Cation ${c === unknown[0] ? "✓" : "✗"} · anion ${a === unknown[1] ? "✓" : "✗"}. Compare your observations with the notes.`];
      }, newSalt);
      saltBox.appendChild(ctx.controls.lastElementChild);
      testGrid(ctx, "Tests on the gas", GTESTS, (k, name) => {
        const o = GASES[gas][k];
        const sol = k === "lime" ? (o.startsWith("white") ? [240,240,240] : [235,240,245]) : k === "mno4" ? (o.includes("colourless") ? null : [150,40,160]) : null;
        st.show([{ sol, solA:k === "lime" && o.startsWith("white") ? .9 : .6, bubbles:k === "lime" || k === "mno4", label:"gas G" + gnum }], `Unknown gas G${gnum}`, `${name}: ${o}`);
        ctx.record({ n:"G" + gnum, test:name, obs:o }, true);
      });
      const gasParts = [...ctx.controls.children].slice(-2); gasParts.forEach(n => gasBox.appendChild(n));
      idBox(ctx, "Identify the gas", [["Gas", Object.values(GAS_NAMES)]], ([g]) => {
        const ok = g === GAS_NAMES[gas]; if(ok && ++gasesOk >= 3) ctx.complete("gas3");
        return ok ? [true, `Correct — G${gnum} is ${GAS_NAMES[gas]}.`] : [false, "Not that one. Which single test is unique to each gas?"];
      }, newGas);
      gasBox.appendChild(ctx.controls.lastElementChild);
      function newSalt(){ let n; do{ n = SALTS[Math.floor(Math.random()*SALTS.length)]; }while(unknown && n === unknown); unknown = n; num++; afterAg = afterBa = afterMn = false;
        st.show([{ sol:solOf(), label:"FA " + num }], `Unknown salt FA ${num}`, `FA ${num} is a ${solOf() ? "coloured" : "colourless"} solution. Choose a test.`); }
      function newGas(){ const ks = Object.keys(GASES); let g; do{ g = ks[Math.floor(Math.random()*ks.length)]; }while(g === gas); gas = g; gnum++;
        st.show([{ sol:null, fill:.02, label:"gas G" + gnum }], `Unknown gas G${gnum}`, "A colourless gas in a stoppered tube. Choose a test."); }
      function sync(){ saltBox.style.display = mode === "salt" ? "" : "none"; gasBox.style.display = mode === "gas" ? "" : "none"; mode === "salt" ? st.show([{ sol:solOf(), label:"FA " + num }], `Unknown salt FA ${num}`, "Choose a test.") : st.show([{ sol:null, fill:.02, label:"gas G" + gnum }], `Unknown gas G${gnum}`, "Choose a test."); }
      num = ctx.rows().filter(r => String(r.n).startsWith("FA")).length ? Math.max(...ctx.rows().filter(r => String(r.n).startsWith("FA")).map(r => +String(r.n).slice(3) || 0)) : 0;
      newGas(); newSalt(); sync();
    }
  });

  /* ───────────── ORGANIC TESTS ───────────── */
  const ORG = {
    "cyclohexene":            { cls:"alkene", br:1, mno4:1 },
    "hexane":                 { cls:"alkane" },
    "ethanol":                { cls:"primary alcohol", cr:1, iod:1, na:1, pcl5:1 },
    "propan-1-ol":            { cls:"primary alcohol", cr:1, na:1, pcl5:1 },
    "butan-1-ol":             { cls:"primary alcohol", cr:1, na:1, pcl5:1 },
    "2-methylpropan-1-ol":    { cls:"primary alcohol", cr:1, na:1, pcl5:1 },
    "propan-2-ol":            { cls:"secondary alcohol", cr:1, iod:1, na:1, pcl5:1 },
    "butan-2-ol":             { cls:"secondary alcohol", cr:1, iod:1, na:1, pcl5:1 },
    "2-methylpropan-2-ol":    { cls:"tertiary alcohol", na:1, pcl5:1 },
    "ethanal":                { cls:"aldehyde", cr:1, dnph:1, tol:1, feh:1, iod:1 },
    "propanal":               { cls:"aldehyde", cr:1, dnph:1, tol:1, feh:1 },
    "glucose (aqueous)":      { cls:"aldehyde (sugar)", cr:1, tol:1, feh:1 },
    "propanone":              { cls:"ketone", dnph:1, iod:1 },
    "pentan-3-one":           { cls:"ketone", dnph:1 },
    "ethanoic acid":          { cls:"carboxylic acid", co3:1, na:1, pcl5:1 },
    "methanoic acid":         { cls:"carboxylic acid", co3:1, na:1, pcl5:1, cr:1, tol:1, feh:1 },
    "ethanedioic acid (aqueous)":{ cls:"dicarboxylic acid", co3:1, mno4:1 },
    "ethyl ethanoate":        { cls:"ester" },
    "1-chlorobutane":         { cls:"halogenoalkane", hal:"Cl", t:420 },
    "1-bromobutane":          { cls:"halogenoalkane", hal:"Br", t:140 },
    "1-iodobutane":           { cls:"halogenoalkane", hal:"I", t:35 },
    "2-bromo-2-methylpropane":{ cls:"halogenoalkane", hal:"Br", t:6 }
  };
  /* what you see on shaking 1 cm³ with 3 cm³ of water (default: mixes completely) */
  const WAT = { "cyclohexene":"top", "hexane":"top", "butan-1-ol":"part", "2-methylpropan-1-ol":"part", "pentan-3-one":"part", "ethyl ethanoate":"ester",
    "1-chlorobutane":"bottom", "1-bromobutane":"bottom", "1-iodobutane":"bottom", "2-bromo-2-methylpropane":"bottom" };
  const OT = [
    ["wat","Shake with water; smell cautiously"],    ["br","Bromine water, shake"],["mno4","Acidified KMnO₄(aq), warm"],["cr","Acidified K₂Cr₂O₇(aq), warm"],["dnph","2,4-DNPH reagent"],["tol","Tollens’ reagent, warm"],
    ["feh","Fehling’s solution, warm"],["iod","Alkaline I₂(aq), warm"],["co3","Na₂CO₃(aq)"],["na","Sodium metal (dry sample)"],["pcl5","PCl₅ (fume cupboard)"],
    ["hyd","Warm with NaOH(aq), acidify (HNO₃), add AgNO₃(aq)"],["agrate","AgNO₃ in ethanol at 50 °C — time the ppt."]
  ];
  function orgResult(c, k){
    const o = ORG[c], r = {};
    switch(k){
      case "wat": { const w = WAT[c];
        r.obs = w === "top" ? "does not mix: a colourless layer floats on top" : w === "bottom" ? "does not mix: a dense colourless layer sinks to the bottom" : w === "part" ? "partly mixes; two layers remain" : w === "ester" ? "partly mixes; two layers remain; sweet, fruity smell" : "mixes completely with water";
        if(w === "top" || w === "part" || w === "ester") r.layer = [250,240,200]; if(w === "bottom"){ r.sol = [250,240,200]; r.solA = .5; r.fill = .3; } break; }
      case "br": if(o.br){ r.sol = null; r.obs = "orange bromine water is decolourised"; } else { r.sol = [235,150,40]; r.obs = "stays orange"; } break;
      case "mno4": if(o.mno4 || o.br || o.cr){ r.sol = null; r.obs = "purple solution turns colourless (compound oxidised)"; } else { r.sol = [150,40,160]; r.obs = "stays purple"; } break;
      case "cr": if(o.cr){ r.sol = [50,140,80]; r.obs = "orange solution turns green"; } else { r.sol = [235,130,30]; r.obs = "stays orange"; } break;
      case "dnph": if(o.dnph){ r.sol = [245,190,60]; r.ppt = [235,120,30]; r.obs = "orange ppt."; } else { r.sol = [245,190,60]; r.obs = "no ppt.; solution stays yellow-orange"; } break;
      case "tol": if(o.tol){ r.mirror = 1; r.ppt = [60,60,60]; r.pptAmount = .4; r.obs = "silver mirror / black ppt. forms"; } else r.obs = "no silver mirror; stays colourless"; break;
      case "feh": if(o.feh){ r.sol = [60,110,220]; r.ppt = [190,60,30]; r.obs = "blue solution gives an orange / red ppt."; } else { r.sol = [60,110,220]; r.obs = "stays blue; no ppt."; } break;
      case "iod": if(o.iod){ r.ppt = [250,225,80]; r.obs = "yellow ppt. (CHI₃) with an antiseptic smell"; } else { r.sol = [235,190,110]; r.obs = "no ppt."; } break;
      case "co3": if(o.co3){ r.bubbles = 1; r.obs = "effervescence; gas turns limewater milky (CO₂)"; } else r.obs = "no effervescence"; break;
      case "na": if(o.na){ r.bubbles = 1; r.obs = "effervescence; gas pops with a lighted splint (H₂)"; } else r.obs = "no reaction"; break;
      case "pcl5": if(o.pcl5){ r.fumes = [235,235,235]; r.obs = "steamy white fumes (HCl) that turn damp blue litmus red"; } else r.obs = "no steamy fumes"; break;
      case "hyd": if(o.hal){ r.ppt = { Cl:W, Br:[240,228,185], I:[245,222,90] }[o.hal]; r.obs = { Cl:"white", Br:"cream", I:"yellow" }[o.hal] + " ppt."; } else r.obs = "no ppt."; break;
      case "agrate": if(o.hal){ r.ppt = { Cl:W, Br:[240,228,185], I:[245,222,90] }[o.hal]; r.suspend = 1; r.pptAmount = .5; const t = Math.round(o.t*(1 + .08*(Math.random() - .5)));
        r.obs = `${{ Cl:"white", Br:"cream", I:"yellow" }[o.hal]} ppt. appears after ${t} s`; r.time = t; } else r.obs = "no ppt. after 10 minutes"; break;
    }
    return r;
  }
  Lab.register({
    id:"as-organic", subject:"chemistry", level:["as"], topic:"Organic chemistry · Functional-group tests", interactive:true,
    title:"Organic functional-group tests",
    summary:"The four tests the 9701 syllabus requires (Fehling’s, Tollens’, alkaline iodine and acidified KMnO₄ for anything oxidisable) plus bromine water, dichromate, 2,4-DNPH, Na₂CO₃, sodium, PCl₅ and silver nitrate. Covers the listed alcohols, propanal, propanone, glucose, methanoic and ethanedioic acids, ethyl ethanoate and the halogenobutanes.",
    aim:"Use the AS tests for alkenes, alcohols, aldehydes, ketones, carboxylic acids and halogenoalkanes to identify unknown organic compounds.",
    variables:null,
    stageTitle:"Test tubes", controlsTitle:"Tests",
    thumb:`<svg viewBox="0 0 300 140"><path d="M70 10 v100 a14 14 0 0 0 28 0 v-100" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M71 60 h26 v50 a13 13 0 0 1 -26 0z" fill="#3A9A5A"/><path d="M140 10 v100 a14 14 0 0 0 28 0 v-100" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="141" y="55" width="4" height="60" fill="#C9CED6"/><rect x="163" y="55" width="4" height="60" fill="#C9CED6"/><path d="M210 10 v100 a14 14 0 0 0 28 0 v-100" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M211 90 h26 v20 a13 13 0 0 1 -26 0z" fill="#E87A20"/></svg>`,
    challenges:[
      { id:"five", title:"Five unknowns", text:"Correctly identify five unknown compounds." },
      { id:"alc",  title:"Alcohol class", text:"Identify a tertiary alcohol." },
      { id:"carb", title:"Aldehyde or ketone", text:"Identify an aldehyde and a ketone." },
      { id:"rate", title:"Hydrolysis rates", text:"Time the AgNO₃/ethanol test for three halogenoalkanes." }
    ],
    columns:[{key:"n",label:"Unknown"},{key:"test",label:"Test"},{key:"obs",label:"Observation"}],
    questions:[
      { q:"An unknown gives an orange ppt. with 2,4-DNPH but no silver mirror with Tollens’ reagent. What is it?",
        a:"A ketone. 2,4-DNPH shows a C=O group; a negative Tollens’ test rules out an aldehyde." },
      { q:"How do you distinguish primary, secondary and tertiary alcohols?",
        a:"Warm with acidified K₂Cr₂O₇: primary and secondary turn it green; tertiary do not. Distil off the product of a primary/secondary alcohol and test with Tollens’: an aldehyde (from a primary alcohol) gives a silver mirror." },
      { q:"Which structures give a positive alkaline iodine (tri-iodomethane) test?",
        a:"CH₃CO– (methyl ketones and ethanal) and CH₃CH(OH)– (ethanol and secondary alcohols with a methyl group next to the C–OH)." },
      { q:"Why is the halogenoalkane warmed with NaOH(aq) and then acidified with dilute nitric acid before adding AgNO₃(aq)?",
        a:"NaOH(aq) hydrolyses the C–X bond, releasing X⁻. Nitric acid neutralises excess OH⁻, which would otherwise give a brown Ag₂O precipitate." },
      { q:"Explain the order of hydrolysis rates: 1-iodobutane > 1-bromobutane > 1-chlorobutane.",
        a:"The C–I bond is the weakest (lowest bond energy), so it breaks most easily. Bond strength matters more than bond polarity here." },
      { q:"Why is 2-bromo-2-methylpropane hydrolysed much faster than 1-bromobutane?",
        a:"It is tertiary and reacts by the SN1 mechanism via a stable tertiary carbocation." },
      { q:"Which of the unknowns decolourise acidified KMnO₄, and what does that show?",
        a:"Anything that can be oxidised: alkenes, primary and secondary alcohols, aldehydes (including glucose), methanoic acid and ethanedioic acid (on warming). Tertiary alcohols, ketones, ethanoic acid, esters and alkanes leave it purple." },
      { q:"Why do methanoic acid and glucose give positive Fehling’s and Tollens’ tests?",
        a:"Methanoic acid, HCOOH, contains an H–C=O group and is oxidised to CO₂ and water. Glucose has an aldehyde group, which is why the syllabus allows it as a substitute for an aldehyde." },
      { q:"Why should a water bath (not a Bunsen) be used to warm organic liquids?",
        a:"Most are volatile and flammable. A water bath from a kettle avoids naked flames." }
    ],
    setup(ctx){
      const names = Object.keys(ORG);
      let unk, num = Math.max(0, ...ctx.rows().map(r => +String(r.n).replace(/\D/g, "") || 0)), ok = 0;
      const st = tubeStage(ctx, "og-svg");
      testGrid(ctx, "Tests (a fresh sample each time)", OT, (k, name) => {
        const r = orgResult(unk, k);
        st.show([Object.assign({ label:"FA " + num }, r)], `Unknown FA ${num}`, r.obs);
        ctx.readout([["Test", name], ["Observation", r.obs]]);
        ctx.record({ n:"FA " + num, test:name, obs:r.obs }, true);
        if(k === "agrate" && r.time){ const timed = new Set(ctx.rows().filter(x => x.test.startsWith("AgNO₃ in ethanol") && /after \d+ s/.test(x.obs)).map(x => x.n)); if(timed.size >= 3) ctx.complete("rate"); }
      });
      const got = new Set();
      idBox(ctx, "Identify the compound", [["Compound", names]], ([c]) => {
        if(c !== unk){ return [false, ORG[c].cls === ORG[unk].cls ? "Right functional group, wrong compound — look at the iodoform test or the rate." : "Not that one. Which functional group do your results show?"]; }
        ok++; if(ok >= 5) ctx.complete("five");
        if(ORG[c].cls === "tertiary alcohol") ctx.complete("alc");
        got.add(ORG[c].cls); if(got.has("aldehyde") && got.has("ketone")) ctx.complete("carb");
        return [true, `Correct — FA ${num} is ${c} (${ORG[c].cls}).`];
      }, next);
      function next(){ let n; do{ n = names[Math.floor(Math.random()*names.length)]; }while(n === unk); unk = n; num++;
        st.show([{ sol:null, label:"FA " + num }], `Unknown FA ${num}`, `FA ${num} is a colourless organic liquid. Choose a test.`); }
      next();
    }
  });

  /* ───────────── GROUP 2 & GROUP 17 ───────────── */
  const G = {
    disp:{ name:"Halogen displacement (+ cyclohexane)", rows:["KCl(aq)","KBr(aq)","KI(aq)"], cols:["Cl₂(aq)","Br₂(aq)","I₂(aq)"],
      res(r, c){ const X = ["Cl","Br","I"], h = X[c], x = X[r];
        const lay = { Cl:[220,235,170], Br:[230,130,40], I:[150,60,170] }, aq = { Cl:[225,238,200], Br:[235,170,60], I:[150,85,30] };
        const react = X.indexOf(h) < X.indexOf(x), out = react ? x : h;
        return { sol:aq[out], layer:lay[out], obs: react ? `reaction: aqueous layer turns ${out === "Br" ? "orange" : "brown"}; cyclohexane layer ${out === "Br" ? "orange" : "purple"} (${out}₂ formed)` : `no reaction: colours are those of ${h}₂ — cyclohexane layer ${h === "Cl" ? "very pale green" : h === "Br" ? "orange" : "purple"}` }; } },
    h2so4:{ name:"Solid halide + conc. H₂SO₄", rows:["NaCl(s)","NaBr(s)","NaI(s)"], cols:["conc. H₂SO₄"],
      res(r){ return [{ fumes:[235,235,235], obs:"steamy white fumes of HCl (turn damp blue litmus red)" },
        { fumes:[200,110,40], sol:[220,140,60], obs:"steamy fumes (HBr) and orange-brown vapour of Br₂; SO₂ also formed" },
        { fumes:[150,70,170], ppt:[40,30,40], obs:"steamy fumes, purple vapour (I₂), black solid; yellow solid (S) and a smell of bad eggs (H₂S)" }][r]; } },
    agnh3:{ name:"Silver halides + aqueous ammonia", rows:["AgCl ppt.","AgBr ppt.","AgI ppt."], cols:["dilute NH₃(aq)","conc. NH₃(aq)"],
      res(r, c){ const p = [W,[240,228,185],[245,222,90]][r], dis = r === 0 || (r === 1 && c === 1);
        return dis ? { obs:`ppt. dissolves${r === 1 ? " (only in concentrated ammonia)" : ""}` } : { ppt:p, obs:`ppt. ${r === 1 ? "only partially soluble / insoluble in dilute NH₃" : "insoluble"}` }; } },
    g2sol:{ name:"Group 2 hydroxides & sulfates", rows:["Mg²⁺(aq)","Ca²⁺(aq)","Sr²⁺(aq)","Ba²⁺(aq)"], cols:["NaOH(aq)","dilute H₂SO₄"],
      res(r, c){ const a = c === 0 ? [1, .45, .2, .05][r] : [0, .2, .65, 1][r];
        return a ? { ppt:W, pptAmount:a, obs: a > .8 ? "dense white ppt." : a > .4 ? "white ppt." : a > .1 ? "slight white ppt." : "faint white ppt. / very little" } : { obs:"no ppt." }; } },
    g2co3:{ name:"Heating Group 2 carbonates (limewater)", rows:["MgCO₃","CaCO₃","SrCO₃","BaCO₃"], cols:["heat strongly"],
      res(r){ const t = [25, 140, 420, null][r]; return t ? { sol:[238,240,240], solA:.9, obs:`limewater turns milky after about ${Math.round(t*(1 + .1*(Math.random() - .5)))} s`, time:t } : { obs:"limewater still clear after 10 minutes of Bunsen heating" }; } },
    g2h2o:{ name:"Group 2 metals + water", rows:["Mg ribbon","Ca granule"], cols:["cold water","steam (Mg only)"],
      res(r, c){ if(r === 0) return c === 0 ? { bubbles:1, obs:"a few bubbles on the ribbon very slowly (days to collect much H₂)" } : { obs:"burns with a bright white light in steam; white solid MgO; H₂ formed" };
        return c === 0 ? { bubbles:1, sol:[245,245,245], solA:.75, obs:"steady effervescence; tube warms; solution turns cloudy white (Ca(OH)₂)" } : { obs:"not done — calcium reacts readily with cold water" }; } }
  };
  Lab.register({
    id:"as-groups", subject:"chemistry", level:["as"], topic:"Inorganic · Group 2 & Group 17", interactive:true,
    title:"Group 2 and Group 17 reactions",
    summary:"Halogen displacement with a cyclohexane layer, halides with concentrated sulfuric acid, silver halides in ammonia, Group 2 solubility trends, carbonate thermal stability and metals with water.",
    aim:"Observe the reactions in the AS Group 2 and Group 17 topics and explain the trends down each group.",
    variables:null,
    stageTitle:"Test tubes", controlsTitle:"Reactions",
    thumb:`<svg viewBox="0 0 300 140"><path d="M100 10 v100 a14 14 0 0 0 28 0 v-100" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="101" y="56" width="26" height="14" fill="#9A3CAA"/><path d="M101 70 h26 v40 a13 13 0 0 1 -26 0z" fill="#A0561E" opacity=".8"/><path d="M170 10 v100 a14 14 0 0 0 28 0 v-100" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="171" y="56" width="26" height="14" fill="#E6862C"/><path d="M171 70 h26 v40 a13 13 0 0 1 -26 0z" fill="#E9B060" opacity=".8"/></svg>`,
    challenges:[
      { id:"disp",  title:"Displacement grid", text:"Try all nine halogen/halide combinations." },
      { id:"h2so4", title:"Reducing power", text:"React all three sodium halides with concentrated sulfuric acid." },
      { id:"g2",    title:"Group 2 trends", text:"Complete the hydroxide and sulfate solubility grid." },
      { id:"stab",  title:"Thermal stability", text:"Heat all four Group 2 carbonates." }
    ],
    columns:[{key:"exp",label:"Experiment"},{key:"what",label:"Substance + reagent"},{key:"obs",label:"Observation"}],
    questions:[
      { q:"Why is cyclohexane added in the displacement experiments?",
        a:"Halogens are more soluble in the non-polar organic layer and show distinctive colours there: Cl₂ pale green, Br₂ orange, I₂ purple. This makes the product halogen easy to identify." },
      { q:"Explain the trend in oxidising power of the halogens.",
        a:"Down the group the atoms are larger with more shielding, so the attraction for an extra electron is weaker. Cl₂ > Br₂ > I₂ as oxidising agents; a halogen displaces any halide below it." },
      { q:"Why does NaI give H₂S with concentrated H₂SO₄ but NaCl does not?",
        a:"I⁻ is the strongest reducing agent of the halides (largest ion, outer electron most easily lost), so it reduces H₂SO₄ all the way to H₂S (S oxidation number +6 → −2). Cl⁻ is too weak to reduce H₂SO₄ at all." },
      { q:"Describe the trends in solubility of Group 2 hydroxides and sulfates.",
        a:"Hydroxides become more soluble down the group (Mg(OH)₂ least soluble). Sulfates become less soluble down the group (BaSO₄ is insoluble)." },
      { q:"Why does the thermal stability of the Group 2 carbonates increase down the group?",
        a:"The cation gets larger with the same charge, so its charge density falls. It polarises (distorts) the carbonate ion's electron cloud less, so the C–O bonds are weakened less and more heat is needed." },
      { q:"How could the carbonate experiment be made a fairer test?",
        a:"Use the same number of moles of each carbonate, the same volume of limewater, the same Bunsen flame height and the same distance from the flame." }
    ],
    setup(ctx){
      let ek = "disp";
      const st = tubeStage(ctx, "gp-svg");
      const done = {};
      ctx.select({ label:"Experiment", value:ek, options:Object.keys(G).map(k => [k, G[k].name]), onChange(v){ ek = v; build(); } });
      const gridHost = ctx.html(`<div></div>`);
      function build(){
        const g = G[ek];
        gridHost.innerHTML = `<div class="ctl"><div class="lbl"><span>Click a cell to carry out the reaction</span></div>
          <table class="rt" style="width:100%"><thead><tr><th></th>${g.cols.map(c => `<th>${c}</th>`).join("")}</tr></thead>
          <tbody>${g.rows.map((r, i) => `<tr><th style="text-align:left">${r}</th>${g.cols.map((c, j) => `<td><button type="button" class="btn small" data-r="${i}" data-c="${j}">Go</button></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
        gridHost.querySelectorAll("button").forEach(b => b.onclick = () => run(+b.dataset.r, +b.dataset.c));
        st.show([{ sol:null, label:"" }], g.name, "Choose a substance and a reagent from the grid.");
      }
      function run(r, c){
        const g = G[ek], o = g.res(r, c), what = `${g.rows[r]} + ${g.cols[c]}`;
        st.show([Object.assign({ label:g.rows[r] }, o)], g.name, o.obs);
        ctx.record({ exp:g.name.split(" (")[0], what, obs:o.obs }, true);
        (done[ek] = done[ek] || new Set()).add(r + "," + c);
        const n = done[ek].size;
        if(ek === "disp" && n >= 9) ctx.complete("disp");
        if(ek === "h2so4" && n >= 3) ctx.complete("h2so4");
        if(ek === "g2sol" && n >= 8) ctx.complete("g2");
        if(ek === "g2co3" && n >= 4) ctx.complete("stab");
      }
      build();
    }
  });

  /* ───────────── EQUILIBRIA & ACID STRENGTH ───────────── */
  const EQ = {
    cr:{ name:"Cr₂O₇²⁻ + H₂O ⇌ 2CrO₄²⁻ + 2H⁺", L:[235,120,30], R:[245,215,40], x:.1, Ln:"orange", Rn:"yellow",
      acts:[["Add NaOH(aq)","right","OH⁻ removes H⁺, so the position moves right to replace it."],["Add dilute H₂SO₄","left","Extra H⁺ shifts the position to the left."]] },
    co:{ name:"[Co(H₂O)₆]²⁺ + 4Cl⁻ ⇌ [CoCl₄]²⁻ + 6H₂O   ΔH > 0", L:[230,120,160], R:[40,80,210], x:.2, Ln:"pink", Rn:"blue",
      acts:[["Add conc. HCl","right","Extra Cl⁻ shifts the position right."],["Add water","left","Water is a product; adding it (and diluting Cl⁻) shifts it left."],["Warm in a water bath","right","The forward reaction is endothermic, so a rise in temperature favours it."],["Cool in ice","left","Lower temperature favours the exothermic (backward) reaction."]] },
    fe:{ name:"Fe³⁺ + SCN⁻ ⇌ [Fe(SCN)]²⁺", L:[235,215,150], R:[170,20,20], x:.5, Ln:"pale yellow", Rn:"blood red",
      acts:[["Add more Fe³⁺(aq)","right","More reactant shifts the position right — deeper red."],["Add more KSCN(aq)","right","More SCN⁻ shifts the position right."],["Add AgNO₃(aq) (removes SCN⁻)","left","Ag⁺ precipitates SCN⁻, so the position moves left to replace it."]] },
    no2:{ name:"2NO₂(g) ⇌ N₂O₄(g)   ΔH < 0  (sealed syringe)", L:[150,70,25], R:[240,235,225], x:.5, Ln:"brown", Rn:"pale", gas:true,
      acts:[["Heat","left","The forward reaction is exothermic; heating favours the endothermic backward reaction — browner."],["Cool in ice","right","Cooling favours the exothermic forward reaction — paler."],["Push the plunger in","right","Higher pressure favours the side with fewer gas molecules (N₂O₄). It darkens at first as everything is compressed, then pales."]] }
  };
  Lab.register({
    id:"as-equilibrium", subject:"chemistry", level:["as"], topic:"Equilibria · Le Chatelier & acids", interactive:true,
    title:"Equilibrium shifts and acid strength",
    summary:"Predict, then watch: chromate–dichromate, cobalt chloride, iron thiocyanate and NO₂/N₂O₄. Compare a strong and a weak acid with a pH probe and magnesium.",
    aim:"Use Le Chatelier's principle to predict how changes in concentration, temperature and pressure move an equilibrium, and distinguish strong and weak acids by experiment.",
    variables:null,
    stageTitle:"Equilibrium mixtures", controlsTitle:"Changes",
    thumb:`<svg viewBox="0 0 300 140"><path d="M90 10 v100 a14 14 0 0 0 28 0 v-100" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M91 50 h26 v60 a13 13 0 0 1 -26 0z" fill="#E6862C"/><path d="M180 10 v100 a14 14 0 0 0 28 0 v-100" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M181 50 h26 v60 a13 13 0 0 1 -26 0z" fill="#F2D530"/><path d="M135 70 h30 M160 64 l6 6 -6 6 M165 82 h-30 M140 76 l-6 6 6 6" stroke="#A2ACBD" stroke-width="2" fill="none"/></svg>`,
    challenges:[
      { id:"pred",  title:"Good predictions", text:"Predict the direction of shift correctly eight times." },
      { id:"all",   title:"Every system", text:"Make at least one change to each of the four equilibria." },
      { id:"acid",  title:"Strong vs weak", text:"Measure the pH of both acids and react both with magnesium." }
    ],
    columns:[{key:"sys",label:"System"},{key:"change",label:"Change"},{key:"pred",label:"Prediction"},{key:"obs",label:"Observation"}],
    questions:[
      { q:"State Le Chatelier's principle.",
        a:"If a change is made to a system in dynamic equilibrium, the position of equilibrium moves to minimise (oppose) that change." },
      { q:"Does adding a catalyst change the colour of an equilibrium mixture?",
        a:"No. A catalyst speeds up the forward and backward reactions equally, so equilibrium is reached faster but its position does not change." },
      { q:"Which change alters the value of Kc?",
        a:"Only temperature. Concentration and pressure changes move the position, but Kc stays the same at constant temperature." },
      { q:"0.10 mol dm⁻³ HCl has pH 1.0 but 0.10 mol dm⁻³ CH₃COOH has pH 2.9. Explain.",
        a:"HCl is a strong acid and fully dissociates, so [H⁺] = 0.10. Ethanoic acid is weak and only partly dissociates (CH₃COOH ⇌ CH₃COO⁻ + H⁺), so [H⁺] is much lower." },
      { q:"Both acids give the same total volume of hydrogen with excess magnesium. Why?",
        a:"Both contain the same number of moles of acid. As H⁺ is used up the ethanoic acid keeps dissociating, so eventually it all reacts — just more slowly." }
    ],
    setup(ctx){
      let sk = "cr", pred = "right", x = {}, okN = 0;
      Object.keys(EQ).forEach(k => x[k] = EQ[k].x);
      const touched = new Set(), acid = new Set();
      const st = tubeStage(ctx, "eq-svg");
      const colOf = k => ChemKit.mix(EQ[k].L, EQ[k].R, x[k]);
      const nameOf = k => x[k] < .35 ? EQ[k].Ln : x[k] > .65 ? EQ[k].Rn : "in between";
      function show(msg){
        if(sk === "acid"){ st.show([{ sol:[220,230,240], label:"HCl" }, { sol:[220,230,240], label:"CH₃COOH" }], "0.10 mol dm⁻³ strong and weak acid", msg || "Choose a test."); return; }
        const e = EQ[sk];
        st.show(e.gas ? [] : [{ sol:colOf(sk), solA:.8, label:"mixture" }], e.name, msg || `The mixture is ${nameOf(sk)}. Choose a prediction, then a change.`,
          e.gas ? `<g transform="translate(120 160)"><rect width="260" height="60" rx="8" fill="rgba(${colOf(sk)},${.25 + .6*(1 - x[sk])})" stroke="var(--txt2)" stroke-width="2"/><rect x="260" y="20" width="80" height="20" fill="#64748B"/><text x="130" y="90" text-anchor="middle" class="k-lbl">sealed gas syringe</text></g>` : "");
      }
      const sysSel = ctx.select({ label:"System", value:sk, options:Object.keys(EQ).map(k => [k, EQ[k].name]).concat([["acid","Strong vs weak acid"]]), onChange(v){ sk = v; build(); show(); } });
      const pseg = ctx.seg({ label:"Your prediction", value:pred, options:[["left","Shifts left"],["right","Shifts right"],["none","No shift"]], onChange(v){ pred = v; } });
      const host = ctx.html(`<div></div>`);
      function build(){
        pseg.node.style.display = sk === "acid" ? "none" : "";
        if(sk === "acid"){
          host.innerHTML = "";
          const tests = [["pH","Measure pH with a probe"],["dil","Dilute each 10× and measure pH"],["mg","Add 3 cm of Mg ribbon to each"],["cond","Test conductivity"]];
          tests.forEach(([k, n]) => { const b = ctx.el(`<button type="button" class="btn small" style="margin:2px">${n}</button>`); b.onclick = () => acidTest(k, n); host.appendChild(b); });
          return;
        }
        host.innerHTML = "";
        EQ[sk].acts.concat([["Add a catalyst", "none", "A catalyst does not change the position of equilibrium."]]).forEach(([n, dir, why]) => {
          const b = ctx.el(`<button type="button" class="btn small" style="margin:2px">${ctx.esc(n)}</button>`);
          b.onclick = () => {
            if(sk === "cr" && dir !== "none") x[sk] = dir === "right" ? .92 : .08;
            else if(dir !== "none") x[sk] = Kit.clamp(x[sk] + (dir === "right" ? .3 : -.3), .05, .95);
            const right = pred === dir; if(right && ++okN >= 8) ctx.complete("pred");
            touched.add(sk); if(touched.size >= 4) ctx.complete("all");
            const obs = dir === "none" ? "no colour change" : `turns ${nameOf(sk)}`;
            show(`${n}: ${obs}. ${right ? "Your prediction was right. " : "Your prediction was wrong. "}${why}`);
            ctx.record({ sys:EQ[sk].name.split("  ")[0].split("   ")[0], change:n, pred:{ left:"left", right:"right", none:"no shift" }[pred], obs });
          };
          host.appendChild(b);
        });
      }
      function acidTest(k, n){
        const msg = { pH:"HCl: pH 1.0 · CH₃COOH: pH 2.9", dil:"HCl: pH 2.0 (up by 1) · CH₃COOH: pH 3.4 (up by only 0.5 — more dissociation on dilution)",
          mg:"HCl: vigorous effervescence, ribbon gone quickly · CH₃COOH: slow effervescence. Both give the same final volume of H₂.", cond:"HCl: bulb bright (many ions) · CH₃COOH: bulb dim (few ions)" }[k];
        acid.add(k); if(acid.has("pH") && acid.has("mg")) ctx.complete("acid");
        st.show([{ sol:[220,230,240], bubbles:k === "mg", label:"HCl" }, { sol:[220,230,240], bubbles:k === "mg", label:"CH₃COOH" }], "0.10 mol dm⁻³ strong and weak acid", msg);
        ctx.record({ sys:"Strong vs weak acid", change:n, pred:"—", obs:msg });
      }
      build(); show();
    }
  });
})();
