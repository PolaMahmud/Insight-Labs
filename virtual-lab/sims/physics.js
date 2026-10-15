"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS (0625) — I–V characteristics · Hooke's law · Refraction
══════════════════════════════════════════════════════════════════ */

/* ───────────── I–V CHARACTERISTICS ───────────── */
Lab.register({
  id:"iv-characteristics", subject:"physics", topic:"Electricity", icon:"⚡",
  title:"I–V characteristics",
  summary:"Compare a fixed resistor, a filament lamp and a diode. Which one obeys Ohm’s law?",
  aim:"Investigate how the current in a fixed resistor, a filament lamp and a diode depends on the potential difference across it.",
  variables:{
    iv:"Potential difference across the component (V), set with the variable resistor",
    dv:"Current through the component (A), read from the ammeter",
    cv:["Same component","Room temperature","Same ammeter and voltmeter"]
  },
  columns:[{key:"comp",label:"Component"},{key:"V",label:"p.d. / V",dp:2},{key:"I",label:"Current / A"},{key:"R",label:"Resistance / Ω"}],
  series:"comp",
  graph:{ x:["V"], y:["I","R"], fit:"none" },
  questions:[
    { q:"Use your graph for the fixed resistor to find its resistance.",
      a:"Draw a straight line of best fit through the origin. The gradient is I/V = 1/R, so R = 1 ÷ gradient. (The resistor is randomised each visit, so your value is unique.)" },
    { q:"Describe and explain the shape of the I–V graph for the filament lamp.",
      a:"The graph curves and becomes less steep as p.d. increases. A larger current heats the filament, its resistance increases, so each extra volt produces a smaller increase in current." },
    { q:"What happens to the current in the diode when the p.d. is reversed? What is a diode used for?",
      a:"Almost no current flows in reverse bias — the diode has a very high resistance in one direction. Forward current only rises steeply above about 0.6 V. Diodes are used for rectification (converting a.c. to d.c.)." },
    { q:"Why should the circuit be switched off between readings?",
      a:"To stop the components heating up. Heating changes resistance, which would make the results inaccurate (and could damage the component)." }
  ],
  setup(ctx){
    const R_FIXED = [10, 12, 15, 18, 20, 22][Math.floor(Math.random()*6)];
    const COMPS = {
      resistor:{ name:"Fixed resistor", min:-12, max:12, step:0.5, imax:12/R_FIXED, I:V => V/R_FIXED },
      lamp:    { name:"Filament lamp",  min:-12, max:12, step:0.5, imax:0.25, I:V => Math.sign(V)*0.25*Math.pow(Math.abs(V)/12, 0.6) },
      diode:   { name:"Diode",          min:-1,  max:0.8, step:0.02, imax:0.2, I:V => V > 0 ? 2e-9*(Math.exp(V/0.0434) - 1) : 0 }
    };
    let comp = "resistor", V = 3;

    ctx.stage.innerHTML = `
    <svg viewBox="0 0 520 330" aria-label="Circuit with cell, variable resistor, ammeter, component and voltmeter">
      <path class="ink" d="M60 60 H134 M146 60 H250 M330 60 H460 V120 M460 160 V220 H295 M225 220 H60 V60"/>
      <path class="ink" d="M215 220 V290 H240 M280 290 H305 V220"/>
      <circle cx="215" cy="220" r="4" fill="var(--txt)"/><circle cx="305" cy="220" r="4" fill="var(--txt)"/>
      <line x1="134" y1="50" x2="134" y2="70" stroke="var(--txt)" stroke-width="5"/>
      <line x1="146" y1="40" x2="146" y2="80" stroke="var(--txt)" stroke-width="2"/>
      <text class="lbl" x="140" y="98" text-anchor="middle">cell</text>
      <text class="lbl" x="152" y="36">+</text>
      <rect x="250" y="51" width="80" height="18" class="ink" fill="var(--bg-card)"/>
      <path class="ink" d="M255 82 L325 38 M325 38 l-10 1 M325 38 l-3 9"/>
      <text class="lbl" x="290" y="98" text-anchor="middle">variable resistor</text>
      <circle cx="460" cy="140" r="20" class="ink" fill="var(--bg-card)"/><text class="lblb" x="460" y="145" text-anchor="middle">A</text>
      <circle cx="260" cy="290" r="20" class="ink" fill="var(--bg-card)"/><text class="lblb" x="260" y="295" text-anchor="middle">V</text>
      <text class="lblb" id="iv-amm" x="430" y="145" text-anchor="end"></text>
      <text class="lblb" id="iv-volt" x="320" y="295"></text>
      <g id="iv-comp"></g>
      <g id="iv-charges"></g>
      <text class="lbl" id="iv-name" x="260" y="172" text-anchor="middle"></text>
    </svg>`;
    const $ = s => ctx.stage.querySelector(s);
    const compG = $("#iv-comp"), chargesG = $("#iv-charges");
    const NQ = 22;
    chargesG.innerHTML = Array.from({length:NQ}, () => `<circle r="3.2" fill="var(--accent)"/>`).join("");
    const dots = [...chargesG.children];

    function drawComp(){
      if(comp === "resistor") compG.innerHTML = `<path class="ink" d="M225 220 H230 M290 220 H295"/><rect x="230" y="210" width="60" height="20" class="ink" fill="var(--bg-card)"/>`;
      if(comp === "lamp") compG.innerHTML = `<path class="ink" d="M225 220 H242 M278 220 H295"/>
        <circle id="iv-glow" cx="260" cy="220" r="34" fill="#FFC83D" opacity="0"/>
        <circle cx="260" cy="220" r="18" class="ink" fill="var(--bg-card)" fill-opacity=".6"/>
        <path class="ink" d="M247 207 L273 233 M273 207 L247 233"/>`;
      if(comp === "diode") compG.innerHTML = `<path class="ink" d="M225 220 H295"/>
        <path d="M278 206 V234 L246 220 Z" fill="var(--bg-card)" stroke="var(--txt)" stroke-width="2"/>
        <line x1="244" y1="206" x2="244" y2="234" stroke="var(--txt)" stroke-width="2.5"/>`;
      $("#iv-name").textContent = COMPS[comp].name + (comp === "resistor" ? " (R unknown)" : "");
    }

    let jitter = 0;                                   // meter error, fixed for each setting
    function reading(){
      const I = COMPS[comp].I(V);
      const Im = Math.abs(I) < 1e-7 ? 0 : Number((I*(1 + 0.004*jitter)).toPrecision(3));
      return { V, I:Im };
    }
    const showI = I => Math.abs(I) >= 1 ? I.toFixed(2) + " A" : (I*1000).toFixed(Math.abs(I) < 0.01 ? 2 : 1) + " mA";

    let lastI = 0;
    function update(){
      jitter = ctx.gauss();
      const r = reading(); lastI = r.I;
      $("#iv-amm").textContent = showI(r.I);
      $("#iv-volt").textContent = V.toFixed(2) + " V";
      const R = Math.abs(r.I) > 1e-6 ? V/r.I : Infinity;
      ctx.readout([["Voltmeter", V.toFixed(2) + " V"], ["Ammeter", showI(r.I)], ["R = V ÷ I", isFinite(R) ? ctx.sig(R) + " Ω" : "very large"],
        ...(V < 0 ? [["Supply", "reversed", "warn"]] : [])]);
      const glow = $("#iv-glow");
      if(glow) glow.setAttribute("opacity", Math.min(.85, Math.pow(Math.abs(V*r.I)/3, .7)).toFixed(2));
    }

    // charges flow round the loop; speed ∝ current
    const P = [[60,60],[460,60],[460,220],[60,220]], LEN = 1120;
    function at(s){
      s = ((s % LEN) + LEN) % LEN;
      for(let k=0;k<4;k++){
        const a = P[k], b = P[(k+1)%4], seg = Math.abs(b[0]-a[0]) + Math.abs(b[1]-a[1]);
        if(s <= seg){ const f = s/seg; return [a[0] + (b[0]-a[0])*f, a[1] + (b[1]-a[1])*f]; }
        s -= seg;
      }
      return P[0];
    }
    let phase = 0;
    ctx.frame(dt => {
      phase += dt * 170 * Math.max(-1.2, Math.min(1.2, lastI / COMPS[comp].imax));
      dots.forEach((d,i) => { const [x,y] = at(phase + i*LEN/NQ); d.setAttribute("cx", x); d.setAttribute("cy", y); });
    });

    ctx.seg({ label:"Component", value:comp,
      options:[["resistor","Resistor"],["lamp","Lamp"],["diode","Diode"]],
      onChange(v){ comp = v; const c = COMPS[v]; slider.input.min = c.min; slider.input.max = c.max; slider.input.step = c.step;
        V = v === "diode" ? 0.5 : 3; slider.set(V); drawComp(); update(); } });
    const slider = ctx.slider({ label:"p.d. across component", min:-12, max:12, step:0.5, value:V, unit:"V",
      fmt:v => v.toFixed(2), hint:"Negative values reverse the supply.",
      onInput(v){ V = v; update(); } });
    ctx.buttons([{ label:"Record reading", primary:true, block:true, onClick(){
      const r = reading();
      ctx.record({ comp:COMPS[comp].name, V:r.V, I:r.I, R: Math.abs(r.I) > 1e-6 ? Number((r.V/r.I).toPrecision(3)) : null });
    }}]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Take at least 6 readings for each component, including negative p.d.s. Switch the <b>y-axis</b> on the graph to see resistance change.</p>`);
    drawComp(); update();
  }
});

/* ───────────── HOOKE'S LAW ───────────── */
Lab.register({
  id:"hookes-law", subject:"physics", topic:"Forces · Springs", icon:"🪝",
  title:"Hooke’s law",
  summary:"Load a spring 100 g at a time, plot extension against load and find the limit of proportionality.",
  aim:"Investigate how the extension of a spring depends on the load applied to it.",
  variables:{
    iv:"Load on the spring (N) — mass × 9.8 N/kg",
    dv:"Extension of the spring (cm)",
    cv:["Same spring","Ruler read at eye level","Original length measured first"]
  },
  columns:[{key:"spring",label:"Spring"},{key:"m",label:"Mass / g",dp:0},{key:"F",label:"Load / N",dp:2},{key:"L",label:"Length / cm",dp:1},{key:"x",label:"Extension / cm",dp:1}],
  series:"spring",
  graph:{ x:["F"], y:["x","L"], fit:"linear" },
  questions:[
    { q:"How do you calculate extension from your ruler readings?",
      a:"Extension = stretched length − original (unloaded) length. Measure the original length before adding any load." },
    { q:"Use the straight part of your graph to find the spring constant of spring A.",
      a:"k = F ÷ x. Gradient of your graph is x/F (cm per N), so k = 1 ÷ gradient. Convert to N/m by multiplying by 100. Spring A should give roughly 40 N/m; spring B roughly 80 N/m." },
    { q:"What is the limit of proportionality? Where is it on your graph?",
      a:"The point beyond which extension is no longer proportional to load — the graph stops being a straight line through the origin and curves upward." },
    { q:"Spring A was loaded beyond its limit and then unloaded. What did you notice and why?",
      a:"It did not return to its original length — it has been permanently deformed because it was stretched beyond its elastic limit." }
  ],
  setup(ctx){
    const SPRINGS = { A:{ k:40, lp:6.0 }, B:{ k:80, lp:15 } };
    const L0 = 5.0, PX = 7, Y0 = 40, G = 9.8;
    let spring = "A", mass = 0, maxF = 0;

    const set = () => Math.max(0, maxF - 1.1*SPRINGS[spring].lp) * 0.8;   // permanent set in cm
    function length(){
      const s = SPRINGS[spring], F = mass/1000*G;
      let x = F <= s.lp ? F/s.k : s.lp/s.k + (F - s.lp)/s.k*(1 + 1.5*(F - s.lp)/s.lp);
      return L0 + x*100 + set();
    }

    let ticks = "";
    for(let c=0;c<=50;c++){
      const y = Y0 + c*PX, w = c % 5 === 0 ? 14 : 7;
      ticks += `<line x1="300" y1="${y}" x2="${300 - w}" y2="${y}" stroke="var(--txt2)" stroke-width="1"/>`;
      if(c % 5 === 0) ticks += `<text class="lbl" x="306" y="${y + 4}">${c}</text>`;
    }
    ctx.stage.innerHTML = `
    <svg viewBox="0 0 420 480" aria-label="Spring hanging from a clamp stand beside a vertical ruler">
      <rect x="40" y="455" width="200" height="12" rx="3" fill="var(--txt3)"/>
      <rect x="55" y="20" width="8" height="436" fill="var(--txt3)"/>
      <rect x="55" y="${Y0 - 14}" width="200" height="8" fill="var(--txt3)"/>
      <rect x="270" y="${Y0 - 6}" width="34" height="${50*PX + 12}" fill="var(--bg-card)" stroke="var(--brd)"/>
      ${ticks}
      <text class="lbl" x="287" y="${Y0 + 50*PX + 24}" text-anchor="middle">cm</text>
      <path id="hk-spring" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round"/>
      <line id="hk-pointer" x1="220" x2="296" stroke="var(--hi)" stroke-width="2"/>
      <g id="hk-masses"></g>
    </svg>`;
    const $ = s => ctx.stage.querySelector(s);

    function draw(){
      const L = length(), yb = Y0 + L*PX, top = Y0 - 6;
      let d = `M220 ${top} V${Y0 + 4}`;
      const n = 12, h = (yb - 6 - (Y0 + 4))/n;
      for(let i=0;i<n;i++) d += ` L${i % 2 ? 208 : 232} ${Y0 + 4 + h*(i + .5)}`;
      d += ` L220 ${yb - 6} V${yb}`;
      $("#hk-spring").setAttribute("d", d);
      $("#hk-pointer").setAttribute("y1", yb); $("#hk-pointer").setAttribute("y2", yb);
      let m = `<path class="ink" d="M220 ${yb} V${yb + 14}"/>`;
      const discs = mass/100;
      for(let i=0;i<discs;i++) m += `<rect x="203" y="${yb + 14 + i*7}" width="34" height="6" rx="1.5" fill="var(--tri)" stroke="var(--txt2)" stroke-width=".6"/>`;
      if(discs) m += `<text class="lbl" x="245" y="${yb + 22 + discs*3.5}">${mass} g</text>`;
      $("#hk-masses").innerHTML = m;
      const F = mass/1000*G;
      ctx.readout([["Load", F.toFixed(2) + " N"], ["Ruler reading", (Math.round(L*10)/10).toFixed(1) + " cm"],
        ["Original length", L0.toFixed(1) + " cm"],
        ...(set() > 0.05 ? [["Spring", "permanently stretched", "warn"]] : [])]);
    }
    function setMass(m){ mass = Math.max(0, Math.min(1000, m)); maxF = Math.max(maxF, mass/1000*G); draw(); }

    ctx.seg({ label:"Spring", value:"A", options:[["A","Spring A (soft)"],["B","Spring B (stiff)"]],
      onChange(v){ spring = v; maxF = 0; setMass(0); } });
    ctx.html(`<div class="ctl"><div class="lbl"><span>Slotted masses (100 g each)</span></div></div>`);
    ctx.buttons([{ label:"+ 100 g", onClick:() => setMass(mass + 100) }, { label:"− 100 g", onClick:() => setMass(mass - 100) }, { label:"Remove all", onClick:() => setMass(0) }]);
    ctx.buttons([{ label:"Record reading", primary:true, block:true, onClick(){
      const L = Math.round(length()*10)/10;
      ctx.record({ spring:"Spring " + spring, m:mass, F:Number((mass/1000*G).toFixed(2)), L, x:Number((L - L0).toFixed(1)) });
    }}]);
    ctx.buttons([{ label:"Replace with a new spring", onClick(){ maxF = 0; setMass(0); ctx.toast("Fresh spring fitted"); } }]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Go all the way to 1000 g on spring A, then unload it. Does it return to 5.0 cm?</p>`);
    draw();
  }
});

/* ───────────── REFRACTION & TIR ───────────── */
Lab.register({
  id:"refraction", subject:"physics", topic:"Light", icon:"🔦",
  title:"Refraction & total internal reflection",
  summary:"Trace a ray into a glass block, measure angles and find refractive index and critical angle.",
  aim:"Investigate how the angle of refraction depends on the angle of incidence, and find the refractive index and critical angle of a material.",
  variables:{
    iv:"Angle of incidence i (°)",
    dv:"Angle of refraction r (°)",
    cv:["Same block material","Angles measured from the normal","Thin ray from a ray box"]
  },
  columns:[{key:"mat",label:"Material / direction"},{key:"i",label:"i / °",dp:0},{key:"r",label:"r / °",dp:0},{key:"si",label:"sin i",dp:3},{key:"sr",label:"sin r",dp:3}],
  series:"mat",
  graph:{ x:["sr","i"], y:["si","r"], fit:"linear" },
  questions:[
    { q:"Light travels from air into glass. Plot sin i against sin r. What does the gradient tell you?",
      a:"The graph is a straight line through the origin, and its gradient equals the refractive index n = sin i ÷ sin r (about 1.50 for glass)." },
    { q:"Calculate the critical angle for glass (n = 1.50).",
      a:"sin c = 1/n = 1/1.50 = 0.667, so c = 41.8°." },
    { q:"State the two conditions needed for total internal reflection.",
      a:"Light must travel from a denser medium towards a less dense one (e.g. glass → air), and the angle of incidence must be greater than the critical angle." },
    { q:"Why does diamond sparkle more than glass?",
      a:"Diamond has a very high refractive index (2.42), so its critical angle is small (about 24°). Most light inside it is totally internally reflected many times before leaving." }
  ],
  setup(ctx){
    const MATS = { glass:["Glass",1.50], perspex:["Perspex",1.49], water:["Water",1.33], diamond:["Diamond",2.42] };
    let mat = "glass", dir = "in", i = 40;
    const O = [260, 190], RL = 165, rad = d => d*Math.PI/180, deg = r => r*180/Math.PI;

    ctx.stage.innerHTML = `
    <svg viewBox="0 0 520 380" aria-label="Light ray striking the boundary between air and a transparent block">
      <g id="rf-block"></g>
      <line x1="${O[0]}" y1="20" x2="${O[0]}" y2="360" stroke="var(--txt3)" stroke-width="1.4" stroke-dasharray="6 5"/>
      <text class="lbl" x="${O[0] + 6}" y="32">normal</text>
      <path id="rf-arc-i" fill="none" stroke="var(--accent)" stroke-width="1.4"/><text class="lblb" id="rf-ti" fill="var(--accent)"></text>
      <path id="rf-arc-r" fill="none" stroke="var(--hi)" stroke-width="1.4"/><text class="lblb" id="rf-tr" fill="var(--hi)"></text>
      <line id="rf-refl" stroke="#E04040" stroke-width="2"/>
      <line id="rf-out" stroke="#E04040" stroke-width="3"/>
      <line id="rf-in" stroke="#E04040" stroke-width="3"/>
      <path id="rf-arrow" fill="#E04040"/>
      <text class="lbl" id="rf-air" x="20" y="30">air</text>
      <text class="lbl" id="rf-matl" x="20" y="370"></text>
    </svg>`;
    const $ = s => ctx.stage.querySelector(s);
    const line = (id, a, b, op) => { const e = $(id); e.setAttribute("x1",a[0]); e.setAttribute("y1",a[1]); e.setAttribute("x2",b[0]); e.setAttribute("y2",b[1]); e.setAttribute("opacity", op); };
    const arc = (id, start, end, r) => {           // angles measured from straight-up (0) clockwise
      const p = a => [O[0] + r*Math.sin(rad(a)), O[1] - r*Math.cos(rad(a))];
      const [x1,y1] = p(start), [x2,y2] = p(end);
      $(id).setAttribute("d", `M${x1} ${y1} A${r} ${r} 0 0 ${end > start ? 1 : 0} ${x2} ${y2}`);
    };

    function calc(){
      const n = MATS[mat][1], s = Math.sin(rad(i));
      if(dir === "in") return { r: deg(Math.asin(s/n)), tir:false, n };
      const sr = n*s; return sr > 1 ? { r:null, tir:true, n } : { r: deg(Math.asin(sr)), tir:false, n };
    }

    function draw(){
      const { r, tir, n } = calc();
      const c = deg(Math.asin(1/n));
      $("#rf-block").innerHTML = dir === "in"
        ? `<rect x="40" y="${O[1]}" width="440" height="170" fill="var(--sec-lt)" stroke="var(--sec)" stroke-width="1.6"/>`
        : `<path d="M${O[0]-170} ${O[1]} A170 170 0 0 0 ${O[0]+170} ${O[1]} Z" fill="var(--sec-lt)" stroke="var(--sec)" stroke-width="1.6"/>`;
      $("#rf-matl").textContent = MATS[mat][0] + " (n = " + n.toFixed(2) + ")";
      $("#rf-air").setAttribute("y", 30); $("#rf-matl").setAttribute("y", 370);
      // incident ray comes from upper-left (into block) or lower-left (out of block)
      const sgn = dir === "in" ? -1 : 1;
      const start = [O[0] - RL*Math.sin(rad(i)), O[1] + sgn*RL*Math.cos(rad(i))];
      line("#rf-in", start, O, 1);
      const mid = [(start[0] + O[0])/2, (start[1] + O[1])/2], ang = Math.atan2(O[1] - start[1], O[0] - start[0]);
      const ah = (a, l) => [mid[0] + l*Math.cos(ang + a), mid[1] + l*Math.sin(ang + a)];
      const tip = ah(0, 7), l1 = ah(2.6, 9), l2 = ah(-2.6, 9);
      $("#rf-arrow").setAttribute("d", `M${tip} L${l1} L${l2} Z`);
      const refl = [O[0] + RL*Math.sin(rad(i)), O[1] + sgn*RL*Math.cos(rad(i))];
      line("#rf-refl", O, refl, tir ? 1 : 0.22);
      $("#rf-refl").setAttribute("stroke-width", tir ? 3 : 2);
      if(r !== null){
        line("#rf-out", O, [O[0] + RL*Math.sin(rad(r)), O[1] - sgn*RL*Math.cos(rad(r))], 1);
      }else line("#rf-out", O, O, 0);
      // angle arcs: incident angle lives on the incoming side of the normal
      if(dir === "in"){ arc("#rf-arc-i", -i, 0, 46); if(r !== null) arc("#rf-arc-r", 180, 180 - r, 58); }
      else{ arc("#rf-arc-i", 180 + i, 180, 46); if(r !== null) arc("#rf-arc-r", 0, r, 58); }
      if(r === null) $("#rf-arc-r").setAttribute("d", "");
      const lab = (id, a, rr, t) => { const e = $(id); e.setAttribute("x", O[0] + rr*Math.sin(rad(a)) - 8); e.setAttribute("y", O[1] - rr*Math.cos(rad(a)) + 5); e.textContent = t; };
      if(dir === "in"){ lab("#rf-ti", -i/2, 64, "i"); lab("#rf-tr", 180 - (r || 0)/2, 76, r !== null ? "r" : ""); }
      else{ lab("#rf-ti", 180 + i/2, 64, "i"); lab("#rf-tr", (r || 0)/2, 76, r !== null ? "r" : ""); }
      ctx.readout([["i", i + "°"], ["r", r !== null ? Math.round(r) + "°" : "—"],
        ["Critical angle", c.toFixed(1) + "°"],
        tir ? ["Total internal reflection", "i > c", "warn"] : dir === "out" && Math.abs(i - c) < 1.5 ? ["Near critical angle", "r ≈ 90°", "good"] : ["Ray", dir === "in" ? "bends towards normal" : "bends away from normal"]]);
    }

    ctx.select({ label:"Block material", value:mat, options:Object.entries(MATS).map(([k,[n,ri]]) => [k, `${n} (n = ${ri.toFixed(2)})`]),
      onChange(v){ mat = v; draw(); } });
    ctx.seg({ label:"Direction of light", value:dir, options:[["in","Air → block"],["out","Block → air"]],
      hint:"Block → air uses a semicircular block so the ray enters the curved face without bending.",
      onChange(v){ dir = v; draw(); } });
    ctx.slider({ label:"Angle of incidence", min:0, max:89, step:1, value:i, unit:"°", onInput(v){ i = v; draw(); } });
    ctx.buttons([{ label:"Record angles", primary:true, block:true, onClick(){
      const { r } = calc();
      if(r === null){ ctx.toast("No refracted ray — total internal reflection"); return; }
      const rm = Math.round(r);                                       // protractor precision: nearest degree
      ctx.record({ mat: MATS[mat][0] + (dir === "in" ? " (air→block)" : " (block→air)"), i, r:rm,
        si:Number(Math.sin(rad(i)).toFixed(3)), sr:Number(Math.sin(rad(rm)).toFixed(3)) });
    }}]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Angles are read to the nearest degree, like a real protractor. Plot <b>sin i</b> against <b>sin r</b> — the gradient is the refractive index.</p>`);
    draw();
  }
});
