"use strict";
/* ══════════════════════════════════════════════════════════════════
   TITRATION BENCH (IGCSE Chemistry) — hands-on
   Drag the NaOH bottle to fill the burette, pipette 25.0 cm³ of acid,
   drop in indicator, turn the tap, swirl the flask and read the
   meniscus through a magnifier.
══════════════════════════════════════════════════════════════════ */
(function(){
  const CB = 0.100, VA = 25.0;
  const BX = 380, Y0 = 60, PX = 6;                 // burette: 0.00 cm³ at y=60, 6 px per cm³
  const FLASK = "M368 404 V436 L313 500 Q309 508 318 508 H442 Q451 508 447 500 L392 436 V404";
  const HOME = { naoh:[750, 0], pip:[560, 0], phen:[842, 0], mo:[905, 0] };
  const IND = {
    phen:{ name:"Phenolphthalein", col(p){ if(p < 8.2) return [235,240,248,.18]; const f = Math.min(1, (p - 8.2)/1.6); return [mix(245,214,f), mix(160,40,f), mix(210,140,f), .35 + .5*f]; }, base:[214,40,140] },
    mo:  { name:"Methyl orange",   col(p){ if(p < 3.1) return [225,45,45,.8]; if(p > 4.4) return [245,200,40,.8]; const f = (p - 3.1)/1.3; return [mix(225,245,f), mix(45,200,f), mix(45,40,f), .8]; }, base:[245,200,40] }
  };
  function mix(a, b, f){ return Math.round(a + (b - a)*Math.max(0, Math.min(1, f))); }
  const rgba = c => `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`;
  const colourName = (ind, p) => ind === "phen" ? (p < 8.2 ? "colourless" : p < 9 ? "pale pink" : "pink") : (p < 3.1 ? "red" : p > 4.4 ? "yellow" : "orange");

  Lab.register({
    id:"titration-bench", subject:"chemistry", topic:"Acids, bases & salts", interactive:true,
    title:"Titration bench",
    summary:"Fill the burette, pipette the acid, add indicator, turn the tap by hand and swirl until the colour just changes. Read the meniscus yourself.",
    aim:"Find the concentration of a hydrochloric acid solution by titration with 0.100 mol/dm³ sodium hydroxide.",
    variables:{ iv:"Volume of NaOH added from the burette (cm³)", dv:"Colour of the indicator (end point)", cv:["25.0 cm³ acid by pipette","2–3 drops of the same indicator","Swirl after each addition"] },
    stageTitle:"Lab bench", controlsTitle:"Readings & results",
    thumb:`<svg viewBox="0 0 300 140"><rect x="141" y="6" width="14" height="90" rx="3" fill="#7DD3FC" fill-opacity=".25" stroke="#A2ACBD" stroke-width="2"/><rect x="143" y="30" width="10" height="64" fill="#9EC9F0" fill-opacity=".7"/>
      <path d="M142 96h12M148 96v12" stroke="#A2ACBD" stroke-width="2"/><circle cx="148" cy="114" r="2.6" fill="#9EC9F0"><animate attributeName="cy" values="106;124" dur="1s" repeatCount="indefinite"/></circle>
      <path d="M138 104v8L112 132h72l-26-20v-8" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M121 125h54l9 7h-72z" fill="#F06BB7"/></svg>`,
    steps:[
      { id:"fill",      text:"Fill the burette: drag the <b>NaOH</b> bottle up to the top of the burette." },
      { id:"pipette",   text:"Drag the <b>pipette</b> into the acid beaker to fill it, then over the flask to release 25.0 cm³." },
      { id:"indicator", text:"Hold an <b>indicator</b> bottle over the flask for 2–3 drops." },
      { id:"initial",   text:"Read the burette with the magnifier and enter the <b>initial reading</b>." },
      { id:"titrate",   text:"Drag the <b>tap</b> to add alkali; drag the flask side-to-side to <b>swirl</b>. Stop when the colour just stays." },
      { id:"final",     text:"Enter the <b>final reading</b> to record your titre. Repeat until you have concordant titres." }
    ],
    columns:[{key:"run",label:"Run",dp:0},{key:"ind",label:"Indicator"},{key:"start",label:"Initial / cm³",dp:2},{key:"end",label:"Final / cm³",dp:2},{key:"titre",label:"Titre / cm³",dp:2}],
    questions:[
      { q:"Why is the flask swirled during the titration?",
        a:"To mix the alkali into all the acid. Without swirling, a drop can turn the indicator locally even though the bulk solution is still acidic — you would stop too early." },
      { q:"Why are burette readings recorded to 2 decimal places, ending in 0 or 5?",
        a:"A burette can be read to the nearest half division, ±0.05 cm³. Read the bottom of the meniscus at eye level." },
      { q:"Why is a white tile placed under the flask?",
        a:"So the colour change at the end point is easier to see." },
      { q:"The mean titre is 22.50 cm³. Calculate the concentration of the acid.",
        a:"n(NaOH) = 0.100 × 22.50/1000 = 0.00225 mol. NaOH + HCl → NaCl + H₂O, so n(HCl) = 0.00225 mol in 25.0 cm³. c = 0.00225 ÷ 0.0250 = 0.0900 mol/dm³." }
    ],
    setup(ctx){
      const cA = Math.round((0.075 + Math.random()*0.045)*1000)/1000;   // hidden
      const Veq = cA*VA/CB;
      let bur = { r:52 };                     // reading at liquid surface; >51 means empty
      let flask = { acid:0, mixed:0, plume:0, drops:0, ind:null };
      let tap = 0, run = 1, initial = null, swirl = 0, flaskX = 0, flaskV = 0, lens = true, warned = false, emptyWarned = false;
      const objs = {};                       // drag offsets for movable apparatus
      Object.keys(HOME).forEach(k => objs[k] = { dx:0, dy:0 });
      let pipFill = 0;                       // 0 empty … 1 filled to the mark
      const tweens = [];

      /* ── chemistry ── */
      function pHof(added){
        const nA = cA*flask.acid/1000, nB = CB*added/1000, Vt = (flask.acid + added)/1000;
        if(!flask.acid) return added > 0 ? 13 : 7;
        if(Math.abs(nA - nB) < 1e-10) return 7;
        return nA > nB ? -Math.log10((nA - nB)/Vt) : 14 + Math.log10((nB - nA)/Vt);
      }
      const bulkPH = () => pHof(flask.mixed);
      const added = () => flask.mixed + flask.plume;
      const reading = () => Math.min(50, bur.r);

      /* ── drawing ── */
      let ticks = "";
      for(let v=0; v<=50; v++){
        const y = Y0 + v*PX, w = v % 5 === 0 ? 9 : 5;
        ticks += `<line x1="${BX - 10}" y1="${y}" x2="${BX - 10 + w}" y2="${y}" stroke="var(--txt2)" stroke-width=".8"/>`;
        if(v % 5 === 0) ticks += `<text x="${BX - 15}" y="${y + 3.5}" text-anchor="end" class="tb-num">${v}</text>`;
      }
      ctx.stage.innerHTML = `
      <svg viewBox="0 0 960 560" id="tb-svg" aria-label="Titration bench with burette, conical flask, pipette, acid, sodium hydroxide and indicators">
        <defs>
          <clipPath id="tb-fl"><path d="${FLASK}"/></clipPath>
          <clipPath id="tb-bur"><rect x="${BX - 9}" y="30" width="18" height="345"/></clipPath>
          <clipPath id="tb-lensclip"><circle cx="0" cy="0" r="64"/></clipPath>
          <linearGradient id="tb-glass" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".25" stop-color="#fff" stop-opacity=".05"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".15"/></linearGradient>
          <linearGradient id="tb-metal" x1="0" x2="1"><stop offset="0" stop-color="#6B7486"/><stop offset=".5" stop-color="#A9B1C0"/><stop offset="1" stop-color="#5A6272"/></linearGradient>
        </defs>
        <rect x="0" y="520" width="960" height="40" fill="color-mix(in srgb,var(--bg-card) 85%,#5a4630 15%)"/>
        <line x1="0" y1="520" x2="960" y2="520" stroke="var(--brd2)"/>
        <!-- stand -->
        <rect x="230" y="506" width="220" height="14" rx="4" fill="url(#tb-metal)"/>
        <rect x="262" y="30" width="9" height="480" rx="3" fill="url(#tb-metal)"/>
        <rect x="262" y="150" width="${BX - 262 - 8}" height="8" rx="3" fill="url(#tb-metal)"/>
        <rect x="${BX - 14}" y="143" width="28" height="22" rx="5" fill="#3A4252"/>
        <rect x="300" y="508" width="160" height="12" rx="2" fill="#F4F4F2" stroke="#C9CCD3"/>
        <!-- burette -->
        <rect id="tb-bliq" x="${BX - 9}" width="18" clip-path="url(#tb-bur)"/>
        <path id="tb-men" fill="none" stroke="rgba(120,160,210,.9)" stroke-width="1.5"/>
        <rect x="${BX - 10}" y="30" width="20" height="342" rx="3" fill="url(#tb-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
        ${ticks}
        <text x="${BX + 16}" y="44" class="tb-lbl">NaOH 0.100 mol/dm³</text>
        <path d="M${BX - 4} 374 L${BX - 2} 398 H${BX + 2} L${BX + 4} 374" fill="url(#tb-glass)" stroke="var(--txt2)" stroke-width="1.4"/>
        <rect x="${BX - 13}" y="366" width="26" height="12" rx="4" fill="#C9CDD6" stroke="#7D8696"/>
        <g id="tb-tap" transform="translate(${BX} 372)" class="drag"><rect x="-4" y="-26" width="8" height="52" rx="4" fill="#3B82F6" stroke="#1E3A8A"/><circle r="7" fill="#1E3A8A"/><rect x="-30" y="-30" width="60" height="60" fill="transparent"/></g>
        <text x="${BX + 34}" y="368" class="tb-hint" id="tb-taphint">drag the tap ↻</text>
        <g id="tb-stream"></g>
        <!-- flask -->
        <g id="tb-flask" class="drag">
          <rect x="300" y="400" width="160" height="110" fill="transparent"/>
          <g clip-path="url(#tb-fl)"><path id="tb-fliq"/><ellipse id="tb-plume" cx="380" rx="20" ry="9"/></g>
          <path d="${FLASK}" fill="url(#tb-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
          <text x="380" y="530" text-anchor="middle" class="tb-lbl">conical flask</text>
        </g>
        <!-- acid beaker -->
        <g><path d="M610 430 V500 Q610 508 618 508 H682 Q690 508 690 500 V430" fill="none"/>
          <rect x="612" y="452" width="76" height="55" rx="4" fill="rgba(200,220,240,.35)"/>
          <path d="M608 428 L610 430 V500 Q610 508 618 508 H682 Q690 508 690 500 V430 L692 428" fill="url(#tb-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
          <text x="650" y="476" text-anchor="middle" class="tb-tag">HCl(aq)</text><text x="650" y="490" text-anchor="middle" class="tb-tag2">unknown</text></g>
        <!-- NaOH bottle -->
        <g id="tb-naoh" class="drag"><path d="M730 420 Q730 408 742 404 V388 H758 V404 Q770 408 770 420 V505 Q770 510 765 510 H735 Q730 510 730 505 Z" fill="rgba(200,220,240,.35)" stroke="var(--txt2)" stroke-width="1.5"/>
          <rect x="740" y="380" width="20" height="10" rx="2" fill="#4B5563"/><rect x="734" y="440" width="32" height="40" rx="3" fill="#F8FAFC"/>
          <text x="750" y="458" text-anchor="middle" class="tb-tagd">NaOH</text><text x="750" y="471" text-anchor="middle" class="tb-tagd2">0.100 M</text></g>
        <!-- pipette -->
        <g id="tb-pip" class="drag">
          <rect x="540" y="92" width="40" height="296" fill="transparent"/>
          <rect x="548" y="96" width="24" height="26" rx="10" fill="#E2465B"/>
          <g id="tb-pipliq"></g>
          <path d="M557 120 V226 Q548 236 548 260 Q548 290 557 296 V374 L559 384 H561 L563 374 V296 Q572 290 572 260 Q572 236 563 226 V120" fill="url(#tb-glass)" stroke="var(--txt2)" stroke-width="1.4"/>
          <line x1="554" y1="190" x2="566" y2="190" stroke="var(--txt)" stroke-width="1.5"/><text x="576" y="194" class="tb-tag2" style="fill:var(--txt3)">25.0 cm³</text>
        </g>
        <!-- indicator droppers -->
        ${["phen","mo"].map(k => `<g id="tb-${k}" class="drag">
          <path d="M${HOME[k][0] - 17} 462 V505 Q${HOME[k][0] - 17} 510 ${HOME[k][0] - 12} 510 H${HOME[k][0] + 12} Q${HOME[k][0] + 17} 510 ${HOME[k][0] + 17} 505 V462 Q${HOME[k][0] + 17} 452 ${HOME[k][0] + 6} 450 H${HOME[k][0] - 6} Q${HOME[k][0] - 17} 452 ${HOME[k][0] - 17} 462Z" fill="${k === "phen" ? "rgba(235,240,248,.4)" : "rgba(245,140,40,.75)"}" stroke="var(--txt2)" stroke-width="1.4"/>
          <rect x="${HOME[k][0] - 4}" y="420" width="8" height="32" rx="2" fill="url(#tb-glass)" stroke="var(--txt2)"/><rect x="${HOME[k][0] - 7}" y="408" width="14" height="16" rx="6" fill="#111827"/>
          <text x="${HOME[k][0]}" y="534" text-anchor="middle" class="tb-tag2" style="fill:var(--txt2)">${k === "phen" ? "phenolph." : "methyl or."}</text></g>`).join("")}
        <g id="tb-drops"></g>
        <!-- magnifier -->
        <g id="tb-lensg" style="pointer-events:none"><line id="tb-lensline" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="3 3"/>
          <g id="tb-lensin"><circle r="66" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="3"/><g clip-path="url(#tb-lensclip)" id="tb-zoom"></g>
          <line x1="-64" y1="0" x2="-48" y2="0" stroke="var(--hi)" stroke-width="1" opacity=".0"/></g></g>
        <text x="20" y="34" class="tb-status" id="tb-status"></text>
      </svg>`;
      const svg = ctx.stage.querySelector("#tb-svg"), $ = s => svg.querySelector(s);
      const css = document.createElement("style");
      css.textContent = `#tb-svg{touch-action:none}
        #tb-svg .tb-num{font:500 9px 'JetBrains Mono',monospace;fill:var(--txt2)}
        #tb-svg .tb-lbl{font:500 11px Inter,sans-serif;fill:var(--txt3)}
        #tb-svg .tb-hint{font:600 11px Inter,sans-serif;fill:var(--accent)}
        #tb-svg .tb-tag{font:700 12px Inter,sans-serif;fill:var(--txt)} #tb-svg .tb-tag2{font:500 10px Inter,sans-serif;fill:var(--txt2)}
        #tb-svg .tb-tagd{font:700 11px Inter,sans-serif;fill:#0E1420} #tb-svg .tb-tagd2{font:500 9px Inter,sans-serif;fill:#334155}
        #tb-svg .tb-status{font:600 14px 'Space Grotesk',sans-serif;fill:var(--txt)}
        #tb-svg .drag:hover{filter:drop-shadow(0 0 6px color-mix(in srgb,var(--accent) 60%,transparent))}`;
      ctx.stage.appendChild(css);

      function setPos(k){ const o = objs[k]; $("#tb-" + k).setAttribute("transform", `translate(${o.dx} ${o.dy})`); }
      function home(k, dur){ const o = objs[k]; tweens.push({ k, fx:o.dx, fy:o.dy, t:0, dur:dur || .35 }); }

      function draw(){
        // burette liquid + meniscus
        const y = Y0 + bur.r*PX, empty = bur.r > 51.3;
        $("#tb-bliq").setAttribute("y", empty ? 380 : y); $("#tb-bliq").setAttribute("height", empty ? 0 : Math.max(0, 375 - y));
        $("#tb-bliq").setAttribute("fill", "rgba(170,205,240,.55)");
        $("#tb-men").setAttribute("d", empty || bur.r > 50 ? "" : `M${BX - 9} ${y - 3} Q${BX} ${y + 2} ${BX + 9} ${y - 3}`);
        // flask liquid
        const vol = flask.acid + added();
        if(vol > 0){
          const ly = 500 - vol*0.62, tilt = Math.max(-10, Math.min(10, flaskV*0.25));
          $("#tb-fliq").setAttribute("d", `M300 ${ly - tilt} Q380 ${ly + 4 + Math.abs(tilt)*.3} 460 ${ly + tilt} V520 H300 Z`);
          const p = bulkPH(), c = flask.ind ? IND[flask.ind].col(p) : [200,220,240,.35];
          if(flask.drops > 6 && flask.ind) c[3] = Math.min(.95, c[3] + .15);
          $("#tb-fliq").setAttribute("fill", rgba(c));
          const pl = flask.ind && flask.plume > 0.002 ? Math.min(.9, flask.plume*14) : 0;
          const bc = flask.ind ? IND[flask.ind].base : [0,0,0];
          $("#tb-plume").setAttribute("cy", ly + 10); $("#tb-plume").setAttribute("fill", `rgba(${bc},${pl.toFixed(2)})`);
          $("#tb-plume").setAttribute("rx", 14 + flask.plume*80);
        }else{ $("#tb-fliq").setAttribute("d", ""); $("#tb-plume").setAttribute("fill", "none"); }
        $("#tb-flask").setAttribute("transform", `translate(${flaskX} 0)`);
        // tap
        $("#tb-tap").querySelector("rect").setAttribute("transform", `rotate(${90 - tap})`);
        // pipette contents (filled to the mark)
        const lvl = 384 - (384 - 190)*pipFill;
        $("#tb-pipliq").innerHTML = pipFill > 0.01 ? `<clipPath id="tb-pc"><rect x="540" y="${lvl}" width="40" height="${384 - lvl}"/></clipPath>
          <path clip-path="url(#tb-pc)" d="M558 120 V227 Q549 236 549 260 Q549 290 558 296 V374 L559.5 383 H560.5 L562 374 V296 Q571 290 571 260 Q571 236 562 227 V120" fill="rgba(200,220,240,.75)"/>` : "";
        // magnifier tracks the meniscus
        $("#tb-lensg").style.display = lens && !empty ? "" : "none";
        if(lens && !empty){
          const cy = Math.max(120, Math.min(300, y)), cx = BX - 128;
          $("#tb-lensin").setAttribute("transform", `translate(${cx} ${cy})`);
          const ln = $("#tb-lensline"); ln.setAttribute("x1", BX - 30); ln.setAttribute("y1", y); ln.setAttribute("x2", cx + 66); ln.setAttribute("y2", cy);
          zoom(bur.r);
        }
        status();
      }
      function zoom(r){
        const S = 70, z = $("#tb-zoom");
        let h = `<rect x="-66" y="-66" width="132" height="132" fill="#F7F9FC"/>`;
        const top = Math.max(0, Math.floor((r - 1)*10)/10), bot = Math.min(50, r + 1);
        h += `<rect x="-66" y="${(Math.min(50, r) - r)*S}" width="132" height="200" fill="rgba(150,195,240,.55)"/>`;
        h += `<path d="M-66 -8 Q0 8 66 -8" transform="translate(0 ${(Math.min(50, r) - r)*S})" fill="rgba(150,195,240,.55)" stroke="rgba(70,120,190,.9)" stroke-width="2"/>`;
        for(let v = Math.ceil(top*10)/10; v <= bot + 1e-9; v = Math.round((v + 0.1)*10)/10){
          const y = (v - r)*S, whole = Math.abs(v - Math.round(v)) < 1e-6, half = Math.abs(v*10 % 5) < 1e-6;
          h += `<line x1="-30" y1="${y}" x2="${whole ? 12 : half ? 0 : -14}" y2="${y}" stroke="#111827" stroke-width="${whole ? 1.6 : 1}"/>`;
          if(whole) h += `<text x="18" y="${y + 5}" style="font:600 14px 'JetBrains Mono',monospace;fill:#111827">${Math.round(v)}</text>`;
        }
        h += `<line x1="-66" y1="0" x2="-40" y2="0" stroke="rgba(224,51,90,.6)" stroke-width="1" stroke-dasharray="2 2"/>`;
        z.innerHTML = h;
      }
      function status(){
        const s = !ctx.stepDone("fill") ? "Step 1: fill the burette" : !ctx.stepDone("pipette") ? "Step 2: pipette 25.0 cm³ of acid into the flask"
          : !ctx.stepDone("indicator") ? "Step 3: add a few drops of indicator" : !ctx.stepDone("initial") ? "Step 4: read and enter the initial burette reading"
          : !ctx.stepDone("titrate") ? "Step 5: titrate — turn the tap and swirl" : "Step 6: read the final burette reading";
        $("#tb-status").textContent = `Titration ${run} · ${s}`;
        ctx.readout([["Run", String(run)], ["Flask", flask.acid ? `${flask.acid.toFixed(1)} cm³ acid` : "empty"], ["Indicator", flask.ind ? `${IND[flask.ind].name} (${flask.drops} drops)` : "none"],
          ["Colour", flask.ind ? colourName(flask.ind, bulkPH()) : "—", flask.ind && bulkPH() > (flask.ind === "phen" ? 8.2 : 4.4) ? "good" : ""],
          ["Tap", tap < 3 ? "closed" : tap < 40 ? "dropwise" : "open", tap >= 40 ? "warn" : ""]]);
      }

      /* ── interaction ── */
      ctx.drag(svg, $("#tb-tap"), {
        onMove(p){ const a = Math.atan2(p.y - 372, p.x - BX)*180/Math.PI; tap = Math.max(0, Math.min(90, a)); $("#tb-taphint").style.display = "none"; draw(); }
      });
      let lastX = 0;
      ctx.drag(svg, $("#tb-flask"), {
        onStart(p){ lastX = p.x; },
        onMove(p, p0){ const dx = Math.max(-26, Math.min(26, p.x - p0.x)); flaskV = (p.x - lastX)*8; lastX = p.x; flaskX = dx; swirl = Math.min(3, swirl + Math.abs(flaskV)/400); },
      });
      function draggable(k, onMove, onDrop){
        ctx.drag(svg, $("#tb-" + k), {
          onMove(p, p0){ objs[k].dx = p.x - p0.x; objs[k].dy = p.y - p0.y; setPos(k); onMove && onMove(); },
          onEnd(){ onDrop && onDrop(); home(k); }
        });
      }
      // NaOH bottle → burette top
      draggable("naoh", null, () => {
        const top = [750 + objs.naoh.dx, 384 + objs.naoh.dy];
        if(Math.abs(top[0] - BX) < 60 && top[1] < 120){
          const target = Math.round(Math.random()*20)*0.05;
          tweens.push({ fill:true, from:Math.min(bur.r, 52), to:target, t:0, dur:1.4 });
          ctx.toast("Filling the burette…");
        }else if(Math.abs(top[0] - BX) < 60) ctx.toast("Lift the bottle higher — pour in at the top of the burette");
      });
      // pipette: fill in the acid beaker, empty into the flask
      draggable("pip", null, () => {
        const tip = [560 + objs.pip.dx, 384 + objs.pip.dy];
        if(tip[0] > 612 && tip[0] < 688 && tip[1] > 445 && tip[1] < 512){
          if(pipFill > .99){ ctx.toast("Pipette is already filled to the mark"); return; }
          tweens.push({ pip:true, from:pipFill, to:1, t:0, dur:1.1 }); ctx.toast("Filled to the 25.0 cm³ mark");
        }else if(tip[0] > 350 + flaskX && tip[0] < 410 + flaskX && tip[1] > 380 && tip[1] < 480){
          if(pipFill < .99){ ctx.toast("Fill the pipette from the acid beaker first"); return; }
          if(flask.acid){ ctx.toast("The flask already contains 25.0 cm³ of acid"); return; }
          tweens.push({ pip:true, from:1, to:0, t:0, dur:1.2, done(){ flask.acid = VA; ctx.step("pipette"); } });
        }
      });
      // indicators: drip while held over the flask
      let dripT = 0, dripping = null;
      ["phen","mo"].forEach(k => draggable(k, () => {
        const tip = [HOME[k][0] + objs[k].dx, 510 + objs[k].dy];
        dripping = tip[0] > 340 + flaskX && tip[0] < 420 + flaskX && tip[1] > 330 && tip[1] < 430 ? k : null;
      }, () => { dripping = null; }));

      const stream = $("#tb-stream"), dropsG = $("#tb-drops");
      let drops = [];
      ctx.frame(dt => {
        // tweens (apparatus returning home, filling, pipetting)
        for(let i = tweens.length - 1; i >= 0; i--){
          const tw = tweens[i]; tw.t += dt; const f = Math.min(1, tw.t/tw.dur), e = 1 - Math.pow(1 - f, 3);
          if(tw.k){ objs[tw.k].dx = tw.fx*(1 - e); objs[tw.k].dy = tw.fy*(1 - e); setPos(tw.k); }
          if(tw.fill) bur.r = tw.from + (tw.to - tw.from)*e;
          if(tw.pip) pipFill = tw.from + (tw.to - tw.from)*e;
          if(f >= 1){ tweens.splice(i, 1); if(tw.fill){ bur.r = tw.to; ctx.step("fill"); } tw.done && tw.done(); }
        }
        // burette flow
        const rate = tap < 3 ? 0 : 2.4*Math.pow(tap/90, 2);           // cm³ per second
        if(rate > 0 && bur.r <= 51){
          const dv = Math.min(rate*dt, 51.3 - bur.r);
          bur.r += dv;
          flask.plume += dv;
          if(tap < 40){ dripT += dt; if(dripT > 0.05/Math.max(rate, 1e-3)){ dripT = 0; drops.push({ x:BX, y:398, vy:0, c:"rgba(160,200,240,.95)" }); } }
          if(!flask.acid && flask.plume > 0.3 && !warned){ warned = true; ctx.toast("The flask is empty — pipette the acid in first"); }
          if(ctx.stepDone("initial")) ctx.step("titrate");
        }
        if(bur.r > 51.2 && rate > 0 && !emptyWarned){ emptyWarned = true; ctx.toast("The burette has run dry — refill it"); }
        stream.innerHTML = rate >= 0.6 && bur.r <= 51 ? `<path d="M${BX} 398 Q${BX + flaskX*.3} 440 ${BX + flaskX*.5} 480" stroke="rgba(160,200,240,.85)" stroke-width="${1 + rate}" fill="none"/>` : "";
        // indicator drops
        if(dripping){ dripT += dt; if(dripT > .55){ dripT = 0; drops.push({ x:HOME[dripping][0] + objs[dripping].dx, y:512 + objs[dripping].dy, vy:0, ind:dripping, c: dripping === "phen" ? "rgba(235,240,248,.95)" : "rgba(245,140,40,.95)" }); } }
        const surf = 500 - (flask.acid + added())*0.62;
        for(let i = drops.length - 1; i >= 0; i--){
          const d = drops[i]; d.vy += 900*dt; d.y += d.vy*dt;
          if(d.y > Math.min(surf, 506)){
            drops.splice(i, 1);
            if(d.ind){ if(flask.ind && flask.ind !== d.ind) ctx.toast("Two different indicators mixed — start a new titration"); flask.ind = d.ind; flask.drops++; if(flask.drops >= 2) ctx.step("indicator"); if(flask.drops === 7) ctx.toast("That’s a lot of indicator — 2 or 3 drops is enough"); }
          }
        }
        dropsG.innerHTML = drops.map(d => `<ellipse cx="${d.x}" cy="${d.y}" rx="2.6" ry="3.6" fill="${d.c}"/>`).join("");
        // mixing: the plume of fresh alkali disperses (much faster when swirled)
        const k = 0.25 + 4*swirl;
        const mixd = flask.plume*(1 - Math.exp(-k*dt)); flask.plume -= mixd; flask.mixed += mixd;
        swirl *= Math.exp(-2.5*dt);
        flaskX *= Math.exp(-6*dt); flaskV *= Math.exp(-6*dt);
        draw();
      });

      /* ── side panel: readings, titres, calculation ── */
      const box = ctx.html(`<div>
        <div class="ctl"><label for="tb-i"><span>Initial reading / cm³</span></label>
          <div style="display:flex;gap:6px"><input class="inp" id="tb-i" type="number" step="0.05" placeholder="e.g. 0.50"><button class="btn small" id="tb-ib" type="button">Enter</button></div></div>
        <div class="ctl"><label for="tb-f"><span>Final reading / cm³</span></label>
          <div style="display:flex;gap:6px"><input class="inp" id="tb-f" type="number" step="0.05" placeholder="e.g. 23.45"><button class="btn small primary" id="tb-fb" type="button">Record titre</button></div></div>
        <div id="tb-msg"></div>
        <div class="btns" style="margin:10px 0 14px"><button class="btn small" id="tb-drop" type="button">Add 1 drop</button><button class="btn small" id="tb-close" type="button">Close tap</button>
          <button class="btn small ghost" id="tb-new" type="button">Wash flask · next run</button><button class="btn small ghost" id="tb-lens" type="button">Hide magnifier</button></div>
        <div id="tb-sum" class="hint"></div>
        <div class="ctl" style="margin-top:12px"><label for="tb-c"><span>Concentration of HCl / mol dm⁻³</span></label>
          <div style="display:flex;gap:6px"><input class="inp" id="tb-c" type="number" step="0.0001" placeholder="e.g. 0.0950"><button class="btn small" id="tb-cb" type="button">Check</button></div><div id="tb-cfb" style="margin-top:8px"></div></div>
      </div>`);
      const q = s => box.querySelector(s), msg = (t, ok) => { q("#tb-msg").innerHTML = `<div class="note ${ok ? "ok" : "bad"}" style="margin-bottom:6px">${t}</div>`; };
      const readOk = v => isFinite(v) && Math.abs(v - Math.round(reading()/0.05)*0.05) <= 0.051;
      q("#tb-ib").onclick = () => {
        if(!ctx.stepDone("fill")){ msg("Fill the burette first."); return; }
        const v = parseFloat(q("#tb-i").value);
        if(!readOk(v)){ msg("Look again — read the bottom of the meniscus to 2 d.p. (ending in 0 or 5)."); return; }
        if(added() > 0.02 && !ctx.stepDone("initial")){ msg("Some alkali has already run out. Take the initial reading before opening the tap."); }
        initial = Math.round(reading()/0.05)*0.05; ctx.step("initial"); msg(`Initial reading ${initial.toFixed(2)} cm³ ✓`, true);
      };
      q("#tb-fb").onclick = () => {
        if(initial === null){ msg("Enter the initial reading first."); return; }
        const v = parseFloat(q("#tb-f").value);
        if(!readOk(v)){ msg("Look again at the final reading — bottom of the meniscus, 2 d.p."); return; }
        const end = Math.round(reading()/0.05)*0.05, titre = Math.round((end - initial)*100)/100;
        if(titre <= 0){ msg("No alkali has been added yet."); return; }
        ctx.record({ run, ind: flask.ind ? IND[flask.ind].name : "none", start:initial, end, titre });
        ctx.step("final");
        const over = flask.mixed + flask.plume - Veq;
        msg(`Titre ${titre.toFixed(2)} cm³ recorded.${over > 0.3 ? " The colour looks very strong — you may have overshot the end point." : ""}`, true);
        summary();
      };
      q("#tb-drop").onclick = () => { if(bur.r > 51){ ctx.toast("Fill the burette first"); return; } bur.r += 0.05; flask.plume += 0.05; drops.push({ x:BX, y:398, vy:0, c:"rgba(160,200,240,.95)" }); if(ctx.stepDone("initial")) ctx.step("titrate"); };
      q("#tb-close").onclick = () => { tap = 0; };
      q("#tb-lens").onclick = e => { lens = !lens; e.target.textContent = lens ? "Hide magnifier" : "Show magnifier"; };
      q("#tb-new").onclick = () => {
        flask = { acid:0, mixed:0, plume:0, drops:0, ind:null }; initial = null; tap = 0; run = Math.max(run, ...ctx.rows().map(r => r.run + 1), 1);
        q("#tb-i").value = ""; q("#tb-f").value = ""; q("#tb-msg").innerHTML = "";
        const filled = bur.r <= 50; ctx.resetSteps(); if(filled) ctx.step("fill");
        ctx.toast(filled ? "Flask washed — burette still filled. Top it up if it’s low." : "Flask washed — refill the burette");
      };
      function concordant(){ const t = ctx.rows().map(r => r.titre); return t.filter((v, i) => t.some((w, j) => j !== i && Math.abs(v - w) <= 0.10 + 1e-9)); }
      function summary(){
        const c = concordant();
        q("#tb-sum").innerHTML = c.length >= 2 ? `Concordant titres: ${c.map(v => v.toFixed(2)).join(", ")} → mean <b style="color:var(--txt)">${(c.reduce((a, b) => a + b, 0)/c.length).toFixed(2)} cm³</b>` : "Aim for two titres within 0.10 cm³ of each other (concordant).";
      }
      q("#tb-cb").onclick = () => {
        const c = concordant(), fb = q("#tb-cfb"), v = parseFloat(q("#tb-c").value);
        if(c.length < 2){ fb.innerHTML = `<div class="note bad">Get two concordant titres first.</div>`; return; }
        const mean = c.reduce((a, b) => a + b, 0)/c.length, exp = CB*mean/VA;
        fb.innerHTML = isFinite(v) && Math.abs(v - exp)/exp <= 0.015
          ? `<div class="note ok">Correct: ${exp.toFixed(4)} mol/dm³ from your titres. True value ${cA.toFixed(3)} mol/dm³ (${(Math.abs(exp - cA)/cA*100).toFixed(1)}% error).</div>`
          : `<div class="note bad">Not quite. n(NaOH) = 0.100 × mean titre ÷ 1000; 1 : 1 ratio; divide by 0.0250 dm³.</div>`;
      };
      run = Math.max(1, ...ctx.rows().map(r => r.run + 1));
      summary(); draw();
    }
  });
})();
