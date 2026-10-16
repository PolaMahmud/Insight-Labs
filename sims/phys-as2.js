"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · AS LEVEL (9702 Paper 3) — part 2
   Stationary waves on a string · Diffraction grating & double slit ·
   Malus’s law
══════════════════════════════════════════════════════════════════ */

/* ───────────── STATIONARY WAVES ON A STRING ───────────── */
Lab.register({
  id:"standing", subject:"physics", level:["as"], topic:"Superposition · Stationary waves", interactive:true,
  title:"Stationary waves on a string",
  summary:"Tune a signal generator until the string resonates with 1, 2, 3… loops. Change the tension with hanging masses and find the mass per unit length.",
  aim:"Investigate the resonant frequencies of a stretched string and determine its mass per unit length μ.",
  variables:{ iv:"Number of loops n / tension T (N)", dv:"Resonant frequency f (Hz)", cv:["Same string and vibrating length L = 1.200 m","Same tension (when varying n)"] },
  stageTitle:"Vibrating string (Melde’s experiment)", controlsTitle:"Signal generator",
  thumb:`<svg viewBox="0 0 300 140"><path d="M20 70 Q57 20 95 70 Q132 120 170 70 Q207 20 245 70" fill="none" stroke="#4DA3FF" stroke-width="3"/><path d="M20 70 Q57 120 95 70 Q132 20 170 70 Q207 120 245 70" fill="none" stroke="#4DA3FF" stroke-width="1.5" opacity=".5"/></svg>`,
  challenges:[
    { id:"harm",    title:"Harmonics", text:"At one tension, record resonances for n = 1, 2, 3 and 4." },
    { id:"tension", title:"Tension", text:"Record the n = 2 resonance for four different tensions." },
    { id:"mu",      title:"Mass per unit length", text:"Find μ from your results." }
  ],
  columns:[{key:"m",label:"Hanging mass / kg",dp:2},{key:"T",label:"T / N",dp:2},{key:"n",label:"Loops n",dp:0},{key:"f",label:"f / Hz",dp:1},{key:"lam",label:"λ / m",dp:3},{key:"v",label:"v = fλ / m s⁻¹",dp:1},{key:"v2",label:"v² / m² s⁻²",dp:0}],
  series:"m",
  graph:{ x:["n","T"], y:["f","v2"], fit:"linear" },
  questions:[
    { q:"Why is a stationary wave formed on the string?",
      a:"Waves travel along the string, reflect at the pulley and superpose with the incoming waves. At resonant frequencies they form a stationary wave with fixed nodes and antinodes." },
    { q:"How is the wavelength related to the number of loops?",
      a:"Each loop is half a wavelength, so L = nλ/2 and λ = 2L/n." },
    { q:"Show that v² = T/μ gives a way of finding μ.",
      a:"Plot v² (from v = fλ) against T. The graph is a straight line through the origin with gradient 1/μ." },
    { q:"Why is it hard to find the exact resonant frequency?",
      a:"The amplitude is large over a small range of frequencies. Approach from both sides and take the frequency of maximum amplitude." }
  ],
  setup(ctx){
    const L = 1.2, mu = Kit.round((1.0 + Math.random()*.6)*1e-3, 5), Q = 45;
    let m = .2, f = 10, t = 0;
    const T = () => m*9.81, v = () => Math.sqrt(T()/mu), fn = n => n*v()/(2*L);
    const amps = () => { const a = []; for(let n = 1; n <= 10; n++){ const r = f/fn(n); a.push(1/Math.sqrt(Math.pow(1 - r*r, 2) + Math.pow(r/Q, 2))/Math.sqrt(n)); } return a; };
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 460" class="kb" id="sw-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 420)}<g id="sw-scene"></g><text x="24" y="34" class="k-status" id="sw-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#sw-svg"), $ = s => svg.querySelector(s);
    const X0 = 110, X1 = 860, Y = 200;
    let knobA = 0;
    function draw(){
      const a = amps(), best = a.indexOf(Math.max(...a)), peak = Math.max(...a);
      const prof = [];                                             // shape of the string, then scaled so it never clips
      for(let i = 0; i <= 150; i++){ const x = i/150; let A = 0; a.forEach((an, k) => A += an*Math.sin((k + 1)*Math.PI*x)*(k === best ? 1 : .15)); prof.push(A); }
      const mx = Math.max(...prof.map(Math.abs)) || 1, big = Math.min(70, peak*2.2);
      let env = "", inst = "", back = "";
      prof.forEach((A, i) => { const px = X0 + i/150*(X1 - X0), amp = A/mx*big;
        env += `${i ? "L" : "M"}${px.toFixed(1)} ${(Y - amp).toFixed(1)} `;
        inst += `${i ? "L" : "M"}${px.toFixed(1)} ${(Y - amp*Math.cos(2*Math.PI*Math.min(f, 6)*t)).toFixed(1)} `; });
      for(let i = 150; i >= 0; i--){ const px = X0 + i/150*(X1 - X0); back += `L${px.toFixed(1)} ${(Y + prof[i]/mx*big).toFixed(1)} `; }
      let s = `<path d="${env}${back}Z" fill="var(--accent)" opacity=".15"/><path d="${inst}" fill="none" stroke="var(--accent)" stroke-width="2.4"/>`;
      s += `<rect x="40" y="${Y - 40}" width="70" height="80" rx="8" fill="#334155" stroke="#1F2937"/><rect x="104" y="${Y - 6}" width="10" height="12" fill="#94A3B8"/><text x="75" y="${Y + 60}" text-anchor="middle" class="k-lbl">vibration generator</text>
        <circle cx="${X1 + 10}" cy="${Y + 12}" r="14" fill="none" stroke="url(#k-metalv)" stroke-width="5"/><rect x="${X1}" y="${Y + 26}" width="10" height="${420 - Y - 26}" fill="url(#k-metal)" opacity=".5"/>
        <line x1="${X1 + 24}" y1="${Y + 12}" x2="${X1 + 24}" y2="330" stroke="var(--accent)" stroke-width="1.6"/><rect x="${X1 + 10}" y="330" width="28" height="${10 + m*60}" rx="3" fill="url(#k-metal)"/><text x="${X1 + 24}" y="${352 + m*60}" text-anchor="middle" class="k-tag">${(m*1000).toFixed(0)} g</text>
        <line x1="${X0}" y1="${Y + 100}" x2="${X1}" y2="${Y + 100}" stroke="var(--txt3)"/><path d="M${X0} ${Y + 94} v12 M${X1} ${Y + 94} v12" stroke="var(--txt3)"/><text x="${(X0 + X1)/2}" y="${Y + 118}" text-anchor="middle" class="k-lbl">L = 1.200 m</text>`;
      s += `<g transform="translate(620 30)"><rect width="300" height="100" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="14" y="22" style="font:700 9px Inter;fill:#9CA3AF">SIGNAL GENERATOR</text>
        <text x="200" y="66" text-anchor="end" class="k-lcd" style="font-size:24px">${f.toFixed(1)} Hz</text>
        <g id="sw-knob" class="k-drag" transform="translate(252 56)"><circle r="28" fill="#334155" stroke="#64748B" stroke-width="2"/><line x1="0" y1="0" x2="${22*Math.sin(knobA)}" y2="${-22*Math.cos(knobA)}" stroke="#E5E7EB" stroke-width="3" stroke-linecap="round"/><circle r="32" fill="transparent"/></g></g>`;
      $("#sw-scene").innerHTML = s;
      $("#sw-status").textContent = peak > 12 ? `Resonance! ${best + 1} loop${best ? "s" : ""}` : "Turn the knob (drag round it) to change the frequency";
      ctx.readout([["Frequency", f.toFixed(1) + " Hz"], ["Tension", T().toFixed(2) + " N"], ["Amplitude", Math.min(99, peak*1.2).toFixed(0) + " mm", peak > 12 ? "good" : ""]]);
    }
    ctx.frame(dt => { t += dt; draw(); });
    let lastAng = null;
    Kit.dragger(ctx, svg, {
      hit(tg){ if(!tg.closest("#sw-knob")) return null; lastAng = null; return "k"; },
      move(k, p){
        const ang = Math.atan2(p.x - 872, -(p.y - 86));
        if(lastAng !== null){ let d = ang - lastAng; if(d > Math.PI) d -= 2*Math.PI; if(d < -Math.PI) d += 2*Math.PI; knobA += d; f = Kit.clamp(Kit.round(f + d*8, 1), 2, 160); }
        lastAng = ang;
      }
    });
    ctx.seg({ label:"Hanging mass", value:.2, options:[[.1,"100 g"],[.2,"200 g"],[.3,"300 g"],[.4,"400 g"],[.5,"500 g"]], onChange(v){ m = v; } });
    ctx.buttons([{ label:"− 1 Hz", onClick(){ f = Math.max(2, Kit.round(f - 1, 1)); } }, { label:"− 0.1", onClick(){ f = Math.max(2, Kit.round(f - .1, 1)); } }, { label:"+ 0.1", onClick(){ f = Math.min(160, Kit.round(f + .1, 1)); } }, { label:"+ 1 Hz", onClick(){ f = Math.min(160, Kit.round(f + 1, 1)); } }]);
    ctx.html(`<div class="ctl"><label><span>Number of loops you can see</span></label><select class="inp" id="sw-n">${[1,2,3,4,5,6,7,8].map(n => `<option>${n}</option>`).join("")}</select></div>`);
    ctx.buttons([{ label:"Record resonance", primary:true, block:true, onClick(){
      const a = amps(), best = a.indexOf(Math.max(...a)) + 1, n = +ctx.controls.querySelector("#sw-n").value;
      if(Math.max(...a) < 12) return ctx.toast("Not at resonance — find the maximum amplitude");
      if(n !== best) return ctx.toast("Count the loops again");
      const lam = 2*L/n;
      ctx.record({ m, T:Kit.round(T(), 2), n, f, lam:Kit.round(lam, 3), v:Kit.round(f*lam, 1), v2:Kit.round(f*lam*f*lam, 0) });
      const rows = ctx.rows();
      const byM = {}; rows.forEach(r => (byM[r.m] = byM[r.m] || new Set()).add(r.n));
      if(Object.values(byM).some(s => [1,2,3,4].every(k => s.has(k)))) ctx.complete("harm");
      if(new Set(rows.filter(r => r.n === 2).map(r => r.m)).size >= 4) ctx.complete("tension");
    } }]);
    Kit.answer(ctx, "Mass per unit length μ / g m⁻¹", "e.g. 1.3", val => {
      const rows = ctx.rows(); if(rows.length < 3) return [false, "Record at least three resonances."];
      const pts = rows.map(r => [r.T, r.v2]), est = new Set(pts.map(p => p[0])).size >= 3 ? 1/ctx.linFit(pts).m : Kit.mean(rows.map(r => r.T/r.v2));
      if(Math.abs(val/1000 - est)/est <= .05){ ctx.complete("mu"); return [true, `Correct — μ ≈ ${(est*1000).toFixed(2)} g/m (hidden ${(mu*1000).toFixed(2)} g/m).`]; }
      return [false, "v² = T/μ, so μ = T ÷ v² (or 1 ÷ gradient of v² against T). Convert kg/m to g/m."];
    });
    draw();
  }
});

/* ───────────── DIFFRACTION GRATING & DOUBLE SLIT ───────────── */
Lab.register({
  id:"interference", subject:"physics", level:["as"], topic:"Superposition · Interference & diffraction", interactive:true,
  title:"Diffraction grating & double slit",
  summary:"Shine a laser through a grating or a double slit, move the screen, and measure spot and fringe positions with sliding cursors to find the wavelength.",
  aim:"Determine the wavelength of laser light using a diffraction grating and a double slit.",
  variables:{ iv:"Slit–screen distance D (m) / order n", dv:"Fringe spacing w (mm) / spot position x", cv:["Same laser and slits","Screen perpendicular to the beam","Measure across several fringes"] },
  stageTitle:"Laser bench", controlsTitle:"Setup",
  thumb:`<svg viewBox="0 0 300 140"><rect x="20" y="60" width="50" height="20" rx="3" fill="#334155"/><line x1="70" y1="70" x2="130" y2="70" stroke="#EF4444" stroke-width="2"/><rect x="130" y="40" width="4" height="60" fill="#A2ACBD"/>${[-3,-2,-1,0,1,2,3].map(k => `<rect x="${244}" y="${66 + k*12}" width="20" height="6" rx="3" fill="#EF4444" opacity="${1 - Math.abs(k)*.2}"/>`).join("")}</svg>`,
  challenges:[
    { id:"slit",    title:"Double slit", text:"Record the fringe spacing for four screen distances." },
    { id:"grating", title:"Grating orders", text:"Record the positions of the first, second and third orders." },
    { id:"lambda",  title:"Wavelength", text:"Calculate the wavelength of the laser." }
  ],
  columns:[{key:"mode",label:"Arrangement"},{key:"D",label:"D / m",dp:3},{key:"n",label:"n (order or spacings)",dp:0},{key:"s",label:"Cursor gap / mm",dp:1},{key:"w",label:"w or x / mm",dp:2},{key:"sin",label:"sin θ",dp:4}],
  series:"mode",
  graph:{ x:["D","n"], y:["w","sin"], fit:"linear" },
  questions:[
    { q:"For a double slit, how is λ found from the fringe spacing?",
      a:"λ = aw/D, where a is the slit separation, w the fringe spacing and D the slit–screen distance. Plotting w against D gives a gradient λ/a." },
    { q:"Why measure across several fringes rather than one?",
      a:"One fringe spacing is only a few millimetres, so the percentage uncertainty is large. Measuring across ten spacings and dividing reduces it." },
    { q:"For a grating, how is λ found?",
      a:"d sin θ = nλ, where d = 1/(lines per metre). Find θ from tan θ = x/D for each order, then λ = d sin θ/n (or the gradient of sin θ against n is λ/d)." },
    { q:"Why does a grating give sharper, brighter maxima than a double slit?",
      a:"Light from many slits interferes; the maxima only occur where all paths are in phase, so they are very sharp and bright, and widely spaced." },
    { q:"Give a safety precaution when using a laser.",
      a:"Never look into the beam or point it at anyone; avoid reflections from shiny surfaces; use a low-power laser." }
  ],
  setup(ctx){
    const LAM = { red:Math.round(632 + Math.random()*24), green:Math.round(522 + Math.random()*14) };
    let mode = "slit", col = "red", a = .35e-3, lines = 300, D = 2.0, cur = [-20, 20], N = 5, order = 1;
    const lam = () => LAM[col]*1e-9, dG = () => 1e-3/lines;
    const range = () => mode === "slit" ? 32 : 900;          // half-width of screen view (mm)
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="df-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 250)}<g id="df-bench"></g>
      <g transform="translate(40 290)"><rect width="880" height="200" rx="12" fill="#0A0D13" stroke="#334155"/><text x="14" y="22" style="font:700 9px Inter;fill:#9CA3AF;letter-spacing:.06em">VIEW OF THE SCREEN</text><g id="df-view"></g></g>
      <text x="24" y="34" class="k-status" id="df-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#df-svg"), $ = s => svg.querySelector(s);
    const VX = 80, VW = 800;                                  // view: x from 80 to 880 within the panel
    const toPx = mm => VX + VW/2 + mm/range()*(VW/2), toMm = px => (px - VX - VW/2)/(VW/2)*range();
    function intensity(xmm){
      const x = xmm/1000, s = x/Math.sqrt(x*x + D*D);
      if(mode === "slit"){ const b = .07e-3, ph = Math.PI*a*s/lam(), u = Math.PI*b*s/lam(); const env = Math.abs(u) < 1e-9 ? 1 : Math.pow(Math.sin(u)/u, 2); return Math.pow(Math.cos(ph), 2)*env; }
      return 0;
    }
    function spots(){ const out = []; for(let n = -5; n <= 5; n++){ const s = n*lam()/dG(); if(Math.abs(s) >= 1) continue; const th = Math.asin(s); out.push([n, D*Math.tan(th)*1000]); } return out; }
    function draw(){
      const SX = 120 + D/(mode === "slit" ? 3.2 : 1.2)*700;
      let b = `<rect x="40" y="200" width="70" height="30" rx="4" fill="#334155"/><text x="75" y="222" text-anchor="middle" style="font:700 9px Inter;fill:#E5E7EB">LASER</text>
        <line x1="110" y1="215" x2="140" y2="215" stroke="${col === "red" ? "#EF4444" : "#22C55E"}" stroke-width="2"/><rect x="140" y="180" width="6" height="70" fill="#94A3B8"/><text x="143" y="172" text-anchor="middle" class="k-tag">${mode === "slit" ? `double slit, a = ${(a*1000).toFixed(2)} mm` : `grating ${lines} lines/mm`}</text>
        <path d="M146 215 L${SX} ${215 - 30} M146 215 L${SX} 215 M146 215 L${SX} ${215 + 30}" stroke="${col === "red" ? "#EF4444" : "#22C55E"}" stroke-width="1" opacity=".35"/>
        <g id="df-screen" class="k-drag" transform="translate(${SX} 0)"><rect x="-4" y="130" width="10" height="120" fill="#F8FAFC" stroke="#94A3B8"/><text x="0" y="122" text-anchor="middle" class="k-tag">screen</text><rect x="-24" y="110" width="50" height="150" fill="transparent"/></g>
        <line x1="143" y1="262" x2="${SX}" y2="262" stroke="var(--accent)"/><text x="${(143 + SX)/2}" y="280" text-anchor="middle" class="k-read">D = ${D.toFixed(3)} m</text>`;
      $("#df-bench").innerHTML = b;
      let v = "", c = col === "red" ? [239,68,68] : [34,197,94];
      if(mode === "slit"){ for(let px = 0; px < VW; px += 2){ const I = intensity(toMm(VX + px)); v += `<rect x="${VX + px}" y="40" width="2.2" height="110" fill="rgba(${c},${I.toFixed(3)})"/>`; } }
      else spots().forEach(([n, x]) => { if(Math.abs(x) < range()) v += `<circle cx="${toPx(x)}" cy="95" r="${n ? 6 : 8}" fill="rgb(${c})"/><circle cx="${toPx(x)}" cy="95" r="16" fill="rgba(${c},.25)"/><text x="${toPx(x)}" y="70" text-anchor="middle" style="font:600 10px Inter;fill:#94A3B8">${n}</text>`; });
      // ruler
      const step = mode === "slit" ? 1 : 10;
      for(let mm = -range(); mm <= range(); mm += step){ const x = toPx(mm), big = mode === "slit" ? mm % 5 === 0 : mm % 100 === 0; v += `<line x1="${x}" y1="160" x2="${x}" y2="${big ? 174 : 166}" stroke="#94A3B8" stroke-width="${big ? 1.2 : .6}"/>${(mode === "slit" ? mm % 10 === 0 : mm % 200 === 0) ? `<text x="${x}" y="188" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#94A3B8">${mode === "slit" ? mm : mm/10}</text>` : ""}`; }
      v += `<text x="866" y="188" text-anchor="end" style="font:600 9px Inter;fill:#64748B">${mode === "slit" ? "mm" : "cm"}</text>`;
      cur.forEach((m, i) => v += `<g data-c="${i}" class="k-drag"><line x1="${toPx(m)}" y1="34" x2="${toPx(m)}" y2="160" stroke="#FBBF24" stroke-width="1.6"/><path d="M${toPx(m) - 7} 30 h14 l-7 9z" fill="#FBBF24"/><rect x="${toPx(m) - 12}" y="26" width="24" height="140" fill="transparent"/></g>`);
      v += `<text x="440" y="22" text-anchor="middle" style="font:700 11px 'JetBrains Mono';fill:#FBBF24">cursor gap ${Math.abs(cur[1] - cur[0]).toFixed(mode === "slit" ? 1 : 0)} mm</text>`;
      $("#df-view").innerHTML = v;
      $("#df-status").textContent = mode === "slit" ? "Line the cursors up on bright fringes N spacings apart" : "Put the cursors on the +n and −n spots";
      ctx.readout([["Laser", col], ["D", D.toFixed(3) + " m"], ["Cursor gap", Math.abs(cur[1] - cur[0]).toFixed(1) + " mm"]]);
    }
    Kit.dragger(ctx, svg, {
      hit(tg){ if(tg.closest("#df-screen")) return "scr"; const c = tg.closest("[data-c]"); return c ? +c.dataset.c : null; },
      move(k, p){
        if(k === "scr"){ D = Kit.clamp(Kit.round((p.x - 120)/700*(mode === "slit" ? 3.2 : 1.2), mode === "slit" ? 2 : 3), mode === "slit" ? .8 : .3, mode === "slit" ? 3.2 : 1.2); }
        else cur[k] = Kit.clamp(Kit.round(toMm(p.x - 40), mode === "slit" ? 1 : 0), -range(), range());
        draw();
      }
    });
    const slitCtl = [], grCtl = [];
    ctx.seg({ label:"Arrangement", value:"slit", options:[["slit","Double slit"],["grating","Diffraction grating"]], onChange(v){ mode = v; D = v === "slit" ? 2 : .6; cur = v === "slit" ? [-15, 15] : [-200, 200]; slitCtl.forEach(e => e.style.display = v === "slit" ? "" : "none"); grCtl.forEach(e => e.style.display = v === "slit" ? "none" : ""); draw(); } });
    ctx.seg({ label:"Laser", value:"red", options:[["red","Red"],["green","Green"]], onChange(v){ col = v; draw(); } });
    slitCtl.push(ctx.seg({ label:"Slit separation a", value:.35, options:[[.25,"0.25 mm"],[.35,"0.35 mm"],[.5,"0.50 mm"]], onChange(v){ a = v*1e-3; draw(); } }).node);
    slitCtl.push(ctx.seg({ label:"Fringe spacings between cursors", value:5, options:[[1,"1"],[2,"2"],[5,"5"],[8,"8"],[10,"10"]], onChange(v){ N = v; } }).node);
    grCtl.push(ctx.seg({ label:"Grating", value:300, options:[[100,"100 lines/mm"],[300,"300"],[600,"600"]], onChange(v){ lines = v; draw(); } }).node);
    grCtl.push(ctx.seg({ label:"Cursors are on orders ±", value:1, options:[[1,"1"],[2,"2"],[3,"3"]], onChange(v){ order = v; } }).node);
    grCtl.forEach(e => e.style.display = "none");
    ctx.buttons([{ label:"Record measurement", primary:true, block:true, onClick(){
      const gap = Math.abs(cur[1] - cur[0]);
      if(mode === "slit"){
        const w = lam()*D/a*1000, ok = Math.abs(gap - N*w) <= Math.max(.6, .04*N*w);
        if(!ok) return ctx.toast(`The cursors aren’t ${N} fringe spacings apart on bright fringes`);
        ctx.record({ mode:`Double slit a=${(a*1000).toFixed(2)} mm`, D, n:N, s:Kit.round(gap, 1), w:Kit.round(gap/N, 2), sin:null });
        if(new Set(ctx.rows().filter(r => r.mode.startsWith("Double")).map(r => r.D)).size >= 4) ctx.complete("slit");
      }else{
        const sp = spots().find(([n]) => n === order); if(!sp) return ctx.toast("That order doesn’t exist for this grating");
        if(Math.abs(gap - 2*sp[1]) > 6) return ctx.toast(`Put the cursors on the +${order} and −${order} spots`);
        const x = gap/2, sin = x/Math.sqrt(x*x + D*D*1e6);
        ctx.record({ mode:`Grating ${lines}/mm`, D, n:order, s:Kit.round(gap, 0), w:Kit.round(x, 1), sin:Kit.round(sin, 4) });
        if(new Set(ctx.rows().filter(r => r.mode.startsWith("Grating")).map(r => r.n)).size >= 3) ctx.complete("grating");
      }
    } }]);
    Kit.answer(ctx, "Wavelength of the laser / nm", "e.g. 650", v => {
      const truth = LAM[col]; if(!ctx.rows().length) return [false, "Make some measurements first."];
      if(Math.abs(v - truth)/truth <= .04){ ctx.complete("lambda"); return [true, `Correct — the ${col} laser is ${truth} nm.`]; }
      return [false, "Double slit: λ = a × w ÷ D (or a × gradient of w against D). Grating: λ = d sin θ ÷ n with d = 1/(lines per metre)."];
    });
    draw();
  }
});

/* ───────────── MALUS’S LAW ───────────── */
Lab.register({
  id:"malus", subject:"physics", level:["as"], topic:"Waves · Polarisation", interactive:true,
  title:"Polarisation: Malus’s law",
  summary:"Rotate an analyser in front of polarised light and record the light-meter reading. Show that intensity ∝ cos²θ.",
  aim:"Investigate how the intensity of polarised light transmitted through an analyser depends on the angle between the polariser and analyser.",
  variables:{ iv:"Angle θ between the transmission axes (°)", dv:"Intensity (light-meter reading, lux)", cv:["Same light source and distance","Same polariser","Room lights off (background)"] },
  stageTitle:"Polariser, analyser and light meter", controlsTitle:"Measure",
  thumb:`<svg viewBox="0 0 300 140"><circle cx="100" cy="70" r="36" fill="none" stroke="#A2ACBD" stroke-width="6"/><line x1="100" y1="40" x2="100" y2="100" stroke="#A2ACBD" stroke-width="2"/><circle cx="200" cy="70" r="36" fill="none" stroke="#4DA3FF" stroke-width="6"/><line x1="180" y1="44" x2="220" y2="96" stroke="#4DA3FF" stroke-width="2"/></svg>`,
  challenges:[
    { id:"curve",   title:"0° to 180°", text:"Record readings at ten or more angles." },
    { id:"crossed", title:"Crossed polarisers", text:"Find the angle that gives the minimum reading." },
    { id:"lin",     title:"cos² law", text:"Find I₀ from the gradient of I against cos²θ." }
  ],
  columns:[{key:"th",label:"θ / °",dp:0},{key:"I",label:"I / lux",dp:1},{key:"c2",label:"cos²θ",dp:3}],
  graph:{ x:["c2","th"], y:["I"], fit:"linear" },
  questions:[
    { q:"State Malus’s law.",
      a:"The intensity transmitted through an analyser is I = I₀ cos²θ, where θ is the angle between the transmission axes of polariser and analyser." },
    { q:"What happens at θ = 90°?",
      a:"The polarisers are crossed; ideally no light gets through (cos 90° = 0). In practice a small background reading remains." },
    { q:"Why does the I–cos²θ graph have a small positive intercept?",
      a:"Background light from the room, and imperfect polarisers, give a reading even when the polarisers are crossed." },
    { q:"Can sound waves be polarised? Why?",
      a:"No — sound is a longitudinal wave. Only transverse waves can be polarised." }
  ],
  setup(ctx){
    const I0 = Kit.round(420 + Math.random()*120, 1), BG = Kit.round(4 + Math.random()*5, 1);
    let th = 30;
    const I = () => I0*Math.pow(Math.cos(th*Math.PI/180), 2) + BG;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 460" class="kb" id="ml-svg"><defs>${Kit.DEFS}<radialGradient id="ml-g"><stop offset="0" stop-color="#FFF7D6"/><stop offset="1" stop-color="#FFF7D6" stop-opacity="0"/></radialGradient></defs>${Kit.bench(960, 400)}<g id="ml-scene"></g><text x="24" y="34" class="k-status" id="ml-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ml-svg"), $ = s => svg.querySelector(s);
    const AX = 560, AY = 220;
    function draw(){
      const frac = (I() - BG)/I0;
      let s = `<rect x="60" y="190" width="80" height="60" rx="8" fill="#334155"/><circle cx="140" cy="220" r="30" fill="url(#ml-g)"/><text x="100" y="270" text-anchor="middle" class="k-lbl">lamp</text>
        <rect x="140" y="205" width="${AX - 140}" height="30" fill="#FFF7D6" opacity=".22"/>
        <g transform="translate(320 220)"><circle r="70" fill="rgba(148,163,184,.25)" stroke="#94A3B8" stroke-width="8"/>${Array.from({ length:9 }, (_, i) => `<line x1="${-48 + i*12}" y1="-50" x2="${-48 + i*12}" y2="50" stroke="#64748B" opacity=".25"/>`).join("")}<line x1="0" y1="-60" x2="0" y2="60" stroke="#E5E7EB" stroke-width="2.5"/><text y="96" text-anchor="middle" class="k-tag">polariser (fixed)</text></g>
        <rect x="${AX}" y="205" width="${760 - AX}" height="30" fill="#FFF7D6" opacity="${(.04 + .25*frac).toFixed(2)}"/>
        <g transform="translate(${AX} ${AY})"><circle r="70" fill="rgba(77,163,255,.18)" stroke="var(--accent)" stroke-width="8"/>`;
      for(let d = 0; d < 360; d += 10) s += `<line x1="${76*Math.sin(d*Math.PI/180)}" y1="${-76*Math.cos(d*Math.PI/180)}" x2="${(d % 30 ? 81 : 86)*Math.sin(d*Math.PI/180)}" y2="${-(d % 30 ? 81 : 86)*Math.cos(d*Math.PI/180)}" stroke="var(--txt2)"/>${d % 30 === 0 && d <= 180 ? `<text x="${98*Math.sin(d*Math.PI/180)}" y="${-98*Math.cos(d*Math.PI/180) + 4}" text-anchor="middle" class="k-num">${d}</text>` : ""}`;
      s += `<g transform="rotate(${th})">${Array.from({ length:9 }, (_, i) => `<line x1="${-48 + i*12}" y1="-50" x2="${-48 + i*12}" y2="50" stroke="var(--accent)" opacity=".25"/>`).join("")}<line x1="0" y1="-62" x2="0" y2="62" stroke="var(--accent)" stroke-width="2.5"/>
        <g id="ml-h" class="k-drag"><circle cx="0" cy="-70" r="11" fill="var(--accent)" stroke="#fff" stroke-width="2"/><circle cx="0" cy="-70" r="20" fill="transparent"/></g></g><text y="112" text-anchor="middle" class="k-tag">analyser — drag the handle</text></g>
        <g transform="translate(780 180)"><rect width="140" height="90" rx="10" fill="#1F2937" stroke="#4B5563"/><text x="12" y="20" style="font:700 9px Inter;fill:#9CA3AF">LIGHT METER</text><text x="128" y="62" text-anchor="end" class="k-lcd">${I().toFixed(1)}</text><text x="128" y="80" text-anchor="end" style="font:600 9px Inter;fill:#5FBF8A">lux</text></g>`;
      $("#ml-scene").innerHTML = s;
      $("#ml-status").textContent = `Angle between the axes θ = ${th}°`;
      ctx.readout([["θ", th + "°"], ["Reading", I().toFixed(1) + " lux"]]);
    }
    Kit.dragger(ctx, svg, { hit(tg){ return tg.closest("#ml-h") ? "h" : null; }, move(k, p){ let a = Math.round(Math.atan2(p.x - AX, -(p.y - AY))*180/Math.PI); if(a < 0) a += 360; th = a > 180 ? a - 180 : a; draw(); } });
    ctx.slider({ label:"Angle (fine)", min:0, max:180, step:1, value:th, unit:"°", onInput(v){ th = v; draw(); } });
    ctx.buttons([{ label:"Record reading", primary:true, block:true, onClick(){
      const c2 = Math.pow(Math.cos(th*Math.PI/180), 2);
      ctx.record({ th, I:Kit.round(I()*(1 + .004*ctx.gauss()), 1), c2:Kit.round(c2, 3) });
      if(th === 90) ctx.complete("crossed");
      if(new Set(ctx.rows().map(r => r.th)).size >= 10) ctx.complete("curve");
    } }]);
    Kit.answer(ctx, "I₀ (gradient of I against cos²θ) / lux", "e.g. 480", v => {
      const pts = ctx.rows().map(r => [r.c2, r.I]); if(pts.length < 5) return [false, "Record at least five angles."];
      const f = ctx.linFit(pts); if(Math.abs(v - f.m)/f.m <= .03){ ctx.complete("lin"); return [true, `Correct — gradient ${f.m.toFixed(0)} lux; the intercept (${f.c.toFixed(1)} lux) is the background.`]; }
      return [false, "Plot I (y) against cos²θ (x); I₀ is the gradient."];
    });
    draw();
  }
});
