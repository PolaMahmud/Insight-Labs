"use strict";
/* ══════════════════════════════════════════════════════════════════
   CIRCUIT BUILDER (IGCSE Physics) — hands-on bench
   Components sit on the edges of a grid of nodes. A small nodal-analysis
   solver (conductances + Norton current sources, iterated for lamps and
   LEDs) gives every node voltage and component current.
══════════════════════════════════════════════════════════════════ */
(function(){
  const COLS = 11, ROWS = 7, SP = 72, OX = 60, OY = 50;
  const W = OX*2 + SP*(COLS - 1), H = OY*2 + SP*(ROWS - 1);
  const nodeXY = (c, r) => [OX + c*SP, OY + r*SP];

  /* part catalogue: label, default value, and how the solver sees it */
  const PARTS = {
    wire:     { name:"Wire" },
    cell:     { name:"Cell / battery", value:3,  values:[1.5, 3, 4.5, 6, 9, 12], unit:"V", polar:true },
    lamp:     { name:"Lamp" },
    resistor: { name:"Resistor", value:10, values:[5, 10, 20, 47, 100], unit:"Ω" },
    varres:   { name:"Variable resistor", value:20, min:0, max:50, unit:"Ω" },
    switch:   { name:"Switch", closed:true },
    ammeter:  { name:"Ammeter", polar:true },
    voltmeter:{ name:"Voltmeter", polar:true },
    led:      { name:"LED", polar:true },
    ldr:      { name:"LDR" },
    therm:    { name:"Thermistor" }
  };
  const TRAY = ["wire","cell","lamp","resistor","varres","switch","ammeter","voltmeter","led","ldr","therm"];

  /* symbols drawn horizontally, centred on 0,0, forward = +x */
  function symbol(t, c, live){
    const L = (a, b) => `<path d="M-36 0H${a}M${b} 0H36" class="lead"/>`;
    switch(t){
      case "wire": return `<path d="M-36 0H36" class="copper"/>`;
      case "cell": return L(-5, 5) + `<line x1="-5" y1="-8" x2="-5" y2="8" stroke="var(--txt)" stroke-width="5"/><line x1="5" y1="-17" x2="5" y2="17" stroke="var(--txt)" stroke-width="2.4"/>
        <text x="11" y="-10" class="sym-sign">+</text>`;
      case "lamp": {
        const p = live ? Math.min(1, live.P/3) : 0;
        return L(-15, 15) + `<circle r="${18 + 22*p}" fill="url(#cb-glow)" opacity="${(Math.pow(p, .6)).toFixed(2)}"/>
          <circle r="14" fill="color-mix(in srgb,var(--bg2) 70%,transparent)" stroke="var(--txt)" stroke-width="2"/><path d="M-10 -10L10 10M10 -10L-10 10" stroke="${p > .02 ? "#FFD24A" : "var(--txt)"}" stroke-width="2"/>`; }
      case "resistor": return L(-18, 18) + `<rect x="-18" y="-8" width="36" height="16" rx="2" fill="var(--bg2)" stroke="var(--txt)" stroke-width="2"/>`;
      case "varres": return L(-18, 18) + `<rect x="-18" y="-8" width="36" height="16" rx="2" fill="var(--bg2)" stroke="var(--txt)" stroke-width="2"/>
        <path d="M-16 14L16 -14M16 -14l-8 1M16 -14l-1 8" stroke="var(--accent)" stroke-width="2" fill="none"/>`;
      case "switch": {
        const closed = c.closed !== false;
        return L(-14, 14) + `<circle cx="-14" r="3.5" fill="var(--txt)"/><circle cx="14" r="3.5" fill="var(--txt)"/>
          <line x1="-14" y1="0" x2="${closed ? 14 : 10}" y2="${closed ? 0 : -16}" stroke="${closed ? "var(--sec)" : "var(--hi)"}" stroke-width="3" stroke-linecap="round"/>
          <rect x="-24" y="-24" width="48" height="36" fill="transparent" class="hit"/>`; }
      case "ammeter": case "voltmeter":
        return L(-15, 15) + `<circle r="15" fill="var(--bg2)" stroke="var(--txt)" stroke-width="2"/><text y="5" text-anchor="middle" class="sym-letter">${t === "ammeter" ? "A" : "V"}</text>
          <text x="20" y="-9" class="sym-sign">+</text>`;
      case "led": {
        const on = live && live.I > 0.002, b = on ? Math.min(1, live.I/0.02) : 0;
        return L(-10, 10) + `<circle r="${16 + 10*b}" fill="url(#cb-red)" opacity="${b.toFixed(2)}"/>
          <path d="M-10 -11V11L10 0Z" fill="${on ? "#FF4D4D" : "var(--bg2)"}" stroke="var(--txt)" stroke-width="2"/><line x1="10" y1="-11" x2="10" y2="11" stroke="var(--txt)" stroke-width="2.4"/>
          <path d="M2 -14l7 -9M8 -12l7 -9" stroke="var(--txt2)" stroke-width="1.5"/><path d="M9 -23l0 4M9 -23l-4 1M15 -21l0 4M15 -21l-4 1" stroke="var(--txt2)" stroke-width="1.5"/>`; }
      case "ldr": return L(-18, 18) + `<circle r="20" fill="none" stroke="var(--txt2)" stroke-width="1.4"/><rect x="-14" y="-7" width="28" height="14" rx="2" fill="var(--bg2)" stroke="var(--txt)" stroke-width="2"/>
        <path d="M-20 -26l8 10M-12 -28l8 10" stroke="var(--tri)" stroke-width="1.6"/><path d="M-12 -16l-4 -1M-12 -16l1 -4M-4 -18l-4 -1M-4 -18l1 -4" stroke="var(--tri)" stroke-width="1.6"/>`;
      case "therm": return L(-18, 18) + `<rect x="-18" y="-8" width="36" height="16" rx="2" fill="var(--bg2)" stroke="var(--txt)" stroke-width="2"/>
        <path d="M-22 14L14 -14H24" stroke="var(--hi)" stroke-width="2" fill="none"/>`;
    }
    return "";
  }
  const trayIcon = t => `<svg viewBox="-40 -26 80 52">${symbol(t, PARTS[t])}</svg>`;

  Lab.register({
    id:"circuit-builder", subject:"physics", topic:"Electricity · Circuits", interactive:true,
    title:"Circuit builder",
    summary:"Drag cells, lamps, resistors, meters, LEDs, LDRs and thermistors onto a board, wire them up and watch the current flow.",
    aim:"Build series and parallel circuits, measure current and potential difference correctly, and investigate how components behave.",
    stageTitle:"Circuit board", controlsTitle:"Selected part",
    thumb:`<svg viewBox="0 0 300 140"><defs><radialGradient id="tcb"><stop offset="0" stop-color="#FFE68A"/><stop offset="1" stop-color="#FFE68A" stop-opacity="0"/></radialGradient></defs>
      <path d="M60 30H240V110H60Z" fill="none" stroke="#D9A066" stroke-width="4"/>
      <rect x="128" y="18" width="10" height="24" fill="#0A0D13"/><line x1="128" y1="22" x2="128" y2="38" stroke="#E9EDF5" stroke-width="5"/><line x1="138" y1="14" x2="138" y2="46" stroke="#E9EDF5" stroke-width="2.5"/>
      <circle cx="150" cy="110" r="38" fill="url(#tcb)"/><circle cx="150" cy="110" r="14" fill="#0A0D13" stroke="#E9EDF5" stroke-width="2.5"/><path d="M140 100l20 20M160 100l-20 20" stroke="#FFD24A" stroke-width="2.5"/>
      <circle cx="240" cy="70" r="14" fill="#0A0D13" stroke="#E9EDF5" stroke-width="2.5"/><text x="240" y="75" text-anchor="middle" font-size="14" font-weight="700" fill="#E9EDF5" font-family="sans-serif">A</text>
      <circle r="4" fill="#7DD3FC"><animateMotion dur="3s" repeatCount="indefinite" path="M60 30H240V110H60Z"/></circle><circle r="4" fill="#7DD3FC"><animateMotion dur="3s" begin="-1.5s" repeatCount="indefinite" path="M60 30H240V110H60Z"/></circle></svg>`,
    challenges:[
      { id:"light",    title:"Light a lamp", text:"Connect a cell and a lamp in a complete circuit." },
      { id:"series",   title:"Two lamps in series", text:"Both lamps lit, one after the other in the same loop." },
      { id:"parallel", title:"Two lamps in parallel", text:"Each lamp on its own branch — removing one leaves the other lit." },
      { id:"ammeter",  title:"Measure the current", text:"Put an ammeter in series with a lit lamp." },
      { id:"voltmeter",title:"Measure the p.d.", text:"Put a voltmeter in parallel with a lit lamp." },
      { id:"switch",   title:"Control it with a switch", text:"A switch that turns a lamp on and off." },
      { id:"dimmer",   title:"Make a dimmer", text:"A variable resistor that changes a lamp’s brightness." },
      { id:"led",      title:"LED the right way round", text:"Make an LED light up (it only conducts one way)." },
      { id:"ldr",      title:"Light sensor", text:"A potential divider with an LDR: a voltmeter reading that changes by over 1 V with light level." },
      { id:"ohm",      title:"Ohm’s law data", text:"Record 5 or more readings with different voltmeter values." }
    ],
    columns:[{key:"A1",label:"A1 / A",dp:3},{key:"A2",label:"A2 / A",dp:3},{key:"V1",label:"V1 / V",dp:2},{key:"V2",label:"V2 / V",dp:2},
      {key:"emf",label:"Supply / V",dp:1},{key:"var",label:"Var. R / Ω",dp:0},{key:"light",label:"Light / %",dp:0},{key:"temp",label:"Temp / °C",dp:0}],
    graph:{ x:["V1","emf","var","light","temp"], y:["A1","A2","V1","V2"], fit:"none" },
    questions:[
      { q:"How is an ammeter connected, and why must it have a very low resistance?",
        a:"In series, so the same current flows through it as through the component. Low resistance so it doesn’t reduce the current it is measuring." },
      { q:"How is a voltmeter connected, and why must it have a very high resistance?",
        a:"In parallel (across) the component. High resistance so almost no current flows through it and it doesn’t change the circuit." },
      { q:"Two identical lamps are in series with a 6 V supply. What is the p.d. across each? What if they are in parallel?",
        a:"Series: the p.d. is shared, 3 V each, so they are dimmer. Parallel: each gets the full 6 V and is as bright as a single lamp; the total current doubles." },
      { q:"Why are household lights wired in parallel?",
        a:"Each lamp gets the full mains voltage, and each can be switched on and off independently. If one fails, the others stay on." },
      { q:"Describe how the resistance of an LDR and a thermistor change.",
        a:"LDR: resistance decreases as light intensity increases. (NTC) thermistor: resistance decreases as temperature increases." }
    ],
    setup(ctx){
      const KEY = "vlab-circuit";
      let comps = new Map();                       // edgeKey → part
      let env = { light:50, temp:20 }, flow = "conv", selected = null, tool = null, uid = 1;
      const loadBoard = () => { try{ const s = JSON.parse(localStorage.getItem(KEY)); if(s){ s.forEach(p => comps.set(p.key, p)); uid = 1 + Math.max(0, ...s.map(p => p.id || 0)); return true; } }catch(e){} return false; };
      const saveBoard = () => { try{ localStorage.setItem(KEY, JSON.stringify([...comps.values()])); }catch(e){} };

      /* ── geometry ── */
      const ends = key => { const [o, c, r] = key.split(":"), C = +c, R = +r; return o === "h" ? [[C, R], [C + 1, R]] : [[C, R], [C, R + 1]]; };
      const nk = ([c, r]) => c + ":" + r;
      const mid = key => { const [a, b] = ends(key), p = nodeXY(...a), q = nodeXY(...b); return [(p[0] + q[0])/2, (p[1] + q[1])/2]; };
      function nearestEdge(x, y){
        let best = null, bd = 30;
        for(let c=0;c<COLS;c++) for(let r=0;r<ROWS;r++){
          if(c < COLS - 1){ const [mx, my] = mid(`h:${c}:${r}`), d = Math.hypot(x - mx, y - my); if(d < bd){ bd = d; best = `h:${c}:${r}`; } }
          if(r < ROWS - 1){ const [mx, my] = mid(`v:${c}:${r}`), d = Math.hypot(x - mx, y - my); if(d < bd){ bd = d; best = `v:${c}:${r}`; } }
        }
        return best;
      }
      function nearestNode(x, y, tol){
        const c = Math.round((x - OX)/SP), r = Math.round((y - OY)/SP);
        if(c < 0 || r < 0 || c >= COLS || r >= ROWS) return null;
        const [nx, ny] = nodeXY(c, r); return Math.hypot(x - nx, y - ny) <= (tol || 18) ? [c, r] : null;
      }
      const edgeBetween = (a, b) => {
        if(a[1] === b[1] && Math.abs(a[0] - b[0]) === 1) return { key:`h:${Math.min(a[0], b[0])}:${a[1]}`, dir: b[0] > a[0] ? 1 : -1 };
        if(a[0] === b[0] && Math.abs(a[1] - b[1]) === 1) return { key:`v:${a[0]}:${Math.min(a[1], b[1])}`, dir: b[1] > a[1] ? 1 : -1 };
        return null;
      };
      function add(type, key, dir, extra){
        const d = PARTS[type], p = Object.assign({ id:uid++, type, key, dir:dir || 1 }, extra);
        if(d.value !== undefined && p.value === undefined) p.value = d.value;
        if(type === "switch" && p.closed === undefined) p.closed = true;
        comps.set(key, p); return p;
      }

      /* ── solver ── */
      const Rldr = () => 150 + 20000*Math.pow(1 - env.light/100, 3);
      const Rth = () => 2200*Math.exp(-0.035*(env.temp - 20));
      function solve(over){
        over = over || {};
        const nodes = new Map(), idx = k => { if(!nodes.has(k)) nodes.set(k, nodes.size); return nodes.get(k); };
        const items = [...comps.values()].map(c => { const [a, b] = ends(c.key), f = c.dir > 0; return { c, i:idx(nk(f ? a : b)), j:idx(nk(f ? b : a)), R:4, on:false, I:0 }; });
        const N = nodes.size, out = { V:[], nodes, items, ok:true };
        if(!N) return out;
        let V = new Array(N).fill(0);
        for(let iter = 0; iter < 40; iter++){
          const A = Array.from({ length:N }, () => new Array(N).fill(0)), rhs = new Array(N).fill(0);
          for(let k=0;k<N;k++) A[k][k] += 1e-9;
          items.forEach(it => {
            const m = model(it, over[it.c.key]); it.G = m.G; it.J = m.J;
            const { i, j, G, J } = it;
            A[i][i] += G; A[j][j] += G; A[i][j] -= G; A[j][i] -= G; rhs[i] -= J; rhs[j] += J;
          });
          V = gauss(A, rhs); if(!V){ out.ok = false; return out; }
          let changed = false;
          items.forEach(it => {
            it.I = it.G*(V[it.i] - V[it.j]) + it.J;
            if(it.c.type === "lamp"){
              const P = it.I*it.I*it.R, Rn = 4 + 8*Math.min(1, Math.pow(P/3, .8));
              if(Math.abs(Rn - it.R) > 1e-3){ it.R = 0.5*it.R + 0.5*Rn; changed = true; }
            }
            if(it.c.type === "led"){
              const vd = V[it.i] - V[it.j];
              if(!it.on && vd > 1.85){ it.on = true; changed = true; }
              else if(it.on && it.I < 0){ it.on = false; changed = true; }
            }
          });
          if(!changed) break;
        }
        items.forEach(it => { it.Vd = V[it.j] - V[it.i]; it.P = Math.abs(it.I*(V[it.i] - V[it.j])); });
        out.V = V; return out;
      }
      function model(it, ov){
        const c = it.c;
        if(ov === "open") return { G:1e-9, J:0 };
        switch(c.type){
          case "wire": case "ammeter": return { G:100, J:0 };
          case "switch": return { G: c.closed !== false ? 100 : 1e-9, J:0 };
          case "voltmeter": return { G:1e-7, J:0 };
          case "resistor": return { G:1/c.value, J:0 };
          case "varres": { const R = ov && ov.value !== undefined ? ov.value : c.value; return { G:1/Math.max(0.05, R), J:0 }; }
          case "lamp": return { G:1/it.R, J:0 };
          case "ldr": return { G:1/Rldr(), J:0 };
          case "therm": return { G:1/Rth(), J:0 };
          case "cell": { const G = 1/0.25; return { G, J:c.value*G }; }
          case "led": return it.on ? { G:1/40, J:-1.8/40 } : { G:1e-9, J:0 };
        }
        return { G:1e-9, J:0 };
      }
      function gauss(A, b){
        const n = b.length;
        for(let i=0;i<n;i++){
          let p = i; for(let r=i+1;r<n;r++) if(Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
          if(Math.abs(A[p][i]) < 1e-15) return null;
          [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
          for(let r=i+1;r<n;r++){ const f = A[r][i]/A[i][i]; if(!f) continue; for(let c=i;c<n;c++) A[r][c] -= f*A[i][c]; b[r] -= f*b[i]; }
        }
        const x = new Array(n);
        for(let i=n-1;i>=0;i--){ let s = b[i]; for(let c=i+1;c<n;c++) s -= A[i][c]*x[c]; x[i] = s/A[i][i]; }
        return x;
      }

      /* ── stage ── */
      ctx.stage.style.display = "block"; ctx.stage.style.padding = "0";
      let holes = "";
      for(let c=0;c<COLS;c++) for(let r=0;r<ROWS;r++){ const [x, y] = nodeXY(c, r); holes += `<circle cx="${x}" cy="${y}" r="3.2" class="hole"/>`; }
      ctx.stage.innerHTML = `
        <div class="cb-tray" id="cb-tray">${TRAY.map(t => `<div class="tray-item" data-t="${t}" title="${PARTS[t].name}">${trayIcon(t)}<span>${PARTS[t].name.replace(" / battery", "")}</span></div>`).join("")}</div>
        <div class="cb-hint" id="cb-hint">Drag a part onto the board · drag from dot to dot to draw wires · click a switch to flip it · drag a part off the board to delete</div>
        <div class="cb-scroll"><svg id="cb-svg" viewBox="0 0 ${W} ${H}" aria-label="Circuit board">
          <defs><radialGradient id="cb-glow"><stop offset="0" stop-color="#FFF4B8"/><stop offset=".45" stop-color="#FFD24A" stop-opacity=".7"/><stop offset="1" stop-color="#FFD24A" stop-opacity="0"/></radialGradient>
            <radialGradient id="cb-red"><stop offset="0" stop-color="#FF8A8A"/><stop offset="1" stop-color="#FF4D4D" stop-opacity="0"/></radialGradient></defs>
          <rect x="18" y="12" width="${W - 36}" height="${H - 24}" rx="18" class="board"/>
          ${holes}
          <g id="cb-ghost"></g><g id="cb-parts"></g><g id="cb-flow"></g><g id="cb-labels"></g>
        </svg></div>`;
      const svg = ctx.stage.querySelector("#cb-svg");
      const $ = s => ctx.stage.querySelector(s);
      const style = document.createElement("style");
      style.textContent = `
        .cb-tray{display:flex;gap:6px;padding:10px 12px;overflow-x:auto;border-bottom:1px solid var(--brd);background:color-mix(in srgb,var(--bg-card) 55%,transparent);scrollbar-width:thin;}
        .cb-tray .tray-item{flex:none;}
        .cb-hint{font-size:.76rem;color:var(--txt3);padding:8px 14px 0;}
        #cb-svg{width:100%;height:auto;display:block;touch-action:none;}
        .cb-scroll{overflow-x:auto;} @media (max-width:760px){ #cb-svg{min-width:720px;} }
        #cb-svg .board{fill:color-mix(in srgb,var(--bg-card) 75%,transparent);stroke:var(--brd2);stroke-width:1.5;}
        #cb-svg .hole{fill:var(--txt3);opacity:.55;}
        #cb-svg .lead{stroke:var(--txt);stroke-width:2.4;fill:none;}
        #cb-svg .copper{stroke:#D9A066;stroke-width:5;stroke-linecap:round;fill:none;}
        [data-mode="light"] #cb-svg .copper{stroke:#B87333;}
        #cb-svg .sym-letter{font:700 15px 'Space Grotesk',sans-serif;fill:var(--txt);}
        #cb-svg .sym-sign{font:700 12px 'Inter',sans-serif;fill:var(--hi);}
        #cb-svg .part{cursor:grab;}
        #cb-svg .part .hitbox{fill:transparent;}
        #cb-svg .part:hover .hitbox{fill:var(--accent-lt);}
        #cb-svg .part.sel .hitbox{fill:var(--accent-lt);stroke:var(--accent);stroke-width:1.5;stroke-dasharray:5 4;}
        #cb-svg .reading{font:600 13px 'JetBrains Mono',monospace;fill:var(--accent);paint-order:stroke;stroke:var(--bg2);stroke-width:4px;}
        #cb-svg .vlabel{font:600 11px 'Inter',sans-serif;fill:var(--txt2);paint-order:stroke;stroke:var(--bg2);stroke-width:4px;}
        #cb-svg .warn{fill:var(--hi);}
      `;
      ctx.stage.appendChild(style);

      let result = solve();
      const live = new Map();
      function labelFor(p){
        const same = [...comps.values()].filter(q => q.type === p.type).sort((a, b) => a.id - b.id);
        return (p.type === "ammeter" ? "A" : "V") + (same.indexOf(p) + 1);
      }
      function render(){
        result = solve(); live.clear();
        result.items.forEach(it => live.set(it.c.key, it));
        let parts = "", labels = "";
        comps.forEach(p => {
          const [mx, my] = mid(p.key), vert = p.key[0] === "v", rot = (vert ? 90 : 0) + (p.dir < 0 ? 180 : 0), it = live.get(p.key);
          parts += `<g class="part${selected === p.key ? " sel" : ""}" data-key="${p.key}" transform="translate(${mx} ${my}) rotate(${rot})">
            <rect class="hitbox" x="-34" y="-20" width="68" height="40" rx="10"/>${symbol(p.type, p, it)}</g>`;
          const lx = vert ? mx + 28 : mx, ly = vert ? my + 4 : my - 26, anchor = vert ? "start" : "middle";
          let txt = "", cls = "vlabel";
          if(p.type === "cell") txt = p.value + " V";
          else if(p.type === "resistor" || p.type === "varres") txt = p.value + " Ω";
          else if(p.type === "ldr") txt = Math.round(Rldr()) + " Ω";
          else if(p.type === "therm") txt = Math.round(Rth()) + " Ω";
          else if(p.type === "ammeter"){ txt = labelFor(p) + "  " + (it ? it.I : 0).toFixed(3) + " A"; cls = "reading"; }
          else if(p.type === "voltmeter"){ txt = labelFor(p) + "  " + (it ? it.Vd : 0).toFixed(2) + " V"; cls = "reading"; }
          if(p.type === "cell" && it && Math.abs(it.I) > 4){ txt = "⚠ short circuit!"; cls = "reading warn"; }
          if(txt) labels += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" class="${cls}">${txt}</text>`;
        });
        $("#cb-parts").innerHTML = parts; $("#cb-labels").innerHTML = labels;
        buildFlow(); hud(); inspector(); checkChallenges(); saveBoard();
      }

      /* moving charges: one group per conducting part, phase advanced each frame */
      let flowDots = [];
      function buildFlow(){
        flowDots = [];
        let h = "";
        result.items.forEach(it => {
          if(Math.abs(it.I) < 2e-4 || it.c.type === "voltmeter") return;
          const [a, b] = ends(it.c.key), f = it.c.dir > 0, A = nodeXY(...(f ? a : b)), B = nodeXY(...(f ? b : a));
          for(let k=0;k<2;k++){ h += `<circle r="3.6" class="dot"/>`; flowDots.push({ A, B, I:it.I, off:k/2 }); }
        });
        $("#cb-flow").innerHTML = h;
        [...$("#cb-flow").children].forEach((e, i) => flowDots[i].el = e);
      }
      let phase = 0;
      ctx.frame(dt => {
        phase += dt;
        const col = flow === "elec" ? "#FBBF24" : "#7DD3FC";
        flowDots.forEach(d => {
          if(flow === "off"){ d.el.setAttribute("opacity", 0); return; }
          const speed = Math.min(1.6, 0.18 + Math.abs(d.I)*1.2) * (flow === "elec" ? -1 : 1) * Math.sign(d.I);
          let t = (d.off + phase*speed) % 1; if(t < 0) t += 1;
          d.el.setAttribute("cx", d.A[0] + (d.B[0] - d.A[0])*t); d.el.setAttribute("cy", d.A[1] + (d.B[1] - d.A[1])*t);
          d.el.setAttribute("fill", col); d.el.setAttribute("opacity", 1);
        });
      });

      function totalEmf(){ return [...comps.values()].filter(p => p.type === "cell").reduce((s, p) => s + p.value, 0); }
      function hud(){
        const cells = result.items.filter(it => it.c.type === "cell");
        const short = cells.some(it => Math.abs(it.I) > 4);
        const lit = result.items.filter(it => it.c.type === "lamp" && Math.abs(it.I) > 0.05).length;
        const items = [["Parts", String(comps.size)], ["Supply", totalEmf().toFixed(1) + " V"], ["Lamps lit", String(lit)]];
        if(cells.length) items.push(["Supply current", Math.abs(cells.reduce((s, it) => s + Math.abs(it.I), 0)/cells.length).toFixed(3) + " A"]);
        if(short) items.push(["Warning", "short circuit — the cell is overheating", "warn"]);
        if(comps.size && !cells.length) items.push(["Tip", "add a cell to power the circuit"]);
        ctx.readout(items);
      }

      /* ── selection inspector (left panel) ── */
      const insp = ctx.html(`<div id="cb-insp"></div>`);
      function inspector(){
        const p = selected && comps.get(selected);
        if(!p){ insp.innerHTML = `<p class="hint" style="margin:0">Click a part on the board to change it. Keys: <span class="kbd">Del</span> remove · <span class="kbd">F</span> flip.</p>`; return; }
        const d = PARTS[p.type], it = live.get(p.key);
        let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="width:56px">${trayIcon(p.type)}</span><b>${d.name}</b></div>`;
        if(d.values) h += `<div class="ctl"><div class="lbl"><span>Value</span></div><div class="seg">${d.values.map(v => `<button type="button" data-v="${v}" class="${v === p.value ? "on" : ""}">${v} ${d.unit}</button>`).join("")}</div></div>`;
        if(p.type === "varres") h += `<div class="ctl"><label><span>Resistance</span><output>${p.value} Ω</output></label><input type="range" min="0" max="50" step="1" value="${p.value}" id="cb-vr"></div>`;
        if(it && p.type !== "wire") h += `<p class="hint" style="margin:0 0 10px">Current ${Math.abs(it.I).toFixed(3)} A · p.d. ${Math.abs(it.Vd).toFixed(2)} V${p.type === "lamp" || p.type === "resistor" || p.type === "varres" ? " · power " + it.P.toFixed(2) + " W" : ""}</p>`;
        h += `<div class="btns">${p.type === "switch" ? `<button class="btn small" data-a="toggle">${p.closed !== false ? "Open switch" : "Close switch"}</button>` : ""}
          ${d.polar ? `<button class="btn small" data-a="flip">Flip direction</button>` : ""}<button class="btn small ghost" data-a="del">Remove</button></div>`;
        insp.innerHTML = h;
        insp.querySelectorAll("[data-v]").forEach(b => b.onclick = () => { p.value = +b.dataset.v; render(); });
        const vr = insp.querySelector("#cb-vr");
        if(vr) vr.oninput = () => { p.value = +vr.value; vr.previousElementSibling.querySelector("output").textContent = p.value + " Ω"; renderKeepFocus(); };
        insp.querySelectorAll("[data-a]").forEach(b => b.onclick = () => act(b.dataset.a));
      }
      function renderKeepFocus(){   // re-render the board without rebuilding the slider being dragged
        const save = inspector; inspector = () => {}; render(); inspector = save;
      }
      function act(a){
        const p = selected && comps.get(selected); if(!p) return;
        if(a === "toggle") p.closed = p.closed === false;
        if(a === "flip") p.dir = -p.dir;
        if(a === "del"){ comps.delete(p.key); selected = null; }
        render();
      }

      /* ── environment + board tools ── */
      ctx.html(`<h4 style="margin:18px 0 12px">Surroundings</h4>`);
      ctx.slider({ label:"Light level (for LDRs)", min:0, max:100, step:5, value:env.light, unit:"%", onInput(v){ env.light = v; render(); } });
      ctx.slider({ label:"Temperature (for thermistors)", min:0, max:100, step:5, value:env.temp, unit:"°C", onInput(v){ env.temp = v; render(); } });
      ctx.seg({ label:"Show moving charge", value:flow, options:[["conv","Conventional current"],["elec","Electrons"],["off","Off"]], onChange(v){ flow = v; } });

      const tools = ctx.stageTools;
      tools.innerHTML = `<select class="inp" id="cb-ex" style="width:auto;padding:5px 8px;font-size:.78rem"><option value="">Load example…</option>
          <option value="simple">Cell + lamp</option><option value="series">Series lamps</option><option value="parallel">Parallel lamps</option>
          <option value="ohm">Ohm’s law (resistor + meters)</option><option value="ldr">LDR potential divider</option></select>
        <button class="btn small ghost" type="button" id="cb-clear">Clear board</button>
        <button class="btn small primary" type="button" id="cb-rec">Record readings</button>`;
      tools.querySelector("#cb-clear").onclick = () => { if(comps.size && !confirm("Remove every part from the board?")) return; comps.clear(); selected = null; render(); };
      tools.querySelector("#cb-ex").onchange = e => { if(e.target.value) example(e.target.value); e.target.value = ""; };
      tools.querySelector("#cb-rec").onclick = () => {
        const am = [...comps.values()].filter(p => p.type === "ammeter").sort((a, b) => a.id - b.id);
        const vm = [...comps.values()].filter(p => p.type === "voltmeter").sort((a, b) => a.id - b.id);
        if(!am.length && !vm.length){ ctx.toast("Add an ammeter or voltmeter to take readings"); return; }
        const rd = (p, k) => p && live.get(p.key) ? Number(live.get(p.key)[k].toFixed(k === "I" ? 3 : 2)) : null;
        const vr = [...comps.values()].find(p => p.type === "varres");
        ctx.record({ A1:rd(am[0], "I"), A2:rd(am[1], "I"), V1:rd(vm[0], "Vd"), V2:rd(vm[1], "Vd"), emf:totalEmf(), var: vr ? vr.value : null, light:env.light, temp:env.temp });
        checkChallenges();
      };

      /* walk from a node placing parts: [dir, type, value?] with dir in R L U D */
      function path(start, steps){
        let cur = start;
        steps.forEach(([d, t, v]) => {
          const nx = d === "R" ? [cur[0] + 1, cur[1]] : d === "L" ? [cur[0] - 1, cur[1]] : d === "D" ? [cur[0], cur[1] + 1] : [cur[0], cur[1] - 1];
          const e = edgeBetween(cur, nx); add(t, e.key, e.dir, v !== undefined ? { value:v } : undefined); cur = nx;
        });
      }
      function example(name){
        comps.clear(); selected = null;
        if(name === "simple") path([3, 2], [["R","cell",3],["R","wire"],["R","wire"],["D","wire"],["D","wire"],["L","wire"],["L","lamp"],["L","wire"],["U","wire"],["U","wire"]]);
        if(name === "series") path([2, 1], [["R","cell",6],["R","wire"],["R","wire"],["R","wire"],["D","wire"],["D","wire"],["D","wire"],["L","lamp"],["L","wire"],["L","lamp"],["L","wire"],["U","wire"],["U","wire"],["U","wire"]]);
        if(name === "parallel"){
          path([2, 1], [["R","cell",3],["R","wire"],["R","wire"],["R","wire"],["D","wire"],["D","lamp"],["D","wire"],["L","wire"],["L","wire"],["L","wire"],["L","wire"],["U","wire"],["U","wire"],["U","wire"]]);
          path([4, 1], [["D","wire"],["D","lamp"],["D","wire"]]);
        }
        if(name === "ohm"){
          path([2, 1], [["R","cell",3],["R","wire"],["R","ammeter"],["R","wire"],["D","wire"],["D","wire"],["D","wire"],["L","wire"],["L","resistor",10],["L","varres",10],["L","wire"],["U","wire"],["U","wire"],["U","wire"]]);
          path([4, 4], [["D","wire"],["R","voltmeter"],["U","wire"]]);
        }
        if(name === "ldr"){
          path([3, 1], [["R","cell",6],["R","wire"],["R","wire"],["D","wire"],["D","resistor",100],["D","ldr"],["D","wire"],["L","wire"],["L","wire"],["L","wire"],["U","wire"],["U","wire"],["U","wire"],["U","wire"]]);
          path([6, 3], [["R","wire"],["D","voltmeter"],["D","wire"],["L","wire"]]);
        }
        render();
      }

      /* ── challenges ── */
      const lampsLit = r => r.items.filter(it => it.c.type === "lamp" && Math.abs(it.I) > 0.05);
      function checkChallenges(){
        const r = result, lit = lampsLit(r);
        if(lit.length) ctx.complete("light");
        if(lit.length >= 2){
          for(const a of lit) for(const b of lit){
            if(a === b) continue;
            const off = solve({ [a.c.key]:"open" }), bb = off.items.find(it => it.c.key === b.c.key);
            if(Math.abs(bb.I) < 0.01) ctx.complete("series");
            if(Math.abs(bb.I) > 0.05 && Math.abs(bb.I) > 0.8*Math.abs(b.I)) ctx.complete("parallel");
          }
        }
        r.items.filter(it => it.c.type === "ammeter" && Math.abs(it.I) > 0.04).forEach(am => {
          if(lit.some(l => Math.abs(Math.abs(l.I) - Math.abs(am.I)) < 0.002)) ctx.complete("ammeter");
        });
        r.items.filter(it => it.c.type === "voltmeter" && Math.abs(it.Vd) > 0.1).forEach(vm => {
          if(lit.some(l => Math.abs(Math.abs(l.Vd) - Math.abs(vm.Vd)) < 0.02)) ctx.complete("voltmeter");
        });
        r.items.filter(it => it.c.type === "switch").forEach(sw => {
          const p = sw.c, was = p.closed !== false;
          p.closed = !was; const alt = solve(); p.closed = was;
          const litNow = new Set(lit.map(l => l.c.key)), litAlt = new Set(lampsLit(alt).map(l => l.c.key));
          if([...litNow].some(k => !litAlt.has(k)) || [...litAlt].some(k => !litNow.has(k))) ctx.complete("switch");
        });
        r.items.filter(it => it.c.type === "varres").forEach(vr => {
          const lo = solve({ [vr.c.key]:{ value:0 } }), hi = solve({ [vr.c.key]:{ value:50 } });
          lampsLit(lo).forEach(l => { const h = hi.items.find(it => it.c.key === l.c.key); if(Math.abs(h.I) < 0.8*Math.abs(l.I)) ctx.complete("dimmer"); });
        });
        if(r.items.some(it => it.c.type === "led" && it.I > 0.002)) ctx.complete("led");
        if(r.items.some(it => it.c.type === "ldr")){
          const e0 = env.light, a = (env.light = 0, solve()), b = (env.light = 100, solve()); env.light = e0;
          const vs = it => it.items.filter(x => x.c.type === "voltmeter").map(x => x.Vd);
          const va = vs(a), vb = vs(b);
          if(va.some((v, i) => Math.abs(v - vb[i]) > 1)) ctx.complete("ldr");
        }
        const rows = ctx.rows().filter(x => typeof x.V1 === "number");
        if(new Set(rows.map(x => x.V1.toFixed(2))).size >= 5) ctx.complete("ohm");
      }

      /* ── pointer interaction ── */
      const ghost = $("#cb-ghost");
      function showGhost(key, type){
        if(!key){ ghost.innerHTML = ""; return; }
        const [mx, my] = mid(key), free = !comps.has(key);
        ghost.innerHTML = `<g transform="translate(${mx} ${my}) rotate(${key[0] === "v" ? 90 : 0})" opacity="${free ? .55 : .25}">
          <rect x="-34" y="-20" width="68" height="40" rx="10" fill="${free ? "var(--accent-lt)" : "var(--hi-lt)"}" stroke="${free ? "var(--accent)" : "var(--hi)"}" stroke-dasharray="5 4"/>${type ? symbol(type, PARTS[type]) : ""}</g>`;
      }
      const inBoard = p => p.x > 10 && p.y > 4 && p.x < W - 10 && p.y < H - 4;

      // tray: drag a part onto the board, or click to pick a tool then click the board
      ctx.stage.querySelectorAll(".tray-item").forEach(item => {
        item.addEventListener("pointerdown", e => {
          e.preventDefault();
          const type = item.dataset.t, sx = e.clientX, sy = e.clientY; let moved = false;
          const fly = document.createElement("div");
          fly.innerHTML = trayIcon(type);
          Object.assign(fly.style, { position:"fixed", width:"64px", pointerEvents:"none", zIndex:300, opacity:0, color:"var(--txt)", transform:"translate(-50%,-50%)" });
          document.body.appendChild(fly);
          const mv = ev => {
            if(Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) moved = true;
            fly.style.left = ev.clientX + "px"; fly.style.top = ev.clientY + "px"; fly.style.opacity = moved ? .9 : 0;
            const p = ctx.svgPoint(svg, ev); showGhost(inBoard(p) ? nearestEdge(p.x, p.y) : null, type);
          };
          const up = ev => {
            window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); fly.remove(); showGhost(null);
            if(!moved){ setTool(tool === type ? null : type); return; }
            const p = ctx.svgPoint(svg, ev), key = inBoard(p) && nearestEdge(p.x, p.y);
            if(key && !comps.has(key)){ add(type, key, 1); selected = key; render(); }
          };
          window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
        });
      });
      function setTool(t){
        tool = t;
        ctx.stage.querySelectorAll(".tray-item").forEach(i => i.classList.toggle("on", i.dataset.t === t));
        $("#cb-hint").textContent = t ? `Placing: ${PARTS[t].name} — click a gap between two dots (Esc to stop)` : "Drag a part onto the board · drag from dot to dot to draw wires · click a switch to flip it · drag a part off the board to delete";
      }

      svg.addEventListener("pointermove", e => {
        if(drag) return;
        const p = ctx.svgPoint(svg, e);
        if(tool) showGhost(nearestEdge(p.x, p.y), tool);
      });
      svg.addEventListener("pointerleave", () => { if(!drag) showGhost(null); });

      let drag = null;
      svg.addEventListener("pointerdown", e => {
        if(e.button) return;
        const p = ctx.svgPoint(svg, e), partEl = e.target.closest(".part");
        svg.setPointerCapture(e.pointerId);
        if(partEl){
          const key = partEl.dataset.key; selected = key;
          drag = { mode:"part", key, start:p, moved:false };
        }else{
          const n = nearestNode(p.x, p.y, 20);
          if(tool && !n){ const key = nearestEdge(p.x, p.y); if(key && !comps.has(key)){ add(tool, key, 1); selected = key; render(); } return; }
          if(n){ drag = { mode:"wire", at:n, added:0 }; }
          else{ selected = null; render(); }
        }
      });
      svg.addEventListener("pointermove", e => {
        if(!drag) return;
        const p = ctx.svgPoint(svg, e);
        if(drag.mode === "part"){
          if(!drag.moved && Math.hypot(p.x - drag.start.x, p.y - drag.start.y) > 8) drag.moved = true;
          if(drag.moved){
            const g = svg.querySelector(`.part[data-key="${drag.key}"]`), part = comps.get(drag.key);
            if(g) g.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${drag.key[0] === "v" ? 90 : 0})`);
            const k = inBoard(p) ? nearestEdge(p.x, p.y) : null;
            showGhost(k && k !== drag.key ? k : null, part.type);
          }
        }else if(drag.mode === "wire"){
          const n = nearestNode(p.x, p.y, 22);
          if(n && (n[0] !== drag.at[0] || n[1] !== drag.at[1])){
            const e2 = edgeBetween(drag.at, n);
            if(e2){ if(!comps.has(e2.key)){ add("wire", e2.key, e2.dir); drag.added++; render(); } drag.at = n; }
          }
        }
      });
      svg.addEventListener("pointerup", e => {
        if(!drag) return;
        const d = drag; drag = null; showGhost(null);
        if(d.mode === "part"){
          const part = comps.get(d.key);
          if(!d.moved){ if(part.type === "switch") part.closed = part.closed === false; render(); return; }
          const p = ctx.svgPoint(svg, e);
          if(!inBoard(p)){ comps.delete(d.key); selected = null; ctx.toast(PARTS[part.type].name + " removed"); render(); return; }
          const k = nearestEdge(p.x, p.y);
          if(k && !comps.has(k)){ comps.delete(d.key); part.key = k; comps.set(k, part); selected = k; }
          render();
        }
      });

      const onKey = e => {
        if(/input|select|textarea/i.test(document.activeElement.tagName)) return;
        if(e.key === "Escape"){ setTool(null); selected = null; render(); }
        if((e.key === "Delete" || e.key === "Backspace") && selected){ e.preventDefault(); act("del"); }
        if((e.key === "f" || e.key === "F") && selected) act("flip");
      };
      window.addEventListener("keydown", onKey);
      ctx.cleanup(() => window.removeEventListener("keydown", onKey));

      if(!loadBoard()) example("simple");
      render();
    }
  });
})();
