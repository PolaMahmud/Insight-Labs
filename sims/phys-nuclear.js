"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · NUCLEAR — Half-life model (dice/coins) · Penetrating power
══════════════════════════════════════════════════════════════════ */

/* ───────────── HALF-LIFE MODEL ───────────── */
Lab.register({
  id:"halflife", subject:"physics", level:["igcse"], topic:"Nuclear physics · Half-life", interactive:true,
  title:"Modelling radioactive decay",
  summary:"Throw a tray of dice (or coins); any showing a six has ‘decayed’ and is removed. Plot what’s left and find the half-life.",
  aim:"Use dice to model the random nature of radioactive decay and determine the half-life of the model.",
  variables:{ iv:"Number of throws (models time)", dv:"Number of undecayed dice remaining", cv:["Same rule for decay","All remaining dice thrown each time"] },
  stageTitle:"Tray of dice", controlsTitle:"Throws",
  thumb:`<svg viewBox="0 0 300 140">${Array.from({length:30},(_,i)=>`<rect x="${40 + (i%10)*22}" y="${30 + Math.floor(i/10)*26}" width="16" height="16" rx="3" fill="${i%7===0 ? "#FF5C7A" : "#E5E7EB"}"/>`).join("")}<path d="M40 120 Q100 70 260 112" fill="none" stroke="#4DA3FF" stroke-width="3"/></svg>`,
  challenges:[
    { id:"curve", title:"Decay curve", text:"Keep throwing until fewer than 10 dice remain (or 10 throws)." },
    { id:"hl",    title:"Half-life", text:"Read the half-life (in throws) from your graph." },
    { id:"two",   title:"Random but predictable", text:"Do a second run and compare the two curves." }
  ],
  columns:[{key:"run",label:"Run"},{key:"n",label:"Throw",dp:0},{key:"left",label:"Remaining",dp:0},{key:"dec",label:"Decayed this throw",dp:0}],
  series:"run",
  graph:{ x:["n"], y:["left","dec"], fit:"curve" },
  questions:[
    { q:"Why is throwing dice a good model for radioactive decay?",
      a:"Decay is random — you cannot predict which nucleus will decay next, only the probability. Each die has the same 1/6 chance of ‘decaying’ on each throw, whatever happened before." },
    { q:"Define half-life.",
      a:"The time taken for half of the undecayed nuclei in a sample to decay (or for the activity to halve)." },
    { q:"Why doesn’t the number fall by exactly the same fraction every throw?",
      a:"Decay is random, so there are statistical fluctuations. They are larger (relatively) when fewer dice remain." },
    { q:"What would change if coins were used and ‘heads’ meant decayed?",
      a:"The probability of decay per throw is 1/2, so the half-life would be 1 throw — a much shorter half-life." }
  ],
  setup(ctx){
    let N0 = 100, kind = "dice", dice = [], throwNo = 0, run = 1, rolling = 0;
    const p = () => kind === "dice" ? 1/6 : 1/2;
    function fresh(){ dice = Array.from({ length:N0 }, () => ({ face:1 + Math.floor(Math.random()*6), dead:false, gone:false })); throwNo = 0; run = Math.max(1, ...ctx.rows().map(r => r.run + 1)); draw(); }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="hl-svg"><defs>${Kit.DEFS}</defs><rect x="60" y="70" width="840" height="400" rx="20" fill="#14532D" stroke="#713F12" stroke-width="10"/><g id="hl-dice"></g><text x="24" y="40" class="k-status" id="hl-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#hl-svg"), $ = s => svg.querySelector(s);
    const PIPS = { 1:[[0,0]], 2:[[-1,-1],[1,1]], 3:[[-1,-1],[0,0],[1,1]], 4:[[-1,-1],[1,-1],[-1,1],[1,1]], 5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]], 6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]] };
    function draw(){
      const live = dice.filter(d => !d.gone), cols = Math.ceil(Math.sqrt(live.length*2.2)), sz = Math.min(34, 760/Math.max(cols, 1));
      let s = "";
      live.forEach((d, i) => {
        const x = 100 + (i % cols)*(sz + 4) + (rolling ? (Math.random() - .5)*6 : 0), y = 100 + Math.floor(i/cols)*(sz + 4) + (rolling ? (Math.random() - .5)*6 : 0);
        const face = rolling ? 1 + Math.floor(Math.random()*6) : d.face, red = d.dead && !rolling;
        if(kind === "dice"){
          s += `<rect x="${x}" y="${y}" width="${sz}" height="${sz}" rx="${sz*.18}" fill="${red ? "#FF5C7A" : "#F8FAFC"}" stroke="#94A3B8"/>`;
          if(sz > 14) PIPS[face].forEach(([a, b]) => s += `<circle cx="${x + sz/2 + a*sz*.27}" cy="${y + sz/2 + b*sz*.27}" r="${sz*.08}" fill="${red ? "#fff" : "#111827"}"/>`);
        }else s += `<circle cx="${x + sz/2}" cy="${y + sz/2}" r="${sz/2}" fill="${red ? "#FF5C7A" : "url(#k-brass)"}" stroke="#713F12"/><text x="${x + sz/2}" y="${y + sz/2 + 4}" text-anchor="middle" style="font:700 ${sz*.4}px Inter;fill:#3F2A05">${rolling ? "?" : face % 2 ? "H" : "T"}</text>`;
      });
      $("#hl-dice").innerHTML = s;
      const left = dice.filter(d => !d.dead).length;
      $("#hl-status").textContent = rolling ? "Throwing…" : `Throw ${throwNo} — ${left} ${kind} remaining${dice.some(d => d.dead && !d.gone) ? " (red ones have decayed)" : ""}`;
      ctx.readout([["Run", String(run)], ["Throws", String(throwNo)], ["Remaining", String(left)], ["Rule", kind === "dice" ? "a six = decayed (p = 1/6)" : "heads = decayed (p = 1/2)"]]);
    }
    ctx.frame(dt => { if(rolling > 0){ rolling -= dt; if(rolling <= 0){ rolling = 0; settle(); } draw(); } });
    function settle(){
      let dec = 0;
      dice.forEach(d => { if(d.dead) return; d.face = 1 + Math.floor(Math.random()*6); const decays = kind === "dice" ? d.face === 6 : d.face % 2 === 1; if(decays){ d.dead = true; dec++; } });
      throwNo++;
      const left = dice.filter(d => !d.dead).length;
      ctx.record({ run, n:throwNo, left, dec }, true);
      if(left < 10 || throwNo >= 10) ctx.complete("curve");
      if(new Set(ctx.rows().map(r => r.run)).size >= 2) ctx.complete("two");
    }
    ctx.buttons([{ label:"Throw", primary:true, onClick(){
      if(rolling) return;
      if(!throwNo) ctx.record({ run, n:0, left:dice.length, dec:0 }, true);
      dice.forEach(d => { if(d.dead) d.gone = true; });
      if(!dice.some(d => !d.dead)) return ctx.toast("Everything has decayed — start a new run");
      rolling = .7;
    } }, { label:"New run", onClick:fresh }]);
    ctx.seg({ label:"Model", value:"dice", options:[["dice","Dice (six = decay)"],["coins","Coins (heads = decay)"]], onChange(v){ kind = v; fresh(); } });
    ctx.seg({ label:"Starting number", value:100, options:[[60,"60"],[100,"100"],[200,"200"]], onChange(v){ N0 = v; fresh(); } });
    Kit.answer(ctx, "Half-life of the model / throws", "e.g. 3.8", v => {
      const ideal = Math.log(2)/-Math.log(1 - p());
      if(Math.abs(v - ideal) <= (kind === "dice" ? .8 : .3)){ ctx.complete("hl"); return [true, `Good — theory gives ${ideal.toFixed(1)} throws (ln 2 ÷ −ln(1 − p)). Your graph will be close but not exact because decay is random.`]; }
      return [false, "Find where the curve falls to half the starting number, then to a quarter — the time for each halving is the half-life."];
    });
    fresh();
  }
});

/* ───────────── PENETRATING POWER (GM TUBE) ───────────── */
Lab.register({
  id:"penetration", subject:"physics", level:["igcse"], topic:"Nuclear physics · Radiation", interactive:true,
  title:"Penetrating power: α, β and γ",
  summary:"Measure background count, then put paper, aluminium and lead between a source and a GM tube. Identify a mystery source.",
  aim:"Investigate how well alpha, beta and gamma radiation penetrate different materials, and identify an unknown source.",
  variables:{ iv:"Absorber material and thickness (and distance)", dv:"Count in 60 s (corrected for background)", cv:["Same distance from source to tube","Same counting time","Same source"] },
  stageTitle:"Source, absorber and GM tube", controlsTitle:"Counting",
  thumb:`<svg viewBox="0 0 300 140"><rect x="40" y="56" width="40" height="28" rx="4" fill="#334155"/><circle cx="80" cy="70" r="6" fill="#FBBF24"/><rect x="140" y="30" width="10" height="80" fill="#94A3B8"/><rect x="200" y="58" width="80" height="24" rx="12" fill="#475569"/><path d="M90 70 H136" stroke="#FF5C7A" stroke-dasharray="4 4"/></svg>`,
  challenges:[
    { id:"bg",    title:"Background count", text:"Count with no source to measure background radiation." },
    { id:"three", title:"Stop each one", text:"Find an absorber that stops α, one that stops β, and test γ with lead." },
    { id:"x",     title:"Mystery source", text:"Identify the mystery source." }
  ],
  columns:[{key:"src",label:"Source"},{key:"abs",label:"Absorber"},{key:"d",label:"d / cm",dp:0},{key:"count",label:"Count in 60 s",dp:0},{key:"corr",label:"Corrected count",dp:0}],
  series:"src",
  graph:{ x:["d"], y:["corr","count"], fit:"curve" },
  questions:[
    { q:"Why is a background count taken first?",
      a:"There is always some background radiation (rocks, cosmic rays, buildings). It must be subtracted from each reading to find the count due to the source." },
    { q:"What stops alpha, beta and gamma radiation?",
      a:"Alpha: a sheet of paper (or a few cm of air). Beta: a few mm of aluminium. Gamma: reduced by thick lead or concrete, never stopped completely." },
    { q:"Why is it unsafe to hold a source in your hand?",
      a:"Ionising radiation can damage cells and DNA. Use tongs, keep the source away from the body, point it away from people and keep exposure time short." },
    { q:"Why are counts taken over 60 s (and repeated) rather than a few seconds?",
      a:"Decay is random. Counting for longer and repeating reduces the effect of random fluctuations." }
  ],
  setup(ctx){
    const BG = 18 + Math.floor(Math.random()*10);
    const SRC = { none:"No source", alpha:"Alpha (Am-241)", beta:"Beta (Sr-90)", gamma:"Gamma (Co-60)", x:"Mystery X" };
    const X = ["alpha","beta","gamma"][Math.floor(Math.random()*3)];
    const ABS = { none:["None",""], paper:["Paper","#F8FAFC"], al1:["Aluminium 1 mm","#CBD5E1"], al5:["Aluminium 5 mm","#94A3B8"], pb1:["Lead 1 cm","#475569"], pb2:["Lead 2 cm","#334155"] };
    let src = "none", abs = "none", d = 4, counting = 0, count = 0, tCount = 0, bgMeasured = null, ticks = [], audio = null;
    function rate(){                                   // counts per minute reaching the tube
      const kind = src === "x" ? X : src;
      let r = 0;
      if(kind === "alpha") r = d <= 5 && abs === "none" ? 3800*Math.pow(2/d, 2)*(1 - d/6) : 0;
      if(kind === "beta") r = 2600*Math.pow(2/d, 2)*({ none:1, paper:.92, al1:.28, al5:.002, pb1:0, pb2:0 }[abs]);
      if(kind === "gamma") r = 700*Math.pow(2/d, 2)*({ none:1, paper:1, al1:.98, al5:.93, pb1:.5, pb2:.26 }[abs]);
      return r + BG;
    }
    const poisson = mean => { if(mean > 50) return Math.max(0, Math.round(mean + Math.sqrt(mean)*ctx.gauss())); let L = Math.exp(-mean), k = 0, q = 1; do{ k++; q *= Math.random(); }while(q > L); return k - 1; };
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="gm-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 380)}<g id="gm-scene"></g><text x="24" y="34" class="k-status" id="gm-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#gm-svg"), $ = s => svg.querySelector(s);
    const SX = 180, PPC = 22;
    function draw(){
      const tx = SX + d*PPC;
      let s = `<rect x="${SX - 20}" y="380" width="${30*PPC + 40}" height="14" rx="3" fill="url(#k-wood)"/>`;
      for(let c = 0; c <= 30; c++){ const x = SX + c*PPC; s += `<line x1="${x}" y1="380" x2="${x}" y2="${c % 5 ? 386 : 391}" stroke="#4B3621"/>${c % 5 === 0 ? `<text x="${x}" y="406" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:var(--txt2)">${c}</text>` : ""}`; }
      s += `<text x="${SX + 15*PPC}" y="424" text-anchor="middle" class="k-lbl">distance from source / cm</text>`;
      s += `<g transform="translate(${SX} 300)"><rect x="-90" y="-26" width="90" height="52" rx="6" fill="#334155" stroke="#1F2937"/><rect x="-60" y="26" width="10" height="54" fill="url(#k-metal)"/>${src !== "none" ? `<circle r="8" fill="#FBBF24" stroke="#92400E"/><text x="-45" y="-34" text-anchor="middle" class="k-tag">${SRC[src]}</text>` : `<text x="-45" y="-34" text-anchor="middle" class="k-tag">empty holder</text>`}
        <path d="M-80 -16 l10 -10 M-80 16 l10 10" stroke="#FBBF24"/></g>`;
      if(abs !== "none"){ const w = { paper:2, al1:4, al5:10, pb1:14, pb2:24 }[abs]; s += `<rect x="${SX + d*PPC*.45 - w/2}" y="250" width="${w}" height="100" fill="${ABS[abs][1]}" stroke="#64748B"/><text x="${SX + d*PPC*.45}" y="240" text-anchor="middle" class="k-tag">${ABS[abs][0]}</text>`; }
      if(src !== "none" && rate() > BG + 5) for(let k = 0; k < 6; k++){ const ph = (Date.now()/600 + k/6) % 1; s += `<circle cx="${SX + 10 + ph*(tx - SX - 20)}" cy="${300 + Math.sin(k*7)*12}" r="2" fill="#FF5C7A" opacity="${(1 - ph).toFixed(2)}"/>`; }
      s += `<g id="gm-tube" class="k-drag" transform="translate(${tx} 300)"><rect x="0" y="-16" width="150" height="32" rx="16" fill="#475569" stroke="#1F2937"/><rect x="-6" y="-10" width="10" height="20" rx="3" fill="#F59E0B"/><text x="75" y="5" text-anchor="middle" style="font:700 11px Inter;fill:#E5E7EB">GM tube</text>
        <rect x="70" y="16" width="10" height="64" fill="url(#k-metal)"/><rect x="-10" y="-30" width="170" height="120" fill="transparent"/></g>`;
      s += `<g transform="translate(640 60)"><rect width="280" height="110" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="14" y="22" style="font:700 9px Inter;fill:#9CA3AF">COUNTER (60 s count)</text>
        <text x="266" y="66" text-anchor="end" class="k-lcd" style="font-size:28px">${String(count).padStart(5, "0")}</text>
        <text x="14" y="96" style="font:600 11px Inter;fill:#E5E7EB">time ${tCount.toFixed(0)} s</text><circle cx="250" cy="92" r="6" fill="${ticks.length ? "#FF5C7A" : "#4B5563"}"/></g>`;
      $("#gm-scene").innerHTML = s;
      $("#gm-status").textContent = counting ? "Counting…" : src === "none" ? "Count with no source to measure the background" : "Choose an absorber and count for 60 s";
      ctx.readout([["Source", SRC[src]], ["Absorber", ABS[abs][0]], ["Distance", d + " cm"], ["Background", bgMeasured === null ? "not measured" : bgMeasured + " per minute"]]);
    }
    function click(){ try{ audio = audio || new (window.AudioContext || window.webkitAudioContext)(); const o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = 1800; g.gain.value = .04; o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + .004); }catch(e){} }
    let mean60 = 0, target = 0;
    ctx.frame(dt => {
      if(counting){
        const step = Math.min(dt*10, 60 - tCount); tCount += step;
        const expected = target*tCount/60;
        while(count < Math.round(expected)){ count++; if(count % Math.max(1, Math.round(target/120)) === 0){ ticks.push(1); if(Math.random() < .5) click(); } }
        if(tCount >= 60){ counting = 0; done(); }
      }
      ticks = ticks.slice(-1); if(Math.random() < .3) ticks = [];
      draw();
    });
    function done(){
      const corr = bgMeasured === null || src === "none" ? null : Math.max(0, count - bgMeasured);
      ctx.record({ src:SRC[src], abs:ABS[abs][0], d, count, corr });
      if(src === "none"){ bgMeasured = count; ctx.complete("bg"); }
      const rows = ctx.rows(), lowAlpha = rows.some(r => r.src.startsWith("Alpha") && r.abs !== "None" && r.count < BG*2),
        lowBeta = rows.some(r => r.src.startsWith("Beta") && /Aluminium 5|Lead/.test(r.abs) && r.count < BG*2), g = rows.some(r => r.src.startsWith("Gamma") && /Lead/.test(r.abs));
      if(lowAlpha && lowBeta && g) ctx.complete("three");
    }
    Kit.dragger(ctx, svg, { hit(tg){ return !counting && tg.closest("#gm-tube") ? "t" : null; }, move(k, p){ d = Kit.clamp(Math.round((p.x - SX)/PPC), 1, 30); draw(); } });
    ctx.select({ label:"Source", value:"none", options:Object.entries(SRC), onChange(v){ src = v; count = 0; tCount = 0; } });
    ctx.select({ label:"Absorber (placed between source and tube)", value:"none", options:Object.entries(ABS).map(([k, v]) => [k, v[0]]), onChange(v){ abs = v; count = 0; tCount = 0; } });
    ctx.buttons([{ label:"Count for 60 s", primary:true, block:true, onClick(){ if(counting) return; count = 0; tCount = 0; target = poisson(rate()); counting = 1; try{ audio = audio || new (window.AudioContext || window.webkitAudioContext)(); audio.resume && audio.resume(); }catch(e){} } }]);
    const idBox = ctx.html(`<div class="ctl"><label><span>Mystery X emits…</span></label><div style="display:flex;gap:6px"><select class="inp"><option value="">choose</option><option value="alpha">alpha</option><option value="beta">beta</option><option value="gamma">gamma</option></select><button class="btn small" type="button">Check</button></div><div style="margin-top:8px"></div></div>`);
    idBox.querySelector("button").onclick = () => {
      const v = idBox.querySelector("select").value, fb = idBox.querySelector("div:last-child");
      const tested = ctx.rows().filter(r => r.src === "Mystery X").length;
      if(tested < 2){ fb.innerHTML = `<div class="note bad">Test Mystery X with at least two different absorbers first.</div>`; return; }
      if(v === X){ ctx.complete("x"); fb.innerHTML = `<div class="note ok">Correct — Mystery X is a ${X} source.</div>`; }
      else fb.innerHTML = `<div class="note bad">Not quite — what stops it? Paper → α, a few mm aluminium → β, only reduced by lead → γ.</div>`;
    };
    ctx.html(`<p class="hint">The 60 s count runs ten times faster than real time. Drag the GM tube to change the distance.</p>`);
    draw();
  }
});
