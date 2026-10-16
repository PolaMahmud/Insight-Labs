"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMISTRY (0620) — Acid–alkali titration · Rates of reaction ·
                      Identifying ions (qualitative analysis)
══════════════════════════════════════════════════════════════════ */

/* ───────────── ACID–ALKALI TITRATION ───────────── */
Lab.register({
  id:"titration", subject:"chemistry", topic:"Acids, bases & salts", icon:"⚗️",
  title:"Acid–alkali titration",
  summary:"Titrate 0.100 mol/dm³ NaOH into an unknown HCl, find concordant titres and work out the concentration.",
  aim:"Find the concentration of a hydrochloric acid solution by titration with 0.100 mol/dm³ sodium hydroxide.",
  variables:{
    iv:"Volume of sodium hydroxide added (cm³)",
    dv:"pH of the solution / colour of the indicator",
    cv:["25.0 cm³ of acid measured by pipette","Same indicator","Swirl after each addition"]
  },
  columns:[{key:"run",label:"Titration"},{key:"v",label:"NaOH added / cm³",dp:2},{key:"pH",label:"pH",dp:2},{key:"col",label:"Indicator colour"}],
  series:"run",
  graph:{ x:["v"], y:["pH"], fit:"none" },
  questions:[
    { q:"Why do you do a rough titration first, then add the alkali drop by drop near the end point?",
      a:"The rough titration tells you roughly where the end point is. In accurate runs you add quickly until about 1 cm³ before it, then drop by drop so you don’t overshoot." },
    { q:"What are concordant results, and why are they used?",
      a:"Titres within 0.10 cm³ of each other. Only concordant titres are averaged, so anomalous results (e.g. an overshoot) don’t affect the mean." },
    { q:"Write the equation and calculate the acid concentration if the mean titre is 22.50 cm³.",
      a:"NaOH + HCl → NaCl + H₂O. Moles NaOH = 0.100 × 22.50/1000 = 0.00225 mol. Ratio 1:1, so moles HCl = 0.00225 mol in 25.0 cm³. Concentration = 0.00225 ÷ 0.0250 = 0.0900 mol/dm³." },
    { q:"Why is universal indicator not used for titrations?",
      a:"It changes colour gradually over a wide pH range, so there is no single sharp colour change to show the end point." }
  ],
  setup(ctx){
    const CB = 0.100, VA = 25.0;
    let cA, run, initial, added, titres, ind = "phenolphthalein", flowing = false;
    const drops = [];

    function newAcid(){ cA = Math.round((0.070 + Math.random()*0.05)*1000)/1000; titres = []; run = 0; newRun(); }
    function newRun(){ run++; initial = Math.round(Math.random()*30)*0.05; added = 0; }
    const reading = () => Math.round((initial + added)/0.05)*0.05;

    function pH(){
      const nA = cA*VA/1000, nB = CB*added/1000, Vt = (VA + added)/1000;
      if(Math.abs(nA - nB) < 1e-9) return 7;
      return nA > nB ? -Math.log10((nA - nB)/Vt) : 14 + Math.log10((nB - nA)/Vt);
    }
    const mix = (a, b, f) => a.map((x,i) => Math.round(x + (b[i] - x)*Math.max(0, Math.min(1, f))));
    const UI = [[1,[230,30,30]],[3,[240,120,30]],[5,[240,210,40]],[7,[60,170,70]],[9,[40,110,200]],[11,[70,50,170]],[13,[120,40,150]]];
    function colour(p){
      if(ind === "phenolphthalein"){
        if(p < 8.2) return { rgb:[220,232,240], a:.35, name:"colourless" };
        const f = (p - 8.2)/1.8;
        return { rgb: mix([245,170,215],[214,40,140], f), a:.55 + .35*Math.min(1,f), name: f < .6 ? "pale pink" : "pink" };
      }
      if(ind === "methyl orange"){
        if(p < 3.1) return { rgb:[220,40,40], a:.8, name:"red" };
        if(p > 4.4) return { rgb:[245,200,40], a:.8, name:"yellow" };
        return { rgb: mix([220,40,40],[245,200,40], (p - 3.1)/1.3), a:.8, name:"orange" };
      }
      let k = 0; while(k < UI.length - 2 && p > UI[k+1][0]) k++;
      const [p0,c0] = UI[k], [p1,c1] = UI[k+1];
      const names = ["red","orange","yellow","green","blue","indigo","violet"];
      return { rgb: mix(c0, c1, (p - p0)/(p1 - p0)), a:.8, name: names[Math.max(0, Math.min(6, Math.round((p - 1)/2)))] };
    }

    let ticks = "";
    for(let v=0; v<=50; v++){
      const y = 40 + v*5, w = v % 5 === 0 ? 8 : 4;
      ticks += `<line x1="170" y1="${y}" x2="${170 + w}" y2="${y}" stroke="var(--txt2)" stroke-width=".8"/>`;
      if(v % 10 === 0) ticks += `<text class="lbl" x="164" y="${y + 4}" text-anchor="end">${v}</text>`;
    }
    const FLASK = "M165 350 V378 L110 476 Q108 482 115 482 H245 Q252 482 250 476 L195 378 V350 Z";
    ctx.stage.innerHTML = `
    <svg viewBox="0 0 380 500" aria-label="Burette above a conical flask on a white tile">
      <defs><clipPath id="tt-flask"><path d="${FLASK}"/></clipPath><clipPath id="tt-bur"><rect x="171" y="20" width="18" height="290"/></clipPath></defs>
      <rect x="55" y="488" width="170" height="10" rx="3" fill="var(--txt3)"/><rect x="60" y="10" width="8" height="480" fill="var(--txt3)"/>
      <rect x="60" y="150" width="112" height="7" fill="var(--txt3)"/>
      <rect id="tt-liq" x="171" width="18" fill="rgba(200,215,235,.55)" clip-path="url(#tt-bur)"/>
      <rect x="170" y="20" width="20" height="290" class="glass" fill="none"/>
      ${ticks}
      <path class="ink2" d="M176 310 L178 330 H182 L184 310"/>
      <rect x="166" y="312" width="28" height="6" rx="2" fill="var(--txt2)" id="tt-tap"/>
      <rect x="95" y="484" width="170" height="5" fill="var(--bg-card)" stroke="var(--brd)"/>
      <rect id="tt-sol" x="100" width="160" height="200" clip-path="url(#tt-flask)"/>
      <path d="${FLASK}" class="glass" fill="none"/>
      <g id="tt-drops"></g>
      <g transform="translate(250 40)">
        <rect width="118" height="58" rx="8" fill="var(--bg-card)" stroke="var(--brd)"/>
        <text class="lbl" x="10" y="20">Burette reading</text>
        <text class="lblb" id="tt-read" x="10" y="44" style="font-size:20px"></text>
      </g>
      <g transform="translate(250 110)">
        <rect width="118" height="58" rx="8" fill="var(--bg-card)" stroke="var(--brd)"/>
        <text class="lbl" x="10" y="20">pH probe</text>
        <text class="lblb" id="tt-ph" x="10" y="44" style="font-size:20px"></text>
      </g>
      <text class="lbl" x="200" y="345">0.100 mol/dm³ NaOH</text>
      <text class="lbl" x="268" y="440">25.0 cm³ HCl</text>
      <text class="lbl" x="268" y="456">+ indicator</text>
    </svg>`;
    const $ = s => ctx.stage.querySelector(s);

    function draw(){
      const r = initial + added, p = pH(), c = colour(p);
      $("#tt-liq").setAttribute("y", 40 + r*5); $("#tt-liq").setAttribute("height", Math.max(0, 300 - (40 + r*5)));
      const lvl = 470 - (VA + added)*0.9;
      $("#tt-sol").setAttribute("y", lvl);
      $("#tt-sol").setAttribute("fill", `rgba(${c.rgb},${c.a})`);
      $("#tt-read").textContent = reading().toFixed(2) + " cm³";
      $("#tt-ph").textContent = p.toFixed(2);
      $("#tt-tap").setAttribute("fill", flowing ? "var(--accent)" : "var(--txt2)");
      ctx.readout([["Titration", "#" + run], ["Initial reading", initial.toFixed(2) + " cm³"], ["Added", added.toFixed(2) + " cm³"],
        ["Indicator", c.name, ind !== "universal" && c.name !== (ind === "phenolphthalein" ? "colourless" : "red") ? "good" : ""]]);
    }

    function add(v){
      if(initial + added + v > 50.0001){ ctx.toast("Burette is empty — start a new titration"); flowing = false; return false; }
      added = Math.round((added + v)*1000)/1000;
      drops.push({ y:332, vy:0 });
      draw(); return true;
    }

    ctx.frame(dt => {
      if(flowing){ if(!add(2.0*dt)) flowing = false; }
      const lvl = 470 - (VA + added)*0.9;
      for(let k = drops.length - 1; k >= 0; k--){ const d = drops[k]; d.vy += 900*dt; d.y += d.vy*dt; if(d.y > lvl) drops.splice(k, 1); }
      $("#tt-drops").innerHTML = drops.slice(-6).map(d => `<ellipse cx="180" cy="${d.y}" rx="2.6" ry="3.6" fill="rgba(150,180,220,.9)"/>`).join("");
    });

    ctx.select({ label:"Indicator", value:ind, options:[["phenolphthalein","Phenolphthalein"],["methyl orange","Methyl orange"],["universal","Universal indicator"]],
      onChange(v){ ind = v; draw(); } });
    ctx.html(`<div class="ctl"><div class="lbl"><span>Add sodium hydroxide</span></div></div>`);
    ctx.buttons([{ label:"+1.00 cm³", onClick:() => add(1) }, { label:"+0.10 cm³", onClick:() => add(0.1) }, { label:"1 drop", onClick:() => add(0.05) }]);
    const hold = ctx.buttons([{ label:"Hold to open tap", block:true, onClick(){} }])[0];
    const start = e => { e.preventDefault(); flowing = true; draw(); }, stop = () => { flowing = false; draw(); };
    hold.addEventListener("pointerdown", start); hold.addEventListener("pointerup", stop); hold.addEventListener("pointerleave", stop); hold.addEventListener("pointercancel", stop);
    hold.style.touchAction = "none";
    hold.addEventListener("keydown", e => { if(e.key === " " || e.key === "Enter") start(e); });
    hold.addEventListener("keyup", stop);
    ctx.buttons([{ label:"Record pH reading", onClick(){ const p = pH(); ctx.record({ run:"Titration " + run, v:added, pH:Number(p.toFixed(2)), col:colour(p).name }, true); ctx.toast("pH recorded"); } }]);

    const titreBox = ctx.html(`<div class="ctl"><div class="lbl"><span>Titres</span></div><div id="tt-titres"></div></div>`);
    ctx.buttons([
      { label:"End point reached — record titre", primary:true, block:true, onClick(){
        if(added < 0.05){ ctx.toast("Add some alkali first"); return; }
        titres.push({ run, start:initial, end:reading(), t:Math.round((reading() - initial)*100)/100 });
        newRun(); draw(); showTitres(); ctx.toast("Titre recorded — flask refilled for the next run");
      } },
      { label:"Discard this run & refill", onClick(){ newRun(); draw(); } }
    ]);
    const calc = ctx.html(`<div class="ctl"><label for="tt-ans"><span>Concentration of HCl (mol/dm³)</span></label>
      <div style="display:flex;gap:.4rem"><input class="inp" id="tt-ans" type="number" step="0.001" placeholder="e.g. 0.0950"><button class="btn small" type="button" id="tt-check">Check</button></div>
      <div id="tt-fb" style="margin-top:.5rem"></div></div>`);
    ctx.buttons([{ label:"New unknown acid", onClick(){ newAcid(); draw(); showTitres(); calc.querySelector("#tt-fb").innerHTML = ""; ctx.toast("New acid — concentration changed"); } }]);

    function concordant(){
      const t = titres.map(x => x.t);
      return t.filter((v,i) => t.some((w,j) => j !== i && Math.abs(v - w) <= 0.10 + 1e-9));
    }
    function showTitres(){
      const box = titreBox.querySelector("#tt-titres");
      if(!titres.length){ box.innerHTML = `<p class="hint">Run a titration to the end point, then record the titre. Aim for two concordant titres.</p>`; return; }
      const conc = concordant();
      box.innerHTML = `<table class="rt"><thead><tr><th>#</th><th>Initial</th><th>Final</th><th>Titre</th></tr></thead><tbody>
        ${titres.map(x => `<tr><td>${x.run}</td><td>${x.start.toFixed(2)}</td><td>${x.end.toFixed(2)}</td><td>${x.t.toFixed(2)}${conc.includes(x.t) ? " ✓" : ""}</td></tr>`).join("")}
        </tbody></table>
        <p class="hint">${conc.length >= 2 ? `Mean of concordant titres (✓): <b>${(conc.reduce((a,b) => a + b, 0)/conc.length).toFixed(2)} cm³</b>` : "No concordant titres yet (within 0.10 cm³)."}</p>`;
    }
    calc.querySelector("#tt-check").onclick = () => {
      const fb = calc.querySelector("#tt-fb"), v = parseFloat(calc.querySelector("#tt-ans").value), conc = concordant();
      if(conc.length < 2){ fb.innerHTML = `<div class="note bad">Get at least two concordant titres first.</div>`; return; }
      const mean = conc.reduce((a,b) => a + b, 0)/conc.length, expect = CB*mean/VA;
      if(!isFinite(v)){ fb.innerHTML = `<div class="note bad">Enter a number.</div>`; return; }
      if(Math.abs(v - expect)/expect <= 0.015){
        const err = Math.abs(expect - cA)/cA*100;
        fb.innerHTML = `<div class="note ok">Correct from your data: ${expect.toFixed(4)} mol/dm³. The true value was ${cA.toFixed(3)} mol/dm³ — your experimental error is ${err.toFixed(1)}%.</div>`;
      }else fb.innerHTML = `<div class="note bad">Not quite. Moles NaOH = 0.100 × ${mean.toFixed(2)} ÷ 1000. NaOH : HCl is 1 : 1. Then divide by the acid volume in dm³ (0.0250).</div>`;
    };

    newAcid(); draw(); showTitres();
  }
});

/* ───────────── RATES OF REACTION ───────────── */
Lab.register({
  id:"rates", subject:"chemistry", topic:"Chemical reactions · Rates", icon:"⏱️",
  title:"Rate of reaction: magnesium + acid",
  summary:"Collect hydrogen in a gas syringe and see how concentration, temperature and surface area change the rate.",
  aim:"Investigate how concentration, temperature and surface area affect the rate of reaction between magnesium and hydrochloric acid.",
  variables:{
    iv:"Choose ONE: acid concentration, temperature or form of magnesium",
    dv:"Volume of hydrogen collected (cm³) over time",
    cv:["0.05 g magnesium","50 cm³ acid (in excess)","The other two factors kept the same"]
  },
  columns:[{key:"run",label:"Conditions"},{key:"t",label:"Time / s",dp:0},{key:"V",label:"Volume H₂ / cm³",dp:1}],
  series:"run",
  graph:{ x:["t"], y:["V"], fit:"none" },
  questions:[
    { q:"Write the word and symbol equations for the reaction.",
      a:"magnesium + hydrochloric acid → magnesium chloride + hydrogen. Mg + 2HCl → MgCl₂ + H₂." },
    { q:"Why does every run produce the same final volume of gas?",
      a:"The same mass of magnesium is used each time and it is the limiting reactant (acid is in excess). The amount of product depends on the limiting reactant, not on the rate." },
    { q:"Use collision theory to explain why increasing the temperature increases the rate.",
      a:"Particles have more kinetic energy and move faster, so they collide more often, and a greater proportion of collisions have energy ≥ the activation energy. More successful collisions per second." },
    { q:"How can you find the initial rate from your graph?",
      a:"Draw a tangent to the curve at t = 0 and calculate its gradient (cm³/s). A steeper initial gradient means a faster rate." }
  ],
  setup(ctx){
    let conc = 1.0, temp = 20, form = "ribbon", speed = 5, auto = true;
    let running = false, t = 0, nextRec = 0, doneAt = null;
    const VMAX = 50;
    const k = () => 0.012*conc*(form === "powder" ? 4 : 1)*Math.pow(2, (temp - 20)/10);
    const vol = tt => VMAX*(1 - Math.exp(-k()*tt));
    const label = () => `${conc.toFixed(1)} M, ${temp} °C, ${form}`;
    const readV = tt => { const v = vol(tt); return v < 0.5 ? 0 : Math.max(0, Math.round((v + 0.25*ctx.gauss())*2)/2); };

    let scale = "";
    for(let v=0; v<=100; v+=10) scale += `<line x1="${250 + v*2}" y1="148" x2="${250 + v*2}" y2="${v % 50 ? 154 : 158}" stroke="var(--txt2)"/>${v % 20 === 0 ? `<text class="lbl" x="${250 + v*2}" y="172" text-anchor="middle">${v}</text>` : ""}`;
    ctx.stage.innerHTML = `
    <svg viewBox="0 0 520 330" aria-label="Conical flask connected to a gas syringe">
      <defs><clipPath id="rt-fl"><path d="M70 110 V140 L30 250 Q28 256 35 256 H155 Q162 256 160 250 L120 140 V110 Z"/></clipPath></defs>
      <rect x="10" y="190" width="180" height="90" rx="6" fill="var(--sec-lt)" opacity=".7" id="rt-bath"/>
      <text class="lbl" x="18" y="296" id="rt-bathlbl"></text>
      <rect x="20" y="180" width="160" height="80" fill="rgba(200,215,235,.45)" clip-path="url(#rt-fl)"/>
      <g id="rt-mg" clip-path="url(#rt-fl)"></g>
      <g id="rt-bub" clip-path="url(#rt-fl)"></g>
      <path d="M70 110 V140 L30 250 Q28 256 35 256 H155 Q162 256 160 250 L120 140 V110 Z" class="glass" fill="none"/>
      <rect x="66" y="98" width="58" height="16" rx="3" fill="var(--txt3)"/>
      <path class="ink2" d="M95 98 V60 H245 V140" stroke-width="3"/>
      <rect x="245" y="128" width="210" height="22" rx="4" class="glass"/>
      <rect id="rt-gas" x="250" y="131" height="16" fill="var(--accent-lt)"/>
      <rect id="rt-plunger" y="125" width="8" height="28" fill="var(--txt2)"/>
      <rect id="rt-rod" y="136" height="6" fill="var(--txt2)"/>
      ${scale}
      <text class="lbl" x="350" y="190" text-anchor="middle">gas syringe / cm³</text>
      <g transform="translate(300 220)"><rect width="150" height="64" rx="10" fill="var(--bg-card)" stroke="var(--brd)"/>
        <text class="lbl" x="12" y="22">Stopwatch</text><text class="lblb" id="rt-clock" x="12" y="50" style="font-size:22px">0 s</text></g>
    </svg>`;
    const $ = s => ctx.stage.querySelector(s);
    const bubbles = [];

    function drawMg(){
      const left = 1 - vol(t)/VMAX;
      $("#rt-mg").innerHTML = form === "ribbon"
        ? `<rect x="${95 - 22*left}" y="244" width="${44*left}" height="5" rx="1" fill="#9aa3ad"/>`
        : Array.from({length:18}, (_, i) => `<circle cx="${50 + (i*37) % 90}" cy="${246 + (i*7) % 7}" r="${2*left}" fill="#9aa3ad"/>`).join("");
    }
    function draw(){
      const V = vol(t), x = 250 + V*2;
      $("#rt-gas").setAttribute("width", V*2);
      $("#rt-plunger").setAttribute("x", x); $("#rt-rod").setAttribute("x", x + 8); $("#rt-rod").setAttribute("width", Math.max(0, 455 + 40 - x));
      $("#rt-clock").textContent = Math.floor(t) + " s";
      $("#rt-bathlbl").textContent = "water bath " + temp + " °C";
      $("#rt-bath").setAttribute("fill", temp > 20 ? "var(--hi-lt)" : "var(--sec-lt)");
      drawMg();
      ctx.readout([["Time", Math.floor(t) + " s"], ["Volume", (Math.round(V*2)/2).toFixed(1) + " cm³"],
        ["Rate now", (VMAX*k()*Math.exp(-k()*t)).toFixed(2) + " cm³/s"], ["Speed", "×" + speed]]);
    }

    ctx.frame(dt => {
      if(running){
        t += dt*speed;
        if(auto && t >= nextRec){ ctx.record({ run:label(), t:nextRec, V:readV(nextRec) }, true); nextRec += 10; }
        if(doneAt === null && vol(t) > VMAX*0.995) doneAt = t;
        if(t >= 300 || (doneAt !== null && t > doneAt + 20)){ running = false; lock(false); ctx.toast(doneAt !== null ? "Reaction complete" : "Stopped at 300 s"); }
        const r = VMAX*k()*Math.exp(-k()*t);
        if(Math.random() < r*dt*speed*1.5) bubbles.push({ x: form === "ribbon" ? 75 + Math.random()*40 : 45 + Math.random()*100, y:244 });
      }
      for(let i = bubbles.length - 1; i >= 0; i--){ bubbles[i].y -= 60*dt; if(bubbles[i].y < 185) bubbles.splice(i, 1); }
      $("#rt-bub").innerHTML = bubbles.map(b => `<circle cx="${b.x}" cy="${b.y}" r="2.4" fill="none" stroke="var(--txt2)" stroke-width=".9"/>`).join("");
      draw();
    });

    const cs = ctx.seg({ label:"Acid concentration", value:1.0, options:[[0.5,"0.5 M"],[1.0,"1.0 M"],[1.5,"1.5 M"],[2.0,"2.0 M"]], onChange(v){ conc = v; reset(); } });
    const ts = ctx.slider({ label:"Temperature", min:20, max:50, step:5, value:20, unit:"°C", onInput(v){ temp = v; reset(); } });
    const fs = ctx.seg({ label:"Magnesium", value:"ribbon", options:[["ribbon","Ribbon"],["powder","Powder"]], onChange(v){ form = v; reset(); } });
    ctx.seg({ label:"Simulation speed", value:5, options:[[1,"×1"],[5,"×5"],[20,"×20"]], onChange(v){ speed = v; } });
    ctx.seg({ label:"Readings", value:true, options:[[true,"Auto every 10 s"],[false,"Manual"]], onChange(v){ auto = v; } });
    const [startBtn] = ctx.buttons([{ label:"Add magnesium & start", primary:true, onClick(){
      if(running) return;
      if(t > 0) reset();
      running = true; nextRec = 0; doneAt = null; lock(true);
    } }, { label:"Reset", onClick(){ reset(); } }]);
    ctx.buttons([{ label:"Record reading now", block:true, onClick(){ ctx.record({ run:label(), t:Math.round(t), V:readV(t) }); } }]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Change <b>one</b> factor between runs. Each set of conditions plots as its own curve.</p>`);
    function lock(on){ cs.disable(on); ts.disable(on); fs.disable(on); startBtn.disabled = on; }
    function reset(){ running = false; t = 0; nextRec = 0; doneAt = null; bubbles.length = 0; lock(false); draw(); }
    draw();
  }
});

/* ───────────── IDENTIFYING IONS ───────────── */
Lab.register({
  id:"ion-tests", subject:"chemistry", topic:"Chemical analysis", icon:"🔬",
  title:"Identify the unknown salt",
  summary:"Use flame tests and precipitate tests to identify the cation and anion in a mystery solution.",
  aim:"Carry out tests for cations, anions and flame colours to identify an unknown salt.",
  variables:null,
  columns:[{key:"n",label:"Unknown",dp:0},{key:"test",label:"Test"},{key:"obs",label:"Observation"}],
  questions:[
    { q:"Two solutions both give a white precipitate with a few drops of NaOH(aq) that dissolves in excess. How can you tell zinc ions from aluminium ions?",
      a:"Add aqueous ammonia. Zn²⁺ gives a white precipitate that dissolves in excess ammonia; Al³⁺ gives a white precipitate that does not dissolve in excess." },
    { q:"Why is the solution acidified with dilute nitric acid before adding silver nitrate?",
      a:"To remove carbonate ions, which would also give a precipitate (silver carbonate) and a false positive. Hydrochloric acid can’t be used because it adds chloride ions." },
    { q:"Describe the test for ammonium ions.",
      a:"Warm with aqueous sodium hydroxide. Ammonia gas is given off, which turns damp red litmus paper blue." },
    { q:"Why is the nichrome wire dipped in concentrated HCl and heated before each flame test?",
      a:"To clean it, so traces of a previous metal don’t contaminate the flame colour." }
  ],
  setup(ctx){
    const CAT = {
      "Cu²⁺":{ sol:[80,150,230], naoh:["light blue precipitate","light blue precipitate, insoluble in excess",[90,160,235],false], nh3:["light blue precipitate","precipitate dissolves, giving a dark blue solution",[90,160,235],"dark"], flame:["blue-green","#2fd6a0"] },
      "Fe²⁺":{ sol:[190,225,190], naoh:["green precipitate","green precipitate, insoluble in excess",[90,140,90],false], nh3:["green precipitate","green precipitate, insoluble in excess",[90,140,90],false] },
      "Fe³⁺":{ sol:[220,180,90], naoh:["red-brown precipitate","red-brown precipitate, insoluble in excess",[160,70,30],false], nh3:["red-brown precipitate","red-brown precipitate, insoluble in excess",[160,70,30],false] },
      "Zn²⁺":{ naoh:["white precipitate","precipitate dissolves, giving a colourless solution",[245,245,245],true], nh3:["white precipitate","precipitate dissolves, giving a colourless solution",[245,245,245],true] },
      "Al³⁺":{ naoh:["white precipitate","precipitate dissolves, giving a colourless solution",[245,245,245],true], nh3:["white precipitate","white precipitate, insoluble in excess",[245,245,245],false] },
      "Ca²⁺":{ naoh:["white precipitate","white precipitate, insoluble in excess",[245,245,245],false], nh3:["no precipitate, or a very slight white precipitate","no change",null,false], flame:["orange-red","#ff6a2a"] },
      "Cr³⁺":{ sol:[120,170,120], naoh:["green precipitate","precipitate dissolves, giving a dark green solution",[70,130,80],"green"], nh3:["grey-green precipitate","grey-green precipitate, insoluble in excess",[110,135,110],false] },
      "NH₄⁺":{ naoh:["no precipitate; on warming, a gas is given off that turns damp red litmus paper blue","no precipitate",null,false], nh3:["no change","no change",null,false] },
      "Na⁺":{ flame:["yellow","#ffc21a"] }, "K⁺":{ flame:["lilac","#c58cff"] }, "Li⁺":{ flame:["red","#ff2a40"] }, "Ba²⁺":{ flame:["light green","#b6f06a"] }
    };
    const SALTS = [["Cu²⁺","SO₄²⁻"],["Fe²⁺","SO₄²⁻"],["Fe³⁺","Cl⁻"],["Zn²⁺","SO₄²⁻"],["Al³⁺","SO₄²⁻"],["Ca²⁺","Cl⁻"],["Cr³⁺","Cl⁻"],["NH₄⁺","Cl⁻"],
      ["Na⁺","CO₃²⁻"],["K⁺","I⁻"],["Li⁺","Br⁻"],["Ba²⁺","NO₃⁻"],["Na⁺","NO₃⁻"],["K⁺","Br⁻"],["Na⁺","SO₃²⁻"],["Cu²⁺","Cl⁻"],["Zn²⁺","I⁻"],["Fe³⁺","NO₃⁻"]];
    const ANIONS = ["Cl⁻","Br⁻","I⁻","SO₄²⁻","SO₃²⁻","CO₃²⁻","NO₃⁻"];
    let unknown, num = 0;

    const TESTS = [
      ["flame","Flame test"],
      ["naoh1","NaOH(aq) — a few drops"],["naoh2","NaOH(aq) — in excess"],
      ["nh31","NH₃(aq) — a few drops"],["nh32","NH₃(aq) — in excess"],
      ["acid","Add dilute HCl; test gas with limewater"],
      ["ag","Acidify (HNO₃), add AgNO₃(aq)"],
      ["ba","Acidify (HNO₃), add Ba(NO₃)₂(aq)"],
      ["al","Warm with NaOH(aq) + aluminium foil"],
      ["mno4","Add acidified KMnO₄(aq)"]
    ];

    function result(test){
      const [cat, an] = unknown, c = CAT[cat];
      const base = c.sol || null;
      const out = { sol:base, ppt:null, bubbles:false, flame:null };
      switch(test){
        case "flame":
          if(c.flame){ out.flame = c.flame[1]; out.obs = c.flame[0] + " flame"; }
          else{ out.flame = "#ffb347"; out.obs = "no distinctive colour (faint orange from the flame)"; }
          break;
        case "naoh1": case "naoh2": case "nh31": case "nh32": {
          const key = test.slice(0, -1), ex = test.endsWith("2"), d = c[key];
          if(!d){ out.obs = "no precipitate"; break; }
          out.obs = d[ex ? 1 : 0];
          if(d[2] && !(ex && d[3])) out.ppt = d[2];
          if(ex && d[3] === "dark") out.sol = [25,60,200];
          if(ex && d[3] === "green") out.sol = [40,110,60];
          if(ex && d[3] === true) out.sol = null;
          break; }
        case "acid":
          if(an === "CO₃²⁻"){ out.bubbles = true; out.obs = "effervescence; the gas turns limewater milky (CO₂)"; }
          else out.obs = "no effervescence";
          break;
        case "ag":
          if(an === "Cl⁻"){ out.ppt = [245,245,245]; out.obs = "white precipitate"; }
          else if(an === "Br⁻"){ out.ppt = [240,230,190]; out.obs = "cream precipitate"; }
          else if(an === "I⁻"){ out.ppt = [245,225,90]; out.obs = "yellow precipitate"; }
          else out.obs = "no precipitate";
          break;
        case "ba":
          if(an === "SO₄²⁻"){ out.ppt = [245,245,245]; out.obs = "white precipitate"; }
          else out.obs = "no precipitate";
          break;
        case "al":
          if(an === "NO₃⁻" || cat === "NH₄⁺"){ out.bubbles = true; out.obs = "gas given off that turns damp red litmus paper blue (ammonia)"; }
          else out.obs = "no ammonia given off";
          break;
        case "mno4":
          if(an === "SO₃²⁻"){ out.sol = null; out.obs = "purple solution turns colourless"; }
          else{ out.sol = [150,40,160]; out.obs = "stays purple"; }
          break;
      }
      return out;
    }

    ctx.stage.innerHTML = `<svg viewBox="0 0 360 360" aria-label="Test tube or Bunsen flame showing the result of a test" id="it-svg"></svg>`;
    const svg = ctx.stage.querySelector("#it-svg");
    const rgb = (c, a) => c ? `rgba(${c},${a})` : `rgba(210,225,240,.35)`;
    function drawTube(r){
      let ppt = "";
      if(r && r.ppt) for(let i=0;i<70;i++){
        const y = 250 + Math.pow(Math.random(), .6)*60, x = 160 + Math.random()*40;
        ppt += `<circle cx="${x}" cy="${y}" r="${1.2 + Math.random()*2}" fill="rgb(${r.ppt})" stroke="rgba(0,0,0,.15)" stroke-width=".4"/>`;
      }
      let bub = "";
      if(r && r.bubbles) for(let i=0;i<16;i++) bub += `<circle cx="${163 + Math.random()*34}" cy="${190 + Math.random()*120}" r="${1.5 + Math.random()*2.5}" fill="none" stroke="var(--txt2)" stroke-width=".8"/>`;
      const tube = "M156 50 V300 A24 24 0 0 0 204 300 V50";
      svg.innerHTML = `
        <defs><clipPath id="it-c"><path d="${tube} Z"/></clipPath></defs>
        <rect x="140" y="180" width="80" height="160" fill="${rgb(r ? r.sol : unknown && CAT[unknown[0]].sol, .7)}" clip-path="url(#it-c)"/>
        <g clip-path="url(#it-c)">${ppt}${bub}</g>
        <path d="${tube}" class="glass" fill="none"/>
        <text class="lbl" x="230" y="190">unknown ${num}</text>`;
    }
    function drawFlame(col){
      svg.innerHTML = `
        <defs><radialGradient id="it-fl" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="${col}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs>
        <path d="M180 120 C150 170 150 220 165 250 L195 250 C210 220 210 170 180 120 Z" fill="url(#it-fl)">
          <animate attributeName="d" dur=".6s" repeatCount="indefinite" values="M180 120 C150 170 150 220 165 250 L195 250 C210 220 210 170 180 120 Z;M183 110 C148 168 152 222 165 250 L195 250 C212 222 206 166 183 110 Z;M180 120 C150 170 150 220 165 250 L195 250 C210 220 210 170 180 120 Z"/></path>
        <path d="M180 200 C172 215 172 235 176 250 L184 250 C188 235 188 215 180 200 Z" fill="#4a7dff" opacity=".7"/>
        <rect x="168" y="250" width="24" height="70" fill="var(--txt3)"/><rect x="140" y="318" width="80" height="12" rx="3" fill="var(--txt3)"/>
        <path class="ink" d="M60 120 L170 185" stroke-width="2"/><circle cx="172" cy="187" r="4" fill="none" stroke="var(--txt)" stroke-width="1.6"/>
        <text class="lbl" x="40" y="112">nichrome wire</text>`;
    }

    ctx.html(`<div class="ctl"><div class="lbl"><span>Tests</span></div></div>`);
    const grid = ctx.html(`<div class="ctl" style="display:grid;gap:.35rem"></div>`);
    TESTS.forEach(([k, name]) => {
      const b = ctx.el(`<button type="button" class="btn small" style="justify-content:flex-start;border-radius:10px">${ctx.esc(name)}</button>`);
      b.onclick = () => {
        const r = result(k);
        k === "flame" ? drawFlame(r.flame) : drawTube(r);
        ctx.readout([["Test", name], ["Observation", r.obs]]);
        ctx.record({ n:num, test:name, obs:r.obs }, true);
      };
      grid.appendChild(b);
    });
    const id = ctx.html(`<div class="ctl"><div class="lbl"><span>Your identification</span></div>
      <div style="display:flex;gap:.4rem;margin-bottom:.4rem">
        <select class="inp" id="it-cat" aria-label="Cation"><option value="">Cation…</option>${Object.keys(CAT).map(c => `<option>${c}</option>`).join("")}</select>
        <select class="inp" id="it-an" aria-label="Anion"><option value="">Anion…</option>${ANIONS.map(a => `<option>${a}</option>`).join("")}</select>
      </div><div class="btns"><button class="btn small primary" type="button" id="it-check">Check</button><button class="btn small" type="button" id="it-new">New unknown</button></div>
      <div id="it-fb" style="margin-top:.5rem"></div></div>`);
    const fb = id.querySelector("#it-fb");
    id.querySelector("#it-check").onclick = () => {
      const c = id.querySelector("#it-cat").value, a = id.querySelector("#it-an").value;
      if(!c || !a){ fb.innerHTML = `<div class="note bad">Choose a cation and an anion.</div>`; return; }
      const okC = c === unknown[0], okA = a === unknown[1];
      fb.innerHTML = okC && okA ? `<div class="note ok">Correct! Unknown ${num} contains ${unknown[0]} and ${unknown[1]}.</div>`
        : `<div class="note bad">Cation ${okC ? "✓" : "✗"} · Anion ${okA ? "✓" : "✗"}. Check your observations against the tests.</div>`;
    };
    function newUnknown(){
      let next; do{ next = SALTS[Math.floor(Math.random()*SALTS.length)]; }while(unknown && next === unknown);
      unknown = next; num++; fb.innerHTML = "";
      id.querySelector("#it-cat").value = ""; id.querySelector("#it-an").value = "";
      drawTube(null); ctx.readout([["Unknown", "#" + num], ["Appearance", CAT[unknown[0]].sol ? "coloured solution" : "colourless solution"]]);
    }
    id.querySelector("#it-new").onclick = newUnknown;
    num = Math.max(0, ...ctx.rows().map(r => r.n || 0));
    newUnknown();
  }
});
