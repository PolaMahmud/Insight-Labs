"use strict";
/* ══════════════════════════════════════════════════════════════════
   BIOLOGY · IGCSE (0610) — part 3: keys & biotechnology
   Dichotomous keys · Pectinase and fruit juice ·
   Biological washing powders · Lactase and lactose-free milk
══════════════════════════════════════════════════════════════════ */

/* shared enzyme model: rises with temperature (about ×1.9 per 10 °C) until the protein denatures above about 50 °C */
const IG3act = (T, mid) => Math.pow(1.9, (T - 40)/10)/(1 + Math.exp((T - (mid || 52))/3.5));
const IG3rnd = (a, b) => a + Math.random()*(b - a);

/* ───────────── DICHOTOMOUS KEYS ───────────── */
Lab.register({
  id:"keys", subject:"biology", level:["igcse"], topic:"Classification · Dichotomous keys", interactive:true,
  title:"Using and constructing dichotomous keys",
  summary:"Work through a key one pair of statements at a time to name six invertebrates, then build your own key for six leaves and test it on new specimens.",
  aim:"Use a dichotomous key to identify organisms, and construct a dichotomous key based on observable features.",
  variables:{ iv:"The feature chosen at each step", dv:"Name the key gives for each specimen", cv:["Use features you can see on every specimen","Each step splits a group into two","Avoid size alone and colour, which vary within a species"] },
  stageTitle:"Specimens & key", controlsTitle:"Key",
  thumb:`<svg viewBox="0 0 300 140"><path d="M150 20v30M150 50H80v30M150 50h70v30M80 80H50v30M80 80h30v30" stroke="#7C93AE" stroke-width="4" fill="none"/><circle cx="150" cy="20" r="10" fill="#5B7FD6"/>${[50,110,220].map(x => `<circle cx="${x}" cy="${x === 220 ? 84 : 114}" r="10" fill="#3F9A3A"/>`).join("")}</svg>`,
  challenges:[
    { id:"use",   title:"Use the key", text:"Identify all six invertebrates correctly using the key." },
    { id:"build", title:"Build a key", text:"Make a complete key that separates all six leaves and test it." },
    { id:"valid", title:"A reliable key", text:"Build a key that still works on new specimens of the same leaves." }
  ],
  columns:[{key:"mode",label:"Task"},{key:"spec",label:"Specimen"},{key:"path",label:"Route through key"},{key:"name",label:"Identified as"},{key:"ok",label:"Correct?"}],
  questions:[
    { q:"What is a dichotomous key?",
      a:"A key made of pairs of contrasting statements about observable features. At each step you choose the statement that fits the organism, which leads to another pair or to its name." },
    { q:"Why should a key not use size alone, or colour?",
      a:"Size depends on age and growing conditions, and colour varies within a species, fades or changes with the season. A young or shaded specimen would key out wrongly. Features such as leaf shape, the edge of the leaf or the number of legs are fixed for the species." },
    { q:"How many pairs of statements are needed to identify six organisms?",
      a:"Five. Each pair splits one group into two, so n organisms need n − 1 pairs of statements." },
    { q:"Why should each statement be a clear yes/no observation?",
      a:"Vague words such as ‘big’, ‘long’ or ‘quite hairy’ are judged differently by different people. Statements that can be checked, such as ‘three pairs of legs’ or ‘divided into leaflets’, give the same answer every time." },
    { q:"A student’s key identifies the holly leaf as beech. Suggest why.",
      a:"A statement was misread or one statement did not apply clearly, for example an old holly leaf with few spines. Check the leaf against each statement again, and improve the key by using a feature that every holly leaf shows." }
  ],
  setup(ctx){
    /* ── part (a): invertebrates and a given key ── */
    const INV = { fly:"Housefly", ladybird:"Ladybird", spider:"Spider", centipede:"Centipede", snail:"Snail", worm:"Earthworm" };
    const KEY = {
      1:{ a:["Legs present", 2], b:["No legs", 5] },
      2:{ a:["Three pairs of legs", 3], b:["More than three pairs of legs", 4] },
      3:{ a:["One pair of wings", "fly"], b:["Two pairs of wings, front pair hard", "ladybird"] },
      4:{ a:["Four pairs of legs", "spider"], b:["Many legs, one pair per segment", "centipede"] },
      5:{ a:["Body has a coiled shell", "snail"], b:["No shell, body in ring-like segments", "worm"] }
    };
    /* ── part (b): leaves to build a key for ── */
    const LEAF = {
      pine:{ name:"Pine", needle:1, compound:0, palmate:0, lobed:0, spines:0, toothed:0 },
      chestnut:{ name:"Horse chestnut", needle:0, compound:1, palmate:1, lobed:0, spines:0, toothed:1 },
      ash:{ name:"Ash", needle:0, compound:1, palmate:0, lobed:0, spines:0, toothed:1 },
      oak:{ name:"Oak", needle:0, compound:0, palmate:0, lobed:1, spines:0, toothed:0 },
      holly:{ name:"Holly", needle:0, compound:0, palmate:0, lobed:0, spines:1, toothed:0 },
      beech:{ name:"Beech", needle:0, compound:0, palmate:0, lobed:0, spines:0, toothed:0 }
    };
    const FEAT = {
      needle:{ a:"Leaf needle-shaped", b:"Leaf flat and broad" },
      compound:{ a:"Leaf divided into leaflets", b:"Leaf in one piece" },
      palmate:{ a:"Leaflets spread from one point", b:"Leaflets in pairs along a stalk", only:"compound" },
      lobed:{ a:"Edge has rounded lobes", b:"Edge has no lobes" },
      spines:{ a:"Edge has sharp spines", b:"Edge has no spines" },
      toothed:{ a:"Edge has small teeth", b:"Edge smooth, no teeth" },
      size:{ a:"Leaf is large", b:"Leaf is small", bad:"uses size alone — size changes with age and conditions" },
      colour:{ a:"Leaf is dark green", b:"Leaf is light green", bad:"uses colour — shade varies within a species" }
    };
    const has = (s, f) => f === "size" ? s.size > 1 : f === "colour" ? s.shade > .5 : !!LEAF[s.sp][f];
    const LET = "ABCDEF";
    const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random()*(i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    let mode = "use", inv = [], sel = -1, node = 1, path = [], leaves = [], groups = [], couplets = [], tested = null;

    function newInv(){ inv = shuffle(Object.keys(INV)).map(sp => ({ sp, rot:IG3rnd(-18, 18), sc:IG3rnd(.85, 1.08), id:null, ok:null })); sel = -1; node = 1; path = []; }
    function newLeaves(keep){
      const order = keep ? leaves.map(l => l.sp) : shuffle(Object.keys(LEAF));
      leaves = order.map(sp => ({ sp, size:IG3rnd(.72, 1.22), shade:Math.random(), rot:IG3rnd(-12, 12), keyed:null, ok:null }));
    }
    function resetKey(){ groups = [{ m:leaves.map((_, i) => i), split:null }]; couplets = []; tested = null; leaves.forEach(l => { l.keyed = null; l.ok = null; }); }
    const current = () => groups.find(g => g.m.length > 1 && g.split === null);

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="dk-svg"><defs>${Kit.DEFS}</defs>
      <rect x="10" y="44" width="540" height="420" rx="12" fill="#FBFAF6" stroke="var(--brd2)"/>
      <rect x="562" y="44" width="388" height="420" rx="12" fill="var(--bg2)" stroke="var(--brd2)"/>
      <g id="dk-spec"></g><g id="dk-key"></g><text x="20" y="30" class="k-status" id="dk-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#dk-svg"), $ = s => svg.querySelector(s);
    const cell = i => ({ x:100 + (i % 3)*180, y:150 + Math.floor(i/3)*200 });

    /* ── drawings ── */
    function drawInv(sp){
      const st = `stroke="#3B2F22" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
      if(sp === "fly"){
        let s = "";
        for(const k of [-1, 0, 1]) for(const d of [-1, 1]) s += `<path d="M${d*9} ${-18 + k*7}L${d*36} ${-28 + k*22}L${d*44} ${-10 + k*30}" ${st}/>`;
        s += [-1, 1].map(d => `<ellipse cx="${d*22}" cy="-2" rx="11" ry="32" transform="rotate(${d*28} ${d*22} -2)" fill="#DDEAF5" fill-opacity=".7" stroke="#7C93AE" stroke-width="1.4"/>`).join("");
        s += `<ellipse cx="0" cy="18" rx="13" ry="22" fill="#4B4036"/><ellipse cx="0" cy="-18" rx="12" ry="13" fill="#5A4D40"/><circle cx="0" cy="-38" r="10" fill="#4B4036"/>`;
        s += [-1, 1].map(d => `<ellipse cx="${d*6}" cy="-40" rx="5" ry="7" fill="#A3332B"/>`).join("");
        s += [4, 14, 24].map(y => `<path d="M-12 ${y}h24" stroke="#2A221B" stroke-width="1.4"/>`).join("");
        return s;
      }
      if(sp === "ladybird"){
        let s = "";
        for(const k of [-1, 0, 1]) for(const d of [-1, 1]) s += `<path d="M${d*20} ${k*16}L${d*42} ${k*20 - 6}L${d*50} ${k*24 + 8}" ${st}/>`;
        s += [-1, 1].map(d => `<path d="M${d*4} 26q${d*26} 20 ${d*34} 6" fill="#E6EEF7" fill-opacity=".8" stroke="#7C93AE" stroke-width="1.2"/>`).join("");
        s += `<circle cx="0" cy="0" r="32" fill="#D62F2F" stroke="#7A1515" stroke-width="2"/><path d="M0 -32V32" stroke="#3B0D0D" stroke-width="2"/>`;
        s += [[-14, -12], [14, -12], [-18, 10], [18, 10], [-8, 22], [8, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#1A1A1A"/>`).join("");
        s += `<path d="M-14 -30a14 12 0 0 1 28 0z" fill="#1A1A1A"/><circle cx="-6" cy="-36" r="2.4" fill="#F5F5F5"/><circle cx="6" cy="-36" r="2.4" fill="#F5F5F5"/>`;
        return s;
      }
      if(sp === "spider"){
        let s = "";
        for(const k of [0, 1, 2, 3]) for(const d of [-1, 1]) s += `<path d="M${d*8} ${-22 + k*5}L${d*38} ${-46 + k*18}L${d*58} ${-34 + k*26}" ${st}/>`;
        s += `<ellipse cx="0" cy="22" rx="21" ry="25" fill="#5B4632"/><circle cx="0" cy="-16" r="14" fill="#6E5640"/>`;
        s += [-4, 4].map(x => `<circle cx="${x}" cy="-26" r="2" fill="#111"/>`).join("") + `<path d="M-8 18h16M-6 28h12" stroke="#3B2F22" stroke-width="1.4"/>`;
        return s;
      }
      if(sp === "centipede"){
        let s = "";
        const seg = 12, yy = i => -52 + i*9.2, xx = i => 8*Math.sin(i/2.2);
        for(let i = 0; i < seg; i++){ const x = xx(i), y = yy(i);
          s += [-1, 1].map(d => `<path d="M${x + d*7} ${y}l${d*14} ${d > 0 ? 2 : 2}l${d*4} 7" stroke="#7A4A1E" stroke-width="1.8" fill="none" stroke-linecap="round"/>`).join(""); }
        for(let i = 0; i < seg; i++) s += `<rect x="${xx(i) - 8}" y="${yy(i) - 4.5}" width="16" height="9" rx="3" fill="#B8692A" stroke="#6E3A12" stroke-width="1"/>`;
        s += `<ellipse cx="${xx(-1)}" cy="${yy(-1) + 2}" rx="8" ry="6" fill="#8E4F1C"/><path d="M-3 -62q-14 -14 -22 -6M3 -62q14 -14 22 -6" stroke="#6E3A12" stroke-width="1.6" fill="none"/>`;
        return s;
      }
      if(sp === "snail"){
        return `<path d="M-58 34q4 -16 26 -18h56q22 4 26 18z" fill="#C9A98A" stroke="#7E6046" stroke-width="2"/>
          <path d="M-46 18q-6 -18 -10 -30M-40 18q-2 -16 0 -28" stroke="#7E6046" stroke-width="2.2" fill="none"/><circle cx="-56" cy="-12" r="3" fill="#3B2F22"/><circle cx="-40" cy="-10" r="3" fill="#3B2F22"/>
          <circle cx="10" cy="-6" r="30" fill="#D9A24F" stroke="#7A5420" stroke-width="2.4"/>
          <path d="M10 -6m0 -24a24 24 0 1 1 -22 30a18 18 0 1 1 30 -18a11 11 0 1 1 -14 12a5 5 0 1 1 7 -5" stroke="#7A5420" stroke-width="2" fill="none"/>`;
      }
      if(sp === "worm"){
        let s = "";
        for(let i = 0; i <= 34; i++){ const x = -64 + i*3.8, y = 22*Math.sin(x/22) + 4; const cl = i >= 9 && i <= 12;
          s += `<circle cx="${x}" cy="${y}" r="${7 - (i > 30 ? (i - 30)*.9 : 0)}" fill="${cl ? "#B5585B" : "#D98C86"}" stroke="#8E4A47" stroke-width=".9"/>`; }
        return s;
      }
      return "";
    }
    function leafPath(len, wf, ef, N){
      N = N || 60; const L = [], R = [];
      for(let i = 0; i <= N; i++){ const t = i/N, w = wf(t)*(ef ? ef(t, i) : 1); L.push([-w, -len*t]); R.unshift([w, -len*t]); }
      return "M" + L.concat(R).map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
    }
    function drawLeaf(l){
      const g = Math.round(110 + (1 - l.shade)*80), col = `rgb(${Math.round(40 + (1 - l.shade)*90)},${g},${Math.round(40 + (1 - l.shade)*40)})`, edge = "#24411E";
      const fill = `fill="${col}" stroke="${edge}" stroke-width="1.4"`;
      const teeth = (t, i) => 1 + (i % 2 ? .1 : 0);
      if(l.sp === "pine") return `<path d="M0 50L-9 -52M0 50L8 -54" stroke="${col}" stroke-width="4" stroke-linecap="round"/><path d="M0 50L-9 -52M0 50L8 -54" stroke="${edge}" stroke-width=".8"/><rect x="-4" y="44" width="8" height="12" rx="2" fill="#8B5E34"/>`;
      if(l.sp === "chestnut"){
        let s = `<path d="M0 26V62" stroke="#6E8B3D" stroke-width="3"/>`;
        [-80, -54, -27, 27, 54, 80, 0].forEach((a, k) => {
          const len = k === 6 ? 64 : 58 - Math.abs(a)/4;
          s += `<g transform="translate(0 26) rotate(${a})"><path d="${leafPath(len, t => 9.5*Math.pow(Math.sin(Math.PI*Math.min(1, t*1.02)), .6)*(t < .65 ? .25 + .75*t/.65 : 1), teeth, 40)}" ${fill}/><path d="M0 0V${-len*.95}" stroke="${edge}" stroke-width=".8"/></g>`;
        });
        return s;
      }
      if(l.sp === "ash"){
        let s = `<path d="M0 62V-46" stroke="#6E8B3D" stroke-width="2.6"/>`;
        [36, 14, -8, -30].forEach(y => [-1, 1].forEach(d => s += `<g transform="translate(0 ${y}) rotate(${d*70})"><path d="${leafPath(30, t => 7*Math.pow(Math.sin(Math.PI*t), .8), teeth, 30)}" ${fill}/></g>`));
        s += `<g transform="translate(0 -44)"><path d="${leafPath(26, t => 7*Math.pow(Math.sin(Math.PI*t), .8), teeth, 30)}" ${fill}/></g>`;
        return s;
      }
      let path;
      if(l.sp === "oak") path = leafPath(100, t => 26*Math.pow(Math.sin(Math.PI*t), .7)*(.62 + .38*Math.abs(Math.sin(4.5*Math.PI*t))), null, 120);
      if(l.sp === "holly") path = leafPath(96, t => 30*Math.pow(Math.sin(Math.PI*t), .6), (t, i) => { const s = (t*7) % 1; return t < .05 ? 1 : 1 - .3*Math.sin(Math.PI*s) + (s < .04 ? .16 : 0); }, 140);
      if(l.sp === "beech") path = leafPath(96, t => 26*Math.pow(Math.sin(Math.PI*t), .75), null, 60);
      let veins = "";
      for(let k = 1; k <= 6; k++){ const y = 50 - 96*k/7.5; veins += `<path d="M0 ${y.toFixed(0)}l-16 -10M0 ${y.toFixed(0)}l16 -10" stroke="${edge}" stroke-width=".7" opacity=".6"/>`; }
      return `<path d="M0 50V64" stroke="#6E8B3D" stroke-width="3"/><g transform="translate(0 50)"><path d="${path}" ${fill}/></g><path d="M0 50V-44" stroke="${edge}" stroke-width="1"/>${veins}`;
    }

    function keyTargetBuild(gr){ if(gr.m.length === 1) return LEAF[leaves[gr.m[0]].sp].name; return gr.split !== null ? "go to " + (gr.split + 1) : "?"; }
    function draw(){
      let s = "", k = "";
      if(mode === "use"){
        inv.forEach((v, i) => { const c = cell(i), on = i === sel;
          const oc = v.ok === true ? "#0F9A62" : v.ok === false ? "#E0335A" : on ? "var(--accent)" : "#D5D9E0";
          s += `<g data-inv="${i}" style="cursor:pointer"><rect x="${c.x - 82}" y="${c.y - 92}" width="164" height="184" rx="10" fill="#FFFFFF" stroke="${oc}" stroke-width="${on || v.ok !== null ? 3 : 1.2}"/>
            <g transform="translate(${c.x} ${c.y - 6}) rotate(${v.rot.toFixed(1)}) scale(${v.sc.toFixed(2)})">${drawInv(v.sp)}</g>
            <text x="${c.x - 70}" y="${c.y - 70}" style="font:700 15px 'Space Grotesk';fill:#334155">${LET[i]}</text>
            <text x="${c.x}" y="${c.y + 82}" text-anchor="middle" style="font:600 12px Inter;fill:${v.ok === false ? "#B42318" : "#0F6B47"}">${v.id ? INV[v.id] : ""}</text></g>`; });
        k += `<text x="580" y="72" class="k-tag">KEY TO SIX INVERTEBRATES</text>`;
        let y = 100;
        Object.entries(KEY).forEach(([n, c]) => {
          ["a", "b"].forEach(ab => { const [txt, to] = c[ab], live = sel >= 0 && +n === node, chosen = path.includes(n + ab);
            k += `<g ${live ? `data-ch="${ab}" style="cursor:pointer"` : ""}><rect x="574" y="${y - 15}" width="364" height="22" rx="5" fill="${live ? "color-mix(in srgb,var(--accent) 16%,transparent)" : chosen ? "color-mix(in srgb,#0F9A62 14%,transparent)" : "transparent"}" stroke="${live ? "var(--accent)" : "none"}"/>
              <text x="582" y="${y}" style="font:700 11px 'JetBrains Mono';fill:var(--txt2)">${ab === "a" ? n : ""}${ab}</text>
              <text x="610" y="${y}" style="font:500 11.5px Inter;fill:var(--txt)">${txt}</text>
              <text x="930" y="${y}" text-anchor="end" style="font:600 11px Inter;fill:var(--txt2)">${typeof to === "number" ? "go to " + to : INV[to]}</text></g>`;
            y += 25; });
          y += 12;
        });
        k += `<text x="580" y="${y + 14}" class="k-lbl">${sel < 0 ? "Click a specimen to start." : `Specimen ${LET[sel]}: click the statement that fits.`}</text>`;
        k += `<text x="580" y="${y + 34}" class="k-lbl">${path.length ? "Route: " + path.join(" → ") : ""}</text>`;
        const done = inv.filter(v => v.ok).length;
        $("#dk-status").textContent = done === 6 ? "All six identified correctly" : sel < 0 ? "Choose a specimen to identify" : "Identifying specimen " + LET[sel];
        ctx.readout([["Task", "use a key"], ["Correct", done + " / 6", done === 6 ? "good" : ""]]);
      }else{
        const cg = current();
        leaves.forEach((l, i) => { const c = cell(i), inG = cg && cg.m.includes(i);
          const oc = l.ok === true ? "#0F9A62" : l.ok === false ? "#E0335A" : inG ? "var(--accent)" : "#D5D9E0";
          s += `<g opacity="${cg && !inG && !tested ? .45 : 1}"><rect x="${c.x - 82}" y="${c.y - 92}" width="164" height="184" rx="10" fill="#FFFFFF" stroke="${oc}" stroke-width="${inG || l.ok !== null ? 3 : 1.2}"/>
            <g transform="translate(${c.x} ${c.y - 8}) rotate(${l.rot.toFixed(1)}) scale(${(l.size*.98).toFixed(2)})">${drawLeaf(l)}</g>
            <text x="${c.x - 70}" y="${c.y - 70}" style="font:700 15px 'Space Grotesk';fill:#334155">${LET[i]}</text>
            <text x="${c.x}" y="${c.y + 82}" text-anchor="middle" style="font:600 11.5px Inter;fill:${l.ok === false ? "#B42318" : "#334155"}">${l.keyed ? "keyed as " + l.keyed : LEAF[l.sp].name}</text></g>`; });
        k += `<text x="580" y="72" class="k-tag">YOUR KEY TO SIX LEAVES</text>`;
        let y = 100;
        if(!couplets.length) k += `<text x="580" y="100" class="k-lbl">Choose a feature that splits the highlighted</text><text x="580" y="118" class="k-lbl">leaves into two groups, then press Split.</text>`;
        couplets.forEach((c, n) => {
          ["a", "b"].forEach(ab => { const F = FEAT[c.f], bad = tested && F.bad;
            k += `<text x="582" y="${y}" style="font:700 11px 'JetBrains Mono';fill:var(--txt2)">${ab === "a" ? n + 1 : ""}${ab}</text>
              <text x="610" y="${y}" style="font:500 11.5px Inter;fill:${bad ? "#E0335A" : "var(--txt)"}">${F[ab]}</text>
              <text x="930" y="${y}" text-anchor="end" style="font:600 11px Inter;fill:var(--txt2)">${keyTargetBuild(c[ab])}</text>`;
            y += 21; });
          y += 8;
        });
        if(tested) k += `<text x="580" y="${Math.min(440, y + 14)}" style="font:600 12px Inter;fill:${tested.ok ? "#0F9A62" : "#E0335A"}">${tested.ok ? "Key works on new specimens ✓" : tested.msg}</text>`;
        $("#dk-status").textContent = tested ? "Tested on six new specimens" : cg ? `Split the highlighted group (${cg.m.length} leaves)` : "Key complete — test it on new specimens";
        ctx.readout([["Task", "build a key"], ["Pairs of statements", String(couplets.length)], ["Groups left to split", String(groups.filter(g => g.m.length > 1 && g.split === null).length)]]);
      }
      $("#dk-spec").innerHTML = s; $("#dk-key").innerHTML = k;
    }

    svg.addEventListener("pointerdown", e => {
      if(mode !== "use") return;
      const ch = e.target.closest("[data-ch]"), sp = e.target.closest("[data-inv]");
      if(ch && sel >= 0){
        const ab = ch.dataset.ch, to = KEY[node][ab][1]; path.push(node + ab);
        if(typeof to === "number"){ node = to; draw(); return; }
        const v = inv[sel]; v.id = to; v.ok = to === v.sp;
        ctx.record({ mode:"Use key", spec:LET[sel], path:path.join(" → "), name:INV[to], ok:v.ok ? "✓" : "✗" });
        if(!v.ok) ctx.toast("Not right — check the drawing against each statement and try again");
        sel = -1; node = 1; path = [];
        if(inv.every(x => x.ok)) ctx.complete("use");
        draw(); return;
      }
      if(sp){ const i = +sp.dataset.inv; if(inv[i].ok) return ctx.toast("Already identified"); sel = i; node = 1; path = []; inv[i].id = null; inv[i].ok = null; draw(); }
    });

    ctx.seg({ label:"Task", value:"use", options:[["use","(a) Use a key"],["build","(b) Build a key"]], onChange(v){ mode = v; boxUse.style.display = v === "use" ? "" : "none"; boxBuild.style.display = v === "build" ? "" : "none"; draw(); } });
    const boxUse = ctx.html(`<div></div>`), boxBuild = ctx.html(`<div style="display:none"></div>`);
    ctx.html(`<div class="hint" style="margin-bottom:8px">Click a specimen, then click the statement in each pair that fits it until the key gives a name.</div>`, boxUse);
    ctx.buttons([{ label:"New set of specimens", onClick(){ newInv(); draw(); } }], boxUse);
    const fsel = ctx.select({ label:"Feature to split the highlighted group", value:"needle", options:Object.entries(FEAT).map(([k, F]) => [k, F.a + " / " + F.b]), parent:boxBuild });
    ctx.buttons([{ label:"Split", primary:true, onClick(){
      const g = current(); if(!g) return ctx.toast("Every leaf is separated — test the key");
      const f = fsel.get(), F = FEAT[f];
      if(F.only && g.m.some(i => !LEAF[leaves[i].sp][F.only])) return ctx.toast("Some leaves in this group have no leaflets, so that statement can’t be answered for them");
      const A = g.m.filter(i => has(leaves[i], f)), B = g.m.filter(i => !has(leaves[i], f));
      if(!A.length || !B.length) return ctx.toast("That feature doesn’t divide this group — all of them are the same");
      const ga = { m:A, split:null }, gb = { m:B, split:null };
      g.split = couplets.length; couplets.push({ f, a:ga, b:gb, g }); groups.push(ga, gb); tested = null; leaves.forEach(l => { l.ok = null; l.keyed = null; });
      draw();
    } }, { label:"Undo", onClick(){
      const c = couplets.pop(); if(!c) return;
      groups = groups.filter(x => x !== c.a && x !== c.b); c.g.split = null; tested = null; leaves.forEach(l => { l.ok = null; l.keyed = null; }); draw();
    } }], boxBuild);
    ctx.buttons([{ label:"Test the key on new specimens", block:true, onClick(){
      if(current()) return ctx.toast("Finish the key first — some leaves are not yet separated");
      newLeaves(true);
      leaves.forEach((l, i) => {
        let g = groups[0], route = [];
        while(g.m.length > 1){ const c = couplets[g.split], yes = has(l, c.f); route.push((g.split + 1) + (yes ? "a" : "b")); g = yes ? c.a : c.b; }
        l.keyed = LEAF[leaves[g.m[0]].sp].name; l.ok = leaves[g.m[0]].sp === l.sp;
        ctx.record({ mode:"Test my key", spec:LET[i] + " (new " + LEAF[l.sp].name.toLowerCase() + ")", path:route.join(" → "), name:l.keyed, ok:l.ok ? "✓" : "✗" }, true);
      });
      const bads = couplets.map((c, n) => FEAT[c.f].bad ? `pair ${n + 1} ${FEAT[c.f].bad}` : null).filter(Boolean);
      const allOk = leaves.every(l => l.ok);
      tested = { ok: allOk && !bads.length, msg: !allOk ? "Some new specimens keyed out wrongly" : "Worked this time, but " + (bads[0] || "") };
      ctx.complete("build");
      if(tested.ok) ctx.complete("valid");
      ctx.toast(tested.ok ? "Your key identified every new specimen" : bads.length ? "Unreliable: " + bads.join("; ") : "Some specimens keyed out wrongly");
      draw();
    } }, { label:"Start again with new leaves", block:true, onClick(){ newLeaves(false); resetKey(); draw(); } }], boxBuild);
    newInv(); newLeaves(false); resetKey(); draw();
  }
});

/* ───────────── PECTINASE AND FRUIT JUICE ───────────── */
Lab.register({
  id:"pectinase", subject:"biology", level:["igcse"], topic:"Biotechnology · Enzymes", interactive:true,
  title:"Pectinase in fruit juice production",
  summary:"Incubate apple pulp with pectinase, boiled pectinase or water, filter it for 10 minutes and read the volume of juice in the measuring cylinder. Change the temperature or the volume of enzyme.",
  aim:"Investigate the effect of temperature (or enzyme volume) on the volume of juice extracted from apple pulp by pectinase.",
  variables:{ iv:"Temperature of the water bath (or volume of pectinase)", dv:"Volume of juice collected in 10 minutes / cm³", cv:["50 g of the same apple pulp","Same volume of pectinase","15 minutes incubation","Same funnel and filter paper, 10 minutes filtering"] },
  stageTitle:"Water bath, funnel & measuring cylinder", controlsTitle:"Method",
  thumb:`<svg viewBox="0 0 300 140"><path d="M110 16h80l-30 44v10h-20v-10z" fill="#E6EEF7" stroke="#7C93AE" stroke-width="3"/><path d="M120 20h60l-22 32h-16z" fill="#E2C88B"/><rect x="138" y="76" width="24" height="60" fill="#E6EEF7" stroke="#7C93AE" stroke-width="3"/><rect x="140" y="104" width="20" height="30" fill="#F2D27A"/></svg>`,
  steps:[
    { id:"pulp", text:"Put 50 g apple pulp in a beaker in the water bath" },
    { id:"enz",  text:"Add the enzyme (or the control)" },
    { id:"inc",  text:"Incubate for 15 minutes" },
    { id:"filt", text:"Filter for 10 minutes" },
    { id:"read", text:"Read the volume of juice at the meniscus" }
  ],
  challenges:[
    { id:"controls", title:"Controls", text:"At one temperature, test pectinase, boiled pectinase and water." },
    { id:"temps",    title:"Temperature range", text:"Use pectinase at five or more temperatures (same enzyme volume)." },
    { id:"volume",   title:"Enzyme volume", text:"Use three or more volumes of pectinase at one temperature." },
    { id:"opt",      title:"Optimum", text:"Use your graph to state the optimum temperature." }
  ],
  columns:[{key:"treat",label:"Treatment"},{key:"T",label:"Temperature / °C",dp:0},{key:"enz",label:"Enzyme / cm³",dp:1},{key:"V",label:"Juice in 10 min / cm³",dp:1},{key:"clar",label:"Clarity"}],
  series:"treat",
  graph:{ x:["T","enz"], y:["V"], fit:"curve" },
  questions:[
    { q:"Explain how pectinase increases the volume of juice.",
      a:"Pectin holds plant cell walls together. Pectinase breaks pectin down, so the cell walls break more easily and more juice is released from the cells. Breaking down pectin also makes the juice clearer." },
    { q:"Why is boiled pectinase used as a control?",
      a:"Boiling denatures the enzyme, so its active site changes shape and pectin no longer fits. Any juice collected with boiled enzyme shows how much comes out without enzyme activity, so the difference is due to the active enzyme." },
    { q:"Explain the shape of the graph of volume against temperature.",
      a:"Up to the optimum, more kinetic energy gives more collisions between pectin and the enzyme, so more enzyme–substrate complexes form. Above about 50 °C the enzyme is denatured, the active site changes shape, and the volume falls to the control value." },
    { q:"The measuring cylinder is graduated every 0.5 cm³. What is the uncertainty in each reading?",
      a:"Half a division, ± 0.25 cm³. Read at eye level, at the bottom of the meniscus." },
    { q:"Suggest two improvements to the method.",
      a:"Repeat each temperature three times and calculate a mean; use smaller temperature intervals around the optimum; put the pulp and enzyme in the water bath separately to reach the temperature before mixing; keep the funnel at the same temperature." },
    { q:"Assess the risks in this practical.",
      a:"Low risk. Enzymes can cause allergic reactions if they touch skin or are breathed in — wear eye protection and wash off spills. Take care with hot water baths and glassware." }
  ],
  setup(ctx){
    const CYL = { x:470, top:140, bot:410 }, PPC = (CYL.bot - CYL.top)/25;     // 12 px per cm³
    let treat = "pect", T = 40, enz = 2, st = {}, V = 0, Vtrue = 0, clar = 0, juice = 0, tmin = 0, filtering = false, incT = 0, incubating = false;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="pe-svg"><defs>${Kit.DEFS}<clipPath id="pe-zclip"><circle cx="790" cy="230" r="120"/></clipPath></defs>${Kit.bench(960, 440)}
      <g id="pe-bath"></g><g id="pe-funnel"></g><g id="pe-cyl"></g><g id="pe-zoom"></g><text x="20" y="30" class="k-status" id="pe-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#pe-svg"), $ = s => svg.querySelector(s);
    const therm = Kit.thermometer("pe-th", 250, 150, 200, 0, 80, 20, true);
    function model(){
      const base = 3 + .03*(T - 10);
      const extra = treat === "pect" ? 13*IG3act(T)/1.21*(enz/(enz + 1.2))/(2/3.2) : treat === "boiled" ? .25 : 0;
      Vtrue = Kit.clamp(base + extra + ctx.gauss()*.35, .5, 24);
      clar = extra/13;
    }
    const juiceCol = () => `rgba(226,${Math.round(168 + clar*40)},${Math.round(70 + clar*30)},${(.95 - Kit.clamp(clar, 0, 1)*.4).toFixed(2)})`;
    function draw(){
      let b = `<rect x="40" y="200" width="250" height="200" rx="10" fill="url(#k-water)" stroke="#7C93AE" stroke-width="2"/><rect x="40" y="200" width="250" height="200" rx="10" fill="url(#k-glass)"/>
        <rect x="40" y="400" width="250" height="40" rx="6" fill="#4B5563"/><text x="165" y="425" text-anchor="middle" style="font:600 11px Inter;fill:#E5E7EB">water bath ${T} °C</text>`;
      if(st.pulp && !st.filt) b += `<rect x="90" y="240" width="110" height="130" rx="6" fill="#E6EEF7" fill-opacity=".5" stroke="#7C93AE" stroke-width="2"/><rect x="92" y="300" width="106" height="68" fill="#E2C88B"/>${[...Array(18)].map((_, k) => `<circle cx="${100 + (k*37) % 92}" cy="${308 + (k*23) % 56}" r="3" fill="#C9A35C"/>`).join("")}
        <text x="145" y="230" text-anchor="middle" class="k-tag">apple pulp${st.enz ? " + " + { pect:"pectinase", boiled:"boiled pectinase", water:"water" }[treat] : ""}</text>`;
      if(incubating || st.inc && !st.filt) b += `<text x="145" y="390" text-anchor="middle" class="k-hint">${st.inc ? "incubated 15 min" : "incubating… " + Math.floor(incT) + " min"}</text>`;
      $("#pe-bath").innerHTML = b + therm.svg; therm.set(svg, T);
      /* funnel on stand */
      let f = `<rect x="590" y="40" width="10" height="400" fill="url(#k-metal)"/><rect x="520" y="58" width="80" height="8" fill="url(#k-metal)"/>
        <path d="M400 40h140l-56 66v44h-28v-44z" fill="#E6EEF7" fill-opacity=".45" stroke="#7C93AE" stroke-width="2"/><path d="M412 46h116l-58 60z" fill="#FAFAF5" stroke="#C8C2AE"/>`;
      if(st.filt){ const left = filtering ? 1 - tmin/10*.5 : .5; f += `<path d="M${470 - 50*left} ${46 + 10*(1 - left)}h${100*left}l-${50*left} ${54*left}z" fill="#E2C88B"/>`; if(filtering) f += `<circle cx="470" cy="${156 + (tmin*60) % 40}" r="3" fill="${juiceCol()}"/>`; }
      f += `<text x="392" y="60" text-anchor="end" class="k-lbl">filter funnel</text><text x="392" y="76" text-anchor="end" class="k-lbl">+ filter paper</text>`;
      $("#pe-funnel").innerHTML = f;
      /* measuring cylinder */
      const yv = CYL.bot - juice*PPC;
      let c = `<rect x="${CYL.x - 22}" y="${CYL.top - 20}" width="44" height="${CYL.bot - CYL.top + 24}" rx="4" fill="#E6EEF7" fill-opacity=".3" stroke="#7C93AE" stroke-width="2"/><rect x="${CYL.x - 40}" y="${CYL.bot + 4}" width="80" height="10" rx="3" fill="#9AA3B2"/>`;
      if(juice > 0) c += `<path d="M${CYL.x - 20} ${yv - 3}Q${CYL.x} ${yv + 4} ${CYL.x + 20} ${yv - 3}V${CYL.bot}H${CYL.x - 20}z" fill="${juiceCol()}"/>`;
      for(let v = 0; v <= 25; v += .5){ const y = CYL.bot - v*PPC, maj = v % 5 === 0; c += `<line x1="${CYL.x + 20}" y1="${y}" x2="${CYL.x + 20 - (maj ? 14 : v % 1 === 0 ? 9 : 5)}" y2="${y}" stroke="#334155" stroke-width=".9"/>`; if(maj) c += `<text x="${CYL.x + 26}" y="${y + 4}" style="font:500 10px 'JetBrains Mono';fill:var(--txt2)">${v}</text>`; }
      c += `<text x="${CYL.x}" y="${CYL.bot + 30}" text-anchor="middle" class="k-lbl">25 cm³ cylinder</text>`;
      $("#pe-cyl").innerHTML = c;
      /* magnified view around the meniscus */
      const Z = 4*PPC, zc = 230, v0 = juice;
      let z = `<circle cx="790" cy="230" r="124" fill="#2B313C"/><g clip-path="url(#pe-zclip)"><rect x="660" y="100" width="260" height="260" fill="#EEF3F8"/>`;
      if(juice > 0) z += `<path d="M680 ${zc - 10}Q790 ${zc + 6} 900 ${zc - 10}V360H680z" fill="${juiceCol()}"/>`;
      for(let v = Math.floor((v0 - 3)*2)/2; v <= v0 + 3; v += .5){ if(v < 0) continue; const y = zc + (v0 - v)*Z, maj = v % 1 === 0;
        z += `<line x1="${maj ? 830 : 850}" y1="${y}" x2="900" y2="${y}" stroke="#1F2937" stroke-width="${maj ? 2 : 1.2}"/>`; if(maj) z += `<text x="822" y="${y + 5}" text-anchor="end" style="font:700 15px 'JetBrains Mono';fill:#1F2937">${v}</text>`; }
      z += `</g><circle cx="790" cy="230" r="120" fill="none" stroke="#9AA3B2" stroke-width="4"/><text x="790" y="378" text-anchor="middle" class="k-lbl">magnified view at eye level (cm³)</text>`;
      $("#pe-zoom").innerHTML = z;
      $("#pe-cyl").insertAdjacentHTML("beforeend", `<g transform="translate(40 70)"><rect width="110" height="44" rx="8" fill="#1F2937"/><text x="55" y="29" text-anchor="middle" style="font:600 18px 'JetBrains Mono';fill:#7CFFB2">${tmin.toFixed(1)} min</text></g>`);
      const next = ctx.def.steps.find(s => !st[s.id]);
      $("#pe-status").textContent = next ? "Next: " + next.text.toLowerCase() : "Recorded — start a new trial";
      ctx.readout([["Treatment", { pect:"pectinase", boiled:"boiled pectinase", water:"water (no enzyme)" }[treat]], ["Temperature", T + " °C"], ["Enzyme volume", enz.toFixed(1) + " cm³"]]);
    }
    const tw = ctx.frame(dt => {
      if(incubating){ incT += dt*5; if(incT >= 15){ incubating = false; st.inc = true; ctx.step("inc"); } draw(); }
      if(filtering){ tmin = Math.min(10, tmin + dt*1.6); juice = Vtrue*(1 - Math.exp(-tmin/2.6))/(1 - Math.exp(-10/2.6)); if(tmin >= 10){ filtering = false; juice = Vtrue; ctx.toast("10 minutes — take the reading"); } draw(); }
    });
    const lock = () => st.enz;
    const sTr = ctx.seg({ label:"Treatment", value:"pect", options:[["pect","Pectinase"],["boiled","Boiled pectinase"],["water","Water"]], onChange(v){ if(lock()){ sTr.set(treat); return ctx.toast("Start a new trial to change this"); } treat = v; draw(); } });
    const sT = ctx.slider({ label:"Water-bath temperature", min:10, max:70, step:5, value:40, unit:"°C", onInput(v){ if(st.pulp){ sT.set(T); return ctx.toast("Start a new trial to change the temperature"); } T = v; draw(); } });
    const sE = ctx.slider({ label:"Volume of enzyme (or water)", min:.5, max:5, step:.5, value:2, unit:"cm³", fmt:v => v.toFixed(1), onInput(v){ if(lock()){ sE.set(enz); return ctx.toast("Start a new trial to change this"); } enz = v; draw(); } });
    function act(id){
      const order = ["pulp", "enz", "inc", "filt"], i = order.indexOf(id);
      if(st[id]) return ctx.toast("Already done");
      if(order.slice(0, i).some(k => !st[k])) return ctx.toast("Do the earlier steps first");
      if(id === "inc"){ if(incubating) return; incubating = true; incT = 0; draw(); return; }
      if(id === "filt"){ model(); filtering = true; tmin = 0; juice = 0; }
      st[id] = true; ctx.step(id); draw();
    }
    ctx.buttons([{ label:"Add pulp", onClick(){ act("pulp"); } }, { label:"Add enzyme", onClick(){ act("enz"); } }, { label:"Incubate 15 min", onClick(){ act("inc"); } }]);
    ctx.buttons([{ label:"Pour into funnel & filter 10 min", primary:true, block:true, onClick(){ act("filt"); } }]);
    const rd = Kit.reading(ctx, "Volume of juice / cm³ (read the meniscus)", "e.g. 12.5", () => st.filt && !filtering && !st.read ? Vtrue : null, .25, v => {
      st.read = true; ctx.step("read"); V = v;
      const clarity = clar > .6 ? "clear" : clar > .25 ? "slightly cloudy" : "cloudy";
      ctx.record({ treat:{ pect:"Pectinase", boiled:"Boiled pectinase", water:"Water" }[treat], T, enz, V:v, clar:clarity });
      const rows = ctx.rows();
      const byT = {}; rows.forEach(r => { (byT[r.T] = byT[r.T] || new Set()).add(r.treat); });
      if(Object.values(byT).some(s => s.size >= 3)) ctx.complete("controls");
      const pe = rows.filter(r => r.treat === "Pectinase");
      const byE = {}; pe.forEach(r => { (byE[r.enz] = byE[r.enz] || new Set()).add(r.T); });
      if(Object.values(byE).some(s => s.size >= 5)) ctx.complete("temps");
      const byT2 = {}; pe.forEach(r => { (byT2[r.T] = byT2[r.T] || new Set()).add(r.enz); });
      if(Object.values(byT2).some(s => s.size >= 3)) ctx.complete("volume");
      draw();
    });
    ctx.buttons([{ label:"New trial", block:true, onClick(){ if(filtering || incubating) return ctx.toast("Wait for this stage to finish"); st = {}; juice = 0; tmin = 0; clar = 0; ctx.resetSteps(); rd.clear(); draw(); } }]);
    Kit.answer(ctx, "Optimum temperature from your results / °C", "e.g. 45", v => {
      const pe = ctx.rows().filter(r => r.treat === "Pectinase"), ts = new Set(pe.map(r => r.T));
      if(ts.size < 5) return [false, "Test pectinase at five or more temperatures first."];
      const best = pe.reduce((a, r) => r.V > a.V ? r : a);
      if(Math.abs(v - best.T) <= 5){ ctx.complete("opt"); return [true, `Yes — the most juice (${best.V.toFixed(1)} cm³) was collected at about ${best.T} °C. Testing at smaller intervals near here would pin it down.`]; }
      return [false, "Find the temperature on your graph where the volume of juice is highest."];
    });
    draw();
  }
});

/* ───────────── BIOLOGICAL WASHING POWDER ───────────── */
Lab.register({
  id:"washing", subject:"biology", level:["igcse"], topic:"Biotechnology · Enzymes", interactive:true,
  title:"Biological washing powders",
  summary:"Wash cloth squares stained with egg, milk or grease in biological or non-biological powder at different temperatures and time how long the stain takes to disappear. Or measure how far protease clears cooked egg white in a tube.",
  aim:"Compare the effectiveness of biological and non-biological washing powders at removing stains at different temperatures.",
  variables:{ iv:"Type of washing powder; temperature", dv:"Time for the stain to disappear / s (rate = 1000 ÷ time), or length of egg white cleared / mm", cv:["Same size of stain, same cloth","Same mass of powder in the same volume of water","Same stirring"] },
  stageTitle:"Wash beaker & stain", controlsTitle:"Method",
  thumb:`<svg viewBox="0 0 300 140"><rect x="40" y="30" width="100" height="100" rx="6" fill="#F7F7F2" stroke="#A2ACBD" stroke-width="3"/><ellipse cx="90" cy="80" rx="32" ry="24" fill="#E8C44A" opacity=".9"/><rect x="160" y="30" width="100" height="100" rx="6" fill="#F7F7F2" stroke="#A2ACBD" stroke-width="3"/><ellipse cx="210" cy="80" rx="32" ry="24" fill="#E8C44A" opacity=".2"/></svg>`,
  challenges:[
    { id:"compare", title:"Biological vs non-biological", text:"Wash egg stains with both powders at the same temperature." },
    { id:"temps",   title:"Temperature", text:"Use biological powder on one stain at four or more temperatures." },
    { id:"lipase",  title:"Grease", text:"Remove a grease stain with biological powder." },
    { id:"tube",    title:"Egg-white tube", text:"Measure the cleared length for both powders at the same temperature." }
  ],
  columns:[{key:"set",label:"Powder · stain"},{key:"T",label:"Temperature / °C",dp:0},{key:"t",label:"Time to disappear / s"},{key:"rate",label:"Rate = 1000 ÷ t / s⁻¹",dp:2},{key:"L",label:"Egg white cleared / mm",dp:1}],
  series:"set",
  graph:{ x:["T"], y:["rate","L"], fit:"curve" },
  questions:[
    { q:"Explain how biological washing powders remove egg and grease stains.",
      a:"They contain proteases and lipases. Proteases digest proteins in egg and milk into amino acids, and lipases digest fats and oils into fatty acids and glycerol. These products are small and soluble, so they wash out of the cloth." },
    { q:"Why are biological powders recommended at about 40 °C?",
      a:"40 °C is close to the optimum of these enzymes, so they work quickly. At higher temperatures they are denatured. Washing at 40 °C also uses less energy than a hot wash and is gentler on delicate fabrics." },
    { q:"Why does non-biological powder remove grease better at higher temperatures but hardly remove egg?",
      a:"Detergent emulsifies fats, and warm fat is softer and spreads off the cloth more easily. Cooked egg is protein, which detergent alone cannot break down; it needs a protease." },
    { q:"Why is the time for the stain to disappear only an estimate?",
      a:"Deciding when a stain has ‘gone’ is a judgement, and reaction time adds to the error. Improve this by comparing against a clean square under the same light, or using a colorimeter to measure how much light the cloth reflects." },
    { q:"How does the egg-white tube method avoid this problem?",
      a:"Protease digests the cooked egg white from the open end, leaving a clear section. Its length can be measured with a ruler (± 0.5 mm) after a fixed time, which is more objective than judging when a stain has disappeared." },
    { q:"Assess the risks of handling enzyme washing powder.",
      a:"Powdered enzymes can cause allergies and asthma if breathed in, and irritate skin and eyes. Avoid making dust, wear eye protection and wash hands. Take care with hot water." }
  ],
  setup(ctx){
    const SPEED = 60;              // 1 s of real time = 1 minute
    let method = "cloth", powder = "bio", stain = "egg", T = 40, k = 0, simT = 0, washing = false, done = false, blot = "", tube = null, tubeT = 0;
    const POW = { bio:"Biological", non:"Non-biological", water:"Water only" }, STAIN = { egg:"egg", milk:"milk", grease:"grease" };
    const STCOL = { egg:"#E3B832", milk:"#BFAF7E", grease:"#8F6A2E" };
    function rateK(){                       /* per minute */
      const a = IG3act(T, 54), det = 1 + (T - 20)/30;
      const tab = { egg:{ bio:.45*a + .02*det, non:.02*det, water:.006*det }, milk:{ bio:.5*a + .03*det, non:.035*det, water:.01*det }, grease:{ bio:.3*a + .06*det, non:.06*det, water:.004*det } };
      return tab[stain][powder]*(1 + .07*ctx.gauss());
    }
    const S = t => Math.exp(-k*t/60);       // fraction of stain left after t seconds
    function newBlot(){ const n = 14, pts = []; for(let i = 0; i < n; i++){ const a = i/n*2*Math.PI, r = 62 + IG3rnd(-12, 14); pts.push([700 + r*Math.cos(a)*1.15, 220 + r*Math.sin(a)]); }
      blot = "M" + pts.map((p, i) => { const q = pts[(i + 1) % n]; return `${p[0].toFixed(0)} ${p[1].toFixed(0)}Q${p[0].toFixed(0)} ${p[1].toFixed(0)} ${((p[0] + q[0])/2).toFixed(0)} ${((p[1] + q[1])/2).toFixed(0)}`; }).join("T") + "Z"; }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="wp-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 440)}
      <g id="wp-bath"></g><g id="wp-main"></g><g id="wp-sw"></g><text x="20" y="30" class="k-status" id="wp-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#wp-svg"), $ = s => svg.querySelector(s);
    const sw = Kit.stopwatch("wp-st", 40, 60);
    $("#wp-sw").innerHTML = sw.svg; sw.bind(svg);
    const therm = Kit.thermometer("wp-th", 300, 170, 200, 0, 80, 20, true);
    function draw(){
      const sol = powder === "water" ? "url(#k-water)" : "#CFE0F2";
      let b = `<rect x="60" y="210" width="220" height="190" rx="10" fill="#E6EEF7" fill-opacity=".35" stroke="#7C93AE" stroke-width="2"/><rect x="62" y="240" width="216" height="158" rx="8" fill="${sol}" opacity=".85"/>
        ${powder !== "water" ? [...Array(14)].map((_, i) => `<circle cx="${80 + (i*53) % 180}" cy="${250 + (i*29) % 60}" r="${3 + i % 3}" fill="#fff" opacity=".7"/>`).join("") : ""}
        <text x="170" y="425" text-anchor="middle" class="k-tag">${POW[powder]} solution · ${T} °C</text>`;
      if(method === "cloth" && (washing || done)) b += `<g transform="translate(170 320) rotate(-8)"><rect x="-40" y="-40" width="80" height="80" fill="#F7F7F2" stroke="#B9B4A2"/><path d="M-26 -18q14 -14 30 -4q22 6 8 24q-10 18 -30 6q-20 -10 -8 -26z" fill="${STCOL[stain]}" opacity="${S(simT).toFixed(3)}"/></g>`;
      if(method === "tube" && tube) b += `<rect x="90" y="300" width="160" height="12" rx="6" fill="#F5F2E6" stroke="#9AA3B2"/>`;
      $("#wp-bath").innerHTML = b + therm.svg; therm.set(svg, T);
      let m = "";
      if(method === "cloth"){
        m += `<rect x="560" y="80" width="280" height="280" rx="4" fill="#F7F7F2" stroke="#B9B4A2" stroke-width="2"/>${[...Array(28)].map((_, i) => `<path d="M${560 + i*10} 80v280M560 ${80 + i*10}h280" stroke="#E7E3D6" stroke-width=".8"/>`).join("")}`;
        if(washing || done) m += `<path d="${blot}" fill="${STCOL[stain]}" opacity="${S(simT).toFixed(3)}"/>`;
        else m += `<text x="700" y="225" text-anchor="middle" class="k-lbl">add a stained cloth square</text>`;
        m += `<text x="700" y="384" text-anchor="middle" class="k-lbl">close-up of the cloth (${STAIN[stain]} stain)</text>`;
      }else{
        const X0 = 380, PX = 9;
        m += `<text x="${X0}" y="150" class="k-tag">glass tube of cooked egg white, open at the left end</text>`;
        if(tube){
          const L = tubeT >= 1 ? tube.L : 0;
          m += `<rect x="${X0 - 6}" y="180" width="${60*PX + 12}" height="34" rx="8" fill="#E6EEF7" fill-opacity=".5" stroke="#7C93AE" stroke-width="2"/>
            <rect x="${X0 + L*PX}" y="184" width="${(60 - L)*PX}" height="26" fill="#F2EEDC"/><rect x="${X0 + 60*PX - 2}" y="180" width="8" height="34" fill="#7C93AE"/>`;
          m += `<rect x="${X0 - 10}" y="226" width="${60*PX + 20}" height="46" rx="4" fill="#F2E6C2" stroke="#B8962E"/>`;
          for(let mm = 0; mm <= 60; mm++){ const x = X0 + mm*PX, h = mm % 10 === 0 ? 18 : mm % 5 === 0 ? 12 : 7; m += `<line x1="${x}" y1="226" x2="${x}" y2="${226 + h}" stroke="#4B3621" stroke-width=".9"/>`; if(mm % 10 === 0) m += `<text x="${x}" y="262" text-anchor="middle" style="font:600 11px 'JetBrains Mono';fill:#4B3621">${mm}</text>`; }
          m += `<text x="${X0 + 60*PX}" y="290" text-anchor="end" class="k-lbl">mm</text>`;
          if(tubeT < 1) m += `<text x="${X0}" y="330" class="k-hint">in the powder solution… ${Math.floor(tubeT*24)} h</text>`;
          else m += `<text x="${X0}" y="330" class="k-hint">24 h — read the length of tube that has cleared</text>`;
        }else m += `<text x="${X0}" y="220" class="k-lbl">press “Put tube in for 24 h”</text>`;
      }
      $("#wp-main").innerHTML = m;
      sw.svg && ($("#wp-sw").style.display = method === "cloth" ? "" : "none");
      $("#wp-status").textContent = method === "cloth" ? (washing ? (sw.running ? "Watch the stain — stop the stopwatch when it has gone" : "Stopwatch stopped — record the time") : done ? "Recorded — add a new cloth" : "Choose powder, stain and temperature, then add the cloth") : tube ? (tubeT >= 1 ? "Measure the cleared length" : "Leaving the tube for 24 hours") : "Egg-white tube method";
      ctx.readout([["Powder", POW[powder]], ["Temperature", T + " °C"], method === "cloth" ? ["Stain", STAIN[stain]] : ["Method", "egg-white tube"]]);
    }
    ctx.frame(dt => {
      if(method === "cloth" && washing){ sw.tick(dt*SPEED); simT += dt*SPEED;
        if(simT >= 1800){ washing = false; sw.stop(); ctx.toast("30 minutes — the stain is still there"); stillThere(); }
        draw(); }
      else if(method === "tube" && tube && tubeT < 1){ tubeT = Math.min(1, tubeT + dt/3); draw(); }
    });
    const setLabel = () => POW[powder] + " · " + (method === "cloth" ? STAIN[stain] : "egg-white tube");
    function checks(){
      const rows = ctx.rows(), done = (p, st, Tt) => rows.some(r => r.set === POW[p] + " · " + st && (Tt === undefined || r.T === Tt));
      if(rows.some(r => r.set === "Biological · egg" && rows.some(q => q.set === "Non-biological · egg" && q.T === r.T))) ctx.complete("compare");
      for(const s of ["egg", "milk", "grease"]){ const ts = new Set(rows.filter(r => r.set === "Biological · " + s && typeof r.t === "number").map(r => r.T)); if(ts.size >= 4) ctx.complete("temps"); }
      if(rows.some(r => r.set === "Biological · grease" && typeof r.t === "number")) ctx.complete("lipase");
      if(rows.some(r => r.set === "Biological · egg-white tube" && rows.some(q => q.set === "Non-biological · egg-white tube" && q.T === r.T))) ctx.complete("tube");
      return done;
    }
    function stillThere(){ ctx.record({ set:setLabel(), T, t:">1800", rate:0, L:null }); done = true; washing = false; checks(); }
    const lock = () => washing || (method === "tube" && tube && tubeT < 1);
    const sM = ctx.seg({ label:"Method", value:"cloth", options:[["cloth","Stained cloth (time)"],["tube","Egg-white tube (length)"]], onChange(v){ if(lock()){ sM.set(method); return ctx.toast("Finish this wash first"); } method = v; boxC.style.display = v === "cloth" ? "" : "none"; boxT.style.display = v === "tube" ? "" : "none"; tube = null; done = false; sw.reset(); draw(); } });
    const sP = ctx.seg({ label:"Washing powder", value:"bio", options:[["bio","Biological"],["non","Non-biological"],["water","Water only"]], onChange(v){ if(lock()){ sP.set(powder); return ctx.toast("Finish this wash first"); } powder = v; draw(); } });
    const sT = ctx.slider({ label:"Temperature", min:20, max:80, step:5, value:40, unit:"°C", onInput(v){ if(lock()){ sT.set(T); return ctx.toast("Finish this wash first"); } T = v; draw(); } });
    const boxC = ctx.html(`<div></div>`), boxT = ctx.html(`<div style="display:none"></div>`);
    const sS = ctx.seg({ label:"Stain", value:"egg", options:[["egg","Egg"],["milk","Milk"],["grease","Grease"]], parent:boxC, onChange(v){ if(lock()){ sS.set(stain); return ctx.toast("Finish this wash first"); } stain = v; draw(); } });
    ctx.html(`<div class="hint" style="margin-bottom:8px">Time-lapse: 1 s on screen = 1 minute. The stopwatch starts when the cloth goes in; press STOP when you can no longer see the stain.</div>`, boxC);
    ctx.buttons([{ label:"Add cloth & start timing", primary:true, onClick(){
      if(washing) return ctx.toast("Already washing");
      k = rateK(); simT = 0; newBlot(); washing = true; done = false; sw.reset(); sw.running = true; sw._q("-ssl").textContent = "STOP"; draw();
    } }, { label:"Record time", onClick(){
      if(!washing) return ctx.toast("Add a cloth first");
      if(sw.running) return ctx.toast("Stop the stopwatch when the stain has disappeared");
      const t = Math.round(sw.t), left = S(t);
      if(t < 1) return ctx.toast("Start and stop the stopwatch to time the wash");
      if(left > .16) return ctx.toast(`At ${t} s the stain was still visible — restart the stopwatch and keep watching`);
      if(left < .004) ctx.toast("Late stop — the stain had gone some time earlier");
      washing = false; done = true;
      ctx.record({ set:setLabel(), T, t, rate:Kit.round(1000/t, 2), L:null }); checks(); draw();
    } }], boxC);
    ctx.buttons([{ label:"Stain still there after 30 min", block:true, onClick(){ if(!washing) return ctx.toast("Add a cloth first"); if(simT < 600) return ctx.toast("Give it longer — watch for at least 10 minutes"); sw.stop(); stillThere(); draw(); } }], boxC);
    ctx.buttons([{ label:"Put tube in for 24 h", primary:true, block:true, onClick(){
      if(tube && tubeT < 1) return;
      const a = IG3act(T, 54)/1.21, L = powder === "bio" ? 20*a : powder === "non" ? .4 + .1*(T - 20)/30 : .1;
      tube = { L:Kit.clamp(Kit.round(L*(1 + .06*ctx.gauss()) + .2*ctx.gauss(), 1), 0, 58) }; tubeT = 0; rdT.clear(); draw();
    } }], boxT);
    const rdT = Kit.reading(ctx, "Length of egg white cleared / mm", "e.g. 12", () => tube && tubeT >= 1 && !tube.read ? tube.L : null, .5, v => {
      tube.read = true; ctx.record({ set:setLabel(), T, t:null, rate:null, L:v }); checks(); draw();
    }, boxT);
    draw();
  }
});

/* ───────────── LACTASE AND LACTOSE-FREE MILK ───────────── */
Lab.register({
  id:"lactase", subject:"biology", level:["igcse"], topic:"Biotechnology · Enzymes", interactive:true,
  title:"Lactase and lactose-free milk",
  summary:"Add lactase to milk in a water bath and test it with glucose test strips every few minutes, matching each strip to the colour chart. Compare with control milk and repeat at other temperatures.",
  aim:"Investigate how temperature affects the rate at which lactase breaks down lactose in milk into glucose and galactose.",
  variables:{ iv:"Temperature of the water bath", dv:"Glucose concentration from the test-strip colour chart / g dm⁻³ at each time", cv:["Same volume of the same milk","Same volume of lactase","Test strips read after the same time"] },
  stageTitle:"Water bath, milk & colour chart", controlsTitle:"Method",
  thumb:`<svg viewBox="0 0 300 140"><rect x="60" y="20" width="34" height="100" rx="14" fill="#F8F6EE" stroke="#9AA3B2" stroke-width="3"/><rect x="120" y="20" width="34" height="100" rx="14" fill="#F8F6EE" stroke="#9AA3B2" stroke-width="3"/>${["#7EC8E3","#8CCB9B","#A9C25E","#C2A43F","#A87A2E","#7A4E1E"].map((c, i) => `<rect x="${180 + (i % 2)*36}" y="${20 + Math.floor(i/2)*36}" width="30" height="30" rx="4" fill="${c}"/>`).join("")}</svg>`,
  challenges:[
    { id:"curve",   title:"Time course", text:"Test the milk with lactase five or more times in one run." },
    { id:"control", title:"Control", text:"Test the control milk at least twice." },
    { id:"temps",   title:"Temperatures", text:"Complete runs at three or more temperatures (three readings each)." },
    { id:"rate",    title:"Rate", text:"Calculate the mean rate of glucose production from your last reading." }
  ],
  columns:[{key:"run",label:"Tube"},{key:"T",label:"Temperature / °C",dp:0},{key:"t",label:"Time / min",dp:1},{key:"G",label:"Glucose / g dm⁻³"}],
  series:"run",
  graph:{ x:["t","T"], y:["G"], fit:"curve" },
  questions:[
    { q:"What does lactase do, and why is lactose-free milk made?",
      a:"Lactase breaks down lactose (a disaccharide) into glucose and galactose. People who are lactose-intolerant do not make enough lactase, so lactose-free milk lets them drink milk without digestive problems." },
    { q:"Why does the control milk give a negative glucose test?",
      a:"Milk contains lactose but almost no free glucose. Glucose test strips react only with glucose, so glucose appears only when lactase has broken down lactose. This shows the glucose comes from the enzyme’s action." },
    { q:"Why do the glucose readings level off?",
      a:"As the reaction goes on there is less lactose left, so fewer enzyme–substrate complexes form and the rate falls. When almost all the lactose has been broken down, no more glucose is made." },
    { q:"Explain why the rate is lower at 70 °C than at 40 °C.",
      a:"At 70 °C the lactase is denatured: the shape of its active site changes, so lactose no longer fits and fewer enzyme–substrate complexes form." },
    { q:"What are the limitations of using glucose test strips?",
      a:"The colour chart has only a few steps, so the result is a range rather than an exact concentration, and matching colours is a judgement. A colorimeter, or a glucose meter, would give more precise results." },
    { q:"Suggest how lactase is used in industry to make lactose-free milk continuously.",
      a:"Lactase is immobilised in alginate beads packed in a column. Milk flows through the column and comes out lactose-free; the enzyme stays in the column and can be reused, and the milk is not contaminated with enzyme." }
  ],
  setup(ctx){
    const LEV = [0, 1, 2.5, 5, 10, 15, 20], COL = [[126, 200, 227], [140, 203, 155], [169, 194, 94], [194, 164, 63], [176, 128, 48], [146, 98, 38], [112, 68, 28]];
    let T = 40, run = 0, t = 0, running = false, strip = null, k = 0;
    const TOP = LEV.length - 1, pos = g => { if(g >= 20) return TOP; for(let i = 0; i < TOP; i++) if(g < LEV[i + 1]) return i + (g - LEV[i])/(LEV[i + 1] - LEV[i]); return TOP; };
    const colAt = p => { p = Kit.clamp(p, 0, TOP); const i = Math.min(TOP - 1, Math.floor(p)), f = p - i, a = COL[i], b = COL[i + 1]; return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v)*f)).join(",")})`; };
    const G = tt => 24*(1 - Math.exp(-k*tt));
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="la-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 440)}
      <g id="la-bath"></g><g id="la-chart"></g><text x="20" y="30" class="k-status" id="la-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#la-svg"), $ = s => svg.querySelector(s);
    const therm = Kit.thermometer("la-th", 380, 170, 190, 0, 80, 20, true);
    function draw(){
      let b = `<rect x="40" y="200" width="380" height="200" rx="10" fill="url(#k-water)" stroke="#7C93AE" stroke-width="2"/><rect x="40" y="400" width="380" height="40" rx="6" fill="#4B5563"/><text x="200" y="425" text-anchor="middle" style="font:600 11px Inter;fill:#E5E7EB">water bath ${T} °C</text>`;
      [["A", "milk + lactase", 120], ["B", "milk + water (control)", 260]].forEach(([n, lab, x]) => {
        b += `<rect x="${x - 26}" y="120" width="52" height="250" rx="24" fill="#E6EEF7" fill-opacity=".4" stroke="#7C93AE" stroke-width="2"/><rect x="${x - 23}" y="170" width="46" height="196" rx="21" fill="#F8F6EE"/><rect x="${x - 26}" y="120" width="52" height="250" rx="24" fill="url(#k-glass)"/>
          <text x="${x}" y="104" text-anchor="middle" style="font:700 16px 'Space Grotesk';fill:var(--txt)">${n}</text><text x="${x}" y="88" text-anchor="middle" class="k-lbl">${lab}</text>`; });
      b += `<g transform="translate(510 378)"><rect width="140" height="44" rx="8" fill="#1F2937"/><text x="70" y="29" text-anchor="middle" style="font:600 18px 'JetBrains Mono';fill:#7CFFB2">${Math.floor(t)}:${String(Math.floor((t % 1)*60)).padStart(2, "0")}</text><text x="152" y="27" class="k-lbl">time since lactase was added (min:s)</text></g>`;
      $("#la-bath").innerHTML = b + therm.svg; therm.set(svg, T);
      let c = `<rect x="470" y="60" width="470" height="300" rx="12" fill="#FFFFFF" stroke="#C9CED8"/><text x="490" y="88" style="font:700 11px Inter;fill:#475569;letter-spacing:.05em">GLUCOSE TEST STRIP COLOUR CHART (g dm⁻³)</text>`;
      LEV.forEach((v, i) => { const x = 490 + i*64; c += `<g data-lev="${i}" style="cursor:${strip ? "pointer" : "default"}"><rect x="${x}" y="110" width="52" height="58" rx="6" fill="${colAt(i)}" stroke="${strip ? "#334155" : "#C9CED8"}" stroke-width="${strip ? 1.6 : 1}"/><text x="${x + 26}" y="188" text-anchor="middle" style="font:600 13px 'JetBrains Mono';fill:#334155">${v === 20 ? "≥20" : v}</text></g>`; });
      if(strip){
        c += `<g transform="translate(560 220)"><rect width="300" height="22" rx="3" fill="#F4F4F0" stroke="#9AA3B2"/><rect x="250" y="2" width="40" height="18" rx="2" fill="${strip.col}"/></g>
          <text x="560" y="270" class="k-tag">strip from tube ${strip.tube} at ${strip.t.toFixed(1)} min</text><text x="560" y="292" class="k-hint">click the chart colour that matches the pad</text>`;
      }else c += `<text x="560" y="250" class="k-lbl">${running ? "Dip a strip in tube A or B" : run ? "Start a new run" : "Set the temperature, then add lactase to tube A"}</text>`;
      $("#la-chart").innerHTML = c;
      $("#la-status").textContent = running ? `Run at ${T} °C — test the milk at intervals` : "Lactose-free milk";
      ctx.readout([["Temperature", T + " °C"], ["Time", t.toFixed(1) + " min"], ["Readings this run", String(ctx.rows().filter(r => r.runId === run && r.run !== "B: control").length)]]);
    }
    ctx.frame(dt => { if(running){ t = Math.min(20, t + dt); if(t >= 20){ running = false; ctx.toast("20 minutes — run finished"); } draw(); } });
    svg.addEventListener("pointerdown", e => {
      const g = e.target.closest("[data-lev]"); if(!g || !strip) return;
      const i = +g.dataset.lev, near = Math.round(strip.p), ok = i === near || (Math.abs(strip.p - near) > .35 && Math.abs(i - strip.p) < 1);
      if(!ok) return ctx.toast("Look again — compare the pad with each colour block");
      ctx.record({ run:strip.tube === "A" ? `A: lactase ${T} °C` : "B: control", runId:run, T, t:strip.t, G:LEV[i] });
      strip = null; checks(); draw();
    });
    function dip(tube){
      if(!running) return ctx.toast(run ? "This run has finished — start a new run" : "Add lactase to tube A first");
      if(strip) return ctx.toast("Read the last strip on the colour chart first");
      const tt = Math.round(t*2)/2, g = tube === "A" ? G(tt) : 0, p = Kit.clamp(pos(g) + (tube === "A" ? .1*ctx.gauss() : 0), 0, TOP);
      strip = { tube, t:tt, p, col:colAt(p) }; draw();
    }
    function checks(){
      const rows = ctx.rows(), A = rows.filter(r => r.run.startsWith("A"));
      const per = {}; A.forEach(r => { per[r.runId] = (per[r.runId] || 0) + 1; });
      if(Object.values(per).some(n => n >= 5)) ctx.complete("curve");
      if(rows.filter(r => r.run === "B: control").length >= 2) ctx.complete("control");
      const tset = {}; A.forEach(r => { if(per[r.runId] >= 3) tset[r.T] = 1; });
      if(Object.keys(tset).length >= 3) ctx.complete("temps");
    }
    const sT = ctx.slider({ label:"Water-bath temperature", min:10, max:70, step:5, value:40, unit:"°C", onInput(v){ if(running){ sT.set(T); return ctx.toast("Finish this run first"); } T = v; draw(); } });
    ctx.html(`<div class="hint" style="margin-bottom:8px">Time-lapse: 1 s on screen = 1 minute. Dip a strip every 2 minutes or so.</div>`);
    ctx.buttons([{ label:"Add lactase to A & start clock", primary:true, block:true, onClick(){
      if(running) return ctx.toast("Already running");
      run = Date.now(); t = 0; strip = null; k = .12*IG3act(T, 54)*(1 + .06*ctx.gauss()); running = true; draw();
    } }]);
    ctx.buttons([{ label:"Dip strip in A", onClick(){ dip("A"); } }, { label:"Dip strip in B (control)", onClick(){ dip("B"); } }]);
    Kit.answer(ctx, "Mean rate from your last tube A reading / g dm⁻³ min⁻¹", "e.g. 1.2", v => {
      const A = ctx.rows().filter(r => r.run.startsWith("A") && r.t > 0); if(!A.length) return [false, "Record a reading from tube A after time 0 first."];
      const r = A[A.length - 1], truth = r.G/r.t;
      if(Math.abs(v - truth) <= Math.max(.02, truth*.05)){ ctx.complete("rate"); return [true, `Correct: ${r.G} g dm⁻³ ÷ ${r.t} min = ${truth.toFixed(2)} g dm⁻³ min⁻¹.`]; }
      return [false, `Mean rate = glucose concentration ÷ time. Use your last reading: ${r.G} g dm⁻³ at ${r.t} min.`];
    });
    draw();
  }
});
