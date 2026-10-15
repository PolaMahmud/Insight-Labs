"use strict";
/* ══════════════════════════════════════════════════════════════════
   FOOD TESTS (IGCSE Biology) — hands-on
   Drag reagent bottles over test tubes to add drops, drag tubes into
   the hot water bath (Benedict's), shake them (emulsion test), and
   identify the nutrients in a mystery food.
══════════════════════════════════════════════════════════════════ */
(function(){
  const NUT = { sugar:"Reducing sugar", starch:"Starch", protein:"Protein", fat:"Fat", vitc:"Vitamin C" };
  const SAMPLES = [
    { id:"glu",  name:"Glucose",      base:[230,236,245,.35], c:{ sugar:1 } },
    { id:"sta",  name:"Starch",       base:[240,240,235,.75], c:{ starch:1 } },
    { id:"egg",  name:"Egg white",    base:[245,240,220,.55], c:{ protein:1 } },
    { id:"oil",  name:"Veg. oil",base:[240,200,70,.75],  c:{ fat:1 }, layer:true },
    { id:"oj",   name:"Orange juice", base:[250,170,50,.7],   c:{ sugar:.6, vitc:1 } },
    { id:"milk", name:"Milk",         base:[250,250,245,.9],  c:{ sugar:.5, protein:.6, fat:.5 } },
    { id:"x",    name:"Mystery X",    base:[225,215,200,.6],  c:{} }
  ];
  const TESTS = {
    iodine:  { name:"Iodine solution",  col:[150,80,20,.85],  test:"Iodine (starch)" },
    benedict:{ name:"Benedict’s",       col:[40,100,220,.9],  test:"Benedict’s (reducing sugar)" },
    biuret:  { name:"Biuret",           col:[60,110,230,.85], test:"Biuret (protein)" },
    ethanol: { name:"Ethanol",          col:[235,240,248,.35],test:"Ethanol emulsion (fat)" },
    water:   { name:"Water",            col:[200,225,245,.35],test:null },
    dcpip:   { name:"DCPIP",            col:[50,80,210,.9],   test:"DCPIP (vitamin C)" }
  };
  const SHELF = ["iodine","benedict","biuret","ethanol","water","dcpip"];
  const RACK_X = i => 92 + i*66, TUBE_TOP = 300, TUBE_BOT = 455;
  const BATH = { x0:600, x1:900, y0:380, slots:[650, 710, 770, 830] };
  const lerp = (a, b, f) => a.map((x, i) => x + (b[i] - x)*Math.max(0, Math.min(1, f)));
  const BEN = [[40,100,220,.9],[60,160,90,.9],[230,200,40,.92],[240,130,30,.95],[175,50,30,.97]];
  const benCol = v => { const s = Math.max(0, Math.min(1, v))*4, i = Math.min(3, Math.floor(s)); return lerp(BEN[i], BEN[i + 1], s - i); };
  const benName = v => v < .15 ? "blue" : v < .4 ? "green" : v < .65 ? "yellow" : v < .85 ? "orange" : "brick-red";

  Lab.register({
    id:"food-tests", subject:"biology", topic:"Biological molecules", interactive:true,
    title:"Food tests bench",
    summary:"Drop iodine, Benedict’s, biuret, ethanol and DCPIP into foods, heat in a water bath, shake for emulsions — then identify a mystery food.",
    aim:"Use food tests to find out which nutrients are present in different foods, and identify the nutrients in an unknown food.",
    variables:{ iv:"Food sample", dv:"Colour change / observation for each test", cv:["Same volume of sample","Same number of drops of reagent","Water bath ≈ 80 °C for Benedict’s"] },
    stageTitle:"Food test bench", controlsTitle:"Mystery food",
    thumb:`<svg viewBox="0 0 300 140">${[["#2E5BD8",86],["#7C3AED",124],["#B23A1E",162],["#1B1B3A",200]].map(([c,x]) => `<rect x="${x}" y="22" width="22" height="92" rx="11" fill="none" stroke="#A2ACBD" stroke-width="2"/><rect x="${x + 2}" y="62" width="18" height="50" rx="9" fill="${c}"/>`).join("")}<rect x="70" y="102" width="170" height="12" rx="3" fill="#8B5E3C"/></svg>`,
    challenges:[
      { id:"starch",  title:"Test for starch", text:"Get a positive iodine test." },
      { id:"sugar",   title:"Test for reducing sugar", text:"Heat Benedict’s with a sugar in the water bath." },
      { id:"protein", title:"Test for protein", text:"Get a positive biuret test." },
      { id:"fat",     title:"Test for fat", text:"Ethanol, shake, then water — get a cloudy emulsion." },
      { id:"vitc",    title:"Test for vitamin C", text:"Decolourise DCPIP." },
      { id:"milk",    title:"Analyse milk", text:"Run all four main tests (iodine, Benedict’s, biuret, ethanol) on milk." },
      { id:"mystery", title:"Identify Mystery X", text:"Tick its nutrients and check." }
    ],
    columns:[{key:"sample",label:"Food"},{key:"test",label:"Test"},{key:"obs",label:"Observation"},{key:"res",label:"Present?"}],
    questions:[
      { q:"Describe the Benedict’s test for reducing sugar.",
        a:"Add an equal volume of Benedict’s solution to the food solution and heat in a water bath at about 80 °C for a few minutes. A positive result changes from blue to green, yellow, orange or brick-red depending on how much reducing sugar is present." },
      { q:"Why is the Benedict’s test described as semi-quantitative?",
        a:"The final colour indicates roughly how much reducing sugar is present (green = little, brick-red = a lot), but it does not give an exact amount." },
      { q:"Describe the ethanol emulsion test for fats.",
        a:"Shake the food with ethanol, then pour the ethanol into water. A cloudy white emulsion shows that fat is present." },
      { q:"Why should each test be done on a fresh sample?",
        a:"Reagents from one test could react with or mask the results of another test, giving a false result." },
      { q:"State a safety precaution for the Benedict’s test.",
        a:"Heat the tubes in a water bath rather than a direct flame, point tubes away from people, and wear eye protection." }
    ],
    setup(ctx){
      const mystery = {};
      (function pick(){
        const keys = Object.keys(NUT); let n = 0;
        keys.forEach(k => { if(Math.random() < .45){ mystery[k] = .6 + Math.random()*.4; n++; } });
        if(!n) mystery[keys[Math.floor(Math.random()*keys.length)]] = 1;
      })();
      SAMPLES.find(s => s.id === "x").c = mystery;

      const tubes = SAMPLES.map((s, i) => fresh(s, i));
      function fresh(s, i){ return { i, s, drops:{}, test:null, heat:0, shakes:0, dx:0, dy:0, inBath:-1, prog:0, recorded:false }; }
      const bottles = {}; SHELF.forEach((k, i) => bottles[k] = { home:[560 + i*66, 200], dx:0, dy:0 });
      const tweens = [];
      let pouring = null, pourT = 0;
      const testsDone = {};                      // sample id → set of tests recorded

      /* ── per-tube chemistry → colour, observation ── */
      function state(t){
        const c = t.s.c, d = t.drops, out = { col:t.s.base.slice(), ppt:null, emul:0, layer:t.s.layer ? 1 : 0, done:false, obs:"", pos:false };
        const tot = Object.values(d).reduce((a, b) => a + b, 0);
        out.vol = 2 + tot*.08;
        if(!t.test){ return out; }
        const r = Math.min(1, (d[t.test] || 0)/5);
        switch(t.test){
          case "iodine": {
            const pos = (c.starch || 0) > .2;
            out.col = lerp(t.s.base, pos ? [25,20,60,.95] : TESTS.iodine.col, r);
            out.done = r >= .6; out.pos = pos; out.obs = pos ? "turns blue-black" : "stays orange-brown"; break; }
          case "benedict": {
            const s = c.sugar || 0, v = s*Math.min(1, t.heat/5);
            out.col = lerp(t.s.base, benCol(v), r);
            if(v > .15) out.ppt = benCol(v);
            out.done = r >= 1 && t.heat >= 5; out.pos = s > .1; out.obs = s > .1 ? `blue → ${benName(s)} precipitate on heating` : "stays blue";
            if(r >= 1 && t.heat < 5) out.need = "heat it in the water bath"; break; }
          case "biuret": {
            const pos = (c.protein || 0) > .2, f = Math.min(1, t.prog/1.5);
            out.col = lerp(t.s.base, lerp(TESTS.biuret.col, pos ? [140,60,200,.9] : TESTS.biuret.col, f), r);
            out.done = r >= 1 && f >= 1; out.pos = pos; out.obs = pos ? "blue → purple (lilac)" : "stays blue"; break; }
          case "ethanol": {
            const fat = (c.fat || 0) > .2, w = Math.min(1, (d.water || 0)/5);
            out.col = lerp(t.s.base, [235,240,248,.4], r*.5);
            if(t.shakes >= 3) out.layer = 0;
            out.emul = fat && t.shakes >= 3 ? w : 0;
            out.done = r >= 1 && t.shakes >= 3 && w >= 1; out.pos = fat; out.obs = fat ? "cloudy white emulsion forms" : "stays clear";
            if(r >= 1 && t.shakes < 3) out.need = "shake the tube (drag it up and down)";
            else if(r >= 1 && w < 1) out.need = "now add water"; break; }
          case "dcpip": {
            const vc = (c.vitc || 0) > .2, n = d.dcpip || 0;
            const blue = vc ? Math.max(0, n - 8)/4 : Math.min(1, n/3);
            out.col = lerp(t.s.base, TESTS.dcpip.col, Math.min(1, blue));
            out.done = n >= 8; out.pos = vc; out.obs = vc ? "blue DCPIP is decolourised" : "DCPIP stays blue"; break; }
        }
        return out;
      }

      /* ── drawing ── */
      ctx.stage.innerHTML = `
      <svg viewBox="0 0 960 560" id="ft-svg" aria-label="Test tube rack, reagent bottles and water bath">
        <defs><linearGradient id="ft-glass" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".3" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity=".14"/></linearGradient>
          <linearGradient id="ft-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B07A4C"/><stop offset="1" stop-color="#7B4F2C"/></linearGradient>
          <linearGradient id="ft-bath" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FB6E8" stop-opacity=".55"/><stop offset="1" stop-color="#4C86C6" stop-opacity=".7"/></linearGradient></defs>
        <rect x="0" y="512" width="960" height="48" fill="color-mix(in srgb,var(--bg-card) 85%,#5a4630 15%)"/><line x1="0" y1="512" x2="960" y2="512" stroke="var(--brd2)"/>
        <!-- shelf -->
        <rect x="520" y="226" width="420" height="10" rx="3" fill="url(#ft-wood)"/><text x="730" y="256" text-anchor="middle" class="ft-cap">reagents — drag a bottle and hold it over a tube</text>
        <!-- water bath -->
        <g><rect x="${BATH.x0}" y="${BATH.y0}" width="${BATH.x1 - BATH.x0}" height="${512 - BATH.y0}" rx="10" fill="url(#ft-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
          <rect x="${BATH.x0 + 3}" y="${BATH.y0 + 34}" width="${BATH.x1 - BATH.x0 - 6}" height="${512 - BATH.y0 - 37}" rx="8" fill="url(#ft-bath)"/>
          <rect x="${BATH.x0 - 6}" y="506" width="${BATH.x1 - BATH.x0 + 12}" height="10" rx="3" fill="#3A4252"/>
          <g id="ft-steam"></g>
          <text x="${(BATH.x0 + BATH.x1)/2}" y="${BATH.y0 - 12}" text-anchor="middle" class="ft-cap">water bath · 80 °C — drop tubes in to heat</text></g>
        <!-- rack -->
        <rect x="50" y="430" width="470" height="16" rx="4" fill="url(#ft-wood)"/><rect x="60" y="446" width="12" height="66" fill="#7B4F2C"/><rect x="498" y="446" width="12" height="66" fill="#7B4F2C"/>
        <rect x="50" y="496" width="470" height="12" rx="3" fill="url(#ft-wood)"/>
        ${SAMPLES.map((s, i) => `<text x="${RACK_X(i)}" y="530" text-anchor="middle" class="ft-tag">${s.name}</text>`).join("")}
        <g id="ft-tubes"></g><g id="ft-bottles"></g><g id="ft-drops"></g>
        <text x="20" y="34" class="ft-status" id="ft-status">Pick a test: drag a reagent bottle over a tube</text>
      </svg>`;
      const svg = ctx.stage.querySelector("#ft-svg"), $ = s => svg.querySelector(s);
      const css = document.createElement("style");
      css.textContent = `#ft-svg{touch-action:none}#ft-svg .ft-cap{font:500 11px Inter,sans-serif;fill:var(--txt3)}#ft-svg .ft-tag{font:600 10px Inter,sans-serif;fill:var(--txt2)}
        #ft-svg .ft-status{font:600 14px 'Space Grotesk',sans-serif;fill:var(--txt)}#ft-svg .ft-lab{font:700 9px Inter,sans-serif;fill:#0E1420}
        #ft-svg .tube,#ft-svg .bottle{cursor:grab}#ft-svg .tube:hover,#ft-svg .bottle:hover{filter:drop-shadow(0 0 6px color-mix(in srgb,var(--accent) 60%,transparent))}
        #ft-svg .refill{cursor:pointer}`;
      ctx.stage.appendChild(css);

      const tubeXY = t => t.inBath >= 0 ? [BATH.slots[t.inBath], 420] : [RACK_X(t.i), 455];
      function tubeSvg(t){
        const [bx, by] = tubeXY(t), x = bx + t.dx, yb = by + t.dy, top = yb - (TUBE_BOT - TUBE_TOP);
        const st = state(t), lvl = yb - 10 - st.vol*11;
        const path = `M${x - 13} ${top} V${yb - 13} A13 13 0 0 0 ${x + 13} ${yb - 13} V${top}`;
        let h = `<g class="tube" data-i="${t.i}"><clipPath id="ft-c${t.i}"><path d="${path} Z"/></clipPath>
          <rect x="${x - 14}" y="${lvl}" width="28" height="${yb - lvl + 2}" fill="rgba(${st.col.map((v, k) => k < 3 ? Math.round(v) : v.toFixed(2))})" clip-path="url(#ft-c${t.i})"/>`;
        if(st.layer) h += `<rect x="${x - 14}" y="${lvl}" width="28" height="9" fill="rgba(240,200,70,.95)" clip-path="url(#ft-c${t.i})"/>`;
        if(st.emul) h += `<rect x="${x - 14}" y="${lvl}" width="28" height="${yb - lvl}" fill="rgba(250,250,250,${(.85*st.emul).toFixed(2)})" clip-path="url(#ft-c${t.i})"/>`;
        if(st.ppt) for(let k=0;k<14;k++) h += `<circle cx="${x - 9 + ((k*37) % 19)}" cy="${yb - 4 - ((k*13) % 9)}" r="1.8" fill="rgba(${st.ppt.slice(0,3).map(Math.round)},1)" clip-path="url(#ft-c${t.i})"/>`;
        h += `<path d="${path}" fill="url(#ft-glass)" stroke="var(--txt2)" stroke-width="1.5"/><rect x="${x - 26}" y="${top - 10}" width="52" height="${yb - top + 20}" fill="transparent"/>`;
        if(t.test) h += `<g class="refill" data-r="${t.i}"><circle cx="${x + 18}" cy="${top - 4}" r="9" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="${x + 18}" y="${top}" text-anchor="middle" style="font:700 11px Inter;fill:var(--txt2)">↻</text></g>`;
        return h + `</g>`;
      }
      function bottleSvg(k){
        const b = bottles[k], x = b.home[0] + b.dx, y = b.home[1] + b.dy, T = TESTS[k];
        return `<g class="bottle" data-k="${k}">
          <path d="M${x - 25} ${y - 50} Q${x - 25} ${y - 62} ${x - 10} ${y - 64} H${x + 10} Q${x + 25} ${y - 62} ${x + 25} ${y - 50} V${y + 20} Q${x + 25} ${y + 26} ${x + 19} ${y + 26} H${x - 19} Q${x - 25} ${y + 26} ${x - 25} ${y + 20} Z" fill="rgba(${T.col.slice(0,3)},${Math.min(.9, T.col[3] + .1)})" stroke="var(--txt2)" stroke-width="1.4"/>
          <rect x="${x - 6}" y="${y - 96}" width="12" height="34" rx="3" fill="url(#ft-glass)" stroke="var(--txt2)"/><rect x="${x - 9}" y="${y - 108}" width="18" height="16" rx="7" fill="#111827"/>
          <rect x="${x - 22}" y="${y - 34}" width="44" height="30" rx="3" fill="#F8FAFC"/>
          <text x="${x}" y="${y - 22}" text-anchor="middle" class="ft-lab">${T.name.split(" ")[0].replace("’s", "")}</text>
          <text x="${x}" y="${y - 10}" text-anchor="middle" class="ft-lab" style="font-size:8px;font-weight:500;fill:#475569">${k === "water" ? "distilled" : "reagent"}</text>
          <rect x="${x - 26}" y="${y - 110}" width="52" height="140" fill="transparent"/></g>`;
      }
      let dropsList = [];
      function draw(){
        $("#ft-tubes").innerHTML = tubes.map(tubeSvg).join("");
        $("#ft-bottles").innerHTML = SHELF.map(bottleSvg).join("");
        $("#ft-drops").innerHTML = dropsList.map(d => `<ellipse cx="${d.x}" cy="${d.y}" rx="2.6" ry="3.6" fill="rgba(${d.c})"/>`).join("");
      }

      /* ── pointer: one handler for tubes and bottles (elements are re-rendered each frame) ── */
      let drag = null;
      svg.addEventListener("pointerdown", e => {
        if(e.button) return;
        const r = e.target.closest(".refill");
        if(r){ const t = tubes[+r.dataset.r]; tubes[t.i] = Object.assign(fresh(t.s, t.i), { inBath:-1 }); ctx.toast(`${t.s.name}: tube washed and refilled`); return; }
        const tg = e.target.closest(".tube"), bt = e.target.closest(".bottle");
        if(!tg && !bt) return;
        e.preventDefault(); svg.setPointerCapture(e.pointerId);
        const p = ctx.svgPoint(svg, e);
        drag = tg ? { kind:"tube", t:tubes[+tg.dataset.i], p0:p, lastY:p.y, dirY:0 } : { kind:"bottle", k:bt.dataset.k, p0:p };
      });
      svg.addEventListener("pointermove", e => {
        if(!drag) return;
        const p = ctx.svgPoint(svg, e);
        if(drag.kind === "tube"){
          const t = drag.t; t.dx = p.x - drag.p0.x; t.dy = p.y - drag.p0.y;
          const dy = p.y - drag.lastY;
          if(Math.abs(dy) > 6){ const dir = Math.sign(dy); if(drag.dirY && dir !== drag.dirY){ t.shakes += .5; if(t.test === "ethanol" && Math.floor(t.shakes) === 3 && t.shakes % 1 === 0) ctx.toast("Shaken well — now add water"); } drag.dirY = dir; drag.lastY = p.y; }
        }else{
          const b = bottles[drag.k]; b.dx = p.x - drag.p0.x; b.dy = p.y - drag.p0.y;
          const tip = [b.home[0] + b.dx, b.home[1] + 26 + b.dy];
          pouring = null;
          tubes.forEach(t => { const [bx, by] = tubeXY(t), top = by - (TUBE_BOT - TUBE_TOP); if(Math.abs(tip[0] - bx) < 22 && tip[1] > top - 80 && tip[1] < top + 20) pouring = { k:drag.k, t }; });
        }
      });
      svg.addEventListener("pointerup", e => {
        if(!drag) return;
        const d = drag; drag = null; pouring = null;
        if(d.kind === "tube"){
          const t = d.t, [bx, by] = tubeXY(t), x = bx + t.dx, y = by + t.dy;
          if(x > BATH.x0 && x < BATH.x1 && y > BATH.y0 - 40){
            const used = new Set(tubes.filter(o => o !== t && o.inBath >= 0).map(o => o.inBath));
            const slot = [0,1,2,3].find(s => !used.has(s));
            if(slot === undefined){ ctx.toast("The water bath is full"); tweens.push({ t, fx:t.dx, fy:t.dy, a:0 }); return; }
            const nx = BATH.slots[slot], ny = 420; t.inBath = slot; t.dx = x - nx; t.dy = y - ny;
            if(t.test !== "benedict") ctx.toast("Only the Benedict’s test needs heating");
          }else if(t.inBath >= 0 && (x < BATH.x0 || y < BATH.y0 - 40)){
            const nx = RACK_X(t.i), ny = 455; t.inBath = -1; t.dx = x - nx; t.dy = y - ny;
          }
          tweens.push({ t, fx:t.dx, fy:t.dy, a:0 });
        }else{ const b = bottles[d.k]; tweens.push({ b, fx:b.dx, fy:b.dy, a:0 }); }
      });

      ctx.frame((dt, el) => {
        for(let i = tweens.length - 1; i >= 0; i--){
          const tw = tweens[i]; tw.a += dt/.3; const e = 1 - Math.pow(1 - Math.min(1, tw.a), 3), o = tw.t || tw.b;
          if(drag && (drag.t === o || (drag.kind === "bottle" && bottles[drag.k] === o))){ tweens.splice(i, 1); continue; }
          o.dx = tw.fx*(1 - e); o.dy = tw.fy*(1 - e); if(tw.a >= 1) tweens.splice(i, 1);
        }
        if(pouring){
          pourT += dt;
          if(pourT > .22){
            pourT = 0; const b = bottles[pouring.k];
            dropsList.push({ x:b.home[0] + b.dx, y:b.home[1] + 28 + b.dy, vy:0, t:pouring.t, k:pouring.k, c:TESTS[pouring.k].col.slice(0,3).join(",") + ",.95" });
          }
        }
        for(let i = dropsList.length - 1; i >= 0; i--){
          const d = dropsList[i]; d.vy += 900*dt; d.y += d.vy*dt;
          const [bx, by] = tubeXY(d.t);
          if(d.y > by - 30){ dropsList.splice(i, 1); addDrop(d.t, d.k); }
        }
        tubes.forEach(t => {
          if(t.inBath >= 0) t.heat += dt;
          if(t.test) t.prog += dt;
          const st = state(t);
          if(st.done && !t.recorded){
            t.recorded = true;
            ctx.record({ sample:t.s.name, test:TESTS[t.test].test, obs:st.obs, res:st.pos ? "✓ present" : "✗ absent" }, true);
            ctx.toast(`${t.s.name}: ${st.obs}`);
            (testsDone[t.s.id] = testsDone[t.s.id] || new Set()).add(t.test);
            if(st.pos){ const m = { iodine:"starch", benedict:"sugar", biuret:"protein", ethanol:"fat", dcpip:"vitc" }[t.test]; ctx.complete(m); }
            if(["iodine","benedict","biuret","ethanol"].every(k => testsDone.milk && testsDone.milk.has(k))) ctx.complete("milk");
          }
        });
        const steam = $("#ft-steam"); let sh = "";
        for(let k=0;k<5;k++){ const ph = (el*0.6 + k/5) % 1; sh += `<circle cx="${620 + k*60 + Math.sin(el*2 + k)*6}" cy="${BATH.y0 + 30 - ph*60}" r="${6 + ph*8}" fill="var(--txt2)" opacity="${(.18*(1 - ph)).toFixed(2)}"/>`; }
        steam.innerHTML = sh;
        hud(); draw();
      });

      function addDrop(t, k){
        if(k === "water"){
          if(t.test !== "ethanol"){ ctx.toast("Water is only used in the emulsion test, after ethanol"); return; }
          t.drops.water = (t.drops.water || 0) + 1; return;
        }
        if(t.test && t.test !== k){ ctx.toast(`Use a fresh sample for each test — click ↻ on the ${t.s.name} tube`); return; }
        t.test = k; t.drops[k] = (t.drops[k] || 0) + 1;
      }

      let hudText = "";
      function hud(){
        const active = tubes.filter(t => t.test).map(t => { const st = state(t); return [t.s.name, st.need ? "→ " + st.need : st.done ? st.obs : "adding " + TESTS[t.test].name + "…", st.done ? (st.pos ? "good" : "") : st.need ? "warn" : ""]; });
        const k = JSON.stringify(active);
        if(k === hudText) return; hudText = k;
        ctx.readout(active.length ? active.slice(-4) : [["Tip", "hold a bottle over a tube to add drops · drag tubes into the bath to heat · drag up and down to shake"]]);
        const last = tubes.filter(t => t.test).map(state).find(s => s.need);
        $("#ft-status").textContent = last ? "Next: " + last.need : "Drag a reagent bottle over a tube to add drops";
      }

      /* ── mystery food panel ── */
      const box = ctx.html(`<div><p class="hint" style="margin:0 0 10px">Test <b>Mystery X</b> with every reagent, then tick the nutrients it contains.</p>
        ${Object.entries(NUT).map(([k, n]) => `<label style="display:flex;gap:8px;align-items:center;font-size:.86rem;margin:6px 0"><input type="checkbox" value="${k}"> ${n}</label>`).join("")}
        <div class="btns" style="margin-top:10px"><button class="btn small primary" type="button" id="ft-check">Check</button><button class="btn small ghost" type="button" id="ft-wash">Wash all tubes</button></div>
        <div id="ft-fb" style="margin-top:10px"></div></div>`);
      box.querySelector("#ft-check").onclick = () => {
        const picked = new Set([...box.querySelectorAll("input:checked")].map(i => i.value));
        const truth = new Set(Object.keys(mystery));
        const right = [...truth].every(k => picked.has(k)) && [...picked].every(k => truth.has(k));
        const tested = testsDone.x ? testsDone.x.size : 0;
        box.querySelector("#ft-fb").innerHTML = right
          ? `<div class="note ok">Correct — Mystery X contains ${[...truth].map(k => NUT[k].toLowerCase()).join(", ")}.${tested < 5 ? " (Lucky guess? You only ran " + tested + " of 5 tests.)" : ""}</div>`
          : `<div class="note bad">Not quite. ${tested < 5 ? `You’ve run ${tested} of the 5 tests on Mystery X so far.` : "Check your observations in the results table."}</div>`;
        if(right && tested >= 5) ctx.complete("mystery");
      };
      box.querySelector("#ft-wash").onclick = () => { tubes.forEach((t, i) => tubes[i] = fresh(t.s, i)); ctx.toast("All tubes washed and refilled"); };
      draw();
    }
  });
})();
